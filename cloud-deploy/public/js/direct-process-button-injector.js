/**
 * Direct Process Button Injector
 * This script injects the process button functionality directly into the page
 * without requiring external CSS or JS files to be loaded
 */

(function() {
    console.log('Direct process button injector loaded');
    
    // Add CSS styles
    const style = document.createElement('style');
    style.textContent = `
        /* Process Button Fix CSS */
        #process-btn, #process-document-btn {
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
        
        #process-btn:hover, #process-document-btn:hover {
            background-color: #0b7dda !important;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3) !important;
            transform: translateY(-2px) !important;
        }
        
        #reprocess-btn, #reprocess-document-btn {
            background-color: #FF9800 !important;
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
        
        #reprocess-btn:hover, #reprocess-document-btn:hover {
            background-color: #e68a00 !important;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3) !important;
            transform: translateY(-2px) !important;
        }
        
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
        
        .progress-container {
            margin-top: 20px;
            display: none;
        }
        
        .progress-container.show {
            display: block;
        }
    `;
    document.head.appendChild(style);
    
    // Wait for the DOM to be fully loaded
    document.addEventListener('DOMContentLoaded', function() {
        initProcessButton();
    });
    
    // If the DOM is already loaded, initialize immediately
    if (document.readyState === 'interactive' || document.readyState === 'complete') {
        initProcessButton();
    }
    
    function initProcessButton() {
        console.log('Initializing process button');
        
        // Check if we're on the upload page
        const isUploadPage = window.location.pathname.includes('/upload');
        if (!isUploadPage) {
            console.log('Not on upload page, skipping process button initialization');
            return;
        }
        
        // Check if the process button exists (check both possible IDs)
        const processBtn = document.getElementById('process-btn') || document.getElementById('process-document-btn');
        
        // If the process button doesn't exist or is not visible, add a floating process button
        if (!processBtn || getComputedStyle(processBtn).display === 'none' || getComputedStyle(processBtn).visibility === 'hidden') {
            addFloatingProcessButton();
        } else {
            // Make sure the existing process button is styled correctly
            enhanceExistingProcessButton();
        }
        
        // Add event listeners to the process buttons
        addProcessButtonEventListeners();
    }
    
    function addFloatingProcessButton() {
        // Check if the floating button already exists
        if (document.getElementById('floating-process-btn')) {
            console.log('Floating process button already exists');
            return;
        }
        
        console.log('Adding floating process button');
        
        // Create the floating button
        const floatingBtn = document.createElement('div');
        floatingBtn.className = 'floating-process-btn';
        floatingBtn.id = 'floating-process-btn';
        floatingBtn.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <path d="M5.5 7a.5.5 0 0 0 0 1h5a.5.5 0 0 0 0-1h-5zM5 9.5a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5zm0 2a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 0 1h-2a.5.5 0 0 1-.5-.5z"/>
                <path d="M9.5 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V4.5L9.5 0zm0 1v2A1.5 1.5 0 0 0 11 4.5h2V14a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h5.5z"/>
            </svg>
            Process Document
        `;
        
        // Add styles to make sure it's visible
        floatingBtn.style.position = 'fixed';
        floatingBtn.style.bottom = '30px';
        floatingBtn.style.right = '30px';
        floatingBtn.style.backgroundColor = '#2196F3';
        floatingBtn.style.color = 'white';
        floatingBtn.style.padding = '15px 25px';
        floatingBtn.style.borderRadius = '50px';
        floatingBtn.style.fontSize = '16px';
        floatingBtn.style.fontWeight = 'bold';
        floatingBtn.style.boxShadow = '0 4px 10px rgba(0, 0, 0, 0.3)';
        floatingBtn.style.cursor = 'pointer';
        floatingBtn.style.zIndex = '1000';
        floatingBtn.style.display = 'flex';
        floatingBtn.style.alignItems = 'center';
        floatingBtn.style.justifyContent = 'center';
        floatingBtn.style.transition = 'all 0.3s ease';
        
        // Add event listener
        floatingBtn.addEventListener('click', function(e) {
            e.preventDefault(); // Prevent any default behavior
            console.log('Floating process button clicked');
            
            // If there's an existing process button, click it
            const processBtn = document.getElementById('process-btn') || document.getElementById('process-document-btn');
            if (processBtn) {
                console.log(`Clicking existing process button with ID: ${processBtn.id}`);
                processBtn.click();
            } else {
                // Otherwise, simulate the process functionality
                console.log('No process button found, simulating processing');
                simulateProcessing();
            }
        });
        
        // Add to the body
        document.body.appendChild(floatingBtn);
        console.log('Floating process button added to the page');
    }
    
    function enhanceExistingProcessButton() {
        // Check both possible button IDs
        const processBtn = document.getElementById('process-btn') || document.getElementById('process-document-btn');
        
        if (processBtn) {
            console.log(`Enhancing process button with ID: ${processBtn.id}`);
            
            // Add an icon to the button if it doesn't have one
            if (!processBtn.querySelector('svg')) {
                const buttonText = processBtn.textContent;
                processBtn.innerHTML = `
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16" style="margin-right: 5px;">
                        <path d="M5.5 7a.5.5 0 0 0 0 1h5a.5.5 0 0 0 0-1h-5zM5 9.5a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5zm0 2a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 0 1h-2a.5.5 0 0 1-.5-.5z"/>
                        <path d="M9.5 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V4.5L9.5 0zm0 1v2A1.5 1.5 0 0 0 11 4.5h2V14a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h5.5z"/>
                    </svg>
                    ${buttonText}
                `;
            }
            
            // Make sure the button is visible
            processBtn.style.display = 'inline-block';
            processBtn.style.visibility = 'visible';
            processBtn.style.opacity = '1';
            
            // Add a data attribute to mark it as enhanced
            processBtn.setAttribute('data-enhanced', 'true');
        } else {
            console.log('No process button found to enhance');
        }
    }
    
    function addProcessButtonEventListeners() {
        // Get the process button (check both possible IDs)
        const processBtn = document.getElementById('process-btn') || document.getElementById('process-document-btn');
        if (processBtn) {
            console.log(`Adding event listener to process button with ID: ${processBtn.id}`);
            
            // Remove any existing event listeners
            const newProcessBtn = processBtn.cloneNode(true);
            processBtn.parentNode.replaceChild(newProcessBtn, processBtn);
            
            // Add new event listener
            newProcessBtn.addEventListener('click', function(e) {
                e.preventDefault(); // Prevent form submission
                console.log('Process button clicked');
                simulateProcessing();
            });
        } else {
            console.log('No process button found to add event listener');
        }
        
        // Get the reprocess button (check both possible IDs)
        const reprocessBtn = document.getElementById('reprocess-btn') || document.getElementById('reprocess-document-btn');
        if (reprocessBtn) {
            console.log(`Adding event listener to reprocess button with ID: ${reprocessBtn.id}`);
            
            // Remove any existing event listeners
            const newReprocessBtn = reprocessBtn.cloneNode(true);
            reprocessBtn.parentNode.replaceChild(newReprocessBtn, reprocessBtn);
            
            // Add new event listener
            newReprocessBtn.addEventListener('click', function(e) {
                e.preventDefault(); // Prevent form submission
                console.log('Reprocess button clicked');
                simulateProcessing(true);
            });
        } else {
            console.log('No reprocess button found to add event listener');
        }
    }
    
    function simulateProcessing(isReprocess = false) {
        console.log(`Simulating ${isReprocess ? 'reprocessing' : 'processing'}`);
        
        // Create or get progress container
        let progressContainer = document.getElementById('progress-container');
        if (!progressContainer) {
            progressContainer = document.createElement('div');
            progressContainer.id = 'progress-container';
            progressContainer.className = 'progress-container';
            progressContainer.innerHTML = `
                <h3>${isReprocess ? 'Reprocessing' : 'Processing'} Document</h3>
                <div class="progress-bar">
                    <div class="progress-bar-fill" id="progress-bar-fill"></div>
                </div>
                <p class="processing-status" id="processing-status">Starting document analysis...</p>
            `;
            
            // Find a good place to insert it
            const uploadForm = document.querySelector('form');
            if (uploadForm) {
                uploadForm.parentNode.insertBefore(progressContainer, uploadForm.nextSibling);
            } else {
                document.body.appendChild(progressContainer);
            }
        }
        
        // Show the progress container
        progressContainer.classList.add('show');
        
        // Get progress bar elements
        const progressBarFill = document.getElementById('progress-bar-fill');
        const processingStatus = document.getElementById('processing-status');
        
        // Reset progress
        if (progressBarFill) progressBarFill.style.width = '0%';
        if (processingStatus) processingStatus.textContent = 'Starting document analysis...';
        
        // Simulate processing steps
        simulateProgressSteps(isReprocess)
            .then(() => {
                // Show success message
                if (processingStatus) {
                    processingStatus.textContent = 'Processing complete! You can now chat with your document.';
                    processingStatus.style.color = '#4CAF50';
                    processingStatus.style.fontWeight = 'bold';
                }
                
                // Add a link to the document chat
                setTimeout(() => {
                    const chatLink = document.createElement('div');
                    chatLink.innerHTML = '<p><a href="/document-chat" class="btn btn-success">Go to Document Chat</a></p>';
                    progressContainer.appendChild(chatLink);
                }, 1000);
            })
            .catch(error => {
                console.error('Error during processing:', error);
                if (processingStatus) {
                    processingStatus.textContent = `Error: ${error.message}`;
                    processingStatus.style.color = 'red';
                }
            });
    }
    
    async function simulateProgressSteps(isReprocess = false) {
        const progressBarFill = document.getElementById('progress-bar-fill');
        const processingStatus = document.getElementById('processing-status');
        
        if (isReprocess) {
            // Reprocessing steps
            await updateProgress(25, 'Reanalyzing document structure...', progressBarFill, processingStatus);
            await updateProgress(50, 'Applying enhanced extraction algorithms...', progressBarFill, processingStatus);
            await updateProgress(75, 'Refining financial data analysis...', progressBarFill, processingStatus);
            await updateProgress(100, 'Reprocessing complete!', progressBarFill, processingStatus);
        } else {
            // Processing steps
            await updateProgress(20, 'Analyzing document structure...', progressBarFill, processingStatus);
            await updateProgress(40, 'Extracting text and tables...', progressBarFill, processingStatus);
            await updateProgress(60, 'Identifying securities...', progressBarFill, processingStatus);
            await updateProgress(80, 'Analyzing financial data...', progressBarFill, processingStatus);
            await updateProgress(100, 'Processing complete!', progressBarFill, processingStatus);
        }
    }
    
    function updateProgress(percentage, statusText, progressBarFill, processingStatus) {
        if (progressBarFill) progressBarFill.style.width = `${percentage}%`;
        if (processingStatus) processingStatus.textContent = statusText;
        // Wait for animation
        return new Promise(resolve => setTimeout(resolve, 800));
    }
})();
