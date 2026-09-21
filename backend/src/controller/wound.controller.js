import {
  findWoundById,
  createWound,
  findWoundsByUserId,
  deleteWound,
  updateWound,
} from "../models/wound.model.js";
import {
  createWoundImage,
  findImagesByWoundId,
  findLatestImagesByWoundId,
} from "../models/woundImage.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import {
  beginTransaction,
  commitTransaction,
  rollBackTransaction,
} from "../db/index.js";
import {
  createWoundAnalysis,
  findAllAnalysisByWoundId,
  findAnalysisByImageId,
  findLatestAnalysisByWoundId,
} from "../models/woundAnalysis.model.js";
import axios, { create } from "axios";
import { calculateWoundChange } from "../service/woundAnalysis.service.js";
import { getWoundNotify } from "../service/notification.service.js";
import { createNotification } from "../models/notification.model.js";

const createUserWound = asyncHandler(async (req, res) => {
  const { woundType } = req.body;
  const userId = req.user?.id;
  if (!woundType) {
    throw new ApiError(400, "This field is required");
  }

  if (!req.file?.cloudinaryUrl) {
    throw new ApiError(500, "Wound image is required");
  }

  try {
    await beginTransaction();
    const wound = await createWound(userId, woundType);
    if (wound.affectedRows === 0) {
      throw new ApiError(500, "Failed to create a wound instance");
    }
    const woundId = wound.insertId;
    const image = await createWoundImage(woundId, req.file?.cloudinaryUrl);
    if (image.affectedRows === 0) {
      throw new ApiError(500, "Failed to uplaod the image- retry");
    }
    const woundPayLoad = {
      id: woundId,
      image_id: image.insertId,
      wound_type: woundType,
      image_url: req.file.cloudinaryUrl,
    };
    await commitTransaction();
    return res
      .status(201)
      .json(new ApiResponse(201, "wound created successfully", woundPayLoad));
  } catch (error) {
    await rollBackTransaction();
    throw error;
  }
});

const getUserAllWounds = asyncHandler(async (req, res) => {
  const userId = req.user?.id;
  const wounds = await findWoundsByUserId(userId);
  const woundsWithImages = await Promise.all(
    wounds.map(async (wound) => {
      const images = await findImagesByWoundId(wounds.id);
      const imagesWithAnalysis = await Promise.all(
        images.map(async (image) => {
          const analysis = await findAnalysisByImageId(image.id);

          return {
            imageId: image[0].id,
            imageUrl: image.image_url,
            uploadedAt: image.uploadedAt,

            analysis:
              analysis.length > 0
                ? {
                    woundArea: analysis[0].new_wound_area,
                    healthyArea: analysis[0].new_healthy_area,
                    changeArea: analysis[0].change_area,
                    analyzedAt: analysis[0].createdAt,
                  }
                : null,
          };
        }),
      );

      return {
        woundId: wound.id,
        woundTypeL: wound.wound_type,
        createdAt: wound.createdAt,
        images: imagesWithAnalysis,
      };
    }),
  );

  return res
    .status(200)
    .json(
      new ApiResponse(200, "All wound fetched successfully", woundsWithImages),
    );
});

const getWoundDetails = asyncHandler(async (req, res) => {
  const userId = req.user?.id;
  const { woundId } = req.params;
  const wound = await findWoundById(woundId);
  if (wound.length === 0) {
    throw new ApiError(404, "Wound not found");
  }

  if (wound[0].id != req.user?.id) {
    throw new ApiError(403, "Not authorized to access this wound or account");
  }
  const images = await findImagesByWoundId(wound[0].id);
  const imagesWithAnalysis = await Promise.all(
    images.map(async (image) => {
      const analysis = await findAnalysisByImageId(image.id);
      return {
        imageId: image.id,
        imageUrl: image.image_url,
        uploadedAt: image.uploadedAt,
        analysis:
          analysis.length > 0
            ? {
                analysisId: analysis[0].id,
                maskUrl: analysis[0].maskUrl,
                diceScore: analysis[0].dice_score,
                woundArea: analysis[0].new_wound_area,
                healthyArea: analysis[0].healthy_area,
                previousWoundArea: analysis[0].previous_wound_area,
                previousHealthyArea: analysis[0].previous_healthy_area,
                changeArea: analysis[0].change_area,
                analyzedAt: analysis[0].createdAt,
              }
            : null,
      };
    }),
  );
  const woundPayLoad = {
    woundId: wound[0].id,
    woundType: wound[0].wound_type,
    createdAt: wound[0].createdAt,
    updatedAt: wound[0].updatedAt,
    images: imagesWithAnalysis,
  };

  return res.status(201).json(201, "Wound fetched succesfully", woundPayLoad);
});

