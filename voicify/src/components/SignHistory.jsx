import React from 'react'

const SignHistory = ({ history = [], onClearHistory, onSpeakHistory }) => {
  return (
    <div className="flex flex-col items-center h-1/2 w-full border rounded-lg">
      <div className="rounded-t-md bg-gray-800 h-16 w-full items-center justify-between flex px-4 py-4">
        <div className="flex flex-row items-center space-x-2">
          <span className="material-icons text-white">history</span>
          <p className="text-2xl font-bold text-white">Translation History</p>
        </div>
        <div className="flex space-x-2">
          {history.length > 0 && (
            <>
              <button 
                onClick={onSpeakHistory}
                className="bg-blue-600 hover:bg-blue-900 text-white px-3 py-2 font-bold rounded-md flex items-center cursor-pointer"
              >
                <span className="material-icons mr-1 text-sm">volume_up</span>
                Speak All
              </button>
              <button 
                onClick={onClearHistory}
                className="bg-red-600 hover:bg-red-900 text-white px-3 py-2 font-bold rounded-md flex items-center cursor-pointer"
              >
                <span className="material-icons mr-1 text-sm">clear</span>
                Clear
              </button>
            </>
          )}
        </div>
      </div>

      <div className="flex flex-col w-full h-full text-gray-600 p-4 overflow-y-auto">
        {history.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {history.map((sign, index) => (
              <div key={index} className="flex items-center justify-center bg-gray-100 rounded-md px-4 py-2 text-lg">
                {sign}
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col justify-center items-center h-full text-center">
            <p>No translation history yet</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default SignHistory