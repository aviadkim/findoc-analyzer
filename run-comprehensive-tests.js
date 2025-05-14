/**
 * Comprehensive Test Script for FinDoc Analyzer
 * 
 * This script runs a comprehensive set of tests for the FinDoc Analyzer application,
 * focusing on PDF processing functionality.
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const axios = require('axios');

// Configuration
const config = {
  baseUrl: 'http://localhost:8080',
  apiBaseUrl: 'http://localhost:8080/api',
  testFilesDir: path.join(__dirname, 'test-files'),
  resultsDir: path.join(__dirname, 'test-results'),
  screenshotsDir: path.join(__dirname, 'test-screenshots'),
  headless: false,
  slowMo: 100,
  timeout: 60000
};

// Create directories if they don't exist
fs.mkdirSync(config.testFilesDir, { recursive: true });
fs.mkdirSync(config.resultsDir, { recursive: true });
fs.mkdirSync(config.screenshotsDir, { recursive: true });

// Test results
const testResults = {
  startTime: new Date().toISOString(),
  endTime: null,
  totalTests: 0,
  passedTests: 0,
  failedTests: 0,
  skippedTests: 0,
  tests: []
};

/**
 * Run a test case
 * @param {string} testId - Test ID
 * @param {string} testName - Test name
 * @param {Function} testFn - Test function
 */
async function runTest(testId, testName, testFn) {
  console.log(`\n=== Running Test: ${testId} - ${testName} ===`);
  
  const testResult = {
    id: testId,
    name: testName,
    status: 'pending',
    startTime: new Date().toISOString(),
    endTime: null,
    duration: 0,
    error: null,
    screenshots: []
  };
  
  testResults.totalTests++;
  
  try {
    await testFn(testResult);
    testResult.status = 'passed';
    testResults.passedTests++;
    console.log(`✅ Test ${testId} - ${testName} PASSED`);
  } catch (error) {
    testResult.status = 'failed';
    testResult.error = error.message;
    testResults.failedTests++;
    console.error(`❌ Test ${testId} - ${testName} FAILED: ${error.message}`);
  }
  
  testResult.endTime = new Date().toISOString();
  testResult.duration = new Date(testResult.endTime) - new Date(testResult.startTime);
  
  testResults.tests.push(testResult);
}

/**
 * Skip a test case
 * @param {string} testId - Test ID
 * @param {string} testName - Test name
 * @param {string} reason - Reason for skipping
 */
function skipTest(testId, testName, reason) {
  console.log(`\n=== Skipping Test: ${testId} - ${testName} ===`);
  console.log(`Reason: ${reason}`);
  
  const testResult = {
    id: testId,
    name: testName,
    status: 'skipped',
    startTime: new Date().toISOString(),
    endTime: new Date().toISOString(),
    duration: 0,
    error: null,
    reason: reason,
    screenshots: []
  };
  
  testResults.totalTests++;
  testResults.skippedTests++;
  testResults.tests.push(testResult);
}

/**
 * Take a screenshot
 * @param {Page} page - Playwright page
 * @param {string} testId - Test ID
 * @param {string} name - Screenshot name
 * @param {object} testResult - Test result object
 * @returns {string} - Screenshot path
 */
async function takeScreenshot(page, testId, name, testResult) {
  const screenshotName = `${testId}-${name.replace(/\s+/g, '-').toLowerCase()}.png`;
  const screenshotPath = path.join(config.screenshotsDir, screenshotName);
  
  await page.screenshot({ path: screenshotPath });
  
  testResult.screenshots.push(screenshotName);
  
  return screenshotPath;
}

/**
 * Save test results
 */
function saveTestResults() {
  testResults.endTime = new Date().toISOString();
  
  const resultsPath = path.join(config.resultsDir, `test-results-${new Date().toISOString().replace(/:/g, '-')}.json`);
  fs.writeFileSync(resultsPath, JSON.stringify(testResults, null, 2));
  
  console.log(`\n=== Test Results ===`);
  console.log(`Total Tests: ${testResults.totalTests}`);
  console.log(`Passed Tests: ${testResults.passedTests}`);
  console.log(`Failed Tests: ${testResults.failedTests}`);
  console.log(`Skipped Tests: ${testResults.skippedTests}`);
  console.log(`Results saved to: ${resultsPath}`);
}

