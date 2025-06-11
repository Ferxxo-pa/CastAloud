import { createRoot } from "react-dom/client";
import "./index.css";

// Minimal app component
function App() {
  return (
    <div style={{ 
      minHeight: "100vh", 
      backgroundColor: "#f9fafb", 
      display: "flex", 
      alignItems: "center", 
      justifyContent: "center" 
    }}>
      <div style={{ 
        textAlign: "center", 
        maxWidth: "400px", 
        margin: "0 auto", 
        padding: "24px" 
      }}>
        <h1 style={{ 
          fontSize: "32px", 
          fontWeight: "bold", 
          color: "#111827", 
          marginBottom: "16px" 
        }}>
          🔊 Cast Aloud
        </h1>
        <p style={{ 
          color: "#6b7280", 
          marginBottom: "24px" 
        }}>
          Voice accessibility tools for Farcaster
        </p>
        
        <div style={{ 
          backgroundColor: "white", 
          borderRadius: "8px", 
          padding: "24px", 
          border: "1px solid #e5e7eb" 
        }}>
          <h2 style={{ 
            fontSize: "18px", 
            fontWeight: "600", 
            marginBottom: "16px" 
          }}>
            Farcaster Mini App Ready
          </h2>
          <p style={{ 
            fontSize: "14px", 
            color: "#6b7280", 
            marginBottom: "16px" 
          }}>
            Accessibility features for reading and replying to casts using voice technology.
          </p>
          
          <a 
            href="/mini-app?text=Hello%20world!%20This%20is%20a%20sample%20cast." 
            style={{ 
              display: "block",
              backgroundColor: "#8b5cf6", 
              color: "white", 
              padding: "12px 16px", 
              borderRadius: "8px", 
              textDecoration: "none",
              fontWeight: "500"
            }}
          >
            Try Voice Features
          </a>
        </div>
      </div>
    </div>
  );
}

const root = createRoot(document.getElementById("root")!);
root.render(<App />);

// Initialize Farcaster Frame SDK
setTimeout(async () => {
  try {
    const { sdk } = await import('@farcaster/frame-sdk');
    await sdk.actions.ready();
    console.log('Farcaster Frame SDK initialized');
  } catch (error) {
    console.log('Frame SDK initialization failed:', error);
  }
}, 100);
