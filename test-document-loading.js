/**
 * Test Document Loading and Chat Issues
 * 
 * This script specifically tests the document loading and chat functionality issues
 * to understand the root causes and provide detailed analysis for fixing them.
 */

const fs = require('fs');
const path = require('path');
const axios = require('axios');

// Configuration
const config = {
  baseUrl: 'http://localhost:8080',
  resultsDir: path.join(__dirname, 'test-results'),
  timeout: 10000
};

// Ensure results directory exists
fs.mkdirSync(config.resultsDir, { recursive: true });

// Test results log
const testLog = [];

/**
 * Log test results
 */
function logTestResult(test, result, details = {}) {
  const testResult = {
    test,
    result,
    timestamp: new Date().toISOString(),
    ...details
  };
  
  console.log(`${testResult.result === 'PASS' ? '✅' : '❌'} ${test}: ${result}`);
  
  testLog.push(testResult);
  
  // Write to log file to keep track as we go
  fs.writeFileSync(
    path.join(config.resultsDir, 'document-loading-test.json'), 
    JSON.stringify(testLog, null, 2)
  );
}

/**
 * Make an API call and log the result
 */
async function testApiCall(endpoint, method = 'GET', data = null) {
  const url = endpoint.startsWith('http') ? endpoint : `${config.baseUrl}${endpoint}`;
  console.log(`Testing API: ${method} ${url}`);
  
  try {
    let response;
    
    if (method.toUpperCase() === 'GET') {
      response = await axios.get(url, { timeout: config.timeout });
    } else if (method.toUpperCase() === 'POST') {
      response = await axios.post(url, data, { timeout: config.timeout });
    }
    
    return {
      success: true,
      status: response.status,
      data: response.data,
      headers: response.headers
    };
  } catch (error) {
    return {
      success: false,
      status: error.response?.status,
      error: error.message,
      data: error.response?.data
    };
  }
}

/**
 * Test document API endpoints to determine why document loading fails
 */
async function testDocumentApis() {
  console.log('\n=== Testing Document API Endpoints ===\n');
  
  // Test list documents endpoint
  const documentsListResult = await testApiCall('/api/documents');
  logTestResult(
    'Documents List API', 
    documentsListResult.success ? 'PASS' : 'FAIL',
    documentsListResult
  );
  
  // Check if we have any document IDs we can use for testing
  let documentIds = [];
  if (documentsListResult.success && Array.isArray(documentsListResult.data)) {
    documentIds = documentsListResult.data.map(doc => doc.id);
  }
  
  // If we don't have any documents, test the upload endpoint
  if (documentIds.length === 0) {
    console.log('No existing documents found. Testing document upload...');
    
    // Create a test PDF in memory
    const samplePdfPath = path.join(__dirname, 'test-document.pdf');
    if (!fs.existsSync(samplePdfPath)) {
      // Create a minimal PDF file for testing
      fs.writeFileSync(samplePdfPath, 'Simple PDF content for testing');
    }
    
    // Test upload with FormData
    const FormData = require('form-data');
    const form = new FormData();
    form.append('file', fs.createReadStream(samplePdfPath));
    
    const uploadResult = await testApiCall('/api/documents/upload', 'POST', form);
    logTestResult(
      'Document Upload API', 
      uploadResult.success ? 'PASS' : 'FAIL',
      uploadResult
    );
    
    // If upload succeeded, add the document ID to our list
    if (uploadResult.success && uploadResult.data && uploadResult.data.id) {
      documentIds.push(uploadResult.data.id);
    }
  }
  
  // Test specific document endpoints if we have IDs
  for (const documentId of documentIds) {
    // Test document details endpoint
    const documentDetailsResult = await testApiCall(`/api/documents/${documentId}`);
    logTestResult(
      `Document Details API (ID: ${documentId})`, 
      documentDetailsResult.success ? 'PASS' : 'FAIL',
      documentDetailsResult
    );
    
    // Test document processing endpoint
    const processResult = await testApiCall('/api/documents/process', 'POST', { documentId });
    logTestResult(
      `Document Processing API (ID: ${documentId})`, 
      processResult.success ? 'PASS' : 'FAIL',
      processResult
    );
    
    // Test document chat endpoint
    const chatResult = await testApiCall('/api/documents/query', 'POST', { 
      documentId, 
      query: 'What is this document about?' 
    });
    logTestResult(
      `Document Chat API (ID: ${documentId})`, 
      chatResult.success ? 'PASS' : 'FAIL',
      chatResult
    );
  }
}

