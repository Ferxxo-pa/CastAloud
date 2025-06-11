# Complete Farcaster Mini App Deployment Guide
## From Replit to Published Mini App

This guide will take your Cast Aloud app from `https://castaloud.replit.app/` to a fully published Farcaster Mini App.

## 1. Pre-Deployment Checklist

### ✅ Essential Requirements
- [x] **Live Replit App**: Your app is running at `https://castaloud.replit.app/`
- [x] **HTTPS Domain**: Replit provides HTTPS by default
- [x] **Frame Implementation**: Your app has working Frame endpoints
- [ ] **Account Association**: Need to generate with your Farcaster account
- [ ] **Manifest File**: Create `.well-known/farcaster.json`
- [ ] **Meta Tags**: Embed preview tags (already partially done)
- [ ] **Testing**: Verify with Warpcast tools
- [ ] **Publication**: Submit to Farcaster directory

## 2. Create Account Association

### Step 1: Get Your Farcaster Account Details
You need:
- Your Farcaster FID (Farcaster ID number)
- Your Farcaster username
- Access to Warpcast app

### Step 2: Generate Account Association
1. Open Warpcast mobile app
2. Go to Settings → Advanced → Account Association
3. Enter your domain: `castaloud.replit.app`
4. Sign the message to prove ownership
5. Copy the generated signature data

### Step 3: Alternative Method - Manual Generation
If the Warpcast tool isn't available, you can manually create:

```json
{
  "header": "base64-encoded-header",
  "payload": "base64-encoded-payload", 
  "signature": "0x-signature-from-your-wallet"
}
```

## 3. Create Farcaster Manifest

Create the file: `client/public/.well-known/farcaster.json`

```json
{
  "accountAssociation": {
    "header": "YOUR_HEADER_FROM_WARPCAST",
    "payload": "YOUR_PAYLOAD_FROM_WARPCAST",
    "signature": "YOUR_SIGNATURE_FROM_WARPCAST"
  },
  "app": {
    "name": "Cast Aloud",
    "version": "1.0.0",
    "iconUrl": "https://castaloud.replit.app/favicon.png",
    "splashImageUrl": "https://castaloud.replit.app/favicon.png",
    "homeUrl": "https://castaloud.replit.app"
  },
  "execution": {
    "mode": "frame"
  },
  "frame": {
    "version": "1",
    "imageUrl": "https://castaloud.replit.app/api/frame/image",
    "buttonUrl": "https://castaloud.replit.app/api/frame/action",
    "homeUrl": "https://castaloud.replit.app/frame"
  },
  "webhookUrl": "https://castaloud.replit.app/api/webhook",
  "metadata": {
    "name": "Cast Aloud",
    "description": "Voice accessibility tools for reading and replying to Farcaster casts using AI-powered text-to-speech and writing assistance",
    "longDescription": "Cast Aloud revolutionizes Farcaster accessibility through advanced voice technologies. Users can listen to casts with natural text-to-speech, type replies with AI grammar assistance, and engage with social content through a guided 5-step workflow designed for people with reading and writing difficulties.",
    "imageUrl": "https://castaloud.replit.app/favicon.png",
    "url": "https://castaloud.replit.app"
  }
}
```

## 4. Update Meta Tags for Better Embeds

Your HTML head should include:

```html
<!-- Farcaster Frame Meta Tags -->
<meta name="fc:frame" content="vNext" />
<meta name="fc:frame:title" content="Cast Aloud - Voice Accessibility" />
<meta name="fc:frame:image" content="https://castaloud.replit.app/api/frame/image?state=initial" />
<meta name="fc:frame:image:aspect_ratio" content="1.91:1" />
<meta name="fc:frame:button:1" content="🔊 Listen to Cast" />
<meta name="fc:frame:button:1:action" content="post" />
<meta name="fc:frame:button:2" content="🎤 Voice Reply" />
<meta name="fc:frame:button:2:action" content="post" />
<meta name="fc:frame:button:3" content="📱 Open Mini App" />
<meta name="fc:frame:button:3:action" content="link" />
<meta name="fc:frame:button:3:target" content="https://castaloud.replit.app" />
<meta name="fc:frame:post_url" content="https://castaloud.replit.app/api/frame/action" />

<!-- Open Graph for general sharing -->
<meta property="og:title" content="Cast Aloud - Voice Accessibility for Farcaster" />
<meta property="og:description" content="Listen to casts aloud and reply using voice technology with AI assistance" />
<meta property="og:image" content="https://castaloud.replit.app/api/frame/image?state=initial" />
<meta property="og:url" content="https://castaloud.replit.app" />
<meta property="og:type" content="website" />

<!-- Farcaster Mini App specific -->
<meta name="farcaster:app" content="miniapp" />
<meta name="farcaster:title" content="Cast Aloud" />
<meta name="farcaster:description" content="Voice accessibility tools for Farcaster" />
<meta name="farcaster:icon" content="https://castaloud.replit.app/favicon.png" />
```

