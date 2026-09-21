import tensorflow as tf

from sklearn.model_selection import train_test_split

from .config import (
    DATASET3_IMAGES,
    DATASET3_MASKS,
    IMG_SIZE,
    BATCH_SIZE,
    VALIDATION_SPLIT,
    RANDOM_STATE,
)


def get_image_paths():

    image_paths = sorted(
        list(DATASET3_IMAGES.glob("*.jpg")) +
        list(DATASET3_IMAGES.glob("*.jpeg")) +
        list(DATASET3_IMAGES.glob("*.png"))
    )

    return image_paths


def get_valid_pairs():

    image_paths = get_image_paths()

    valid_pairs = []

    for image_path in image_paths:

        mask_path = (
            DATASET3_MASKS /
            f"{image_path.stem}.png"
        )

        if mask_path.exists():
            valid_pairs.append(
                (image_path, mask_path)
            )

    return valid_pairs


def split_dataset():

    valid_pairs = get_valid_pairs()

    train_pairs, val_pairs = train_test_split(
        valid_pairs,
        test_size=VALIDATION_SPLIT,
        random_state=RANDOM_STATE
    )

    return train_pairs, val_pairs


def load_pair(image_path, mask_path):

    # Image
    image = tf.io.read_file(image_path)

    image = tf.image.decode_image(
        image,
        channels=3,
        expand_animations=False
    )

    image = tf.image.resize(
        image,
        [IMG_SIZE, IMG_SIZE]
    )

    image = tf.cast(
        image,
        tf.float32
    ) / 255.0


    # Mask
    mask = tf.io.read_file(mask_path)

    mask = tf.image.decode_png(
        mask,
        channels=1
    )

    mask = tf.image.resize(
        mask,
        [IMG_SIZE, IMG_SIZE],
        method="nearest"
    )

    mask = tf.cast(
        mask,
        tf.float32
    ) / 255.0


    return image, mask


def create_datasets():

    train_pairs, val_pairs = split_dataset()

    train_image_paths = [
        str(pair[0])
        for pair in train_pairs
    ]

    train_mask_paths = [
        str(pair[1])
        for pair in train_pairs
    ]

    val_image_paths = [
        str(pair[0])
        for pair in val_pairs
    ]

    val_mask_paths = [
        str(pair[1])
        for pair in val_pairs
    ]


    train_ds = tf.data.Dataset.from_tensor_slices(
        (
            train_image_paths,
            train_mask_paths
        )
    )

    val_ds = tf.data.Dataset.from_tensor_slices(
        (
            val_image_paths,
            val_mask_paths
        )
    )


    train_ds = train_ds.map(
        load_pair,
        num_parallel_calls=tf.data.AUTOTUNE
    )

    val_ds = val_ds.map(
        load_pair,
        num_parallel_calls=tf.data.AUTOTUNE
    )


    train_ds = (
        train_ds
        .shuffle(800)
        .batch(BATCH_SIZE)
        .prefetch(tf.data.AUTOTUNE)
    )

    val_ds = (
        val_ds
        .batch(BATCH_SIZE)
        .prefetch(tf.data.AUTOTUNE)
    )


    return (
        train_ds,
        val_ds,
        train_pairs,
        val_pairs
    )