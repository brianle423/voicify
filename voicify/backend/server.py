# backend/server.py

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from .predict import predict_from_landmarks

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Landmarks(BaseModel):
    landmarks: list[list[float]]

@app.post("/predict")
def predict(landmarks: Landmarks):
    prediction = predict_from_landmarks(landmarks.landmarks)
    return {"prediction": prediction}
