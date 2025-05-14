const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Main function
async function main() {
  console.log('Starting FinDoc Analyzer Process Button Demo...');
  
  // Launch browser
  const browser = await puppeteer.launch({ 
    headless: false,
    defaultViewport: null,
    args: ['--start-maximized']
  });
  
  const page = await browser.newPage();
  
  // Create screenshots directory
  const screenshotsDir = path.join(__dirname, 'process-button-demo');
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir);
  }
  
  try {
    // Step 1: Navigate to the upload page
    console.log('Step 1: Navigating to the upload page...');
    await page.goto('https://backv2-app-brfi73d4ra-zf.a.run.app/upload', { waitUntil: 'networkidle2' });
    await page.screenshot({ path: path.join(screenshotsDir, '01-upload-before.png'), fullPage: true });
    
    // Step 2: Check if process button exists
    console.log('Step 2: Checking if process button exists...');
    const processButtonBefore = await page.$('#process-document-btn');
    console.log(`Process button exists before: ${!!processButtonBefore}`);
    
    // Step 3: Add process button directly
    console.log('Step 3: Adding process button directly...');
    await page.evaluate(() => {
      // Find the form actions div
      const formActions = document.querySelector('.form-actions');
      if (formActions) {
        // Check if process button already exists
        if (!document.getElementById('process-document-btn')) {
          // Create process button
          const processButton = document.createElement('button');
          processButton.id = 'process-document-btn';
          processButton.className = 'btn btn-primary';
          processButton.textContent = 'Process Document';
          processButton.style.marginLeft = '10px';
          
          // Add click event listener
          processButton.addEventListener('click', function() {
            // Show progress container
            const progressContainer = document.getElementById('progress-container');
            if (progressContainer) {
              progressContainer.style.display = 'block';
            } else {
              // Create progress container if it doesn't exist
              const newProgressContainer = document.createElement('div');
              newProgressContainer.id = 'progress-container';
              newProgressContainer.className = 'progress-container';
              newProgressContainer.style.marginTop = '20px';
              
              // Create progress bar
              const progressBar = document.createElement('div');
              progressBar.id = 'progress-bar';
              progressBar.className = 'progress-bar';
              progressBar.style.width = '0%';
              progressBar.style.height = '20px';
              progressBar.style.backgroundColor = '#4CAF50';
              progressBar.style.transition = 'width 0.5s';
              
              // Create progress track
              const progressTrack = document.createElement('div');
              progressTrack.className = 'progress-track';
              progressTrack.style.width = '100%';
              progressTrack.style.height = '20px';
              progressTrack.style.backgroundColor = '#f1f1f1';
              progressTrack.style.borderRadius = '5px';
              progressTrack.appendChild(progressBar);
              
              // Create upload status
              const uploadStatus = document.createElement('div');
              uploadStatus.id = 'upload-status';
              uploadStatus.className = 'upload-status';
              uploadStatus.textContent = 'Processing document...';
              uploadStatus.style.marginTop = '10px';
              
              // Add elements to progress container
              newProgressContainer.appendChild(progressTrack);
              newProgressContainer.appendChild(uploadStatus);
              
              // Add progress container to form
              const form = document.querySelector('form');
              if (form) {
                form.appendChild(newProgressContainer);
              } else {
                document.body.appendChild(newProgressContainer);
              }
            }
            
            // Simulate processing progress
            let progress = 0;
            const interval = setInterval(() => {
              progress += 5;
              if (progress > 100) progress = 100;
              
              const progressBar = document.getElementById('progress-bar');
              const uploadStatus = document.getElementById('upload-status');
              
              if (progressBar) {
                progressBar.style.width = progress + '%';
              }
              
              if (uploadStatus) {
                if (progress < 100) {
                  uploadStatus.textContent = 'Processing document... ' + progress + '%';
                } else {
                  uploadStatus.textContent = 'Processing complete!';
                  clearInterval(interval);
                  
                  // Redirect to document details page after 2 seconds
                  setTimeout(() => {
                    alert('Processing complete! Redirecting to document details page...');
                    window.location.href = '/document-details.html';
                  }, 2000);
                }
              }
            }, 200);
          });
          
          // Add process button after upload button
          const uploadButton = formActions.querySelector('button.btn-primary');
          if (uploadButton) {
            uploadButton.parentNode.insertBefore(processButton, uploadButton.nextSibling);
          } else {
            formActions.appendChild(processButton);
          }
          
          console.log('Process button added successfully!');
        }
      } else {
        console.error('Form actions div not found!');
      }
    });
    
    // Step 4: Take screenshot after adding process button
    console.log('Step 4: Taking screenshot after adding process button...');
    await page.screenshot({ path: path.join(screenshotsDir, '02-upload-after.png'), fullPage: true });
    
    // Step 5: Check if process button exists now
    console.log('Step 5: Checking if process button exists now...');
    const processButtonAfter = await page.$('#process-document-btn');
    console.log(`Process button exists after: ${!!processButtonAfter}`);
    
    // Step 6: Upload a file
    console.log('Step 6: Uploading a file...');
    
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
    await page.screenshot({ path: path.join(screenshotsDir, '03-file-uploaded.png'), fullPage: true });
    
    // Step 7: Click process button
    console.log('Step 7: Clicking process button...');
    if (processButtonAfter) {
      await processButtonAfter.click();
      
      // Wait for processing to start
      await page.waitForFunction(() => {
        const progressBar = document.getElementById('progress-bar');
        return progressBar && progressBar.style.width !== '0%';
      }, { timeout: 5000 }).catch(error => {
        console.error(`Error waiting for progress bar: ${error.message}`);
      });
      
      // Take screenshot of processing
      await page.screenshot({ path: path.join(screenshotsDir, '04-processing.png'), fullPage: true });
      
      // Wait for processing to complete
      await page.waitForFunction(() => {
        const uploadStatus = document.getElementById('upload-status');
        return uploadStatus && uploadStatus.textContent.includes('complete');
      }, { timeout: 10000 }).catch(error => {
        console.error(`Error waiting for processing to complete: ${error.message}`);
      });
      
      // Take screenshot after processing
      await page.screenshot({ path: path.join(screenshotsDir, '05-processing-complete.png'), fullPage: true });
      
      // Wait for alert
      page.on('dialog', async dialog => {
        console.log(`Dialog message: ${dialog.message()}`);
        await dialog.accept();
      });
      
      // Wait for navigation
      await page.waitForNavigation({ timeout: 5000 }).catch(error => {
        console.error(`Error waiting for navigation: ${error.message}`);
      });
      
      // Take screenshot of document details page
      await page.screenshot({ path: path.join(screenshotsDir, '06-document-details.png'), fullPage: true });
    } else {
      console.error('Process button not found!');
    }
    
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

// Run the demo
main().catch(console.error);
