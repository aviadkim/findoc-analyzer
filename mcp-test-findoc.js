/**
 * Comprehensive MCP Test for FinDoc Analyzer
 * This script tests all major functionality of the FinDoc Analyzer application
 */

// Import required modules
const fs = require('fs');
const path = require('path');
const http = require('http');
const https = require('https');

// Configuration
const config = {
  baseUrl: 'http://localhost:8080',
  apiEndpoints: [
    '/api/health',
    '/api/documents',
    '/api/enhanced-pdf/extract-text',
    '/api/securities-feedback',
    '/api/market-data/price/US0378331005',
    '/api/portfolio-comparison',
    '/api/securities-export/document/doc-123'
  ],
  uiPages: [
    '/',
    '/documents-new',
    '/upload',
    '/document-details.html',
    '/document-chat',
    '/analytics-new',
    '/feedback'
  ],
  testPdfPath: './messos.pdf',
  resultsDir: './test-results',
  apiKeyEnvVar: 'GEMINI_API_KEY'
};

// Ensure results directory exists
if (!fs.existsSync(config.resultsDir)) {
  fs.mkdirSync(config.resultsDir, { recursive: true });
}

// Test results object
const testResults = {
  timestamp: new Date().toISOString(),
  summary: {
    total: 0,
    passed: 0,
    failed: 0,
    skipped: 0
  },
  tests: []
};

