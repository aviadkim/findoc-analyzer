/**
 * FinDoc Analyzer Securities Feedback Admin Dashboard
 * This script provides administration functionality for the securities feedback system
 */

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
  console.log('Securities Feedback Admin Dashboard initializing...');
  
  // Initialize the admin dashboard
  initFeedbackAdmin();
  
  // Initialize the feedback metrics
  updateMetrics();
  
  // Add event listeners for dashboard controls
  setupEventListeners();
});

/**
 * Initialize the admin dashboard
 */
function initFeedbackAdmin() {
  // Load feedback items
  loadFeedbackItems();
  
  // Initialize learning insights
  initLearningInsights();
}

/**
 * Load feedback items
 */
function loadFeedbackItems() {
  // Get feedback items from localStorage
  const feedbackItems = JSON.parse(localStorage.getItem('securities-feedback-history') || '[]');
  
  // Update UI
  updateFeedbackCounts(feedbackItems);
  renderFeedbackItems(feedbackItems);
}

/**
 * Update feedback counts
 * @param {Array} items - Feedback items
 */
function updateFeedbackCounts(items) {
  document.getElementById('total-feedback-count').textContent = items.length;
  document.getElementById('new-feedback-count').textContent = items.filter(item => item.status === 'new').length;
  document.getElementById('in-review-count').textContent = items.filter(item => item.status === 'in-review').length;
  document.getElementById('fixed-count').textContent = items.filter(item => item.status === 'fixed').length;
}

/**
 * Render feedback items
 * @param {Array} items - Feedback items to render
 */
function renderFeedbackItems(items) {
  const feedbackList = document.getElementById('feedback-list');
  if (!feedbackList) return;
  
  // Clear current list
  feedbackList.innerHTML = '';
  
  if (items.length === 0) {
    feedbackList.innerHTML = `
      <div class="empty-state">
        <p>No feedback items found matching the current filters.</p>
      </div>
    `;
    return;
  }
  
  // Sort items by submission date (newest first)
  items.sort((a, b) => new Date(b.submissionDate) - new Date(a.submissionDate));
  
  // Create list items
  items.forEach(item => {
    const feedbackItem = document.createElement('div');
    feedbackItem.className = 'feedback-item';
    feedbackItem.dataset.id = item.id;
    
    // Format date
    const submissionDate = new Date(item.submissionDate);
    const formattedDate = submissionDate.toLocaleDateString() + ' ' + submissionDate.toLocaleTimeString();
    
    // Determine status class
    const statusClass = item.status === 'new' ? 'status-new' : 
                      item.status === 'in-review' ? 'status-review' : 
                      item.status === 'fixed' ? 'status-fixed' : 
                      'status-rejected';
    
    // Determine status label
    const statusLabel = item.status === 'new' ? 'New' : 
                      item.status === 'in-review' ? 'In Review' : 
                      item.status === 'fixed' ? 'Fixed' : 
                      'Rejected';
    
    // Create the feedback item HTML
    feedbackItem.innerHTML = `
      <div class="feedback-header">
        <div class="feedback-id">${item.id}</div>
        <div class="feedback-date">${formattedDate}</div>
      </div>
      <div class="feedback-content">
        <div class="security-details">
          <div class="feedback-label">Security Information</div>
          <table class="security-table">
            <tr>
              <td>ISIN:</td>
              <td>${item.securityData.isin || 'N/A'}</td>
            </tr>
            <tr>
              <td>Name:</td>
              <td>${item.securityData.name || 'N/A'}</td>
            </tr>
            <tr>
              <td>Type:</td>
              <td>${item.securityData.type || 'N/A'}</td>
            </tr>
          </table>
        </div>
        
        <div class="feedback-section">
          <div class="feedback-label">Error Type</div>
          <div class="feedback-value">${formatErrorType(item.errorType)}</div>
        </div>
        
        <div class="feedback-section">
          <div class="feedback-label">Error Description</div>
          <div class="feedback-value">${item.errorDescription}</div>
        </div>
        
        <div class="feedback-section">
          <div class="feedback-label">Suggested Correction</div>
          <div class="feedback-value">${item.correctValue || 'Not provided'}</div>
        </div>
        
        ${item.extractionSource ? `
        <div class="feedback-section">
          <div class="feedback-label">Extraction Source</div>
          <div class="feedback-value">${formatExtractionSource(item.extractionSource)}</div>
        </div>
        ` : ''}
        
        ${item.pageNumber ? `
        <div class="feedback-section">
          <div class="feedback-label">Page Number</div>
          <div class="feedback-value">${item.pageNumber}</div>
        </div>
        ` : ''}
        
        ${item.algorithmFeedback && item.algorithmFeedback.applied ? `
        <div class="feedback-section" style="background-color: #e8f5e9; padding: 10px; border-radius: 4px;">
          <div class="feedback-label">Algorithm Improvement</div>
          <div class="feedback-value">
            Applied on ${new Date(item.algorithmFeedback.appliedDate).toLocaleDateString()}<br>
            Accuracy improved from ${Math.round(item.algorithmFeedback.beforeAccuracy * 100)}% to ${Math.round(item.algorithmFeedback.afterAccuracy * 100)}%
          </div>
        </div>
        ` : ''}
      </div>
      <div class="feedback-footer">
        <div>
          <span class="status-badge ${statusClass}">${statusLabel}</span>
        </div>
        <div>
          ${item.status !== 'fixed' && !item.algorithmFeedback?.applied ? `
          <button class="btn btn-success apply-feedback-btn" data-id="${item.id}">Apply to Algorithm</button>
          ` : ''}
          <button class="btn btn-primary view-details-btn" data-id="${item.id}">View Details</button>
        </div>
      </div>
    `;
    
    feedbackList.appendChild(feedbackItem);
  });
  
  // Add event listeners to buttons
  document.querySelectorAll('.view-details-btn').forEach(button => {
    button.addEventListener('click', function(event) {
      const id = event.target.dataset.id;
      openFeedbackDetail(id);
    });
  });
  
  document.querySelectorAll('.apply-feedback-btn').forEach(button => {
    button.addEventListener('click', function(event) {
      const id = event.target.dataset.id;
      applyFeedbackToAlgorithm(id);
    });
  });
}

