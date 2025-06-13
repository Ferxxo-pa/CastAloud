import https from 'https';

// Test various aspects of Farcaster manifest validation
async function testManifestValidation() {
  console.log('🔍 Testing Farcaster Manifest Validation\n');
  
  // Test 1: Check if manifest is accessible
  console.log('1. Testing manifest accessibility...');
  const manifestUrl = 'https://castaloud.replit.app/.well-known/farcaster.json';
  
  try {
    const response = await fetchWithHeaders(manifestUrl);
    console.log(`   Status: ${response.status}`);
    console.log(`   Content-Type: ${response.headers['content-type']}`);
    console.log(`   Content-Length: ${response.headers['content-length']}`);
    
    if (response.status === 200) {
      console.log('   ✅ Manifest accessible');
    } else {
      console.log('   ❌ Manifest not accessible');
      return;
    }
  } catch (error) {
    console.log(`   ❌ Error accessing manifest: ${error.message}`);
    return;
  }
  
  // Test 2: Validate JSON structure
  console.log('\n2. Testing JSON structure...');
  try {
    const response = await fetchManifest(manifestUrl);
    const manifest = JSON.parse(response.body);
    console.log('   ✅ Valid JSON structure');
    
    // Test 3: Check required fields for Farcaster
    console.log('\n3. Checking required fields...');
    const requiredFields = [
      'version',
      'name', 
      'iconUrl',
      'homeUrl',
      'splashImageUrl',
      'splashBackgroundColor',
      'tagline',
      'primaryCategory'
    ];
    
    const missingFields = requiredFields.filter(field => !manifest[field]);
    if (missingFields.length === 0) {
      console.log('   ✅ All required fields present');
    } else {
      console.log(`   ❌ Missing fields: ${missingFields.join(', ')}`);
    }
    
    // Test 4: Check field constraints
    console.log('\n4. Checking field constraints...');
    const constraints = [];
    
    if (manifest.tagline && manifest.tagline.length > 30) {
      constraints.push(`Tagline too long: ${manifest.tagline.length}/30`);
    }
    
    if (manifest.subtitle && manifest.subtitle.length > 30) {
      constraints.push(`Subtitle too long: ${manifest.subtitle.length}/30`);
    }
    
    const validCategories = [
      'communication', 'defi', 'developer-tools', 'entertainment',
      'finance', 'gaming', 'lifestyle', 'productivity', 'social',
      'sports', 'utility'
    ];
    
    if (manifest.primaryCategory && !validCategories.includes(manifest.primaryCategory)) {
      constraints.push(`Invalid primaryCategory: ${manifest.primaryCategory}`);
    }
    
    if (constraints.length === 0) {
      console.log('   ✅ All constraints satisfied');
    } else {
      console.log('   ❌ Constraint violations:');
      constraints.forEach(c => console.log(`      - ${c}`));
    }
    
    // Test 5: Check URLs are accessible
    console.log('\n5. Testing URL accessibility...');
    const urlsToTest = [
      { name: 'iconUrl', url: manifest.iconUrl },
      { name: 'homeUrl', url: manifest.homeUrl },
      { name: 'splashImageUrl', url: manifest.splashImageUrl }
    ];
    
    for (const { name, url } of urlsToTest) {
      try {
        const response = await fetchWithHeaders(url);
        if (response.status === 200) {
          console.log(`   ✅ ${name}: ${url} (${response.status})`);
        } else {
          console.log(`   ❌ ${name}: ${url} (${response.status})`);
        }
      } catch (error) {
        console.log(`   ❌ ${name}: ${url} (Error: ${error.message})`);
      }
    }
    
    // Test 6: Check if home URL serves HTML
    console.log('\n6. Testing home URL content...');
    try {
      const homeResponse = await fetchWithHeaders(manifest.homeUrl);
      const contentType = homeResponse.headers['content-type'] || '';
      if (contentType.includes('text/html')) {
        console.log('   ✅ Home URL serves HTML content');
      } else {
        console.log(`   ❌ Home URL content type: ${contentType}`);
      }
    } catch (error) {
      console.log(`   ❌ Error checking home URL: ${error.message}`);
    }
    
    console.log('\n📋 Current Manifest Summary:');
    console.log(`   Name: ${manifest.name}`);
    console.log(`   Version: ${manifest.version}`);
    console.log(`   Tagline: "${manifest.tagline}" (${manifest.tagline?.length || 0} chars)`);
    console.log(`   Primary Category: ${manifest.primaryCategory}`);
    console.log(`   Required Capabilities: ${manifest.requiredCapabilities?.length || 0} items`);
    
  } catch (error) {
    console.log(`   ❌ JSON parsing error: ${error.message}`);
  }
}

function fetchWithHeaders(url) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      path: urlObj.pathname + urlObj.search,
      method: 'GET',
      headers: {
        'User-Agent': 'FarcasterValidator/1.0',
        'Accept': '*/*'
      }
    };
    
    const req = https.request(options, (res) => {
      resolve({
        status: res.statusCode,
        headers: res.headers
      });
    });
    
    req.on('error', reject);
    req.setTimeout(5000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
    req.end();
  });
}

function fetchManifest(url) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      path: urlObj.pathname,
      method: 'GET',
      headers: {
        'User-Agent': 'FarcasterValidator/1.0',
        'Accept': 'application/json'
      }
    };
    
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          body: data
        });
      });
    });
    
    req.on('error', reject);
    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
    req.end();
  });
}

testManifestValidation().catch(console.error);