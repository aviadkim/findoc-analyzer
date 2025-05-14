/**
 * Comprehensive QA Test Script - Headless Version
 * This script runs tests without requiring browser dependencies
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');

// Configuration
const config = {
  baseUrl: 'http://localhost:8080',
  sequentialThinkingUrl: 'http://localhost:8084/api/v1/think',
  testPdfPath: path.join(__dirname, 'sample.pdf'),
  resultsDir: path.join(__dirname, 'qa-test-results'),
  timeout: 30000
};

// Create directories
fs.mkdirSync(config.resultsDir, { recursive: true });

// Initialize session metadata for Sequential Thinking
let sessionId = Date.now().toString();
let testStepCount = 0;

// Initialize the test report
const testResults = {
  totalTests: 0,
  passedTests: 0,
  failedTests: 0,
  startTime: new Date(),
  endTime: null,
  tests: []
};

/**
 * Call Sequential Thinking MCP to document thought process
 */
async function thinkSequentially(prompt, context = {}) {
  try {
    console.log(`Thinking sequentially about: ${prompt.substring(0, 50)}...`);
    const response = await axios.post(config.sequentialThinkingUrl, {
      prompt,
      context,
      session_id: sessionId,
      max_steps: 5
    });
    return response.data;
  } catch (error) {
    console.error('Sequential Thinking MCP error:', error.message);
    return { 
      thinking: [`Error connecting to Sequential Thinking MCP: ${error.message}`],
      conclusion: 'Unable to process sequential thoughts'
    };
  }
}

/**
 * Record test result
 */
function recordTestResult(testName, passed, details = {}) {
  testResults.totalTests++;
  if (passed) {
    testResults.passedTests++;
  } else {
    testResults.failedTests++;
  }
  
  testResults.tests.push({
    id: testResults.totalTests,
    name: testName,
    passed,
    timestamp: new Date(),
    ...details
  });
  
  console.log(`Test ${testResults.totalTests}: ${testName} - ${passed ? 'PASSED ✅' : 'FAILED ❌'}`);
}

/**
 * Generate HTML test report
 */
