
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
  documentsContainer.innerHTML = `
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
  `;
  
  // Add to page
  mainContent.appendChild(documentsContainer);
  console.log('Documents page created');
  
  // Add global functions
  window.viewDocument = function(id) {
    window.location.href = `/document-details?id=${id}`;
  };
  
  window.processDocument = function(id) {
    alert(`Processing document ${id}...`);
    // Simulate processing
    const button = document.querySelector(`.document-item:nth-child(${id + 1}) .btn-process`);
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
      const item = document.querySelector(`.document-item:nth-child(${id + 1})`);
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
      
      alert(`Applying filters: Type=${typeFilter}, Date=${dateFilter}, Search=${searchFilter}`);
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
        window.location.href = `/document-details?id=${documentId}`;
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
