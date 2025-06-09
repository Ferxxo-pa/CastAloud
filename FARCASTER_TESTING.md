# Farcaster Testing Guide for Cast Aloud

## Pre-Deployment Checklist

### 1. Frame Validation
- [ ] Frame metadata loads at `/frame`
- [ ] Image generates at `/api/frame/image?state=initial`
- [ ] Manifest available at `/manifest.json`
- [ ] All three buttons configured: Listen, Voice Reply, Open App
- [ ] Post URL points to `/api/frame/action`

### 2. Required Environment Variables
- [ ] `OPENAI_API_KEY` - For TTS and transcription
- [ ] `NEYNAR_API_KEY` - For Farcaster cast extraction

### 3. Deploy to Production
```bash
# Click "Deploy" in Replit
# Select "Autoscale" deployment
# Note your public URL: https://your-app.replit.app
```

## Farcaster Testing Steps

### Frame Validator Testing
1. Go to [Farcaster Frame Validator](https://warpcast.com/~/developers/frames)
2. Enter your Frame URL: `https://your-app.replit.app/frame`
3. Verify all metadata displays correctly
4. Test button interactions
5. Check image renders properly

### Warpcast Testing
1. Create a test cast with your Frame URL
2. Verify Frame preview appears
3. Test "Listen" button functionality
4. Test "Voice Reply" button
5. Test "Open App" button redirects correctly

### Mini App Registration
1. Submit at [Farcaster Developer Portal](https://docs.farcaster.xyz/developers/frames/spec)
2. Provide:
   - App URL: `https://your-app.replit.app`
   - Manifest URL: `https://your-app.replit.app/manifest.json`
   - Description: "Accessibility tools for voice-enabled Farcaster interaction"
   - Category: Accessibility/Social

## Testing Endpoints

### Core Frame Endpoints
```bash
# Main Frame
curl https://your-app.replit.app/frame

# Frame Image
curl https://your-app.replit.app/api/frame/image?state=initial

# Mini App Manifest
curl https://your-app.replit.app/manifest.json

# App Icon
curl https://your-app.replit.app/icon.png
```

### Voice API Endpoints
```bash
# Extract cast content
curl -X POST https://your-app.replit.app/api/extract-cast \
  -H "Content-Type: application/json" \
  -d '{"url": "https://warpcast.com/username/0x12345"}'

# Test TTS
curl -X POST https://your-app.replit.app/api/tts \
  -H "Content-Type: application/json" \
  -d '{"text": "Hello from Cast Aloud"}'
```

## Expected Frame Behavior

### Button 1: Listen (🔊)
- Action: POST to `/api/frame/action`
- Response: Updated Frame showing "Reading Cast Aloud..."
- Image: Audio visualization with stop/back buttons

### Button 2: Voice Reply (🎤)
- Action: POST to `/api/frame/action`
- Response: Voice recording interface
- Link: Opens voice recorder at `/voice-recorder`

### Button 3: Open App (⚙️)
- Action: Link to main app
- Target: `https://your-app.replit.app`
- Opens: Full Cast Aloud interface

## Troubleshooting

### Frame Not Loading
- Check HTTPS is enabled (automatic on Replit)
- Verify Frame metadata syntax
- Confirm image URL returns valid SVG

### API Errors
- Check environment variables are set
- Verify OpenAI API key has sufficient credits
- Confirm Neynar API key is valid

### Voice Features Not Working
- Ensure microphone permissions granted
- Check browser compatibility (Chrome/Edge recommended)
- Verify TTS endpoint responds correctly

## Success Criteria

- [ ] Frame loads and displays correctly in Warpcast
- [ ] All three buttons respond appropriately
- [ ] Voice features work in full app
- [ ] Text extraction from Farcaster URLs functional
- [ ] AI text polishing operational
- [ ] Persistent voice settings saved

## Post-Launch Monitoring

- Monitor Frame interaction rates
- Track voice feature usage
- Collect accessibility feedback
- Monitor API response times
- Check error logs for issues

## Support Resources

- [Farcaster Frame Spec](https://docs.farcaster.xyz/reference/frames/spec)
- [Warpcast Developer Docs](https://warpcast.com/~/developers)
- [Frame Debugger Tool](https://warpcast.com/~/developers/frames)