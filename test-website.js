/**
 * FinDoc Analyzer Web Application Testing Script
 * 
 * This script simulates a user interacting with the FinDoc Analyzer web application
 * and tests all major functionality.
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const axios = require('axios');

// Configuration
const config = {
  baseUrl: 'https://findoc-deploy.ey.r.appspot.com',
  apiBaseUrl: 'https://findoc-deploy.ey.r.appspot.com/api',
  testDocumentPath: path.join(__dirname, 'test_documents', 'messos_portfolio.pdf'),
  testUser: {
    email: 'test@example.com',
    password: 'password123',
    name: 'Test User',
    organization: 'Test Organization'
  },
  geminiApiKey: 'AIzaSyDhbGC0_7BEbGRVBujzDPZC9TYWjBJCIf4',
  outputDir: path.join(__dirname, 'test_results'),
  screenshotsDir: path.join(__dirname, 'test_results', 'screenshots')
};

// Create output directories
if (!fs.existsSync(config.outputDir)) {
  fs.mkdirSync(config.outputDir, { recursive: true });
}
if (!fs.existsSync(config.screenshotsDir)) {
  fs.mkdirSync(config.screenshotsDir, { recursive: true });
}

// Test results
const testResults = {
  startTime: new Date().toISOString(),
  endTime: null,
  tests: [],
  summary: {
    total: 0,
    passed: 0,
    failed: 0,
    skipped: 0
  }
};

// Helper function to log test results
function logTest(name, status, details = null) {
  const test = {
    name,
    status,
    timestamp: new Date().toISOString(),
    details
  };
  
  testResults.tests.push(test);
  testResults.summary.total++;
  
  if (status === 'passed') {
    testResults.summary.passed++;
    console.log(`✅ PASSED: ${name}`);
  } else if (status === 'failed') {
    testResults.summary.failed++;
    console.log(`❌ FAILED: ${name}`);
    if (details) {
      console.log(`   Details: ${details}`);
    }
  } else if (status === 'skipped') {
    testResults.summary.skipped++;
    console.log(`⚠️ SKIPPED: ${name}`);
    if (details) {
      console.log(`   Reason: ${details}`);
    }
  }
}

// Helper function to save test results
function saveTestResults() {
  testResults.endTime = new Date().toISOString();
  const resultsPath = path.join(config.outputDir, `test_results_${new Date().toISOString().replace(/:/g, '-')}.json`);
  fs.writeFileSync(resultsPath, JSON.stringify(testResults, null, 2));
  console.log(`\nTest results saved to ${resultsPath}`);
  
  // Generate HTML report
  const htmlReport = generateHtmlReport(testResults);
  const htmlPath = path.join(config.outputDir, `test_report_${new Date().toISOString().replace(/:/g, '-')}.html`);
  fs.writeFileSync(htmlPath, htmlReport);
  console.log(`HTML report saved to ${htmlPath}`);
}

// Helper function to generate HTML report
function generateHtmlReport(results) {
  const passedPercentage = Math.round((results.summary.passed / results.summary.total) * 100) || 0;
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>FinDoc Analyzer Test Report</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
      color: #333;
    }
    h1, h2, h3 {
      color: #2c3e50;
    }
    .summary {
      display: flex;
      justify-content: space-between;
      background-color: #f8f9fa;
      padding: 20px;
      border-radius: 5px;
      margin-bottom: 20px;
    }
    .summary-item {
      text-align: center;
    }
    .summary-value {
      font-size: 24px;
      font-weight: bold;
    }
    .progress-bar {
      height: 20px;
      background-color: #e9ecef;
      border-radius: 10px;
      margin-bottom: 20px;
      overflow: hidden;
    }
    .progress {
      height: 100%;
      background-color: #4caf50;
      width: ${passedPercentage}%;
    }
    .test-list {
      list-style: none;
      padding: 0;
    }
    .test-item {
      padding: 15px;
      margin-bottom: 10px;
      border-radius: 5px;
      border-left: 5px solid;
    }
    .test-passed {
      background-color: #e8f5e9;
      border-left-color: #4caf50;
    }
    .test-failed {
      background-color: #ffebee;
      border-left-color: #f44336;
    }
    .test-skipped {
      background-color: #fff8e1;
      border-left-color: #ffc107;
    }
    .test-details {
      margin-top: 10px;
      font-family: monospace;
      white-space: pre-wrap;
      background-color: rgba(0,0,0,0.05);
      padding: 10px;
      border-radius: 3px;
    }
    .timestamp {
      color: #7f8c8d;
      font-size: 0.9em;
    }
    .screenshots {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 20px;
      margin-top: 20px;
    }
    .screenshot {
      border: 1px solid #ddd;
      padding: 10px;
      border-radius: 5px;
    }
    .screenshot img {
      max-width: 100%;
      height: auto;
      border-radius: 3px;
    }
    .screenshot-title {
      margin-top: 10px;
      font-weight: bold;
      text-align: center;
    }
  </style>
</head>
<body>
  <h1>FinDoc Analyzer Test Report</h1>
  <p>
    <strong>Start Time:</strong> ${results.startTime}<br>
    <strong>End Time:</strong> ${results.endTime}<br>
    <strong>Duration:</strong> ${Math.round((new Date(results.endTime) - new Date(results.startTime)) / 1000)} seconds
  </p>
  
  <div class="summary">
    <div class="summary-item">
      <div class="summary-value">${results.summary.total}</div>
      <div>Total Tests</div>
    </div>
    <div class="summary-item">
      <div class="summary-value" style="color: #4caf50;">${results.summary.passed}</div>
      <div>Passed</div>
    </div>
    <div class="summary-item">
      <div class="summary-value" style="color: #f44336;">${results.summary.failed}</div>
      <div>Failed</div>
    </div>
    <div class="summary-item">
      <div class="summary-value" style="color: #ffc107;">${results.summary.skipped}</div>
      <div>Skipped</div>
    </div>
    <div class="summary-item">
      <div class="summary-value">${passedPercentage}%</div>
      <div>Success Rate</div>
    </div>
  </div>
  
  <div class="progress-bar">
    <div class="progress"></div>
  </div>
  
  <h2>Test Results</h2>
  <ul class="test-list">
    ${results.tests.map(test => `
      <li class="test-item test-${test.status}">
        <h3>${test.name}</h3>
        <div class="timestamp">Timestamp: ${test.timestamp}</div>
        ${test.details ? `<div class="test-details">${test.details}</div>` : ''}
      </li>
    `).join('')}
  </ul>
  
  <h2>Screenshots</h2>
  <div class="screenshots">
    ${fs.readdirSync(config.screenshotsDir).map(file => `
      <div class="screenshot">
        <img src="screenshots/${file}" alt="${file}">
        <div class="screenshot-title">${file.replace('.png', '')}</div>
      </div>
    `).join('')}
  </div>
</body>
</html>`;
}

// Main test function
async function runTests() {
  console.log('Starting FinDoc Analyzer Web Application Tests');
  console.log(`Base URL: ${config.baseUrl}`);
  console.log('-------------------------------------------');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    // Test 1: Check if the website is accessible
    try {
      await page.goto(config.baseUrl);
      await page.waitForLoadState('networkidle');
      await page.screenshot({ path: path.join(config.screenshotsDir, '01_homepage.png') });
      logTest('Website Accessibility', 'passed');
    } catch (error) {
      logTest('Website Accessibility', 'failed', error.message);
      // If we can't access the website, we can't continue with the tests
      throw new Error('Cannot access the website. Aborting tests.');
    }
    
    // Test 2: Check API health
    try {
      const response = await axios.get(`${config.apiBaseUrl}/health`);
      if (response.status === 200 && response.data.success) {
        logTest('API Health Check', 'passed', JSON.stringify(response.data));
      } else {
        logTest('API Health Check', 'failed', `Unexpected response: ${JSON.stringify(response.data)}`);
      }
    } catch (error) {
      logTest('API Health Check', 'failed', error.message);
    }
    
    // Test 3: User Registration
    try {
      // Click on the Register button
      await page.click('text=Register');
      await page.waitForTimeout(1000);
      
      // Fill in the registration form
      await page.fill('input[name="name"]', config.testUser.name);
      await page.fill('input[name="email"]', config.testUser.email);
      await page.fill('input[name="password"]', config.testUser.password);
      await page.fill('input[name="organization"]', config.testUser.organization);
      
      await page.screenshot({ path: path.join(config.screenshotsDir, '02_registration_form.png') });
      
      // Submit the form
      await page.click('button:has-text("Register")');
      await page.waitForTimeout(2000);
      
      // Check if registration was successful
      const currentUrl = page.url();
      if (currentUrl.includes('/dashboard')) {
        logTest('User Registration', 'passed');
      } else {
        // Try to login instead
        logTest('User Registration', 'skipped', 'User might already exist. Trying to login instead.');
        
        // Click on the Login button
        await page.click('text=Login');
        await page.waitForTimeout(1000);
        
        // Fill in the login form
        await page.fill('input[name="email"]', config.testUser.email);
        await page.fill('input[name="password"]', config.testUser.password);
        
        await page.screenshot({ path: path.join(config.screenshotsDir, '03_login_form.png') });
        
        // Submit the form
        await page.click('button:has-text("Login")');
        await page.waitForTimeout(2000);
        
        // Check if login was successful
        const loginUrl = page.url();
        if (loginUrl.includes('/dashboard')) {
          logTest('User Login', 'passed');
        } else {
          logTest('User Login', 'failed', 'Could not login with the provided credentials');
          throw new Error('Authentication failed. Aborting tests.');
        }
      }
    } catch (error) {
      logTest('User Authentication', 'failed', error.message);
      // If authentication fails, we can't continue with the tests
      throw new Error('Authentication failed. Aborting tests.');
    }
    
    // Test 4: Dashboard Accessibility
    try {
      await page.waitForSelector('h1:has-text("Dashboard")');
      await page.screenshot({ path: path.join(config.screenshotsDir, '04_dashboard.png') });
      logTest('Dashboard Accessibility', 'passed');
    } catch (error) {
      logTest('Dashboard Accessibility', 'failed', error.message);
    }
    
    // Test 5: Navigation Menu
    try {
      // Check if all navigation items are present
      const navItems = [
        'Dashboard',
        'Upload Documents',
        'My Documents',
        'Portfolio Analysis',
        'Chat with Documents',
        'Securities',
        'Reports'
      ];
      
      for (const item of navItems) {
        const isVisible = await page.isVisible(`text=${item}`);
        if (!isVisible) {
          throw new Error(`Navigation item "${item}" is not visible`);
        }
      }
      
      logTest('Navigation Menu', 'passed', `All ${navItems.length} navigation items are present`);
    } catch (error) {
      logTest('Navigation Menu', 'failed', error.message);
    }
    
    // Test 6: Document Upload
    try {
      // Navigate to Upload Documents page
      await page.click('text=Upload Documents');
      await page.waitForTimeout(1000);
      
      // Check if the upload area is visible
      const uploadAreaVisible = await page.isVisible('.upload-area');
      if (!uploadAreaVisible) {
        throw new Error('Upload area is not visible');
      }
      
      await page.screenshot({ path: path.join(config.screenshotsDir, '05_upload_page.png') });
      
      // Upload a test document
      const fileInput = await page.$('input[type="file"]');
      if (!fileInput) {
        throw new Error('File input not found');
      }
      
      await fileInput.setInputFiles(config.testDocumentPath);
      await page.waitForTimeout(2000);
      
      // Check if the upload was successful
      const uploadSuccessMessage = await page.isVisible('text=Upload Successful');
      if (uploadSuccessMessage) {
        logTest('Document Upload', 'passed');
      } else {
        // Check for error message
        const errorMessage = await page.textContent('.upload-area');
        throw new Error(`Upload failed: ${errorMessage}`);
      }
      
      await page.screenshot({ path: path.join(config.screenshotsDir, '06_upload_success.png') });
    } catch (error) {
      logTest('Document Upload', 'failed', error.message);
    }
    
    // Test 7: Document Processing
    try {
      // Navigate to My Documents page
      await page.click('text=My Documents');
      await page.waitForTimeout(2000);
      
      // Check if the document is listed
      const documentVisible = await page.isVisible('.document-card');
      if (!documentVisible) {
        throw new Error('Document not found in the list');
      }
      
      await page.screenshot({ path: path.join(config.screenshotsDir, '07_documents_list.png') });
      
      // Click on the document to view details
      await page.click('.document-card');
      await page.waitForTimeout(2000);
      
      // Check if the document details are displayed
      const documentDetailsVisible = await page.isVisible('.document-details');
      if (!documentDetailsVisible) {
        throw new Error('Document details not displayed');
      }
      
      await page.screenshot({ path: path.join(config.screenshotsDir, '08_document_details.png') });
      
      // Check if the document has been processed
      const processedStatus = await page.isVisible('text=Processed');
      if (processedStatus) {
        logTest('Document Processing', 'passed');
      } else {
        // Check if the document is still processing
        const processingStatus = await page.isVisible('text=Processing');
        if (processingStatus) {
          logTest('Document Processing', 'skipped', 'Document is still being processed');
        } else {
          // Check for error status
          const errorStatus = await page.isVisible('text=Error');
          if (errorStatus) {
            const errorMessage = await page.textContent('.status-error');
            throw new Error(`Processing failed: ${errorMessage}`);
          } else {
            throw new Error('Document status is unknown');
          }
        }
      }
    } catch (error) {
      logTest('Document Processing', 'failed', error.message);
    }
    
    // Test 8: Chat with Documents
    try {
      // Navigate to Chat with Documents page
      await page.click('text=Chat with Documents');
      await page.waitForTimeout(2000);
      
      // Check if the chat interface is visible
      const chatInterfaceVisible = await page.isVisible('.chat-interface');
      if (!chatInterfaceVisible) {
        throw new Error('Chat interface not visible');
      }
      
      await page.screenshot({ path: path.join(config.screenshotsDir, '09_chat_interface.png') });
      
      // Send a test message
      await page.fill('.chat-input', 'What securities are in this document?');
      await page.click('button:has-text("Send")');
      await page.waitForTimeout(5000);
      
      // Check if a response was received
      const responseVisible = await page.isVisible('.chat-message.response');
      if (responseVisible) {
        const responseText = await page.textContent('.chat-message.response');
        logTest('Chat with Documents', 'passed', `Response received: ${responseText.substring(0, 100)}...`);
      } else {
        throw new Error('No response received from the chat');
      }
      
      await page.screenshot({ path: path.join(config.screenshotsDir, '10_chat_response.png') });
    } catch (error) {
      logTest('Chat with Documents', 'failed', error.message);
    }
    
    // Test 9: Portfolio Analysis
    try {
      // Navigate to Portfolio Analysis page
      await page.click('text=Portfolio Analysis');
      await page.waitForTimeout(2000);
      
      // Check if the portfolio analysis interface is visible
      const portfolioAnalysisVisible = await page.isVisible('.portfolio-analysis');
      if (!portfolioAnalysisVisible) {
        throw new Error('Portfolio analysis interface not visible');
      }
      
      await page.screenshot({ path: path.join(config.screenshotsDir, '11_portfolio_analysis.png') });
      
      // Check if charts are displayed
      const chartsVisible = await page.isVisible('.chart');
      if (chartsVisible) {
        logTest('Portfolio Analysis', 'passed');
      } else {
        throw new Error('Charts not displayed in portfolio analysis');
      }
    } catch (error) {
      logTest('Portfolio Analysis', 'failed', error.message);
    }
    
    // Test 10: Securities List
    try {
      // Navigate to Securities page
      await page.click('text=Securities');
      await page.waitForTimeout(2000);
      
      // Check if the securities list is visible
      const securitiesListVisible = await page.isVisible('.securities-list');
      if (!securitiesListVisible) {
        throw new Error('Securities list not visible');
      }
      
      await page.screenshot({ path: path.join(config.screenshotsDir, '12_securities_list.png') });
      
      // Check if securities are displayed
      const securitiesVisible = await page.isVisible('.security-item');
      if (securitiesVisible) {
        logTest('Securities List', 'passed');
      } else {
        throw new Error('No securities displayed in the list');
      }
    } catch (error) {
      logTest('Securities List', 'failed', error.message);
    }
    
    // Test 11: Reports
    try {
      // Navigate to Reports page
      await page.click('text=Reports');
      await page.waitForTimeout(2000);
      
      // Check if the reports interface is visible
      const reportsInterfaceVisible = await page.isVisible('.reports-interface');
      if (!reportsInterfaceVisible) {
        throw new Error('Reports interface not visible');
      }
      
      await page.screenshot({ path: path.join(config.screenshotsDir, '13_reports.png') });
      
      // Check if reports are displayed
      const reportsVisible = await page.isVisible('.report-item');
      if (reportsVisible) {
        logTest('Reports', 'passed');
      } else {
        throw new Error('No reports displayed');
      }
    } catch (error) {
      logTest('Reports', 'failed', error.message);
    }
    
    // Test 12: API Key Management
    try {
      // Navigate to API Keys page
      await page.click('text=API Keys');
      await page.waitForTimeout(2000);
      
      // Check if the API keys interface is visible
      const apiKeysInterfaceVisible = await page.isVisible('.api-keys-interface');
      if (!apiKeysInterfaceVisible) {
        throw new Error('API keys interface not visible');
      }
      
      await page.screenshot({ path: path.join(config.screenshotsDir, '14_api_keys.png') });
      
      // Check if API keys are displayed
      const apiKeysVisible = await page.isVisible('.api-key-item');
      if (apiKeysVisible) {
        logTest('API Key Management', 'passed');
      } else {
        // Try to add a new API key
        await page.click('button:has-text("Add API Key")');
        await page.waitForTimeout(1000);
        
        // Fill in the API key form
        await page.fill('input[name="service"]', 'gemini');
        await page.fill('input[name="key"]', config.geminiApiKey);
        
        // Submit the form
        await page.click('button:has-text("Save")');
        await page.waitForTimeout(2000);
        
        // Check if the API key was added
        const apiKeyAdded = await page.isVisible('.api-key-item');
        if (apiKeyAdded) {
          logTest('API Key Management', 'passed', 'Added a new API key');
        } else {
          throw new Error('Failed to add a new API key');
        }
      }
    } catch (error) {
      logTest('API Key Management', 'failed', error.message);
    }
    
    // Test 13: Logout
    try {
      // Click on the logout button
      await page.click('text=Logout');
      await page.waitForTimeout(2000);
      
      // Check if we're redirected to the login page
      const loginVisible = await page.isVisible('text=Login');
      if (loginVisible) {
        logTest('Logout', 'passed');
      } else {
        throw new Error('Not redirected to login page after logout');
      }
      
      await page.screenshot({ path: path.join(config.screenshotsDir, '15_logout.png') });
    } catch (error) {
      logTest('Logout', 'failed', error.message);
    }
    
  } catch (error) {
    console.error('Test execution error:', error);
  } finally {
    // Save test results
    saveTestResults();
    
    // Close the browser
    await browser.close();
    
    // Print summary
    console.log('\nTest Summary:');
    console.log(`Total: ${testResults.summary.total}`);
    console.log(`Passed: ${testResults.summary.passed}`);
    console.log(`Failed: ${testResults.summary.failed}`);
    console.log(`Skipped: ${testResults.summary.skipped}`);
    console.log(`Success Rate: ${Math.round((testResults.summary.passed / testResults.summary.total) * 100)}%`);
  }
}

// Run the tests
runTests().catch(console.error);
