import React from 'react'

const SignHistory = () => {
  return (
    <div className="flex flex-col items-center h-3/7 w-full border rounded-lg">
      <div className="rounded-t-md bg-gray-800 h-16 w-full items-center flex px-4">
        <div className="flex flex-row items-center space-x-2">
          <span className="material-icons text-white">history</span>
          <p className="text-2xl font-bold text-white">Translation History</p>
        </div>
      </div>

      <div className="flex flex-col justify-center items-center h-full text-gray-600 text-center">
          <p> No translation history yet </p>
      </div>

    </div>
  )
}

export default SignHistory