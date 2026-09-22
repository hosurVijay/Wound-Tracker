import { Router } from "express";
import { upload, processUpload } from "../middleware/multer.middleware.js";
import { handleMulterError } from "../middleware/handleMulterError.midlleware.js";
import { verifyUser } from "../middleware/auth.middleware.js";
import {
  addWoundImage,
  createUserWound,
  getUserAllWounds,
  getWoundDetails,
  uploadWoundImage,
} from "../controller/wound.controller.js";
const router = Router();

router.route("/").post(verifyUser, getUserAllWounds);
router
  .route("/upload")
  .post(
    verifyUser,
    upload.single("woundImage"),
    handleMulterError,
    processUpload,
    uploadWoundImage,
  );
router.route("/:woundId").get(verifyUser, getWoundDetails);

export default router;
