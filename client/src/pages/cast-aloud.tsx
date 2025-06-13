import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import useSpeechSynthesis from "@/hooks/useSpeechSynthesis";
import useOpenAITTS from "@/hooks/useOpenAITTS";
import { apiRequest } from "@/lib/queryClient";

export default function CastAloud() {
  const urlParams = new URLSearchParams(window.location.search);
  const [castText, setCastText] = useState('');
  const [inputText, setInputText] = useState('');
  const [castUrl, setCastUrl] = useState('');
  const [reply, setReply] = useState('');
  const [feedback, setFeedback] = useState('');
  const [polishedReply, setPolishedReply] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [voiceType, setVoiceType] = useState<"browser" | "openai">("browser");
  const [isLoading, setIsLoading] = useState(false);
  const [userTier, setUserTier] = useState<"free" | "premium">("free");
  const [showPaymentInfo, setShowPaymentInfo] = useState(false);
  const [isTextExpanded, setIsTextExpanded] = useState(false);
  const [currentWordIndex, setCurrentWordIndex] = useState(-1);
  const [speechWords, setSpeechWords] = useState<string[]>([]);
  const [isPaused, setIsPaused] = useState(false);
  const [speechUtterance, setSpeechUtterance] = useState<SpeechSynthesisUtterance | null>(null);
  const [isCurrentlyReading, setIsCurrentlyReading] = useState(false);

  const browserVoice = useSpeechSynthesis();
  const openaiVoice = useOpenAITTS();

  const currentVoiceSystem = voiceType === "openai" ? openaiVoice : browserVoice;

  // Function to clean text for speech synthesis
  const cleanTextForSpeech = (text: string): string => {
    return text
      // Remove URLs
      .replace(/https?:\/\/[^\s]+/g, '')
      // Remove hashtags but keep the word
      .replace(/#(\w+)/g, '$1')
      // Remove mentions but keep the username
      .replace(/@(\w+)/g, '$1')
      // Replace common special characters with spoken equivalents
      .replace(/&/g, 'and')
      .replace(/\$/g, 'dollar')
      .replace(/%/g, 'percent')
      .replace(/\+/g, 'plus')
      .replace(/=/g, 'equals')
      // Remove other special characters except basic punctuation
      .replace(/[^\w\s.,!?;:'"()-]/g, ' ')
      // Clean up multiple spaces
      .replace(/\s+/g, ' ')
      .trim();
  };

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
    }
  });

  const handleReadCast = () => {
    if (isCurrentlyReading) {
      handleStopReading();
    } else {
      const cleanedText = cleanTextForSpeech(castText);
      const words = cleanedText.split(/\s+/).filter(word => word.length > 0);
      setSpeechWords(words);
      setCurrentWordIndex(0);
      setIsPaused(false);
      setIsCurrentlyReading(true);
      
      if (voiceType === "browser" && 'speechSynthesis' in window) {
        // Use Web Speech API with word boundary events
        const utterance = new SpeechSynthesisUtterance(cleanedText);
        if (browserVoice.settings.voice) {
          utterance.voice = browserVoice.settings.voice;
        }
        utterance.rate = browserVoice.settings.rate;
        utterance.pitch = browserVoice.settings.pitch;
        utterance.volume = browserVoice.settings.volume;
        
        let wordIndex = 0;
        utterance.onboundary = (event) => {
          if (event.name === 'word') {
            // Highlight the word that's about to be spoken
            setCurrentWordIndex(wordIndex);
            wordIndex++;
          }
        };
        
        // Start highlighting the first word immediately
        utterance.onstart = () => {
          setCurrentWordIndex(0);
          wordIndex = 1; // Next word boundary will be word 1
        };
        
        utterance.onend = () => {
          setCurrentWordIndex(-1);
          setSpeechWords([]);
          setSpeechUtterance(null);
          setIsPaused(false);
          setIsCurrentlyReading(false);
        };
        
        utterance.onerror = () => {
          setCurrentWordIndex(-1);
          setSpeechWords([]);
          setSpeechUtterance(null);
          setIsPaused(false);
          setIsCurrentlyReading(false);
        };
        
        setSpeechUtterance(utterance);
        speechSynthesis.speak(utterance);
      } else {
        // For OpenAI TTS, simulate word highlighting with timing
        currentVoiceSystem.speak(cleanedText);
        simulateWordHighlighting(words);
      }
    }
  };

  const handleStopReading = () => {
    currentVoiceSystem.stop();
    setCurrentWordIndex(-1);
    setSpeechWords([]);
    setSpeechUtterance(null);
    setIsPaused(false);
    setIsCurrentlyReading(false);
  };

  const handlePauseResume = () => {
    if (voiceType === "browser" && 'speechSynthesis' in window) {
      if (isPaused) {
        speechSynthesis.resume();
        setIsPaused(false);
      } else {
        speechSynthesis.pause();
        setIsPaused(true);
      }
    } else {
      // For OpenAI TTS, we can only stop/start (no pause functionality)
      if (currentVoiceSystem.isSpeaking) {
        currentVoiceSystem.stop();
        setIsPaused(true);
      }
    }
  };
  
  const simulateWordHighlighting = (words: string[]) => {
    // More accurate timing calculation based on actual speech synthesis behavior
    const baseWordsPerMinute = 180; // Adjusted base rate
    const speedMultiplier = voiceType === "browser" ? browserVoice.settings.rate : openaiVoice.speed;
    
    // Apply non-linear speed adjustment to match browser behavior
    let adjustedSpeed;
    if (speedMultiplier <= 1) {
      // For slower speeds, use exponential curve
      adjustedSpeed = baseWordsPerMinute * Math.pow(speedMultiplier, 0.8);
    } else {
      // For faster speeds, use linear scaling
      adjustedSpeed = baseWordsPerMinute * speedMultiplier;
    }
    
    const millisecondsPerWord = (60 * 1000) / adjustedSpeed;
    
    words.forEach((_, index) => {
      setTimeout(() => {
        if (isCurrentlyReading) {
          setCurrentWordIndex(index);
        }
      }, index * millisecondsPerWord);
    });
    
    // Clear highlighting when done
    setTimeout(() => {
      setCurrentWordIndex(-1);
      setSpeechWords([]);
      setIsCurrentlyReading(false);
    }, words.length * millisecondsPerWord + 300);
  };

  const handleReadFeedback = () => {
    const cleanedText = cleanTextForSpeech(feedback);
    currentVoiceSystem.speak(cleanedText);
  };

  const handleReadPolishedReply = () => {
    const cleanedText = cleanTextForSpeech(polishedReply);
    currentVoiceSystem.speak(cleanedText);
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

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  const handleExtractCast = () => {
    if (castUrl.trim()) {
      extractCastMutation.mutate(castUrl.trim());
    }
  };

  const handlePasteText = () => {
    navigator.clipboard.readText().then(text => {
      if (text.includes('warpcast.com') || text.includes('farcaster')) {
        // It's a URL, extract the cast content
        handleUrlInput(text);
      } else {
        // It's text content
        setCastText(text);
      }
    }).catch(() => {
      alert('Please paste text manually in the box below');
    });
  };

  const handleUrlInput = async (url: string) => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/extract-cast', {
        method: 'POST',
        body: JSON.stringify({ url }),
        headers: { "Content-Type": "application/json" }
      });
      const data = await response.json();
      if (data.text) {
        setCastText(data.text);
      } else {
        alert('Could not extract text from this URL. Please paste the text manually.');
      }
    } catch (error) {
      alert('Error extracting text from URL. Please paste the text manually.');
    } finally {
      setIsLoading(false);
    }
  };



  return (
    <div className="min-h-screen bg-fc-gray-50">
      <div className="max-w-md mx-auto">


        <div className="p-4">
          <header className="mb-6">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-fc-gray-900">Castaloud</h1>
              <p className="text-fc-gray-600 mt-2">
                Accessibility tools for reading and replying to casts
              </p>
            </div>
          </header>

          <div className="space-y-4">
            {/* Input Section */}
            {!castText && (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-fc-gray-200 h-[320px]">
              <div className="space-y-4">
                <input
                  type="url"
                  placeholder="Paste Farcaster post URL here..."
                  value={castUrl}
                  onChange={(e) => setCastUrl(e.target.value)}
                  className="w-full p-3 border border-fc-gray-200 rounded-xl focus:ring-2 focus:ring-fc-purple focus:border-transparent text-base"
                />

                <div className="flex items-center">
                  <div className="flex-1 border-t border-fc-gray-200"></div>
                  <span className="px-3 text-xs text-fc-gray-500">or</span>
                  <div className="flex-1 border-t border-fc-gray-200"></div>
                </div>

                <div className="space-y-2">
                  <textarea
                    placeholder="Or paste the cast text directly here..."
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    maxLength={50000}
                    rows={3}
                    className="w-full p-3 border border-fc-gray-200 rounded-xl resize-none focus:ring-2 focus:ring-fc-purple focus:border-transparent text-base"
                  />
                  <div className="flex justify-end">
                    <span className={`text-xs ${
                      inputText.length > 45000 
                        ? 'text-red-500' 
                        : inputText.length > 40000 
                        ? 'text-yellow-600' 
                        : 'text-fc-gray-500'
                    }`}>
                      {inputText.length}/50,000 characters
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    if (castUrl.trim()) {
                      handleExtractCast();
                    } else if (inputText.trim()) {
                      setCastText(inputText.trim());
                      setInputText('');
                    }
                  }}
                  disabled={!(castUrl.trim() || inputText.trim()) || extractCastMutation.isPending}
                  className="w-full bg-fc-purple hover:bg-fc-purple-dark disabled:bg-fc-gray-300 text-white font-medium py-3 px-4 rounded-xl transition-colors duration-200"
                >
                  {extractCastMutation.isPending ? 'Loading...' : 'Continue →'}
                </button>
              </div>
            </div>
          )}







          {/* Cast Content */}
          {castText && (
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <button
                  onClick={() => {
                    setCastText('');
                    setCastUrl('');
                  }}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  ← Load different post
                </button>
              </div>
              
              <div className="text-gray-800 text-base leading-relaxed mb-4">
                {(() => {
                  const maxLength = 300; // Show first 300 characters
                  const shouldTruncate = castText.length > maxLength;
                  
                  // Function to render text with highlighting
                  const renderHighlightedText = (text: string) => {
                    if (currentWordIndex === -1 || speechWords.length === 0) {
                      return <p>{text}</p>;
                    }
                    
                    const displayWords = text.split(/\s+/).filter(word => word.length > 0);
                    return (
                      <p>
                        {displayWords.map((word, index) => (
                          <span
                            key={index}
                            className={`${
                              index === currentWordIndex 
                                ? 'bg-yellow-200 px-1 rounded transition-colors duration-200' 
                                : ''
                            }`}
                          >
                            {word}
                            {index < displayWords.length - 1 ? ' ' : ''}
                          </span>
                        ))}
                      </p>
                    );
                  };
                  
                  if (!shouldTruncate) {
                    return renderHighlightedText(castText);
                  }
                  
                  if (isTextExpanded) {
                    return (
                      <div>
                        {renderHighlightedText(castText)}
                        <button
                          onClick={() => setIsTextExpanded(false)}
                          className="text-fc-purple hover:text-fc-purple-dark text-sm font-medium mt-2 flex items-center gap-1"
                        >
                          Show less
                        </button>
                      </div>
                    );
                  }
                  
                  return (
                    <div>
                      {renderHighlightedText(castText.substring(0, maxLength) + "...")}
                      <button
                        onClick={() => setIsTextExpanded(true)}
                        className="text-fc-purple hover:text-fc-purple-dark text-sm font-medium mt-2 flex items-center gap-1"
                      >
                        <span>Show more</span>
                        <span>...</span>
                      </button>
                    </div>
                  );
                })()}
              </div>
              
              {isCurrentlyReading ? (
                <div className="flex gap-2">
                  <button 
                    onClick={handleStopReading}
                    className="flex-1 bg-red-500 hover:bg-red-600 text-white font-medium py-3 px-4 rounded-xl transition-colors duration-200"
                  >
                    Stop Reading
                  </button>
                  {voiceType === "browser" && (
                    <button 
                      onClick={handlePauseResume}
                      className="bg-fc-purple hover:bg-fc-purple-dark text-white font-medium py-3 px-3 rounded-xl transition-colors duration-200 min-w-[80px]"
                    >
                      {isPaused ? '▶️' : '⏸️'}
                    </button>
                  )}
                </div>
              ) : (
                <button 
                  onClick={handleReadCast}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 px-4 rounded-xl transition-colors duration-200"
                >
                  Read Aloud
                </button>
              )}
            </div>
          )}

          {/* Reply Section */}
          {castText && (
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Write a reply</h2>
            
            <textarea
              placeholder="What's your reply?"
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              rows={3}
              className="w-full p-3 border border-gray-200 rounded-xl resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-base"
            />
            
            <div className="flex space-x-2 mt-3">
              <button
                onClick={handleGetFeedback}
                disabled={!reply.trim() || getFeedbackMutation.isPending}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-medium py-2 px-4 rounded-xl transition-colors duration-200"
              >
                {getFeedbackMutation.isPending ? 'Getting feedback...' : 'Get Feedback'}
              </button>
              
              <button
                onClick={handlePolishReply}
                disabled={!reply.trim() || polishReplyMutation.isPending}
                className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white font-medium py-2 px-4 rounded-xl transition-colors duration-200"
              >
                {polishReplyMutation.isPending ? 'Polishing...' : 'Polish Reply'}
              </button>
            </div>
            </div>
          )}

          {/* Feedback */}
          {showFeedback && feedback && castText && (
            <div className="bg-blue-50 rounded-2xl p-5 border border-blue-200">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-blue-900">AI Feedback</h3>
                <button
                  onClick={handleReadFeedback}
                  className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded-lg transition-colors"
                >
                  🔊
                </button>
              </div>
              <p className="text-blue-800 text-sm leading-relaxed">{feedback}</p>
            </div>
          )}

          {/* Polished Reply */}
          {polishedReply && castText && (
            <div className="bg-green-50 rounded-2xl p-5 border border-green-200">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-green-900">Suggested Reply</h3>
                <div className="flex space-x-2">
                  <button
                    onClick={handleReadPolishedReply}
                    className="p-2 text-green-600 hover:text-green-800 hover:bg-green-100 rounded-lg transition-colors"
                  >
                    🔊
                  </button>
                  <button
                    onClick={() => copyToClipboard(polishedReply)}
                    className="p-2 text-green-600 hover:text-green-800 hover:bg-green-100 rounded-lg transition-colors"
                  >
                    📋
                  </button>
                </div>
              </div>
              <p className="text-green-800 text-sm leading-relaxed">{polishedReply}</p>
            </div>
          )}

          {/* Voice Settings at Bottom */}
          <div className="mt-8 pt-4 border-t border-fc-gray-200">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="w-full flex items-center justify-center gap-2 p-3 bg-fc-gray-100 text-fc-gray-700 hover:bg-fc-purple hover:text-white rounded-xl transition-colors duration-200"
            >
              <span className="text-xl">⚙️</span>
              <span className="text-sm font-medium">Voice Settings</span>
            </button>

            {showSettings && (
              <div className="mt-3 bg-white rounded-2xl p-4 shadow-sm border border-fc-gray-200">
                <h3 className="font-medium mb-3 text-fc-gray-900">Voice Settings</h3>
                
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
                          checked={voiceType === "browser"}
                          onChange={(e) => setVoiceType(e.target.value as "browser")}
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

                  {voiceType === "browser" && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Voice</label>
                        <select 
                          value={browserVoice.settings.voice?.name || ''}
                          onChange={(e) => {
                            const voice = browserVoice.voices.find(v => v.name === e.target.value);
                            if (voice) {
                              browserVoice.updateSettings({ voice });
                            }
                          }}
                          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        >
                          {browserVoice.voices.map((voice) => (
                            <option key={voice.name} value={voice.name}>
                              {voice.name} ({voice.lang})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Speed: {browserVoice.settings.rate.toFixed(1)}x
                        </label>
                        <input
                          type="range"
                          min="0.5"
                          max="2"
                          step="0.1"
                          value={browserVoice.settings.rate}
                          onChange={(e) => browserVoice.updateSettings({ rate: parseFloat(e.target.value) })}
                          className="w-full"
                        />
                      </div>

                      <button
                        onClick={() => {
                          if (browserVoice.isSpeaking) {
                            browserVoice.stop();
                          } else {
                            const testText = "This is a test of your voice settings. How does this sound?";
                            browserVoice.speak(testText);
                          }
                        }}
                        className={`w-full font-medium py-2 px-4 rounded-lg transition-colors duration-200 ${
                          browserVoice.isSpeaking 
                            ? 'bg-red-500 hover:bg-red-600 text-white' 
                            : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                        }`}
                      >
                        {browserVoice.isSpeaking ? 'Stop' : 'Test Voice'}
                      </button>
                    </>
                  )}

                  {voiceType === "openai" && userTier === "premium" && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Premium Voice</label>
                        <select 
                          value={openaiVoice.selectedVoice}
                          onChange={(e) => openaiVoice.setSelectedVoice(e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        >
                          {openaiVoice.voices.map((voice) => (
                            <option key={voice.id} value={voice.id}>
                              {voice.name} - {voice.description}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Speed: {openaiVoice.speed.toFixed(1)}x
                        </label>
                        <input
                          type="range"
                          min="0.25"
                          max="4"
                          step="0.25"
                          value={openaiVoice.speed}
                          onChange={(e) => openaiVoice.setSpeed(parseFloat(e.target.value))}
                          className="w-full"
                        />
                      </div>

                      <button
                        onClick={() => {
                          if (openaiVoice.isSpeaking) {
                            openaiVoice.stop();
                          } else {
                            const testText = "This is a test of your premium voice settings. How does this sound?";
                            openaiVoice.speak(testText);
                          }
                        }}
                        className={`w-full font-medium py-2 px-4 rounded-lg transition-colors duration-200 ${
                          openaiVoice.isSpeaking 
                            ? 'bg-red-500 hover:bg-red-600 text-white' 
                            : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                        }`}
                      >
                        {openaiVoice.isSpeaking ? 'Stop' : 'Test Premium Voice'}
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
          </div>
        </div>
      </div>
    </div>
  );
}