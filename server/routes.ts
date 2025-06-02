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
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key"
});

// Configure multer for audio file uploads
const upload = multer({ dest: 'uploads/' });

export async function registerRoutes(app: Express): Promise<Server> {
  // Frame routes
  app.get("/frame", handleFrameIndex);
  app.post("/api/frame/action", handleFrameAction);
  app.get("/api/frame/image", handleFrameImage);

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

      // For demo purposes, simulate voice processing
      const demoTranscription = "This is a demo transcription. In a real implementation, this would be the converted speech from your audio recording.";
      const demoComment = "Great post! I really enjoyed reading this content. Thanks for sharing your thoughts with the community.";

      // Store the voice comment
      const voiceComment = await storage.createVoiceComment({
        castHash,
        originalAudio: null,
        transcription: demoTranscription,
        generatedComment: demoComment,
        posted: false,
      });

      // Clean up uploaded file
      fs.unlinkSync(req.file.path);

      res.json({
        id: voiceComment.id,
        transcription: demoTranscription,
        generatedComment: demoComment,
        demo: true
      });

    } catch (error) {
      console.error("Error processing voice:", error);
      
      // Clean up uploaded file if it exists
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      
      res.status(500).json({ message: "Failed to process voice recording" });
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
