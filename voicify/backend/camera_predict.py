# import pickle
# import cv2
# import mediapipe as mp
# import numpy as np
# from collections import deque, Counter
# import requests
# import time
# import os

# # State tracking
# current_word = ""
# prediction_window = deque(maxlen=15)

# # Load model
# model_dict = pickle.load(open('backend/model_v2.p', 'rb'))
# model = model_dict['model']

# # Webcam and MediaPipe setup
# cap = cv2.VideoCapture(0)
# mp_hands = mp.solutions.hands
# mp_drawing = mp.solutions.drawing_utils
# mp_drawing_styles = mp.solutions.drawing_styles
# hands = mp_hands.Hands(static_image_mode=True, min_detection_confidence=0.3)

# # Label mapping
# label_dict = {
#     0: 'A', 1: 'B', 2: 'C', 3: 'D', 4: 'E', 5: 'F', 6: 'G', 7: 'H',
#     8: 'I', 9: 'J', 10: 'K', 11: 'L', 12: 'M', 13: 'N', 14: 'O', 15: 'P',
#     16: 'Q', 17: 'R', 18: 'S', 19: 'T', 20: 'U', 21: 'V', 22: 'W', 23: 'X',
#     24: 'Y', 25: 'Z', 26: 'delete', 27: 'space'
# }

# # Server URL - change this if your server runs on a different host/port
# SERVER_URL = "http://localhost:8000"

# # Whether to use the server for predictions (True) or local model (False)
# USE_SERVER = True

# # Try to load initial word from file
# try:
#     with open("backend/saved_word.txt", "r") as f:
#         current_word = f.read()
# except FileNotFoundError:
#     # Create the file if it doesn't exist
#     with open("backend/saved_word.txt", "w") as f:
#         f.write(current_word)

# while True:
#     ret, frame = cap.read()
#     if not ret:
#         print("Failed to grab frame")
#         break

#     H, W, _ = frame.shape
#     frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
#     results = hands.process(frame_rgb)

#     stable_prediction = None
#     stability_ratio = 0
    
#     if results.multi_hand_landmarks:
#         # Only process the first detected hand
#         hand_landmarks = results.multi_hand_landmarks[0]

#         mp_drawing.draw_landmarks(
#             frame,
#             hand_landmarks,
#             mp_hands.HAND_CONNECTIONS,
#             mp_drawing_styles.get_default_hand_landmarks_style(),
#             mp_drawing_styles.get_default_hand_connections_style()
#         )

#         x_ = [lm.x for lm in hand_landmarks.landmark]
#         y_ = [lm.y for lm in hand_landmarks.landmark]
        
#         if USE_SERVER:
#             # Use server for prediction
#             try:
#                 # Extract landmarks
#                 landmarks = []
#                 for lm in hand_landmarks.landmark:
#                     landmarks.append([lm.x, lm.y])
                
#                 # Send to server
#                 response = requests.post(
#                     f"{SERVER_URL}/predict",
#                     json={"landmarks": landmarks},
#                     timeout=0.5  # Short timeout to avoid hanging
#                 )
                
#                 if response.status_code == 200:
#                     prediction_data = response.json()
#                     predicted_character = prediction_data["character"]
#                     stability_ratio = prediction_data["stability"]
#                     stable_prediction = predicted_character if prediction_data["is_stable"] else None
#                 else:
#                     print(f"Server error: {response.status_code}")
#                     # Fall back to local prediction
#                     USE_SERVER = False
#             except requests.exceptions.RequestException as e:
#                 print(f"Server communication error: {e}")
#                 # Fall back to local prediction
#                 USE_SERVER = False
        
#         # Use local prediction as fallback
#         if not USE_SERVER:
#             data_aux = [(lm.x - min(x_), lm.y - min(y_)) for lm in hand_landmarks.landmark]
#             data_aux_flat = [val for pair in data_aux for val in pair]

#             if len(data_aux_flat) == 42:
#                 prediction = model.predict([np.asarray(data_aux_flat)])
#                 predicted_character = label_dict[int(prediction[0])]

#                 prediction_window.append(predicted_character)

#                 # Only start voting after window is filled
#                 if len(prediction_window) == prediction_window.maxlen:
#                     most_common, count = Counter(prediction_window).most_common(1)[0]
#                     stable_prediction = most_common
#                     stability_ratio = count / prediction_window.maxlen
#                 else:
#                     stable_prediction = None
#                     stability_ratio = len(prediction_window) / prediction_window.maxlen

#         # Bounding box
#         x1 = int(min(x_) * W) - 10
#         y1 = int(min(y_) * H) - 10
#         x2 = int(max(x_) * W) + 10
#         y2 = int(max(y_) * H) + 10

#         # Draw bounding box and prediction
#         cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 0, 0), 4)
        
#         # Show the predicted character
#         if USE_SERVER:
#             cv2.putText(frame, predicted_character, (x1, y1 - 10),
#                         cv2.FONT_HERSHEY_SIMPLEX, 1.3, (0, 0, 0), 3, cv2.LINE_AA)
#         else:
#             cv2.putText(frame, predicted_character, (x1, y1 - 10),
#                         cv2.FONT_HERSHEY_SIMPLEX, 1.3, (0, 0, 0), 3, cv2.LINE_AA)
        
