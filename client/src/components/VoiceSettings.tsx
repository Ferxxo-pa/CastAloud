import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Settings, X } from "lucide-react";

interface VoiceSettingsProps {
  voices: SpeechSynthesisVoice[];
  settings: {
    rate: number;
    pitch: number;
    volume: number;
    voice: SpeechSynthesisVoice | null;
  };
  updateSettings: (newSettings: any) => void;
  onTestVoice: () => void;
}

export default function VoiceSettings({ voices, settings, updateSettings, onTestVoice }: VoiceSettingsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isTestPlaying, setIsTestPlaying] = useState(false);

  if (!isOpen) {
    return (
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(true)}
        className="text-fc-gray-500"
      >
        <Settings className="h-5 w-5" />
      </Button>
    );
  }

  const getVoiceDisplay = (voice: SpeechSynthesisVoice) => {
    const flag = voice.lang.startsWith('en') ? '🇺🇸' : 
                 voice.lang.startsWith('es') ? '🇪🇸' :
                 voice.lang.startsWith('fr') ? '🇫🇷' :
                 voice.lang.startsWith('de') ? '🇩🇪' :
                 voice.lang.startsWith('it') ? '🇮🇹' :
                 voice.lang.startsWith('pt') ? '🇵🇹' :
                 voice.lang.startsWith('ja') ? '🇯🇵' :
                 voice.lang.startsWith('ko') ? '🇰🇷' :
                 voice.lang.startsWith('zh') ? '🇨🇳' : '🌐';
    
    const gender = voice.name.toLowerCase().includes('female') || voice.name.toLowerCase().includes('woman') ? '♀' :
                   voice.name.toLowerCase().includes('male') || voice.name.toLowerCase().includes('man') ? '♂' : '';
    
    return `${flag} ${voice.name} ${gender}`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-md w-full p-6 max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-fc-gray-900">Voice Settings</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(false)}
            className="text-fc-gray-500"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="space-y-6">
          {/* Voice Selection */}
          <div>
            <label className="block text-sm font-medium text-fc-gray-900 mb-2">
              Voice & Language
            </label>
            <Select
              value={settings.voice?.name || ""}
              onValueChange={(value) => {
                const selectedVoice = voices.find(v => v.name === value);
                if (selectedVoice) {
                  updateSettings({ voice: selectedVoice });
                }
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a voice" />
              </SelectTrigger>
              <SelectContent>
                {voices.map((voice) => (
                  <SelectItem key={voice.name} value={voice.name}>
                    {getVoiceDisplay(voice)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Speed */}
          <div>
            <label className="block text-sm font-medium text-fc-gray-900 mb-2">
              Speed: {settings.rate.toFixed(1)}x
            </label>
            <Slider
              value={[settings.rate]}
              onValueChange={(value) => updateSettings({ rate: value[0] })}
              min={0.1}
              max={2.0}
              step={0.1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-fc-gray-500 mt-1">
              <span>Slower</span>
              <span>Faster</span>
            </div>
          </div>

          {/* Pitch */}
          <div>
            <label className="block text-sm font-medium text-fc-gray-900 mb-2">
              Pitch: {settings.pitch.toFixed(1)}
            </label>
            <Slider
              value={[settings.pitch]}
              onValueChange={(value) => updateSettings({ pitch: value[0] })}
              min={0.1}
              max={2.0}
              step={0.1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-fc-gray-500 mt-1">
              <span>Lower</span>
              <span>Higher</span>
            </div>
          </div>

          {/* Volume */}
          <div>
            <label className="block text-sm font-medium text-fc-gray-900 mb-2">
              Volume: {Math.round(settings.volume * 100)}%
            </label>
            <Slider
              value={[settings.volume]}
              onValueChange={(value) => updateSettings({ volume: value[0] })}
              min={0.1}
              max={1.0}
              step={0.1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-fc-gray-500 mt-1">
              <span>Quiet</span>
              <span>Loud</span>
            </div>
          </div>

          {/* Test Voice */}
          <Button
            onClick={() => {
              if (isTestPlaying) {
                speechSynthesis.cancel();
                setIsTestPlaying(false);
              } else {
                const testText = "This is a test of your voice settings. How does this sound?";
                const utterance = new SpeechSynthesisUtterance(testText);
                utterance.rate = settings.rate;
                utterance.pitch = settings.pitch;
                utterance.volume = settings.volume;
                if (settings.voice) {
                  utterance.voice = settings.voice;
                }
                
                utterance.onstart = () => setIsTestPlaying(true);
                utterance.onend = () => setIsTestPlaying(false);
                utterance.onerror = () => setIsTestPlaying(false);
                
                speechSynthesis.speak(utterance);
              }
            }}
            className={`w-full ${
              isTestPlaying 
                ? 'bg-red-500 hover:bg-red-600 text-white' 
                : 'bg-fc-purple hover:bg-fc-purple-dark text-white'
            }`}
          >
            <i className={`fas ${isTestPlaying ? 'fa-stop' : 'fa-volume-up'} mr-2`} aria-hidden="true"></i>
            {isTestPlaying ? 'Stop Voice' : 'Test Voice'}
          </Button>

          {/* Presets */}
          <div>
            <label className="block text-sm font-medium text-fc-gray-900 mb-2">
              Quick Presets
            </label>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => updateSettings({ rate: 0.6, pitch: 1.0, volume: 1.0 })}
                className="text-xs"
              >
                🐢 Slow & Clear
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => updateSettings({ rate: 0.8, pitch: 1.0, volume: 1.0 })}
                className="text-xs"
              >
                📚 Reading
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => updateSettings({ rate: 1.0, pitch: 1.0, volume: 1.0 })}
                className="text-xs"
              >
                ⚡ Normal
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => updateSettings({ rate: 1.3, pitch: 1.1, volume: 1.0 })}
                className="text-xs"
              >
                🚀 Fast
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}