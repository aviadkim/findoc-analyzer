/**
 * FinDoc Analyzer Securities Feedback Component
 * This script adds a feedback mechanism for reporting securities extraction errors
 */

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
  console.log('Securities Feedback Component initializing...');
  
  // Check if we're on a page that displays securities
  if (document.querySelector('.securities-table') || 
      document.getElementById('extracted-tables') || 
      window.location.pathname.includes('document-details')) {
    initSecuritiesFeedbackSystem();
  }
});

/**
 * Initialize the securities feedback system
 */
function initSecuritiesFeedbackSystem() {
  console.log('Initializing securities feedback system');
  
  // Add feedback buttons to securities tables
  addFeedbackButtonsToSecuritiesTables();
  
  // Create the feedback modal
  createFeedbackModal();
}

/**
 * Add feedback buttons to securities tables
 */
function addFeedbackButtonsToSecuritiesTables() {
  // Find securities tables (can be modified based on your actual table structure)
  const securitiesTables = document.querySelectorAll('.extracted-table, table.securities-table');
  
  securitiesTables.forEach(table => {
    // Add header for feedback
    const headerRow = table.querySelector('thead tr');
    if (headerRow) {
      const th = document.createElement('th');
      th.textContent = 'Feedback';
      headerRow.appendChild(th);
    }
    
    // Add feedback buttons to each row
    const rows = table.querySelectorAll('tbody tr');
    rows.forEach((row, index) => {
      const td = document.createElement('td');
      const button = document.createElement('button');
      button.className = 'btn-feedback';
      button.innerHTML = '<span class="icon">🔄</span>';
      button.title = 'Report an error with this security';
      button.setAttribute('data-security-index', index);
      
      // Extract security data from row
      const securityData = {};
      const cells = row.querySelectorAll('td');
      cells.forEach((cell, cellIndex) => {
        // Try to identify what data this cell contains
        if (cellIndex === 0) securityData.isin = cell.textContent.trim();
        if (cellIndex === 1) securityData.name = cell.textContent.trim();
        if (cellIndex === 2) securityData.type = cell.textContent.trim();
        if (cellIndex === 3) securityData.quantity = cell.textContent.trim();
        if (cellIndex === 4) securityData.price = cell.textContent.trim();
        if (cellIndex === 5) securityData.value = cell.textContent.trim();
        if (cellIndex === 6) securityData.currency = cell.textContent.trim();
      });
      button.setAttribute('data-security', JSON.stringify(securityData));
      
      button.addEventListener('click', handleFeedbackButtonClick);
      td.appendChild(button);
      row.appendChild(td);
    });
  });
}

/**
 * Handle feedback button click
 * @param {Event} event - Click event
 */
function handleFeedbackButtonClick(event) {
  const button = event.currentTarget;
  const securityData = JSON.parse(button.getAttribute('data-security'));
  openFeedbackModal(securityData);
}

/**
 * Create the feedback modal
 */
