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
  
  // Temporary simple test to ensure React is working
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ color: '#8A63D2' }}>Cast Aloud</h1>
      <p>React app is loading successfully!</p>
      <button style={{
        backgroundColor: '#8A63D2',
        color: 'white',
        padding: '10px 20px',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer'
      }} onClick={() => alert('Button clicked!')}>
        Test Button
      </button>
    </div>
  );
}

export default App;
