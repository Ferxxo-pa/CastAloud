import type { Request, Response } from "express";
import { storage } from "./storage";

interface FrameActionPayload {
  untrustedData: {
    fid: number;
    url: string;
    messageHash: string;
    timestamp: number;
    network: number;
    buttonIndex: number;
    inputText?: string;
  };
  trustedData: {
    messageBytes: string;
  };
}

// Generate frame HTML with meta tags following frames.js standards
function generateFrameHTML(
  title: string,
  image: string,
  buttons: Array<{ text: string; action?: string; target?: string }>,
  inputText?: string,
  postUrl?: string
): string {
  const buttonTags = buttons.map((button, index) => {
    let tag = `<meta property="fc:frame:button:${index + 1}" content="${button.text}" />`;
    if (button.action === 'link' && button.target) {
      tag += `\n    <meta property="fc:frame:button:${index + 1}:action" content="link" />`;
      tag += `\n    <meta property="fc:frame:button:${index + 1}:target" content="${button.target}" />`;
    } else if (button.action === 'post' || !button.action) {
      tag += `\n    <meta property="fc:frame:button:${index + 1}:action" content="post" />`;
    }
    return tag;
  }).join('\n    ');

  const inputTag = inputText ? `<meta property="fc:frame:input:text" content="${inputText}" />` : '';
  const postUrlTag = postUrl ? `<meta property="fc:frame:post_url" content="${postUrl}" />` : '';

  return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${title}</title>
    
    <!-- Frame meta tags following frames.js standards -->
    <meta property="fc:frame" content="vNext" />
    <meta property="fc:frame:title" content="${title}" />
    <meta property="fc:frame:image" content="${image}" />
    <meta property="fc:frame:image:aspect_ratio" content="1.91:1" />
    ${buttonTags}
    ${inputTag}
    ${postUrlTag}
    
    <!-- Open Graph tags for fallback -->
    <meta property="og:title" content="${title}" />
    <meta property="og:image" content="${image}" />
    <meta property="og:description" content="Voice accessibility tools for people who struggle with reading or writing" />
    <meta property="og:type" content="website" />
    
    <!-- Additional Frame metadata -->
    <meta name="fc:frame:state" content='{"version":"1","initialized":true}' />
  </head>
  <body>
    <div style="font-family: system-ui, -apple-system, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; background: linear-gradient(135deg, #8A63D2, #6366F1); min-height: 100vh;">
      <div style="background: white; border-radius: 16px; padding: 32px; box-shadow: 0 8px 32px rgba(0,0,0,0.2);">
        <div style="text-align: center; margin-bottom: 24px;">
          <div style="font-size: 48px; margin-bottom: 12px;">🔊</div>
          <h1 style="color: #8A63D2; margin: 0; font-size: 32px; font-weight: bold;">Cast Aloud</h1>
          <p style="color: #666; font-size: 18px; margin: 8px 0 0 0;">Accessibility tools for reading and writing</p>
        </div>
        
        <img src="${image}" alt="Frame preview" style="width: 100%; border-radius: 12px; margin-bottom: 24px; border: 3px solid #8A63D2;" />
        
        <div style="background: #f8f9ff; padding: 24px; border-radius: 12px; margin-bottom: 24px;">
          <h3 style="color: #8A63D2; margin: 0 0 16px 0; font-size: 20px;">For People with Reading/Writing Difficulties:</h3>
          <div style="display: grid; gap: 12px;">
            <div style="display: flex; align-items: center; gap: 12px;">
              <div style="background: #8A63D2; color: white; border-radius: 50%; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; font-weight: bold;">1</div>
              <span style="font-size: 16px;">🔊 <strong>Listen:</strong> Hear any Farcaster post read aloud with natural voice</span>
            </div>
            <div style="display: flex; align-items: center; gap: 12px;">
              <div style="background: #8A63D2; color: white; border-radius: 50%; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; font-weight: bold;">2</div>
              <span style="font-size: 16px;">🎤 <strong>Voice Reply:</strong> Speak your response instead of typing</span>
            </div>
            <div style="display: flex; align-items: center; gap: 12px;">
              <div style="background: #8A63D2; color: white; border-radius: 50%; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; font-weight: bold;">3</div>
              <span style="font-size: 16px;">✨ <strong>AI Polish:</strong> Improve your text automatically</span>
            </div>
          </div>
        </div>
        
        <div style="text-align: center; padding: 20px; background: #e0f2fe; border-radius: 12px; margin-bottom: 16px;">
          <p style="margin: 0; font-size: 16px; color: #0277bd; font-weight: 500;">
            Click the buttons in your Farcaster client to use voice features
          </p>
        </div>
        
        <div style="text-align: center; font-size: 14px; color: #666;">
          <p style="margin: 0;">Designed specifically for accessibility and inclusive communication</p>
        </div>
      </div>
    </div>
    
    <script>
      // Auto-play functionality for accessibility
      if ('speechSynthesis' in window) {
        // Add keyboard shortcuts for accessibility
        document.addEventListener('keydown', function(e) {
          if (e.key === 'Enter' && e.shiftKey) {
            // Trigger first button (Listen) with Shift+Enter
            const firstButton = document.querySelector('button');
            if (firstButton) firstButton.click();
          }
        });
      }
    </script>
  </body>
</html>`;
}

// Generate frame image URL based on state
function generateFrameImage(baseUrl: string, state: string, data?: any): string {
  const params = new URLSearchParams({
    state,
    ...data
  });
  return `${baseUrl}/api/frame/image?${params}`;
}

export async function handleFrameIndex(req: Request, res: Response) {
  const baseUrl = `${req.protocol}://${req.get('host')}`;
  
  const image = generateFrameImage(baseUrl, 'step1_paste');

  const html = generateFrameHTML(
    'Cast Aloud - Step 1: Paste Content',
    image,
    [
      { text: '📝 I Pasted URL/Text', action: 'post' },
      { text: '📱 Open Full App', action: 'link', target: baseUrl }
    ],
    'Paste Farcaster post URL or text directly here',
    `${baseUrl}/api/frame/action`
  );

  res.setHeader('Content-Type', 'text/html');
  res.send(html);
}

