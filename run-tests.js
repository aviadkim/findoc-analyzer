const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Configuration
const config = {
  baseUrl: 'http://localhost:8080',
  screenshotsDir: path.join(__dirname, 'test-screenshots'),
  issuesLogPath: path.join(__dirname, 'test-issues.md')
};

// Ensure screenshots directory exists
if (!fs.existsSync(config.screenshotsDir)) {
  fs.mkdirSync(config.screenshotsDir, { recursive: true });
}

// Initialize issues log
let issuesLog = '# FinDoc Analyzer Testing Issues\n\n';
let issuesFound = 0;

// Helper to log issues
function logIssue(page, description, severity = 'Medium') {
  issuesFound++;
  const timestamp = new Date().toISOString();
  const screenshotFilename = `issue-${issuesFound}.png`;
  const screenshotPath = path.join(config.screenshotsDir, screenshotFilename);
  
  console.log(`[ISSUE #${issuesFound}] ${severity}: ${description}`);
  
  issuesLog += `## Issue #${issuesFound}: ${description}\n\n`;
  issuesLog += `- **Severity**: ${severity}\n`;
  issuesLog += `- **Timestamp**: ${timestamp}\n`;
  issuesLog += `- **Screenshot**: [View Screenshot](./test-screenshots/${screenshotFilename})\n\n`;
  
  // Take screenshot if page is provided
  if (page) {
    page.screenshot({ path: screenshotPath, fullPage: true })
      .catch(err => console.error('Failed to take screenshot:', err));
  }
}

// Main test function
async function runTests() {
  console.log('Starting FinDoc Analyzer tests...');
  
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
    args: ['--start-maximized']
  });
  
  try {
    // Start with clean logs
    issuesLog = '# FinDoc Analyzer Testing Issues\n\n';
    issuesFound = 0;
    
    // Test homepage
    const homepageIssues = await testHomepage(browser);
    
    // Test document chat
    const chatIssues = await testDocumentChat(browser);
    
    // Test upload functionality
    const uploadIssues = await testUpload(browser);
    
    // Generate summary
    const totalIssues = issuesFound;
    issuesLog += `# Summary\n\n`;
    issuesLog += `- **Total Issues Found**: ${totalIssues}\n`;
    issuesLog += `- **Test Date**: ${new Date().toLocaleString()}\n\n`;
    
    if (totalIssues === 0) {
      issuesLog += '? All tests passed successfully! No issues found.\n';
    } else {
      issuesLog += '?? Issues were found during testing. See detailed logs above.\n';
    }
    
    // Write issues log to file
    fs.writeFileSync(config.issuesLogPath, issuesLog);
    
    console.log(`\nTesting completed. ${totalIssues} issues found.`);
    console.log(`Detailed report saved to: ${config.issuesLogPath}`);
    console.log(`Screenshots saved to: ${config.screenshotsDir}`);
    
    // Keep browser open for manual inspection
    console.log('\nBrowser will remain open for inspection. Press Ctrl+C to exit when done.');
  } catch (error) {
    console.error('Test execution error:', error);
    
    // Update issues log with fatal error
    issuesLog += `## Fatal Error\n\n`;
    issuesLog += `- **Timestamp**: ${new Date().toISOString()}\n`;
    issuesLog += `- **Error**: ${error.message}\n`;
    issuesLog += `- **Stack**: ${error.stack}\n\n`;
    
    fs.writeFileSync(config.issuesLogPath, issuesLog);
    
    await browser.close();
  }
}

// Test homepage
async function testHomepage(browser) {
  console.log('\nTesting homepage...');
  
  const page = await browser.newPage();
  page.on('console', msg => console.log('Browser console:', msg.text()));
  
  try {
    // Navigate to homepage
    await page.goto(config.baseUrl, { waitUntil: 'networkidle2' });
    await page.screenshot({ path: path.join(config.screenshotsDir, 'homepage.png'), fullPage: true });
    
    // Check if page loaded
    const title = await page.title();
    console.log(`Page title: ${title}`);
    
    // Check for basic elements
    const hasHeader = await page.evaluate(() => {
      return !!document.querySelector('header') || !!document.querySelector('.header') || !!document.querySelector('h1');
    });
    
    if (!hasHeader) {
      logIssue(page, 'Homepage is missing a header or title', 'Low');
    }
    
    // Check for navigation to other pages
    const hasNav = await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('a'));
      return links.some(link => 
        link.href.includes('document-chat.html') || 
        link.href.includes('upload.html')
      );
    });
    
    if (!hasNav) {
      logIssue(page, 'Homepage is missing navigation links to other pages', 'Medium');
    }
    
    await page.close();
    return issuesFound;
  } catch (error) {
    logIssue(null, `Homepage test error: ${error.message}`, 'High');
    await page.close();
    throw error;
  }
}

