import React from 'react'

const NavBar = ({cameraStatus}) => {
  const activityFeedStyle = cameraStatus ? 'bg-green-300 border-green-400' : 'bg-red-300 border-red-400'
  const activityText = cameraStatus ? 'Active' : 'Inactive'
  const activityTextColor = cameraStatus ? 'text-green-400' : 'text-red-400'
  const activityIndicatorColor = cameraStatus ? 'bg-green-600' : 'bg-red-600'

  return (
    <div className="h-18 w-full bg-white mb-8 flex justify-between items-center
                    border-b border-gray-600">
        <div className='flex flex-row items-center'>
            <img src="/logo.svg" alt="logo" className="h-12 w-12 ml-4" />
            <p className="text-center ml-4 font-bold text-3xl">
                Voicify
            </p>
        </div>
        
        <div className={activityFeedStyle + " px-4 rounded-full h-12 w-38 mr-4 border flex justify-between items-center"}>
            <div className={activityIndicatorColor + " w-4 h-4 rounded-full"}></div>

            <div className="mt-0.5 ml-7 h-0.5 w-4 bg-black absolute"></div>

            <p className={activityTextColor + "text-center text-x font-bold"}>
                {activityText}
            </p>
        </div>
    </div>
  )
}

export default NavBar