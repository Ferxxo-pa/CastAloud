#!/usr/bin/env node

/**
 * Final Farcaster Manifest Validator
 * Tests all aspects of manifest compliance for Mini App publishing
 */

import https from 'https';
import fs from 'fs';

const MANIFEST_URL = 'https://castaloud.replit.app/.well-known/farcaster.json';

// Complete Farcaster Mini App manifest specification
const REQUIRED_FIELDS = [
  'version',
  'name', 
  'iconUrl',
  'homeUrl',
  'splashImageUrl',
  'splashBackgroundColor',
  'tagline',
  'primaryCategory'
];

const VALID_CATEGORIES = [
  'communication',
  'defi', 
  'developer-tools',
  'entertainment',
  'finance',
  'gaming',
  'lifestyle',
  'productivity',
  'social',
  'sports',
  'utility'
];

async function validateCompleteManifest() {
  console.log('🔍 Complete Farcaster Mini App Manifest Validation\n');
  
  try {
    // Test manifest accessibility
    const manifestData = await fetchManifest(MANIFEST_URL);
    
    if (manifestData.status !== 200) {
      console.log(`❌ Manifest not accessible: HTTP ${manifestData.status}`);
      return;
    }
    
    console.log('✅ Manifest accessible');
    console.log(`   Status: ${manifestData.status}`);
    console.log(`   Content-Type: ${manifestData.headers['content-type']}`);
    
    // Parse and validate JSON
    let manifest;
    try {
      manifest = JSON.parse(manifestData.body);
      console.log('✅ Valid JSON structure');
    } catch (error) {
      console.log(`❌ Invalid JSON: ${error.message}`);
      return;
    }
    
    console.log('\n📋 Current Manifest:');
    console.log(JSON.stringify(manifest, null, 2));
    
    // Validation checks
    const issues = [];
    const warnings = [];
    
    // Check required fields
    REQUIRED_FIELDS.forEach(field => {
      if (!manifest[field]) {
        issues.push(`Missing required field: ${field}`);
      }
    });
    
    // Validate field constraints
    if (manifest.tagline && manifest.tagline.length > 30) {
      issues.push(`Tagline too long: ${manifest.tagline.length}/30 characters`);
    }
    
    if (manifest.subtitle && manifest.subtitle.length > 30) {
      issues.push(`Subtitle too long: ${manifest.subtitle.length}/30 characters`);
    }
    
    if (manifest.primaryCategory && !VALID_CATEGORIES.includes(manifest.primaryCategory)) {
      issues.push(`Invalid primaryCategory: ${manifest.primaryCategory}`);
    }
    
    // Check URLs
    if (manifest.iconUrl && !isValidUrl(manifest.iconUrl)) {
      issues.push('Invalid iconUrl format');
    }
    
    if (manifest.homeUrl && !isValidUrl(manifest.homeUrl)) {
      issues.push('Invalid homeUrl format');
    }
    
    if (manifest.splashImageUrl && !isValidUrl(manifest.splashImageUrl)) {
      issues.push('Invalid splashImageUrl format');
    }
    
    // Check arrays
    if (manifest.requiredCapabilities && !Array.isArray(manifest.requiredCapabilities)) {
      issues.push('requiredCapabilities must be an array');
    }
    
    if (manifest.requiredChains && !Array.isArray(manifest.requiredChains)) {
      issues.push('requiredChains must be an array');
    }
    
    if (manifest.tags && !Array.isArray(manifest.tags)) {
      issues.push('tags must be an array');
    }
    
    // Check version format
    if (manifest.version !== "1") {
      warnings.push('Version should be "1" for Mini Apps');
    }
    
    // Check for frame property (might be required)
    if (!manifest.frame) {
      warnings.push('Missing frame property - may be required for some validators');
    }
    
    // Display results
    console.log('\n🔍 Validation Results:');
    
    if (issues.length === 0) {
      console.log('✅ All validation checks passed');
    } else {
      console.log('❌ Validation issues found:');
      issues.forEach(issue => console.log(`   • ${issue}`));
    }
    
    if (warnings.length > 0) {
      console.log('\n⚠️  Warnings:');
      warnings.forEach(warning => console.log(`   • ${warning}`));
    }
    
    // Test URL accessibility
    console.log('\n🌐 URL Accessibility Tests:');
    
    const urlTests = [
      { name: 'Icon URL', url: manifest.iconUrl },
      { name: 'Home URL', url: manifest.homeUrl },
      { name: 'Splash Image URL', url: manifest.splashImageUrl }
    ];
    
    for (const test of urlTests) {
      if (test.url) {
        try {
          const response = await testUrlAccess(test.url);
          if (response.status === 200) {
            console.log(`   ✅ ${test.name}: ${test.url}`);
          } else {
            console.log(`   ❌ ${test.name}: ${test.url} (${response.status})`);
          }
        } catch (error) {
          console.log(`   ❌ ${test.name}: ${test.url} (${error.message})`);
        }
      }
    }
    
    // Summary
    console.log('\n📊 Summary:');
    console.log(`   Name: ${manifest.name}`);
    console.log(`   Tagline: "${manifest.tagline}" (${manifest.tagline?.length || 0}/30 chars)`);
    console.log(`   Category: ${manifest.primaryCategory}`);
    console.log(`   Version: ${manifest.version}`);
    console.log(`   Capabilities: ${manifest.requiredCapabilities?.length || 0} declared`);
    
    if (issues.length === 0) {
      console.log('\n🚀 Status: READY FOR FARCASTER PUBLISHING');
    } else {
      console.log('\n❌ Status: VALIDATION ISSUES NEED RESOLUTION');
    }
    
  } catch (error) {
    console.log(`❌ Error during validation: ${error.message}`);
  }
}

function fetchManifest(url) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      path: urlObj.pathname,
      method: 'GET',
      headers: {
        'User-Agent': 'FarcasterValidator/2.0',
        'Accept': 'application/json',
        'Cache-Control': 'no-cache'
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

function testUrlAccess(url) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      path: urlObj.pathname + urlObj.search,
      method: 'HEAD',
      headers: {
        'User-Agent': 'FarcasterValidator/2.0'
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

function isValidUrl(string) {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}

validateCompleteManifest().catch(console.error);