import https from 'https';

async function testFarcasterValidation() {
  return new Promise((resolve) => {
    const options = {
      hostname: 'castaloud.replit.app',
      path: '/.well-known/farcaster.json',
      method: 'GET',
      headers: {
        'User-Agent': 'farcaster-validator/1.0',
        'Accept': 'application/json'
      }
    };
    
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log('=== FARCASTER STRICT VALIDATION TEST ===\n');
        
        try {
          const manifest = JSON.parse(data);
          
          console.log('Raw manifest:');
          console.log(JSON.stringify(manifest, null, 2));
          console.log('');
          
          // Check required fields exactly as Farcaster expects
          const requiredFields = ['name', 'description', 'homeUrl', 'iconUrl'];
          const validationResults = {};
          
          requiredFields.forEach(field => {
            const value = manifest[field];
            const isValid = value && typeof value === 'string' && value.trim().length > 0;
            validationResults[field] = isValid;
            console.log(`${field}: ${isValid ? '✅' : '❌'} ${value || 'MISSING'}`);
          });
          
          // Check for invalid extra fields that might cause rejection
          const allowedFields = ['name', 'description', 'homeUrl', 'iconUrl', 'splashImageUrl', 'backgroundColor'];
          const extraFields = Object.keys(manifest).filter(key => !allowedFields.includes(key));
          
          console.log('\nExtra fields check:');
          if (extraFields.length > 0) {
            console.log('❌ Found extra fields:', extraFields.join(', '));
          } else {
            console.log('✅ No extra fields');
          }
          
          // URL validation
          console.log('\nURL validation:');
          const urlFields = ['homeUrl', 'iconUrl', 'splashImageUrl'];
          urlFields.forEach(field => {
            const url = manifest[field];
            if (url) {
              const isValidUrl = url.startsWith('https://') && url.includes('castaloud.replit.app');
              console.log(`${field}: ${isValidUrl ? '✅' : '❌'} ${url}`);
            }
          });
          
          const allRequired = requiredFields.every(field => validationResults[field]);
          const noExtraFields = extraFields.length === 0;
          
          console.log('\n=== FINAL VALIDATION RESULT ===');
          console.log(`All required fields present: ${allRequired ? '✅' : '❌'}`);
          console.log(`No invalid extra fields: ${noExtraFields ? '✅' : '❌'}`);
          console.log(`Overall status: ${allRequired && noExtraFields ? '✅ VALID' : '❌ INVALID'}`);
          
        } catch (e) {
          console.log('❌ JSON parsing failed:', e.message);
          console.log('Raw response:', data);
        }
        resolve();
      });
    });
    
    req.on('error', (err) => {
      console.log('❌ Request failed:', err.message);
      resolve();
    });
    req.end();
  });
}

testFarcasterValidation().catch(console.error);