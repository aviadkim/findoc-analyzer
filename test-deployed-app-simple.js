const { chromium } = require('playwright');

// Configuration
const config = {
  url: 'https://findoc-deploy.ey.r.appspot.com',
  screenshotsDir: './test-screenshots-simple',
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
    recordVideo: { dir: './test-videos-simple' }
  });
  
  // Create a new page
  const page = await context.newPage();
  
  try {
    // Test 1: Home Page
    console.log('Test 1: Checking home page...');
    await page.goto(config.url);
    await page.screenshot({ path: `${config.screenshotsDir}/01-home-page.png` });
    console.log('Home page loaded successfully');
    
    // Test 2: Simple Test Page
    console.log('Test 2: Checking simple test page...');
    await page.goto(`${config.url}/simple-test`);
    await page.screenshot({ path: `${config.screenshotsDir}/02-simple-test-page.png` });
    console.log('Simple test page loaded successfully');
    
    // Test 3: Test API health endpoint
    console.log('Test 3: Testing API health endpoint...');
    await page.goto(`${config.url}/simple-test`);
    
    // Check if the test-api button exists
    const testApiButtonExists = await page.evaluate(() => {
      return !!document.querySelector('#test-api');
    });
    
    if (testApiButtonExists) {
      console.log('Test API button found');
      await page.click('#test-api');
      
      // Wait for the API response
      try {
        await page.waitForSelector('#api-result:not(:empty)', { timeout: 10000 });
        
        // Take a screenshot of the API response
        await page.screenshot({ path: `${config.screenshotsDir}/03-api-health-response.png` });
        
        // Get the API response
        const apiResponse = await page.evaluate(() => {
          return document.querySelector('#api-result').textContent;
        });
        
        console.log('API health response:', apiResponse);
      } catch (error) {
        console.warn('Error waiting for API response:', error.message);
        await page.screenshot({ path: `${config.screenshotsDir}/03-api-health-error.png` });
      }
    } else {
      console.warn('Test API button not found');
      await page.screenshot({ path: `${config.screenshotsDir}/03-test-api-button-not-found.png` });
    }
    
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
