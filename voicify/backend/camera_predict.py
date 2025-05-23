import pickle
import cv2
import mediapipe as mp
import numpy as np
from collections import deque, Counter
import requests
import os

# --- Setup ---
current_detected_sign = ""
prediction_window = deque(maxlen=15)

backend_dir = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(backend_dir, 'model_v2.p')

# Load model
model_dict = pickle.load(open(MODEL_PATH, 'rb'))
model = model_dict['model']

# MediaPipe and OpenCV setup
cap = cv2.VideoCapture(0)
mp_hands = mp.solutions.hands
mp_drawing = mp.solutions.drawing_utils
mp_drawing_styles = mp.solutions.drawing_styles
hands = mp_hands.Hands(static_image_mode=True, min_detection_confidence=0.3)

label_dict = {
    0: 'A', 1: 'B', 2: 'C', 3: 'D', 4: 'E', 5: 'F', 6: 'G', 7: 'H',
    8: 'I', 9: 'J', 10: 'K', 11: 'L', 12: 'M', 13: 'N', 14: 'O', 15: 'P',
    16: 'Q', 17: 'R', 18: 'S', 19: 'T', 20: 'U', 21: 'V', 22: 'W', 23: 'X',
    24: 'Y', 25: 'Z', 26: 'delete', 27: 'space'
}

USE_SERVER = False
SERVER_URL = "http://localhost:8000"

# --- Video Stream Generator ---
def generate_video_stream():
    global current_word, USE_SERVER
#    cap = cv2.VideoCapture(0, cv2.CAP_DSHOW)

    if not cap.isOpened():
        print("❌ Cannot open webcam.")
        return
    
    print("🚀 Starting video stream...")
    while True:
        ret, frame = cap.read()
        if not ret:
            continue

        H, W, _ = frame.shape
        frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        results = hands.process(frame_rgb)

        stable_prediction = None
        stability_ratio = 0

        if results.multi_hand_landmarks:
            hand_landmarks = results.multi_hand_landmarks[0]

            mp_drawing.draw_landmarks(
                frame,
                hand_landmarks,
                mp_hands.HAND_CONNECTIONS,
                mp_drawing_styles.get_default_hand_landmarks_style(),
                mp_drawing_styles.get_default_hand_connections_style()
            )

            x_ = [lm.x for lm in hand_landmarks.landmark]
            y_ = [lm.y for lm in hand_landmarks.landmark]

            data_aux = [(lm.x - min(x_), lm.y - min(y_)) for lm in hand_landmarks.landmark]
            data_aux_flat = [val for pair in data_aux for val in pair]

            if len(data_aux_flat) == 42:
                prediction = model.predict([np.asarray(data_aux_flat)])
                predicted_character = label_dict[int(prediction[0])]

                prediction_window.append(predicted_character)

                if len(prediction_window) == prediction_window.maxlen:
                    most_common, count = Counter(prediction_window).most_common(1)[0]
                    stable_prediction = most_common
                    stability_ratio = count / prediction_window.maxlen

                # Draw box and prediction
                x1 = int(min(x_) * W) - 10
                y1 = int(min(y_) * H) - 10
                x2 = int(max(x_) * W) + 10
                y2 = int(max(y_) * H) + 10

                cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 0, 0), 4)
                cv2.putText(frame, predicted_character, (x1, y1 - 10),
                            cv2.FONT_HERSHEY_SIMPLEX, 1.3, (0, 0, 0), 3, cv2.LINE_AA)

                # Draw progress bar
                bar_x, bar_y = 10, H - 20
                bar_width, bar_height = 300, 15
                progress_ratio = stability_ratio
                bar_color = (0, 255, 0)
                if progress_ratio >= 0.8:
                    bar_color = (255, 0, 0)

                cv2.rectangle(frame, (bar_x, bar_y), (bar_x + bar_width, bar_y + bar_height), (255, 255, 255), 2)
                cv2.rectangle(frame,
                              (bar_x, bar_y),
                              (bar_x + int(bar_width * progress_ratio), bar_y + bar_height),
                              bar_color,
                              -1)
                cv2.putText(frame, f"Stability: {int(progress_ratio * 100)}%", (bar_x, bar_y - 10),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 2)
                
                # write current letter to current_sign.txt if progress bar is at 100%
                global current_detected_sign
                if stable_prediction and stability_ratio >= 0.8:
                    current_detected_sign = stable_prediction
                

        _, jpeg = cv2.imencode('.jpg', frame)
        frame_bytes = jpeg.tobytes()

        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')