console.log("main.tsx loading...");

try {
  const rootElement = document.getElementById("root");
  console.log("Root element:", rootElement);
  
  if (rootElement) {
    // First try simple DOM manipulation
    rootElement.innerHTML = '<h1 style="color: red; font-size: 24px; padding: 20px;">Direct DOM Test - This should be visible</h1>';
    
    // Then try React
    setTimeout(async () => {
      try {
        const { createRoot } = await import("react-dom/client");
        const App = (await import("./App")).default;
        
        console.log("About to render React app...");
        const root = createRoot(rootElement);
        root.render(<App />);
        console.log("React app rendered");
      } catch (error) {
        console.error("React rendering failed:", error);
        rootElement.innerHTML = `<h1 style="color: red;">React Error: ${error.message}</h1>`;
      }
    }, 1000);
  } else {
    console.error("Root element not found!");
  }
} catch (error) {
  console.error("Main.tsx error:", error);
}
