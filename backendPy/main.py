from fastapi import FastAPI, HTTPException
from pydantic import BaseModel


print(
    ">>> MAIN.PY STARTING",
    flush=True
)


from image_utils import download_image

print(
    ">>> image_utils IMPORTED",
    flush=True
)


from predictor import (
    predict_wound_bytes,
    mask_to_png
)

print(
    ">>> predictor IMPORTED",
    flush=True
)


from cloudinary_utils import upload_mask

print(
    ">>> cloudinary_utils IMPORTED",
    flush=True
)


print(
    ">>> ALL IMPORTS COMPLETE",
    flush=True
)


app = FastAPI(
    title="Wound Segmentation API",
    version="1.0.0"
)


print(
    ">>> FASTAPI APP CREATED",
    flush=True
)


class PredictionRequest(BaseModel):

    imageUrl: str


@app.get("/")
def root():

    print(
        ">>> ROOT REQUEST RECEIVED",
        flush=True
    )

    return {
        "message": "Wound Segmentation API is running"
    }


@app.get("/health")
def health():

    print(
        ">>> HEALTH REQUEST RECEIVED",
        flush=True
    )

    return {
        "status": "ok"
    }


@app.get("/predict-test")
def predict_test():

    print(
        ">>> PREDICT-TEST STARTED",
        flush=True
    )

    try:

        import numpy as np
        import cv2

        print(
            ">>> Creating dummy image...",
            flush=True
        )

        dummy_image = np.zeros(
            (256, 256, 3),
            dtype=np.uint8
        )

        success, encoded = cv2.imencode(
            ".jpg",
            dummy_image
        )

        if not success:

            raise ValueError(
                "Failed to create test image"
            )

        print(
            ">>> Dummy image created",
            flush=True
        )

        print(
            ">>> Running model...",
            flush=True
        )

        result = predict_wound_bytes(
            encoded.tobytes()
        )

        print(
            ">>> MODEL TEST COMPLETE",
            flush=True
        )

        return {
            "status": "model working",
            "confidence": result["confidence"],
            "woundArea": result["woundArea"],
            "healthyArea": result["healthyArea"]
        }

    except Exception as error:

        print(
            ">>> MODEL TEST FAILED:",
            str(error),
            flush=True
        )

        import traceback

        traceback.print_exc()

        raise HTTPException(
            status_code=500,
            detail=str(error)
        )


@app.post("/predict")
def predict(
    request: PredictionRequest
):

    print(
        ">>> /predict REQUEST RECEIVED",
        flush=True
    )

    try:

        # --------------------------------
        # 1. Download image
        # --------------------------------

        print(
            ">>> Downloading image...",
            flush=True
        )

        image_bytes = download_image(
            request.imageUrl
        )

        print(
            f">>> Image downloaded: {len(image_bytes)} bytes",
            flush=True
        )


        # --------------------------------
        # 2. Run U-Net
        # --------------------------------

        print(
            ">>> Running U-Net inference...",
            flush=True
        )

        result = predict_wound_bytes(
            image_bytes
        )

        print(
            ">>> Model prediction complete",
            flush=True
        )


        # --------------------------------
        # 3. Create mask
        # --------------------------------

        print(
            ">>> Creating mask PNG...",
            flush=True
        )

        mask_bytes = mask_to_png(
            result["mask"]
        )

        print(
            ">>> Mask PNG created",
            flush=True
        )


        # --------------------------------
        # 4. Upload mask
        # --------------------------------

        print(
            ">>> Uploading mask to Cloudinary...",
            flush=True
        )

        uploaded_mask = upload_mask(
            mask_bytes
        )

        print(
            ">>> Mask uploaded successfully",
            flush=True
        )


        # --------------------------------
        # 5. Return response
        # --------------------------------

        return {

            "maskUrl": uploaded_mask["url"],

            "confidence": result["confidence"],

            "woundArea": result["woundArea"],

            "healthyArea": result["healthyArea"]

        }


    except Exception as error:

        print(
            ">>> WOUND PREDICTION FAILED:",
            str(error),
            flush=True
        )

        import traceback

        traceback.print_exc()

        raise HTTPException(
            status_code=500,
            detail="Wound analysis failed"
        )