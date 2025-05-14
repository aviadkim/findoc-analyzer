/**
 * FinDoc Analyzer - Comprehensive Test Suite
 * 
 * This script performs a comprehensive test of the FinDoc Analyzer application
 * to identify issues and suggest fixes.
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Configuration
const config = {
  localUrl: 'http://localhost:8080',
  cloudUrl: 'https://findoc-deploy.ey.r.appspot.com',
  screenshotsDir: path.join(__dirname, 'test-results/screenshots'),
  reportsDir: path.join(__dirname, 'test-results/reports'),
  timeout: 30000, // 30 seconds
  testPages: [
    { path: '/', name: 'dashboard' },
    { path: '/documents', name: 'documents' },
    { path: '/analytics', name: 'analytics' },
    { path: '/upload', name: 'upload' },
    { path: '/chat', name: 'chat' },
    { path: '/document-chat', name: 'document-chat' },
    { path: '/document-comparison', name: 'document-comparison' }
  ],
  testCredentials: {
    email: 'test@example.com',
    password: 'Test123!'
  }
};

// Create directories if they don't exist
if (!fs.existsSync(config.screenshotsDir)) {
  fs.mkdirSync(config.screenshotsDir, { recursive: true });
}
if (!fs.existsSync(config.reportsDir)) {
  fs.mkdirSync(config.reportsDir, { recursive: true });
}

// Test results
const testResults = {
  startTime: new Date(),
  endTime: null,
  duration: null,
  tests: [],
  issues: [],
  summary: {
    total: 0,
    passed: 0,
    failed: 0,
    skipped: 0
  }
};

/**
 * Take a screenshot
 * @param {object} page - Puppeteer page
 * @param {string} name - Screenshot name
 * @returns {Promise<string>} Screenshot path
 */
async function takeScreenshot(page, name) {
  const screenshotPath = path.join(config.screenshotsDir, `${name}.png`);
  await page.screenshot({ path: screenshotPath, fullPage: true });
  console.log(`Screenshot saved: ${screenshotPath}`);
  return screenshotPath;
}

/**
 * Log a test result
 * @param {string} name - Test name
 * @param {boolean} passed - Whether the test passed
 * @param {string} message - Test message
 * @param {string} screenshot - Screenshot path
 * @param {object} error - Error object
 * @returns {void}
 */
function logTestResult(name, passed, message, screenshot = null, error = null) {
  const result = {
    name,
    status: passed ? 'passed' : 'failed',
    message,
    timestamp: new Date(),
    screenshot
  };

  if (error) {
    result.error = {
      message: error.message,
      stack: error.stack
    };
  }

  testResults.tests.push(result);
  testResults.summary.total++;

  if (passed) {
    testResults.summary.passed++;
    console.log(`✅ PASSED: ${name} - ${message}`);
  } else {
    testResults.summary.failed++;
    console.error(`❌ FAILED: ${name} - ${message}`);
    if (error) {
      console.error(error);
    }

    // Add to issues list
    testResults.issues.push({
      component: name.split('-')[0],
      description: message,
      severity: 'high',
      screenshot
    });
  }
}

/**
 * Log an issue
 * @param {string} component - Component name
 * @param {string} description - Issue description
 * @param {string} severity - Issue severity (high, medium, low)
 * @param {string} screenshot - Screenshot path
 * @returns {void}
 */
function logIssue(component, description, severity = 'medium', screenshot = null) {
  testResults.issues.push({
    component,
    description,
    severity,
    screenshot
  });

  console.warn(`⚠️ ISSUE: [${severity.toUpperCase()}] ${component} - ${description}`);
}

/**
 * Wait for element to be visible
 * @param {object} page - Puppeteer page
 * @param {string} selector - Element selector
 * @param {number} timeout - Timeout in milliseconds
 * @returns {Promise<ElementHandle>} Element handle
 */
async function waitForElement(page, selector, timeout = config.timeout) {
  try {
    return await page.waitForSelector(selector, {
      visible: true,
      timeout
    });
  } catch (error) {
    throw new Error(`Element not found: ${selector} - ${error.message}`);
  }
}

/**
 * Test authentication
 * @param {object} browser - Puppeteer browser
 * @param {string} baseUrl - Base URL
 * @returns {Promise<object>} Test results
 */
