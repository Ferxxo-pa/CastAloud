import { useState, useRef } from 'react';

interface OpenAIVoice {
  id: string;
  name: string;
  description: string;
}

const OPENAI_VOICES: OpenAIVoice[] = [
  { id: 'alloy', name: 'Alloy', description: 'Neutral, balanced voice' },
  { id: 'echo', name: 'Echo', description: 'Clear, professional voice' },
  { id: 'fable', name: 'Fable', description: 'Warm, storytelling voice' },
  { id: 'onyx', name: 'Onyx', description: 'Deep, authoritative voice' },
  { id: 'nova', name: 'Nova', description: 'Bright, energetic voice' },
  { id: 'shimmer', name: 'Shimmer', description: 'Gentle, calming voice' }
];

interface UseOpenAITTSReturn {
  speak: (text: string) => Promise<void>;
  stop: () => void;
  isSpeaking: boolean;
  voices: OpenAIVoice[];
  selectedVoice: string;
  setSelectedVoice: (voice: string) => void;
}

export default function useOpenAITTS(): UseOpenAITTSReturn {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState('alloy');
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const speak = async (text: string) => {
    try {
      // Stop any current speech
      stop();
      
      setIsSpeaking(true);

      // Call our TTS endpoint
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          voice: selectedVoice
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate speech');
      }

      // Create audio from the response
      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      
      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      audio.onended = () => {
        setIsSpeaking(false);
        URL.revokeObjectURL(audioUrl);
      };

      audio.onerror = () => {
        setIsSpeaking(false);
        URL.revokeObjectURL(audioUrl);
      };

      await audio.play();
    } catch (error) {
      console.error('Error with text-to-speech:', error);
      setIsSpeaking(false);
    }
  };

  const stop = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    setIsSpeaking(false);
  };

  return {
    speak,
    stop,
    isSpeaking,
    voices: OPENAI_VOICES,
    selectedVoice,
    setSelectedVoice
  };
}