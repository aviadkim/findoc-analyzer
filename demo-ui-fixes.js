const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// UI Components Script (minified version)
const uiComponentsScript = fs.readFileSync('ui-components-minified.js', 'utf8');

// Main function
async function main() {
  console.log('Starting FinDoc Analyzer UI Demo...');
  
  // Launch browser
  const browser = await puppeteer.launch({ 
    headless: false,
    defaultViewport: null,
    args: ['--start-maximized']
  });
  
  const page = await browser.newPage();
  
  // Create screenshots directory
  const screenshotsDir = path.join(__dirname, 'demo-screenshots');
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir);
  }
  
  try {
    // Step 1: Navigate to the deployed website
    console.log('Step 1: Navigating to the deployed website...');
    await page.goto('https://backv2-app-brfi73d4ra-zf.a.run.app/', { waitUntil: 'networkidle2' });
    await page.screenshot({ path: path.join(screenshotsDir, '01-homepage.png'), fullPage: true });
    
    // Step 2: Check for missing UI elements
    console.log('Step 2: Checking for missing UI elements...');
    const missingElements = await checkUIElements(page);
    console.log(`Missing elements: ${missingElements.length}`);
    missingElements.forEach(element => {
      console.log(`- ${element.description} (${element.selector})`);
    });
    
    // Step 3: Navigate to upload page
    console.log('Step 3: Navigating to upload page...');
    await page.goto('https://backv2-app-brfi73d4ra-zf.a.run.app/upload', { waitUntil: 'networkidle2' });
    await page.screenshot({ path: path.join(screenshotsDir, '02-upload-before.png'), fullPage: true });
    
    // Step 4: Inject UI components
    console.log('Step 4: Injecting UI components...');
    await page.evaluate(script => {
      const scriptElement = document.createElement('script');
      scriptElement.textContent = script;
      document.head.appendChild(scriptElement);
    }, uiComponentsScript);
    
    // Wait for UI components to be initialized
    await page.waitForFunction(() => {
      return document.getElementById('process-document-btn') !== null;
    }, { timeout: 5000 }).catch(error => {
      console.error(`Error waiting for UI components to be initialized: ${error.message}`);
    });
    
    // Step 5: Take screenshot of fixed UI
    console.log('Step 5: Taking screenshot of fixed UI...');
    await page.screenshot({ path: path.join(screenshotsDir, '03-upload-after.png'), fullPage: true });
    
    // Step 6: Check for UI elements after fix
    console.log('Step 6: Checking for UI elements after fix...');
    const missingElementsAfter = await checkUIElements(page);
    console.log(`Missing elements after fix: ${missingElementsAfter.length}`);
    if (missingElementsAfter.length > 0) {
      missingElementsAfter.forEach(element => {
        console.log(`- ${element.description} (${element.selector})`);
      });
    } else {
      console.log('All UI elements are present!');
    }
    
    // Step 7: Demonstrate process button functionality
    console.log('Step 7: Demonstrating process button functionality...');
    
    // Upload a file
    const fileInputSelector = 'input[type=file]';
    await page.waitForSelector(fileInputSelector);
    
    // Create a temporary file to upload
    const tempFilePath = path.join(__dirname, 'temp-test-file.pdf');
    if (!fs.existsSync(tempFilePath)) {
      // Create a simple text file as a placeholder
      fs.writeFileSync(tempFilePath, 'Test PDF content');
    }
    
    // Set file input
    const fileInput = await page.$(fileInputSelector);
    await fileInput.uploadFile(tempFilePath);
    
    // Wait for file name to appear
    await page.waitForFunction(() => {
      const fileNameElement = document.getElementById('file-name');
      return fileNameElement && fileNameElement.textContent.trim() !== '';
    }, { timeout: 5000 }).catch(error => {
      console.error(`Error waiting for file name: ${error.message}`);
    });
    
    // Take screenshot after file upload
    await page.screenshot({ path: path.join(screenshotsDir, '04-file-uploaded.png'), fullPage: true });
    
    // Click process button
    const processButton = await page.$('#process-document-btn');
    if (processButton) {
      console.log('Clicking process button...');
      await processButton.click();
      
      // Wait for processing to start
      await page.waitForFunction(() => {
        const progressContainer = document.getElementById('progress-container');
        return progressContainer && progressContainer.style.display !== 'none';
      }, { timeout: 5000 }).catch(error => {
        console.error(`Error waiting for progress container: ${error.message}`);
      });
      
      // Take screenshot of processing
      await page.screenshot({ path: path.join(screenshotsDir, '05-processing.png'), fullPage: true });
      
      // Wait for processing to complete (or timeout after 10 seconds)
      await page.waitForFunction(() => {
        const uploadStatus = document.getElementById('upload-status');
        return uploadStatus && uploadStatus.textContent.includes('complete');
      }, { timeout: 10000 }).catch(error => {
        console.error(`Error waiting for processing to complete: ${error.message}`);
      });
      
      // Take screenshot after processing
      await page.screenshot({ path: path.join(screenshotsDir, '06-processing-complete.png'), fullPage: true });
    } else {
      console.error('Process button not found!');
    }
    
    // Step 8: Demonstrate chat functionality
    console.log('Step 8: Demonstrating chat functionality...');
    
    // Click show chat button
    const showChatButton = await page.$('#show-chat-btn');
    if (showChatButton) {
      console.log('Clicking show chat button...');
      await showChatButton.click();
      
      // Wait for chat container to appear
      await page.waitForFunction(() => {
        const chatContainer = document.getElementById('document-chat-container');
        return chatContainer && chatContainer.style.display !== 'none';
      }, { timeout: 5000 }).catch(error => {
        console.error(`Error waiting for chat container: ${error.message}`);
      });
      
      // Take screenshot of chat
      await page.screenshot({ path: path.join(screenshotsDir, '07-chat-open.png'), fullPage: true });
      
      // Type a message
      await page.type('#document-chat-input', 'What is the total value of the portfolio?');
      
      // Take screenshot of typed message
      await page.screenshot({ path: path.join(screenshotsDir, '08-chat-message-typed.png'), fullPage: true });
      
      // Send message
      const sendButton = await page.$('#document-send-btn');
      if (sendButton) {
        await sendButton.click();
        
        // Wait for response
        await page.waitForFunction(() => {
          const chatMessages = document.getElementById('document-chat-messages');
          const messages = chatMessages.querySelectorAll('div');
          return messages.length >= 3; // Initial message + user message + AI response
        }, { timeout: 5000 }).catch(error => {
          console.error(`Error waiting for chat response: ${error.message}`);
        });
        
        // Take screenshot of response
        await page.screenshot({ path: path.join(screenshotsDir, '09-chat-response.png'), fullPage: true });
      } else {
        console.error('Send button not found!');
      }
    } else {
      console.error('Show chat button not found!');
    }
    
    // Step 9: Navigate to test page to show agent cards
    console.log('Step 9: Navigating to test page to show agent cards...');
    await page.goto('https://backv2-app-brfi73d4ra-zf.a.run.app/test', { waitUntil: 'networkidle2' });
    
    // Inject UI components again
    await page.evaluate(script => {
      const scriptElement = document.createElement('script');
      scriptElement.textContent = script;
      document.head.appendChild(scriptElement);
    }, uiComponentsScript);
    
    // Wait for agent cards to appear
    await page.waitForFunction(() => {
      return document.querySelector('.agent-card') !== null;
    }, { timeout: 5000 }).catch(error => {
      console.error(`Error waiting for agent cards: ${error.message}`);
    });
    
    // Take screenshot of agent cards
    await page.screenshot({ path: path.join(screenshotsDir, '10-agent-cards.png'), fullPage: true });
    
    console.log('Demo completed successfully!');
    console.log(`Screenshots saved to ${screenshotsDir}`);
    
    // Clean up temporary file
    if (fs.existsSync(tempFilePath)) {
      fs.unlinkSync(tempFilePath);
    }
    
  } catch (error) {
    console.error('Error during demo:', error);
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

// Function to check UI elements
async function checkUIElements(page) {
  // Define required elements
  const requiredElements = [
    { selector: '#process-document-btn', description: 'Process Document Button' },
    { selector: '#document-chat-container', description: 'Document Chat Container' },
    { selector: '#document-send-btn', description: 'Document Chat Send Button' },
    { selector: '#login-form', description: 'Login Form' },
    { selector: '#google-login-btn', description: 'Google Login Button' },
    { selector: '#show-chat-btn', description: 'Show Chat Button' }
  ];
  
  // Check if we're on the test page
  const isTestPage = await page.evaluate(() => {
    return window.location.pathname.includes('/test');
  });
  
  if (isTestPage) {
    requiredElements.push(
      { selector: '.agent-card', description: 'Agent Cards' },
      { selector: '.status-indicator', description: 'Agent Status Indicators' },
      { selector: '.agent-action', description: 'Agent Action Buttons' }
    );
  }
  
  // Check for elements
  const missingElements = [];
  
  for (const element of requiredElements) {
    const found = await page.$(element.selector);
    if (!found) {
      missingElements.push(element);
    }
  }
  
  return missingElements;
}

// Run the demo
main().catch(console.error);
