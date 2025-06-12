import https from 'https';

async function testNewManifest() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'castaloud.replit.app',
      path: '/farcaster-manifest',
      method: 'GET',
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    };
    
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log('New Manifest Endpoint Response:');
        console.log(data);
        
        try {
          const manifest = JSON.parse(data);
          console.log('\nValidation Check:');
          console.log('name:', manifest.name ? '✅' : '❌ MISSING');
          console.log('iconUrl:', manifest.iconUrl ? '✅' : '❌ MISSING'); 
          console.log('homeUrl:', manifest.homeUrl ? '✅' : '❌ MISSING');
          console.log('description:', manifest.description ? '✅' : '❌ MISSING');
          console.log('splashImageUrl:', manifest.splashImageUrl ? '✅' : '❌ MISSING');
          console.log('backgroundColor:', manifest.backgroundColor ? '✅' : '❌ MISSING');
          
          console.log('\nSimplified Format Check:');
          console.log('- No version field:', !manifest.version ? '✅' : '❌');
          console.log('- No tagline field:', !manifest.tagline ? '✅' : '❌');
          console.log('- No primaryCategory field:', !manifest.primaryCategory ? '✅' : '❌');
          
        } catch (e) {
          console.log('JSON Parse Error:', e.message);
        }
        resolve();
      });
    });
    
    req.on('error', reject);
    req.end();
  });
}

testNewManifest().catch(console.error);