export async function handleFrameAction(req: Request, res: Response) {
  try {
    const frameData: FrameActionPayload = req.body;
    const buttonIndex = frameData.untrustedData.buttonIndex;
    const inputText = frameData.untrustedData.inputText;
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const cast = await storage.getCurrentCast();

    if (!cast) {
      return res.status(404).json({ error: 'No cast found' });
    }

    // Validate Frame action according to frames.js standards
    if (!frameData.trustedData || !frameData.untrustedData) {
      return res.status(400).json({ error: 'Invalid frame data' });
    }

    switch (buttonIndex) {
      case 1: // Step 1 Complete - User pasted content, now show Step 2: Read Aloud
        {
          if (!inputText || !inputText.trim()) {
            // No input provided, show error and return to step 1
            const image = generateFrameImage(baseUrl, 'error_no_input');
            const html = generateFrameHTML(
              'Cast Aloud - Error: No Content',
              image,
              [
                { text: '🔄 Try Again', action: 'post' },
                { text: '📱 Open Full App', action: 'link', target: baseUrl }
              ],
              'Please paste Farcaster URL or text content',
              `${baseUrl}/api/frame/action`
            );
            return res.send(html);
          }

          // Store the content and show Step 2: Read Aloud
          await storage.createCast({
            hash: 'frame-cast-' + Date.now(),
            authorFid: 1,
            authorUsername: 'user',
            content: inputText.trim(),
            timestamp: new Date()
          });

          const image = generateFrameImage(baseUrl, 'step2_read_aloud', { 
            content: inputText.trim().substring(0, 100)
          });

          const html = generateFrameHTML(
            'Cast Aloud - Step 2: Click Read Aloud',
            image,
            [
              { text: '🔊 Read Aloud', action: 'link', target: `${baseUrl}/api/tts?text=${encodeURIComponent(inputText.trim())}` },
              { text: '✍️ Skip to Reply', action: 'post' },
              { text: '🔄 Start Over', action: 'post' }
            ],
            'Type your reply here after listening...',
            `${baseUrl}/api/frame/action`
          );

          res.setHeader('Content-Type', 'text/html');
          res.send(html);
        }
        break;

      case 2: // Step 3: User typed reply, show Step 4: Get AI feedback
        {
          if (!inputText || !inputText.trim()) {
            // No reply typed, show Step 3 interface
            const image = generateFrameImage(baseUrl, 'step3_type_reply');

            const html = generateFrameHTML(
              'Cast Aloud - Step 3: Type Your Reply',
              image,
              [
                { text: '✍️ I Typed My Reply', action: 'post' },
                { text: '🔄 Start Over', action: 'post' }
              ],
              'Type your reply in the text area below',
              `${baseUrl}/api/frame/action`
            );

            res.setHeader('Content-Type', 'text/html');
            res.send(html);
          } else {
            // User has typed a reply, show Step 4: AI feedback options
            const image = generateFrameImage(baseUrl, 'step4_ai_feedback', {
              reply: inputText.trim().substring(0, 80)
            });

            const html = generateFrameHTML(
              'Cast Aloud - Step 4: Get AI Feedback',
              image,
              [
                { text: '🤖 Get AI Feedback', action: 'post' },
                { text: '✨ Polish My Reply', action: 'post' },
                { text: '📋 Skip to Copy', action: 'post' }
              ],
              inputText.trim(),
              `${baseUrl}/api/frame/action`
            );

            res.setHeader('Content-Type', 'text/html');
            res.send(html);
          }
        }
        break;

      case 3: // Handle different actions based on button context
        {
          const currentCast = await storage.getCurrentCast();
          const userReply = inputText?.trim() || '';

          if (!userReply) {
            // Step 5: Final copy step without feedback
            const image = generateFrameImage(baseUrl, 'step5_copy', {
              reply: 'No reply provided'
            });

            const html = generateFrameHTML(
              'Cast Aloud - Step 5: Copy Reply',
              image,
              [
                { text: '🔄 Start Over', action: 'post' },
                { text: '📱 Open Full App', action: 'link', target: baseUrl }
              ],
              'Type your reply to continue...',
              `${baseUrl}/api/frame/action`
            );

            return res.send(html);
          }

          // Determine action based on previous button clicked
          const isPolishAction = frameData.untrustedData.url?.includes('polish') || true; // Default to polish

          if (isPolishAction) {
            // Polish the reply using AI
            const polishedText = await polishReply(userReply);
            
            const image = generateFrameImage(baseUrl, 'step5_copy', {
              reply: polishedText.substring(0, 80),
              original: userReply.substring(0, 40)
            });

            const html = generateFrameHTML(
              'Cast Aloud - Step 5: Copy Improved Reply',
              image,
              [
                { text: '📋 Copy to Clipboard', action: 'link', target: `https://warpcast.com/~/compose?text=${encodeURIComponent(polishedText)}` },
                { text: '✏️ Edit More', action: 'post' },
                { text: '🔄 Start Over', action: 'post' }
              ],
              polishedText,
              `${baseUrl}/api/frame/action`
            );

            res.setHeader('Content-Type', 'text/html');
            res.send(html);
          } else {
            // Just provide feedback without polishing
            const feedback = await polishReply(userReply);
            
            const image = generateFrameImage(baseUrl, 'feedback_provided', {
              feedback: feedback.substring(0, 60)
            });

            const html = generateFrameHTML(
              'Cast Aloud - AI Feedback Provided',
              image,
              [
                { text: '✨ Polish Now', action: 'post' },
                { text: '📋 Use Original', action: 'link', target: `https://warpcast.com/~/compose?text=${encodeURIComponent(userReply)}` },
                { text: '🔄 Start Over', action: 'post' }
              ],
              userReply,
              `${baseUrl}/api/frame/action`
            );

            res.setHeader('Content-Type', 'text/html');
            res.send(html);
          }
        }
        break;

      default:
        return handleFrameIndex(req, res);
    }

  } catch (error) {
    console.error('Frame action error:', error);
    const image = generateFrameImage(`${req.protocol}://${req.get('host')}`, 'error', {
      message: 'Something went wrong. Try again or open the full app.'
    });

    const html = generateFrameHTML(
      'Cast Aloud - Error',
      image,
      [
        { text: '🔄 Try Again', action: 'post' },
        { text: '⚙️ Open App', action: 'link', target: `${req.protocol}://${req.get('host')}` }
      ],
      undefined,
      `${req.protocol}://${req.get('host')}/api/frame/action`
    );

    res.setHeader('Content-Type', 'text/html');
    res.send(html);
  }
}

