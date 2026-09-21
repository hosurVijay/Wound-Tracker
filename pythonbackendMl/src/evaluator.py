import numpy as np

from .metrics import (
    calculate_dice,
    calculate_iou
)


def evaluate_model(
    model,
    val_ds,
    threshold=0.5
):

    dice_scores = []
    iou_scores = []


    for images, masks in val_ds:

        predictions = model.predict(
            images,
            verbose=0
        )

        predictions = (
            predictions >= threshold
        ).astype(
            np.float32
        )

        masks = masks.numpy()


        for true_mask, pred_mask in zip(
            masks,
            predictions
        ):

            dice_scores.append(
                calculate_dice(
                    true_mask,
                    pred_mask
                )
            )

            iou_scores.append(
                calculate_iou(
                    true_mask,
                    pred_mask
                )
            )


    return {
        "meanDice": float(
            np.mean(dice_scores)
        ),
        "meanIoU": float(
            np.mean(iou_scores)
        ),
        "diceScores": dice_scores,
        "iouScores": iou_scores
    }