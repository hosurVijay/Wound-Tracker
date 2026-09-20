import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import {
  findNotificationByUserId,
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
  return res.status(200).json(200, "Notification marked", null);
});

export { getUserNotifications, markAsRead };
