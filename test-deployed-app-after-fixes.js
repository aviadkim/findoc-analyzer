const { chromium } = require('playwright');

// Configuration
const config = {
  url: 'https://findoc-deploy.ey.r.appspot.com',
  screenshotsDir: './test-screenshots-after-fixes',
  headless: false, // Set to true for headless mode
  slowMo: 100 // Slow down execution by 100ms
};

// Main function
async function testDeployedWebsite() {
  console.log(`Testing deployed website at ${config.url}`);
  
  // Launch browser
  const browser = await chromium.launch({ 
    headless: config.headless,
    slowMo: config.slowMo
  });
  
  // Create a new context
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    recordVideo: { dir: './test-videos-after-fixes' }
  });
  
  // Create a new page
  const page = await context.newPage();
  
  try {
    // Test 1: Home Page
    console.log('Test 1: Checking home page...');
    await page.goto(config.url);
    await page.screenshot({ path: `${config.screenshotsDir}/01-home-page.png` });
    console.log('Home page loaded successfully');
    
    // Test 2: Upload Page
    console.log('Test 2: Checking upload page...');
    await page.goto(`${config.url}/upload`);
    await page.screenshot({ path: `${config.screenshotsDir}/02-upload-page.png` });
    console.log('Upload page loaded successfully');
    
    // Test 3: Chat Page
    console.log('Test 3: Checking chat page...');
    await page.goto(`${config.url}/chat`);
    await page.screenshot({ path: `${config.screenshotsDir}/03-chat-page.png` });
    console.log('Chat page loaded successfully');
    
    // Test 4: Test Page
    console.log('Test 4: Checking test page...');
    await page.goto(`${config.url}/test`);
    await page.screenshot({ path: `${config.screenshotsDir}/04-test-page.png` });
    console.log('Test page loaded successfully');
    
    // Test 5: Check if upload form exists on upload page
    console.log('Test 5: Checking if upload form exists on upload page...');
    await page.goto(`${config.url}/upload`);
    const uploadFormExists = await page.evaluate(() => {
      return !!document.querySelector('form');
    });
    
    if (uploadFormExists) {
      console.log('Upload form found on upload page');
      await page.screenshot({ path: `${config.screenshotsDir}/05-upload-form-found.png` });
    } else {
      console.warn('Upload form not found on upload page');
      await page.screenshot({ path: `${config.screenshotsDir}/05-upload-form-not-found.png` });
    }
    
    // Test 6: Check if chat interface exists on chat page
    console.log('Test 6: Checking if chat interface exists on chat page...');
    await page.goto(`${config.url}/chat`);
    const chatInterfaceExists = await page.evaluate(() => {
      return !!document.querySelector('#question-input, textarea');
    });
    
    if (chatInterfaceExists) {
      console.log('Chat interface found on chat page');
      await page.screenshot({ path: `${config.screenshotsDir}/06-chat-interface-found.png` });
    } else {
      console.warn('Chat interface not found on chat page');
      await page.screenshot({ path: `${config.screenshotsDir}/06-chat-interface-not-found.png` });
    }
    
    // Test 7: Test API health endpoint
    console.log('Test 7: Testing API health endpoint...');
    await page.goto(`${config.url}/test`);
    await page.click('#test-api');
    
    // Wait for the API response
    await page.waitForSelector('#api-result:not(:empty)', { timeout: 10000 });
    
    // Take a screenshot of the API response
    await page.screenshot({ path: `${config.screenshotsDir}/07-api-health-response.png` });
    
    // Get the API response
    const apiResponse = await page.evaluate(() => {
      return document.querySelector('#api-result').textContent;
    });
    
    console.log('API health response:', apiResponse);
    
    // Test 8: Test documents API endpoint
    console.log('Test 8: Testing documents API endpoint...');
    await page.click('#test-documents');
    
    // Wait for the API response
    await page.waitForSelector('#documents-result:not(:empty)', { timeout: 10000 });
    
    // Take a screenshot of the API response
    await page.screenshot({ path: `${config.screenshotsDir}/08-documents-response.png` });
    
    // Get the API response
    const documentsResponse = await page.evaluate(() => {
      return document.querySelector('#documents-result').textContent;
    });
    
    console.log('Documents response:', documentsResponse);
    
    console.log('All tests completed successfully!');
  } catch (error) {
    console.error('Error during testing:', error);
  } finally {
    // Close browser
    await browser.close();
  }
}

// Create screenshots directory if it doesn't exist
const fs = require('fs');
if (!fs.existsSync(config.screenshotsDir)) {
  fs.mkdirSync(config.screenshotsDir, { recursive: true });
}

// Run the tests
testDeployedWebsite().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
});