async function testAuthentication(browser, baseUrl) {
  console.log('\n🔐 Testing Authentication...');
  
  const page = await browser.newPage();
  
  try {
    // Navigate to login page
    await page.goto(`${baseUrl}/login`, { timeout: config.timeout });
    
    // Take screenshot of login page
    const loginScreenshot = await takeScreenshot(page, 'auth-login-page');
    
    // Check if login form exists
    const loginFormExists = await page.evaluate(() => {
      return !!document.querySelector('form') || 
             !!document.querySelector('input[type="email"]') || 
             !!document.querySelector('input[type="password"]');
    });
    
    logTestResult('auth-login-form', loginFormExists, 
      loginFormExists ? 'Login form found' : 'Login form not found', 
      loginScreenshot);
    
    if (!loginFormExists) {
      logIssue('Authentication', 'Login form not found on /login page', 'high', loginScreenshot);
      return page;
    }
    
    // Identify form elements
    const emailInput = await page.$('input[type="email"], input[placeholder*="email"], input[name="email"]');
    const passwordInput = await page.$('input[type="password"], input[placeholder*="password"], input[name="password"]');
    const loginButton = await page.$('button[type="submit"], button:has-text("Login"), button:has-text("Sign in")');
    
    if (!emailInput) {
      logIssue('Authentication', 'Email input not found on login form', 'high', loginScreenshot);
    }
    
    if (!passwordInput) {
      logIssue('Authentication', 'Password input not found on login form', 'high', loginScreenshot);
    }
    
    if (!loginButton) {
      logIssue('Authentication', 'Login button not found on login form', 'high', loginScreenshot);
    }
    
    if (!emailInput || !passwordInput || !loginButton) {
      return page;
    }
    
    // Fill and submit form
    await emailInput.type(config.testCredentials.email);
    await passwordInput.type(config.testCredentials.password);
    await loginButton.click();
    
    // Wait for navigation
    try {
      await page.waitForNavigation({ timeout: config.timeout });
    } catch (error) {
      logTestResult('auth-login-submission', false, 
        'Login form submission did not navigate to a new page', 
        await takeScreenshot(page, 'auth-login-submission-error'), 
        error);
      logIssue('Authentication', 'Login form submission not working properly', 'high');
      return page;
    }
    
    // Check if we're logged in
    const loggedInScreenshot = await takeScreenshot(page, 'auth-logged-in');
    
    // Check for profile/user menu or dashboard elements as sign of successful login
    const isLoggedIn = await page.evaluate(() => {
      return !!document.querySelector('.user-profile, .user-menu, .dashboard, .sidebar');
    });
    
    logTestResult('auth-login-success', isLoggedIn, 
      isLoggedIn ? 'Successfully logged in' : 'Login failed', 
      loggedInScreenshot);
    
    if (!isLoggedIn) {
      logIssue('Authentication', 'Login not working with test credentials', 'high', loggedInScreenshot);
    }
    
    return page;
  } catch (error) {
    logTestResult('auth-overall', false, 'Authentication test failed', 
      await takeScreenshot(page, 'auth-error'), error);
    logIssue('Authentication', `Authentication test failed: ${error.message}`, 'high');
    return page;
  }
}

/**
 * Test navigation
 * @param {object} page - Puppeteer page
 * @param {string} baseUrl - Base URL
 * @returns {Promise<void>}
 */
async function testNavigation(page, baseUrl) {
  console.log('\n🧭 Testing Navigation...');
  
  try {
    // Go to homepage
    await page.goto(`${baseUrl}/`, { timeout: config.timeout });
    
    // Take screenshot of homepage
    const homepageScreenshot = await takeScreenshot(page, 'nav-homepage');
    
    // Check if sidebar exists
    const sidebarExists = await page.evaluate(() => {
      return !!document.querySelector('.sidebar, nav, [role="navigation"]');
    });
    
    logTestResult('nav-sidebar', sidebarExists, 
      sidebarExists ? 'Sidebar navigation found' : 'Sidebar navigation not found', 
      homepageScreenshot);
    
    if (!sidebarExists) {
      logIssue('Navigation', 'Sidebar navigation not found', 'high', homepageScreenshot);
      return;
    }
    
    // Get all navigation links
    const navLinks = await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('nav a, .sidebar a, [role="navigation"] a'));
      return links.map(link => ({
        text: link.innerText.trim(),
        href: link.getAttribute('href')
      })).filter(link => link.href && link.href.startsWith('/'));
    });
    
    console.log(`Found ${navLinks.length} navigation links:`, navLinks);
    
    // Test each navigation link
    for (const link of navLinks) {
      try {
        console.log(`Testing navigation to: ${link.text} (${link.href})`);
        
        // Navigate to the link
        await page.goto(`${baseUrl}${link.href}`, { timeout: config.timeout });
        
        // Wait for page to load
        await page.waitForTimeout(2000);
        
        // Take screenshot
        const navScreenshot = await takeScreenshot(page, `nav-${link.href.replace(/\//g, '-')}`);
        
        // Check if page loaded successfully
        const pageTitle = await page.title();
        
        logTestResult(`nav-${link.href}`, true, 
          `Successfully navigated to ${link.text} (${pageTitle})`, 
          navScreenshot);
      } catch (error) {
        logTestResult(`nav-${link.href}`, false, 
          `Failed to navigate to ${link.text}`, 
          await takeScreenshot(page, `nav-${link.href.replace(/\//g, '-')}-error`), 
          error);
        
        logIssue('Navigation', `Navigation to ${link.text} (${link.href}) failed`, 'high');
      }
    }
  } catch (error) {
    logTestResult('nav-overall', false, 'Navigation test failed', 
      await takeScreenshot(page, 'nav-error'), error);
    logIssue('Navigation', `Navigation test failed: ${error.message}`, 'high');
  }
}

/**
 * Test document upload
 * @param {object} page - Puppeteer page
 * @param {string} baseUrl - Base URL
 * @returns {Promise<void>}
 */
