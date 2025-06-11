# Frame Testing Guide for Cast Aloud

## Frame Validation Checklist

### 1. Frame Metadata Validation
✅ `fc:frame` meta tag present with "vNext" value
✅ `fc:frame:title` properly set
✅ `fc:frame:image` with valid image URL
✅ `fc:frame:image:aspect_ratio` set to "1.91:1"
✅ Button actions properly configured (post/link)
✅ `fc:frame:post_url` for handling interactions

### 2. Test URLs for Validation

**Main Frame Entry Point:**
```
https://your-domain.replit.app/frame
```

**Frame Image Endpoint:**
```
https://your-domain.replit.app/api/frame/image?state=initial
```

**Manifest File:**
```
https://your-domain.replit.app/manifest.json
```

### 3. Frame Interaction Flow

1. **Initial State:** Shows cast content with Listen/Voice Reply/Open App buttons
2. **Listen Action:** Displays audio playing state with additional options
3. **Voice Reply:** Shows text input for reply with AI enhancement
4. **Text Processing:** Polishes user input and provides composition link
5. **Error Handling:** Graceful fallback with retry options

### 4. Testing Tools

**Frame Validator:**
- Use Warpcast Frame validator
- Test at: frames.js validator
- Verify all metadata appears correctly

**Manual Testing:**
```bash
# Test Frame HTML
curl -s "https://your-domain.replit.app/frame" | grep "fc:frame"

# Test Frame Image
curl -I "https://your-domain.replit.app/api/frame/image?state=initial"

# Test Manifest
curl -s "https://your-domain.replit.app/manifest.json"
```

### 5. Button Functionality

**Button 1: 🔊 Listen**
- Action: POST
- Response: New frame showing audio playing state
- Links to full app for advanced controls

**Button 2: 🎤 Voice Reply**
- Action: POST  
- Response: Frame with text input for reply
- Processes input through AI enhancement

**Button 3: ⚙️ Open App**
- Action: LINK
- Target: Full Cast Aloud application
- Maintains cast context via URL parameters

### 6. Image States

- `initial`: Welcome screen with cast content
- `reading`: Audio playing indicator with controls
- `recording`: Voice reply interface
- `success`: Reply enhanced confirmation
- `error`: Error state with retry options

### 7. Expected Frame Response Format

All Frame responses must include:
- Valid HTML with proper meta tags
- 1.91:1 aspect ratio images
- Button configurations with actions
- POST URL for interactions
- Error handling for invalid states

### 8. Farcaster Client Testing

1. Deploy to public URL
2. Share Frame URL in Farcaster cast
3. Test button interactions in client
4. Verify "Open App" launches full interface
5. Confirm voice features work in miniapp context

### 9. Accessibility Compliance

- High contrast colors for visibility
- Clear button labels with emojis
- Descriptive alt text for images
- Keyboard navigation support in full app
- Screen reader compatible interface

### 10. Production Checklist

- [ ] All endpoints return valid responses
- [ ] Images generate correctly for all states
- [ ] Frame actions handle errors gracefully
- [ ] Manifest file validates correctly
- [ ] CORS headers allow Farcaster access
- [ ] API keys configured in environment
- [ ] Voice features work in production
- [ ] Frame validates in official tools