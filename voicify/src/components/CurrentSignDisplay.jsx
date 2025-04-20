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
              className="bg-green-600 hover:bg-green-900 font-bold text-white px-3 py-2 rounded-md flex items-center cursor-pointer"
            >
              <span className="material-icons mr-1 text-md font-bold">add</span>
              Save
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