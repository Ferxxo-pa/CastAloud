import https from 'https';

function testAsset(url) {
  return new Promise((resolve) => {
    const req = https.get(url, (res) => {
      resolve({
        url,
        status: res.statusCode,
        contentType: res.headers['content-type'],
        contentLength: res.headers['content-length']
      });
    });
    req.on('error', () => {
      resolve({ url, status: 'ERROR', error: true });
    });
    req.setTimeout(5000, () => {
      req.destroy();
      resolve({ url, status: 'TIMEOUT', error: true });
    });
  });
}

async function checkAssets() {
  console.log('Testing production assets...\n');
  
  const assets = [
    'https://castaloud.replit.app/assets/index-BFSu0bea.js',
    'https://castaloud.replit.app/assets/index-B0FYYJUm.css',
    'https://castaloud.replit.app/manifest.json',
    'https://castaloud.replit.app/src/main.tsx',
    'https://castaloud.replit.app/src/index.css'
  ];
  
  for (const asset of assets) {
    const result = await testAsset(asset);
    const name = asset.split('/').pop();
    
    if (result.error) {
      console.log(`❌ ${name}: ${result.status}`);
    } else if (result.status === 200) {
      console.log(`✅ ${name}: ${result.status} (${result.contentType})`);
    } else {
      console.log(`⚠️  ${name}: ${result.status} (${result.contentType || 'unknown'})`);
    }
  }
}

checkAssets();