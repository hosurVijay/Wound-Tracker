import {v2 as cloudinary} from "cloudinary"
import dotenv from "dotenv"

dotenv.config();

cloudinary.config({
    api_key: process.env.CLOUDINARY_API_KEY,
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_secret: process.env.CLOUDINARY_API_SECRET
})

const uploadToCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null;
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: 'auto',
        })

        console.log("File upload to cloudinary was successfull", response.secure_url);

        return response
    } catch (error) {
        console.log("Cloudinary upload failed", error);
        return null;
    }
}

export {uploadToCloudinary}