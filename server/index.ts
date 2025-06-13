import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import path from "path";

const app = express();

// CRITICAL: Disable cartographer for manifest by setting environment flag
app.get('/.well-known/farcaster.json', (req, res) => {
  // Temporarily disable REPL_ID to bypass cartographer
  const originalReplId = process.env.REPL_ID;
  delete process.env.REPL_ID;
  
  const manifest = {
    "name": "Castaloud",
    "description": "Voice accessibility for Farcaster casts using AI-powered voice technology",
    "homeUrl": "https://castaloud.replit.app",
    "iconUrl": "https://castaloud.replit.app/castaloud-logo.png",
    "splashImageUrl": "https://castaloud.replit.app/castaloud-logo.png",
    "backgroundColor": "#8A63D2"
  };
  
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  
  // Send response and restore environment
  res.json(manifest);
  
  // Restore REPL_ID
  if (originalReplId) {
    process.env.REPL_ID = originalReplId;
  }
});

// Fix asset serving with proper content types
app.get('/icon.png', (req, res) => {
  res.setHeader('Content-Type', 'image/png');
  res.setHeader('Cache-Control', 'public, max-age=31536000');
  res.sendFile(path.resolve('./public/icon.png'));
});

app.get('/splash.png', (req, res) => {
  res.setHeader('Content-Type', 'image/png');
  res.setHeader('Cache-Control', 'public, max-age=31536000');
  res.sendFile(path.resolve('./public/splash.png'));
});

// Serve Castaloud logo with proper headers
app.get('/castaloud-logo.png', (req, res) => {
  res.setHeader('Content-Type', 'image/png');
  res.setHeader('Cache-Control', 'public, max-age=31536000');
  res.sendFile(path.resolve('./public/castaloud-logo.png'));
});



// Alternative manifest endpoint to bypass caching
app.get('/farcaster-manifest', (req, res) => {
  const manifest = {
    "name": "Castaloud",
    "description": "Voice accessibility for Farcaster casts using AI-powered voice technology",
    "homeUrl": "https://castaloud.replit.app",
    "iconUrl": "https://castaloud.replit.app/castaloud-logo.png",
    "splashImageUrl": "https://castaloud.replit.app/castaloud-logo.png",
    "backgroundColor": "#8A63D2"
  };
  
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  return res.json(manifest);
});

// Test endpoint to verify server changes are working
app.get('/test-manifest', (req, res) => {
  res.json({
    message: "Server code is updated",
    timestamp: new Date().toISOString(),
    manifestPath: "/.well-known/farcaster.json intercepted"
  });
});