/**
 * Test connection to external services that might be causing issues
 */
async function testExternalServices() {
  console.log('\n=== Testing External Service Connections ===\n');
  
  // Test OpenAI connection if the API key is available
  if (process.env.OPENAI_API_KEY) {
    try {
      const openaiResult = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-3.5-turbo',
          messages: [{ role: 'user', content: 'Hello, are you connected?' }],
          max_tokens: 10
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
          }
        }
      );
      
      logTestResult(
        'OpenAI API Connection', 
        'PASS',
        { status: openaiResult.status, data: openaiResult.data }
      );
    } catch (error) {
      logTestResult(
        'OpenAI API Connection', 
        'FAIL',
        { error: error.message, details: error.response?.data }
      );
    }
  } else {
    logTestResult(
      'OpenAI API Connection', 
      'SKIP',
      { reason: 'OPENAI_API_KEY environment variable not set' }
    );
  }
  
  // Test database connection (if we can)
  const dbHealthResult = await testApiCall('/api/health');
  const dbConnected = dbHealthResult.success && 
                      dbHealthResult.data && 
                      dbHealthResult.data.database === 'connected';
  
  logTestResult(
    'Database Connection', 
    dbConnected ? 'PASS' : 'FAIL',
    dbHealthResult
  );
  
  // Test file storage access (checking if we can read/write files)
  try {
    const testDir = path.join(__dirname, 'test-results', 'storage-test');
    fs.mkdirSync(testDir, { recursive: true });
    const testFile = path.join(testDir, 'test-file.txt');
    fs.writeFileSync(testFile, 'Testing file system access');
    const content = fs.readFileSync(testFile, 'utf8');
    fs.unlinkSync(testFile);
    
    logTestResult(
      'File System Access', 
      'PASS',
      { content }
    );
  } catch (error) {
    logTestResult(
      'File System Access', 
      'FAIL',
      { error: error.message }
    );
  }
}

/**
 * Examine UI components to understand why they're displaying errors
 */
async function analyzeUIComponents() {
  console.log('\n=== Analyzing UI Components ===\n');
  
  // Get the document details page HTML
  const documentDetailsResult = await testApiCall('/document-details.html');
  let documentDetailsHtml = '';
  
  if (documentDetailsResult.success) {
    documentDetailsHtml = documentDetailsResult.data;
  
    // Look for error messages in the HTML
    const errorPattern = /Error\s+(loading|Loading)\s+Document/gi;
    const hasErrorMessage = errorPattern.test(documentDetailsHtml);
    
    logTestResult(
      'Document Details Page Error Message', 
      hasErrorMessage ? 'FAIL' : 'PASS',
      { 
        errorFound: hasErrorMessage,
        samples: hasErrorMessage ? documentDetailsHtml.match(/Error.{0,50}/g) : []
      }
    );
    
    // Look for evidence of mock AI implementation
    const mockPattern = /(mock|fake|dummy|test)\s+(AI|assistant|chat)/gi;
    const hasMockImplementation = mockPattern.test(documentDetailsHtml);
    
    logTestResult(
      'Chat Implementation', 
      hasMockImplementation ? 'FAIL' : 'PASS',
      { 
        mockFound: hasMockImplementation,
        samples: hasMockImplementation ? documentDetailsHtml.match(/.{0,30}(mock|fake|dummy|test).{0,30}/gi) : []
      }
    );
  } else {
    logTestResult(
      'Document Details Page Access', 
      'FAIL',
      documentDetailsResult
    );
  }
  
  // Get the chat page HTML
  const chatPageResult = await testApiCall('/document-chat.html');
  
  if (chatPageResult.success) {
    const chatPageHtml = chatPageResult.data;
    
    // Look for evidence of proper AI integration
    const aiIntegrationPattern = /(openai|gpt|chat|claude|anthropic|api\.openai)/gi;
    const hasAiIntegration = aiIntegrationPattern.test(chatPageHtml);
    
    logTestResult(
      'AI Integration in Chat Page', 
      hasAiIntegration ? 'PASS' : 'FAIL',
      { 
        integrationFound: hasAiIntegration,
        samples: hasAiIntegration ? chatPageHtml.match(/.{0,30}(openai|gpt|chat|claude|anthropic|api\.openai).{0,30}/gi) : []
      }
    );
  } else {
    logTestResult(
      'Chat Page Access', 
      'FAIL',
      chatPageResult
    );
  }
}

