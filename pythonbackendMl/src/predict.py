import sys

from src.config import (
    DATASET3_MODEL,
    IMG_SIZE,
    PREDICTION_THRESHOLD
)

from src.model_loader import load_model

from src.predictor import predict_wound


def main():

    if len(sys.argv) < 2:

        print(
            "Usage: python predict.py <image_path>"
        )

        return


    image_path = sys.argv[1]


    print("Loading model...")

    model = load_model(
        DATASET3_MODEL
    )


    print("Running prediction...")

    result = predict_wound(
        model,
        image_path,
        IMG_SIZE,
        PREDICTION_THRESHOLD
    )


    print(
        "Wound area:",
        result["woundArea"]
    )

    print(
        "Healthy area:",
        result["healthyArea"]
    )

    print(
        "Confidence:",
        result["confidence"]
    )


if __name__ == "__main__":
    main()