import React, { useState, useImperativeHandle, forwardRef } from 'react';

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
