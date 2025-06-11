import { Link } from "wouter";
import { useState, useEffect } from "react";
import { farcasterSDK, type FarcasterContext } from '@/lib/farcaster-sdk';

export default function HomeSimple() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showVoiceSettings, setShowVoiceSettings] = useState(false);
  const [castText, setCastText] = useState('');
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [farcasterContext, setFarcasterContext] = useState<FarcasterContext | null>(null);
  const [isMiniApp, setIsMiniApp] = useState(false);
  const [isTestVoicePlaying, setIsTestVoicePlaying] = useState(false);

  // Load speech rate from localStorage
  const [speechRate, setSpeechRate] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('speechRate');
      return saved ? parseFloat(saved) : 1.0;
    }
    return 1.0;
  });

  // Initialize Farcaster SDK
  useEffect(() => {
    const initSDK = async () => {
      try {
        const context = await farcasterSDK.initialize();
        setFarcasterContext(context);
        setIsMiniApp(context.isFrameContext);
      } catch (error) {
        console.error('Failed to initialize Farcaster SDK:', error);
      }
    };
    
    initSDK();
  }, []);

  // Save speech rate to localStorage when it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('speechRate', speechRate.toString());
    }
  }, [speechRate]);

  // Load available voices
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  
  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = speechSynthesis.getVoices();
      setVoices(availableVoices);
      
      if (!selectedVoice && availableVoices.length > 0) {
        // Try to find an English voice, otherwise use the first one
        const englishVoice = availableVoices.find(voice => voice.lang.startsWith('en'));
        setSelectedVoice(englishVoice || availableVoices[0]);
      }
    };

    loadVoices();
    speechSynthesis.addEventListener('voiceschanged', loadVoices);
    
    return () => {
      speechSynthesis.removeEventListener('voiceschanged', loadVoices);
    };
  }, [selectedVoice]);

  const readPageAloud = () => {
    if (isSpeaking) {
      speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const textToRead = castText || 'Welcome to Cast Aloud! This is an accessibility tool for reading and replying to Farcaster posts. Paste a post URL or text, then click Read Aloud to hear the content. You can then type a reply and get AI feedback to polish it before posting.';
    
    if (textToRead) {
      setIsSpeaking(true);
      
      const utterance = new SpeechSynthesisUtterance(textToRead);
      utterance.rate = speechRate;
      utterance.voice = selectedVoice;
      
      utterance.onend = () => {
        setIsSpeaking(false);
      };
      
      utterance.onerror = () => {
        setIsSpeaking(false);
      };
      
      speechSynthesis.speak(utterance);
    }
  };

  const testVoice = () => {
    if (isTestVoicePlaying) {
      speechSynthesis.cancel();
      setIsTestVoicePlaying(false);
      return;
    }

    const testText = "This is a test of the selected voice and speed settings.";
    setIsTestVoicePlaying(true);
    
    const utterance = new SpeechSynthesisUtterance(testText);
    utterance.rate = speechRate;
    utterance.voice = selectedVoice;
    
    utterance.onend = () => {
      setIsTestVoicePlaying(false);
    };
    
    utterance.onerror = () => {
      setIsTestVoicePlaying(false);
    };
    
    if (selectedVoice) {
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

          <div className="mb-6">
            <h2 className="text-lg font-semibold text-fc-gray-900 mb-3">Step 1: Enter Cast Content</h2>
            <textarea
              value={castText}
              onChange={(e) => setCastText(e.target.value)}
              placeholder="Paste a Farcaster post URL or the cast text directly here..."
              className="w-full h-32 p-3 border border-fc-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-fc-purple focus:border-transparent"
            />
          </div>

          <div className="mb-6">
            <h2 className="text-lg font-semibold text-fc-gray-900 mb-3">Step 2: Voice Settings</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-fc-gray-700 mb-2">
                  Voice
                </label>
                <select
                  value={selectedVoice?.name || ''}
                  onChange={(e) => {
                    const voice = voices.find(v => v.name === e.target.value);
                    setSelectedVoice(voice || null);
                  }}
                  className="w-full p-2 border border-fc-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-fc-purple focus:border-transparent"
                >
                  {voices.map((voice) => (
                    <option key={voice.name} value={voice.name}>
                      {voice.name} ({voice.lang})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-fc-gray-700 mb-2">
                  Speech Rate: {speechRate.toFixed(1)}x
                </label>
                <input
                  type="range"
                  min="0.5"
                  max="2.0"
                  step="0.1"
                  value={speechRate}
                  onChange={(e) => setSpeechRate(parseFloat(e.target.value))}
                  className="w-full"
                />
              </div>

              <button
                onClick={testVoice}
                disabled={!selectedVoice}
                className={`px-4 py-2 rounded-lg transition-colors duration-200 flex items-center gap-2 text-sm font-medium ${
                  isTestVoicePlaying
                    ? 'bg-fc-error/10 hover:bg-fc-error/20 text-fc-error'
                    : 'bg-white hover:bg-fc-gray-50 text-fc-gray-700 border border-fc-gray-200'
                }`}
              >
                {isTestVoicePlaying ? (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="6" y="4" width="4" height="16" rx="1"/>
                      <rect x="14" y="4" width="4" height="16" rx="1"/>
                    </svg>
                    Stop Voice
                  </>
                ) : (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
                    </svg>
                    Test Voice
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-lg font-semibold text-fc-gray-900 mb-3">Step 3: Navigate to Full App</h2>
            <p className="text-fc-gray-600 mb-4">
              For the complete Cast Aloud experience with AI-powered reply features:
            </p>
            <Link href="/cast-aloud">
              <button className="w-full bg-fc-purple hover:bg-fc-purple/90 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200">
                Open Full Cast Aloud App
              </button>
            </Link>
          </div>

          <div className="text-center">
            <h3 className="text-sm font-medium text-fc-gray-700 mb-2">How Cast Aloud Works:</h3>
            <ol className="text-xs text-fc-gray-600 text-left space-y-1">
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