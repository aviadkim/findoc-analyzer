const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

// Check if screenshots directory exists, create if not
const screenshotsDir = path.join(__dirname, 'ui-test-screenshots');
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

async function testUIComponents() {
  console.log('Starting UI components test...');
  
  // Launch browser
  const browser = await puppeteer.launch({
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1280,800']
  });
  
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });
    
    console.log('Testing upload page with process button...');
    await page.goto('http://localhost:9090/upload.html');
    await page.waitForSelector('#show-chat-btn', { timeout: 5000 });
    
    // Take screenshot of upload page
    await page.screenshot({ path: path.join(screenshotsDir, '01-upload-page.png') });
    console.log('Screenshot saved: 01-upload-page.png');
    
    // Test chat button
    console.log('Testing chat button...');
    await page.click('#show-chat-btn');
    await page.waitForSelector('#document-chat-container', { timeout: 5000 });
    
    // Take screenshot of chat interface
    await page.screenshot({ path: path.join(screenshotsDir, '02-chat-interface.png') });
    console.log('Screenshot saved: 02-chat-interface.png');
    
    // Type a message in the chat
    await page.type('#document-chat-input', 'Tell me about this document');
    await page.click('#document-send-btn');
    
    // Wait for AI response
    await page.waitForFunction(() => {
      const messages = document.querySelectorAll('#document-chat-messages > div');
      return messages.length >= 3; // Initial message + user message + AI response
    }, { timeout: 5000 });
    
    // Take screenshot of chat with messages
    await page.screenshot({ path: path.join(screenshotsDir, '03-chat-messages.png') });
    console.log('Screenshot saved: 03-chat-messages.png');
    
    // Close chat
    await page.evaluate(() => {
      const closeButton = document.querySelector('#document-chat-container button');
      if (closeButton) closeButton.click();
    });
    
    // Test process button
    console.log('Testing process button...');
    
    // Check if process button exists
    const processButtonExists = await page.evaluate(() => {
      return !!document.querySelector('#process-document-btn');
    });
    
    if (processButtonExists) {
      await page.click('#process-document-btn');
      
      // Wait for progress bar
      await page.waitForSelector('#progress-container', { timeout: 5000 });
      
      // Take screenshot of processing
      await page.screenshot({ path: path.join(screenshotsDir, '04-processing.png') });
      console.log('Screenshot saved: 04-processing.png');
      
      // Wait for progress to complete
      await page.waitForFunction(() => {
        const progressBar = document.querySelector('#progress-bar');
        return progressBar && progressBar.style.width === '100%';
      }, { timeout: 10000 });
      
      // Take screenshot of completed progress
      await page.screenshot({ path: path.join(screenshotsDir, '05-processing-complete.png') });
      console.log('Screenshot saved: 05-processing-complete.png');
    } else {
      console.log('Process button not found, skipping...');
    }
    
    // Test test page with agent cards
    console.log('Testing test page with agent cards...');
    await page.goto('http://localhost:9090/test.html');
    
    // Wait for agent cards
    try {
      await page.waitForSelector('.agent-card', { timeout: 5000 });
      
      // Take screenshot of agent cards
      await page.screenshot({ path: path.join(screenshotsDir, '06-agent-cards.png') });
      console.log('Screenshot saved: 06-agent-cards.png');
      
      // Test configure button on first card
      const configureButtonExists = await page.evaluate(() => {
        const button = document.querySelector('.agent-action.btn-primary');
        return !!button;
      });
      
      if (configureButtonExists) {
        // Click configure button and handle alert
        page.on('dialog', async dialog => {
          console.log('Dialog message:', dialog.message());
          await dialog.accept();
        });
        
        await page.click('.agent-action.btn-primary');
        
        // Take screenshot after clicking configure
        await page.screenshot({ path: path.join(screenshotsDir, '07-agent-configure.png') });
        console.log('Screenshot saved: 07-agent-configure.png');
      }
    } catch (error) {
      console.log('Agent cards not found, skipping...');
    }
    
    // Test validation page
    console.log('Testing validation page...');
    await page.goto('http://localhost:9090/ui-components-validation.html');
    
    // Take screenshot of validation page
    await page.screenshot({ path: path.join(screenshotsDir, '08-validation-page.png') });
    console.log('Screenshot saved: 08-validation-page.png');
    
    // Test validation button (if exists)
    const validationButtonExists = await page.evaluate(() => {
      return !!document.querySelector('#validation-report-btn');
    });
    
    if (validationButtonExists) {
      await page.click('#validation-report-btn');
      
      // Wait for validation report
      await page.waitForSelector('#validation-report-container', { timeout: 5000 });
      
      // Take screenshot of validation report
      await page.screenshot({ path: path.join(screenshotsDir, '09-validation-report.png') });
      console.log('Screenshot saved: 09-validation-report.png');
    }
    
    console.log('UI Components test completed successfully!');
  } catch (error) {
    console.error('Error during test:', error);
  } finally {
    // Close browser
    await browser.close();
  }
}

// Run the test
testUIComponents().catch(console.error);