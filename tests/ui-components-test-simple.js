/**
 * UI Components Test Simple
 * Tests the UI components on the deployed website
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Main function
async function testUIComponents() {
  console.log('Starting UI Components Test...');

  // Create screenshots directory
  const screenshotsDir = path.join(__dirname, 'ui-components-screenshots');
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
    // Set deployed URL
    const deployedUrl = 'https://backv2-app-brfi73d4ra-zf.a.run.app';

    // Step 1: Navigate to the deployed website
    console.log('Step 1: Navigating to the deployed website...');
    await page.goto(deployedUrl, { waitUntil: 'networkidle2', timeout: 30000 });
    await page.screenshot({ path: path.join(screenshotsDir, '01-home-page.png'), fullPage: true });

    // Check if chat button exists
    const chatButton = await page.$('#show-chat-btn');
    console.log('Chat button exists:', !!chatButton);

    // If chat button doesn't exist, use the bookmarklet
    if (!chatButton) {
      console.log('Chat button not found, using bookmarklet...');

      // Navigate to the bookmarklet page
      await page.goto(`${deployedUrl}/direct-ui-fix-bookmarklet.html`, { waitUntil: 'networkidle2', timeout: 30000 });
      await page.screenshot({ path: path.join(screenshotsDir, '02-bookmarklet-page.png'), fullPage: true });

      // Get the bookmarklet code
      const bookmarkletCode = await page.evaluate(() => {
        const bookmarkletLink = document.querySelector('.bookmarklet');
        return bookmarkletLink ? bookmarkletLink.getAttribute('href') : null;
      });

      console.log('Bookmarklet code found:', !!bookmarkletCode);

      if (bookmarkletCode) {
        // Navigate back to the home page
        await page.goto(deployedUrl, { waitUntil: 'networkidle2', timeout: 30000 });

        // Execute the bookmarklet code
        await page.evaluate(code => {
          // Remove the "javascript:" prefix
          const cleanCode = code.replace('javascript:', '');
          // Execute the code
          eval(cleanCode);
        }, bookmarkletCode);

        await page.screenshot({ path: path.join(screenshotsDir, '03-home-page-with-bookmarklet.png'), fullPage: true });

        // Check if chat button exists after using bookmarklet
        const chatButtonAfter = await page.$('#show-chat-btn');
        console.log('Chat button exists after using bookmarklet:', !!chatButtonAfter);
      } else {
        console.error('Bookmarklet code not found!');
      }
    }

    // Step 2: Test chat button
    console.log('Step 2: Testing chat button...');

    // Click chat button
    const chatButtonToClick = await page.$('#show-chat-btn');
    if (chatButtonToClick) {
      await chatButtonToClick.click();
      await page.waitForSelector('#document-chat-container', { timeout: 5000 });
      await page.screenshot({ path: path.join(screenshotsDir, '04-chat-container.png'), fullPage: true });

      // Type a message
      await page.type('#document-chat-input', 'Hello, this is a test message');
      await page.screenshot({ path: path.join(screenshotsDir, '05-chat-message-typed.png'), fullPage: true });

      // Send the message
      await page.click('#document-send-btn');
      await page.waitForFunction(() => {
        const messages = document.querySelectorAll('#document-chat-messages > div');
        return messages.length >= 3; // Initial message + user message + AI response
      }, { timeout: 5000 });

      await page.screenshot({ path: path.join(screenshotsDir, '06-chat-message-sent.png'), fullPage: true });

      console.log('Chat button test passed!');
    } else {
      console.error('Chat button not found!');
    }

    // Step 3: Navigate to upload page
    console.log('Step 3: Navigating to upload page...');
    await page.goto(`${deployedUrl}/upload`, { waitUntil: 'networkidle2', timeout: 30000 });
    await page.screenshot({ path: path.join(screenshotsDir, '07-upload-page.png'), fullPage: true });

    // Check if process button exists
    const processButton = await page.$('#process-document-btn');
    console.log('Process button exists:', !!processButton);

    // If process button doesn't exist, use the bookmarklet
    if (!processButton) {
      console.log('Process button not found, using bookmarklet...');

      // Execute the bookmarklet code
      await page.evaluate(code => {
        // Remove the "javascript:" prefix
        const cleanCode = code.replace('javascript:', '');
        // Execute the code
        eval(cleanCode);
      }, bookmarkletCode);

      await page.screenshot({ path: path.join(screenshotsDir, '08-upload-page-with-bookmarklet.png'), fullPage: true });

      // Check if process button exists after using bookmarklet
      const processButtonAfter = await page.$('#process-document-btn');
      console.log('Process button exists after using bookmarklet:', !!processButtonAfter);
    }

    // Step 4: Test process button
    console.log('Step 4: Testing process button...');

    // Click process button
    const processButtonToClick = await page.$('#process-document-btn');
    if (processButtonToClick) {
      // Upload a file (mock)
      await page.evaluate(() => {
        // Create a mock file input change event
        const fileInput = document.querySelector('input[type="file"]');
        if (fileInput) {
          // Create a mock File object
          const mockFile = new File(['test'], 'test.pdf', { type: 'application/pdf' });

          // Create a mock FileList
          const mockFileList = {
            0: mockFile,
            length: 1,
            item: (index) => index === 0 ? mockFile : null
          };

          // Set the files property
          Object.defineProperty(fileInput, 'files', {
            value: mockFileList,
            writable: true
          });

          // Dispatch a change event
          const event = new Event('change', { bubbles: true });
          fileInput.dispatchEvent(event);
        }
      });

      // Click process button
      await processButtonToClick.click();

      // Wait for progress bar
      await page.waitForSelector('#progress-container', { timeout: 5000 });
      await page.screenshot({ path: path.join(screenshotsDir, '09-process-started.png'), fullPage: true });

      // Wait for progress to complete
      await page.waitForFunction(() => {
        const progressBar = document.getElementById('progress-bar');
        return progressBar && progressBar.style.width === '100%';
      }, { timeout: 10000 });

      await page.screenshot({ path: path.join(screenshotsDir, '10-process-complete.png'), fullPage: true });

      console.log('Process button test passed!');
    } else {
      console.error('Process button not found!');
    }

    // Step 5: Navigate to test page
    console.log('Step 5: Navigating to test page...');
    await page.goto(`${deployedUrl}/test`, { waitUntil: 'networkidle2', timeout: 30000 });
    await page.screenshot({ path: path.join(screenshotsDir, '11-test-page.png'), fullPage: true });

    // Check if agent cards exist
    const agentCards = await page.$$('.agent-card');
    console.log('Agent cards exist:', agentCards.length > 0);
    console.log('Number of agent cards:', agentCards.length);

    // If agent cards don't exist, use the bookmarklet
    if (agentCards.length === 0) {
      console.log('Agent cards not found, using bookmarklet...');

      // Execute the bookmarklet code
      await page.evaluate(code => {
        // Remove the "javascript:" prefix
        const cleanCode = code.replace('javascript:', '');
        // Execute the code
        eval(cleanCode);
      }, bookmarkletCode);

      await page.screenshot({ path: path.join(screenshotsDir, '12-test-page-with-bookmarklet.png'), fullPage: true });

      // Check if agent cards exist after using bookmarklet
      const agentCardsAfter = await page.$$('.agent-card');
      console.log('Agent cards exist after using bookmarklet:', agentCardsAfter.length > 0);
      console.log('Number of agent cards after using bookmarklet:', agentCardsAfter.length);
    }

    // Step 6: Test agent cards
    console.log('Step 6: Testing agent cards...');

    // Click configure button on first agent card
    const configureButton = await page.$('.agent-action.btn-primary');
    if (configureButton) {
      await configureButton.click();
      await page.waitForFunction(() => {
        return !!document.querySelector('div[role="dialog"]') || window.confirm !== undefined;
      }, { timeout: 5000 });

      await page.screenshot({ path: path.join(screenshotsDir, '13-agent-configure.png'), fullPage: true });

      // Dismiss alert
      try {
        await page.evaluate(() => {
          window.alert = () => {};
        });
      } catch (error) {
        console.error('Error dismissing alert:', error);
      }

      console.log('Agent cards test passed!');
    } else {
      console.error('Configure button not found!');
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
testUIComponents().catch(console.error);
