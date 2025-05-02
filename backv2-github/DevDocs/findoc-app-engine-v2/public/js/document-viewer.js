/**
 * Document Viewer
 * 
 * This script handles the document viewer page functionality.
 */

// Get document ID from URL
const urlParams = new URLSearchParams(window.location.search);
const documentId = urlParams.get('id');

// Elements
const documentTitle = document.getElementById('document-title');
const documentPreview = document.getElementById('document-preview');
const documentInfo = document.getElementById('document-info');
const documentActions = document.getElementById('document-actions');
const processingStatus = document.getElementById('processing-status');
const chatContainer = document.getElementById('chat-container');
const chatInterface = document.querySelector('chat-interface');

// Load document
async function loadDocument() {
  if (!documentId) {
    window.location.href = '/documents.html';
    return;
  }
  
  try {
    // Show loading state
    documentTitle.textContent = 'Loading document...';
    documentPreview.innerHTML = '<div class="loading-spinner"></div>';
    
    // Fetch document
    const response = await fetch(`/api/documents/${documentId}`);
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to load document');
    }
    
    const document = data.data;
    
    // Update document title
    documentTitle.textContent = document.name;
    
    // Update document info
    documentInfo.innerHTML = `
      <div class="info-item">
        <span class="info-label">Type:</span>
        <span class="info-value">${document.type}</span>
      </div>
      <div class="info-item">
        <span class="info-label">Size:</span>
        <span class="info-value">${formatFileSize(document.size)}</span>
      </div>
      <div class="info-item">
        <span class="info-label">Uploaded:</span>
        <span class="info-value">${formatDate(document.uploadedAt)}</span>
      </div>
      <div class="info-item">
        <span class="info-label">Status:</span>
        <span class="info-value status-${document.status}">${document.status}</span>
      </div>
    `;
    
    // Update document actions
    documentActions.innerHTML = `
      <button class="btn btn-primary" onclick="downloadDocument('${document.id}')">
        <span class="material-icons">download</span>
        Download
      </button>
      <button class="btn btn-secondary" onclick="processDocument('${document.id}')">
        <span class="material-icons">analytics</span>
        Process
      </button>
      <button class="btn btn-danger" onclick="deleteDocument('${document.id}')">
        <span class="material-icons">delete</span>
        Delete
      </button>
    `;
    
    // Load document preview
    loadDocumentPreview(document.id);
    
    // Check if document is processed
    if (document.status === 'processed') {
      // Show processing results
      loadProcessingResults(document.id);
    } else {
      // Hide processing results
      processingStatus.innerHTML = `
        <div class="alert alert-info">
          <span class="material-icons">info</span>
          <span>This document has not been processed yet. Click the "Process" button to analyze it.</span>
        </div>
      `;
    }
    
    // Initialize chat interface
    if (chatInterface) {
      chatInterface.setDocumentId(document.id);
    }
    
  } catch (error) {
    console.error('Error loading document:', error);
    
    documentTitle.textContent = 'Error loading document';
    documentPreview.innerHTML = `
      <div class="alert alert-danger">
        <span class="material-icons">error</span>
        <span>${error.message}</span>
      </div>
    `;
  }
}

// Load document preview
async function loadDocumentPreview(documentId) {
  try {
    // Fetch document preview
    const response = await fetch(`/api/documents/${documentId}/preview`);
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to load document preview');
    }
    
    // Update document preview
    if (data.data.previewType === 'image') {
      documentPreview.innerHTML = `
        <img src="/api/documents/${documentId}/preview/image" alt="Document Preview" class="document-preview-image">
      `;
    } else if (data.data.previewType === 'text') {
      documentPreview.innerHTML = `
        <div class="document-preview-text">${data.data.preview}</div>
      `;
    } else {
      documentPreview.innerHTML = `
        <div class="alert alert-warning">
          <span class="material-icons">warning</span>
          <span>Preview not available for this document type.</span>
        </div>
      `;
    }
  } catch (error) {
    console.error('Error loading document preview:', error);
    
    documentPreview.innerHTML = `
      <div class="alert alert-danger">
        <span class="material-icons">error</span>
        <span>${error.message}</span>
      </div>
    `;
  }
}