// Test document chat
async function testDocumentChat(browser) {
  console.log('\nTesting document chat...');
  
  const page = await browser.newPage();
  page.on('console', msg => console.log('Browser console:', msg.text()));
  
  try {
    // Navigate to document chat page
    await page.goto(`${config.baseUrl}/document-chat.html`, { waitUntil: 'networkidle2' });
    await page.screenshot({ path: path.join(config.screenshotsDir, 'document-chat-initial.png'), fullPage: true });
    
    // Check for purple header
    const hasHeader = await page.evaluate(() => {
      const headers = Array.from(document.querySelectorAll('div'));
      return headers.some(header => 
        header.innerText.includes('FinDoc Chat') && 
        window.getComputedStyle(header).backgroundColor.includes('138, 43, 226')
      );
    });
    
    if (!hasHeader) {
      logIssue(page, 'Document chat page is missing the purple header', 'Medium');
    }
    
    // Check for document selector
    const hasSelector = await page.evaluate(() => {
      return !!document.getElementById('document-select');
    });
    
    if (!hasSelector) {
      logIssue(page, 'Document selector is missing', 'High');
    } else {
      // Test document selection
      await page.select('#document-select', '3');
      await page.waitForTimeout(1000);
      await page.screenshot({ path: path.join(config.screenshotsDir, 'document-selected.png'), fullPage: true });
      
      // Check if chat input is enabled
      const inputEnabled = await page.evaluate(() => {
        const input = document.getElementById('document-chat-input');
        return input && !input.disabled;
      });
      
      if (!inputEnabled) {
        logIssue(page, 'Chat input remains disabled after selecting a document', 'High');
      } else {
        // Test chat functionality
        await page.type('#document-chat-input', 'What is the total value of the portfolio?');
        await page.click('#send-document-message');
        
        // Wait for typing indicator
        await page.waitForTimeout(500);
        
        // Check for typing indicator
        const hasTypingIndicator = await page.evaluate(() => {
          return !!document.getElementById('typing-indicator');
        });
        
        if (!hasTypingIndicator) {
          logIssue(page, 'Typing indicator not displayed when waiting for response', 'Low');
        }
        
        // Wait for response
        await page.waitForTimeout(2000);
        await page.screenshot({ path: path.join(config.screenshotsDir, 'chat-response.png'), fullPage: true });
        
        // Check if we got a response
        const hasResponse = await page.evaluate(() => {
          const messages = document.querySelectorAll('.chat-message-assistant, .assistant-message');
          return messages.length > 0;
        });
        
        if (!hasResponse) {
          logIssue(page, 'No response received after sending a message', 'High');
        }
        
        // Test localStorage persistence
        await page.evaluate(() => {
          // Check if chat history is saved in localStorage
          const key = 'document-chat-3';
          return !!localStorage.getItem(key);
        });
        
        // Refresh the page to test persistence
        await page.reload({ waitUntil: 'networkidle2' });
        await page.waitForTimeout(1000);
        
        // Select document again
        await page.select('#document-select', '3');
        await page.waitForTimeout(1000);
        await page.screenshot({ path: path.join(config.screenshotsDir, 'after-refresh.png'), fullPage: true });
        
        // Check if messages were restored
        const messagesRestored = await page.evaluate(() => {
          const messages = document.querySelectorAll('.chat-message-user, .user-message, .chat-message-assistant, .assistant-message');
          return messages.length >= 2; // At least user message and response should be there
        });
        
        if (!messagesRestored) {
          logIssue(page, 'Chat history not restored after page refresh', 'Medium');
        }
      }
    }
    
    await page.close();
    return issuesFound;
  } catch (error) {
    logIssue(null, `Document chat test error: ${error.message}`, 'High');
    await page.close();
    throw error;
  }
}

