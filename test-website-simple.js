const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// Create screenshots directory if it doesn't exist
const screenshotsDir = path.join(__dirname, 'website-test-screenshots');
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
    await page.goto('https://backv2-app-326324779592.me-west1.run.app', {
      waitUntil: 'networkidle',
      timeout: 60000
    });
    
    // Take a screenshot of the homepage
    console.log('Taking screenshot of homepage...');
    await page.screenshot({ path: path.join(screenshotsDir, '01-homepage.png') });
    
    // Get all sidebar links
    const sidebarLinks = await page.locator('.sidebar-nav a').all();
    console.log(`Found ${sidebarLinks.length} sidebar links`);
    
    // Click each sidebar link and take a screenshot
    for (let i = 0; i < sidebarLinks.length; i++) {
      const linkText = await sidebarLinks[i].textContent();
      const linkHref = await sidebarLinks[i].getAttribute('href');
      console.log(`Testing navigation to ${linkText.trim()} (${linkHref})...`);
      
      // Click the link
      await sidebarLinks[i].click();
      await page.waitForLoadState('networkidle');
      
      // Take a screenshot
      const screenshotName = `${(i + 2).toString().padStart(2, '0')}-${linkHref.replace(/\//g, '')}.png`;
      await page.screenshot({ path: path.join(screenshotsDir, screenshotName) });
      
      // Go back to homepage if not already there
      if (i < sidebarLinks.length - 1) {
        await page.goto('https://backv2-app-326324779592.me-west1.run.app', {
          waitUntil: 'networkidle'
        });
        
        // Get the sidebar links again (they might have changed)
        const newSidebarLinks = await page.locator('.sidebar-nav a').all();
        sidebarLinks.splice(0, sidebarLinks.length, ...newSidebarLinks);
      }
    }
    
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
