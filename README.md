# Cast Aloud - Voice Accessibility for Farcaster

Cast Aloud is a Farcaster Mini App that provides voice accessibility features for users with reading and writing difficulties. Listen to casts aloud and reply using your voice with AI-powered text polishing.

## Features

- **Text-to-Speech**: Listen to any Farcaster cast using high-quality voice synthesis
- **Voice Replies**: Record voice responses and automatically convert to polished text
- **AI Text Enhancement**: Automatically improve reply clarity and tone
- **Persistent Settings**: Voice preferences saved across sessions
- **Accessibility-First Design**: Built specifically for users with reading/writing challenges
- **Farcaster Frame Integration**: Works seamlessly within Farcaster clients

## Deployment

### Quick Deploy on Replit

1. Click the "Deploy" button in your Replit workspace
2. Choose "Autoscale" for production deployment
3. Wait for deployment to complete
4. Note your public URL (e.g., `https://your-app.replit.app`)

### Environment Variables

Required environment variables:
- `OPENAI_API_KEY`: OpenAI API key for TTS and text processing
- `NEYNAR_API_KEY`: Neynar API key for Farcaster integration

### Domain Configuration

After deployment, update the manifest configuration:
1. The app automatically detects your domain
2. Frame endpoints are accessible at:
   - `/frame` - Main Frame entry point
   - `/api/frame/action` - Frame interactions
   - `/api/frame/image` - Dynamic Frame images
   - `/manifest.json` - Mini App manifest

## Farcaster Integration

### Frame Validation

Test your Frame using Farcaster's Frame validator:
1. Visit the Frame validator tool
2. Enter your deployment URL + `/frame`
3. Verify all Frame metadata is correct

### Mini App Registration

1. Submit your app to Farcaster for review
2. Provide your domain and manifest URL
3. Include accessibility justification in submission

## API Endpoints

### Frame Endpoints
- `GET /frame` - Main Frame with interactive buttons
- `POST /api/frame/action` - Handle Frame button presses
- `GET /api/frame/image` - Generate dynamic Frame images

### App API
- `POST /api/extract-cast` - Extract cast content from Farcaster URLs
- `POST /api/tts` - Generate text-to-speech audio
- `POST /api/transcribe` - Convert voice to text
- `POST /api/polish-reply` - AI-enhance reply text
- `POST /api/feedback-comment` - Get AI feedback on replies

### Voice Features
- Browser Speech Synthesis API for local TTS
- OpenAI TTS for premium voices (coming soon)
- OpenAI Whisper for accurate voice transcription

## Technology Stack

- **Frontend**: React with TypeScript, Tailwind CSS
- **Backend**: Express.js with TypeScript
- **Voice**: Web Speech API, OpenAI TTS/Whisper
- **AI**: OpenAI GPT-4o for text enhancement
- **Farcaster**: Neynar API integration
- **Storage**: In-memory with localStorage persistence

## Accessibility Features

- High contrast design with official Farcaster colors
- Keyboard navigation support
- Screen reader compatible
- Large click targets for motor accessibility
- Clear visual feedback for all interactions
- Persistent voice settings

## Development

```bash
npm install
npm run dev
```

The app runs on port 5000 with both frontend and backend served together.

## Contributing

This app is designed specifically for accessibility. When contributing:
- Test with screen readers
- Verify keyboard navigation
- Maintain high contrast ratios
- Keep interface simple and clear
- Focus on voice-first interactions

## License

MIT License - Built for accessibility and open source community.