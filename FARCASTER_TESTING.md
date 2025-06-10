# Cast Aloud - Farcaster Testing Guide

## Prerequisites
1. Deploy the app to get a public URL (use Replit Deploy button)
2. Ensure OPENAI_API_KEY and NEYNAR_API_KEY are set in environment

## Testing Steps

### 1. Frame Validation
After deployment, test these endpoints:

**Frame Entry Point:**
```
https://your-app.replit.app/frame
```

**Manifest:**
```
https://your-app.replit.app/manifest.json
```

**Frame Image:**
```
https://your-app.replit.app/api/frame/image?state=initial
```

### 2. Farcaster Frame Validator
1. Go to: https://warpcast.com/~/developers/frames
2. Enter your frame URL: `https://your-app.replit.app/frame`
3. Check that all metadata displays correctly:
   - Title: "Cast Aloud - Voice Accessibility for Farcaster"
   - Image: Shows Cast Aloud branding with purple gradient
   - Buttons: "🔊 Listen", "🎤 Voice Reply", "⚙️ Open App"

### 3. Test Frame Interactions
The Frame should respond to button clicks:
- **Listen Button**: Changes image to show "Reading Cast Aloud..."
- **Voice Reply Button**: Shows voice reply interface
- **Open App Button**: Opens the full miniapp interface

### 4. Test in Warpcast
**Method 1 - Share Frame URL:**
1. Create a cast in Warpcast
2. Include your frame URL: `https://your-app.replit.app/frame`
3. The cast should show your Frame with interactive buttons

**Method 2 - Developer Mode:**
1. Go to: `https://warpcast.com/~/developers/frames?url=https://your-app.replit.app/frame`
2. Test Frame interactions in the developer interface

### 5. Test Miniapp Features
Once the Frame opens your app:
- Test voice settings persistence
- Try "Read Cast Aloud" functionality  
- Test voice reply recording and transcription
- Verify AI text polishing works
- Check accessibility features (keyboard navigation, screen reader compatibility)

### 6. Production Submission
For live deployment:
1. Go to: https://warpcast.com/~/developers/miniapps
2. Submit manifest URL: `https://your-app.replit.app/manifest.json`
3. Include in submission:
   - Purpose: Accessibility tool for users with reading/writing difficulties
   - Features: Voice synthesis, speech recognition, AI text enhancement
   - Target audience: Users needing accessibility support on Farcaster

## Troubleshooting

**Frame Not Loading:**
- Check that `/frame` endpoint returns proper HTML with meta tags
- Verify image URLs are accessible publicly
- Ensure CORS headers are set correctly

**Buttons Not Working:**
- Check `/api/frame/action` endpoint handles POST requests
- Verify webhook responses match Farcaster Frame spec
- Test button actions return proper Frame HTML responses

**Voice Features Not Working:**
- Confirm OpenAI API key is valid and has TTS/Whisper access
- Check browser permissions for microphone access
- Verify audio endpoints return proper MIME types

## Expected Behavior

**Initial Frame View:**
- Purple gradient background with Farcaster colors
- Cast Aloud branding and description
- Three interactive buttons
- Sample cast content displayed

**After Button Clicks:**
- Listen: Shows audio playing animation
- Voice Reply: Shows recording interface  
- Open App: Launches full miniapp in iframe/new window

**Miniapp Interface:**
- Homepage with voice settings
- Cast extraction from Farcaster URLs
- Text-to-speech playback controls
- Voice recording and AI enhancement features
- Settings persistence across sessions

The app is specifically designed for accessibility, so ensure all features work without visual interface requirements.