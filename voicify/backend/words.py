"""This module provides functionality for gesture recognition using MediaPipe and LSTM neural networks.
It includes functions for collecting keypoint data, preprocessing it, training a model, and running ASL gesture 
detection in real-time for English words."""

import os
import cv2  # OpenCV for image processing
import mediapipe as mp  # MediaPipe for pose detection
import numpy as np
from matplotlib import pyplot as plt
from tensorflow.keras.utils import to_categorical
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense
from tensorflow.keras.callbacks import TensorBoard
from sklearn.metrics import multilabel_confusion_matrix, accuracy_score

# Initialize MediaPipe models
mp_holistic = mp.solutions.holistic  # Holistic model
mp_drawing = mp.solutions.drawing_utils  # Drawing utilities

def mediapipe_detection(image, model):
    """
    Perform mediapipe detection on the given image using the specified model.

    Args:
        image (numpy.ndarray): The input image for detection.
        model: The mediapipe model to use for detection.

    Returns:
        results: The results of the mediapipe detection.
    """
    
    image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)  # COLOR CONVERSION BGR 2 RGB
    image.flags.writeable = False                   # Image is no longer writeable
    results = model.process(image)                  # Make prediction
    image.flags.writeable = True                    # Image is now writeable 
    image = cv2.cvtColor(image, cv2.COLOR_RGB2BGR)  # COLOR COVERSION RGB 2 BGR
    return image, results

def draw_landmarks(image, results):
    # mp_drawing.draw_landmarks(image, results.face_landmarks, mp_holistic.FACE_CONNECTIONS) # Draw face connections
    mp_drawing.draw_landmarks(image, results.pose_landmarks, mp_holistic.POSE_CONNECTIONS) # Draw pose connections
    mp_drawing.draw_landmarks(image, results.left_hand_landmarks, mp_holistic.HAND_CONNECTIONS) # Draw left hand connections
    mp_drawing.draw_landmarks(image, results.right_hand_landmarks, mp_holistic.HAND_CONNECTIONS) # Draw right hand connections

def draw_styled_landmarks(image, results):
    """
    Draws styled landmarks on the image using MediaPipe drawing utilities.
    Args:
        image (numpy.ndarray): The input image on which to draw landmarks.
        results: The results from the MediaPipe model containing landmarks.
    """

    # Draw pose connections
    mp_drawing.draw_landmarks(image, results.pose_landmarks, mp_holistic.POSE_CONNECTIONS,
                             mp_drawing.DrawingSpec(color=(80,22,10), thickness=2, circle_radius=4), 
                             mp_drawing.DrawingSpec(color=(80,44,121), thickness=2, circle_radius=2)
                             ) 
    # Draw left hand connections
    mp_drawing.draw_landmarks(image, results.left_hand_landmarks, mp_holistic.HAND_CONNECTIONS, 
                             mp_drawing.DrawingSpec(color=(121,22,76), thickness=2, circle_radius=4), 
                             mp_drawing.DrawingSpec(color=(121,44,250), thickness=2, circle_radius=2)
                             ) 
    # Draw right hand connections  
    mp_drawing.draw_landmarks(image, results.right_hand_landmarks, mp_holistic.HAND_CONNECTIONS, 
                             mp_drawing.DrawingSpec(color=(245,117,66), thickness=2, circle_radius=4), 
                             mp_drawing.DrawingSpec(color=(245,66,230), thickness=2, circle_radius=2)
                             )

def extract_keypoints(results):
    """ Extracts keypoints from MediaPipe results.
    Args:
        results: The results from the MediaPipe model containing landmarks.
    Returns:
        numpy.ndarray: A flattened array of keypoints for pose, face, left hand, and right hand.
    """
    
    # Extract keypoints from the results
    pose = np.array([[res.x, res.y, res.z, res.visibility] for res in results.pose_landmarks.landmark]).flatten() if results.pose_landmarks else np.zeros(33*4)
    face = np.array([[res.x, res.y, res.z] for res in results.face_landmarks.landmark]).flatten() if results.face_landmarks else np.zeros(468*3)
    lh = np.array([[res.x, res.y, res.z] for res in results.left_hand_landmarks.landmark]).flatten() if results.left_hand_landmarks else np.zeros(21*3)
    rh = np.array([[res.x, res.y, res.z] for res in results.right_hand_landmarks.landmark]).flatten() if results.right_hand_landmarks else np.zeros(21*3)
    return np.concatenate([pose, face, lh, rh])

def setup_folders_for_collection(data_path, actions, no_sequences, sequence_length):
    # Make sure the base directory exists
    if not os.path.exists(data_path):
        os.makedirs(data_path)
        
    for action in actions: 
        action_path = os.path.join(data_path, action)

        # Make sure the action directory exists
        if not os.path.exists(action_path):
            os.makedirs(action_path)
            dirmax = 0
        else:
            # Get all subdirectories (as integers), or set dirmax = 0 if empty
            dirnames = os.listdir(action_path)
            if dirnames:
                dirmax = np.max(np.array(dirnames).astype(int))
            else:
                dirmax = 0

        # Create new sequence directories
        for sequence in range(1, no_sequences + 1):
            try: 
                os.makedirs(os.path.join(action_path, str(dirmax + sequence)))
            except FileExistsError:
                pass

