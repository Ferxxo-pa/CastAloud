import https from 'https';

const options = {
  hostname: 'castaloud.replit.app',
  path: '/.well-known/farcaster.json',
  method: 'GET',
  headers: {
    'Cache-Control': 'no-cache',
    'Pragma': 'no-cache',
    'User-Agent': 'FarcasterValidator'
  }
};

const req = https.request(options, (res) => {
  console.log('Status Code:', res.statusCode);
  console.log('Content-Type:', res.headers['content-type']);
  console.log('Cache-Control:', res.headers['cache-control']);
  
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log('\nRaw Response:');
    console.log(data);
    
    try {
      const manifest = JSON.parse(data);
      console.log('\nManifest Analysis:');
      console.log('- Name:', manifest.name);
      console.log('- Version:', manifest.version);
      console.log('- Tagline:', `"${manifest.tagline}" (${manifest.tagline?.length || 0} chars)`);
      console.log('- Subtitle:', `"${manifest.subtitle}" (${manifest.subtitle?.length || 0} chars)`);
      console.log('- Primary Category:', manifest.primaryCategory);
      console.log('- Icon URL:', manifest.iconUrl);
      console.log('- Home URL:', manifest.homeUrl);
      console.log('- Splash Image URL:', manifest.splashImageUrl);
      console.log('- Required Capabilities:', manifest.requiredCapabilities);
      console.log('- Required Chains:', manifest.requiredChains);
      
      // Validation checks
      const errors = [];
      if (!manifest.version) errors.push('Missing version');
      if (!manifest.name) errors.push('Missing name');
      if (!manifest.iconUrl) errors.push('Missing iconUrl');
      if (!manifest.homeUrl) errors.push('Missing homeUrl');
      if (!manifest.tagline) errors.push('Missing tagline');
      if (manifest.tagline && manifest.tagline.length > 30) errors.push('Tagline too long');
      if (manifest.subtitle && manifest.subtitle.length > 30) errors.push('Subtitle too long');
      
      console.log('\nValidation Results:');
      if (errors.length === 0) {
        console.log('✅ All required fields present and valid');
      } else {
        console.log('❌ Validation errors:');
        errors.forEach(error => console.log(`   - ${error}`));
      }
      
    } catch (e) {
      console.log('❌ JSON Parse Error:', e.message);
    }
  });
});

req.on('error', (e) => {
  console.log('❌ Request Error:', e.message);
});

req.setTimeout(10000, () => {
  req.destroy();
  console.log('❌ Request timeout');
});

req.end();