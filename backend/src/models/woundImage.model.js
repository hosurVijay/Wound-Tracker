import { db } from "../db/index.js";

const createWoundImage = async (woundId, imageUrl) => {
  const query = `
        INSERT INTO wound_images
        (wound_id, image_url)
        VALUES(?, ?)
    `;
  const [result] = await db.execute(query, [woundId, imageUrl]);
  return result;
};

const findImageById = async (imageId) => {
  const query = `
    SELECT *
    FROM wound_images
    WHERE id = ?
  `;
  const [result] = await db.execute(query, [imageId]);
  return result;
};

const findImagesByWoundId = async (woundId) => {
  const query = `
    SELECT *
    FROM wound_images
    WHERE wound_id = ?
    ORDER BY uploadedAt DESC
  `;

  const [result] = await db.execute(query, [woundId]);
  return result;
};

const findLatestImagesByWoundId = async (woundId) => {
  const query = `
    SELECT * 
    FROM wound_images
    WHERE wound_id = ?
    ORDER BY uploadedAt DESC
    LIMIT 1
  `;
  const [result] = await db.execute(query, [woundId]);
  return result;
};

const deleteWoundImage = async (imageId) => {
  const query = `
    DELETE FROM wound_images
    WHERE id = ?
  `;
  const [result] = await db.execute(query, [imageId]);
  return result;
};

export {
  createWoundImage,
  findImageById,
  findImagesByWoundId,
  findLatestImagesByWoundId,
  deleteWoundImage,
};