/**
 * Initialize learning insights
 */
function initLearningInsights() {
  // Get learning insights
  const insights = window.securitiesFeedback ? window.securitiesFeedback.getLearningInsights() : {};
  
  // Update improvement opportunities
  updateImprovementOpportunities(insights);
  
  // Initialize error types chart
  initErrorTypesChart();
}

/**
 * Update improvement opportunities
 * @param {Object} insights - Learning insights
 */
function updateImprovementOpportunities(insights) {
  const opportunitiesList = document.getElementById('improvement-opportunities');
  if (!opportunitiesList) return;
  
  opportunitiesList.innerHTML = '';
  
  if (!insights || !insights.errorPatterns || insights.errorPatterns.length === 0) {
    opportunitiesList.innerHTML = '<li>No data available yet</li>';
    return;
  }
  
  // Add improvement opportunities
  insights.errorPatterns.forEach(pattern => {
    const li = document.createElement('li');
    li.innerHTML = `<strong>${pattern.pattern}:</strong> ${pattern.count} occurrences. <span style="color: #388e3c;">${pattern.recommendation}</span>`;
    opportunitiesList.appendChild(li);
  });
  
  // Add general improvement based on top problem fields
  if (insights.topProblemFields && insights.topProblemFields.length > 0) {
    const topField = insights.topProblemFields[0];
    const li = document.createElement('li');
    li.innerHTML = `<strong>Field Improvement:</strong> Focus on improving extraction of <strong>${topField.field}</strong> field with ${topField.count} error reports.`;
    opportunitiesList.appendChild(li);
  }
  
  // Add algorithm feedback loop suggestion
  if (insights.feedbackCount > 5) {
    const li = document.createElement('li');
    li.innerHTML = '<strong>Algorithm Feedback Loop:</strong> Incorporate fixed issues into the training data for continual improvement.';
    opportunitiesList.appendChild(li);
  }
}

/**
 * Initialize error types chart
 */
