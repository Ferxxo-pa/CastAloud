import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Crown, Play, Pause, Volume2, Lock } from "lucide-react";
import FarcasterAuth from "./FarcasterAuth";
import PaymentGate from "./PaymentGate";

interface PremiumVoiceSelectorProps {
  selectedVoice: string;
  setSelectedVoice: (voice: string) => void;
  speed: number;
  setSpeed: (speed: number) => void;
  onTestVoice: () => void;
}

interface AuthData {
  fid: number;
  walletAddress: string;
  isPremium: boolean;
  subscription?: any;
}

interface Voice {
  id: string;
  name: string;
  description: string;
  premium?: boolean;
}

const VOICES = {
  free: [
    { id: "alloy", name: "Alloy", description: "Neutral and clear" },
    { id: "echo", name: "Echo", description: "Warm and engaging" },
  ] as Voice[],
  premium: [
    { id: "nova", name: "Nova", description: "Bright and energetic", premium: true },
    { id: "shimmer", name: "Shimmer", description: "Soft and soothing", premium: true },
    { id: "fable", name: "Fable", description: "Expressive storytelling", premium: true },
    { id: "onyx", name: "Onyx", description: "Deep and resonant", premium: true },
  ] as Voice[]
};

export default function PremiumVoiceSelector({ 
  selectedVoice, 
  setSelectedVoice, 
  speed, 
  setSpeed, 
  onTestVoice 
}: PremiumVoiceSelectorProps) {
  const [authData, setAuthData] = useState<AuthData | null>(null);
  const [showAuth, setShowAuth] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    // Check if user is already authenticated in localStorage
    const savedAuth = localStorage.getItem('castaloud_auth');
    if (savedAuth) {
      try {
        const authInfo = JSON.parse(savedAuth);
        checkPremiumStatus(authInfo.fid, authInfo.walletAddress);
      } catch (error) {
        console.error('Failed to parse saved auth:', error);
      }
    }
  }, []);

  const checkPremiumStatus = async (fid: number, walletAddress: string) => {
    try {
      const response = await fetch(`/api/premium/status?fid=${fid}&walletAddress=${walletAddress}`);
      const data = await response.json();
      
      setAuthData({
        fid,
        walletAddress,
        isPremium: data.isPremium,
        subscription: data.subscription
      });
    } catch (error) {
      console.error('Failed to check premium status:', error);
    }
  };

  const handleAuthenticated = (data: AuthData) => {
    setAuthData(data);
    localStorage.setItem('castaloud_auth', JSON.stringify(data));
    setShowAuth(false);
    
    if (!data.isPremium) {
      setShowPayment(true);
    }
  };

  const handlePaymentVerified = () => {
    setShowPayment(false);
    if (authData) {
      setAuthData({ ...authData, isPremium: true });
      localStorage.setItem('castaloud_auth', JSON.stringify({ ...authData, isPremium: true }));
    }
  };

  const handleVoiceSelect = (voiceId: string) => {
    const voice = [...VOICES.free, ...VOICES.premium].find(v => v.id === voiceId);
    
    if (voice?.premium && (!authData?.isPremium)) {
      setShowAuth(true);
      return;
    }
    
    setSelectedVoice(voiceId);
  };

  const handleTestVoice = async () => {
    setIsPlaying(true);
    try {
      await onTestVoice();
    } finally {
      setTimeout(() => setIsPlaying(false), 2000);
    }
  };

  const isPremiumVoice = (voiceId: string) => {
    return VOICES.premium.some(v => v.id === voiceId);
  };

  const canUseVoice = (voiceId: string) => {
    return !isPremiumVoice(voiceId) || authData?.isPremium;
  };

  if (showAuth) {
    return (
      <div className="space-y-4">
        <FarcasterAuth onAuthenticated={handleAuthenticated} />
        <Button 
          variant="outline" 
          onClick={() => setShowAuth(false)}
          className="w-full"
        >
          Cancel
        </Button>
      </div>
    );
  }

  if (showPayment && authData) {
    return (
      <div className="space-y-4">
        <PaymentGate
          fid={authData.fid}
          walletAddress={authData.walletAddress}
          onPaymentVerified={handlePaymentVerified}
        />
        <Button 
          variant="outline" 
          onClick={() => setShowPayment(false)}
          className="w-full"
        >
          Cancel
        </Button>
      </div>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Volume2 className="h-5 w-5" />
          Voice Settings
          {authData?.isPremium && (
            <Badge className="bg-fc-purple text-white">
              <Crown className="h-3 w-3 mr-1" />
              Premium
            </Badge>
          )}
        </CardTitle>
        <CardDescription>
          Choose your preferred voice and settings
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Authentication Status */}
        {!authData ? (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-700 mb-3">
              Sign in with Farcaster to unlock premium voices
            </p>
            <Button 
              onClick={() => setShowAuth(true)}
              className="bg-fc-purple hover:bg-fc-purple-dark"
            >
              Sign In with Farcaster
            </Button>
          </div>
        ) : !authData.isPremium ? (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-sm text-amber-700 mb-3">
              Unlock premium voices with a one-time payment
            </p>
            <Button 
              onClick={() => setShowPayment(true)}
              className="bg-fc-purple hover:bg-fc-purple-dark"
            >
              <Crown className="h-4 w-4 mr-2" />
              Upgrade to Premium
            </Button>
          </div>
        ) : (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2">
              <Crown className="h-4 w-4 text-green-600" />
              <span className="text-sm text-green-700 font-medium">
                Premium Access Active
              </span>
            </div>
            {authData.subscription?.expiresAt && (
              <p className="text-xs text-green-600 mt-1">
                Expires: {new Date(authData.subscription.expiresAt).toLocaleDateString()}
              </p>
            )}
          </div>
        )}

        {/* Voice Selection */}
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Voice</label>
            <Select value={selectedVoice} onValueChange={handleVoiceSelect}>
              <SelectTrigger>
                <SelectValue placeholder="Select a voice" />
              </SelectTrigger>
              <SelectContent>
                <div className="px-2 py-1">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Free Voices</p>
                </div>
                {VOICES.free.map((voice) => (
                  <SelectItem key={voice.id} value={voice.id}>
                    <div className="flex items-center justify-between w-full">
                      <div>
                        <span className="font-medium">{voice.name}</span>
                        <span className="text-sm text-gray-500 ml-2">{voice.description}</span>
                      </div>
                    </div>
                  </SelectItem>
                ))}
                
                <div className="px-2 py-1 mt-2">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide flex items-center gap-1">
                    <Crown className="h-3 w-3" />
                    Premium Voices
                  </p>
                </div>
                {VOICES.premium.map((voice) => (
                  <SelectItem 
                    key={voice.id} 
                    value={voice.id}
                    disabled={!canUseVoice(voice.id)}
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-2">
                        <span className={`font-medium ${!canUseVoice(voice.id) ? 'text-gray-400' : ''}`}>
                          {voice.name}
                        </span>
                        <span className={`text-sm ${!canUseVoice(voice.id) ? 'text-gray-300' : 'text-gray-500'}`}>
                          {voice.description}
                        </span>
                        {!canUseVoice(voice.id) && <Lock className="h-3 w-3 text-gray-400" />}
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Speed Control */}
          <div>
            <label className="text-sm font-medium mb-2 block">
              Speed: {speed.toFixed(1)}x
            </label>
            <Slider
              value={[speed]}
              onValueChange={(value) => setSpeed(value[0])}
              max={2}
              min={0.5}
              step={0.1}
              className="w-full"
            />
          </div>

          {/* Test Voice Button */}
          <Button
            onClick={handleTestVoice}
            variant="outline"
            className="w-full"
            disabled={isPlaying}
          >
            {isPlaying ? (
              <>
                <Pause className="h-4 w-4 mr-2" />
                Playing...
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                Test Voice
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}