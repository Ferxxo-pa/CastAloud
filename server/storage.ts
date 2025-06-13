import { posts, voiceComments, type Post, type VoiceComment, type InsertPost, type InsertVoiceComment } from "@shared/schema";

export interface IStorage {
  // Post operations
  getPost(id: number): Promise<Post | undefined>;
  getPostByHash(hash: string): Promise<Post | undefined>;
  createPost(post: InsertPost): Promise<Post>;
  getCurrentPost(): Promise<Post | undefined>;
  
  // Voice comment operations
  createVoiceComment(comment: InsertVoiceComment): Promise<VoiceComment>;
  getVoiceComment(id: number): Promise<VoiceComment | undefined>;
  updateVoiceCommentPosted(id: number, posted: boolean): Promise<VoiceComment | undefined>;
}

export class MemStorage implements IStorage {
  private posts: Map<number, Post>;
  private voiceComments: Map<number, VoiceComment>;
  private currentPostId: number;
  private currentVoiceCommentId: number;

  constructor() {
    this.posts = new Map();
    this.voiceComments = new Map();
    this.currentPostId = 1;
    this.currentVoiceCommentId = 1;
    
    // Initialize with a sample post for demo purposes
    this.initializeSamplePost();
  }

  private initializeSamplePost() {
    const samplePost: Post = {
      id: this.currentPostId++,
      hash: "0x123abc",
      authorId: "1234",
      authorUsername: "alice",
      content: "Just discovered this amazing new coffee shop in downtown! The barista made the most incredible latte art. Perfect spot for morning meetings or quiet work sessions. Highly recommend checking it out! ☕️✨",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      likesCount: 24,
      sharesCount: 8,
      repliesCount: 12,
    };
    this.posts.set(samplePost.id, samplePost);
  }

  async getPost(id: number): Promise<Post | undefined> {
    return this.posts.get(id);
  }

  async getPostByHash(hash: string): Promise<Post | undefined> {
    return Array.from(this.posts.values()).find(post => post.hash === hash);
  }

  async createPost(insertPost: InsertPost): Promise<Post> {
    const post: Post = {
      id: this.currentPostId++,
      ...insertPost,
    };
    this.posts.set(post.id, post);
    return post;
  }

  async getCurrentPost(): Promise<Post | undefined> {
    const allPosts = Array.from(this.posts.values());
    return allPosts.length > 0 ? allPosts[allPosts.length - 1] : undefined;
  }

  async createVoiceComment(insertComment: InsertVoiceComment): Promise<VoiceComment> {
    const comment: VoiceComment = {
      id: this.currentVoiceCommentId++,
      createdAt: new Date(),
      originalAudio: insertComment.originalAudio || null,
      ...insertComment,
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