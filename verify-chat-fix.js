/**
 * Verify Chat Fix
 * 
 * This script tests whether the document-chat-fix.js fixes the compatibility
 * issues with the textarea[name="message"] element for Puppeteer tests.
 */

const puppeteer = require('puppeteer');

async function verifyFix() {
  console.log('Starting chat fix verification test');
  
  // Launch browser
  const browser = await puppeteer.launch({
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    defaultViewport: { width: 1280, height: 800 }
  });
  
  // Create a page
  const page = await browser.newPage();
  
  try {
    // Navigate to document chat page
    console.log('Navigating to document chat page...');
    await page.goto('http://localhost:8080/document-chat', {
      waitUntil: 'networkidle2',
      timeout: 30000
    });
    
    // Take a screenshot
    await page.screenshot({ path: 'verify-chat-fix-initial.png' });
    console.log('Screenshot saved to verify-chat-fix-initial.png');
    
    // Check if textarea[name="message"] exists
    console.log('Checking if textarea[name="message"] exists...');
    const messageTextarea = await page.$('textarea[name="message"]');
    
    if (messageTextarea) {
      console.log('✅ SUCCESS: textarea[name="message"] element found');
      
      // Test typing in the textarea
      await messageTextarea.type('Test message for compatibility');
      console.log('Successfully typed in the message textarea');
      
      // Verify it's syncing with the main input
      const mainInput = await page.$('#question-input');
      if (mainInput) {
        const inputValue = await page.evaluate(el => el.value, mainInput);
        console.log(`Main input value: ${inputValue}`);
        
        if (inputValue === 'Test message for compatibility') {
          console.log('✅ SUCCESS: Values are synchronized between the inputs');
        } else {
          console.log('❌ FAILURE: Values are not synchronized');
        }
      }
      
      // Try submitting a message
      console.log('Testing message submission...');
      await page.select('#document-select', 'doc-1');
      console.log('Selected a document');
      
      // Wait for document to load
      await page.waitForTimeout(2000);
      await page.screenshot({ path: 'verify-chat-fix-document-selected.png' });
      
      // Clear the textarea
      await messageTextarea.click({ clickCount: 3 });
      await messageTextarea.press('Backspace');
      
      // Type a new message and submit
      await messageTextarea.type('What is the total value?');
      console.log('Typed test question');
      
      // Find and click the send button 
      const sendButton = await page.$('#send-btn');
      if (sendButton) {
        await sendButton.click();
        console.log('Clicked send button');
        
        // Wait for response
        await page.waitForTimeout(3000);
        await page.screenshot({ path: 'verify-chat-fix-after-send.png' });
        
        // Check if we got a response
        const messages = await page.$$('.message');
        console.log(`Found ${messages.length} messages`);
        
        if (messages.length >= 3) {
          console.log('✅ SUCCESS: Message was sent and received a response');
        } else {
          console.log('❌ FAILURE: No response received to the message');
        }
      } else {
        console.log('❌ FAILURE: Send button not found');
      }
    } else {
      console.log('❌ FAILURE: textarea[name="message"] element not found');
      
      // Check what other chat inputs might exist
      const allInputs = await page.$$('input, textarea');
      console.log(`Found ${allInputs.length} input elements on the page`);
      
      for (let i = 0; i < allInputs.length; i++) {
        const tag = await page.evaluate(el => el.tagName, allInputs[i]);
        const name = await page.evaluate(el => el.name, allInputs[i]);
        const id = await page.evaluate(el => el.id, allInputs[i]);
        const type = await page.evaluate(el => el.type, allInputs[i]);
        
        console.log(`Input ${i+1}: Tag=${tag}, Name=${name}, ID=${id}, Type=${type}`);
      }
    }
    
    // Wait a few seconds to see the results
    await page.waitForTimeout(10000);
    
  } catch (error) {
    console.error('Error during test:', error);
    await page.screenshot({ path: 'verify-chat-fix-error.png' });
  } finally {
    // Close the browser
    await browser.close();
  }
}

// Run the test
verifyFix().catch(console.error);