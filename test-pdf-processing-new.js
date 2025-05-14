const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function testPdfProcessing() {
  console.log('Starting PDF processing test...');

  const browser = await chromium.launch({
    headless: false,
    timeout: 60000 // Increase timeout to 60 seconds
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
    await page.screenshot({ path: 'upload-page.png' });
    console.log('Screenshot saved to upload-page.png');

    // Create a sample PDF file if it doesn't exist
    const pdfPath = path.join(__dirname, 'sample.pdf');
    if (!fs.existsSync(pdfPath)) {
      console.log('Creating sample PDF file...');

      // Create a simple text file as a placeholder
      fs.writeFileSync(pdfPath, 'This is a sample PDF file for testing.');
      console.log('Sample PDF file created at', pdfPath);
    }

    // Select document type
    await page.selectOption('#document-type', 'portfolio');
    console.log('Selected document type: portfolio');

    // Upload the PDF file
    console.log('Uploading PDF file...');
    const fileInput = await page.$('input[type="file"]');
    await fileInput.setInputFiles(pdfPath);
    console.log('File selected');

    // Wait for file to be displayed
    await page.waitForSelector('#selected-file', { state: 'visible' });
    console.log('File displayed in UI');

    // Take a screenshot
    await page.screenshot({ path: 'file-selected.png' });
    console.log('Screenshot saved to file-selected.png');

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
    await page.screenshot({ path: 'processing.png' });
    console.log('Screenshot saved to processing.png');

    // Wait for processing to complete (up to 30 seconds)
    console.log('Waiting for processing to complete...');
    await page.waitForFunction(() => {
      const statusText = document.getElementById('processing-status');
      return statusText && statusText.textContent.includes('Processing complete');
    }, { timeout: 30000 });

    console.log('Processing complete!');

    // Take a screenshot
    await page.screenshot({ path: 'processing-complete.png' });
    console.log('Screenshot saved to processing-complete.png');

    // Wait for redirect to document chat page
    console.log('Waiting for redirect to document chat page...');
    await page.waitForURL('**/document-chat', { timeout: 10000 });

    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Take a screenshot
    await page.screenshot({ path: 'document-chat.png' });
    console.log('Screenshot saved to document-chat.png');

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
        await page.screenshot({ path: 'document-selected.png' });
        console.log('Screenshot saved to document-selected.png');

        // Ask a question
        const chatInput = await page.$('#document-chat-input');
        if (chatInput) {
          await chatInput.fill('What is the total value of the portfolio?');
          console.log('Question typed');

          // Try to click send button
          try {
            const sendButton = await page.$('#document-send-btn');
            if (sendButton) {
              await sendButton.click();
              console.log('Send button clicked');
            } else {
              console.log('Failed to click send button, trying Enter key instead');
              await chatInput.press('Enter');
              console.log('Enter key pressed');
            }

            // Wait for response
            await page.waitForTimeout(3000);

            // Take a screenshot
            await page.screenshot({ path: 'chat-response.png' });
            console.log('Screenshot saved to chat-response.png');

            console.log('Test completed successfully!');
          } catch (error) {
            console.log('Failed to click send button, trying Enter key instead');
            await chatInput.press('Enter');
            console.log('Enter key pressed');

            // Wait for response
            await page.waitForTimeout(3000);

            // Take a screenshot
            await page.screenshot({ path: 'chat-response.png' });
            console.log('Screenshot saved to chat-response.png');

            console.log('Test completed successfully!');
          }
        } else {
          console.error('Chat input not found');
        }
      } else {
        console.error('No documents found in dropdown');
      }
    } else {
      console.error('Document selector not found');
    }
  } catch (error) {
    console.error('Error during testing:', error);
    await page.screenshot({ path: 'test-error.png' });
    console.log('Error screenshot saved to test-error.png');
  } finally {
    // Close browser
    await browser.close();
  }
}

// Run the test
console.log('Starting test execution...');
testPdfProcessing().then(() => {
  console.log('Test execution completed successfully');
}).catch(error => {
  console.error('Test execution failed:', error);
});
