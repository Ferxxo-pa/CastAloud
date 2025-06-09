import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  walletAddress: text("wallet_address"),
  subscriptionTier: text("subscription_tier").default("free"), // 'free' | 'premium'
  subscriptionExpiresAt: timestamp("subscription_expires_at"),
  lastPaymentAmount: text("last_payment_amount"), // Store crypto amount as string
  lastPaymentTxHash: text("last_payment_tx_hash"), // Transaction hash for verification
  createdAt: timestamp("created_at").defaultNow(),
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

export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  userId: integer("user_id"),
  walletAddress: text("wallet_address").notNull(),
  amount: text("amount").notNull(), // Crypto amount as string
  currency: text("currency").notNull(), // ETH, USDC, etc.
  txHash: text("tx_hash").notNull().unique(),
  blockNumber: integer("block_number"),
  verified: boolean("verified").default(false),
  subscriptionMonths: integer("subscription_months").default(12), // Default 1 year
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

export const insertPaymentSchema = createInsertSchema(payments).omit({
  id: true,
  verified: true,
  createdAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Cast = typeof casts.$inferSelect;
export type VoiceComment = typeof voiceComments.$inferSelect;
export type Payment = typeof payments.$inferSelect;
export type InsertCast = z.infer<typeof insertCastSchema>;
export type InsertVoiceComment = z.infer<typeof insertVoiceCommentSchema>;
export type InsertPayment = z.infer<typeof insertPaymentSchema>;
