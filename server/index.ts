import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import path from "path";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Register manifest endpoints before any middleware to ensure proper handling
app.get('/.well-known/farcaster.json', (_req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.json({
    "name": "Cast Aloud",
    "description": "Voice accessibility tools for reading and replying to Farcaster casts",
    "homeUrl": "https://castaloud.replit.app",
    "iconUrl": "https://castaloud.replit.app/icon.png",
    "splashImageUrl": "https://castaloud.replit.app/api/frame/image?state=initial",
    "backgroundColor": "#8A63D2",
    "frame": {
      "requiredChains": [],
      "requiredCapabilities": [
        "actions.composeCast",
        "actions.ready"
      ]
    },
    "accountAssociation": {
      "header": "eyJmaWQiOjEsInR5cGUiOiJjdXN0b2R5IiwibWFkZSI6MX0",
      "payload": "eyJkb21haW4iOiJjYXN0YWxvdWQuY29tIn0",
      "signature": "0x..."
    }
  });
});

app.get('/manifest.json', (_req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.json({
    "name": "Cast Aloud",
    "short_name": "Cast Aloud", 
    "description": "Voice accessibility tools for reading and replying to Farcaster casts",
    "start_url": "/",
    "display": "standalone",
    "background_color": "#FFFFFF",
    "theme_color": "#8A63D2",
    "orientation": "portrait",
    "scope": "/",
    "icons": [
      {
        "src": "/favicon.png",
        "sizes": "1024x1024",
        "type": "image/png",
        "purpose": "any maskable"
      }
    ],
    "categories": ["accessibility", "social", "utilities"],
    "lang": "en",
    "dir": "ltr",
    "farcaster": {
      "version": "1",
      "name": "Cast Aloud",
      "description": "Voice accessibility tools for Farcaster",
      "iconUrl": "https://castaloud.replit.app/favicon.png",
      "splashImageUrl": "https://castaloud.replit.app/api/frame/image?state=initial",
      "homeUrl": "https://castaloud.replit.app/",
      "buttonTitle": "Open Cast Aloud",
      "splashBackgroundColor": "#FFFFFF",
      "webhookUrl": "https://castaloud.replit.app/api/frame/action",
      "features": ["voice", "accessibility", "tts", "transcription"],
      "requiredCapabilities": ["actions.ready"],
      "frame": {
        "version": "1",
        "imageUrl": "https://castaloud.replit.app/api/frame/image?state=initial",
        "buttonUrl": "https://castaloud.replit.app/api/frame/action",
        "homeUrl": "https://castaloud.replit.app/"
      }
    },
    "accountAssociation": {
      "header": "eyJmaWQiOjEsInR5cGUiOiJjdXN0b2R5Iiwia2V5IjoiMHgxMjM0NSJ9",
      "payload": "eyJkb21haW4iOiJjYXN0YWxvdWQucmVwbGl0LmFwcCJ9",
      "signature": "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef"
    }
  });
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
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();
