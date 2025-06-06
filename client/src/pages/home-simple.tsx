import { Link } from "wouter";
import { useState, useEffect } from "react";

export default function HomeSimple() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showVoiceSettings, setShowVoiceSettings] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);
  
  // Load speech rate from localStorage
  const [speechRate, setSpeechRate] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('voiceSettings');
        if (saved) {
          const parsed = JSON.parse(saved);
          return parsed.speechRate || 0.9;
        }
      } catch (error) {
        console.warn('Failed to load voice settings:', error);
      }
    }
    return 0.9;
  });

  // Load available voices
  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = speechSynthesis.getVoices();
      setVoices(availableVoices);
      
      if (availableVoices.length > 0 && !selectedVoice) {
        // Try to restore saved voice
        let voiceToSelect = null;
        try {
          const saved = localStorage.getItem('voiceSettings');
          if (saved) {
            const parsed = JSON.parse(saved);
            if (parsed.voiceName) {
              voiceToSelect = availableVoices.find(voice => voice.name === parsed.voiceName);
            }
          }
        } catch (error) {
          console.warn('Failed to restore saved voice:', error);
        }
        
        // Use saved voice or default to first available
        setSelectedVoice(voiceToSelect || availableVoices[0]);
      }
    };

    loadVoices();
    speechSynthesis.addEventListener('voiceschanged', loadVoices);
    
    return () => {
      speechSynthesis.removeEventListener('voiceschanged', loadVoices);
    };
  }, [selectedVoice]);

  // Save voice settings to localStorage
  const saveVoiceSettings = (voice: SpeechSynthesisVoice | null, rate: number) => {
    try {
      const settings = {
        voiceName: voice?.name || null,
        speechRate: rate
      };
      localStorage.setItem('voiceSettings', JSON.stringify(settings));
    } catch (error) {
      console.warn('Failed to save voice settings:', error);
    }
  };

  // Update voice selection with persistence
  const handleVoiceChange = (voice: SpeechSynthesisVoice | null) => {
    setSelectedVoice(voice);
    saveVoiceSettings(voice, speechRate);
  };

  // Update speech rate with persistence
  const handleRateChange = (rate: number) => {
    setSpeechRate(rate);
    saveVoiceSettings(selectedVoice, rate);
  };

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
    <div className="min-h-screen bg-fc-gray-50">
      <div className="max-w-md mx-auto p-4">
        <header className="mb-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-fc-gray-900">Cast Aloud</h1>
            <p className="text-fc-gray-600 mt-2">
              Accessibility tools for reading and replying to casts
            </p>
          </div>
        </header>

        <div className="bg-white rounded-lg p-6 border border-fc-gray-200 relative">
          <button
            onClick={readPageAloud}
            className={`absolute top-4 right-4 px-3 py-2 rounded-lg transition-colors duration-200 flex items-center gap-2 text-sm font-medium ${
              isSpeaking 
                ? 'bg-fc-error/10 hover:bg-fc-error/20 text-fc-error' 
                : 'bg-fc-purple/10 hover:bg-fc-purple/20 text-fc-purple'
            }`}
            title={isSpeaking ? 'Stop reading' : 'Read page aloud'}
          >
            {isSpeaking ? (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="6" y="4" width="4" height="16" rx="1"/>
                  <rect x="14" y="4" width="4" height="16" rx="1"/>
                </svg>
                Stop
              </>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
                  <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
                  <path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
                </svg>
                Read Aloud
              </>
            )}
          </button>
          <h2 className="text-lg font-semibold mb-4 text-fc-gray-900">Try the Mini App</h2>
          <p className="text-fc-gray-600 mb-4">
            The mini app helps you read casts aloud and create voice replies with AI assistance.
          </p>
          
          <div className="space-y-3">
            <Link href="/cast-aloud?text=Hello%20world!%20This%20is%20a%20sample%20cast%20about%20the%20future%20of%20decentralized%20social%20networks.">
              <button className="block w-full bg-fc-purple hover:bg-fc-purple-dark text-white py-3 px-4 rounded-lg text-center font-medium">
                Read Cast Aloud
              </button>
            </Link>
            
            <button 
              onClick={() => setShowVoiceSettings(!showVoiceSettings)}
              className="block w-full bg-fc-purple-light hover:bg-fc-purple text-white py-3 px-4 rounded-lg text-center font-medium"
            >
              Voice Settings
            </button>
          </div>

          {showVoiceSettings && (
            <div className="mt-4 p-4 bg-white border rounded-lg">
              <h3 className="font-medium mb-3">Voice Settings</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Voice Type</label>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <input
                        type="radio"
                        id="browser-voices"
                        name="voiceType"
                        value="browser"
                        checked={true}
                        readOnly
                        className="mr-2"
                      />
                      <label htmlFor="browser-voices" className="text-sm">
                        Browser Voices (Free)
                      </label>
                    </div>
                    <div className="flex items-center opacity-50">
                      <input
                        type="radio"
                        id="premium-voices"
                        name="voiceType"
                        value="openai"
                        disabled
                        className="mr-2"
                      />
                      <label htmlFor="premium-voices" className="text-sm flex items-center text-gray-400">
                        Premium AI Voices
                        <span className="ml-1 px-2 py-0.5 bg-gray-100 text-gray-500 text-xs rounded-full">
                          Coming Soon
                        </span>
                      </label>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Voice</label>
                  <select 
                    value={selectedVoice?.name || ''}
                    onChange={(e) => {
                      const voice = voices.find(v => v.name === e.target.value);
                      handleVoiceChange(voice || null);
                    }}
                    className="w-full p-2 border border-fc-gray-300 rounded-md focus:ring-2 focus:ring-fc-purple focus:border-transparent"
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
                    onChange={(e) => handleRateChange(parseFloat(e.target.value))}
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