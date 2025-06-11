import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

console.log("main.tsx is loading");

const rootElement = document.getElementById("root");
console.log("Root element:", rootElement);

if (rootElement) {
  try {
    console.log("Creating React root...");
    const root = createRoot(rootElement);
    console.log("Rendering App...");
    root.render(<App />);
    console.log("App rendered successfully");
  } catch (error) {
    console.error("Error rendering app:", error);
    rootElement.innerHTML = `<div style="padding: 20px; color: red;">Error loading app: ${error}</div>`;
  }
} else {
  console.error("Root element not found");
}