// Test upload functionality
async function testUpload(browser) {
  console.log('\nTesting upload functionality...');
  
  const page = await browser.newPage();
  page.on('console', msg => console.log('Browser console:', msg.text()));
  
  try {
    // Navigate to upload page
    await page.goto(`${config.baseUrl}/upload.html`, { waitUntil: 'networkidle2' });
    await page.screenshot({ path: path.join(config.screenshotsDir, 'upload-initial.png'), fullPage: true });
    
    // Check for purple header
    const hasHeader = await page.evaluate(() => {
      const headers = Array.from(document.querySelectorAll('div'));
      return headers.some(header => 
        header.innerText.includes('FinDoc Uploader') && 
        window.getComputedStyle(header).backgroundColor.includes('138, 43, 226')
      );
    });
    
    if (!hasHeader) {
      logIssue(page, 'Upload page is missing the purple header', 'Medium');
    }
    
    // Check for floating process button
    const hasFloatingButton = await page.evaluate(() => {
      const button = document.getElementById('floating-process-btn');
      if (!button) return false;
      
      const style = window.getComputedStyle(button);
      return style.position === 'fixed' && style.bottom === '20px' && style.right === '20px';
    });
    
    if (!hasFloatingButton) {
      logIssue(page, 'Floating process button is missing', 'High');
    } else {
      // Test validation by clicking without filling form
      await page.click('#floating-process-btn');
      await page.waitForTimeout(500);
      await page.screenshot({ path: path.join(config.screenshotsDir, 'upload-validation.png'), fullPage: true });
      
      // Check for validation error messages
      const hasValidationErrors = await page.evaluate(() => {
        const errorMessages = document.querySelectorAll('.error-message');
        return errorMessages.length > 0;
      });
      
      if (!hasValidationErrors) {
        logIssue(page, 'No validation error messages shown when submitting empty form', 'High');
      }
      
      // Fill the form
      await page.type('#document-name', 'Test Financial Report');
      
      // Find and select document type
      const hasDocumentTypeSelect = await page.evaluate(() => {
        return !!document.getElementById('document-type');
      });
      
      if (hasDocumentTypeSelect) {
        await page.select('#document-type', 'financial_report');
      } else {
        logIssue(page, 'Document type select not found', 'High');
      }
      
      // Find file input
      const fileInputSelector = '#file-input';
      const hasFileInput = await page.evaluate((selector) => {
        return !!document.querySelector(selector);
      }, fileInputSelector);
      
      if (!hasFileInput) {
        logIssue(page, 'File input not found', 'High');
      } else {
        // Create a temporary file for upload
        const tempFilePath = path.join(__dirname, 'temp-test-file.txt');
        fs.writeFileSync(tempFilePath, 'This is a test file for upload');
        
        // Upload file
        const fileInput = await page.$(fileInputSelector);
        await fileInput.uploadFile(tempFilePath);
        
        // Remove temp file
        fs.unlinkSync(tempFilePath);
      }
      
      await page.screenshot({ path: path.join(config.screenshotsDir, 'form-filled.png'), fullPage: true });
      
      // Click process button
      await page.click('#floating-process-btn');
      await page.waitForTimeout(500);
      
      // Check for processing overlay
      const hasProcessingOverlay = await page.evaluate(() => {
        const overlay = document.getElementById('processing-overlay');
        return !!overlay && overlay.style.display !== 'none';
      });
      
      if (!hasProcessingOverlay) {
        logIssue(page, 'Processing overlay not shown after clicking process button', 'Medium');
      } else {
        await page.screenshot({ path: path.join(config.screenshotsDir, 'processing-overlay.png'), fullPage: true });
        
        // Wait for success message
        await page.waitForTimeout(3500);
        
        // Check for success message
        const hasSuccessMessage = await page.evaluate(() => {
          const message = document.getElementById('success-message');
          return !!message && message.innerText.includes('success');
        });
        
        await page.screenshot({ path: path.join(config.screenshotsDir, 'after-processing.png'), fullPage: true });
        
        if (!hasSuccessMessage) {
          logIssue(page, 'Success message not shown after processing completes', 'Medium');
        }
      }
    }
    
    await page.close();
    return issuesFound;
  } catch (error) {
    logIssue(null, `Upload test error: ${error.message}`, 'High');
    await page.close();
    throw error;
  }
}

// Run the tests
runTests().catch(console.error);
