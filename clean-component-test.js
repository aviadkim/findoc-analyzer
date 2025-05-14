/**
 * FinDoc Analyzer Component Analysis Test
 * This script checks for critical UI components across the application
 */

const http = require('http');

// Configuration
const config = {
  baseUrl: 'http://localhost:8080',
  results: {
    total: 0,
    found: 0,
    missing: 0,
    components: []
  }
};

// Test a component
async function testComponent(page, componentName, selectors) {
  console.log(`Testing ${componentName} on ${page}...`);
  
  return new Promise((resolve) => {
    const url = page === 'homepage' ? config.baseUrl : `${config.baseUrl}/${page}`;
    
    const options = { 
      hostname: 'localhost', 
      port: 8080, 
      path: page === 'homepage' ? '/' : `/${page}`, 
      method: 'GET' 
    };
    
    const req = http.request(options, res => {
      let data = '';
      
      res.on('data', chunk => {
        data += chunk;
      });
      
      res.on('end', () => {
        config.results.total++;
        
        let found = false;
        
        for (const selector of selectors) {
          if (data.includes(selector)) {
            found = true;
            break;
          }
        }
        
        if (found) {
          config.results.found++;
          console.log(`✅ FOUND: ${componentName} on ${page}`);
        } else {
          config.results.missing++;
          console.log(`❌ MISSING: ${componentName} on ${page}`);
        }
        
        config.results.components.push({
          page,
          component: componentName,
          found,
          selectors
        });
        
        resolve(found);
      });
    });
    
    req.on('error', error => {
      console.error(`Error testing ${componentName} on ${page}:`, error.message);
      config.results.total++;
      config.results.missing++;
      
      config.results.components.push({
        page,
        component: componentName,
        found: false,
        error: error.message,
        selectors
      });
      
      resolve(false);
    });
    
    req.end();
  });
}

// Run all tests
async function runTests() {
  console.log('Starting Component Analysis Test');
  console.log('---------------------------------');
  
  // Homepage Tests
  console.log('\n1. HOMEPAGE COMPONENTS');
  console.log('---------------------------------');
  await testComponent('homepage', 'Process Button', ['process-document-btn', 'floating-process-btn', 'Process Document']);
  await testComponent('homepage', 'Chat Button', ['show-chat-btn', 'chat-button', '>Chat<']);
  await testComponent('homepage', 'Sidebar Navigation', ['class="sidebar"', 'sidebar-nav']);
  
  // Upload Page Tests
  console.log('\n2. UPLOAD PAGE COMPONENTS');
  console.log('---------------------------------');
  await testComponent('upload', 'Process Button', ['process-document-btn', 'floating-process-btn', 'Process Document']);
  await testComponent('upload', 'Chat Container', ['document-chat-container', 'chat-container']);
  await testComponent('upload', 'File Input', ['file-input', 'input type="file"']);
  await testComponent('upload', 'Upload Button', ['upload-btn', 'button class="btn']);
  
  // Documents Page Tests
  console.log('\n3. DOCUMENTS PAGE COMPONENTS');
  console.log('---------------------------------');
  await testComponent('documents-new', 'Document Cards/List', ['document-card', 'document-list', 'document-grid']);
  await testComponent('documents-new', 'Chat Button', ['show-chat-btn', 'chat-button', '>Chat<']);
  
  // Print Summary
  const successRate = Math.round((config.results.found / config.results.total) * 100);
  
  console.log('\n\nCOMPONENT ANALYSIS SUMMARY');
  console.log('---------------------------------');
  console.log(`Total Components Checked: ${config.results.total}`);
  console.log(`Components Found: ${config.results.found}`);
  console.log(`Components Missing: ${config.results.missing}`);
  console.log(`Success Rate: ${successRate}%`);
  
  // Group results by page
  const pageResults = {};
  
  for (const component of config.results.components) {
    if (!pageResults[component.page]) {
      pageResults[component.page] = {
        total: 0,
        found: 0,
        missing: 0
      };
    }
    
    pageResults[component.page].total++;
    if (component.found) {
      pageResults[component.page].found++;
    } else {
      pageResults[component.page].missing++;
    }
  }
  
  console.log('\nRESULTS BY PAGE');
  console.log('---------------------------------');
  
  for (const page in pageResults) {
    const result = pageResults[page];
    const pageSuccessRate = Math.round((result.found / result.total) * 100);
    
    console.log(`${page}: ${result.found}/${result.total} components found (${pageSuccessRate}%)`);
  }
  
  console.log('\nMISSING COMPONENTS');
  console.log('---------------------------------');
  
  const missingComponents = config.results.components.filter(c => !c.found);
  
  if (missingComponents.length === 0) {
    console.log('No missing components! All UI elements are present.');
  } else {
    for (const component of missingComponents) {
      console.log(`- ${component.component} on ${component.page}`);
    }
  }
  
  return {
    summary: {
      total: config.results.total,
      found: config.results.found,
      missing: config.results.missing,
      successRate
    },
    pages: pageResults,
    missingComponents
  };
}

// Run the tests
runTests().catch(console.error);