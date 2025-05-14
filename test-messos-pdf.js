const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function testMessosPdf() {
  console.log('Starting Messos PDF test...');

  const browser = await chromium.launch({
    headless: false,
    timeout: 120000 // Increase timeout to 2 minutes
  });

  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 } // Set larger viewport
  });

  const page = await context.newPage();

  // Add event listeners for console messages
  page.on('console', msg => console.log(`BROWSER CONSOLE: ${msg.text()}`));
  page.on('pageerror', err => console.error(`BROWSER ERROR: ${err.message}`));

  try {
    // Navigate to upload page
    console.log('Navigating to upload page...');
    await page.goto('http://localhost:8080/upload-new');
    await page.waitForLoadState('networkidle');

    // Take a screenshot
    await page.screenshot({ path: 'messos-upload-page.png' });
    console.log('Screenshot saved to messos-upload-page.png');

    // Check if Messos PDF exists
    const pdfPath = path.join(__dirname, 'messos.pdf');
    if (!fs.existsSync(pdfPath)) {
      throw new Error('Messos PDF file not found at: ' + pdfPath);
    }
    console.log('Messos PDF file found at: ' + pdfPath);

    // Select document type
    await page.selectOption('#document-type', 'portfolio');
    console.log('Selected document type: portfolio');

    // Upload the PDF file
    console.log('Uploading Messos PDF file...');
    const fileInput = await page.$('input[type="file"]');
    await fileInput.setInputFiles(pdfPath);
    console.log('File selected');

    // Wait for file to be displayed
    await page.waitForSelector('#selected-file', { state: 'visible' });
    console.log('File displayed in UI');

    // Take a screenshot
    await page.screenshot({ path: 'messos-file-selected.png' });
    console.log('Screenshot saved to messos-file-selected.png');

    // Click upload button
    console.log('Clicking upload button...');
    await page.click('#upload-btn');

    // Wait for upload to complete
    await page.waitForSelector('#progress-container', { state: 'visible' });
    console.log('Upload progress displayed');

    // Wait for processing container to appear
    await page.waitForSelector('#processing-container', { state: 'visible' });
    console.log('Processing container displayed');

    // Take a screenshot
    await page.screenshot({ path: 'messos-processing.png' });
    console.log('Screenshot saved to messos-processing.png');

    // Wait for processing to complete (up to 2 minutes)
    console.log('Waiting for processing to complete...');
    await page.waitForFunction(() => {
      const statusText = document.getElementById('processing-status');
      return statusText && statusText.textContent.includes('Processing complete');
    }, { timeout: 120000 });

    console.log('Processing complete!');

    // Take a screenshot
    await page.screenshot({ path: 'messos-processing-complete.png' });
    console.log('Screenshot saved to messos-processing-complete.png');

    // Wait for redirect to document chat page
    console.log('Waiting for redirect to document chat page...');
    await page.waitForURL('**/document-chat', { timeout: 10000 });

    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Take a screenshot
    await page.screenshot({ path: 'messos-document-chat.png' });
    console.log('Screenshot saved to messos-document-chat.png');

    // Check if document selector exists
    const documentSelect = await page.$('#document-select');
    if (documentSelect) {
      // Get all options
      const options = await documentSelect.$$('option');

      if (options.length > 1) {
        // Select the document
        await documentSelect.selectOption({ index: 1 });
        console.log('Document selected from dropdown');

        // Wait for chat interface to load
        await page.waitForTimeout(2000);

        // Take a screenshot
        await page.screenshot({ path: 'messos-document-selected.png' });
        console.log('Screenshot saved to messos-document-selected.png');

        // Test a series of questions to verify agent functionality
        const questions = [
          'What is the total value of the portfolio?',
          'What are the top holdings in the portfolio?',
          'What is the asset allocation of the portfolio?',
          'What is the performance of the portfolio?',
          'Can you list all securities in the portfolio?',
          'What is the current price of Apple stock?',
          'How has Microsoft performed over the last year?',
          'What is the market capitalization of Amazon?',
          'Compare the performance of the top 3 holdings'
        ];

        for (let i = 0; i < questions.length; i++) {
          const question = questions[i];

          // Ask the question
          const chatInput = await page.$('#document-chat-input');
          if (chatInput) {
            await chatInput.fill(question);
            console.log(`Question ${i+1} typed: ${question}`);

            // Try to use Enter key directly instead of clicking the send button
            try {
              console.log('Using Enter key to send message');
              await chatInput.press('Enter');
              console.log('Enter key pressed');

              // Wait for response (longer for agent-based questions)
              const waitTime = i >= 5 ? 30000 : 10000; // Wait longer for agent questions
              await page.waitForTimeout(waitTime);

              // Take a screenshot
              await page.screenshot({ path: `messos-chat-response-${i+1}.png` });
              console.log(`Screenshot saved to messos-chat-response-${i+1}.png`);

              // Check for API key error messages
              const errorText = await page.evaluate(() => {
                const messages = document.querySelectorAll('.chat-message');
                for (const message of messages) {
                  if (message.textContent.includes('API key') ||
                      message.textContent.includes('error') ||
                      message.textContent.includes('Error')) {
                    return message.textContent;
                  }
                }
                return null;
              });

              if (errorText) {
                console.error('API key or other error detected:', errorText);
              } else {
                console.log(`Response received for question ${i+1}`);
              }

              // Check for agent activation
              if (i >= 5) {
                const agentText = await page.evaluate(() => {
                  const messages = document.querySelectorAll('.chat-message');
                  for (const message of messages) {
                    if (message.textContent.includes('agent') ||
                        message.textContent.includes('Agent') ||
                        message.textContent.includes('Bloomberg') ||
                        message.textContent.includes('Yahoo Finance')) {
                      return message.textContent;
                    }
                  }
                  return null;
                });

                if (agentText) {
                  console.log('Agent activation detected:', agentText);
                } else {
                  console.log('No explicit agent activation detected in response');
                }
              }
            } catch (error) {
              console.error(`Error asking question ${i+1}:`, error);
            }
          } else {
            console.error('Chat input not found');
            break;
          }
        }

        console.log('Test completed successfully!');
      } else {
        console.error('No documents found in dropdown');
      }
    } else {
      console.error('Document selector not found');
    }
  } catch (error) {
    console.error('Error during testing:', error);
    await page.screenshot({ path: 'messos-test-error.png' });
    console.log('Error screenshot saved to messos-test-error.png');
  } finally {
    // Close browser
    await browser.close();
  }
}

// Run the test
console.log('Starting Messos PDF test execution...');
testMessosPdf().then(() => {
  console.log('Messos PDF test execution completed successfully');
}).catch(error => {
  console.error('Messos PDF test execution failed:', error);
});
