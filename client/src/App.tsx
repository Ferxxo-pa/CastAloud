import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import HomeSimple from "@/pages/home-simple";
import CastAloud from "@/pages/cast-aloud";
import NotFound from "@/pages/not-found";
import { useEffect } from "react";

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
        // Only initialize Frame SDK if available
        if (typeof window !== 'undefined' && (window as any).parent !== window) {
          // We're in an iframe, try to load Frame SDK
          const { sdk } = await import("@farcaster/frame-sdk");
          await sdk.actions.ready();
          
          const capabilities = await sdk.getCapabilities();
          const supportsCompose = capabilities.includes('actions.composeCast');
          
          if (supportsCompose) {
            console.log('Cast composition supported');
          }
        } else {
          console.log('Not in frame context, skipping Frame SDK initialization');
        }
      } catch (error) {
        console.log('Frame SDK not available or initialization failed:', error);
        // This is expected when not running in a Farcaster frame
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
