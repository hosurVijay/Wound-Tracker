import { db } from "../db/index.js";

const createNotification = async (
  userId,
  woundId,
  analysisId,
  notificationType,
  message,
  scheduledAt,
) => {
  const query = `
        INSERT INTO notifications
        (
            user_id,
            wound_id,
            analysis_id,
            notification_type,
            message,
            scheduledAt
        )
        VALUES(?, ?, ?, ?, ?, ?)
    `;

  const [result] = await db.execute(query, [
    userId,
    woundId,
    analysisId,
    notificationType,
    message,
    scheduledAt,
  ]);

  return result;
};

const findPendingNotifications = async () => {
  const query = `
        SELECT *
        FROM notifications
        WHERE is_sent = FALSE
        AND (
            ScheduledAt <= NOW()
            OR scheduledAt IS NULL
        )
    `;
  const [result] = await db.execute(query);
  return result;
};

const markNotificationAsSent = async (notificationId) => {
  const query = `
        UPDATE notifications
            SET is_sent = TRUE
        WHERE id = ?
    `;
  const [result] = await db.execute(query, [notificationId]);
};

const markNotificationAsRead = async (notificationId, userId) => {
  const query = `
        UPDATE notifications
            SET is_read = TRUE
        WHERE id = ?
        AND user_id = ?
    `;
  const [result] = await db.execute(query, [notificationId, userId]);
  return result;
};

const findNotificationByUserId = async (userId) => {
  const query = `
        SELECT * 
        FROM notifications
        WHERE user_id = ?
        ORDER BY createdAt DESC
    `;
  const [result] = await db.execute(query, [userId]);
  return result;
};

export {
  createNotification,
  markNotificationAsRead,
  findNotificationByUserId,
  findPendingNotifications,
  markNotificationAsSent,
};