## 5. Set Up Webhook (Optional)

If you want notifications when users interact with your Mini App:

```javascript
// Add to your server routes
app.post('/api/webhook', (req, res) => {
  const { event, data } = req.body;
  
  switch(event) {
    case 'frame_button_clicked':
      console.log('User clicked button:', data);
      break;
    case 'app_opened':
      console.log('User opened Mini App:', data);
      break;
    default:
      console.log('Unknown webhook event:', event);
  }
  
  res.json({ success: true });
});
```

## 6. Replit-Specific Deployment Steps

### Permanent Domain Setup
1. In your Replit project, click "Deploy"
2. Choose "Autoscale Deployment" for reliability
3. Your app will get a permanent `.replit.app` domain
4. Update all URLs in your manifest to use the permanent domain

### Environment Variables
Ensure your secrets are properly set:
- `OPENAI_API_KEY` - for TTS functionality
- `NEYNAR_API_KEY` - for Farcaster integration

### Keep-Alive Setup
Add to your server to prevent sleeping:
```javascript
// Ping endpoint to keep Replit app alive
app.get('/ping', (req, res) => {
  res.json({ 
    status: 'alive', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});
```

## 7. Testing Your Mini App

### Frame Validator Testing
1. Visit: https://warpcast.com/~/developers/frames
2. Enter your Frame URL: `https://castaloud.replit.app/frame`
3. Test all button interactions
4. Verify image loads properly
5. Check button actions work

### Warpcast Mini App Embed Tool
1. Open Warpcast mobile app
2. Create a new cast
3. Add your app URL: `https://castaloud.replit.app`
4. Verify the Frame preview appears
5. Test the complete 5-step workflow

### Share Test Cast
Create a test cast with your Frame:
```
Testing my new accessibility Mini App! 🔊

Cast Aloud helps people with reading/writing difficulties engage with Farcaster through voice technology.

Try it: https://castaloud.replit.app/frame

#accessibility #farcaster #voice
```

## 8. Manifest Validation

### Manual Verification
Visit: `https://castaloud.replit.app/.well-known/farcaster.json`
- Should return valid JSON
- No 404 errors
- All URLs should be absolute and working

### Warpcast Validation
1. Open Warpcast
2. Go to Settings → Mini Apps → Validate Manifest
3. Enter: `https://castaloud.replit.app`
4. Fix any validation errors

## 9. Final Publication Steps

### Submit to Farcaster Directory
1. Visit: https://warpcast.com/~/developers/mini-apps
2. Click "Submit Mini App"
3. Provide your domain: `castaloud.replit.app`
4. Complete the submission form:
   - App name: "Cast Aloud"
   - Description: Voice accessibility tools for Farcaster
   - Category: Accessibility/Social
   - Screenshots of your app interface

### Review Process
- Farcaster reviews submissions for quality and compliance
- Typical review time: 3-7 days
- You'll receive email notification of approval/rejection

### Post-Publication
Once approved:
- Your app appears in the Farcaster Mini App directory
- Users can discover it through search
- Monitor usage through your server logs
- Consider adding analytics to track engagement

## 10. Maintenance Checklist

### Regular Monitoring
- [ ] Check app uptime and response times
- [ ] Monitor API usage and rate limits
- [ ] Review user feedback and bug reports
- [ ] Update dependencies and security patches

### Feature Updates
- [ ] Version your releases in manifest
- [ ] Test updates thoroughly before deployment
- [ ] Maintain backward compatibility
- [ ] Document changes for users

## Troubleshooting Common Issues

### Manifest Not Loading
- Verify `.well-known` directory is publicly accessible
- Check file permissions and CORS headers
- Ensure JSON syntax is valid

### Frame Not Displaying
- Validate Frame meta tags
- Check image dimensions (1.91:1 aspect ratio)
- Verify button configurations

### Account Association Errors
- Re-generate signature with correct domain
- Ensure FID matches your Farcaster account
- Check signature format (should start with 0x)

## Success Metrics

Your Mini App is successfully deployed when:
- ✅ Manifest validates without errors
- ✅ Frame renders correctly in Warpcast
- ✅ All 5 workflow steps function properly
- ✅ TTS audio generates successfully
- ✅ AI text polishing works
- ✅ Users can complete the accessibility workflow
- ✅ App appears in Farcaster directory

Your Cast Aloud Mini App provides genuine value by making Farcaster accessible to users with reading and writing difficulties through voice technology and AI assistance.