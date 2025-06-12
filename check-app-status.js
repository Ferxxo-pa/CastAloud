#!/usr/bin/env node

import https from 'https';

async function checkAppStatus() {
  return new Promise((resolve) => {
    https.get('https://castaloud.replit.app/', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log('App Status Check:');
        console.log(`Status: ${res.statusCode}`);
        console.log(`Content-Type: ${res.headers['content-type']}`);
        console.log(`Response size: ${data.length} bytes`);
        
        if (res.statusCode === 200) {
          if (data.includes('<title>')) {
            console.log('✅ App is loading HTML');
          } else {
            console.log('❌ No HTML title found');
          }
          
          if (data.includes('script')) {
            console.log('✅ JavaScript files present');
          } else {
            console.log('❌ No JavaScript found');
          }
          
          if (data.includes('error') || data.includes('Error')) {
            console.log('⚠️ Potential errors in response');
          } else {
            console.log('✅ No obvious errors');
          }
          
          console.log('\nFirst 500 characters:');
          console.log(data.substring(0, 500));
        } else {
          console.log('❌ HTTP error:', res.statusCode);
        }
        
        resolve(res.statusCode === 200);
      });
    }).on('error', (e) => {
      console.log('❌ Request failed:', e.message);
      resolve(false);
    });
  });
}

checkAppStatus();