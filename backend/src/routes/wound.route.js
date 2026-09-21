import { Router } from "express";
import { upload, processUpload } from "../middleware/multer.middleware.js";
import { handleMulterError } from "../middleware/handleMulterError.midlleware.js";
import { verifyUser } from "../middleware/auth.middleware";
import {
  addWoundImage,
  createUserWound,
  getUserAllWounds,
  getWoundDetails,
  uploadWoundImage,
} from "../controller/wound.controller.js";
const router = Router();

router.route("/").post(verifyUser, getUserAllWounds);

router.route("/").get(verifyUser, getUserAllWounds);
router.route("/:woundId").get(verifyUser, getWoundDetails);
route
  .route("/upload")
  .post(
    verifyUser,
    upload.single("woundImage"),
    handleMulterError,
    processUpload,
    uploadWoundImage,
  );

export default router;
