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

// Generate frame HTML with meta tags
function generateFrameHTML(
  title: string,
  image: string,
  buttons: Array<{ text: string; action?: string; target?: string }>,
  inputText?: string,
  postUrl?: string
): string {
  const buttonTags = buttons.map((button, index) => {
    let tag = `<meta property="fc:frame:button:${index + 1}" content="${button.text}" />`;
    if (button.action) {
      tag += `\n    <meta property="fc:frame:button:${index + 1}:action" content="${button.action}" />`;
    }
    if (button.target) {
      tag += `\n    <meta property="fc:frame:button:${index + 1}:target" content="${button.target}" />`;
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
    
    <!-- Frame meta tags -->
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
    <meta property="og:description" content="Listen to casts and reply with your voice" />
  </head>
  <body>
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h1>${title}</h1>
      <img src="${image}" alt="Frame preview" style="width: 100%; border-radius: 8px;" />
      <p>This is a Farcaster Frame for accessibility features. Use a Farcaster client to interact.</p>
    </div>
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
  const cast = await storage.getCurrentCast();
  
  if (!cast) {
    // Create a sample cast if none exists
    const sampleCast = await storage.createCast({
      hash: 'sample',
      authorFid: 1,
      authorUsername: 'demo',
      content: 'Welcome to Cast Aloud - your voice-enabled accessibility tool for Farcaster! This demo shows how you can listen to casts and reply using your voice.',
      timestamp: new Date()
    });
  }

  const currentCast = await storage.getCurrentCast();
  const image = generateFrameImage(baseUrl, 'initial', { 
    castId: currentCast?.id || 1,
    author: currentCast?.authorUsername || 'demo',
    content: (currentCast?.content.substring(0, 80) || 'Demo content') + (currentCast && currentCast.content.length > 80 ? '...' : '')
  });

  const html = generateFrameHTML(
    'Cast Aloud - Voice Accessibility for Farcaster',
    image,
    [
      { text: '🔊 Listen', action: 'post' },
      { text: '🎤 Voice Reply', action: 'post' },
      { text: '⚙️ Open App', action: 'link', target: baseUrl }
    ],
    undefined,
    `${baseUrl}/api/frame/action`
  );

  res.setHeader('Content-Type', 'text/html');
  res.send(html);
}

export async function handleFrameAction(req: Request, res: Response) {
  try {
    const frameData: FrameActionPayload = req.body;
    const buttonIndex = frameData.untrustedData.buttonIndex;
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const cast = await storage.getCurrentCast();

    if (!cast) {
      return res.status(404).json({ error: 'No cast found' });
    }

    switch (buttonIndex) {
      case 1: // Read Aloud
        {
          const image = generateFrameImage(baseUrl, 'reading', {
            castId: cast.id,
            message: 'Audio is playing...'
          });

          const html = generateFrameHTML(
            'Reading Castaloud',
            image,
            [
              { text: '⏹️ Stop', action: 'post' },
              { text: '🎤 Voice Reply', action: 'post' },
              { text: '🔄 Back', action: 'post' }
            ],
            undefined,
            `${baseUrl}/api/frame/action`
          );

          res.setHeader('Content-Type', 'text/html');
          res.send(html);
        }
        break;

      case 2: // Voice Reply
        {
          const image = generateFrameImage(baseUrl, 'recording', {
            castId: cast.id,
            message: 'Ready to record your voice reply'
          });

          const html = generateFrameHTML(
            'Voice Reply',
            image,
            [
              { text: '🔴 Start Recording', action: 'link', target: `${baseUrl}/voice-recorder?castId=${cast.id}` },
              { text: '🔄 Back', action: 'post' }
            ],
            'Or type your reply here...',
            `${baseUrl}/api/frame/action`
          );

          res.setHeader('Content-Type', 'text/html');
          res.send(html);
        }
        break;

      case 3: // Back button
        {
          return handleFrameIndex(req, res);
        }
        break;

      default:
        return handleFrameIndex(req, res);
    }

  } catch (error) {
    console.error('Frame action error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function handleFrameImage(req: Request, res: Response) {
  const { state, castId, author, content, message } = req.query;
  const contentStr = typeof content === 'string' ? content : 'Welcome to Cast Aloud! This accessibility app helps you listen to casts and reply using your voice.';
  const authorStr = typeof author === 'string' ? author : 'demo';
  const messageStr = typeof message === 'string' ? message : '';

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
          <foreignObject x="70" y="260" width="1060" height="180">
            <div xmlns="http://www.w3.org/1999/xhtml" style="font-family: Arial, sans-serif; font-size: 24px; color: #171717; line-height: 1.4; padding: 10px; word-wrap: break-word;">
              ${contentStr.substring(0, 120)}${contentStr.length > 120 ? '...' : ''}
            </div>
          </foreignObject>
          
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
            ${message || 'Ready to record your voice reply'}
          </text>
        </svg>
      `;
      break;
      
    default:
      svg = `<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg"><rect width="1200" height="630" fill="#7C3AED"/></svg>`;
  }

  res.setHeader('Content-Type', 'image/svg+xml');
  res.send(svg);
}