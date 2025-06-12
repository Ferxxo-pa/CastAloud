import https from 'https';

async function testEndpoint(path, name) {
  return new Promise((resolve) => {
    const options = {
      hostname: 'castaloud.replit.app',
      path: path,
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
        console.log(`\n${name} (${path}):`);
        try {
          const manifest = JSON.parse(data);
          console.log('Name:', manifest.name);
          console.log('IconUrl:', manifest.iconUrl);
          console.log('Timestamp:', manifest._timestamp || 'none');
        } catch (e) {
          console.log('Not JSON or error:', data.substring(0, 100) + '...');
        }
        resolve();
      });
    });
    
    req.on('error', () => {
      console.log(`${name}: Connection failed`);
      resolve();
    });
    req.setTimeout(5000, () => {
      console.log(`${name}: Timeout`);
      req.destroy();
      resolve();
    });
    req.end();
  });
}

async function testAllEndpoints() {
  console.log('Testing all manifest endpoints...');
  
  await testEndpoint('/.well-known/farcaster.json', 'Standard Manifest');
  await testEndpoint('/farcaster.json', 'Alt Manifest 1');
  await testEndpoint('/manifest-v2.json', 'Alt Manifest 2');
  await testEndpoint('/farcaster-manifest', 'Server Route');
  await testEndpoint('/farcaster-manifest.json', 'Static File');
}

testAllEndpoints().catch(console.error);