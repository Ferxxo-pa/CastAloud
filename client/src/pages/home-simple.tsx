import { Link } from "wouter";
import { useState, useEffect } from "react";

export default function HomeSimple() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showVoiceSettings, setShowVoiceSettings] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [speechRate, setSpeechRate] = useState(0.9);

  // Load available voices
  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = speechSynthesis.getVoices();
      setVoices(availableVoices);
      if (availableVoices.length > 0 && !selectedVoice) {
        setSelectedVoice(availableVoices[0]);
      }
    };

    loadVoices();
    speechSynthesis.addEventListener('voiceschanged', loadVoices);
    
    return () => {
      speechSynthesis.removeEventListener('voiceschanged', loadVoices);
    };
  }, [selectedVoice]);

  const readPageAloud = () => {
    const textToRead = `
      Cast Aloud. Accessibility tools for reading and replying to casts.
      
      Try the Mini App. The mini app helps you read casts aloud and create voice replies with AI assistance.
      
      How it works:
      1. Paste a Farcaster post URL or text directly
      2. Click "Read Aloud" to hear the content  
      3. Type your reply in the text area
      4. Get AI feedback or polish your reply
      5. Copy the improved reply to post on Farcaster
    `;

    if (isSpeaking) {
      speechSynthesis.cancel();
      setIsSpeaking(false);
    } else {
      const utterance = new SpeechSynthesisUtterance(textToRead);
      utterance.rate = speechRate;
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      speechSynthesis.speak(utterance);
    }
  };
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-md mx-auto p-4">
        <header className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-center">Cast Aloud</h1>
              <p className="text-gray-600 text-center mt-2">
                Accessibility tools for reading and replying to casts
              </p>
            </div>
            <button
              onClick={readPageAloud}
              className={`ml-4 p-3 rounded-full transition-colors duration-200 ${
                isSpeaking 
                  ? 'bg-red-100 hover:bg-red-200 text-red-600' 
                  : 'bg-purple-100 hover:bg-purple-200 text-purple-600'
              }`}
              title={isSpeaking ? 'Stop reading' : 'Read page aloud'}
            >
              {isSpeaking ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="6" y="4" width="4" height="16" rx="1"/>
                  <rect x="14" y="4" width="4" height="16" rx="1"/>
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
                  <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
                  <path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
                </svg>
              )}
            </button>
          </div>
        </header>

        <div className="bg-white rounded-lg p-6 border">
          <h2 className="text-lg font-semibold mb-4">Try the Mini App</h2>
          <p className="text-gray-600 mb-4">
            The mini app helps you read casts aloud and create voice replies with AI assistance.
          </p>
          
          <div className="space-y-3">
            <Link href="/cast-aloud?text=Hello%20world!%20This%20is%20a%20sample%20cast%20about%20the%20future%20of%20decentralized%20social%20networks.">
              <button className="block w-full bg-blue-500 hover:bg-blue-600 text-white py-3 px-4 rounded-lg text-center font-medium">
                Read Cast Aloud
              </button>
            </Link>
            
            <button 
              onClick={() => setShowVoiceSettings(!showVoiceSettings)}
              className="block w-full bg-purple-500 hover:bg-purple-600 text-white py-3 px-4 rounded-lg text-center font-medium"
            >
              Voice Settings
            </button>
          </div>

          {showVoiceSettings && (
            <div className="mt-4 p-4 bg-white border rounded-lg">
              <h3 className="font-medium mb-3">Voice Settings</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Voice</label>
                  <select 
                    value={selectedVoice?.name || ''}
                    onChange={(e) => {
                      const voice = voices.find(v => v.name === e.target.value);
                      setSelectedVoice(voice || null);
                    }}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    {voices.map((voice) => (
                      <option key={voice.name} value={voice.name}>
                        {voice.name} ({voice.lang})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Speed: {speechRate.toFixed(1)}x
                  </label>
                  <input
                    type="range"
                    min="0.5"
                    max="2"
                    step="0.1"
                    value={speechRate}
                    onChange={(e) => setSpeechRate(parseFloat(e.target.value))}
                    className="w-full"
                  />
                </div>

                <button
                  onClick={() => {
                    const testText = "This is a test of your voice settings. How does this sound?";
                    const utterance = new SpeechSynthesisUtterance(testText);
                    utterance.rate = speechRate;
                    if (selectedVoice) {
                      utterance.voice = selectedVoice;
                    }
                    speechSynthesis.speak(utterance);
                  }}
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors duration-200"
                >
                  Test Voice
                </button>
              </div>
            </div>
          )}

          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium mb-2">How it works:</h3>
            <ol className="text-sm text-gray-600 space-y-1">
              <li>1. 📝 Paste a Farcaster post URL or text directly</li>
              <li>2. 🔊 Click "Read Aloud" to hear the content</li>
              <li>3. ✍️ Type your reply in the text area</li>
              <li>4. 🤖 Get AI feedback or polish your reply</li>
              <li>5. 📋 Copy the improved reply to post on Farcaster</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}