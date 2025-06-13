import https from 'https';

async function testCastaloudManifest() {
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
        console.log('Updated Manifest Response:');
        console.log(data);
        
        try {
          const manifest = JSON.parse(data);
          console.log('\nValidation Check:');
          console.log('name:', manifest.name === 'Castaloud' ? '✅ Castaloud' : `❌ ${manifest.name || 'MISSING'}`);
          console.log('iconUrl:', manifest.iconUrl?.includes('castaloud-logo.png') ? '✅ New logo' : `❌ ${manifest.iconUrl || 'MISSING'}`);
          console.log('homeUrl:', manifest.homeUrl === 'https://castaloud.replit.app' ? '✅' : `❌ ${manifest.homeUrl || 'MISSING'}`);
          console.log('description:', manifest.description ? '✅' : '❌ MISSING');
          console.log('splashImageUrl:', manifest.splashImageUrl?.includes('castaloud-logo.png') ? '✅ New logo' : `❌ ${manifest.splashImageUrl || 'MISSING'}`);
          console.log('backgroundColor:', manifest.backgroundColor ? '✅' : '❌ MISSING');
          
          console.log('\nSimplified Format (no extra fields):');
          const hasExtraFields = manifest.version || manifest.tagline || manifest.primaryCategory || manifest.frame;
          console.log(hasExtraFields ? '❌ Contains extra fields' : '✅ Clean format');
          
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

testCastaloudManifest().catch(console.error);