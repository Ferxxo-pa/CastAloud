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
    // Frame SDK initialization - temporarily disabled for debugging
    async function initializeFrameSDK() {
      try {
        // Only initialize if we detect we're in a Frame context
        if (window.location.search.includes('frame=') || window.parent !== window) {
          await sdk.actions.ready();
          
          const capabilities = await sdk.getCapabilities();
          const supportsCompose = capabilities.includes('actions.composeCast');
          
          if (supportsCompose) {
            console.log('Cast composition supported');
          }
        } else {
          console.log('Not in Frame context, skipping Frame SDK initialization');
        }
      } catch (error: any) {
        console.log('Frame SDK not available or failed to initialize:', error?.message || 'Unknown error');
        // Continue without Frame SDK - this is expected in normal web context
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