async function testDocumentUpload(page, baseUrl) {
  console.log('\n📄 Testing Document Upload...');
  
  try {
    // Navigate to upload page
    await page.goto(`${baseUrl}/upload`, { timeout: config.timeout });
    
    // Take screenshot of upload page
    const uploadScreenshot = await takeScreenshot(page, 'upload-page');
    
    // Check if upload form exists
    const uploadFormExists = await page.evaluate(() => {
      return !!document.querySelector('input[type="file"]') || 
             !!document.querySelector('form') || 
             !!document.querySelector('.upload-area, .dropzone');
    });
    
    logTestResult('upload-form', uploadFormExists, 
      uploadFormExists ? 'Upload form found' : 'Upload form not found', 
      uploadScreenshot);
    
    if (!uploadFormExists) {
      logIssue('Document Upload', 'Upload form not found on /upload page', 'high', uploadScreenshot);
      return;
    }
    
    // Check for file input
    const fileInputExists = await page.evaluate(() => {
      return !!document.querySelector('input[type="file"]');
    });
    
    logTestResult('upload-file-input', fileInputExists, 
      fileInputExists ? 'File input found' : 'File input not found', 
      uploadScreenshot);
    
    if (!fileInputExists) {
      logIssue('Document Upload', 'File input not found on upload form', 'high', uploadScreenshot);
      return;
    }
    
    // Check for submit button
    const submitButtonExists = await page.evaluate(() => {
      return !!document.querySelector('button[type="submit"], button:has-text("Upload"), input[type="submit"]');
    });
    
    logTestResult('upload-submit-button', submitButtonExists, 
      submitButtonExists ? 'Submit button found' : 'Submit button not found', 
      uploadScreenshot);
    
    if (!submitButtonExists) {
      logIssue('Document Upload', 'Submit button not found on upload form', 'medium', uploadScreenshot);
    }
    
    // Test file upload functionality (simulated)
    const testFilePath = path.join(__dirname, '../test-data/sample_portfolio.pdf');
    
    if (!fs.existsSync(testFilePath)) {
      logTestResult('upload-test-file', false, 
        'Test file not found', null);
      logIssue('Document Upload', 'Test file not found for upload test', 'medium');
    } else {
      try {
        // Locate the file input and upload test file
        const [fileInput] = await Promise.all([
          page.$('input[type="file"]'),
          page.waitForSelector('input[type="file"]')
        ]);
        
        if (fileInput) {
          await fileInput.uploadFile(testFilePath);
          
          // Take screenshot after file selection
          const fileSelectedScreenshot = await takeScreenshot(page, 'upload-file-selected');
          
          logTestResult('upload-file-selection', true, 
            'Test file selected for upload', 
            fileSelectedScreenshot);
          
          // Try to submit the form
          const submitButton = await page.$('button[type="submit"], button:has-text("Upload"), input[type="submit"]');
          
          if (submitButton) {
            await submitButton.click();
            
            // Wait for upload to complete or for error
            try {
              await page.waitForSelector('.success-message, .error-message, .alert', { timeout: config.timeout });
              
              // Take screenshot after submission
              const uploadResultScreenshot = await takeScreenshot(page, 'upload-result');
              
              // Check for success or error message
              const uploadResult = await page.evaluate(() => {
                const successMsg = document.querySelector('.success-message, .alert-success');
                const errorMsg = document.querySelector('.error-message, .alert-danger');
                
                if (successMsg) {
                  return { success: true, message: successMsg.innerText };
                } else if (errorMsg) {
                  return { success: false, message: errorMsg.innerText };
                } else {
                  return { success: false, message: 'No success or error message found after upload' };
                }
              });
              
              logTestResult('upload-submission', uploadResult.success, 
                uploadResult.message, 
                uploadResultScreenshot);
              
              if (!uploadResult.success) {
                logIssue('Document Upload', `Upload failed: ${uploadResult.message}`, 'high', uploadResultScreenshot);
              }
            } catch (error) {
              // No success or error message found
              const timeoutScreenshot = await takeScreenshot(page, 'upload-timeout');
              
              logTestResult('upload-submission', false, 
                'Timed out waiting for upload result', 
                timeoutScreenshot, error);
              
              logIssue('Document Upload', 'No feedback after file upload submission', 'high', timeoutScreenshot);
            }
          }
        }
      } catch (error) {
        logTestResult('upload-process', false, 
          'Error during upload process', 
          await takeScreenshot(page, 'upload-process-error'), 
          error);
        
        logIssue('Document Upload', `Upload process failed: ${error.message}`, 'high');
      }
    }
  } catch (error) {
    logTestResult('upload-overall', false, 
      'Document upload test failed', 
      await takeScreenshot(page, 'upload-error'), 
      error);
    
    logIssue('Document Upload', `Document upload test failed: ${error.message}`, 'high');
  }
}

/**
 * Test document management
 * @param {object} page - Puppeteer page
 * @param {string} baseUrl - Base URL
 * @returns {Promise<void>}
 */
