import https from 'https';

async function testAssetAccess(url, name) {
  return new Promise((resolve) => {
    const options = {
      hostname: 'castaloud.replit.app',
      path: url,
      method: 'HEAD'
    };
    
    const req = https.request(options, (res) => {
      console.log(`${name}: ${res.statusCode} - ${res.headers['content-type']}`);
      resolve();
    });
    
    req.on('error', () => {
      console.log(`${name}: ERROR - Cannot access`);
      resolve();
    });
    req.end();
  });
}

async function testAllAssets() {
  console.log('Testing asset accessibility...');
  await testAssetAccess('/castaloud-logo.png', 'Castaloud Logo');
  await testAssetAccess('/icon.png', 'Original Icon');
  await testAssetAccess('/splash.png', 'Splash Image');
  await testAssetAccess('/og-image.png', 'OG Image');
}

testAllAssets().catch(console.error);