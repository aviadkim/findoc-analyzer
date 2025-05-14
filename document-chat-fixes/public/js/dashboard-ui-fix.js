
/**
 * Dashboard UI Fix
 * This script adds dashboard UI components if they're missing
 */
document.addEventListener('DOMContentLoaded', function() {
  console.log('Dashboard UI Fix running...');
  
  // Only run on dashboard page
  if (window.location.pathname === '/' || window.location.pathname === '/index.html') {
    fixDashboardUI();
  }
});

// Fix dashboard UI
function fixDashboardUI() {
  // Check if dashboard container exists
  if (!document.querySelector('.dashboard-container')) {
    console.log('Dashboard container not found, adding it...');
    
    // Get main content area
    const mainContent = document.querySelector('main') || document.querySelector('.content') || document.body;
    
    // Create dashboard container
    const dashboardContainer = document.createElement('div');
    dashboardContainer.className = 'dashboard-container';
    
    // Add dashboard content
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
    
    // Add dashboard styles if not already added
    if (!document.querySelector('link[href*="dashboard.css"]')) {
      const dashboardStyles = document.createElement('link');
      dashboardStyles.rel = 'stylesheet';
      dashboardStyles.href = '/css/dashboard.css';
      document.head.appendChild(dashboardStyles);
    }
    
    // Add event listeners
    document.querySelectorAll('.document-card').forEach(card => {
      card.addEventListener('click', function() {
        const documentId = this.getAttribute('data-id');
        if (documentId) {
          window.location.href = `/document-details?id=${documentId}`;
        }
      });
    });
    
    console.log('Dashboard UI fixed');
  } else {
    console.log('Dashboard container already exists');
  }
}
