#!/usr/bin/env node

import https from 'https';

console.log('🔍 FINAL FARCASTER VALIDATION TEST\n');

async function testManifest() {
  return new Promise((resolve) => {
    https.get('https://castaloud.replit.app/.well-known/farcaster.json', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const manifest = JSON.parse(data);
          console.log('📋 MANIFEST VALIDATION:');
          console.log(`Status: ${res.statusCode}`);
          console.log(`Content-Type: ${res.headers['content-type']}`);
          console.log('Content:', JSON.stringify(manifest, null, 2));
          
          // Strict validation
          const required = ['name', 'description', 'homeUrl', 'iconUrl'];
          const valid = required.every(field => manifest[field]);
          const extraFields = Object.keys(manifest).filter(key => 
            !['name', 'description', 'homeUrl', 'iconUrl', 'splashImageUrl', 'backgroundColor'].includes(key)
          );
          
          console.log(`\nValidation: ${valid && extraFields.length === 0 ? '✅ PASS' : '❌ FAIL'}`);
          if (extraFields.length > 0) {
            console.log('Extra fields:', extraFields);
          }
          
          resolve({ valid: valid && extraFields.length === 0, manifest });
        } catch (e) {
          console.log('❌ JSON Parse Error:', e.message);
          resolve({ valid: false });
        }
      });
    }).on('error', (e) => {
      console.log('❌ Request Error:', e.message);
      resolve({ valid: false });
    });
  });
}

async function testMiniApp() {
  return new Promise((resolve) => {
    https.get('https://castaloud.replit.app/', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log('\n🎯 MINI APP VALIDATION:');
        console.log(`Status: ${res.statusCode}`);
        console.log(`Content-Type: ${res.headers['content-type']}`);
        
        const isHTML = res.headers['content-type']?.includes('text/html');
        const hasTitle = data.includes('<title>');
        const hasViewport = data.includes('viewport');
        
        console.log(`HTML Response: ${isHTML ? '✅' : '❌'}`);
        console.log(`Has Title: ${hasTitle ? '✅' : '❌'}`);
        console.log(`Has Viewport: ${hasViewport ? '✅' : '❌'}`);
        
        // Check for iframe compatibility
        const hasXFrame = res.headers['x-frame-options'];
        console.log(`Iframe Compatible: ${!hasXFrame ? '✅' : '❌'}`);
        
        resolve(res.statusCode === 200 && isHTML);
      });
    }).on('error', (e) => {
      console.log('❌ Mini App Error:', e.message);
      resolve(false);
    });
  });
}

async function testAssets(manifest) {
  if (!manifest) return false;
  
  console.log('\n🖼️ ASSET VALIDATION:');
  
  const testAsset = (url, name) => {
    return new Promise((resolve) => {
      https.get(url, (res) => {
        console.log(`${name}: ${res.statusCode === 200 ? '✅' : '❌'} (${res.statusCode})`);
        resolve(res.statusCode === 200);
      }).on('error', () => {
        console.log(`${name}: ❌ (Error)`);
        resolve(false);
      });
    });
  };
  
  const iconValid = await testAsset(manifest.iconUrl, 'Icon');
  const splashValid = manifest.splashImageUrl ? await testAsset(manifest.splashImageUrl, 'Splash') : true;
  const homeValid = await testAsset(manifest.homeUrl, 'Home URL');
  
  return iconValid && splashValid && homeValid;
}

async function runFinalValidation() {
  const manifestResult = await testManifest();
  const miniAppValid = await testMiniApp();
  const assetsValid = await testAssets(manifestResult.manifest);
  
  console.log('\n📊 FINAL VALIDATION SUMMARY:');
  console.log(`Manifest: ${manifestResult.valid ? '✅ VALID' : '❌ INVALID'}`);
  console.log(`Mini App: ${miniAppValid ? '✅ VALID' : '❌ INVALID'}`);
  console.log(`Assets: ${assetsValid ? '✅ VALID' : '❌ INVALID'}`);
  
  const allValid = manifestResult.valid && miniAppValid && assetsValid;
  
  console.log(`\n🎯 OVERALL STATUS: ${allValid ? '✅ READY FOR FARCASTER' : '❌ NEEDS FIXES'}`);
  
  if (allValid) {
    console.log('\n🚀 NEXT STEPS:');
    console.log('1. Submit manifest URL to Farcaster');
    console.log('2. Wait for validation (may take a few minutes)');
    console.log('3. If validation fails, check for cache issues');
    console.log('4. Try again with query parameter: ?v=' + Date.now());
  }
}

runFinalValidation();