def collect_keypoint_data(data_path, actions, no_sequences, sequence_length, start_folder=1):
    cap = cv2.VideoCapture(0)
    # Set mediapipe model with explicit parameters to fix errors
    with mp_holistic.Holistic(
        min_detection_confidence=0.5, 
        min_tracking_confidence=0.5,
        model_complexity=1,
        smooth_landmarks=True,
        enable_segmentation=False,
        smooth_segmentation=True,
        refine_face_landmarks=False
    ) as holistic:
        
        # Loop through actions
        for action in actions:
            # Loop through sequences aka videos
            for sequence in range(start_folder, start_folder+no_sequences):
                # Loop through video length aka sequence length
                for frame_num in range(sequence_length):

                    # Read feed
                    ret, frame = cap.read()

                    # Make detections
                    image, results = mediapipe_detection(frame, holistic)

                    # Draw landmarks
                    draw_styled_landmarks(image, results)
                    
                    # Apply wait logic
                    if frame_num == 0: 
                        cv2.putText(image, 'STARTING COLLECTION', (120,200), 
                                   cv2.FONT_HERSHEY_SIMPLEX, 1, (0,255, 0), 4, cv2.LINE_AA)
                        cv2.putText(image, 'Collecting frames for {} Video Number {}'.format(action, sequence), (15,12), 
                                   cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 0, 255), 1, cv2.LINE_AA)
                        # Show to screen
                        cv2.imshow('OpenCV Feed', image)
                        cv2.waitKey(500)
                    else: 
                        cv2.putText(image, 'Collecting frames for {} Video Number {}'.format(action, sequence), (15,12), 
                                   cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 0, 255), 1, cv2.LINE_AA)
                        # Show to screen
                        cv2.imshow('OpenCV Feed', image)
                    
                    # Export keypoints
                    keypoints = extract_keypoints(results)
                    npy_path = os.path.join(data_path, action, str(sequence), str(frame_num))
                    np.save(npy_path, keypoints)

                    # Break gracefully
                    if cv2.waitKey(10) & 0xFF == ord('q'):
                        break
                        
        cap.release()
        cv2.destroyAllWindows()

def preprocess_data(data_path, actions, sequence_length):
    """ Preprocesses the collected keypoint data for training.
    Args:
        data_path (str): Path to the directory containing the action folders.
        actions (list): List of action labels.
        sequence_length (int): Length of each sequence (number of frames).
    Returns:
        X (numpy.ndarray): Preprocessed input data of shape (num_sequences, sequence_length, num_features).
        y (numpy.ndarray): Preprocessed labels of shape (num_sequences, num_classes).
        label_map (dict): Mapping of action labels to numerical values.
    """

    label_map = {label:num for num, label in enumerate(actions)}
    
    sequences, labels = [], []
    for action in actions:
        for sequence in np.array(os.listdir(os.path.join(data_path, action))).astype(int):
            window = []
            for frame_num in range(sequence_length):
                res = np.load(os.path.join(data_path, action, str(sequence), "{}.npy".format(frame_num)))
                window.append(res)
            sequences.append(window)
            labels.append(label_map[action])
    
    X = np.array(sequences)
    y = to_categorical(labels).astype(int)
    
    return X, y, label_map

def create_model(input_shape, num_actions):
    """ Creates a Sequential LSTM model for gesture recognition.
    Args:
        input_shape (tuple): The shape of the input data (sequence_length, num_features).
        num_actions (int): The number of unique actions (classes).
    Returns:
        model: A compiled Keras Sequential model.
    """

    model = Sequential()
    model.add(LSTM(64, return_sequences=True, activation='relu', input_shape=input_shape))
    model.add(LSTM(128, return_sequences=True, activation='relu'))
    model.add(LSTM(64, return_sequences=False, activation='relu'))
    model.add(Dense(64, activation='relu'))
    model.add(Dense(32, activation='relu'))
    model.add(Dense(num_actions, activation='softmax'))
    
    model.compile(optimizer='Adam', loss='categorical_crossentropy', metrics=['categorical_accuracy'])
    
    return model

def train_model(model, X_train, y_train, log_dir='Logs', epochs=1500):
    tb_callback = TensorBoard(log_dir=log_dir)
    model.fit(X_train, y_train, epochs=epochs, callbacks=[tb_callback])
    
    return model

