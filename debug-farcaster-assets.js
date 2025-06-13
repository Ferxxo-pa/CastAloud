import https from 'https';

async function checkAssetAccess(url) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      path: urlObj.pathname,
      method: 'HEAD',
      headers: {
        'User-Agent': 'FarcasterValidator/1.0'
      }
    };
    
    const req = https.request(options, (res) => {
      resolve({
        url,
        status: res.statusCode,
        contentType: res.headers['content-type'],
        contentLength: res.headers['content-length']
      });
    });
    
    req.on('error', (error) => {
      resolve({
        url,
        error: error.message
      });
    });
    
    req.setTimeout(5000, () => {
      req.destroy();
      resolve({
        url,
        error: 'Timeout'
      });
    });
    
    req.end();
  });
}

async function debugAssets() {
  console.log('🔍 Debugging Farcaster Asset Access\n');
  
  const assetsToCheck = [
    'https://castaloud.replit.app/icon.png',
    'https://castaloud.replit.app/splash.png',
    'https://castaloud.replit.app/.well-known/farcaster.json',
    'https://castaloud.replit.app/',
    'https://castaloud.replit.app/manifest.json',
    'https://castaloud.replit.app/og-image.png'
  ];
  
  for (const asset of assetsToCheck) {
    const result = await checkAssetAccess(asset);
    
    if (result.error) {
      console.log(`❌ ${asset}`);
      console.log(`   Error: ${result.error}`);
    } else {
      const status = result.status === 200 ? '✅' : '❌';
      console.log(`${status} ${asset}`);
      console.log(`   Status: ${result.status}`);
      if (result.contentType) console.log(`   Content-Type: ${result.contentType}`);
      if (result.contentLength) console.log(`   Size: ${result.contentLength} bytes`);
    }
    console.log('');
  }
}

debugAssets().catch(console.error);