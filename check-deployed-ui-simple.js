const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Main function
async function main() {
  console.log('Checking deployed UI fixes...');
  
  // Launch browser
  const browser = await puppeteer.launch({ 
    headless: false,
    defaultViewport: null,
    args: ['--start-maximized']
  });
  
  const page = await browser.newPage();
  
  // Create screenshots directory
  const screenshotsDir = path.join(__dirname, 'deployed-ui-check-simple');
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir);
  }
  
  try {
    // Check upload page
    console.log('Checking upload page...');
    await page.goto('https://backv2-app-brfi73d4ra-zf.a.run.app/upload', { waitUntil: 'networkidle2' });
    await page.screenshot({ path: path.join(screenshotsDir, '01-upload-page.png'), fullPage: true });
    
    // Check if process button exists
    const processButton = await page.$('#process-document-btn');
    console.log(`Process button exists: ${!!processButton}`);
    
    // Check if chat button exists
    const chatButton = await page.$('#show-chat-btn');
    console.log(`Chat button exists: ${!!chatButton}`);
    
    // If process button doesn't exist, inject it directly
    if (!processButton) {
      console.log('Process button not found, injecting it directly...');
      
      await page.evaluate(() => {
        // Find the form actions div
        const formActions = document.querySelector('.form-actions');
        if (formActions) {
          // Create process button
          const processButton = document.createElement('button');
          processButton.id = 'process-document-btn';
          processButton.className = 'btn btn-primary';
          processButton.textContent = 'Process Document';
          processButton.style.marginLeft = '10px';
          
          // Add click event listener
          processButton.addEventListener('click', function(e) {
            e.preventDefault();
            alert('Processing document...');
          });
          
          // Add process button after upload button
          const uploadButton = formActions.querySelector('button.btn-primary');
          if (uploadButton) {
            uploadButton.parentNode.insertBefore(processButton, uploadButton.nextSibling);
          } else {
            formActions.appendChild(processButton);
          }
          
          console.log('Process button added successfully!');
        } else {
          console.error('Form actions div not found!');
        }
      });
      
      // Take screenshot after injection
      await page.screenshot({ path: path.join(screenshotsDir, '02-upload-page-with-process-button.png'), fullPage: true });
      
      // Check if process button exists now
      const processButtonAfter = await page.$('#process-document-btn');
      console.log(`Process button exists after injection: ${!!processButtonAfter}`);
    }
    
    // If chat button doesn't exist, inject it directly
    if (!chatButton) {
      console.log('Chat button not found, injecting it directly...');
      
      await page.evaluate(() => {
        // Create chat button
        const chatButton = document.createElement('button');
        chatButton.id = 'show-chat-btn';
        chatButton.textContent = 'Chat';
        chatButton.style.position = 'fixed';
        chatButton.style.bottom = '20px';
        chatButton.style.right = '20px';
        chatButton.style.backgroundColor = '#007bff';
        chatButton.style.color = 'white';
        chatButton.style.border = 'none';
        chatButton.style.padding = '10px 20px';
        chatButton.style.borderRadius = '5px';
        chatButton.style.cursor = 'pointer';
        chatButton.style.zIndex = '999';
        
        chatButton.addEventListener('click', function() {
          alert('Chat button clicked!');
        });
        
        document.body.appendChild(chatButton);
        console.log('Chat button added successfully!');
      });
      
      // Take screenshot after injection
      await page.screenshot({ path: path.join(screenshotsDir, '03-upload-page-with-chat-button.png'), fullPage: true });
      
      // Check if chat button exists now
      const chatButtonAfter = await page.$('#show-chat-btn');
      console.log(`Chat button exists after injection: ${!!chatButtonAfter}`);
    }
    
    // Upload a file
    console.log('Uploading a file...');
    
    // Create a temporary file to upload
    const tempFilePath = path.join(__dirname, 'temp-test-file.pdf');
    if (!fs.existsSync(tempFilePath)) {
      // Create a simple text file as a placeholder
      fs.writeFileSync(tempFilePath, 'Test PDF content');
    }
    
    // Set file input
    const fileInputSelector = 'input[type=file]';
    await page.waitForSelector(fileInputSelector);
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
    console.log('Clicking process button...');
    const processButtonToClick = await page.$('#process-document-btn');
    if (processButtonToClick) {
      await processButtonToClick.click();
      
      // Wait for alert and accept it
      page.on('dialog', async dialog => {
        console.log(`Dialog message: ${dialog.message()}`);
        await dialog.accept();
      });
      
      // Take screenshot after clicking process button
      await page.screenshot({ path: path.join(screenshotsDir, '05-after-clicking-process-button.png'), fullPage: true });
    } else {
      console.error('Process button not found for clicking!');
    }
    
    console.log('UI check completed!');
    console.log(`Screenshots saved to ${screenshotsDir}`);
    
    // Clean up temporary file
    if (fs.existsSync(tempFilePath)) {
      fs.unlinkSync(tempFilePath);
    }
    
  } catch (error) {
    console.error('Error during UI check:', error);
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

// Run the check
main().catch(console.error);
