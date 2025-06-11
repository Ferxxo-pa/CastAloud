function App() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center max-w-md mx-auto p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">🔊 Cast Aloud</h1>
        <p className="text-gray-600 mb-6">Voice accessibility tools for Farcaster casts</p>
        
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <h2 className="text-lg font-semibold mb-4">Mini App Ready</h2>
          <p className="text-sm text-gray-600 mb-4">
            This app helps users with reading difficulties by providing voice features for Farcaster content.
          </p>
          
          <div className="space-y-3">
            <a href="/mini-app?text=Hello%20world!%20This%20is%20a%20sample%20cast." 
               className="block bg-purple-600 hover:bg-purple-700 text-white py-3 px-4 rounded-lg font-medium">
              Try Voice Features
            </a>
            
            <div className="text-xs text-gray-500 mt-4">
              <p>Features:</p>
              <ul className="list-disc list-inside text-left space-y-1">
                <li>Read casts aloud with natural voice</li>
                <li>Voice reply with AI enhancement</li>
                <li>Accessibility-first design</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
