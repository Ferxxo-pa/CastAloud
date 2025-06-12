import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import path from "path";

const app = express();

// Priority routes for Farcaster manifest - must be before any middleware
// Generate fresh manifest data to avoid caching issues
function getFarcasterManifest() {
  return {
    "version": "1",
    "name": "Cast Aloud",
    "iconUrl": "https://castaloud.replit.app/icon.png",
    "homeUrl": "https://castaloud.replit.app",
    "splashImageUrl": "https://castaloud.replit.app/icon.png",
    "splashBackgroundColor": "#8A63D2",
    "subtitle": "Voice accessibility for casts",
    "description": "Read casts aloud with AI-powered voice technology and get intelligent feedback on your replies",
    "primaryCategory": "utility",
    "tags": [
      "voice",
      "accessibility", 
      "tts",
      "ai",
      "transcription"
    ],
    "tagline": "Voice-accessible Farcaster",
    "requiredChains": [],
    "requiredCapabilities": [
      "actions.composeCast",
      "actions.ready"
    ]
  };
}



// Priority route with timestamp to force cache refresh
app.get('/.well-known/farcaster.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.setHeader('X-Timestamp', Date.now().toString());
  res.json(getFarcasterManifest());
});

// Serve static files from public directory
app.use(express.static('public'));

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

(async () => {
  const server = await registerRoutes(app);

  // Serve static files from server/public (for .well-known, icons, etc.)
  const serverPublicPath = path.resolve(import.meta.dirname, "public");
  app.use(express.static(serverPublicPath));

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
