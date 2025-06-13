import { useState, useEffect } from 'react';

export default function DebugTest() {
  const [logs, setLogs] = useState<string[]>([]);
  const [reactMounted, setReactMounted] = useState(false);

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  useEffect(() => {
    addLog('React component mounted successfully');
    setReactMounted(true);

    // Test various aspects
    addLog('Testing document.getElementById...');
    const rootElement = document.getElementById('root');
    if (rootElement) {
      addLog('✓ Root element found');
      addLog(`Root element has ${rootElement.children.length} children`);
    } else {
      addLog('✗ Root element not found');
    }

    // Test CSS loading
    addLog('Testing CSS...');
    const testElement = document.createElement('div');
    testElement.className = 'bg-fc-purple text-white p-4';
    testElement.textContent = 'CSS Test';
    testElement.style.position = 'fixed';
    testElement.style.top = '10px';
    testElement.style.right = '10px';
    testElement.style.zIndex = '9999';
    document.body.appendChild(testElement);
    
    setTimeout(() => {
      const computedStyle = window.getComputedStyle(testElement);
      addLog(`CSS background: ${computedStyle.backgroundColor}`);
      addLog(`CSS color: ${computedStyle.color}`);
      document.body.removeChild(testElement);
    }, 100);

    // Test console errors
    const originalError = console.error;
    console.error = (...args) => {
      addLog(`CONSOLE ERROR: ${args.join(' ')}`);
      originalError.apply(console, args);
    };

    return () => {
      console.error = originalError;
    };
  }, []);

  return (
    <div style={{ 
      padding: '20px', 
      fontFamily: 'monospace', 
      background: 'white',
      border: '2px solid green',
      margin: '20px'
    }}>
      <h1 style={{ color: 'green' }}>Debug Test Page</h1>
      <p style={{ color: reactMounted ? 'green' : 'red' }}>
        React Status: {reactMounted ? '✓ MOUNTED' : '✗ NOT MOUNTED'}
      </p>
      
      <div style={{ background: '#f0f0f0', padding: '10px', marginTop: '20px' }}>
        <h2>Diagnostic Logs:</h2>
        {logs.map((log, index) => (
          <div key={index} style={{ 
            padding: '5px',
            borderBottom: '1px solid #ccc',
            fontSize: '14px'
          }}>
            {log}
          </div>
        ))}
      </div>

      <div style={{ marginTop: '20px' }}>
        <button 
          onClick={() => {
            addLog('Manual test button clicked');
            addLog(`Current URL: ${window.location.href}`);
            addLog(`User agent: ${navigator.userAgent}`);
          }}
          style={{
            background: '#007acc',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Run Additional Tests
        </button>
      </div>
    </div>
  );
}