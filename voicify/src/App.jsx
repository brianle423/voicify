import NavBar from "./components/NavBar"
import WebcamFeed from "./components/WebcamFeed"

function App() {

  return (
    <div className="flex flex-col relative h-screen w-screen bg-white">
      <NavBar cameraStatus={true}/>
      <div className="flex flex-row w-5/6 mx-auto">
        {/* left column */}
        <div className="flex-1 flex flex-col justify-center items-center border rounded-lg bg-gray-800">
          <WebcamFeed />
        </div>
        {/* right column */}
        <div className="flex-1 flex flex-col justify-center items-center border p-4 rounded-lg">
          {/* text box on the right */}
        </div>
      </div>
    </div>
  )
}

export default App