async function testDocumentManagement(page, baseUrl) {
  console.log('\n📋 Testing Document Management...');
  
  try {
    // Navigate to documents page
    await page.goto(`${baseUrl}/documents`, { timeout: config.timeout });
    
    // Take screenshot of documents page
    const documentsScreenshot = await takeScreenshot(page, 'documents-page');
    
    // Check if documents list exists
    const documentsListExists = await page.evaluate(() => {
      return !!document.querySelector('.documents-list, .document-list, table, [role="list"]');
    });
    
    logTestResult('documents-list', documentsListExists, 
      documentsListExists ? 'Documents list found' : 'Documents list not found', 
      documentsScreenshot);
    
    if (!documentsListExists) {
      logIssue('Document Management', 'Documents list not found on /documents page', 'high', documentsScreenshot);
      return;
    }
    
    // Check for documents
    const documentsExist = await page.evaluate(() => {
      const list = document.querySelector('.documents-list, .document-list, table, [role="list"]');
      const items = list.querySelectorAll('li, tr, .document-item');
      return items.length > 0;
    });
    
    logTestResult('documents-items', documentsExist, 
      documentsExist ? 'Documents found in list' : 'No documents found in list', 
      documentsScreenshot);
    
    if (!documentsExist) {
      logIssue('Document Management', 'No documents found in documents list', 'medium', documentsScreenshot);
      return;
    }
    
    // Check document actions (view, process, delete)
    const actionsExist = await page.evaluate(() => {
      const items = document.querySelectorAll('li, tr, .document-item');
      if (items.length === 0) return false;
      
      const firstItem = items[0];
      
      const viewButton = firstItem.querySelector('a:has-text("View"), button:has-text("View"), .view-btn');
      const processButton = firstItem.querySelector('a:has-text("Process"), button:has-text("Process"), .process-btn');
      const deleteButton = firstItem.querySelector('a:has-text("Delete"), button:has-text("Delete"), .delete-btn');
      
      return {
        view: !!viewButton,
        process: !!processButton,
        delete: !!deleteButton
      };
    });
    
    logTestResult('documents-actions', actionsExist.view || actionsExist.process || actionsExist.delete, 
      `Document actions found: ${JSON.stringify(actionsExist)}`, 
      documentsScreenshot);
    
    if (!actionsExist.view && !actionsExist.process && !actionsExist.delete) {
      logIssue('Document Management', 'No document actions (view, process, delete) found', 'high', documentsScreenshot);
    } else {
      // Test document view
      if (actionsExist.view) {
        try {
          // Click the view button on the first document
          await page.evaluate(() => {
            const items = document.querySelectorAll('li, tr, .document-item');
            const firstItem = items[0];
            const viewButton = firstItem.querySelector('a:has-text("View"), button:has-text("View"), .view-btn');
            if (viewButton) viewButton.click();
          });
          
          // Wait for navigation or document view to appear
          await page.waitForTimeout(2000);
          
          // Take screenshot of document view
          const documentViewScreenshot = await takeScreenshot(page, 'document-view');
          
          // Check if document view loaded
          const documentViewLoaded = await page.evaluate(() => {
            return !!document.querySelector('.document-view, .document-details, .document-content');
          });
          
          logTestResult('documents-view', documentViewLoaded, 
            documentViewLoaded ? 'Document view loaded successfully' : 'Document view not loaded', 
            documentViewScreenshot);
          
          if (!documentViewLoaded) {
            logIssue('Document Management', 'Document view not working properly', 'high', documentViewScreenshot);
          }
          
          // Go back to documents page
          await page.goto(`${baseUrl}/documents`, { timeout: config.timeout });
        } catch (error) {
          logTestResult('documents-view', false, 
            'Error testing document view', 
            await takeScreenshot(page, 'documents-view-error'), 
            error);
          
          logIssue('Document Management', `Document view error: ${error.message}`, 'high');
          
          // Go back to documents page
          await page.goto(`${baseUrl}/documents`, { timeout: config.timeout });
        }
      }
      
      // Test document processing
      if (actionsExist.process) {
        try {
          // Click the process button on the first document
          await page.evaluate(() => {
            const items = document.querySelectorAll('li, tr, .document-item');
            const firstItem = items[0];
            const processButton = firstItem.querySelector('a:has-text("Process"), button:has-text("Process"), .process-btn');
            if (processButton) processButton.click();
          });
          
          // Wait for processing to start
          await page.waitForTimeout(2000);
          
          // Take screenshot of document processing
          const documentProcessingScreenshot = await takeScreenshot(page, 'document-processing');
          
          // Check if processing started
          const processingStarted = await page.evaluate(() => {
            return !!document.querySelector('.processing, .progress, .loading');
          });
          
          logTestResult('documents-processing', processingStarted, 
            processingStarted ? 'Document processing started' : 'Document processing not started', 
            documentProcessingScreenshot);
          
          if (!processingStarted) {
            logIssue('Document Management', 'Document processing not working properly', 'high', documentProcessingScreenshot);
          } else {
            // Wait for processing to complete (with timeout)
            try {
              await page.waitForSelector('.processing-complete, .success-message', { timeout: 60000 });
              
              // Take screenshot of processing complete
              const processingCompleteScreenshot = await takeScreenshot(page, 'document-processing-complete');
              
              logTestResult('documents-processing-complete', true, 
                'Document processing completed successfully', 
                processingCompleteScreenshot);
            } catch (error) {
              logTestResult('documents-processing-complete', false, 
                'Timed out waiting for document processing to complete', 
                await takeScreenshot(page, 'document-processing-timeout'), 
                error);
              
              logIssue('Document Management', 'Document processing timed out', 'high');
            }
          }
          
          // Go back to documents page
          await page.goto(`${baseUrl}/documents`, { timeout: config.timeout });
        } catch (error) {
          logTestResult('documents-processing', false, 
            'Error testing document processing', 
            await takeScreenshot(page, 'documents-processing-error'), 
            error);
          
          logIssue('Document Management', `Document processing error: ${error.message}`, 'high');
          
          // Go back to documents page
          await page.goto(`${baseUrl}/documents`, { timeout: config.timeout });
        }
      }
    }
  } catch (error) {
    logTestResult('documents-overall', false, 
      'Document management test failed', 
      await takeScreenshot(page, 'documents-error'), 
      error);
    
    logIssue('Document Management', `Document management test failed: ${error.message}`, 'high');
  }
}

/**
 * Test analytics
 * @param {object} page - Puppeteer page
 * @param {string} baseUrl - Base URL
 * @returns {Promise<void>}
 */
