import fetch from 'node-fetch';

async function analyzeProduction() {
  try {
    const response = await fetch('https://castaloud.replit.app/', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; ProductionAnalyzer/1.0)'
      }
    });
    
    const html = await response.text();
    
    console.log('=== PRODUCTION DEPLOYMENT ANALYSIS ===\n');
    
    // Check if it's serving the correct HTML
    console.log('1. HTML Structure Analysis:');
    console.log('- Has DOCTYPE:', html.includes('<!DOCTYPE html>'));
    console.log('- Has root div:', html.includes('id="root"'));
    console.log('- Has React script:', html.includes('main.tsx') || html.includes('main.js'));
    console.log('- Has Vite client:', html.includes('@vite/client'));
    console.log('- Content length:', html.length, 'characters');
    
    console.log('\n2. Script Tags Found:');
    const scriptMatches = html.match(/<script[^>]*>/g) || [];
    scriptMatches.forEach((script, i) => {
      console.log(`  ${i + 1}. ${script}`);
    });
    
    console.log('\n3. React Entry Point:');
    const reactScript = html.match(/<script[^>]*src="[^"]*main\.[^"]*"[^>]*>/);
    if (reactScript) {
      console.log('  Found:', reactScript[0]);
    } else {
      console.log('  ❌ NO REACT ENTRY POINT FOUND');
    }
    
    console.log('\n4. Potential Issues:');
    if (html.includes('Failed to load')) {
      console.log('  ⚠️  "Failed to load" errors detected');
    }
    if (html.includes('404')) {
      console.log('  ⚠️  404 errors detected');
    }
    if (html.includes('500')) {
      console.log('  ⚠️  500 server errors detected');
    }
    if (html.includes('MIME type')) {
      console.log('  ⚠️  MIME type errors detected');
    }
    
    console.log('\n5. First 1000 characters of HTML:');
    console.log('---');
    console.log(html.substring(0, 1000));
    console.log('---');
    
    console.log('\n6. Last 500 characters of HTML:');
    console.log('---');
    console.log(html.substring(html.length - 500));
    console.log('---');
    
  } catch (error) {
    console.error('Analysis failed:', error.message);
  }
}

analyzeProduction();