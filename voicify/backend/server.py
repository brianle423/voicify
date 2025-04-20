# # backend/server.py

# from fastapi import FastAPI
# from fastapi.middleware.cors import CORSMiddleware
# from pydantic import BaseModel
# from .predict import predict_from_landmarks

# app = FastAPI()

# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["*"],
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# class Landmarks(BaseModel):
#     landmarks: list[list[float]]

# @app.post("/predict")
# def predict(landmarks: Landmarks):
#     prediction = predict_from_landmarks(landmarks.landmarks)
#     return {"prediction": prediction}


# from fastapi import FastAPI
# from fastapi.middleware.cors import CORSMiddleware
# from pydantic import BaseModel
# from backend.predict import predict_from_landmarks  # no dot if in same folder

# app = FastAPI()

# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["*"],  # or restrict to localhost:3000
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# class Landmarks(BaseModel):
#     landmarks: list[list[float]]  # [[x1, y1], [x2, y2], ..., [x21, y21]]

# @app.post("/predict")
# def predict(landmarks: Landmarks):
#     prediction = predict_from_landmarks(landmarks.landmarks)
#     return {"prediction": prediction}


# from fastapi import FastAPI
# from fastapi.middleware.cors import CORSMiddleware
# import os

# app = FastAPI()

# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["*"],  # Allow React to access
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# @app.get("/latest")
# def get_latest_prediction():
#     try:
#         with open("backend/saved_word.txt", "r") as f:
#             word = f.read()
#     except FileNotFoundError:
#         word = ""
#     return {"word": word}

# from fastapi.responses import StreamingResponse
# import cv2

# cap = cv2.VideoCapture(0)

# def generate_video():
#     while True:
#         ret, frame = cap.read()
#         if not ret:
#             continue

#         # TODO: Add any OpenCV processing here
#         # e.g., draw landmarks, overlay predictions, etc.

#         _, jpeg = cv2.imencode('.jpg', frame)
#         frame_bytes = jpeg.tobytes()

#         yield (b'--frame\r\n'
#                b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')

# @app.get("/video")
# def video_feed():
#     return StreamingResponse(generate_video(), media_type="multipart/x-mixed-replace; boundary=frame")

# from fastapi import FastAPI
# from fastapi.middleware.cors import CORSMiddleware
# from fastapi.responses import StreamingResponse, JSONResponse
# import cv2
# import threading

# app = FastAPI()

# # Allow CORS for all origins (for React access)
# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["*"],
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# # --- Globals to control camera stream ---
# camera_active = False
# cap = None
# lock = threading.Lock()

# @app.get("/latest")
# def get_latest_prediction():
#     try:
#         with open("backend/saved_word.txt", "r") as f:
#             word = f.read()
#     except FileNotFoundError:
#         word = ""
#     return {"word": word}

# def generate_video():
#     global cap
#     while camera_active:
#         with lock:
#             ret, frame = cap.read()
#             if not ret:
#                 continue

#             # OPTIONAL: Add processing logic here

#             _, jpeg = cv2.imencode('.jpg', frame)
#             frame_bytes = jpeg.tobytes()

#         yield (b'--frame\r\n'
#                b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')
#     # Clean up
#     if cap:
#         cap.release()

# @app.get("/video")
# def video_feed():
#     if not camera_active:
#         return JSONResponse(status_code=400, content={"error": "Camera is off"})
#     return StreamingResponse(generate_video(), media_type="multipart/x-mixed-replace; boundary=frame")

# @app.post("/toggle")
# def toggle_camera():
#     global camera_active, cap

#     camera_active = not camera_active

#     if camera_active:
#         cap = cv2.VideoCapture(0)
#     else:
#         if cap:
#             cap.release()
#             cap = None

#     return {"camera_active": camera_active}

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from camera_predict import generate_video_stream  # Import your video generator

app = FastAPI()

# CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all for development, restrict in prod
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Endpoint to return the current word
@app.get("/latest")
def get_latest_prediction():
    try:
        with open("backend/saved_word.txt", "r") as f:
            word = f.read()
    except FileNotFoundError:
        word = ""
    return {"word": word}

# Video feed endpoint with OpenCV/MediaPipe inference overlay
@app.get("/video")
def video_feed():
    return StreamingResponse(generate_video_stream(), media_type="multipart/x-mixed-replace; boundary=frame")

