import { Link } from "wouter";
import { useState, useEffect } from "react";
import { farcasterSDK, type FarcasterContext } from '@/lib/farcaster-sdk';

export default function HomeSimple() {
  console.log("HomeSimple component rendering");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showVoiceSettings, setShowVoiceSettings] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [farcasterContext, setFarcasterContext] = useState<FarcasterContext | null>(null);
  const [isMiniApp, setIsMiniApp] = useState(false);
  
  // Load speech rate from localStorage
  const [speechRate, setSpeechRate] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('voiceSettings');
        if (saved) {
          const parsed = JSON.parse(saved);
          return parsed.speechRate || 0.9;
        }
      } catch (error) {
        console.warn('Failed to load voice settings:', error);
      }
    }
    return 0.9;
  });

  // Load available voices
  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = speechSynthesis.getVoices();
      setVoices(availableVoices);
      
      if (availableVoices.length > 0 && !selectedVoice) {
        // Try to restore saved voice
        let voiceToSelect = null;
        try {
          const saved = localStorage.getItem('voiceSettings');
          if (saved) {
            const parsed = JSON.parse(saved);
            if (parsed.voiceName) {
              voiceToSelect = availableVoices.find(voice => voice.name === parsed.voiceName);
            }
          }
        } catch (error) {
          console.warn('Failed to restore saved voice:', error);
        }
        
        // Use saved voice or default to first available
        setSelectedVoice(voiceToSelect || availableVoices[0]);
      }
    };

    loadVoices();
    speechSynthesis.addEventListener('voiceschanged', loadVoices);
    
    return () => {
      speechSynthesis.removeEventListener('voiceschanged', loadVoices);
    };
  }, [selectedVoice]);

  // Save voice settings to localStorage
  const saveVoiceSettings = (voice: SpeechSynthesisVoice | null, rate: number) => {
    try {
      const settings = {
        voiceName: voice?.name || null,
        speechRate: rate
      };
      localStorage.setItem('voiceSettings', JSON.stringify(settings));
    } catch (error) {
      console.warn('Failed to save voice settings:', error);
    }
  };

  // Update voice selection with persistence
  const handleVoiceChange = (voice: SpeechSynthesisVoice | null) => {
    setSelectedVoice(voice);
    saveVoiceSettings(voice, speechRate);
  };

  // Update speech rate with persistence
  const handleRateChange = (rate: number) => {
    setSpeechRate(rate);
    saveVoiceSettings(selectedVoice, rate);
  };

  const readPageAloud = () => {
    const textToRead = `
      Cast Aloud. Accessibility tools for reading and replying to casts.
      
      Try the Mini App. The mini app helps you read casts aloud and create voice replies with AI assistance.
      
      How it works:
      1. Paste a Farcaster post URL or text directly
      2. Click "Read Aloud" to hear the content  
      3. Type your reply in the text area
      4. Get AI feedback or polish your reply
      5. Copy the improved reply to post on Farcaster
    `;

    if (isSpeaking) {
      speechSynthesis.cancel();
      setIsSpeaking(false);
    } else {
      const utterance = new SpeechSynthesisUtterance(textToRead);
      utterance.rate = speechRate;
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      speechSynthesis.speak(utterance);
    }
  };
  console.log("HomeSimple about to render JSX");
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#FAFAFA', padding: '20px' }}>
      <div style={{ maxWidth: '400px', margin: '0 auto', backgroundColor: 'white', padding: '20px', borderRadius: '8px' }}>
        <header style={{ marginBottom: '24px', textAlign: 'center' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#242424', margin: '0 0 8px 0' }}>Cast Aloud</h1>
          <p style={{ color: '#6B6B6B', margin: '0' }}>
            Accessibility tools for reading and replying to casts
          </p>
        </header>

        <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '24px', border: '1px solid #E8E8E8', position: 'relative' }}>
          <button
            onClick={readPageAloud}
            style={{
              position: 'absolute',
              top: '16px',
              right: '16px',
              padding: '8px 12px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '14px',
              fontWeight: '500',
              backgroundColor: isSpeaking ? '#FEF2F2' : '#F3F0FF',
              color: isSpeaking ? '#EF4444' : '#8A63D2'
            }}
            title={isSpeaking ? 'Stop reading' : 'Read page aloud'}
          >
            {isSpeaking ? (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="6" y="4" width="4" height="16" rx="1"/>
                  <rect x="14" y="4" width="4" height="16" rx="1"/>
                </svg>
                Stop
              </>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
                  <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
                  <path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
                </svg>
                Read Aloud
              </>
            )}
          </button>
          <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', color: '#242424' }}>Try the Mini App</h2>
          <p style={{ color: '#6B6B6B', marginBottom: '16px' }}>
            The mini app helps you read casts aloud and create voice replies with AI assistance.
          </p>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <Link href="/cast-aloud?text=Hello%20world!%20This%20is%20a%20sample%20cast%20about%20the%20future%20of%20decentralized%20social%20networks.">
              <button style={{
                display: 'block',
                width: '100%',
                backgroundColor: '#8A63D2',
                color: 'white',
                padding: '12px 16px',
                borderRadius: '8px',
                textAlign: 'center',
                fontWeight: '500',
                border: 'none',
                cursor: 'pointer'
              }}>
                Read Cast Aloud
              </button>
            </Link>
            
            <button 
              onClick={() => setShowVoiceSettings(!showVoiceSettings)}
              style={{
                display: 'block',
                width: '100%',
                backgroundColor: '#E8E8E8',
                color: '#383838',
                padding: '12px 16px',
                borderRadius: '8px',
                textAlign: 'center',
                fontWeight: '500',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              Voice Settings
            </button>
          </div>

          {showVoiceSettings && (
            <div style={{ marginTop: '16px', padding: '16px', backgroundColor: 'white', border: '1px solid #E8E8E8', borderRadius: '8px' }}>
              <h3 style={{ fontWeight: '500', marginBottom: '12px' }}>Voice Settings</h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>Voice Type</label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <input
                        type="radio"
                        id="browser-voices"
                        name="voiceType"
                        value="browser"
                        checked={true}
                        readOnly
                        style={{ marginRight: '8px' }}
                      />
                      <label htmlFor="browser-voices" style={{ fontSize: '14px' }}>
                        Browser Voices (Free)
                      </label>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', opacity: 0.5 }}>
                      <input
                        type="radio"
                        id="premium-voices"
                        name="voiceType"
                        value="openai"
                        disabled
                        style={{ marginRight: '8px' }}
                      />
                      <label htmlFor="premium-voices" style={{ fontSize: '14px', display: 'flex', alignItems: 'center', color: '#9CA3AF' }}>
                        Premium AI Voices
                        <span style={{ marginLeft: '4px', padding: '2px 8px', backgroundColor: '#F3F4F6', color: '#6B7280', fontSize: '12px', borderRadius: '16px' }}>
                          Coming Soon
                        </span>
                      </label>
                    </div>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>Voice</label>
                  <select 
                    value={selectedVoice?.name || ''}
                    onChange={(e) => {
                      const voice = voices.find(v => v.name === e.target.value);
                      handleVoiceChange(voice || null);
                    }}
                    style={{ width: '100%', padding: '8px', border: '1px solid #D1D1D1', borderRadius: '6px' }}
                  >
                    {voices.map((voice) => (
                      <option key={voice.name} value={voice.name}>
                        {voice.name} ({voice.lang})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                    Speed: {speechRate.toFixed(1)}x
                  </label>
                  <input
                    type="range"
                    min="0.5"
                    max="2"
                    step="0.1"
                    value={speechRate}
                    onChange={(e) => handleRateChange(parseFloat(e.target.value))}
                    style={{ width: '100%' }}
                  />
                </div>

                <button
                  onClick={() => {
                    if (isSpeaking) {
                      speechSynthesis.cancel();
                      setIsSpeaking(false);
                    } else {
                      const testText = "This is a test of your voice settings. How does this sound?";
                      const utterance = new SpeechSynthesisUtterance(testText);
                      utterance.rate = speechRate;
                      if (selectedVoice) {
                        utterance.voice = selectedVoice;
                      }
                      
                      utterance.onstart = () => setIsSpeaking(true);
                      utterance.onend = () => setIsSpeaking(false);
                      utterance.onerror = () => setIsSpeaking(false);
                      
                      speechSynthesis.speak(utterance);
                    }
                  }}
                  style={{
                    width: '100%',
                    fontWeight: '500',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    border: 'none',
                    cursor: 'pointer',
                    backgroundColor: isSpeaking ? '#EF4444' : '#F3F4F6',
                    color: isSpeaking ? 'white' : '#374151'
                  }}
                >
                  {isSpeaking ? 'Stop Test' : 'Test Voice'}
                </button>
              </div>
            </div>
          )}

          <div style={{ marginTop: '24px', padding: '16px', backgroundColor: '#F9FAFB', borderRadius: '8px' }}>
            <h3 style={{ fontWeight: '500', marginBottom: '8px' }}>How it works:</h3>
            <ol style={{ fontSize: '14px', color: '#6B7280', margin: 0, paddingLeft: '20px' }}>
              <li style={{ marginBottom: '4px' }}>Paste a Farcaster post URL or text directly</li>
              <li style={{ marginBottom: '4px' }}>Click "Read Aloud" to hear the content</li>
              <li style={{ marginBottom: '4px' }}>Type your reply in the text area</li>
              <li style={{ marginBottom: '4px' }}>Get AI feedback or polish your reply</li>
              <li style={{ marginBottom: '4px' }}>Copy the improved reply to post on Farcaster</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}