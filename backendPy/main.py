from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

from image_utils import download_image
from predictor import predict_wound_bytes, mask_to_png
from cloudinary_utils import upload_mask


app = FastAPI(
    title="Wound Segmentation API",
    version="1.0.0"
)


class PredictionRequest(BaseModel):
    imageUrl: str


@app.get("/")
def root():
    return {
        "message": "Wound Segmentation API is running"
    }


@app.post("/predict")
def predict(request: PredictionRequest):

    try:
        # 1. Download image from Cloudinary
        image_bytes = download_image(
            request.imageUrl
        )

        # 2. Run U-Net inference
        result = predict_wound_bytes(
            image_bytes
        )

        # 3. Convert binary mask to PNG
        mask_bytes = mask_to_png(
            result["mask"]
        )

        # 4. Upload generated mask to Cloudinary
        uploaded_mask = upload_mask(
            mask_bytes
        )

        # 5. Return result to Node.js
        return {
            "maskUrl": uploaded_mask["url"],
            "confidence": result["confidence"],
            "woundArea": result["woundArea"],
            "healthyArea": result["healthyArea"]
        }

    except Exception as error:

        print(
            "Wound prediction failed:",
            str(error)
        )

        raise HTTPException(
            status_code=500,
            detail="Wound analysis failed"
        )