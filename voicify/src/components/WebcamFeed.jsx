import React, { useRef, useEffect, useState, forwardRef, useImperativeHandle, useCallback } from 'react';

const WebcamFeed = forwardRef(({ onFrame, onCameraOn }, ref) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const [cameraOn, setCameraOn] = useState(false);

  const handleCameraOn = useCallback(() => {
    const newCameraOn = !cameraOn;
    setCameraOn(newCameraOn);
    if (onCameraOn) {
      onCameraOn(newCameraOn);
    }
  }, [cameraOn, onCameraOn, setCameraOn]);

  useEffect(() => {
    if (cameraOn) {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [cameraOn]);

  useImperativeHandle(ref, () => ({
    isCameraOn: () => cameraOn,
  }));

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
      });
      streamRef.current = stream;
      videoRef.current.srcObject = stream;
      await videoRef.current.play();
      requestAnimationFrame(draw);
    } catch (err) {
      console.error('Error accessing webcam:', err);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const draw = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (video && canvas && cameraOn) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      if (onFrame) {
        onFrame(video, canvas);
      }
    }

    if (cameraOn) {
      requestAnimationFrame(draw);
    }
  };

  return (
    <div className="w-full">
      <div className="flex flex-row justify-between items-center px-4">
        <div className="flex flex-row items-center space-x-2">
          <span className="material-icons text-white">videocam</span>
          <p className="text-2xl font-bold text-white">Camera</p>
        </div>
        <button
          onClick={handleCameraOn}
          className={`mb-3 px-4 py-2 mt-3 text-white border-none relative absolute rounded-md cursor-pointer font-bold ${
            cameraOn ? 'bg-red-600 hover:bg-red-900' : 'bg-gray-600 hover:bg-gray-900'
          }`}
        >
          {cameraOn ? 'Stop Camera' : 'Turn On Camera'}
        </button>
      </div>

      <div
        className="relative w-full h-120 bg-gray-700 overflow-hidden"
      >
        <video
          ref={videoRef}
          style={{
            display: 'none', // hide the video element
          }}
          autoPlay
          muted
          playsInline
        />
        <canvas
          ref={canvasRef}
          className="absolute top-0 left-0 w-full h-full pointer-events-none"
        />
      </div>
    </div>
  );
});

export default WebcamFeed;