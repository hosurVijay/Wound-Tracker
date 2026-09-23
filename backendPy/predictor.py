from pathlib import Path

import cv2
import numpy as np
import tensorflow as tf


BASE_DIR = Path(__file__).resolve().parent.parent

MODEL_PATH = (
    BASE_DIR
    / "pythonbackendMl"
    / "models"
    / "unet_dataset3_finetuned_best.keras"
)

IMG_SIZE = 256
THRESHOLD = 0.5


# Model is NOT loaded when the application starts.
# It will be loaded only when the first prediction is requested.
model = None


def get_model():

    global model

    if model is None:

        print(
            ">>> Loading wound segmentation model...",
            flush=True
        )

        model = tf.keras.models.load_model(
            MODEL_PATH,
            compile=False
        )

        print(
            ">>> Wound segmentation model loaded successfully.",
            flush=True
        )

        print(
            ">>> Input shape:",
            model.input_shape,
            flush=True
        )

        print(
            ">>> Output shape:",
            model.output_shape,
            flush=True
        )

    return model


def _run_prediction(image):

    # Get model only when prediction is actually requested
    current_model = get_model()

    # Resize image
    image = cv2.resize(
        image,
        (IMG_SIZE, IMG_SIZE)
    )

    # Normalize
    input_image = (
        image.astype(np.float32) / 255.0
    )

    # Add batch dimension
    input_tensor = np.expand_dims(
        input_image,
        axis=0
    )

    print(
        ">>> Running model prediction...",
        flush=True
    )

    prediction = current_model.predict(
        input_tensor,
        verbose=0
    )[0]

    print(
        ">>> Model prediction completed.",
        flush=True
    )

    probability_map = prediction[:, :, 0]

    # Convert probability map to binary mask
    mask = (
        probability_map >= THRESHOLD
    ).astype(np.uint8)

    # Calculate wound area
    wound_area = int(
        np.sum(mask)
    )

    total_pixels = IMG_SIZE * IMG_SIZE

    healthy_area = (
        total_pixels - wound_area
    )

    # Heuristic confidence
    confidence = float(
        np.mean(
            np.maximum(
                probability_map,
                1.0 - probability_map
            )
        )
    )

    return {
        "image": image,
        "probabilityMap": probability_map,
        "mask": mask,
        "woundArea": wound_area,
        "healthyArea": healthy_area,
        "confidence": confidence
    }


def predict_wound(image_path):

    image = cv2.imread(
        str(image_path)
    )

    if image is None:
        raise ValueError(
            "Unable to read image"
        )

    image = cv2.cvtColor(
        image,
        cv2.COLOR_BGR2RGB
    )

    return _run_prediction(
        image
    )


def predict_wound_bytes(image_bytes):

    image_array = np.frombuffer(
        image_bytes,
        dtype=np.uint8
    )

    image = cv2.imdecode(
        image_array,
        cv2.IMREAD_COLOR
    )

    if image is None:
        raise ValueError(
            "Unable to decode image"
        )

    image = cv2.cvtColor(
        image,
        cv2.COLOR_BGR2RGB
    )

    return _run_prediction(
        image
    )


def mask_to_png(mask):

    mask_image = (
        mask * 255
    ).astype(np.uint8)

    success, encoded_image = cv2.imencode(
        ".png",
        mask_image
    )

    if not success:
        raise ValueError(
            "Failed to encode wound mask as PNG"
        )

    return encoded_image.tobytes()