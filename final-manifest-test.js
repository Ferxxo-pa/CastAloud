#!/usr/bin/env node

import https from 'https';

function testFinalManifest() {
  console.log('Testing updated Farcaster manifest...\n');
  
  https.get('https://castaloud.replit.app/.well-known/farcaster.json', (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      try {
        const manifest = JSON.parse(data);
        
        console.log('✅ Manifest Structure Validation:');
        console.log('  - Name:', manifest.name);
        console.log('  - Description:', manifest.description.substring(0, 50) + '...');
        console.log('  - Home URL:', manifest.homeUrl);
        console.log('  - Background:', manifest.backgroundColor);
        
        // Verify account association
        if (manifest.accountAssociation) {
          const { header, payload, signature } = manifest.accountAssociation;
          
          try {
            const headerData = JSON.parse(Buffer.from(header, 'base64').toString());
            const payloadData = JSON.parse(Buffer.from(payload, 'base64').toString());
            
            console.log('\n✅ Account Association:');
            console.log('  - FID:', headerData.fid);
            console.log('  - Type:', headerData.type);
            console.log('  - Domain:', payloadData.domain);
            console.log('  - Signature length:', signature.length);
            console.log('  - Signature format:', signature.startsWith('0x') ? 'Valid hex' : 'Invalid');
            
          } catch (e) {
            console.log('❌ Account association decode error:', e.message);
          }
        }
        
        // Verify frame capabilities
        if (manifest.frame) {
          console.log('\n✅ Frame Configuration:');
          console.log('  - Required capabilities:', manifest.frame.requiredCapabilities.join(', '));
          console.log('  - Required chains:', manifest.frame.requiredChains.length);
        }
        
        console.log('\n📝 Manifest ready for Farcaster validation');
        
      } catch (e) {
        console.log('❌ JSON Error:', e.message);
      }
    });
  }).on('error', err => {
    console.log('❌ Request failed:', err.message);
  });
}

testFinalManifest();