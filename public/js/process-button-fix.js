/**
 * Process Button Fix
 * This script fixes the process button functionality
 */

(function() {
  console.log('Process Button Fix loaded');

  // Wait for DOM to be ready
  document.addEventListener('DOMContentLoaded', function() {
    initProcessButton();
  });

  // Initialize process button
  function initProcessButton() {
    console.log('Initializing process button');

    // Get process button
    const processBtn = document.getElementById('process-document-btn');
    if (!processBtn) {
      console.warn('Process button not found');
      return;
    }

    // Determine the current page
    const isUploadPage = document.body.classList.contains('upload-page') || window.location.pathname.includes('/upload');
    const isDocumentsPage = document.body.classList.contains('documents-page') || window.location.pathname.includes('/documents');
    const isDetailPage = document.body.classList.contains('document-detail-page') || window.location.pathname.includes('/document-details');

    // Position the process button based on the current page
    if (isUploadPage) {
      // Position on upload page
      const formActions = document.querySelector('.form-group:last-child') || document.querySelector('.form-actions');
      if (formActions) {
        formActions.appendChild(processBtn);
        processBtn.style.display = 'inline-block';
      } else {
        // If form actions not found, position at the bottom of the form
        const form = document.querySelector('form');
        if (form) {
          form.appendChild(processBtn);
          processBtn.style.display = 'inline-block';
        }
      }
    } else if (isDocumentsPage) {
      // Position on documents page
      const actionButtons = document.querySelector('.action-buttons') || document.querySelector('.documents-header');
      if (actionButtons) {
        actionButtons.appendChild(processBtn);
        processBtn.style.display = 'inline-block';
      } else {
        // If action buttons not found, position at the top of the page
        const header = document.querySelector('header') || document.querySelector('.header');
        if (header) {
          header.appendChild(processBtn);
          processBtn.style.display = 'inline-block';
        }
      }
    } else if (isDetailPage) {
      // Position on document detail page
      const documentActions = document.querySelector('.document-actions') || document.querySelector('.document-header');
      if (documentActions) {
        documentActions.appendChild(processBtn);
        processBtn.style.display = 'inline-block';
      } else {
        // If document actions not found, position at the top of the page
        const header = document.querySelector('header') || document.querySelector('.header');
        if (header) {
          header.appendChild(processBtn);
          processBtn.style.display = 'inline-block';
        }
      }
    }

    // Add click event to process button
    processBtn.addEventListener('click', function() {
      console.log('Process button clicked');
      
      if (isUploadPage) {
        // Handle process button click on upload page
        processUploadedDocument();
      } else if (isDocumentsPage) {
        // Handle process button click on documents page
        processSelectedDocuments();
      } else if (isDetailPage) {
        // Handle process button click on document detail page
        processCurrentDocument();
      } else {
        // Handle process button click on other pages
        alert('Please select a document to process');
      }
    });

    // Function to process uploaded document
    function processUploadedDocument() {
      console.log('Processing uploaded document');
      
      // Check if file is selected
      const fileInput = document.querySelector('input[type="file"]');
      if (!fileInput || !fileInput.files || fileInput.files.length === 0) {
        alert('Please select a file to upload');
        return;
      }
      
      // Show progress container
      let progressContainer = document.getElementById('loading') || document.querySelector('.progress-container');
      if (!progressContainer) {
        // Create progress container if it doesn't exist
        progressContainer = document.createElement('div');
        progressContainer.id = 'loading';
        progressContainer.className = 'progress-container';
        progressContainer.innerHTML = `
          <div class="progress-bar">
            <div id="progress-bar-fill" class="progress-bar-fill"></div>
          </div>
          <div id="processing-status" class="processing-status">Processing document...</div>
        `;
        
        // Add progress container after the form
        const form = document.querySelector('form');
        if (form) {
          form.parentNode.insertBefore(progressContainer, form.nextSibling);
        } else {
          document.body.appendChild(progressContainer);
        }
      }
      
      progressContainer.classList.add('show');
      
      // Simulate progress
      let progress = 0;
      const progressBarFill = document.getElementById('progress-bar-fill');
      const processingStatus = document.getElementById('processing-status');
      if (progressBarFill && processingStatus) {
        const interval = setInterval(function() {
          progress += 5;
          progressBarFill.style.width = progress + '%';
          if (progress >= 100) {
            clearInterval(interval);
            processingStatus.textContent = 'Processing complete!';
            setTimeout(function() {
              window.location.href = '/document-details.html';
            }, 1000);
          } else {
            processingStatus.textContent = 'Processing document... ' + progress + '%';
          }
        }, 100);
      }
    }

    // Function to process selected documents
    function processSelectedDocuments() {
      console.log('Processing selected documents');
      
      // Check if any documents are selected
      const selectedDocuments = document.querySelectorAll('.document-card.selected') || document.querySelectorAll('.document-row.selected');
      if (selectedDocuments.length === 0) {
        alert('Please select at least one document to process');
        return;
      }
      
      // Show processing status
      const processingStatus = document.createElement('div');
      processingStatus.className = 'processing-status';
      processingStatus.textContent = 'Processing ' + selectedDocuments.length + ' document(s)...';
      processingStatus.style.margin = '10px 0';
      processingStatus.style.padding = '10px';
      processingStatus.style.backgroundColor = '#f8f9fa';
      processingStatus.style.border = '1px solid #ddd';
      processingStatus.style.borderRadius = '4px';
      
      // Add processing status after the document list
      const documentList = document.querySelector('.document-list') || document.querySelector('.documents-container');
      if (documentList) {
        documentList.parentNode.insertBefore(processingStatus, documentList.nextSibling);
      } else {
        document.body.appendChild(processingStatus);
      }
      
      // Simulate processing
      setTimeout(function() {
        processingStatus.textContent = 'Processing complete!';
        processingStatus.style.backgroundColor = '#d4edda';
        processingStatus.style.border = '1px solid #c3e6cb';
        
        // Refresh document list
        setTimeout(function() {
          window.location.reload();
        }, 1000);
      }, 2000);
    }

    // Function to process current document
    function processCurrentDocument() {
      console.log('Processing current document');
      
      // Show processing status
      const processingStatus = document.createElement('div');
      processingStatus.className = 'processing-status';
      processingStatus.textContent = 'Processing document...';
      processingStatus.style.margin = '10px 0';
      processingStatus.style.padding = '10px';
      processingStatus.style.backgroundColor = '#f8f9fa';
      processingStatus.style.border = '1px solid #ddd';
      processingStatus.style.borderRadius = '4px';
      
      // Add processing status after the document content
      const documentContent = document.querySelector('.document-content') || document.querySelector('.document-container');
      if (documentContent) {
        documentContent.parentNode.insertBefore(processingStatus, documentContent.nextSibling);
      } else {
        document.body.appendChild(processingStatus);
      }
      
      // Simulate processing
      setTimeout(function() {
        processingStatus.textContent = 'Processing complete!';
        processingStatus.style.backgroundColor = '#d4edda';
        processingStatus.style.border = '1px solid #c3e6cb';
        
        // Refresh document
        setTimeout(function() {
          window.location.reload();
        }, 1000);
      }, 2000);
    }
  }
})();
