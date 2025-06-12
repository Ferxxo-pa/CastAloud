// Farcaster SDK integration for miniapp functionality
export interface FarcasterUser {
  fid: number;
  username: string;
  displayName: string;
  pfpUrl: string;
}

export interface FarcasterContext {
  user: FarcasterUser | null;
  isFrameContext: boolean;
  cast?: {
    hash: string;
    text: string;
    author: FarcasterUser;
  };
}

class FarcasterSDK {
  private context: FarcasterContext = {
    user: null,
    isFrameContext: false
  };

  async initialize(): Promise<FarcasterContext> {
    console.log('Initializing Farcaster SDK...');
    
    // Send ready message to parent frame
    this.sendReadyMessage();
    
    // Check if running in Farcaster client
    const isFrameContext = this.detectFrameContext();
    
    if (isFrameContext) {
      console.log('Detected Farcaster frame context');
      
      // Request context from parent frame
      await this.requestFarcasterContext();
      
      // Get user context from Farcaster
      const user = await this.getUserContext();
      const cast = await this.getCastContext();
      
      this.context = {
        user,
        isFrameContext: true,
        cast
      };
    } else {
      console.log('Not in Farcaster frame context');
    }
    
    return this.context;
  }

  private sendReadyMessage() {
    // Send ready message to Farcaster parent frame
    if (window.parent && window.parent !== window) {
      window.parent.postMessage({
        type: 'miniapp_ready',
        data: {
          name: 'Castaloud',
          version: '1.0.0'
        }
      }, '*');
    }
  }

  private async requestFarcasterContext(): Promise<void> {
    return new Promise((resolve) => {
      // Listen for context from parent frame
      const handleMessage = (event: MessageEvent) => {
        if (event.data.type === 'farcaster_context') {
          console.log('Received Farcaster context:', event.data);
          window.removeEventListener('message', handleMessage);
          resolve();
        }
      };

      window.addEventListener('message', handleMessage);
      
      // Request context from parent
      if (window.parent && window.parent !== window) {
        window.parent.postMessage({
          type: 'request_context'
        }, '*');
      }
      
      // Timeout after 5 seconds
      setTimeout(() => {
        window.removeEventListener('message', handleMessage);
        resolve();
      }, 5000);
    });
  }

  private detectFrameContext(): boolean {
    // Check for Farcaster-specific headers or URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const hasFrameParams = urlParams.has('fc_frame') || 
                          urlParams.has('fid') ||
                          urlParams.has('cast_hash') ||
                          window.parent !== window;
    
    return hasFrameParams;
  }

  private async getUserContext(): Promise<FarcasterUser | null> {
    try {
      // Get user info from URL parameters or postMessage
      const urlParams = new URLSearchParams(window.location.search);
      const fid = urlParams.get('fid');
      
      if (fid) {
        // Fetch user data from our backend
        const response = await fetch(`/api/farcaster/user/${fid}`);
        if (response.ok) {
          return await response.json();
        }
      }
      
      return null;
    } catch (error) {
      console.error('Failed to get user context:', error);
      return null;
    }
  }

  private async getCastContext() {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const castHash = urlParams.get('cast_hash');
      
      if (castHash) {
        const response = await fetch(`/api/farcaster/cast/${castHash}`);
        if (response.ok) {
          return await response.json();
        }
      }
      
      return null;
    } catch (error) {
      console.error('Failed to get cast context:', error);
      return null;
    }
  }

  getContext(): FarcasterContext {
    return this.context;
  }

  async postCast(text: string, parentHash?: string): Promise<boolean> {
    try {
      const response = await fetch('/api/farcaster/post', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          parentHash,
          fid: this.context.user?.fid
        })
      });
      
      return response.ok;
    } catch (error) {
      console.error('Failed to post cast:', error);
      return false;
    }
  }

  // Send message to parent frame (Farcaster client)
  sendFrameMessage(action: string, data?: any) {
    if (this.context.isFrameContext && window.parent) {
      window.parent.postMessage({
        type: 'FARCASTER_FRAME_MESSAGE',
        action,
        data
      }, '*');
    }
  }
}

export const farcasterSDK = new FarcasterSDK();