import https from 'https';

async function testManifestDirect() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'castaloud.replit.app',
      path: '/.well-known/farcaster.json',
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
        console.log('Raw Response:');
        console.log(data);
        
        try {
          const manifest = JSON.parse(data);
          console.log('\nParsed Manifest:');
          console.log(JSON.stringify(manifest, null, 2));
          
          console.log('\nValidation Check:');
          console.log('name:', manifest.name ? '✅' : '❌ MISSING');
          console.log('iconUrl:', manifest.iconUrl ? '✅' : '❌ MISSING');
          console.log('homeUrl:', manifest.homeUrl ? '✅' : '❌ MISSING');
          console.log('version:', manifest.version ? '✅' : '❌ MISSING');
          
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

testManifestDirect().catch(console.error);