async function testAnalytics(page, baseUrl) {
  console.log('\n📊 Testing Analytics...');
  
  try {
    // Navigate to analytics page
    await page.goto(`${baseUrl}/analytics`, { timeout: config.timeout });
    
    // Take screenshot of analytics page
    const analyticsScreenshot = await takeScreenshot(page, 'analytics-page');
    
    // Check if analytics dashboard exists
    const dashboardExists = await page.evaluate(() => {
      return !!document.querySelector('.analytics-dashboard, .dashboard, .charts');
    });
    
    logTestResult('analytics-dashboard', dashboardExists, 
      dashboardExists ? 'Analytics dashboard found' : 'Analytics dashboard not found', 
      analyticsScreenshot);
    
    if (!dashboardExists) {
      logIssue('Analytics', 'Analytics dashboard not found on /analytics page', 'high', analyticsScreenshot);
      return;
    }
    
    // Check for charts
    const chartsExist = await page.evaluate(() => {
      return !!document.querySelector('.chart, svg, canvas');
    });
    
    logTestResult('analytics-charts', chartsExist, 
      chartsExist ? 'Charts found in analytics dashboard' : 'No charts found in analytics dashboard', 
      analyticsScreenshot);
    
    if (!chartsExist) {
      logIssue('Analytics', 'No charts found in analytics dashboard', 'high', analyticsScreenshot);
    }
    
    // Check for filters or controls
    const controlsExist = await page.evaluate(() => {
      return !!document.querySelector('select, input[type="radio"], input[type="checkbox"], .filter-control');
    });
    
    logTestResult('analytics-controls', controlsExist, 
      controlsExist ? 'Filter controls found' : 'No filter controls found', 
      analyticsScreenshot);
    
    if (!controlsExist) {
      logIssue('Analytics', 'No filter controls found in analytics dashboard', 'medium', analyticsScreenshot);
    }
    
    // Check for data tables
    const tablesExist = await page.evaluate(() => {
      return !!document.querySelector('table, .data-table');
    });
    
    logTestResult('analytics-tables', tablesExist, 
      tablesExist ? 'Data tables found' : 'No data tables found', 
      analyticsScreenshot);
    
    if (!tablesExist) {
      logIssue('Analytics', 'No data tables found in analytics dashboard', 'medium', analyticsScreenshot);
    }
  } catch (error) {
    logTestResult('analytics-overall', false, 
      'Analytics test failed', 
      await takeScreenshot(page, 'analytics-error'), 
      error);
    
    logIssue('Analytics', `Analytics test failed: ${error.message}`, 'high');
  }
}

/**
 * Test chat functionality
 * @param {object} page - Puppeteer page
 * @param {string} baseUrl - Base URL
 * @returns {Promise<void>}
 */
async function testChat(page, baseUrl) {
  console.log('\n💬 Testing Chat Functionality...');
  
  try {
    // Navigate to chat page
    await page.goto(`${baseUrl}/chat`, { timeout: config.timeout });
    
    // Take screenshot of chat page
    const chatScreenshot = await takeScreenshot(page, 'chat-page');
    
    // Check if chat interface exists
    const chatInterfaceExists = await page.evaluate(() => {
      return !!document.querySelector('.chat-interface, .chat-container, .messages');
    });
    
    logTestResult('chat-interface', chatInterfaceExists, 
      chatInterfaceExists ? 'Chat interface found' : 'Chat interface not found', 
      chatScreenshot);
    
    if (!chatInterfaceExists) {
      logIssue('Chat', 'Chat interface not found on /chat page', 'high', chatScreenshot);
      return;
    }
    
    // Check for chat input
    const chatInputExists = await page.evaluate(() => {
      return !!document.querySelector('input[type="text"], textarea, .chat-input');
    });
    
    logTestResult('chat-input', chatInputExists, 
      chatInputExists ? 'Chat input found' : 'Chat input not found', 
      chatScreenshot);
    
    if (!chatInputExists) {
      logIssue('Chat', 'Chat input not found', 'high', chatScreenshot);
      return;
    }
    
    // Check for send button
    const sendButtonExists = await page.evaluate(() => {
      return !!document.querySelector('button:has-text("Send"), .send-button, [type="submit"]');
    });
    
    logTestResult('chat-send-button', sendButtonExists, 
      sendButtonExists ? 'Send button found' : 'Send button not found', 
      chatScreenshot);
    
    if (!sendButtonExists) {
      logIssue('Chat', 'Send button not found', 'high', chatScreenshot);
      return;
    }
    
    // Test sending a message
    try {
      // Type a test message
      await page.type('input[type="text"], textarea, .chat-input', 'Test message');
      
      // Take screenshot after typing
      const chatTypingScreenshot = await takeScreenshot(page, 'chat-typing');
      
      // Click send button
      await page.click('button:has-text("Send"), .send-button, [type="submit"]');
      
      // Wait for response
      await page.waitForTimeout(5000);
      
      // Take screenshot after sending
      const chatSendScreenshot = await takeScreenshot(page, 'chat-send');
      
      // Check if message was sent and displayed
      const messageSent = await page.evaluate(() => {
        const messages = document.querySelectorAll('.message, .chat-message');
        return Array.from(messages).some(msg => msg.innerText.includes('Test message'));
      });
      
      logTestResult('chat-message-sent', messageSent, 
        messageSent ? 'Test message sent successfully' : 'Test message not displayed after sending', 
        chatSendScreenshot);
      
      if (!messageSent) {
        logIssue('Chat', 'Test message not displayed after sending', 'high', chatSendScreenshot);
      }
      
      // Check for response
      const responseReceived = await page.evaluate(() => {
        const messages = document.querySelectorAll('.message, .chat-message');
        const userMessages = Array.from(messages).filter(msg => 
          msg.classList.contains('user-message') || 
          msg.classList.contains('outgoing')
        );
        
        const botMessages = Array.from(messages).filter(msg => 
          msg.classList.contains('bot-message') || 
          msg.classList.contains('incoming') || 
          msg.classList.contains('assistant-message')
        );
        
        return botMessages.length > userMessages.length || botMessages.length >= userMessages.length;
      });
      
      // Wait a bit more if no response yet
      if (!responseReceived) {
        await page.waitForTimeout(5000);
        
        // Take another screenshot
        const chatWaitScreenshot = await takeScreenshot(page, 'chat-wait');
        
        // Check again for response
        const responseReceivedAfterWait = await page.evaluate(() => {
          const messages = document.querySelectorAll('.message, .chat-message');
          const userMessages = Array.from(messages).filter(msg => 
            msg.classList.contains('user-message') || 
            msg.classList.contains('outgoing')
          );
          
          const botMessages = Array.from(messages).filter(msg => 
            msg.classList.contains('bot-message') || 
            msg.classList.contains('incoming') || 
            msg.classList.contains('assistant-message')
          );
          
          return botMessages.length > 0;
        });
        
        logTestResult('chat-response', responseReceivedAfterWait, 
          responseReceivedAfterWait ? 'Response received from chat' : 'No response received from chat', 
          chatWaitScreenshot);
        
        if (!responseReceivedAfterWait) {
          logIssue('Chat', 'No response received after sending message', 'high', chatWaitScreenshot);
        }
      } else {
        logTestResult('chat-response', true, 
          'Response received from chat', 
          chatSendScreenshot);
      }
    } catch (error) {
      logTestResult('chat-send-test', false, 
        'Error testing chat message sending', 
        await takeScreenshot(page, 'chat-send-error'), 
        error);
      
      logIssue('Chat', `Chat message sending error: ${error.message}`, 'high');
    }
  } catch (error) {
    logTestResult('chat-overall', false, 
      'Chat functionality test failed', 
      await takeScreenshot(page, 'chat-error'), 
      error);
    
    logIssue('Chat', `Chat functionality test failed: ${error.message}`, 'high');
  }
}

