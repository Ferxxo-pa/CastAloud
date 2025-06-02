import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import useSpeechSynthesis from "@/hooks/useSpeechSynthesis";
import useOpenAITTS from "@/hooks/useOpenAITTS";
import { useMutation } from "@tanstack/react-query";

export default function CastAloud() {
  const [castText, setCastText] = useState("");
  const [userComment, setUserComment] = useState("");
  const [feedback, setFeedback] = useState("");
  const [polishedReply, setPolishedReply] = useState("");
  const [showFeedback, setShowFeedback] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [voiceType, setVoiceType] = useState<"browser" | "openai">("browser");
  
  const browserVoice = useSpeechSynthesis();
  const openaiVoice = useOpenAITTS();

  const currentVoiceSystem = voiceType === "browser" ? browserVoice : openaiVoice;

  // Get cast text from URL parameters
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const text = urlParams.get('text');
    if (text) {
      setCastText(decodeURIComponent(text));
    }
  }, []);

  const getFeedbackMutation = useMutation({
    mutationFn: async (text: string) => {
      const response = await fetch("/api/get-feedback", {
        method: "POST",
        body: JSON.stringify({ text }),
        headers: { "Content-Type": "application/json" }
      });
      return response.json();
    },
    onSuccess: (data) => {
      setFeedback(data.feedback);
      setPolishedReply(data.polishedText);
      setShowFeedback(true);
      // Read the feedback aloud
      currentVoiceSystem.speak(data.feedback);
    }
  });

  const polishReplyMutation = useMutation({
    mutationFn: async (text: string) => {
      const response = await fetch("/api/polish-reply", {
        method: "POST",
        body: JSON.stringify({ text }),
        headers: { "Content-Type": "application/json" }
      });
      return response.json();
    },
    onSuccess: (data) => {
      setPolishedReply(data.polishedText);
      // Read the suggested improvement aloud
      setTimeout(() => {
        currentVoiceSystem.speak("Here's the suggested improvement: " + data.polishedText);
      }, 500);
    }
  });

  const handleReadCast = () => {
    if (currentVoiceSystem.isSpeaking) {
      currentVoiceSystem.stop();
    } else {
      currentVoiceSystem.speak(castText);
    }
  };

  const handleGetFeedback = () => {
    if (userComment.trim()) {
      getFeedbackMutation.mutate(userComment);
    }
  };

  const handleReadFeedback = () => {
    if (feedback) {
      currentVoiceSystem.speak(feedback);
    }
  };

  const handlePolishReply = () => {
    polishReplyMutation.mutate(userComment);
  };

  const handleCopyReply = () => {
    navigator.clipboard.writeText(polishedReply);
    alert('Reply copied to clipboard!');
  };

  if (!castText) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-xl font-semibold mb-4">Cast Aloud</h1>
          <p className="text-gray-600 mb-4">No cast content found. Add text with ?text= parameter.</p>
          <p className="text-sm text-gray-500">Example: /cast-aloud?text=Your cast content here</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-md mx-auto p-4">
        <header className="mb-6">
          <div className="flex items-center justify-between">
            <div className="text-center flex-1">
              <h1 className="text-xl font-semibold">Cast Aloud</h1>
              <p className="text-sm text-gray-600 mt-1">Read and reply to casts with AI assistance</p>
            </div>
            <Button
              onClick={() => setShowSettings(!showSettings)}
              variant="outline"
              size="sm"
              className="ml-4"
            >
              ⚙️ Voice
            </Button>
          </div>
        </header>

        {/* Voice Settings */}
        {showSettings && (
          <div className="bg-white rounded-lg p-4 mb-6 border">
            <h3 className="font-medium mb-4">Voice Settings</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Voice Engine:</label>
                <Select value={voiceType} onValueChange={(value: "browser" | "openai") => setVoiceType(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="browser">Browser Voices (Free)</SelectItem>
                    <SelectItem value="openai">OpenAI Voices (High Quality)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {voiceType === "browser" && browserVoice.voices.length > 0 && (
                <div>
                  <label className="block text-sm font-medium mb-2">Browser Voice:</label>
                  <Select 
                    value={browserVoice.settings.voice?.name || ""} 
                    onValueChange={(name) => {
                      const voice = browserVoice.voices.find(v => v.name === name);
                      if (voice) {
                        browserVoice.updateSettings({ voice });
                      }
                    }}
                  >
                    <SelectTrigger>
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
                  <label className="block text-sm font-medium mb-2">OpenAI Voice:</label>
                  <Select 
                    value={openaiVoice.selectedVoice} 
                    onValueChange={openaiVoice.setSelectedVoice}
                  >
                    <SelectTrigger>
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

              {voiceType === "browser" && (
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Speed: {browserVoice.settings.rate.toFixed(1)}x
                  </label>
                  <Slider
                    value={[browserVoice.settings.rate]}
                    onValueChange={([rate]) => browserVoice.updateSettings({ rate })}
                    min={0.5}
                    max={2}
                    step={0.1}
                    className="w-full"
                  />
                </div>
              )}

              {voiceType === "openai" && (
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Speed: {openaiVoice.speed.toFixed(1)}x
                  </label>
                  <Slider
                    value={[openaiVoice.speed]}
                    onValueChange={([speed]) => openaiVoice.setSpeed(speed)}
                    min={0.25}
                    max={4}
                    step={0.25}
                    className="w-full"
                  />
                </div>
              )}

              <Button
                onClick={() => {
                  const testText = "This is a test of your voice settings. How does this sound?";
                  currentVoiceSystem.speak(testText);
                }}
                variant="outline"
                className="w-full"
              >
                🔊 Test Voice
              </Button>
            </div>
          </div>
        )}

        {/* Cast Content */}
        <div className="bg-white rounded-lg p-4 mb-6 border">
          <h2 className="font-medium mb-2">Cast Content:</h2>
          <p className="text-gray-700 mb-4">{castText}</p>
          
          <Button 
            onClick={handleReadCast}
            className="w-full h-12 text-lg"
            variant={currentVoiceSystem.isSpeaking ? "secondary" : "default"}
          >
            {currentVoiceSystem.isSpeaking ? "🔇 Stop Reading" : "🔊 Read This Cast"}
          </Button>
        </div>

        {/* Comment Input */}
        <div className="bg-white rounded-lg p-4 mb-6 border">
          <h2 className="font-medium mb-2">Write Your Reply:</h2>
          <Textarea 
            value={userComment}
            onChange={(e) => setUserComment(e.target.value)}
            placeholder="Type your reply here..."
            className="mb-4"
            rows={4}
          />
          
          <div className="space-y-2">
            <Button 
              onClick={handleGetFeedback}
              className="w-full"
              disabled={!userComment.trim() || getFeedbackMutation.isPending}
            >
              {getFeedbackMutation.isPending ? "Getting Feedback..." : "💬 Get AI Feedback"}
            </Button>
          </div>
        </div>

        {/* Feedback Section */}
        {showFeedback && (
          <div className="space-y-4">
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-blue-900">AI Feedback:</h3>
                <Button 
                  onClick={handleReadFeedback}
                  size="sm"
                  variant="outline"
                  className="text-blue-700 border-blue-300"
                >
                  🔊 Read Aloud
                </Button>
              </div>
              <p className="text-blue-800 text-sm">{feedback}</p>
            </div>

            <div className="bg-white rounded-lg p-4 border">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium">Suggested Improvement:</h3>
                <Button 
                  onClick={() => currentVoiceSystem.speak(polishedReply)}
                  size="sm"
                  variant="outline"
                  className="text-blue-700 border-blue-300"
                >
                  🔊 Read Aloud
                </Button>
              </div>
              <Textarea 
                value={polishedReply}
                onChange={(e) => setPolishedReply(e.target.value)}
                className="mb-4"
                rows={4}
              />
              <div className="space-y-2">
                <Button onClick={handleCopyReply} className="w-full">
                  ✔️ Copy Reply
                </Button>
                <Button 
                  onClick={handlePolishReply} 
                  variant="outline" 
                  className="w-full"
                  disabled={polishReplyMutation.isPending}
                >
                  🤖 Polish Again
                </Button>
                <Button 
                  onClick={() => {
                    setUserComment("");
                    setFeedback("");
                    setPolishedReply("");
                    setShowFeedback(false);
                  }} 
                  variant="outline" 
                  className="w-full"
                >
                  🔄 Start Over
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}