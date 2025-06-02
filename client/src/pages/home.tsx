import { useQuery } from "@tanstack/react-query";
import { Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import CastDisplay from "@/components/CastDisplay";
import VoiceInterface from "@/components/VoiceInterface";
import useSpeechSynthesis from "@/hooks/useSpeechSynthesis";
import { useState } from "react";
import type { Cast } from "@shared/schema";

export default function Home() {
  const [showVoiceInterface, setShowVoiceInterface] = useState(false);
  const { speak, isSpeaking, stop } = useSpeechSynthesis();

  const { data: cast, isLoading, error } = useQuery<Cast>({
    queryKey: ["/api/cast/current"],
  });

  const handleReadAloud = () => {
    if (cast?.content) {
      if (isSpeaking) {
        stop();
      } else {
        speak(cast.content);
      }
    }
  };

  const handleVoiceReply = () => {
    setShowVoiceInterface(true);
  };

  const handleCloseVoiceInterface = () => {
    setShowVoiceInterface(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <header className="bg-surface shadow-sm border-b border-gray-200 px-4 py-4">
          <div className="max-w-md mx-auto flex items-center justify-between">
            <h1 className="text-xl font-semibold text-text-primary">Voice Assistant</h1>
            <Button variant="ghost" size="icon">
              <Settings className="h-5 w-5 text-text-secondary" />
            </Button>
          </div>
        </header>
        <main className="max-w-md mx-auto px-4 py-6">
          <div className="bg-surface rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="animate-pulse space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gray-300 rounded-full"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-300 rounded w-20"></div>
                  <div className="h-3 bg-gray-300 rounded w-16"></div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-300 rounded"></div>
                <div className="h-4 bg-gray-300 rounded"></div>
                <div className="h-4 bg-gray-300 rounded w-3/4"></div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error || !cast) {
    return (
      <div className="min-h-screen bg-background">
        <header className="bg-surface shadow-sm border-b border-gray-200 px-4 py-4">
          <div className="max-w-md mx-auto flex items-center justify-between">
            <h1 className="text-xl font-semibold text-text-primary">Voice Assistant</h1>
            <Button variant="ghost" size="icon">
              <Settings className="h-5 w-5 text-text-secondary" />
            </Button>
          </div>
        </header>
        <main className="max-w-md mx-auto px-4 py-6">
          <div className="bg-surface rounded-xl shadow-sm border border-gray-200 p-6 text-center">
            <p className="text-error">Failed to load cast. Please try refreshing the page.</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-surface shadow-sm border-b border-gray-200 px-4 py-4">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <h1 className="text-xl font-semibold text-text-primary">Voice Assistant</h1>
          <Button variant="ghost" size="icon">
            <Settings className="h-5 w-5 text-text-secondary" />
          </Button>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 py-6 space-y-6">
        <CastDisplay cast={cast} />

        <div className="space-y-4">
          <Button
            onClick={handleReadAloud}
            className="w-full bg-primary hover:bg-primary-dark text-white font-medium py-4 px-6 rounded-xl h-auto"
            size="lg"
          >
            <span className="flex items-center justify-center space-x-3">
              <i className={`fas ${isSpeaking ? 'fa-pause' : 'fa-volume-up'} text-xl`} aria-hidden="true"></i>
              <span className="text-lg">{isSpeaking ? 'Stop Reading' : 'Read Aloud'}</span>
            </span>
          </Button>

          <Button
            onClick={handleVoiceReply}
            className="w-full bg-success hover:bg-green-600 text-white font-medium py-4 px-6 rounded-xl h-auto"
            size="lg"
          >
            <span className="flex items-center justify-center space-x-3">
              <i className="fas fa-microphone text-xl" aria-hidden="true"></i>
              <span className="text-lg">Voice Reply</span>
            </span>
          </Button>
        </div>

        {showVoiceInterface && (
          <VoiceInterface
            cast={cast}
            onClose={handleCloseVoiceInterface}
          />
        )}

        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-start space-x-3">
            <i className="fas fa-info-circle text-primary text-lg mt-0.5" aria-hidden="true"></i>
            <div>
              <h4 className="font-medium text-text-primary mb-1">Accessibility Tips</h4>
              <ul className="text-sm text-text-secondary space-y-1">
                <li>• Use "Read Aloud" to hear any cast content</li>
                <li>• Voice replies are converted to text automatically</li>
                <li>• All buttons work with screen readers</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
