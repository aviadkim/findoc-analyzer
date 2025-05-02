/**
 * Playwright Setup for FinDoc Analyzer QA Testing
 * 
 * This script sets up Playwright for automated testing of the FinDoc Analyzer application.
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// Configuration
const config = {
  baseUrl: 'https://findoc-deploy.ey.r.appspot.com',
  testPdfsDir: path.join(__dirname, 'test-pdfs'),
  resultsDir: path.join(__dirname, 'test-results'),
  screenshotsDir: path.join(__dirname, 'screenshots'),
  credentials: {
    username: 'test@example.com',
    password: 'password123'
  },
  headless: false, // Set to true for headless mode
  slowMo: 100 // Slow down execution by 100ms
};

// Create directories if they don't exist
fs.mkdirSync(config.testPdfsDir, { recursive: true });
fs.mkdirSync(config.resultsDir, { recursive: true });
fs.mkdirSync(config.screenshotsDir, { recursive: true });

/**
 * Initialize Playwright browser
 * @returns {Promise<Browser>} Playwright browser instance
 */
async function initBrowser() {
  console.log('Initializing browser...');
  
  const browser = await chromium.launch({
    headless: config.headless,
    slowMo: config.slowMo
  });
  
  console.log('Browser initialized');
  
  return browser;
}

/**
 * Create a new browser context
 * @param {Browser} browser - Playwright browser instance
 * @returns {Promise<BrowserContext>} Playwright browser context
 */
async function createContext(browser) {
  console.log('Creating browser context...');
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    recordVideo: {
      dir: path.join(config.resultsDir, 'videos')
    }
  });
  
  console.log('Browser context created');
  
  return context;
}

/**
 * Navigate to the FinDoc Analyzer application
 * @param {Page} page - Playwright page
 * @returns {Promise<void>}
 */
async function navigateToApp(page) {
  console.log(`Navigating to ${config.baseUrl}...`);
  
  await page.goto(config.baseUrl);
  
  console.log('Navigation complete');
}

/**
 * Login to the FinDoc Analyzer application
 * @param {Page} page - Playwright page
 * @returns {Promise<boolean>} True if login successful, false otherwise
 */
async function login(page) {
  console.log('Attempting to login...');
  
  try {
    // Check if login form is present
    const loginFormVisible = await page.isVisible('input[type="email"]');
    
    if (loginFormVisible) {
      // Fill in login form
      await page.fill('input[type="email"]', config.credentials.username);
      await page.fill('input[type="password"]', config.credentials.password);
      await page.click('button[type="submit"]');
      
      // Wait for navigation to complete
      await page.waitForNavigation();
      
      console.log('Login successful');
      return true;
    } else {
      console.log('Already logged in or login not required');
      return true;
    }
  } catch (error) {
    console.error('Login failed:', error);
    return false;
  }
}

/**
 * Take a screenshot
 * @param {Page} page - Playwright page
 * @param {string} name - Screenshot name
 * @returns {Promise<void>}
 */
async function takeScreenshot(page, name) {
  const screenshotPath = path.join(config.screenshotsDir, `${name}-${Date.now()}.png`);
  await page.screenshot({ path: screenshotPath, fullPage: true });
  console.log(`Screenshot saved to ${screenshotPath}`);
}

/**
 * Upload a document
 * @param {Page} page - Playwright page
 * @param {string} filePath - Path to the file to upload
 * @returns {Promise<string|null>} Document ID if upload successful, null otherwise
 */
