import React from 'react'

const NavBar = ({camera}) => {
  const activityFeedStyle = camera ? 'bg-green-500' : 'bg-red-500'
  return (
    <div className="h-18 w-full bg-white mb-8 flex justify-between items-center">
        <div className='flex'>
            <img src="logo.png" alt="logo" className="h-full w-full ml-4" />
            <p className="text-center ml-4 font-bold text-xl">
                Voicify
            </p>
        </div>
        
        <p className={activityFeedStyle + " text-center"}>Activity Feed</p>
    </div>
  )
}

export default NavBar