#!/usr/bin/env node

import https from 'https';

console.log('🔍 FARCASTER STRICT VALIDATION TEST\n');

function testManifestStrict(url) {
  return new Promise((resolve) => {
    const req = https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log('📋 RESPONSE ANALYSIS:');
        console.log(`Status: ${res.statusCode}`);
        console.log(`Content-Type: ${res.headers['content-type']}`);
        console.log(`Content-Length: ${res.headers['content-length']}`);
        console.log(`Server: ${res.headers['server'] || 'Not specified'}`);
        console.log(`X-Powered-By: ${res.headers['x-powered-by'] || 'Not specified'}`);
        
        // Check for any Farcaster-specific validation issues
        console.log('\n📝 RAW RESPONSE:');
        console.log(data);
        
        try {
          const manifest = JSON.parse(data);
          
          console.log('\n🔬 STRICT FARCASTER VALIDATION:');
          
          // 1. Exact field requirements
          const requiredFields = ['name', 'description', 'homeUrl', 'iconUrl'];
          const missingFields = requiredFields.filter(field => !manifest.hasOwnProperty(field));
          
          if (missingFields.length > 0) {
            console.log('❌ Missing required fields:', missingFields);
          } else {
            console.log('✅ All required fields present');
          }
          
          // 2. Field value validation
          console.log('\n📏 FIELD VALUE VALIDATION:');
          
          // Name validation
          if (manifest.name && manifest.name.length > 0 && manifest.name.length <= 100) {
            console.log(`✅ name: "${manifest.name}" (${manifest.name.length} chars)`);
          } else {
            console.log(`❌ name: Invalid length or empty`);
          }
          
          // Description validation
          if (manifest.description && manifest.description.length > 0 && manifest.description.length <= 1000) {
            console.log(`✅ description: Valid (${manifest.description.length} chars)`);
          } else {
            console.log(`❌ description: Invalid length or empty`);
          }
          
          // URL validation
          const urlPattern = /^https:\/\/.+/;
          if (manifest.homeUrl && urlPattern.test(manifest.homeUrl)) {
            console.log(`✅ homeUrl: ${manifest.homeUrl}`);
          } else {
            console.log(`❌ homeUrl: Must be HTTPS URL`);
          }
          
          if (manifest.iconUrl && urlPattern.test(manifest.iconUrl)) {
            console.log(`✅ iconUrl: ${manifest.iconUrl}`);
          } else {
            console.log(`❌ iconUrl: Must be HTTPS URL`);
          }
          
          // 3. Optional fields validation
          console.log('\n🎨 OPTIONAL FIELDS:');
          if (manifest.splashImageUrl) {
            if (urlPattern.test(manifest.splashImageUrl)) {
              console.log(`✅ splashImageUrl: ${manifest.splashImageUrl}`);
            } else {
              console.log(`❌ splashImageUrl: Must be HTTPS URL`);
            }
          }
          
          if (manifest.backgroundColor) {
            const colorPattern = /^#[0-9A-Fa-f]{6}$/;
            if (colorPattern.test(manifest.backgroundColor)) {
              console.log(`✅ backgroundColor: ${manifest.backgroundColor}`);
            } else {
              console.log(`❌ backgroundColor: Must be hex color (#RRGGBB)`);
            }
          }
          
          // 4. Check for forbidden fields
          const allowedFields = ['name', 'description', 'homeUrl', 'iconUrl', 'splashImageUrl', 'backgroundColor'];
          const extraFields = Object.keys(manifest).filter(key => !allowedFields.includes(key));
          
          if (extraFields.length > 0) {
            console.log('\n❌ FORBIDDEN FIELDS DETECTED:');
            extraFields.forEach(field => {
              console.log(`  - ${field}: ${JSON.stringify(manifest[field])}`);
            });
          } else {
            console.log('\n✅ No forbidden fields');
          }
          
          // 5. JSON structure validation
          console.log('\n🔧 JSON STRUCTURE:');
          console.log(`✅ Valid JSON: ${typeof manifest === 'object'}`);
          console.log(`✅ Object type: ${Array.isArray(manifest) ? 'Array (❌ Should be Object)' : 'Object'}`);
          
          resolve(manifest);
          
        } catch (e) {
          console.log('\n❌ JSON PARSING ERROR:');
          console.log(e.message);
          console.log('\nRaw response:', data);
          resolve(null);
        }
      });
    });
    
    req.on('error', (e) => {
      console.log('❌ REQUEST ERROR:', e.message);
      resolve(null);
    });
    
    req.setTimeout(10000, () => {
      console.log('❌ REQUEST TIMEOUT');
      req.destroy();
      resolve(null);
    });
  });
}

async function testAssetReachability(url, name) {
  return new Promise((resolve) => {
    const req = https.get(url, (res) => {
      const status = res.statusCode;
      const contentType = res.headers['content-type'];
      
      if (status === 200) {
        console.log(`✅ ${name}: Accessible (${contentType})`);
        resolve(true);
      } else {
        console.log(`❌ ${name}: HTTP ${status}`);
        resolve(false);
      }
    });
    
    req.on('error', (e) => {
      console.log(`❌ ${name}: ${e.message}`);
      resolve(false);
    });
    
    req.setTimeout(5000, () => {
      console.log(`❌ ${name}: Timeout`);
      req.destroy();
      resolve(false);
    });
  });
}

async function runStrictValidation() {
  const manifestUrl = 'https://castaloud.replit.app/.well-known/farcaster.json';
  
  const manifest = await testManifestStrict(manifestUrl);
  
  if (manifest) {
    console.log('\n🌐 ASSET REACHABILITY TEST:');
    await testAssetReachability(manifest.homeUrl, 'Home URL');
    await testAssetReachability(manifest.iconUrl, 'Icon URL');
    if (manifest.splashImageUrl) {
      await testAssetReachability(manifest.splashImageUrl, 'Splash Image URL');
    }
    
    console.log('\n📋 SUMMARY:');
    console.log('If validation still fails, possible causes:');
    console.log('1. Cache: Farcaster may be using cached invalid version');
    console.log('2. Network: Farcaster servers cannot reach your deployment');
    console.log('3. Timing: Request timeout during validation');
    console.log('4. Headers: Content-Type or CORS issues');
    console.log('5. Redirects: Farcaster may not follow redirects');
    
    console.log('\n🔧 RECOMMENDED ACTIONS:');
    console.log('1. Wait 5-10 minutes for cache invalidation');
    console.log('2. Ensure deployment is stable and accessible');
    console.log('3. Test manifest URL in incognito browser');
    console.log('4. Check Farcaster documentation for recent changes');
  }
}

runStrictValidation();