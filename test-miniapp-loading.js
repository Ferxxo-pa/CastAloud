#!/usr/bin/env node

import https from 'https';

console.log('🔍 TESTING FARCASTER MINI APP LOADING\n');

async function testMiniAppEndpoint() {
  return new Promise((resolve) => {
    https.get('https://castaloud.replit.app/', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log('📊 MINI APP ROOT ENDPOINT:');
        console.log(`Status: ${res.statusCode}`);
        console.log(`Content-Type: ${res.headers['content-type']}`);
        console.log(`Content-Length: ${res.headers['content-length']}`);
        
        // Check if it's an HTML response
        if (res.headers['content-type']?.includes('text/html')) {
          console.log('✅ Serving HTML page');
          
          // Check for specific Farcaster Mini App indicators
          const hasMetaTags = data.includes('<meta');
          const hasViewport = data.includes('viewport');
          const hasTitle = data.includes('<title>');
          
          console.log(`Meta tags: ${hasMetaTags ? '✅' : '❌'}`);
          console.log(`Viewport: ${hasViewport ? '✅' : '❌'}`);
          console.log(`Title: ${hasTitle ? '✅' : '❌'}`);
          
          // Look for any error indicators
          if (data.includes('error') || data.includes('Error')) {
            console.log('⚠️ Potential errors in page content');
          }
          
        } else {
          console.log('❌ Not serving HTML');
          console.log('Response preview:', data.substring(0, 200));
        }
        
        resolve(res.statusCode === 200);
      });
    }).on('error', (e) => {
      console.log('❌ Request failed:', e.message);
      resolve(false);
    });
  });
}

async function testFarcasterFrameCompatibility() {
  console.log('\n🎯 FARCASTER FRAME COMPATIBILITY CHECK:');
  
  // Test with Farcaster-like headers
  const options = {
    hostname: 'castaloud.replit.app',
    path: '/',
    method: 'GET',
    headers: {
      'User-Agent': 'farcaster-miniapp-validator/1.0',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.5',
      'Accept-Encoding': 'gzip, deflate',
      'DNT': '1',
      'Connection': 'keep-alive',
      'Upgrade-Insecure-Requests': '1'
    }
  };

  return new Promise((resolve) => {
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log(`Status from Farcaster perspective: ${res.statusCode}`);
        console.log(`Response headers:`, Object.keys(res.headers).join(', '));
        
        // Check for iframe compatibility
        const hasXFrameOptions = res.headers['x-frame-options'];
        const hasCSP = res.headers['content-security-policy'];
        
        if (hasXFrameOptions) {
          console.log(`❌ X-Frame-Options: ${hasXFrameOptions} (may block iframe)`);
        } else {
          console.log('✅ No X-Frame-Options header (iframe compatible)');
        }
        
        if (hasCSP && hasCSP.includes('frame-ancestors')) {
          console.log(`⚠️ CSP frame-ancestors: ${hasCSP}`);
        } else {
          console.log('✅ No problematic CSP frame-ancestors');
        }
        
        resolve(res.statusCode === 200);
      });
    });
    
    req.on('error', (e) => {
      console.log('❌ Frame compatibility test failed:', e.message);
      resolve(false);
    });
    
    req.end();
  });
}

async function runLoadingTests() {
  const rootWorking = await testMiniAppEndpoint();
  const frameCompatible = await testFarcasterFrameCompatibility();
  
  console.log('\n📋 SUMMARY:');
  console.log(`Root endpoint: ${rootWorking ? '✅' : '❌'}`);
  console.log(`Frame compatible: ${frameCompatible ? '✅' : '❌'}`);
  
  console.log('\n💡 RECOMMENDATIONS:');
  if (!rootWorking) {
    console.log('- Fix root endpoint serving');
    console.log('- Check deployment status');
  }
  
  if (!frameCompatible) {
    console.log('- Check iframe embedding settings');
    console.log('- Verify CORS headers');
  }
  
  console.log('- Test manifest URL directly: https://castaloud.replit.app/.well-known/farcaster.json');
  console.log('- Verify all assets are accessible');
  console.log('- Check browser console for JavaScript errors');
}

runLoadingTests();