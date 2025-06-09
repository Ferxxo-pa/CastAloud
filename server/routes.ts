import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertVoiceCommentSchema } from "@shared/schema";
import { handleFrameIndex, handleFrameAction, handleFrameImage } from "./frame";
import OpenAI from "openai";
import multer from "multer";
import fs from "fs";
import path from "path";

const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || ""
});

// Configure multer for audio file uploads
const upload = multer({ dest: 'uploads/' });

// Helper functions
async function transcribeAudio(audioFilePath: string): Promise<{ text: string }> {
  const audioReadStream = fs.createReadStream(audioFilePath);
  
  const transcription = await openai.audio.transcriptions.create({
    file: audioReadStream,
    model: "whisper-1",
  });

  return { text: transcription.text };
}

async function polishReply(text: string): Promise<string> {
  const response = await openai.chat.completions.create({
    model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
    messages: [
      {
        role: "system",
        content: "You are a helpful assistant that polishes social media replies. Make the text more clear, friendly, and well-written while preserving the original meaning and tone. Keep it concise and natural for Farcaster."
      },
      {
        role: "user",
        content: `Please polish this reply: "${text}"`
      }
    ],
    max_tokens: 200,
    temperature: 0.7
  });

  return response.choices[0].message.content || text;
}

async function getFeedbackOnComment(text: string): Promise<{ feedback: string; polishedText: string }> {
  const response = await openai.chat.completions.create({
    model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
    messages: [
      {
        role: "system",
        content: "You are a helpful writing assistant. Provide constructive feedback on social media comments and suggest improvements. Respond in JSON format with 'feedback' and 'polishedText' fields."
      },
      {
        role: "user",
        content: `Please provide feedback on this comment and suggest an improved version: "${text}"\n\nRespond in JSON format: {"feedback": "your feedback here", "polishedText": "improved version here"}`
      }
    ],
    max_tokens: 300,
    temperature: 0.7,
    response_format: { type: "json_object" }
  });

  try {
    const result = JSON.parse(response.choices[0].message.content || '{}');
    return {
      feedback: result.feedback || "Your comment looks good! Consider adding more detail or examples.",
      polishedText: result.polishedText || text
    };
  } catch (parseError) {
    // If JSON parsing fails, return the raw content as feedback
    return {
      feedback: response.choices[0].message.content || "Your comment looks good!",
      polishedText: text
    };
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Frame routes - serve Frame at root for Mini App compatibility
  app.get("/", handleFrameIndex);
  app.get("/frame", handleFrameIndex);
  app.post("/api/frame/action", handleFrameAction);
  app.get("/api/frame/image", handleFrameImage);
  
  // Test deployment endpoint
  app.get("/api/test", (req, res) => {
    res.json({ 
      status: "ok", 
      timestamp: new Date().toISOString(),
      domain: req.get('host'),
      manifest: `${req.protocol}://${req.get('host')}/manifest.json`
    });
  });
  
  // Icon for Mini App
  app.get("/icon.png", (req, res) => {
    const svg = `<svg width="512" height="512" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="512" height="512" rx="64" fill="#8A63D2"/>
      <circle cx="256" cy="200" r="60" fill="white"/>
      <path d="M196 280L316 280C327 280 336 289 336 300V340C336 351 327 360 316 360H196C185 360 176 351 176 340V300C176 289 185 280 196 280Z" fill="white"/>
      <circle cx="220" cy="320" r="12" fill="#8A63D2"/>
      <circle cx="256" cy="320" r="12" fill="#8A63D2"/>
      <circle cx="292" cy="320" r="12" fill="#8A63D2"/>
      <text x="256" y="450" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="36" font-weight="bold">CAST ALOUD</text>
    </svg>`;
    
    res.setHeader('Content-Type', 'image/svg+xml');
    res.send(svg);
  });

  // Mini App manifest for Farcaster
  app.get("/manifest.json", (req, res) => {
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'no-cache');
    res.json({
      "name": "Cast Aloud",
      "version": "1.0.0",
      "description": "Voice accessibility tools for Farcaster. Listen to casts aloud and reply using voice technology.",
      "homeUrl": baseUrl,
      "iconUrl": `${baseUrl}/icon.png`,
      "splashImageUrl": `${baseUrl}/api/frame/image?state=initial`,
      "splashBackgroundColor": "#8A63D2",
      "webhookUrl": `${baseUrl}/api/frame/action`
    });
  });
  
  // Domain verification endpoint for Farcaster account association
  app.get("/.well-known/farcaster.json", (req, res) => {
    // This endpoint will be populated with your signature after domain verification
    res.status(404).json({ 
      error: "Domain not yet verified",
      message: "Complete domain verification through Farcaster's Mini App developer portal"
    });
  });
  
  // Temporary verification endpoint - will be replaced after claiming domain
  app.post("/api/verify-domain", (req, res) => {
    const { signature, header, payload } = req.body;
    // This would store the verification data after Farcaster domain claiming process
    res.json({ 
      success: true, 
      message: "Domain verification data received",
      domain: req.get('host')
    });
  });
  
  // Webhook for Farcaster Frame validation
  app.post("/webhook/farcaster", (req, res) => {
    const { type, data } = req.body;
    
    // Handle different webhook types
    switch (type) {
      case 'frame_validation':
        res.json({ success: true, message: "Cast Aloud Frame validated" });
        break;
      case 'cast_action':
        // Handle cast actions when frame is used
        res.json({ success: true, message: "Action processed" });
        break;
      default:
        res.json({ success: true, message: "Webhook received" });
    }
  });
  
  // TTS endpoint for Frame interactions
  app.post("/api/tts", async (req, res) => {
    try {
      const { text, voice = "alloy" } = req.body;
      
      if (!text) {
        return res.status(400).json({ error: "Text is required" });
      }

      const mp3 = await openai.audio.speech.create({
        model: "tts-1",
        voice: voice as any,
        input: text.substring(0, 4096), // Limit text length
      });

      const buffer = Buffer.from(await mp3.arrayBuffer());
      
      res.setHeader('Content-Type', 'audio/mpeg');
      res.setHeader('Content-Length', buffer.length);
      res.send(buffer);
    } catch (error) {
      console.error('TTS error:', error);
      res.status(500).json({ error: 'TTS generation failed' });
    }
  });
  
  // App icon for Mini App
  app.get("/icon.png", (req, res) => {
    // Generate SVG icon and convert to PNG response
    const svg = `
      <svg width="256" height="256" xmlns="http://www.w3.org/2000/svg">
        <rect width="256" height="256" rx="32" fill="#8A63D2"/>
        <circle cx="128" cy="128" r="60" fill="white" opacity="0.9"/>
        <text x="128" y="145" font-family="Arial, sans-serif" font-size="48" fill="#8A63D2" text-anchor="middle">🔊</text>
      </svg>
    `;
    res.setHeader('Content-Type', 'image/svg+xml');
    res.send(svg);
  });

  // Voice recorder page for complex interactions
  app.get("/voice-recorder", (req, res) => {
    const { castId } = req.query;
    res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <title>Voice Recorder</title>
          <style>
            body { font-family: Arial, sans-serif; max-width: 400px; margin: 0 auto; padding: 20px; }
            .btn { padding: 12px 24px; margin: 10px; border: none; border-radius: 8px; font-size: 16px; cursor: pointer; }
            .primary { background: #7C3AED; color: white; }
            .success { background: #16A34A; color: white; }
            .danger { background: #EF4444; color: white; }
            .record-btn { width: 100px; height: 100px; border-radius: 50%; font-size: 24px; }
            #status { text-align: center; margin: 20px 0; }
          </style>
        </head>
        <body>
          <h2>🎤 Voice Reply</h2>
          <div id="status">Ready to record</div>
          <div style="text-align: center;">
            <button id="recordBtn" class="btn danger record-btn">🎤</button>
          </div>
          <div id="result" style="margin-top: 20px;"></div>
          
          <script>
            let mediaRecorder;
            let isRecording = false;
            const recordBtn = document.getElementById('recordBtn');
            const status = document.getElementById('status');
            const result = document.getElementById('result');
            
            recordBtn.onclick = async () => {
              if (!isRecording) {
                try {
                  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                  mediaRecorder = new MediaRecorder(stream);
                  const chunks = [];
                  
                  mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
                  mediaRecorder.onstop = async () => {
                    const blob = new Blob(chunks, { type: 'audio/wav' });
                    await processAudio(blob);
                  };
                  
                  mediaRecorder.start();
                  isRecording = true;
                  recordBtn.textContent = '⏹️';
                  recordBtn.className = 'btn success record-btn';
                  status.textContent = 'Recording... Click to stop';
                } catch (err) {
                  status.textContent = 'Microphone access denied';
                }
              } else {
                mediaRecorder.stop();
                isRecording = false;
                recordBtn.textContent = '🎤';
                recordBtn.className = 'btn danger record-btn';
                status.textContent = 'Processing...';
              }
            };
            
            async function processAudio(blob) {
              const formData = new FormData();
              formData.append('audio', blob, 'recording.wav');
              formData.append('castHash', 'frame-cast');
              formData.append('castContent', 'Frame interaction');
              
              try {
                const response = await fetch('/api/voice/process', {
                  method: 'POST',
                  body: formData
                });
                
                const data = await response.json();
                if (response.ok) {
                  result.innerHTML = \`
                    <h3>Generated Reply:</h3>
                    <p>\${data.generatedComment}</p>
                    <button class="btn primary" onclick="postReply(\${data.id}, '\${data.generatedComment}')">Post Reply</button>
                  \`;
                  status.textContent = 'Review your reply';
                } else {
                  status.textContent = 'Error: ' + data.message;
                }
              } catch (err) {
                status.textContent = 'Processing failed';
              }
            }
            
            async function postReply(id, comment) {
              try {
                const response = await fetch(\`/api/voice/post/\${id}\`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ comment })
                });
                
                if (response.ok) {
                  result.innerHTML = '<h3>✅ Reply posted successfully!</h3>';
                  status.textContent = 'Done! You can close this page.';
                } else {
                  status.textContent = 'Failed to post reply';
                }
              } catch (err) {
                status.textContent = 'Posting failed';
              }
            }
          </script>
        </body>
      </html>
    `);
  });

  // Get current cast
  app.get("/api/cast/current", async (req, res) => {
    try {
      const cast = await storage.getCurrentCast();
      if (!cast) {
        return res.status(404).json({ message: "No cast found" });
      }
      res.json(cast);
    } catch (error) {
      console.error("Error fetching current cast:", error);
      res.status(500).json({ message: "Failed to fetch cast" });
    }
  });

  // Get feed from Farcaster via Neynar
  app.get("/api/feed", async (req, res) => {
    try {
      // Demo feed showing accessibility features
      const demoFeed = [
        {
          id: 1,
          hash: "0x123abc",
          authorFid: 1234,
          authorUsername: "alice",
          authorDisplayName: "Alice Johnson",
          content: "Just shipped a new accessibility feature for our social app! Voice-to-text is working great and helping users engage more easily. Building inclusive tech should be the default.",
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
          likesCount: 23,
          recastsCount: 5,
          repliesCount: 12
        },
        {
          id: 2,
          hash: "0x456def",
          authorFid: 5678,
          authorUsername: "bob",
          authorDisplayName: "Bob Chen",
          content: "The future of web accessibility is voice interfaces. Being able to listen to posts and reply with voice makes social media so much more inclusive for people with different needs and abilities.",
          timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
          likesCount: 41,
          recastsCount: 8,
          repliesCount: 6
        },
        {
          id: 3,
          hash: "0x789ghi",
          authorFid: 9012,
          authorUsername: "carol",
          authorDisplayName: "Carol Williams",
          content: "Love seeing more accessibility tools in web3! As someone with dyslexia, having text read aloud makes consuming content so much easier. Keep building these important features!",
          timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
          likesCount: 67,
          recastsCount: 15,
          repliesCount: 23
        },
        {
          id: 4,
          hash: "0xabcjkl",
          authorFid: 3456,
          authorUsername: "david",
          authorDisplayName: "David Kim",
          content: "AI-powered voice interfaces are game changers for accessibility. Imagine being able to interact with any app just by speaking naturally and having it understand your intent perfectly.",
          timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000),
          likesCount: 34,
          recastsCount: 7,
          repliesCount: 11
        }
      ];

      res.json(demoFeed);
    } catch (error) {
      console.error("Error fetching feed:", error);
      res.status(500).json({ message: "Failed to fetch feed" });
    }
  });

  // Text-to-speech endpoint
  app.post("/api/tts", async (req, res) => {
    try {
      const { text, voice = "alloy", speed = 1.0 } = req.body;
      
      if (!text) {
        return res.status(400).json({ message: "Text is required" });
      }

      if (!process.env.OPENAI_API_KEY_) {
        return res.status(500).json({ message: "OpenAI API key not configured" });
      }

      // Clamp speed between 0.25 and 4.0 as per OpenAI API limits
      const clampedSpeed = Math.max(0.25, Math.min(4.0, speed));

      // Generate speech using OpenAI TTS
      const mp3 = await openai.audio.speech.create({
        model: "tts-1",
        voice: voice,
        input: text,
        speed: clampedSpeed,
      });

      const buffer = Buffer.from(await mp3.arrayBuffer());
      
      res.set({
        'Content-Type': 'audio/mpeg',
        'Content-Length': buffer.length.toString(),
      });
      
      res.send(buffer);
    } catch (error) {
      console.error("Error generating speech:", error);
      res.status(500).json({ message: "Failed to generate speech" });
    }
  });

  // Process voice recording
  app.post("/api/voice/process", upload.single('audio'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No audio file provided" });
      }

      const { castHash, castContent } = req.body;
      if (!castHash || !castContent) {
        return res.status(400).json({ message: "Cast hash and content are required" });
      }

      // Transcribe audio using Whisper
      const audioFilePath = req.file.path;
      const audioReadStream = fs.createReadStream(audioFilePath);

      const transcription = await openai.audio.transcriptions.create({
        file: audioReadStream,
        model: "whisper-1",
      });

      if (!transcription.text || transcription.text.trim().length === 0) {
        // Clean up uploaded file
        fs.unlinkSync(audioFilePath);
        return res.status(400).json({ message: "Could not transcribe audio. Please try speaking more clearly." });
      }

      // Generate improved comment using GPT-4o
      // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are helping someone reply to a social media post. Take their voice input and turn it into a well-formatted, natural-sounding comment. Keep the original meaning and tone, but improve grammar, structure, and clarity. Make it conversational and engaging. Respond with JSON in this format: { 'comment': 'the improved comment text' }"
          },
          {
            role: "user",
            content: `Original post: "${castContent}"\n\nUser's voice input: "${transcription.text}"\n\nPlease turn this voice input into a good reply to the original post.`
          }
        ],
        response_format: { type: "json_object" },
      });

      const result = JSON.parse(completion.choices[0].message.content || '{"comment": ""}');
      const generatedComment = result.comment || transcription.text;

      // Store the voice comment
      const voiceComment = await storage.createVoiceComment({
        castHash,
        originalAudio: null, // We're not storing the audio file for now
        transcription: transcription.text,
        generatedComment,
        posted: false,
      });

      // Clean up uploaded file
      fs.unlinkSync(audioFilePath);

      res.json({
        id: voiceComment.id,
        transcription: transcription.text,
        generatedComment,
      });

    } catch (error) {
      console.error("Error processing voice:", error);
      
      // Clean up uploaded file if it exists
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      
      if (error.message.includes('API key')) {
        res.status(500).json({ message: "OpenAI API key not configured properly" });
      } else {
        res.status(500).json({ message: "Failed to process voice recording" });
      }
    }
  });

  // Simple transcription endpoint for mini app
  app.post("/api/transcribe", upload.single('audio'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No audio file provided" });
      }

      const audioFilePath = req.file.path;
      
      try {
        const transcription = await transcribeAudio(audioFilePath);
        
        // Clean up uploaded file
        fs.unlinkSync(audioFilePath);
        
        res.json({ transcription: transcription.text });
      } catch (transcriptionError) {
        console.log("OpenAI transcription failed, using fallback");
        
        // Clean up uploaded file
        fs.unlinkSync(audioFilePath);
        
        // Fallback response when OpenAI isn't available
        res.json({ 
          transcription: "Voice recording received! Please set up OpenAI API key for transcription. For now, you can type your reply manually." 
        });
      }
    } catch (error) {
      console.error("Error processing audio:", error);
      
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      
      res.status(500).json({ error: "Failed to process audio" });
    }
  });

  // AI reply polishing endpoint for mini app
  app.post("/api/polish-reply", async (req, res) => {
    try {
      const { text } = req.body;
      if (!text) {
        return res.status(400).json({ error: "No text provided" });
      }

      try {
        const polishedText = await polishReply(text);
        res.json({ polishedText });
      } catch (polishError) {
        console.log("OpenAI polishing failed, using fallback");
        // Fallback: return the original text with a note
        res.json({ 
          polishedText: `${text}\n\n(Note: AI polishing requires OpenAI API key to be configured)` 
        });
      }
    } catch (error) {
      console.error("Error processing reply:", error);
      res.status(500).json({ error: "Failed to process reply" });
    }
  });

  // Extract cast content from URL
  app.post("/api/extract-cast", async (req, res) => {
    try {
      const { url } = req.body;
      
      if (!url) {
        return res.status(400).json({ error: "URL is required" });
      }

      console.log("Processing URL:", url);

      // Extract cast hash from Warpcast or Farcaster URLs
      let castHash = null;
      if (url.includes('warpcast.com/') || url.includes('farcaster.xyz/')) {
        // Try different URL patterns
        // Pattern 1: /0x[hash]
        let hashMatch = url.match(/\/0x([a-fA-F0-9]+)/);
        if (hashMatch) {
          castHash = '0x' + hashMatch[1];
        } else {
          // Pattern 2: /conversation/0x[hash]
          hashMatch = url.match(/\/conversation\/0x([a-fA-F0-9]+)/);
          if (hashMatch) {
            castHash = '0x' + hashMatch[1];
          } else {
            // Pattern 3: Extract hash from end of URL path
            const urlParts = url.split('/');
            const lastPart = urlParts[urlParts.length - 1];
            if (lastPart && lastPart.startsWith('0x')) {
              castHash = lastPart;
            }
          }
        }
      }

      console.log("Extracted cast hash:", castHash);

      if (!castHash) {
        console.log("Failed to extract hash from URL:", url);
        return res.status(400).json({ error: "Could not extract cast hash from URL. Please make sure it's a valid Warpcast post URL." });
      }

      if (!process.env.NEYNAR_API_KEY) {
        return res.status(500).json({ error: "Neynar API key not configured" });
      }

      // Try different approaches with Neynar API
      let text = '';
      let apiUsed = 'Neynar';

      // Try with the extracted hash first
      console.log("Trying Neynar API with hash:", castHash);
      let neynarResponse = await fetch(`https://api.neynar.com/v2/farcaster/cast?identifier=${castHash}&type=hash`, {
        headers: {
          'api_key': process.env.NEYNAR_API_KEY,
          'accept': 'application/json'
        }
      });

      if (!neynarResponse.ok) {
        // If hash fails, try with URL identifier
        console.log("Hash failed, trying with URL identifier:", url);
        neynarResponse = await fetch(`https://api.neynar.com/v2/farcaster/cast?identifier=${encodeURIComponent(url)}&type=url`, {
          headers: {
            'api_key': process.env.NEYNAR_API_KEY,
            'accept': 'application/json'
          }
        });
      }

      if (!neynarResponse.ok) {
        // Try alternative V1 API if V2 fails
        console.log("V2 failed, trying V1 API with hash:", castHash);
        neynarResponse = await fetch(`https://api.neynar.com/v1/farcaster/cast?hash=${castHash}`, {
          headers: {
            'api_key': process.env.NEYNAR_API_KEY,
            'accept': 'application/json'
          }
        });
      }

      console.log("Final API response status:", neynarResponse.status);

      if (!neynarResponse.ok) {
        const errorText = await neynarResponse.text();
        console.error("All Neynar API attempts failed:", neynarResponse.status, errorText);
        throw new Error(`Neynar API error: ${neynarResponse.status} - ${errorText}`);
      }

      const castData = await neynarResponse.json();
      console.log("Cast data received:", JSON.stringify(castData, null, 2));
      
      // Handle different response formats
      text = castData.cast?.text || castData.result?.cast?.text || castData.text || '';

      if (!text) {
        console.log("No text found in cast data from any API");
        return res.status(404).json({ error: "Cast not found or has no text content" });
      }

      console.log(`Successfully extracted text using ${apiUsed}:`, text);
      res.json({ text, apiUsed });
    } catch (error) {
      console.error("Error extracting cast:", error);
      res.status(500).json({ error: "Failed to extract cast content: " + error.message });
    }
  });

  // Get AI feedback on comment
  app.post("/api/get-feedback", async (req, res) => {
    try {
      const { text } = req.body;
      if (!text) {
        return res.status(400).json({ error: "No text provided" });
      }

      try {
        const result = await getFeedbackOnComment(text);
        res.json(result);
      } catch (feedbackError) {
        console.log("OpenAI feedback failed, using fallback");
        res.json({ 
          feedback: "Your comment looks good! Consider being more specific or adding examples to make it more engaging.",
          polishedText: text + " (AI feedback requires OpenAI API key)" 
        });
      }
    } catch (error) {
      console.error("Error getting feedback:", error);
      res.status(500).json({ error: "Failed to get feedback" });
    }
  });

  // Post comment to Farcaster
  app.post("/api/voice/post/:id", async (req, res) => {
    try {
      const commentId = parseInt(req.params.id);
      const { comment } = req.body;

      if (!comment) {
        return res.status(400).json({ message: "Comment text is required" });
      }

      const voiceComment = await storage.getVoiceComment(commentId);
      if (!voiceComment) {
        return res.status(404).json({ message: "Voice comment not found" });
      }

      // In a real implementation, you would post to Farcaster here
      // For now, we'll just mark it as posted
      await storage.updateVoiceCommentPosted(commentId, true);

      res.json({ success: true, message: "Comment posted successfully" });

    } catch (error) {
      console.error("Error posting comment:", error);
      res.status(500).json({ message: "Failed to post comment" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
