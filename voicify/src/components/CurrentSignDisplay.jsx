import React from 'react'
import CurrentSignHelp from './CurrentSignHelp'

const CurrentSignDisplay = () => {
  return (
    <div className="flex flex-col items-center h-3/7 w-full border rounded-lg">
      <div className="rounded-t-lg bg-gray-800 h-16 w-full items-center justify-between flex px-4">
        <div className="flex flex-row items-center space-x-2">
          <span className="material-icons text-white">front_hand</span>
          <p className="text-2xl font-bold text-white">Current Sign</p>
        </div>
        <CurrentSignHelp />
      </div>

      <div className="flex flex-col justify-center items-center h-full text-gray-600 text-center">
        <span className="material-icons">do_not_touch</span>
        <p> No sign detected </p>
      </div>
        
    </div>
  )
}

export default CurrentSignDisplay