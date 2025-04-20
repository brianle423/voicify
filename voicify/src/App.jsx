import NavBar from "./components/NavBar"
import WebcamFeed from "./components/WebcamFeed"
import CurrentSignDisplay from "./components/CurrentSignDisplay"
import SignHistory from "./components/SignHistory"
import Footer from "./components/Footer"
import ASLPredictor from './components/ASLPredictor';

import React from "react"
import { useState } from "react"

function App() {
  //const [cameraOn, setCameraOn] = React.useState(false)
  const [prediction, setPrediction] = useState('');

  const handlePrediction = (char) => {
    setPrediction(char);
    // Optional: speak(char);  // use Web Speech API here
  };

  return (
    <>
    <div className="flex flex-col relative h-full w-full bg-white">
      <NavBar cameraStatus={true} />
      <div className="flex flex-row w-5/6 mx-auto space-x-10">
        {/* left column */}
        <div className="flex-1 flex flex-col justify-center items-center border rounded-lg bg-gray-800">
          <ASLPredictor onPrediction={handlePrediction} />

          <div className="flex flex-row items-center space-x-2 w-full text-white my-1 py-2 px-4">
            <span className="material-icons text-white">info</span>
            <p>Position yourself in the frame with good lighting for best results.</p>
          </div>
        </div>
        {/* right column */}
        <div className="flex-1 flex flex-col justify-between  items-center">
          <CurrentSignDisplay />
          <p className="mt-4 text-xl">Detected: {prediction}</p>
          <SignHistory />
        </div>
      </div>
    </div>
    <Footer />
    </>
  )
}

export default App
