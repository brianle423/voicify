import React, { useRef, useEffect, useState } from 'react';

const WebcamFeed = ({ onFrame }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const [cameraOn, setCameraOn] = useState(false);

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
      <button
        onClick={() => setCameraOn((prev) => !prev)}
        className={`mb-3 px-4 py-2 text-white border-none rounded-md cursor-pointer ${
          cameraOn ? 'bg-red-600' : 'bg-green-500'
        }`}
      >
        {cameraOn ? 'Turn Off Camera' : 'Turn On Camera'}
      </button>

      <div
        className="relative w-full h-90 bg-gray-100 border border-gray-300 rounded-lg overflow-hidden"
      >
        <video
          ref={videoRef}
          className={`w-full h-full object-cover transform scale-x-[-1] ${
            cameraOn ? 'block' : 'hidden'
          }`}
          autoPlay
          muted
          playsInline
        />
        <canvas
          ref={canvasRef}
          className={`absolute top-0 left-0 w-full h-full pointer-events-none ${
            cameraOn ? 'block' : 'hidden'
          }`}
        />
      </div>
    </div>
  );
};

export default WebcamFeed;
