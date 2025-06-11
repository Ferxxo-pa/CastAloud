# Cast Aloud - Farcaster Accessibility Mini App

## Project Overview
Cast Aloud is a comprehensive accessibility tool for Farcaster that provides voice-enabled interactions for users with reading and writing difficulties. The app follows a 5-step workflow to help users consume and respond to Farcaster content using text-to-speech and AI-powered writing assistance.

## Key Features
- **Text-to-Speech**: Real audio generation using OpenAI TTS API
- **AI Writing Assistance**: Grammar improvement and content polishing
- **5-Step Accessibility Workflow**: Guided process from content consumption to posting
- **Frame Integration**: Works within Farcaster clients as a Frame
- **Mini App Support**: Full Farcaster Mini App with manifest and service worker

## Technology Stack
- **Frontend**: React 18, TypeScript, Tailwind CSS, Wouter routing
- **Backend**: Express.js, Node.js
- **APIs**: OpenAI (TTS + GPT-4o), Neynar (Farcaster)
- **Database**: In-memory storage with Drizzle ORM schema
- **Build**: Vite, TSX
- **UI Components**: Radix UI, Lucide React icons

## Project Structure
```
├── client/
│   ├── src/
│   │   ├── components/     # UI components (VoiceSettings, etc.)
│   │   ├── hooks/         # Custom hooks (TTS, speech synthesis)
│   │   ├── lib/           # Utilities and API clients
│   │   ├── pages/         # Main app pages
│   │   └── main.tsx       # App entry point
│   ├── index.html         # HTML template with Frame meta tags
│   └── public/            # Static assets
├── server/
│   ├── index.ts          # Express server setup
│   ├── routes.ts         # API endpoints
│   ├── frame.ts          # Frame image generation and actions
│   ├── storage.ts        # In-memory data storage
│   └── vite.ts           # Vite development setup
├── shared/
│   └── schema.ts         # Drizzle database schema
└── Configuration files (package.json, tailwind.config.ts, etc.)
```

## Required Environment Variables
```
OPENAI_API_KEY=your_openai_api_key
NEYNAR_API_KEY=your_neynar_api_key
```

## Installation & Setup
1. Install dependencies: `npm install`
2. Set environment variables
3. Start development: `npm run dev`
4. Access at: `http://localhost:5000`

## Deployment URLs
- **Main App**: https://castaloud.replit.app
- **Frame URL**: https://castaloud.replit.app/frame
- **Manifest**: https://castaloud.replit.app/manifest.json

## 5-Step Accessibility Workflow
1. **Paste Content**: Enter Farcaster post URL or text
2. **Read Aloud**: Click to hear content via TTS
3. **Type Reply**: Enter response in text area
4. **AI Assistance**: Get feedback or polish text
5. **Copy & Post**: Use improved reply on Farcaster

## API Endpoints
- `GET /api/tts` - Text-to-speech audio generation
- `POST /api/polish-reply` - AI text improvement
- `POST /api/get-feedback` - AI writing feedback
- `GET /api/frame/image` - Frame image generation
- `POST /api/frame/action` - Frame button interactions
- `GET /manifest.json` - Mini App manifest

## Frame Integration
The app works as a Farcaster Frame with:
- Visual step-by-step interface
- Button interactions for each workflow step
- Image generation for different states
- Direct integration with Warpcast composer

## Key Components
- **VoiceSettings**: Browser speech synthesis controls
- **OpenAIVoiceSettings**: Premium TTS voice options
- **VoiceInterface**: Recording and playback functionality
- **Frame System**: Complete Farcaster Frame implementation

## Accessibility Features
- High contrast UI with purple/white theme
- Screen reader compatible
- Keyboard navigation support
- Voice synthesis for content consumption
- AI writing assistance for composition difficulties

## Branding
- Purple theme matching Farcaster brand (#8A63D2)
- Custom logo with speaker icon
- Consistent visual identity across all interfaces

This codebase represents a complete, production-ready accessibility solution for the Farcaster ecosystem.