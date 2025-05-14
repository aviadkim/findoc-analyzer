/**
 * Enhanced UI Components for FinDoc Analyzer
 * 
 * This file contains modern, responsive UI components for the FinDoc Analyzer application.
 * It includes document cards, chat interface, analytics dashboard, and upload interface.
 */

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
  console.log('Enhanced UI Components initializing...');
  
  // Initialize all enhanced UI components
  initializeEnhancedUI();
});

/**
 * Initialize all enhanced UI components
 */
function initializeEnhancedUI() {
  // Add document cards if on documents page
  if (window.location.pathname.includes('documents-new')) {
    enhanceDocumentsPage();
  }
  
  // Add document detail components if on document detail page
  if (window.location.pathname.match(/\/documents-new\/\d+/)) {
    enhanceDocumentDetailPage();
  }
  
  // Add chat interface if on chat page
  if (window.location.pathname.includes('document-chat')) {
    enhanceChatInterface();
  }
  
  // Add analytics dashboard if on analytics page
  if (window.location.pathname.includes('analytics-new')) {
    enhanceAnalyticsPage();
  }
  
  // Add upload interface if on upload page
  if (window.location.pathname.includes('upload')) {
    enhanceUploadPage();
  }
  
  // Add navigation and footer to all pages
  enhanceNavigation();
  addFooter();
}

/**
 * Enhance the documents page with modern document cards
 */
function enhanceDocumentsPage() {
  console.log('Enhancing documents page...');
  
  const mainContent = document.querySelector('.main-content') || document.body;
  
  // Create filter and search section
  const filterSection = document.createElement('div');
  filterSection.className = 'filter-options';
  filterSection.innerHTML = `
    <div class="search-container">
      <input type="search" class="search-input" placeholder="Search documents...">
      <button class="search-btn">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
          <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/>
        </svg>
      </button>
    </div>
    <div class="filter-controls">
      <select class="filter-select">
        <option value="">All Types</option>
        <option value="pdf">PDF</option>
        <option value="excel">Excel</option>
        <option value="csv">CSV</option>
      </select>
      <div class="sort-options">
        <label>Sort by:</label>
        <select class="sort-select">
          <option value="date-desc">Date (Newest)</option>
          <option value="date-asc">Date (Oldest)</option>
          <option value="name-asc">Name (A-Z)</option>
          <option value="name-desc">Name (Z-A)</option>
        </select>
      </div>
    </div>
  `;
  
  // Create document list container
  const documentList = document.createElement('div');
  documentList.className = 'document-list';
  
  // Sample documents for demonstration
  const sampleDocuments = [
    { id: 1, title: 'Q1 Financial Report', date: '2025-03-15', type: 'pdf', status: 'processed' },
    { id: 2, title: 'Investment Portfolio', date: '2025-04-01', type: 'excel', status: 'processed' },
    { id: 3, title: 'Transaction History', date: '2025-04-10', type: 'csv', status: 'pending' },
    { id: 4, title: 'Asset Allocation', date: '2025-04-20', type: 'pdf', status: 'error' },
    { id: 5, title: 'Market Analysis', date: '2025-05-01', type: 'pdf', status: 'pending' },
    { id: 6, title: 'Budget Forecast', date: '2025-05-10', type: 'excel', status: 'processed' }
  ];
  
  // Add document cards to the list
  sampleDocuments.forEach(doc => {
    const card = createDocumentCard(doc);
    documentList.appendChild(card);
  });
  
  // Add to main content
  mainContent.innerHTML = ''; // Clear existing content
  mainContent.appendChild(document.createElement('h1')).textContent = 'Documents';
  mainContent.appendChild(filterSection);
  mainContent.appendChild(documentList);
}

/**
 * Create a modern document card
 * @param {Object} doc Document object with id, title, date, type, and status
 * @returns {HTMLElement} The document card element
 */