/**
 * Check the server logs or configuration to find issues
 */
async function checkServerConfiguration() {
  console.log('\n=== Checking Server Configuration ===\n');
  
  // Try to get the server configuration
  const configResult = await testApiCall('/api/config');
  const hasConfig = configResult.success && configResult.data;
  
  if (hasConfig) {
    // Check for critical configuration
    const aiConfigured = configResult.data.openaiApiKey || 
                         configResult.data.anthropicApiKey ||
                         configResult.data.aiProvider;
    
    logTestResult(
      'AI Configuration', 
      aiConfigured ? 'PASS' : 'FAIL',
      { 
        aiConfig: aiConfigured ? 'Present' : 'Missing',
        details: configResult.data
      }
    );
    
    // Check for document storage configuration
    const storageConfigured = configResult.data.documentStorage || 
                             configResult.data.storagePath ||
                             configResult.data.s3Bucket;
    
    logTestResult(
      'Document Storage Configuration', 
      storageConfigured ? 'PASS' : 'FAIL',
      { 
        storageConfig: storageConfigured ? 'Present' : 'Missing',
        details: configResult.data
      }
    );
  } else {
    // Alternative: Check for environment variables that might be missing
    const requiredEnvVars = [
      'OPENAI_API_KEY', 
      'ANTHROPIC_API_KEY',
      'DOCUMENT_STORAGE_PATH',
      'DATABASE_URL',
      'S3_BUCKET'
    ];
    
    const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);
    
    logTestResult(
      'Critical Environment Variables', 
      missingEnvVars.length === 0 ? 'PASS' : 'FAIL',
      { 
        missingEnvVars,
        availableEnvVars: Object.keys(process.env).filter(key => 
          key.includes('API') || 
          key.includes('KEY') || 
          key.includes('PATH') ||
          key.includes('URL') ||
          key.includes('DB')
        )
      }
    );
  }
  
  // Check for proper startup in server.js
  try {
    const serverJs = fs.readFileSync(path.join(__dirname, 'server.js'), 'utf8');
    
    // Look for error handling in document loading
    const hasDocumentErrorHandling = /catch.*document.*error/i.test(serverJs);
    logTestResult(
      'Document Error Handling in Server', 
      hasDocumentErrorHandling ? 'PASS' : 'FAIL',
      { hasDocumentErrorHandling }
    );
    
    // Look for proper Chat API integration
    const hasChatIntegration = /openai|gpt|anthropic|claude/i.test(serverJs) &&
                               /chat.*api|api.*chat/i.test(serverJs);
    logTestResult(
      'Chat API Integration in Server', 
      hasChatIntegration ? 'PASS' : 'FAIL',
      { hasChatIntegration }
    );
    
    // Look for mock implementations
    const hasMockImplementations = /mock.*chat|chat.*mock|mock.*ai|fake.*ai/i.test(serverJs);
    logTestResult(
      'Mock Implementations in Server', 
      !hasMockImplementations ? 'PASS' : 'FAIL',
      { hasMockImplementations }
    );
  } catch (error) {
    logTestResult(
      'Server.js Analysis', 
      'FAIL',
      { error: error.message }
    );
  }
}

/**
 * Generate a comprehensive HTML report
 */