function initErrorTypesChart() {
  const chartContainer = document.getElementById('error-types-chart');
  if (!chartContainer) return;
  
  // Get analytics data
  const analytics = JSON.parse(localStorage.getItem('securities-feedback-analytics') || '{}');
  
  // If no data or no chart library, display placeholder
  if (!analytics.feedbackByErrorType) {
    chartContainer.innerHTML = `
      <div style="text-align: center; padding-top: 120px; color: #7f8c8d;">
        Error type distribution chart would be displayed here.<br>
        (Chart visualization would be implemented with a library like Chart.js)
      </div>
    `;
    return;
  }
  
  // Create a simple visualization without external libraries
  const errorTypes = Object.entries(analytics.feedbackByErrorType);
  
  // Sort by count
  errorTypes.sort((a, b) => b[1] - a[1]);
  
  // Simple bar chart visualization
  let chartHtml = '<div style="padding: 20px;">';
  
  // Add title
  chartHtml += '<h3 style="text-align: center; margin-bottom: 20px;">Error Type Distribution</h3>';
  
  // Find the maximum count for scaling
  const maxCount = Math.max(...errorTypes.map(([_, count]) => count));
  
  // Create bars
  errorTypes.forEach(([errorType, count]) => {
    const percentage = Math.round((count / maxCount) * 100);
    const barColor = 
      errorType === 'wrong-identifier' ? '#3498db' :
      errorType === 'wrong-name' ? '#2ecc71' :
      errorType === 'wrong-type' ? '#9b59b6' :
      errorType === 'wrong-quantity' ? '#e74c3c' :
      errorType === 'wrong-price' ? '#f1c40f' :
      errorType === 'wrong-value' ? '#1abc9c' :
      errorType === 'wrong-currency' ? '#d35400' :
      errorType === 'missing-data' ? '#34495e' :
      errorType === 'extraction-error' ? '#7f8c8d' :
      errorType === 'layout-error' ? '#8e44ad' :
      errorType === 'duplicate' ? '#c0392b' :
      '#95a5a6';
    
    chartHtml += `
      <div style="margin-bottom: 15px; display: flex; align-items: center;">
        <div style="width: 150px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; margin-right: 10px; text-align: right;">${formatErrorType(errorType)}</div>
        <div style="flex-grow: 1; background-color: #f1f1f1; border-radius: 4px; height: 20px;">
          <div style="width: ${percentage}%; background-color: ${barColor}; height: 100%; border-radius: 4px; display: flex; align-items: center; padding-left: 10px; color: white; font-size: 0.8rem;">
            ${count}
          </div>
        </div>
      </div>
    `;
  });
  
  chartHtml += '</div>';
  
  // Set chart content
  chartContainer.innerHTML = chartHtml;
}

/**
 * Update metrics
 */
function updateMetrics() {
  // Get analytics data
  const analytics = JSON.parse(localStorage.getItem('securities-feedback-analytics') || '{}');
  
  // Update total count
  document.getElementById('total-feedback-count').textContent = analytics.totalFeedbackCount || 0;
  
  // Get status counts from feedback history
  const feedbackItems = JSON.parse(localStorage.getItem('securities-feedback-history') || '[]');
  
  // Count by status
  const newCount = feedbackItems.filter(item => item.status === 'new').length;
  const inReviewCount = feedbackItems.filter(item => item.status === 'in-review').length;
  const fixedCount = feedbackItems.filter(item => item.status === 'fixed').length;
  
  document.getElementById('new-feedback-count').textContent = newCount;
  document.getElementById('in-review-count').textContent = inReviewCount;
  document.getElementById('fixed-count').textContent = fixedCount;
  
  // Update algorithm improvement metrics if available
  if (analytics.improvementMetrics) {
    // Create algorithm improvement stats card
    const statsGrid = document.querySelector('.stats-grid');
    
    // Check if the card already exists
    if (!document.getElementById('algorithm-improvements-card') && statsGrid) {
      const improvementCard = document.createElement('div');
      improvementCard.id = 'algorithm-improvements-card';
      improvementCard.className = 'stat-card';
      improvementCard.innerHTML = `
        <div class="stat-value" id="algorithm-improvements-count">0</div>
        <div class="stat-label">Algorithm Improvements</div>
      `;
      statsGrid.appendChild(improvementCard);
      
      const accuracyCard = document.createElement('div');
      accuracyCard.id = 'accuracy-improvement-card';
      accuracyCard.className = 'stat-card';
      accuracyCard.innerHTML = `
        <div class="stat-value" id="accuracy-improvement-value">0%</div>
        <div class="stat-label">Avg. Accuracy Improvement</div>
      `;
      statsGrid.appendChild(accuracyCard);
    }
    
    // Update values
    const appliedCount = document.getElementById('algorithm-improvements-count');
    const accuracyValue = document.getElementById('accuracy-improvement-value');
    
    if (appliedCount) {
      appliedCount.textContent = analytics.improvementMetrics.appliedFeedbackCount || 0;
    }
    
    if (accuracyValue) {
      const formattedAccuracy = ((analytics.improvementMetrics.averageAccuracyImprovement || 0) * 100).toFixed(1);
      accuracyValue.textContent = `${formattedAccuracy}%`;
    }
  }
}

/**
 * Open feedback detail modal
 * @param {string} id - Feedback ID
 */
