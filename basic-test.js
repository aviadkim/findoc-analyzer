const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// Create directories for screenshots and results
const screenshotsDir = path.join(__dirname, 'playwright-screenshots');
const resultsDir = path.join(__dirname, 'playwright-results');

if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

if (!fs.existsSync(resultsDir)) {
  fs.mkdirSync(resultsDir, { recursive: true });
}

// URL of the deployed application
const baseUrl = 'https://backv2-app-326324779592.me-west1.run.app';

// Helper function to log with timestamp
function log(message) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${message}`);
  fs.appendFileSync(
    path.join(resultsDir, 'test-log.txt'),
    `[${timestamp}] ${message}\n`
  );
}

// Main test function
async function runBasicTests() {
  log('Starting basic tests');
  
  const browser = await chromium.launch({
    headless: false // Set to false to see the browser
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    // Test 1: Navigate to homepage
    log('Test 1: Navigate to homepage');
    await page.goto(baseUrl);
    await page.screenshot({ path: path.join(screenshotsDir, '01-homepage.png') });
    log('Homepage loaded successfully');
    
    // Test 2: Check API health
    log('Test 2: Check API health');
    await page.goto(`${baseUrl}/api/health`);
    const healthContent = await page.content();
    const isHealthy = healthContent.includes('status') && healthContent.includes('ok');
    await page.screenshot({ path: path.join(screenshotsDir, '02-api-health.png') });
    log(`API health check: ${isHealthy ? 'Passed' : 'Failed'}`);
    
    // Test 3: Navigate to documents page
    log('Test 3: Navigate to documents page');
    await page.goto(`${baseUrl}/documents-new`);
    await page.screenshot({ path: path.join(screenshotsDir, '03-documents-page.png') });
    log('Documents page loaded successfully');
    
    // Test 4: Navigate to upload page
    log('Test 4: Navigate to upload page');
    await page.goto(`${baseUrl}/upload`);
    await page.screenshot({ path: path.join(screenshotsDir, '04-upload-page.png') });
    log('Upload page loaded successfully');
    
    // Test 5: Navigate to document chat page
    log('Test 5: Navigate to document chat page');
    await page.goto(`${baseUrl}/document-chat`);
    await page.screenshot({ path: path.join(screenshotsDir, '05-document-chat-page.png') });
    log('Document chat page loaded successfully');
    
    // Test 6: Navigate to analytics page
    log('Test 6: Navigate to analytics page');
    await page.goto(`${baseUrl}/analytics-new`);
    await page.screenshot({ path: path.join(screenshotsDir, '06-analytics-page.png') });
    log('Analytics page loaded successfully');
    
    // Test 7: Check sidebar navigation
    log('Test 7: Check sidebar navigation');
    await page.goto(baseUrl);
    
    // Click on Documents link in sidebar
    await page.click('text=My Documents');
    await page.waitForURL(`${baseUrl}/documents-new`);
    await page.screenshot({ path: path.join(screenshotsDir, '07-sidebar-documents.png') });
    log('Sidebar navigation to Documents page successful');
    
    // Click on Upload link in sidebar
    await page.click('text=Upload');
    await page.waitForURL(`${baseUrl}/upload`);
    await page.screenshot({ path: path.join(screenshotsDir, '08-sidebar-upload.png') });
    log('Sidebar navigation to Upload page successful');
    
    // Click on Document Chat link in sidebar
    await page.click('text=Document Chat');
    await page.waitForURL(`${baseUrl}/document-chat`);
    await page.screenshot({ path: path.join(screenshotsDir, '09-sidebar-document-chat.png') });
    log('Sidebar navigation to Document Chat page successful');
    
    log('All basic tests completed successfully');
    
  } catch (error) {
    log(`Error in tests: ${error.message}`);
    console.error(error);
    await page.screenshot({ path: path.join(screenshotsDir, 'error.png') });
  } finally {
    await browser.close();
  }
}

// Run the tests
runBasicTests().catch(error => {
  console.error('Error running tests:', error);
});
