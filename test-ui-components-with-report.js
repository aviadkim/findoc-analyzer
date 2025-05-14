/**
 * UI Components Test with Detailed Report
 * Tests all UI components in the FinDoc Analyzer app
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

// Create results directory
const resultsDir = path.join(__dirname, 'ui-test-results');
if (!fs.existsSync(resultsDir)) {
  fs.mkdirSync(resultsDir);
}

// Timestamp for results
const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

// Test configuration
const config = {
  baseUrl: 'http://localhost:8080',
  components: {
    processButton: '#process-document-btn',
    uploadButton: '#upload-btn',
    chatButton: '#show-chat-btn',
    chatInput: '#document-chat-input',
    sendButton: '#document-send-btn',
    fileInput: '#file-input',
    progressBar: '#progress-bar',
    progressContainer: '#progress-container',
    uploadStatus: '#upload-status',
    documentChatContainer: '#document-chat-container',
    chatMessages: '#document-chat-messages',
    notificationContainer: '#notification-container'
  },
  pages: [
    { name: 'Home', path: '/', requiredComponents: ['chatButton', 'processButton'] },
    { name: 'Upload', path: '/upload.html', requiredComponents: ['chatButton', 'processButton', 'uploadButton', 'fileInput'] },
    { name: 'Document Details', path: '/document-details.html', requiredComponents: ['chatButton', 'chatInput', 'sendButton'] },
    { name: 'Documents', path: '/documents-new.html', requiredComponents: ['chatButton', 'processButton'] },
    { name: 'Test', path: '/test.html', requiredComponents: ['chatButton', 'processButton'] }
  ]
};

// Results collection
const testResults = {
  summary: {
    totalTests: 0,
    passedTests: 0,
    failedTests: 0,
    startTime: new Date(),
    endTime: null
  },
  pageResults: {},
  cssTests: {
    passed: [],
    failed: []
  },
  jsTests: {
    passed: [],
    failed: []
  },
  htmlTests: {
    passed: [],
    failed: []
  }
};

// Helper functions
function get(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      if (res.statusCode !== 200) {
        reject(new Error(`Request failed with status code ${res.statusCode}`));
        return;
      }
      
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data
        });
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

// Check if a component exists in the page
function checkComponentInPage(body, selector) {
  return body.includes(selector.replace('#', ''));
}

// Check CSS file for UI component styles
function checkCssForComponents(cssContent) {
  const requiredStyles = [
    { name: 'Process Button', selector: '#process-document-btn', property: 'background-color' },
    { name: 'Chat Button', selector: '#show-chat-btn', property: 'position' },
    { name: 'Chat Container', selector: '#document-chat-container', property: 'position' },
    { name: 'Progress Bar', selector: '#progress-bar', property: 'width' },
    { name: 'Chat Messages', selector: '#document-chat-messages', property: 'height' }
  ];
  
  const results = {
    passed: [],
    failed: []
  };
  
  for (const style of requiredStyles) {
    const stylePattern = new RegExp(`${style.selector}[^{]*{[^}]*${style.property}`, 'i');
    if (stylePattern.test(cssContent)) {
      results.passed.push(`${style.name} style (${style.selector}: ${style.property})`);
    } else {
      results.failed.push(`${style.name} style (${style.selector}: ${style.property})`);
    }
  }
  
  return results;
}

// Check JavaScript file for component initialization
function checkJsForComponents(jsContent) {
  const requiredCode = [
    { name: 'Process Button Initialization', pattern: 'process.*button.*init' },
    { name: 'Chat Interface Initialization', pattern: 'chat.*interface.*init' },
    { name: 'Chat Send Function', pattern: 'send.*chat.*message' },
    { name: 'Show Chat Function', pattern: 'show.*chat' },
    { name: 'Progress Animation', pattern: 'progress.*bar.*width' }
  ];
  
  const results = {
    passed: [],
    failed: []
  };
  
  for (const code of requiredCode) {
    const pattern = new RegExp(code.pattern, 'i');
    if (pattern.test(jsContent)) {
      results.passed.push(`${code.name} (${code.pattern})`);
    } else {
      results.failed.push(`${code.name} (${code.pattern})`);
    }
  }
  
  return results;
}

// Generate HTML test report
function generateHtmlReport(results) {
  const pages = Object.keys(results.pageResults).map(page => {
    const pageResult = results.pageResults[page];
    const components = pageResult.components.map(comp => `
      <tr>
        <td>${comp.name}</td>
        <td>${comp.selector}</td>
        <td>${comp.exists ? 'Pass ✅' : 'Fail ❌'}</td>
      </tr>
    `).join('');
    
    return `
      <div class="page-result">
        <h3>${page} Page</h3>
        <table>
          <tr>
            <th>Component</th>
            <th>Selector</th>
            <th>Status</th>
          </tr>
          ${components}
        </table>
      </div>
    `;
  }).join('');
  
  const cssTests = results.cssTests.passed.map(test => `<li class="test-pass">${test}</li>`).join('') +
    results.cssTests.failed.map(test => `<li class="test-fail">${test}</li>`).join('');
    
  const jsTests = results.jsTests.passed.map(test => `<li class="test-pass">${test}</li>`).join('') +
    results.jsTests.failed.map(test => `<li class="test-fail">${test}</li>`).join('');
    
  const htmlTests = results.htmlTests.passed.map(test => `<li class="test-pass">${test}</li>`).join('') +
    results.htmlTests.failed.map(test => `<li class="test-fail">${test}</li>`).join('');
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>FinDoc Analyzer UI Components Test Results</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
        }
        
        h1, h2, h3 {
          color: #2c3e50;
        }
        
        .summary {
          background-color: #f5f5f5;
          padding: 20px;
          border-radius: 5px;
          margin-bottom: 30px;
        }
        
        .stats {
          display: flex;
          justify-content: space-between;
          margin-bottom: 20px;
        }
        
        .stat-box {
          flex: 1;
          text-align: center;
          padding: 15px;
          margin: 0 10px;
          border-radius: 5px;
        }
        
        .total {
          background-color: #f0f0f0;
        }
        
        .passed {
          background-color: #d4edda;
          color: #155724;
        }
        
        .failed {
          background-color: #f8d7da;
          color: #721c24;
        }
        
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 20px;
        }
        
        th, td {
          padding: 10px;
          border: 1px solid #ddd;
          text-align: left;
        }
        
        th {
          background-color: #f5f5f5;
          font-weight: bold;
        }
        
        .test-pass {
          color: #155724;
        }
        
        .test-fail {
          color: #721c24;
        }
        
        .page-result {
          margin-bottom: 30px;
        }
        
        ul {
          padding-left: 20px;
        }
      </style>
    </head>
    <body>
      <h1>FinDoc Analyzer UI Components Test Results</h1>
      
      <div class="summary">
        <h2>Summary</h2>
        <div class="stats">
          <div class="stat-box total">
            <h3>Total Tests</h3>
            <p>${results.summary.totalTests}</p>
          </div>
          <div class="stat-box passed">
            <h3>Passed</h3>
            <p>${results.summary.passedTests}</p>
          </div>
          <div class="stat-box failed">
            <h3>Failed</h3>
            <p>${results.summary.failedTests}</p>
          </div>
        </div>
        <p><strong>Started:</strong> ${results.summary.startTime.toLocaleString()}</p>
        <p><strong>Completed:</strong> ${results.summary.endTime.toLocaleString()}</p>
        <p><strong>Duration:</strong> ${Math.round((results.summary.endTime - results.summary.startTime) / 1000)} seconds</p>
      </div>
      
      <h2>Page Component Tests</h2>
      ${pages}
      
      <h2>CSS Tests</h2>
      <ul>
        ${cssTests}
      </ul>
      
      <h2>JavaScript Tests</h2>
      <ul>
        ${jsTests}
      </ul>
      
      <h2>HTML Structure Tests</h2>
      <ul>
        ${htmlTests}
      </ul>
    </body>
    </html>
  `;
}

// Main testing function
async function runTests() {
  console.log('Starting UI Components Tests...');
  
  // Test each page
  for (const page of config.pages) {
    console.log(`Testing ${page.name} page...`);
    try {
      const url = `${config.baseUrl}${page.path}`;
      const response = await get(url);
      
      // Initialize page results
      testResults.pageResults[page.name] = {
        url,
        statusCode: response.statusCode,
        components: []
      };
      
      // Check for each required component
      for (const componentKey of page.requiredComponents) {
        const selector = config.components[componentKey];
        const exists = checkComponentInPage(response.body, selector);
        
        testResults.pageResults[page.name].components.push({
          name: componentKey,
          selector,
          exists
        });
        
        // Update summary counts
        testResults.summary.totalTests++;
        if (exists) {
          testResults.summary.passedTests++;
          console.log(`  ✅ ${componentKey} (${selector}) found`);
        } else {
          testResults.summary.failedTests++;
          console.log(`  ❌ ${componentKey} (${selector}) not found`);
        }
      }
      
      // Test HTML structure
      const hasDocumentChatContainer = response.body.includes('document-chat-container');
      if (hasDocumentChatContainer) {
        testResults.htmlTests.passed.push(`${page.name} page has Document Chat Container`);
      } else {
        testResults.htmlTests.failed.push(`${page.name} page has Document Chat Container`);
      }
      
      const hasProcessButton = response.body.includes('process-document-btn');
      if (hasProcessButton) {
        testResults.htmlTests.passed.push(`${page.name} page has Process Button`);
      } else {
        testResults.htmlTests.failed.push(`${page.name} page has Process Button`);
      }
      
    } catch (error) {
      console.error(`Error testing ${page.name} page:`, error.message);
      testResults.pageResults[page.name] = {
        url: `${config.baseUrl}${page.path}`,
        error: error.message,
        components: []
      };
    }
  }
  
  // Test CSS
  try {
    console.log('Testing CSS...');
    const cssResponse = await get(`${config.baseUrl}/css/ui-components.css`);
    const cssResults = checkCssForComponents(cssResponse.body);
    
    testResults.cssTests.passed = cssResults.passed;
    testResults.cssTests.failed = cssResults.failed;
    
    for (const passed of cssResults.passed) {
      console.log(`  ✅ CSS: ${passed}`);
      testResults.summary.totalTests++;
      testResults.summary.passedTests++;
    }
    
    for (const failed of cssResults.failed) {
      console.log(`  ❌ CSS: ${failed}`);
      testResults.summary.totalTests++;
      testResults.summary.failedTests++;
    }
  } catch (error) {
    console.error('Error testing CSS:', error.message);
  }
  
  // Test JavaScript
  try {
    console.log('Testing JavaScript...');
    const jsResponse = await get(`${config.baseUrl}/js/ui-components-enhanced.js`);
    const jsResults = checkJsForComponents(jsResponse.body);
    
    testResults.jsTests.passed = jsResults.passed;
    testResults.jsTests.failed = jsResults.failed;
    
    for (const passed of jsResults.passed) {
      console.log(`  ✅ JS: ${passed}`);
      testResults.summary.totalTests++;
      testResults.summary.passedTests++;
    }
    
    for (const failed of jsResults.failed) {
      console.log(`  ❌ JS: ${failed}`);
      testResults.summary.totalTests++;
      testResults.summary.failedTests++;
    }
  } catch (error) {
    console.error('Error testing JavaScript:', error.message);
  }
  
  // Generate report
  testResults.summary.endTime = new Date();
  
  // Write JSON results
  const jsonResultsPath = path.join(resultsDir, `${timestamp}-results.json`);
  fs.writeFileSync(jsonResultsPath, JSON.stringify(testResults, null, 2));
  console.log(`Results saved to ${jsonResultsPath}`);
  
  // Write HTML report
  const htmlReportPath = path.join(resultsDir, `${timestamp}-report.html`);
  fs.writeFileSync(htmlReportPath, generateHtmlReport(testResults));
  console.log(`HTML report saved to ${htmlReportPath}`);
  
  // Print summary
  console.log('\n=== TEST SUMMARY ===');
  console.log(`Total Tests: ${testResults.summary.totalTests}`);
  console.log(`Passed: ${testResults.summary.passedTests}`);
  console.log(`Failed: ${testResults.summary.failedTests}`);
  console.log(`Success Rate: ${Math.round((testResults.summary.passedTests / testResults.summary.totalTests) * 100)}%`);
  console.log('==================\n');
  
  return {
    jsonResultsPath,
    htmlReportPath,
    success: testResults.summary.failedTests === 0
  };
}

// Run the tests
runTests()
  .then(results => {
    if (results.success) {
      console.log('All tests passed successfully!');
    } else {
      console.log('Some tests failed, check the report for details.');
    }
  })
  .catch(error => {
    console.error('Error running tests:', error);
  });