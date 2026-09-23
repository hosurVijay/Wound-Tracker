import cloudinary
import cloudinary.uploader
import os


cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET")
)


def upload_mask(mask_bytes):

    result = cloudinary.uploader.upload(
        mask_bytes,
        folder="wound_tracker/masks",
        resource_type="image"
    )

    return {
        "url": result["secure_url"],
        "public_id": result["public_id"]
    }