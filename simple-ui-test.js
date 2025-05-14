/**
 * Simple UI test utility for FinDoc Analyzer
 * 
 * This utility makes HTTP requests directly to test the API and 
 * generates HTML reports with screenshots for manual verification.
 */

const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { URL } = require('url');

// Configuration
const config = {
  baseUrl: 'http://localhost:8080',
  screenshotsDir: path.join(__dirname, 'test-results', 'screenshots'),
  resultsDir: path.join(__dirname, 'test-results'),
  waitBetweenRequests: 1000, // 1 second
  useExternalScreenshotTool: true, // Use curl for screenshots
  testTimeout: 30000 // 30 seconds timeout for the entire test suite
};

// Ensure directories exist
[config.screenshotsDir, config.resultsDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Test results
const testResults = {
  timestamp: new Date().toISOString(),
  tests: [],
  startTime: Date.now(),
  screenshots: []
};

/**
 * Make an HTTP request
 * @param {string} url - URL to request
 * @param {string} method - HTTP method
 * @param {object} data - Data to send (for POST/PUT)
 * @returns {Promise<object>} - Response data
 */
function request(url, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    
    const options = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port || (parsedUrl.protocol === 'https:' ? 443 : 80),
      path: parsedUrl.pathname + parsedUrl.search,
      method: method,
      headers: {
        'Accept': 'application/json'
      }
    };
    
    if (data) {
      const postData = JSON.stringify(data);
      options.headers['Content-Type'] = 'application/json';
      options.headers['Content-Length'] = Buffer.byteLength(postData);
    }
    
    const httpModule = parsedUrl.protocol === 'https:' ? https : http;
    
    const req = httpModule.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          // Try to parse as JSON
          const jsonData = JSON.parse(responseData);
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            data: jsonData
          });
        } catch (error) {
          // Return as text if not JSON
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            data: responseData
          });
        }
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

/**
 * Take a screenshot of a URL
 * @param {string} url - URL to screenshot
 * @param {string} filename - Filename to save screenshot
 * @returns {Promise<string>} - Path to screenshot
 */
async function takeScreenshot(url, filename) {
  const screenshotPath = path.join(config.screenshotsDir, filename);
  
  if (config.useExternalScreenshotTool) {
    return new Promise((resolve, reject) => {
      // Using curl to save the HTML content
      const command = `curl -s "${url}" -o "${screenshotPath}.html"`;
      
      exec(command, (error, stdout, stderr) => {
        if (error) {
          console.error(`Error taking screenshot: ${error.message}`);
          return reject(error);
        }
        
        const htmlPath = `${screenshotPath}.html`;
        testResults.screenshots.push({
          url,
          path: path.relative(config.resultsDir, htmlPath),
          filename: `${filename}.html`
        });
        
        resolve(htmlPath);
      });
    });
  } else {
    // Fallback to saving a text file with the URL
    const content = `URL: ${url}\nTimestamp: ${new Date().toISOString()}`;
    fs.writeFileSync(`${screenshotPath}.txt`, content);
    
    const txtPath = `${screenshotPath}.txt`;
    testResults.screenshots.push({
      url,
      path: path.relative(config.resultsDir, txtPath),
      filename: `${filename}.txt`
    });
    
    return txtPath;
  }
}

/**
 * Run a test
 * @param {string} name - Test name
 * @param {function} testFn - Test function
 */
async function runTest(name, testFn) {
  console.log(`\n🧪 Running test: ${name}`);
  
  const test = {
    name,
    startTime: Date.now()
  };
  
  try {
    await testFn();
    
    test.status = 'PASSED';
    test.endTime = Date.now();
    test.duration = `${((test.endTime - test.startTime) / 1000).toFixed(2)} seconds`;
    
    console.log(`✅ Test passed: ${name}`);
  } catch (error) {
    test.status = 'FAILED';
    test.error = error.message;
    test.endTime = Date.now();
    test.duration = `${((test.endTime - test.startTime) / 1000).toFixed(2)} seconds`;
    
    console.error(`❌ Test failed: ${name}`);
    console.error(error);
  }
  
  testResults.tests.push(test);
}

/**
 * Wait for a specified time
 * @param {number} ms - Milliseconds to wait
 */
function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Generate HTML report
 */
