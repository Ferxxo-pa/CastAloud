# Export Instructions for Cast Aloud

## Quick Export Methods

### Method 1: Replit Download
1. Click the three dots menu (⋯) next to "Cast Aloud" project name
2. Select "Download as ZIP"
3. Extract and share the ZIP file with another AI agent

### Method 2: Copy Project Structure
Share this file tree with key files:

```
Cast Aloud/
├── package.json (dependencies)
├── client/
│   ├── index.html (Frame meta tags + favicon)
│   ├── src/
│   │   ├── main.tsx (React entry)
│   │   ├── App.tsx (routing)
│   │   ├── index.css (purple theme + white backgrounds)
│   │   ├── pages/
│   │   │   ├── home-simple.tsx (main accessibility interface)
│   │   │   └── cast-aloud.tsx (advanced features)
│   │   ├── components/ (VoiceSettings, UI components)
│   │   ├── hooks/ (TTS, speech synthesis)
│   │   └── lib/ (API utilities)
│   └── public/favicon.png (Cast Aloud logo)
├── server/
│   ├── index.ts (Express setup)
│   ├── routes.ts (API endpoints + TTS)
│   ├── frame.ts (Farcaster Frame system)
│   └── storage.ts (in-memory data)
├── shared/schema.ts (Drizzle database types)
└── Config files (tailwind, vite, etc.)
```

### Method 3: Key Files to Share
For minimal setup, share these essential files:
- `server/routes.ts` (complete API + TTS implementation)
- `server/frame.ts` (5-step Frame workflow)
- `client/src/pages/home-simple.tsx` (main accessibility UI)
- `client/src/hooks/useSpeechSynthesis.ts` (voice controls)
- `package.json` (all dependencies)
- `client/index.html` (Frame integration)

## Environment Setup
The new AI agent needs:
```
OPENAI_API_KEY=your_key_here
NEYNAR_API_KEY=your_key_here
```

## Important Implementation Notes

### Core Features Implemented
- Real OpenAI TTS audio generation (not browser synthesis)
- 5-step accessibility workflow (paste → listen → type → AI help → copy)
- Complete Farcaster Frame with visual step progression
- Red stop buttons for all voice tests
- White backgrounds (no yellow screens)
- Purple theme matching Farcaster brand
- AI text polishing and feedback

### Critical Technical Details
- Express server serves both API and frontend
- Frame images generated as SVG with proper 1.91:1 aspect ratio
- TTS endpoint at `/api/tts` returns actual MP3 audio files
- Frame actions follow POST/redirect pattern for Farcaster clients
- In-memory storage with proper TypeScript types
- All test voice buttons toggle to red "Stop" state

### Deployment Ready
- Manifest at `/manifest.json` for Mini App submission
- Proper favicon and meta tags
- Service worker for offline functionality
- Frame testing URL: `/frame`
- Production domain: `castaloud.replit.app`

This is a complete, production-ready accessibility solution for Farcaster with genuine TTS capabilities and AI writing assistance.