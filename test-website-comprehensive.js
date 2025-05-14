const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// Create screenshots directory if it doesn't exist
const screenshotsDir = path.join(__dirname, 'website-test-screenshots');
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

async function testWebsite() {
  console.log('Starting comprehensive website test...');
  
  // Launch browser with headed mode to see what's happening
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 100 // Slow down operations by 100ms
  });
  
  try {
    // Create a new browser context
    const context = await browser.newContext({
      viewport: { width: 1280, height: 800 },
      recordVideo: { 
        dir: path.join(__dirname, 'website-test-videos'),
        size: { width: 1280, height: 800 }
      }
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
    
    // Test navigation to Documents page
    console.log('Testing navigation to Documents page...');
    await page.locator('a:has-text("Documents")').first().click();
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: path.join(screenshotsDir, '02-documents.png') });
    
    // Test navigation to Upload page
    console.log('Testing navigation to Upload page...');
    await page.locator('a:has-text("Upload")').first().click();
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: path.join(screenshotsDir, '03-upload.png') });
    
    // Test navigation to Analytics page
    console.log('Testing navigation to Analytics page...');
    await page.locator('a:has-text("Analytics")').first().click();
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: path.join(screenshotsDir, '04-analytics.png') });
    
    // Test navigation to Chat page
    console.log('Testing navigation to Chat page...');
    await page.locator('a:has-text("Chat")').first().click();
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: path.join(screenshotsDir, '05-chat.png') });
    
    // Test navigation to Document Chat page
    console.log('Testing navigation to Document Chat page...');
    await page.locator('a:has-text("Document Chat")').first().click();
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: path.join(screenshotsDir, '06-document-chat.png') });
    
    // Test navigation to Settings page
    console.log('Testing navigation to Settings page...');
    await page.locator('a:has-text("Settings")').first().click();
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: path.join(screenshotsDir, '07-settings.png') });
    
    // Test navigation back to Dashboard
    console.log('Testing navigation back to Dashboard...');
    await page.locator('a:has-text("Dashboard")').first().click();
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: path.join(screenshotsDir, '08-dashboard.png') });
    
    // Test Upload functionality
    console.log('Testing Upload functionality...');
    await page.locator('a:has-text("Upload")').first().click();
    await page.waitForLoadState('networkidle');
    
    // Fill in upload form
    await page.fill('#document-name', 'Test Document');
    await page.selectOption('#document-type', 'portfolio');
    
    // Click the upload button (without actually uploading a file)
    await page.locator('#upload-btn').click();
    
    // Check for alert
    try {
      // Handle alert
      page.on('dialog', async dialog => {
        console.log(`Dialog message: ${dialog.message()}`);
        await dialog.accept();
      });
      
      // Wait for alert to appear
      await page.waitForTimeout(1000);
    } catch (error) {
      console.log('No alert appeared');
    }
    
    // Test Chat functionality
    console.log('Testing Chat functionality...');
    await page.locator('a:has-text("Chat")').first().click();
    await page.waitForLoadState('networkidle');
    
    // Type a message
    await page.fill('#chat-input', 'What is the current price of AAPL?');
    
    // Send the message
    await page.locator('#send-btn').click();
    
    // Wait for response
    await page.waitForTimeout(2000);
    
    // Take a screenshot of the chat
    await page.screenshot({ path: path.join(screenshotsDir, '09-chat-response.png') });
    
    // Test Document Chat functionality
    console.log('Testing Document Chat functionality...');
    await page.locator('a:has-text("Document Chat")').first().click();
    await page.waitForLoadState('networkidle');
    
    // Select a document
    await page.selectOption('#document-select', 'doc-1');
    
    // Type a message
    await page.fill('#document-chat-input', 'What securities are in this document?');
    
    // Send the message
    await page.locator('#document-send-btn').click();
    
    // Wait for response
    await page.waitForTimeout(2000);
    
    // Take a screenshot of the document chat
    await page.screenshot({ path: path.join(screenshotsDir, '10-document-chat-response.png') });
    
    // Test browser navigation (back button)
    console.log('Testing browser navigation (back button)...');
    await page.goBack();
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: path.join(screenshotsDir, '11-back-navigation.png') });
    
    // Test browser navigation (forward button)
    console.log('Testing browser navigation (forward button)...');
    await page.goForward();
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: path.join(screenshotsDir, '12-forward-navigation.png') });
    
    // Test direct URL navigation
    console.log('Testing direct URL navigation...');
    await page.goto('https://backv2-app-326324779592.me-west1.run.app/analytics', {
      waitUntil: 'networkidle'
    });
    await page.screenshot({ path: path.join(screenshotsDir, '13-direct-url-navigation.png') });
    
    // Test 404 page
    console.log('Testing 404 page...');
    await page.goto('https://backv2-app-326324779592.me-west1.run.app/non-existent-page', {
      waitUntil: 'networkidle'
    });
    await page.screenshot({ path: path.join(screenshotsDir, '14-404-page.png') });
    
    console.log('Comprehensive website test completed successfully!');
    
    // Generate a simple HTML report
    generateReport();
  } catch (error) {
    console.error('Error during test:', error);
  } finally {
    await browser.close();
    console.log('Browser closed');
  }
}

function generateReport() {
  const screenshots = fs.readdirSync(screenshotsDir)
    .filter(file => file.endsWith('.png'))
    .sort();
  
  const reportHtml = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Website Test Report</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
        }
        h1 {
          text-align: center;
          margin-bottom: 30px;
        }
        .screenshot {
          margin-bottom: 40px;
          border: 1px solid #ddd;
          padding: 20px;
          border-radius: 5px;
        }
        .screenshot h2 {
          margin-top: 0;
        }
        img {
          max-width: 100%;
          border: 1px solid #eee;
        }
      </style>
    </head>
    <body>
      <h1>FinDoc Analyzer Website Test Report</h1>
      
      ${screenshots.map(screenshot => `
        <div class="screenshot">
          <h2>${screenshot.replace('.png', '').substring(3).replace(/-/g, ' ')}</h2>
          <img src="${screenshot}" alt="${screenshot}">
        </div>
      `).join('')}
    </body>
    </html>
  `;
  
  fs.writeFileSync(path.join(__dirname, 'website-test-report.html'), reportHtml);
  console.log('Test report generated at website-test-report.html');
}

// Run the test
testWebsite();
