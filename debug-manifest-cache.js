#!/usr/bin/env node

import https from 'https';

// Test with different cache-busting parameters
const testUrls = [
  'https://castaloud.replit.app/.well-known/farcaster.json',
  'https://castaloud.replit.app/.well-known/farcaster.json?' + Date.now(),
  'https://castaloud.replit.app/.well-known/farcaster.json?v=' + Math.random()
];

async function testUrl(url) {
  return new Promise((resolve) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const manifest = JSON.parse(data);
          console.log(`URL: ${url}`);
          console.log(`Tagline: "${manifest.tagline}" (${manifest.tagline?.length} chars)`);
          console.log(`Cache headers: ${res.headers['cache-control']}`);
          console.log(`X-Timestamp: ${res.headers['x-timestamp']}`);
          console.log('---');
          resolve();
        } catch (e) {
          console.log(`Error parsing JSON from ${url}:`, e.message);
          resolve();
        }
      });
    }).on('error', (e) => {
      console.log(`Error fetching ${url}:`, e.message);
      resolve();
    });
  });
}

async function runTests() {
  console.log('Testing manifest caching behavior...\n');
  
  for (const url of testUrls) {
    await testUrl(url);
  }
}

runTests();