function createDocumentCard(doc) {
  const card = document.createElement('div');
  card.className = 'document-card';
  card.dataset.id = doc.id;
  
  // Get status class and icon
  let statusClass, statusIcon, statusText;
  switch (doc.status) {
    case 'processed':
      statusClass = 'status-processed';
      statusIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z"/></svg>';
      statusText = 'Processed';
      break;
    case 'pending':
      statusClass = 'status-pending';
      statusIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/><path d="M8 4a.5.5 0 0 1 .5.5v3.5a.5.5 0 0 1-.5.5H5.5a.5.5 0 0 1 0-1h2v-3A.5.5 0 0 1 8 4z"/></svg>';
      statusText = 'Pending';
      break;
    case 'error':
      statusClass = 'status-error';
      statusIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/><path d="M7.002 11a1 1 0 1 1 2 0 1 1 0 0 1-2 0zM7.1 4.995a.905.905 0 1 1 1.8 0l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 4.995z"/></svg>';
      statusText = 'Error';
      break;
  }
  
  // Get type icon
  let typeIcon;
  switch (doc.type) {
    case 'pdf':
      typeIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16"><path fill-rule="evenodd" d="M14 4.5V14a2 2 0 0 1-2 2h-1v-1h1a1 1 0 0 0 1-1V4.5h-2A1.5 1.5 0 0 1 9.5 3V1H4a1 1 0 0 0-1 1v9H2V2a2 2 0 0 1 2-2h5.5L14 4.5ZM1.6 11.85H0v3.999h.791v-1.342h.803c.287 0 .531-.057.732-.173.203-.117.358-.275.463-.474a1.42 1.42 0 0 0 .161-.677c0-.25-.053-.476-.158-.677a1.176 1.176 0 0 0-.46-.477c-.2-.12-.443-.179-.732-.179Zm.545 1.333a.795.795 0 0 1-.085.38.574.574 0 0 1-.238.241.794.794 0 0 1-.375.082H.788V12.48h.66c.218 0 .389.06.512.181.123.122.185.296.185.522Zm1.217-1.333v3.999h1.46c.401 0 .734-.08.998-.237a1.45 1.45 0 0 0 .595-.689c.13-.3.196-.662.196-1.084 0-.42-.065-.778-.196-1.075a1.426 1.426 0 0 0-.589-.68c-.264-.156-.599-.234-1.005-.234H3.362Zm.791.645h.563c.248 0 .45.05.609.152a.89.89 0 0 1 .354.454c.079.201.118.452.118.753a2.3 2.3 0 0 1-.068.592 1.14 1.14 0 0 1-.196.422.8.8 0 0 1-.334.252 1.298 1.298 0 0 1-.483.082h-.563v-2.707Zm3.743 1.763v1.591h-.79V11.85h2.548v.653H7.896v1.117h1.606v.638H7.896Z"/></svg>';
      break;
    case 'excel':
      typeIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16"><path fill-rule="evenodd" d="M14 4.5V14a2 2 0 0 1-2 2h-1v-1h1a1 1 0 0 0 1-1V4.5h-2A1.5 1.5 0 0 1 9.5 3V1H4a1 1 0 0 0-1 1v9H2V2a2 2 0 0 1 2-2h5.5L14 4.5ZM6.472 15.29a1.176 1.176 0 0 1-.111-.449h.765a.578.578 0 0 0 .254.384c.07.049.154.087.25.114.095.028.202.041.319.041.164 0 .302-.023.413-.07a.559.559 0 0 0 .255-.193.507.507 0 0 0 .085-.29.387.387 0 0 0-.153-.326c-.101-.08-.255-.144-.462-.193l-.619-.143a1.72 1.72 0 0 1-.539-.214 1.001 1.001 0 0 1-.351-.367 1.068 1.068 0 0 1-.123-.524c0-.244.063-.457.19-.639.127-.181.303-.322.527-.422.225-.1.484-.149.777-.149.305 0 .564.05.78.152.216.102.383.239.5.41.12.17.186.359.2.566h-.75a.56.56 0 0 0-.12-.258.624.624 0 0 0-.247-.181.923.923 0 0 0-.369-.068c-.217 0-.388.05-.513.152a.472.472 0 0 0-.184.384c0 .121.048.22.143.3a.97.97 0 0 0 .405.175l.62.143c.217.05.406.12.566.211.16.09.285.21.375.358.09.148.135.335.135.56 0 .247-.063.466-.188.656a1.216 1.216 0 0 1-.539.439c-.234.105-.52.158-.858.158-.254 0-.476-.03-.665-.09a1.404 1.404 0 0 1-.478-.252 1.13 1.13 0 0 1-.29-.375Zm-2.945-3.358h-.893L1.81 13.37h-.036l-.832-1.438h-.93l1.227 1.983L0 15.931h.861l.853-1.415h.035l.85 1.415h.908L2.253 13.94l1.274-2.007Zm2.727 3.325H4.557v-3.325h-.79v4h2.487v-.675Z"/></svg>';
      break;
    case 'csv':
      typeIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16"><path fill-rule="evenodd" d="M14 4.5V14a2 2 0 0 1-2 2h-1v-1h1a1 1 0 0 0 1-1V4.5h-2A1.5 1.5 0 0 1 9.5 3V1H4a1 1 0 0 0-1 1v9H2V2a2 2 0 0 1 2-2h5.5L14 4.5ZM3.517 14.841a1.13 1.13 0 0 0 .401.823c.13.108.289.192.478.252.19.061.411.091.665.091.338 0 .624-.053.859-.158.236-.105.416-.252.539-.44.125-.189.187-.408.187-.656 0-.224-.045-.41-.134-.56a1.001 1.001 0 0 0-.375-.357 2.027 2.027 0 0 0-.566-.21l-.621-.144a.97.97 0 0 1-.404-.176.37.37 0 0 1-.144-.299c0-.156.062-.284.185-.384.125-.101.296-.152.512-.152.143 0 .266.023.37.068a.624.624 0 0 1 .246.181.56.56 0 0 1 .12.258h.75a1.092 1.092 0 0 0-.2-.566 1.21 1.21 0 0 0-.5-.41 1.813 1.813 0 0 0-.78-.152c-.293 0-.551.05-.776.15-.225.099-.4.24-.527.421-.127.182-.19.395-.19.639 0 .201.04.376.122.524.082.149.2.27.352.367.152.095.332.167.539.213l.618.144c.207.049.361.113.463.193a.387.387 0 0 1 .152.326.505.505 0 0 1-.085.29.559.559 0 0 1-.255.193c-.111.047-.249.07-.413.07-.117 0-.223-.013-.32-.04a.838.838 0 0 1-.248-.115.578.578 0 0 1-.255-.384h-.765ZM0 14.791c0 .165.027.32.082.466.055.147.136.277.243.39.11.113.245.202.407.267.164.062.354.093.569.093.42 0 .748-.115.984-.346.238-.23.358-.565.358-1.004v-2.725h-.791v2.745c0 .201-.046.35-.138.449-.092.1-.233.149-.422.149-.147 0-.25-.031-.308-.094-.06-.063-.09-.162-.09-.296v-2.953h-.79v2.859Zm2.06-1.259h.79v.937h.76v-2.903h-.79v1.211h-.76v-1.211h-.79v2.903h.79v-.937Z"/></svg>';
      break;
  }
  
  // Create card content
  card.innerHTML = `
    <div class="document-type-icon">${typeIcon}</div>
    <div class="document-status ${statusClass}">
      ${statusIcon}
      <span>${statusText}</span>
    </div>
    <div class="document-card-content">
      <h3 class="document-title">${doc.title}</h3>
      <p class="document-date">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
          <path d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5zM1 4v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4H1z"/>
        </svg>
        ${new Date(doc.date).toLocaleDateString()}
      </p>
    </div>
    <div class="document-card-actions">
      <button class="btn btn-icon view-btn" title="View Document">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
          <path d="M10.5 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0z"/>
          <path d="M0 8s3-5.5 8-5.5S16 8 16 8s-3 5.5-8 5.5S0 8 0 8zm8 3.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z"/>
        </svg>
      </button>
      <button class="btn btn-icon process-btn" title="Process Document">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
          <path d="M9.405 1.05c-.413-1.4-2.397-1.4-2.81 0l-.1.34a1.464 1.464 0 0 1-2.105.872l-.31-.17c-1.283-.698-2.686.705-1.987 1.987l.169.311c.446.82.023 1.841-.872 2.105l-.34.1c-1.4.413-1.4 2.397 0 2.81l.34.1a1.464 1.464 0 0 1 .872 2.105l-.17.31c-.698 1.283.705 2.686 1.987 1.987l.311-.169a1.464 1.464 0 0 1 2.105.872l.1.34c.413 1.4 2.397 1.4 2.81 0l.1-.34a1.464 1.464 0 0 1 2.105-.872l.31.17c1.283.698 2.686-.705 1.987-1.987l-.169-.311a1.464 1.464 0 0 1 .872-2.105l.34-.1c1.4-.413 1.4-2.397 0-2.81l-.34-.1a1.464 1.464 0 0 1-.872-2.105l.17-.31c.698-1.283-.705-2.686-1.987-1.987l-.311.169a1.464 1.464 0 0 1-2.105-.872l-.1-.34zM8 10.93a2.929 2.929 0 1 1 0-5.86 2.929 2.929 0 0 1 0 5.858z"/>
        </svg>
      </button>
      <button class="btn btn-icon delete-btn" title="Delete Document">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
          <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>
          <path fill-rule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/>
        </svg>
      </button>
    </div>
  `;
  
  // Add event listeners
  card.querySelector('.view-btn').addEventListener('click', function(e) {
    e.stopPropagation();
    window.location.href = `/documents-new/${doc.id}`;
  });
  
  card.querySelector('.process-btn').addEventListener('click', function(e) {
    e.stopPropagation();
    processDocument(doc.id);
  });
  
  card.querySelector('.delete-btn').addEventListener('click', function(e) {
    e.stopPropagation();
    if (confirm(`Are you sure you want to delete "${doc.title}"?`)) {
      deleteDocument(doc.id);
    }
  });
  
  // Make the whole card clickable
  card.addEventListener('click', function() {
    window.location.href = `/documents-new/${doc.id}`;
  });
  
  return card;
}
