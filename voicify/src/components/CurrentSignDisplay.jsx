import React from 'react'
import CurrentSignHelp from './CurrentSignHelp'

const CurrentSignDisplay = () => {
  return (
    <div className="flex flex-col items-center h-3/7 w-full border rounded-lg">
      <div className="rounded-t-lg bg-gray-800 h-16 w-full items-center justify-between flex px-4">
        <p className="text-2xl font-bold text-white">Current Sign</p>
        <CurrentSignHelp />
      </div>
      <div>
        <p>
          OUTPUT TEXT HERE
        </p>
      </div>
    </div>
  )
}

export default CurrentSignDisplay