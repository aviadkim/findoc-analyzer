/**
 * Capture Enhanced Screenshots
 * 
 * Script to capture screenshots of the enhanced spreadsheet processor UI
 */

const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

// Ensure screenshots directory exists
const screenshotsDir = path.join(__dirname, 'enhanced-screenshots');
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir);
}

async function captureScreenshots() {
  console.log('Launching browser...');
  const browser = await puppeteer.launch({ 
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 900 });
    
    console.log('Navigating to enhanced test server...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
    
    // Capture homepage
    console.log('Capturing homepage...');
    await page.screenshot({ 
      path: path.join(screenshotsDir, '01-homepage.png')
    });
    
    // Click process sample button with browser MCP
    console.log('Selecting browser MCP option...');
    await page.click('#browserMcp');
    
    console.log('Testing sample file with browser MCP...');
    await page.click('#processSampleBtn');
    
    // Wait for processing to complete
    await page.waitForFunction(() => {
      const badge = document.getElementById('resultBadge');
      return badge && badge.textContent === 'Processed';
    }, { timeout: 30000 });
    
    // Wait a bit more to ensure all content is loaded
    await page.waitForTimeout(2000);
    
    // Capture metadata tab
    console.log('Capturing metadata tab...');
    await page.screenshot({ 
      path: path.join(screenshotsDir, '02-metadata-tab.png')
    });
    
    // Switch to entities tab
    console.log('Switching to entities tab...');
    await page.click('#entities-tab');
    await page.waitForTimeout(1000);
    
    // Capture entities tab
    console.log('Capturing entities tab...');
    await page.screenshot({ 
      path: path.join(screenshotsDir, '03-entities-tab.png')
    });
    
    // Switch to tables tab
    console.log('Switching to tables tab...');
    await page.click('#tables-tab');
    await page.waitForTimeout(1000);
    
    // Capture tables tab
    console.log('Capturing tables tab...');
    await page.screenshot({ 
      path: path.join(screenshotsDir, '04-tables-tab.png')
    });
    
    // Switch to visualizations tab
    console.log('Switching to visualizations tab...');
    await page.click('#visualizations-tab');
    await page.waitForTimeout(1000);
    
    // Capture visualizations tab
    console.log('Capturing visualizations tab...');
    await page.screenshot({ 
      path: path.join(screenshotsDir, '05-visualizations-tab.png')
    });
    
    // Done
    console.log('Screenshots captured successfully!');
    console.log('Screenshots saved to:', screenshotsDir);
  } catch (error) {
    console.error('Error capturing screenshots:', error);
  } finally {
    await browser.close();
  }
}

// Export the function
module.exports = { captureScreenshots };

// Run the function if called directly
if (require.main === module) {
  captureScreenshots().catch(console.error);
}