const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// Create screenshots directory if it doesn't exist
const screenshotsDir = path.join(__dirname, 'website-test-screenshots-2');
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

async function testWebsite() {
  console.log('Starting simple website test...');
  
  // Launch browser with headed mode to see what's happening
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 100 // Slow down operations by 100ms
  });
  
  try {
    // Create a new browser context
    const context = await browser.newContext({
      viewport: { width: 1280, height: 800 }
    });
    
    // Create a new page
    const page = await context.newPage();
    
    // Enable console logging
    page.on('console', msg => {
      console.log(`Browser console: ${msg.type()}: ${msg.text()}`);
    });
    
    // Navigate to the website
    console.log('Navigating to the website...');
    await page.goto('http://localhost:8080', {
      waitUntil: 'networkidle',
      timeout: 60000
    });
    
    // Take a screenshot of the homepage
    console.log('Taking screenshot of homepage...');
    await page.screenshot({ path: path.join(screenshotsDir, '01-homepage.png') });
    
    // Click on the Documents link
    console.log('Clicking on Documents link...');
    await page.locator('a:has-text("My Documents")').first().click();
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: path.join(screenshotsDir, '02-documents.png') });
    
    // Click on the Upload link
    console.log('Clicking on Upload link...');
    await page.locator('a:has-text("Upload")').first().click();
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: path.join(screenshotsDir, '03-upload.png') });
    
    // Click on the Analytics link
    console.log('Clicking on Analytics link...');
    await page.locator('a:has-text("Analytics")').first().click();
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: path.join(screenshotsDir, '04-analytics.png') });
    
    // Click on the Chat link
    console.log('Clicking on Chat link...');
    await page.locator('a:has-text("Chat")').first().click();
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: path.join(screenshotsDir, '05-chat.png') });
    
    // Click on the Document Chat link
    console.log('Clicking on Document Chat link...');
    await page.locator('a:has-text("Document Chat")').first().click();
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: path.join(screenshotsDir, '06-document-chat.png') });
    
    // Go back to the homepage
    console.log('Going back to the homepage...');
    await page.locator('a:has-text("Dashboard")').first().click();
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: path.join(screenshotsDir, '07-dashboard.png') });
    
    console.log('Simple website test completed successfully!');
  } catch (error) {
    console.error('Error during test:', error);
  } finally {
    await browser.close();
    console.log('Browser closed');
  }
}

// Run the test
testWebsite();
