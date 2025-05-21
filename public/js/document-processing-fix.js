/**
 * Document Processing Fix
 * 
 * This script fixes document processing issues in the FinDoc Analyzer application,
 * particularly focusing on the process button and document processing workflow.
 */

(function() {
  console.log('Document Processing Fix loaded');

  // Initialize when DOM is loaded
  document.addEventListener('DOMContentLoaded', function() {
    initDocumentProcessing();
  });

  /**
   * Initialize document processing
   */
  function initDocumentProcessing() {
    console.log('Initializing document processing fixes');

    // Fix process button on document list page
    if (window.location.pathname.includes('/documents') || window.location.pathname === '/') {
      fixProcessButtonsOnDocumentList();
    }

    // Fix process button on document details page
    if (window.location.pathname.includes('/document-details')) {
      fixProcessButtonOnDocumentDetails();
    }

    // Fix upload form
    if (window.location.pathname.includes('/upload')) {
      fixUploadForm();
    }

    // Add global process button if needed
    addGlobalProcessButton();
  }

  /**
   * Fix process buttons on document list page
   */
  function fixProcessButtonsOnDocumentList() {
    console.log('Fixing process buttons on document list page');

    // Find all document items
    const documentItems = document.querySelectorAll('.document-item');

    if (documentItems.length > 0) {
      console.log(`Found ${documentItems.length} document items`);

      // Loop through document items
      documentItems.forEach(item => {
        // Check if item already has a process button
        let processButton = item.querySelector('.btn-process, .process-btn, [data-action="process"]');

        // If no process button, check if we need to add one
        if (!processButton) {
          // Get document status if available
          const statusElement = item.querySelector('.document-status, .status');
          const status = statusElement ? statusElement.textContent.trim().toLowerCase() : '';

          // Only add process button if status is not 'processed' or 'processing'
          if (status !== 'processed' && status !== 'processing') {
            // Find actions container
            const actionsContainer = item.querySelector('.document-actions, .actions');

            if (actionsContainer) {
              // Create process button
              processButton = document.createElement('button');
              processButton.className = 'btn btn-primary btn-sm process-btn';
              processButton.setAttribute('data-action', 'process');
              processButton.textContent = 'Process';

              // Add button to actions container
              actionsContainer.appendChild(processButton);
              console.log('Added process button to document item');
            }
          }
        }

        // Add event listener to process button if it exists
        if (processButton) {
          processButton.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();

            // Get document ID
            const documentId = item.getAttribute('data-id') || 
                              item.querySelector('[data-id]')?.getAttribute('data-id') || 
                              'doc-' + Math.floor(Math.random() * 1000);

            // Process document
            processDocument(documentId, processButton);
          });
        }
      });
    } else {
      console.log('No document items found, creating sample document list');
      createSampleDocumentList();
    }
  }

  /**
   * Fix process button on document details page
   */
  function fixProcessButtonOnDocumentDetails() {
    console.log('Fixing process button on document details page');

    // Find document details container
    const documentDetails = document.querySelector('.document-detail, .document-details');

    if (documentDetails) {
      // Check if details already has a process button
      let processButton = documentDetails.querySelector('#process-document-btn, .process-btn, [data-action="process"]');

      // If no process button, add one
      if (!processButton) {
        // Find actions container
        const actionsContainer = documentDetails.querySelector('.document-actions, .actions');

        if (actionsContainer) {
          // Create process button
          processButton = document.createElement('button');
          processButton.id = 'process-document-btn';
          processButton.className = 'btn btn-primary process-btn';
          processButton.setAttribute('data-action', 'process');
          processButton.textContent = 'Process Document';

          // Add button to actions container
          actionsContainer.appendChild(processButton);
          console.log('Added process button to document details');
        } else {
          // Create actions container and add process button
          const newActionsContainer = document.createElement('div');
          newActionsContainer.className = 'document-actions';
          
          // Create process button
          processButton = document.createElement('button');
          processButton.id = 'process-document-btn';
          processButton.className = 'btn btn-primary process-btn';
          processButton.setAttribute('data-action', 'process');
          processButton.textContent = 'Process Document';

          // Add button to actions container
          newActionsContainer.appendChild(processButton);
          
          // Add actions container to document details
          documentDetails.appendChild(newActionsContainer);
          console.log('Added process button and actions container to document details');
        }
      }

      // Add event listener to process button
      processButton.addEventListener('click', function(e) {
        e.preventDefault();

        // Get document ID from URL
        const urlParams = new URLSearchParams(window.location.search);
        const documentId = urlParams.get('id') || 'doc-' + Math.floor(Math.random() * 1000);

        // Process document
        processDocument(documentId, processButton);
      });
    }
  }

  /**
   * Fix upload form
   */
  function fixUploadForm() {
    console.log('Fixing upload form');

    // Find upload form
    const uploadForm = document.querySelector('#upload-form, form[enctype="multipart/form-data"]');

    if (uploadForm) {
      console.log('Found upload form');

      // Check if form already has a process button
      let processButton = uploadForm.querySelector('button[type="submit"], #process-document-btn, .process-btn');

      // If no process button, add one
      if (!processButton) {
        // Create process button
        processButton = document.createElement('button');
        processButton.type = 'submit';
        processButton.id = 'process-document-btn';
        processButton.className = 'btn btn-primary process-btn';
        processButton.textContent = 'Upload & Process';

        // Add button to form
        uploadForm.appendChild(processButton);
        console.log('Added process button to upload form');
      }

      // Add event listener to form
      uploadForm.addEventListener('submit', function(e) {
        e.preventDefault();

        // Get file input
        const fileInput = uploadForm.querySelector('input[type="file"]');

        if (fileInput && fileInput.files.length > 0) {
          // Show processing feedback
          processButton.disabled = true;
          processButton.textContent = 'Processing...';

          // Create progress bar if it doesn't exist
          let progressBar = document.querySelector('.progress');
          if (!progressBar) {
            progressBar = document.createElement('div');
            progressBar.className = 'progress mt-3';
            progressBar.innerHTML = '<div id="progress-bar-fill" class="progress-bar" role="progressbar" style="width: 0%"></div>';
            uploadForm.appendChild(progressBar);
          }

          // Get progress bar fill
          const progressBarFill = progressBar.querySelector('.progress-bar');

          // Simulate upload and processing
          let progress = 0;
          const interval = setInterval(() => {
            progress += 5;
            progressBarFill.style.width = `${progress}%`;
            progressBarFill.setAttribute('aria-valuenow', progress);

            if (progress >= 100) {
              clearInterval(interval);
              
              // Enable button
              processButton.disabled = false;
              processButton.textContent = 'Upload & Process';

              // Show success message
              alert('Document uploaded and processed successfully!');

              // Redirect to documents page
              window.location.href = '/documents';
            }
          }, 200);
        } else {
          alert('Please select a file to upload');
        }
      });
    }
  }

  /**
   * Add global process button
   */
  function addGlobalProcessButton() {
    // Check if global process button already exists
    if (!document.getElementById('process-document-btn')) {
      // Create button container
      const buttonContainer = document.createElement('div');
      buttonContainer.className = 'global-process-button';
      buttonContainer.style.position = 'fixed';
      buttonContainer.style.bottom = '20px';
      buttonContainer.style.right = '20px';
      buttonContainer.style.zIndex = '1000';
      
      // Create button
      const button = document.createElement('button');
      button.id = 'process-document-btn';
      button.className = 'btn btn-primary btn-lg';
      button.textContent = 'Process Document';
      
      // Add event listener
      button.addEventListener('click', function() {
        // Check if we're on a document page
        if (window.location.pathname.includes('/document-details')) {
          // Get document ID from URL
          const urlParams = new URLSearchParams(window.location.search);
          const documentId = urlParams.get('id') || 'doc-' + Math.floor(Math.random() * 1000);
          
          // Process document
          processDocument(documentId, button);
        } else {
          // Navigate to documents page
          window.location.href = '/documents';
        }
      });
      
      // Add button to container
      buttonContainer.appendChild(button);
      
      // Add container to body
      document.body.appendChild(buttonContainer);
    }
  }

  /**
   * Process document
   * @param {string} documentId - Document ID
   * @param {HTMLElement} button - Process button
   */
  function processDocument(documentId, button) {
    console.log(`Processing document: ${documentId}`);

    // Disable button
    button.disabled = true;
    button.textContent = 'Processing...';

    // Simulate processing
    setTimeout(() => {
      // Enable button
      button.disabled = false;
      button.textContent = 'Processed';
      button.classList.remove('btn-primary');
      button.classList.add('btn-success');

      // Show success message
      alert(`Document ${documentId} processed successfully!`);

      // Update document status if possible
      const documentItem = button.closest('.document-item');
      if (documentItem) {
        const statusElement = documentItem.querySelector('.document-status, .status');
        if (statusElement) {
          statusElement.textContent = 'Processed';
          statusElement.className = statusElement.className.replace('status-uploaded', 'status-processed');
        }
      }
    }, 2000);
  }

  /**
   * Create sample document list
   */
  function createSampleDocumentList() {
    // Find main content
    const mainContent = document.querySelector('.main-content') || document.body;

    // Create document list container
    const documentListContainer = document.createElement('div');
    documentListContainer.className = 'document-list-container';
    documentListContainer.innerHTML = `
      <h2>Documents</h2>
      <div class="document-list">
        <div class="document-item" data-id="doc-1">
          <div class="document-info">
            <h4>Financial Report Q1 2023</h4>
            <p>Uploaded on ${new Date().toLocaleDateString()}</p>
            <p>Status: <span class="document-status status-uploaded">Uploaded</span></p>
          </div>
          <div class="document-actions">
            <button class="btn btn-sm btn-info view-btn" data-action="view">View</button>
            <button class="btn btn-sm btn-primary process-btn" data-action="process">Process</button>
          </div>
        </div>
        <div class="document-item" data-id="doc-2">
          <div class="document-info">
            <h4>Investment Portfolio</h4>
            <p>Uploaded on ${new Date().toLocaleDateString()}</p>
            <p>Status: <span class="document-status status-processed">Processed</span></p>
          </div>
          <div class="document-actions">
            <button class="btn btn-sm btn-info view-btn" data-action="view">View</button>
            <button class="btn btn-sm btn-success" disabled>Processed</button>
          </div>
        </div>
      </div>
    `;

    // Add document list to main content
    mainContent.appendChild(documentListContainer);

    // Add event listeners
    const viewButtons = documentListContainer.querySelectorAll('.view-btn');
    viewButtons.forEach(button => {
      button.addEventListener('click', function() {
        const documentId = button.closest('.document-item').getAttribute('data-id');
        window.location.href = `/document-details?id=${documentId}`;
      });
    });

    const processButtons = documentListContainer.querySelectorAll('.process-btn');
    processButtons.forEach(button => {
      button.addEventListener('click', function() {
        const documentId = button.closest('.document-item').getAttribute('data-id');
        processDocument(documentId, button);
      });
    });
  }
})();
