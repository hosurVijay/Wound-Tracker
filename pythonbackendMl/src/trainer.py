import tensorflow as tf

from tensorflow.keras.callbacks import (
    ModelCheckpoint,
    EarlyStopping,
    ReduceLROnPlateau
)

from .config import (
    DATASET2_MODEL,
    DATASET3_MODEL,
    LEARNING_RATE,
    EPOCHS
)

from .losses import bce_dice_loss
from .model_loader import load_model


def build_model():

    model = tf.keras.models.load_model(
        DATASET2_MODEL,
        compile=False
    )

    optimizer = tf.keras.optimizers.Adam(
        learning_rate=LEARNING_RATE
    )

    model.compile(
        optimizer=optimizer,
        loss=bce_dice_loss,
        metrics=[
            tf.keras.metrics.BinaryAccuracy(
                name="accuracy"
            )
        ]
    )

    return model


def train_model(
    train_ds,
    val_ds
):

    model = build_model()


    callbacks = [

        ModelCheckpoint(
            DATASET3_MODEL,
            monitor="val_loss",
            save_best_only=True,
            verbose=1
        ),

        EarlyStopping(
            monitor="val_loss",
            patience=3,
            restore_best_weights=True,
            verbose=1
        ),

        ReduceLROnPlateau(
            monitor="val_loss",
            factor=0.5,
            patience=2,
            min_lr=1e-7,
            verbose=1
        )
    ]


    history = model.fit(
        train_ds,
        validation_data=val_ds,
        epochs=EPOCHS,
        callbacks=callbacks,
        verbose=1
    )


    return model, history