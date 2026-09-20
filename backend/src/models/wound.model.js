import { db } from "../db/index.js";

const createWound = async (userId, woundType) => {
  const query = `
        INSERT INTO wounds
        (userId, wound_type)
        VALUES(? , ?)
    `;

  const [result] = await db.execute(query, [userId, woundType]);
  return result;
};

const findWoundById = async (woundId) => {
  const query = `
        SELECT *
        FROM wounds
        WHERE id = ?
    `;

  const [result] = await db.execute(query, [woundId]);
  return result;
};

const findWoundsByUserId = async (userId) => {
  const query = `
        SELECT *
        FROM wounds
        WHERE user_id = ?
        ORDER BY createdAt DESC
    `;

  const [result] = await db.execute(query, [userId]);
  return result;
};

const updateWound = async (woundId, woundType) => {
  const query = `
        UPDATE wounds
            SET wound_type = ?
        WHERE id = ?
    `;
  const [result] = await db.execute(query, [woundType, woundId]);
  return result;
};

const deleteWound = async (woundId) => {
  const query = `
        DELETE FROM wounds
        WHERE id = ?
    `;
  const [result] = await db.execute(query, [woundId]);
  return result;
};

export {
  createWound,
  findWoundById,
  findWoundsByUserId,
  updateWound,
  deleteWound,
};
