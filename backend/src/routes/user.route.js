import { Router } from "express";
import {
  loginUser,
  registerUser,
  logoutUser,
  forgotPassword,
  verifyOtp,
  resetPassword,
  getCurrentUser,
  updateUserDetails,
  updateProfileImage,
  updateUserPassword,
  deleteAccount,
} from "../controller/user.controller.js";
import { refreshToken, verifyUser } from "../middleware/auth.middleware.js";
import { upload, processUpload } from "../middleware/multer.middleware.js";
import { handleMulterError } from "../middleware/handleMulterError.midlleware.js";

const router = Router();
router.route("/register").post(registerUser);
router.route("/login").post(loginUser);
router.route("/logout").post(verifyUser, logoutUser);
router.route("/refresh-token").post(refreshToken);
router.route("/forgot-password").post(forgotPassword);
router.route("/verify-otp").post(verifyOtp);
router.route("/reset-password").post(resetPassword);
router.route("/profile").get(verifyUser, getCurrentUser);
router.route("/upadate-profile").patch(verifyUser, updateUserDetails);
router
  .route("/profile-image")
  .patch(
    verifyUser,
    upload.single("profileImage"),
    handleMulterError,
    processUpload,
    updateProfileImage,
  );
router.route("/password").patch(verifyUser, updateUserPassword);
router.route("/accounts").delete(verifyUser, deleteAccount);

export default router;
