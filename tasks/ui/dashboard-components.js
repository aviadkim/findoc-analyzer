/**
 * Dashboard UI Components Implementation
 * This script implements the dashboard UI components
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const config = {
  containerName: 'findoc-app-container-new',
  publicDir: path.join(__dirname, '../../public'),
  componentsDir: path.join(__dirname, '../../public/components'),
  cssDir: path.join(__dirname, '../../public/css'),
  jsDir: path.join(__dirname, '../../public/js'),
  backupDir: path.join(__dirname, '../../backups')
};

// Create directories if they don't exist
for (const dir of [config.publicDir, config.componentsDir, config.cssDir, config.jsDir, config.backupDir]) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`Created directory: ${dir}`);
  }
}

// Dashboard CSS
const dashboardCss = `
/* Dashboard Styles */
.dashboard-container {
  padding: 20px;
}

.dashboard-header {
  margin-bottom: 30px;
}

.dashboard-header h1 {
  font-size: 24px;
  margin-bottom: 10px;
}

.dashboard-stats {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  padding: 20px;
}

.stat-card h3 {
  font-size: 16px;
  margin-top: 0;
  margin-bottom: 10px;
  color: #666;
}

.stat-card .value {
  font-size: 24px;
  font-weight: bold;
  color: #333;
}

.recent-documents {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  padding: 20px;
  margin-bottom: 30px;
}

.recent-documents h2 {
  font-size: 18px;
  margin-top: 0;
  margin-bottom: 20px;
}

.document-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
}

.document-card {
  display: flex;
  align-items: center;
  padding: 15px;
  border: 1px solid #eee;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.document-card:hover {
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  transform: translateY(-2px);
}

.document-icon {
  font-size: 24px;
  margin-right: 15px;
  color: #2196F3;
}

.document-info h3 {
  font-size: 16px;
  margin: 0 0 5px 0;
}

.document-info p {
  font-size: 14px;
  color: #666;
  margin: 0;
}

.quick-upload {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  padding: 20px;
  margin-bottom: 30px;
}

.quick-upload h2 {
  font-size: 18px;
  margin-top: 0;
  margin-bottom: 20px;
}

.quick-upload form {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.quick-upload input[type="file"] {
  flex: 1;
  min-width: 200px;
}

.features {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  padding: 20px;
}

.features h2 {
  font-size: 18px;
  margin-top: 0;
  margin-bottom: 20px;
}

.feature-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
}

.feature-card {
  display: flex;
  align-items: center;
  padding: 15px;
  border: 1px solid #eee;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.feature-card:hover {
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  transform: translateY(-2px);
}

.feature-icon {
  font-size: 24px;
  margin-right: 15px;
  color: #2196F3;
}

.feature-info h3 {
  font-size: 16px;
  margin: 0 0 5px 0;
}

.feature-info p {
  font-size: 14px;
  color: #666;
  margin: 0;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .dashboard-stats,
  .document-grid,
  .feature-grid {
    grid-template-columns: 1fr;
  }
}
`;

// Dashboard JavaScript
const dashboardJs = `
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
  dashboardContainer.innerHTML = \`
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
  \`;
  
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
        window.location.href = \`/document-details?id=\${documentId}\`;
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
`;

// Dashboard HTML Component
const dashboardHtml = `
<div class="dashboard-container">
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
</div>
`;

// Save dashboard CSS
fs.writeFileSync(path.join(config.cssDir, 'dashboard.css'), dashboardCss);
console.log(`Saved dashboard CSS to ${path.join(config.cssDir, 'dashboard.css')}`);

// Save dashboard JavaScript
fs.writeFileSync(path.join(config.jsDir, 'dashboard.js'), dashboardJs);
console.log(`Saved dashboard JavaScript to ${path.join(config.jsDir, 'dashboard.js')}`);

// Save dashboard HTML component
fs.writeFileSync(path.join(config.componentsDir, 'dashboard.html'), dashboardHtml);
console.log(`Saved dashboard HTML component to ${path.join(config.componentsDir, 'dashboard.html')}`);