def evaluate_model(model, X_test, y_test):
    yhat = model.predict(X_test)
    
    ytrue = np.argmax(y_test, axis=1).tolist()
    yhat = np.argmax(yhat, axis=1).tolist()
    
    print("Confusion Matrix:")
    print(multilabel_confusion_matrix(ytrue, yhat))
    
    print("Accuracy:", accuracy_score(ytrue, yhat))
    
    return ytrue, yhat

def prob_viz(res, actions, input_frame, colors):
    """ Visualizes the probabilities of each action in the input frame.
    Args:
        res (numpy.ndarray): The predicted probabilities for each action.
        actions (numpy.ndarray): Array of action labels.
        input_frame (numpy.ndarray): The input frame on which to draw the probabilities.
        colors (list): List of colors for each action.
    Returns:
        numpy.ndarray: The input frame with drawn probabilities."""
    
    output_frame = input_frame.copy()
    for num, prob in enumerate(res):
        cv2.rectangle(output_frame, (0,60+num*40), (int(prob*100), 90+num*40), colors[num], -1)
        cv2.putText(output_frame, actions[num], (0, 85+num*40), cv2.FONT_HERSHEY_SIMPLEX, 1, (255,255,255), 2, cv2.LINE_AA)
        
    return output_frame

def run_gesture_detection(model_path, actions):
    """ Runs real-time gesture detection using a pre-trained model.
    Args:
        model_path (str): Path to the pre-trained model weights.
        actions (numpy.ndarray): Array of action labels.
    """

    colors = [
        (245,117,16),   # orange
        (117,245,16),   # green
        (16,117,245),   # blue
        (255, 0, 127),  # pink
        (0, 255, 255)   # cyan
    ]
    
    # Load the model
    model = Sequential()
    model.add(LSTM(64, return_sequences=True, activation='relu', input_shape=(30,1662)))
    model.add(LSTM(128, return_sequences=True, activation='relu'))
    model.add(LSTM(64, return_sequences=False, activation='relu'))
    model.add(Dense(64, activation='relu'))
    model.add(Dense(32, activation='relu'))
    model.add(Dense(actions.shape[0], activation='softmax'))
    
    model.load_weights(model_path)
    
    # Detection variables
    sequence = []
    sentence = []
    predictions = []
    threshold = 0.5
    actions_on_screen = []

    cap = cv2.VideoCapture(0)

    try:
        # Set mediapipe model with explicit parameters to fix errors
        with mp_holistic.Holistic(
            min_detection_confidence=0.5, 
            min_tracking_confidence=0.5,
            model_complexity=1,
            smooth_landmarks=True,
            enable_segmentation=False,
            smooth_segmentation=True,
            refine_face_landmarks=False
        ) as holistic:
            while cap.isOpened():

                # Read feed
                ret, frame = cap.read()

                if not ret:
                    print("Failed to grab frame")
                    break

                # Make detections
                image, results = mediapipe_detection(frame, holistic)
                
                # Draw landmarks
                draw_styled_landmarks(image, results)
                
                # Prediction logic
                keypoints = extract_keypoints(results)
                sequence.append(keypoints)
                sequence = sequence[-30:]
                
                if len(sequence) == 30:
                    res = model.predict(np.expand_dims(sequence, axis=0))[0]
                    predicted_action = actions[np.argmax(res)]
                    predictions.append(np.argmax(res))
                    
                    # Viz logic
                    if np.unique(predictions[-10:])[0]==np.argmax(res): 
                        if res[np.argmax(res)] > threshold: 
                            
                            predicted_action = actions[np.argmax(res)]

                            if predicted_action != "stationary":
                                if len(sentence) > 0:
                                    if predicted_action != sentence[-1]:
                                        sentence.append(predicted_action)
                                else:
                                    sentence.append(predicted_action)

                                if predicted_action not in actions_on_screen:
                                    actions_on_screen.append(predicted_action)

                    if len(sentence) > 5: 
                        sentence = sentence[-5:]

                    # Viz probabilities
                    image = prob_viz(res, actions, image, colors)
                    
                cv2.rectangle(image, (0,0), (640, 40), (245, 117, 16), -1)
                cv2.putText(image, ' '.join(sentence), (3,30), 
                            cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 255, 255), 2, cv2.LINE_AA)
                
                # Show to screen
                cv2.imshow('OpenCV Feed', image)

                # Break gracefully
                if cv2.waitKey(10) & 0xFF == ord('q'):
                    break
            
            cap.release()
            cv2.destroyAllWindows()

            # ✅ Now this will run safely
            with open("./recognized_words.txt", "w") as f:
                f.write(','.join(sentence))

    except Exception as e:
        print(f"An error occurred: {e}")
        cap.release()
        cv2.destroyAllWindows()

def main():
    """ Main function to run the gesture detection pipeline.
    It sets up the data collection, preprocessing, model training, and real-time detection.
    """
    
    ACTIONS = np.array(['stationary', 'hello', "i'm", "fine", "how are you"])
    run_gesture_detection('./models/stationary.h5', ACTIONS)

if __name__ == "__main__":
    main()

