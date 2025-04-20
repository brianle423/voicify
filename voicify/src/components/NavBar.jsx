import React from 'react'

const NavBar = ({cameraStatus}) => {
  const activityFeedStyle = cameraStatus ? 'bg-green-300 border-green-400' : 'bg-red-300 border-red-400'
  const activityText = cameraStatus ? 'Active' : 'Inactive'
  const activityTextColor = cameraStatus ? 'text-green-400' : 'text-red-400'

  return (
    <div className="h-18 w-full bg-white mb-8 flex justify-between items-center
                    border-b border-gray-300">
        <div className='flex flex-row items-center'>
            <img src="/logo.svg" alt="logo" className="h-12 w-12 ml-4" />
            <p className="text-center ml-4 font-bold text-3xl">
                Voicify
            </p>
        </div>
        
        <div className={activityFeedStyle + " rounded-full h-12 w-40 mr-4 border flex justify-center items-center"}>
            <p className={activityTextColor + "text-center text-x font-bold"}>
                {activityText}
            </p>
        </div>
    </div>
  )
}

export default NavBar