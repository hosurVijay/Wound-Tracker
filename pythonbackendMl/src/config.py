from pathlib import Path
BASE_DIR = Path(__file__).resolve().parent.parent
DATASET3_IMAGES = BASE_DIR / "dataset" / "woundDataset3"
DATASET3_MASKS = BASE_DIR / "dataset" / "woundDataset3_pseudo_masks"
DATASET2_MODEL = BASE_DIR / "models" / "unet_dataset2_refined.keras"
DATASET3_MODEL = (
    BASE_DIR /
    "models" /
    "unet_dataset3_finetuned_best.keras"
)
IMG_SIZE = 256
BATCH_SIZE = 2
VALIDATION_SPLIT = 0.2
RANDOM_STATE = 42
LEARNING_RATE = 1e-5
EPOCHS = 10
PREDICTION_THRESHOLD = 0.5