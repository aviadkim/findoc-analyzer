/**
 * Document List Component
 * Adds a document list to the Documents page
 */

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  console.log('Document List Component initializing...');
  
  // Add document list if on Documents page
  if (window.location.pathname.includes('/documents') || window.location.pathname.includes('/documents-new')) {
    addDocumentList();
  }
  
  console.log('Document List Component initialized');
});

/**
 * Add document list to page
 */
function addDocumentList() {
  // Check if document list already exists
  if (document.querySelector('.document-list')) {
    return;
  }
  
  // Create container for document list
  const documentListContainer = document.createElement('div');
  documentListContainer.className = 'document-list-container';
  documentListContainer.style.margin = '20px 0';
  
  // Create document list header
  const documentListHeader = document.createElement('div');
  documentListHeader.className = 'document-list-header';
  documentListHeader.style.display = 'flex';
  documentListHeader.style.justifyContent = 'space-between';
  documentListHeader.style.alignItems = 'center';
  documentListHeader.style.marginBottom = '20px';
  
  const documentListTitle = document.createElement('h2');
  documentListTitle.textContent = 'My Documents';
  documentListTitle.style.margin = '0';
  
  const documentListActions = document.createElement('div');
  documentListActions.className = 'document-list-actions';
  
  const refreshButton = document.createElement('button');
  refreshButton.className = 'btn btn-secondary';
  refreshButton.textContent = 'Refresh';
  refreshButton.style.marginRight = '10px';
  
  const uploadButton = document.createElement('button');
  uploadButton.className = 'btn btn-primary';
  uploadButton.textContent = 'Upload New';
  
  refreshButton.addEventListener('click', function() {
    loadDocuments();
  });
  
  uploadButton.addEventListener('click', function() {
    window.location.href = '/upload';
  });
  
  documentListActions.appendChild(refreshButton);
  documentListActions.appendChild(uploadButton);
  
  documentListHeader.appendChild(documentListTitle);
  documentListHeader.appendChild(documentListActions);
  
  // Create document list
  const documentList = document.createElement('div');
  documentList.className = 'document-list';
  documentList.style.border = '1px solid #ddd';
  documentList.style.borderRadius = '5px';
  documentList.style.overflow = 'hidden';
  
  // Create document list filters
  const documentListFilters = document.createElement('div');
  documentListFilters.className = 'document-list-filters';
  documentListFilters.style.display = 'flex';
  documentListFilters.style.justifyContent = 'space-between';
  documentListFilters.style.alignItems = 'center';
  documentListFilters.style.padding = '10px';
  documentListFilters.style.backgroundColor = '#f5f5f5';
  documentListFilters.style.borderBottom = '1px solid #ddd';
  
  const searchInput = document.createElement('input');
  searchInput.type = 'text';
  searchInput.placeholder = 'Search documents...';
  searchInput.style.padding = '5px 10px';
  searchInput.style.border = '1px solid #ddd';
  searchInput.style.borderRadius = '3px';
  searchInput.style.width = '250px';
  
  const filterSelect = document.createElement('select');
  filterSelect.style.padding = '5px 10px';
  filterSelect.style.border = '1px solid #ddd';
  filterSelect.style.borderRadius = '3px';
  
  const filterOptions = [
    { value: 'all', text: 'All Documents' },
    { value: 'pdf', text: 'PDF Documents' },
    { value: 'excel', text: 'Excel Documents' },
    { value: 'csv', text: 'CSV Documents' }
  ];
  
  filterOptions.forEach(option => {
    const optionElement = document.createElement('option');
    optionElement.value = option.value;
    optionElement.textContent = option.text;
    filterSelect.appendChild(optionElement);
  });
  
  documentListFilters.appendChild(searchInput);
  documentListFilters.appendChild(filterSelect);
  
  // Create document list table
  const documentListTable = document.createElement('table');
  documentListTable.style.width = '100%';
  documentListTable.style.borderCollapse = 'collapse';
  
  const tableHead = document.createElement('thead');
  tableHead.style.backgroundColor = '#f5f5f5';
  tableHead.style.borderBottom = '2px solid #ddd';
  
  const tableHeadRow = document.createElement('tr');
  
  const tableHeaders = [
    { text: 'Name', width: '30%' },
    { text: 'Type', width: '15%' },
    { text: 'Size', width: '15%' },
    { text: 'Uploaded', width: '20%' },
    { text: 'Actions', width: '20%' }
  ];
  
  tableHeaders.forEach(header => {
    const th = document.createElement('th');
    th.textContent = header.text;
    th.style.padding = '10px';
    th.style.textAlign = 'left';
    th.style.width = header.width;
    tableHeadRow.appendChild(th);
  });
  
  tableHead.appendChild(tableHeadRow);
  
  const tableBody = document.createElement('tbody');
  tableBody.id = 'document-list-body';
  
  documentListTable.appendChild(tableHead);
  documentListTable.appendChild(tableBody);
  
  // Create document list empty state
  const emptyState = document.createElement('div');
  emptyState.id = 'document-list-empty';
  emptyState.style.padding = '50px 20px';
  emptyState.style.textAlign = 'center';
  emptyState.style.display = 'none';
  
  const emptyStateIcon = document.createElement('div');
  emptyStateIcon.innerHTML = '📄';
  emptyStateIcon.style.fontSize = '48px';
  emptyStateIcon.style.marginBottom = '20px';
  
  const emptyStateTitle = document.createElement('h3');
  emptyStateTitle.textContent = 'No Documents Found';
  emptyStateTitle.style.marginBottom = '10px';
  
  const emptyStateText = document.createElement('p');
  emptyStateText.textContent = 'Upload a document to get started.';
  emptyStateText.style.marginBottom = '20px';
  
  const emptyStateButton = document.createElement('button');
  emptyStateButton.className = 'btn btn-primary';
  emptyStateButton.textContent = 'Upload Document';
  emptyStateButton.addEventListener('click', function() {
    window.location.href = '/upload';
  });
  
  emptyState.appendChild(emptyStateIcon);
  emptyState.appendChild(emptyStateTitle);
  emptyState.appendChild(emptyStateText);
  emptyState.appendChild(emptyStateButton);
  
  // Create document list loading state
  const loadingState = document.createElement('div');
  loadingState.id = 'document-list-loading';
  loadingState.style.padding = '50px 20px';
  loadingState.style.textAlign = 'center';
  
  const loadingSpinner = document.createElement('div');
  loadingSpinner.className = 'loading-spinner';
  loadingSpinner.style.display = 'inline-block';
  loadingSpinner.style.width = '40px';
  loadingSpinner.style.height = '40px';
  loadingSpinner.style.border = '4px solid #f3f3f3';
  loadingSpinner.style.borderTop = '4px solid #3498db';
  loadingSpinner.style.borderRadius = '50%';
  loadingSpinner.style.animation = 'spin 1s linear infinite';
  
  const loadingText = document.createElement('p');
  loadingText.textContent = 'Loading documents...';
  loadingText.style.marginTop = '20px';
  
  loadingState.appendChild(loadingSpinner);
  loadingState.appendChild(loadingText);
  
  // Add loading animation
  const style = document.createElement('style');
  style.textContent = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(style);
  
  // Add elements to document list
  documentList.appendChild(documentListFilters);
  documentList.appendChild(documentListTable);
  documentList.appendChild(emptyState);
  documentList.appendChild(loadingState);
  
  // Add elements to document list container
  documentListContainer.appendChild(documentListHeader);
  documentListContainer.appendChild(documentList);
  
  // Find a good place to insert the document list
  const main = document.querySelector('main') || document.querySelector('.main-content');
  if (main) {
    // Check if there's a welcome message
    const welcomeMessage = main.querySelector('h1');
    if (welcomeMessage) {
      // Insert after the welcome message
      welcomeMessage.parentNode.insertBefore(documentListContainer, welcomeMessage.nextSibling);
    } else {
      // Insert at the beginning of main
      main.insertBefore(documentListContainer, main.firstChild);
    }
  } else {
    // Insert in the body
    document.body.appendChild(documentListContainer);
  }
  
  console.log('Document list added successfully!');
  
  // Load documents
  loadDocuments();
}

