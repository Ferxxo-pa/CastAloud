import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function FarcasterMiniApp() {
  const [isLoading, setIsLoading] = useState(true);
  const [farcasterContext, setFarcasterContext] = useState<any>(null);
  const [currentStep, setCurrentStep] = useState<"listen" | "speak" | "review">("listen");
  const [userReply, setUserReply] = useState("");
  const [polishedReply, setPolishedReply] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Initialize Mini App
  useEffect(() => {
    initializeMiniApp();
  }, []);

  const initializeMiniApp = async () => {
    try {
      // Send ready message to Farcaster
      if (window.parent && window.parent !== window) {
        window.parent.postMessage({
          type: 'miniapp_ready',
          data: { 
            name: 'Castaloud',
            version: '1.0.0'
          }
        }, '*');
      }

      // Listen for Farcaster context
      window.addEventListener('message', handleFarcasterMessage);

      // Detect if we're in Farcaster
      const urlParams = new URLSearchParams(window.location.search);
      const isInFarcaster = urlParams.has('fid') || window.parent !== window;

      setFarcasterContext({
        isInFarcaster,
        cast: {
          text: urlParams.get('text') || "Welcome to Castaloud! This voice accessibility tool helps you read and reply to casts using AI-powered voice technology."
        }
      });

      setIsLoading(false);

    } catch (error) {
      console.error('Mini App initialization failed:', error);
      setIsLoading(false);
    }
  };

  const handleFarcasterMessage = (event: MessageEvent) => {
    if (event.data.type === 'farcaster_context') {
      setFarcasterContext((prev: any) => ({
        ...prev,
        ...event.data.data
      }));
    }
  };

  const handleReadCast = () => {
    const textToRead = farcasterContext?.cast?.text || "Welcome to Castaloud!";
    
    if ('speechSynthesis' in window) {
      if (isSpeaking) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
      } else {
        const utterance = new SpeechSynthesisUtterance(textToRead);
        utterance.onend = () => setIsSpeaking(false);
        window.speechSynthesis.speak(utterance);
        setIsSpeaking(true);
      }
    }
  };

  const handleStartVoiceReply = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setCurrentStep("speak");
      setIsRecording(true);
      
      // Simple recording simulation
      setTimeout(() => {
        setIsRecording(false);
        setUserReply("This is a sample voice reply that would be transcribed.");
        setPolishedReply("This is a polished version of your voice reply, enhanced for clarity and engagement.");
        setCurrentStep("review");
        stream.getTracks().forEach(track => track.stop());
      }, 3000);
      
    } catch (error) {
      alert("Voice recording requires microphone access");
    }
  };

  const handleCopyReply = () => {
    navigator.clipboard.writeText(polishedReply);
    
    // Notify Farcaster
    if (window.parent && window.parent !== window) {
      window.parent.postMessage({
        type: 'miniapp_action',
        data: { 
          action: 'copy_reply',
          text: polishedReply
        }
      }, '*');
    }
    
    alert('Reply copied to clipboard!');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-6 text-center max-w-md w-full">
          <div className="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <h2 className="text-lg font-semibold mb-2">Loading Castaloud</h2>
          <p className="text-gray-600">Initializing voice accessibility...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      <div className="max-w-md mx-auto p-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
          <div className="text-center">
            <h1 className="text-xl font-semibold mb-2">
              <span className="text-2xl mr-2">🔊</span>
              Castaloud
            </h1>
            <p className="text-sm text-gray-600">
              Voice accessibility for Farcaster
            </p>
          </div>
        </div>

        {/* Connection Status */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${farcasterContext?.isInFarcaster ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
            <p className="font-medium">
              {farcasterContext?.isInFarcaster ? 'Connected to Farcaster' : 'Standalone Mode'}
            </p>
          </div>
        </div>

        {/* Cast Content */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
          <h2 className="text-lg font-medium mb-3">Cast Content</h2>
          <p className="text-gray-700 mb-4">
            {farcasterContext?.cast?.text}
          </p>
          
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
          <div className="bg-white rounded-lg shadow-sm p-4">
            <h2 className="text-lg font-medium mb-3">Voice Reply</h2>
            <Button 
              onClick={handleStartVoiceReply}
              className="w-full h-12 text-lg bg-red-500 hover:bg-red-600"
            >
              🎙️ Record Voice Reply
            </Button>
          </div>
        )}

        {/* Recording State */}
        {currentStep === "speak" && (
          <div className="bg-white rounded-lg shadow-sm p-6 text-center">
            <div className="text-4xl mb-4">🎙️</div>
            <h2 className="font-medium mb-2">Recording...</h2>
            <p className="text-gray-600 mb-4">Speak your reply now</p>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-red-500 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
            </div>
          </div>
        )}

        {/* Review State */}
        {currentStep === "review" && (
          <div className="space-y-4">
            <div className="bg-white rounded-lg shadow-sm p-4">
              <h3 className="text-lg font-medium mb-3">Your Voice Input</h3>
              <p className="text-gray-700">{userReply}</p>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-4">
              <h3 className="text-lg font-medium mb-3">Polished Reply</h3>
              <p className="text-gray-700 mb-4 p-3 bg-gray-50 rounded">
                {polishedReply}
              </p>
              <div className="space-y-2">
                <Button onClick={handleCopyReply} className="w-full">
                  ✔️ Copy Reply
                </Button>
                <Button 
                  onClick={() => setCurrentStep("speak")} 
                  variant="outline" 
                  className="w-full"
                >
                  🔁 Record Again
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}