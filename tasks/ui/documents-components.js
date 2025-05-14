/**
 * Documents Page UI Components Implementation
 * This script implements the documents page UI components
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

// Documents CSS
const documentsCss = `
/* Documents Page Styles */
.documents-container {
  padding: 20px;
}

.documents-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.documents-header h1 {
  font-size: 24px;
  margin: 0;
}

.documents-actions {
  display: flex;
  gap: 10px;
}

.documents-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  margin-bottom: 20px;
  padding: 15px;
  background-color: #f8f9fa;
  border-radius: 8px;
}

.filter-group {
  display: flex;
  flex-direction: column;
}

.filter-group label {
  font-size: 14px;
  margin-bottom: 5px;
  color: #666;
}

.filter-group select,
.filter-group input {
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  min-width: 150px;
}

.filter-buttons {
  display: flex;
  align-items: flex-end;
  gap: 10px;
}

#document-list {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  overflow: hidden;
}

.document-list-header {
  display: grid;
  grid-template-columns: 3fr 1fr 1fr 1fr;
  padding: 15px;
  background-color: #f8f9fa;
  border-bottom: 1px solid #eee;
  font-weight: bold;
}

.document-item {
  display: grid;
  grid-template-columns: 3fr 1fr 1fr 1fr;
  padding: 15px;
  border-bottom: 1px solid #eee;
  align-items: center;
  transition: background-color 0.2s ease;
}

.document-item:hover {
  background-color: #f8f9fa;
}

.document-item:last-child {
  border-bottom: none;
}

.document-title {
  font-weight: bold;
  color: #2196F3;
  cursor: pointer;
}

.document-date,
.document-type {
  color: #666;
}

.document-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}

