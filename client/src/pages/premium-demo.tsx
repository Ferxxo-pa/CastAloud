import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Crown, Mic, Volume2 } from "lucide-react";
import PremiumVoiceSelector from "@/components/PremiumVoiceSelector";

export default function PremiumDemo() {
  const [selectedVoice, setSelectedVoice] = useState("alloy");
  const [speed, setSpeed] = useState(1.0);

  const handleTestVoice = async () => {
    const testText = "Welcome to Cast Aloud premium voices! This is a demonstration of our high-quality voice synthesis.";
    
    try {
      const response = await fetch("/api/tts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          text: testText,
          voice: selectedVoice
        })
      });

      if (response.ok) {
        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        await audio.play();
      } else {
        const error = await response.json();
        if (error.premiumRequired) {
          alert("Premium voice requires subscription. Please upgrade to access this feature.");
        } else {
          alert("Failed to generate audio: " + error.error);
        }
      }
    } catch (error) {
      console.error("TTS error:", error);
      alert("Failed to generate audio");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Cast Aloud Premium
          </h1>
          <p className="text-lg text-gray-600">
            Voice accessibility with premium OpenAI voices
          </p>
        </div>

        {/* Features Overview */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="text-center">
              <Volume2 className="h-8 w-8 mx-auto text-fc-purple mb-2" />
              <CardTitle className="text-lg">Premium Voices</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 text-center">
                Access to OpenAI's premium voice models: Nova, Shimmer, Echo, Fable, and Onyx
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="text-center">
              <Mic className="h-8 w-8 mx-auto text-fc-purple mb-2" />
              <CardTitle className="text-lg">Voice Recording</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 text-center">
                Record voice replies with automatic transcription and AI text polishing
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="text-center">
              <Crown className="h-8 w-8 mx-auto text-fc-purple mb-2" />
              <CardTitle className="text-lg">Premium Access</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 text-center">
                One-time payment for 12 months of premium features
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Pricing */}
        <Card className="mb-8">
          <CardHeader className="text-center">
            <CardTitle className="text-xl">Premium Subscription</CardTitle>
            <CardDescription>
              Unlock premium voices with cryptocurrency payment
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="flex justify-center gap-4">
              <Badge variant="outline" className="text-lg px-4 py-2">
                5 USDC
              </Badge>
              <span className="text-gray-400">or</span>
              <Badge variant="outline" className="text-lg px-4 py-2">
                0.002 ETH
              </Badge>
            </div>
            <p className="text-sm text-gray-600">
              Payment address: 0x742d35Cc6634C0532925a3b8D59A6e656b992e08
            </p>
            <p className="text-xs text-gray-500">
              12 months access • Automatic blockchain verification • No recurring charges
            </p>
          </CardContent>
        </Card>

        {/* Voice Demo */}
        <Card>
          <CardHeader>
            <CardTitle>Try Premium Voices</CardTitle>
            <CardDescription>
              Sign in with Farcaster to test premium voice features
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PremiumVoiceSelector
              selectedVoice={selectedVoice}
              setSelectedVoice={setSelectedVoice}
              speed={speed}
              setSpeed={setSpeed}
              onTestVoice={handleTestVoice}
            />
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>How It Works</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="w-8 h-8 bg-fc-purple text-white rounded-full flex items-center justify-center mx-auto mb-2 text-sm font-bold">
                  1
                </div>
                <p className="text-sm font-medium">Sign In</p>
                <p className="text-xs text-gray-600">Connect your Farcaster profile</p>
              </div>
              <div>
                <div className="w-8 h-8 bg-fc-purple text-white rounded-full flex items-center justify-center mx-auto mb-2 text-sm font-bold">
                  2
                </div>
                <p className="text-sm font-medium">Pay</p>
                <p className="text-xs text-gray-600">Send crypto to our address</p>
              </div>
              <div>
                <div className="w-8 h-8 bg-fc-purple text-white rounded-full flex items-center justify-center mx-auto mb-2 text-sm font-bold">
                  3
                </div>
                <p className="text-sm font-medium">Verify</p>
                <p className="text-xs text-gray-600">Automatic blockchain verification</p>
              </div>
              <div>
                <div className="w-8 h-8 bg-fc-purple text-white rounded-full flex items-center justify-center mx-auto mb-2 text-sm font-bold">
                  4
                </div>
                <p className="text-sm font-medium">Enjoy</p>
                <p className="text-xs text-gray-600">Access premium voices instantly</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}