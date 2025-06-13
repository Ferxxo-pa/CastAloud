import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Add global error handling
window.addEventListener('error', (e) => {
  console.error('Global error:', e.error);
  document.body.innerHTML += `<div style="color: red; padding: 20px; background: #ffe6e6; border: 2px solid red; margin: 20px;">
    <h2>JavaScript Error Detected:</h2>
    <p><strong>Message:</strong> ${e.message}</p>
    <p><strong>File:</strong> ${e.filename}:${e.lineno}:${e.colno}</p>
    <pre>${e.error?.stack || 'No stack trace'}</pre>
  </div>`;
});

window.addEventListener('unhandledrejection', (e) => {
  console.error('Unhandled promise rejection:', e.reason);
  document.body.innerHTML += `<div style="color: red; padding: 20px; background: #ffe6e6; border: 2px solid red; margin: 20px;">
    <h2>Promise Rejection:</h2>
    <p>${e.reason}</p>
  </div>`;
});

// Signal that module loaded
if ((window as any).moduleLoadedCallback) {
  (window as any).moduleLoadedCallback();
}

try {
  console.log('Starting React app initialization...');
  
  // Check if root element exists
  const rootElement = document.getElementById("root");
  if (!rootElement) {
    throw new Error("Root element not found!");
  }
  
  console.log('Root element found, creating React root...');
  const root = createRoot(rootElement);
  
  console.log('Rendering App component...');
  root.render(<App />);
  
  console.log('React app rendered successfully');
  
  // Signal that React mounted
  if ((window as any).reactMountedCallback) {
    (window as any).reactMountedCallback();
  }
  
} catch (error) {
  console.error('Failed to initialize React app:', error);
  
  // Show error directly in the DOM
  document.body.innerHTML = `
    <div style="padding: 20px; font-family: Arial, sans-serif;">
      <h1 style="color: red;">React Initialization Failed</h1>
      <p><strong>Error:</strong> ${error instanceof Error ? error.message : String(error)}</p>
      <p><strong>Stack:</strong></p>
      <pre style="background: #f0f0f0; padding: 10px; border-radius: 4px;">${error instanceof Error ? error.stack : 'No stack trace'}</pre>
      
      <h2>Debugging Information:</h2>
      <ul>
        <li>Root element exists: ${document.getElementById("root") ? "✓ Yes" : "✗ No"}</li>
        <li>Document ready state: ${document.readyState}</li>
        <li>Current URL: ${window.location.href}</li>
        <li>User Agent: ${navigator.userAgent}</li>
      </ul>
      
      <button onclick="location.reload()" style="background: #007acc; color: white; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer;">
        Reload Page
      </button>
    </div>
  `;
}
