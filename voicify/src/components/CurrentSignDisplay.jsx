import React, { useState, useEffect } from 'react'
import CurrentSignHelp from './CurrentSignHelp'

const CurrentSignDisplay = ({ onSaveSign }) => {
  const [currentSign, setCurrentSign] = useState('');
  const [lastApiCall, setLastApiCall] = useState(null);
  const [apiError, setApiError] = useState(null);

  // Fetch current sign from backend
  useEffect(() => {
    const fetchCurrentSign = async () => {
      try {
        setLastApiCall(new Date().toLocaleTimeString());
        const response = await fetch('http://localhost:8000/current-sign');
        
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log("API response:", data);
        
        if (data.sign) {
          setCurrentSign(data.sign);
          setApiError(null);
        }
      } catch (error) {
        console.error('Error fetching current sign:', error);
        setApiError(error.message);
      }
    };

    fetchCurrentSign(); // Initial fetch
    
    // Poll every 500ms
    const interval = setInterval(fetchCurrentSign, 500);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center h-3/7 w-full border rounded-lg">
      <div className="rounded-t-lg bg-gray-800 h-16 w-full items-center justify-between flex px-4">
        <div className="flex flex-row items-center space-x-2">
          <span className="material-icons text-white">front_hand</span>
          <p className="text-2xl font-bold text-white">Current Sign</p>
        </div>
        <div className="flex items-center space-x-3">
          {currentSign && (
            <button 
              onClick={() => onSaveSign(currentSign)}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-md shadow-sm transition duration-200"
              aria-label="Save current sign"
            >
              <span className="material-icons text-lg">add_circle</span>
              <span className="text-md">Save Sign</span>
            </button>
          )}
          <CurrentSignHelp />
        </div>
      </div>

      <div className="flex flex-col justify-center items-center h-full text-gray-600 text-center">
        {currentSign ? (
          <p className="text-4xl font-semibold">{currentSign}</p>
        ) : (
          <>
            <span className="material-icons">do_not_touch</span>
            <p>No sign detected</p>
          </>
        )}
        
        {/* Debug information - remove in production */}
        <div className="mt-4 text-xs text-gray-400">
          <p>Last API call: {lastApiCall || 'None'}</p>
          {apiError && <p className="text-red-500">Error: {apiError}</p>}
        </div>
      </div>
    </div>
  );
};

export default CurrentSignDisplay