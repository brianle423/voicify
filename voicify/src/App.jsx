import NavBar from "./components/NavBar"
import WebcamFeed from "./components/WebcamFeed"

function App() {

  return (
    <div className="flex flex-col relative h-screen w-screen bg-black">
      <NavBar />
      <div className="flex flex-row w-4/5 mx-auto">
        {/* left column */}
        <div className="flex-1 flex flex-col justify-center items-center">
          <WebcamFeed />
          {/* display textbox on the left */}
          <textarea className="w-1/2 h-1/2 bg-white rounded-md mt-4" />
        </div>
        {/* right column */}
        <div className="flex-1/5 flex flex-col justify-center items-center">
          {/* text box on the right */}
          <textarea className="w-full h-full bg-white rounded-md" />
        </div>
      </div>
    </div>
  )
}

export default App
