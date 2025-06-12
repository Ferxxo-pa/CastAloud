import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import path from "path";

const app = express();

// Intercept ALL requests to manifest before any other middleware
app.use((req, res, next) => {
  if (req.path === '/.well-known/farcaster.json') {
    const manifest = {
      "name": "Cast Aloud",
      "description": "Voice accessibility for Farcaster casts using AI-powered voice technology",
      "homeUrl": "https://castaloud.replit.app",
      "iconUrl": "https://castaloud.replit.app/icon.png",
      "splashImageUrl": "https://castaloud.replit.app/splash.png", 
      "backgroundColor": "#8A63D2"
    };
    
    res.writeHead(200, {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
      'Access-Control-Allow-Origin': '*',
      'X-Manifest-Version': Date.now().toString()
    });
    
    return res.end(JSON.stringify(manifest, null, 2));
  }
  next();
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

// Override static file serving for manifest path
app.use('/.well-known/farcaster.json', (req, res) => {
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
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  return res.json(manifest);
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

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

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

  // Add manifest route before Vite to override catch-all routing
  app.get('/.well-known/farcaster.json', (req, res) => {
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