function generateHtmlReport() {
  const htmlReport = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document Loading and Chat Test Results</title>
    <style>
      body { font-family: Arial, sans-serif; line-height: 1.6; margin: 0; padding: 20px; color: #333; }
      h1, h2, h3 { color: #444; }
      .summary { background: #f5f5f5; padding: 15px; border-radius: 5px; margin-bottom: 20px; }
      .test-results { margin-bottom: 30px; }
      .test-result { margin-bottom: 15px; padding: 15px; border-radius: 5px; border: 1px solid #ddd; }
      .test-result.pass { border-left: 5px solid #4CAF50; }
      .test-result.fail { border-left: 5px solid #F44336; }
      .test-result.skip { border-left: 5px solid #FFC107; }
      .test-name { font-weight: bold; margin-bottom: 5px; }
      .timestamp { color: #777; font-size: 0.8em; }
      .details { background: #f9f9f9; padding: 10px; border-radius: 3px; margin-top: 10px; overflow: auto; }
      pre { margin: 0; }
      .count { font-size: 1.2em; font-weight: bold; }
      .findings { background: #e8f5e9; padding: 15px; border-radius: 5px; margin: 20px 0; }
      .recommendations { background: #e3f2fd; padding: 15px; border-radius: 5px; margin: 20px 0; }
    </style>
  </head>
  <body>
    <h1>Document Loading and Chat Test Results</h1>
    
    <div class="summary">
      <h2>Summary</h2>
      <p>
        Tests run: <span class="count">${testLog.length}</span> | 
        Passed: <span class="count" style="color: #4CAF50;">${testLog.filter(t => t.result === 'PASS').length}</span> | 
        Failed: <span class="count" style="color: #F44336;">${testLog.filter(t => t.result === 'FAIL').length}</span> | 
        Skipped: <span class="count" style="color: #FFC107;">${testLog.filter(t => t.result === 'SKIP').length}</span>
      </p>
      <p>Test run completed at: ${new Date().toLocaleString()}</p>
    </div>
    
    <div class="findings">
      <h2>Key Findings</h2>
      <ul>
        ${testLog.filter(t => t.result === 'FAIL').map(test => `
          <li><strong>${test.test}:</strong> ${JSON.stringify(test.error || test.details || {}).slice(0, 100)}...</li>
        `).join('')}
      </ul>
    </div>
    
    <div class="recommendations">
      <h2>Recommendations</h2>
      <ol>
        ${(() => {
          const recommendations = [];
          
          // Document loading issues
          if (testLog.some(t => t.test.includes('Document Details') && t.result === 'FAIL')) {
            recommendations.push(`
              <li>
                <strong>Fix Document Loading:</strong> The document loading functionality appears to be broken.
                Check the document storage configuration and ensure proper error handling for document retrieval.
              </li>
            `);
          }
          
          // Chat API issues
          if (testLog.some(t => t.test.includes('Chat') && t.result === 'FAIL')) {
            recommendations.push(`
              <li>
                <strong>Implement Real Chat API:</strong> The chat functionality appears to be using a mock implementation.
                Integrate with a real AI provider such as OpenAI or Anthropic.
              </li>
            `);
          }
          
          // API Configuration issues
          if (testLog.some(t => t.test.includes('Configuration') && t.result === 'FAIL')) {
            recommendations.push(`
              <li>
                <strong>Fix API Configuration:</strong> Critical configuration for AI services or document storage is missing.
                Check environment variables and server configuration.
              </li>
            `);
          }
          
          // Missing API endpoints
          if (testLog.some(t => t.test.includes('API') && t.result === 'FAIL')) {
            recommendations.push(`
              <li>
                <strong>Implement Missing API Endpoints:</strong> Some required API endpoints are missing or returning errors.
                Ensure all document and chat APIs are properly implemented.
              </li>
            `);
          }
          
          // Mock implementations
          if (testLog.some(t => t.test.includes('Mock') && t.result === 'FAIL')) {
            recommendations.push(`
              <li>
                <strong>Replace Mock Implementations:</strong> Mock or placeholder implementations were found in the codebase.
                Replace these with real functionality.
              </li>
            `);
          }
          
          return recommendations.join('');
        })()}
      </ol>
    </div>
    
    <h2>Test Results</h2>
    
    <div class="test-results">
      ${testLog.map(test => `
        <div class="test-result ${test.result.toLowerCase()}">
          <div class="test-name">${test.test}: ${test.result}</div>
          <div class="timestamp">${new Date(test.timestamp).toLocaleString()}</div>
          
          ${Object.keys(test).filter(key => !['test', 'result', 'timestamp'].includes(key)).length > 0 ? `
            <div class="details">
              <pre>${JSON.stringify(Object.fromEntries(
                Object.entries(test).filter(([key]) => !['test', 'result', 'timestamp'].includes(key))
              ), null, 2)}</pre>
            </div>
          ` : ''}
        </div>
      `).join('')}
    </div>
  </body>
  </html>
  `;
  
  fs.writeFileSync(path.join(config.resultsDir, 'document-loading-test-report.html'), htmlReport);
  console.log(`\nHTML report generated: ${path.join(config.resultsDir, 'document-loading-test-report.html')}`);
}

/**
 * Main test function
 */
async function runTests() {
  console.log('Starting document loading and chat tests...');
  
  try {
    await testDocumentApis();
    await testExternalServices();
    await analyzeUIComponents();
    await checkServerConfiguration();
    
    generateHtmlReport();
    
    console.log('\nTests completed!');
  } catch (error) {
    console.error('Error running tests:', error);
  }
}

// Run the tests
runTests();