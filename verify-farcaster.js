#!/usr/bin/env node

import https from 'https';
import fs from 'fs';

const baseUrl = 'https://castaloud.replit.app';

function checkEndpoint(path, expectedType = 'json') {
  return new Promise((resolve) => {
    https.get(`${baseUrl}${path}`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const result = {
            path,
            status: res.statusCode,
            contentType: res.headers['content-type'],
            valid: res.statusCode === 200
          };
          
          if (expectedType === 'json' && res.statusCode === 200) {
            const parsed = JSON.parse(data);
            result.data = parsed;
            result.valid = true;
          }
          
          resolve(result);
        } catch (e) {
          resolve({
            path,
            status: res.statusCode,
            error: e.message,
            valid: false
          });
        }
      });
    }).on('error', (e) => {
      resolve({
        path,
        error: e.message,
        valid: false
      });
    });
  });
}

async function verifyFarcasterIntegration() {
  console.log('🔍 Verifying Farcaster Mini App Integration...\n');
  
  const endpoints = [
    '/.well-known/farcaster.json',
    '/manifest.json',
    '/favicon.png',
    '/icon.png',
    '/splash.png',
    '/og-image.png'
  ];
  
  for (const endpoint of endpoints) {
    const expectedType = endpoint.endsWith('.png') ? 'image' : 'json';
    const result = await checkEndpoint(endpoint, expectedType);
    
    const status = result.valid ? '✅' : '❌';
    console.log(`${status} ${endpoint} - Status: ${result.status || 'Error'}`);
    
    if (result.error) {
      console.log(`   Error: ${result.error}`);
    }
    
    if (result.data && endpoint === '/.well-known/farcaster.json') {
      console.log(`   Name: ${result.data.name}`);
      console.log(`   Home URL: ${result.data.homeUrl}`);
      console.log(`   Account Association: ${result.data.accountAssociation.header ? 'Configured' : 'Pending'}`);
    }
    
    console.log('');
  }
  
  // Check if files exist locally
  console.log('📁 Local File Check:');
  const localFiles = [
    'server/public/.well-known/farcaster.json',
    'server/public/icon.png',
    'server/public/splash.png'
  ];
  
  localFiles.forEach(file => {
    const exists = fs.existsSync(file);
    console.log(`${exists ? '✅' : '❌'} ${file}`);
  });
}

verifyFarcasterIntegration().catch(console.error);