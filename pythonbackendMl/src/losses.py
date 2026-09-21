import tensorflow as tf


def dice_loss(
    y_true,
    y_pred,
    smooth=1e-6
):

    y_true = tf.cast(
        y_true,
        tf.float32
    )

    y_pred = tf.cast(
        y_pred,
        tf.float32
    )

    intersection = tf.reduce_sum(
        y_true * y_pred
    )

    dice = (
        (2.0 * intersection + smooth)
        /
        (
            tf.reduce_sum(y_true)
            +
            tf.reduce_sum(y_pred)
            +
            smooth
        )
    )

    return 1.0 - dice


def bce_dice_loss(
    y_true,
    y_pred
):

    bce = tf.keras.losses.binary_crossentropy(
        y_true,
        y_pred
    )

    return (
        tf.reduce_mean(bce)
        +
        dice_loss(
            y_true,
            y_pred
        )
    )