/**
 * End-to-end testing of the FinDoc Analyzer API using fetch
 */

const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

// Ensure test results directory exists
const resultsDir = path.join(__dirname, 'test-results');
if (!fs.existsSync(resultsDir)) {
  fs.mkdirSync(resultsDir, { recursive: true });
}

// The base URL for our API
const BASE_URL = 'http://localhost:8080/api';

// Start the server
let server;

function startServer() {
  return new Promise((resolve) => {
    // Start the server in a child process
    server = spawn('node', ['server.js'], {
      detached: true,
      stdio: 'pipe'
    });
    
    // Log server output
    server.stdout.on('data', (data) => {
      console.log(`Server: ${data}`);
    });
    
    server.stderr.on('data', (data) => {
      console.error(`Server error: ${data}`);
    });
    
    // Wait for server to start
    setTimeout(() => {
      console.log('Server started');
      resolve();
    }, 5000);
  });
}

// Stop the server
function stopServer() {
  if (server) {
    try {
      process.kill(-server.pid);
    } catch (e) {
      console.error('Error stopping server:', e);
    }
  }
}

// Helper function to make API calls
async function callApi(endpoint, method = 'GET', body = null) {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json'
    }
  };
  
  if (body) {
    options.body = JSON.stringify(body);
  }
  
  const response = await fetch(`${BASE_URL}${endpoint}`, options);
  return await response.json();
}

