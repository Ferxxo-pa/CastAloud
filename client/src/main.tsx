import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Simplified initialization
console.log('Initializing React app...');

const rootElement = document.getElementById("root");
if (!rootElement) {
  document.body.innerHTML = '<div style="padding: 20px; color: red;">Root element not found</div>';
} else {
  try {
    const root = createRoot(rootElement);
    root.render(<App />);
    console.log('React app mounted successfully');
    
    // Signal successful mount
    if ((window as any).reactMountedCallback) {
      (window as any).reactMountedCallback();
    }
  } catch (error) {
    console.error('React mount failed:', error);
    rootElement.innerHTML = `
      <div style="padding: 20px; font-family: Arial;">
        <h1 style="color: red;">App Loading Failed</h1>
        <p>Error: ${error instanceof Error ? error.message : String(error)}</p>
        <button onclick="location.reload()" style="background: #8A63D2; color: white; padding: 10px 20px; border: none; border-radius: 4px;">
          Reload
        </button>
      </div>
    `;
  }
}