/**
 * Load documents
 */
function loadDocuments() {
  // Show loading state
  document.getElementById('document-list-loading').style.display = 'block';
  document.getElementById('document-list-empty').style.display = 'none';
  document.getElementById('document-list-body').innerHTML = '';
  
  // Simulate loading delay
  setTimeout(function() {
    // Hide loading state
    document.getElementById('document-list-loading').style.display = 'none';
    
    // Get mock documents
    const documents = getMockDocuments();
    
    if (documents.length === 0) {
      // Show empty state
      document.getElementById('document-list-empty').style.display = 'block';
    } else {
      // Add documents to table
      const tableBody = document.getElementById('document-list-body');
      
      documents.forEach(doc => {
        const row = document.createElement('tr');
        row.className = 'document-item';
        row.style.borderBottom = '1px solid #ddd';
        
        // Document name
        const nameCell = document.createElement('td');
        nameCell.style.padding = '10px';
        
        const nameLink = document.createElement('a');
        nameLink.href = `/document-details.html?id=${doc.id}`;
        nameLink.textContent = doc.name;
        nameLink.style.color = '#007bff';
        nameLink.style.textDecoration = 'none';
        
        nameCell.appendChild(nameLink);
        
        // Document type
        const typeCell = document.createElement('td');
        typeCell.textContent = doc.type;
        typeCell.style.padding = '10px';
        
        // Document size
        const sizeCell = document.createElement('td');
        sizeCell.textContent = doc.size;
        sizeCell.style.padding = '10px';
        
        // Document uploaded date
        const uploadedCell = document.createElement('td');
        uploadedCell.textContent = doc.uploaded;
        uploadedCell.style.padding = '10px';
        
        // Document actions
        const actionsCell = document.createElement('td');
        actionsCell.style.padding = '10px';
        actionsCell.className = 'document-actions';
        
        const viewButton = document.createElement('button');
        viewButton.className = 'btn btn-sm btn-primary';
        viewButton.textContent = 'View';
        viewButton.style.marginRight = '5px';
        viewButton.addEventListener('click', function() {
          window.location.href = `/document-details.html?id=${doc.id}`;
        });
        
        const deleteButton = document.createElement('button');
        deleteButton.className = 'btn btn-sm btn-danger';
        deleteButton.textContent = 'Delete';
        deleteButton.addEventListener('click', function() {
          if (confirm(`Are you sure you want to delete ${doc.name}?`)) {
            // Simulate delete
            row.remove();
            
            // Check if table is empty
            if (tableBody.children.length === 0) {
              document.getElementById('document-list-empty').style.display = 'block';
            }
          }
        });
        
        actionsCell.appendChild(viewButton);
        actionsCell.appendChild(deleteButton);
        
        // Add cells to row
        row.appendChild(nameCell);
        row.appendChild(typeCell);
        row.appendChild(sizeCell);
        row.appendChild(uploadedCell);
        row.appendChild(actionsCell);
        
        // Add row to table
        tableBody.appendChild(row);
      });
    }
  }, 1000);
}

/**
 * Get mock documents
 * @returns {Array} Mock documents
 */
function getMockDocuments() {
  return [
    {
      id: 'doc-1',
      name: 'Annual Report 2023.pdf',
      type: 'PDF',
      size: '2.5 MB',
      uploaded: '2023-05-01'
    },
    {
      id: 'doc-2',
      name: 'Financial Statement Q1 2023.xlsx',
      type: 'Excel',
      size: '1.2 MB',
      uploaded: '2023-04-15'
    },
    {
      id: 'doc-3',
      name: 'Portfolio Holdings.csv',
      type: 'CSV',
      size: '0.8 MB',
      uploaded: '2023-03-22'
    },
    {
      id: 'doc-4',
      name: 'Investment Summary.pdf',
      type: 'PDF',
      size: '1.5 MB',
      uploaded: '2023-03-10'
    },
    {
      id: 'doc-5',
      name: 'Market Analysis.pdf',
      type: 'PDF',
      size: '3.2 MB',
      uploaded: '2023-02-28'
    }
  ];
}