// Create dashboard UI fix script
const dashboardUiFixScript = `
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
    dashboardContainer.innerHTML = \`
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
    \`;
    
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
          window.location.href = \`/document-details?id=\${documentId}\`;
        }
      });
    });
    
    console.log('Dashboard UI fixed');
  } else {
    console.log('Dashboard container already exists');
  }
}
`;

// Save dashboard UI fix script
fs.writeFileSync(path.join(config.jsDir, 'dashboard-ui-fix.js'), dashboardUiFixScript);
console.log(`Saved dashboard UI fix script to ${path.join(config.jsDir, 'dashboard-ui-fix.js')}`);

// Copy files to Docker container
try {
  // Check if Docker container is running
  const containerRunning = execSync(`docker ps -q -f "name=${config.containerName}"`).toString().trim();
  
  if (containerRunning) {
    console.log(`Copying files to Docker container ${config.containerName}...`);
    
    // Create directories in container
    execSync(`docker exec ${config.containerName} mkdir -p /app/public/css /app/public/js /app/public/components`);
    
    // Copy CSS file
    execSync(`docker cp ${path.join(config.cssDir, 'dashboard.css')} ${config.containerName}:/app/public/css/dashboard.css`);
    
    // Copy JS files
    execSync(`docker cp ${path.join(config.jsDir, 'dashboard.js')} ${config.containerName}:/app/public/js/dashboard.js`);
    execSync(`docker cp ${path.join(config.jsDir, 'dashboard-ui-fix.js')} ${config.containerName}:/app/public/js/dashboard-ui-fix.js`);
    
    // Copy HTML component
    execSync(`docker cp ${path.join(config.componentsDir, 'dashboard.html')} ${config.containerName}:/app/public/components/dashboard.html`);
    
    console.log('Files copied to Docker container');
    
    // Update index.html to include dashboard CSS and JS
    console.log('Updating index.html in Docker container...');
    
    // Create a script to modify index.html
    const updateScript = `
    #!/bin/sh
    INDEX_FILE="/app/public/index.html"
    
    if [ -f "$INDEX_FILE" ]; then
      # Check if dashboard CSS is already included
      if ! grep -q "dashboard.css" "$INDEX_FILE"; then
        # Add dashboard CSS before </head>
        sed -i 's|</head>|  <link rel="stylesheet" href="/css/dashboard.css">\\n</head>|' "$INDEX_FILE"
        echo "Added dashboard CSS to index.html"
      fi
      
      # Check if dashboard JS is already included
      if ! grep -q "dashboard.js" "$INDEX_FILE"; then
        # Add dashboard JS before </body>
        sed -i 's|</body>|  <script src="/js/dashboard.js"></script>\\n</body>|' "$INDEX_FILE"
        echo "Added dashboard JS to index.html"
      fi
      
      # Check if dashboard UI fix JS is already included
      if ! grep -q "dashboard-ui-fix.js" "$INDEX_FILE"; then
        # Add dashboard UI fix JS before </body>
        sed -i 's|</body>|  <script src="/js/dashboard-ui-fix.js"></script>\\n</body>|' "$INDEX_FILE"
        echo "Added dashboard UI fix JS to index.html"
      fi
    else
      echo "index.html not found at $INDEX_FILE"
    fi
    `;
    
    // Write the script to a temporary file
    const tempScriptPath = path.join(__dirname, 'temp-update-script.sh');
    fs.writeFileSync(tempScriptPath, updateScript);
    
    // Copy the script to the container
    execSync(`docker cp ${tempScriptPath} ${config.containerName}:/tmp/update-script.sh`);
    
    // Make the script executable and run it
    execSync(`docker exec ${config.containerName} chmod +x /tmp/update-script.sh`);
    execSync(`docker exec ${config.containerName} /bin/sh /tmp/update-script.sh`);
    
    // Clean up
    fs.unlinkSync(tempScriptPath);
    
    console.log('index.html updated in Docker container');
    
    // Restart the container
    console.log('Restarting Docker container...');
    execSync(`docker restart ${config.containerName}`);
    
    console.log('Docker container restarted');
  } else {
    console.log(`Docker container ${config.containerName} is not running`);
  }
} catch (error) {
  console.error(`Error working with Docker container: ${error.message}`);
}

console.log('Dashboard UI components implementation completed');
