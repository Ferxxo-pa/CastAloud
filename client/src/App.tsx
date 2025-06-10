import React, { useEffect, useState } from "react";
import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import HomeSimple from "@/pages/home-simple";
import CastAloud from "@/pages/cast-aloud";
import NotFound from "@/pages/not-found";

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
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const initializeFarcasterSDK = async () => {
      try {
        // Dynamic import to avoid build issues
        const { sdk } = await import("@farcaster/frame-sdk");
        
        // Wait for DOM to be ready
        if (document.readyState !== 'complete') {
          await new Promise(resolve => {
            window.addEventListener('load', resolve, { once: true });
          });
        }

        // Small delay to ensure everything is rendered
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Signal ready
        await sdk.actions.ready();
        console.log('Farcaster SDK ready signal sent');
        
      } catch (error) {
        console.error('Farcaster SDK initialization error:', error);
      } finally {
        setIsReady(true);
      }
    };

    initializeFarcasterSDK();
  }, []);

  // Always show content - loading state is minimal
  return (
    <TooltipProvider>
      <Toaster />
      {!isReady && (
        <div className="fixed top-0 left-0 w-full h-1 bg-purple-200">
          <div className="h-full bg-purple-600 animate-pulse" style={{ width: '70%' }}></div>
        </div>
      )}
      <Router />
    </TooltipProvider>
  );
}

export default App;