/**
 * Generate recommendations based on test results
 * @param {object} testResults - Test results
 * @returns {Array<object>} Recommendations
 */
function generateRecommendations(testResults) {
  const recommendations = [];
  
  // Group issues by component
  const issuesByComponent = {};
  testResults.issues.forEach(issue => {
    if (!issuesByComponent[issue.component]) {
      issuesByComponent[issue.component] = [];
    }
    issuesByComponent[issue.component].push(issue);
  });
  
  // Generate recommendations for each component
  Object.keys(issuesByComponent).forEach(component => {
    const issues = issuesByComponent[component];
    const highPriorityIssues = issues.filter(issue => issue.severity === 'high');
    const mediumPriorityIssues = issues.filter(issue => issue.severity === 'medium');
    const lowPriorityIssues = issues.filter(issue => issue.severity === 'low');
    
    if (highPriorityIssues.length > 0) {
      recommendations.push({
        component,
        priority: 'high',
        description: `Fix critical issues in ${component}:`,
        issues: highPriorityIssues.map(issue => issue.description)
      });
    }
    
    if (mediumPriorityIssues.length > 0) {
      recommendations.push({
        component,
        priority: 'medium',
        description: `Improve ${component} functionality:`,
        issues: mediumPriorityIssues.map(issue => issue.description)
      });
    }
    
    if (lowPriorityIssues.length > 0) {
      recommendations.push({
        component,
        priority: 'low',
        description: `Enhance ${component} experience:`,
        issues: lowPriorityIssues.map(issue => issue.description)
      });
    }
  });
  
  // Add general recommendations
  if (testResults.summary.failed > 0) {
    recommendations.push({
      component: 'General',
      priority: 'high',
      description: 'Fix failing tests:',
      issues: [`${testResults.summary.failed} tests are failing and need to be addressed.`]
    });
  }
  
  // Sort recommendations by priority
  recommendations.sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });
  
  return recommendations;
}

/**
 * Generate HTML report
 * @param {object} testResults - Test results
 * @returns {string} HTML report
 */
