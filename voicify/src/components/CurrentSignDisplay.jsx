import React from 'react'
import CurrentSignHelp from './CurrentSignHelp'

const CurrentSignDisplay = ({ detectedSign, onSaveSign }) => {
  return (
    <div className="flex flex-col items-center h-3/7 w-full border rounded-lg">
      <div className="rounded-t-lg bg-gray-800 h-16 w-full items-center justify-between flex px-4">
        <div className="flex flex-row items-center space-x-2">
          <span className="material-icons text-white">front_hand</span>
          <p className="text-2xl font-bold text-white">Current Sign</p>
        </div>
        <div className="flex items-center space-x-3">
          {detectedSign && (
            <button 
            onClick={() => onSaveSign(detectedSign)}
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
        {detectedSign ? (
          <p className="text-4xl font-semibold">{detectedSign}</p>
        ) : (
          <>
            <span className="material-icons">do_not_touch</span>
            <p>No sign detected</p>
          </>
        )}
      </div>
    </div>
  );
};

export default CurrentSignDisplay