/**
 * Document Chat UI Component Test
 * Tests for the presence and functionality of document chat UI components
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Test configuration
const config = {
  url: process.env.TEST_URL || 'http://localhost:8081',
  path: '/document-chat',
  components: [
    { name: 'Document Chat Container', selector: '#document-chat-container' },
    { name: 'Document Selector', selector: '.document-selector' },
    { name: 'Chat Messages', selector: '.chat-messages' },
    { name: 'Chat Input', selector: '#question-input' },
    { name: 'Send Button', selector: '#send-btn' }
  ],
  screenshotsDir: path.join(__dirname, '../../test-results/screenshots/document-chat')
};

// Create screenshots directory
if (!fs.existsSync(config.screenshotsDir)) {
  fs.mkdirSync(config.screenshotsDir, { recursive: true });
}

// Run the test
async function runTest() {
  console.log(`Testing Document Chat UI Components at ${config.url}${config.path}...`);
  
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const results = {
    page: 'Document Chat',
    url: `${config.url}${config.path}`,
    components: {},
    total: config.components.length,
    found: 0,
    missing: 0,
    success: false
  };
  
  try {
    const page = await browser.newPage();
    await page.goto(`${config.url}${config.path}`, { waitUntil: 'networkidle2', timeout: 30000 });
    
    // Take a screenshot of the full page
    await page.screenshot({ 
      path: path.join(config.screenshotsDir, 'document-chat-full.png'),
      fullPage: true
    });
    
    // Check each component
    for (const component of config.components) {
      const element = await page.$(component.selector);
      const exists = !!element;
      
      results.components[component.name] = {
        exists,
        selector: component.selector
      };
      
      if (exists) {
        results.found++;
        console.log(`✅ ${component.name} found`);
        
        // Take a screenshot of the component
        try {
          const clip = await page.evaluate((selector) => {
            const element = document.querySelector(selector);
            if (!element) return null;
            
            const { x, y, width, height } = element.getBoundingClientRect();
            return { x, y, width, height };
          }, component.selector);
          
          if (clip && clip.width > 0 && clip.height > 0) {
            await page.screenshot({
              path: path.join(config.screenshotsDir, `${component.name.toLowerCase().replace(/\s+/g, '-')}.png`),
              clip: {
                x: clip.x,
                y: clip.y,
                width: clip.width,
                height: clip.height
              }
            });
          }
        } catch (error) {
          console.error(`Error taking screenshot of ${component.name}: ${error.message}`);
        }
      } else {
        results.missing++;
        console.log(`❌ ${component.name} not found`);
      }
    }
    
    // Test chat functionality
    if (results.components['Document Selector'].exists && 
        results.components['Chat Input'].exists && 
        results.components['Send Button'].exists) {
      console.log('Testing chat functionality...');
      
      // Select a document
      const documentSelect = await page.$('#document-select');
      if (documentSelect) {
        await page.select('#document-select', '1');
        console.log('Selected document from dropdown');
        
        // Wait for input to be enabled
        await page.waitForFunction(() => {
          const input = document.querySelector('#question-input');
          return input && !input.disabled;
        }, { timeout: 5000 }).catch(() => {
          console.log('❌ Input was not enabled after selecting document');
        });
        
        // Type a question
        await page.type('#question-input', 'What is the total revenue?');
        console.log('Typed question in input field');
        
        // Click send button
        await page.click('#send-btn');
        console.log('Clicked send button');
        
        // Wait for response
        try {
          await page.waitForFunction(() => {
            const messages = document.querySelectorAll('.chat-messages .message');
            return messages.length >= 2;
          }, { timeout: 5000 });
          
          console.log('✅ Received response from chat');
          results.chatFunctionality = {
            success: true
          };
        } catch (error) {
          console.log('❌ Did not receive response from chat: ' + error.message);
          results.chatFunctionality = {
            success: false,
            error: error.message
          };
        }
      } else {
        console.log('❌ Could not find document select element');
        results.chatFunctionality = {
          success: false,
          error: 'Could not find document select element'
        };
      }
    } else {
      console.log('❌ Cannot test chat functionality because required components are missing');
      results.chatFunctionality = {
        success: false,
        error: 'Required components are missing'
      };
    }
    
    // Set overall success
    results.success = results.found === results.total;
    if (results.chatFunctionality && !results.chatFunctionality.success) {
      results.success = false;
    }
    
  } catch (error) {
    console.error(`Error testing document chat page: ${error.message}`);
    results.error = error.message;
  } finally {
    await browser.close();
  }
  
  // Save results
  const resultsDir = path.join(__dirname, '../../test-results');
  if (!fs.existsSync(resultsDir)) {
    fs.mkdirSync(resultsDir, { recursive: true });
  }
  
  fs.writeFileSync(
    path.join(resultsDir, 'document-chat-test-results.json'),
    JSON.stringify(results, null, 2)
  );
  
  console.log(`Document chat test completed. Found ${results.found}/${results.total} components.`);
  console.log(`Success: ${results.success}`);
  
  return results;
}

// Run the test if this file is executed directly
if (require.main === module) {
  runTest().catch(console.error);
}

module.exports = runTest;
