import { Switch, Route } from "wouter";
import { useEffect } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import HomeSimple from "@/pages/home-simple";
import CastAloud from "@/pages/cast-aloud";
import MiniApp from "@/pages/mini-app";
import NotFound from "@/pages/not-found";
import { farcasterSDK } from "@/lib/farcaster-sdk";

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomeSimple} />
      <Route path="/cast-aloud" component={CastAloud} />
      <Route path="/mini-app" component={MiniApp} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  useEffect(() => {
    // Initialize Farcaster SDK when app loads
    const initSDK = async () => {
      try {
        await farcasterSDK.initialize();
        console.log('Farcaster SDK initialized');
      } catch (error) {
        console.error('Failed to initialize Farcaster SDK:', error);
      }
    };
    
    initSDK();
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
