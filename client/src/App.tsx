import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
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
  console.log("App component rendering");
  
  try {
    return (
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </QueryClientProvider>
    );
  } catch (error) {
    console.error("Error in App component:", error);
    return (
      <div style={{ padding: '20px', color: 'red', fontFamily: 'Arial, sans-serif' }}>
        <h1>Application Error</h1>
        <p>Error: {String(error)}</p>
        <p>Please check the console for more details.</p>
      </div>
    );
  }
}

export default App;
