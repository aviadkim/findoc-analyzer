/**
 * Capture Test Screenshots
 * 
 * Script to capture screenshots of the spreadsheet test interface
 * using Puppeteer
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
    await page.setViewport({ width: 1280, height: 900 });
    
    console.log('Navigating to test server...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
    
    // Capture homepage
    console.log('Capturing homepage...');
    await page.screenshot({ 
      path: path.join(screenshotsDir, '01-homepage.png'),
      fullPage: true 
    });
    
    // Click test sample button
    console.log('Testing sample file...');
    await page.click('#testSampleBtn');
    
    // Wait for processing to complete
    await page.waitForSelector('#resultSection', { visible: true, timeout: 20000 });
    
    // Capture overview result
    console.log('Capturing overview result...');
    await page.screenshot({ 
      path: path.join(screenshotsDir, '02-overview-result.png'),
      fullPage: true 
    });
    
    // Switch to tables tab
    console.log('Switching to tables tab...');
    await page.click('button[data-tab="tables"]');
    await page.waitForTimeout(500);
    
    // Capture tables result
    console.log('Capturing tables result...');
    await page.screenshot({ 
      path: path.join(screenshotsDir, '03-tables-result.png'),
      fullPage: true 
    });
    
    // Switch to entities tab
    console.log('Switching to entities tab...');
    await page.click('button[data-tab="entities"]');
    await page.waitForTimeout(500);
    
    // Capture entities result
    console.log('Capturing entities result...');
    await page.screenshot({ 
      path: path.join(screenshotsDir, '04-entities-result.png'),
      fullPage: true 
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