function openFeedbackDetail(id) {
  // Get feedback items
  const feedbackItems = JSON.parse(localStorage.getItem('securities-feedback-history') || '[]');
  
  // Find the specific item
  const item = feedbackItems.find(item => item.id === id);
  
  if (!item) {
    console.error(`Feedback item with ID ${id} not found`);
    return;
  }
  
  // Populate modal
  const modalContent = document.getElementById('modal-feedback-content');
  
  // Format date
  const submissionDate = new Date(item.submissionDate);
  const formattedDate = submissionDate.toLocaleDateString() + ' ' + submissionDate.toLocaleTimeString();
  
  modalContent.innerHTML = `
    <div class="feedback-section">
      <div class="feedback-label">Feedback ID</div>
      <div class="feedback-value">${item.id}</div>
    </div>
    
    <div class="feedback-section">
      <div class="feedback-label">Submission Date</div>
      <div class="feedback-value">${formattedDate}</div>
    </div>
    
    <div class="feedback-section">
      <div class="feedback-label">Document ID</div>
      <div class="feedback-value">${item.documentId}</div>
    </div>
    
    <div class="security-details">
      <div class="feedback-label">Security Information</div>
      <table class="security-table">
        <tr>
          <td>ISIN:</td>
          <td>${item.securityData.isin || 'N/A'}</td>
        </tr>
        <tr>
          <td>Name:</td>
          <td>${item.securityData.name || 'N/A'}</td>
        </tr>
        <tr>
          <td>Type:</td>
          <td>${item.securityData.type || 'N/A'}</td>
        </tr>
        <tr>
          <td>Quantity:</td>
          <td>${item.securityData.quantity || 'N/A'}</td>
        </tr>
        <tr>
          <td>Price:</td>
          <td>${item.securityData.price || 'N/A'}</td>
        </tr>
        <tr>
          <td>Value:</td>
          <td>${item.securityData.value || 'N/A'}</td>
        </tr>
        <tr>
          <td>Currency:</td>
          <td>${item.securityData.currency || 'N/A'}</td>
        </tr>
      </table>
    </div>
    
    <div class="feedback-section">
      <div class="feedback-label">Error Type</div>
      <div class="feedback-value">${formatErrorType(item.errorType)}</div>
    </div>
    
    <div class="feedback-section">
      <div class="feedback-label">Error Description</div>
      <div class="feedback-value">${item.errorDescription}</div>
    </div>
    
    <div class="feedback-section">
      <div class="feedback-label">Suggested Correction</div>
      <div class="feedback-value">${item.correctValue || 'Not provided'}</div>
    </div>
    
    ${item.extractionSource ? `
    <div class="feedback-section">
      <div class="feedback-label">Extraction Source</div>
      <div class="feedback-value">${formatExtractionSource(item.extractionSource)}</div>
    </div>
    ` : ''}
    
    ${item.pageNumber ? `
    <div class="feedback-section">
      <div class="feedback-label">Page Number</div>
      <div class="feedback-value">${item.pageNumber}</div>
    </div>
    ` : ''}
    
    ${item.extractionContext && Object.keys(item.extractionContext).length > 0 ? `
    <div class="feedback-section">
      <div class="feedback-label">Extraction Context</div>
      <div class="feedback-value">
        ${Object.entries(item.extractionContext).map(([key, value]) => {
          return `<div><strong>${key}:</strong> ${value}</div>`;
        }).join('')}
      </div>
    </div>
    ` : ''}
    
    ${item.algorithmFeedback && item.algorithmFeedback.applied ? `
    <div class="feedback-section" style="background-color: #e8f5e9; padding: 10px; border-radius: 4px;">
      <div class="feedback-label">Algorithm Improvement</div>
      <div class="feedback-value">
        Applied on ${new Date(item.algorithmFeedback.appliedDate).toLocaleDateString()}<br>
        Success metric: ${(item.algorithmFeedback.successMetric * 100).toFixed(1)}%<br>
        Accuracy improved from ${(item.algorithmFeedback.beforeAccuracy * 100).toFixed(1)}% to ${(item.algorithmFeedback.afterAccuracy * 100).toFixed(1)}%
      </div>
    </div>
    ` : ''}
  `;
  
  // Set current status
  document.getElementById('status-update').value = item.status || 'new';
  
  // Set admin notes and improvement actions
  document.getElementById('admin-notes').value = item.adminNotes || '';
  document.getElementById('improvement-actions').value = item.improvementActions || '';
  
  // Store current item ID
  document.getElementById('save-feedback-btn').dataset.id = id;
  document.getElementById('delete-feedback-btn').dataset.id = id;
  
  // Enable/disable algorithm application button
  const applyBtn = document.getElementById('apply-algorithm-btn');
  if (applyBtn) {
    if (item.status === 'fixed' || (item.algorithmFeedback && item.algorithmFeedback.applied)) {
      applyBtn.style.display = 'none';
    } else {
      applyBtn.style.display = 'inline-block';
      applyBtn.dataset.id = id;
    }
  }
  
  // Show modal
  document.getElementById('feedback-detail-modal').style.display = 'block';
}

/**
 * Close feedback detail modal
 */