const addWoundImage = asyncHandler(async (req, res) => {
  const userId = req.user?.id;
  const { woundId } = req.params;
  if (!req.file?.cloudinaryUrl) {
    throw new ApiError(400, "Image file is required");
  }

  const wound = await findWoundById(woundId);
  if (wound.length === 0) {
    throw new ApiError(404, "NO wound found");
  }

  if (wound[0].user_id !== userId) {
    throw new ApiError(403, "Not authorized to access this wound file");
  }

  const previousAnalysis = await findLatestAnalysisByWoundId(woundId);

  const previousWoundArea =
    previousAnalysis.length > 0 ? previousAnalysis[0].new_wound_area : null;

  const previousHealthyArea =
    previousAnalysis.length > 0 ? previousAnalysis[0].new_healthy_area : null;

  const mlResponse = await axios.post(`${process.env.ML_API_PATH}/predict`, {
    imageUrl: req.file.cloudinaryUrl,
  });

  const { maskUrl, diceScore, woundArea, healthyArea } = mlResponse.data;

  const woundChange = calculateWoundChange(previousWoundArea, woundArea);

  const notification = getWoundNotify(
    woundChange.changePercentage,
    woundChange.isWorsening,
  );
  let analysisId;
  let imageId;
  try {
    await beginTransaction();

    const newImage = await createWoundImage(
      wound[0].id,
      req.file?.cloudinaryUrl,
    );
    if (newImage.affectedRows === 0) {
      throw new ApiError(500, "Failed to save the wound image");
    }
    imageId = newImage.insertId;
    const analysis = await createWoundAnalysis(
      imageId,
      maskUrl,
      diceScore,
      woundArea,
      healthyArea,
      previousWoundArea,
      previousHealthyArea,
      woundChange.changeArea,
    );

    if (analysis.affectedRows === 0) {
      throw new ApiError(500, "Failed to save the wound analysis");
    }
    analysisId = analysis.insertId;

    if (notification) {
      let scheduledAt = null;
      if (notification.scheduledDays !== null) {
        scheduledAt = new Date();
        scheduledAt.setDate(scheduledAt.getDate() + notification.scheduledDays);
      }
      await createNotification(
        userId,
        woundId,
        analysisId,
        notification.notificationType,
        notification.message,
        scheduledAt,
      );
    }

    await commitTransaction();
  } catch (error) {
    await rollBackTransaction();
    throw error;
  }

  const responsePayload = {
    woundId,
    imageId,
    analysisId,
    imageUrl: req.file.cloudinaryUrl,
    analysis: {
      maskUrl,
      diceScore,
      woundArea,
      healthyArea,
      previousWoundArea,
      previousHealthyArea,
      changeArea: woundChange.changeArea,
      changePercentage: woundChange.changePercentage,
      isWorsening: woundChange.isWorsening,
    },
  };

  return res
    .status(201)
    .json(
      new ApiResponse(
        201,
        "wound image added and analyzed successfully",
        responsePayload,
      ),
    );
});

const uploadWoundImage = asyncHandler(async (req, res) => {
  const userId = req.user?.id;
  const { woundId, woundType } = req.body;

  if (!req.file?.cloudinaryUrl) {
    throw new ApiError(400, "wound image is required");
  }

  let wound;
  let previousAnalysis = [];
  if (woundId) {
    wound = await findWoundById(woundId);
    if (wound.length === 0) {
      throw new ApiError(404, "wound not found");
    }
    if (wound[0].user_id !== userId) {
      throw new ApiError(403, "Not authorized to access");
    }
    previousAnalysis = await findAllAnalysisByWoundId(woundId);
  } else {
    if (!woundType) {
      throw new ApiError(400, "Wound type is required");
    }
  }
  const previousWoundArea =
    previousAnalysis.length > 0 ? previousAnalysis[0].new_wound_area : null;
  const previousHealthyArea =
    previousAnalysis[0].length > 0
      ? previousAnalysis[0].new_healthy_area
      : null;

  let mlResponse;
  try {
    mlResponse = await axios.post(`${process.env.ML_API_PATH}/predict`, {
      imageUrl: req.file.cloudinaryUrl,
    });
  } catch (error) {
    console.error("FastApi wound prediction failed - retry", error.message);
  }

  const { maskUrl, confidence, woundArea, healthyArea } = mlResponse.data;

  const woundChange = calculateWoundChange(previousWoundArea, woundArea);
  const notification = getWoundNotify(
    woundChange.changePercentage,
    woundChange.isWorsening,
  );

  let finalWoundId;
  let imageId;
  let analysisId;
  try {
    await beginTransaction();
    if (!woundId) {
      const newWound = await createWound(userId, woundType);
      if (newWound.length === 0) {
        throw new ApiError(500, "Failed to create wound");
      }
      finalWoundId = newWound.insertId;
    } else {
      finalWoundId = woundId;
    }

    const newImage = await createWoundImage(
      finalWoundId,
      req.file?.cloudinaryUrl,
    );
    if (newImage.affectedRows === 0) {
      throw new ApiError(500, " failed to save wound image");
    }
    imageId = newImage.insertId;
    const analysis = await createWoundAnalysis(
      imageId,
      maskUrl,
      confidence,
      woundArea,
      healthyArea,
      previousWoundArea,
      previousHealthyArea,
      woundChange.changeArea,
    );

    if (analysis.affectedRows === 0) {
      throw new ApiError(500, "Failed to save wound analysis");
    }

    analysisId = analysis.insertId;
    if (notification) {
      let scheduledAt = null;
      scheduledAt = new Date();
      scheduledAt.setDate(scheduledAt.getDate() + notification.scheduledDays);
    }

    await createNotification(
      userId,
      finalWoundId,
      analysisId,
      notification.notificationType,
      notification.message,
      scheduledAt,
    );

    await commitTransaction();
  } catch (error) {
    await rollBackTransaction();
    throw error;
  }

  const responsePayload = {
    woundId: finalWoundId,
    imageId,
    analysisId,
    imageUrl: req.file.cloudinaryUrl,
    analysis: {
      maskUrl,
      confidence,
      woundArea,
      healthyArea,
      previousWoundArea,
      changeArea: woundChange.changeArea,
      changePercentage: woundChange.changePercentage,
      isWorsening: woundChange.isWorsening,
    },
    notification: notification
      ? {
          type: notification.notificationType,
          message: notification.message,
          scheduledDays: notification.scheduledDays,
        }
      : null,
  };

  return res
    .status(201)
    .json(
      new ApiResponse(201, "Wound image uploaed and analyzed successfully"),
      responsePayload,
    );
});

export {
  getUserAllWounds,
  getWoundDetails,
  addWoundImage,
  createUserWound,
  uploadWoundImage,
};
