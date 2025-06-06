import { useState, useEffect } from "react";
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '../lib/queryClient';

export default function HomeSimple() {
  // Main interface state
  const [showCastInput, setShowCastInput] = useState(false);
  const [inputText, setInputText] = useState('');
  const [castContent, setCastContent] = useState('');
  const [currentView, setCurrentView] = useState<'input' | 'cast' | 'reply'>('input');
  const [replyText, setReplyText] = useState('');
  
  // Voice settings
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showVoiceSettings, setShowVoiceSettings] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [speechRate, setSpeechRate] = useState(0.9);

  // API mutations
  const processContentMutation = useMutation({
    mutationFn: async (input: string) => {
      const response = await apiRequest('POST', '/api/process-content', { input });
      return await response.json();
    },
    onSuccess: (data) => {
      setCastContent(data.content);
      setCurrentView('cast');
    }
  });

  const getFeedbackMutation = useMutation({
    mutationFn: async (text: string) => {
      const response = await apiRequest('POST', '/api/feedback', { text });
      return await response.json();
    }
  });

  const polishReplyMutation = useMutation({
    mutationFn: async (text: string) => {
      const response = await apiRequest('POST', '/api/polish-reply', { text });
      return await response.json();
    },
    onSuccess: (data) => {
      setReplyText(data.polishedText);
    }
  });

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

  // Utility functions
  const speakText = (text: string) => {
    if (isSpeaking) {
      speechSynthesis.cancel();
      setIsSpeaking(false);
    } else {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = speechRate;
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }
      
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      
      speechSynthesis.speak(utterance);
      setIsSpeaking(true);
    }
  };

  const handleContinue = () => {
    if (inputText.trim()) {
      processContentMutation.mutate(inputText.trim());
    }
  };

  const handleReadAloud = () => {
    if (castContent) {
      speakText(castContent);
    }
  };

  const handleVoiceReply = () => {
    setCurrentView('reply');
  };

  const handleGetFeedback = () => {
    if (replyText.trim()) {
      getFeedbackMutation.mutate(replyText.trim());
    }
  };

  const handlePolishReply = () => {
    if (replyText.trim()) {
      polishReplyMutation.mutate(replyText.trim());
    }
  };

  const resetInterface = () => {
    setShowCastInput(false);
    setInputText('');
    setCastContent('');
    setCurrentView('input');
    setReplyText('');
    speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-md mx-auto p-4">
        <header className="mb-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold">Cast Aloud</h1>
            <p className="text-gray-600 mt-2">
              Accessibility tools for reading and replying to casts
            </p>
          </div>
        </header>

        <div className="bg-white rounded-lg p-6 border relative" style={{ minHeight: '320px' }}>
          <button
            onClick={() => setShowVoiceSettings(!showVoiceSettings)}
            className="absolute top-4 right-4 px-3 py-2 rounded-lg transition-colors duration-200 flex items-center gap-2 text-sm font-medium bg-purple-100 hover:bg-purple-200 text-purple-600"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="3"/>
              <path d="M12 1v6m0 6v6m11-7h-6m-6 0H1"/>
            </svg>
            Settings
          </button>

          {!showCastInput ? (
            // Main buttons
            <div className="flex flex-col items-center justify-center h-full space-y-4">
              <button
                onClick={() => setShowCastInput(true)}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white py-4 px-6 rounded-lg text-lg font-medium transition-colors"
              >
                Read Cast Aloud
              </button>
              
              <p className="text-gray-500 text-sm text-center">
                Paste a Farcaster URL or text to get started
              </p>
            </div>
          ) : (
            // Cast input interface
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">
                  {currentView === 'input' && 'Paste Content'}
                  {currentView === 'cast' && 'Cast Content'}
                  {currentView === 'reply' && 'Voice Reply'}
                </h2>
                <button
                  onClick={resetInterface}
                  className="text-gray-400 hover:text-gray-600 text-sm"
                >
                  ✕
                </button>
              </div>

              {currentView === 'input' && (
                <div className="space-y-4">
                  <textarea
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Paste a farcaster.xyz URL or enter text directly..."
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    rows={6}
                  />
                  <button
                    onClick={handleContinue}
                    disabled={!inputText.trim() || processContentMutation.isPending}
                    className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-3 px-4 rounded-lg font-medium transition-colors"
                  >
                    {processContentMutation.isPending ? 'Processing...' : 'Continue'}
                  </button>
                </div>
              )}

              {currentView === 'cast' && (
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg max-h-48 overflow-y-auto">
                    <p className="text-gray-800 whitespace-pre-wrap">{castContent}</p>
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={handleReadAloud}
                      className={`flex-1 px-4 py-3 rounded-lg font-medium transition-colors ${
                        isSpeaking 
                          ? 'bg-red-100 hover:bg-red-200 text-red-600' 
                          : 'bg-green-100 hover:bg-green-200 text-green-600'
                      }`}
                    >
                      {isSpeaking ? 'Stop' : 'Read Aloud'}
                    </button>
                    <button
                      onClick={handleVoiceReply}
                      className="flex-1 bg-purple-100 hover:bg-purple-200 text-purple-600 px-4 py-3 rounded-lg font-medium transition-colors"
                    >
                      Voice Reply
                    </button>
                  </div>
                </div>
              )}

              {currentView === 'reply' && (
                <div className="space-y-4">
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Type your reply here..."
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                    rows={6}
                  />
                  
                  {getFeedbackMutation.data && (
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <p className="text-blue-800 text-sm">{getFeedbackMutation.data.feedback}</p>
                    </div>
                  )}
                  
                  <div className="flex gap-2">
                    <button
                      onClick={handleGetFeedback}
                      disabled={!replyText.trim() || getFeedbackMutation.isPending}
                      className="flex-1 bg-blue-100 hover:bg-blue-200 disabled:bg-gray-100 text-blue-600 disabled:text-gray-400 px-4 py-2 rounded-lg font-medium transition-colors"
                    >
                      {getFeedbackMutation.isPending ? 'Getting...' : 'Get Feedback'}
                    </button>
                    <button
                      onClick={handlePolishReply}
                      disabled={!replyText.trim() || polishReplyMutation.isPending}
                      className="flex-1 bg-purple-100 hover:bg-purple-200 disabled:bg-gray-100 text-purple-600 disabled:text-gray-400 px-4 py-2 rounded-lg font-medium transition-colors"
                    >
                      {polishReplyMutation.isPending ? 'Polishing...' : 'Polish Reply'}
                    </button>
                  </div>

                  <button
                    onClick={() => navigator.clipboard.writeText(replyText)}
                    disabled={!replyText.trim()}
                    className="w-full bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 text-gray-700 disabled:text-gray-400 px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    Copy Reply
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Voice Settings Dropdown */}
          {showVoiceSettings && (
            <div className="absolute top-16 right-4 bg-white border rounded-lg shadow-lg p-4 w-80 z-10">
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
                    speakText(testText);
                  }}
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors duration-200"
                >
                  Test Voice
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}