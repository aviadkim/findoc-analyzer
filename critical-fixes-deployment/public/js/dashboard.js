
/**
 * Dashboard Functionality
 */
document.addEventListener('DOMContentLoaded', function() {
  console.log('Dashboard script loaded');
  
  // Initialize dashboard components
  initDashboard();
});

// Initialize dashboard
function initDashboard() {
  // Check if dashboard container exists
  const dashboardContainer = document.querySelector('.dashboard-container');
  if (!dashboardContainer) {
    console.log('Creating dashboard container');
    createDashboard();
  }
  
  // Add event listeners
  addDashboardEventListeners();
}

// Create dashboard
function createDashboard() {
  const mainContent = document.querySelector('main') || document.querySelector('.content') || document.body;
  
  // Create dashboard container
  const dashboardContainer = document.createElement('div');
  dashboardContainer.className = 'dashboard-container';
  
  // Add dashboard header
  dashboardContainer.innerHTML = `
    <div class="dashboard-header">
      <h1>FinDoc Analyzer Dashboard</h1>
      <p>Welcome to your financial document analysis dashboard</p>
    </div>
    
    <div class="dashboard-stats">
      <div class="stat-card">
        <h3>Documents</h3>
        <div class="value">12</div>
      </div>
      <div class="stat-card">
        <h3>Processed</h3>
        <div class="value">10</div>
      </div>
      <div class="stat-card">
        <h3>Pending</h3>
        <div class="value">2</div>
      </div>
      <div class="stat-card">
        <h3>Agents</h3>
        <div class="value">4</div>
      </div>
    </div>
    
    <div class="recent-documents">
      <h2>Recent Documents</h2>
      <div class="document-grid">
        <div class="document-card" data-id="1">
          <div class="document-icon">📄</div>
          <div class="document-info">
            <h3>Financial Report Q1 2023</h3>
            <p>Uploaded: 2023-04-15</p>
          </div>
        </div>
        <div class="document-card" data-id="2">
          <div class="document-icon">📄</div>
          <div class="document-info">
            <h3>Investment Portfolio Analysis</h3>
            <p>Uploaded: 2023-03-22</p>
          </div>
        </div>
        <div class="document-card" data-id="3">
          <div class="document-icon">📄</div>
          <div class="document-info">
            <h3>Market Research Report</h3>
            <p>Uploaded: 2023-02-10</p>
          </div>
        </div>
      </div>
    </div>
    
    <div class="quick-upload">
      <h2>Quick Upload</h2>
      <form action="/upload" method="post" enctype="multipart/form-data">
        <input type="file" name="file" id="quick-file-input" accept=".pdf,.csv,.xlsx,.xls">
        <button type="submit" class="btn btn-primary">Upload</button>
      </form>
    </div>
    
    <div class="features">
      <h2>Features</h2>
      <div class="feature-grid">
        <div class="feature-card">
          <div class="feature-icon">📊</div>
          <div class="feature-info">
            <h3>Document Analysis</h3>
            <p>Extract insights from your financial documents</p>
          </div>
        </div>
        <div class="feature-card">
          <div class="feature-icon">💬</div>
          <div class="feature-info">
            <h3>Document Chat</h3>
            <p>Chat with your documents using AI</p>
          </div>
        </div>
        <div class="feature-card">
          <div class="feature-icon">📈</div>
          <div class="feature-info">
            <h3>Analytics</h3>
            <p>Visualize your financial data</p>
          </div>
        </div>
      </div>
    </div>
  `;
  
  // Add to page
  mainContent.appendChild(dashboardContainer);
  console.log('Dashboard created');
}

// Add event listeners
function addDashboardEventListeners() {
  // Document card click
  document.querySelectorAll('.document-card').forEach(card => {
    card.addEventListener('click', function() {
      const documentId = this.getAttribute('data-id');
      if (documentId) {
        window.location.href = `/document-details?id=${documentId}`;
      }
    });
  });
  
  // Quick upload form
  const quickUploadForm = document.querySelector('.quick-upload form');
  if (quickUploadForm) {
    quickUploadForm.addEventListener('submit', function(e) {
      const fileInput = document.getElementById('quick-file-input');
      if (!fileInput.files.length) {
        e.preventDefault();
        alert('Please select a file to upload');
      }
    });
  }
}
