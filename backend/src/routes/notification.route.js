import { Router } from "express";
import {
  getUserNotifications,
  markAsRead,
} from "../controller/notification.controller.js";
import { verifyUser } from "../middleware/auth.middleware.js";
const router = Router();

router.route("/").get(verifyUser, getUserNotifications);
router.route("/:notificationId/read").patch(verifyUser, markAsRead);
export default router;
