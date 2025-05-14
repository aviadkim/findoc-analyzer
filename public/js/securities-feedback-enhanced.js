/**
 * FinDoc Analyzer Enhanced Securities Feedback Component
 * This script adds a comprehensive feedback mechanism for reporting securities extraction errors
 * and includes features for using the feedback to improve the extraction algorithm.
 */

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
  console.log('Enhanced Securities Feedback Component initializing...');
  
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
  console.log('Initializing enhanced securities feedback system');
  
  // Add feedback buttons to securities tables
  addFeedbackButtonsToSecuritiesTables();
  
  // Create the feedback modal
  createFeedbackModal();
  
  // Initialize analytics collection
  initFeedbackAnalytics();
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
      button.style.backgroundColor = '#3498db';
      button.style.color = 'white';
      button.style.border = 'none';
      button.style.borderRadius = '4px';
      button.style.padding = '5px 10px';
      button.style.cursor = 'pointer';
      button.innerHTML = '<span class="icon">⚠️</span> Report Issue';
      button.title = 'Report an error with this security';
      button.setAttribute('data-security-index', index);
      
      // Extract security data from row
      const securityData = {};
      const cells = row.querySelectorAll('td');
      
      // Create a mapping of expected headers to their column indices
      const headerCells = headerRow ? headerRow.querySelectorAll('th') : [];
      const headerMap = {};
      
      headerCells.forEach((cell, idx) => {
        const header = cell.textContent.trim().toLowerCase();
        if (header.includes('isin') || header.includes('identifier')) headerMap.isin = idx;
        if (header.includes('name') || header.includes('security')) headerMap.name = idx;
        if (header.includes('type')) headerMap.type = idx;
        if (header.includes('quantity') || header.includes('amount')) headerMap.quantity = idx;
        if (header.includes('price') || header.includes('rate')) headerMap.price = idx;
        if (header.includes('value') || header.includes('total')) headerMap.value = idx;
        if (header.includes('currency') || header.includes('curr')) headerMap.currency = idx;
      });
      
      // Use header map if available, otherwise use positional mapping
      if (Object.keys(headerMap).length > 0) {
        // Map based on headers
        for (const [key, idx] of Object.entries(headerMap)) {
          if (cells[idx]) securityData[key] = cells[idx].textContent.trim();
        }
      } else {
        // Fallback to positional mapping
        cells.forEach((cell, cellIndex) => {
          if (cellIndex === 0) securityData.isin = cell.textContent.trim();
          if (cellIndex === 1) securityData.name = cell.textContent.trim();
          if (cellIndex === 2) securityData.type = cell.textContent.trim();
          if (cellIndex === 3) securityData.quantity = cell.textContent.trim();
          if (cellIndex === 4) securityData.price = cell.textContent.trim();
          if (cellIndex === 5) securityData.value = cell.textContent.trim();
          if (cellIndex === 6) securityData.currency = cell.textContent.trim();
        });
      }
      
      // Add extracted text position data if available
      if (window.extractedTextPositions && window.extractedTextPositions[index]) {
        securityData.positionData = window.extractedTextPositions[index];
      }
      
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
  const securityData = JSON.parse(button.getAttribute('data-security') || '{}');
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
              <option value="extraction-error">Extraction error (incorrect parsing)</option>
              <option value="layout-error">Layout error (table structure issue)</option>
              <option value="duplicate">Duplicate security</option>
              <option value="other">Other</option>
            </select>
          </div>
          
          <div class="form-group" style="margin-bottom: 15px;">
            <label for="correct-value" style="display: block; margin-bottom: 5px; font-weight: bold;">Correct Value</label>
            <input type="text" id="correct-value" name="correctValue" class="form-control" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;" required>
          </div>
          
          <div class="form-group" style="margin-bottom: 15px;">
            <label for="error-description" style="display: block; margin-bottom: 5px; font-weight: bold;">Error Description</label>
            <textarea id="error-description" name="errorDescription" class="form-control" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; min-height: 100px;" required></textarea>
          </div>
          
          <div class="form-group" style="margin-bottom: 15px;">
            <label for="extraction-source" style="display: block; margin-bottom: 5px; font-weight: bold;">Where in the document do you see the correct data? (Optional)</label>
            <select id="extraction-source" name="extractionSource" class="form-control" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
              <option value="">Select extraction source</option>
              <option value="table">Table</option>
              <option value="text">Regular text</option>
              <option value="header">Header/Footer</option>
              <option value="sidebar">Sidebar</option>
              <option value="footnote">Footnote</option>
              <option value="other">Other</option>
            </select>
          </div>
          
          <div class="form-group" style="margin-bottom: 15px;">
            <label for="page-number" style="display: block; margin-bottom: 5px; font-weight: bold;">Page Number (Optional)</label>
            <input type="number" id="page-number" name="pageNumber" class="form-control" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;" min="1">
          </div>
          
          <input type="hidden" id="security-data" name="securityData">
          <input type="hidden" id="document-id" name="documentId">
          <input type="hidden" id="extraction-context" name="extractionContext">
          
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
    
    // Dynamic field updates based on error type
    const errorTypeSelect = modal.querySelector('#error-type');
    const correctValueInput = modal.querySelector('#correct-value');
    
    errorTypeSelect.addEventListener('change', function() {
      // Update correct value label based on selected error type
      const errorType = this.value;
      const correctValueLabel = modal.querySelector('label[for="correct-value"]');
      
      switch (errorType) {
        case 'wrong-identifier':
          correctValueLabel.textContent = 'Correct Identifier:';
          correctValueInput.placeholder = 'Ex: US0378331005';
          break;
        case 'wrong-name':
          correctValueLabel.textContent = 'Correct Name:';
          correctValueInput.placeholder = 'Ex: Apple Inc.';
          break;
        case 'wrong-type':
          correctValueLabel.textContent = 'Correct Type:';
          correctValueInput.placeholder = 'Ex: Equity, Bond, ETF, etc.';
          break;
        case 'wrong-quantity':
          correctValueLabel.textContent = 'Correct Quantity:';
          correctValueInput.placeholder = 'Ex: 100';
          break;
        case 'wrong-price':
          correctValueLabel.textContent = 'Correct Price:';
          correctValueInput.placeholder = 'Ex: 158.93';
          break;
        case 'wrong-value':
          correctValueLabel.textContent = 'Correct Value:';
          correctValueInput.placeholder = 'Ex: 15,893.00';
          break;
        case 'wrong-currency':
          correctValueLabel.textContent = 'Correct Currency:';
          correctValueInput.placeholder = 'Ex: USD, EUR, etc.';
          break;
        case 'missing-data':
          correctValueLabel.textContent = 'Missing Value:';
          correctValueInput.placeholder = 'Enter the missing data';
          break;
        case 'extraction-error':
          correctValueLabel.textContent = 'Correct Data:';
          correctValueInput.placeholder = 'Enter what should have been extracted';
          break;
        case 'duplicate':
          correctValueLabel.textContent = 'Reference ID (if known):';
          correctValueInput.placeholder = 'ID of the original security';
          break;
        default:
          correctValueLabel.textContent = 'Correct Value:';
          correctValueInput.placeholder = '';
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
  
  // Get extraction context (if available)
  let extractionContext = {};
  if (window.documentExtractionMetadata) {
    extractionContext = {
      extractionMethod: window.documentExtractionMetadata.method,
      confidence: window.documentExtractionMetadata.confidence,
      processingTime: window.documentExtractionMetadata.processingTime,
      documentType: window.documentExtractionMetadata.documentType,
      model: window.documentExtractionMetadata.model
    };
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
  
  // Set extraction context
  document.getElementById('extraction-context').value = JSON.stringify(extractionContext);
  
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
  const extractionSource = document.getElementById('extraction-source').value;
  const pageNumber = document.getElementById('page-number').value;
  const securityData = JSON.parse(document.getElementById('security-data').value);
  const documentId = document.getElementById('document-id').value;
  const extractionContext = JSON.parse(document.getElementById('extraction-context').value || '{}');
  
  // Create feedback data object
  const feedbackData = {
    id: 'FB' + Date.now().toString().slice(-6) + Math.floor(Math.random() * 1000),
    errorType,
    correctValue,
    errorDescription,
    extractionSource,
    pageNumber: pageNumber ? parseInt(pageNumber) : null,
    securityData,
    documentId,
    extractionContext,
    submissionDate: new Date().toISOString(),
    status: 'new',
    adminNotes: '',
    improvementActions: '',
    algorithmFeedback: {
      applied: false,
      appliedDate: null,
      successMetric: null,
      beforeAccuracy: null,
      afterAccuracy: null
    }
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
    feedbackHistory.push(feedbackData);
    localStorage.setItem('securities-feedback-history', JSON.stringify(feedbackHistory));
    
    // Update analytics
    updateFeedbackAnalytics(feedbackData);
    
    // Show success notification
    showNotification('Thank you for your feedback! This will help improve our extraction algorithm.', 'success');
    
    // Close modal
    closeFeedbackModal();
  }, 1000);
}

/**
 * Initialize feedback analytics collection
 */
function initFeedbackAnalytics() {
  // Create analytics data structure if it doesn't exist
  if (!localStorage.getItem('securities-feedback-analytics')) {
    const initialAnalytics = {
      totalFeedbackCount: 0,
      feedbackByErrorType: {},
      feedbackByDocumentType: {},
      feedbackByField: {},
      commonCorrections: {},
      improvementMetrics: {
        appliedFeedbackCount: 0,
        averageAccuracyImprovement: 0
      },
      recentFeedback: []
    };
    
    localStorage.setItem('securities-feedback-analytics', JSON.stringify(initialAnalytics));
  }
}

/**
 * Update feedback analytics
 * @param {Object} feedbackData - New feedback data
 */
function updateFeedbackAnalytics(feedbackData) {
  // Get current analytics
  const analytics = JSON.parse(localStorage.getItem('securities-feedback-analytics') || '{}');
  
  // Update total count
  analytics.totalFeedbackCount = (analytics.totalFeedbackCount || 0) + 1;
  
  // Update error type counts
  analytics.feedbackByErrorType = analytics.feedbackByErrorType || {};
  analytics.feedbackByErrorType[feedbackData.errorType] = (analytics.feedbackByErrorType[feedbackData.errorType] || 0) + 1;
  
  // Update document type counts
  const documentType = feedbackData.extractionContext?.documentType || 'unknown';
  analytics.feedbackByDocumentType = analytics.feedbackByDocumentType || {};
  analytics.feedbackByDocumentType[documentType] = (analytics.feedbackByDocumentType[documentType] || 0) + 1;
  
  // Update field counts
  let affectedField = 'other';
  switch (feedbackData.errorType) {
    case 'wrong-identifier': affectedField = 'identifier'; break;
    case 'wrong-name': affectedField = 'name'; break;
    case 'wrong-type': affectedField = 'type'; break;
    case 'wrong-quantity': affectedField = 'quantity'; break;
    case 'wrong-price': affectedField = 'price'; break;
    case 'wrong-value': affectedField = 'value'; break;
    case 'wrong-currency': affectedField = 'currency'; break;
  }
  
  analytics.feedbackByField = analytics.feedbackByField || {};
  analytics.feedbackByField[affectedField] = (analytics.feedbackByField[affectedField] || 0) + 1;
  
  // Track common corrections (for learning)
  if (feedbackData.correctValue && (
    feedbackData.errorType === 'wrong-identifier' || 
    feedbackData.errorType === 'wrong-name' || 
    feedbackData.errorType === 'wrong-type' || 
    feedbackData.errorType === 'wrong-currency'
  )) {
    const originalValue = 
      feedbackData.errorType === 'wrong-identifier' ? feedbackData.securityData.isin :
      feedbackData.errorType === 'wrong-name' ? feedbackData.securityData.name :
      feedbackData.errorType === 'wrong-type' ? feedbackData.securityData.type :
      feedbackData.errorType === 'wrong-currency' ? feedbackData.securityData.currency : '';
    
    if (originalValue) {
      const correctionKey = `${originalValue} -> ${feedbackData.correctValue}`;
      analytics.commonCorrections = analytics.commonCorrections || {};
      analytics.commonCorrections[correctionKey] = (analytics.commonCorrections[correctionKey] || 0) + 1;
    }
  }
  
  // Add to recent feedback (keep last 10)
  analytics.recentFeedback = analytics.recentFeedback || [];
  analytics.recentFeedback.unshift({
    id: feedbackData.id,
    errorType: feedbackData.errorType,
    documentId: feedbackData.documentId,
    date: feedbackData.submissionDate
  });
  analytics.recentFeedback = analytics.recentFeedback.slice(0, 10);
  
  // Save updated analytics
  localStorage.setItem('securities-feedback-analytics', JSON.stringify(analytics));
}

/**
 * Get learning insights from feedback
 * @returns {Object} Learning insights
 */
function getLearningInsights() {
  const analytics = JSON.parse(localStorage.getItem('securities-feedback-analytics') || '{}');
  const feedbackHistory = JSON.parse(localStorage.getItem('securities-feedback-history') || '[]');
  
  // Calculate error patterns
  const errorPatterns = [];
  
  // 1. Identify most common error types
  if (analytics.feedbackByErrorType) {
    const sortedErrorTypes = Object.entries(analytics.feedbackByErrorType)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);
    
    sortedErrorTypes.forEach(([errorType, count]) => {
      errorPatterns.push({
        pattern: `Frequent ${formatErrorType(errorType)} errors`,
        count,
        recommendation: getRecommendationForErrorType(errorType)
      });
    });
  }
  
  // 2. Identify common corrections
  if (analytics.commonCorrections) {
    const sortedCorrections = Object.entries(analytics.commonCorrections)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);
    
    sortedCorrections.forEach(([correction, count]) => {
      const [original, corrected] = correction.split(' -> ');
      errorPatterns.push({
        pattern: `Common correction: "${original}" → "${corrected}"`,
        count,
        recommendation: 'Add to reference database or correct mapping rules'
      });
    });
  }
  
  // 3. Identify document types with high error rates
  if (analytics.feedbackByDocumentType) {
    const sortedDocTypes = Object.entries(analytics.feedbackByDocumentType)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 2);
    
    sortedDocTypes.forEach(([docType, count]) => {
      errorPatterns.push({
        pattern: `High error rate in ${docType} documents`,
        count,
        recommendation: 'Improve extraction templates for this document type'
      });
    });
  }
  
  return {
    errorPatterns,
    feedbackCount: analytics.totalFeedbackCount || 0,
    improvementMetrics: analytics.improvementMetrics || { appliedFeedbackCount: 0, averageAccuracyImprovement: 0 },
    topProblemFields: analytics.feedbackByField ? 
      Object.entries(analytics.feedbackByField)
        .sort((a, b) => b[1] - a[1])
        .map(([field, count]) => ({ field, count }))
        .slice(0, 3) : []
  };
}

