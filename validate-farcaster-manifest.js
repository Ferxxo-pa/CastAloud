#!/usr/bin/env node

import https from 'https';

function validateFarcasterManifest() {
  https.get('https://castaloud.replit.app/.well-known/farcaster.json', (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      try {
        const manifest = JSON.parse(data);
        console.log('✅ Valid JSON manifest retrieved');
        console.log('Manifest validation:');
        
        // Required fields according to Farcaster Mini App spec
        const requiredFields = [
          'name',
          'description', 
          'homeUrl',
          'iconUrl',
          'splashImageUrl',
          'backgroundColor'
        ];
        
        requiredFields.forEach(field => {
          if (manifest[field]) {
            console.log(`✅ ${field}: ${manifest[field]}`);
          } else {
            console.log(`❌ Missing required field: ${field}`);
          }
        });
        
        // Check frame object
        if (manifest.frame) {
          console.log('✅ frame object present');
          if (Array.isArray(manifest.frame.requiredCapabilities)) {
            console.log(`✅ requiredCapabilities: ${manifest.frame.requiredCapabilities.join(', ')}`);
          } else {
            console.log('❌ requiredCapabilities must be an array');
          }
          if (Array.isArray(manifest.frame.requiredChains)) {
            console.log(`✅ requiredChains: ${manifest.frame.requiredChains.join(', ')}`);
          } else {
            console.log('❌ requiredChains must be an array');
          }
        } else {
          console.log('❌ Missing required frame object');
        }
        
        // Check account association
        if (manifest.accountAssociation) {
          console.log('✅ accountAssociation present');
          ['header', 'payload', 'signature'].forEach(field => {
            if (manifest.accountAssociation[field]) {
              console.log(`✅ accountAssociation.${field} present`);
            } else {
              console.log(`❌ Missing accountAssociation.${field}`);
            }
          });
        } else {
          console.log('❌ Missing accountAssociation object');
        }
        
        // Check for invalid fields that might cause validation errors
        const invalidFields = ['farcaster', 'short_name', 'start_url', 'display', 'icons'];
        invalidFields.forEach(field => {
          if (manifest[field]) {
            console.log(`⚠️  Warning: ${field} field should not be in Farcaster Mini App manifest`);
          }
        });
        
      } catch (e) {
        console.log('❌ Invalid JSON:', e.message);
        console.log('Raw response:', data.substring(0, 200));
      }
    });
  }).on('error', err => {
    console.log('❌ Request failed:', err.message);
  });
}

validateFarcasterManifest();