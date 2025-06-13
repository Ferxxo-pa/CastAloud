import express from 'express';
const app = express();
const port = 5000;

app.get('/', (req, res) => {
  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Cast Aloud</title>
    <style>
        body { 
            font-family: -apple-system, BlinkMacSystemFont, sans-serif; 
            margin: 0; 
            padding: 20px; 
            background: #fafafa;
        }
        .container { max-width: 500px; margin: 0 auto; }
        h1 { color: #8A63D2; text-align: center; font-size: 32px; margin-bottom: 10px; }
        p { color: #666; text-align: center; margin-bottom: 30px; }
        .card { 
            background: white; 
            border-radius: 12px; 
            padding: 24px; 
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            position: relative;
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
        .btn-secondary { background: #e8e8e8; color: #383838; }
        .btn-secondary:hover { background: #d1d1d1; }
        .read-aloud-btn { 
            position: absolute; 
            top: 16px; 
            right: 16px; 
            width: auto; 
            padding: 8px 16px; 
            font-size: 14px;
            background: rgba(138, 99, 210, 0.1);
            color: #8A63D2;
        }
        .settings { 
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
        .instructions { 
            background: #f0f7ff; 
            border-radius: 8px; 
            padding: 16px; 
            margin-top: 16px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Cast Aloud</h1>
        <p>Accessibility tools for reading and replying to casts</p>
        
        <div class="card">
            <button id="readBtn" class="btn read-aloud-btn" onclick="toggleRead()">
                🔊 Read Aloud
            </button>
            
            <h2 style="margin-top: 0;">Try the Mini App</h2>
            <p>The mini app helps you read casts aloud and create voice replies with AI assistance.</p>
            
            <button class="btn" onclick="readSample()">Read Cast Aloud</button>
            <button class="btn btn-secondary" onclick="toggleSettings()">Voice Settings</button>

            <div id="settings" class="settings">
                <h3 style="margin-top: 0;">Voice Settings</h3>
                <div class="form-group">
                    <label>Voice:</label>
                    <select id="voiceSelect">
                        <option value="">Loading voices...</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Speed: <span id="speedDisplay">1.0x</span></label>
                    <input type="range" id="speedSlider" min="0.5" max="2" step="0.1" value="1.0">
                </div>
                <button class="btn btn-secondary" onclick="testVoice()">Test Voice</button>
            </div>
            
            <div class="instructions">
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
            const select = document.getElementById('voiceSelect');
            select.innerHTML = '<option value="">Select a voice...</option>';
            
            voices.forEach((voice, index) => {
                const option = document.createElement('option');
                option.value = index;
                option.textContent = voice.name + ' (' + voice.lang + ')';
                select.appendChild(option);
            });
            
            if (voices.length > 0) {
                selectedVoice = voices[0];
                select.value = 0;
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
            document.getElementById('speedDisplay').textContent = speechRate.toFixed(1) + 'x';
        });
        
        function toggleSettings() {
            const settings = document.getElementById('settings');
            showingSettings = !showingSettings;
            settings.style.display = showingSettings ? 'block' : 'none';
        }
        
        function toggleRead() {
            const text = 'Cast Aloud. Accessibility tools for reading and replying to casts. The mini app helps you read casts aloud and create voice replies with AI assistance.';
            
            if (isSpeaking) {
                speechSynthesis.cancel();
                updateReadButton(false);
            } else {
                speak(text);
            }
        }
        
        function readSample() {
            const text = 'Hello from Cast Aloud! This is a sample Farcaster cast being read aloud using voice technology.';
            speak(text);
        }
        
        function testVoice() {
            const text = "This is a test of your voice settings.";
            speak(text);
        }
        
        function speak(text) {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.rate = speechRate;
            if (selectedVoice) {
                utterance.voice = selectedVoice;
            }
            
            utterance.onstart = () => {
                isSpeaking = true;
                updateReadButton(true);
            };
            
            utterance.onend = () => {
                isSpeaking = false;
                updateReadButton(false);
            };
            
            speechSynthesis.speak(utterance);
        }
        
        function updateReadButton(speaking) {
            const btn = document.getElementById('readBtn');
            if (speaking) {
                btn.style.background = 'rgba(239, 68, 68, 0.1)';
                btn.style.color = '#ef4444';
                btn.textContent = '⏹️ Stop';
            } else {
                btn.style.background = 'rgba(138, 99, 210, 0.1)';
                btn.style.color = '#8A63D2';
                btn.textContent = '🔊 Read Aloud';
            }
        }
    </script>
</body>
</html>`);
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Cast Aloud app running on http://0.0.0.0:${port}`);
});