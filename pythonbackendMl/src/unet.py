import pandas as pd 
import tensorflow as tf
from pathlib import Path
import numpy as np
from tensorflow.keras import Model, layers
import os

datasetPath = Path("../dataset/data_wound_seg_256")
train_images = datasetPath / "train_images"
train_masks = datasetPath/ "train_masks"
test_images = datasetPath/"test_images"
test_masks = datasetPath/"test_masks"


train_images_path = sorted(train_images.glob("*.png"))
train_masks_path = sorted(train_masks.glob("*.png"))
test_images_path = sorted(test_images.glob("*.png"))
test_masks_path = sorted(test_masks.glob("*.png"))

train_images_path = [str(p) for p in train_images_path]
train_masks_path = [str(p) for p in train_masks_path]
test_images_path = [str(p) for p in test_images_path]
test_masks_path = [str(p) for p in test_masks_path]


def load_images_masks(image_path, masks_path):
    image = tf.io.read_file(image_path)
    image = tf.image.decode_png(image, channels = 3)
    image = tf.image.convert_image_dtype(image, tf.float32)

    mask = tf.io.read_file(masks_path)
    mask = tf.image.decode_png(mask, channels = 1)
    mask = tf.image.convert_image_dtype(mask, tf.float32)

    return image, mask


BUFFER_SIZE = len(train_images_path)
BATCH_SIZE = 2

train_dataset = tf.data.Dataset.from_tensor_slices(
    (train_images_path, train_masks_path)
)


train_dataset = train_dataset.map(load_images_masks)
train_dataset = train_dataset.shuffle(buffer_size=BUFFER_SIZE)
train_dataset = train_dataset.batch(batch_size=BATCH_SIZE)
train_dataset = train_dataset.prefetch(tf.data.AUTOTUNE)


test_dataset = tf.data.Dataset.from_tensor_slices(
    (test_images_path, test_masks_path)
)

test_dataset = test_dataset.map(load_images_masks)
test_dataset = test_dataset.batch(batch_size=BATCH_SIZE)
test_dataset = test_dataset.prefetch(tf.data.AUTOTUNE)

def conv_block(inputs, n_filters=32, drop_prob=0.0):
    x = tf.keras.layers.Conv2D(n_filters, 3, padding='same', kernel_initializer='he_normal')(inputs)
    x = tf.keras.layers.Activation('relu')(x)

    if drop_prob > 0.0:
        x = tf.keras.layers.Dropout(drop_prob)(x)

    x = tf.keras.layers.Conv2D(n_filters, 3, padding='same', kernel_initializer='he_normal')(x)
    x= tf.keras.layers.Activation('relu')(x)

    return x


def encoder(inputs, n_filters):
    x = conv_block(inputs, n_filters)
    x = tf.keras.layers.MaxPool2D(pool_size=(2,2), strides=2)(x)
    return x

def decoder(inputs, skip_features, n_filters):
    x = tf.keras.layers.Conv2DTranspose(n_filters, (2,2), strides = 2, padding='same')(inputs)
    skip_features = tf.keras.layers.Resizing(x.shape[1], x.shape[2])(skip_features)
    x = tf.keras.layers.Concatenate()([x, skip_features])
    x = conv_block(x, n_filters)
    return x

def unet_model(input_shape=(256,256,3), num_classes=1):
    inputs = tf.keras.layers.Input(shape=input_shape)

    s1 = encoder(inputs, 64)
    s2 = encoder(s1, 128)
    s3 = encoder(s2, 256)
    s4 = encoder(s3, 512)

    b1 = tf.keras.layers.Conv2D(1024, 3, padding='same')(s4)
    b1 = tf.keras.layers.Activation('relu')(b1)
    b1 = tf.keras.layers.Conv2D(1024, 3, padding='same')(b1)
    b1 = tf.keras.layers.Activation('relu')(b1)

    d1 = decoder(b1,s4, 512)
    d2 = decoder(d1, s3, 256)
    d3 = decoder(d2, s2, 128)
    d4 =decoder(d3, s1, 64)

    outputs = tf.keras.layers.Conv2D(num_classes, 1, padding='same', activation='sigmoid')(d4)

    model = tf.keras.models.Model(inputs=inputs, outputs=outputs, name='U_Net' )
    return model

if __name__ == "__main__":
    model = unet_model(
        input_shape=(256, 256, 3),
        num_classes=1
    )

    model.summary()
    for images, masks in train_dataset.take(1):
        print("Images:", images.shape)
        print("Masks:", masks.shape)

        predictions = model(images)

        print("Predictions:", predictions.shape)
    model = unet_model(
    input_shape=(256, 256, 3),
    num_classes=1
    )

    model.compile(
        optimizer=tf.keras.optimizers.Adam(learning_rate=1e-4),
        loss="binary_crossentropy",
        metrics=["accuracy"]
    )

    checkpoint = tf.keras.callbacks.ModelCheckpoint(
        "../models/unet_best.keras",
        monitor="val_loss",
        save_best_only=True,
        mode="min"
    )

    history = model.fit(
        train_dataset,
        validation_data=test_dataset,
        epochs=20,
        callbacks=[checkpoint]
    )