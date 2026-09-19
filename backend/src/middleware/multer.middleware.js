import multer from "multer";
import path from "path";
import fs from 'fs';
import { uploadToCloudinary } from "../utils/cloudinary.js";
import {ApiError} from "../utils/apiError.js"
import { fileURLToPath } from "url";
import {asyncHandler} from "../utils/asyncHandler.js";
import { resolveSoa } from "dns";


const storage = multer.diskStorage({
    destination: function (req, file, callBack) {
        callBack(null, "public/temp");
    },

    filename : function(req, file, callBack) { 
        const uniqueSuffix = Date.now() + "_" + Math.round(Math.random() * 1e9);
        const extension = path.extname(file.originalname);
        callBack(null, file.fieldname + "_" + uniqueSuffix + extension);
    },
})

const imageFilter = (req, file, callBack) => {
    const allowedType = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
    if (!allowedType.includes(file.mimetype)) {
        const err = new ApiError(
            400,
            "Only JEPG, PNG, JPG, and webP images are allowed"
        );

        err.code = "INVALID_IMAGE_TYPE";
        return callBack(err, false)
    };
    callBack(null, true);
};

const upload = multer({
    storage,
    fileFilter: imageFilter,
    limits: {fileSize: 10 * 1024 * 1024, files: 2}, // 10mb;
    
})

const processUpload = asyncHandler(async (req, res, next) => {
    if(!req.file) throw new ApiError(400, "No file uploaded");

    try {
        const result = await uploadToCloudinary(req.file.path);

        if (!result) throw new ApiError(500, "Cloudinary upload failed");

        req.file.clodianaryUrl = result.secure_url;
        req.file.publicId = result.public_id;
        next()
    } catch (error) {
        if (fs.existsSync(req.file.path)) {
            fs.unlink(req.file.path)
        }
    }
})


export {upload, processUpload}