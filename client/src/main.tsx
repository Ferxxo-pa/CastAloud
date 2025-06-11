import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Initialize the app
const root = createRoot(document.getElementById("root")!);
root.render(<App />);

// Initialize Farcaster Frame SDK after render
setTimeout(async () => {
  try {
    const { sdk } = await import('@farcaster/frame-sdk');
    await sdk.actions.ready();
    console.log('Farcaster Frame SDK initialized successfully');
  } catch (error) {
    console.log('Frame SDK not available or failed to initialize:', error);
  }
}, 100);
