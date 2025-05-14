/**
 * Capture Result Screenshot
 * 
 * Script to capture screenshot of the test result HTML file
 */

const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

// Ensure screenshots directory exists
const screenshotsDir = path.join(__dirname, 'test-screenshots');
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
    await page.setViewport({ width: 1280, height: 1800 });
    
    const htmlPath = path.join(__dirname, 'test-result.html');
    const fileUrl = `file://${htmlPath}`;
    
    console.log('Opening result HTML file...');
    await page.goto(fileUrl, { waitUntil: 'networkidle0' });
    
    // Capture overview tab
    console.log('Capturing overview tab...');
    await page.screenshot({ 
      path: path.join(screenshotsDir, '01-overview-tab.png')
    });
    
    // Switch to tables tab
    console.log('Switching to tables tab...');
    await page.click('#tables-tab');
    await page.waitForTimeout(500);
    
    // Capture tables tab
    console.log('Capturing tables tab...');
    await page.screenshot({ 
      path: path.join(screenshotsDir, '02-tables-tab.png')
    });
    
    // Switch to entities tab
    console.log('Switching to entities tab...');
    await page.click('#entities-tab');
    await page.waitForTimeout(500);
    
    // Capture entities tab
    console.log('Capturing entities tab...');
    await page.screenshot({ 
      path: path.join(screenshotsDir, '03-entities-tab.png')
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

captureScreenshots().catch(console.error);