.document-actions button {
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.btn-view {
  background-color: #2196F3;
  color: white;
}

.btn-process {
  background-color: #4CAF50;
  color: white;
}

.btn-delete {
  background-color: #F44336;
  color: white;
}

.pagination {
  display: flex;
  justify-content: center;
  margin-top: 20px;
  gap: 5px;
}

.pagination button {
  padding: 8px 12px;
  border: 1px solid #ddd;
  background-color: white;
  border-radius: 4px;
  cursor: pointer;
}

.pagination button.active {
  background-color: #2196F3;
  color: white;
  border-color: #2196F3;
}

.pagination button:hover:not(.active) {
  background-color: #f8f9fa;
}

.empty-state {
  padding: 40px;
  text-align: center;
  color: #666;
}

.empty-state h3 {
  margin-top: 0;
  margin-bottom: 10px;
}

.empty-state p {
  margin-bottom: 20px;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .document-list-header {
    display: none;
  }
  
  .document-item {
    grid-template-columns: 1fr;
    gap: 10px;
    padding: 15px;
  }
  
  .document-actions {
    justify-content: flex-start;
  }
}
`;

// Documents JavaScript
const documentsJs = `
/**
 * Documents Page Functionality
 */
document.addEventListener('DOMContentLoaded', function() {
  console.log('Documents script loaded');
  
  // Only run on documents page
  if (window.location.pathname.includes('documents-new')) {
    initDocumentsPage();
  }
});

// Initialize documents page
function initDocumentsPage() {
  // Check if documents container exists
  const documentsContainer = document.querySelector('.documents-container');
  if (!documentsContainer) {
    console.log('Creating documents container');
    createDocumentsPage();
  }
  
  // Add event listeners
  addDocumentsEventListeners();
}

// Create documents page
function createDocumentsPage() {
  const mainContent = document.querySelector('main') || document.querySelector('.content') || document.body;
  
  // Create documents container
  const documentsContainer = document.createElement('div');
  documentsContainer.className = 'documents-container';
  
  // Add documents content
  documentsContainer.innerHTML = \`
    <div class="documents-header">
      <h1>My Documents</h1>
      <div class="documents-actions">
        <button class="btn btn-primary" onclick="window.location.href='/upload'">Upload New</button>
      </div>
    </div>
    
    <div class="documents-filters">
      <div class="filter-group">
        <label for="filter-type">Document Type</label>
        <select id="filter-type">
          <option value="">All Types</option>
          <option value="pdf">PDF</option>
          <option value="csv">CSV</option>
          <option value="xlsx">Excel</option>
        </select>
      </div>
      
      <div class="filter-group">
        <label for="filter-date">Date Range</label>
        <select id="filter-date">
          <option value="">All Time</option>
          <option value="today">Today</option>
          <option value="week">This Week</option>
          <option value="month">This Month</option>
          <option value="year">This Year</option>
        </select>
      </div>
      
      <div class="filter-group">
        <label for="filter-search">Search</label>
        <input type="text" id="filter-search" placeholder="Search documents...">
      </div>
      
      <div class="filter-buttons">
        <button class="btn btn-primary" id="apply-filters">Apply Filters</button>
        <button class="btn btn-secondary" id="reset-filters">Reset</button>
      </div>
    </div>
    
    <div id="document-list">
      <div class="document-list-header">
        <div>Document</div>
        <div>Type</div>
        <div>Date</div>
        <div>Actions</div>
      </div>
      
      <div class="document-item">
        <div class="document-title" data-id="1">Financial Report Q1 2023</div>
        <div class="document-type">PDF</div>
        <div class="document-date">2023-04-15</div>
        <div class="document-actions">
          <button class="btn-view" onclick="viewDocument(1)">View</button>
          <button class="btn-process" onclick="processDocument(1)">Process</button>
          <button class="btn-delete" onclick="deleteDocument(1)">Delete</button>
        </div>
      </div>
      
      <div class="document-item">
        <div class="document-title" data-id="2">Investment Portfolio Analysis</div>
        <div class="document-type">Excel</div>
        <div class="document-date">2023-03-22</div>
        <div class="document-actions">
          <button class="btn-view" onclick="viewDocument(2)">View</button>
          <button class="btn-process" onclick="processDocument(2)">Process</button>
          <button class="btn-delete" onclick="deleteDocument(2)">Delete</button>
        </div>
      </div>
      
      <div class="document-item">
        <div class="document-title" data-id="3">Market Research Report</div>
        <div class="document-type">PDF</div>
        <div class="document-date">2023-02-10</div>
        <div class="document-actions">
          <button class="btn-view" onclick="viewDocument(3)">View</button>
          <button class="btn-process" onclick="processDocument(3)">Process</button>
          <button class="btn-delete" onclick="deleteDocument(3)">Delete</button>
        </div>
      </div>
    </div>
    
    <div class="pagination">
      <button>1</button>
      <button>2</button>
      <button>3</button>
      <button>Next</button>
    </div>
  \`;
  
  // Add to page
  mainContent.appendChild(documentsContainer);
  console.log('Documents page created');
  
  // Add global functions
  window.viewDocument = function(id) {
    window.location.href = \`/document-details?id=\${id}\`;
  };
  
  window.processDocument = function(id) {
    alert(\`Processing document \${id}...\`);
    // Simulate processing
    const button = document.querySelector(\`.document-item:nth-child(\${id + 1}) .btn-process\`);
    if (button) {
      button.disabled = true;
      button.textContent = 'Processing...';
      
      setTimeout(() => {
        button.disabled = false;
        button.textContent = 'Processed';
        button.style.backgroundColor = '#8BC34A';
      }, 2000);
    }
  };
  
  window.deleteDocument = function(id) {
    if (confirm('Are you sure you want to delete this document?')) {
      // Remove from UI
      const item = document.querySelector(\`.document-item:nth-child(\${id + 1})\`);
      if (item) {
        item.remove();
      }
    }
  };
}

// Add event listeners
function addDocumentsEventListeners() {
  // Apply filters
  const applyFiltersButton = document.getElementById('apply-filters');
  if (applyFiltersButton) {
    applyFiltersButton.addEventListener('click', function() {
      const typeFilter = document.getElementById('filter-type').value;
      const dateFilter = document.getElementById('filter-date').value;
      const searchFilter = document.getElementById('filter-search').value;
      
      alert(\`Applying filters: Type=\${typeFilter}, Date=\${dateFilter}, Search=\${searchFilter}\`);
    });
  }
  
  // Reset filters
  const resetFiltersButton = document.getElementById('reset-filters');
  if (resetFiltersButton) {
    resetFiltersButton.addEventListener('click', function() {
      document.getElementById('filter-type').value = '';
      document.getElementById('filter-date').value = '';
      document.getElementById('filter-search').value = '';
    });
  }
  
  // Document title click
  document.querySelectorAll('.document-title').forEach(title => {
    title.addEventListener('click', function() {
      const documentId = this.getAttribute('data-id');
      if (documentId) {
        window.location.href = \`/document-details?id=\${documentId}\`;
      }
    });
  });
  
  // Pagination
  document.querySelectorAll('.pagination button').forEach(button => {
    button.addEventListener('click', function() {
      document.querySelectorAll('.pagination button').forEach(btn => {
        btn.classList.remove('active');
      });
      this.classList.add('active');
    });
  });
}
`;

// Documents HTML Component
const documentsHtml = `
<div class="documents-container">
  <div class="documents-header">
    <h1>My Documents</h1>
    <div class="documents-actions">
      <button class="btn btn-primary" onclick="window.location.href='/upload'">Upload New</button>
    </div>
  </div>
  
  <div class="documents-filters">
    <div class="filter-group">
      <label for="filter-type">Document Type</label>
      <select id="filter-type">
        <option value="">All Types</option>
        <option value="pdf">PDF</option>
        <option value="csv">CSV</option>
        <option value="xlsx">Excel</option>
      </select>
    </div>
    
    <div class="filter-group">
      <label for="filter-date">Date Range</label>
      <select id="filter-date">
        <option value="">All Time</option>
        <option value="today">Today</option>
        <option value="week">This Week</option>
        <option value="month">This Month</option>
        <option value="year">This Year</option>
      </select>
    </div>
    
    <div class="filter-group">
      <label for="filter-search">Search</label>
      <input type="text" id="filter-search" placeholder="Search documents...">
    </div>
    
    <div class="filter-buttons">
      <button class="btn btn-primary" id="apply-filters">Apply Filters</button>
      <button class="btn btn-secondary" id="reset-filters">Reset</button>
    </div>
  </div>
  
  <div id="document-list">
    <div class="document-list-header">
      <div>Document</div>
      <div>Type</div>
      <div>Date</div>
      <div>Actions</div>
    </div>
    
    <div class="document-item">
      <div class="document-title" data-id="1">Financial Report Q1 2023</div>
      <div class="document-type">PDF</div>
      <div class="document-date">2023-04-15</div>
      <div class="document-actions">
        <button class="btn-view" onclick="viewDocument(1)">View</button>
        <button class="btn-process" onclick="processDocument(1)">Process</button>
        <button class="btn-delete" onclick="deleteDocument(1)">Delete</button>
      </div>
    </div>
    
    <div class="document-item">
      <div class="document-title" data-id="2">Investment Portfolio Analysis</div>
      <div class="document-type">Excel</div>
      <div class="document-date">2023-03-22</div>
      <div class="document-actions">
        <button class="btn-view" onclick="viewDocument(2)">View</button>
        <button class="btn-process" onclick="processDocument(2)">Process</button>
        <button class="btn-delete" onclick="deleteDocument(2)">Delete</button>
      </div>
    </div>
    
    <div class="document-item">
      <div class="document-title" data-id="3">Market Research Report</div>
      <div class="document-type">PDF</div>
      <div class="document-date">2023-02-10</div>
      <div class="document-actions">
        <button class="btn-view" onclick="viewDocument(3)">View</button>
        <button class="btn-process" onclick="processDocument(3)">Process</button>
        <button class="btn-delete" onclick="deleteDocument(3)">Delete</button>
      </div>
    </div>
  </div>
  
  <div class="pagination">
    <button class="active">1</button>
    <button>2</button>
    <button>3</button>
    <button>Next</button>
  </div>
</div>
`;

// Documents UI Fix Script
const documentsUiFixScript = `
/**
 * Documents UI Fix
 * This script adds documents UI components if they're missing
 */
document.addEventListener('DOMContentLoaded', function() {
  console.log('Documents UI Fix running...');
  
  // Only run on documents page
  if (window.location.pathname.includes('documents-new')) {
    fixDocumentsUI();
  }
});

// Fix documents UI
function fixDocumentsUI() {
  // Check if documents container exists
  if (!document.querySelector('.documents-container')) {
    console.log('Documents container not found, adding it...');
    
    // Get main content area
    const mainContent = document.querySelector('main') || document.querySelector('.content') || document.body;
    
    // Create documents container
    const documentsContainer = document.createElement('div');
    documentsContainer.className = 'documents-container';
    
    // Add documents content
    documentsContainer.innerHTML = \`
      <div class="documents-header">
        <h1>My Documents</h1>
        <div class="documents-actions">
          <button class="btn btn-primary" onclick="window.location.href='/upload'">Upload New</button>
        </div>
      </div>
      
      <div class="documents-filters">
        <div class="filter-group">
          <label for="filter-type">Document Type</label>
          <select id="filter-type">
            <option value="">All Types</option>
            <option value="pdf">PDF</option>
            <option value="csv">CSV</option>
            <option value="xlsx">Excel</option>
          </select>
        </div>
        
        <div class="filter-group">
          <label for="filter-date">Date Range</label>
          <select id="filter-date">
            <option value="">All Time</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="year">This Year</option>
          </select>
        </div>
        
        <div class="filter-group">
          <label for="filter-search">Search</label>
          <input type="text" id="filter-search" placeholder="Search documents...">
        </div>
        
        <div class="filter-buttons">
          <button class="btn btn-primary" id="apply-filters">Apply Filters</button>
          <button class="btn btn-secondary" id="reset-filters">Reset</button>
        </div>
      </div>
      
      <div id="document-list">
        <div class="document-list-header">
          <div>Document</div>
          <div>Type</div>
          <div>Date</div>
          <div>Actions</div>
        </div>
        
        <div class="document-item">
          <div class="document-title" data-id="1">Financial Report Q1 2023</div>
          <div class="document-type">PDF</div>
          <div class="document-date">2023-04-15</div>
          <div class="document-actions">
            <button class="btn-view" onclick="viewDocument(1)">View</button>
            <button class="btn-process" onclick="processDocument(1)">Process</button>
            <button class="btn-delete" onclick="deleteDocument(1)">Delete</button>
          </div>
        </div>
        
        <div class="document-item">
          <div class="document-title" data-id="2">Investment Portfolio Analysis</div>
          <div class="document-type">Excel</div>
          <div class="document-date">2023-03-22</div>
          <div class="document-actions">
            <button class="btn-view" onclick="viewDocument(2)">View</button>
            <button class="btn-process" onclick="processDocument(2)">Process</button>
            <button class="btn-delete" onclick="deleteDocument(2)">Delete</button>
          </div>
        </div>
        
        <div class="document-item">
          <div class="document-title" data-id="3">Market Research Report</div>
          <div class="document-type">PDF</div>
          <div class="document-date">2023-02-10</div>
          <div class="document-actions">
            <button class="btn-view" onclick="viewDocument(3)">View</button>
            <button class="btn-process" onclick="processDocument(3)">Process</button>
            <button class="btn-delete" onclick="deleteDocument(3)">Delete</button>
          </div>
        </div>
      </div>
      
      <div class="pagination">
        <button class="active">1</button>
        <button>2</button>
        <button>3</button>
        <button>Next</button>
      </div>
    \`;
    
    // Add to page
    mainContent.appendChild(documentsContainer);
    
    // Add documents styles if not already added
    if (!document.querySelector('link[href*="documents.css"]')) {
      const documentsStyles = document.createElement('link');
      documentsStyles.rel = 'stylesheet';
      documentsStyles.href = '/css/documents.css';
      document.head.appendChild(documentsStyles);
    }
    
    // Add global functions
    window.viewDocument = function(id) {
      window.location.href = \`/document-details?id=\${id}\`;
    };
    
    window.processDocument = function(id) {
      alert(\`Processing document \${id}...\`);
      // Simulate processing
      const button = document.querySelector(\`.document-item:nth-child(\${id + 1}) .btn-process\`);
      if (button) {
        button.disabled = true;
        button.textContent = 'Processing...';
        
        setTimeout(() => {
          button.disabled = false;
          button.textContent = 'Processed';
          button.style.backgroundColor = '#8BC34A';
        }, 2000);
      }
    };
    
    window.deleteDocument = function(id) {
      if (confirm('Are you sure you want to delete this document?')) {
        // Remove from UI
        const item = document.querySelector(\`.document-item:nth-child(\${id + 1})\`);
        if (item) {
          item.remove();
        }
      }
    };
    
    // Add event listeners
    document.getElementById('apply-filters').addEventListener('click', function() {
      const typeFilter = document.getElementById('filter-type').value;
      const dateFilter = document.getElementById('filter-date').value;
      const searchFilter = document.getElementById('filter-search').value;
      
      alert(\`Applying filters: Type=\${typeFilter}, Date=\${dateFilter}, Search=\${searchFilter}\`);
    });
    
    document.getElementById('reset-filters').addEventListener('click', function() {
      document.getElementById('filter-type').value = '';
      document.getElementById('filter-date').value = '';
      document.getElementById('filter-search').value = '';
    });
    
    document.querySelectorAll('.document-title').forEach(title => {
      title.addEventListener('click', function() {
        const documentId = this.getAttribute('data-id');
        if (documentId) {
          window.location.href = \`/document-details?id=\${documentId}\`;
        }
      });
    });
    
    document.querySelectorAll('.pagination button').forEach(button => {
      button.addEventListener('click', function() {
        document.querySelectorAll('.pagination button').forEach(btn => {
          btn.classList.remove('active');
        });
        this.classList.add('active');
      });
    });
    
    console.log('Documents UI fixed');
  } else {
    console.log('Documents container already exists');
  }
}
`;

// Save documents CSS
fs.writeFileSync(path.join(config.cssDir, 'documents.css'), documentsCss);
console.log(`Saved documents CSS to ${path.join(config.cssDir, 'documents.css')}`);

// Save documents JavaScript
fs.writeFileSync(path.join(config.jsDir, 'documents.js'), documentsJs);
console.log(`Saved documents JavaScript to ${path.join(config.jsDir, 'documents.js')}`);

// Save documents HTML component
fs.writeFileSync(path.join(config.componentsDir, 'documents.html'), documentsHtml);
console.log(`Saved documents HTML component to ${path.join(config.componentsDir, 'documents.html')}`);

// Save documents UI fix script
fs.writeFileSync(path.join(config.jsDir, 'documents-ui-fix.js'), documentsUiFixScript);
console.log(`Saved documents UI fix script to ${path.join(config.jsDir, 'documents-ui-fix.js')}`);

// Copy files to Docker container
try {
  // Check if Docker container is running
  const containerRunning = execSync(`docker ps -q -f "name=${config.containerName}"`).toString().trim();
  
  if (containerRunning) {
    console.log(`Copying files to Docker container ${config.containerName}...`);
    
    // Create directories in container
    execSync(`docker exec ${config.containerName} mkdir -p /app/public/css /app/public/js /app/public/components`);
    
    // Copy CSS file
    execSync(`docker cp ${path.join(config.cssDir, 'documents.css')} ${config.containerName}:/app/public/css/documents.css`);
    
    // Copy JS files
    execSync(`docker cp ${path.join(config.jsDir, 'documents.js')} ${config.containerName}:/app/public/js/documents.js`);
    execSync(`docker cp ${path.join(config.jsDir, 'documents-ui-fix.js')} ${config.containerName}:/app/public/js/documents-ui-fix.js`);
    
    // Copy HTML component
    execSync(`docker cp ${path.join(config.componentsDir, 'documents.html')} ${config.containerName}:/app/public/components/documents.html`);
    
    console.log('Files copied to Docker container');
    
    // Update documents-new.html to include documents CSS and JS
    console.log('Updating documents-new.html in Docker container...');
    
    // Create a script to modify documents-new.html
    const updateScript = `
    #!/bin/sh
    DOCUMENTS_FILE="/app/public/documents-new.html"
    
    if [ -f "$DOCUMENTS_FILE" ]; then
      # Check if documents CSS is already included
      if ! grep -q "documents.css" "$DOCUMENTS_FILE"; then
        # Add documents CSS before </head>
        sed -i 's|</head>|  <link rel="stylesheet" href="/css/documents.css">\\n</head>|' "$DOCUMENTS_FILE"
        echo "Added documents CSS to documents-new.html"
      fi
      
      # Check if documents JS is already included
      if ! grep -q "documents.js" "$DOCUMENTS_FILE"; then
        # Add documents JS before </body>
        sed -i 's|</body>|  <script src="/js/documents.js"></script>\\n</body>|' "$DOCUMENTS_FILE"
        echo "Added documents JS to documents-new.html"
      fi
      
      # Check if documents UI fix JS is already included
      if ! grep -q "documents-ui-fix.js" "$DOCUMENTS_FILE"; then
        # Add documents UI fix JS before </body>
        sed -i 's|</body>|  <script src="/js/documents-ui-fix.js"></script>\\n</body>|' "$DOCUMENTS_FILE"
        echo "Added documents UI fix JS to documents-new.html"
      fi
    else
      echo "documents-new.html not found at $DOCUMENTS_FILE"
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
    
    console.log('documents-new.html updated in Docker container');
    
  } else {
    console.log(`Docker container ${config.containerName} is not running`);
  }
} catch (error) {
  console.error(`Error working with Docker container: ${error.message}`);
}

console.log('Documents UI components implementation completed');
