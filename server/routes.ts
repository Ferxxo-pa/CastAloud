import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertVoiceCommentSchema } from "@shared/schema";
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
