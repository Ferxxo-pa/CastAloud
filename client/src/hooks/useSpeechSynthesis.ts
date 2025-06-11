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
  testVoice: () => void;
  isSpeaking: boolean;
  isSupported: boolean;
  voices: SpeechSynthesisVoice[];
  settings: VoiceSettings;
  updateSettings: (newSettings: Partial<VoiceSettings>) => void;
}

export default function useSpeechSynthesis(): UseSpeechSynthesisReturn {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSupported] = useState(() => 'speechSynthesis' in window);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  
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
  }, []);

  const speak = useCallback((text: string) => {
    console.log('Speak function called with text:', text.substring(0, 50));
    console.log('isSupported:', isSupported);
    console.log('Current settings:', settings);
    
    if (!isSupported) {
      console.error('Text-to-speech not supported');
      alert('Text-to-speech not supported in this browser');
      return;
    }

    // Stop any current speech
    window.speechSynthesis.cancel();
    
    // Set speaking state immediately
    setIsSpeaking(true);
    console.log('Set isSpeaking to true');
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = settings.rate;
    utterance.pitch = settings.pitch;
    utterance.volume = settings.volume;
    
    if (settings.voice) {
      utterance.voice = settings.voice;
      console.log('Using voice:', settings.voice.name);
    } else {
      console.log('No voice selected, using default');
    }
    
    utterance.onstart = () => {
      console.log('Speech onstart event fired');
      setIsSpeaking(true);
    };
    
    utterance.onend = () => {
      console.log('Speech onend event fired');
      setIsSpeaking(false);
    };
    
    utterance.onerror = (event) => {
      console.error('Speech error event:', event);
      setIsSpeaking(false);
    };
    
    window.speechSynthesis.speak(utterance);
    console.log('Speech synthesis speak called');
  }, [isSupported, settings]);

  const stop = useCallback(() => {
    console.log('Stop function called, isSupported:', isSupported);
    if (isSupported) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      console.log('Speech synthesis cancelled, set isSpeaking to false');
    }
  }, [isSupported]);

  const testVoice = useCallback(() => {
    console.log('Test voice clicked, isSpeaking:', isSpeaking);
    if (isSpeaking) {
      console.log('Stopping speech');
      stop();
    } else {
      console.log('Starting speech test');
      const testText = "This is a test of your voice settings. How does this sound?";
      speak(testText);
    }
  }, [isSpeaking, stop, speak]);

  // Monitor speechSynthesis state
  useEffect(() => {
    if (!isSupported) return;

    const checkSpeechStatus = () => {
      const actuallyPlaying = window.speechSynthesis.speaking;
      if (isSpeaking !== actuallyPlaying) {
        setIsSpeaking(actuallyPlaying);
      }
    };

    const interval = setInterval(checkSpeechStatus, 100);
    
    return () => clearInterval(interval);
  }, [isSupported, isSpeaking]);

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
    testVoice,
    isSpeaking,
    isSupported,
    voices,
    settings,
    updateSettings,
  };
}
