import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Copy, CheckCircle, Clock, CreditCard } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface PaymentGateProps {
  fid: number;
  walletAddress: string;
  onPaymentVerified: () => void;
}

interface PaymentInfo {
  paymentAddress: string;
  amounts: {
    ETH: string;
    USDC: string;
  };
  subscriptionDuration: number;
}

interface QRData {
  qrCode: string;
  paymentUri: string;
  address: string;
  amount: string;
}

export default function PaymentGate({ fid, walletAddress, onPaymentVerified }: PaymentGateProps) {
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo | null>(null);
  const [qrData, setQrData] = useState<{ [key: string]: QRData }>({});
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<string>("");
  const [selectedCurrency, setSelectedCurrency] = useState<"ETH" | "USDC">("USDC");
  const { toast } = useToast();

  useEffect(() => {
    loadPaymentInfo();
  }, []);

  useEffect(() => {
    if (paymentInfo) {
      loadQRCode("ETH");
      loadQRCode("USDC");
    }
  }, [paymentInfo]);

  const loadPaymentInfo = async () => {
    try {
      const response = await fetch("/api/payment/info");
      const data = await response.json();
      setPaymentInfo(data);
    } catch (error) {
      console.error("Failed to load payment info:", error);
    }
  };

  const loadQRCode = async (currency: string) => {
    try {
      const response = await fetch(`/api/payment/qr/${currency}`);
      const data = await response.json();
      setQrData(prev => ({ ...prev, [currency]: data }));
    } catch (error) {
      console.error(`Failed to load ${currency} QR code:`, error);
    }
  };

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied!",
        description: `${label} copied to clipboard`,
      });
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Please copy manually",
        variant: "destructive",
      });
    }
  };

  const verifyPayment = async () => {
    setIsVerifying(true);
    setVerificationStatus("Checking blockchain for payment...");

    try {
      const response = await fetch("/api/payment/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          fid,
          walletAddress,
          network: "mainnet"
        })
      });

      const data = await response.json();

      if (data.verified) {
        setVerificationStatus("Payment verified! Premium access granted.");
        toast({
          title: "Payment Verified!",
          description: "Premium features are now unlocked",
        });
        setTimeout(() => {
          onPaymentVerified();
        }, 2000);
      } else {
        setVerificationStatus(data.message || "No payment found. Please try again in a few minutes.");
        toast({
          title: "Payment Not Found",
          description: "Payment verification failed. Please wait a few minutes for blockchain confirmation.",
          variant: "destructive",
        });
      }
    } catch (error) {
      setVerificationStatus("Verification failed. Please try again.");
      toast({
        title: "Verification Error",
        description: "Failed to verify payment",
        variant: "destructive",
      });
    } finally {
      setIsVerifying(false);
    }
  };

  if (!paymentInfo) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2">
          <CreditCard className="h-5 w-5 text-fc-purple" />
          Unlock Premium Voice Features
        </CardTitle>
        <CardDescription>
          Get access to premium OpenAI voices for {paymentInfo.subscriptionDuration} months
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <Tabs value={selectedCurrency} onValueChange={(value) => setSelectedCurrency(value as "ETH" | "USDC")}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="USDC">Pay with USDC</TabsTrigger>
            <TabsTrigger value="ETH">Pay with ETH</TabsTrigger>
          </TabsList>

          <TabsContent value="USDC" className="space-y-4">
            <PaymentOption
              currency="USDC"
              amount={paymentInfo.amounts.USDC}
              address={paymentInfo.paymentAddress}
              qrData={qrData.USDC}
              onCopy={copyToClipboard}
            />
          </TabsContent>

          <TabsContent value="ETH" className="space-y-4">
            <PaymentOption
              currency="ETH"
              amount={paymentInfo.amounts.ETH}
              address={paymentInfo.paymentAddress}
              qrData={qrData.ETH}
              onCopy={copyToClipboard}
            />
          </TabsContent>
        </Tabs>

        <div className="space-y-4 border-t pt-4">
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-4">
              After sending payment, click verify to check the blockchain
            </p>
            <Button
              onClick={verifyPayment}
              disabled={isVerifying}
              className="bg-fc-purple hover:bg-fc-purple-dark"
            >
              {isVerifying ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying Payment...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Verify Payment
                </>
              )}
            </Button>
          </div>

          {verificationStatus && (
            <div className={`text-sm p-3 rounded border ${
              verificationStatus.includes("verified") 
                ? "text-green-700 bg-green-50 border-green-200" 
                : "text-blue-700 bg-blue-50 border-blue-200"
            }`}>
              {verificationStatus}
            </div>
          )}
        </div>

        <div className="text-xs text-gray-500 space-y-1">
          <p>• Payment verification is automatic and usually takes 1-2 minutes</p>
          <p>• Premium access lasts for {paymentInfo.subscriptionDuration} months from payment date</p>
          <p>• Premium features include OpenAI voices: Nova, Shimmer, Echo, Fable, Onyx</p>
        </div>
      </CardContent>
    </Card>
  );
}

interface PaymentOptionProps {
  currency: string;
  amount: string;
  address: string;
  qrData?: QRData;
  onCopy: (text: string, label: string) => void;
}

function PaymentOption({ currency, amount, address, qrData, onCopy }: PaymentOptionProps) {
  return (
    <div className="space-y-4">
      <div className="text-center">
        <Badge variant="outline" className="text-lg px-4 py-2">
          {amount} {currency}
        </Badge>
      </div>

      {qrData && (
        <div className="text-center">
          <img 
            src={qrData.qrCode} 
            alt={`${currency} Payment QR Code`}
            className="mx-auto w-48 h-48 border rounded"
          />
          <p className="text-sm text-gray-600 mt-2">
            Scan with your crypto wallet
          </p>
        </div>
      )}

      <div className="space-y-2">
        <label className="text-sm font-medium">Payment Address:</label>
        <div className="flex items-center gap-2">
          <code className="flex-1 p-2 bg-gray-100 rounded text-sm font-mono break-all">
            {address}
          </code>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onCopy(address, "Payment address")}
          >
            <Copy className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Amount:</label>
        <div className="flex items-center gap-2">
          <code className="flex-1 p-2 bg-gray-100 rounded text-sm font-mono">
            {amount} {currency}
          </code>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onCopy(amount, "Amount")}
          >
            <Copy className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}