// Helper function to make HTTP requests
async function makeRequest(url, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const isHttps = url.startsWith('https');
    const client = isHttps ? https : http;
    const options = {
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    if (data && method !== 'GET') {
      options.headers['Content-Length'] = Buffer.byteLength(JSON.stringify(data));
    }

    const req = client.request(url, options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      res.on('end', () => {
        try {
          const parsedData = responseData ? JSON.parse(responseData) : {};
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            data: parsedData
          });
        } catch (e) {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            data: responseData,
            parseError: e.message
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data && method !== 'GET') {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

// Helper function to record test results
function recordTest(name, category, result, details = {}) {
  const test = {
    name,
    category,
    result,
    timestamp: new Date().toISOString(),
    details
  };

  testResults.tests.push(test);
  testResults.summary.total++;

  if (result === 'PASS') {
    testResults.summary.passed++;
    console.log(`✅ PASS: ${category} - ${name}`);
  } else if (result === 'FAIL') {
    testResults.summary.failed++;
    console.log(`❌ FAIL: ${category} - ${name}`);
    if (details.error) {
      console.log(`   Error: ${details.error}`);
    }
  } else if (result === 'SKIP') {
    testResults.summary.skipped++;
    console.log(`⚠️ SKIP: ${category} - ${name}`);
    if (details.reason) {
      console.log(`   Reason: ${details.reason}`);
    }
  }

  // Save updated results after each test
  fs.writeFileSync(
    path.join(config.resultsDir, 'test-results.json'),
    JSON.stringify(testResults, null, 2)
  );
}

// Test API endpoints
async function testApiEndpoints() {
  console.log('\n=== Testing API Endpoints ===\n');

  for (const endpoint of config.apiEndpoints) {
    const url = `${config.baseUrl}${endpoint}`;
    try {
      const response = await makeRequest(url);
      
      if (response.statusCode >= 200 && response.statusCode < 300) {
        recordTest(`Endpoint ${endpoint}`, 'API', 'PASS', {
          statusCode: response.statusCode,
          responsePreview: JSON.stringify(response.data).substring(0, 100) + '...'
        });
      } else {
        recordTest(`Endpoint ${endpoint}`, 'API', 'FAIL', {
          statusCode: response.statusCode,
          error: `Unexpected status code: ${response.statusCode}`
        });
      }
    } catch (error) {
      recordTest(`Endpoint ${endpoint}`, 'API', 'FAIL', {
        error: error.message
      });
    }
  }
}

// Test UI pages
async function testUiPages() {
  console.log('\n=== Testing UI Pages ===\n');

  for (const page of config.uiPages) {
    const url = `${config.baseUrl}${page}`;
    try {
      const response = await makeRequest(url);
      
      if (response.statusCode >= 200 && response.statusCode < 300) {
        // Check if response contains HTML
        const isHtml = typeof response.data === 'string' && 
                      (response.data.includes('<!DOCTYPE html>') || 
                       response.data.includes('<html>'));
        
        if (isHtml || response.headers['content-type']?.includes('text/html')) {
          recordTest(`Page ${page}`, 'UI', 'PASS', {
            statusCode: response.statusCode
          });
        } else {
          recordTest(`Page ${page}`, 'UI', 'FAIL', {
            statusCode: response.statusCode,
            error: 'Response is not HTML'
          });
        }
      } else {
        recordTest(`Page ${page}`, 'UI', 'FAIL', {
          statusCode: response.statusCode,
          error: `Unexpected status code: ${response.statusCode}`
        });
      }
    } catch (error) {
      recordTest(`Page ${page}`, 'UI', 'FAIL', {
        error: error.message
      });
    }
  }
}

// Test document upload and processing
async function testDocumentProcessing() {
  console.log('\n=== Testing Document Processing ===\n');

  // Check if test PDF exists
  if (!fs.existsSync(config.testPdfPath)) {
    recordTest('Document Upload', 'Processing', 'SKIP', {
      reason: `Test PDF not found at ${config.testPdfPath}`
    });
    return;
  }

  try {
    // Create a simple form data with the PDF file
    const boundary = '----WebKitFormBoundary' + Math.random().toString(16).substr(2);
    const fileContent = fs.readFileSync(config.testPdfPath);
    
    const formData = [
      `--${boundary}`,
      'Content-Disposition: form-data; name="file"; filename="test.pdf"',
      'Content-Type: application/pdf',
      '',
      fileContent.toString('binary'),
      `--${boundary}--`
    ].join('\r\n');

    // Make a POST request to upload the document
    const uploadUrl = `${config.baseUrl}/api/documents/upload`;
    const uploadOptions = {
      method: 'POST',
      headers: {
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'Content-Length': Buffer.byteLength(formData)
      }
    };

    // This is a simplified approach - in a real test, we would use a proper multipart/form-data library
    recordTest('Document Upload', 'Processing', 'SKIP', {
      reason: 'Multipart form upload requires additional libraries'
    });

    // Instead, test the document processing endpoint with a mock document ID
    const processUrl = `${config.baseUrl}/api/documents/doc-123/process`;
    try {
      const processResponse = await makeRequest(processUrl, 'POST');
      
      if (processResponse.statusCode >= 200 && processResponse.statusCode < 300) {
        recordTest('Document Processing', 'Processing', 'PASS', {
          statusCode: processResponse.statusCode,
          responsePreview: JSON.stringify(processResponse.data).substring(0, 100) + '...'
        });
      } else {
        recordTest('Document Processing', 'Processing', 'FAIL', {
          statusCode: processResponse.statusCode,
          error: `Unexpected status code: ${processResponse.statusCode}`
        });
      }
    } catch (error) {
      recordTest('Document Processing', 'Processing', 'FAIL', {
        error: error.message
      });
    }
  } catch (error) {
    recordTest('Document Upload', 'Processing', 'FAIL', {
      error: error.message
    });
  }
}

// Test chatbot functionality
async function testChatbot() {
  console.log('\n=== Testing Chatbot Functionality ===\n');

  const chatUrl = `${config.baseUrl}/api/chat/document/doc-123`;
  const chatData = {
    question: 'What securities are in this document?',
    history: []
  };

  try {
    const chatResponse = await makeRequest(chatUrl, 'POST', chatData);
    
    if (chatResponse.statusCode >= 200 && chatResponse.statusCode < 300) {
      // Check if response contains an answer
      if (chatResponse.data && (chatResponse.data.answer || chatResponse.data.response)) {
        recordTest('Document Chat', 'Chatbot', 'PASS', {
          statusCode: chatResponse.statusCode,
          responsePreview: JSON.stringify(chatResponse.data).substring(0, 100) + '...'
        });
      } else {
        recordTest('Document Chat', 'Chatbot', 'FAIL', {
          statusCode: chatResponse.statusCode,
          error: 'Response does not contain an answer'
        });
      }
    } else {
      recordTest('Document Chat', 'Chatbot', 'FAIL', {
        statusCode: chatResponse.statusCode,
        error: `Unexpected status code: ${chatResponse.statusCode}`
      });
    }
  } catch (error) {
    recordTest('Document Chat', 'Chatbot', 'FAIL', {
      error: error.message
    });
  }
}

// Test API key management
async function testApiKeyManagement() {
  console.log('\n=== Testing API Key Management ===\n');

  // Check if API key is set in environment variables
  const apiKey = process.env[config.apiKeyEnvVar];
  if (!apiKey) {
    recordTest('API Key Environment Variable', 'API Keys', 'SKIP', {
      reason: `Environment variable ${config.apiKeyEnvVar} not set`
    });
  } else {
    recordTest('API Key Environment Variable', 'API Keys', 'PASS', {
      note: `Environment variable ${config.apiKeyEnvVar} is set`
    });
  }

  // Test API key verification endpoint
  const verifyUrl = `${config.baseUrl}/api/scan1/verify-gemini-key`;
  const verifyData = {
    apiKey: apiKey || 'test-api-key'
  };

  try {
    const verifyResponse = await makeRequest(verifyUrl, 'POST', verifyData);
    
    if (verifyResponse.statusCode >= 200 && verifyResponse.statusCode < 300) {
      recordTest('API Key Verification', 'API Keys', 'PASS', {
        statusCode: verifyResponse.statusCode,
        responsePreview: JSON.stringify(verifyResponse.data).substring(0, 100) + '...'
      });
    } else {
      recordTest('API Key Verification', 'API Keys', 'FAIL', {
        statusCode: verifyResponse.statusCode,
        error: `Unexpected status code: ${verifyResponse.statusCode}`
      });
    }
  } catch (error) {
    recordTest('API Key Verification', 'API Keys', 'FAIL', {
      error: error.message
    });
  }
}

// Main test function
async function runTests() {
  console.log('=== Starting FinDoc Analyzer Tests ===');
  console.log(`Timestamp: ${new Date().toISOString()}`);
  console.log(`Base URL: ${config.baseUrl}`);
  console.log(`Results Directory: ${config.resultsDir}`);
  console.log('=====================================\n');

  try {
    // Test API endpoints
    await testApiEndpoints();
    
    // Test UI pages
    await testUiPages();
    
    // Test document processing
    await testDocumentProcessing();
    
    // Test chatbot functionality
    await testChatbot();
    
    // Test API key management
    await testApiKeyManagement();
    
    // Print summary
    console.log('\n=== Test Summary ===');
    console.log(`Total Tests: ${testResults.summary.total}`);
    console.log(`Passed: ${testResults.summary.passed}`);
    console.log(`Failed: ${testResults.summary.failed}`);
    console.log(`Skipped: ${testResults.summary.skipped}`);
    console.log('===================\n');
    
    // Generate HTML report
    generateHtmlReport();
    
    console.log(`Test results saved to ${path.join(config.resultsDir, 'test-results.json')}`);
    console.log(`HTML report saved to ${path.join(config.resultsDir, 'test-report.html')}`);
  } catch (error) {
    console.error('Error running tests:', error);
  }
}

// Generate HTML report
function generateHtmlReport() {
  const reportPath = path.join(config.resultsDir, 'test-report.html');
  
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>FinDoc Analyzer Test Report</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 0; padding: 20px; color: #333; }
    h1, h2, h3 { margin-top: 0; }
    .container { max-width: 1200px; margin: 0 auto; }
    .summary { display: flex; margin-bottom: 20px; }
    .summary-item { flex: 1; padding: 15px; border-radius: 5px; margin-right: 10px; color: white; }
    .total { background-color: #2c3e50; }
    .passed { background-color: #27ae60; }
    .failed { background-color: #e74c3c; }
    .skipped { background-color: #f39c12; }
    .test-category { margin-bottom: 30px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
    th, td { text-align: left; padding: 12px; border-bottom: 1px solid #ddd; }
    th { background-color: #f2f2f2; }
    tr:hover { background-color: #f5f5f5; }
    .pass { color: #27ae60; }
    .fail { color: #e74c3c; }
    .skip { color: #f39c12; }
    .details { font-size: 0.9em; color: #666; margin-top: 5px; }
    .timestamp { color: #666; font-size: 0.9em; margin-bottom: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <h1>FinDoc Analyzer Test Report</h1>
    <div class="timestamp">Generated on: ${new Date(testResults.timestamp).toLocaleString()}</div>
    
    <div class="summary">
      <div class="summary-item total">
        <h2>Total</h2>
        <div>${testResults.summary.total}</div>
      </div>
      <div class="summary-item passed">
        <h2>Passed</h2>
        <div>${testResults.summary.passed}</div>
      </div>
      <div class="summary-item failed">
        <h2>Failed</h2>
        <div>${testResults.summary.failed}</div>
      </div>
      <div class="summary-item skipped">
        <h2>Skipped</h2>
        <div>${testResults.summary.skipped}</div>
      </div>
    </div>
    
    ${generateTestCategoryHtml('API')}
    ${generateTestCategoryHtml('UI')}
    ${generateTestCategoryHtml('Processing')}
    ${generateTestCategoryHtml('Chatbot')}
    ${generateTestCategoryHtml('API Keys')}
  </div>
</body>
</html>
  `;
  
  fs.writeFileSync(reportPath, html);
}

// Generate HTML for a test category
function generateTestCategoryHtml(category) {
  const categoryTests = testResults.tests.filter(test => test.category === category);
  
  if (categoryTests.length === 0) {
    return '';
  }
  
  return `
    <div class="test-category">
      <h2>${category} Tests</h2>
      <table>
        <thead>
          <tr>
            <th>Test Name</th>
            <th>Result</th>
            <th>Details</th>
          </tr>
        </thead>
        <tbody>
          ${categoryTests.map(test => `
            <tr>
              <td>${test.name}</td>
              <td class="${test.result.toLowerCase()}">${test.result}</td>
              <td>
                ${test.details.statusCode ? `Status Code: ${test.details.statusCode}<br>` : ''}
                ${test.details.error ? `<span class="fail">Error: ${test.details.error}</span><br>` : ''}
                ${test.details.reason ? `<span class="skip">Reason: ${test.details.reason}</span><br>` : ''}
                ${test.details.note ? `<span class="details">Note: ${test.details.note}</span><br>` : ''}
                ${test.details.responsePreview ? `<span class="details">Response: ${test.details.responsePreview}</span>` : ''}
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

// Run the tests
runTests();