function closeFeedbackDetail() {
  document.getElementById('feedback-detail-modal').style.display = 'none';
}

/**
 * Save feedback changes
 * @param {Event} event - Click event
 */
function saveFeedbackChanges(event) {
  const id = event.target.dataset.id;
  
  // Get feedback items
  const feedbackItems = JSON.parse(localStorage.getItem('securities-feedback-history') || '[]');
  
  // Find the specific item
  const itemIndex = feedbackItems.findIndex(item => item.id === id);
  
  if (itemIndex === -1) {
    console.error(`Feedback item with ID ${id} not found`);
    return;
  }
  
  // Update item
  feedbackItems[itemIndex].status = document.getElementById('status-update').value;
  feedbackItems[itemIndex].adminNotes = document.getElementById('admin-notes').value;
  feedbackItems[itemIndex].improvementActions = document.getElementById('improvement-actions').value;
  
  // Save changes
  localStorage.setItem('securities-feedback-history', JSON.stringify(feedbackItems));
  
  // Update UI
  renderFeedbackItems(feedbackItems);
  updateMetrics();
  
  // Close modal
  closeFeedbackDetail();
  
  // Show success notification
  showNotification('Feedback updated successfully', 'success');
}

/**
 * Delete feedback
 * @param {Event} event - Click event
 */
function deleteFeedback(event) {
  const id = event.target.dataset.id;
  
  if (!confirm('Are you sure you want to delete this feedback item?')) {
    return;
  }
  
  // Get feedback items
  const feedbackItems = JSON.parse(localStorage.getItem('securities-feedback-history') || '[]');
  
  // Remove the specific item
  const updatedItems = feedbackItems.filter(item => item.id !== id);
  
  // Save changes
  localStorage.setItem('securities-feedback-history', JSON.stringify(updatedItems));
  
  // Update UI
  renderFeedbackItems(updatedItems);
  updateMetrics();
  initLearningInsights();
  
  // Close modal
  closeFeedbackDetail();
  
  // Show success notification
  showNotification('Feedback deleted successfully', 'success');
}

/**
 * Apply feedback to algorithm
 * @param {string} id - Feedback ID
 */
function applyFeedbackToAlgorithm(id) {
  if (!window.securitiesFeedback || !window.securitiesFeedback.applyFeedbackToAlgorithm) {
    showNotification('Algorithm improvement function not available', 'error');
    return;
  }
  
  if (!confirm('Are you sure you want to apply this feedback to improve the extraction algorithm?')) {
    return;
  }
  
  try {
    // Call the function to apply feedback to algorithm
    const updatedFeedback = window.securitiesFeedback.applyFeedbackToAlgorithm(id);
    
    if (!updatedFeedback) {
      showNotification('Failed to apply feedback to algorithm', 'error');
      return;
    }
    
    // Update UI
    loadFeedbackItems();
    updateMetrics();
    initLearningInsights();
    
    // Close modal if open
    if (document.getElementById('feedback-detail-modal').style.display === 'block') {
      closeFeedbackDetail();
    }
    
    // Show success notification
    showNotification('Feedback successfully applied to improve the algorithm', 'success');
  } catch (error) {
    console.error('Error applying feedback to algorithm:', error);
    showNotification('Error applying feedback to algorithm', 'error');
  }
}

/**
 * Apply filters to feedback items
 */
function applyFilters() {
  // Get filter values
  const statusFilter = document.getElementById('status-filter').value;
  const errorTypeFilter = document.getElementById('error-type-filter').value;
  const dateFilter = document.getElementById('date-filter').value;
  const searchFilter = document.getElementById('search-filter').value.toLowerCase();
  
  // Get feedback items
  const feedbackItems = JSON.parse(localStorage.getItem('securities-feedback-history') || '[]');
  
  // Apply filters
  const filteredItems = feedbackItems.filter(item => {
    // Status filter
    if (statusFilter !== 'all' && item.status !== statusFilter.replace('in-review', 'in-review')) {
      return false;
    }
    
    // Error type filter
    if (errorTypeFilter !== 'all' && item.errorType !== errorTypeFilter) {
      return false;
    }
    
    // Date filter
    if (dateFilter !== 'all') {
      const itemDate = new Date(item.submissionDate);
      const today = new Date();
      
      if (dateFilter === 'today') {
        if (itemDate.toDateString() !== today.toDateString()) {
          return false;
        }
      } else if (dateFilter === 'this-week') {
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());
        startOfWeek.setHours(0, 0, 0, 0);
        
        if (itemDate < startOfWeek) {
          return false;
        }
      } else if (dateFilter === 'this-month') {
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        
        if (itemDate < startOfMonth) {
          return false;
        }
      } else if (dateFilter === 'last-month') {
        const startOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        const startOfThisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        
        if (itemDate < startOfLastMonth || itemDate >= startOfThisMonth) {
          return false;
        }
      }
    }
    
    // Search filter
    if (searchFilter) {
      const searchableFields = [
        item.id,
        item.securityData.isin,
        item.securityData.name,
        item.errorDescription,
        item.correctValue
      ].filter(Boolean).map(val => val.toString().toLowerCase());
      
      if (!searchableFields.some(field => field.includes(searchFilter))) {
        return false;
      }
    }
    
    return true;
  });
  
  // Render filtered items
  renderFeedbackItems(filteredItems);
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
 * Format extraction source for display
 * @param {string} source - Extraction source
 * @returns {string} - Formatted extraction source
 */
