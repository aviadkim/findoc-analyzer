/**
 * UI Components Verification Script
 * This script checks if the UI components JavaScript and CSS files are correctly loaded
 */

const http = require('http');
const fs = require('fs');

// List of files to check
const filesToCheck = [
  '/js/ui-components.js',
  '/js/ui-components-simple.js', 
  '/js/ui-components-enhanced.js',
  '/css/ui-components.css',
  '/ui-components-validation.html'
];

// List of pages to check
const pagesToCheck = [
  '/',
  '/upload.html',
  '/test.html',
  '/document-details.html'
];

// Results storage
const results = {
  files: {},
  pages: {}
};

// Check if file exists
function checkFile(file) {
  return new Promise((resolve) => {
    const options = {
      hostname: 'localhost',
      port: 9090,
      path: file,
      method: 'HEAD'
    };
    
    const req = http.request(options, (res) => {
      results.files[file] = {
        exists: res.statusCode === 200,
        status: res.statusCode
      };
      resolve();
    });
    
    req.on('error', (error) => {
      console.error(`Error checking ${file}:`, error.message);
      results.files[file] = {
        exists: false,
        error: error.message
      };
      resolve();
    });
    
    req.end();
  });
}

// Check if UI components are loaded on page
function checkPage(page) {
  return new Promise((resolve) => {
    const options = {
      hostname: 'localhost',
      port: 9090,
      path: page,
      method: 'GET'
    };
    
    const req = http.request(options, (res) => {
      let body = '';
      
      res.on('data', (chunk) => {
        body += chunk;
      });
      
      res.on('end', () => {
        // Check if UI components scripts are loaded
        const hasUIComponents = body.includes('ui-components.js');
        const hasUIComponentsSimple = body.includes('ui-components-simple.js');
        const hasUIComponentsEnhanced = body.includes('ui-components-enhanced.js');
        const hasUIComponentsCSS = body.includes('ui-components.css');
        
        // Check if UI elements are present
        const hasChatButton = body.includes('show-chat-btn');
        const hasProcessButton = body.includes('process-document-btn');
        const hasAgentCards = body.includes('agent-card');
        
        results.pages[page] = {
          status: res.statusCode,
          size: body.length,
          hasUIComponents,
          hasUIComponentsSimple,
          hasUIComponentsEnhanced,
          hasUIComponentsCSS,
          hasChatButton,
          hasProcessButton,
          hasAgentCards,
        };
        
        resolve();
      });
    });
    
    req.on('error', (error) => {
      console.error(`Error checking ${page}:`, error.message);
      results.pages[page] = {
        exists: false,
        error: error.message
      };
      resolve();
    });
    
    req.end();
  });
}

// Run all checks
async function runChecks() {
  console.log('Checking UI Components files...');
  
  // Check files
  for (const file of filesToCheck) {
    await checkFile(file);
  }
  
  console.log('Checking pages for UI Components...');
  
  // Check pages
  for (const page of pagesToCheck) {
    await checkPage(page);
  }
  
  // Print results
  console.log('\n======================================================');
  console.log('  UI COMPONENTS VERIFICATION RESULTS');
  console.log('======================================================\n');
  
  console.log('UI Component Files:');
  for (const file in results.files) {
    const result = results.files[file];
    if (result.exists) {
      console.log(`✅ ${file} - Status: ${result.status}`);
    } else {
      console.log(`❌ ${file} - Status: ${result.status || 'Error'}`);
      if (result.error) {
        console.log(`   Error: ${result.error}`);
      }
    }
  }
  
  console.log('\nPages with UI Components:');
  for (const page in results.pages) {
    const result = results.pages[page];
    console.log(`\nPage: ${page}`);
    
    if (result.error) {
      console.log(`❌ Error: ${result.error}`);
      continue;
    }
    
    console.log(`Status: ${result.status}, Size: ${result.size} bytes`);
    console.log('Scripts:');
    console.log(`${result.hasUIComponents ? '✅' : '❌'} ui-components.js`);
    console.log(`${result.hasUIComponentsSimple ? '✅' : '❌'} ui-components-simple.js`);
    console.log(`${result.hasUIComponentsEnhanced ? '✅' : '❌'} ui-components-enhanced.js`);
    console.log(`${result.hasUIComponentsCSS ? '✅' : '❌'} ui-components.css`);
    
    console.log('UI Elements:');
    console.log(`${result.hasChatButton ? '✅' : '❌'} Chat Button`);
    console.log(`${result.hasProcessButton ? '✅' : '❌'} Process Button`);
    console.log(`${result.hasAgentCards ? '✅' : '❌'} Agent Cards`);
  }
  
  // Save results to file
  fs.writeFileSync('ui-components-verification-results.json', JSON.stringify(results, null, 2));
  console.log('\nResults saved to ui-components-verification-results.json');
}

// Run the verification
runChecks().catch(console.error);