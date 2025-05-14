/**
 * FinDoc Analyzer - Modern UI Test
 * This script tests the modern UI components
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Configuration
const config = {
  baseUrl: process.env.TEST_URL || 'https://findoc-deploy.ey.r.appspot.com',
  timeout: 30000,
  screenshotDir: path.join(__dirname, '../test-results/screenshots'),
};

// Ensure screenshot directory exists
if (!fs.existsSync(config.screenshotDir)) {
  fs.mkdirSync(config.screenshotDir, { recursive: true });
}

// Test results
const testResults = {
  passed: 0,
  failed: 0,
  total: 0,
  tests: [],
};

/**
 * Log test result
 * @param {string} name - Test name
 * @param {boolean} passed - Whether the test passed
 * @param {string} message - Test message
 * @param {string} screenshot - Screenshot path
 */
function logTestResult(name, passed, message, screenshot = null) {
  testResults.tests.push({
    name,
    passed,
    message,
    screenshot,
    timestamp: new Date().toISOString(),
  });
  
  testResults.total++;
  
  if (passed) {
    testResults.passed++;
    console.log(`✅ PASSED: ${name} - ${message}`);
  } else {
    testResults.failed++;
    console.error(`❌ FAILED: ${name} - ${message}`);
  }
}

/**
 * Take a screenshot
 * @param {object} page - Puppeteer page
 * @param {string} name - Screenshot name
 * @returns {Promise<string>} Screenshot path
 */
async function takeScreenshot(page, name) {
  const screenshotPath = path.join(config.screenshotDir, `${name}.png`);
  await page.screenshot({ path: screenshotPath, fullPage: true });
  console.log(`Screenshot saved: ${screenshotPath}`);
  return screenshotPath;
}

/**
 * Test login page
 * @param {object} browser - Puppeteer browser
 * @returns {Promise<void>}
 */
async function testLoginPage(browser) {
  console.log('\n🔐 Testing Login Page...');
  
  const page = await browser.newPage();
  
  try {
    // Navigate to login page
    await page.goto(`${config.baseUrl}/login.html`, { timeout: config.timeout });
    
    // Take screenshot
    const screenshot = await takeScreenshot(page, 'login-page');
    
    // Check for login form
    const loginFormExists = await page.$('#login-form');
    logTestResult('login-form-exists', !!loginFormExists, 
      loginFormExists ? 'Login form found' : 'Login form not found', 
      screenshot);
    
    // Check for Google login button
    const googleLoginExists = await page.$('#google-login-btn');
    logTestResult('google-login-exists', !!googleLoginExists, 
      googleLoginExists ? 'Google login button found' : 'Google login button not found', 
      screenshot);
    
    // Check for modern UI elements
    const modernElements = await page.evaluate(() => {
      return {
        loginPage: !!document.querySelector('.login-page'),
        loginContainer: !!document.querySelector('.login-container'),
        loginTitle: !!document.querySelector('.login-title'),
        loginSubtitle: !!document.querySelector('.login-subtitle'),
        loginLogo: !!document.querySelector('.login-logo'),
        loginForm: !!document.querySelector('.login-form'),
        loginFormGroup: !!document.querySelector('.login-form-group'),
        loginFormLabel: !!document.querySelector('.login-form-label'),
        loginFormInput: !!document.querySelector('.login-form-input'),
        loginFormSubmit: !!document.querySelector('.login-form-submit'),
        loginDivider: !!document.querySelector('.login-divider'),
        socialLogin: !!document.querySelector('.social-login'),
      };
    });
    
    // Log results for modern UI elements
    Object.entries(modernElements).forEach(([element, exists]) => {
      logTestResult(`modern-ui-${element}`, exists, 
        exists ? `Modern UI element ${element} found` : `Modern UI element ${element} not found`, 
        screenshot);
    });
    
    // Test login functionality
    if (loginFormExists) {
      // Fill in login form
      await page.type('#email', 'demo@example.com');
      await page.type('#password', 'password');
      
      // Take screenshot of filled form
      const filledFormScreenshot = await takeScreenshot(page, 'login-form-filled');
      
      // Submit form
      await page.click('button[type="submit"]');
      
      // Wait for redirect or check for error
      try {
        await page.waitForNavigation({ timeout: 10000 });
        
        // Take screenshot after login
        const afterLoginScreenshot = await takeScreenshot(page, 'after-login');
        
        // Check if we're redirected to dashboard
        const currentUrl = page.url();
        const isRedirected = currentUrl !== `${config.baseUrl}/login.html`;
        
        logTestResult('login-redirect', isRedirected, 
          isRedirected ? `Successfully redirected to ${currentUrl}` : 'Not redirected after login', 
          afterLoginScreenshot);
      } catch (error) {
        // Check if there's an error message
        const errorVisible = await page.$eval('#auth-error', el => el.style.display !== 'none');
        
        if (errorVisible) {
          const errorScreenshot = await takeScreenshot(page, 'login-error');
          logTestResult('login-error-handling', true, 
            'Login error message displayed correctly', 
            errorScreenshot);
        } else {
          logTestResult('login-functionality', false, 
            'Login functionality not working properly', 
            await takeScreenshot(page, 'login-functionality-error'));
        }
      }
    }
  } catch (error) {
    console.error('Error testing login page:', error);
    logTestResult('login-page-overall', false, 
      `Error testing login page: ${error.message}`, 
      await takeScreenshot(page, 'login-page-error'));
  } finally {
    await page.close();
  }
}

