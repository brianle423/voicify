import React, { useRef, useEffect } from 'react';

const WebcamFeed = ({ onFrame }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const setupCamera = async () => {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
      });
      videoRef.current.srcObject = stream;
      await videoRef.current.play();
      requestAnimationFrame(draw);
    };

    const draw = () => {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');

      if (video && canvas) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Optionally send this frame to a processing function
        if (onFrame) {
          onFrame(video, canvas); // you can extract frame or run hand detection here
        }
      }

      requestAnimationFrame(draw);
    };

    setupCamera();
  }, [onFrame]);

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <video
        ref={videoRef}
        style={{ width: '100%', transform: 'scaleX(-1)', display: 'block' }}
        autoPlay
        muted
        playsInline
      />
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
        }}
      />
    </div>
  );
};

export default WebcamFeed;