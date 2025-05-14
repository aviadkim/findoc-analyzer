/**
 * Process Button Component
 * Adds a process button to the upload form
 */

module.exports = {
  /**
   * Initialize the process button component
   */
  initialize: function() {
    console.log('Initializing process button component...');
    
    // Add process button to upload form
    this.addProcessButtonToUploadForm();
  },
  
  /**
   * Add process button to upload form
   */
  addProcessButtonToUploadForm: function() {
    console.log('Adding process button to upload form...');
    
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
        processButton.addEventListener('click', this.handleProcessButtonClick);
        
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
  },
  
  /**
   * Handle process button click
   * @param {Event} e - Click event
   */
  handleProcessButtonClick: function(e) {
    e.preventDefault();
    
    console.log('Process button clicked');
    
    // Show progress container
    let progressContainer = document.getElementById('progress-container');
    if (!progressContainer) {
      // Create progress container
      progressContainer = document.createElement('div');
      progressContainer.id = 'progress-container';
      progressContainer.style.marginTop = '20px';
      
      // Create progress bar container
      const progressBarContainer = document.createElement('div');
      progressBarContainer.style.backgroundColor = '#f1f1f1';
      progressBarContainer.style.borderRadius = '5px';
      progressBarContainer.style.height = '20px';
      
      // Create progress bar
      const progressBar = document.createElement('div');
      progressBar.id = 'progress-bar';
      progressBar.style.width = '0%';
      progressBar.style.height = '100%';
      progressBar.style.backgroundColor = '#4CAF50';
      progressBar.style.borderRadius = '5px';
      progressBar.style.transition = 'width 0.5s';
      
      progressBarContainer.appendChild(progressBar);
      
      // Create status text
      const statusText = document.createElement('div');
      statusText.id = 'upload-status';
      statusText.style.marginTop = '10px';
      statusText.textContent = 'Processing document...';
      
      // Add elements to progress container
      progressContainer.appendChild(progressBarContainer);
      progressContainer.appendChild(statusText);
      
      // Add progress container to form
      const form = document.querySelector('form');
      if (form) {
        form.appendChild(progressContainer);
      } else {
        document.body.appendChild(progressContainer);
      }
    } else {
      progressContainer.style.display = 'block';
    }
    
    // Simulate processing
    let progress = 0;
    const progressBar = document.getElementById('progress-bar');
    const statusText = document.getElementById('upload-status');
    
    const interval = setInterval(function() {
      progress += 5;
      progressBar.style.width = progress + '%';
      
      if (progress >= 100) {
        clearInterval(interval);
        statusText.textContent = 'Processing complete!';
        
        // Redirect to document details page
        setTimeout(function() {
          alert('Processing complete! Redirecting to document details page...');
          window.location.href = '/document-details.html';
        }, 1000);
      } else {
        statusText.textContent = 'Processing document... ' + progress + '%';
      }
    }, 200);
  }
};
