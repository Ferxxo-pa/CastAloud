import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import "./lib/frame-sdk";

// Simple test component to verify React is working
function TestHome() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Cast Aloud</h1>
        <p className="text-gray-600 mb-4">Voice accessibility tools for Farcaster</p>
        <div className="space-y-2">
          <a href="/cast-aloud?text=Hello%20world!%20This%20is%20a%20sample%20cast." 
             className="block bg-purple-600 hover:bg-purple-700 text-white py-3 px-6 rounded-lg">
            Try Cast Aloud
          </a>
        </div>
      </div>
    </div>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={TestHome} />
      <Route path="/cast-aloud">
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-xl font-bold">Cast Aloud Mini App</h1>
            <p className="text-gray-600 mt-2">Voice accessibility features loading...</p>
          </div>
        </div>
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
    </QueryClientProvider>
  );
}

export default App;
