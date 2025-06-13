import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import HomeSimple from "@/pages/home-simple";
import CastAloud from "@/pages/cast-aloud";
import NotFound from "@/pages/not-found";
import { useEffect } from "react";
import { sdk } from "@farcaster/frame-sdk";

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomeSimple} />
      <Route path="/cast-aloud" component={CastAloud} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  useEffect(() => {
    async function initializeFrameSDK() {
      try {
        // Initialize Frame SDK when the app is ready
        await sdk.actions.ready();
        
        // Check for supported capabilities
        const capabilities = await sdk.getCapabilities();
        const supportsCompose = capabilities.includes('actions.composeCast');
        
        // Store capability information for use throughout the app
        if (supportsCompose) {
          console.log('Cast composition supported');
        }
      } catch (error) {
        console.error('Frame SDK initialization failed:', error);
      }
    }
    
    initializeFrameSDK();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
