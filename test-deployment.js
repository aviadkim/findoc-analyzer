/**
 * Test Deployment Script
 * 
 * This script tests the deployed application to ensure all required components are present
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Create directories for screenshots and results if they don't exist
const screenshotsDir = path.join(__dirname, 'deployment-test-screenshots');
const resultsDir = path.join(__dirname, 'deployment-test-results');

if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

if (!fs.existsSync(resultsDir)) {
  fs.mkdirSync(resultsDir, { recursive: true });
}

// Get the URL from command line arguments or use default
const baseUrl = process.argv[2] || 'https://backv2-app-brfi73d4ra-zf.a.run.app';

// Test results array
const testResults = [];

// Helper function to take a screenshot
async function takeScreenshot(page, name) {
  const screenshotPath = path.join(screenshotsDir, `${name}.png`);
  await page.screenshot({ path: screenshotPath, fullPage: true });
  return screenshotPath;
}

// Helper function to log test result
function logTestResult(name, category, passed, error = null, screenshotPath = null) {
  const result = {
    name,
    category,
    passed,
    timestamp: new Date().toISOString(),
    screenshotPath: screenshotPath ? path.relative(__dirname, screenshotPath) : null
  };
  
  if (error) {
    result.error = error.message || String(error);
  }
  
  testResults.push(result);
  console.log(`Test ${name}: ${passed ? 'PASSED' : 'FAILED'}${error ? ` - ${error}` : ''}`);
  return result;
}

// Generate HTML report
function generateHtmlReport() {
  const totalTests = testResults.length;
  const passedTests = testResults.filter(r => r.passed).length;
  const failedTests = totalTests - passedTests;
  
  const categories = {};
  testResults.forEach(result => {
    if (!categories[result.category]) {
      categories[result.category] = { total: 0, passed: 0, failed: 0 };
    }
    categories[result.category].total++;
    if (result.passed) {
      categories[result.category].passed++;
    } else {
      categories[result.category].failed++;
    }
  });
  
  const html = `
  <!DOCTYPE html>
  <html>
  <head>
    <title>Deployment Test Results (${totalTests} Tests)</title>
    <style>
      body { font-family: Arial, sans-serif; margin: 20px; }
      h1, h2, h3 { color: #333; }
      .summary { background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin-bottom: 20px; }
      .category { margin-bottom: 30px; }
      .test { margin-bottom: 10px; padding: 10px; border-radius: 5px; }
      .passed { background-color: #e6ffe6; border-left: 5px solid #4CAF50; }
      .failed { background-color: #ffebeb; border-left: 5px solid #f44336; }
      .error { color: #f44336; margin-top: 5px; font-family: monospace; }
      .screenshot { max-width: 300px; margin-top: 10px; cursor: pointer; border: 1px solid #ddd; }
      .screenshot:hover { opacity: 0.8; }
      .modal { display: none; position: fixed; z-index: 1; left: 0; top: 0; width: 100%; height: 100%; overflow: auto; background-color: rgba(0,0,0,0.9); }
      .modal-content { margin: auto; display: block; max-width: 90%; max-height: 90%; }
      .close { position: absolute; top: 15px; right: 35px; color: #f1f1f1; font-size: 40px; font-weight: bold; cursor: pointer; }
      .progress-bar { height: 20px; background-color: #f5f5f5; border-radius: 5px; margin-bottom: 10px; }
      .progress { height: 100%; background-color: #4CAF50; border-radius: 5px; text-align: center; line-height: 20px; color: white; }
      .progress.failed { background-color: #f44336; }
      table { width: 100%; border-collapse: collapse; }
      th, td { padding: 8px; text-align: left; border-bottom: 1px solid #ddd; }
      th { background-color: #f2f2f2; }
    </style>
  </head>
  <body>
    <h1>Deployment Test Results</h1>
    
    <div class="summary">
      <h2>Summary</h2>
      <div class="progress-bar">
        <div class="progress" style="width: ${Math.round(passedTests / totalTests * 100)}%;">
          ${Math.round(passedTests / totalTests * 100)}%
        </div>
      </div>
      <p>Total Tests: <strong>${totalTests}</strong></p>
      <p>Passed: <strong style="color: #4CAF50;">${passedTests}</strong></p>
      <p>Failed: <strong style="color: #f44336;">${failedTests}</strong></p>
      <p>Test Run: <strong>${new Date().toLocaleString()}</strong></p>
    </div>
    
    <h2>Categories</h2>
    <table>
      <tr>
        <th>Category</th>
        <th>Total</th>
        <th>Passed</th>
        <th>Failed</th>
        <th>Pass Rate</th>
      </tr>
      ${Object.entries(categories).map(([category, stats]) => `
        <tr>
          <td>${category}</td>
          <td>${stats.total}</td>
          <td>${stats.passed}</td>
          <td>${stats.failed}</td>
          <td>${Math.round(stats.passed / stats.total * 100)}%</td>
        </tr>
      `).join('')}
    </table>
    
    ${Object.keys(categories).map(category => `
      <div class="category">
        <h2>${category}</h2>
        ${testResults.filter(r => r.category === category).map(result => `
          <div class="test ${result.passed ? 'passed' : 'failed'}">
            <h3>${result.name}</h3>
            <p><strong>Status:</strong> ${result.passed ? 'Passed' : 'Failed'}</p>
            ${result.error ? `<p class="error"><strong>Error:</strong> ${result.error}</p>` : ''}
            ${result.screenshotPath ? `
              <img src="../${result.screenshotPath}" class="screenshot" onclick="openModal(this.src)">
            ` : ''}
          </div>
        `).join('')}
      </div>
    `).join('')}
    
    <div id="imageModal" class="modal">
      <span class="close" onclick="closeModal()">&times;</span>
      <img class="modal-content" id="modalImage">
    </div>
    
    <script>
      function openModal(src) {
        document.getElementById('imageModal').style.display = 'block';
        document.getElementById('modalImage').src = src;
      }
      
      function closeModal() {
        document.getElementById('imageModal').style.display = 'none';
      }
      
      // Close modal when clicking outside the image
      window.onclick = function(event) {
        if (event.target == document.getElementById('imageModal')) {
          closeModal();
        }
      }
    </script>
  </body>
  </html>
  `;
  
  fs.writeFileSync(path.join(resultsDir, 'test-report.html'), html);
  console.log(`HTML report saved to ${path.join(resultsDir, 'test-report.html')}`);
  
  // Also save JSON results
  fs.writeFileSync(
    path.join(resultsDir, 'test-results.json'),
    JSON.stringify(testResults, null, 2)
  );
  console.log(`JSON results saved to ${path.join(resultsDir, 'test-results.json')}`);
}

// Main test function
(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1920,1080']
  });
  
  console.log(`Starting deployment test on ${baseUrl}`);
  console.log(`Timestamp: ${new Date().toISOString()}`);
  
  try {
    // Test critical UI components
    await testCriticalUIComponents(browser);
    
    // Test document processing
    await testDocumentProcessing(browser);
    
    // Test document chat
    await testDocumentChat(browser);
    
    // Test API endpoints
    await testApiEndpoints(browser);
    
  } catch (error) {
    console.error('Error in test suite:', error);
  } finally {
    // Generate test report
    generateHtmlReport();
    
    // Close the browser
    await browser.close();
    
    // Print summary
    const totalTests = testResults.length;
    const passedTests = testResults.filter(r => r.passed).length;
    const failedTests = totalTests - passedTests;
    
    console.log('\n===== TEST SUMMARY =====');
    console.log(`Total Tests: ${totalTests}`);
    console.log(`Passed: ${passedTests}`);
    console.log(`Failed: ${failedTests}`);
    console.log(`Pass Rate: ${Math.round(passedTests / totalTests * 100)}%`);
    console.log('========================');
  }
})();

// Test critical UI components
async function testCriticalUIComponents(browser) {
  const category = 'Critical UI Components';
  console.log(`\n===== TESTING ${category.toUpperCase()} =====`);
  
  const page = await browser.newPage();
  
  try {
    await page.goto(`${baseUrl}/`, { waitUntil: 'networkidle0', timeout: 30000 });
    
    // Take a screenshot of the homepage
    const screenshotPath = await takeScreenshot(page, 'homepage');
    
    // Test process document button
    const processButton = await page.$('#process-document-btn');
    logTestResult('Process Document Button', category, !!processButton, processButton ? null : 'Process document button not found', screenshotPath);
    
    // Test document chat container
    const chatContainer = await page.$('#document-chat-container');
    logTestResult('Document Chat Container', category, !!chatContainer, chatContainer ? null : 'Document chat container not found', screenshotPath);
    
    // Test document chat send button
    const sendButton = await page.$('#document-send-btn');
    logTestResult('Document Chat Send Button', category, !!sendButton, sendButton ? null : 'Document chat send button not found', screenshotPath);
    
    // Test login form
    const loginForm = await page.$('#login-form');
    logTestResult('Login Form', category, !!loginForm, loginForm ? null : 'Login form not found', screenshotPath);
    
    // Test Google login button
    const googleButton = await page.$('#google-login-btn');
    logTestResult('Google Login Button', category, !!googleButton, googleButton ? null : 'Google login button not found', screenshotPath);
    
  } catch (error) {
    console.error('Error testing critical UI components:', error);
  } finally {
    await page.close();
  }
}

// Test document processing
async function testDocumentProcessing(browser) {
  const category = 'Document Processing';
  console.log(`\n===== TESTING ${category.toUpperCase()} =====`);
  
  const page = await browser.newPage();
  
  try {
    // Go to documents page
    await page.goto(`${baseUrl}/documents-new`, { waitUntil: 'networkidle0', timeout: 30000 });
    
    // Take a screenshot of the documents page
    const screenshotPath = await takeScreenshot(page, 'documents-page');
    
    // Test document cards
    const documentCards = await page.$$('.document-card');
    logTestResult('Document Cards', category, documentCards.length > 0, documentCards.length > 0 ? null : 'No document cards found', screenshotPath);
    
    // Test process button on documents page
    const processButton = await page.$('#process-document-btn');
    logTestResult('Process Button on Documents Page', category, !!processButton, processButton ? null : 'Process button not found on documents page', screenshotPath);
    
    // Click on first document card if available
    if (documentCards.length > 0) {
      await documentCards[0].click();
      await page.waitForTimeout(3000);
      
      // Take a screenshot of the document detail page
      const detailScreenshotPath = await takeScreenshot(page, 'document-detail-page');
      
      // Test process button on document detail page
      const detailProcessButton = await page.$('#process-document-btn');
      logTestResult('Process Button on Document Detail Page', category, !!detailProcessButton, detailProcessButton ? null : 'Process button not found on document detail page', detailScreenshotPath);
      
      // Test action buttons
      const actionButtons = await page.$('.action-buttons');
      logTestResult('Action Buttons', category, !!actionButtons, actionButtons ? null : 'Action buttons not found', detailScreenshotPath);
    }
    
  } catch (error) {
    console.error('Error testing document processing:', error);
  } finally {
    await page.close();
  }
}

// Test document chat
async function testDocumentChat(browser) {
  const category = 'Document Chat';
  console.log(`\n===== TESTING ${category.toUpperCase()} =====`);
  
  const page = await browser.newPage();
  
  try {
    // Go to document chat page
    await page.goto(`${baseUrl}/document-chat`, { waitUntil: 'networkidle0', timeout: 30000 });
    
    // Take a screenshot of the document chat page
    const screenshotPath = await takeScreenshot(page, 'document-chat-page');
    
    // Test chat container
    const chatContainer = await page.$('.chat-container');
    logTestResult('Chat Container', category, !!chatContainer, chatContainer ? null : 'Chat container not found', screenshotPath);
    
    // Test chat input
    const chatInput = await page.$('#document-chat-input');
    logTestResult('Chat Input', category, !!chatInput, chatInput ? null : 'Chat input not found', screenshotPath);
    
    // Test send button
    const sendButton = await page.$('#document-send-btn');
    logTestResult('Send Button', category, !!sendButton, sendButton ? null : 'Send button not found', screenshotPath);
    
    // Test chat messages container
    const chatMessages = await page.$('.chat-messages');
    logTestResult('Chat Messages Container', category, !!chatMessages, chatMessages ? null : 'Chat messages container not found', screenshotPath);
    
  } catch (error) {
    console.error('Error testing document chat:', error);
  } finally {
    await page.close();
  }
}

// Test API endpoints
async function testApiEndpoints(browser) {
  const category = 'API Endpoints';
  console.log(`\n===== TESTING ${category.toUpperCase()} =====`);
  
  const page = await browser.newPage();
  
  try {
    // Test API health endpoint
    await page.goto(`${baseUrl}/api/health`, { waitUntil: 'networkidle0', timeout: 30000 });
    const healthContent = await page.content();
    const healthScreenshotPath = await takeScreenshot(page, 'api-health');
    logTestResult('API Health Endpoint', category, healthContent.includes('status'), healthContent.includes('status') ? null : 'API health endpoint not working', healthScreenshotPath);
    
    // Test documents API endpoint
    await page.goto(`${baseUrl}/api/documents`, { waitUntil: 'networkidle0', timeout: 30000 });
    const documentsContent = await page.content();
    const documentsScreenshotPath = await takeScreenshot(page, 'api-documents');
    logTestResult('Documents API Endpoint', category, documentsContent.includes('[') || documentsContent.includes('{'), documentsContent.includes('[') || documentsContent.includes('{') ? null : 'Documents API endpoint not working', documentsScreenshotPath);
    
  } catch (error) {
    console.error('Error testing API endpoints:', error);
  } finally {
    await page.close();
  }
}
