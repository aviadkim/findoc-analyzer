const { chromium } = require('playwright');

async function testWebsite() {
  console.log('Starting browser...');
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 100 // Slow down operations by 100ms
  });
  
  try {
    console.log('Creating new context...');
    const context = await browser.newContext();
    
    console.log('Opening new page...');
    const page = await context.newPage();
    
    // Navigate to the website
    console.log('Navigating to the website...');
    await page.goto('https://backv2-app-326324779592.me-west1.run.app', {
      waitUntil: 'networkidle',
      timeout: 60000
    });
    
    // Take a screenshot
    console.log('Taking screenshot of homepage...');
    await page.screenshot({ path: 'homepage.png' });
    
    // Get page title
    const title = await page.title();
    console.log(`Page title: ${title}`);
    
    // Check if the page has loaded properly
    console.log('Checking page content...');
    const bodyText = await page.evaluate(() => document.body.textContent);
    console.log(`Page content preview: ${bodyText.substring(0, 200).trim()}...`);
    
    // Check for specific elements
    const hasMainContent = await page.locator('.main-content').count() > 0;
    console.log(`Has main content: ${hasMainContent}`);
    
    const hasSidebar = await page.locator('.sidebar').count() > 0;
    console.log(`Has sidebar: ${hasSidebar}`);
    
    // Check for error messages
    const hasError = await page.evaluate(() => {
      return document.body.textContent.includes('Error') || 
             document.body.textContent.includes('Cannot GET') ||
             document.body.textContent.includes('404');
    });
    console.log(`Has error message: ${hasError}`);
    
    // Try to click on the Documents link
    console.log('Clicking on Documents link...');
    try {
      await page.locator('a:has-text("My Documents")').click();
      await page.waitForLoadState('networkidle');
      console.log('Navigated to Documents page');
      await page.screenshot({ path: 'documents-page.png' });
    } catch (error) {
      console.error('Error clicking on Documents link:', error);
    }
    
    // Try to click on the Upload link
    console.log('Clicking on Upload link...');
    try {
      await page.locator('a:has-text("Upload")').click();
      await page.waitForLoadState('networkidle');
      console.log('Navigated to Upload page');
      await page.screenshot({ path: 'upload-page.png' });
    } catch (error) {
      console.error('Error clicking on Upload link:', error);
    }
    
    // Try to click on the Analytics link
    console.log('Clicking on Analytics link...');
    try {
      await page.locator('a:has-text("Analytics")').click();
      await page.waitForLoadState('networkidle');
      console.log('Navigated to Analytics page');
      await page.screenshot({ path: 'analytics-page.png' });
    } catch (error) {
      console.error('Error clicking on Analytics link:', error);
    }
    
    // Check network requests
    console.log('Checking network requests...');
    const [request] = await Promise.all([
      page.waitForRequest(request => request.url().includes('/api/'), { timeout: 5000 }).catch(() => null),
      page.reload({ waitUntil: 'networkidle' })
    ]);
    
    if (request) {
      console.log(`API request detected: ${request.url()}`);
    } else {
      console.log('No API requests detected');
    }
    
    console.log('Test completed successfully');
  } catch (error) {
    console.error('Error during test:', error);
  } finally {
    await browser.close();
    console.log('Browser closed');
  }
}

testWebsite();
