/**
 * Puppeteer Document Chat Test
 * 
 * This script tests the document chat functionality with focus on the
 * textarea[name="message"] element
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Make sure screenshots directory exists
const screenshotsDir = path.join(__dirname, 'chat-test-screenshots');
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

async function runTest() {
  console.log('Starting document chat test with puppeteer...');
  
  try {
    // Check if we're running in Docker
    const isDocker = process.env.IN_DOCKER === 'true';
    console.log(`Running in ${isDocker ? 'Docker' : 'local'} environment`);

    // Launch browser with different settings based on environment
    const browser = await puppeteer.launch({
      headless: true,  // Use headless mode to avoid GUI issues
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu'
      ],
      executablePath: isDocker ? 'google-chrome-stable' : undefined,
      ignoreDefaultArgs: ['--disable-extensions']
    });
    
    // Create a new page
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });
    
    // When running in Docker, we need to use the host's IP address
    // host.docker.internal resolves to the host machine's IP address from inside Docker
    const baseUrl = process.env.IN_DOCKER ? 'http://host.docker.internal:8080' : 'http://localhost:8080';

    console.log(`1. Navigating to document-chat page at ${baseUrl}/document-chat...`);
    await page.goto(`${baseUrl}/document-chat`, {
      waitUntil: 'networkidle2',
      timeout: 30000
    });
    
    await page.screenshot({ path: path.join(screenshotsDir, '01-initial-page.png') });
    
    // Check if textarea[name="message"] exists
    console.log('2. Looking for textarea[name="message"]...');
    const textarea = await page.$('textarea[name="message"]');
    
    if (textarea) {
      console.log('✅ SUCCESS: textarea[name="message"] element found');
      
      // Select a document from the dropdown
      console.log('3. Selecting document from dropdown...');
      await page.select('#document-select', 'doc-1');
      
      // Take a screenshot after document selection
      await page.waitForTimeout(1000);
      await page.screenshot({ path: path.join(screenshotsDir, '02-document-selected.png') });
      
      // Type a message in the textarea
      console.log('4. Typing message in textarea[name="message"]...');
      await page.type('textarea[name="message"]', 'What is the total value of the portfolio?');
      
      // Take a screenshot after typing
      await page.screenshot({ path: path.join(screenshotsDir, '03-message-typed.png') });
      
      // Submit the message
      console.log('5. Submitting message...');
      const sendButton = await page.$('#send-btn');
      await sendButton.click();
      
      // Wait for response
      console.log('6. Waiting for response...');
      await page.waitForTimeout(3000);
      
      // Take a screenshot after response
      await page.screenshot({ path: path.join(screenshotsDir, '04-after-response.png') });
      
      // Check if we got a response
      const messages = await page.$$('.message');
      console.log(`Found ${messages.length} messages in the chat`);
      
      // Verify a user message and response
      if (messages.length >= 3) {
        console.log('✅ SUCCESS: Message submitted and response received');
      } else {
        console.log('❌ FAILURE: No response received to the submitted message');
      }
      
      // Try second message
      console.log('7. Typing second message...');
      await page.type('textarea[name="message"]', 'What are the top holdings?');
      
      // Submit the second message
      console.log('8. Submitting second message...');
      await sendButton.click();
      
      // Wait for response
      await page.waitForTimeout(3000);
      await page.screenshot({ path: path.join(screenshotsDir, '05-second-response.png') });
      
      // Check messages again
      const messagesAfter = await page.$$('.message');
      console.log(`Found ${messagesAfter.length} messages after second question`);
      
      if (messagesAfter.length >= 5) {
        console.log('✅ SUCCESS: Second message submitted and response received');
      } else {
        console.log('❌ FAILURE: No response received to the second message');
      }
      
    } else {
      console.log('❌ FAILURE: textarea[name="message"] element not found');
      
      // Check for other input elements
      const inputs = await page.$$('input, textarea');
      console.log(`Found ${inputs.length} input/textarea elements on the page`);
      
      // Log details of each input element
      for (let i = 0; i < inputs.length; i++) {
        const tagName = await page.evaluate(el => el.tagName, inputs[i]);
        const name = await page.evaluate(el => el.name || 'no-name', inputs[i]);
        const id = await page.evaluate(el => el.id || 'no-id', inputs[i]);
        console.log(`Input ${i+1}: ${tagName} id="${id}" name="${name}"`);
      }
    }
    
    // Close the browser
    await browser.close();
    
    console.log('Test completed. Screenshots saved in', screenshotsDir);
    
  } catch (error) {
    console.error('Test failed with error:', error);
  }
}

runTest();