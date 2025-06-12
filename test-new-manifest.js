#!/usr/bin/env node

import https from 'https';

function testNewManifest() {
  console.log('Testing new Farcaster manifest format...\n');
  
  https.get('https://castaloud.replit.app/.well-known/farcaster.json', (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      try {
        const manifest = JSON.parse(data);
        
        console.log('Response status:', res.statusCode);
        console.log('Content-Type:', res.headers['content-type']);
        
        if (manifest.frame) {
          console.log('✅ New format detected');
          console.log('Frame version:', manifest.frame.version);
          console.log('Frame name:', manifest.frame.name);
          console.log('Frame homeUrl:', manifest.frame.homeUrl);
          console.log('Required capabilities:', manifest.frame.requiredCapabilities?.join(', '));
          console.log('Primary category:', manifest.frame.primaryCategory);
        } else {
          console.log('❌ Old format still cached');
          console.log('Top-level keys:', Object.keys(manifest));
        }
        
      } catch (e) {
        console.log('❌ JSON Parse Error:', e.message);
        console.log('Raw response (first 200 chars):', data.substring(0, 200));
      }
    });
  }).on('error', err => {
    console.log('❌ Request failed:', err.message);
  });
}

testNewManifest();