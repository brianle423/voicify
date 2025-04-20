import React from 'react'

const Footer = () => {
  return (
    <div className="w-full h-40 border-t border-gray-300 mt-8">
        <div className="flex flex-col h-full justify-between items-center px-4 pt-8">
            <p>
                Voicify is a real-time sign language translation platform that converts American Sign Language (ASL) 
                into spoken language using text-to-speech technology.   
            </p>
            <p className="text-md"> 
                Designed to empower the Deaf and 
                hard-of-hearing community, Voicify makes it easier to engage in everyday conversations—whether it's 
                ordering food, asking for assistance, or participating in group discussions—without needing 
                an interpreter. It's accessibility, amplified. 
            </p>
            <p className="text-2xl font-bold">
                Created for HackDavis 2025!
            </p>
            <p className="text-2xl font-bold">
                Ryan Hang, Brian Le, Eric Sun, Kenny Le
            </p>
        </div>
    </div>
  )
}

export default Footer