function generateHtmlReport(testResults) {
  const recommendations = generateRecommendations(testResults);
  
  // Calculate pass percentage
  const passPercentage = Math.round((testResults.summary.passed / testResults.summary.total) * 100) || 0;
  
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
      color: #333;
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
    }
    h1, h2, h3 {
      color: #2c3e50;
    }
    .summary {
      display: flex;
      justify-content: space-between;
      flex-wrap: wrap;
      margin-bottom: 30px;
    }
    .summary-card {
      flex: 1;
      min-width: 250px;
      margin: 10px;
      padding: 20px;
      background-color: #f8f9fa;
      border-radius: 5px;
      box-shadow: 0 2px 5px rgba(0,0,0,0.1);
    }
    .summary-card h3 {
      margin-top: 0;
      border-bottom: 1px solid #ddd;
      padding-bottom: 10px;
    }
    .progress-container {
      width: 100%;
      background-color: #f3f3f3;
      border-radius: 4px;
      margin-bottom: 10px;
    }
    .progress-bar {
      height: 20px;
      border-radius: 4px;
      text-align: center;
      line-height: 20px;
      color: white;
    }
    .progress-bar.success {
      background-color: #4caf50;
    }
    .progress-bar.warning {
      background-color: #ff9800;
    }
    .progress-bar.danger {
      background-color: #f44336;
    }
    .tab {
      overflow: hidden;
      border: 1px solid #ccc;
      background-color: #f1f1f1;
      border-radius: 5px 5px 0 0;
    }
    .tab button {
      background-color: inherit;
      float: left;
      border: none;
      outline: none;
      cursor: pointer;
      padding: 14px 16px;
      transition: 0.3s;
      font-size: 16px;
    }
    .tab button:hover {
      background-color: #ddd;
    }
    .tab button.active {
      background-color: #2c3e50;
      color: white;
    }
    .tabcontent {
      display: none;
      padding: 20px;
      border: 1px solid #ccc;
      border-top: none;
      border-radius: 0 0 5px 5px;
      animation: fadeEffect 1s;
    }
    @keyframes fadeEffect {
      from {opacity: 0;}
      to {opacity: 1;}
    }
    .test-result {
      margin-bottom: 20px;
      padding: 15px;
      background-color: #f8f9fa;
      border-radius: 5px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    .test-result.passed {
      border-left: 5px solid #4caf50;
    }
    .test-result.failed {
      border-left: 5px solid #f44336;
    }
    .test-details {
      margin-top: 10px;
      padding: 10px;
      background-color: #f1f1f1;
      border-radius: 4px;
    }
    .badge {
      display: inline-block;
      padding: 3px 8px;
      border-radius: 3px;
      font-size: 12px;
      font-weight: bold;
      text-transform: uppercase;
      margin-left: 10px;
    }
    .badge.passed {
      background-color: #d4edda;
      color: #155724;
    }
    .badge.failed {
      background-color: #f8d7da;
      color: #721c24;
    }
    .screenshot {
      max-width: 100%;
      height: auto;
      border: 1px solid #ddd;
      border-radius: 4px;
      margin-top: 10px;
    }
    .issue {
      margin-bottom: 15px;
      padding: 10px;
      border-radius: 4px;
    }
    .issue.high {
      background-color: #f8d7da;
      border-left: 4px solid #dc3545;
    }
    .issue.medium {
      background-color: #fff3cd;
      border-left: 4px solid #ffc107;
    }
    .issue.low {
      background-color: #d1ecf1;
      border-left: 4px solid #17a2b8;
    }
    .recommendation {
      margin-bottom: 20px;
      padding: 15px;
      border-radius: 5px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    .recommendation.high {
      background-color: #f8d7da;
    }
    .recommendation.medium {
      background-color: #fff3cd;
    }
    .recommendation.low {
      background-color: #d1ecf1;
    }
    .recommendation h3 {
      margin-top: 0;
    }
    .recommendation ul {
      margin-bottom: 0;
    }
    .collapsible {
      background-color: #eee;
      color: #444;
      cursor: pointer;
      padding: 18px;
      width: 100%;
      border: none;
      text-align: left;
      outline: none;
      font-size: 15px;
      transition: 0.4s;
      border-radius: 4px;
      margin-bottom: 5px;
    }
    .active, .collapsible:hover {
      background-color: #ccc;
    }
    .collapsible:after {
      content: '\\002B';
      color: #777;
      font-weight: bold;
      float: right;
      margin-left: 5px;
    }
    .active:after {
      content: "\\2212";
    }
    .content {
      padding: 0 18px;
      max-height: 0;
      overflow: hidden;
      transition: max-height 0.2s ease-out;
      background-color: #fafafa;
      border-radius: 0 0 4px 4px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 20px;
    }
    th, td {
      text-align: left;
      padding: 12px;
      border-bottom: 1px solid #ddd;
    }
    th {
      background-color: #f2f2f2;
    }
    tr:hover {
      background-color: #f5f5f5;
    }
  </style>
</head>
<body>
  <h1>FinDoc Analyzer Test Report</h1>
  <p><strong>Test Date:</strong> ${new Date().toLocaleString()}</p>
  
  <div class="summary">
    <div class="summary-card">
      <h3>Test Results</h3>
      <div class="progress-container">
        <div class="progress-bar ${passPercentage > 80 ? 'success' : passPercentage > 50 ? 'warning' : 'danger'}" style="width: ${passPercentage}%">
          ${passPercentage}%
        </div>
      </div>
      <table>
        <tr>
          <td>Total Tests:</td>
          <td>${testResults.summary.total}</td>
        </tr>
        <tr>
          <td>Passed:</td>
          <td>${testResults.summary.passed}</td>
        </tr>
        <tr>
          <td>Failed:</td>
          <td>${testResults.summary.failed}</td>
        </tr>
        <tr>
          <td>Skipped:</td>
          <td>${testResults.summary.skipped}</td>
        </tr>
      </table>
    </div>
    
    <div class="summary-card">
      <h3>Issues Found</h3>
      <table>
        <tr>
          <td>High Priority:</td>
          <td>${testResults.issues.filter(i => i.severity === 'high').length}</td>
        </tr>
        <tr>
          <td>Medium Priority:</td>
          <td>${testResults.issues.filter(i => i.severity === 'medium').length}</td>
        </tr>
        <tr>
          <td>Low Priority:</td>
          <td>${testResults.issues.filter(i => i.severity === 'low').length}</td>
        </tr>
        <tr>
          <td>Total Issues:</td>
          <td>${testResults.issues.length}</td>
        </tr>
      </table>
    </div>
  </div>
  
  <div class="tab">
    <button class="tablinks active" onclick="openTab(event, 'Recommendations')">Recommendations</button>
    <button class="tablinks" onclick="openTab(event, 'Issues')">Issues</button>
    <button class="tablinks" onclick="openTab(event, 'Tests')">Test Results</button>
    <button class="tablinks" onclick="openTab(event, 'Screenshots')">Screenshots</button>
  </div>
  
  <div id="Recommendations" class="tabcontent" style="display: block;">
    <h2>Recommendations</h2>
    ${recommendations.length > 0 ? 
      recommendations.map(rec => `
        <div class="recommendation ${rec.priority}">
          <h3>${rec.description} <span class="badge ${rec.priority}">${rec.priority}</span></h3>
          <ul>
            ${rec.issues.map(issue => `<li>${issue}</li>`).join('')}
          </ul>
        </div>
      `).join('') : 
      '<p>No recommendations - all tests passed!</p>'
    }
  </div>
  
  <div id="Issues" class="tabcontent">
    <h2>Issues Found</h2>
    ${testResults.issues.length > 0 ? 
      testResults.issues.map(issue => `
        <div class="issue ${issue.severity}">
          <h3>${issue.component} <span class="badge ${issue.severity}">${issue.severity}</span></h3>
          <p>${issue.description}</p>
          ${issue.screenshot ? `
            <button class="collapsible">View Screenshot</button>
            <div class="content">
              <img src="../screenshots/${path.basename(issue.screenshot)}" class="screenshot" alt="Screenshot">
            </div>
          ` : ''}
        </div>
      `).join('') : 
      '<p>No issues found - all tests passed!</p>'
    }
  </div>
  
  <div id="Tests" class="tabcontent">
    <h2>Test Results</h2>
    ${testResults.tests.map(test => `
      <div class="test-result ${test.status}">
        <h3>${test.name} <span class="badge ${test.status}">${test.status}</span></h3>
        <p>${test.message}</p>
        ${test.error ? `
          <div class="test-details">
            <p><strong>Error:</strong> ${test.error.message}</p>
            <button class="collapsible">Stack Trace</button>
            <div class="content">
              <pre>${test.error.stack}</pre>
            </div>
          </div>
        ` : ''}
        ${test.screenshot ? `
          <button class="collapsible">View Screenshot</button>
          <div class="content">
            <img src="../screenshots/${path.basename(test.screenshot)}" class="screenshot" alt="Screenshot">
          </div>
        ` : ''}
      </div>
    `).join('')}
  </div>
  
  <div id="Screenshots" class="tabcontent">
    <h2>Screenshots</h2>
    <div id="screenshotGallery">
      ${Array.from(new Set(testResults.tests
        .filter(test => test.screenshot)
        .map(test => test.screenshot)))
        .map(screenshot => `
          <div class="test-result">
            <h3>${path.basename(screenshot)}</h3>
            <img src="../screenshots/${path.basename(screenshot)}" class="screenshot" alt="Screenshot">
          </div>
        `).join('')}
    </div>
  </div>
  
  <script>
    function openTab(evt, tabName) {
      var i, tabcontent, tablinks;
      tabcontent = document.getElementsByClassName("tabcontent");
      for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
      }
      tablinks = document.getElementsByClassName("tablinks");
      for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
      }
      document.getElementById(tabName).style.display = "block";
      evt.currentTarget.className += " active";
    }
    
    var coll = document.getElementsByClassName("collapsible");
    var i;
    
    for (i = 0; i < coll.length; i++) {
      coll[i].addEventListener("click", function() {
        this.classList.toggle("active");
        var content = this.nextElementSibling;
        if (content.style.maxHeight){
          content.style.maxHeight = null;
        } else {
          content.style.maxHeight = content.scrollHeight + "px";
        } 
      });
    }
  </script>
