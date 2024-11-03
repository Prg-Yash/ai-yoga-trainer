import csv
import pandas as pd
from tensorflow import keras
from sklearn.model_selection import train_test_split
import tensorflow as tf

# loading final csv file
def load_csv(csv_path):
    df = pd.read_csv(csv_path)
    df.drop(['filename'], axis=1, inplace=True)
    classes = df['class_name'].unique()  # Extract unique class names
    class_no = df['class_no']  # Get class numbers without modifying
    y = keras.utils.to_categorical(class_no)  # Convert to one-hot encoding for model training
    
    X = df.drop(columns=['class_no', 'class_name']).astype('float64')
    
    return X, y, class_no, classes
    df = pd.read_csv(csv_path)
    df.drop(['filename'], axis=1, inplace=True)
    classes = df.pop('class_name').unique()
    y = df.pop('class_no')
    
    X = df.astype('float64')
    y = keras.utils.to_categorical(y)
    
    return X, y, classes

def get_center_point(landmarks, left_bodypart, right_bodypart):
    """Calculates the center point of the two given landmarks."""
    left = tf.gather(landmarks, left_bodypart, axis=1)
    right = tf.gather(landmarks, right_bodypart, axis=1)
    center = left * 0.5 + right * 0.5
    return center

def get_pose_size(landmarks, torso_size_multiplier=2.5):
    """Calculates pose size."""
    # Hips center (use indices directly instead of BodyPart enum)
    hips_center = get_center_point(landmarks, 11, 12)  # LEFT_HIP, RIGHT_HIP

    # Shoulders center
    shoulders_center = get_center_point(landmarks, 5, 6)  # LEFT_SHOULDER, RIGHT_SHOULDER

    # Torso size as the minimum body size
    torso_size = tf.linalg.norm(shoulders_center - hips_center)
    
    # Pose center
    pose_center_new = get_center_point(landmarks, 11, 12)  # LEFT_HIP, RIGHT_HIP
    pose_center_new = tf.expand_dims(pose_center_new, axis=1)
    pose_center_new = tf.broadcast_to(pose_center_new, [tf.size(landmarks) // (17*2), 17, 2])

    # Dist to pose center
    d = tf.gather(landmarks - pose_center_new, 0, axis=0)
    # Max dist to pose center
    max_dist = tf.reduce_max(tf.linalg.norm(d, axis=0))

    # Normalize scale
    pose_size = tf.maximum(torso_size * torso_size_multiplier, max_dist)
    return pose_size

def normalize_pose_landmarks(landmarks):
    """Normalizes the landmarks translation."""
    # Move landmarks so that the pose center becomes (0,0)
    pose_center = get_center_point(landmarks, 11, 12)  # LEFT_HIP, RIGHT_HIP
    pose_center = tf.expand_dims(pose_center, axis=1)
    pose_center = tf.broadcast_to(pose_center, [tf.size(landmarks) // (17*2), 17, 2])
    landmarks = landmarks - pose_center

    # Scale the landmarks to a constant pose size
    pose_size = get_pose_size(landmarks)
    landmarks /= pose_size
    return landmarks

def landmarks_to_embedding(landmarks_and_scores):
    """Converts the input landmarks into a pose embedding."""
    reshaped_inputs = keras.layers.Reshape((17, 3))(landmarks_and_scores)
    landmarks = normalize_pose_landmarks(reshaped_inputs[:, :, :2])
    embedding = keras.layers.Flatten()(landmarks)
    return embedding

def preprocess_data(X_train):
    processed_X_train = []
    for i in range(X_train.shape[0]):
        embedding = landmarks_to_embedding(tf.reshape(tf.convert_to_tensor(X_train.iloc[i]), (1, 51)))
        processed_X_train.append(tf.reshape(embedding, (34)))
    return tf.convert_to_tensor(processed_X_train)

def main():
    # Load and preprocess data
    X, y, class_no, class_names = load_csv('train_data.csv')  # Updated to unpack four values
    X_train, X_val, y_train, y_val, class_no_train, class_no_val = train_test_split(X, y, class_no, test_size=0.15)
    X_test, y_test, class_no_test, _ = load_csv('test_data.csv')

    # Preprocess feature data for training, validation, and test sets
    processed_X_train = preprocess_data(X_train)
    processed_X_val = preprocess_data(X_val)
    processed_X_test = preprocess_data(X_test)

    # Create model
    inputs = tf.keras.Input(shape=(34))
    layer = keras.layers.Dense(128, activation=tf.nn.relu6)(inputs)
    layer = keras.layers.Dropout(0.5)(layer)
    layer = keras.layers.Dense(64, activation=tf.nn.relu6)(layer)
    layer = keras.layers.Dropout(0.5)(layer)
    outputs = keras.layers.Dense(len(class_names), activation="softmax")(layer)

    model = keras.Model(inputs, outputs)

    model.compile(
        optimizer='adam',
        loss='categorical_crossentropy',
        metrics=['accuracy']
    )

    # Callbacks
    checkpoint_path = "weights.best.hdf5"
    checkpoint = keras.callbacks.ModelCheckpoint(
        checkpoint_path,
        monitor='val_accuracy',
        verbose=1,
        save_best_only=True,
        mode='max'
    )
    earlystopping = keras.callbacks.EarlyStopping(
        monitor='val_accuracy',
        patience=20
    )

    # Training
    print('--------------TRAINING----------------')
    history = model.fit(
        processed_X_train, y_train,
        epochs=200,
        batch_size=16,
        validation_data=(processed_X_val, y_val),
        callbacks=[checkpoint, earlystopping]
    )

    # Evaluation
    print('-----------------EVALUATION----------------')
    loss, accuracy = model.evaluate(processed_X_test, y_test)
    print('LOSS: ', loss)
    print('ACCURACY: ', accuracy)

    # Save model
    model.save('keras_model')
    print('Model saved as keras_model')

if __name__ == "__main__":
    main()
