const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function testPdfProcessingAndChat() {
  console.log('Starting PDF processing and chat test...');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    // Navigate to the upload page
    console.log('Navigating to upload page...');
    await page.goto('https://backv2-app-brfi73d4ra-zf.a.run.app/upload');
    await page.waitForLoadState('networkidle');
    
    // Take a screenshot before upload
    await page.screenshot({ path: 'before-upload.png' });
    console.log('Screenshot saved to before-upload.png');
    
    // Check if the file input exists
    const fileInput = await page.$('input[type="file"]');
    if (!fileInput) {
      throw new Error('File input not found on the page');
    }
    
    // Upload the PDF file
    console.log('Uploading PDF file...');
    
    // Check if messos.pdf exists
    const pdfPath = path.join(__dirname, 'messos.pdf');
    if (!fs.existsSync(pdfPath)) {
      throw new Error(`PDF file not found at ${pdfPath}`);
    }
    
    await fileInput.setInputFiles(pdfPath);
    console.log('File selected');
    
    // Select document type if the dropdown exists
    const docTypeSelect = await page.$('#documentType');
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
      console.log('Upload button not found, continuing with process button');
    }
    
    // Take a screenshot after upload
    await page.screenshot({ path: 'after-upload.png' });
    console.log('Screenshot saved to after-upload.png');
    
    // Click the process button
    console.log('Clicking process button...');
    const processBtn = await page.$('#process-btn') || await page.$('#process-document-btn') || await page.$('#floating-process-btn');
    
    if (processBtn) {
      await processBtn.click();
      console.log('Process button clicked');
      
      // Wait for processing to complete
      console.log('Waiting for processing to complete...');
      await page.waitForTimeout(10000);
      
      // Take a screenshot after processing
      await page.screenshot({ path: 'after-processing.png' });
      console.log('Screenshot saved to after-processing.png');
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
          await page.waitForTimeout(10000);
          
          // Take a screenshot after processing
          await page.screenshot({ path: 'after-processing.png' });
          console.log('Screenshot saved to after-processing.png');
          break;
        }
      }
    }
    
    // Navigate to the document chat page
    console.log('Navigating to document chat page...');
    await page.goto('https://backv2-app-brfi73d4ra-zf.a.run.app/document-chat');
    await page.waitForLoadState('networkidle');
    
    // Take a screenshot of the chat page
    await page.screenshot({ path: 'document-chat.png' });
    console.log('Screenshot saved to document-chat.png');
    
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
      const chatInput = await page.$('#document-chat-input') || await page.$('textarea[placeholder*="Ask"]') || await page.$('input[placeholder*="Ask"]');
      
      if (chatInput) {
        // Type the question
        await chatInput.fill(question);
        console.log(`Typed question: ${question}`);
        
        // Click the send button
        const sendButton = await page.$('#document-send-btn') || await page.$('button[type="submit"]');
        
        if (sendButton) {
          await sendButton.click();
          console.log('Send button clicked');
          
          // Wait for the response
          console.log('Waiting for response...');
          await page.waitForTimeout(5000);
          
          // Take a screenshot after each question
          await page.screenshot({ path: `question-${questions.indexOf(question) + 1}.png` });
          console.log(`Screenshot saved to question-${questions.indexOf(question) + 1}.png`);
        } else {
          console.log('Send button not found');
        }
      } else {
        console.log('Chat input not found');
      }
      
      // Wait between questions
      await page.waitForTimeout(2000);
    }
    
    // Wait for user to see the final result
    console.log('Test completed. Waiting for 30 seconds before closing...');
    await page.waitForTimeout(30000);
    
  } catch (error) {
    console.error('Error:', error);
    await page.screenshot({ path: 'error.png' });
    console.log('Error screenshot saved to error.png');
  } finally {
    await browser.close();
  }
}

testPdfProcessingAndChat();
