import React from 'react'

const Footer = () => {
  return (
    <footer className="w-full flex flex-col items-center py-16 border-t border-gray-400 mt-8">
      <div className="max-w-5xl mx-auto px-4">
        <div className="text-center">
          <p className="text-3xl font-bold">Voicify</p>
          <p className="text-lg">
            A real-time sign language translation platform that converts American Sign Language (ASL)
            into spoken language using text-to-speech technology. Designed to empower the Deaf and hard-of-hearing community, Voicify makes it easier to engage 
            in everyday conversations—whether it's ordering food, asking for assistance, or participating in 
            group discussions—without needing an interpreter. It's accessibility, amplified.
          </p>
        </div>
        <div className="flex flex-col items-center mt-12">
          <p className="text-lg">
            Created for HackDavis 2025 by
          </p>
          <div className="flex items-center space-x-4 mt-2">
            <a href="https://www.linkedin.com/in/hangryan/" className="hover:underline">Ryan Hang</a>
            <a href="https://www.linkedin.com/in/le-brian/" className="hover:underline">Brian Le</a>
            <a href="https://www.linkedin.com/in/esun02/" className="hover:underline">Eric Sun</a>
            <a href="https://www.linkedin.com/in/kennyle1" className="hover:underline">Kenny Le</a>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer