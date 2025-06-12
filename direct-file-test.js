#!/usr/bin/env node

import fs from 'fs';
import https from 'https';

// Test the actual file contents vs what's being served
console.log('Testing file contents vs served content...\n');

// Read the static file directly
const staticFile = JSON.parse(fs.readFileSync('./public/.well-known/farcaster.json', 'utf8'));
console.log('Static file tagline:', `"${staticFile.tagline}" (${staticFile.tagline.length} chars)`);

// Test what the server is actually serving
https.get(`https://castaloud.replit.app/.well-known/farcaster.json?nocache=${Date.now()}`, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    try {
      const served = JSON.parse(data);
      console.log('Served tagline:', `"${served.tagline}" (${served.tagline.length} chars)`);
      console.log('Match:', staticFile.tagline === served.tagline);
      
      if (staticFile.tagline !== served.tagline) {
        console.log('\nMismatch detected! Static file is not being served.');
        console.log('This suggests there is a route handler overriding the static file.');
      } else {
        console.log('\nStatic file is being served correctly.');
      }
    } catch (e) {
      console.log('Error parsing served content:', e.message);
    }
  });
}).on('error', (e) => {
  console.log('Error fetching served content:', e.message);
});