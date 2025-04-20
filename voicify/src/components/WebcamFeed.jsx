// import React, { useRef, useEffect, useState, forwardRef, useImperativeHandle, useCallback } from 'react';

// const WebcamFeed = forwardRef(({ onFrame, onCameraOn }, ref) => {
//   const videoRef = useRef(null);
//   const canvasRef = useRef(null);
//   const streamRef = useRef(null);
//   const [cameraOn, setCameraOn] = useState(false);

//   const handleCameraOn = useCallback(() => {
//     const newCameraOn = !cameraOn;
//     setCameraOn(newCameraOn);
//     if (onCameraOn) {
//       onCameraOn(newCameraOn);
//     }
//   }, [cameraOn, onCameraOn, setCameraOn]);

//   useEffect(() => {
//     if (cameraOn) {
//       startCamera();
//     } else {
//       stopCamera();
//     }

//     return () => {
//       stopCamera();
//     };
//   }, [cameraOn]);

//   useImperativeHandle(ref, () => ({
//     isCameraOn: () => cameraOn,
//   }));

//   const startCamera = async () => {
//     try {
//       const stream = await navigator.mediaDevices.getUserMedia({
//         video: true,
//         audio: false,
//       });
//       streamRef.current = stream;
//       videoRef.current.srcObject = stream;
//       await videoRef.current.play();
//       requestAnimationFrame(draw);
//     } catch (err) {
//       console.error('Error accessing webcam:', err);
//     }
//   };

//   const stopCamera = () => {
//     if (streamRef.current) {
//       streamRef.current.getTracks().forEach((track) => track.stop());
//       streamRef.current = null;
//     }
//     if (videoRef.current) {
//       videoRef.current.srcObject = null;
//     }
//   };

//   const draw = () => {
//     const video = videoRef.current;
//     const canvas = canvasRef.current;
//     const ctx = canvas.getContext('2d');

//     if (video && canvas && cameraOn) {
//       canvas.width = video.videoWidth;
//       canvas.height = video.videoHeight;
//       ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

//       if (onFrame) {
//         onFrame(video, canvas);
//       }
//     }

//     if (cameraOn) {
//       requestAnimationFrame(draw);
//     }
//   };

//   return (
//     <div className="w-full">
//       <div className="flex flex-row justify-between items-center px-4">
//         <div className="flex flex-row items-center space-x-2">
//           <span className="material-icons text-white">videocam</span>
//           <p className="text-2xl font-bold text-white">Camera</p>
//         </div>
//         <button
//           onClick={handleCameraOn}
//           className={`mb-3 px-4 py-2 mt-3 text-white border-none relative absolute rounded-md cursor-pointer font-bold transition ease-in-out duration-200 ${
//             cameraOn ? 'bg-red-600 hover:bg-red-900' : 'bg-[#597DFE] hover:bg-[#223061]'
//           }`}
//         >
//           {cameraOn ? 'Stop Camera' : 'Turn On Camera'}
//         </button>
//       </div>

//       <div
//         className="relative w-full h-120 bg-gray-600 overflow-hidden"
//       >
//         <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white text-center">
//           <span className="material-icons text-white">videocam_off</span>
//           <p> Camera is currently off. Click "Start Camera" to begin translation. </p>
//         </div>
        
//         <video
//           ref={videoRef}
//           style={{
//             display: 'none', // hide the video element
//           }}
//           autoPlay
//           muted
//           playsInline
//         />
//         <canvas
//           ref={canvasRef}
//           className="absolute top-0 left-0 w-full h-full pointer-events-none"
//         />
//       </div>
//     </div>
//   );
// });

// export default WebcamFeed;

import React, { useState, useImperativeHandle, forwardRef, useEffect } from 'react';

const WebcamFeed = forwardRef(({ onCameraOn }, ref) => {
  const [cameraOn, setCameraOn] = useState(false);

  const handleCameraToggle = () => {
    const newStatus = !cameraOn;
    setCameraOn(newStatus);

    if (onCameraOn) {
      onCameraOn(newStatus);
    }

    // Optional: Tell backend to start/stop camera
    fetch('http://localhost:8000/toggle', { method: 'POST' }).catch((err) =>
      console.error('Failed to toggle backend camera:', err)
    );
  };

  useImperativeHandle(ref, () => ({
    isCameraOn: () => cameraOn,
  }));

  return (
    <div className="w-full">
      <div className="flex flex-row justify-between items-center px-4">
        <div className="flex flex-row items-center space-x-2">
          <span className="material-icons text-white">videocam</span>
          <p className="text-2xl font-bold text-white">Camera</p>
        </div>
        <button
          onClick={handleCameraToggle}
          className={`mb-3 px-4 py-2 mt-3 text-white border-none relative absolute rounded-md cursor-pointer font-bold transition ease-in-out duration-200 ${
            cameraOn ? 'bg-red-600 hover:bg-red-900' : 'bg-[#597DFE] hover:bg-[#223061]'
          }`}
        >
          {cameraOn ? 'Stop Camera' : 'Turn On Camera'}
        </button>
      </div>

      <div className="relative w-full h-120 bg-gray-600 overflow-hidden">
        {cameraOn ? (
          <img
            src="http://localhost:8000/video"
            alt="OpenCV Feed"
            className="w-full h-full object-cover"
            style={{ maxHeight: '480px', borderRadius: '8px' }}
          />
        ) : (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white text-center">
            <span className="material-icons text-white">videocam_off</span>
            <p> Camera is currently off. Click "Start Camera" to begin translation. </p>
          </div>
        )}
      </div>
    </div>
  );
});

export default WebcamFeed;
