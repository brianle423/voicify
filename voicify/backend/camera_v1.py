# imports
import os
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3' 
import pandas as pd
import tensorflow as tf
import cv2
import mediapipe as mp
from keras.models import load_model

import numpy as np
import time


model = load_model('sl_letters.h5') # trained cnn model on sign language mnist dataset


mphands = mp.solutions.hands
hands = mphands.Hands()
mp_drawing = mp.solutions.drawing_utils

cap = cv2.VideoCapture(0)
_, frame = cap.read()
h, w, c = frame.shape

analysis_frame = ''
letter_pred = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y']

while True: 
    _, frame = cap.read()

    k = cv2.waitKey(1)
    if k % 256 == 27:
        # quits when ESC key is pressed
        print("Escape hit, closing...")
        break

    elif k % 256 == 32:
        # captures frame to process when SPACE is pressed
        analysis_frame = frame
        showframe = analysis_frame
        cv2.imshow("Frame", showframe)
        frame_rgb_analysis = cv2.cvtColor(analysis_frame, cv2.COLOR_BGR2RGB)
        result_analysis = hands.process(frame_rgb_analysis)

        hand_landmarks_analysis = result_analysis.multi_hand_landmarks # extract hand landmarks
        if hand_landmarks_analysis: # if hand detected
            for handLMs_analysis in hand_landmarks_analysis: # loops thru each hand for bounding box
                x_max = 0
                y_max = 0
                x_min = w
                y_min = h
                for lm_analysis in handLMs_analysis.landmark: 
                    x, y = int(lm_analysis.x * w), int(lm_analysis.y * h)
                    # updates bounding box to wrap around hand based on landmark positions
                    x_max, x_min = max(x, x_max), min(x, x_min)
                    y_max, y_min = max(y, y_max), min(y, y_min)
                
                # calculate dynamic padding and clip the box
                box_width = x_max - x_min
                box_height = y_max - y_min
                pad = int(0.3 * max(box_width, box_height))

                x_min -= pad
                x_max += pad
                y_min -= pad
                y_max += pad

                x_min = max(0, x_min)
                y_min = max(0, y_min)
                x_max = min(w, x_max)
                y_max = min(h, y_max)

        analysis_frame = cv2.cvtColor(analysis_frame, cv2.COLOR_BGR2GRAY) # convert back to grayscale
        analysis_frame = analysis_frame[y_min:y_max, x_min:x_max] # crop image using bounding box to only get hand
        analysis_frame = cv2.resize(analysis_frame, (28,28))

        # # process image for cnn model
        # n_list = analysis_frame.flatten().tolist()

        # data_n = pd.DataFrame(n_list).T
        # data_n.columns = list(range(784))
        # test = data_n.values

        blur = cv2.GaussianBlur(analysis_frame, (3, 3), 0)
        _, binary = cv2.threshold(blur, 100, 255, cv2.THRESH_BINARY)
        normalized = binary / 255.0
        reshaped = normalized.reshape(1, 28, 28, 1)

        cv2.imshow("Processed Frame", (reshaped[0, :, :, 0] * 255).astype("uint8"))
        pred = model.predict(reshaped)
        pred_arr = np.array(pred[0])

        top3 = np.argsort(pred_arr)[-3:][::-1]  # indices of top 3
        for i, idx in enumerate(top3):
            print(f"Predicted Character {i+1}: {letter_pred[idx]}")
            print(f"Confidence {i+1}: {100 * pred_arr[idx]:.2f}%")
        time.sleep(5)


    framergb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    result = hands.process(framergb)
    hand_landmarks = result.multi_hand_landmarks
    if hand_landmarks:
        for handLMs in hand_landmarks:
            x_max = 0
            y_max = 0
            x_min = w
            y_min = h
            for lm in handLMs.landmark:
                x, y = int(lm.x * w), int(lm.y * h)
                x_max, x_min = max(x, x_max), min(x, x_min)
                y_max, y_min = max(y, y_max), min(y, y_min)
                # Calculate dynamic padding and clip the box
            box_width = x_max - x_min
            box_height = y_max - y_min
            pad = int(0.3 * max(box_width, box_height))

            x_min -= pad
            x_max += pad
            y_min -= pad
            y_max += pad

            x_min = max(0, x_min)
            y_min = max(0, y_min)
            x_max = min(w, x_max)
            y_max = min(h, y_max)
            cv2.rectangle(frame, (x_min, y_min), (x_max, y_max), (0, 255, 0), 2) # draws bounding box around hand
            mp_drawing.draw_landmarks(frame, handLMs, mphands.HAND_CONNECTIONS) # draws hand connections
    cv2.imshow("Frame", frame)

cap.release()
cv2.destroyAllWindows()