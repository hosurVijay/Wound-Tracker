import { db } from "../db/index.js";

const createWoundAnalysis = async (
  imageId,
  maskUrl,
  diceScore,
  newWoundArea,
  newHealthyArea,
  previousWoundArea,
  previousHealthyArea,
  changeArea,
) => {
  const query = `
        INSERT INTO wound_analysis 
        (
            image_id, mask_url, dice_score, new_wound_area, 
            new_healthy_area, previous_wound_area, previous_healthy_area, change_area
        )
        VALUES(?,?,?,?,?,?,?,?)
    `;

  const [result] = await db.execute(query, [
    imageId,
    maskUrl,
    diceScore,
    newWoundArea,
    newHealthyArea,
    previousWoundArea,
    previousHealthyArea,
    changeArea,
  ]);

  return result;
};

const findAnalysisById = async (analysisId) => {
  const query = `
        SELECT * 
        FROM wound_analysis
        WHERE id = ?
    `;
  const [result] = await db.execute(query, [analysisId]);
  return result;
};

const findAnalysisByImageId = async (imageId) => {
  const query = `
        SELECT *
        FROM wound_analysis
        WHERE image_id= ?
        ORDER BY createdAt DESC
        LIMIT 1
    `;

  const [result] = await db.execute(query, [imageId]);
  return result;
};

const findLatestAnalysisByWoundId = async (woundId) => {
  const query = `
        SELECT wa.* 
        FROM wound_analysis wa
            INNER JOIN wound_images wi
            ON wa.image_id = wi.id
        WHERE wi.wound_id = ?
        ORDER BY wa.createdAt DESC
        LIMIT 1
    `;
  const [result] = await db.execute(query, [woundId]);
  return result;
};

const findAllAnalysisByWoundId = async (woundId) => {
  const query = `
        SELECT wa.*
        FROM wound_analysis wa
            INNER JOIN wound_images wi
            ON wa.image_id = wi.id
        WHERE wi.wound_id = ?
        ORDER BY wa.createdAt ASC
    `;
  const [result] = await db.execute(query, [woundId]);
  return result;
};

export {
  createWoundAnalysis,
  findAnalysisById,
  findAnalysisByImageId,
  findAllAnalysisByWoundId,
  findLatestAnalysisByWoundId,
};
