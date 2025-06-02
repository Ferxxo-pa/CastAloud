import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import useSpeechSynthesis from "@/hooks/useSpeechSynthesis";
import useVoiceRecording from "@/hooks/useVoiceRecording";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export default function MiniApp() {
  const [castText, setCastText] = useState("");
  const [userReply, setUserReply] = useState("");
  const [polishedReply, setPolishedReply] = useState("");
  const [currentStep, setCurrentStep] = useState<"listen" | "speak" | "review">("listen");
  
  const { speak, isSpeaking, stop } = useSpeechSynthesis();
  const { startRecording, stopRecording, isRecording, isSupported } = useVoiceRecording();

  // Get cast text from URL parameters
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const text = urlParams.get('text');
    if (text) {
      setCastText(decodeURIComponent(text));
    }
  }, []);

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
      setCurrentStep("review");
    }
  });

  const handleReadCast = () => {
    if (isSpeaking) {
      stop();
    } else {
      speak(castText);
    }
  };

  const handleStartVoiceReply = async () => {
    if (!isSupported) {
      alert("Voice recording is not supported in your browser");
      return;
    }
    
    setCurrentStep("speak");
    await startRecording();
  };

  const handleStopVoiceReply = async () => {
    const audioBlob = await stopRecording();
    if (audioBlob) {
      // Send audio to backend for transcription
      const formData = new FormData();
      formData.append('audio', audioBlob, 'voice-reply.wav');
      
      try {
        const response = await fetch('/api/transcribe', {
          method: 'POST',
          body: formData
        });
        const data = await response.json();
        setUserReply(data.transcription);
        
        // Automatically polish the reply
        polishReplyMutation.mutate(data.transcription);
      } catch (error) {
        console.error('Transcription failed:', error);
        alert('Failed to process voice recording');
      }
    }
  };

  const handleRewordReply = () => {
    polishReplyMutation.mutate(userReply);
  };

  const handleCopyReply = () => {
    navigator.clipboard.writeText(polishedReply);
    alert('Reply copied to clipboard!');
  };

  if (!castText) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-xl font-semibold mb-4">Farcaster Voice Assistant</h1>
          <p className="text-gray-600">No cast content found. Please access this app with a cast link.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-md mx-auto p-4">
        <header className="mb-6">
          <h1 className="text-xl font-semibold text-center">Cast Aloud</h1>
          <p className="text-sm text-gray-600 text-center mt-1">Read and reply to casts with voice</p>
        </header>

        {/* Cast Content */}
        <div className="bg-white rounded-lg p-4 mb-6 border">
          <h2 className="font-medium mb-2">Cast Content:</h2>
          <p className="text-gray-700 mb-4">{castText}</p>
          
          <Button 
            onClick={handleReadCast}
            className="w-full h-12 text-lg"
            variant={isSpeaking ? "secondary" : "default"}
          >
            {isSpeaking ? "🔇 Stop Reading" : "🔊 Read This Cast"}
          </Button>
        </div>

        {/* Voice Reply Section */}
        {currentStep === "listen" && (
          <div className="bg-white rounded-lg p-4 mb-6 border">
            <h2 className="font-medium mb-4">Reply with Voice:</h2>
            <Button 
              onClick={handleStartVoiceReply}
              className="w-full h-12 text-lg bg-red-500 hover:bg-red-600"
              disabled={!isSupported}
            >
              🎙️ Speak a Reply
            </Button>
            {!isSupported && (
              <p className="text-sm text-gray-500 mt-2">Voice recording not supported in this browser</p>
            )}
          </div>
        )}

        {/* Recording State */}
        {currentStep === "speak" && (
          <div className="bg-white rounded-lg p-4 mb-6 border">
            <div className="text-center">
              <div className="text-4xl mb-4">🎙️</div>
              <h2 className="font-medium mb-2">Recording...</h2>
              <p className="text-gray-600 mb-4">Speak your reply now</p>
              <Button 
                onClick={handleStopVoiceReply}
                className="w-full h-12 text-lg bg-red-500 hover:bg-red-600"
              >
                ⏹️ Stop Recording
              </Button>
            </div>
          </div>
        )}

        {/* Review State */}
        {currentStep === "review" && (
          <div className="space-y-4">
            {userReply && (
              <div className="bg-white rounded-lg p-4 border">
                <h3 className="font-medium mb-2">Your Voice Input:</h3>
                <p className="text-gray-700 text-sm">{userReply}</p>
              </div>
            )}

            <div className="bg-white rounded-lg p-4 border">
              <h3 className="font-medium mb-2">Polished Reply:</h3>
              {polishReplyMutation.isPending ? (
                <div className="text-center py-4">
                  <div className="text-2xl mb-2">🤖</div>
                  <p>AI is polishing your reply...</p>
                </div>
              ) : (
                <>
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
                      onClick={handleRewordReply} 
                      variant="outline" 
                      className="w-full"
                      disabled={polishReplyMutation.isPending}
                    >
                      🤖 Reword It
                    </Button>
                    <Button 
                      onClick={() => setCurrentStep("speak")} 
                      variant="outline" 
                      className="w-full"
                    >
                      🔁 Try Again
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}