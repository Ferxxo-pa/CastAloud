#!/usr/bin/env node

import https from 'https';

console.log('Direct manifest test with debugging...\n');

https.get('https://castaloud.replit.app/.well-known/farcaster.json', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log('Response headers:');
    Object.entries(res.headers).forEach(([key, value]) => {
      console.log(`  ${key}: ${value}`);
    });
    
    console.log('\nRaw response body:');
    console.log(data);
    
    try {
      const manifest = JSON.parse(data);
      console.log('\nParsed manifest keys:', Object.keys(manifest));
      console.log('Has frame object:', 'frame' in manifest);
      console.log('requiredCapabilities:', manifest.requiredCapabilities || 'Not found');
      console.log('frame.requiredCapabilities:', manifest.frame?.requiredCapabilities || 'Not found');
    } catch (e) {
      console.log('Parse error:', e.message);
    }
  });
}).on('error', err => {
  console.log('Request error:', err.message);
});