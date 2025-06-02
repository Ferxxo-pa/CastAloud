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
  const [castText, setCastText] = useState(urlParams.get('text') || '');
  const [reply, setReply] = useState('');
  const [feedback, setFeedback] = useState('');
  const [polishedReply, setPolishedReply] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [voiceType, setVoiceType] = useState<"browser" | "openai">("browser");
  const [isLoading, setIsLoading] = useState(false);

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

  if (!castText) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-white text-2xl">🔊</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Cast Aloud</h1>
            <p className="text-gray-600">Read casts aloud and write better replies</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
            <div className="space-y-3 mb-6">
              <div className="p-4 bg-purple-50 rounded-xl border border-purple-100">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs font-bold">1</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Paste Warpcast Link</p>
                    <p className="text-xs text-gray-600 mt-1">Copy the URL from any Warpcast post</p>
                  </div>
                </div>
              </div>
              
              <div className="text-center">
                <span className="text-xs text-gray-500 bg-white px-3 py-1 rounded-full border">or</span>
              </div>
              
              <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                <div className="flex items-start space-x-3">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Paste Cast Text</p>
                    <p className="text-xs text-gray-600 mt-1">Copy and paste the text content directly</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <button 
                onClick={handlePasteText}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 px-4 rounded-xl transition-colors duration-200"
              >
                Paste Cast Text
              </button>
              

              

              
              {castText && (
                <button className="w-full bg-gray-900 hover:bg-gray-800 text-white font-medium py-3 px-4 rounded-xl transition-colors duration-200">
                  Continue →
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm">🔊</span>
              </div>
              <div>
                <h1 className="text-lg text-gray-900 font-bold">Cast Aloud</h1>
              </div>
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
          {/* Voice Settings */}
          {showSettings && (
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Voice Settings</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Voice Engine</label>
                  <Select value={voiceType} onValueChange={(value: "browser" | "openai") => setVoiceType(value)}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="browser">Browser Voices (Free)</SelectItem>
                      <SelectItem value="openai">OpenAI Voices (Premium)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {voiceType === "browser" && browserVoice.voices.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Browser Voice</label>
                    <Select 
                      value={browserVoice.settings.voice?.name || ""} 
                      onValueChange={(name) => {
                        const voice = browserVoice.voices.find(v => v.name === name);
                        if (voice) {
                          browserVoice.updateSettings({ voice });
                        }
                      }}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a voice" />
                      </SelectTrigger>
                      <SelectContent>
                        {browserVoice.voices.map((voice) => (
                          <SelectItem key={voice.name} value={voice.name}>
                            {voice.name} ({voice.lang})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {voiceType === "openai" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">OpenAI Voice</label>
                    <Select 
                      value={openaiVoice.selectedVoice} 
                      onValueChange={openaiVoice.setSelectedVoice}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {openaiVoice.voices.map((voice) => (
                          <SelectItem key={voice.id} value={voice.id}>
                            {voice.name} - {voice.description}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Speed: {voiceType === "openai" ? openaiVoice.speed.toFixed(1) : browserVoice.settings.rate.toFixed(1)}x
                  </label>
                  <Slider
                    value={voiceType === "openai" ? [openaiVoice.speed] : [browserVoice.settings.rate]}
                    onValueChange={([speed]) => {
                      if (voiceType === "openai") {
                        openaiVoice.setSpeed(speed);
                      } else {
                        browserVoice.updateSettings({ rate: speed });
                      }
                    }}
                    min={voiceType === "openai" ? 0.25 : 0.5}
                    max={voiceType === "openai" ? 4 : 2}
                    step={voiceType === "openai" ? 0.25 : 0.1}
                    className="w-full"
                  />
                </div>

                <button
                  onClick={() => {
                    const testText = "This is a test of your voice settings. How does this sound?";
                    currentVoiceSystem.speak(testText);
                  }}
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-xl transition-colors duration-200"
                >
                  Test Voice
                </button>
              </div>
            </div>
          )}

          {/* Cast Content */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-200">
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

          {/* Reply Section */}
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

          {/* Feedback */}
          {showFeedback && feedback && (
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
          {polishedReply && (
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