/**
 * Format error type for display
 * @param {string} errorType - Error type
 * @returns {string} - Formatted error type
 */
function formatErrorType(errorType) {
  switch (errorType) {
    case 'wrong-identifier':
      return 'Wrong Identifier (ISIN, CUSIP, etc.)';
    case 'wrong-name':
      return 'Wrong Security Name';
    case 'wrong-type':
      return 'Wrong Security Type';
    case 'wrong-quantity':
      return 'Wrong Quantity';
    case 'wrong-price':
      return 'Wrong Price';
    case 'wrong-value':
      return 'Wrong Value';
    case 'wrong-currency':
      return 'Wrong Currency';
    case 'missing-data':
      return 'Missing Data';
    case 'extraction-error':
      return 'Extraction Error';
    case 'layout-error':
      return 'Layout Error';
    case 'duplicate':
      return 'Duplicate Security';
    case 'other':
      return 'Other';
    default:
      return errorType;
  }
}

/**
 * Get recommendation for error type
 * @param {string} errorType - Error type
 * @returns {string} - Recommendation
 */
function getRecommendationForErrorType(errorType) {
  switch (errorType) {
    case 'wrong-identifier':
      return 'Improve ISIN/identifier validation rules and reference data';
    case 'wrong-name':
      return 'Enhance name extraction with better entity recognition';
    case 'wrong-type':
      return 'Improve security type classification rules';
    case 'wrong-quantity':
      return 'Enhance numerical extraction and formatting rules';
    case 'wrong-price':
      return 'Improve price extraction with better decimal/thousand separator handling';
    case 'wrong-value':
      return 'Enhance total value calculation and extraction';
    case 'wrong-currency':
      return 'Improve currency detection and normalization';
    case 'missing-data':
      return 'Enhance extraction to capture all fields in different layouts';
    case 'extraction-error':
      return 'Review OCR quality and text extraction parameters';
    case 'layout-error':
      return 'Improve table detection and structure recognition';
    case 'duplicate':
      return 'Enhance duplicate detection in multi-table documents';
    default:
      return 'Analyze patterns and implement targeted improvements';
  }
}

