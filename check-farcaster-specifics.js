#!/usr/bin/env node

import https from 'https';

console.log('🔍 CHECKING FARCASTER-SPECIFIC VALIDATION ISSUES\n');

// Test manifest from Farcaster's perspective
function testFromFarcasterPerspective(url) {
  return new Promise((resolve) => {
    const options = {
      hostname: 'castaloud.replit.app',
      path: '/.well-known/farcaster.json',
      method: 'GET',
      headers: {
        'User-Agent': 'Farcaster/1.0',
        'Accept': 'application/json',
        'Cache-Control': 'no-cache'
      },
      timeout: 10000
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log('📊 FARCASTER PERSPECTIVE TEST:');
        console.log(`Status: ${res.statusCode}`);
        console.log(`Headers:`, res.headers);
        console.log(`Response size: ${data.length} bytes`);
        
        try {
          const manifest = JSON.parse(data);
          console.log('\n✅ JSON parsed successfully');
          console.log('Manifest keys:', Object.keys(manifest));
          
          // Check exact Farcaster Mini App requirements
          console.log('\n🎯 FARCASTER MINI APP REQUIREMENTS:');
          
          // Required fields with exact validation
          const checks = [
            {
              field: 'name',
              value: manifest.name,
              valid: typeof manifest.name === 'string' && manifest.name.length > 0 && manifest.name.length <= 100,
              requirement: 'String, 1-100 characters'
            },
            {
              field: 'description',
              value: manifest.description,
              valid: typeof manifest.description === 'string' && manifest.description.length > 0 && manifest.description.length <= 1000,
              requirement: 'String, 1-1000 characters'
            },
            {
              field: 'homeUrl',
              value: manifest.homeUrl,
              valid: typeof manifest.homeUrl === 'string' && manifest.homeUrl.startsWith('https://'),
              requirement: 'HTTPS URL'
            },
            {
              field: 'iconUrl',
              value: manifest.iconUrl,
              valid: typeof manifest.iconUrl === 'string' && manifest.iconUrl.startsWith('https://'),
              requirement: 'HTTPS URL'
            }
          ];
          
          checks.forEach(check => {
            console.log(`${check.valid ? '✅' : '❌'} ${check.field}: ${check.valid ? 'Valid' : 'Invalid'} (${check.requirement})`);
            if (!check.valid) {
              console.log(`   Value: ${JSON.stringify(check.value)}`);
            }
          });
          
          // Check optional fields
          if (manifest.splashImageUrl) {
            const validSplash = typeof manifest.splashImageUrl === 'string' && manifest.splashImageUrl.startsWith('https://');
            console.log(`${validSplash ? '✅' : '❌'} splashImageUrl: ${validSplash ? 'Valid' : 'Invalid'}`);
          }
          
          if (manifest.backgroundColor) {
            const validColor = typeof manifest.backgroundColor === 'string' && /^#[0-9A-Fa-f]{6}$/.test(manifest.backgroundColor);
            console.log(`${validColor ? '✅' : '❌'} backgroundColor: ${validColor ? 'Valid' : 'Invalid'}`);
          }
          
          resolve(manifest);
          
        } catch (e) {
          console.log('❌ JSON parsing failed:', e.message);
          console.log('Raw response:', data.substring(0, 200));
          resolve(null);
        }
      });
    });

    req.on('error', (e) => {
      console.log('❌ Request failed:', e.message);
      resolve(null);
    });

    req.on('timeout', () => {
      console.log('❌ Request timed out');
      req.destroy();
      resolve(null);
    });

    req.end();
  });
}

// Test for common deployment issues
function testCommonIssues() {
  console.log('\n🔧 CHECKING COMMON DEPLOYMENT ISSUES:');
  
  // Check if the app is deployed on custom domain vs replit.app
  const currentDomain = 'castaloud.replit.app';
  console.log(`Domain: ${currentDomain}`);
  
  // Check for potential manifest path issues
  const paths = [
    '/.well-known/farcaster.json',
    '/manifest.json',
    '/farcaster.json'
  ];
  
  return Promise.all(paths.map(path => {
    return new Promise((resolve) => {
      https.get(`https://${currentDomain}${path}`, (res) => {
        console.log(`${path}: ${res.statusCode === 200 ? '✅' : '❌'} HTTP ${res.statusCode}`);
        resolve(res.statusCode === 200);
      }).on('error', () => {
        console.log(`${path}: ❌ Error`);
        resolve(false);
      });
    });
  }));
}

async function checkFarcasterSpecifics() {
  await testFromFarcasterPerspective();
  await testCommonIssues();
  
  console.log('\n💡 TROUBLESHOOTING RECOMMENDATIONS:');
  console.log('1. Try submitting manifest URL again (cache issue)');
  console.log('2. Ensure app is deployed and not in development mode');
  console.log('3. Check if manifest was working in previous deployment');
  console.log('4. Verify no recent changes to Farcaster validation rules');
  console.log('5. Test manifest in Farcaster Frame validator tool');
  
  console.log('\n🎯 NEXT STEPS:');
  console.log('If manifest appears valid but still fails:');
  console.log('- Wait 10-15 minutes for propagation');
  console.log('- Try clearing browser cache');
  console.log('- Test from different network/device');
  console.log('- Check Farcaster status/announcements');
}

checkFarcasterSpecifics();