from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
import camera_predict  # Import the whole module

app = FastAPI()

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/current-sign")
def get_current_sign():
    # Access the variable from the module
    return {"sign": camera_predict.current_detected_sign}

@app.get("/video")
def video_feed():
    return StreamingResponse(camera_predict.generate_video_stream(), media_type="multipart/x-mixed-replace; boundary=frame")