/**
 * Apply feedback to improve extraction algorithm
 * This is a simulated function that would be implemented on the server
 * @param {string} feedbackId - Feedback ID
 */
function applyFeedbackToAlgorithm(feedbackId) {
  const feedbackHistory = JSON.parse(localStorage.getItem('securities-feedback-history') || '[]');
  const feedback = feedbackHistory.find(item => item.id === feedbackId);
  
  if (!feedback) {
    console.error(`Feedback with ID ${feedbackId} not found`);
    return;
  }
  
  console.log(`Applying feedback ${feedbackId} to improve algorithm`);
  
  // Simulated algorithm improvement
  const improvementActions = {
    'wrong-identifier': 'Updated reference database with correct identifier',
    'wrong-name': 'Enhanced name extraction rules based on feedback',
    'wrong-type': 'Improved security type classification model',
    'wrong-quantity': 'Fixed numerical extraction for quantities in this format',
    'wrong-price': 'Enhanced price extraction with improved decimal handling',
    'wrong-value': 'Corrected value calculation and extraction logic',
    'wrong-currency': 'Updated currency detection rules',
    'missing-data': 'Improved extraction to capture all fields in this layout',
    'extraction-error': 'Enhanced OCR quality parameters for this document type',
    'layout-error': 'Improved table detection for this document structure',
    'duplicate': 'Enhanced duplicate detection algorithm'
  };
  
  // Update feedback status and improvement metrics
  const updatedFeedback = { ...feedback };
  updatedFeedback.status = 'fixed';
  updatedFeedback.improvementActions = improvementActions[feedback.errorType] || 'Applied corrections to algorithm';
  updatedFeedback.algorithmFeedback = {
    applied: true,
    appliedDate: new Date().toISOString(),
    successMetric: Math.random() * 0.3 + 0.7, // Simulated success metric (0.7-1.0)
    beforeAccuracy: Math.random() * 0.3 + 0.5, // Simulated before accuracy (0.5-0.8)
    afterAccuracy: Math.random() * 0.2 + 0.8  // Simulated after accuracy (0.8-1.0)
  };
  
  // Update feedback history
  const updatedHistory = feedbackHistory.map(item => 
    item.id === feedbackId ? updatedFeedback : item
  );
  localStorage.setItem('securities-feedback-history', JSON.stringify(updatedHistory));
  
  // Update analytics
  const analytics = JSON.parse(localStorage.getItem('securities-feedback-analytics') || '{}');
  analytics.improvementMetrics = analytics.improvementMetrics || { appliedFeedbackCount: 0, averageAccuracyImprovement: 0 };
  
  const accuracyImprovement = updatedFeedback.algorithmFeedback.afterAccuracy - updatedFeedback.algorithmFeedback.beforeAccuracy;
  const newCount = analytics.improvementMetrics.appliedFeedbackCount + 1;
  const newAvgImprovement = (
    (analytics.improvementMetrics.averageAccuracyImprovement * analytics.improvementMetrics.appliedFeedbackCount) +
    accuracyImprovement
  ) / newCount;
  
  analytics.improvementMetrics.appliedFeedbackCount = newCount;
  analytics.improvementMetrics.averageAccuracyImprovement = newAvgImprovement;
  
  localStorage.setItem('securities-feedback-analytics', JSON.stringify(analytics));
  
  return updatedFeedback;
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

// Export functions for use in other scripts
window.securitiesFeedback = {
  getLearningInsights,
  applyFeedbackToAlgorithm
};