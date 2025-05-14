/**
 * Visual QA Test for FinDoc Analyzer
 * This test runs with a visible browser and shows all steps
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// Configuration
const config = {
  baseUrl: 'http://localhost:8080',
  screenshotsDir: path.join(__dirname, 'qa-test-results'),
  waitTime: 1500, // wait time between steps for visibility
  slowMo: 300, // slow down Playwright operations for visibility
  timeout: 60000 // 60 seconds timeout
};

// Ensure the screenshots directory exists
if (!fs.existsSync(config.screenshotsDir)) {
  fs.mkdirSync(config.screenshotsDir, { recursive: true });
}

// Save a screenshot
async function takeScreenshot(page, name) {
  const filename = `${name}-${Date.now()}.png`;
  const filePath = path.join(config.screenshotsDir, filename);
  await page.screenshot({ path: filePath, fullPage: true });
  console.log(`Screenshot saved: ${filePath}`);
  return filename;
}

// Report test result
function reportTestResult(testName, passed, details = '', screenshotFile = null) {
  const result = passed ? '✅ PASSED' : '❌ FAILED';
  console.log(`${result}: ${testName}`);
  if (details) {
    console.log(`   ${details}`);
  }
  if (screenshotFile) {
    console.log(`   Screenshot: ${screenshotFile}`);
  }
  
  return { testName, passed, details, screenshotFile };
}

// Main test function
async function runVisualQATest() {
  const results = {
    timestamp: new Date().toISOString(),
    tests: [],
    passed: 0,
    failed: 0
  };
  
  console.log('Starting Visual QA Test with Playwright...');
  console.log(`Testing application at: ${config.baseUrl}`);
  
  // Launch browser with head (visible)
  const browser = await chromium.launch({
    // Windows WSL compatibility - we'll capture screenshots but use headless
    // since we can't display the UI directly through WSL
    headless: true,
    slowMo: config.slowMo
  });
  
  // Create context and page
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 }
  });
  
  const page = await context.newPage();
  page.setDefaultTimeout(config.timeout);
  
  try {
    // Test 1: Load homepage
    console.log('\n🔍 Test 1: Loading homepage...');
    await page.goto(config.baseUrl, { waitUntil: 'networkidle' });
    await page.waitForTimeout(config.waitTime);
    const homepageScreenshot = await takeScreenshot(page, 'homepage');
    
    // Verify sidebar exists
    const hasSidebar = await page.isVisible('.sidebar, .sidebar-nav');
    const homeTest = reportTestResult(
      'Homepage loads with sidebar', 
      hasSidebar, 
      hasSidebar ? 'Sidebar found' : 'Sidebar not found',
      homepageScreenshot
    );
    results.tests.push(homeTest);
    hasSidebar ? results.passed++ : results.failed++;
    
    // Test 2: Check for chat button
    console.log('\n🔍 Test 2: Checking for chat button...');
    const hasChatButton = await page.isVisible('#show-chat-btn');
    const chatButtonScreenshot = await takeScreenshot(page, 'chat-button');
    
    const chatButtonTest = reportTestResult(
      'Chat button is present', 
      hasChatButton, 
      hasChatButton ? 'Chat button found' : 'Chat button not found',
      chatButtonScreenshot
    );
    results.tests.push(chatButtonTest);
    hasChatButton ? results.passed++ : results.failed++;
    
    // Test 3: Click chat button and check chat opens
    if (hasChatButton) {
      console.log('\n🔍 Test 3: Testing chat functionality...');
      await page.click('#show-chat-btn');
      await page.waitForTimeout(config.waitTime);
      
      const chatVisibleScreenshot = await takeScreenshot(page, 'chat-open');
      
      const chatContainerVisible = await page.isVisible('#document-chat-container');
      const chatOpenTest = reportTestResult(
        'Chat container opens when button is clicked', 
        chatContainerVisible, 
        chatContainerVisible ? 'Chat container opened successfully' : 'Chat container did not open',
        chatVisibleScreenshot
      );
      results.tests.push(chatOpenTest);
      chatContainerVisible ? results.passed++ : results.failed++;
      
      // Test 3.1: Send a test message
      if (chatContainerVisible) {
        console.log('   Sending test message in chat...');
        await page.fill('#document-chat-input', 'Test message for QA');
        await page.click('#document-send-btn');
        await page.waitForTimeout(config.waitTime * 2);
        
        const chatMessageScreenshot = await takeScreenshot(page, 'chat-message');
        
        // Check if user message appears in chat
        const userMessageVisible = await page.isVisible('.user-message, .message:has-text("Test message for QA")');
        const sendMessageTest = reportTestResult(
          'Chat messaging functionality works', 
          userMessageVisible, 
          userMessageVisible ? 'Message sent successfully' : 'Message not sent',
          chatMessageScreenshot
        );
        results.tests.push(sendMessageTest);
        userMessageVisible ? results.passed++ : results.failed++;
        
        // Close chat for next tests
        await page.click('.close-chat-btn');
        await page.waitForTimeout(config.waitTime);
      }
    }
    
    // Test 4: Navigate to upload page
    console.log('\n🔍 Test 4: Navigating to upload page...');
    await page.click('a[href="/upload"], text=Upload');
    await page.waitForTimeout(config.waitTime);
    const uploadPageScreenshot = await takeScreenshot(page, 'upload-page');
    
    // Verify we're on the upload page
    const isUploadPage = page.url().includes('/upload');
    const uploadPageTest = reportTestResult(
      'Navigation to upload page', 
      isUploadPage, 
      isUploadPage ? 'Upload page loaded successfully' : 'Failed to navigate to upload page',
      uploadPageScreenshot
    );
    results.tests.push(uploadPageTest);
    isUploadPage ? results.passed++ : results.failed++;
    
    // Test 5: Check upload page elements
    if (isUploadPage) {
      console.log('\n🔍 Test 5: Checking upload page elements...');
      
      // Check for file input
      const hasFileInput = await page.isVisible('input[type="file"], #file-input');
      const fileInputTest = reportTestResult(
        'Upload page has file input', 
        hasFileInput, 
        hasFileInput ? 'File input found' : 'File input not found'
      );
      results.tests.push(fileInputTest);
      hasFileInput ? results.passed++ : results.failed++;
      
      // Check for process button
      const hasProcessButton = await page.isVisible('#process-document-btn, #floating-process-btn, button:has-text("Process")');
      const processButtonScreenshot = await takeScreenshot(page, 'process-button');
      
      const processButtonTest = reportTestResult(
        'Upload page has process button', 
        hasProcessButton, 
        hasProcessButton ? 'Process button found' : 'Process button not found',
        processButtonScreenshot
      );
      results.tests.push(processButtonTest);
      hasProcessButton ? results.passed++ : results.failed++;
      
      // Test 6: Try uploading a file (we'll create a test file)
      if (hasFileInput) {
        console.log('\n🔍 Test 6: Testing file upload...');
        
        // Create a test file
        const testFilePath = path.join(config.screenshotsDir, 'test-file.pdf');
        // Create a simple PDF-like file for testing
        fs.writeFileSync(testFilePath, '%PDF-1.5\nTest PDF file for QA testing');
        
        // Set file input
        await page.setInputFiles('input[type="file"], #file-input', testFilePath);
        await page.waitForTimeout(config.waitTime);
        
        const fileUploadScreenshot = await takeScreenshot(page, 'file-upload');
        
        // Check if file name appears
        const fileNameVisible = await page.isVisible('#file-name, text=test-file.pdf');
        const fileUploadTest = reportTestResult(
          'File upload functionality', 
          fileNameVisible, 
          fileNameVisible ? 'File uploaded successfully' : 'File not uploaded',
          fileUploadScreenshot
        );
        results.tests.push(fileUploadTest);
        fileNameVisible ? results.passed++ : results.failed++;
        
        // Test 7: Click process button
        if (hasProcessButton && fileNameVisible) {
          console.log('\n🔍 Test 7: Testing process button...');
          
          // Find and click process button
          await page.click('#process-document-btn, #floating-process-btn, button:has-text("Process")');
          await page.waitForTimeout(config.waitTime);
          
          const processClickScreenshot = await takeScreenshot(page, 'process-click');
          
          // Check for progress bar or processing indicator
          const hasProgress = await page.isVisible('.progress, .progress-bar, #progress-container, #upload-status');
          const processStartTest = reportTestResult(
            'Process button click starts processing', 
            hasProgress, 
            hasProgress ? 'Processing started successfully' : 'Processing did not start',
            processClickScreenshot
          );
          results.tests.push(processStartTest);
          hasProgress ? results.passed++ : results.failed++;
          
          // Wait for processing to complete (up to 10 seconds)
          console.log('   Waiting for processing to complete...');
          try {
            await page.waitForFunction(() => {
              const progressText = document.querySelector('#upload-status')?.textContent;
              return progressText && progressText.includes('complete');
            }, { timeout: 10000 });
            
            const processingCompleteScreenshot = await takeScreenshot(page, 'processing-complete');
            
            const processingCompleteTest = reportTestResult(
              'Document processing completes', 
              true, 
              'Processing completed successfully',
              processingCompleteScreenshot
            );
            results.tests.push(processingCompleteTest);
            results.passed++;
          } catch (error) {
            const processingTimeoutScreenshot = await takeScreenshot(page, 'processing-timeout');
            
            const processingTimeoutTest = reportTestResult(
              'Document processing completes', 
              false, 
              'Processing did not complete within expected time',
              processingTimeoutScreenshot
            );
            results.tests.push(processingTimeoutTest);
            results.failed++;
          }
        }
      }
    }
    
    // Test 8: Navigate to documents page
    console.log('\n🔍 Test 8: Navigating to documents page...');
    await page.click('a[href="/documents-new"], text=Documents');
    await page.waitForTimeout(config.waitTime);
    const documentsPageScreenshot = await takeScreenshot(page, 'documents-page');
    
    // Verify we're on the documents page
    const isDocumentsPage = page.url().includes('/documents-new');
    const documentsPageTest = reportTestResult(
      'Navigation to documents page', 
      isDocumentsPage, 
      isDocumentsPage ? 'Documents page loaded successfully' : 'Failed to navigate to documents page',
      documentsPageScreenshot
    );
    results.tests.push(documentsPageTest);
    isDocumentsPage ? results.passed++ : results.failed++;
    
    // Test 9: Check for document elements
    if (isDocumentsPage) {
      console.log('\n🔍 Test 9: Checking documents page elements...');
      
      const hasDocumentElements = await page.isVisible('.document-card, .document-list, .document-grid');
      const documentsElementsTest = reportTestResult(
        'Documents page has document elements', 
        hasDocumentElements, 
        hasDocumentElements ? 'Document elements found' : 'Document elements not found',
        documentsPageScreenshot
      );
      results.tests.push(documentsElementsTest);
      hasDocumentElements ? results.passed++ : results.failed++;
    }
    
    // Test 10: Navigate back to homepage
    console.log('\n🔍 Test 10: Navigating back to homepage...');
    await page.click('a[href="/"], .sidebar-logo');
    await page.waitForTimeout(config.waitTime);
    const homeReturnScreenshot = await takeScreenshot(page, 'home-return');
    
    // Verify we're back on the homepage
    const backToHome = page.url() === config.baseUrl || page.url() === config.baseUrl + '/';
    const homeReturnTest = reportTestResult(
      'Navigation back to homepage', 
      backToHome, 
      backToHome ? 'Successfully returned to homepage' : 'Failed to return to homepage',
      homeReturnScreenshot
    );
    results.tests.push(homeReturnTest);
    backToHome ? results.passed++ : results.failed++;
    
  } catch (error) {
    console.error('Error during visual QA test:', error);
    results.tests.push({
      testName: 'Unexpected error',
      passed: false,
      details: error.message
    });
    results.failed++;
    
    // Take a screenshot of the error state
    try {
      await takeScreenshot(page, 'error-state');
    } catch (e) {
      console.error('Failed to take error screenshot:', e);
    }
  } finally {
    // Generate summary report
    console.log('\n-------------------------------------------');
    console.log('           VISUAL QA TEST SUMMARY           ');
    console.log('-------------------------------------------');
    console.log(`Total Tests: ${results.tests.length}`);
    console.log(`Passed: ${results.passed}`);
    console.log(`Failed: ${results.failed}`);
    console.log(`Success Rate: ${Math.round((results.passed / results.tests.length) * 100)}%`);
    console.log('-------------------------------------------');
    
    // Save results to file
    const resultsFile = path.join(config.screenshotsDir, 'qa-results.json');
    fs.writeFileSync(resultsFile, JSON.stringify(results, null, 2));
    console.log(`Test results saved to: ${resultsFile}`);
    
    // Generate HTML report
    await generateHtmlReport(results, config.screenshotsDir);
    
    // Close browser
    await browser.close();
  }
  
  return results;
}

// Generate HTML report with screenshots
async function generateHtmlReport(results, screenshotsDir) {
  const reportPath = path.join(screenshotsDir, 'visual-test-report.html');
  const passRate = Math.round((results.passed / results.tests.length) * 100);
  
  // Get screenshots for the report
  const screenshots = results.tests
    .filter(test => test.screenshotFile)
    .map(test => ({ 
      file: test.screenshotFile, 
      testName: test.testName, 
      passed: test.passed 
    }));
  
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>FinDoc Analyzer Visual QA Test Report</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
    }
    h1, h2, h3 {
      color: #2c3e50;
    }
    .summary {
      background-color: #f8f9fa;
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 30px;
      display: flex;
      justify-content: space-between;
      flex-wrap: wrap;
    }
    .summary-card {
      flex: 1;
      min-width: 200px;
      text-align: center;
      margin: 10px;
      padding: 15px;
      background-color: white;
      border-radius: 8px;
      box-shadow: 0 2px 5px rgba(0,0,0,0.1);
    }
    .summary-card.passed {
      background-color: #d4edda;
      border-left: 5px solid #28a745;
    }
    .summary-card.failed {
      background-color: #f8d7da;
      border-left: 5px solid #dc3545;
    }
    .summary-card.rate {
      background-color: ${passRate > 80 ? '#d4edda' : passRate > 60 ? '#fff3cd' : '#f8d7da'};
      border-left: 5px solid ${passRate > 80 ? '#28a745' : passRate > 60 ? '#ffc107' : '#dc3545'};
    }
    .summary-card h3 {
      margin-top: 0;
      font-size: 16px;
    }
    .summary-card .count {
      font-size: 32px;
      font-weight: bold;
      margin: 10px 0;
    }
    .test-results {
      margin-bottom: 40px;
    }
    .test-result {
      background-color: #f8f9fa;
      border-radius: 8px;
      padding: 15px;
      margin-bottom: 15px;
    }
    .test-result.passed {
      border-left: 5px solid #28a745;
    }
    .test-result.failed {
      border-left: 5px solid #dc3545;
    }
    .test-result h3 {
      margin-top: 0;
    }
    .status {
      display: inline-block;
      padding: 5px 10px;
      border-radius: 4px;
      margin-left: 10px;
      font-size: 14px;
      font-weight: bold;
    }
    .status.passed {
      background-color: #d4edda;
      color: #28a745;
    }
    .status.failed {
      background-color: #f8d7da;
      color: #dc3545;
    }
    .screenshots {
      margin-top: 40px;
    }
    .screenshot {
      margin-bottom: 40px;
      background-color: #f8f9fa;
      border-radius: 8px;
      padding: 20px;
    }
    .screenshot h3 {
      margin-top: 0;
    }
    .screenshot img {
      max-width: 100%;
      border: 1px solid #ddd;
      border-radius: 4px;
      margin-top: 10px;
    }
    .timestamp {
      font-size: 14px;
      color: #6c757d;
      margin-bottom: 20px;
    }
  </style>
</head>
<body>
  <h1>FinDoc Analyzer Visual QA Test Report</h1>
  <div class="timestamp">Generated: ${new Date(results.timestamp).toLocaleString()}</div>
  
  <div class="summary">
    <div class="summary-card">
      <h3>Total Tests</h3>
      <div class="count">${results.tests.length}</div>
    </div>
    <div class="summary-card passed">
      <h3>Passed</h3>
      <div class="count">${results.passed}</div>
    </div>
    <div class="summary-card failed">
      <h3>Failed</h3>
      <div class="count">${results.failed}</div>
    </div>
    <div class="summary-card rate">
      <h3>Success Rate</h3>
      <div class="count">${passRate}%</div>
    </div>
  </div>
  
  <div class="test-results">
    <h2>Test Results</h2>
    ${results.tests.map(test => `
      <div class="test-result ${test.passed ? 'passed' : 'failed'}">
        <h3>${test.testName} <span class="status ${test.passed ? 'passed' : 'failed'}">${test.passed ? 'PASSED' : 'FAILED'}</span></h3>
        ${test.details ? `<p>${test.details}</p>` : ''}
        ${test.screenshotFile ? `<p><em>Screenshot: ${test.screenshotFile}</em></p>` : ''}
      </div>
    `).join('')}
  </div>
  
  <div class="screenshots">
    <h2>Test Screenshots</h2>
    ${screenshots.map(screenshot => `
      <div class="screenshot">
        <h3>${screenshot.testName} <span class="status ${screenshot.passed ? 'passed' : 'failed'}">${screenshot.passed ? 'PASSED' : 'FAILED'}</span></h3>
        <img src="${screenshot.file}" alt="${screenshot.testName}">
      </div>
    `).join('')}
  </div>
</body>
</html>`;

  fs.writeFileSync(reportPath, html);
  console.log(`HTML report saved to: ${reportPath}`);
}

// Run the test
runVisualQATest().catch(console.error);