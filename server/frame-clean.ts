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

function generateFrameHTML(
  title: string,
  image: string,
  buttons: Array<{ text: string; action: string; target?: string }>,
  inputText?: string,
  postUrl?: string
): string {
  const buttonTags = buttons.map((button, index) => {
    let tag = `<meta property="fc:frame:button:${index + 1}" content="${button.text}" />`;
    tag += `\n    <meta property="fc:frame:button:${index + 1}:action" content="${button.action}" />`;
    if (button.target) {
      tag += `\n    <meta property="fc:frame:button:${index + 1}:target" content="${button.target}" />`;
    }
    return tag;
  }).join('\n    ');

  const inputTag = inputText ? `<meta property="fc:frame:input:text" content="${inputText}" />` : '';
  const postUrlTag = postUrl ? `<meta property="fc:frame:post_url" content="${postUrl}" />` : '';
  
  const ogTags = `
    <meta property="og:title" content="${title}" />
    <meta property="og:description" content="Voice accessibility tools for Farcaster. Listen to casts aloud and reply using voice." />
    <meta property="og:image" content="${image}" />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="${postUrl || ''}" />`;

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
    ${ogTags}
  </head>
  <body>
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #8A63D2; color: white; min-height: 100vh;">
      <h1>${title}</h1>
      <img src="${image}" alt="Frame preview" style="width: 100%; border-radius: 8px;" />
      <p>Voice accessibility tools for Farcaster. Use buttons above to interact.</p>
    </div>
  </body>
</html>`;
}

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
    await storage.createCast({
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
    'Cast Aloud',
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
      case 1: // Listen
        {
          const image = generateFrameImage(baseUrl, 'reading', {
            castId: cast.id,
            message: 'Audio is playing...'
          });

          const html = generateFrameHTML(
            'Reading Cast Aloud',
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
            message: 'Ready to record your voice'
          });

          const html = generateFrameHTML(
            'Voice Reply',
            image,
            [
              { text: '🔴 Start Recording', action: 'link', target: `${baseUrl}/cast-aloud?castId=${cast.id}` },
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
  const contentStr = typeof content === 'string' ? content : 'Welcome to Cast Aloud! Voice accessibility for Farcaster.';
  const authorStr = typeof author === 'string' ? author : 'demo';
  const messageStr = typeof message === 'string' ? message : '';

  const svg = `<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
    <rect width="1200" height="630" fill="#8A63D2"/>
    <circle cx="300" cy="200" r="50" fill="white"/>
    <rect x="200" y="300" width="200" height="80" rx="40" fill="white"/>
    <circle cx="230" cy="340" r="8" fill="#8A63D2"/>
    <circle cx="270" cy="340" r="8" fill="#8A63D2"/>
    <circle cx="310" cy="340" r="8" fill="#8A63D2"/>
    <circle cx="350" cy="340" r="8" fill="#8A63D2"/>
    <circle cx="370" cy="340" r="8" fill="#8A63D2"/>
    <text x="600" y="150" font-family="Arial, sans-serif" font-size="48" font-weight="bold" fill="white" text-anchor="middle">CAST ALOUD</text>
    <text x="600" y="220" font-family="Arial, sans-serif" font-size="24" fill="white" text-anchor="middle">Voice Accessibility for Farcaster</text>
    <text x="600" y="320" font-family="Arial, sans-serif" font-size="20" fill="white" text-anchor="middle">Listen to casts and reply with your voice</text>
    <text x="600" y="380" font-family="Arial, sans-serif" font-size="18" fill="white" text-anchor="middle">@${authorStr}: ${contentStr.substring(0, 60)}${contentStr.length > 60 ? '...' : ''}</text>
    <rect x="450" y="450" width="120" height="40" rx="20" fill="white"/>
    <text x="510" y="475" font-family="Arial, sans-serif" font-size="16" fill="#8A63D2" text-anchor="middle">Listen</text>
    <rect x="590" y="450" width="140" height="40" rx="20" fill="white"/>
    <text x="660" y="475" font-family="Arial, sans-serif" font-size="16" fill="#8A63D2" text-anchor="middle">Voice Reply</text>
    <rect x="750" y="450" width="120" height="40" rx="20" fill="white"/>
    <text x="810" y="475" font-family="Arial, sans-serif" font-size="16" fill="#8A63D2" text-anchor="middle">Open App</text>
  </svg>`;

  res.setHeader('Content-Type', 'image/svg+xml');
  res.setHeader('Cache-Control', 'public, max-age=3600');
  res.send(svg);
}