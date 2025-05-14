/**
 * Document Chat Functionality Test
 * Tests for document chat functionality
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Test configuration
const config = {
  url: process.env.TEST_URL || 'http://localhost:8081',
  chatPath: '/document-chat',
  testQuestion: 'What information is in this document?',
  screenshotsDir: path.join(__dirname, '../results/screenshots/document-chat')
};

// Create screenshots directory
if (!fs.existsSync(config.screenshotsDir)) {
  fs.mkdirSync(config.screenshotsDir, { recursive: true });
}

// Run the test
async function runTest() {
  console.log(`Testing Document Chat Functionality at ${config.url}${config.chatPath}...`);
  
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const results = {
    feature: 'Document Chat',
    url: `${config.url}${config.chatPath}`,
    steps: {},
    success: false
  };
  
  try {
    const page = await browser.newPage();
    
    // Step 1: Navigate to document chat page
    console.log('Step 1: Navigating to document chat page...');
    await page.goto(`${config.url}${config.chatPath}`, { waitUntil: 'networkidle2', timeout: 30000 });
    
    await page.screenshot({ 
      path: path.join(config.screenshotsDir, '01-chat-page.png'),
      fullPage: true
    });
    
    results.steps['navigate'] = { success: true };
    
    // Step 2: Check for document selector
    console.log('Step 2: Checking for document selector...');
    const documentSelector = await page.$('select');
    
    if (documentSelector) {
      console.log('✅ Document selector found');
      results.steps['selector'] = { success: true };
      
      // Check if there are any documents in the selector
      const options = await page.$$('select option');
      const optionCount = options.length;
      
      console.log(`Found ${optionCount} options in document selector`);
      results.steps['selector'].optionCount = optionCount;
      
      // If there are documents, select the first one
      if (optionCount > 1) {
        console.log('Selecting the first document...');
        
        // Get the value of the first non-empty option
        const firstOptionValue = await page.evaluate(() => {
          const options = Array.from(document.querySelectorAll('select option'));
          const firstNonEmptyOption = options.find(option => option.value);
          return firstNonEmptyOption ? firstNonEmptyOption.value : '';
        });
        
        if (firstOptionValue) {
          await page.select('select', firstOptionValue);
          console.log(`Selected document with value: ${firstOptionValue}`);
          
          // Take screenshot after document selection
          await page.screenshot({ 
            path: path.join(config.screenshotsDir, '02-document-selected.png'),
            fullPage: true
          });
          
          results.steps['document-selection'] = { 
            success: true,
            selectedValue: firstOptionValue
          };
        } else {
          console.log('❌ No document with a valid value found');
          results.steps['document-selection'] = { 
            success: false,
            error: 'No document with a valid value found'
          };
        }
      } else {
        console.log('❌ No documents available for selection');
        results.steps['document-selection'] = { 
          success: false,
          error: 'No documents available for selection'
        };
      }
    } else {
      console.log('❌ Document selector not found');
      results.steps['selector'] = { 
        success: false,
        error: 'Document selector not found'
      };
    }
    
    // Step 3: Check for chat input and send button
    console.log('Step 3: Checking for chat input and send button...');
    const chatInput = await page.$('#document-chat-input, #question-input, input[type="text"]');
    const sendButton = await page.$('#document-send-btn, #send-btn, button[type="submit"]');
    
    if (chatInput && sendButton) {
      console.log('✅ Chat input and send button found');
      results.steps['chat-controls'] = { success: true };
      
      // Step 4: Send a test question
      console.log(`Step 4: Sending test question: "${config.testQuestion}"...`);
      
      // Type the question
      await chatInput.type(config.testQuestion);
      
      // Take screenshot after typing question
      await page.screenshot({ 
        path: path.join(config.screenshotsDir, '03-question-typed.png'),
        fullPage: true
      });
      
      // Click send button
      await sendButton.click();
      
      // Wait for response (look for new message or loading indicator)
      try {
        // First check if the user message appears
        await page.waitForFunction(
          (question) => {
            const messages = document.querySelectorAll('.message, .chat-message');
            return Array.from(messages).some(msg => 
              msg.textContent.includes(question) || 
              msg.innerText.includes(question)
            );
          },
          { timeout: 5000 },
          config.testQuestion
        );
        
        console.log('✅ User message appeared in chat');
        
        // Take screenshot after user message appears
        await page.screenshot({ 
          path: path.join(config.screenshotsDir, '04-user-message.png'),
          fullPage: true
        });
        
        // Now wait for AI response
        await page.waitForFunction(
          () => {
            const messages = document.querySelectorAll('.message, .chat-message');
            // Check if there's at least one more message after the user message
            return messages.length >= 2;
          },
          { timeout: 15000 }
        );
        
        console.log('✅ AI response received');
        
        // Take screenshot after AI response
        await page.screenshot({ 
          path: path.join(config.screenshotsDir, '05-ai-response.png'),
          fullPage: true
        });
        
        results.steps['chat-interaction'] = { success: true };
        
        // Overall success
        results.success = true;
        
      } catch (error) {
        console.log(`❌ Chat interaction failed: ${error.message}`);
        results.steps['chat-interaction'] = { 
          success: false,
          error: error.message
        };
      }
    } else {
      console.log('❌ Chat input or send button not found');
      results.steps['chat-controls'] = { 
        success: false,
        error: 'Chat input or send button not found',
        details: {
          chatInputFound: !!chatInput,
          sendButtonFound: !!sendButton
        }
      };
    }
    
  } catch (error) {
    console.error(`Error testing document chat: ${error.message}`);
    results.error = error.message;
  } finally {
    await browser.close();
  }
  
  // Save results
  const resultsDir = path.join(__dirname, '../results');
  if (!fs.existsSync(resultsDir)) {
    fs.mkdirSync(resultsDir, { recursive: true });
  }
  
  fs.writeFileSync(
    path.join(resultsDir, 'document-chat-test-results.json'),
    JSON.stringify(results, null, 2)
  );
  
  console.log(`Document chat test completed. Success: ${results.success}`);
  
  return results;
}

// Run the test if this file is executed directly
if (require.main === module) {
  runTest().catch(console.error);
}

module.exports = runTest;
