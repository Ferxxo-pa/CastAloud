import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const casts = pgTable("casts", {
  id: serial("id").primaryKey(),
  hash: text("hash").notNull().unique(),
  authorFid: integer("author_fid").notNull(),
  authorUsername: text("author_username").notNull(),
  content: text("content").notNull(),
  timestamp: timestamp("timestamp").notNull(),
  likesCount: integer("likes_count").default(0),
  recastsCount: integer("recasts_count").default(0),
  repliesCount: integer("replies_count").default(0),
});

export const voiceComments = pgTable("voice_comments", {
  id: serial("id").primaryKey(),
  castHash: text("cast_hash").notNull(),
  originalAudio: text("original_audio"), // base64 encoded audio
  transcription: text("transcription").notNull(),
  generatedComment: text("generated_comment").notNull(),
  posted: boolean("posted").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertCastSchema = createInsertSchema(casts).omit({
  id: true,
});

export const insertVoiceCommentSchema = createInsertSchema(voiceComments).omit({
  id: true,
  createdAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Cast = typeof casts.$inferSelect;
export type VoiceComment = typeof voiceComments.$inferSelect;
export type InsertCast = z.infer<typeof insertCastSchema>;
export type InsertVoiceComment = z.infer<typeof insertVoiceCommentSchema>;