function formatExtractionSource(source) {
  switch (source) {
    case 'table':
      return 'Table';
    case 'text':
      return 'Regular Text';
    case 'header':
      return 'Header/Footer';
    case 'sidebar':
      return 'Sidebar';
    case 'footnote':
      return 'Footnote';
    case 'other':
      return 'Other';
    default:
      return source;
  }
}

/**
 * Set up event listeners
 */
function setupEventListeners() {
  // Modal close button
  const closeModal = document.querySelector('.close-modal');
  if (closeModal) {
    closeModal.addEventListener('click', closeFeedbackDetail);
  }
  
  // Close detail button
  const closeDetailBtn = document.getElementById('close-detail-btn');
  if (closeDetailBtn) {
    closeDetailBtn.addEventListener('click', closeFeedbackDetail);
  }
  
  // Save changes button
  const saveFeedbackBtn = document.getElementById('save-feedback-btn');
  if (saveFeedbackBtn) {
    saveFeedbackBtn.addEventListener('click', saveFeedbackChanges);
  }
  
  // Delete feedback button
  const deleteFeedbackBtn = document.getElementById('delete-feedback-btn');
  if (deleteFeedbackBtn) {
    deleteFeedbackBtn.addEventListener('click', deleteFeedback);
  }
  
  // Apply algorithm button in modal
  const applyAlgorithmBtn = document.getElementById('apply-algorithm-btn');
  if (applyAlgorithmBtn) {
    applyAlgorithmBtn.addEventListener('click', function(event) {
      const id = event.target.dataset.id;
      applyFeedbackToAlgorithm(id);
    });
  }
  
  // Filter change events
  const statusFilter = document.getElementById('status-filter');
  const errorTypeFilter = document.getElementById('error-type-filter');
  const dateFilter = document.getElementById('date-filter');
  const searchFilter = document.getElementById('search-filter');
  
  if (statusFilter) statusFilter.addEventListener('change', applyFilters);
  if (errorTypeFilter) errorTypeFilter.addEventListener('change', applyFilters);
  if (dateFilter) dateFilter.addEventListener('change', applyFilters);
  if (searchFilter) searchFilter.addEventListener('input', applyFilters);
  
  // Generate report button
  const generateReportBtn = document.getElementById('generate-report-btn');
  if (generateReportBtn) {
    generateReportBtn.addEventListener('click', generateFeedbackReport);
  }
}

/**
 * Generate feedback report
 */
function generateFeedbackReport() {
  // Get feedback data
  const feedbackItems = JSON.parse(localStorage.getItem('securities-feedback-history') || '[]');
  const analytics = JSON.parse(localStorage.getItem('securities-feedback-analytics') || '{}');
  
  // Create report
  const report = {
    generatedAt: new Date().toISOString(),
    summary: {
      totalFeedback: feedbackItems.length,
      newFeedback: feedbackItems.filter(item => item.status === 'new').length,
      inReviewFeedback: feedbackItems.filter(item => item.status === 'in-review').length,
      fixedFeedback: feedbackItems.filter(item => item.status === 'fixed').length,
      rejectedFeedback: feedbackItems.filter(item => item.status === 'rejected').length,
      algorithmImprovements: (analytics.improvementMetrics?.appliedFeedbackCount || 0),
      averageAccuracyImprovement: (analytics.improvementMetrics?.averageAccuracyImprovement || 0) * 100
    },
    errorAnalysis: {
      byType: analytics.feedbackByErrorType || {},
      byField: analytics.feedbackByField || {},
      byDocumentType: analytics.feedbackByDocumentType || {}
    },
    insights: window.securitiesFeedback ? window.securitiesFeedback.getLearningInsights() : {},
    recentFeedback: feedbackItems.sort((a, b) => new Date(b.submissionDate) - new Date(a.submissionDate)).slice(0, 10)
  };
  
  // Display report
  openReportModal(report);
}