async function uploadDocument(page, filePath) {
  console.log(`Uploading document: ${filePath}...`);
  
  try {
    // Navigate to dashboard if not already there
    if (!page.url().includes('/dashboard')) {
      await page.click('a:has-text("Dashboard")');
    }
    
    // Click upload button
    await page.click('button:has-text("Upload Document")');
    
    // Wait for upload dialog to appear
    await page.waitForSelector('input[type="file"]');
    
    // Upload file
    const fileInput = await page.$('input[type="file"]');
    await fileInput.setInputFiles(filePath);
    
    // Wait for file to be processed
    await page.waitForSelector('button:has-text("Upload")');
    
    // Click upload button
    await page.click('button:has-text("Upload")');
    
    // Wait for upload to complete
    await page.waitForSelector('text=Upload complete', { timeout: 30000 });
    
    // Get document ID from URL or response
    const documentId = await page.evaluate(() => {
      // This is a placeholder - actual implementation will depend on the application
      return document.querySelector('.document-id')?.textContent || 'unknown';
    });
    
    console.log(`Document uploaded successfully. Document ID: ${documentId}`);
    
    // Take screenshot of successful upload
    await takeScreenshot(page, 'upload-success');
    
    return documentId;
  } catch (error) {
    console.error('Document upload failed:', error);
    
    // Take screenshot of failed upload
    await takeScreenshot(page, 'upload-failure');
    
    return null;
  }
}

/**
 * Check document processing status
 * @param {Page} page - Playwright page
 * @param {string} documentId - Document ID
 * @returns {Promise<string>} Processing status
 */
async function checkProcessingStatus(page, documentId) {
  console.log(`Checking processing status for document: ${documentId}...`);
  
  try {
    // Navigate to document processing page
    await page.click('a:has-text("Document Processing")');
    
    // Wait for processing status to be visible
    await page.waitForSelector('.processing-status');
    
    // Get processing status
    const status = await page.evaluate(() => {
      return document.querySelector('.processing-status')?.textContent || 'unknown';
    });
    
    console.log(`Processing status: ${status}`);
    
    return status;
  } catch (error) {
    console.error('Failed to check processing status:', error);
    return 'error';
  }
}

/**
 * Wait for document processing to complete
 * @param {Page} page - Playwright page
 * @param {string} documentId - Document ID
 * @param {number} timeout - Timeout in milliseconds
 * @returns {Promise<boolean>} True if processing completed successfully, false otherwise
 */
async function waitForProcessingComplete(page, documentId, timeout = 300000) {
  console.log(`Waiting for processing to complete for document: ${documentId}...`);
  
  const startTime = Date.now();
  let status = 'processing';
  
  while (status === 'processing' && Date.now() - startTime < timeout) {
    // Wait for 5 seconds
    await page.waitForTimeout(5000);
    
    // Check status
    status = await checkProcessingStatus(page, documentId);
    
    if (status === 'completed') {
      console.log('Processing completed successfully');
      return true;
    } else if (status === 'error') {
      console.log('Processing failed with error');
      return false;
    }
  }
  
  if (status === 'processing') {
    console.log('Processing timed out');
    return false;
  }
  
  return status === 'completed';
}

/**
 * Test document chat functionality
 * @param {Page} page - Playwright page
 * @param {string} documentId - Document ID
 * @param {string} question - Question to ask
 * @returns {Promise<string|null>} Answer if successful, null otherwise
 */
async function testDocumentChat(page, documentId, question) {
  console.log(`Testing document chat with question: "${question}"...`);
  
  try {
    // Navigate to document chat page
    await page.click('a:has-text("Document Chat")');
    
    // Wait for chat input to be visible
    await page.waitForSelector('input[type="text"]');
    
    // Type question
    await page.fill('input[type="text"]', question);
    
    // Send question
    await page.press('input[type="text"]', 'Enter');
    
    // Wait for answer
    await page.waitForSelector('.chat-answer', { timeout: 30000 });
    
    // Get answer
    const answer = await page.evaluate(() => {
      return document.querySelector('.chat-answer')?.textContent || 'No answer';
    });
    
    console.log(`Answer: ${answer}`);
    
    // Take screenshot of chat
    await takeScreenshot(page, 'document-chat');
    
    return answer;
  } catch (error) {
    console.error('Document chat test failed:', error);
    
    // Take screenshot of failed chat
    await takeScreenshot(page, 'document-chat-failure');
    
    return null;
  }
}

