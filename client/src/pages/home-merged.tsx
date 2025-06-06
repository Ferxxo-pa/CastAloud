import { useState, useEffect } from 'react';
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import useSpeechSynthesis from "@/hooks/useSpeechSynthesis";
import useOpenAITTS from "@/hooks/useOpenAITTS";

export default function HomeMerged() {
  // Voice settings
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [speechRate, setSpeechRate] = useState(0.9);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showVoiceSettings, setShowVoiceSettings] = useState(false);
  const [voiceType, setVoiceType] = useState<"browser" | "openai">("browser");
  
  // Cast functionality
  const [castText, setCastText] = useState('');
  const [inputText, setInputText] = useState('');
  const [castUrl, setCastUrl] = useState('');
  const [reply, setReply] = useState('');
  const [feedback, setFeedback] = useState('');
  const [polishedReply, setPolishedReply] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);
  const [currentStep, setCurrentStep] = useState<'input' | 'cast' | 'reply'>('input');

  const browserVoice = useSpeechSynthesis();
  const openaiVoice = useOpenAITTS();
  const currentVoiceSystem = voiceType === "openai" ? openaiVoice : browserVoice;

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

  // Mutations
  const extractCastMutation = useMutation({
    mutationFn: async (url: string) => {
      const response = await fetch('/api/extract-cast', {
        method: 'POST',
        body: JSON.stringify({ url }),
        headers: { "Content-Type": "application/json" }
      });
      if (!response.ok) {
        throw new Error('Failed to extract cast');
      }
      return response.json();
    },
    onSuccess: (data) => {
      setCastText(data.text);
      setCurrentStep('cast');
    }
  });

  const getFeedbackMutation = useMutation({
    mutationFn: async (text: string) => {
      const response = await fetch('/api/get-feedback', {
        method: 'POST',
        body: JSON.stringify({ text }),
        headers: { "Content-Type": "application/json" }
      });
      return response.json();
    },
    onSuccess: (data) => {
      setFeedback(data.feedback);
      setPolishedReply(data.polishedText);
      setShowFeedback(true);
    }
  });

  const polishReplyMutation = useMutation({
    mutationFn: async (text: string) => {
      const response = await fetch('/api/polish-reply', {
        method: 'POST',
        body: JSON.stringify({ text }),
        headers: { "Content-Type": "application/json" }
      });
      return response.json();
    },
    onSuccess: (data) => {
      setPolishedReply(data.polishedText);
    }
  });

  const handleContinue = () => {
    if (castUrl.trim()) {
      extractCastMutation.mutate(castUrl);
    } else if (inputText.trim()) {
      setCastText(inputText);
      setCurrentStep('cast');
    }
  };

  const handleReadCast = () => {
    if (currentVoiceSystem.isSpeaking) {
      currentVoiceSystem.stop();
    } else {
      currentVoiceSystem.speak(castText);
    }
  };

  const handleGetFeedback = () => {
    if (reply.trim()) {
      getFeedbackMutation.mutate(reply);
    }
  };

  const handlePolishReply = () => {
    if (reply.trim()) {
      polishReplyMutation.mutate(reply);
    }
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

  if (currentStep === 'input') {
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

          <div className="bg-white rounded-lg p-6 border relative">
            <button
              onClick={readPageAloud}
              className={`absolute top-4 right-4 px-3 py-2 rounded-lg transition-colors duration-200 flex items-center gap-2 text-sm font-medium ${
                isSpeaking 
                  ? 'bg-red-100 hover:bg-red-200 text-red-600' 
                  : 'bg-purple-100 hover:bg-purple-200 text-purple-600'
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

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Farcaster Cast URL
                </label>
                <input
                  type="url"
                  value={castUrl}
                  onChange={(e) => setCastUrl(e.target.value)}
                  placeholder="https://farcaster.xyz/..."
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div className="text-center text-gray-500 text-sm">
                or
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Paste Cast Text Directly
                </label>
                <Textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Type or paste the cast content here..."
                  className="min-h-[100px] resize-none"
                />
              </div>

              <Button 
                onClick={handleContinue}
                disabled={!castUrl.trim() && !inputText.trim() || extractCastMutation.isPending}
                className="w-full bg-purple-500 hover:bg-purple-600 text-white py-3 rounded-lg font-medium"
              >
                {extractCastMutation.isPending ? 'Loading...' : 'Continue'}
              </Button>
            </div>

            <div className="mt-6">
              <button 
                onClick={() => setShowVoiceSettings(!showVoiceSettings)}
                className="block w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-4 rounded-lg text-center font-medium"
              >
                Voice Settings
              </button>

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
            </div>

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

  // Cast display and interaction step
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

        <div className="bg-white rounded-lg p-6 border relative">
          <button
            onClick={handleReadCast}
            className={`absolute top-4 right-4 px-3 py-2 rounded-lg transition-colors duration-200 flex items-center gap-2 text-sm font-medium ${
              currentVoiceSystem.isSpeaking 
                ? 'bg-red-100 hover:bg-red-200 text-red-600' 
                : 'bg-purple-100 hover:bg-purple-200 text-purple-600'
            }`}
            title={currentVoiceSystem.isSpeaking ? 'Stop reading' : 'Read cast aloud'}
          >
            {currentVoiceSystem.isSpeaking ? (
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

          <div className="space-y-6">
            {/* Cast Content */}
            <div>
              <h2 className="text-lg font-semibold mb-3">Cast Content</h2>
              <div className="bg-gray-50 p-4 rounded-lg border">
                <p className="text-gray-800 leading-relaxed">{castText}</p>
              </div>
            </div>

            {/* Reply Section */}
            <div>
              <h2 className="text-lg font-semibold mb-3">Your Reply</h2>
              <Textarea
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                placeholder="Type your reply here..."
                className="min-h-[100px] resize-none mb-3"
              />
              
              <div className="flex gap-2">
                <Button
                  onClick={handleGetFeedback}
                  disabled={!reply.trim() || getFeedbackMutation.isPending}
                  variant="outline"
                  className="flex-1"
                >
                  {getFeedbackMutation.isPending ? 'Getting Feedback...' : 'Get AI Feedback'}
                </Button>
                
                <Button
                  onClick={handlePolishReply}
                  disabled={!reply.trim() || polishReplyMutation.isPending}
                  variant="outline"
                  className="flex-1"
                >
                  {polishReplyMutation.isPending ? 'Polishing...' : 'Polish Reply'}
                </Button>
              </div>
            </div>

            {/* Feedback Section */}
            {showFeedback && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium">AI Feedback</h3>
                  <button
                    onClick={() => currentVoiceSystem.speak(feedback)}
                    className="p-2 text-purple-600 hover:bg-purple-100 rounded-lg transition-colors"
                    title="Read feedback aloud"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
                      <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
                      <path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
                    </svg>
                  </button>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <p className="text-blue-800 text-sm">{feedback}</p>
                </div>
              </div>
            )}

            {/* Polished Reply Section */}
            {polishedReply && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium">Polished Reply</h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() => currentVoiceSystem.speak(polishedReply)}
                      className="p-2 text-purple-600 hover:bg-purple-100 rounded-lg transition-colors"
                      title="Read polished reply aloud"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
                        <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
                        <path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
                      </svg>
                    </button>
                    <button
                      onClick={() => navigator.clipboard.writeText(polishedReply)}
                      className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                      title="Copy to clipboard"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect width="14" height="14" x="8" y="8" rx="2" ry="2"/>
                        <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
                      </svg>
                    </button>
                  </div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <p className="text-green-800">{polishedReply}</p>
                </div>
              </div>
            )}

            {/* Back Button */}
            <Button
              onClick={() => {
                setCurrentStep('input');
                setCastText('');
                setReply('');
                setFeedback('');
                setPolishedReply('');
                setShowFeedback(false);
                setCastUrl('');
                setInputText('');
              }}
              variant="outline"
              className="w-full"
            >
              Start Over
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}