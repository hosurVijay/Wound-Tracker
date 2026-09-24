import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import {
  findNotificationByUserId,
  findNotificationByWoundId,
  markNotificationAsRead,
} from "../models/notification.model.js";

const getUserNotifications = asyncHandler(async (req, res) => {
  const userId = req.user?.id;
  const notification = await findNotificationByUserId(userId);
  return res
    .status(200)
    .json(new ApiResponse(200, "Fetched the user notification", notification));
});

const markAsRead = asyncHandler(async (req, res) => {
  const userId = req.user?.id;
  const { notificationId } = req.params;
  if (!notificationId) {
    throw new ApiError(400, "Notification ID is required");
  }
  const result = await markNotificationAsRead(notificationId, userId);
  if (result.affectedRows === 0) {
    throw new ApiError(500, "Notification not found or unauthorized");
  }
  return res.status(200).json(new ApiError(200, "Notification marked", null));
});

const getWoundNotification = asyncHandler(async (req, res) => {
  const userId = req.user?.id;
  const { woundId } = req.params;
  const notification = await findNotificationByWoundId(woundId, userId);
  if (notification.length === 0) {
    return res
      .status(200)
      .json(new ApiResponse(200, "No notificaion found for this wound", null));
  }
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        "Wound notificaion found successfully",
        notification[0],
      ),
    );
});

export { getUserNotifications, markAsRead, getWoundNotification };