#         # progress bar
#         progress_ratio = stability_ratio
#         bar_x, bar_y = 10, H - 20
#         bar_width, bar_height = 300, 15

#         # Draw border
#         cv2.rectangle(frame, (bar_x, bar_y), (bar_x + bar_width, bar_y + bar_height), (255, 255, 255), 2)

#         # Change color if full
#         bar_color = (0, 255, 0)  # green
#         if progress_ratio >= 1.0 or progress_ratio >= 0.8:
#             bar_color = (255, 0, 0)  # blue when stable

#         # Draw fill
#         cv2.rectangle(frame,
#                     (bar_x, bar_y),
#                     (bar_x + int(bar_width * progress_ratio), bar_y + bar_height),
#                     bar_color,
#                     -1)

#         # Optional: label
#         cv2.putText(frame,
#                     f"Stability: {int(progress_ratio * 100)}%",
#                     (bar_x, bar_y - 10),
#                     cv2.FONT_HERSHEY_SIMPLEX,
#                     0.6,
#                     (255, 255, 255),
#                     2)
    
#     # Display current word
#     cv2.putText(frame, 
#                 f"Current word: {current_word}",
#                 (10, 30),
#                 cv2.FONT_HERSHEY_SIMPLEX,
#                 0.8,
#                 (255, 255, 255),
#                 2)
    
#     # Display connection status
#     status_text = "Server: Connected" if USE_SERVER else "Server: Local mode"
#     cv2.putText(frame, 
#                 status_text,
#                 (W - 200, 30),
#                 cv2.FONT_HERSHEY_SIMPLEX,
#                 0.6,
#                 (255, 255, 255),
#                 2)

#     cv2.imshow('ASL Detection', frame)
#     k = cv2.waitKey(1)

#     if k % 256 == 27:  # ESC to quit
#         print("Escape hit, closing...")
#         break
#     elif k % 256 == 13:  # ENTER key
#         if stability_ratio >= 0.8:  # e.g., 12 out of 15 frames
#             if USE_SERVER:
#                 try:
#                     # Use server to add character
#                     response = requests.post(
#                         f"{SERVER_URL}/add-character",
#                         json={"character": stable_prediction},
#                         timeout=0.5
#                     )
#                     if response.status_code == 200:
#                         result = response.json()
#                         current_word = result["current_word"]
#                         print(f"✅ Added via server: {stable_prediction}")
#                     else:
#                         print(f"Server error: {response.status_code}")
#                         # Fall back to local processing
#                         if stable_prediction == 'space':
#                             current_word += ' '
#                         elif stable_prediction == 'delete':
#                             current_word = current_word[:-1]
#                         else:
#                             current_word += stable_prediction
#                         with open("backend/saved_word.txt", "w") as f:
#                             f.write(current_word)
#                         print(f"✅ Added locally: {stable_prediction}")
#                 except requests.exceptions.RequestException:
#                     # Fall back to local processing
#                     if stable_prediction == 'space':
#                         current_word += ' '
#                     elif stable_prediction == 'delete':
#                         current_word = current_word[:-1]
#                     else:
#                         current_word += stable_prediction
#                     with open("backend/saved_word.txt", "w") as f:
#                         f.write(current_word)
#                     print(f"✅ Added locally: {stable_prediction}")
#             else:
#                 # Local processing
#                 if stable_prediction == 'space':
#                     current_word += ' '
#                 elif stable_prediction == 'delete':
#                     current_word = current_word[:-1]
#                 else:
#                     current_word += stable_prediction
#                 with open("backend/saved_word.txt", "w") as f:
#                     f.write(current_word)
#                 print(f"✅ Added locally: {stable_prediction}")
            
#             # Reset prediction window
#             prediction_window.clear()
#             if USE_SERVER:
#                 try:
#                     requests.post(f"{SERVER_URL}/reset", timeout=0.5)
#                 except:
#                     pass
#         else:
#             print("⚠️ Prediction not stable enough to accept")
#     elif k % 256 == 99:  # 'c' key to clear word
#         current_word = ""
#         with open("backend/saved_word.txt", "w") as f:
#             f.write("")
#         print("🧹 Word cleared")
#         if USE_SERVER:
#             try:
#                 requests.post(f"{SERVER_URL}/clear-word", timeout=0.5)
#             except:
#                 pass
#     elif k % 256 == 115:  # 's' key to toggle server/local mode
#         USE_SERVER = not USE_SERVER
#         print(f"🔄 Switched to {'server' if USE_SERVER else 'local'} mode")

# cap.release()
# cv2.destroyAllWindows()

import pickle
import cv2
import mediapipe as mp
import numpy as np
from collections import deque, Counter
import requests

# --- Setup ---
current_word = ""
prediction_window = deque(maxlen=15)

# Load model
model_dict = pickle.load(open('/Users/Brian/PycharmProjects/Voicify/voicify/voicify/backend/model_v2.p', 'rb'))
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

        _, jpeg = cv2.imencode('.jpg', frame)
        frame_bytes = jpeg.tobytes()

        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')