#!/usr/bin/env node

import https from 'https';

function checkFarcasterSpec() {
  https.get('https://castaloud.replit.app/.well-known/farcaster.json', (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      try {
        const manifest = JSON.parse(data);
        console.log('Farcaster Mini App Manifest Validation:\n');
        
        // Check account association format
        if (manifest.accountAssociation) {
          const { header, payload, signature } = manifest.accountAssociation;
          
          // Check if they're valid base64
          try {
            const headerDecoded = Buffer.from(header, 'base64').toString();
            console.log('Header decoded:', headerDecoded);
          } catch (e) {
            console.log('❌ Invalid base64 header');
          }
          
          try {
            const payloadDecoded = Buffer.from(payload, 'base64').toString();
            console.log('Payload decoded:', payloadDecoded);
          } catch (e) {
            console.log('❌ Invalid base64 payload');
          }
          
          // Check signature format (should be hex)
          if (signature.startsWith('0x') && signature.length > 10) {
            console.log('✅ Signature format looks valid');
          } else {
            console.log('❌ Invalid signature format - should be hex starting with 0x');
          }
        }
        
        // Check URLs are accessible
        const urlsToCheck = [
          manifest.homeUrl,
          manifest.iconUrl,
          manifest.splashImageUrl
        ];
        
        console.log('\nChecking URL accessibility:');
        urlsToCheck.forEach(url => {
          if (url) {
            https.get(url, (res) => {
              console.log(`${res.statusCode === 200 ? '✅' : '❌'} ${url} - Status: ${res.statusCode}`);
            }).on('error', () => {
              console.log(`❌ ${url} - Not accessible`);
            });
          }
        });
        
      } catch (e) {
        console.log('❌ JSON Parse Error:', e.message);
      }
    });
  });
}

checkFarcasterSpec();