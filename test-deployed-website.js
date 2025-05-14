const puppeteer = require('puppeteer');

async function testWebsite() {
  console.log('Starting browser...');
  const browser = await puppeteer.launch({
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    console.log('Opening new page...');
    const page = await browser.newPage();
    
    // Set viewport size
    await page.setViewport({ width: 1280, height: 800 });
    
    // Navigate to the website
    console.log('Navigating to the website...');
    await page.goto('https://backv2-app-326324779592.me-west1.run.app', {
      waitUntil: 'networkidle2',
      timeout: 60000
    });
    
    // Take a screenshot
    console.log('Taking screenshot...');
    await page.screenshot({ path: 'website-screenshot.png' });
    
    // Get page title
    const title = await page.title();
    console.log(`Page title: ${title}`);
    
    // Check if the page has loaded properly
    console.log('Checking page content...');
    const bodyText = await page.evaluate(() => document.body.textContent);
    console.log(`Page content: ${bodyText.substring(0, 200)}...`);
    
    // Check for specific elements
    const hasMainContent = await page.evaluate(() => {
      return !!document.querySelector('.main-content');
    });
    console.log(`Has main content: ${hasMainContent}`);
    
    const hasSidebar = await page.evaluate(() => {
      return !!document.querySelector('.sidebar');
    });
    console.log(`Has sidebar: ${hasSidebar}`);
    
    // Check for error messages
    const hasError = await page.evaluate(() => {
      return document.body.textContent.includes('Error') || 
             document.body.textContent.includes('Cannot GET') ||
             document.body.textContent.includes('404');
    });
    console.log(`Has error message: ${hasError}`);
    
    // Check console logs
    const consoleLogs = [];
    page.on('console', msg => {
      consoleLogs.push(msg.text());
    });
    
    // Wait a bit to collect console logs
    await page.waitForTimeout(2000);
    console.log('Console logs:', consoleLogs);
    
    console.log('Test completed successfully');
  } catch (error) {
    console.error('Error during test:', error);
  } finally {
    await browser.close();
    console.log('Browser closed');
  }
}

testWebsite();