// Run all tests
async function runTests() {
  console.log('Starting API tests...');
  
  const testReport = {
    timestamp: new Date().toISOString(),
    tests: [],
    startTime: Date.now()
  };
  
  try {
    // Health check test
    console.log('\n🧪 Testing API health check...');
    const healthCheck = await callApi('/test/ping');
    console.log('Response:', healthCheck);
    testReport.tests.push({
      name: 'API Health Check',
      endpoint: '/test/ping',
      status: healthCheck.success ? 'PASSED' : 'FAILED',
      response: healthCheck
    });
    
    // Create sample documents
    console.log('\n🧪 Creating sample documents...');
    const createSamples = await callApi('/test/sample-documents');
    console.log('Response:', createSamples);
    testReport.tests.push({
      name: 'Create Sample Documents',
      endpoint: '/test/sample-documents',
      status: createSamples.success ? 'PASSED' : 'FAILED',
      response: createSamples
    });
    
    // Get all documents
    console.log('\n🧪 Getting all documents...');
    const getAllDocuments = await callApi('/test/documents');
    console.log('Response count:', getAllDocuments.count);
    testReport.tests.push({
      name: 'Get All Documents',
      endpoint: '/test/documents',
      status: getAllDocuments.success ? 'PASSED' : 'FAILED',
      response: { success: getAllDocuments.success, count: getAllDocuments.count }
    });
    
    // Get a specific document
    console.log('\n🧪 Getting a specific document...');
    const getDocument = await callApi('/test/documents/doc-1');
    console.log('Response:', getDocument.success);
    testReport.tests.push({
      name: 'Get Document by ID',
      endpoint: '/test/documents/doc-1',
      status: getDocument.success ? 'PASSED' : 'FAILED',
      response: { success: getDocument.success }
    });
    
    // Process a document
    console.log('\n🧪 Processing a document...');
    const processDocument = await callApi('/test/documents/doc-1/process', 'POST');
    console.log('Response:', processDocument.success);
    testReport.tests.push({
      name: 'Process Document',
      endpoint: '/test/documents/doc-1/process',
      status: processDocument.success ? 'PASSED' : 'FAILED',
      response: { success: processDocument.success }
    });
    
    // Document chat
    console.log('\n🧪 Testing document chat...');
    const documentChat = await callApi('/test/chat/document/doc-1', 'POST', {
      message: 'What is the revenue in this document?'
    });
    console.log('Document chat response:', documentChat.response);
    testReport.tests.push({
      name: 'Document Chat',
      endpoint: '/test/chat/document/doc-1',
      status: documentChat.success ? 'PASSED' : 'FAILED',
      response: { 
        success: documentChat.success, 
        message: documentChat.message,
        response: documentChat.response
      }
    });
    
    // Second document chat message to test chat history
    console.log('\n🧪 Sending follow-up document chat message...');
    const documentChatFollowup = await callApi('/test/chat/document/doc-1', 'POST', {
      message: 'What about the profit margin?',
      sessionId: documentChat.sessionId
    });
    console.log('Follow-up response:', documentChatFollowup.response);
    testReport.tests.push({
      name: 'Document Chat Follow-up',
      endpoint: '/test/chat/document/doc-1',
      status: documentChatFollowup.success ? 'PASSED' : 'FAILED',
      response: { 
        success: documentChatFollowup.success, 
        message: documentChatFollowup.message,
        response: documentChatFollowup.response
      }
    });
    
    // General chat
    console.log('\n🧪 Testing general chat...');
    const generalChat = await callApi('/test/chat/general', 'POST', {
      message: 'How can I analyze financial documents?'
    });
    console.log('General chat response:', generalChat.response);
    testReport.tests.push({
      name: 'General Chat',
      endpoint: '/test/chat/general',
      status: generalChat.success ? 'PASSED' : 'FAILED',
      response: { 
        success: generalChat.success, 
        message: generalChat.message,
        response: generalChat.response
      }
    });
    
    // Calculate test duration
    testReport.endTime = Date.now();
    testReport.duration = `${((testReport.endTime - testReport.startTime) / 1000).toFixed(2)} seconds`;
    
    // Write test report to file
    fs.writeFileSync(
      path.join(resultsDir, 'api-test-report.json'),
      JSON.stringify(testReport, null, 2)
    );
    
    // Generate HTML report
    const htmlReport = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>FinDoc Analyzer API Test Report</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
      line-height: 1.6;
      color: #333;
    }
    h1, h2 {
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
      margin-bottom: 10px;
    }
    .test-name {
      font-size: 18px;
      font-weight: bold;
    }
    .passed {
      color: #27ae60;
      font-weight: bold;
    }
    .failed {
      color: #e74c3c;
      font-weight: bold;
    }
    .endpoint {
      color: #3498db;
      font-family: monospace;
    }
    pre {
      background: #f1f1f1;
      padding: 10px;
      border-radius: 4px;
      overflow-x: auto;
    }
    .timestamp {
      color: #7f8c8d;
      font-style: italic;
    }
  </style>
</head>
<body>
  <h1>FinDoc Analyzer API Test Report</h1>
  
  <div class="summary">
    <div class="timestamp">Generated: ${new Date(testReport.timestamp).toLocaleString()}</div>
    <div>Total tests: ${testReport.tests.length}</div>
    <div>Passed tests: ${testReport.tests.filter(t => t.status === 'PASSED').length}</div>
    <div>Failed tests: ${testReport.tests.filter(t => t.status === 'FAILED').length}</div>
    <div>Duration: ${testReport.duration}</div>
  </div>
  
  <h2>Test Results</h2>
  
  ${testReport.tests.map(test => `
    <div class="test">
      <div class="test-header">
        <div class="test-name">${test.name}</div>
        <div class="${test.status.toLowerCase()}">${test.status}</div>
      </div>
      <div class="endpoint">Endpoint: ${test.endpoint}</div>
      <h3>Response:</h3>
      <pre>${JSON.stringify(test.response, null, 2)}</pre>
    </div>
  `).join('')}
</body>
</html>
    `;
    
    fs.writeFileSync(
      path.join(resultsDir, 'api-test-report.html'),
      htmlReport
    );
    
    console.log('\n✅ All tests completed successfully!');
    console.log(`Test report generated at ${path.join(resultsDir, 'api-test-report.html')}`);
    
  } catch (error) {
    console.error('❌ Error during testing:', error);
    testReport.error = error.message;
    
    // Write error report to file
    fs.writeFileSync(
      path.join(resultsDir, 'api-test-error.json'),
      JSON.stringify(testReport, null, 2)
    );
  }
}

// Main function
async function main() {
  try {
    // Start the server
    await startServer();
    
    // Run the tests
    await runTests();
  } catch (error) {
    console.error('Fatal error:', error);
  } finally {
    // Stop the server
    stopServer();
  }
}

// Check if node-fetch is installed
try {
  // Dynamic import to check if node-fetch is available
  require('node-fetch');
} catch (error) {
  console.error('node-fetch is not installed. Installing...');
  require('child_process').execSync('npm install node-fetch@2', { stdio: 'inherit' });
  console.log('node-fetch installed successfully.');
}

// Run the main function
main();