function generateHtmlReport() {
  testResults.endTime = new Date();
  const duration = (testResults.endTime - testResults.startTime) / 1000;
  
  // Generate test report HTML
  const reportHtml = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Comprehensive QA Test Results</title>
    <style>
      body { font-family: Arial, sans-serif; line-height: 1.6; margin: 0; padding: 20px; color: #333; }
      h1, h2, h3 { color: #444; }
      .summary { background: #f5f5f5; padding: 15px; border-radius: 5px; margin-bottom: 20px; }
      .test-card { border: 1px solid #ddd; padding: 15px; margin-bottom: 15px; border-radius: 5px; }
      .test-card.passed { border-left: 5px solid #4CAF50; }
      .test-card.failed { border-left: 5px solid #F44336; }
      .test-details { margin-top: 10px; }
      .thinking-steps { background: #f9f9f9; padding: 10px; border-radius: 5px; margin-top: 10px; }
      .step { margin-bottom: 10px; padding-left: 10px; border-left: 3px solid #2196F3; }
      .stats { display: flex; justify-content: space-between; margin-bottom: 20px; }
      .stat-box { background: #f5f5f5; padding: 15px; border-radius: 5px; flex: 1; margin: 0 5px; text-align: center; }
      .pass-rate { font-size: 24px; font-weight: bold; }
      .conclusion { font-weight: bold; margin-top: 10px; }
      pre { background: #f5f5f5; padding: 10px; overflow-x: auto; border-radius: 3px; }
    </style>
  </head>
  <body>
    <h1>Comprehensive QA Test Results</h1>
    
    <div class="summary">
      <h2>Test Summary</h2>
      <p>Tests run: ${testResults.totalTests} | Passed: ${testResults.passedTests} | Failed: ${testResults.failedTests}</p>
      <p>Start time: ${testResults.startTime.toLocaleString()}</p>
      <p>End time: ${testResults.endTime.toLocaleString()}</p>
      <p>Duration: ${duration.toFixed(2)} seconds</p>
      <div class="pass-rate">Pass rate: ${((testResults.passedTests / testResults.totalTests) * 100).toFixed(1)}%</div>
    </div>
    
    <div class="stats">
      <div class="stat-box">
        <h3>Total Tests</h3>
        <div style="font-size: 24px; font-weight: bold;">${testResults.totalTests}</div>
      </div>
      <div class="stat-box" style="background: ${testResults.passedTests > 0 ? '#E8F5E9' : '#f5f5f5'}">
        <h3>Passed</h3>
        <div style="font-size: 24px; font-weight: bold; color: #4CAF50;">${testResults.passedTests}</div>
      </div>
      <div class="stat-box" style="background: ${testResults.failedTests > 0 ? '#FFEBEE' : '#f5f5f5'}">
        <h3>Failed</h3>
        <div style="font-size: 24px; font-weight: bold; color: #F44336;">${testResults.failedTests}</div>
      </div>
    </div>
    
    <h2>Test Details</h2>
    
    ${testResults.tests.map(test => `
      <div class="test-card ${test.passed ? 'passed' : 'failed'}">
        <h3>Test ${test.id}: ${test.name} - ${test.passed ? 'PASSED' : 'FAILED'}</h3>
        <div class="test-details">
          <p><strong>Time:</strong> ${test.timestamp.toLocaleString()}</p>
          ${test.url ? `<p><strong>URL:</strong> ${test.url}</p>` : ''}
          ${test.action ? `<p><strong>Action:</strong> ${test.action}</p>` : ''}
          ${test.expectedResult ? `<p><strong>Expected:</strong> ${test.expectedResult}</p>` : ''}
          ${test.actualResult ? `<p><strong>Actual:</strong> ${test.actualResult}</p>` : ''}
          
          ${test.thinking ? `
            <div class="thinking-steps">
              <h4>Sequential Thinking Process:</h4>
              ${test.thinking.thinking ? test.thinking.thinking.map(step => `
                <div class="step">
                  <p>${step}</p>
                </div>
              `).join('') : ''}
              ${test.thinking.conclusion ? `
                <div class="conclusion">Conclusion: ${test.thinking.conclusion}</div>
              ` : ''}
            </div>
          ` : ''}
          
          ${test.error ? `
            <h4>Error:</h4>
            <pre>${test.error}</pre>
          ` : ''}
        </div>
      </div>
    `).join('')}
  </body>
  </html>
  `;
  
  fs.writeFileSync(path.join(config.resultsDir, 'qa-test-report.html'), reportHtml);
  console.log(`\nTest report generated at ${path.join(config.resultsDir, 'qa-test-report.html')}`);
}

/**
 * Perform an HTTP request with sequential thinking
 */
async function performHttpRequest(method, url, testName, action, expectedResult, options = {}) {
  try {
    console.log(`Performing ${method} request to ${url}`);
    
    let response;
    if (method.toLowerCase() === 'get') {
      response = await axios.get(url, options);
    } else if (method.toLowerCase() === 'post') {
      response = await axios.post(url, options.data, options);
    } else if (method.toLowerCase() === 'put') {
      response = await axios.put(url, options.data, options);
    } else if (method.toLowerCase() === 'delete') {
      response = await axios.delete(url, options);
    }
    
    // Process sequential thinking
    const thinkingPrompt = `
    I am testing a PDF processing web application. 
    Current step: ${testName}
    Action performed: ${action}
    Expected result: ${expectedResult}
    Current URL: ${url}
    Response status: ${response.status}
    Response data: ${JSON.stringify(response.data).substring(0, 500)}...
    
    Think through what should happen in this test, potential issues to look for, and how to verify the results.
    `;
    
    const thinking = await thinkSequentially(thinkingPrompt, { 
      step: testStepCount++,
      testName,
      action, 
      expectedResult,
      url,
      status: response.status
    });
    
    return {
      success: response.status >= 200 && response.status < 300,
      status: response.status,
      data: response.data,
      thinking,
      url
    };
  } catch (error) {
    console.error(`Error performing ${method} request to ${url}:`, error.message);
    
    // Process sequential thinking even for failures
    const thinkingPrompt = `
    I am testing a PDF processing web application. 
    Current step: ${testName}
    Action performed: ${action}
    Expected result: ${expectedResult}
    Current URL: ${url}
    Error: ${error.message}
    
    Think through what went wrong in this test, potential issues to look for, and how this would affect the user experience.
    `;
    
    const thinking = await thinkSequentially(thinkingPrompt, { 
      step: testStepCount++,
      testName,
      action, 
      expectedResult,
      url,
      error: error.message
    });
    
    return {
      success: false,
      error: error.message,
      thinking,
      url
    };
  }
}

/**
 * Main test function
 */
async function runTests() {
  try {
    console.log('Starting comprehensive QA tests...');
    
    // Test 1: Homepage Access
    const homepageTest = await performHttpRequest(
      'get',
      `${config.baseUrl}/`,
      'Homepage Access',
      'Access the homepage via GET request',
      'Should return status 200 and homepage HTML'
    );
    
    recordTestResult('Homepage Access', homepageTest.success, {
      url: homepageTest.url,
      thinking: homepageTest.thinking,
      expectedResult: 'Should return status 200 and homepage HTML',
      actualResult: homepageTest.success ? `Status: ${homepageTest.status}` : `Error: ${homepageTest.error}`
    });
    
    // Test 2: Upload Page Access
    const uploadPageTest = await performHttpRequest(
      'get',
      `${config.baseUrl}/upload`,
      'Upload Page Access',
      'Access the upload page via GET request',
      'Should return status 200 and upload page HTML'
    );
    
    recordTestResult('Upload Page Access', uploadPageTest.success, {
      url: uploadPageTest.url,
      thinking: uploadPageTest.thinking,
      expectedResult: 'Should return status 200 and upload page HTML',
      actualResult: uploadPageTest.success ? `Status: ${uploadPageTest.status}` : `Error: ${uploadPageTest.error}`
    });
    
    // Test 3: Documents Page Access
    const documentsPageTest = await performHttpRequest(
      'get',
      `${config.baseUrl}/documents-new`,
      'Documents Page Access',
      'Access the documents page via GET request',
      'Should return status 200 and documents page HTML'
    );
    
    recordTestResult('Documents Page Access', documentsPageTest.success, {
      url: documentsPageTest.url,
      thinking: documentsPageTest.thinking,
      expectedResult: 'Should return status 200 and documents page HTML',
      actualResult: documentsPageTest.success ? `Status: ${documentsPageTest.status}` : `Error: ${documentsPageTest.error}`
    });
    
    // Test 4: Analytics Page Access
    const analyticsPageTest = await performHttpRequest(
      'get',
      `${config.baseUrl}/analytics-new`,
      'Analytics Page Access',
      'Access the analytics page via GET request',
      'Should return status 200 and analytics page HTML'
    );
    
    recordTestResult('Analytics Page Access', analyticsPageTest.success, {
      url: analyticsPageTest.url,
      thinking: analyticsPageTest.thinking,
      expectedResult: 'Should return status 200 and analytics page HTML',
      actualResult: analyticsPageTest.success ? `Status: ${analyticsPageTest.status}` : `Error: ${analyticsPageTest.error}`
    });
    
    // Test 5: Process Button Presence
    const processButtonTest = await performHttpRequest(
      'get',
      `${config.baseUrl}/upload`,
      'Process Button Presence',
      'Check for process button in upload page HTML',
      'Upload page HTML should contain process button elements'
    );
    
    const hasProcessButton = processButtonTest.success && 
      (processButtonTest.data.includes('process-document-btn') || 
       processButtonTest.data.includes('Process Document') ||
       processButtonTest.data.includes('process button'));
    
    recordTestResult('Process Button Presence', hasProcessButton, {
      url: processButtonTest.url,
      thinking: processButtonTest.thinking,
      expectedResult: 'Upload page HTML should contain process button elements',
      actualResult: hasProcessButton ? 'Process button elements found in HTML' : 'Process button elements not found in HTML'
    });
    
    // Test 6: Chat Button Presence
    const chatButtonTest = await performHttpRequest(
      'get',
      `${config.baseUrl}/`,
      'Chat Button Presence',
      'Check for chat button in homepage HTML',
      'Homepage HTML should contain chat button elements'
    );
    
    const hasChatButton = chatButtonTest.success && 
      (chatButtonTest.data.includes('show-chat-btn') || 
       chatButtonTest.data.includes('chat-button') ||
       chatButtonTest.data.includes('Chat'));
    
    recordTestResult('Chat Button Presence', hasChatButton, {
      url: chatButtonTest.url,
      thinking: chatButtonTest.thinking,
      expectedResult: 'Homepage HTML should contain chat button elements',
      actualResult: hasChatButton ? 'Chat button elements found in HTML' : 'Chat button elements not found in HTML'
    });
    
    // Test 7: File Upload Form
    const uploadFormTest = await performHttpRequest(
      'get',
      `${config.baseUrl}/upload`,
      'Upload Form Presence',
      'Check for file upload form in upload page HTML',
      'Upload page HTML should contain file input elements'
    );
    
    const hasUploadForm = uploadFormTest.success && 
      (uploadFormTest.data.includes('type="file"') || 
       uploadFormTest.data.includes('file-input') ||
       uploadFormTest.data.includes('upload-form'));
    
    recordTestResult('Upload Form Presence', hasUploadForm, {
      url: uploadFormTest.url,
      thinking: uploadFormTest.thinking,
      expectedResult: 'Upload page HTML should contain file input elements',
      actualResult: hasUploadForm ? 'File input elements found in HTML' : 'File input elements not found in HTML'
    });
    
    // Test 8: Document Chat Page
    const documentChatTest = await performHttpRequest(
      'get',
      `${config.baseUrl}/document-chat`,
      'Document Chat Page Access',
      'Access the document chat page via GET request',
      'Should return status 200 and document chat page HTML'
    );
    
    recordTestResult('Document Chat Page Access', documentChatTest.success, {
      url: documentChatTest.url,
      thinking: documentChatTest.thinking,
      expectedResult: 'Should return status 200 and document chat page HTML',
      actualResult: documentChatTest.success ? `Status: ${documentChatTest.status}` : `Error: ${documentChatTest.error}`
    });
    
    // Test 9: Chat Container Presence
    const chatContainerTest = await performHttpRequest(
      'get',
      `${config.baseUrl}/`,
      'Chat Container Presence',
      'Check for chat container in homepage HTML',
      'Homepage HTML should contain chat container elements'
    );
    
    const hasChatContainer = chatContainerTest.success && 
      (chatContainerTest.data.includes('chat-container') || 
       chatContainerTest.data.includes('chat-panel') ||
       chatContainerTest.data.includes('chat-widget'));
    
    recordTestResult('Chat Container Presence', hasChatContainer, {
      url: chatContainerTest.url,
      thinking: chatContainerTest.thinking,
      expectedResult: 'Homepage HTML should contain chat container elements',
      actualResult: hasChatContainer ? 'Chat container elements found in HTML' : 'Chat container elements not found in HTML'
    });
    
    // Test 10: Document Processing API
    const processApiTest = await performHttpRequest(
      'get',
      `${config.baseUrl}/api/documents/process`,
      'Document Processing API',
      'Check document processing API via GET request',
      'API should be available and return a valid response'
    );
    
    recordTestResult('Document Processing API', processApiTest.success, {
      url: processApiTest.url,
      thinking: processApiTest.thinking,
      expectedResult: 'API should be available and return a valid response',
      actualResult: processApiTest.success ? `Status: ${processApiTest.status}` : `Error: ${processApiTest.error}`
    });
    
    // Test 11: Error Handling for Non-existent Page
    const errorPageTest = await performHttpRequest(
      'get',
      `${config.baseUrl}/non-existent-page`,
      'Error Handling',
      'Access a non-existent page',
      'Should handle the error gracefully'
    );
    
    const handlesErrorGracefully = errorPageTest.success || 
      (errorPageTest.error && 
       (errorPageTest.error.includes('404') || 
        errorPageTest.error.includes('not found')));
    
    recordTestResult('Error Handling', handlesErrorGracefully, {
      url: errorPageTest.url,
      thinking: errorPageTest.thinking,
      expectedResult: 'Should handle the error gracefully',
      actualResult: `${errorPageTest.success ? `Status: ${errorPageTest.status}` : `Error: ${errorPageTest.error}`}`
    });
    
    // Test 12: Scan1 Controller Presence in API
    const scan1Test = await performHttpRequest(
      'get',
      `${config.baseUrl}/api/scan1/status`,
      'Scan1 Controller API',
      'Check Scan1 controller API via GET request',
      'API should be available and return a valid response'
    );
    
    recordTestResult('Scan1 Controller API', scan1Test.success, {
      url: scan1Test.url,
      thinking: scan1Test.thinking,
      expectedResult: 'API should be available and return a valid response',
      actualResult: scan1Test.success ? `Status: ${scan1Test.status}` : `Error: ${scan1Test.error}`
    });
    
    // Test 13: Docling Controller Presence in API
    const doclingTest = await performHttpRequest(
      'get',
      `${config.baseUrl}/api/docling/status`,
      'Docling Controller API',
      'Check Docling controller API via GET request',
      'API should be available and return a valid response'
    );
    
    recordTestResult('Docling Controller API', doclingTest.success, {
      url: doclingTest.url,
      thinking: doclingTest.thinking,
      expectedResult: 'API should be available and return a valid response',
      actualResult: doclingTest.success ? `Status: ${doclingTest.status}` : `Error: ${doclingTest.error}`
    });
    
    // Test 14: Document Upload API
    // Create a form data object with the test PDF
    const form = new FormData();
    form.append('file', fs.createReadStream(config.testPdfPath), {
      filename: 'test.pdf',
      contentType: 'application/pdf',
    });
    
    const uploadApiTest = await performHttpRequest(
      'post',
      `${config.baseUrl}/api/documents/upload`,
      'Document Upload API',
      'Upload a PDF file via POST request',
      'API should accept the file and return success',
      {
        data: form,
        headers: form.getHeaders()
      }
    );
    
    recordTestResult('Document Upload API', uploadApiTest.success, {
      url: uploadApiTest.url,
      thinking: uploadApiTest.thinking,
      expectedResult: 'API should accept the file and return success',
      actualResult: uploadApiTest.success ? `Status: ${uploadApiTest.status}` : `Error: ${uploadApiTest.error}`
    });
    
    // Generate the final report
    generateHtmlReport();
    
  } catch (error) {
    console.error('Test execution error:', error);
  }
}

// Run the tests
runTests().catch(console.error);