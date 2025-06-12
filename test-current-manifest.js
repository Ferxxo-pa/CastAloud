#!/usr/bin/env node

import https from 'https';

console.log('Testing current manifest structure...\n');

https.get('https://castaloud.replit.app/.well-known/farcaster.json', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log('HTTP Status:', res.statusCode);
    console.log('Content-Type:', res.headers['content-type']);
    console.log('Cache-Control:', res.headers['cache-control']);
    
    try {
      const manifest = JSON.parse(data);
      console.log('\n✅ Valid JSON received');
      console.log('Current manifest structure:');
      console.log(JSON.stringify(manifest, null, 2));
      
      // Validate required fields
      const requiredFields = ['version', 'name', 'iconUrl', 'homeUrl'];
      console.log('\nRequired field validation:');
      requiredFields.forEach(field => {
        if (manifest[field]) {
          console.log(`✅ ${field}: ${manifest[field]}`);
        } else {
          console.log(`❌ Missing: ${field}`);
        }
      });
      
      // Check frame structure
      if (manifest.frame) {
        console.log('\n✅ Frame object present');
        console.log('Frame contents:', JSON.stringify(manifest.frame, null, 2));
      } else {
        console.log('\n❌ No frame object found');
      }
      
    } catch (e) {
      console.log('\n❌ JSON Parse Error:', e.message);
      console.log('Raw response (first 500 chars):', data.substring(0, 500));
    }
  });
}).on('error', err => {
  console.log('❌ Request failed:', err.message);
});