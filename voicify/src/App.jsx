// import NavBar from "./components/NavBar";
// import WebcamFeed from "./components/WebcamFeed";
// import CurrentSignDisplay from "./components/CurrentSignDisplay";
// import SignHistory from "./components/SignHistory";
// import Footer from "./components/Footer";
// import ASLPredictor from './components/ASLPredictor';
// import speechUtils from './speechUtils';

// import React from "react";
// import { useState, useCallback, useEffect, useRef } from "react";

// function App() {
//   const [prediction, setPrediction] = useState('');
//   const [isCameraOn, setIsCameraOn] = useState(false);
//   const [signHistory, setSignHistory] = useState([]);
//   const [voicesLoaded, setVoicesLoaded] = useState(false);
//   const aslPredictorRef = useRef(null);
//   const prevPredictionRef = useRef('');

//   // Initialize speech synthesis and wait for voices to load
//   useEffect(() => {
//     // Speech synthesis voice loading is asynchronous
//     const loadVoices = () => {
//       window.speechSynthesis.getVoices();
//       setVoicesLoaded(true);
//       console.log("Voices loaded:", window.speechSynthesis.getVoices().length);
//     };

//     // Chrome needs this event, Firefox has voices ready immediately
//     if (window.speechSynthesis) {
//       if (window.speechSynthesis.onvoiceschanged !== undefined) {
//         window.speechSynthesis.onvoiceschanged = loadVoices;
//       } else {
//         loadVoices(); // For browsers where voices are ready immediately
//       }
//     }

//     return () => {
//       if (window.speechSynthesis) {
//         window.speechSynthesis.cancel(); // Cancel any speech when unmounting
//       }
//     };
//   }, []);

//   const handlePrediction = (char) => {
//     setPrediction(char);
    
//     // Only speak if it's a new prediction (to avoid repetitive speaking)
//     if (char && char !== prevPredictionRef.current) {
//       speakCharacter(char);
//       prevPredictionRef.current = char;
//     }
//   };

//   const speakCharacter = (char) => {
//     if (!char) return;
    
//     speechUtils.speak(char, {
//       voice: 'Google US English', // This will be matched partially by name
//       rate: 0.9,
//       pitch: 1.1,
//       volume: 1.0
//     });
//   };

//   const handleSaveSign = (sign) => {
//     if (sign) {
//       setSignHistory(prev => [...prev, sign]);
//       // Always speak when saving a sign
//       speakCharacter(sign);
//     }
//   };

//   const handleClearHistory = () => {
//     setSignHistory([]);
//   };

//   const handleCameraStatusChange = useCallback((status) => {
//     setIsCameraOn(status);
//   }, []);

//   const speakHistory = () => {
//     if (signHistory.length > 0) {
//       const phrase = signHistory.join(' ');
//       speechUtils.speak(phrase, {
//         voice: 'Google US English',
//         rate: 0.8,
//         pitch: 1.0
//       });
//     }
//   };

//   useEffect(() => {
//     if (aslPredictorRef.current) {
//       setIsCameraOn(aslPredictorRef.current.isCameraOn());
//     }
//   }, [aslPredictorRef]);

//   return (
//     <>
//       <div className="flex flex-col relative h-full w-full bg-white">
//         <NavBar cameraStatus={isCameraOn} />
//         <div className="flex flex-row w-5/6 mx-auto space-x-10">
//           {/* left column */}
//           <div className="flex-1 flex flex-col justify-center items-center border rounded-lg bg-gray-800">
//             <ASLPredictor 
//               ref={aslPredictorRef} 
//               onPrediction={handlePrediction} 
//               onCameraStatusChange={handleCameraStatusChange} 
//             />

