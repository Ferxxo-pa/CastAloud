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

  const browserVoice = useSpeechSynthesis();
  const openaiVoice = useOpenAITTS();

  const currentVoiceSystem = voiceType === "openai" ? openaiVoice : browserVoice;

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
    if (currentVoiceSystem.isSpeaking) {
      currentVoiceSystem.stop();
    } else {
      currentVoiceSystem.speak(castText);
    }
  };

  const handleReadFeedback = () => {
    currentVoiceSystem.speak(feedback);
  };

  const handleReadPolishedReply = () => {
    currentVoiceSystem.speak(polishedReply);
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
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
            </div>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="2" rx="1"/>
                <circle cx="7" cy="12" r="1"/>
                <rect x="7" y="5" width="2" height="6" rx="1"/>
                <rect x="15" y="13" width="2" height="6" rx="1"/>
                <rect x="15" y="3" width="2" height="4" rx="1"/>
                <circle cx="16" cy="9" r="1"/>
              </svg>
            </button>
          </div>
        </div>

        <div className="p-4 space-y-4">
          {/* Input Section */}
          {!castText && (
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-2xl">🔊</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Cast Aloud</h1>
              <p className="text-gray-600">Read casts aloud and write better replies</p>
            </div>
          )}

          {!castText && (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 h-[320px]">
              <div className="space-y-4">
                <input
                  type="url"
                  placeholder="Paste Farcaster post URL here..."
                  value={castUrl}
                  onChange={(e) => setCastUrl(e.target.value)}
                  className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-base"
                />

                <div className="flex items-center">
                  <div className="flex-1 border-t border-gray-200"></div>
                  <span className="px-3 text-xs text-gray-500">or</span>
                  <div className="flex-1 border-t border-gray-200"></div>
                </div>

                <textarea
                  placeholder="Or paste the cast text directly here..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  rows={3}
                  className="w-full p-3 border border-gray-200 rounded-xl resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-base"
                />

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
                  className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 text-white font-medium py-3 px-4 rounded-xl transition-colors duration-200"
                >
                  {extractCastMutation.isPending ? 'Loading...' : 'Continue →'}
                </button>
              </div>
            </div>
          )}

          {/* Voice Settings */}
          {showSettings && (
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200">
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
                        checked={voiceType === "browser"}
                        onChange={(e) => setVoiceType(e.target.value as "browser")}
                        className="mr-2"
                      />
                      <label htmlFor="browser-voices" className="text-sm">
                        Browser Voices (Free)
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="radio"
                        id="premium-voices"
                        name="voiceType"
                        value="openai"
                        checked={voiceType === "openai"}
                        onChange={(e) => {
                          if (userTier === "premium") {
                            setVoiceType(e.target.value as "openai");
                          } else {
                            setShowPaymentInfo(true);
                          }
                        }}
                        className="mr-2"
                      />
                      <label htmlFor="premium-voices" className="text-sm flex items-center">
                        Premium AI Voices 
                        {userTier === "free" && (
                          <span className="ml-1 px-2 py-0.5 bg-amber-100 text-amber-800 text-xs rounded-full">
                            Upgrade Required
                          </span>
                        )}
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
                        const testText = "This is a test of your voice settings. How does this sound?";
                        browserVoice.speak(testText);
                      }}
                      className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors duration-200"
                    >
                      Test Voice
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
                        const testText = "This is a test of your premium voice settings. How does this sound?";
                        openaiVoice.speak(testText);
                      }}
                      className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors duration-200"
                    >
                      Test Premium Voice
                    </button>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Payment Information Modal */}
          {showPaymentInfo && (
            <div className="bg-amber-50 rounded-2xl p-4 shadow-sm border border-amber-200">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium text-amber-900">Upgrade to Premium</h3>
                <button
                  onClick={() => setShowPaymentInfo(false)}
                  className="text-amber-600 hover:text-amber-800"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-3 text-sm text-amber-800">
                <p>Get access to premium AI voices with natural speech patterns and multiple language options.</p>
                
                <div className="bg-white rounded-lg p-3 border">
                  <p className="font-medium mb-2">Annual Subscription: $49/year</p>
                  <p className="text-xs mb-2">Send payment to our wallet address:</p>
                  <div className="bg-gray-100 p-2 rounded text-xs font-mono break-all">
                    0x742d35Cc6634C0532925a3b8D497cB2b4af27ab5
                  </div>
                  <p className="text-xs mt-2 text-gray-600">
                    Supports ETH, USDC, USDT. Access granted within 24 hours after payment verification.
                  </p>
                </div>

                <p className="text-xs">
                  Contact support with your wallet address and transaction hash for faster verification.
                </p>
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
              
              <p className="text-gray-800 text-base leading-relaxed mb-4">{castText}</p>
              
              <button 
                onClick={handleReadCast}
                className={`w-full font-medium py-3 px-4 rounded-xl transition-colors duration-200 ${
                  currentVoiceSystem.isSpeaking 
                    ? 'bg-red-500 hover:bg-red-600 text-white' 
                    : 'bg-purple-600 hover:bg-purple-700 text-white'
                }`}
              >
                {currentVoiceSystem.isSpeaking ? 'Stop Reading' : 'Read Aloud'}
              </button>
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
        </div>
      </div>
    </div>
  );
}