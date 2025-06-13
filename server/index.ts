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

// Simple test endpoint with minimal HTML - placed before Vite middleware
app.get('/api/test', (req, res) => {
  res.setHeader('Content-Type', 'text/html');
  res.send(`
<!DOCTYPE html>
<html>
<head>
    <title>Test Page</title>
    <meta charset="UTF-8">
</head>
<body style="font-family: Arial; padding: 20px; background: white;">
    <h1 style="color: #8A63D2;">Server Test Working</h1>
    <p>If you can see this, the server is working correctly.</p>
    <p>Time: ${new Date().toISOString()}</p>
    <p>This bypasses Vite and serves directly from Express.</p>
    <button onclick="alert('JavaScript is working!')" style="background: #8A63D2; color: white; padding: 10px; border: none; border-radius: 4px;">Test JS</button>
</body>
</html>`);
});

// Cache clearing endpoint
app.get('/clear-cache', (req, res) => {
  res.setHeader('Content-Type', 'text/html');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  
  const html = `
<!DOCTYPE html>
<html>
<head>
    <title>Clear Cache - Cast Aloud</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; }
        .status { padding: 10px; margin: 10px 0; border-radius: 4px; }
        .success { background: #d4edda; color: #155724; }
        .error { background: #f8d7da; color: #721c24; }
        .info { background: #d1ecf1; color: #0c5460; }
        button { background: #8A63D2; color: white; padding: 12px 24px; border: none; border-radius: 6px; cursor: pointer; font-size: 16px; }
        button:hover { background: #7652C4; }
    </style>
</head>
<body>
    <h1>Cast Aloud - Clear Cache</h1>
    <div id="status"></div>
    <button onclick="clearAllCaches()">Clear All Caches</button>
    <div style="margin-top: 20px;">
        <a href="/" style="color: #8A63D2; text-decoration: none;">← Back to Cast Aloud</a>
    </div>
    
    <script>
        async function clearAllCaches() {
            const status = document.getElementById('status');
            status.innerHTML = '<div class="info">Clearing caches...</div>';
            
            try {
                // Unregister all service workers
                if ('serviceWorker' in navigator) {
                    const registrations = await navigator.serviceWorker.getRegistrations();
                    for (let registration of registrations) {
                        await registration.unregister();
                        status.innerHTML += '<div class="success">Unregistered service worker</div>';
                    }
                }
                
                // Clear all caches
                if ('caches' in window) {
                    const cacheNames = await caches.keys();
                    await Promise.all(
                        cacheNames.map(async name => {
                            await caches.delete(name);
                            status.innerHTML += '<div class="success">Cleared cache: ' + name + '</div>';
                        })
                    );
                }
                
                // Clear localStorage and sessionStorage
                localStorage.clear();
                sessionStorage.clear();
                status.innerHTML += '<div class="success">Cleared local storage</div>';
                
                status.innerHTML += '<div class="success"><strong>All caches cleared successfully!</strong></div>';
                status.innerHTML += '<div class="info">Redirecting to main app in 2 seconds...</div>';
                
                setTimeout(() => {
                    window.location.href = '/';
                }, 2000);
                
            } catch (error) {
                status.innerHTML += '<div class="error">Error: ' + error.message + '</div>';
            }
        }
        
        // Auto-clear on page load
        window.addEventListener('load', clearAllCaches);
    </script>
</body>
</html>`;
  
  res.send(html);
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



// No-cache headers for HTML pages to prevent caching issues
app.use((req, res, next) => {
  if (req.path === '/' || req.path.endsWith('.html') || req.accepts('html')) {
    res.header('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.header('Pragma', 'no-cache');
    res.header('Expires', '0');
  }
  next();
});

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
