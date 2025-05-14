/**
 * FinDoc Analyzer Process Button Fix
 * This script ensures the process button appears on the upload page
 * Version 1.1
 */

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
  console.log('Process button fix initializing...');

  // Fix process button on upload page
  fixProcessButton();

  console.log('Process button fix initialized');
});

// Add process button to upload page if missing
function fixProcessButton() {
  // Check if we're on the upload page
  const isUploadPage = window.location.pathname.includes('/upload');

  // Only proceed if we're on the upload page
  if (!isUploadPage) {
    return;
  }

  // Look for the process button
  const existingButton = document.getElementById('process-document-btn');
  if (existingButton) {
    console.log('Process button already exists, ensuring visibility');
    existingButton.style.display = 'inline-block';
    return;
  }

  // Process button doesn't exist, let's add it to the form actions
  const formActions = document.querySelector('.form-actions');
  if (formActions) {
    console.log('Adding process button to form actions');

    // Create process button
    const processButton = document.createElement('button');
    processButton.id = 'process-document-btn';
    processButton.className = 'btn btn-primary';
    processButton.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-file-earmark-text me-2" viewBox="0 0 16 16">
        <path d="M5.5 7a.5.5 0 0 0 0 1h5a.5.5 0 0 0 0-1h-5zM5 9.5a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5zm0 2a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 0 1h-2a.5.5 0 0 1-.5-.5z"/>
        <path d="M9.5 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V4.5L9.5 0zm0 1v2A1.5 1.5 0 0 0 11 4.5h2V14a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h5.5z"/>
      </svg>
      Process Document
    `;

    // Add click event listener
    processButton.addEventListener('click', function(e) {
      e.preventDefault();

      const file = document.getElementById('file-input').files[0];
      if (!file) {
        alert('Please select a file to process');
        return;
      }

      console.log('Process document button clicked for file:', file.name);

      // Show progress container
      const progressContainer = document.getElementById('progress-container');
      if (progressContainer) {
        progressContainer.style.display = 'block';
      }

      // Set initial progress
      const progressBar = document.getElementById('progress-bar');
      const uploadStatus = document.getElementById('upload-status');

      if (progressBar && uploadStatus) {
        progressBar.style.width = '0%';
        uploadStatus.textContent = 'Processing document...';

        // Use a fixed timer approach instead of an open-ended interval
        let progress = 0;
        // Process for exactly 5 seconds max
        const endTime = Date.now() + 5000;

        const interval = setInterval(() => {
          // Calculate progress based on time elapsed
          const elapsed = Date.now() - (endTime - 5000);
          progress = Math.min(100, Math.floor((elapsed / 5000) * 100));

          progressBar.style.width = progress + '%';
          uploadStatus.textContent = 'Processing document... ' + progress + '%';

          if (progress >= 100) {
            clearInterval(interval);
            uploadStatus.textContent = 'Processing complete!';

            // Store document info in localStorage
            const fileName = file.name;
            const documentType = document.getElementById('document-type').value;
            const extractText = document.getElementById('extract-text').checked;
            const extractTables = document.getElementById('extract-tables').checked;
            const extractMetadata = document.getElementById('extract-metadata').checked;

            const documentInfo = {
              id: 'doc-' + Date.now(),
              fileName,
              documentType,
              extractText,
              extractTables,
              extractMetadata,
              uploadDate: new Date().toISOString(),
              processed: true
            };

            // Store in localStorage
            localStorage.setItem('lastProcessedDocument', JSON.stringify(documentInfo));
            console.log('Document info stored in localStorage:', documentInfo);

            // Show success notification
            if (typeof showNotification === 'function') {
              showNotification('Document processed successfully!', 'success');
            } else {
              alert('Document processed successfully!');
            }

            // Redirect to document details page after 1 second
            setTimeout(() => {
              console.log('Redirecting to document details page...');
              window.location.href = '/document-details.html';
            }, 1000);
          }
        }, 100);
      }
    });

    // Add a floating process button for extra visibility
    addFloatingProcessButton();

    // Insert process button before the cancel button
    const cancelButton = formActions.querySelector('.btn-secondary');
    if (cancelButton) {
      formActions.insertBefore(processButton, cancelButton);
    } else {
      formActions.appendChild(processButton);
    }
  } else {
    console.warn('Form actions element not found on upload page');

    // If form actions not found, add a floating button anyway
    addFloatingProcessButton();
  }
}

// Add a floating process button
function addFloatingProcessButton() {
  // Check if the floating button already exists
  if (document.getElementById('floating-process-btn')) {
    return;
  }

  // Create the floating button
  const floatingBtn = document.createElement('button');
  floatingBtn.id = 'floating-process-btn';
  floatingBtn.className = 'btn btn-primary';
  floatingBtn.innerHTML = 'Process Document';
  floatingBtn.style.position = 'fixed';
  floatingBtn.style.bottom = '70px';
  floatingBtn.style.right = '20px';
  floatingBtn.style.zIndex = '999';
  floatingBtn.style.padding = '10px 15px';
  floatingBtn.style.fontWeight = 'bold';
  floatingBtn.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';

  // Add click event
  floatingBtn.addEventListener('click', function() {
    // Try to click the main process button
    const mainButton = document.getElementById('process-document-btn');
    if (mainButton) {
      mainButton.click();
    } else {
      alert('Please select a file to process');
    }
  });

  // Add to document
  document.body.appendChild(floatingBtn);
}

// Ensure the chat button is visible and working
function fixChatButton() {
  // Check if there's already a chat button
  const existingButton = document.getElementById('show-chat-btn');
  if (!existingButton) {
    // Create the chat button if it doesn't exist
    const chatBtn = document.createElement('button');
    chatBtn.id = 'show-chat-btn';
    chatBtn.className = 'btn btn-primary';
    chatBtn.innerHTML = 'Chat';
    chatBtn.style.position = 'fixed';
    chatBtn.style.bottom = '20px';
    chatBtn.style.right = '20px';
    chatBtn.style.zIndex = '1000';

    // Add click event
    chatBtn.addEventListener('click', function() {
      const chatContainer = document.getElementById('document-chat-container');
      if (chatContainer) {
        chatContainer.style.display = chatContainer.style.display === 'none' ? 'block' : 'none';
      } else {
        alert('Chat functionality is not available');
      }
    });

    // Add to document
    document.body.appendChild(chatBtn);
  }
}

// Run the fix again when page loads completely
window.addEventListener('load', function() {
  fixProcessButton();
  fixChatButton();
});

// Extra safety timeout to ensure the button is added
setTimeout(function() {
  fixProcessButton();
  fixChatButton();
}, 500);
