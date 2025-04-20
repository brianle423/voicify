import React from 'react'

const CurrentSignHelp = () => {
  const [isHelpOpen, setIsHelpOpen] = React.useState(false);

  const handleClick = () => {
    setIsHelpOpen(true);
  };

  const handleClose = () => {
    setIsHelpOpen(false);
  };

  return (
    <React.Fragment>
      <div className="mb-3 px-4 py-2 mt-3 bg-gray-600 hover:bg-gray-900 text-white border-none relative absolute rounded-md cursor-pointer font-bold transition ease-in-out duration-200" onClick={handleClick}>
        Help
      </div>
      {isHelpOpen && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center"
        >
          <div
            className="w-200 bg-white border border-gray-400 rounded-lg p-4 shadow-md"
          >
            <div className="mt-2 flex flex-col justify-center items-center space-y-2">
              <p>
                This section displays a guide to the American Sign Language.
              </p>
              <img src="/photos/alphabet-diagram.png" alt="alphabet-diagram" className="w-full h-full"/>
            </div>
            <div className="flex justify-center mt-4">
              <button
                className="bg-red-600 text-white font-bold hover:bg-red-900 px-4 py-2 rounded-md border border-red-400 transition ease-in-out duration-200 cursor-pointer"
                onClick={handleClose}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </React.Fragment>
  );
};

export default CurrentSignHelp