import NavBar from "./components/NavBar"
import WebcamFeed from "./components/WebcamFeed"
import CurrentSignDisplay from "./components/CurrentSignDisplay"
import SignHistory from "./components/SignHistory"
import Footer from "./components/Footer"

import React from "react"

function App() {
  const [cameraOn, setCameraOn] = React.useState(false)

  return (
    <>
    <div className="flex flex-col relative h-full w-full bg-white">
      <NavBar cameraStatus={cameraOn} />
      <div className="flex flex-row w-5/6 mx-auto space-x-10">
        {/* left column */}
        <div className="flex-1 flex flex-col justify-center items-center border rounded-lg bg-gray-800">
          <WebcamFeed
            onCameraOn={(newVal) => setCameraOn(newVal)}
          />  
          <div className="w-full text-center text-white mt-2 py-2">
            Position yourself in the frame with good lighting for best results.
          </div>
        </div>
        {/* right column */}
        <div className="flex-1 flex flex-col justify-between  items-center">
          <CurrentSignDisplay />
          <SignHistory />
        </div>
      </div>
    </div>
    <Footer />
    </>
  )
}

export default App
