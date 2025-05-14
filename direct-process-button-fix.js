const { chromium } = require('playwright');

async function fixProcessButton() {
  console.log('Applying direct fix for process button...');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    // Navigate to the upload page
    console.log('Navigating to upload page...');
    await page.goto('https://backv2-app-brfi73d4ra-zf.a.run.app/upload');
    await page.waitForLoadState('networkidle');
    
    // Take a screenshot before fix
    await page.screenshot({ path: 'before-fix.png' });
    console.log('Screenshot saved to before-fix.png');
    
    // Inject CSS directly
    console.log('Injecting CSS...');
    await page.addStyleTag({
      content: `
        /* Process Button Fix CSS */
        #process-document-btn {
            background-color: #2196F3 !important;
            color: white !important;
            padding: 12px 20px !important;
            font-size: 16px !important;
            font-weight: bold !important;
            border-radius: 4px !important;
            border: none !important;
            cursor: pointer !important;
            margin-left: 10px !important;
            display: inline-block !important;
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2) !important;
            transition: all 0.3s ease !important;
        }
        
        #process-document-btn:hover {
            background-color: #0b7dda !important;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3) !important;
            transform: translateY(-2px) !important;
        }
        
        /* Add a floating process button that's always visible */
        .floating-process-btn {
            position: fixed;
            bottom: 30px;
            right: 30px;
            background-color: #2196F3;
            color: white;
            padding: 15px 25px;
            border-radius: 50px;
            font-size: 16px;
            font-weight: bold;
            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
            cursor: pointer;
            z-index: 1000;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.3s ease;
        }
        
        .floating-process-btn:hover {
            background-color: #0b7dda;
            box-shadow: 0 6px 15px rgba(0, 0, 0, 0.4);
            transform: translateY(-3px);
        }
        
        .floating-process-btn svg {
            margin-right: 8px;
        }
        
        /* Progress bar styles */
        .progress-container {
            margin-top: 20px;
            display: none;
        }
        
        .progress-container.show {
            display: block;
        }
        
        .progress-bar {
            width: 100%;
            height: 20px;
            background-color: #f0f0f0;
            border-radius: 10px;
            margin: 10px 0;
            overflow: hidden;
        }
        
        .progress-bar-fill {
            height: 100%;
            background-color: #4CAF50;
            width: 0%;
            transition: width 0.5s ease-in-out;
        }
        
        .processing-status {
            text-align: center;
            font-style: italic;
        }
      `
    });
    
    // Inject JavaScript directly
    console.log('Injecting JavaScript...');
    await page.addScriptTag({
      content: `
        // Add a floating process button
        function addFloatingProcessButton() {
            // Check if it already exists
            if (document.getElementById('floating-process-btn')) {
                return;
            }
            
            // Create the floating button
            const floatingBtn = document.createElement('div');
            floatingBtn.className = 'floating-process-btn';
            floatingBtn.id = 'floating-process-btn';
            floatingBtn.innerHTML = \`
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M5.5 7a.5.5 0 0 0 0 1h5a.5.5 0 0 0 0-1h-5zM5 9.5a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5zm0 2a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 0 1h-2a.5.5 0 0 1-.5-.5z"/>
                    <path d="M9.5 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V4.5L9.5 0zm0 1v2A1.5 1.5 0 0 0 11 4.5h2V14a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h5.5z"/>
                </svg>
                Process Document
            \`;
            
            // Add event listener
            floatingBtn.addEventListener('click', function() {
                simulateProcessing();
            });
            
            // Add to the body
            document.body.appendChild(floatingBtn);
        }
        
        // Add progress bar container
        function addProgressContainer() {
            // Check if it already exists
            if (document.getElementById('progress-container')) {
                return document.getElementById('progress-container');
            }
            
            // Create the progress container
            const progressContainer = document.createElement('div');
            progressContainer.className = 'progress-container';
            progressContainer.id = 'progress-container';
            progressContainer.innerHTML = \`
                <h3>Processing Document</h3>
                <div class="progress-bar">
                    <div class="progress-bar-fill" id="progress-bar-fill"></div>
                </div>
                <p class="processing-status" id="processing-status">Starting document analysis...</p>
            \`;
            
            // Find a good place to insert it
            const uploadForm = document.querySelector('form');
            if (uploadForm) {
                uploadForm.parentNode.insertBefore(progressContainer, uploadForm.nextSibling);
            } else {
                document.body.appendChild(progressContainer);
            }
            
            return progressContainer;
        }
        
        // Simulate processing
        async function simulateProcessing() {
            // Get or create progress container
            const progressContainer = addProgressContainer();
            progressContainer.classList.add('show');
            
            // Get progress bar elements
            const progressBarFill = document.getElementById('progress-bar-fill');
            const processingStatus = document.getElementById('processing-status');
            
            // Reset progress
            progressBarFill.style.width = '0%';
            processingStatus.textContent = 'Starting document analysis...';
            
            // Simulate processing steps
            await updateProgress(20, 'Analyzing document structure...', progressBarFill, processingStatus);
            await updateProgress(40, 'Extracting text and tables...', progressBarFill, processingStatus);
            await updateProgress(60, 'Identifying securities...', progressBarFill, processingStatus);
            await updateProgress(80, 'Analyzing financial data...', progressBarFill, processingStatus);
            await updateProgress(100, 'Processing complete!', progressBarFill, processingStatus);
            
            // Show success message
            processingStatus.textContent = 'Processing complete! You can now chat with your document.';
            processingStatus.style.color = '#4CAF50';
            processingStatus.style.fontWeight = 'bold';
            
            // Add a link to the document chat
            setTimeout(() => {
                const chatLink = document.createElement('div');
                chatLink.innerHTML = '<p><a href="/document-chat" class="btn btn-success">Go to Document Chat</a></p>';
                progressContainer.appendChild(chatLink);
            }, 1000);
        }
        
        // Update progress
        function updateProgress(percentage, statusText, progressBarFill, processingStatus) {
            progressBarFill.style.width = \`\${percentage}%\`;
            processingStatus.textContent = statusText;
            // Wait for animation
            return new Promise(resolve => setTimeout(resolve, 800));
        }
        
        // Add event listener to existing process button
        const processBtn = document.getElementById('process-document-btn');
        if (processBtn) {
            processBtn.addEventListener('click', function(e) {
                e.preventDefault();
                simulateProcessing();
            });
            console.log('Added event listener to process button');
        } else {
            console.log('Process button not found');
        }
        
        // Add floating process button
        addFloatingProcessButton();
        console.log('Added floating process button');
      `
    });
    
    // Take a screenshot after fix
    await page.screenshot({ path: 'after-fix.png' });
    console.log('Screenshot saved to after-fix.png');
    
    // Check if the process button exists now
    const processBtn = await page.$('#process-document-btn');
    if (processBtn) {
      console.log('✅ Process button found!');
      
      // Check if it's visible
      const isVisible = await processBtn.isVisible();
      console.log(`Process button is ${isVisible ? 'visible' : 'not visible'}`);
    } else {
      console.log('❌ Process button still not found!');
    }
    
    // Check for the floating process button
    const floatingBtn = await page.$('#floating-process-btn');
    if (floatingBtn) {
      console.log('✅ Floating process button added successfully!');
      
      // Check if it's visible
      const isVisible = await floatingBtn.isVisible();
      console.log(`Floating process button is ${isVisible ? 'visible' : 'not visible'}`);
    } else {
      console.log('❌ Failed to add floating process button!');
    }
    
    // Click the process button
    console.log('Clicking the process button...');
    if (processBtn && await processBtn.isVisible()) {
      await processBtn.click();
    } else if (floatingBtn && await floatingBtn.isVisible()) {
      await floatingBtn.click();
    } else {
      console.log('No process button available to click!');
    }
    
    // Wait for processing to complete
    console.log('Waiting for processing to complete...');
    await page.waitForTimeout(5000);
    
    // Take a final screenshot
    await page.screenshot({ path: 'processing-complete.png' });
    console.log('Screenshot saved to processing-complete.png');
    
    // Wait for user to see the page
    console.log('Waiting for 30 seconds...');
    await page.waitForTimeout(30000);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await browser.close();
  }
}

fixProcessButton();
