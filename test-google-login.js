/**
 * Test Google Login Functionality
 * 
 * This script tests the Google login functionality in the FinDoc Analyzer application.
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// Configuration
const config = {
  baseUrl: 'http://localhost:8080', // Local URL
  cloudUrl: 'https://backv2-app-brfi73d4ra-zf.a.run.app', // Cloud deployment URL
  screenshotsDir: path.join(__dirname, 'test-results', 'screenshots'),
  timeout: 30000, // 30 seconds
};

// Create directories
fs.mkdirSync(config.screenshotsDir, { recursive: true });

// Helper functions
const takeScreenshot = async (page, name) => {
  const screenshotPath = path.join(config.screenshotsDir, `${name}.png`);
  await page.screenshot({ path: screenshotPath, fullPage: true });
  console.log(`Screenshot saved: ${screenshotPath}`);
  return screenshotPath;
};

// Main test function
const testGoogleLogin = async (url = config.baseUrl) => {
  console.log(`\n🚀 Testing Google login functionality at ${url}`);
  console.log(`📅 Test run started at ${new Date().toISOString()}`);
  
  const browser = await chromium.launch({ 
    headless: false,
  });
  
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
  });
  
  const page = await context.newPage();
  page.setDefaultTimeout(config.timeout);
  
  try {
    // Go to login page
    console.log('\n🧪 Testing Google Login');
    await page.goto(`${url}/login`);
    await page.waitForLoadState('networkidle');
    await takeScreenshot(page, 'login-page');
    
    // Check if login form exists
    const loginForm = await page.$('#login-form');
    if (loginForm) {
      console.log('✅ Login form found');
    } else {
      console.error('❌ Login form not found');
    }
    
    // Check if Google login button exists
    const googleLoginBtn = await page.$('#google-login-btn');
    if (googleLoginBtn) {
      console.log('✅ Google login button found');
      
      // Test Google login
      console.log('Testing Google login...');
      await googleLoginBtn.click();
      await page.waitForTimeout(2000);
      await takeScreenshot(page, 'google-login-result');
      
      const currentUrl = page.url();
      console.log(`Current URL after clicking Google login: ${currentUrl}`);
      
      if (currentUrl.includes('accounts.google.com') || currentUrl.includes('/auth/google/callback')) {
        console.log('✅ Google login redirects correctly');
      } else if (currentUrl.includes('404')) {
        console.error('❌ Google login leads to 404 page');
      } else {
        console.log('⚠️ Google login redirects to an unexpected URL');
      }
    } else {
      console.error('❌ Google login button not found');
    }
    
    console.log('\n✅ Google login test completed');
    
  } finally {
    await context.close();
    await browser.close();
  }
};

// Run test
if (require.main === module) {
  // Check if URL is provided as command line argument
  const url = process.argv[2] || config.cloudUrl; // Default to cloud URL for this test
  testGoogleLogin(url).catch(console.error);
}

module.exports = {
  testGoogleLogin,
};
