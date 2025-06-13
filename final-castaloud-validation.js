import https from 'https';

async function validateCastaloudManifest() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'castaloud.replit.app',
      path: '/farcaster-manifest.json',
      method: 'GET',
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        'User-Agent': 'Farcaster-Validator/1.0'
      }
    };
    
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log('=== CASTALOUD MANIFEST VALIDATION ===\n');
        console.log('Response Status:', res.statusCode);
        console.log('Content-Type:', res.headers['content-type']);
        console.log('');
        
        try {
          const manifest = JSON.parse(data);
          
          console.log('📋 MANIFEST CONTENT:');
          console.log(JSON.stringify(manifest, null, 2));
          console.log('');
          
          console.log('✅ VALIDATION RESULTS:');
          console.log('Name:', manifest.name === 'Castaloud' ? '✅ Castaloud' : `❌ ${manifest.name || 'MISSING'}`);
          console.log('Home URL:', manifest.homeUrl === 'https://castaloud.replit.app' ? '✅' : `❌ ${manifest.homeUrl || 'MISSING'}`);
          console.log('Icon URL:', manifest.iconUrl?.includes('castaloud-logo.png') ? '✅ Castaloud logo' : `❌ ${manifest.iconUrl || 'MISSING'}`);
          console.log('Splash URL:', manifest.splashImageUrl?.includes('castaloud-logo.png') ? '✅ Castaloud logo' : `❌ ${manifest.splashImageUrl || 'MISSING'}`);
          console.log('Description:', manifest.description ? '✅' : '❌ MISSING');
          console.log('Background Color:', manifest.backgroundColor ? '✅' : '❌ MISSING');
          
          console.log('');
          console.log('🎯 FARCASTER REQUIREMENTS:');
          const hasRequiredFields = manifest.name && manifest.homeUrl && manifest.iconUrl && manifest.description;
          const hasSimpleFormat = !manifest.version && !manifest.tagline && !manifest.primaryCategory;
          
          console.log('Required fields present:', hasRequiredFields ? '✅' : '❌');
          console.log('Simple format (no extra fields):', hasSimpleFormat ? '✅' : '❌');
          console.log('Ready for Farcaster validation:', hasRequiredFields && hasSimpleFormat ? '✅ YES' : '❌ NO');
          
          if (hasRequiredFields && hasSimpleFormat) {
            console.log('\n🚀 RESULT: Castaloud manifest is ready for Farcaster Mini App publishing!');
          } else {
            console.log('\n⚠️ RESULT: Manifest needs fixes before Farcaster validation will pass.');
          }
          
        } catch (e) {
          console.log('❌ JSON Parse Error:', e.message);
          console.log('Raw response:', data.substring(0, 200));
        }
        resolve();
      });
    });
    
    req.on('error', reject);
    req.end();
  });
}

validateCastaloudManifest().catch(console.error);