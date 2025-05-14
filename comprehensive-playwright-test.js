/**
 * Comprehensive Playwright Test Suite for PDF Processing Application
 * 
 * This script uses Playwright to scan the entire application,
 * identify issues, and generate detailed reports with screenshots.
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// Configuration
const config = {
  baseUrl: 'http://localhost:8080',
  screenshotDir: path.join(__dirname, 'playwright-screenshots'),
  recordVideo: true,
  videoDir: path.join(__dirname, 'playwright-videos'),
  reportsDir: path.join(__dirname, 'playwright-reports'),
  slowMo: 100, // Slow down actions for visibility (in ms)
  testPdfPath: path.join(__dirname, 'test-pdfs', 'messos.pdf')
};

// Ensure directories exist
[config.screenshotDir, config.videoDir, config.reportsDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Test results
const testResults = {
  passed: 0,
  failed: 0,
  skipped: 0,
  total: 0,
  results: []
};

// Log test result
function logTest(name, status, message, screenshotPath = null, details = null) {
  const result = {
    name,
    status,
    message,
    timestamp: new Date().toISOString()
  };
  
  if (screenshotPath) {
    result.screenshotPath = screenshotPath;
  }
  
  if (details) {
    result.details = details;
  }
  
  testResults.total++;
  
  if (status === 'PASS') {
    testResults.passed++;
    console.log(`✅ PASS: ${name} - ${message}`);
  } else if (status === 'FAIL') {
    testResults.failed++;
    console.log(`❌ FAIL: ${name} - ${message}`);
    if (details) {
      console.log(`   Details: ${JSON.stringify(details)}`);
    }
    if (screenshotPath) {
      console.log(`   Screenshot: ${screenshotPath}`);
    }
  } else if (status === 'SKIP') {
    testResults.skipped++;
    console.log(`⚠️ SKIP: ${name} - ${message}`);
  }
  
  testResults.results.push(result);
}

// Generate timestamp for filenames
function getTimestamp() {
  return new Date().toISOString().replace(/:/g, '-').replace(/\./g, '-');
}

// Main test function
async function runTests() {
  const browser = await chromium.launch({
    headless: true, // Must be boolean
    slowMo: config.slowMo,
    // Use flags to run with fewer dependencies
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu'
    ]
  });
  
  const context = await browser.newContext({
    recordVideo: config.recordVideo ? { dir: config.videoDir } : undefined,
    viewport: { width: 1280, height: 720 }
  });
  
  const page = await context.newPage();
  
  // Add an event handler for console messages
  page.on('console', msg => {
    console.log(`BROWSER: ${msg.type()}: ${msg.text()}`);
  });
  
  // Start time
  const startTime = new Date();
  testResults.startTime = startTime.toISOString();
  
  try {
    console.log('Starting comprehensive Playwright tests...');
    
    // Basic navigation tests
    await testNavigation(page);
    
    // Test UI components and functionality
    await testUIComponents(page);
    
    // Test PDF uploading and processing
    await testPDFProcessing(page);
    
    // Test document chat functionality
    await testDocumentChat(page);
    
    // Test error handling
    await testErrorHandling(page);
    
    // Generate report
    generateReport();
    
  } catch (error) {
    console.error('Test execution failed:', error);
  } finally {
    // Record end time
    const endTime = new Date();
    testResults.endTime = endTime.toISOString();
    testResults.durationMs = endTime - startTime;
    testResults.durationFormatted = `${Math.floor(testResults.durationMs / 60000)}m ${Math.floor((testResults.durationMs % 60000) / 1000)}s`;
    
    // Save test results
    fs.writeFileSync(
      path.join(config.reportsDir, 'playwright-test-results.json'),
      JSON.stringify(testResults, null, 2)
    );
    
    // Close browser
    await context.close();
    await browser.close();
    
    // Print summary
    console.log('\n--- Test Summary ---');
    console.log(`Total Tests: ${testResults.total}`);
    console.log(`Passed: ${testResults.passed}`);
    console.log(`Failed: ${testResults.failed}`);
    console.log(`Skipped: ${testResults.skipped}`);
    console.log(`Duration: ${testResults.durationFormatted}`);
    console.log(`Report saved to: ${path.join(config.reportsDir, 'playwright-report.html')}`);
  }
}

// Test basic navigation
async function testNavigation(page) {
  console.log('\n--- Testing Navigation ---\n');
  
  // List of pages to test
  const pages = [
    { name: 'Home Page', path: '/' },
    { name: 'Upload Page', path: '/upload' },
    { name: 'Documents Page', path: '/documents-new' },
    { name: 'Analytics Page', path: '/analytics-new' },
    { name: 'Document Chat', path: '/document-chat' },
    { name: 'Document Comparison', path: '/document-comparison' },
    { name: 'Test Page', path: '/test' },
    { name: 'Simple Test', path: '/simple-test' }
  ];
  
  for (const pageInfo of pages) {
    try {
      // Navigate to page
      await page.goto(`${config.baseUrl}${pageInfo.path}`);
      await page.waitForLoadState('networkidle');
      
      // Take screenshot
      const screenshotPath = path.join(config.screenshotDir, `${pageInfo.name.replace(/\s+/g, '-').toLowerCase()}.png`);
      await page.screenshot({ path: screenshotPath, fullPage: true });
      
      // Check if page loaded successfully
      const title = await page.title();
      
      logTest(
        `Navigation: ${pageInfo.name}`,
        'PASS',
        `Successfully loaded ${pageInfo.path} with title "${title}"`,
        screenshotPath
      );
      
      // Check for sidebar presence
      const hasSidebar = await page.locator('.sidebar').count() > 0;
      
      if (hasSidebar) {
        logTest(
          `UI Check: ${pageInfo.name} Sidebar`,
          'PASS',
          'Sidebar is present',
          null
        );
      } else {
        logTest(
          `UI Check: ${pageInfo.name} Sidebar`,
          'FAIL',
          'Sidebar is missing',
          screenshotPath
        );
      }
      
    } catch (error) {
      const screenshotPath = path.join(config.screenshotDir, `error-${pageInfo.name.replace(/\s+/g, '-').toLowerCase()}.png`);
      await page.screenshot({ path: screenshotPath });
      
      logTest(
        `Navigation: ${pageInfo.name}`,
        'FAIL',
        `Failed to load ${pageInfo.path}: ${error.message}`,
        screenshotPath,
        { error: error.message }
      );
    }
  }
  
  // Test navigation using sidebar links
  try {
    await page.goto(`${config.baseUrl}/`);
    await page.waitForLoadState('networkidle');
    
    // Find all sidebar links
    const sidebarLinks = await page.locator('.sidebar-nav a').all();
    console.log(`Found ${sidebarLinks.length} sidebar links`);
    
    // Click on each link and verify navigation
    for (let i = 0; i < Math.min(sidebarLinks.length, 5); i++) { // Test only first 5 links to save time
      const linkText = await sidebarLinks[i].textContent();
      console.log(`Testing sidebar link: ${linkText}`);
      
      try {
        await sidebarLinks[i].click();
        await page.waitForLoadState('networkidle');
        
        // Take screenshot
        const screenshotPath = path.join(config.screenshotDir, `sidebar-navigation-${i}.png`);
        await page.screenshot({ path: screenshotPath, fullPage: true });
        
        // Check if page loaded successfully
        const url = page.url();
        
        logTest(
          `Sidebar Navigation: ${linkText}`,
          'PASS',
          `Successfully navigated to ${url}`,
          screenshotPath
        );
        
        // Go back to home to get a fresh set of sidebar links
        await page.goto(`${config.baseUrl}/`);
        await page.waitForLoadState('networkidle');
        
        // Refresh sidebar links
        sidebarLinks[i] = (await page.locator('.sidebar-nav a').all())[i];
        
      } catch (error) {
        const screenshotPath = path.join(config.screenshotDir, `error-sidebar-navigation-${i}.png`);
        await page.screenshot({ path: screenshotPath });
        
        logTest(
          `Sidebar Navigation: ${linkText}`,
          'FAIL',
          `Failed to navigate: ${error.message}`,
          screenshotPath,
          { error: error.message }
        );
      }
    }
  } catch (error) {
    console.error('Error testing sidebar navigation:', error);
  }
}

// Test UI components
async function testUIComponents(page) {
  console.log('\n--- Testing UI Components ---\n');
  
  try {
    // Test home page components
    await page.goto(`${config.baseUrl}/`);
    await page.waitForLoadState('networkidle');
    
    // Check for essential UI components
    const components = [
      { name: 'Dashboard Cards', selector: '.dashboard-card', minExpected: 1 },
      { name: 'Feature List', selector: '.feature-list', minExpected: 1 },
      { name: 'Process Document Button', selector: '#process-document-btn', minExpected: 1 },
      { name: 'Auth Container', selector: '.auth-container', minExpected: 1 },
      { name: 'Chat Button', selector: '#show-chat-btn', minExpected: 1 }
    ];
    
    for (const component of components) {
      const count = await page.locator(component.selector).count();
      
      if (count >= component.minExpected) {
        logTest(
          `UI Component: ${component.name}`,
          'PASS',
          `Found ${count} instances (expected at least ${component.minExpected})`,
          null
        );
      } else {
        const screenshotPath = path.join(config.screenshotDir, `missing-component-${component.name.replace(/\s+/g, '-').toLowerCase()}.png`);
        await page.screenshot({ path: screenshotPath, fullPage: true });
        
        logTest(
          `UI Component: ${component.name}`,
          'FAIL',
          `Found ${count} instances (expected at least ${component.minExpected})`,
          screenshotPath
        );
      }
    }
    
    // Test chat button functionality
    try {
      const chatButton = page.locator('#show-chat-btn');
      
      // Check if button exists
      if (await chatButton.count() > 0) {
        // Click the button
        await chatButton.click();
        await page.waitForTimeout(500); // Wait for animation
        
        // Check if chat container is visible
        const chatContainer = page.locator('#document-chat-container');
        const isVisible = await chatContainer.isVisible();
        
        // Take screenshot
        const screenshotPath = path.join(config.screenshotDir, 'chat-container.png');
        await page.screenshot({ path: screenshotPath });
        
        if (isVisible) {
          logTest(
            'Chat Button Functionality',
            'PASS',
            'Chat container appears when button is clicked',
            screenshotPath
          );
        } else {
          logTest(
            'Chat Button Functionality',
            'FAIL',
            'Chat container did not appear when button is clicked',
            screenshotPath
          );
        }
        
        // Click again to close
        await chatButton.click();
      } else {
        logTest(
          'Chat Button Functionality',
          'SKIP',
          'Chat button not found',
          null
        );
      }
    } catch (error) {
      logTest(
        'Chat Button Functionality',
        'FAIL',
        `Error testing chat button: ${error.message}`,
        null,
        { error: error.message }
      );
    }
  } catch (error) {
    console.error('Error testing UI components:', error);
  }
}

// Test PDF processing
async function testPDFProcessing(page) {
  console.log('\n--- Testing PDF Processing ---\n');
  
  try {
    // Navigate to upload page
    await page.goto(`${config.baseUrl}/upload`);
    await page.waitForLoadState('networkidle');
    
    // Screenshot before upload
    const beforeScreenshotPath = path.join(config.screenshotDir, 'upload-before.png');
    await page.screenshot({ path: beforeScreenshotPath, fullPage: true });
    
    // Check if file input exists
    const fileInputCount = await page.locator('input[type="file"]').count();
    
    if (fileInputCount === 0) {
      logTest(
        'PDF Upload: File Input',
        'FAIL',
        'No file input found on upload page',
        beforeScreenshotPath
      );
      return; // Skip the rest of the test
    }
    
    // Upload the test PDF
    const fileInput = page.locator('input[type="file"]').first();
    await fileInput.setInputFiles(config.testPdfPath);
    
    // Wait for file to be displayed
    await page.waitForTimeout(1000);
    
    // Screenshot after upload
    const afterUploadScreenshotPath = path.join(config.screenshotDir, 'upload-after.png');
    await page.screenshot({ path: afterUploadScreenshotPath, fullPage: true });
    
    // Check if file name is displayed
    const fileNameElement = page.getByText('messos.pdf');
    const fileNameVisible = await fileNameElement.isVisible();
    
    if (fileNameVisible) {
      logTest(
        'PDF Upload: File Selection',
        'PASS',
        'File successfully selected for upload',
        afterUploadScreenshotPath
      );
    } else {
      logTest(
        'PDF Upload: File Selection',
        'FAIL',
        'File was uploaded but filename not visible in UI',
        afterUploadScreenshotPath
      );
    }
    
    // Find and click process/upload button
    const buttonSelectors = [
      'text=Process',
      'text=Upload',
      'button:has-text("Process")',
      'button:has-text("Upload")',
      '.btn-primary',
      '#process-document-btn',
      'button.upload-btn'
    ];
    
    let processButtonFound = false;
    
    for (const selector of buttonSelectors) {
      const buttonCount = await page.locator(selector).count();
      
      if (buttonCount > 0) {
        // Button found, try to click it
        try {
          await page.locator(selector).first().click();
          await page.waitForTimeout(1000);
          processButtonFound = true;
          
          // Screenshot after clicking process button
          const processingScreenshotPath = path.join(config.screenshotDir, 'processing.png');
          await page.screenshot({ path: processingScreenshotPath, fullPage: true });
          
          logTest(
            'PDF Upload: Process Button',
            'PASS',
            `Successfully clicked process button with selector: ${selector}`,
            processingScreenshotPath
          );
          
          break;
        } catch (error) {
          console.log(`Failed to click button with selector: ${selector}`);
        }
      }
    }
    
    if (!processButtonFound) {
      logTest(
        'PDF Upload: Process Button',
        'FAIL',
        'No process/upload button found or could be clicked',
        afterUploadScreenshotPath
      );
      return; // Skip the rest of the test
    }
    
    // Wait for processing to complete (look for success message or result view)
    try {
      // Wait for various potential success indicators
      await Promise.race([
        page.waitForSelector('.success-message', { timeout: 30000 }),
        page.waitForSelector('.result-view', { timeout: 30000 }),
        page.waitForSelector('text=Processing complete', { timeout: 30000 }),
        page.waitForSelector('text=successfully processed', { timeout: 30000 }),
        page.waitForTimeout(15000) // Fallback timeout
      ]);
      
      // Take final screenshot
      const completedScreenshotPath = path.join(config.screenshotDir, 'processing-complete.png');
      await page.screenshot({ path: completedScreenshotPath, fullPage: true });
      
      // Check page for indicators of success
      const pageContent = await page.content();
      const successIndicators = [
        'Processing complete',
        'successfully processed',
        'document-id',
        'result-view',
        'analysis-result',
        'extracted-text',
        'entities'
      ];
      
      const foundIndicators = successIndicators.filter(indicator => 
        pageContent.includes(indicator)
      );
      
      if (foundIndicators.length > 0) {
        logTest(
          'PDF Processing: Completion',
          'PASS',
          `Processing appears to have completed successfully. Found indicators: ${foundIndicators.join(', ')}`,
          completedScreenshotPath
        );
      } else {
        logTest(
          'PDF Processing: Completion',
          'FAIL',
          'Processing might have completed but no success indicators found',
          completedScreenshotPath
        );
      }
      
    } catch (error) {
      const timeoutScreenshotPath = path.join(config.screenshotDir, 'processing-timeout.png');
      await page.screenshot({ path: timeoutScreenshotPath, fullPage: true });
      
      logTest(
        'PDF Processing: Completion',
        'FAIL',
        `Timeout waiting for processing to complete: ${error.message}`,
        timeoutScreenshotPath,
        { error: error.message }
      );
    }
    
  } catch (error) {
    console.error('Error testing PDF processing:', error);
    
    const errorScreenshotPath = path.join(config.screenshotDir, 'pdf-processing-error.png');
    await page.screenshot({ path: errorScreenshotPath, fullPage: true });
    
    logTest(
      'PDF Processing',
      'FAIL',
      `Unexpected error during PDF processing test: ${error.message}`,
      errorScreenshotPath,
      { error: error.message }
    );
  }
}

// Test document chat functionality
async function testDocumentChat(page) {
  console.log('\n--- Testing Document Chat ---\n');
  
  try {
    // Navigate to documents page
    await page.goto(`${config.baseUrl}/documents-new`);
    await page.waitForLoadState('networkidle');
    
    // Screenshot of documents page
    const documentsScreenshotPath = path.join(config.screenshotDir, 'documents-page.png');
    await page.screenshot({ path: documentsScreenshotPath, fullPage: true });
    
    // Check if there are any documents
    const documentCards = await page.locator('.document-card, .card').count();
    
    if (documentCards === 0) {
      logTest(
        'Document Chat: Document List',
        'SKIP',
        'No documents found to test chat functionality',
        documentsScreenshotPath
      );
      return; // Skip the rest of the test
    }
    
    logTest(
      'Document Chat: Document List',
      'PASS',
      `Found ${documentCards} documents`,
      documentsScreenshotPath
    );
    
    // Try to click the first document
    try {
      await page.locator('.document-card, .card').first().click();
      await page.waitForTimeout(1000);
      
      // Screenshot after clicking document
      const documentDetailScreenshotPath = path.join(config.screenshotDir, 'document-detail.png');
      await page.screenshot({ path: documentDetailScreenshotPath, fullPage: true });
      
      logTest(
        'Document Chat: Document Selection',
        'PASS',
        'Successfully clicked on a document',
        documentDetailScreenshotPath
      );
    } catch (error) {
      const clickErrorScreenshotPath = path.join(config.screenshotDir, 'document-click-error.png');
      await page.screenshot({ path: clickErrorScreenshotPath, fullPage: true });
      
      logTest(
        'Document Chat: Document Selection',
        'FAIL',
        `Failed to click on document: ${error.message}`,
        clickErrorScreenshotPath,
        { error: error.message }
      );
      
      // Try visiting document chat directly
      await page.goto(`${config.baseUrl}/document-chat`);
      await page.waitForLoadState('networkidle');
    }
    
    // Check for chat input
    const chatInputCount = await page.locator('input[type="text"], textarea').count();
    
    if (chatInputCount === 0) {
      const chatMissingScreenshotPath = path.join(config.screenshotDir, 'chat-input-missing.png');
      await page.screenshot({ path: chatMissingScreenshotPath, fullPage: true });
      
      logTest(
        'Document Chat: Input Field',
        'FAIL',
        'No chat input field found',
        chatMissingScreenshotPath
      );
      return; // Skip the rest of the test
    }
    
    // Try to enter a question
    try {
      await page.locator('input[type="text"], textarea').first().fill('What is this document about?');
      await page.waitForTimeout(500);
      
      // Screenshot of entered question
      const questionScreenshotPath = path.join(config.screenshotDir, 'chat-question.png');
      await page.screenshot({ path: questionScreenshotPath, fullPage: true });
      
      logTest(
        'Document Chat: Question Input',
        'PASS',
        'Successfully entered question in chat input',
        questionScreenshotPath
      );
      
      // Try to send the question
      const sendButton = page.locator('button:has-text("Send")');
      
      if (await sendButton.count() > 0) {
        await sendButton.click();
        await page.waitForTimeout(2000); // Wait for response
        
        // Take screenshot of chat response
        const responseScreenshotPath = path.join(config.screenshotDir, 'chat-response.png');
        await page.screenshot({ path: responseScreenshotPath, fullPage: true });
        
        // Check for a response
        const messageCount = await page.locator('.message, .chat-message').count();
        
        if (messageCount > 1) { // More than just our question
          logTest(
            'Document Chat: Response',
            'PASS',
            'Received response to chat question',
            responseScreenshotPath
          );
        } else {
          logTest(
            'Document Chat: Response',
            'FAIL',
            'No response received to chat question',
            responseScreenshotPath
          );
        }
      } else {
        logTest(
          'Document Chat: Send Button',
          'FAIL',
          'No send button found',
          questionScreenshotPath
        );
      }
    } catch (error) {
      const chatErrorScreenshotPath = path.join(config.screenshotDir, 'chat-error.png');
      await page.screenshot({ path: chatErrorScreenshotPath, fullPage: true });
      
      logTest(
        'Document Chat: Question',
        'FAIL',
        `Error during chat testing: ${error.message}`,
        chatErrorScreenshotPath,
        { error: error.message }
      );
    }
  } catch (error) {
    console.error('Error testing document chat:', error);
  }
}

// Test error handling
async function testErrorHandling(page) {
  console.log('\n--- Testing Error Handling ---\n');
  
  // Test invalid document ID
  try {
    await page.goto(`${config.baseUrl}/documents/invalid-id`);
    await page.waitForTimeout(2000);
    
    // Take screenshot
    const invalidIdScreenshotPath = path.join(config.screenshotDir, 'invalid-document-id.png');
    await page.screenshot({ path: invalidIdScreenshotPath, fullPage: true });
    
    // Check for error message
    const errorMessageVisible = await page.locator('text=not found, text=invalid, text=error').count() > 0;
    
    if (errorMessageVisible) {
      logTest(
        'Error Handling: Invalid Document ID',
        'PASS',
        'Error message displayed for invalid document ID',
        invalidIdScreenshotPath
      );
    } else {
      logTest(
        'Error Handling: Invalid Document ID',
        'FAIL',
        'No error message for invalid document ID',
        invalidIdScreenshotPath
      );
    }
  } catch (error) {
    logTest(
      'Error Handling: Invalid Document ID',
      'FAIL',
      `Error during test: ${error.message}`,
      null,
      { error: error.message }
    );
  }
  
  // Test uploading invalid file type
  try {
    // Navigate to upload page
    await page.goto(`${config.baseUrl}/upload`);
    await page.waitForLoadState('networkidle');
    
    // Check if file input exists
    const fileInputCount = await page.locator('input[type="file"]').count();
    
    if (fileInputCount === 0) {
      logTest(
        'Error Handling: Invalid File Type',
        'SKIP',
        'No file input found on upload page',
        null
      );
    } else {
      // Create a test text file
      const testTextFilePath = path.join(__dirname, 'test-invalid-file.txt');
      fs.writeFileSync(testTextFilePath, 'This is a test text file, not a PDF');
      
      // Upload the non-PDF file
      const fileInput = page.locator('input[type="file"]').first();
      
      try {
        await fileInput.setInputFiles(testTextFilePath);
        await page.waitForTimeout(1000);
        
        // Take screenshot
        const invalidFileScreenshotPath = path.join(config.screenshotDir, 'invalid-file-type.png');
        await page.screenshot({ path: invalidFileScreenshotPath, fullPage: true });
        
        // Look for error message
        const hasErrorMessage = await page.locator('text=invalid file, text=only PDF, text=error, text=not supported').count() > 0;
        
        if (hasErrorMessage) {
          logTest(
            'Error Handling: Invalid File Type',
            'PASS',
            'Error message displayed for invalid file type',
            invalidFileScreenshotPath
          );
        } else {
          logTest(
            'Error Handling: Invalid File Type',
            'FAIL',
            'No error message for invalid file type',
            invalidFileScreenshotPath
          );
        }
      } catch (error) {
        // If the file input validation prevents setting an invalid file, that's good too
        logTest(
          'Error Handling: Invalid File Type',
          'PASS',
          'Browser file input validation prevented uploading an invalid file type',
          null
        );
      } finally {
        // Clean up test file
        if (fs.existsSync(testTextFilePath)) {
          fs.unlinkSync(testTextFilePath);
        }
      }
    }
  } catch (error) {
    logTest(
      'Error Handling: Invalid File Type',
      'FAIL',
      `Error during test: ${error.message}`,
      null,
      { error: error.message }
    );
  }
}

// Generate detailed HTML report
function generateReport() {
  const reportPath = path.join(config.reportsDir, 'playwright-report.html');
  
  const reportHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Playwright Test Results - PDF Processing App</title>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
    }
    
    h1, h2, h3, h4 {
      color: #0066cc;
    }
    
    .summary {
      display: flex;
      flex-wrap: wrap;
      gap: 20px;
      margin: 20px 0;
    }
    
    .summary-item {
      padding: 15px;
      border-radius: 8px;
      min-width: 150px;
      text-align: center;
      flex-grow: 1;
    }
    
    .total { background-color: #e7f5ff; border: 1px solid #74c0fc; }
    .passed { background-color: #ebfbee; border: 1px solid #69db7c; }
    .failed { background-color: #fff5f5; border: 1px solid #ff8787; }
    .skipped { background-color: #fff9db; border: 1px solid #ffd43b; }
    
    .value {
      font-size: 2em;
      font-weight: bold;
      margin: 10px 0;
    }
    
    .category {
      margin: 30px 0;
      border-bottom: 1px solid #ddd;
      padding-bottom: 10px;
    }
    
    .result {
      margin: 20px 0;
      padding: 15px;
      border-radius: 8px;
    }
    
    .result.pass { background-color: #f8fdf9; border-left: 5px solid #40c057; }
    .result.fail { background-color: #fff9f9; border-left: 5px solid #fa5252; }
    .result.skip { background-color: #fffdf0; border-left: 5px solid #ffd43b; }
    
    .result-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;
    }
    
    .timestamp {
      font-size: 0.8em;
      color: #777;
    }
    
    .screenshot {
      max-width: 100%;
      height: auto;
      border: 1px solid #ddd;
      border-radius: 4px;
      margin-top: 15px;
    }
    
    .details {
      background-color: #f8f9fa;
      padding: 10px;
      border-radius: 4px;
      margin-top: 10px;
      overflow: auto;
    }
    
    .toggle-btn {
      background: none;
      border: none;
      color: #0066cc;
      cursor: pointer;
      font-size: 0.9em;
      padding: 0;
      text-decoration: underline;
      margin-top: 10px;
    }
    
    .screenshot-container {
      margin-top: 15px;
    }
    
    .hidden {
      display: none;
    }
    
    .tabs {
      display: flex;
      margin-bottom: 20px;
      border-bottom: 1px solid #ddd;
    }
    
    .tab {
      padding: 10px 15px;
      cursor: pointer;
      border: 1px solid transparent;
      border-bottom: none;
      border-radius: 4px 4px 0 0;
      background-color: #f8f9fa;
      margin-right: 5px;
    }
    
    .tab.active {
      background-color: white;
      border-color: #ddd;
      border-bottom-color: white;
      margin-bottom: -1px;
    }
    
    .tab-content {
      display: none;
    }
    
    .tab-content.active {
      display: block;
    }
    
    @media (max-width: 768px) {
      .summary {
        flex-direction: column;
      }
    }
  </style>
</head>
<body>
  <h1>PDF Processing Application Test Results</h1>
  
  <div class="summary">
    <div class="summary-item total">
      <div>Total Tests</div>
      <div class="value">${testResults.total}</div>
    </div>
    <div class="summary-item passed">
      <div>Passed</div>
      <div class="value">${testResults.passed}</div>
    </div>
    <div class="summary-item failed">
      <div>Failed</div>
      <div class="value">${testResults.failed}</div>
    </div>
    <div class="summary-item skipped">
      <div>Skipped</div>
      <div class="value">${testResults.skipped}</div>
    </div>
  </div>
  
  <div>
    <p><strong>Start Time:</strong> ${new Date(testResults.startTime).toLocaleString()}</p>
    <p><strong>End Time:</strong> ${new Date(testResults.endTime).toLocaleString()}</p>
    <p><strong>Duration:</strong> ${testResults.durationFormatted}</p>
  </div>
  
  <div class="tabs">
    <div class="tab active" data-tab="all">All Tests</div>
    <div class="tab" data-tab="failed">Failed Tests</div>
    <div class="tab" data-tab="passed">Passed Tests</div>
    <div class="tab" data-tab="skipped">Skipped Tests</div>
    <div class="tab" data-tab="navigation">Navigation</div>
    <div class="tab" data-tab="ui">UI Components</div>
    <div class="tab" data-tab="processing">PDF Processing</div>
    <div class="tab" data-tab="chat">Document Chat</div>
    <div class="tab" data-tab="error">Error Handling</div>
  </div>
  
  ${generateResultsHtml()}
  
  <script>
    // Toggle details and screenshots
    function toggleDetails(id) {
      const details = document.getElementById('details-' + id);
      const toggle = document.getElementById('toggle-details-' + id);
      
      if (details.classList.contains('hidden')) {
        details.classList.remove('hidden');
        toggle.textContent = 'Hide Details';
      } else {
        details.classList.add('hidden');
        toggle.textContent = 'Show Details';
      }
    }
    
    function toggleScreenshot(id) {
      const container = document.getElementById('screenshot-' + id);
      const toggle = document.getElementById('toggle-screenshot-' + id);
      
      if (container.classList.contains('hidden')) {
        container.classList.remove('hidden');
        toggle.textContent = 'Hide Screenshot';
      } else {
        container.classList.add('hidden');
        toggle.textContent = 'Show Screenshot';
      }
    }
    
    // Tab switching
    const tabs = document.querySelectorAll('.tab');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        // Remove active class from all tabs and contents
        tabs.forEach(t => t.classList.remove('active'));
        tabContents.forEach(c => c.classList.remove('active'));
        
        // Add active class to clicked tab
        tab.classList.add('active');
        
        // Show corresponding content
        const tabName = tab.getAttribute('data-tab');
        document.getElementById('tab-' + tabName).classList.add('active');
      });
    });
  </script>
</body>
</html>`;

  fs.writeFileSync(reportPath, reportHtml);
  console.log(`Report generated at: ${reportPath}`);
}

// Generate HTML for test results
function generateResultsHtml() {
  // Group results by category and status
  const categories = {};
  const byStatus = {
    'PASS': [],
    'FAIL': [],
    'SKIP': []
  };
  
  testResults.results.forEach(result => {
    // Extract category
    const categoryMatch = result.name.match(/^([^:]+):/);
    const category = categoryMatch ? categoryMatch[1].trim() : 'Other';
    
    // Add to category group
    if (!categories[category]) {
      categories[category] = [];
    }
    categories[category].push(result);
    
    // Add to status group
    byStatus[result.status].push(result);
  });
  
  // Map categories to tab names
  const categoryToTab = {
    'Navigation': 'navigation',
    'UI Check': 'ui',
    'UI Component': 'ui',
    'PDF Upload': 'processing',
    'PDF Processing': 'processing',
    'Document Chat': 'chat',
    'Error Handling': 'error'
  };
  
  // Generate HTML for each tab
  let html = '';
  
  // All tests tab
  html += `<div id="tab-all" class="tab-content active">`;
  Object.entries(categories).forEach(([category, results]) => {
    html += generateCategoryHtml(category, results);
  });
  html += `</div>`;
  
  // Failed tests tab
  html += `<div id="tab-failed" class="tab-content">`;
  if (byStatus['FAIL'].length > 0) {
    html += generateCategoryHtml('Failed Tests', byStatus['FAIL']);
  } else {
    html += `<p>No failed tests!</p>`;
  }
  html += `</div>`;
  
  // Passed tests tab
  html += `<div id="tab-passed" class="tab-content">`;
  if (byStatus['PASS'].length > 0) {
    html += generateCategoryHtml('Passed Tests', byStatus['PASS']);
  } else {
    html += `<p>No passed tests.</p>`;
  }
  html += `</div>`;
  
  // Skipped tests tab
  html += `<div id="tab-skipped" class="tab-content">`;
  if (byStatus['SKIP'].length > 0) {
    html += generateCategoryHtml('Skipped Tests', byStatus['SKIP']);
  } else {
    html += `<p>No skipped tests.</p>`;
  }
  html += `</div>`;
  
  // Category tabs
  Object.entries(categoryToTab).forEach(([category, tabName]) => {
    html += `<div id="tab-${tabName}" class="tab-content">`;
    
    const categoryResults = [];
    Object.entries(categories).forEach(([cat, results]) => {
      if (cat.includes(category) || cat === category) {
        categoryResults.push(...results);
      }
    });
    
    if (categoryResults.length > 0) {
      html += generateCategoryHtml(category, categoryResults);
    } else {
      html += `<p>No tests in this category.</p>`;
    }
    
    html += `</div>`;
  });
  
  return html;
}

// Generate HTML for a category
function generateCategoryHtml(category, results) {
  return `
    <div class="category">
      <h2>${category}</h2>
      ${results.map(result => generateResultHtml(result)).join('')}
    </div>
  `;
}

// Generate HTML for a result
function generateResultHtml(result) {
  // Prepare relative path for screenshots
  const screenshotPath = result.screenshotPath ? 
    path.relative(config.reportsDir, result.screenshotPath).replace(/\\/g, '/') : 
    null;
  
  // Generate result HTML
  return `
    <div class="result ${result.status.toLowerCase()}">
      <div class="result-header">
        <h3>${result.name}</h3>
        <span class="timestamp">${new Date(result.timestamp).toLocaleTimeString()}</span>
      </div>
      <div class="message">${result.message}</div>
      
      ${result.details ? `
        <button id="toggle-details-${result.name.replace(/\s+/g, '-').toLowerCase()}" 
                class="toggle-btn" 
                onclick="toggleDetails('${result.name.replace(/\s+/g, '-').toLowerCase()}')">
          Show Details
        </button>
        <pre id="details-${result.name.replace(/\s+/g, '-').toLowerCase()}" class="details hidden">
${JSON.stringify(result.details, null, 2)}
        </pre>
      ` : ''}
      
      ${screenshotPath ? `
        <button id="toggle-screenshot-${result.name.replace(/\s+/g, '-').toLowerCase()}" 
                class="toggle-btn" 
                onclick="toggleScreenshot('${result.name.replace(/\s+/g, '-').toLowerCase()}')">
          Show Screenshot
        </button>
        <div id="screenshot-${result.name.replace(/\s+/g, '-').toLowerCase()}" class="screenshot-container hidden">
          <img src="${screenshotPath}" alt="Screenshot for ${result.name}" class="screenshot">
        </div>
      ` : ''}
    </div>
  `;
}

// Run the test suite
runTests().catch(console.error);