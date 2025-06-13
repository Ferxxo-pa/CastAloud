import { useState } from "react";
import HomeSimple from "@/pages/home-simple";

function App() {
  console.log('App component rendering...');
  
  try {
    return <HomeSimple />;
  } catch (error) {
    console.error('App render error:', error);
    return (
      <div style={{ padding: '20px', fontFamily: 'Arial' }}>
        <h1 style={{ color: 'red' }}>Component Error</h1>
        <p>Failed to render app: {error instanceof Error ? error.message : String(error)}</p>
      </div>
    );
  }
}

export default App;
