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

// Serve the complete Cast Aloud app directly from Express - DISABLED IN FAVOR OF ROOT
app.get('/app-backup', (req, res) => {
  res.setHeader('Content-Type', 'text/html');
  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Cast Aloud - Voice Accessibility for Farcaster</title>
    <style>
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
            margin: 0; 
            padding: 0; 
            background: #fafafa;
        }
        .min-h-screen { min-height: 100vh; }
        .bg-fc-gray-50 { background-color: #fafafa; }
        .max-w-md { max-width: 28rem; }
        .mx-auto { margin-left: auto; margin-right: auto; }
        .p-4 { padding: 1rem; }
        .mb-6 { margin-bottom: 1.5rem; }
        .text-center { text-align: center; }
        .text-2xl { font-size: 1.5rem; line-height: 2rem; }
        .font-bold { font-weight: 700; }
        .text-fc-gray-900 { color: #111827; }
        .text-fc-gray-600 { color: #6b7280; }
        .mt-2 { margin-top: 0.5rem; }
        .bg-white { background-color: #ffffff; }
        .rounded-lg { border-radius: 0.5rem; }
        .p-6 { padding: 1.5rem; }
        .border { border-width: 1px; }
        .border-fc-gray-200 { border-color: #e5e7eb; }
        .relative { position: relative; }
        .absolute { position: absolute; }
        .top-4 { top: 1rem; }
        .right-4 { right: 1rem; }
        .px-3 { padding-left: 0.75rem; padding-right: 0.75rem; }
        .py-2 { padding-top: 0.5rem; padding-bottom: 0.5rem; }
        .transition-colors { transition-property: color, background-color, border-color, text-decoration-color, fill, stroke; }
        .duration-200 { transition-duration: 200ms; }
        .flex { display: flex; }
        .items-center { align-items: center; }
        .gap-2 { gap: 0.5rem; }
        .text-sm { font-size: 0.875rem; line-height: 1.25rem; }
        .font-medium { font-weight: 500; }
        .bg-fc-purple\\/10 { background-color: rgba(138, 99, 210, 0.1); }
        .hover\\:bg-fc-purple\\/20:hover { background-color: rgba(138, 99, 210, 0.2); }
        .text-fc-purple { color: #8A63D2; }
        .bg-fc-error\\/10 { background-color: rgba(239, 68, 68, 0.1); }
        .hover\\:bg-fc-error\\/20:hover { background-color: rgba(239, 68, 68, 0.2); }
        .text-fc-error { color: #ef4444; }
        .text-lg { font-size: 1.125rem; line-height: 1.75rem; }
        .font-semibold { font-weight: 600; }
        .mb-4 { margin-bottom: 1rem; }
        .space-y-3 > * + * { margin-top: 0.75rem; }
        .block { display: block; }
        .w-full { width: 100%; }
        .bg-fc-purple { background-color: #8A63D2; }
        .hover\\:bg-fc-purple-dark:hover { background-color: #7652C4; }
        .text-white { color: #ffffff; }
        .py-3 { padding-top: 0.75rem; padding-bottom: 0.75rem; }
        .px-4 { padding-left: 1rem; padding-right: 1rem; }
        .cursor-pointer { cursor: pointer; }
        .bg-fc-gray-200 { background-color: #e5e7eb; }
        .hover\\:bg-fc-gray-300:hover { background-color: #d1d5db; }
        .text-fc-gray-800 { color: #1f2937; }
        .hover\\:text-fc-gray-900:hover { color: #111827; }
        .mt-4 { margin-top: 1rem; }
        .mt-6 { margin-top: 1.5rem; }
        .bg-gray-50 { background-color: #f9fafb; }
        .border-fc-gray-300 { border-color: #d1d5db; }
        .rounded-md { border-radius: 0.375rem; }
        .focus\\:ring-2:focus { box-shadow: 0 0 0 2px rgba(138, 99, 210, 0.5); }
        .focus\\:ring-fc-purple:focus { --tw-ring-color: #8A63D2; }
        .focus\\:border-transparent:focus { border-color: transparent; }
        .bg-gray-100 { background-color: #f3f4f6; }
        .hover\\:bg-gray-200:hover { background-color: #e5e7eb; }
        .text-gray-700 { color: #374151; }
        .bg-red-500 { background-color: #ef4444; }
        .hover\\:bg-red-600:hover { background-color: #dc2626; }
        .hidden { display: none; }
        
        .voice-settings {
            background: white;
            border: 1px solid #e5e7eb;
            border-radius: 0.5rem;
            padding: 1rem;
            margin-top: 1rem;
        }
        
        .form-group {
            margin: 12px 0;
        }
        
        .form-group label {
            display: block;
            margin-bottom: 4px;
            font-weight: 500;
            color: #374151;
        }
        
        .form-group select,
        .form-group input[type="range"] {
            width: 100%;
            padding: 8px;
            border: 1px solid #d1d5db;
            border-radius: 4px;
        }
        
        .form-group input[type="range"] {
            padding: 0;
        }
        
        .how-it-works {
            background: #f9fafb;
            border-radius: 0.5rem;
            padding: 1rem;
            margin-top: 1.5rem;
        }
        
        .how-it-works ol {
            margin: 0;
            padding-left: 20px;
            color: #6b7280;
            font-size: 0.875rem;
        }
        
        .how-it-works ol li {
            margin: 4px 0;
        }
        
        button {
            border: none;
            cursor: pointer;
            font-family: inherit;
            transition: all 0.2s;
        }
        
        button:hover {
            transform: translateY(-1px);
        }
    </style>
</head>
<body>
    <div class="min-h-screen bg-fc-gray-50">
        <div class="max-w-md mx-auto p-4">
            <header class="mb-6">
                <div class="text-center">
                    <h1 class="text-2xl font-bold text-fc-gray-900" style="color: #8A63D2;">Cast Aloud</h1>
                    <p class="text-fc-gray-600 mt-2">
                        Accessibility tools for reading and replying to casts
                    </p>
                </div>
            </header>

            <div class="bg-white rounded-lg p-6 border border-fc-gray-200 relative">
                <button
                    id="readAloudBtn"
                    onclick="readPageAloud()"
                    class="absolute top-4 right-4 px-3 py-2 rounded-lg transition-colors duration-200 flex items-center gap-2 text-sm font-medium bg-fc-purple/10 hover:bg-fc-purple/20 text-fc-purple"
                    title="Read page aloud"
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
                        <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
                        <path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
                    </svg>
                    <span id="readAloudText">Read Aloud</span>
                </button>
                
                <h2 class="text-lg font-semibold mb-4 text-fc-gray-900">Try the Mini App</h2>
                <p class="text-fc-gray-600 mb-4">
                    The mini app helps you read casts aloud and create voice replies with AI assistance.
                </p>
                
                <div class="space-y-3">
                    <button onclick="readSampleCast()" class="block w-full bg-fc-purple hover:bg-fc-purple-dark text-white py-3 px-4 rounded-lg text-center font-medium">
                        Read Cast Aloud
                    </button>
                    
                    <button 
                        onclick="toggleVoiceSettings()"
                        class="block w-full bg-fc-gray-200 hover:bg-fc-gray-300 text-fc-gray-800 hover:text-fc-gray-900 py-3 px-4 rounded-lg text-center font-medium transition-colors duration-200"
                    >
                        Voice Settings
                    </button>
                </div>

                <div id="voiceSettings" class="voice-settings hidden">
                    <h3 style="margin-top: 0; font-weight: 500;">Voice Settings</h3>
                    
                    <div class="form-group">
                        <label>Voice:</label>
                        <select id="voiceSelect">
                            <option value="">Loading voices...</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label>Speed: <span id="speedValue">0.9x</span></label>
                        <input type="range" id="speedSlider" min="0.5" max="2" step="0.1" value="0.9">
                    </div>
                    
                    <button
                        id="testVoiceBtn"
                        onclick="testVoice()"
                        class="w-full font-medium py-2 px-4 rounded-lg transition-colors duration-200 bg-gray-100 hover:bg-gray-200 text-gray-700"
                    >
                        Test Voice
                    </button>
                </div>

                <div class="how-it-works">
                    <h3 style="margin-top: 0; font-weight: 500;">How it works:</h3>
                    <ol>
                        <li>📝 Paste a Farcaster post URL or text directly</li>
                        <li>🔊 Click "Read Aloud" to hear the content</li>
                        <li>✍️ Type your reply in the text area</li>
                        <li>🤖 Get AI feedback or polish your reply</li>
                        <li>📋 Copy the improved reply to post on Farcaster</li>
                    </ol>
                </div>
            </div>
        </div>
    </div>

    <script>
        let voices = [];
        let selectedVoice = null;
        let speechRate = 0.9;
        let isSpeaking = false;
        let showingSettings = false;
        let isTestVoicePlaying = false;
        
        // Load available voices
        function loadVoices() {
            voices = speechSynthesis.getVoices();
            const voiceSelect = document.getElementById('voiceSelect');
            voiceSelect.innerHTML = '<option value="">Select a voice...</option>';
            
            voices.forEach((voice, index) => {
                const option = document.createElement('option');
                option.value = index;
                option.textContent = voice.name + ' (' + voice.lang + ')';
                voiceSelect.appendChild(option);
            });
            
            if (voices.length > 0 && !selectedVoice) {
                selectedVoice = voices[0];
                voiceSelect.value = 0;
            }
        }
        
        // Initialize voices
        speechSynthesis.addEventListener('voiceschanged', loadVoices);
        loadVoices();
        
        // Voice settings handlers
        document.getElementById('voiceSelect').addEventListener('change', function(e) {
            if (e.target.value !== '') {
                selectedVoice = voices[parseInt(e.target.value)];
            }
        });
        
        document.getElementById('speedSlider').addEventListener('input', function(e) {
            speechRate = parseFloat(e.target.value);
            document.getElementById('speedValue').textContent = speechRate.toFixed(1) + 'x';
        });
        
        function toggleVoiceSettings() {
            const settings = document.getElementById('voiceSettings');
            showingSettings = !showingSettings;
            settings.className = showingSettings ? 'voice-settings' : 'voice-settings hidden';
        }
        
        function readPageAloud() {
            const textToRead = \`
                Cast Aloud. Accessibility tools for reading and replying to casts.
                
                Try the Mini App. The mini app helps you read casts aloud and create voice replies with AI assistance.
                
                How it works:
                1. Paste a Farcaster post URL or text directly
                2. Click "Read Aloud" to hear the content  
                3. Type your reply in the text area
                4. Get AI feedback or polish your reply
                5. Copy the improved reply to post on Farcaster
            \`;

            if (isSpeaking) {
                speechSynthesis.cancel();
                updateReadButton(false);
            } else {
                speak(textToRead, function() {
                    isSpeaking = true;
                    updateReadButton(true);
                }, function() {
                    isSpeaking = false;
                    updateReadButton(false);
                });
            }
        }
        
        function readSampleCast() {
            const sampleText = \`
                Hello from Cast Aloud! This is a sample Farcaster cast being read aloud using voice technology. 
                Cast Aloud helps make social media more accessible by providing voice features for reading and replying to posts.
                You can adjust the voice settings to customize your listening experience.
            \`;
            
            speak(sampleText);
        }
        
        function testVoice() {
            if (isTestVoicePlaying) {
                speechSynthesis.cancel();
                isTestVoicePlaying = false;
                document.getElementById('testVoiceBtn').textContent = 'Test Voice';
                document.getElementById('testVoiceBtn').className = 'w-full font-medium py-2 px-4 rounded-lg transition-colors duration-200 bg-gray-100 hover:bg-gray-200 text-gray-700';
            } else {
                const testText = "This is a test of your voice settings. How does this sound?";
                speak(testText, function() {
                    isTestVoicePlaying = true;
                    document.getElementById('testVoiceBtn').textContent = 'Stop Voice';
                    document.getElementById('testVoiceBtn').className = 'w-full font-medium py-2 px-4 rounded-lg transition-colors duration-200 bg-red-500 hover:bg-red-600 text-white';
                }, function() {
                    isTestVoicePlaying = false;
                    document.getElementById('testVoiceBtn').textContent = 'Test Voice';
                    document.getElementById('testVoiceBtn').className = 'w-full font-medium py-2 px-4 rounded-lg transition-colors duration-200 bg-gray-100 hover:bg-gray-200 text-gray-700';
                });
            }
        }
        
        function speak(text, onStart, onEnd) {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.rate = speechRate;
            if (selectedVoice) {
                utterance.voice = selectedVoice;
            }
            
            if (onStart) utterance.onstart = onStart;
            if (onEnd) {
                utterance.onend = onEnd;
                utterance.onerror = onEnd;
            }
            
            speechSynthesis.speak(utterance);
        }
        
        function updateReadButton(speaking) {
            const btn = document.getElementById('readAloudBtn');
            const text = document.getElementById('readAloudText');
            
            if (speaking) {
                btn.className = 'absolute top-4 right-4 px-3 py-2 rounded-lg transition-colors duration-200 flex items-center gap-2 text-sm font-medium bg-fc-error/10 hover:bg-fc-error/20 text-fc-error';
                btn.innerHTML = \`
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="6" y="4" width="4" height="16" rx="1"/>
                        <rect x="14" y="4" width="4" height="16" rx="1"/>
                    </svg>
                    <span>Stop</span>
                \`;
            } else {
                btn.className = 'absolute top-4 right-4 px-3 py-2 rounded-lg transition-colors duration-200 flex items-center gap-2 text-sm font-medium bg-fc-purple/10 hover:bg-fc-purple/20 text-fc-purple';
                btn.innerHTML = \`
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
                        <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
                        <path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
                    </svg>
                    <span>Read Aloud</span>
                \`;
            }
        }
        
        console.log('Cast Aloud loaded successfully');
    </script>
</body>
</html>`);
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

// Simple health check endpoint
app.get('/health', (req, res) => {
  res.setHeader('Content-Type', 'text/html');
  res.send(`
    <h1 style="color: #8A63D2;">Cast Aloud Server - Running</h1>
    <p>Server is working correctly at ${new Date().toISOString()}</p>
    <p><a href="/">Go to Cast Aloud App</a></p>
  `);
});

// Working Cast Aloud app served directly from Express
app.get('/app', (req, res) => {
  res.setHeader('Content-Type', 'text/html');
  res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Cast Aloud - Voice Accessibility for Farcaster</title>
    <style>
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
            margin: 0; 
            padding: 0; 
            background: #fafafa;
        }
        .container { max-width: 500px; margin: 0 auto; padding: 20px; }
        .header { text-align: center; margin-bottom: 30px; }
        .app-title { color: #8A63D2; font-size: 28px; font-weight: bold; margin: 0; }
        .app-subtitle { color: #666; margin: 10px 0 0 0; }
        .card { 
            background: white; 
            border-radius: 12px; 
            padding: 24px; 
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            margin-bottom: 20px;
        }
        .btn { 
            background: #8A63D2; 
            color: white; 
            border: none; 
            padding: 12px 24px; 
            border-radius: 8px; 
            cursor: pointer; 
            font-size: 16px;
            width: 100%;
            margin: 8px 0;
        }
        .btn:hover { background: #7652C4; }
        .btn-secondary { 
            background: #f0f0f0; 
            color: #333; 
        }
        .btn-secondary:hover { background: #e0e0e0; }
        .voice-settings { 
            background: #f8f9fa; 
            border-radius: 8px; 
            padding: 16px; 
            margin-top: 16px;
            display: none;
        }
        .form-group { margin: 12px 0; }
        .form-group label { display: block; margin-bottom: 4px; font-weight: 500; }
        .form-group select, .form-group input { 
            width: 100%; 
            padding: 8px; 
            border: 1px solid #ddd; 
            border-radius: 4px; 
        }
        .how-it-works { 
            background: #f0f7ff; 
            border-radius: 8px; 
            padding: 16px; 
            margin-top: 16px;
        }
        .status { 
            position: fixed; 
            top: 10px; 
            right: 10px; 
            background: #28a745; 
            color: white; 
            padding: 8px 12px; 
            border-radius: 4px; 
            font-size: 12px;
        }
    </style>
</head>
<body>
    <div class="status">✓ Working Version</div>
    
    <div class="container">
        <div class="header">
            <h1 class="app-title">Cast Aloud</h1>
            <p class="app-subtitle">Voice accessibility tools for reading and replying to Farcaster casts</p>
        </div>
        
        <div class="card">
            <h2 style="margin-top: 0;">Try the Mini App</h2>
            <p style="color: #666;">The mini app helps you read casts aloud and create voice replies with AI assistance.</p>
            
            <button class="btn" onclick="readSampleCast()">
                🔊 Read Sample Cast Aloud
            </button>
            
            <button class="btn btn-secondary" onclick="toggleVoiceSettings()">
                ⚙️ Voice Settings
            </button>
            
            <div id="voiceSettings" class="voice-settings">
                <h3 style="margin-top: 0;">Voice Settings</h3>
                
                <div class="form-group">
                    <label>Voice:</label>
                    <select id="voiceSelect">
                        <option value="">Loading voices...</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label>Speed: <span id="speedValue">1.0x</span></label>
                    <input type="range" id="speedSlider" min="0.5" max="2" step="0.1" value="1.0">
                </div>
                
                <button class="btn btn-secondary" onclick="testVoice()">
                    Test Voice
                </button>
            </div>
            
            <div class="how-it-works">
                <h3 style="margin-top: 0;">How it works:</h3>
                <ol style="margin: 0; padding-left: 20px;">
                    <li>📝 Paste a Farcaster post URL or text directly</li>
                    <li>🔊 Click "Read Aloud" to hear the content</li>
                    <li>✍️ Type your reply in the text area</li>
                    <li>🤖 Get AI feedback or polish your reply</li>
                    <li>📋 Copy the improved reply to post on Farcaster</li>
                </ol>
            </div>
        </div>
    </div>

    <script>
        let voices = [];
        let selectedVoice = null;
        let speechRate = 1.0;
        let isSpeaking = false;
        
        // Load voices
        function loadVoices() {
            voices = speechSynthesis.getVoices();
            const voiceSelect = document.getElementById('voiceSelect');
            voiceSelect.innerHTML = '<option value="">Select a voice...</option>';
            
            voices.forEach((voice, index) => {
                const option = document.createElement('option');
                option.value = index;
                option.textContent = \`\${voice.name} (\${voice.lang})\`;
                voiceSelect.appendChild(option);
            });
            
            if (voices.length > 0) {
                selectedVoice = voices[0];
                voiceSelect.value = 0;
            }
        }
        
        // Initialize voices
        speechSynthesis.addEventListener('voiceschanged', loadVoices);
        loadVoices();
        
        // Voice settings
        document.getElementById('voiceSelect').addEventListener('change', (e) => {
            if (e.target.value !== '') {
                selectedVoice = voices[parseInt(e.target.value)];
            }
        });
        
        document.getElementById('speedSlider').addEventListener('input', (e) => {
            speechRate = parseFloat(e.target.value);
            document.getElementById('speedValue').textContent = speechRate.toFixed(1) + 'x';
        });
        
        function toggleVoiceSettings() {
            const settings = document.getElementById('voiceSettings');
            settings.style.display = settings.style.display === 'block' ? 'none' : 'block';
        }
        
        function readSampleCast() {
            const sampleText = \`
                Hello from Cast Aloud! This is a sample Farcaster cast being read aloud using voice technology. 
                Cast Aloud helps make social media more accessible by providing voice features for reading and replying to posts.
                You can adjust the voice settings to customize your listening experience.
            \`;
            
            if (isSpeaking) {
                speechSynthesis.cancel();
                isSpeaking = false;
                return;
            }
            
            const utterance = new SpeechSynthesisUtterance(sampleText);
            utterance.rate = speechRate;
            if (selectedVoice) {
                utterance.voice = selectedVoice;
            }
            
            utterance.onstart = () => {
                isSpeaking = true;
                document.querySelector('.btn').textContent = '⏹️ Stop Reading';
            };
            
            utterance.onend = () => {
                isSpeaking = false;
                document.querySelector('.btn').textContent = '🔊 Read Sample Cast Aloud';
            };
            
            speechSynthesis.speak(utterance);
        }
        
        function testVoice() {
            const testText = "This is a test of your voice settings. How does this sound?";
            const utterance = new SpeechSynthesisUtterance(testText);
            utterance.rate = speechRate;
            if (selectedVoice) {
                utterance.voice = selectedVoice;
            }
            speechSynthesis.speak(utterance);
        }
        
        console.log('Cast Aloud app loaded successfully');
    </script>
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



  // Temporarily redirect root to working version, but we'll fix the original React app
  // app.get('/', (req, res) => {
  //   res.redirect('/app');
  // });

  // Disable Vite completely to ensure Express routes work
  // if (process.env.NODE_ENV === "development") {
  //   await setupVite(app, server);
  // } else {
  //   // In production, serve the built static files
  //   try {
  //     serveStatic(app);
  //   } catch (error) {
  //     console.log("Static files not found, falling back to vite dev server");
  //     await setupVite(app, server);
  //   }
  // }
  
  // Simple test route first
  app.get('/test', (req, res) => {
    res.setHeader('Content-Type', 'text/html');
    res.send(`<h1 style="color: red;">TEST WORKS</h1><p>If you can see this, the server is working.</p>`);
  });

  // Override the root route AFTER Vite setup to ensure it takes precedence
  app.get('/', (req, res) => {
    res.setHeader('Content-Type', 'text/html');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    
    res.send(`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Cast Aloud - Voice Accessibility for Farcaster</title>
    <style>
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
            margin: 0; 
            padding: 0; 
            background: #fafafa;
        }
        .container { max-width: 500px; margin: 0 auto; padding: 20px; min-height: 100vh; }
        .header { text-align: center; margin-bottom: 30px; }
        .app-title { color: #8A63D2; font-size: 32px; font-weight: bold; margin: 0; }
        .app-subtitle { color: #6b6b6b; margin: 10px 0 0 0; }
        .card { 
            background: white; 
            border-radius: 12px; 
            padding: 24px; 
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            position: relative;
            border: 1px solid #e8e8e8;
        }
        .btn { 
            background: #8A63D2; 
            color: white; 
            border: none; 
            padding: 12px 24px; 
            border-radius: 8px; 
            cursor: pointer; 
            font-size: 16px;
            width: 100%;
            margin: 8px 0;
            transition: all 0.2s;
        }
        .btn:hover { background: #7652C4; transform: translateY(-1px); }
        .btn-secondary { 
            background: #e8e8e8; 
            color: #383838; 
        }
        .btn-secondary:hover { background: #d1d1d1; }
        .read-aloud-btn { 
            position: absolute; 
            top: 16px; 
            right: 16px; 
            width: auto; 
            padding: 8px 16px; 
            font-size: 14px; 
            display: flex; 
            align-items: center; 
            gap: 8px;
            background: rgba(138, 99, 210, 0.1);
            color: #8A63D2;
        }
        .voice-settings { 
            background: #f8f9fa; 
            border-radius: 8px; 
            padding: 16px; 
            margin-top: 16px;
            display: none;
        }
        .form-group { margin: 12px 0; }
        .form-group label { display: block; margin-bottom: 4px; font-weight: 500; }
        .form-group select, .form-group input { 
            width: 100%; 
            padding: 8px; 
            border: 1px solid #ddd; 
            border-radius: 4px; 
        }
        .how-it-works { 
            background: #f0f7ff; 
            border-radius: 8px; 
            padding: 16px; 
            margin-top: 16px;
        }
        .hidden { display: none; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1 class="app-title">Cast Aloud</h1>
            <p class="app-subtitle">Accessibility tools for reading and replying to casts</p>
        </div>
        
        <div class="card">
            <button id="readAloudBtn" class="btn read-aloud-btn" onclick="toggleReading()">
                <span id="readIcon">🔊</span>
                <span id="readText">Read Aloud</span>
            </button>
            
            <h2 style="margin-top: 0; font-size: 20px;">Try the Mini App</h2>
            <p style="margin-bottom: 20px;">
                The mini app helps you read casts aloud and create voice replies with AI assistance.
            </p>
            
            <button class="btn" onclick="readSampleCast()">
                Read Cast Aloud
            </button>
            
            <button class="btn btn-secondary" onclick="toggleVoiceSettings()">
                Voice Settings
            </button>

            <div id="voiceSettings" class="voice-settings">
                <h3 style="margin-top: 0;">Voice Settings</h3>
                
                <div class="form-group">
                    <label>Voice:</label>
                    <select id="voiceSelect">
                        <option value="">Loading voices...</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label>Speed: <span id="speedValue">1.0x</span></label>
                    <input type="range" id="speedSlider" min="0.5" max="2" step="0.1" value="1.0">
                </div>
                
                <button class="btn btn-secondary" onclick="testVoice()">
                    Test Voice
                </button>
            </div>
            
            <div class="how-it-works">
                <h3 style="margin-top: 0;">How it works:</h3>
                <ol style="margin: 0; padding-left: 20px;">
                    <li>📝 Paste a Farcaster post URL or text directly</li>
                    <li>🔊 Click "Read Aloud" to hear the content</li>
                    <li>✍️ Type your reply in the text area</li>
                    <li>🤖 Get AI feedback or polish your reply</li>
                    <li>📋 Copy the improved reply to post on Farcaster</li>
                </ol>
            </div>
        </div>
    </div>

    <script>
        let voices = [];
        let selectedVoice = null;
        let speechRate = 1.0;
        let isSpeaking = false;
        let showingSettings = false;
        
        function loadVoices() {
            voices = speechSynthesis.getVoices();
            const voiceSelect = document.getElementById('voiceSelect');
            voiceSelect.innerHTML = '<option value="">Select a voice...</option>';
            
            voices.forEach((voice, index) => {
                const option = document.createElement('option');
                option.value = index;
                option.textContent = voice.name + ' (' + voice.lang + ')';
                voiceSelect.appendChild(option);
            });
            
            if (voices.length > 0) {
                selectedVoice = voices[0];
                voiceSelect.value = 0;
            }
        }
        
        speechSynthesis.addEventListener('voiceschanged', loadVoices);
        loadVoices();
        
        document.getElementById('voiceSelect').addEventListener('change', function(e) {
            if (e.target.value !== '') {
                selectedVoice = voices[parseInt(e.target.value)];
            }
        });
        
        document.getElementById('speedSlider').addEventListener('input', function(e) {
            speechRate = parseFloat(e.target.value);
            document.getElementById('speedValue').textContent = speechRate.toFixed(1) + 'x';
        });
        
        function toggleVoiceSettings() {
            const settings = document.getElementById('voiceSettings');
            showingSettings = !showingSettings;
            settings.style.display = showingSettings ? 'block' : 'none';
        }
        
        function toggleReading() {
            const pageText = 'Cast Aloud. Accessibility tools for reading and replying to casts. Try the Mini App. The mini app helps you read casts aloud and create voice replies with AI assistance. How it works: 1. Paste a Farcaster post URL or text directly. 2. Click Read Aloud to hear the content. 3. Type your reply in the text area. 4. Get AI feedback or polish your reply. 5. Copy the improved reply to post on Farcaster.';
            
            if (isSpeaking) {
                speechSynthesis.cancel();
                updateReadButton(false);
            } else {
                speak(pageText);
            }
        }
        
        function readSampleCast() {
            const sampleText = 'Hello from Cast Aloud! This is a sample Farcaster cast being read aloud using voice technology. Cast Aloud helps make social media more accessible by providing voice features for reading and replying to posts. You can adjust the voice settings to customize your listening experience.';
            speak(sampleText);
        }
        
        function testVoice() {
            const testText = "This is a test of your voice settings. How does this sound?";
            speak(testText);
        }
        
        function speak(text) {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.rate = speechRate;
            if (selectedVoice) {
                utterance.voice = selectedVoice;
            }
            
            utterance.onstart = function() {
                isSpeaking = true;
                updateReadButton(true);
            };
            
            utterance.onend = function() {
                isSpeaking = false;
                updateReadButton(false);
            };
            
            utterance.onerror = function() {
                isSpeaking = false;
                updateReadButton(false);
            };
            
            speechSynthesis.speak(utterance);
        }
        
        function updateReadButton(speaking) {
            const btn = document.getElementById('readAloudBtn');
            const icon = document.getElementById('readIcon');
            const text = document.getElementById('readText');
            
            if (speaking) {
                btn.style.background = 'rgba(239, 68, 68, 0.1)';
                btn.style.color = '#ef4444';
                icon.textContent = '⏹️';
                text.textContent = 'Stop';
            } else {
                btn.style.background = 'rgba(138, 99, 210, 0.1)';
                btn.style.color = '#8A63D2';
                icon.textContent = '🔊';
                text.textContent = 'Read Aloud';
            }
        }
        
        console.log('Cast Aloud loaded successfully');
    </script>
</body>
</html>`);
  });

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