function createFeedbackModal() {
  // Create modal container if it doesn't exist
  if (!document.getElementById('securities-feedback-modal')) {
    const modal = document.createElement('div');
    modal.id = 'securities-feedback-modal';
    modal.className = 'modal';
    modal.style.display = 'none';
    modal.style.position = 'fixed';
    modal.style.zIndex = '1000';
    modal.style.left = '0';
    modal.style.top = '0';
    modal.style.width = '100%';
    modal.style.height = '100%';
    modal.style.overflow = 'auto';
    modal.style.backgroundColor = 'rgba(0,0,0,0.4)';
    
    modal.innerHTML = `
      <div class="modal-content" style="background-color: white; margin: 10% auto; padding: 20px; border-radius: 8px; width: 80%; max-width: 600px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
        <span class="close-modal" style="color: #aaa; float: right; font-size: 28px; font-weight: bold; cursor: pointer;">&times;</span>
        <h2 style="margin-top: 0;">Report Security Extraction Error</h2>
        
        <div class="security-info" style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
          <h3 style="margin-top: 0; margin-bottom: 10px; color: #2c3e50;">Current Security Information</h3>
          <div id="security-info-display"></div>
        </div>
        
        <form id="securities-feedback-form">
          <div class="form-group" style="margin-bottom: 15px;">
            <label for="error-type" style="display: block; margin-bottom: 5px; font-weight: bold;">Error Type</label>
            <select id="error-type" name="errorType" class="form-control" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;" required>
              <option value="">Select error type</option>
              <option value="wrong-identifier">Wrong identifier (ISIN, CUSIP, etc.)</option>
              <option value="wrong-name">Wrong security name</option>
              <option value="wrong-type">Wrong security type</option>
              <option value="wrong-quantity">Wrong quantity</option>
              <option value="wrong-price">Wrong price</option>
              <option value="wrong-value">Wrong value</option>
              <option value="wrong-currency">Wrong currency</option>
              <option value="missing-data">Missing data</option>
              <option value="other">Other</option>
            </select>
          </div>
          
          <div class="form-group" style="margin-bottom: 15px;">
            <label for="correct-value" style="display: block; margin-bottom: 5px; font-weight: bold;">Correct Value (if known)</label>
            <input type="text" id="correct-value" name="correctValue" class="form-control" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
          </div>
          
          <div class="form-group" style="margin-bottom: 15px;">
            <label for="error-description" style="display: block; margin-bottom: 5px; font-weight: bold;">Error Description</label>
            <textarea id="error-description" name="errorDescription" class="form-control" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; min-height: 100px;" required></textarea>
          </div>
          
          <input type="hidden" id="security-data" name="securityData">
          <input type="hidden" id="document-id" name="documentId">
          
          <div class="form-actions" style="text-align: right;">
            <button type="button" class="btn-cancel" style="padding: 10px 20px; margin-right: 10px; background-color: #f1f1f1; border: none; border-radius: 4px; cursor: pointer;">Cancel</button>
            <button type="submit" class="btn-submit" style="padding: 10px 20px; background-color: #3498db; color: white; border: none; border-radius: 4px; cursor: pointer;">Submit Feedback</button>
          </div>
        </form>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // Add event listeners
    const closeBtn = modal.querySelector('.close-modal');
    const cancelBtn = modal.querySelector('.btn-cancel');
    const form = modal.querySelector('#securities-feedback-form');
    
    closeBtn.addEventListener('click', closeFeedbackModal);
    cancelBtn.addEventListener('click', closeFeedbackModal);
    form.addEventListener('submit', handleFeedbackSubmission);
    
    // Close modal when clicking outside content
    modal.addEventListener('click', function(event) {
      if (event.target === modal) {
        closeFeedbackModal();
      }
    });
  }
}

/**
 * Open the feedback modal
 * @param {Object} securityData - Data for the security being reported
 */
function openFeedbackModal(securityData) {
  // Get document ID from URL or localStorage
  let documentId = window.location.pathname.split('/').pop();
  if (documentId === 'document-details.html') {
    documentId = localStorage.getItem('selectedDocumentId') || 
                (localStorage.getItem('lastProcessedDocument') ? 
                 JSON.parse(localStorage.getItem('lastProcessedDocument')).id : 
                 null);
  }
  
  // Display security information
  const infoDisplay = document.getElementById('security-info-display');
  infoDisplay.innerHTML = `
    <table style="width: 100%; border-collapse: collapse;">
      <tr>
        <td style="padding: 5px; border-bottom: 1px solid #ddd; font-weight: bold;">ISIN:</td>
        <td style="padding: 5px; border-bottom: 1px solid #ddd;">${securityData.isin || 'N/A'}</td>
      </tr>
      <tr>
        <td style="padding: 5px; border-bottom: 1px solid #ddd; font-weight: bold;">Name:</td>
        <td style="padding: 5px; border-bottom: 1px solid #ddd;">${securityData.name || 'N/A'}</td>
      </tr>
      <tr>
        <td style="padding: 5px; border-bottom: 1px solid #ddd; font-weight: bold;">Type:</td>
        <td style="padding: 5px; border-bottom: 1px solid #ddd;">${securityData.type || 'N/A'}</td>
      </tr>
      <tr>
        <td style="padding: 5px; border-bottom: 1px solid #ddd; font-weight: bold;">Quantity:</td>
        <td style="padding: 5px; border-bottom: 1px solid #ddd;">${securityData.quantity || 'N/A'}</td>
      </tr>
      <tr>
        <td style="padding: 5px; border-bottom: 1px solid #ddd; font-weight: bold;">Price:</td>
        <td style="padding: 5px; border-bottom: 1px solid #ddd;">${securityData.price || 'N/A'}</td>
      </tr>
      <tr>
        <td style="padding: 5px; border-bottom: 1px solid #ddd; font-weight: bold;">Value:</td>
        <td style="padding: 5px; border-bottom: 1px solid #ddd;">${securityData.value || 'N/A'}</td>
      </tr>
      <tr>
        <td style="padding: 5px; border-bottom: 1px solid #ddd; font-weight: bold;">Currency:</td>
        <td style="padding: 5px; border-bottom: 1px solid #ddd;">${securityData.currency || 'N/A'}</td>
      </tr>
    </table>
  `;
  
  // Set document ID
  document.getElementById('document-id').value = documentId;
  
  // Set security data
  document.getElementById('security-data').value = JSON.stringify(securityData);
  
  // Show modal
  const modal = document.getElementById('securities-feedback-modal');
  modal.style.display = 'block';
}

/**
 * Close the feedback modal
 */
function closeFeedbackModal() {
  const modal = document.getElementById('securities-feedback-modal');
  if (modal) {
    modal.style.display = 'none';
    
    // Clear form
    const form = document.getElementById('securities-feedback-form');
    if (form) {
      form.reset();
    }
  }
}

/**
 * Handle feedback submission
 * @param {Event} event - Form submit event
 */
function handleFeedbackSubmission(event) {
  event.preventDefault();
  
  // Get form data
  const errorType = document.getElementById('error-type').value;
  const correctValue = document.getElementById('correct-value').value;
  const errorDescription = document.getElementById('error-description').value;
  const securityData = JSON.parse(document.getElementById('security-data').value);
  const documentId = document.getElementById('document-id').value;
  
  // Create feedback data object
  const feedbackData = {
    errorType,
    correctValue,
    errorDescription,
    securityData,
    documentId,
    submissionDate: new Date().toISOString(),
    status: 'new'
  };
  
  // Send feedback data to server
  submitFeedbackToServer(feedbackData);
}

/**
 * Submit feedback to server
 * @param {Object} feedbackData - Feedback data to submit
 */
function submitFeedbackToServer(feedbackData) {
  console.log('Submitting feedback:', feedbackData);
  
  // In a real implementation, we would use fetch to send the data to the server
  // For the demo, we'll simulate a successful submission
  
  // Simulated API call
  setTimeout(() => {
    // Store feedback in localStorage (for demo purposes)
    const feedbackHistory = JSON.parse(localStorage.getItem('securities-feedback-history') || '[]');
    feedbackData.id = Date.now().toString();
    feedbackHistory.push(feedbackData);
    localStorage.setItem('securities-feedback-history', JSON.stringify(feedbackHistory));
    
    // Show success notification
    showNotification('Feedback submitted successfully', 'success');
    
    // Close modal
    closeFeedbackModal();
  }, 1000);
}

/**
 * Show notification
 * @param {string} message - Notification message
 * @param {string} type - Notification type (success, error, etc.)
 */
function showNotification(message, type = 'info') {
  // Check if notification container exists
  let container = document.getElementById('notification-container');
  
  if (!container) {
    container = document.createElement('div');
    container.id = 'notification-container';
    container.style.position = 'fixed';
    container.style.top = '20px';
    container.style.right = '20px';
    container.style.zIndex = '9999';
    document.body.appendChild(container);
  }
  
  // Create notification element
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.style.backgroundColor = type === 'success' ? '#4CAF50' : 
                                      type === 'error' ? '#F44336' : 
                                      '#2196F3';
  notification.style.color = 'white';
  notification.style.padding = '15px';
  notification.style.marginBottom = '10px';
  notification.style.borderRadius = '5px';
  notification.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';
  notification.style.minWidth = '250px';
  notification.textContent = message;
  
  // Add close button
  const closeBtn = document.createElement('span');
  closeBtn.innerHTML = '&times;';
  closeBtn.style.float = 'right';
  closeBtn.style.cursor = 'pointer';
  closeBtn.style.fontWeight = 'bold';
  closeBtn.style.marginLeft = '10px';
  closeBtn.addEventListener('click', () => {
    notification.remove();
  });
  notification.insertBefore(closeBtn, notification.firstChild);
  
  // Add to container
  container.appendChild(notification);
  
  // Auto remove after 5 seconds
  setTimeout(() => {
    notification.remove();
  }, 5000);
}