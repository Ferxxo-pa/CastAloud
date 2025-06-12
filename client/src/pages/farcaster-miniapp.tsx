import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { farcasterSDK, type FarcasterContext } from "@/lib/farcaster-sdk";
import useSpeechSynthesis from "@/hooks/useSpeechSynthesis";
import useVoiceRecording from "@/hooks/useVoiceRecording";

export default function FarcasterMiniApp() {
  const [farcasterContext, setFarcasterContext] = useState<FarcasterContext | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<"listen" | "speak" | "review">("listen");
  const [userReply, setUserReply] = useState("");
  const [polishedReply, setPolishedReply] = useState("");
  
  const { speak, isSpeaking, stop } = useSpeechSynthesis();
  const { startRecording, stopRecording, isRecording, isSupported } = useVoiceRecording();

  // Initialize Farcaster SDK on component mount
  useEffect(() => {
    initializeFarcaster();
  }, []);

  const initializeFarcaster = async () => {
    try {
      console.log('Starting Farcaster Mini App initialization...');
      setIsLoading(true);
      setError(null);
      
      // Send loading message to parent frame
      if (window.parent && window.parent !== window) {
        window.parent.postMessage({
          type: 'miniapp_loading',
          data: { status: 'initializing' }
        }, '*');
      }
      
      const context = await farcasterSDK.initialize();
      setFarcasterContext(context);
      
      // Send ready message to parent frame
      if (window.parent && window.parent !== window) {
        window.parent.postMessage({
          type: 'miniapp_loaded',
          data: { 
            status: 'ready',
            context: context.isFrameContext 
          }
        }, '*');
      }
      
      console.log('Farcaster context initialized:', context);
      
    } catch (err) {
      console.error('Farcaster initialization failed:', err);
      setError('Failed to initialize Farcaster connection');
      
      // Send error message to parent frame
      if (window.parent && window.parent !== window) {
        window.parent.postMessage({
          type: 'miniapp_error',
          data: { error: 'initialization_failed' }
        }, '*');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleReadCast = () => {
    const textToRead = farcasterContext?.cast?.text || "Welcome to Castaloud, your voice accessibility companion for Farcaster!";
    
    if (isSpeaking) {
      stop();
    } else {
      speak(textToRead);
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
      try {
        const formData = new FormData();
        formData.append('audio', audioBlob, 'voice-reply.wav');
        
        const response = await fetch('/api/transcribe', {
          method: 'POST',
          body: formData
        });
        
        if (response.ok) {
          const data = await response.json();
          setUserReply(data.transcription);
          
          // Polish the reply
          const polishResponse = await fetch('/api/get-feedback', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: data.transcription })
          });
          
          if (polishResponse.ok) {
            const polishData = await polishResponse.json();
            setPolishedReply(polishData.polishedText);
          }
          
          setCurrentStep("review");
        }
      } catch (error) {
        console.error('Voice processing failed:', error);
        alert('Failed to process voice recording');
        setCurrentStep("listen");
      }
    }
  };

  const handleCopyReply = () => {
    navigator.clipboard.writeText(polishedReply);
    
    // Send action to parent frame
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

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-lg shadow-lg">
          <div className="p-6 text-center">
            <div className="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <h2 className="text-lg font-semibold mb-2">Loading Castaloud</h2>
            <p className="text-gray-600">Connecting to Farcaster...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-lg shadow-lg">
          <div className="p-6 text-center">
            <div className="text-red-500 text-4xl mb-4">⚠️</div>
            <h2 className="text-lg font-semibold mb-2 text-red-700">Connection Error</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={initializeFarcaster} variant="outline">
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Main Mini App interface
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      <div className="max-w-md mx-auto p-4">
        {/* Header */}
        <Card className="mb-4">
          <CardHeader className="pb-3">
            <CardTitle className="text-center flex items-center justify-center gap-2">
              <span className="text-2xl">🔊</span>
              <span>Castaloud</span>
            </CardTitle>
            <p className="text-sm text-gray-600 text-center">
              Voice accessibility for Farcaster
            </p>
          </CardHeader>
        </Card>

        {/* Connection Status */}
        <Card className="mb-4">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${farcasterContext?.isFrameContext ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
              <div>
                <p className="font-medium">
                  {farcasterContext?.isFrameContext ? 'Connected to Farcaster' : 'Standalone Mode'}
                </p>
                {farcasterContext?.user && (
                  <p className="text-sm text-gray-600">
                    Welcome, {farcasterContext.user.displayName}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cast Content */}
        <Card className="mb-4">
          <CardHeader>
            <CardTitle className="text-lg">Cast Content</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 mb-4">
              {farcasterContext?.cast?.text || "Welcome to Castaloud! This voice accessibility tool helps you read and reply to casts using AI-powered voice technology."}
            </p>
            
            <Button 
              onClick={handleReadCast}
              className="w-full h-12 text-lg"
              variant={isSpeaking ? "secondary" : "default"}
            >
              {isSpeaking ? "🔇 Stop Reading" : "🔊 Read This Cast"}
            </Button>
          </CardContent>
        </Card>

        {/* Voice Reply Section */}
        {currentStep === "listen" && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Voice Reply</CardTitle>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={handleStartVoiceReply}
                className="w-full h-12 text-lg bg-red-500 hover:bg-red-600"
                disabled={!isSupported}
              >
                🎙️ Record Voice Reply
              </Button>
              {!isSupported && (
                <p className="text-sm text-gray-500 mt-2 text-center">
                  Voice recording not supported in this browser
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Recording State */}
        {currentStep === "speak" && (
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-4xl mb-4">🎙️</div>
              <h2 className="font-medium mb-2">Recording...</h2>
              <p className="text-gray-600 mb-4">Speak your reply now</p>
              <Button 
                onClick={handleStopVoiceReply}
                className="w-full h-12 text-lg bg-red-500 hover:bg-red-600"
              >
                ⏹️ Stop Recording
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Review State */}
        {currentStep === "review" && (
          <div className="space-y-4">
            {userReply && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Your Voice Input</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700">{userReply}</p>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Polished Reply</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 mb-4 p-3 bg-gray-50 rounded">
                  {polishedReply || "Processing your reply..."}
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
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}