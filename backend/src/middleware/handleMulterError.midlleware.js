import multer from "multer";
import { ApiError } from "../utils/apiError.js";

const handleMulterError = (err, req, res, next) => {
    if(err instanceof multer.MulterError) {
        switch (err.code) {
            case "LIMIT_FILE_SIZE":
                return next(
                    new ApiError(400, "File to large max 10mb")
                );
            case "LIMIT_FILE_COUNT" :
                return next(
                    new ApiError(400, "File count is max 2")
                )
            case "LIMIT_UNEXPECTED_FILE" :
                return next(
                    new ApiError (400, "Unexpected field name in field upload")
                )
            default:
                return next(new ApiError(400, "file upload error:" + err.message))
        }
    }

    if (err.code === "INVALID_FILE_TYPE") {
        return next(
            new ApiError(400, "Only JPEG, PNG, and WebP images are allowed!")
        );
    } 
    next (err)
};

export {handleMulterError}