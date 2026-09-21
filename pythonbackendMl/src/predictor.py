import cv2
import numpy as np


def preprocess_image(
    image_path,
    img_size=256
):

    image = cv2.imread(
        str(image_path)
    )

    if image is None:
        raise ValueError(
            f"Unable to read image: {image_path}"
        )

    image = cv2.cvtColor(
        image,
        cv2.COLOR_BGR2RGB
    )

    image_resized = cv2.resize(
        image,
        (img_size, img_size)
    )

    image_input = (
        image_resized.astype(
            np.float32
        ) / 255.0
    )

    return image_resized, image_input


def predict_mask(
    model,
    image_path,
    img_size=256,
    threshold=0.5
):

    image_resized, image_input = (
        preprocess_image(
            image_path,
            img_size
        )
    )

    prediction = model.predict(
        np.expand_dims(
            image_input,
            axis=0
        ),
        verbose=0
    )[0, :, :, 0]


    mask = (
        prediction >= threshold
    ).astype(
        np.uint8
    )


    return (
        image_resized,
        prediction,
        mask
    )


def calculate_prediction_confidence(
    probability_map
):

    confidence_map = np.maximum(
        probability_map,
        1.0 - probability_map
    )

    return float(
        np.mean(confidence_map)
    )


def calculate_wound_area(
    mask
):

    wound_pixels = int(
        np.sum(mask == 1)
    )

    total_pixels = (
        mask.shape[0] *
        mask.shape[1]
    )

    healthy_pixels = (
        total_pixels -
        wound_pixels
    )

    return (
        wound_pixels,
        healthy_pixels
    )


def predict_wound(
    model,
    image_path,
    img_size=256,
    threshold=0.5
):

    image, probability_map, mask = (
        predict_mask(
            model,
            image_path,
            img_size,
            threshold
        )
    )


    wound_area, healthy_area = (
        calculate_wound_area(
            mask
        )
    )


    confidence = (
        calculate_prediction_confidence(
            probability_map
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