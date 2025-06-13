import { casts, voiceComments, type Cast, type VoiceComment, type InsertCast, type InsertVoiceComment } from "@shared/schema";

export interface IStorage {
  // Cast operations
  getCast(id: number): Promise<Cast | undefined>;
  getCastByHash(hash: string): Promise<Cast | undefined>;
  createCast(cast: InsertCast): Promise<Cast>;
  getCurrentCast(): Promise<Cast | undefined>;
  
  // Voice comment operations
  createVoiceComment(comment: InsertVoiceComment): Promise<VoiceComment>;
  getVoiceComment(id: number): Promise<VoiceComment | undefined>;
  updateVoiceCommentPosted(id: number, posted: boolean): Promise<VoiceComment | undefined>;
}

export class MemStorage implements IStorage {
  private casts: Map<number, Cast>;
  private voiceComments: Map<number, VoiceComment>;
  private currentCastId: number;
  private currentVoiceCommentId: number;

  constructor() {
    this.casts = new Map();
    this.voiceComments = new Map();
    this.currentCastId = 1;
    this.currentVoiceCommentId = 1;
    
    // Initialize with a sample cast for demo purposes
    this.initializeSampleCast();
  }

  private initializeSampleCast() {
    const sampleCast: Cast = {
      id: this.currentCastId++,
      hash: "0x123abc",
      authorFid: 1234,
      authorUsername: "alice",
      content: "Just discovered this amazing new coffee shop in downtown! The barista made the most incredible latte art. Perfect spot for morning meetings or quiet work sessions. Highly recommend checking it out! ☕️✨",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      likesCount: 24,
      recastsCount: 8,
      repliesCount: 12,
    };
    this.casts.set(sampleCast.id, sampleCast);
  }

  async getCast(id: number): Promise<Cast | undefined> {
    return this.casts.get(id);
  }

  async getCastByHash(hash: string): Promise<Cast | undefined> {
    return Array.from(this.casts.values()).find(cast => cast.hash === hash);
  }

  async createCast(insertCast: InsertCast): Promise<Cast> {
    const cast: Cast = {
      ...insertCast,
      id: this.currentCastId++,
    };
    this.casts.set(cast.id, cast);
    return cast;
  }

  async getCurrentCast(): Promise<Cast | undefined> {
    // Return the first cast for now (in a real app, this would be more sophisticated)
    return Array.from(this.casts.values())[0];
  }

  async createVoiceComment(insertComment: InsertVoiceComment): Promise<VoiceComment> {
    const comment: VoiceComment = {
      ...insertComment,
      id: this.currentVoiceCommentId++,
      createdAt: new Date(),
    };
    this.voiceComments.set(comment.id, comment);
    return comment;
  }

  async getVoiceComment(id: number): Promise<VoiceComment | undefined> {
    return this.voiceComments.get(id);
  }

  async updateVoiceCommentPosted(id: number, posted: boolean): Promise<VoiceComment | undefined> {
    const comment = this.voiceComments.get(id);
    if (comment) {
      comment.posted = posted;
      this.voiceComments.set(id, comment);
      return comment;
    }
    return undefined;
  }
}

export const storage = new MemStorage();
