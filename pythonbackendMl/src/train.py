from src.data_loader import create_datasets
from src.trainer import train_model
from src.evaluator import evaluate_model


def main():

    print("Creating Dataset-3 pipeline...")

    (
        train_ds,
        val_ds,
        train_pairs,
        val_pairs
    ) = create_datasets()


    print(
        "Training pairs:",
        len(train_pairs)
    )

    print(
        "Validation pairs:",
        len(val_pairs)
    )
    print("\nStarting fine-tuning...")

    model, history = train_model(
        train_ds,
        val_ds
    )


    print("\nEvaluating model...")

    results = evaluate_model(
        model,
        val_ds
    )


    print(
        f"Mean Dice: "
        f"{results['meanDice']:.4f}"
    )

    print(
        f"Mean IoU: "
        f"{results['meanIoU']:.4f}"
    )


if __name__ == "__main__":
    main()