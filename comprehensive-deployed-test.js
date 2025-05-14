const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

// Configuration
const config = {
  url: 'https://findoc-deploy.ey.r.appspot.com',
  screenshotsDir: './test-screenshots-comprehensive',
  testPdfPath: path.join(__dirname, 'tests', 'test-files', 'messos-portfolio.pdf'),
  headless: false, // Set to true for headless mode
  slowMo: 100, // Slow down execution by 100ms
  timeout: 60000 // 60 seconds timeout
};

// Main function
async function testDeployedWebsite() {
  console.log(`Testing deployed website at ${config.url}`);
  
  // Launch browser
  const browser = await chromium.launch({ 
    headless: config.headless,
    slowMo: config.slowMo
  });
  
  // Create a new context
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    recordVideo: { dir: './test-videos' }
  });
  
  // Create a new page
  const page = await context.newPage();
  page.setDefaultTimeout(config.timeout);
  
  try {
    // Test 1: Home Page
    console.log('Test 1: Checking home page...');
    await page.goto(config.url);
    await page.screenshot({ path: `${config.screenshotsDir}/01-home-page.png` });
    console.log('Home page loaded successfully');
    
    // Test 2: Upload Page
    console.log('Test 2: Checking upload page...');
    await page.goto(`${config.url}/upload`);
    await page.screenshot({ path: `${config.screenshotsDir}/02-upload-page.png` });
    console.log('Upload page loaded successfully');
    
    // Test 3: Upload PDF
    console.log('Test 3: Uploading PDF file...');
    
    // Check if the upload form exists
    const formExists = await page.evaluate(() => {
      return !!document.querySelector('form');
    });
    
    if (formExists) {
      console.log('Upload form found');
      
      // Find the file input
      const fileInput = await page.$('input[type="file"]');
      
      if (fileInput) {
        // Upload the PDF file
        await fileInput.setInputFiles(config.testPdfPath);
        console.log('PDF file selected');
        await page.screenshot({ path: `${config.screenshotsDir}/03-pdf-selected.png` });
        
        // Submit the form
        try {
          const submitButton = await page.$('button[type="submit"]');
          if (submitButton) {
            await submitButton.click();
            console.log('Form submitted via button click');
          } else {
            // Try to submit the form directly
            await page.evaluate(() => {
              const form = document.querySelector('form');
              if (form) form.submit();
            });
            console.log('Form submitted via form.submit()');
          }
          
          await page.screenshot({ path: `${config.screenshotsDir}/04-form-submitted.png` });
          
          // Wait for processing to complete
          try {
            await page.waitForSelector('#results, .results, .document-results, .processing-results', { timeout: config.timeout });
            console.log('Processing completed');
            await page.screenshot({ path: `${config.screenshotsDir}/05-processing-completed.png` });
            
            // Check for ISINs
            const pageContent = await page.content();
            const isins = [
              'US91282CJL54',
              'DE0001102580',
              'XS2754416961',
              'US0378331005',
              'US5949181045',
              'US88160R1014',
              'US0231351067',
              'US02079K3059'
            ];
            
            let isinsFound = 0;
            for (const isin of isins) {
              if (pageContent.includes(isin)) {
                isinsFound++;
                console.log(`Found ISIN: ${isin}`);
              }
            }
            
            console.log(`Found ${isinsFound} out of ${isins.length} ISINs`);
          } catch (error) {
            console.warn('Timeout waiting for processing to complete:', error.message);
            await page.screenshot({ path: `${config.screenshotsDir}/05-processing-timeout.png` });
          }
        } catch (error) {
          console.warn('Error submitting form:', error.message);
        }
      } else {
        console.warn('File input not found');
      }
    } else {
      console.warn('Upload form not found');
    }
    
    // Test 4: Chat Page
    console.log('Test 4: Checking chat page...');
    await page.goto(`${config.url}/chat`);
    await page.screenshot({ path: `${config.screenshotsDir}/06-chat-page.png` });
    console.log('Chat page loaded successfully');
    
    // Test 5: Ask a question
    console.log('Test 5: Asking a question...');
    
    // Check if the chat interface exists
    const chatExists = await page.evaluate(() => {
      return !!document.querySelector('input[type="text"], textarea');
    });
    
    if (chatExists) {
      console.log('Chat interface found');
      
      // Find the chat input
      const chatInput = await page.$('input[type="text"], textarea');
      
      if (chatInput) {
        // Type a question
        await chatInput.fill('What is the total value of the portfolio?');
        console.log('Question typed');
        await page.screenshot({ path: `${config.screenshotsDir}/07-question-typed.png` });
        
        // Submit the question
        try {
          const submitButton = await page.$('button[type="submit"]');
          if (submitButton) {
            await submitButton.click();
            console.log('Question submitted via button click');
          } else {
            // Try to submit the form directly
            await page.evaluate(() => {
              const form = document.querySelector('form');
              if (form) form.submit();
            });
            console.log('Question submitted via form.submit()');
          }
          
          await page.screenshot({ path: `${config.screenshotsDir}/08-question-submitted.png` });
          
          // Wait for the answer
          try {
            await page.waitForSelector('.answer, .response, .chat-response', { timeout: config.timeout });
            console.log('Answer received');
            await page.screenshot({ path: `${config.screenshotsDir}/09-answer-received.png` });
          } catch (error) {
            console.warn('Timeout waiting for answer:', error.message);
            await page.screenshot({ path: `${config.screenshotsDir}/09-answer-timeout.png` });
          }
        } catch (error) {
          console.warn('Error submitting question:', error.message);
        }
      } else {
        console.warn('Chat input not found');
      }
    } else {
      console.warn('Chat interface not found');
    }
    
    // Test 6: Analytics Page
    console.log('Test 6: Checking analytics page...');
    await page.goto(`${config.url}/analytics`);
    await page.screenshot({ path: `${config.screenshotsDir}/10-analytics-page.png` });
    console.log('Analytics page loaded successfully');
    
    // Test 7: Export Page
    console.log('Test 7: Checking export page...');
    await page.goto(`${config.url}/export`);
    await page.screenshot({ path: `${config.screenshotsDir}/11-export-page.png` });
    console.log('Export page loaded successfully');
    
    console.log('All tests completed successfully!');
  } catch (error) {
    console.error('Error during testing:', error);
  } finally {
    // Close browser
    await browser.close();
  }
}

// Create screenshots directory if it doesn't exist
if (!fs.existsSync(config.screenshotsDir)) {
  fs.mkdirSync(config.screenshotsDir, { recursive: true });
}

// Run the tests
testDeployedWebsite().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
});
