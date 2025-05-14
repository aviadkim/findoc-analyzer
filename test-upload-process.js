const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function testUploadAndProcess() {
  console.log('Starting upload and process test...');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    // First, login with Google
    console.log('Navigating to login page...');
    await page.goto('http://localhost:8080/login');
    await page.waitForLoadState('networkidle');
    
    // Click the Google login button
    const googleLoginBtn = await page.$('#google-login-btn');
    if (googleLoginBtn) {
      console.log('Clicking Google login button...');
      await googleLoginBtn.click();
      
      // Wait for the prompt and enter email
      await page.waitForTimeout(1000);
      
      // Enter email in the prompt
      await page.keyboard.type('test@gmail.com');
      await page.keyboard.press('Enter');
      
      // Wait for login to complete
      await page.waitForTimeout(2000);
      
      console.log('Login completed');
    } else {
      console.log('Google login button not found');
    }
    
    // Navigate to upload page
    console.log('Navigating to upload page...');
    await page.goto('http://localhost:8080/upload');
    await page.waitForLoadState('networkidle');
    
    // Take a screenshot before upload
    await page.screenshot({ path: 'before-upload-test.png' });
    console.log('Screenshot saved to before-upload-test.png');
    
    // Check if the file input exists
    const fileInput = await page.$('input[type="file"]');
    if (!fileInput) {
      throw new Error('File input not found on the page');
    }
    
    // Create a sample PDF file if it doesn't exist
    const pdfPath = path.join(__dirname, 'sample.pdf');
    if (!fs.existsSync(pdfPath)) {
      console.log('Creating sample PDF file...');
      
      // Create a simple text file as a placeholder
      fs.writeFileSync(pdfPath, 'This is a sample PDF file for testing.');
      console.log('Sample PDF file created at', pdfPath);
    }
    
    // Upload the PDF file
    console.log('Uploading PDF file...');
    await fileInput.setInputFiles(pdfPath);
    console.log('File selected');
    
    // Select document type if the dropdown exists
    const docTypeSelect = await page.$('#document-type');
    if (docTypeSelect) {
      await docTypeSelect.selectOption('portfolio');
      console.log('Document type selected: portfolio');
    }
    
    // Click the upload button
    const uploadButton = await page.$('#upload-btn');
    if (uploadButton) {
      await uploadButton.click();
      console.log('Upload button clicked');
      
      // Wait for upload to complete
      await page.waitForTimeout(3000);
    } else {
      console.log('Upload button not found');
    }
    
    // Take a screenshot after upload
    await page.screenshot({ path: 'after-upload-test.png' });
    console.log('Screenshot saved to after-upload-test.png');
    
    // Click the process button
    console.log('Clicking process button...');
    
    // Try different selectors for the process button
    const processBtn = await page.$('#process-btn') || 
                       await page.$('#process-document-btn') || 
                       await page.$('#floating-process-btn');
    
    if (processBtn) {
      await processBtn.click();
      console.log('Process button clicked');
      
      // Wait for processing to complete
      console.log('Waiting for processing to complete...');
      await page.waitForTimeout(5000);
      
      // Take a screenshot after processing
      await page.screenshot({ path: 'after-processing-test.png' });
      console.log('Screenshot saved to after-processing-test.png');
    } else {
      console.log('Process button not found');
      
      // Try to find any button that might be the process button
      const buttons = await page.$$('button');
      console.log(`Found ${buttons.length} buttons on the page`);
      
      for (let i = 0; i < buttons.length; i++) {
        const buttonText = await buttons[i].textContent();
        console.log(`Button ${i+1}: ${buttonText}`);
        
        if (buttonText.includes('Process')) {
          console.log(`Clicking button with text: ${buttonText}`);
          await buttons[i].click();
          
          // Wait for processing to complete
          console.log('Waiting for processing to complete...');
          await page.waitForTimeout(5000);
          
          // Take a screenshot after processing
          await page.screenshot({ path: 'after-processing-test.png' });
          console.log('Screenshot saved to after-processing-test.png');
          break;
        }
      }
    }
    
    // Navigate to document chat page
    console.log('Navigating to document chat page...');
    await page.goto('http://localhost:8080/document-chat');
    await page.waitForLoadState('networkidle');
    
    // Take a screenshot of the chat page
    await page.screenshot({ path: 'document-chat-test.png' });
    console.log('Screenshot saved to document-chat-test.png');
    
    // Select the document from the dropdown if it exists
    const documentSelect = await page.$('#document-select');
    if (documentSelect) {
      // Get all options
      const options = await documentSelect.$$('option');
      
      if (options.length > 1) {
        // Select the second option (first is usually a placeholder)
        await documentSelect.selectOption({ index: 1 });
        console.log('Document selected from dropdown');
      } else {
        console.log('No documents found in the dropdown');
      }
    } else {
      console.log('Document selector not found');
    }
    
    // Wait for the chat interface to load
    await page.waitForTimeout(2000);
    
    // Ask questions about the document
    const questions = [
      'What is the total value of the portfolio?',
      'What are the top 3 holdings in the portfolio?',
      'What is the percentage of Apple stock in the portfolio?',
      'What is the average acquisition price of Microsoft shares?'
    ];
    
    for (const question of questions) {
      // Find the chat input
      const chatInput = await page.$('#document-chat-input') || 
                        await page.$('textarea[placeholder*="Ask"]') || 
                        await page.$('input[placeholder*="Ask"]');
      
      if (chatInput) {
        // Type the question
        await chatInput.fill(question);
        console.log(`Typed question: ${question}`);
        
        // Click the send button
        const sendButton = await page.$('#document-send-btn') || 
                           await page.$('button:has-text("Send")');
        
        if (sendButton) {
          await sendButton.click();
          console.log('Send button clicked');
          
          // Wait for the response
          console.log('Waiting for response...');
          await page.waitForTimeout(2000);
          
          // Take a screenshot after each question
          await page.screenshot({ path: `question-test-${questions.indexOf(question) + 1}.png` });
          console.log(`Screenshot saved to question-test-${questions.indexOf(question) + 1}.png`);
        } else {
          console.log('Send button not found');
        }
      } else {
        console.log('Chat input not found');
      }
      
      // Wait between questions
      await page.waitForTimeout(1000);
    }
    
    // Wait for user to see the final result
    console.log('Test completed. Waiting for 10 seconds before closing...');
    await page.waitForTimeout(10000);
    
  } catch (error) {
    console.error('Error:', error);
    await page.screenshot({ path: 'error-test.png' });
    console.log('Error screenshot saved to error-test.png');
  } finally {
    await browser.close();
  }
}

testUploadAndProcess();
