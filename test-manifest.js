#!/usr/bin/env node

import https from 'https';

function testManifest() {
  return new Promise((resolve) => {
    https.get('https://castaloud.replit.app/.well-known/farcaster.json', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log('Status:', res.statusCode);
        console.log('Content-Type:', res.headers['content-type']);
        console.log('Response preview:', data.substring(0, 200));
        
        try {
          const json = JSON.parse(data);
          console.log('\n✅ Valid JSON manifest:');
          console.log('Name:', json.name);
          console.log('Description:', json.description);
          console.log('Home URL:', json.homeUrl);
          console.log('Background:', json.backgroundColor);
          console.log('Required Capabilities:', json.frame?.requiredCapabilities);
          resolve(true);
        } catch (e) {
          console.log('\n❌ Invalid JSON:', e.message);
          resolve(false);
        }
      });
    }).on('error', (e) => {
      console.log('Error:', e.message);
      resolve(false);
    });
  });
}

testManifest();