/**
 * Test upload page
 * @param {object} browser - Puppeteer browser
 * @returns {Promise<void>}
 */
async function testUploadPage(browser) {
  console.log('\n📤 Testing Upload Page...');
  
  const page = await browser.newPage();
  
  try {
    // Navigate to upload page
    await page.goto(`${config.baseUrl}/upload.html`, { timeout: config.timeout });
    
    // Take screenshot
    const screenshot = await takeScreenshot(page, 'upload-page');
    
    // Check for upload form elements
    const uploadElements = await page.evaluate(() => {
      return {
        dropzone: !!document.querySelector('#dropzone'),
        fileInput: !!document.querySelector('#file-input'),
        processButton: !!document.querySelector('#process-document-btn'),
        documentType: !!document.querySelector('#document-type'),
        extractText: !!document.querySelector('#extract-text'),
        extractTables: !!document.querySelector('#extract-tables'),
        extractMetadata: !!document.querySelector('#extract-metadata'),
      };
    });
    
    // Log results for upload elements
    Object.entries(uploadElements).forEach(([element, exists]) => {
      logTestResult(`upload-${element}-exists`, exists, 
        exists ? `Upload element ${element} found` : `Upload element ${element} not found`, 
        screenshot);
    });
    
    // Check for modern UI elements
    const modernElements = await page.evaluate(() => {
      return {
        appLayout: !!document.querySelector('.app-layout'),
        sidebar: !!document.querySelector('.sidebar'),
        sidebarHeader: !!document.querySelector('.sidebar-header'),
        sidebarLogo: !!document.querySelector('.sidebar-logo'),
        sidebarNav: !!document.querySelector('.sidebar-nav'),
        navSection: !!document.querySelector('.nav-section'),
        navItem: !!document.querySelector('.nav-item'),
        navLink: !!document.querySelector('.nav-link'),
        navIcon: !!document.querySelector('.nav-icon'),
        navText: !!document.querySelector('.nav-text'),
        header: !!document.querySelector('.header'),
        headerActions: !!document.querySelector('.header-actions'),
        uploadContainer: !!document.querySelector('.upload-container'),
        uploadDropzone: !!document.querySelector('.upload-dropzone'),
        uploadOptions: !!document.querySelector('.upload-options'),
      };
    });
    
    // Log results for modern UI elements
    Object.entries(modernElements).forEach(([element, exists]) => {
      logTestResult(`modern-ui-${element}`, exists, 
        exists ? `Modern UI element ${element} found` : `Modern UI element ${element} not found`, 
        screenshot);
    });
    
    // Check for document chat container
    const chatContainerExists = await page.$('#document-chat-container');
    logTestResult('document-chat-container-exists', !!chatContainerExists, 
      chatContainerExists ? 'Document chat container found' : 'Document chat container not found', 
      screenshot);
  } catch (error) {
    console.error('Error testing upload page:', error);
    logTestResult('upload-page-overall', false, 
      `Error testing upload page: ${error.message}`, 
      await takeScreenshot(page, 'upload-page-error'));
  } finally {
    await page.close();
  }
}

/**
 * Run all tests
 */
async function runTests() {
  console.log(`Starting Modern UI tests on ${config.baseUrl}`);
  
  const browser = await puppeteer.launch({ 
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    await testLoginPage(browser);
    await testUploadPage(browser);
  } catch (error) {
    console.error('Error running tests:', error);
  } finally {
    await browser.close();
    
    // Print summary
    console.log('\n📋 Test Summary:');
    console.log(`Total Tests: ${testResults.total}`);
    console.log(`Passed: ${testResults.passed}`);
    console.log(`Failed: ${testResults.failed}`);
    console.log(`Pass Rate: ${Math.round((testResults.passed / testResults.total) * 100)}%`);
    
    // Save results to file
    const resultsPath = path.join(__dirname, '../test-results/modern-ui-test-results.json');
    fs.writeFileSync(resultsPath, JSON.stringify(testResults, null, 2));
    console.log(`Test results saved to: ${resultsPath}`);
  }
}

// Run tests
runTests().catch(console.error);
