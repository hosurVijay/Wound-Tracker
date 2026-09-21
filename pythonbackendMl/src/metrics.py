import numpy as np


def calculate_dice(
    y_true,
    y_pred,
    smooth=1e-6
):

    y_true = y_true.astype(
        np.float32
    )

    y_pred = y_pred.astype(
        np.float32
    )

    intersection = np.sum(
        y_true * y_pred
    )

    return (
        (2.0 * intersection + smooth)
        /
        (
            np.sum(y_true)
            +
            np.sum(y_pred)
            +
            smooth
        )
    )


def calculate_iou(
    y_true,
    y_pred,
    smooth=1e-6
):

    y_true = y_true.astype(
        np.float32
    )

    y_pred = y_pred.astype(
        np.float32
    )

    intersection = np.sum(
        y_true * y_pred
    )

    union = (
        np.sum(y_true)
        +
        np.sum(y_pred)
        -
        intersection
    )

    return (
        (intersection + smooth)
        /
        (union + smooth)
    )