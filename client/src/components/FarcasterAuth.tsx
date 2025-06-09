import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Wallet, User } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface FarcasterAuthProps {
  onAuthenticated: (data: AuthData) => void;
}

interface AuthData {
  fid: number;
  walletAddress: string;
  isPremium: boolean;
  subscription?: any;
}

export default function FarcasterAuth({ onAuthenticated }: FarcasterAuthProps) {
  const [fid, setFid] = useState("");
  const [walletAddress, setWalletAddress] = useState("");
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [error, setError] = useState("");

  const handleAuth = async () => {
    if (!fid || !walletAddress) {
      setError("Please enter both FID and wallet address");
      return;
    }

    setIsAuthenticating(true);
    setError("");

    try {
      // Generate a simple message for signing
      const message = `Sign in to Cast Aloud with FID ${fid} at ${Date.now()}`;
      const signature = `fake_signature_${fid}_${Date.now()}`; // In real app, use wallet signing

      const response = await apiRequest("/api/auth/farcaster", {
        method: "POST",
        body: JSON.stringify({
          fid: parseInt(fid),
          walletAddress,
          signature,
          message
        })
      });

      const data = await response.json();
      
      if (data.authenticated) {
        onAuthenticated({
          fid: data.fid,
          walletAddress: data.walletAddress,
          isPremium: data.isPremium,
          subscription: data.subscription
        });
      } else {
        setError("Authentication failed");
      }
    } catch (err) {
      setError("Failed to authenticate with Farcaster");
      console.error("Auth error:", err);
    } finally {
      setIsAuthenticating(false);
    }
  };

  const connectWallet = async () => {
    if (typeof window !== 'undefined' && window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ 
          method: 'eth_requestAccounts' 
        });
        if (accounts.length > 0) {
          setWalletAddress(accounts[0]);
        }
      } catch (err) {
        setError("Failed to connect wallet");
      }
    } else {
      setError("No wallet found. Please install MetaMask or similar.");
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2">
          <User className="h-5 w-5 text-fc-purple" />
          Sign In With Farcaster
        </CardTitle>
        <CardDescription>
          Connect your Farcaster profile to access premium voice features
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Farcaster ID (FID)</label>
          <Input
            type="number"
            placeholder="Enter your FID"
            value={fid}
            onChange={(e) => setFid(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Wallet Address</label>
          <div className="flex gap-2">
            <Input
              placeholder="0x..."
              value={walletAddress}
              onChange={(e) => setWalletAddress(e.target.value)}
            />
            <Button 
              variant="outline" 
              onClick={connectWallet}
              className="flex items-center gap-1"
            >
              <Wallet className="h-4 w-4" />
              Connect
            </Button>
          </div>
        </div>

        {error && (
          <div className="text-sm text-red-600 bg-red-50 p-2 rounded border">
            {error}
          </div>
        )}

        <Button
          onClick={handleAuth}
          disabled={isAuthenticating || !fid || !walletAddress}
          className="w-full bg-fc-purple hover:bg-fc-purple-dark"
        >
          {isAuthenticating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Authenticating...
            </>
          ) : (
            "Sign In"
          )}
        </Button>

        <div className="text-xs text-gray-500 text-center">
          <p>Your FID can be found in your Farcaster profile settings</p>
          <p>Wallet address is used for payment verification</p>
        </div>
      </CardContent>
    </Card>
  );
}