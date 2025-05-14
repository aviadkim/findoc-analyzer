/**
 * Test Document Chat Functionality
 *
 * This script tests the document chat functionality of the FinDoc Analyzer application.
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

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
  
  const resultsPath = path.join(config.resultsDir, `document-chat-test-results-${new Date().toISOString().replace(/:/g, '-')}.json`);
  fs.writeFileSync(resultsPath, JSON.stringify(testResults, null, 2));
  
  console.log(`\n=== Test Results ===`);
  console.log(`Total Tests: ${testResults.totalTests}`);
  console.log(`Passed Tests: ${testResults.passedTests}`);
  console.log(`Failed Tests: ${testResults.failedTests}`);
  console.log(`Skipped Tests: ${testResults.skippedTests}`);
  console.log(`Results saved to: ${resultsPath}`);
}

/**
 * Run all tests
 */
async function runAllTests() {
  // Launch browser
  const browser = await chromium.launch({
    headless: config.headless,
    slowMo: config.slowMo
  });
  
  // Create context and page
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    // 1. Test Document Chat Page Load
    await runTest('CHAT-01', 'Test Document Chat Page Load', async (testResult) => {
      await page.goto(`${config.baseUrl}/document-chat`);
      await takeScreenshot(page, 'CHAT-01', 'chat-page', testResult);
      
      // Verify page title
      const title = await page.title();
      if (!title.includes('Document Chat')) {
        throw new Error(`Page title does not include 'Document Chat'. Got: '${title}'`);
      }
      
      // Verify page content
      const pageTitle = await page.textContent('.page-title');
      if (!pageTitle.includes('Document Chat')) {
        throw new Error(`Page title does not include 'Document Chat'. Got: '${pageTitle}'`);
      }
      
      // Verify document selector
      const documentSelector = await page.isVisible('#document-select');
      if (!documentSelector) {
        throw new Error('Document selector is not visible');
      }
      
      // Verify chat messages
      const chatMessages = await page.isVisible('.chat-messages');
      if (!chatMessages) {
        throw new Error('Chat messages container is not visible');
      }
      
      // Verify chat input
      const chatInput = await page.isVisible('#question-input');
      if (!chatInput) {
        throw new Error('Chat input is not visible');
      }
      
      // Verify send button
      const sendButton = await page.isVisible('#send-btn');
      if (!sendButton) {
        throw new Error('Send button is not visible');
      }
    });
    
    // 2. Test Document Selection
    await runTest('CHAT-02', 'Test Document Selection', async (testResult) => {
      await page.goto(`${config.baseUrl}/document-chat`);
      await takeScreenshot(page, 'CHAT-02', 'before-selection', testResult);
      
      // Verify that chat input is disabled before selecting a document
      const inputDisabledBefore = await page.$eval('#question-input', el => el.disabled);
      if (!inputDisabledBefore) {
        throw new Error('Chat input should be disabled before selecting a document');
      }
      
      // Select a document
      await page.selectOption('#document-select', 'doc-1');
      
      // Wait for document to load
      await page.waitForTimeout(1000);
      
      await takeScreenshot(page, 'CHAT-02', 'after-selection', testResult);
      
      // Verify that chat input is enabled after selecting a document
      const inputDisabledAfter = await page.$eval('#question-input', el => el.disabled);
      if (inputDisabledAfter) {
        throw new Error('Chat input should be enabled after selecting a document');
      }
      
      // Verify welcome message
      const welcomeMessage = await page.textContent('.chat-messages');
      if (!welcomeMessage.includes('loaded')) {
        throw new Error(`Welcome message does not indicate document loaded. Got: '${welcomeMessage}'`);
      }
    });
    
    // 3. Test Asking Questions
    await runTest('CHAT-03', 'Test Asking Questions', async (testResult) => {
      await page.goto(`${config.baseUrl}/document-chat`);
      
      // Select a document
      await page.selectOption('#document-select', 'doc-1');
      
      // Wait for document to load
      await page.waitForTimeout(1000);
      
      await takeScreenshot(page, 'CHAT-03', 'before-question', testResult);
      
      // Type a question
      await page.fill('#question-input', 'What is the total revenue?');
      
      await takeScreenshot(page, 'CHAT-03', 'question-typed', testResult);
      
      // Send the question
      await page.click('#send-btn');
      
      // Wait for response
      await page.waitForTimeout(3000);
      
      await takeScreenshot(page, 'CHAT-03', 'after-response', testResult);
      
      // Verify that the question appears in the chat
      const messages = await page.$$('.message');
      if (messages.length < 3) {
        throw new Error(`Expected at least 3 messages (welcome, question, answer), but got ${messages.length}`);
      }
      
      const questionMessage = await messages[messages.length - 2].textContent();
      if (!questionMessage.includes('revenue')) {
        throw new Error(`Question message does not contain expected content. Got: '${questionMessage}'`);
      }
      
      // Verify that the answer appears in the chat
      const answerMessage = await messages[messages.length - 1].textContent();
      if (!answerMessage.includes('revenue')) {
        throw new Error(`Answer message does not contain expected content. Got: '${answerMessage}'`);
      }
    });
    
    // 4. Test Multiple Questions
    await runTest('CHAT-04', 'Test Multiple Questions', async (testResult) => {
      await page.goto(`${config.baseUrl}/document-chat`);
      
      // Select a document
      await page.selectOption('#document-select', 'doc-1');
      
      // Wait for document to load
      await page.waitForTimeout(1000);
      
      // Ask first question
      await page.fill('#question-input', 'What is the total revenue?');
      await page.click('#send-btn');
      
      // Wait for response
      await page.waitForTimeout(3000);
      
      await takeScreenshot(page, 'CHAT-04', 'after-first-question', testResult);
      
      // Ask second question
      await page.fill('#question-input', 'What is the profit margin?');
      await page.click('#send-btn');
      
      // Wait for response
      await page.waitForTimeout(3000);
      
      await takeScreenshot(page, 'CHAT-04', 'after-second-question', testResult);
      
      // Verify that both questions and answers appear in the chat
      const messages = await page.$$('.message');
      if (messages.length < 5) {
        throw new Error(`Expected at least 5 messages (welcome, question1, answer1, question2, answer2), but got ${messages.length}`);
      }
      
      // Verify second question
      const question2Message = await messages[messages.length - 2].textContent();
      if (!question2Message.includes('profit')) {
        throw new Error(`Second question message does not contain expected content. Got: '${question2Message}'`);
      }
      
      // Verify second answer
      const answer2Message = await messages[messages.length - 1].textContent();
      if (!answer2Message.includes('profit')) {
        throw new Error(`Second answer message does not contain expected content. Got: '${answer2Message}'`);
      }
    });
    
    // 5. Test Changing Documents
    await runTest('CHAT-05', 'Test Changing Documents', async (testResult) => {
      await page.goto(`${config.baseUrl}/document-chat`);
      
      // Select first document
      await page.selectOption('#document-select', 'doc-1');
      
      // Wait for document to load
      await page.waitForTimeout(1000);
      
      await takeScreenshot(page, 'CHAT-05', 'first-document', testResult);
      
      // Ask a question about the first document
      await page.fill('#question-input', 'What is the total revenue?');
      await page.click('#send-btn');
      
      // Wait for response
      await page.waitForTimeout(3000);
      
      // Select second document
      await page.selectOption('#document-select', 'doc-2');
      
      // Wait for document to load
      await page.waitForTimeout(1000);
      
      await takeScreenshot(page, 'CHAT-05', 'second-document', testResult);
      
      // Verify that the chat is reset
      const messages = await page.$$('.message');
      if (messages.length !== 1) {
        throw new Error(`Expected 1 message (welcome), but got ${messages.length}`);
      }
      
      // Verify welcome message for second document
      const welcomeMessage = await messages[0].textContent();
      if (!welcomeMessage.includes('loaded')) {
        throw new Error(`Welcome message does not indicate document loaded. Got: '${welcomeMessage}'`);
      }
      
      // Ask a question about the second document
      await page.fill('#question-input', 'What is the total value?');
      await page.click('#send-btn');
      
      // Wait for response
      await page.waitForTimeout(3000);
      
      await takeScreenshot(page, 'CHAT-05', 'after-question', testResult);
      
      // Verify that the question and answer appear in the chat
      const messagesAfter = await page.$$('.message');
      if (messagesAfter.length < 3) {
        throw new Error(`Expected at least 3 messages (welcome, question, answer), but got ${messagesAfter.length}`);
      }
      
      // Verify answer
      const answerMessage = await messagesAfter[messagesAfter.length - 1].textContent();
      if (!answerMessage.includes('value')) {
        throw new Error(`Answer message does not contain expected content. Got: '${answerMessage}'`);
      }
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
