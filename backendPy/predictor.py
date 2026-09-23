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


# Load the trained wound segmentation model
model = tf.keras.models.load_model(
    MODEL_PATH,
    compile=False
)

print("Wound segmentation model loaded successfully.")
print("Input shape:", model.input_shape)
print("Output shape:", model.output_shape)


def _run_prediction(image):
    """
    Common inference logic.

    Receives an RGB image and returns:
    - processed image
    - probability map
    - binary mask
    - wound area
    - healthy area
    - prediction confidence
    """

    image = cv2.resize(
        image,
        (IMG_SIZE, IMG_SIZE)
    )

    input_image = image.astype(
        np.float32
    ) / 255.0

    input_tensor = np.expand_dims(
        input_image,
        axis=0
    )

    prediction = model.predict(
        input_tensor,
        verbose=0
    )[0]

    probability_map = prediction[:, :, 0]

    mask = (
        probability_map >= THRESHOLD
    ).astype(np.uint8)

    wound_area = int(
        np.sum(mask)
    )

    total_pixels = IMG_SIZE * IMG_SIZE

    healthy_area = (
        total_pixels - wound_area
    )

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
    """
    Run wound segmentation using a local image file.

    Used mainly for local testing.
    """

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

    return _run_prediction(image)


def predict_wound_bytes(image_bytes):
    """
    Run wound segmentation using image bytes.

    This is used by FastAPI when an image is
    downloaded from a Cloudinary URL.
    """

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

    return _run_prediction(image)

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