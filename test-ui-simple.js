const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Create screenshots directory if it doesn't exist
const screenshotsDir = path.join(__dirname, 'test-screenshots-simple');
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

(async () => {
  console.log('Starting simple UI test...');
  
  // Launch browser
  const browser = await puppeteer.launch({ 
    headless: false,
    defaultViewport: null,
    args: ['--start-maximized']
  });
  
  try {
    // Open new page
    const page = await browser.newPage();
    
    // Test login page
    console.log('Testing login page...');
    await page.goto('http://localhost:8080/login');
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Check for login form
    const loginForm = await page.$('#login-form');
    const googleLoginBtn = await page.$('#google-login-btn');
    
    if (loginForm) {
      console.log('✅ Login form found');
    } else {
      console.error('❌ Login form not found');
    }
    
    if (googleLoginBtn) {
      console.log('✅ Google login button found');
    } else {
      console.error('❌ Google login button not found');
    }
    
    await page.screenshot({ path: path.join(screenshotsDir, '01-login-page.png') });
    
    // Test signup page
    console.log('\nTesting signup page...');
    await page.goto('http://localhost:8080/signup');
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Check for register form
    const registerForm = await page.$('#register-form');
    const googleSignupBtn = await page.$('#google-login-btn');
    
    if (registerForm) {
      console.log('✅ Register form found');
    } else {
      console.error('❌ Register form not found');
    }
    
    if (googleSignupBtn) {
      console.log('✅ Google signup button found');
    } else {
      console.error('❌ Google signup button not found');
    }
    
    await page.screenshot({ path: path.join(screenshotsDir, '02-signup-page.png') });
    
    // Test document chat page
    console.log('\nTesting document chat page...');
    await page.goto('http://localhost:8080/document-chat');
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Check for document chat elements
    const documentSelect = await page.$('#document-select');
    const documentChatContainer = await page.$('#document-chat-container');
    const documentChatInput = await page.$('#document-chat-input');
    const documentSendBtn = await page.$('#document-send-btn');
    
    if (documentSelect) {
      console.log('✅ Document selector found');
    } else {
      console.error('❌ Document selector not found');
    }
    
    if (documentChatContainer) {
      console.log('✅ Document chat container found');
    } else {
      console.error('❌ Document chat container not found');
    }
    
    if (documentChatInput) {
      console.log('✅ Document chat input found');
    } else {
      console.error('❌ Document chat input not found');
    }
    
    if (documentSendBtn) {
      console.log('✅ Document send button found');
    } else {
      console.error('❌ Document send button not found');
    }
    
    await page.screenshot({ path: path.join(screenshotsDir, '03-document-chat-page.png') });
    
    // Test documents page
    console.log('\nTesting documents page...');
    await page.goto('http://localhost:8080/documents');
    await new Promise(resolve => setTimeout(resolve, 1000));
    await page.screenshot({ path: path.join(screenshotsDir, '04-documents-page.png') });
    
    console.log('\nTest completed successfully!');
  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    // Close the browser
    await browser.close();
  }
})();
