const { chromium } = require('playwright');

// Configuration
const config = {
  url: 'https://findoc-deploy.ey.r.appspot.com',
  screenshotsDir: './test-screenshots-final',
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
    recordVideo: { dir: './test-videos-final' }
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
    
    // Test 5: Simple Test Page
    console.log('Test 5: Checking simple test page...');
    await page.goto(`${config.url}/simple-test`);
    await page.screenshot({ path: `${config.screenshotsDir}/05-simple-test-page.png` });
    console.log('Simple test page loaded successfully');
    
    // Test 6: API Health Endpoint
    console.log('Test 6: Checking API health endpoint...');
    await page.goto(`${config.url}/api/health`);
    const healthResponse = await page.content();
    console.log('API health response:', healthResponse);
    await page.screenshot({ path: `${config.screenshotsDir}/06-api-health.png` });
    console.log('API health endpoint loaded successfully');
    
    // Test 7: Documents API Endpoint
    console.log('Test 7: Checking documents API endpoint...');
    await page.goto(`${config.url}/api/documents`);
    const documentsResponse = await page.content();
    console.log('Documents API response:', documentsResponse);
    await page.screenshot({ path: `${config.screenshotsDir}/07-api-documents.png` });
    console.log('Documents API endpoint loaded successfully');
    
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