/**
 * Run a complete test for a single document
 * @param {Page} page - Playwright page
 * @param {string} filePath - Path to the file to upload
 * @param {string} question - Question to ask
 * @returns {Promise<Object>} Test result
 */
async function runDocumentTest(page, filePath, question) {
  console.log(`Running test for document: ${filePath}...`);
  
  const result = {
    filePath,
    uploadSuccess: false,
    documentId: null,
    processingSuccess: false,
    processingTime: null,
    chatSuccess: false,
    question,
    answer: null,
    errors: []
  };
  
  try {
    // Upload document
    const startUpload = Date.now();
    result.documentId = await uploadDocument(page, filePath);
    result.uploadSuccess = result.documentId !== null;
    result.uploadTime = Date.now() - startUpload;
    
    if (!result.uploadSuccess) {
      result.errors.push('Document upload failed');
      return result;
    }
    
    // Wait for processing to complete
    const startProcessing = Date.now();
    result.processingSuccess = await waitForProcessingComplete(page, result.documentId);
    result.processingTime = Date.now() - startProcessing;
    
    if (!result.processingSuccess) {
      result.errors.push('Document processing failed');
      return result;
    }
    
    // Test document chat
    if (question) {
      result.answer = await testDocumentChat(page, result.documentId, question);
      result.chatSuccess = result.answer !== null;
      
      if (!result.chatSuccess) {
        result.errors.push('Document chat failed');
      }
    }
  } catch (error) {
    console.error('Test failed:', error);
    result.errors.push(`Unexpected error: ${error.message}`);
  }
  
  return result;
}

/**
 * Run tests for multiple documents
 * @param {Page} page - Playwright page
 * @param {Array<Object>} testCases - Test cases
 * @returns {Promise<Array<Object>>} Test results
 */
async function runTests(page, testCases) {
  console.log(`Running ${testCases.length} tests...`);
  
  const results = [];
  
  for (const testCase of testCases) {
    const result = await runDocumentTest(page, testCase.filePath, testCase.question);
    results.push(result);
  }
  
  return results;
}

/**
 * Save test results to file
 * @param {Array<Object>} results - Test results
 * @returns {Promise<void>}
 */
async function saveResults(results) {
  const resultsPath = path.join(config.resultsDir, `results-${Date.now()}.json`);
  fs.writeFileSync(resultsPath, JSON.stringify(results, null, 2));
  console.log(`Results saved to ${resultsPath}`);
}

/**
 * Generate HTML report from test results
 * @param {Array<Object>} results - Test results
 * @returns {Promise<void>}
 */
