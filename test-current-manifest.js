#!/usr/bin/env node

import https from 'https';

function testCurrentManifest() {
  https.get('https://castaloud.replit.app/.well-known/farcaster.json', (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      console.log('Status Code:', res.statusCode);
      console.log('Content-Type:', res.headers['content-type']);
      console.log('Cache-Control:', res.headers['cache-control']);
      console.log('\nResponse Body:');
      console.log(data);
      
      try {
        const manifest = JSON.parse(data);
        console.log('\n✅ Valid JSON Structure');
        console.log('\nManifest Properties:');
        console.log('- version:', manifest.version);
        console.log('- name:', manifest.name);
        console.log('- subtitle:', `"${manifest.subtitle}" (${manifest.subtitle?.length} chars)`);
        console.log('- tagline:', `"${manifest.tagline}" (${manifest.tagline?.length} chars)`);
        console.log('- primaryCategory:', manifest.primaryCategory);
        console.log('- description:', manifest.description?.substring(0, 50) + '...');
        console.log('- requiredCapabilities:', manifest.requiredCapabilities);
        console.log('- requiredChains:', manifest.requiredChains);
        
        // Check for common validation issues
        console.log('\n🔍 Validation Checks:');
        if (manifest.subtitle && manifest.subtitle.length > 30) {
          console.log('❌ Subtitle too long:', manifest.subtitle.length, 'chars');
        } else {
          console.log('✅ Subtitle length OK');
        }
        
        if (manifest.tagline && manifest.tagline.length > 30) {
          console.log('❌ Tagline too long:', manifest.tagline.length, 'chars');
        } else {
          console.log('✅ Tagline length OK');
        }
        
        const validCategories = ['games', 'social', 'finance', 'utility', 'productivity', 'health-fitness', 'news-media', 'music', 'shopping', 'education', 'developer-tools', 'entertainment', 'art-creativity'];
        if (validCategories.includes(manifest.primaryCategory)) {
          console.log('✅ Primary category valid');
        } else {
          console.log('❌ Invalid primary category:', manifest.primaryCategory);
        }
        
      } catch (e) {
        console.log('❌ JSON Parse Error:', e.message);
      }
    });
  }).on('error', (e) => {
    console.log('❌ Request Error:', e.message);
  });
}

testCurrentManifest();