//             <div className="flex flex-row items-center space-x-2 w-full text-white my-1 py-2 px-4">
//               <span className="material-icons text-white">info</span>
//               <p>Position yourself in the frame with good lighting for best results.</p>
//             </div>
//           </div>
//           {/* right column */}
//           <div className="flex-1 flex flex-col justify-between items-center space-y-6">
//             <CurrentSignDisplay 
//               detectedSign={prediction} 
//               onSaveSign={handleSaveSign}
//             />
//             <SignHistory 
//               history={signHistory}
//               onClearHistory={handleClearHistory}
//               onSpeakHistory={speakHistory}
//             />
//           </div>
//         </div>
//       </div>
//       <Footer />
//     </>
//   );
// }

// export default App;

import NavBar from "./components/NavBar";
import WebcamFeed from "./components/WebcamFeed";
import CurrentSignDisplay from "./components/CurrentSignDisplay";
import SignHistory from "./components/SignHistory";
import Footer from "./components/Footer";
import speechUtils from './speechUtils';

import React from "react";
import { useState, useCallback, useEffect, useRef } from "react";

function App() {
  const [prediction, setPrediction] = useState('');
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [signHistory, setSignHistory] = useState([]);
  const [voicesLoaded, setVoicesLoaded] = useState(false);
  const webcamRef = useRef(null);
  const prevPredictionRef = useRef('');

  // Load TTS voices
  useEffect(() => {
    const loadVoices = () => {
      window.speechSynthesis.getVoices();
      setVoicesLoaded(true);
      console.log("Voices loaded:", window.speechSynthesis.getVoices().length);
    };

    if (window.speechSynthesis) {
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = loadVoices;
      } else {
        loadVoices();
      }
    }

    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Poll current word from Python backend
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch("http://localhost:8000/latest");
        const data = await res.json();
        if (data.word && data.word !== prediction) {
          setPrediction(data.word);
          speakCharacter(data.word);
        }
      } catch (err) {
        console.error("Failed to fetch latest word:", err);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [prediction]);

  const speakCharacter = (char) => {
    if (!char) return;

    speechUtils.speak(char, {
      voice: 'Google US English',
      rate: 0.9,
      pitch: 1.1,
      volume: 1.0
    });
  };

  const handleSaveSign = (sign) => {
    if (sign) {
      setSignHistory(prev => [...prev, sign]);
      speakCharacter(sign);
    }
  };

  const handleClearHistory = () => {
    setSignHistory([]);
  };

  const handleCameraStatusChange = useCallback((status) => {
    setIsCameraOn(status);
  }, []);

  const speakHistory = () => {
    if (signHistory.length > 0) {
      const phrase = signHistory.join(' ');
      speechUtils.speak(phrase, {
        voice: 'Google US English',
        rate: 0.8,
        pitch: 1.0
      });
    }
  };

  return (
    <>
      <div className="flex flex-col relative h-full w-full bg-white">
        <NavBar cameraStatus={isCameraOn} />
        <div className="flex flex-row w-5/6 mx-auto space-x-10">
          {/* left column */}
          <div className="flex-2.5 flex flex-col justify-center items-center border rounded-lg bg-gray-800">
            <WebcamFeed
              ref={webcamRef}
              onCameraOn={handleCameraStatusChange}
            />
            <div className="flex flex-row items-center space-x-2 w-full text-white my-1 py-2 px-4">
              <span className="material-icons text-white">info</span>
              <p>Position yourself in the frame with good lighting for best results.</p>
            </div>
          </div>
          {/* right column */}
          {/* <div className="flex-1 flex flex-col justify-between items-center space-y-6">
            <CurrentSignDisplay 
              detectedSign={prediction} 
              onSaveSign={handleSaveSign}
            />
            <SignHistory 
              history={signHistory}
              onClearHistory={handleClearHistory}
              onSpeakHistory={speakHistory}
            />
          </div> */}
          <div className="flex flex flex-col justify-between items-center space-y-6">
            <CurrentSignDisplay />
            <SignHistory
              history={signHistory}
              onClearHistory={handleClearHistory}
              onSpeakHistory={speakHistory}
            />
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default App;
