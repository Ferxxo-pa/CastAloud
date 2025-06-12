import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import CastDisplay from "@/components/CastDisplay";
import VoiceInterface from "@/components/VoiceInterface";
import OpenAIVoiceSettings from "@/components/OpenAIVoiceSettings";
import useOpenAITTS from "@/hooks/useOpenAITTS";
import { useState } from "react";
import type { Cast } from "@shared/schema";

export default function Home() {
  const [showVoiceInterface, setShowVoiceInterface] = useState<{ show: boolean; cast?: Cast }>({ show: false });
  const { speak, isSpeaking, stop, voices, selectedVoice, setSelectedVoice } = useOpenAITTS();

  const { data: feed, isLoading, error } = useQuery<Cast[]>({
    queryKey: ["/api/feed"],
  });

  const handleReadAloud = (cast: Cast) => {
    if (cast?.content) {
      if (isSpeaking) {
        stop();
      } else {
        speak(cast.content);
      }
    }
  };

  const handleVoiceReply = (cast: Cast) => {
    setShowVoiceInterface({ show: true, cast });
  };

  const handleCloseVoiceInterface = () => {
    setShowVoiceInterface({ show: false });
  };

  const handleTestVoice = () => {
    speak("This is a test of your OpenAI voice settings. How does this sound?");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-fc-gray-50">
        <header className="bg-white shadow-sm border-b border-fc-gray-200 px-4 py-3">
          <div className="max-w-md mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-fc-purple rounded-lg flex items-center justify-center">
                <i className="fas fa-volume-up text-white text-sm" aria-hidden="true"></i>
              </div>
              <h1 className="text-lg font-semibold text-fc-gray-900">Farcaster Voice</h1>
            </div>
            <VoiceSettings
              voices={voices}
              settings={settings}
              updateSettings={updateSettings}
              onTestVoice={handleTestVoice}
            />
          </div>
        </header>
        <main className="max-w-md mx-auto px-4 py-4">
          <div className="bg-white rounded-xl border border-fc-gray-200 p-6">
            <div className="animate-pulse space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
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

  if (error || !feed) {
    return (
      <div className="min-h-screen bg-fc-gray-50">
        <header className="bg-white shadow-sm border-b border-fc-gray-200 px-4 py-3">
          <div className="max-w-md mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-fc-purple rounded-lg flex items-center justify-center">
                <i className="fas fa-volume-up text-white text-sm" aria-hidden="true"></i>
              </div>
              <h1 className="text-lg font-semibold text-fc-gray-900">Farcaster Voice</h1>
            </div>
            <VoiceSettings
              voices={voices}
              settings={settings}
              updateSettings={updateSettings}
              onTestVoice={handleTestVoice}
            />
          </div>
        </header>
        <main className="max-w-md mx-auto px-4 py-4">
          <div className="bg-white rounded-xl border border-fc-gray-200 p-6 text-center">
            <p className="text-fc-error">To access your Farcaster feed, please upgrade your Neynar plan to include API access.</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-fc-gray-50">
      <header className="bg-white shadow-sm border-b border-fc-gray-200 px-4 py-3">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-fc-purple rounded-lg flex items-center justify-center">
              <i className="fas fa-volume-up text-white text-sm" aria-hidden="true"></i>
            </div>
            <h1 className="text-lg font-semibold text-fc-gray-900">Farcaster Feed</h1>
          </div>
          <VoiceSettings
            voices={voices}
            settings={settings}
            updateSettings={updateSettings}
            onTestVoice={handleTestVoice}
          />
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 py-4 space-y-4">
        {feed.map((cast, index) => (
          <div key={cast.hash || index} className="bg-white rounded-xl border border-fc-gray-200 overflow-hidden relative">
            <CastDisplay cast={cast} />
            
            {/* Accessibility buttons positioned in bottom right corner */}
            <div className="absolute bottom-3 right-3 flex space-x-1">
              <Button
                onClick={() => handleReadAloud(cast)}
                className="w-8 h-8 bg-fc-purple hover:bg-fc-purple-dark text-white rounded-lg flex items-center justify-center shadow-sm border-0"
                size="sm"
                title={isSpeaking ? 'Stop reading' : 'Read aloud'}
              >
                <span className="text-sm">🔊</span>
              </Button>

              <Button
                onClick={() => handleVoiceReply(cast)}
                className="w-8 h-8 bg-fc-success hover:bg-green-700 text-white rounded-lg flex items-center justify-center shadow-sm border-0"
                size="sm"
                title="Voice reply"
              >
                <span className="text-sm">🎙️</span>
              </Button>
            </div>
          </div>
        ))}

        {showVoiceInterface.show && showVoiceInterface.cast && (
          <VoiceInterface
            cast={showVoiceInterface.cast}
            onClose={handleCloseVoiceInterface}
          />
        )}

        <div className="bg-fc-gray-100 border border-fc-gray-200 rounded-xl p-4">
          <div className="flex items-start space-x-3">
            <i className="fas fa-info-circle text-fc-purple text-lg mt-0.5" aria-hidden="true"></i>
            <div>
              <h4 className="font-medium text-fc-gray-900 mb-2">Accessibility Features</h4>
              <ul className="text-sm text-fc-gray-600 space-y-1">
                <li>• Tap "Read Aloud" to hear any post</li>
                <li>• Use "Voice Reply" to respond with speech</li>
                <li>• AI converts your voice to polished comments</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
