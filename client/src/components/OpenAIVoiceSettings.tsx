import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface OpenAIVoice {
  id: string;
  name: string;
  description: string;
}

interface OpenAIVoiceSettingsProps {
  voices: OpenAIVoice[];
  selectedVoice: string;
  setSelectedVoice: (voice: string) => void;
  onTestVoice: () => void;
}

export default function OpenAIVoiceSettings({ 
  voices, 
  selectedVoice, 
  setSelectedVoice, 
  onTestVoice 
}: OpenAIVoiceSettingsProps) {
  const currentVoice = voices.find(v => v.id === selectedVoice);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm"
          className="h-8 w-8 p-0 text-fc-gray-600 hover:text-fc-gray-900"
        >
          <i className="fas fa-cog text-sm" aria-hidden="true"></i>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4" align="end">
        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-sm text-fc-gray-900 mb-2">Voice Settings</h4>
            <p className="text-xs text-fc-gray-600 mb-3">
              Choose from OpenAI's high-quality voices
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-fc-gray-700">Voice</label>
            <Select value={selectedVoice} onValueChange={setSelectedVoice}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {voices.map((voice) => (
                  <SelectItem key={voice.id} value={voice.id}>
                    <div className="flex flex-col items-start">
                      <span className="font-medium">{voice.name}</span>
                      <span className="text-xs text-gray-500">{voice.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="pt-2">
            <Button 
              onClick={onTestVoice}
              size="sm" 
              className="w-full bg-fc-purple hover:bg-fc-purple-dark text-white"
            >
              <i className="fas fa-play text-xs mr-2" aria-hidden="true"></i>
              Test {currentVoice?.name || 'Voice'}
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}