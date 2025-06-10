# Cast Aloud Mini App - Testing & Deployment Guide

## Testing Your Mini App

### 1. Local Testing
Your app is running at: `https://castaloud.replit.app`

**Test the full web interface:**
- Navigate to the home page
- Paste Farcaster content 
- Click "Read Aloud" to test TTS
- Type replies and test AI polishing
- Verify the complete 5-step workflow

### 2. Frame Testing
**Frame URL:** `https://castaloud.replit.app/frame`

**Test in Warpcast:**
1. Open Warpcast mobile app
2. Create a new cast or reply
3. Paste your Frame URL: `https://castaloud.replit.app/frame`
4. Publish the cast
5. Click on the Frame to test the 5-step workflow:
   - Step 1: Paste content in input field
   - Step 2: Click "Read Aloud" button
   - Step 3: Type your reply
   - Step 4: Get AI feedback or polish
   - Step 5: Copy improved reply

### 3. API Testing
Test individual endpoints:
```bash
# Test TTS endpoint
curl "https://castaloud.replit.app/api/tts?text=Hello world"

# Test manifest
curl "https://castaloud.replit.app/manifest.json"

# Test Frame image
curl "https://castaloud.replit.app/api/frame/image"
```

## Deployment Process

### 1. Replit Deployment
Your app is already deployed on Replit at `castaloud.replit.app`

**To make it production-ready:**
1. Click "Deploy" in your Replit project
2. Choose "Autoscale Deployment" for reliability
3. Your app will get a permanent domain

### 2. Mini App Submission
**Prerequisites:**
- Farcaster account with FID
- Verified domain ownership
- Working Frame implementation

**Submission steps:**
1. **Update manifest** with your real Farcaster details:
   - Replace placeholder FID in `accountAssociation`
   - Add your actual signature
   
2. **Verify domain ownership** by serving manifest at:
   `https://castaloud.replit.app/manifest.json`

3. **Submit to Farcaster:**
   - Visit the Farcaster Mini Apps submission portal
   - Provide your domain and manifest URL
   - Complete verification process

### 3. Account Association
You need to associate your domain with your Farcaster account:

1. **Generate account association:**
   - Use your Farcaster FID
   - Sign a message proving domain ownership
   - Update the manifest with real values

2. **Current manifest location:**
   `https://castaloud.replit.app/manifest.json`

## Production Checklist

### Required Updates
- [ ] Replace placeholder FID with your actual Farcaster ID
- [ ] Generate real account association signature
- [ ] Test all Frame interactions work correctly
- [ ] Verify TTS audio generation works
- [ ] Test AI text polishing functionality
- [ ] Confirm Warpcast integration works

### Optional Enhancements
- [ ] Add analytics tracking
- [ ] Implement user feedback collection
- [ ] Add more voice options
- [ ] Create tutorial or help section

## Accessibility Features Verification

Your app provides genuine accessibility support:

1. **Text-to-Speech:** Real audio generation using OpenAI TTS
2. **AI Writing Help:** Grammar and clarity improvements
3. **Step-by-step workflow:** Guided process for users with difficulties
4. **Direct Warpcast integration:** One-click posting of improved replies

## Troubleshooting

**Frame not loading:**
- Check Frame meta tags in HTML
- Verify image generation works
- Test button actions respond correctly

**TTS not working:**
- Confirm OpenAI API key is set
- Check audio file generation
- Verify CORS headers for audio requests

**AI features failing:**
- Validate OpenAI API key permissions
- Check text polishing responses
- Monitor API rate limits

## Next Steps

1. Test the complete workflow in Warpcast
2. Update manifest with your real Farcaster account details  
3. Submit for Mini App directory inclusion
4. Share with the accessibility community for feedback

Your Cast Aloud app is ready for testing and provides real accessibility value through voice technology and AI assistance.