#!/usr/bin/env node

import https from 'https';

function verifyManifest() {
  https.get('https://castaloud.replit.app/.well-known/farcaster.json', (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      try {
        const manifest = JSON.parse(data);
        console.log('Complete manifest structure:');
        console.log(JSON.stringify(manifest, null, 2));
        
        if (manifest.frame) {
          console.log('\nFrame object validation:');
          console.log('- version:', manifest.frame.version || 'missing');
          console.log('- name:', manifest.frame.name || 'missing');
          console.log('- iconUrl:', manifest.frame.iconUrl || 'missing');
          console.log('- homeUrl:', manifest.frame.homeUrl || 'missing');
          console.log('- description:', manifest.frame.description || 'missing');
          console.log('- requiredCapabilities:', manifest.frame.requiredCapabilities || 'missing');
        }
        
      } catch (e) {
        console.log('Parse error:', e.message);
      }
    });
  });
}

verifyManifest();