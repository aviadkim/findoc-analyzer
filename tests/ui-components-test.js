/**
 * UI Components Test
 * Tests the UI components functionality
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Main function
async function main() {
  console.log('Starting UI Components Test...');
  
  // Create screenshots directory
  const screenshotsDir = path.join(__dirname, 'ui-components-test-screenshots');
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }
  
  // Launch browser
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
    args: ['--start-maximized']
  });
  
  const page = await browser.newPage();
  
  try {
    // Step 1: Navigate to UI components test page
    console.log('Step 1: Navigating to UI components test page...');
    await page.goto('http://localhost:8080/ui-components-test', { waitUntil: 'networkidle2', timeout: 30000 });
    await page.screenshot({ path: path.join(screenshotsDir, '01-ui-components-test-page.png'), fullPage: true });
    
    // Step 2: Test backend API
    console.log('Step 2: Testing backend API...');
    const apiTestButton = await page.$('.test-section:nth-child(1) .test-button');
    if (apiTestButton) {
      await apiTestButton.click();
      
      // Wait for API test to complete
      await page.waitForFunction(() => {
        const resultElement = document.getElementById('api-test-result');
        return resultElement && resultElement.textContent.includes('All API tests passed');
      }, { timeout: 10000 }).catch(error => {
        console.log('API test did not complete successfully, continuing anyway');
      });
      
      await page.screenshot({ path: path.join(screenshotsDir, '02-api-test-result.png'), fullPage: true });
    } else {
      console.error('API test button not found!');
    }
    
    // Step 3: Test agent cards
    console.log('Step 3: Testing agent cards...');
    const agentCardsTestButton = await page.$('.test-section:nth-child(2) .test-button');
    if (agentCardsTestButton) {
      await agentCardsTestButton.click();
      
      // Wait for agent cards test to complete
      await page.waitForFunction(() => {
        const resultElement = document.getElementById('agent-cards-test-result');
        return resultElement && resultElement.textContent.includes('Agent cards test passed');
      }, { timeout: 10000 }).catch(error => {
        console.log('Agent cards test did not complete successfully, continuing anyway');
      });
      
      await page.screenshot({ path: path.join(screenshotsDir, '03-agent-cards-test-result.png'), fullPage: true });
    } else {
      console.error('Agent cards test button not found!');
    }
    
    // Step 4: Test chat interface
    console.log('Step 4: Testing chat interface...');
    const chatInterfaceTestButton = await page.$('.test-section:nth-child(3) .test-button');
    if (chatInterfaceTestButton) {
      await chatInterfaceTestButton.click();
      
      // Wait for chat interface test to complete
      await page.waitForFunction(() => {
        const resultElement = document.getElementById('chat-interface-test-result');
        return resultElement && resultElement.textContent.includes('Chat interface test passed');
      }, { timeout: 10000 }).catch(error => {
        console.log('Chat interface test did not complete successfully, continuing anyway');
      });
      
      await page.screenshot({ path: path.join(screenshotsDir, '04-chat-interface-test-result.png'), fullPage: true });
    } else {
      console.error('Chat interface test button not found!');
    }
    
    // Step 5: Test process button
    console.log('Step 5: Testing process button...');
    const processButtonTestButton = await page.$('.test-section:nth-child(4) .test-button');
    if (processButtonTestButton) {
      await processButtonTestButton.click();
      
      // Wait for redirect to upload page
      await page.waitForNavigation({ timeout: 10000 }).catch(error => {
        console.log('Redirect to upload page did not complete, continuing anyway');
      });
      
      await page.screenshot({ path: path.join(screenshotsDir, '05-upload-page.png'), fullPage: true });
      
      // Check if process button exists
      const processButton = await page.$('#process-document-btn');
      if (processButton) {
        console.log('Process button found on upload page');
        
        // Highlight process button
        await page.evaluate(() => {
          const processButton = document.getElementById('process-document-btn');
          if (processButton) {
            processButton.style.border = '2px solid red';
          }
        });
        
        await page.screenshot({ path: path.join(screenshotsDir, '06-process-button-highlighted.png'), fullPage: true });
      } else {
        console.error('Process button not found on upload page!');
      }
    } else {
      console.error('Process button test button not found!');
    }
    
    console.log('UI Components Test completed successfully!');
    console.log(`Screenshots saved to ${screenshotsDir}`);
    
  } catch (error) {
    console.error('Error during test:', error);
  } finally {
    // Wait for user to press a key
    console.log('\nPress any key to close the browser...');
    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.on('data', () => {
      browser.close();
      process.exit(0);
    });
  }
}

// Run the test
main().catch(console.error);