// Helper function for reply polishing
async function polishReply(text: string): Promise<string> {
  try {
    // Use relative URL that works in both dev and production
    const response = await fetch('/api/polish-reply', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text })
    });
    
    if (response.ok) {
      const data = await response.json();
      return data.polishedText || text;
    }
    
    return text;
  } catch (error) {
    console.error('Failed to polish reply:', error);
    return text;
  }
}

export async function handleFrameImage(req: Request, res: Response) {
  try {
    const { state, castId, author, content, message, reply, original, feedback } = req.query;
    const contentStr = typeof content === 'string' ? content : 'Welcome to Cast Aloud! This accessibility app helps you listen to casts and reply using your voice.';
    const authorStr = typeof author === 'string' ? author : 'demo';
    const messageStr = typeof message === 'string' ? message : '';
    
    // Extract data object from query parameters
    const data = {
      content: contentStr,
      author: authorStr,
      message: messageStr,
      reply: typeof reply === 'string' ? reply : '',
      original: typeof original === 'string' ? original : '',
      feedback: typeof feedback === 'string' ? feedback : ''
    };

    // Generate SVG image based on state
    let svg = '';
  
  switch (state) {
    case 'initial':
      svg = `
        <svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style="stop-color:#8A63D2;stop-opacity:1" />
              <stop offset="100%" style="stop-color:#6D4BAA;stop-opacity:1" />
            </linearGradient>
          </defs>
          
          <rect width="1200" height="630" fill="url(#bg)"/>
          
          <!-- Header -->
          <rect x="50" y="50" width="1100" height="120" rx="20" fill="white" fill-opacity="0.95"/>
          <text x="70" y="100" font-family="Arial, sans-serif" font-size="36" font-weight="bold" fill="#171717">
            🔊 Cast Aloud
          </text>
          <text x="70" y="135" font-family="Arial, sans-serif" font-size="22" fill="#6B7280">
            Accessibility tools for reading and replying to casts
          </text>
          
          <!-- Cast Content -->
          <rect x="50" y="200" width="1100" height="280" rx="20" fill="white" fill-opacity="0.95"/>
          <text x="70" y="240" font-family="Arial, sans-serif" font-size="20" font-weight="bold" fill="#8A63D2">
            @${authorStr}
          </text>
          <text x="70" y="290" font-family="Arial, sans-serif" font-size="22" fill="#171717">
            ${contentStr.substring(0, 50)}${contentStr.length > 50 ? '...' : ''}
          </text>
          <text x="70" y="320" font-family="Arial, sans-serif" font-size="22" fill="#171717">
            ${contentStr.substring(50, 100)}${contentStr.length > 100 ? '...' : ''}
          </text>
          <text x="70" y="350" font-family="Arial, sans-serif" font-size="22" fill="#171717">
            ${contentStr.substring(100, 150)}${contentStr.length > 150 ? '...' : ''}
          </text>
          
          <!-- Action Buttons Preview -->
          <rect x="70" y="520" width="180" height="50" rx="25" fill="#8A63D2"/>
          <text x="160" y="550" font-family="Arial, sans-serif" font-size="18" font-weight="bold" fill="white" text-anchor="middle">
            🔊 Listen
          </text>
          
          <rect x="270" y="520" width="180" height="50" rx="25" fill="#16A34A"/>
          <text x="360" y="550" font-family="Arial, sans-serif" font-size="18" font-weight="bold" fill="white" text-anchor="middle">
            🎤 Reply
          </text>
          
          <rect x="470" y="520" width="180" height="50" rx="25" fill="#6B7280"/>
          <text x="560" y="550" font-family="Arial, sans-serif" font-size="18" font-weight="bold" fill="white" text-anchor="middle">
            ⚙️ Open App
          </text>
        </svg>
      `;
      break;
      
    case 'reading':
      svg = `
        <svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
          <rect width="1200" height="630" fill="#7C3AED"/>
          
          <circle cx="600" cy="315" r="80" fill="white" fill-opacity="0.2"/>
          <circle cx="600" cy="315" r="60" fill="white" fill-opacity="0.4"/>
          <circle cx="600" cy="315" r="40" fill="white"/>
          
          <text x="600" y="325" font-family="Arial, sans-serif" font-size="40" fill="#7C3AED" text-anchor="middle">
            🔊
          </text>
          
          <text x="600" y="450" font-family="Arial, sans-serif" font-size="32" font-weight="bold" fill="white" text-anchor="middle">
            Reading Cast Aloud...
          </text>
          
          <text x="600" y="500" font-family="Arial, sans-serif" font-size="20" fill="white" fill-opacity="0.8" text-anchor="middle">
            Audio is now playing
          </text>
        </svg>
      `;
      break;
      
    case 'recording':
      svg = `
        <svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
          <rect width="1200" height="630" fill="#16A34A"/>
          
          <circle cx="600" cy="315" r="80" fill="white" fill-opacity="0.2"/>
          <circle cx="600" cy="315" r="60" fill="white" fill-opacity="0.4"/>
          <circle cx="600" cy="315" r="40" fill="white"/>
          
          <text x="600" y="325" font-family="Arial, sans-serif" font-size="40" fill="#16A34A" text-anchor="middle">
            🎤
          </text>
          
          <text x="600" y="450" font-family="Arial, sans-serif" font-size="32" font-weight="bold" fill="white" text-anchor="middle">
            Voice Reply
          </text>
          
          <text x="600" y="500" font-family="Arial, sans-serif" font-size="20" fill="white" fill-opacity="0.8" text-anchor="middle">
            ${messageStr || 'Ready to record your voice reply'}
          </text>
        </svg>
      `;
      break;
      
    case 'success':
      svg = `
        <svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
          <rect width="1200" height="630" fill="#10B981"/>
          
          <circle cx="600" cy="315" r="80" fill="white" fill-opacity="0.2"/>
          <circle cx="600" cy="315" r="60" fill="white" fill-opacity="0.4"/>
          <circle cx="600" cy="315" r="40" fill="white"/>
          
          <text x="600" y="325" font-family="Arial, sans-serif" font-size="40" fill="#10B981" text-anchor="middle">
            ✅
          </text>
          
          <text x="600" y="450" font-family="Arial, sans-serif" font-size="32" font-weight="bold" fill="white" text-anchor="middle">
            Reply Enhanced
          </text>
          
          <text x="600" y="500" font-family="Arial, sans-serif" font-size="20" fill="white" fill-opacity="0.8" text-anchor="middle">
            ${messageStr || 'Your reply has been polished with AI'}
          </text>
        </svg>
      `;
      break;
      
    case 'step1_paste':
      svg = `
        <svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
          <rect width="1200" height="630" fill="#F9FAFB"/>
          <rect x="40" y="40" width="1120" height="550" rx="16" fill="white" stroke="#E5E7EB" stroke-width="2"/>
          
          <text x="100" y="100" font-family="Arial, sans-serif" font-size="32" font-weight="bold" fill="#8A63D2">
            📝 Step 1: Paste Farcaster Content
          </text>
          <text x="100" y="140" font-family="Arial, sans-serif" font-size="16" fill="#6B7280">
            Paste a Farcaster post URL or text directly in the input field below
          </text>
          
          <rect x="100" y="180" width="1000" height="120" rx="8" fill="#F9FAFB" stroke="#D1D5DB" stroke-width="2"/>
          <text x="120" y="210" font-family="Arial, sans-serif" font-size="14" fill="#9CA3AF">
            Example: https://warpcast.com/username/0x123abc... or paste cast text
          </text>
          <text x="120" y="240" font-family="Arial, sans-serif" font-size="16" fill="#374151">
            Enter Farcaster content here...
          </text>
          <text x="120" y="270" font-family="Arial, sans-serif" font-size="12" fill="#6B7280">
            This tool helps people with reading and writing difficulties
          </text>
          
          <text x="100" y="350" font-family="Arial, sans-serif" font-size="18" font-weight="bold" fill="#374151">
            What happens next:
          </text>
          <text x="100" y="380" font-family="Arial, sans-serif" font-size="14" fill="#6B7280">
            2. 🔊 Click "Read Aloud" to hear the content
          </text>
          <text x="100" y="405" font-family="Arial, sans-serif" font-size="14" fill="#6B7280">
            3. ✍️ Type your reply in the text area
          </text>
          <text x="100" y="430" font-family="Arial, sans-serif" font-size="14" fill="#6B7280">
            4. 🤖 Get AI feedback or polish your reply
          </text>
          <text x="100" y="455" font-family="Arial, sans-serif" font-size="14" fill="#6B7280">
            5. 📋 Copy the improved reply to post on Farcaster
          </text>
          
          <text x="600" y="520" font-family="Arial, sans-serif" font-size="16" fill="#8A63D2" font-weight="bold" text-anchor="middle">
            Click "I Pasted URL/Text" after entering content above
          </text>
        </svg>
      `;
      break;

    case 'step2_read_aloud':
      const step2Content = data.content || 'Sample cast content';
      svg = `
        <svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
          <rect width="1200" height="630" fill="#F9FAFB"/>
          <rect x="40" y="40" width="1120" height="550" rx="16" fill="white" stroke="#E5E7EB" stroke-width="2"/>
          
          <text x="100" y="100" font-family="Arial, sans-serif" font-size="32" font-weight="bold" fill="#8A63D2">
            🔊 Step 2: Click Read Aloud
          </text>
          <text x="100" y="140" font-family="Arial, sans-serif" font-size="16" fill="#6B7280">
            Your content is ready. Click the audio button to hear it read aloud.
          </text>
          
          <rect x="100" y="180" width="1000" height="120" rx="8" fill="#F3F4F6" stroke="#D1D5DB" stroke-width="1"/>
          <text x="120" y="210" font-family="Arial, sans-serif" font-size="14" font-weight="bold" fill="#374151">
            Content to read:
          </text>
          <text x="120" y="235" font-family="Arial, sans-serif" font-size="13" fill="#6B7280">
            ${step2Content.substring(0, 80)}
          </text>
          <text x="120" y="255" font-family="Arial, sans-serif" font-size="13" fill="#6B7280">
            ${step2Content.substring(80, 160)}${step2Content.length > 160 ? '...' : ''}
          </text>
          <text x="120" y="280" font-family="Arial, sans-serif" font-size="12" fill="#9CA3AF">
            Audio will play when you click the Read Aloud button
          </text>
          
          <rect x="100" y="330" width="220" height="50" rx="25" fill="#8A63D2"/>
          <text x="210" y="360" font-family="Arial, sans-serif" font-size="16" font-weight="bold" fill="white" text-anchor="middle">
            🔊 Read Aloud
          </text>
          
          <text x="100" y="420" font-family="Arial, sans-serif" font-size="16" fill="#374151">
            After listening, you can skip to typing your reply or start over.
          </text>
          
          <text x="600" y="520" font-family="Arial, sans-serif" font-size="14" fill="#8A63D2" font-weight="bold" text-anchor="middle">
            Click "Read Aloud" to hear the content with natural voice synthesis
          </text>
        </svg>
      `;
      break;

    case 'step3_type_reply':
      svg = `
        <svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
          <rect width="1200" height="630" fill="#F9FAFB"/>
          <rect x="40" y="40" width="1120" height="550" rx="16" fill="white" stroke="#E5E7EB" stroke-width="2"/>
          
          <text x="100" y="100" font-family="Arial, sans-serif" font-size="32" font-weight="bold" fill="#8A63D2">
            ✍️ Step 3: Type Your Reply
          </text>
          <text x="100" y="140" font-family="Arial, sans-serif" font-size="16" fill="#6B7280">
            Now type your response in the text area below this image
          </text>
          
          <rect x="100" y="180" width="1000" height="150" rx="8" fill="#F9FAFB" stroke="#D1D5DB" stroke-width="2"/>
          <text x="120" y="210" font-family="Arial, sans-serif" font-size="14" fill="#9CA3AF">
            Type your reply here...
          </text>
          <text x="120" y="240" font-family="Arial, sans-serif" font-size="16" fill="#374151">
            Enter your thoughts, questions, or response to the cast
          </text>
          <text x="120" y="270" font-family="Arial, sans-serif" font-size="12" fill="#6B7280">
            Don't worry about perfect grammar - AI will help improve it
          </text>
          <text x="120" y="295" font-family="Arial, sans-serif" font-size="12" fill="#6B7280">
            Just express your ideas naturally
          </text>
          <text x="120" y="315" font-family="Arial, sans-serif" font-size="11" fill="#9CA3AF">
            Use the Frame input field below this image to type your reply
          </text>
          
          <text x="100" y="380" font-family="Arial, sans-serif" font-size="16" fill="#374151">
            Next steps after typing:
          </text>
          <text x="100" y="405" font-family="Arial, sans-serif" font-size="14" fill="#6B7280">
            4. 🤖 Get AI feedback on your reply
          </text>
          <text x="100" y="430" font-family="Arial, sans-serif" font-size="14" fill="#6B7280">
            5. 📋 Copy the improved text to post on Farcaster
          </text>
          
          <text x="600" y="520" font-family="Arial, sans-serif" font-size="14" fill="#8A63D2" font-weight="bold" text-anchor="middle">
            Click "I Typed My Reply" after entering your response
          </text>
        </svg>
      `;
      break;

    case 'step4_ai_feedback':
      const step4Reply = data.reply || 'Your reply';
      svg = `
        <svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
          <rect width="1200" height="630" fill="#F9FAFB"/>
          <rect x="40" y="40" width="1120" height="550" rx="16" fill="white" stroke="#E5E7EB" stroke-width="2"/>
          
          <text x="100" y="100" font-family="Arial, sans-serif" font-size="32" font-weight="bold" fill="#8A63D2">
            🤖 Step 4: Get AI Feedback
          </text>
          <text x="100" y="140" font-family="Arial, sans-serif" font-size="16" fill="#6B7280">
            Choose how you want AI to help improve your reply
          </text>
          
          <rect x="100" y="180" width="1000" height="80" rx="8" fill="#F3F4F6" stroke="#D1D5DB" stroke-width="1"/>
          <text x="120" y="205" font-family="Arial, sans-serif" font-size="14" font-weight="bold" fill="#374151">
            Your reply:
          </text>
          <text x="120" y="230" font-family="Arial, sans-serif" font-size="13" fill="#6B7280">
            "${step4Reply.substring(0, 70)}${step4Reply.length > 70 ? '...' : ''}"
          </text>
          <text x="120" y="250" font-family="Arial, sans-serif" font-size="12" fill="#9CA3AF">
            Ready for AI enhancement
          </text>
          
          <text x="100" y="300" font-family="Arial, sans-serif" font-size="16" fill="#374151">
            AI assistance options:
          </text>
          
          <rect x="100" y="330" width="200" height="45" rx="22" fill="#6366F1"/>
          <text x="200" y="355" font-family="Arial, sans-serif" font-size="14" font-weight="bold" fill="white" text-anchor="middle">
            🤖 Get AI Feedback
          </text>
          
          <rect x="320" y="330" width="200" height="45" rx="22" fill="#10B981"/>
          <text x="420" y="355" font-family="Arial, sans-serif" font-size="14" font-weight="bold" fill="white" text-anchor="middle">
            ✨ Polish My Reply
          </text>
          
          <text x="100" y="410" font-family="Arial, sans-serif" font-size="14" fill="#6B7280">
            • Feedback: Get suggestions for improvement
          </text>
          <text x="100" y="430" font-family="Arial, sans-serif" font-size="14" fill="#6B7280">
            • Polish: Automatically improve grammar and clarity
          </text>
          
          <text x="600" y="520" font-family="Arial, sans-serif" font-size="14" fill="#8A63D2" font-weight="bold" text-anchor="middle">
            Choose your preferred AI assistance method
          </text>
        </svg>
      `;
      break;

    case 'step5_copy':
      const step5Reply = data.reply || 'Your improved reply';
      const step5Original = data.original || '';
      svg = `
        <svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
          <rect width="1200" height="630" fill="#F9FAFB"/>
          <rect x="40" y="40" width="1120" height="550" rx="16" fill="white" stroke="#E5E7EB" stroke-width="2"/>
          
          <text x="100" y="100" font-family="Arial, sans-serif" font-size="32" font-weight="bold" fill="#8A63D2">
            📋 Step 5: Copy Improved Reply
          </text>
          <text x="100" y="140" font-family="Arial, sans-serif" font-size="16" fill="#6B7280">
            Your reply has been enhanced! Copy it to post on Farcaster.
          </text>
          
          ${step5Original ? `
          <rect x="100" y="170" width="1000" height="60" rx="8" fill="#F3F4F6" stroke="#9CA3AF" stroke-width="1"/>
          <text x="120" y="190" font-family="Arial, sans-serif" font-size="12" fill="#4B5563">
            Original: ${step5Original}
          </text>
          <text x="120" y="210" font-family="Arial, sans-serif" font-size="12" fill="#6B7280">
            ↓ Improved with AI ↓
          </text>
          ` : ''}
          
          <rect x="100" y="250" width="1000" height="100" rx="8" fill="#D1FAE5" stroke="#10B981" stroke-width="1"/>
          <text x="120" y="275" font-family="Arial, sans-serif" font-size="14" font-weight="bold" fill="#047857">
            Enhanced reply:
          </text>
          <text x="120" y="300" font-family="Arial, sans-serif" font-size="13" fill="#065F46">
            ${step5Reply.substring(0, 80)}
          </text>
          <text x="120" y="320" font-family="Arial, sans-serif" font-size="13" fill="#065F46">
            ${step5Reply.substring(80, 160)}${step5Reply.length > 160 ? '...' : ''}
          </text>
          <text x="120" y="340" font-family="Arial, sans-serif" font-size="12" fill="#047857">
            ✓ Grammar improved ✓ Clarity enhanced ✓ Ready to post
          </text>
          
          <rect x="100" y="380" width="250" height="45" rx="22" fill="#10B981"/>
          <text x="225" y="405" font-family="Arial, sans-serif" font-size="14" font-weight="bold" fill="white" text-anchor="middle">
            📋 Copy to Clipboard
          </text>
          
          <text x="100" y="460" font-family="Arial, sans-serif" font-size="14" fill="#374151">
            Click the copy button to open Warpcast with your improved reply ready to post!
          </text>
          
          <text x="600" y="520" font-family="Arial, sans-serif" font-size="14" fill="#8A63D2" font-weight="bold" text-anchor="middle">
            Success! Your accessible reply workflow is complete.
          </text>
        </svg>
      `;
      break;

    case 'error_no_input':
      svg = `
        <svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
          <rect width="1200" height="630" fill="#FEF2F2"/>
          <rect x="40" y="40" width="1120" height="550" rx="16" fill="white" stroke="#F87171" stroke-width="2"/>
          
          <text x="100" y="100" font-family="Arial, sans-serif" font-size="32" font-weight="bold" fill="#DC2626">
            ⚠️ No Content Provided
          </text>
          <text x="100" y="140" font-family="Arial, sans-serif" font-size="16" fill="#6B7280">
            Please paste Farcaster content in the input field to continue
          </text>
          
          <rect x="100" y="180" width="1000" height="120" rx="8" fill="#FEF2F2" stroke="#F87171" stroke-width="1"/>
          <text x="120" y="210" font-family="Arial, sans-serif" font-size="14" fill="#DC2626">
            The input field was empty. Please enter:
          </text>
          <text x="120" y="235" font-family="Arial, sans-serif" font-size="13" fill="#7F1D1D">
            • A Farcaster post URL (like warpcast.com/user/0x123...)
          </text>
          <text x="120" y="255" font-family="Arial, sans-serif" font-size="13" fill="#7F1D1D">
            • Or paste the cast text directly
          </text>
          <text x="120" y="280" font-family="Arial, sans-serif" font-size="13" fill="#7F1D1D">
            • This content will be read aloud for accessibility
          </text>
          
          <text x="600" y="520" font-family="Arial, sans-serif" font-size="14" fill="#DC2626" font-weight="bold" text-anchor="middle">
            Click "Try Again" and make sure to enter content in the input field
          </text>
        </svg>
      `;
      break;
      
    default:
      svg = `
        <svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
          <rect width="1200" height="630" fill="#F9FAFB"/>
          
          <!-- Main Container matching Mini App -->
          <rect x="40" y="40" width="1120" height="550" rx="16" fill="white" stroke="#E5E7EB" stroke-width="2"/>
          
          <!-- Header matching Mini App design -->
          <rect x="60" y="60" width="1080" height="70" rx="8" fill="#FFFFFF"/>
          <text x="100" y="90" font-family="Arial, sans-serif" font-size="24" font-weight="bold" fill="#1F2937">
            Cast Aloud
          </text>
          <text x="100" y="110" font-family="Arial, sans-serif" font-size="14" fill="#6B7280">
            Accessibility tools for reading and replying to casts
          </text>
          
          <!-- Text Input Area matching Mini App -->
          <rect x="80" y="150" width="1040" height="120" rx="8" fill="#F9FAFB" stroke="#D1D5DB" stroke-width="1"/>
          <text x="100" y="175" font-family="Arial, sans-serif" font-size="12" fill="#6B7280">
            Paste Farcaster post URL or text directly:
          </text>
          <text x="100" y="200" font-family="Arial, sans-serif" font-size="14" fill="#9CA3AF">
            Enter content here to use voice accessibility features...
          </text>
          <text x="100" y="220" font-family="Arial, sans-serif" font-size="12" fill="#6B7280">
            This helps people who have difficulty reading or writing
          </text>
          <text x="100" y="240" font-family="Arial, sans-serif" font-size="12" fill="#6B7280">
            Use the buttons below to listen to content or get help with replies
          </text>
          <text x="100" y="255" font-family="Arial, sans-serif" font-size="11" fill="#9CA3AF">
            Input text using the Frame text field below this image
          </text>
          
          <!-- Button Row matching Mini App -->
          <rect x="100" y="290" width="200" height="45" rx="22" fill="#8A63D2"/>
          <text x="200" y="315" font-family="Arial, sans-serif" font-size="14" font-weight="bold" fill="white" text-anchor="middle">
            🔊 Read Aloud
          </text>
          
          <rect x="320" y="290" width="200" height="45" rx="22" fill="#16A34A"/>
          <text x="420" y="315" font-family="Arial, sans-serif" font-size="14" font-weight="bold" fill="white" text-anchor="middle">
            🎤 Voice Reply
          </text>
          
          <rect x="540" y="290" width="150" height="45" rx="22" fill="#6B7280"/>
          <text x="615" y="315" font-family="Arial, sans-serif" font-size="14" font-weight="bold" fill="white" text-anchor="middle">
            ⚙️ Settings
          </text>
          
          <rect x="710" y="290" width="180" height="45" rx="22" fill="#059669"/>
          <text x="800" y="315" font-family="Arial, sans-serif" font-size="14" font-weight="bold" fill="white" text-anchor="middle">
            📱 Open Full App
          </text>
          
          <!-- Features Description -->
          <rect x="80" y="360" width="1040" height="180" rx="8" fill="#F3F4F6"/>
          <text x="100" y="385" font-family="Arial, sans-serif" font-size="16" font-weight="bold" fill="#374151">
            Voice Accessibility Features:
          </text>
          <text x="100" y="410" font-family="Arial, sans-serif" font-size="13" fill="#6B7280">
            • Read Aloud: Hear any Farcaster cast with natural voice synthesis
          </text>
          <text x="100" y="430" font-family="Arial, sans-serif" font-size="13" fill="#6B7280">
            • Voice Reply: Record your response and get AI-powered text enhancement
          </text>
          <text x="100" y="450" font-family="Arial, sans-serif" font-size="13" fill="#6B7280">
            • Settings: Adjust speech rate, voice selection, and accessibility preferences
          </text>
          <text x="100" y="470" font-family="Arial, sans-serif" font-size="13" fill="#6B7280">
            • Persistent settings that save between sessions for personalized experience
          </text>
          <text x="100" y="495" font-family="Arial, sans-serif" font-size="13" fill="#8A63D2" font-weight="bold">
            Enter text in the Frame input field below to start using these features
          </text>
          <text x="100" y="515" font-family="Arial, sans-serif" font-size="12" fill="#9CA3AF">
            Designed specifically for people with reading and writing difficulties
          </text>
          
          <!-- Footer -->
          <text x="600" y="570" font-family="Arial, sans-serif" font-size="10" fill="#9CA3AF" text-anchor="middle">
            Frame interface matches the full Mini App experience
          </text>
        </svg>
      `;
  }

  res.setHeader('Content-Type', 'image/svg+xml');
  res.setHeader('Cache-Control', 'public, max-age=300');
  res.send(svg);
  
  } catch (error) {
    console.error('Frame image generation error:', error);
    
    // Return a fallback SVG image
    const fallbackSvg = `
      <svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
        <rect width="1200" height="630" fill="#8A63D2"/>
        <text x="600" y="315" font-family="Arial, sans-serif" font-size="32" fill="white" text-anchor="middle">
          Cast Aloud
        </text>
      </svg>
    `;
    
    res.setHeader('Content-Type', 'image/svg+xml');
    res.send(fallbackSvg);
  }
}