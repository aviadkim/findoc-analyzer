const { chromium } = require('playwright');

async function testGoogleAuth() {
  console.log('Starting Google authentication test...');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    // Navigate to login page
    console.log('Navigating to login page...');
    await page.goto('http://localhost:8080/login');
    await page.waitForLoadState('networkidle');
    
    // Take a screenshot of the login page
    await page.screenshot({ path: 'login-page.png' });
    console.log('Screenshot saved to login-page.png');
    
    // Click the Google login button
    const googleLoginBtn = await page.$('#google-login-btn');
    if (googleLoginBtn) {
      console.log('Clicking Google login button...');
      await googleLoginBtn.click();
      
      // Wait for the prompt and enter email
      await page.waitForTimeout(1000);
      
      // Enter email in the prompt
      await page.keyboard.type('test@gmail.com');
      await page.keyboard.press('Enter');
      
      // Wait for login to complete
      await page.waitForTimeout(2000);
      
      // Take a screenshot after login
      await page.screenshot({ path: 'after-login.png' });
      console.log('Screenshot saved to after-login.png');
      
      console.log('Login completed');
    } else {
      console.log('Google login button not found');
      
      // Take a screenshot if button not found
      await page.screenshot({ path: 'login-button-not-found.png' });
      console.log('Screenshot saved to login-button-not-found.png');
    }
    
    // Wait for user to see the result
    console.log('Test completed. Waiting for 10 seconds before closing...');
    await page.waitForTimeout(10000);
    
  } catch (error) {
    console.error('Error:', error);
    await page.screenshot({ path: 'error-auth-test.png' });
    console.log('Error screenshot saved to error-auth-test.png');
  } finally {
    await browser.close();
  }
}

testGoogleAuth();