// Load processing results
async function loadProcessingResults(documentId) {
  try {
    // Fetch processing results
    const response = await fetch(`/api/documents/${documentId}/processing`);
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to load processing results');
    }
    
    const result = data.data;
    
    // Update processing status
    processingStatus.innerHTML = `
      <div class="processing-result">
        <h3>Processing Results</h3>
        
        <div class="result-section">
          <h4>Document Type</h4>
          <p>${result.documentType || 'Unknown'}</p>
        </div>
        
        <div class="result-section">
          <h4>Metadata</h4>
          <div class="metadata-grid">
            ${Object.entries(result.metadata || {}).map(([key, value]) => `
              <div class="metadata-item">
                <span class="metadata-label">${key}:</span>
                <span class="metadata-value">${value || 'N/A'}</span>
              </div>
            `).join('')}
          </div>
        </div>
        
        ${result.securities && result.securities.length > 0 ? `
          <div class="result-section">
            <h4>Securities (${result.securities.length})</h4>
            <div class="securities-table-container">
              <table class="securities-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>ISIN</th>
                    <th>Quantity</th>
                    <th>Price</th>
                    <th>Value</th>
                    <th>Weight</th>
                  </tr>
                </thead>
                <tbody>
                  ${result.securities.map(security => `
                    <tr>
                      <td>${security.name || 'N/A'}</td>
                      <td>${security.isin || 'N/A'}</td>
                      <td>${security.quantity || 'N/A'}</td>
                      <td>${security.price ? formatCurrency(security.price, security.currency) : 'N/A'}</td>
                      <td>${security.value ? formatCurrency(security.value, security.currency) : 'N/A'}</td>
                      <td>${security.weight ? formatPercentage(security.weight) : 'N/A'}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>
        ` : ''}
        
        ${result.insights && result.insights.length > 0 ? `
          <div class="result-section">
            <h4>Insights</h4>
            <div class="insights-container">
              ${result.insights.map(insight => `
                <div class="insight-card">
                  <div class="insight-header">
                    <span class="insight-type">${insight.type}</span>
                    <h5 class="insight-title">${insight.title}</h5>
                  </div>
                  <p class="insight-description">${insight.description}</p>
                  <p class="insight-recommendation">${insight.recommendation}</p>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}
        
        <div class="result-section">
          <h4>Chat with Document</h4>
          <p>Ask questions about this document using the chat interface.</p>
        </div>
      </div>
    `;
    
    // Show chat container
    chatContainer.style.display = 'block';
    
  } catch (error) {
    console.error('Error loading processing results:', error);
    
    processingStatus.innerHTML = `
      <div class="alert alert-danger">
        <span class="material-icons">error</span>
        <span>${error.message}</span>
      </div>
    `;
  }
}

// Process document
async function processDocument(documentId) {
  try {
    // Show processing message
    processingStatus.innerHTML = `
      <div class="alert alert-info">
        <span class="material-icons">hourglass_empty</span>
        <span>Processing document... This may take a few moments.</span>
      </div>
    `;
    
    // Process document
    const response = await fetch(`/api/documents/${documentId}/process`, {
      method: 'POST'
    });
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to process document');
    }
    
    // Reload document
    loadDocument();
    
  } catch (error) {
    console.error('Error processing document:', error);
    
    processingStatus.innerHTML = `
      <div class="alert alert-danger">
        <span class="material-icons">error</span>
        <span>${error.message}</span>
      </div>
    `;
  }
}

// Download document
function downloadDocument(documentId) {
  window.location.href = `/api/documents/${documentId}/download`;
}

// Delete document
async function deleteDocument(documentId) {
  if (!confirm('Are you sure you want to delete this document?')) {
    return;
  }
  
  try {
    // Delete document
    const response = await fetch(`/api/documents/${documentId}`, {
      method: 'DELETE'
    });
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to delete document');
    }
    
    // Redirect to documents page
    window.location.href = '/documents.html';
    
  } catch (error) {
    console.error('Error deleting document:', error);
    
    alert(`Error deleting document: ${error.message}`);
  }
}

// Format file size
function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Format date
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
}

// Format currency
function formatCurrency(value, currency = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency || 'USD'
  }).format(value);
}

// Format percentage
function formatPercentage(value) {
  return new Intl.NumberFormat('en-US', {
    style: 'percent',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value / 100);
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  loadDocument();
});