async function generateReport(results) {
  const reportPath = path.join(config.resultsDir, `report-${Date.now()}.html`);
  
  // Calculate statistics
  const totalTests = results.length;
  const uploadSuccessCount = results.filter(r => r.uploadSuccess).length;
  const processingSuccessCount = results.filter(r => r.processingSuccess).length;
  const chatSuccessCount = results.filter(r => r.chatSuccess).length;
  
  const uploadSuccessRate = (uploadSuccessCount / totalTests * 100).toFixed(2);
  const processingSuccessRate = (processingSuccessCount / totalTests * 100).toFixed(2);
  const chatSuccessRate = (chatSuccessCount / totalTests * 100).toFixed(2);
  
  const avgUploadTime = results.filter(r => r.uploadSuccess).reduce((sum, r) => sum + r.uploadTime, 0) / uploadSuccessCount;
  const avgProcessingTime = results.filter(r => r.processingSuccess).reduce((sum, r) => sum + r.processingTime, 0) / processingSuccessCount;
  
  // Generate HTML
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>FinDoc Analyzer QA Test Report</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            margin: 0;
            padding: 20px;
            color: #333;
        }
        h1, h2, h3 {
            color: #2c3e50;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
        }
        .summary {
            background-color: #f8f9fa;
            padding: 20px;
            border-radius: 5px;
            margin-bottom: 20px;
        }
        .stats {
            display: flex;
            flex-wrap: wrap;
            gap: 20px;
            margin-bottom: 20px;
        }
        .stat-card {
            background-color: #fff;
            border: 1px solid #ddd;
            border-radius: 5px;
            padding: 15px;
            flex: 1;
            min-width: 200px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .stat-card h3 {
            margin-top: 0;
            border-bottom: 1px solid #eee;
            padding-bottom: 10px;
        }
        .success-rate {
            font-size: 24px;
            font-weight: bold;
            color: #27ae60;
        }
        .time {
            font-size: 18px;
            color: #2980b9;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }
        th, td {
            border: 1px solid #ddd;
            padding: 12px;
            text-align: left;
        }
        th {
            background-color: #f2f2f2;
        }
        tr:nth-child(even) {
            background-color: #f9f9f9;
        }
        .success {
            color: #27ae60;
        }
        .failure {
            color: #e74c3c;
        }
        .errors {
            background-color: #ffecec;
            padding: 10px;
            border-radius: 5px;
            border-left: 4px solid #e74c3c;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>FinDoc Analyzer QA Test Report</h1>
        <p>Generated on: ${new Date().toLocaleString()}</p>
        
        <div class="summary">
            <h2>Test Summary</h2>
            <div class="stats">
                <div class="stat-card">
                    <h3>Upload Success</h3>
                    <div class="success-rate">${uploadSuccessRate}%</div>
                    <p>${uploadSuccessCount} of ${totalTests} tests</p>
                    <div class="time">Avg. Time: ${avgUploadTime.toFixed(2)}ms</div>
                </div>
                <div class="stat-card">
                    <h3>Processing Success</h3>
                    <div class="success-rate">${processingSuccessRate}%</div>
                    <p>${processingSuccessCount} of ${totalTests} tests</p>
                    <div class="time">Avg. Time: ${avgProcessingTime.toFixed(2)}ms</div>
                </div>
                <div class="stat-card">
                    <h3>Chat Success</h3>
                    <div class="success-rate">${chatSuccessRate}%</div>
                    <p>${chatSuccessCount} of ${totalTests} tests</p>
                </div>
            </div>
        </div>
        
        <h2>Detailed Results</h2>
        <table>
            <thead>
                <tr>
                    <th>#</th>
                    <th>File</th>
                    <th>Upload</th>
                    <th>Processing</th>
                    <th>Chat</th>
                    <th>Question</th>
                    <th>Answer</th>
                </tr>
            </thead>
            <tbody>
                ${results.map((result, index) => `
                <tr>
                    <td>${index + 1}</td>
                    <td>${path.basename(result.filePath)}</td>
                    <td class="${result.uploadSuccess ? 'success' : 'failure'}">${result.uploadSuccess ? '✅ Success' : '❌ Failed'}</td>
                    <td class="${result.processingSuccess ? 'success' : 'failure'}">${result.processingSuccess ? '✅ Success' : '❌ Failed'}</td>
                    <td class="${result.chatSuccess ? 'success' : 'failure'}">${result.chatSuccess ? '✅ Success' : '❌ Failed'}</td>
                    <td>${result.question || 'N/A'}</td>
                    <td>${result.answer || 'N/A'}</td>
                </tr>
                ${result.errors.length > 0 ? `
                <tr>
                    <td colspan="7">
                        <div class="errors">
                            <strong>Errors:</strong>
                            <ul>
                                ${result.errors.map(error => `<li>${error}</li>`).join('')}
                            </ul>
                        </div>
                    </td>
                </tr>
                ` : ''}
                `).join('')}
            </tbody>
        </table>
    </div>
</body>
</html>
  `;
  
  fs.writeFileSync(reportPath, html);
  console.log(`Report generated at ${reportPath}`);
}

module.exports = {
  config,
  initBrowser,
  createContext,
  navigateToApp,
  login,
  takeScreenshot,
  uploadDocument,
  checkProcessingStatus,
  waitForProcessingComplete,
  testDocumentChat,
  runDocumentTest,
  runTests,
  saveResults,
  generateReport
};