/**
 * Create a test PDF file
 * @param {string} fileName - File name
 * @param {string} content - File content
 * @returns {string} - File path
 */
function createTestPdf(fileName, content) {
  const filePath = path.join(config.testFilesDir, fileName);
  
  // Check if file already exists
  if (fs.existsSync(filePath)) {
    return filePath;
  }
  
  // For now, we'll just create a text file with .pdf extension
  // In a real scenario, you would use a PDF generation library
  fs.writeFileSync(filePath, content);
  
  return filePath;
}

/**
 * Run all tests
 */
async function runAllTests() {
  // Create test files
  createTestPdf('financial_statement.pdf', 'This is a financial statement PDF');
  createTestPdf('portfolio_report.pdf', 'This is a portfolio report PDF');
  createTestPdf('investment_summary.pdf', 'This is an investment summary PDF');
  createTestPdf('account_statement.pdf', 'This is an account statement PDF');
  
  // Launch browser
  const browser = await chromium.launch({
    headless: config.headless,
    slowMo: config.slowMo
  });
  
  // Create context and page
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    // 1. Navigation Tests
    await runTest('NAV-01', 'Test Sidebar Navigation', async (testResult) => {
      await page.goto(config.baseUrl);
      await takeScreenshot(page, 'NAV-01', 'dashboard', testResult);
      
      // Test all sidebar links
      const sidebarLinks = [
        { href: '/', text: 'Dashboard' },
        { href: '/documents-new', text: 'My Documents' },
        { href: '/analytics-new', text: 'Analytics' },
        { href: '/upload', text: 'Upload' },
        { href: '/document-chat', text: 'Document Chat' },
        { href: '/document-comparison', text: 'Document Comparison' },
        { href: '/feedback', text: 'Feedback' }
      ];
      
      for (const link of sidebarLinks) {
        console.log(`Testing navigation to ${link.text} (${link.href})`);
        
        // Click the link
        await page.click(`a[href="${link.href}"]`);
        
        // Wait for navigation
        await page.waitForTimeout(1000);
        
        // Take screenshot
        await takeScreenshot(page, 'NAV-01', link.text, testResult);
        
        // Verify URL
        const url = page.url();
        if (!url.includes(link.href)) {
          throw new Error(`Navigation to ${link.text} failed. Expected URL to include ${link.href}, but got ${url}`);
        }
      }
    });
    
    // 2. Document Upload Tests
    await runTest('UP-01', 'Test Document Upload', async (testResult) => {
      await page.goto(`${config.baseUrl}/upload`);
      await takeScreenshot(page, 'UP-01', 'upload-page', testResult);
      
      // Select a file
      const fileInput = await page.$('input[type="file"]');
      await fileInput.setInputFiles(path.join(config.testFilesDir, 'financial_statement.pdf'));
      
      // Verify file name appears
      const fileName = await page.textContent('#file-name');
      if (!fileName.includes('financial_statement.pdf')) {
        throw new Error(`File name not displayed correctly. Expected 'financial_statement.pdf', but got '${fileName}'`);
      }
      
      await takeScreenshot(page, 'UP-01', 'file-selected', testResult);
      
      // Click upload button
      await page.click('#upload-btn');
      
      // Verify progress bar appears
      const progressVisible = await page.isVisible('#progress-container');
      if (!progressVisible) {
        throw new Error('Progress container not visible after clicking upload button');
      }
      
      await takeScreenshot(page, 'UP-01', 'uploading', testResult);
      
      // Wait for upload to complete (max 30 seconds)
      await page.waitForFunction(() => {
        const progressBar = document.querySelector('#progress-bar');
        return progressBar && progressBar.style.width === '100%';
      }, { timeout: 30000 });
      
      await takeScreenshot(page, 'UP-01', 'upload-complete', testResult);
      
      // Verify upload status
      const uploadStatus = await page.textContent('#upload-status');
      if (!uploadStatus.includes('Processing complete')) {
        throw new Error(`Upload status not correct. Expected 'Processing complete', but got '${uploadStatus}'`);
      }
      
      // Wait for redirect
      await page.waitForTimeout(3000);
      
      // Verify redirect to document details page
      const url = page.url();
      if (!url.includes('document-details.html')) {
        throw new Error(`Redirect after upload failed. Expected URL to include 'document-details.html', but got ${url}`);
      }
      
      await takeScreenshot(page, 'UP-01', 'document-details', testResult);
    });
    
    // 3. Document Chat Tests
    await runTest('CHAT-01', 'Test Document Chat', async (testResult) => {
      await page.goto(`${config.baseUrl}/document-chat`);
      await takeScreenshot(page, 'CHAT-01', 'chat-page', testResult);
      
      // Select a document
      await page.selectOption('#document-select', 'doc-1');
      
      // Wait for document to load
      await page.waitForTimeout(1000);
      
      await takeScreenshot(page, 'CHAT-01', 'document-selected', testResult);
      
      // Verify chat input is enabled
      const inputDisabled = await page.$eval('#question-input', el => el.disabled);
      if (inputDisabled) {
        throw new Error('Chat input is still disabled after selecting a document');
      }
      
      // Type a question
      await page.fill('#question-input', 'What is the total revenue?');
      
      await takeScreenshot(page, 'CHAT-01', 'question-typed', testResult);
      
      // Send the question
      await page.click('#send-btn');
      
      // Wait for response
      await page.waitForTimeout(3000);
      
      await takeScreenshot(page, 'CHAT-01', 'response-received', testResult);
      
      // Verify response
      const messages = await page.$$('.message');
      if (messages.length < 3) {
        throw new Error(`Expected at least 3 messages (welcome, question, answer), but got ${messages.length}`);
      }
      
      const lastMessage = await messages[messages.length - 1].textContent();
      if (!lastMessage.includes('revenue')) {
        throw new Error(`Response does not contain expected content. Got: '${lastMessage}'`);
      }
    });
    
    // 4. scan1 Integration Tests
    await runTest('SCAN1-01', 'Test scan1 Status', async (testResult) => {
      // Test scan1 status API
      try {
        const response = await axios.get(`${config.apiBaseUrl}/scan1/status`);
        
        console.log('scan1 status response:', response.data);
        
        if (!response.data.success) {
          throw new Error(`scan1 status API returned success: false. Error: ${response.data.error}`);
        }
        
        // Take screenshot of current page
        await takeScreenshot(page, 'SCAN1-01', 'current-page', testResult);
      } catch (error) {
        throw new Error(`Error calling scan1 status API: ${error.message}`);
      }
    });
    
    // 5. API Tests
    await runTest('API-01', 'Test Documents API', async (testResult) => {
      // Test documents API
      try {
        const response = await axios.get(`${config.apiBaseUrl}/documents`);
        
        console.log('Documents API response:', response.data);
        
        if (!Array.isArray(response.data)) {
          throw new Error(`Documents API did not return an array. Got: ${typeof response.data}`);
        }
        
        if (response.data.length === 0) {
          console.warn('Documents API returned an empty array. This might be expected if no documents have been uploaded.');
        }
        
        // Take screenshot of current page
        await takeScreenshot(page, 'API-01', 'current-page', testResult);
      } catch (error) {
        throw new Error(`Error calling documents API: ${error.message}`);
      }
    });
    
    // 6. UI/UX Tests
    await runTest('UI-01', 'Test Responsive Design', async (testResult) => {
      // Test responsive design
      await page.goto(config.baseUrl);
      
      // Desktop size
      await page.setViewportSize({ width: 1920, height: 1080 });
      await takeScreenshot(page, 'UI-01', 'desktop', testResult);
      
      // Tablet size
      await page.setViewportSize({ width: 768, height: 1024 });
      await takeScreenshot(page, 'UI-01', 'tablet', testResult);
      
      // Mobile size
      await page.setViewportSize({ width: 375, height: 667 });
      await takeScreenshot(page, 'UI-01', 'mobile', testResult);
      
      // Reset to desktop size
      await page.setViewportSize({ width: 1920, height: 1080 });
    });
    
  } finally {
    // Close browser
    await browser.close();
    
    // Save test results
    saveTestResults();
  }
}

// Run all tests
runAllTests().catch(console.error);
