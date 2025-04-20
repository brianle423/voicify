// src/components/ASLPredictor.jsx
import React, { useEffect, useState } from 'react';
import * as handpose from '@tensorflow-models/handpose';
import '@tensorflow/tfjs-backend-webgl';
import Webcam from 'react-webcam';

const ASLPredictor = ({ onPrediction }) => {
  const webcamRef = React.useRef(null);
  const [model, setModel] = useState(null);

  useEffect(() => {
    handpose.load().then(setModel);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      detectHand();
    }, 300);
    return () => clearInterval(interval);
  }, [model]);

  const detectHand = async () => {
    if (
      model &&
      webcamRef.current &&
      webcamRef.current.video.readyState === 4
    ) {
      const video = webcamRef.current.video;
      const predictions = await model.estimateHands(video);

      if (predictions.length > 0) {
        const keypoints = predictions[0].landmarks.map(([x, y]) => [x, y]);

        try {
          const response = await fetch('http://localhost:8000/predict', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ landmarks: keypoints }),
          });
          const data = await response.json();
          if (data.prediction && onPrediction) {
            onPrediction(data.prediction);
          }
        } catch (error) {
          console.error('Prediction error:', error);
        }
      }
    }
  };

  return (
    <div className="w-full h-[360px] bg-gray-900 rounded-xl overflow-hidden">
      <Webcam
        ref={webcamRef}
        className="left-0 w-full h-full object-cover"
        videoConstraints={{ facingMode: 'user' }}
      />
    </div>
  );
};

export default ASLPredictor;
