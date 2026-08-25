import tensorflow as tf
from pathlib import Path


# ============================================================
# 1. DATASET PATHS
# ============================================================

datasetPath = Path("../dataset/data_wound_seg_256")

train_images = datasetPath / "train_images"
train_masks = datasetPath / "train_masks"

test_images = datasetPath / "test_images"
test_masks = datasetPath / "test_masks"

train_images_path = sorted(train_images.glob("*.png"))
train_masks_path = sorted(train_masks.glob("*.png"))

test_images_path = sorted(test_images.glob("*.png"))
test_masks_path = sorted(test_masks.glob("*.png"))

# Convert PosixPath → string
train_images_path = [str(p) for p in train_images_path]
train_masks_path = [str(p) for p in train_masks_path]

test_images_path = [str(p) for p in test_images_path]
test_masks_path = [str(p) for p in test_masks_path]


# ============================================================
# 2. IMAGE + MASK LOADER
# ============================================================

def load_images_masks(image_path, mask_path):

    # Load image
    image = tf.io.read_file(image_path)
    image = tf.image.decode_png(
        image,
        channels=3
    )
    image = tf.image.convert_image_dtype(
        image,
        tf.float32
    )

    # Load mask
    mask = tf.io.read_file(mask_path)
    mask = tf.image.decode_png(
        mask,
        channels=1
    )
    mask = tf.image.convert_image_dtype(
        mask,
        tf.float32
    )

    return image, mask


# ============================================================
# 3. CREATE DATASETS
# ============================================================

BUFFER_SIZE = len(train_images_path)
BATCH_SIZE = 2


train_dataset = tf.data.Dataset.from_tensor_slices(
    (
        train_images_path,
        train_masks_path
    )
)

train_dataset = train_dataset.map(
    load_images_masks
)

train_dataset = train_dataset.shuffle(
    buffer_size=BUFFER_SIZE
)

train_dataset = train_dataset.batch(
    BATCH_SIZE
)

train_dataset = train_dataset.prefetch(
    tf.data.AUTOTUNE
)


test_dataset = tf.data.Dataset.from_tensor_slices(
    (
        test_images_path,
        test_masks_path
    )
)

test_dataset = test_dataset.map(
    load_images_masks
)

test_dataset = test_dataset.batch(
    BATCH_SIZE
)

test_dataset = test_dataset.prefetch(
    tf.data.AUTOTUNE
)


# ============================================================
# 4. CONVOLUTION BLOCK
# ============================================================

def conv_block(
    inputs,
    n_filters=32,
    drop_prob=0.0
):

    x = tf.keras.layers.Conv2D(
        n_filters,
        3,
        padding="same",
        kernel_initializer="he_normal"
    )(inputs)

    x = tf.keras.layers.Activation(
        "relu"
    )(x)

    if drop_prob > 0.0:

        x = tf.keras.layers.Dropout(
            drop_prob
        )(x)

    x = tf.keras.layers.Conv2D(
        n_filters,
        3,
        padding="same",
        kernel_initializer="he_normal"
    )(x)

    x = tf.keras.layers.Activation(
        "relu"
    )(x)

    return x


# ============================================================
# 5. ENCODER
# ============================================================

def encoder(
    inputs,
    n_filters
):

    x = conv_block(
        inputs,
        n_filters
    )

    x = tf.keras.layers.MaxPool2D(
        pool_size=(2, 2),
        strides=2
    )(x)

    return x


# ============================================================
# 6. DECODER
# ============================================================

def decoder(
    inputs,
    skip_features,
    n_filters
):

    # Upsample
    x = tf.keras.layers.Conv2DTranspose(
        n_filters,
        (2, 2),
        strides=2,
        padding="same"
    )(inputs)

    # Match skip connection dimensions
    skip_features = tf.keras.layers.Resizing(
        x.shape[1],
        x.shape[2]
    )(skip_features)

    # Skip connection
    x = tf.keras.layers.Concatenate()(
        [x, skip_features]
    )

    # Refine features
    x = conv_block(
        x,
        n_filters
    )

    return x


# ============================================================
# 7. U-NET
# ============================================================

def unet_model(
    input_shape=(256, 256, 3),
    num_classes=1
):

    inputs = tf.keras.layers.Input(
        shape=input_shape
    )

    # Encoder
    s1 = encoder(inputs, 64)
    s2 = encoder(s1, 128)
    s3 = encoder(s2, 256)
    s4 = encoder(s3, 512)

    # ========================================================
    # Bottleneck
    # ========================================================

    b1 = tf.keras.layers.Conv2D(
        1024,
        3,
        padding="same"
    )(s4)

    b1 = tf.keras.layers.Activation(
        "relu"
    )(b1)

    b1 = tf.keras.layers.Conv2D(
        1024,
        3,
        padding="same"
    )(b1)

    b1 = tf.keras.layers.Activation(
        "relu"
    )(b1)

    # ========================================================
    # Decoder
    # ========================================================

    d1 = decoder(
        b1,
        s4,
        512
    )

    d2 = decoder(
        d1,
        s3,
        256
    )

    d3 = decoder(
        d2,
        s2,
        128
    )

    d4 = decoder(
        d3,
        s1,
        64
    )

    # ========================================================
    # Final segmentation layer
    # ========================================================

    outputs = tf.keras.layers.Conv2D(
        num_classes,
        1,
        padding="same",
        activation="sigmoid"
    )(d4)

    model = tf.keras.models.Model(
        inputs=inputs,
        outputs=outputs,
        name="U_Net_BCE_Dice"
    )

    return model


# ============================================================
# 8. DICE LOSS
# ============================================================

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
        2.0 * intersection + smooth
    ) / (
        tf.reduce_sum(y_true)
        +
        tf.reduce_sum(y_pred)
        +
        smooth
    )

    return 1.0 - dice


# ============================================================
# 9. BCE + DICE LOSS
# ============================================================
def bce_dice_loss(
    y_true,
    y_pred
):

    bce = tf.keras.losses.binary_crossentropy(
        y_true,
        y_pred
    )

    bce = tf.reduce_mean(
        bce
    )

    dice = dice_loss(
        y_true,
        y_pred
    )

    return bce + dice
# ============================================================
# 10. TRAIN
# ============================================================

if __name__ == "__main__":

    # Create model
    model = unet_model(
        input_shape=(256, 256, 3),
        num_classes=1
    )

    # Check architecture
    model.summary()

    # Quick shape test
    for images, masks in train_dataset.take(1):

        print(
            "Images:",
            images.shape
        )

        print(
            "Masks:",
            masks.shape
        )

        predictions = model(images)

        print(
            "Predictions:",
            predictions.shape
        )

    # ========================================================
    # Compile with BCE + Dice
    # ========================================================

    model.compile(

        optimizer=tf.keras.optimizers.Adam(
            learning_rate=1e-4
        ),

        loss=bce_dice_loss,

        metrics=[
            "accuracy"
        ]
    )

    # ========================================================
    # Save best model
    # ========================================================

    checkpoint = tf.keras.callbacks.ModelCheckpoint(

        "../models/unet_bce_dice_best.keras",

        monitor="val_loss",

        save_best_only=True,

        mode="min"
    )

    # ========================================================
    # Train
    # ========================================================

    history = model.fit(

        train_dataset,

        validation_data=test_dataset,

        epochs=20,

        callbacks=[
            checkpoint
        ]
    )