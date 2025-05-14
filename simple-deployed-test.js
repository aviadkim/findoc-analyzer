const { chromium } = require('playwright');

// Configuration
const config = {
  url: 'https://findoc-deploy.ey.r.appspot.com',
  screenshotsDir: './test-screenshots',
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
    recordVideo: { dir: './test-videos' }
  });
  
  // Create a new page
  const page = await context.newPage();
  
  try {
    // Test 1: Home Page
    console.log('Test 1: Checking home page...');
    await page.goto(config.url);
    await page.screenshot({ path: `${config.screenshotsDir}/home-page.png` });
    console.log('Home page loaded successfully');
    
    // Test 2: Upload Page
    console.log('Test 2: Checking upload page...');
    await page.goto(`${config.url}/upload`);
    await page.screenshot({ path: `${config.screenshotsDir}/upload-page.png` });
    console.log('Upload page loaded successfully');
    
    // Test 3: Chat Page
    console.log('Test 3: Checking chat page...');
    await page.goto(`${config.url}/chat`);
    await page.screenshot({ path: `${config.screenshotsDir}/chat-page.png` });
    console.log('Chat page loaded successfully');
    
    // Test 4: Analytics Page
    console.log('Test 4: Checking analytics page...');
    await page.goto(`${config.url}/analytics`);
    await page.screenshot({ path: `${config.screenshotsDir}/analytics-page.png` });
    console.log('Analytics page loaded successfully');
    
    // Test 5: Export Page
    console.log('Test 5: Checking export page...');
    await page.goto(`${config.url}/export`);
    await page.screenshot({ path: `${config.screenshotsDir}/export-page.png` });
    console.log('Export page loaded successfully');
    
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