/**
 * Open report modal
 * @param {Object} report - Feedback report
 */
function openReportModal(report) {
  // Check if the modal exists
  let reportModal = document.getElementById('report-modal');
  
  if (!reportModal) {
    // Create a new modal for the report
    reportModal = document.createElement('div');
    reportModal.id = 'report-modal';
    reportModal.className = 'modal';
    reportModal.style.display = 'none';
    reportModal.style.position = 'fixed';
    reportModal.style.zIndex = '1000';
    reportModal.style.left = '0';
    reportModal.style.top = '0';
    reportModal.style.width = '100%';
    reportModal.style.height = '100%';
    reportModal.style.overflow = 'auto';
    reportModal.style.backgroundColor = 'rgba(0,0,0,0.4)';
    
    reportModal.innerHTML = `
      <div class="modal-content" style="background-color: white; margin: 5% auto; padding: 20px; border-radius: 8px; width: 80%; max-width: 800px; max-height: 80vh; overflow-y: auto; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
        <span class="close-report-modal" style="color: #aaa; float: right; font-size: 28px; font-weight: bold; cursor: pointer;">&times;</span>
        <h2 style="margin-top: 0;">Securities Extraction Feedback Report</h2>
        <div id="report-content"></div>
        <div style="margin-top: 20px; text-align: right;">
          <button id="download-report-btn" class="btn btn-primary" style="padding: 10px 20px; background-color: #3498db; color: white; border: none; border-radius: 4px; cursor: pointer;">Download Report</button>
          <button id="close-report-btn" class="btn btn-secondary" style="padding: 10px 20px; margin-left: 10px; background-color: #f1f1f1; border: none; border-radius: 4px; cursor: pointer;">Close</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(reportModal);
    
    // Add event listeners
    reportModal.querySelector('.close-report-modal').addEventListener('click', function() {
      reportModal.style.display = 'none';
    });
    
    reportModal.querySelector('#close-report-btn').addEventListener('click', function() {
      reportModal.style.display = 'none';
    });
    
    reportModal.querySelector('#download-report-btn').addEventListener('click', function() {
      // Create a JSON blob
      const reportBlob = new Blob([JSON.stringify(report, null, 2)], {type: 'application/json'});
      const url = URL.createObjectURL(reportBlob);
      
      // Create a download link
      const a = document.createElement('a');
      a.href = url;
      a.download = `securities-feedback-report-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });
    
    // Close modal when clicking outside content
    reportModal.addEventListener('click', function(event) {
      if (event.target === reportModal) {
        reportModal.style.display = 'none';
      }
    });
  }
  
  // Format report date
  const reportDate = new Date(report.generatedAt);
  const formattedDate = reportDate.toLocaleDateString() + ' ' + reportDate.toLocaleTimeString();
  
  // Generate report content
  const reportContent = document.getElementById('report-content');
  reportContent.innerHTML = `
    <div style="margin-bottom: 20px;">
      <p>Report generated on: <strong>${formattedDate}</strong></p>
    </div>
    
    <div style="margin-bottom: 20px; background-color: #f9f9f9; padding: 15px; border-radius: 5px;">
      <h3 style="margin-top: 0; margin-bottom: 10px;">Summary</h3>
      <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 15px;">
        <div>
          <div style="font-weight: bold;">Total Feedback:</div>
          <div>${report.summary.totalFeedback}</div>
        </div>
        <div>
          <div style="font-weight: bold;">New Feedback:</div>
          <div>${report.summary.newFeedback}</div>
        </div>
        <div>
          <div style="font-weight: bold;">In Review:</div>
          <div>${report.summary.inReviewFeedback}</div>
        </div>
        <div>
          <div style="font-weight: bold;">Fixed:</div>
          <div>${report.summary.fixedFeedback}</div>
        </div>
        <div>
          <div style="font-weight: bold;">Algorithm Improvements:</div>
          <div>${report.summary.algorithmImprovements}</div>
        </div>
        <div>
          <div style="font-weight: bold;">Avg. Accuracy Improvement:</div>
          <div>${report.summary.averageAccuracyImprovement.toFixed(1)}%</div>
        </div>
      </div>
    </div>
    
    <div style="margin-bottom: 20px;">
      <h3 style="margin-top: 0; margin-bottom: 10px;">Error Analysis</h3>
      
      <div style="margin-bottom: 15px;">
        <h4 style="margin-top: 0; margin-bottom: 10px;">Errors by Type</h4>
        <div style="max-height: 200px; overflow-y: auto;">
          ${Object.entries(report.errorAnalysis.byType).length > 0 ?
            `<table style="width: 100%; border-collapse: collapse;">
              <tr>
                <th style="padding: 8px; text-align: left; border-bottom: 1px solid #ddd;">Error Type</th>
                <th style="padding: 8px; text-align: left; border-bottom: 1px solid #ddd;">Count</th>
                <th style="padding: 8px; text-align: left; border-bottom: 1px solid #ddd;">Percentage</th>
              </tr>
              ${Object.entries(report.errorAnalysis.byType)
                .sort((a, b) => b[1] - a[1])
                .map(([type, count]) => {
                  const percentage = (count / report.summary.totalFeedback * 100).toFixed(1);
                  return `
                    <tr>
                      <td style="padding: 8px; border-bottom: 1px solid #ddd;">${formatErrorType(type)}</td>
                      <td style="padding: 8px; border-bottom: 1px solid #ddd;">${count}</td>
                      <td style="padding: 8px; border-bottom: 1px solid #ddd;">${percentage}%</td>
                    </tr>
                  `;
                }).join('')}
            </table>`
            : '<p>No data available</p>'
          }
        </div>
      </div>
      
      <div style="margin-bottom: 15px;">
        <h4 style="margin-top: 0; margin-bottom: 10px;">Errors by Field</h4>
        <div style="max-height: 200px; overflow-y: auto;">
          ${Object.entries(report.errorAnalysis.byField).length > 0 ?
            `<table style="width: 100%; border-collapse: collapse;">
              <tr>
                <th style="padding: 8px; text-align: left; border-bottom: 1px solid #ddd;">Field</th>
                <th style="padding: 8px; text-align: left; border-bottom: 1px solid #ddd;">Count</th>
                <th style="padding: 8px; text-align: left; border-bottom: 1px solid #ddd;">Percentage</th>
              </tr>
              ${Object.entries(report.errorAnalysis.byField)
                .sort((a, b) => b[1] - a[1])
                .map(([field, count]) => {
                  const percentage = (count / report.summary.totalFeedback * 100).toFixed(1);
                  return `
                    <tr>
                      <td style="padding: 8px; border-bottom: 1px solid #ddd;">${field.charAt(0).toUpperCase() + field.slice(1)}</td>
                      <td style="padding: 8px; border-bottom: 1px solid #ddd;">${count}</td>
                      <td style="padding: 8px; border-bottom: 1px solid #ddd;">${percentage}%</td>
                    </tr>
                  `;
                }).join('')}
            </table>`
            : '<p>No data available</p>'
          }
        </div>
      </div>
    </div>
    
    <div style="margin-bottom: 20px;">
      <h3 style="margin-top: 0; margin-bottom: 10px;">Improvement Opportunities</h3>
      ${report.insights && report.insights.errorPatterns && report.insights.errorPatterns.length > 0 ?
        `<ul style="margin-top: 0;">
          ${report.insights.errorPatterns.map(pattern => `
            <li><strong>${pattern.pattern}:</strong> ${pattern.count} occurrences. <span style="color: #388e3c;">${pattern.recommendation}</span></li>
          `).join('')}
        </ul>`
        : '<p>No insights available yet</p>'
      }
    </div>
    
    <div>
      <h3 style="margin-top: 0; margin-bottom: 10px;">Recent Feedback</h3>
      <div style="max-height: 300px; overflow-y: auto;">
        ${report.recentFeedback.length > 0 ?
          `<table style="width: 100%; border-collapse: collapse;">
            <tr>
              <th style="padding: 8px; text-align: left; border-bottom: 1px solid #ddd;">ID</th>
              <th style="padding: 8px; text-align: left; border-bottom: 1px solid #ddd;">Error Type</th>
              <th style="padding: 8px; text-align: left; border-bottom: 1px solid #ddd;">Status</th>
              <th style="padding: 8px; text-align: left; border-bottom: 1px solid #ddd;">Date</th>
            </tr>
            ${report.recentFeedback.map(item => {
              const itemDate = new Date(item.submissionDate);
              const formattedItemDate = itemDate.toLocaleDateString();
              return `
                <tr>
                  <td style="padding: 8px; border-bottom: 1px solid #ddd;">${item.id}</td>
                  <td style="padding: 8px; border-bottom: 1px solid #ddd;">${formatErrorType(item.errorType)}</td>
                  <td style="padding: 8px; border-bottom: 1px solid #ddd;">${item.status.charAt(0).toUpperCase() + item.status.slice(1)}</td>
                  <td style="padding: 8px; border-bottom: 1px solid #ddd;">${formattedItemDate}</td>
                </tr>
              `;
            }).join('')}
          </table>`
          : '<p>No feedback available</p>'
        }
      </div>
    </div>
  `;
  
  // Show the modal
  reportModal.style.display = 'block';
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