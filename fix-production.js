import https from 'https';

async function downloadAndAnalyzeJS() {
  return new Promise((resolve, reject) => {
    https.get('https://castaloud.replit.app/assets/index-BFSu0bea.js', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log('Analyzing production JavaScript bundle...\n');
        
        // Check for common error patterns
        const issues = [];
        
        if (data.includes('import.meta.env') && !data.includes('process.env')) {
          issues.push('Environment variable access issue detected');
        }
        
        if (data.includes('/@') || data.includes('/@vite')) {
          issues.push('Development server paths in production build');
        }
        
        if (data.includes('undefined') && data.includes('import')) {
          issues.push('Undefined import references');
        }
        
        if (data.includes('Error:') || data.includes('SyntaxError:')) {
          issues.push('Syntax errors in bundle');
        }
        
        // Check for React imports
        const hasReact = data.includes('React') || data.includes('createElement');
        const hasReactDOM = data.includes('ReactDOM') || data.includes('createRoot');
        
        console.log('Bundle Analysis:');
        console.log('- Size:', data.length, 'characters');
        console.log('- Has React:', hasReact);
        console.log('- Has ReactDOM:', hasReactDOM);
        console.log('- Issues found:', issues.length);
        
        if (issues.length > 0) {
          console.log('\nIssues detected:');
          issues.forEach((issue, i) => console.log(`  ${i+1}. ${issue}`));
        }
        
        // Look for specific error patterns in first 1000 chars
        console.log('\nFirst 500 characters of bundle:');
        console.log(data.substring(0, 500));
        
        resolve({ data, issues, hasReact, hasReactDOM });
      });
    }).on('error', reject);
  });
}

async function main() {
  try {
    const analysis = await downloadAndAnalyzeJS();
    
    console.log('\n=== DIAGNOSIS ===');
    
    if (!analysis.hasReact || !analysis.hasReactDOM) {
      console.log('❌ CRITICAL: React/ReactDOM missing from bundle');
      console.log('This suggests a build configuration issue.');
    } else if (analysis.issues.length > 0) {
      console.log('⚠️  Bundle has issues that may prevent execution');
    } else {
      console.log('✅ Bundle appears structurally correct');
      console.log('Issue is likely runtime execution or DOM mounting');
    }
    
  } catch (error) {
    console.error('Analysis failed:', error.message);
  }
}

main();