function generateReport() {
  testResults.endTime = Date.now();
  testResults.duration = `${((testResults.endTime - testResults.startTime) / 1000).toFixed(2)} seconds`;
  
  const passedTests = testResults.tests.filter(t => t.status === 'PASSED').length;
  const failedTests = testResults.tests.filter(t => t.status === 'FAILED').length;
  
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>FinDoc Analyzer UI Test Report</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
      line-height: 1.6;
    }
    h1, h2, h3 {
      color: #2c3e50;
    }
    .summary {
      background: #f8f9fa;
      padding: 20px;
      border-radius: 8px;
      margin-bottom: 20px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .test {
      background: white;
      padding: 20px;
      border-radius: 8px;
      margin-bottom: 20px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .test-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .passed {
      color: #27ae60;
      font-weight: bold;
    }
    .failed {
      color: #e74c3c;
      font-weight: bold;
    }
    .timestamp {
      color: #7f8c8d;
      font-style: italic;
    }
    .screenshots {
      margin-top: 30px;
    }
    .screenshot {
      margin-bottom: 30px;
      border: 1px solid #eee;
      border-radius: 8px;
      overflow: hidden;
    }
    .screenshot-header {
      background: #f8f9fa;
      padding: 10px 15px;
      border-bottom: 1px solid #eee;
    }
    .screenshot-body iframe {
      width: 100%;
      height: 600px;
      border: none;
    }
    .screenshot-download {
      margin-top: 10px;
    }
    .error {
      background-color: #f8d7da;
      color: #721c24;
      padding: 10px;
      border-radius: 4px;
      margin-top: 10px;
    }
  </style>
</head>
<body>
  <h1>FinDoc Analyzer UI Test Report</h1>
  
  <div class="summary">
    <div class="timestamp">Generated: ${new Date(testResults.timestamp).toLocaleString()}</div>
    <div><strong>Total tests:</strong> ${testResults.tests.length}</div>
    <div><strong>Passed:</strong> <span class="passed">${passedTests}</span></div>
    <div><strong>Failed:</strong> <span class="failed">${failedTests}</span></div>
    <div><strong>Duration:</strong> ${testResults.duration}</div>
  </div>
  
  <h2>Test Results</h2>
  
  ${testResults.tests.map(test => `
    <div class="test">
      <div class="test-header">
        <h3>${test.name}</h3>
        <div class="${test.status.toLowerCase()}">${test.status}</div>
      </div>
      <div><strong>Duration:</strong> ${test.duration}</div>
      ${test.error ? `<div class="error"><strong>Error:</strong> ${test.error}</div>` : ''}
    </div>
  `).join('')}
  
  <h2>Screenshots</h2>
  
  <div class="screenshots">
    ${testResults.screenshots.map(screenshot => `
      <div class="screenshot">
        <div class="screenshot-header">
          <h3>${screenshot.filename}</h3>
          <div>${screenshot.url}</div>
        </div>
        <div class="screenshot-body">
          ${screenshot.filename.endsWith('.html') ? 
            `<iframe src="${screenshot.path}"></iframe>` : 
            `<pre>${fs.readFileSync(path.join(config.resultsDir, screenshot.path), 'utf8')}</pre>`
          }
        </div>
        <div class="screenshot-download">
          <a href="${screenshot.path}" download>Download</a>
        </div>
      </div>
    `).join('')}
  </div>
</body>
</html>
  `;
  
  fs.writeFileSync(path.join(config.resultsDir, 'ui-test-report.html'), html);
  console.log(`\nReport generated: ${path.join(config.resultsDir, 'ui-test-report.html')}`);
}

/**
 * Main test function
 */
async function runTests() {
  console.log('Starting FinDoc Analyzer UI Tests...');
  console.log(`Base URL: ${config.baseUrl}`);
  
  const startTime = Date.now();
  
  try {
    // Test 1: Health Check
    await runTest('Health Check', async () => {
      const response = await request(`${config.baseUrl}/api/health`);
      
      if (response.statusCode !== 200) {
        throw new Error(`API health check failed with status ${response.statusCode}`);
      }
      
      if (!response.data.status || response.data.status !== 'ok') {
        throw new Error('API health check returned non-ok status');
      }
      
      // Take screenshot of homepage
      await takeScreenshot(`${config.baseUrl}/`, '01-homepage.html');
      
      console.log('API is healthy:', response.data);
    });
    
    await wait(config.waitBetweenRequests);
    
    // Test 2: Sample Documents Creation
    await runTest('Create Sample Documents', async () => {
      await takeScreenshot(`${config.baseUrl}/test-api`, '02-test-api-page.html');
      
      // Create documents via API
      const response = await request(`${config.baseUrl}/api/test/sample-documents`);
      
      if (!response.data.success) {
        throw new Error('Failed to create sample documents');
      }
      
      console.log('Sample documents created:', response.data);
    });
    
    await wait(config.waitBetweenRequests);
    
    // Test 3: Document Retrieval
    await runTest('Get Documents', async () => {
      await takeScreenshot(`${config.baseUrl}/documents-new`, '03-documents-page.html');
      
      // Get documents via API
      const response = await request(`${config.baseUrl}/api/test/documents`);
      
      if (!response.data.success) {
        throw new Error('Failed to retrieve documents');
      }
      
      console.log(`Retrieved ${response.data.count || 0} documents`);
    });
    
    await wait(config.waitBetweenRequests);
    
    // Test 4: Document Details
    await runTest('Get Document Details', async () => {
      const documentId = 'doc-1';
      
      // Get document via API
      const response = await request(`${config.baseUrl}/api/test/documents/${documentId}`);
      
      if (!response.data.success) {
        throw new Error(`Failed to retrieve document ${documentId}`);
      }
      
      await takeScreenshot(`${config.baseUrl}/document-chat`, '04-document-chat-page.html');
      
      console.log(`Retrieved document ${documentId}`);
    });
    
    await wait(config.waitBetweenRequests);
    
    // Test 5: Document Processing
    await runTest('Process Document', async () => {
      const documentId = 'doc-1';
      
      // Process document via API
      const response = await request(`${config.baseUrl}/api/test/documents/${documentId}/process`, 'POST');
      
      if (!response.data.success) {
        throw new Error(`Failed to process document ${documentId}`);
      }
      
      console.log(`Document ${documentId} processed successfully`);
    });
    
    await wait(config.waitBetweenRequests);
    
    // Test 6: Document Chat
    await runTest('Document Chat', async () => {
      const documentId = 'doc-1';
      const message = 'What is the revenue in this document?';
      
      // Query document via API
      const response = await request(`${config.baseUrl}/api/test/chat/document/${documentId}`, 'POST', {
        message
      });
      
      if (!response.data.success) {
        throw new Error(`Failed to chat with document ${documentId}`);
      }
      
      console.log(`Chat response: "${response.data.response}"`);
      
      // Take screenshot of chat page
      await takeScreenshot(`${config.baseUrl}/document-chat`, '05-document-chat-with-message.html');
    });
    
    await wait(config.waitBetweenRequests);
    
    // Test 7: General Chat
    await runTest('General Chat', async () => {
      const message = 'How can I analyze financial documents?';
      
      // Send general chat query via API
      const response = await request(`${config.baseUrl}/api/test/chat/general`, 'POST', {
        message
      });
      
      if (!response.data.success) {
        throw new Error('Failed to send general chat message');
      }
      
      console.log(`General chat response: "${response.data.response}"`);
    });
    
    await wait(config.waitBetweenRequests);
    
    // Test 8: Upload Page
    await runTest('Upload Page', async () => {
      // Take screenshot of upload page
      await takeScreenshot(`${config.baseUrl}/upload`, '06-upload-page.html');
    });
    
    await wait(config.waitBetweenRequests);
    
    // Test 9: Analytics Page
    await runTest('Analytics Page', async () => {
      // Take screenshot of analytics page
      await takeScreenshot(`${config.baseUrl}/analytics-new`, '07-analytics-page.html');
    });
    
    // Check test timeout
    if (Date.now() - startTime > config.testTimeout) {
      console.warn(`\n⚠️ Tests took longer than ${config.testTimeout}ms timeout`);
    }
    
  } catch (error) {
    console.error('\n❌ Fatal error during testing:', error);
    
    // Add the error to the test results
    testResults.error = error.message;
  } finally {
    // Generate the test report
    generateReport();
  }
}

// Run the tests
runTests().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});