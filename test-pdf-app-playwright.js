/**
 * Automated Test Script for PDF Processing App
 * 
 * This script will:
 * 1. Launch a browser and navigate to the PDF processing app
 * 2. Take screenshots of the initial state
 * 3. Process a sample PDF document
 * 4. Take screenshots of the various results tabs
 * 5. Save all screenshots to the screenshots directory
 */

const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

// Create screenshots directory if it doesn't exist
const screenshotsDir = path.join(__dirname, 'test-screenshots');
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

async function runPdfTest() {
  console.log('Starting automated testing of PDF processing application...');
  
  // Launch browser
  const browser = await chromium.launch({
    headless: false, // Set to true for headless mode, false to see the browser
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  
  try {
    // Create a new context
    const context = await browser.newContext({
      viewport: { width: 1280, height: 800 },
      acceptDownloads: true,
    });
    
    // Create a new page
    const page = await context.newPage();
    
    // Navigate to the application
    console.log('Navigating to PDF processing application...');
    await page.goto('http://localhost:9090', { timeout: 60000 });
    
    // Take a screenshot of the initial state
    console.log('Taking screenshot of initial page...');
    await page.screenshot({ 
      path: path.join(screenshotsDir, '01-initial-page.png'),
      fullPage: true 
    });
    
    // Process sample PDF
    console.log('Clicking Process Sample PDF button...');
    await page.click('#processSampleBtn');
    
    // Wait for processing to complete
    console.log('Waiting for processing to complete...');
    await page.waitForSelector('#resultBadge:has-text("Processed")', { timeout: 60000 });
    await page.waitForTimeout(1000); // Short delay to ensure everything is loaded
    
    // Take a screenshot of the processing results
    console.log('Taking screenshot of processing results (Text tab)...');
    await page.screenshot({ 
      path: path.join(screenshotsDir, '02-processing-results-text.png'),
      fullPage: true 
    });
    
    // Switch to Tables tab and take screenshot
    console.log('Switching to Tables tab...');
    await page.click('#tables-tab');
    await page.waitForTimeout(1000);
    
    console.log('Taking screenshot of Tables tab...');
    await page.screenshot({ 
      path: path.join(screenshotsDir, '03-tables-tab.png'),
      fullPage: true 
    });
    
    // Switch to Entities tab and take screenshot
    console.log('Switching to Entities tab...');
    await page.click('#entities-tab');
    await page.waitForTimeout(1000);
    
    console.log('Taking screenshot of Entities tab...');
    await page.screenshot({ 
      path: path.join(screenshotsDir, '04-entities-tab.png'),
      fullPage: true 
    });
    
    // Switch to Metadata tab and take screenshot
    console.log('Switching to Metadata tab...');
    await page.click('#metadata-tab');
    await page.waitForTimeout(1000);
    
    console.log('Taking screenshot of Metadata tab...');
    await page.screenshot({ 
      path: path.join(screenshotsDir, '05-metadata-tab.png'),
      fullPage: true 
    });
    
    // Test with MCP Processing option
    console.log('Testing with MCP Processing option...');
    await page.click('#mcpProcessing'); // Select MCP processing radio button
    
    // Process sample PDF again with MCP option
    console.log('Clicking Process Sample PDF button with MCP option...');
    await page.click('#processSampleBtn');
    
    // Wait for processing to complete
    console.log('Waiting for MCP processing to complete...');
    await page.waitForSelector('#resultBadge:has-text("Processed")', { timeout: 60000 });
    await page.waitForTimeout(1000);
    
    // Take a screenshot of the MCP processing results
    console.log('Taking screenshot of MCP processing results...');
    await page.screenshot({ 
      path: path.join(screenshotsDir, '06-mcp-processing-results.png'),
      fullPage: true 
    });
    
    // Switch to Entities tab for MCP results and take screenshot
    console.log('Switching to Entities tab for MCP results...');
    await page.click('#entities-tab');
    await page.waitForTimeout(1000);
    
    console.log('Taking screenshot of Entities tab with MCP results...');
    await page.screenshot({ 
      path: path.join(screenshotsDir, '07-mcp-entities-tab.png'),
      fullPage: true 
    });
    
    console.log('Testing completed successfully!');
    console.log(`Screenshots saved to: ${screenshotsDir}`);
  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    console.log('Closing browser...');
    await browser.close();
  }
}

// Run the test
runPdfTest().catch(console.error);