import React, { useEffect, useState, useImperativeHandle, forwardRef, useRef } from 'react';
import * as handpose from '@tensorflow-models/handpose';
import '@tensorflow/tfjs-backend-webgl';
import Webcam from 'react-webcam';

const ASLPredictor = forwardRef(({ onPrediction, onCameraStatusChange }, ref) => {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const [model, setModel] = useState(null);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [currentPrediction, setCurrentPrediction] = useState('');
  const requestRef = useRef();
  const previousTimeRef = useRef();
  
  // Load model once
  useEffect(() => {
    let loadingModel = true;
    
    async function loadModel() {
      try {
        const loadedModel = await handpose.load({
          detectionConfidence: 0.8,  // Higher confidence for better performance
          maxContinuousChecks: 10,
          multiplier: 0.75           // Use smaller model for better performance
        });
        if (loadingModel) {
          setModel(loadedModel);
          console.log("Handpose model loaded");
        }
      } catch (error) {
        console.error("Error loading handpose model:", error);
      }
    }
    
    loadModel();
    
    return () => {
      loadingModel = false;
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, []);

  // Effect to notify parent component of camera status changes
  useEffect(() => {
    if (onCameraStatusChange) {
      onCameraStatusChange(isCameraOn);
    }
  }, [isCameraOn, onCameraStatusChange]);

  // Animation loop with throttling
  const animate = (time) => {
    if (previousTimeRef.current === undefined || 
        time - previousTimeRef.current > 150) { // Limit to ~6-7 fps for performance
      
      detectHand();
      previousTimeRef.current = time;
    }
    
    requestRef.current = requestAnimationFrame(animate);
  };

  // Start/stop animation loop based on camera status
  useEffect(() => {
    if (isCameraOn && model) {
      previousTimeRef.current = undefined;
      requestRef.current = requestAnimationFrame(animate);
      
      return () => {
        cancelAnimationFrame(requestRef.current);
        // Clear canvas on unmount
        if (canvasRef.current) {
          const ctx = canvasRef.current.getContext('2d');
          ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        }
      };
    }
  }, [isCameraOn, model]);

  useImperativeHandle(ref, () => ({
    isCameraOn: () => isCameraOn,
    toggleCamera: handleCameraToggle,
  }));

  const detectHand = async () => {
    if (
      model &&
      webcamRef.current &&
      webcamRef.current.video &&
      webcamRef.current.video.readyState === 4 &&
      canvasRef.current
    ) {
      const video = webcamRef.current.video;
      const canvas = canvasRef.current;
      
      // Set canvas dimensions to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      // Clear previous frame
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      try {
        // Get hand predictions
        const predictions = await model.estimateHands(video);
        
        if (predictions.length > 0) {
          const keypoints = predictions[0].landmarks;
          
          // Extract x and y coordinates
          const xCoords = keypoints.map(point => point[0]);
          const yCoords = keypoints.map(point => point[1]);
          
          const minX = Math.min(...xCoords);
          const maxX = Math.max(...xCoords);
          const minY = Math.min(...yCoords);
          const maxY = Math.max(...yCoords);
          
          // Draw bounding box
          ctx.beginPath();
          ctx.rect(minX - 10, minY - 10, maxX - minX + 20, maxY - minY + 20);
          ctx.strokeStyle = '#000000';
          ctx.lineWidth = 4;
          ctx.stroke();
          
          // Draw each landmark point with PURPLE color
          keypoints.forEach((point) => {
            ctx.beginPath();
            ctx.arc(point[0], point[1], 5, 0, 2 * Math.PI);
            ctx.fillStyle = '#800080'; // Purple color
            ctx.fill();
          });
          
          // Draw connections between landmarks with YELLOW color
          const fingerConnections = [
            // Thumb
            [0, 1], [1, 2], [2, 3], [3, 4],
            // Index finger
            [0, 5], [5, 6], [6, 7], [7, 8],
            // Middle finger
            [0, 9], [9, 10], [10, 11], [11, 12],
            // Ring finger
            [0, 13], [13, 14], [14, 15], [15, 16],
            // Pinky
            [0, 17], [17, 18], [18, 19], [19, 20]
          ];
          
          ctx.strokeStyle = '#FFFF00'; // Yellow color
          ctx.lineWidth = 2;
          
          fingerConnections.forEach(([i, j]) => {
            ctx.beginPath();
            ctx.moveTo(keypoints[i][0], keypoints[i][1]);
            ctx.lineTo(keypoints[j][0], keypoints[j][1]);
            ctx.stroke();
          });
          
          // Display current prediction above the bounding box
          if (currentPrediction) {
            ctx.font = '30px Arial';
            ctx.fillStyle = '#000000';
            ctx.fillText(currentPrediction, minX, minY - 20);
          }
          
          // Send landmarks to backend
          const normalizedKeypoints = keypoints.map(([x, y]) => [x, y]);
          
          try {
            const response = await fetch('http://localhost:8000/predict', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ landmarks: normalizedKeypoints }),
            });
            const data = await response.json();
            if (data.prediction) {
              setCurrentPrediction(data.prediction);
              if (onPrediction) {
                onPrediction(data.prediction);
              }
            }
          } catch (error) {
            console.error('Prediction error:', error);
          }
        }
      } catch (error) {
        console.error('Hand detection error:', error);
      }
    }
  };

  const handleCameraToggle = () => {
    const newStatus = !isCameraOn;
    setIsCameraOn(newStatus);
    
    // Clear canvas when turning off camera
    if (!newStatus && canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
    
    // Explicitly call the callback with the new camera status
    if (onCameraStatusChange) {
      onCameraStatusChange(newStatus);
    }
  };

  return (
    <div className="flex flex-col w-full h-full">
      <div className="flex flex-row justify-between items-center w-full bg-gray-800 py-3 px-4">
        <div className='flex flex-row items-center space-x-2'>
            <span className="material-icons text-white">videocam</span>
            <p className="text-2xl font-bold text-white">Camera Feed</p>
        </div>
        <button
          className={
            isCameraOn
              ? 'bg-red-600 text-white px-4 py-2 rounded-md cursor-pointer font-bold transition ease-in-out duration-200 hover:bg-red-900'
              : 'bg-blue-600 text-white px-4 py-2 rounded-md cursor-pointer font-bold transition ease-in-out duration-200 hover:bg-blue-900'
          }
          onClick={handleCameraToggle}
        >
          {isCameraOn ? 'Turn off camera' : 'Turn on camera'}
        </button>
      </div>
      <div className="w-full h-[400px] bg-gray-600 overflow-hidden relative">
        {isCameraOn ? (
          <>
            <Webcam
              ref={webcamRef}
              className="left-0 w-full h-full object-cover"
              videoConstraints={{ 
                facingMode: 'user',
                width: 640,      // Reduce resolution for better performance
                height: 480
              }}
            />
            <canvas
              ref={canvasRef}
              className="absolute top-0 left-0 w-full h-full"
              style={{ zIndex: 10 }}
            />
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full">
            <p className="text-2xl text-white px-4">
              Click the button to turn on the camera and start detecting hand
              poses.
            </p>
          </div>
        )}
      </div>
    </div>
  );
});

export default ASLPredictor;

