import https from 'https';
import fs from 'fs';

// Read the static file directly
const staticContent = fs.readFileSync('./public/.well-known/farcaster.json', 'utf8');
console.log('Static file content:');
console.log(staticContent);
console.log('\n--- vs ---\n');

// Get the live response
const options = {
  hostname: 'castaloud.replit.app',
  path: '/.well-known/farcaster.json',
  method: 'GET'
};

const req = https.request(options, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log('Live response:');
    console.log(data);
    
    try {
      const staticJson = JSON.parse(staticContent);
      const liveJson = JSON.parse(data);
      
      console.log('\nField comparison:');
      Object.keys(liveJson).forEach(key => {
        if (!staticJson.hasOwnProperty(key)) {
          console.log(`Extra field in live response: ${key} = ${liveJson[key]}`);
        }
      });
    } catch (e) {
      console.log('Error comparing:', e.message);
    }
  });
});

req.on('error', console.error);
req.end();