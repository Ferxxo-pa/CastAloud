#!/usr/bin/env node

import https from 'https';

function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          body: data
        });
      });
    });
    
    req.on('error', reject);
    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('Timeout'));
    });
  });
}

async function checkProduction() {
  console.log('Checking production deployment...\n');
  
  try {
    // Check main page
    console.log('1. Testing main page...');
    const mainPage = await makeRequest('https://castaloud.replit.app/');
    console.log(`Status: ${mainPage.status}`);
    console.log(`Content-Type: ${mainPage.headers['content-type']}`);
    
    if (mainPage.body.includes('id="root"')) {
      console.log('✓ Root div found');
    } else {
      console.log('✗ Root div missing');
    }
    
    if (mainPage.body.includes('main.tsx')) {
      console.log('✓ React entry point referenced');
    } else {
      console.log('✗ React entry point missing');
    }
    
    if (mainPage.body.includes('vite')) {
      console.log('✓ Vite development mode active');
    } else {
      console.log('? Production build (no Vite references)');
    }
    
    console.log('\n2. Checking for errors in HTML...');
    if (mainPage.body.includes('error') || mainPage.body.includes('Error')) {
      console.log('⚠ Error references found in HTML');
    } else {
      console.log('✓ No error references in HTML');
    }
    
    console.log('\n3. Testing React entry point...');
    try {
      const reactEntry = await makeRequest('https://castaloud.replit.app/src/main.tsx');
      console.log(`React entry status: ${reactEntry.status}`);
      if (reactEntry.status === 200) {
        console.log('✓ React entry point accessible');
      } else {
        console.log('✗ React entry point not accessible');
      }
    } catch (error) {
      console.log('✗ React entry point error:', error.message);
    }
    
    console.log('\n4. Testing CSS...');
    try {
      const css = await makeRequest('https://castaloud.replit.app/src/index.css');
      console.log(`CSS status: ${css.status}`);
      if (css.status === 200) {
        console.log('✓ CSS file accessible');
      } else {
        console.log('✗ CSS file not accessible');
      }
    } catch (error) {
      console.log('✗ CSS error:', error.message);
    }
    
    console.log('\n5. Testing manifest...');
    try {
      const manifest = await makeRequest('https://castaloud.replit.app/manifest.json');
      console.log(`Manifest status: ${manifest.status}`);
      if (manifest.status === 200) {
        const manifestData = JSON.parse(manifest.body);
        console.log(`✓ Manifest loads: ${manifestData.name}`);
      } else {
        console.log('✗ Manifest not accessible');
      }
    } catch (error) {
      console.log('✗ Manifest error:', error.message);
    }
    
    console.log('\n6. Full HTML sample (first 500 chars):');
    console.log(mainPage.body.substring(0, 500) + '...');
    
  } catch (error) {
    console.error('Production check failed:', error.message);
  }
}

checkProduction();