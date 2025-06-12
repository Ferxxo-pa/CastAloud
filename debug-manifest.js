#!/usr/bin/env node

import https from 'https';

function debugManifest() {
  https.get('https://castaloud.replit.app/manifest.json', (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      try {
        const json = JSON.parse(data);
        console.log('Manifest structure check:');
        console.log('Has frame object:', !!json.frame);
        console.log('Has farcaster object:', !!json.farcaster);
        console.log('Frame capabilities:', json.frame?.requiredCapabilities);
        console.log('Account association header:', json.accountAssociation?.header?.substring(0, 20) + '...');
      } catch (e) {
        console.log('Invalid JSON:', e.message);
      }
    });
  });
}

debugManifest();