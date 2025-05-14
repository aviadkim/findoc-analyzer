/**
 * Sequential Bug Finder for FinDoc Analyzer
 * This script uses sequential thinking to methodically test each core functionality
 * and identify critical bugs that need immediate fixing
 */

const fs = require('fs');
const path = require('path');
const http = require('http');
const https = require('https');

// Configuration
const config = {
  baseUrl: 'http://localhost:8080',
  resultsDir: './bug-report',
  testTimeout: 10000, // 10 seconds timeout for tests
};

// Ensure results directory exists
if (!fs.existsSync(config.resultsDir)) {
  fs.mkdirSync(config.resultsDir, { recursive: true });
}

// Bug report object
const bugReport = {
  timestamp: new Date().toISOString(),
  summary: {
    total: 0,
    critical: 0,
    major: 0,
    minor: 0,
    cosmetic: 0
  },
  bugs: []
};

// Helper function to make HTTP requests
async function makeRequest(url, method = 'GET', data = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const isHttps = url.startsWith('https');
    const client = isHttps ? https : http;
    
    const options = {
      method: method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
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

// Helper function to record bugs
function recordBug(title, description, severity, component, steps = [], screenshots = []) {
  const bug = {
    id: `BUG-${bugReport.bugs.length + 1}`,
    title,
    description,
    severity,
    component,
    steps,
    screenshots,
    timestamp: new Date().toISOString()
  };

  bugReport.bugs.push(bug);
  bugReport.summary.total++;
  bugReport.summary[severity.toLowerCase()]++;

  console.log(`🐛 ${severity.toUpperCase()}: ${title} [${component}]`);
  
  // Save updated report after each bug
  fs.writeFileSync(
    path.join(config.resultsDir, 'bug-report.json'),
    JSON.stringify(bugReport, null, 2)
  );
}

// Sequential test functions

// 1. Test Authentication
async function testAuthentication() {
  console.log('\n=== Testing Authentication ===\n');
  
  try {
    // Check if login page exists
    const loginUrl = `${config.baseUrl}/login`;
    const loginResponse = await makeRequest(loginUrl);
    
    if (loginResponse.statusCode !== 200) {
      recordBug(
        'Login page not accessible',
        `Login page returns status code ${loginResponse.statusCode}`,
        'Critical',
        'Authentication',
        ['Navigate to /login']
      );
    }
    
    // Check if signup page exists
    const signupUrl = `${config.baseUrl}/signup`;
    const signupResponse = await makeRequest(signupUrl);
    
    if (signupResponse.statusCode !== 200) {
      recordBug(
        'Signup page not accessible',
        `Signup page returns status code ${signupResponse.statusCode}`,
        'Critical',
        'Authentication',
        ['Navigate to /signup']
      );
    }
    
    // Test login API
    const loginApiUrl = `${config.baseUrl}/api/auth/login`;
    try {
      const loginApiResponse = await makeRequest(loginApiUrl, 'POST', {
        email: 'test@example.com',
        password: 'password123'
      });
      
      // We expect either a successful login or a 401 for invalid credentials
      // Any other response indicates a bug
      if (loginApiResponse.statusCode !== 200 && loginApiResponse.statusCode !== 401) {
        recordBug(
          'Login API not functioning correctly',
          `Login API returns unexpected status code ${loginApiResponse.statusCode}`,
          'Critical',
          'Authentication',
          ['POST to /api/auth/login with email and password']
        );
      }
    } catch (error) {
      recordBug(
        'Login API endpoint not available',
        `Error accessing login API: ${error.message}`,
        'Critical',
        'Authentication',
        ['POST to /api/auth/login with email and password']
      );
    }
    
    // Test Google login button presence
    const googleLoginButtonCheck = loginResponse.data.includes('google-login-btn') || 
                                  loginResponse.data.includes('Google Login');
    
    if (!googleLoginButtonCheck) {
      recordBug(
        'Google login button missing',
        'The Google login button is not present on the login page',
        'Major',
        'Authentication',
        ['Navigate to /login', 'Look for Google login button']
      );
    }
  } catch (error) {
    console.error('Error testing authentication:', error);
  }
}

// 2. Test Document Upload
async function testDocumentUpload() {
  console.log('\n=== Testing Document Upload ===\n');
  
  try {
    // Check if upload page exists
    const uploadUrl = `${config.baseUrl}/upload`;
    const uploadResponse = await makeRequest(uploadUrl);
    
    if (uploadResponse.statusCode !== 200) {
      recordBug(
        'Upload page not accessible',
        `Upload page returns status code ${uploadResponse.statusCode}`,
        'Critical',
        'Document Upload',
        ['Navigate to /upload']
      );
    }
    
    // Check for file input element
    const fileInputCheck = uploadResponse.data.includes('type="file"') || 
                          uploadResponse.data.includes('input file');
    
    if (!fileInputCheck) {
      recordBug(
        'File input missing on upload page',
        'The file input element is not present on the upload page',
        'Critical',
        'Document Upload',
        ['Navigate to /upload', 'Look for file input element']
      );
    }
    
    // Test upload API
    const uploadApiUrl = `${config.baseUrl}/api/documents/upload`;
    try {
      // We can't actually upload a file without multipart/form-data,
      // but we can check if the endpoint exists
      const uploadApiResponse = await makeRequest(uploadApiUrl, 'POST', {
        test: true
      });
      
      // We expect a 400 for invalid request or 200 for success
      // Any other response indicates a bug
      if (uploadApiResponse.statusCode !== 400 && uploadApiResponse.statusCode !== 200) {
        recordBug(
          'Document upload API not functioning correctly',
          `Upload API returns unexpected status code ${uploadApiResponse.statusCode}`,
          'Critical',
          'Document Upload',
          ['POST to /api/documents/upload']
        );
      }
    } catch (error) {
      recordBug(
        'Document upload API endpoint not available',
        `Error accessing upload API: ${error.message}`,
        'Critical',
        'Document Upload',
        ['POST to /api/documents/upload']
      );
    }
  } catch (error) {
    console.error('Error testing document upload:', error);
  }
}

// 3. Test Document Processing
async function testDocumentProcessing() {
  console.log('\n=== Testing Document Processing ===\n');
  
  try {
    // Test document processing API
    const processApiUrl = `${config.baseUrl}/api/documents/doc-123/process`;
    try {
      const processApiResponse = await makeRequest(processApiUrl, 'POST');
      
      if (processApiResponse.statusCode !== 200) {
        recordBug(
          'Document processing API not functioning correctly',
          `Processing API returns status code ${processApiResponse.statusCode}`,
          'Critical',
          'Document Processing',
          ['POST to /api/documents/{id}/process']
        );
      }
    } catch (error) {
      recordBug(
        'Document processing API endpoint not available',
        `Error accessing processing API: ${error.message}`,
        'Critical',
        'Document Processing',
        ['POST to /api/documents/{id}/process']
      );
    }
    
    // Test document details page
    const detailsUrl = `${config.baseUrl}/document-details.html`;
    const detailsResponse = await makeRequest(detailsUrl);
    
    if (detailsResponse.statusCode !== 200) {
      recordBug(
        'Document details page not accessible',
        `Document details page returns status code ${detailsResponse.statusCode}`,
        'Major',
        'Document Processing',
        ['Navigate to /document-details.html']
      );
    }
    
    // Check for process button
    const processButtonCheck = detailsResponse.data.includes('process-document-btn') || 
                              detailsResponse.data.includes('Process Document');
    
    if (!processButtonCheck) {
      recordBug(
        'Process document button missing',
        'The process document button is not present on the document details page',
        'Major',
        'Document Processing',
        ['Navigate to /document-details.html', 'Look for process document button']
      );
    }
  } catch (error) {
    console.error('Error testing document processing:', error);
  }
}

// 4. Test Chatbot Functionality
async function testChatbot() {
  console.log('\n=== Testing Chatbot Functionality ===\n');
  
  try {
    // Check if chat page exists
    const chatUrl = `${config.baseUrl}/document-chat`;
    const chatResponse = await makeRequest(chatUrl);
    
    if (chatResponse.statusCode !== 200) {
      recordBug(
        'Document chat page not accessible',
        `Document chat page returns status code ${chatResponse.statusCode}`,
        'Major',
        'Chatbot',
        ['Navigate to /document-chat']
      );
    }
    
    // Check for chat input element
    const chatInputCheck = chatResponse.data.includes('chat-input') || 
                          chatResponse.data.includes('question-input');
    
    if (!chatInputCheck) {
      recordBug(
        'Chat input missing on chat page',
        'The chat input element is not present on the document chat page',
        'Major',
        'Chatbot',
        ['Navigate to /document-chat', 'Look for chat input element']
      );
    }
    
    // Test chat API
    const chatApiUrl = `${config.baseUrl}/api/chat/document/doc-123`;
    try {
      const chatApiResponse = await makeRequest(chatApiUrl, 'POST', {
        question: 'What securities are in this document?',
        history: []
      });
      
      if (chatApiResponse.statusCode !== 200) {
        recordBug(
          'Document chat API not functioning correctly',
          `Chat API returns status code ${chatApiResponse.statusCode}`,
          'Critical',
          'Chatbot',
          ['POST to /api/chat/document/{id} with question']
        );
      }
    } catch (error) {
      recordBug(
        'Document chat API endpoint not available',
        `Error accessing chat API: ${error.message}`,
        'Critical',
        'Chatbot',
        ['POST to /api/chat/document/{id} with question']
      );
    }
  } catch (error) {
    console.error('Error testing chatbot:', error);
  }
}

// 5. Test Securities Extraction
async function testSecuritiesExtraction() {
  console.log('\n=== Testing Securities Extraction ===\n');
  
  try {
    // Test securities API
    const securitiesApiUrl = `${config.baseUrl}/api/documents/doc-123/securities`;
    try {
      const securitiesApiResponse = await makeRequest(securitiesApiUrl);
      
      if (securitiesApiResponse.statusCode !== 200) {
        recordBug(
          'Securities API not functioning correctly',
          `Securities API returns status code ${securitiesApiResponse.statusCode}`,
          'Critical',
          'Securities Extraction',
          ['GET /api/documents/{id}/securities']
        );
      }
    } catch (error) {
      recordBug(
        'Securities API endpoint not available',
        `Error accessing securities API: ${error.message}`,
        'Critical',
        'Securities Extraction',
        ['GET /api/documents/{id}/securities']
      );
    }
    
    // Test securities feedback API
    const feedbackApiUrl = `${config.baseUrl}/api/securities-feedback`;
    try {
      const feedbackApiResponse = await makeRequest(feedbackApiUrl);
      
      if (feedbackApiResponse.statusCode !== 200) {
        recordBug(
          'Securities feedback API not functioning correctly',
          `Securities feedback API returns status code ${feedbackApiResponse.statusCode}`,
          'Major',
          'Securities Extraction',
          ['GET /api/securities-feedback']
        );
      }
    } catch (error) {
      recordBug(
        'Securities feedback API endpoint not available',
        `Error accessing securities feedback API: ${error.message}`,
        'Major',
        'Securities Extraction',
        ['GET /api/securities-feedback']
      );
    }
  } catch (error) {
    console.error('Error testing securities extraction:', error);
  }
}

// 6. Test API Key Management
async function testApiKeyManagement() {
  console.log('\n=== Testing API Key Management ===\n');
  
  try {
    // Test API key verification
    const verifyApiUrl = `${config.baseUrl}/api/scan1/verify-gemini-key`;
    try {
      const verifyApiResponse = await makeRequest(verifyApiUrl, 'POST', {
        apiKey: 'test-api-key'
      });
      
      if (verifyApiResponse.statusCode !== 200 && verifyApiResponse.statusCode !== 401) {
        recordBug(
          'API key verification not functioning correctly',
          `API key verification returns status code ${verifyApiResponse.statusCode}`,
          'Critical',
          'API Key Management',
          ['POST to /api/scan1/verify-gemini-key with apiKey']
        );
      }
    } catch (error) {
      recordBug(
        'API key verification endpoint not available',
        `Error accessing API key verification: ${error.message}`,
        'Critical',
        'API Key Management',
        ['POST to /api/scan1/verify-gemini-key with apiKey']
      );
    }
  } catch (error) {
    console.error('Error testing API key management:', error);
  }
}

// 7. Test Navigation and UI
async function testNavigationAndUI() {
  console.log('\n=== Testing Navigation and UI ===\n');
  
  try {
    // Test main page
    const mainUrl = `${config.baseUrl}/`;
    const mainResponse = await makeRequest(mainUrl);
    
    if (mainResponse.statusCode !== 200) {
      recordBug(
        'Main page not accessible',
        `Main page returns status code ${mainResponse.statusCode}`,
        'Critical',
        'Navigation',
        ['Navigate to /']
      );
    }
    
    // Check for sidebar
    const sidebarCheck = mainResponse.data.includes('sidebar') || 
                        mainResponse.data.includes('nav');
    
    if (!sidebarCheck) {
      recordBug(
        'Sidebar navigation missing',
        'The sidebar navigation is not present on the main page',
        'Major',
        'Navigation',
        ['Navigate to /', 'Look for sidebar navigation']
      );
    }
    
    // Check for key navigation links
    const navLinks = [
      { name: 'Documents', pattern: /documents|document-list/i },
      { name: 'Upload', pattern: /upload/i },
      { name: 'Analytics', pattern: /analytics/i },
      { name: 'Chat', pattern: /chat/i }
    ];
    
    for (const link of navLinks) {
      const linkCheck = link.pattern.test(mainResponse.data);
      
      if (!linkCheck) {
        recordBug(
          `${link.name} navigation link missing`,
          `The ${link.name} navigation link is not present in the sidebar`,
          'Major',
          'Navigation',
          ['Navigate to /', 'Look for sidebar navigation', `Check for ${link.name} link`]
        );
      }
    }
  } catch (error) {
    console.error('Error testing navigation and UI:', error);
  }
}

// Generate HTML report
function generateHtmlReport() {
  const reportPath = path.join(config.resultsDir, 'bug-report.html');
  
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>FinDoc Analyzer Bug Report</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 0; padding: 20px; color: #333; }
    h1, h2, h3 { margin-top: 0; }
    .container { max-width: 1200px; margin: 0 auto; }
    .summary { display: flex; margin-bottom: 20px; }
    .summary-item { flex: 1; padding: 15px; border-radius: 5px; margin-right: 10px; color: white; text-align: center; }
    .total { background-color: #2c3e50; }
    .critical { background-color: #e74c3c; }
    .major { background-color: #e67e22; }
    .minor { background-color: #f1c40f; }
    .cosmetic { background-color: #3498db; }
    .bug-list { margin-bottom: 30px; }
    .bug-item { border: 1px solid #ddd; border-radius: 5px; padding: 15px; margin-bottom: 15px; }
    .bug-header { display: flex; justify-content: space-between; margin-bottom: 10px; }
    .bug-title { font-weight: bold; font-size: 1.1em; }
    .bug-severity { padding: 3px 8px; border-radius: 3px; color: white; font-size: 0.8em; }
    .bug-severity.critical { background-color: #e74c3c; }
    .bug-severity.major { background-color: #e67e22; }
    .bug-severity.minor { background-color: #f1c40f; }
    .bug-severity.cosmetic { background-color: #3498db; }
    .bug-component { color: #7f8c8d; font-size: 0.9em; }
    .bug-description { margin-bottom: 10px; }
    .bug-steps { background-color: #f9f9f9; padding: 10px; border-radius: 3px; }
    .bug-steps h4 { margin-top: 0; margin-bottom: 5px; }
    .bug-steps ol { margin-top: 5px; padding-left: 20px; }
    .timestamp { color: #666; font-size: 0.9em; margin-bottom: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <h1>FinDoc Analyzer Bug Report</h1>
    <div class="timestamp">Generated on: ${new Date(bugReport.timestamp).toLocaleString()}</div>
    
    <div class="summary">
      <div class="summary-item total">
        <h2>Total</h2>
        <div>${bugReport.summary.total}</div>
      </div>
      <div class="summary-item critical">
        <h2>Critical</h2>
        <div>${bugReport.summary.critical}</div>
      </div>
      <div class="summary-item major">
        <h2>Major</h2>
        <div>${bugReport.summary.major}</div>
      </div>
      <div class="summary-item minor">
        <h2>Minor</h2>
        <div>${bugReport.summary.minor}</div>
      </div>
      <div class="summary-item cosmetic">
        <h2>Cosmetic</h2>
        <div>${bugReport.summary.cosmetic}</div>
      </div>
    </div>
    
    <h2>Critical Bugs</h2>
    <div class="bug-list">
      ${generateBugListHtml('Critical')}
    </div>
    
    <h2>Major Bugs</h2>
    <div class="bug-list">
      ${generateBugListHtml('Major')}
    </div>
    
    <h2>Minor Bugs</h2>
    <div class="bug-list">
      ${generateBugListHtml('Minor')}
    </div>
    
    <h2>Cosmetic Bugs</h2>
    <div class="bug-list">
      ${generateBugListHtml('Cosmetic')}
    </div>
  </div>
</body>
</html>
  `;
  
  fs.writeFileSync(reportPath, html);
  console.log(`HTML report saved to ${reportPath}`);
}

// Generate HTML for bug list
function generateBugListHtml(severity) {
  const bugs = bugReport.bugs.filter(bug => bug.severity === severity);
  
  if (bugs.length === 0) {
    return '<p>No bugs found.</p>';
  }
  
  return bugs.map(bug => `
    <div class="bug-item">
      <div class="bug-header">
        <div class="bug-title">${bug.id}: ${bug.title}</div>
        <div class="bug-severity ${bug.severity.toLowerCase()}">${bug.severity}</div>
      </div>
      <div class="bug-component">Component: ${bug.component}</div>
      <div class="bug-description">${bug.description}</div>
      <div class="bug-steps">
        <h4>Steps to Reproduce:</h4>
        <ol>
          ${bug.steps.map(step => `<li>${step}</li>`).join('')}
        </ol>
      </div>
    </div>
  `).join('');
}

// Main function to run all tests
async function runTests() {
  console.log('=== Starting FinDoc Analyzer Bug Finder ===');
  console.log(`Timestamp: ${new Date().toISOString()}`);
  console.log(`Base URL: ${config.baseUrl}`);
  console.log(`Results Directory: ${config.resultsDir}`);
  console.log('===========================================\n');

  try {
    // Run tests in sequence
    await testAuthentication();
    await testDocumentUpload();
    await testDocumentProcessing();
    await testChatbot();
    await testSecuritiesExtraction();
    await testApiKeyManagement();
    await testNavigationAndUI();
    
    // Generate HTML report
    generateHtmlReport();
    
    // Print summary
    console.log('\n=== Bug Summary ===');
    console.log(`Total Bugs: ${bugReport.summary.total}`);
    console.log(`Critical: ${bugReport.summary.critical}`);
    console.log(`Major: ${bugReport.summary.major}`);
    console.log(`Minor: ${bugReport.summary.minor}`);
    console.log(`Cosmetic: ${bugReport.summary.cosmetic}`);
    console.log('===================\n');
    
    console.log(`Bug report saved to ${path.join(config.resultsDir, 'bug-report.json')}`);
    console.log(`HTML report saved to ${path.join(config.resultsDir, 'bug-report.html')}`);
  } catch (error) {
    console.error('Error running tests:', error);
  }
}

// Run the tests
runTests();
