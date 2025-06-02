import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import useSpeechSynthesis from "@/hooks/useSpeechSynthesis";
import { useMutation } from "@tanstack/react-query";

export default function CastAloud() {
  const [castText, setCastText] = useState("");
  const [userComment, setUserComment] = useState("");
  const [feedback, setFeedback] = useState("");
  const [polishedReply, setPolishedReply] = useState("");
  const [showFeedback, setShowFeedback] = useState(false);
  
  const { speak, isSpeaking, stop } = useSpeechSynthesis();

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
      speak(data.feedback);
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
    }
  });

  const handleReadCast = () => {
    if (isSpeaking) {
      stop();
    } else {
      speak(castText);
    }
  };

  const handleGetFeedback = () => {
    if (userComment.trim()) {
      getFeedbackMutation.mutate(userComment);
    }
  };

  const handleReadFeedback = () => {
    if (feedback) {
      speak(feedback);
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
          <h1 className="text-xl font-semibold text-center">Cast Aloud</h1>
          <p className="text-sm text-gray-600 text-center mt-1">Read and reply to casts with AI assistance</p>
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
              <h3 className="font-medium mb-2">Suggested Improvement:</h3>
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