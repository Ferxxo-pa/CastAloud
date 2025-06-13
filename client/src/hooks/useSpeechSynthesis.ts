import { useState, useCallback, useEffect } from 'react';

interface VoiceSettings {
  rate: number;     // 0.1 to 10 (speed)
  pitch: number;    // 0 to 2 (voice pitch)
  volume: number;   // 0 to 1 (volume)
  voice: SpeechSynthesisVoice | null; // selected voice
}

interface UseSpeechSynthesisReturn {
  speak: (text: string) => void;
  stop: () => void;
  isSpeaking: boolean;
  isSupported: boolean;
  voices: SpeechSynthesisVoice[];
  settings: VoiceSettings;
  updateSettings: (newSettings: Partial<VoiceSettings>) => void;
  currentUtterance: SpeechSynthesisUtterance | null;
}

export default function useSpeechSynthesis(): UseSpeechSynthesisReturn {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSupported] = useState(() => 'speechSynthesis' in window);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [currentUtterance, setCurrentUtterance] = useState<SpeechSynthesisUtterance | null>(null);
  
  // Load settings from localStorage
  const [settings, setSettings] = useState<VoiceSettings>(() => {
    if (typeof window === 'undefined') {
      return {
        rate: 0.8,
        pitch: 1,
        volume: 1,
        voice: null
      };
    }
    
    try {
      const saved = localStorage.getItem('speechSynthesisSettings');
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          rate: parsed.rate || 0.8,
          pitch: parsed.pitch || 1,
          volume: parsed.volume || 1,
          voice: null // Voice will be restored separately
        };
      }
    } catch (error) {
      console.warn('Failed to load speech synthesis settings:', error);
    }
    
    return {
      rate: 0.8,
      pitch: 1,
      volume: 1,
      voice: null
    };
  });

  // Load available voices
  useEffect(() => {
    if (!isSupported) return;

    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      setVoices(availableVoices);
      
      // Restore saved voice or set default
      if (availableVoices.length > 0 && !settings.voice) {
        let voiceToSelect = null;
        
        // Try to restore saved voice
        try {
          const saved = localStorage.getItem('speechSynthesisSettings');
          if (saved) {
            const parsed = JSON.parse(saved);
            if (parsed.voiceName) {
              voiceToSelect = availableVoices.find(voice => voice.name === parsed.voiceName);
            }
          }
        } catch (error) {
          console.warn('Failed to restore saved voice:', error);
        }
        
        // If no saved voice found, use default (prefer English voices)
        if (!voiceToSelect) {
          voiceToSelect = availableVoices.find(voice => 
            voice.lang.startsWith('en')
          ) || availableVoices[0];
        }
        
        setSettings(prev => ({ ...prev, voice: voiceToSelect }));
      }
    };

    // Voices might not be loaded immediately
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, [isSupported, settings.voice]);

  const updateSettings = useCallback((newSettings: Partial<VoiceSettings>) => {
    setSettings(prev => {
      const updated = { ...prev, ...newSettings };
      
      // Apply settings immediately to current utterance if speaking
      if (currentUtterance && isSpeaking) {
        // For speed changes, we need to restart the speech
        if (newSettings.rate !== undefined && newSettings.rate !== prev.rate) {
          window.speechSynthesis.cancel();
          // Let the calling component handle restarting with new settings
        } else {
          // For volume and pitch, we can update the current utterance
          if (newSettings.volume !== undefined) {
            currentUtterance.volume = newSettings.volume;
          }
          if (newSettings.pitch !== undefined) {
            currentUtterance.pitch = newSettings.pitch;
          }
          if (newSettings.voice !== undefined) {
            currentUtterance.voice = newSettings.voice;
          }
        }
      }
      
      // Save to localStorage
      try {
        const toSave = {
          rate: updated.rate,
          pitch: updated.pitch,
          volume: updated.volume,
          voiceName: updated.voice?.name || null
        };
        localStorage.setItem('speechSynthesisSettings', JSON.stringify(toSave));
      } catch (error) {
        console.warn('Failed to save speech synthesis settings:', error);
      }
      
      return updated;
    });
  }, [currentUtterance, isSpeaking]);

  const speak = useCallback((text: string) => {
    if (!isSupported) {
      alert('Text-to-speech not supported in this browser');
      return;
    }

    // Stop any current speech
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = settings.rate;
    utterance.pitch = settings.pitch;
    utterance.volume = settings.volume;
    
    if (settings.voice) {
      utterance.voice = settings.voice;
    }
    
    utterance.onstart = () => {
      setIsSpeaking(true);
      setCurrentUtterance(utterance);
    };
    
    utterance.onend = () => {
      setIsSpeaking(false);
      setCurrentUtterance(null);
    };
    
    utterance.onerror = () => {
      setIsSpeaking(false);
      setCurrentUtterance(null);
    };
    
    window.speechSynthesis.speak(utterance);
  }, [isSupported, settings]);

  const stop = useCallback(() => {
    if (isSupported) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setCurrentUtterance(null);
    }
  }, [isSupported]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (isSupported) {
        window.speechSynthesis.cancel();
      }
    };
  }, [isSupported]);

  return {
    speak,
    stop,
    isSpeaking,
    isSupported,
    voices,
    settings,
    updateSettings,
    currentUtterance
  };
}