// Debug page to test if HTML/JS works in preview
app.get('/debug', (req, res) => {
  const debugHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Cast Aloud - Debug</title>
    <style>
        body { 
            font-family: Arial, sans-serif; 
            padding: 20px; 
            background: white;
            color: black;
            margin: 0;
        }
        .section { 
            background: #f8f9fa; 
            padding: 15px; 
            margin: 10px 0; 
            border-radius: 8px; 
            border-left: 4px solid #8A63D2;
        }
        .success { color: #22c55e; font-weight: bold; }
        .error { color: #ef4444; font-weight: bold; }
    </style>
</head>
<body>
    <h1 style="color: #8A63D2; margin: 0 0 20px 0;">Cast Aloud - Debug Page</h1>
    
    <div class="section">
        <h3>HTML Rendering Test</h3>
        <p class="success">✓ HTML is loading correctly</p>
        <p>Server timestamp: ${new Date().toISOString()}</p>
    </div>
    
    <div class="section">
        <h3>JavaScript Test</h3>
        <p id="js-status" class="error">✗ JavaScript not executed yet</p>
        <button onclick="testFunction()">Click to test JS interaction</button>
    </div>
    
    <div class="section">
        <h3>Main App Test</h3>
        <p>The main app should load at <a href="/" style="color: #8A63D2;">localhost:5000</a></p>
        <button onclick="loadMainApp()">Try to load main app content</button>
        <div id="main-app-test" style="margin-top: 10px; padding: 10px; border: 1px solid #ccc; min-height: 50px;">
            Main app content will appear here...
        </div>
    </div>
    
    <script>
        console.log("Debug page JavaScript is running!");
        
        // Update JavaScript status
        document.getElementById('js-status').textContent = '✓ JavaScript is working';
        document.getElementById('js-status').className = 'success';
        
        function testFunction() {
            alert('JavaScript interaction works!');
        }
        
        function loadMainApp() {
            const container = document.getElementById('main-app-test');
            container.innerHTML = '<p style="color: #8A63D2;">Loading main app...</p>';
            
            // Try to fetch and inject the main app
            fetch('/')
                .then(response => response.text())
                .then(html => {
                    // Extract just the root div content
                    const parser = new DOMParser();
                    const doc = parser.parseFromString(html, 'text/html');
                    const mainScript = doc.querySelector('script[src*="main.tsx"]');
                    
                    if (mainScript) {
                        container.innerHTML = '<div id="embedded-root" style="border: 2px solid #8A63D2; padding: 10px;">React app container ready</div>';
                        
                        // Try to load the main script
                        const script = document.createElement('script');
                        script.type = 'module';
                        script.src = mainScript.src;
                        script.onload = () => {
                            container.innerHTML += '<p style="color: green;">Main script loaded successfully!</p>';
                        };
                        script.onerror = (e) => {
                            container.innerHTML += '<p style="color: red;">Main script failed to load: ' + e.message + '</p>';
                        };
                        document.head.appendChild(script);
                    } else {
                        container.innerHTML = '<p style="color: red;">Could not find main script in response</p>';
                    }
                })
                .catch(error => {
                    container.innerHTML = '<p style="color: red;">Failed to fetch main app: ' + error.message + '</p>';
                });
        }
    </script>
</body>
</html>`;
  
  res.setHeader('Content-Type', 'text/html');
  res.send(debugHTML);
});

// Configure static file serving with proper MIME types
app.use(express.static('public', {
  setHeaders: (res, path) => {
    if (path.endsWith('.png')) {
      res.setHeader('Content-Type', 'image/png');
    } else if (path.endsWith('.jpg') || path.endsWith('.jpeg')) {
      res.setHeader('Content-Type', 'image/jpeg');
    } else if (path.endsWith('.svg')) {
      res.setHeader('Content-Type', 'image/svg+xml');
    } else if (path.endsWith('.json')) {
      res.setHeader('Content-Type', 'application/json');
    }
  }
}));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));



// CORS headers for Farcaster miniapp testing
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Simple logging without JSON interception
app.use((req, res, next) => {
  const start = Date.now();
  
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (req.path.startsWith("/api")) {
      const logLine = `${req.method} ${req.path} ${res.statusCode} in ${duration}ms`;
      log(logLine);
    }
  });

  next();
});

  // Serve static files FIRST to ensure they take precedence
  const serverPublicPath = path.resolve(import.meta.dirname, "public");
  app.use(express.static(serverPublicPath));

(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });



  // Setup vite in development, serve static files in production
  // Check NODE_ENV instead of app.get("env") for better reliability
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    // In production, serve the built static files
    try {
      serveStatic(app);
    } catch (error) {
      console.log("Static files not found, falling back to vite dev server");
      await setupVite(app, server);
    }
  }

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = 5000;
  const host = "0.0.0.0";
  
  server.listen(port, host, () => {
    log(`serving on port ${port}`);
    log(`server listening on http://${host}:${port}`);
  });
  
  // Add error handling for server startup
  server.on('error', (err: any) => {
    if (err.code === 'EADDRINUSE') {
      log(`Port ${port} is already in use`);
      process.exit(1);
    } else {
      log(`Server error: ${err.message}`);
      process.exit(1);
    }
  });
  
  // Graceful shutdown handling
  process.on('SIGTERM', () => {
    log('SIGTERM received, shutting down gracefully');
    server.close(() => {
      log('Server closed');
      process.exit(0);
    });
  });
  
  process.on('SIGINT', () => {
    log('SIGINT received, shutting down gracefully');
    server.close(() => {
      log('Server closed');
      process.exit(0);
    });
  });
})();
