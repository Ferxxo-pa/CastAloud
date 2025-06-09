# Deploy Cast Aloud to Farcaster

## Step 1: Deploy on Replit (2 minutes)

1. Click the **Deploy** button in your Replit workspace
2. Select **Autoscale** deployment option
3. Wait for deployment to complete
4. Copy your public URL: `https://your-repl-name.replit.app`

## Step 2: Test Frame Endpoints (1 minute)

Visit these URLs to verify everything works:
- `https://your-repl-name.replit.app/frame` - Frame loads with buttons
- `https://your-repl-name.replit.app/manifest.json` - Mini App config
- `https://your-repl-name.replit.app/api/frame/image?state=initial` - Frame image

## Step 3: Validate with Farcaster (2 minutes)

1. Go to [Warpcast Frame Validator](https://warpcast.com/~/developers/frames)
2. Enter: `https://your-repl-name.replit.app/frame`
3. Verify Frame preview displays correctly
4. Check all three buttons appear: Listen, Voice Reply, Open App

## Step 4: Test in Warpcast (3 minutes)

1. Create a cast with your Frame URL
2. Verify Frame appears in cast preview
3. Test button interactions work
4. Confirm "Open App" redirects to full interface

## Step 5: Submit for Review (5 minutes)

Submit to Farcaster for Mini App approval:
- **App Name**: Cast Aloud
- **URL**: `https://your-repl-name.replit.app`
- **Manifest**: `https://your-repl-name.replit.app/manifest.json`
- **Category**: Accessibility Tools
- **Description**: "Voice accessibility tools for Farcaster. Listen to casts aloud and reply using voice with AI text enhancement. Designed for users with reading and writing difficulties."

## Ready Features

✓ Frame with proper metadata and buttons
✓ Mini App manifest with domain detection
✓ Voice-to-text transcription with OpenAI Whisper
✓ Text-to-speech with browser API and OpenAI TTS
✓ AI-powered reply polishing with GPT-4o
✓ Persistent voice settings with localStorage
✓ Official Farcaster brand colors and design
✓ Full accessibility compliance

## Environment Variables Already Set

✓ `OPENAI_API_KEY` - For TTS and text processing
✓ `NEYNAR_API_KEY` - For Farcaster cast extraction

Your app will work immediately after deployment with no additional configuration needed.