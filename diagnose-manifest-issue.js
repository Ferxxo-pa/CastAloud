#!/usr/bin/env node

import https from 'https';

console.log('🔍 DIAGNOSING MANIFEST VALIDATION ISSUE\n');

// Test the live manifest
function testManifest(url) {
  return new Promise((resolve) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const manifest = JSON.parse(data);
          console.log('📊 LIVE MANIFEST ANALYSIS:');
          console.log('Status Code:', res.statusCode);
          console.log('Content-Type:', res.headers['content-type']);
          console.log('Content-Length:', res.headers['content-length']);
          console.log('Cache-Control:', res.headers['cache-control']);
          console.log('\nManifest Content:');
          console.log(JSON.stringify(manifest, null, 2));
          
          // Check for validation issues
          console.log('\n🔍 VALIDATION CHECKS:');
          
          // Required fields
          const required = ['name', 'description', 'homeUrl', 'iconUrl'];
          required.forEach(field => {
            const present = manifest.hasOwnProperty(field);
            console.log(`${field}: ${present ? '✅' : '❌'} ${present ? manifest[field] : 'MISSING'}`);
          });
          
          // Extra fields check
          const expected = ['name', 'description', 'homeUrl', 'iconUrl', 'splashImageUrl', 'backgroundColor'];
          const extra = Object.keys(manifest).filter(key => !expected.includes(key));
          if (extra.length > 0) {
            console.log('\n❌ EXTRA FIELDS DETECTED:');
            extra.forEach(field => {
              console.log(`  - ${field}: ${manifest[field]}`);
            });
          } else {
            console.log('\n✅ No extra fields detected');
          }
          
          // URL validation
          console.log('\n🔗 URL VALIDATION:');
          if (manifest.homeUrl) {
            console.log(`homeUrl: ${manifest.homeUrl.startsWith('https://') ? '✅' : '❌'} ${manifest.homeUrl}`);
          }
          if (manifest.iconUrl) {
            console.log(`iconUrl: ${manifest.iconUrl.startsWith('https://') ? '✅' : '❌'} ${manifest.iconUrl}`);
          }
          
          resolve(manifest);
        } catch (e) {
          console.log('❌ JSON PARSE ERROR:', e.message);
          console.log('Raw response:', data);
          resolve(null);
        }
      });
    }).on('error', (e) => {
      console.log('❌ REQUEST ERROR:', e.message);
      resolve(null);
    });
  });
}

// Test asset accessibility
function testAsset(url, name) {
  return new Promise((resolve) => {
    https.get(url, (res) => {
      console.log(`${name}: ${res.statusCode === 200 ? '✅' : '❌'} ${res.statusCode} (${res.headers['content-type']})`);
      resolve(res.statusCode === 200);
    }).on('error', (e) => {
      console.log(`${name}: ❌ ERROR - ${e.message}`);
      resolve(false);
    });
  });
}

async function runDiagnosis() {
  const manifestUrl = 'https://castaloud.replit.app/.well-known/farcaster.json';
  
  const manifest = await testManifest(manifestUrl);
  
  if (manifest) {
    console.log('\n🎯 ASSET ACCESSIBILITY TEST:');
    await testAsset(manifest.iconUrl, 'Icon');
    if (manifest.splashImageUrl) {
      await testAsset(manifest.splashImageUrl, 'Splash Image');
    }
    
    console.log('\n🚨 POSSIBLE ISSUES:');
    console.log('1. Check if _timestamp field is present (development plugin issue)');
    console.log('2. Verify all URLs are accessible');
    console.log('3. Ensure Content-Type is application/json');
    console.log('4. Check for any trailing commas or malformed JSON');
    console.log('5. Verify manifest is served from correct path');
  }
  
  console.log('\n💡 TROUBLESHOOTING STEPS:');
  console.log('1. Deploy to production to remove development middleware');
  console.log('2. Test manifest URL directly in browser');
  console.log('3. Use Farcaster Frame validator tool');
  console.log('4. Check network logs for any redirect issues');
}

runDiagnosis();