</body>
</html>`;
}

/**
 * Run all tests
 */
async function runAllTests() {
  console.log('🧪 Starting FinDoc Analyzer Tests...');
  
  const startTime = new Date();
  testResults.startTime = startTime;
  
  // Determine which URL to use
  const useLocalUrl = process.argv.includes('--local');
  const baseUrl = useLocalUrl ? config.localUrl : config.cloudUrl;
  
  console.log(`Testing on: ${baseUrl}`);
  
  // Launch browser
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    // Test Authentication
    const authPage = await testAuthentication(browser, baseUrl);
    
    // Test Navigation
    await testNavigation(authPage, baseUrl);
    
    // Test Document Upload
    await testDocumentUpload(authPage, baseUrl);
    
    // Test Document Management
    await testDocumentManagement(authPage, baseUrl);
    
    // Test Analytics
    await testAnalytics(authPage, baseUrl);
    
    // Test Chat
    await testChat(authPage, baseUrl);
    
    // Close the authentication page
    await authPage.close();
  } catch (error) {
    console.error('Error during tests:', error);
  } finally {
    // Close browser
    await browser.close();
    
    // Calculate test duration
    const endTime = new Date();
    testResults.endTime = endTime;
    testResults.duration = endTime - startTime;
    
    // Generate HTML report
    const reportPath = path.join(config.reportsDir, 'test-report.html');
    const reportHtml = generateHtmlReport(testResults);
    fs.writeFileSync(reportPath, reportHtml);
    console.log(`Test report saved to: ${reportPath}`);
    
    // Generate recommendations
    const recommendations = generateRecommendations(testResults);
    
    // Save test results to JSON
    const resultsPath = path.join(config.reportsDir, 'test-results.json');
    fs.writeFileSync(resultsPath, JSON.stringify({
      testResults,
      recommendations
    }, null, 2));
    console.log(`Test results saved to: ${resultsPath}`);
    
    // Print summary
    console.log('\n📋 Test Summary:');
    console.log(`Total Tests: ${testResults.summary.total}`);
    console.log(`Passed: ${testResults.summary.passed}`);
    console.log(`Failed: ${testResults.summary.failed}`);
    console.log(`Skipped: ${testResults.summary.skipped}`);
    console.log(`Duration: ${Math.round(testResults.duration / 1000)}s`);
    
    console.log('\n⚠️ Issues Found:');
    if (testResults.issues.length === 0) {
      console.log('No issues found!');
    } else {
      const highPriorityIssues = testResults.issues.filter(i => i.severity === 'high');
      const mediumPriorityIssues = testResults.issues.filter(i => i.severity === 'medium');
      const lowPriorityIssues = testResults.issues.filter(i => i.severity === 'low');
      
      console.log(`High Priority: ${highPriorityIssues.length}`);
      console.log(`Medium Priority: ${mediumPriorityIssues.length}`);
      console.log(`Low Priority: ${lowPriorityIssues.length}`);
      
      // Print all high priority issues
      if (highPriorityIssues.length > 0) {
        console.log('\nHigh Priority Issues:');
        highPriorityIssues.forEach((issue, index) => {
          console.log(`${index + 1}. ${issue.component}: ${issue.description}`);
        });
      }
    }
    
    console.log('\n📝 Recommendations:');
    if (recommendations.length === 0) {
      console.log('No recommendations - all tests passed!');
    } else {
      recommendations.forEach((rec, index) => {
        console.log(`${index + 1}. [${rec.priority.toUpperCase()}] ${rec.description}`);
        rec.issues.forEach(issue => {
          console.log(`   - ${issue}`);
        });
      });
    }
    
    console.log('\n✅ Tests completed!');
  }
}

// Run all tests
runAllTests();
