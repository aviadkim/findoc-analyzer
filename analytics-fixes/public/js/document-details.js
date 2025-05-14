/**
 * Document Details Component
 * Adds document details to the Document Details page
 */

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  console.log('Document Details Component initializing...');
  
  // Add document details if on Document Details page
  if (window.location.pathname.includes('/document-details')) {
    addDocumentDetails();
  }
  
  console.log('Document Details Component initialized');
});

/**
 * Add document details to page
 */
function addDocumentDetails() {
  // Check if document details already exist
  if (document.querySelector('.document-details')) {
    return;
  }
  
  // Get document ID from URL
  const urlParams = new URLSearchParams(window.location.search);
  const documentId = urlParams.get('id') || 'doc-1';
  
  // Create container for document details
  const documentDetailsContainer = document.createElement('div');
  documentDetailsContainer.className = 'document-details-container';
  documentDetailsContainer.style.margin = '20px 0';
  
  // Create document details header
  const documentDetailsHeader = document.createElement('div');
  documentDetailsHeader.className = 'document-details-header';
  documentDetailsHeader.style.display = 'flex';
  documentDetailsHeader.style.justifyContent = 'space-between';
  documentDetailsHeader.style.alignItems = 'center';
  documentDetailsHeader.style.marginBottom = '20px';
  
  const documentDetailsTitle = document.createElement('h2');
  documentDetailsTitle.id = 'document-title';
  documentDetailsTitle.textContent = 'Document Details';
  documentDetailsTitle.style.margin = '0';
  
  const documentDetailsActions = document.createElement('div');
  documentDetailsActions.className = 'document-details-actions';
  
  const backButton = document.createElement('button');
  backButton.className = 'btn btn-secondary';
  backButton.textContent = 'Back to Documents';
  backButton.style.marginRight = '10px';
  
  const downloadButton = document.createElement('button');
  downloadButton.className = 'btn btn-primary';
  downloadButton.textContent = 'Download';
  
  backButton.addEventListener('click', function() {
    window.location.href = '/documents-new';
  });
  
  downloadButton.addEventListener('click', function() {
    alert('Document downloaded!');
  });
  
  documentDetailsActions.appendChild(backButton);
  documentDetailsActions.appendChild(downloadButton);
  
  documentDetailsHeader.appendChild(documentDetailsTitle);
  documentDetailsHeader.appendChild(documentDetailsActions);
  
  // Create document details
  const documentDetails = document.createElement('div');
  documentDetails.className = 'document-details';
  
  // Create document metadata
  const documentMetadata = document.createElement('div');
  documentMetadata.className = 'document-metadata';
  documentMetadata.style.backgroundColor = '#f5f5f5';
  documentMetadata.style.padding = '15px';
  documentMetadata.style.borderRadius = '5px';
  documentMetadata.style.marginBottom = '20px';
  
  const metadataTitle = document.createElement('h3');
  metadataTitle.textContent = 'Document Metadata';
  metadataTitle.style.marginTop = '0';
  metadataTitle.style.marginBottom = '15px';
  
  const metadataGrid = document.createElement('div');
  metadataGrid.style.display = 'grid';
  metadataGrid.style.gridTemplateColumns = 'repeat(auto-fill, minmax(250px, 1fr))';
  metadataGrid.style.gap = '10px';
  
  const metadataItems = [
    { label: 'File Name', id: 'metadata-filename', value: 'Loading...' },
    { label: 'File Type', id: 'metadata-filetype', value: 'Loading...' },
    { label: 'File Size', id: 'metadata-filesize', value: 'Loading...' },
    { label: 'Upload Date', id: 'metadata-uploaddate', value: 'Loading...' },
    { label: 'Pages', id: 'metadata-pages', value: 'Loading...' },
    { label: 'Author', id: 'metadata-author', value: 'Loading...' },
    { label: 'Created Date', id: 'metadata-createddate', value: 'Loading...' },
    { label: 'Modified Date', id: 'metadata-modifieddate', value: 'Loading...' }
  ];
  
  metadataItems.forEach(item => {
    const metadataItem = document.createElement('div');
    metadataItem.className = 'metadata-item';
    
    const metadataLabel = document.createElement('div');
    metadataLabel.className = 'metadata-label';
    metadataLabel.textContent = item.label;
    metadataLabel.style.fontWeight = 'bold';
    metadataLabel.style.marginBottom = '5px';
    
    const metadataValue = document.createElement('div');
    metadataValue.className = 'metadata-value';
    metadataValue.id = item.id;
    metadataValue.textContent = item.value;
    
    metadataItem.appendChild(metadataLabel);
    metadataItem.appendChild(metadataValue);
    
    metadataGrid.appendChild(metadataItem);
  });
  
  documentMetadata.appendChild(metadataTitle);
  documentMetadata.appendChild(metadataGrid);
  
  // Create document content tabs
  const documentContentTabs = document.createElement('div');
  documentContentTabs.className = 'document-content-tabs';
  documentContentTabs.style.marginBottom = '20px';
  
  const tabsContainer = document.createElement('div');
  tabsContainer.style.display = 'flex';
  tabsContainer.style.borderBottom = '1px solid #ddd';
  tabsContainer.style.marginBottom = '20px';
  
  const tabs = [
    { id: 'tab-preview', text: 'Preview', active: true },
    { id: 'tab-text', text: 'Text', active: false },
    { id: 'tab-tables', text: 'Tables', active: false },
    { id: 'tab-entities', text: 'Entities', active: false }
  ];
  
  tabs.forEach(tab => {
    const tabElement = document.createElement('div');
    tabElement.id = tab.id;
    tabElement.className = 'content-tab';
    tabElement.textContent = tab.text;
    tabElement.style.padding = '10px 15px';
    tabElement.style.cursor = 'pointer';
    tabElement.style.borderBottom = tab.active ? '2px solid #007bff' : 'none';
    tabElement.style.color = tab.active ? '#007bff' : '#333';
    tabElement.style.fontWeight = tab.active ? 'bold' : 'normal';
    
    tabElement.addEventListener('click', function() {
      // Deactivate all tabs
      document.querySelectorAll('.content-tab').forEach(t => {
        t.style.borderBottom = 'none';
        t.style.color = '#333';
        t.style.fontWeight = 'normal';
      });
      
      // Activate clicked tab
      tabElement.style.borderBottom = '2px solid #007bff';
      tabElement.style.color = '#007bff';
      tabElement.style.fontWeight = 'bold';
      
      // Hide all tab content
      document.querySelectorAll('.tab-content').forEach(c => {
        c.style.display = 'none';
      });
      
      // Show clicked tab content
      const contentId = tab.id.replace('tab-', 'content-');
      document.getElementById(contentId).style.display = 'block';
    });
    
    tabsContainer.appendChild(tabElement);
  });
  
  documentContentTabs.appendChild(tabsContainer);
  
  // Create document content
  const documentContent = document.createElement('div');
  documentContent.className = 'document-content';
  
  // Create preview content
  const previewContent = document.createElement('div');
  previewContent.id = 'content-preview';
  previewContent.className = 'tab-content';
  previewContent.style.display = 'block';
  
  const previewImage = document.createElement('div');
  previewImage.style.width = '100%';
  previewImage.style.height = '500px';
  previewImage.style.backgroundColor = '#f5f5f5';
  previewImage.style.display = 'flex';
  previewImage.style.justifyContent = 'center';
  previewImage.style.alignItems = 'center';
  previewImage.style.border = '1px solid #ddd';
  previewImage.style.borderRadius = '5px';
  
  const previewText = document.createElement('div');
  previewText.textContent = 'Document Preview';
  previewText.style.fontSize = '24px';
  previewText.style.color = '#999';
  
  previewImage.appendChild(previewText);
  previewContent.appendChild(previewImage);
  
  // Create text content
  const textContent = document.createElement('div');
  textContent.id = 'content-text';
  textContent.className = 'tab-content';
  textContent.style.display = 'none';
  
  const textContainer = document.createElement('div');
  textContainer.style.width = '100%';
  textContainer.style.height = '500px';
  textContainer.style.backgroundColor = '#fff';
  textContainer.style.border = '1px solid #ddd';
  textContainer.style.borderRadius = '5px';
  textContainer.style.padding = '15px';
  textContainer.style.overflowY = 'auto';
  
  const textParagraphs = [
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam auctor, nisl eget ultricies tincidunt, nisl nisl aliquam nisl, eget ultricies nisl nisl eget nisl. Nullam auctor, nisl eget ultricies tincidunt, nisl nisl aliquam nisl, eget ultricies nisl nisl eget nisl.',
    'Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Vestibulum tortor quam, feugiat vitae, ultricies eget, tempor sit amet, ante. Donec eu libero sit amet quam egestas semper. Aenean ultricies mi vitae est. Mauris placerat eleifend leo.',
    'Quisque sit amet est et sapien ullamcorper pharetra. Vestibulum erat wisi, condimentum sed, commodo vitae, ornare sit amet, wisi. Aenean fermentum, elit eget tincidunt condimentum, eros ipsum rutrum orci, sagittis tempus lacus enim ac dui. Donec non enim in turpis pulvinar facilisis. Ut felis.',
    'Praesent dapibus, neque id cursus faucibus, tortor neque egestas augue, eu vulputate magna eros eu erat. Aliquam erat volutpat. Nam dui mi, tincidunt quis, accumsan porttitor, facilisis luctus, metus.',
    'Phasellus ultrices nulla quis nibh. Quisque a lectus. Donec consectetuer ligula vulputate sem tristique cursus. Nam nulla quam, gravida non, commodo a, sodales sit amet, nisi.'
  ];
  
  textParagraphs.forEach(paragraph => {
    const p = document.createElement('p');
    p.textContent = paragraph;
    textContainer.appendChild(p);
  });
  
  textContent.appendChild(textContainer);
  
  // Create tables content
  const tablesContent = document.createElement('div');
  tablesContent.id = 'content-tables';
  tablesContent.className = 'tab-content';
  tablesContent.style.display = 'none';
  
  const tablesContainer = document.createElement('div');
  tablesContainer.className = 'document-tables';
  tablesContainer.style.width = '100%';
  
  // Create table 1
  const table1 = document.createElement('div');
  table1.className = 'document-table';
  table1.style.marginBottom = '20px';
  
  const table1Title = document.createElement('h4');
  table1Title.textContent = 'Table 1: Financial Summary';
  table1Title.style.marginTop = '0';
  table1Title.style.marginBottom = '10px';
  
  const table1Element = document.createElement('table');
  table1Element.style.width = '100%';
  table1Element.style.borderCollapse = 'collapse';
  table1Element.style.border = '1px solid #ddd';
  
  const table1Head = document.createElement('thead');
  table1Head.style.backgroundColor = '#f5f5f5';
  
  const table1HeadRow = document.createElement('tr');
  
  const table1Headers = ['Category', 'Q1', 'Q2', 'Q3', 'Q4', 'Total'];
  
  table1Headers.forEach(header => {
    const th = document.createElement('th');
    th.textContent = header;
    th.style.padding = '10px';
    th.style.border = '1px solid #ddd';
    table1HeadRow.appendChild(th);
  });
  
  table1Head.appendChild(table1HeadRow);
  
  const table1Body = document.createElement('tbody');
  
  const table1Data = [
    ['Revenue', '$10,000', '$12,000', '$15,000', '$18,000', '$55,000'],
    ['Expenses', '$8,000', '$9,000', '$10,000', '$12,000', '$39,000'],
    ['Profit', '$2,000', '$3,000', '$5,000', '$6,000', '$16,000']
  ];
  
  table1Data.forEach(row => {
    const tr = document.createElement('tr');
    
    row.forEach(cell => {
      const td = document.createElement('td');
      td.textContent = cell;
      td.style.padding = '10px';
      td.style.border = '1px solid #ddd';
      tr.appendChild(td);
    });
    
    table1Body.appendChild(tr);
  });
  
  table1Element.appendChild(table1Head);
  table1Element.appendChild(table1Body);
  
  table1.appendChild(table1Title);
  table1.appendChild(table1Element);
  
  // Create table 2
  const table2 = document.createElement('div');
  table2.className = 'document-table';
  
  const table2Title = document.createElement('h4');
  table2Title.textContent = 'Table 2: Portfolio Holdings';
  table2Title.style.marginTop = '0';
  table2Title.style.marginBottom = '10px';
  
  const table2Element = document.createElement('table');
  table2Element.style.width = '100%';
  table2Element.style.borderCollapse = 'collapse';
  table2Element.style.border = '1px solid #ddd';
  
  const table2Head = document.createElement('thead');
  table2Head.style.backgroundColor = '#f5f5f5';
  
  const table2HeadRow = document.createElement('tr');
  
  const table2Headers = ['Security', 'ISIN', 'Quantity', 'Price', 'Value', 'Weight'];
  
  table2Headers.forEach(header => {
    const th = document.createElement('th');
    th.textContent = header;
    th.style.padding = '10px';
    th.style.border = '1px solid #ddd';
    table2HeadRow.appendChild(th);
  });
  
  table2Head.appendChild(table2HeadRow);
  
  const table2Body = document.createElement('tbody');
  
  const table2Data = [
    ['Apple Inc.', 'US0378331005', '100', '$150.00', '$15,000', '30%'],
    ['Microsoft Corp.', 'US5949181045', '50', '$300.00', '$15,000', '30%'],
    ['Amazon.com Inc.', 'US0231351067', '25', '$400.00', '$10,000', '20%'],
    ['Alphabet Inc.', 'US02079K1079', '20', '$500.00', '$10,000', '20%']
  ];
  
  table2Data.forEach(row => {
    const tr = document.createElement('tr');
    
    row.forEach(cell => {
      const td = document.createElement('td');
      td.textContent = cell;
      td.style.padding = '10px';
      td.style.border = '1px solid #ddd';
      tr.appendChild(td);
    });
    
    table2Body.appendChild(tr);
  });
  
  table2Element.appendChild(table2Head);
  table2Element.appendChild(table2Body);
  
  table2.appendChild(table2Title);
  table2.appendChild(table2Element);
  
  tablesContainer.appendChild(table1);
  tablesContainer.appendChild(table2);
  
  tablesContent.appendChild(tablesContainer);
  
  // Create entities content
  const entitiesContent = document.createElement('div');
  entitiesContent.id = 'content-entities';
  entitiesContent.className = 'tab-content';
  entitiesContent.style.display = 'none';
  
  const entitiesContainer = document.createElement('div');
  entitiesContainer.style.width = '100%';
  
  const entityTypes = [
    { type: 'Securities', entities: ['Apple Inc. (AAPL)', 'Microsoft Corp. (MSFT)', 'Amazon.com Inc. (AMZN)', 'Alphabet Inc. (GOOGL)'] },
    { type: 'Organizations', entities: ['Apple Inc.', 'Microsoft Corp.', 'Amazon.com Inc.', 'Alphabet Inc.', 'Federal Reserve', 'SEC'] },
    { type: 'Persons', entities: ['Tim Cook', 'Satya Nadella', 'Andy Jassy', 'Sundar Pichai'] },
    { type: 'Locations', entities: ['United States', 'California', 'Washington', 'New York'] },
    { type: 'Dates', entities: ['2023-01-01', '2023-03-31', '2023-06-30', '2023-09-30', '2023-12-31'] }
  ];
  
  entityTypes.forEach(entityType => {
    const entityTypeContainer = document.createElement('div');
    entityTypeContainer.style.marginBottom = '20px';
    
    const entityTypeTitle = document.createElement('h4');
    entityTypeTitle.textContent = entityType.type;
    entityTypeTitle.style.marginTop = '0';
    entityTypeTitle.style.marginBottom = '10px';
    
    const entityList = document.createElement('div');
    entityList.style.display = 'flex';
    entityList.style.flexWrap = 'wrap';
    entityList.style.gap = '10px';
    
    entityType.entities.forEach(entity => {
      const entityTag = document.createElement('div');
      entityTag.textContent = entity;
      entityTag.style.backgroundColor = '#f5f5f5';
      entityTag.style.padding = '5px 10px';
      entityTag.style.borderRadius = '3px';
      entityTag.style.border = '1px solid #ddd';
      
      entityList.appendChild(entityTag);
    });
    
    entityTypeContainer.appendChild(entityTypeTitle);
    entityTypeContainer.appendChild(entityList);
    
    entitiesContainer.appendChild(entityTypeContainer);
  });
  
  entitiesContent.appendChild(entitiesContainer);
  
  // Add tab content to document content
  documentContent.appendChild(previewContent);
  documentContent.appendChild(textContent);
  documentContent.appendChild(tablesContent);
  documentContent.appendChild(entitiesContent);
  
  // Create document loading state
  const loadingState = document.createElement('div');
  loadingState.id = 'document-loading';
  loadingState.style.padding = '50px 20px';
  loadingState.style.textAlign = 'center';
  loadingState.style.display = 'none';
  
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
  loadingText.textContent = 'Loading document...';
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
  
  // Add elements to document details
  documentDetails.appendChild(documentMetadata);
  documentDetails.appendChild(documentContentTabs);
  documentDetails.appendChild(documentContent);
  documentDetails.appendChild(loadingState);
  
  // Add elements to document details container
  documentDetailsContainer.appendChild(documentDetailsHeader);
  documentDetailsContainer.appendChild(documentDetails);
  
  // Find a good place to insert the document details
  const main = document.querySelector('main') || document.querySelector('.main-content');
  if (main) {
    // Check if there's a welcome message
    const welcomeMessage = main.querySelector('h1');
    if (welcomeMessage) {
      // Insert after the welcome message
      welcomeMessage.parentNode.insertBefore(documentDetailsContainer, welcomeMessage.nextSibling);
    } else {
      // Insert at the beginning of main
      main.insertBefore(documentDetailsContainer, main.firstChild);
    }
  } else {
    // Insert in the body
    document.body.appendChild(documentDetailsContainer);
  }
  
  console.log('Document details added successfully!');
  
  // Load document
  loadDocument(documentId);
}

/**
 * Load document
 * @param {string} documentId - Document ID
 */
function loadDocument(documentId) {
  // Show loading state
  document.getElementById('document-loading').style.display = 'block';
  
  // Simulate loading delay
  setTimeout(function() {
    // Hide loading state
    document.getElementById('document-loading').style.display = 'none';
    
    // Get mock document
    const document = getMockDocument(documentId);
    
    // Update document title
    document.getElementById('document-title').textContent = document.name;
    
    // Update metadata
    document.getElementById('metadata-filename').textContent = document.name;
    document.getElementById('metadata-filetype').textContent = document.type;
    document.getElementById('metadata-filesize').textContent = document.size;
    document.getElementById('metadata-uploaddate').textContent = document.uploaded;
    document.getElementById('metadata-pages').textContent = document.pages;
    document.getElementById('metadata-author').textContent = document.author;
    document.getElementById('metadata-createddate').textContent = document.created;
    document.getElementById('metadata-modifieddate').textContent = document.modified;
    
    console.log('Document loaded successfully!');
  }, 1000);
}

/**
 * Get mock document
 * @param {string} documentId - Document ID
 * @returns {Object} Mock document
 */
function getMockDocument(documentId) {
  const documents = {
    'doc-1': {
      id: 'doc-1',
      name: 'Annual Report 2023.pdf',
      type: 'PDF',
      size: '2.5 MB',
      uploaded: '2023-05-01',
      pages: '25',
      author: 'John Doe',
      created: '2023-04-15',
      modified: '2023-04-30'
    },
    'doc-2': {
      id: 'doc-2',
      name: 'Financial Statement Q1 2023.xlsx',
      type: 'Excel',
      size: '1.2 MB',
      uploaded: '2023-04-15',
      pages: 'N/A',
      author: 'Jane Smith',
      created: '2023-04-10',
      modified: '2023-04-14'
    },
    'doc-3': {
      id: 'doc-3',
      name: 'Portfolio Holdings.csv',
      type: 'CSV',
      size: '0.8 MB',
      uploaded: '2023-03-22',
      pages: 'N/A',
      author: 'Bob Johnson',
      created: '2023-03-20',
      modified: '2023-03-21'
    },
    'doc-4': {
      id: 'doc-4',
      name: 'Investment Summary.pdf',
      type: 'PDF',
      size: '1.5 MB',
      uploaded: '2023-03-10',
      pages: '15',
      author: 'Alice Brown',
      created: '2023-03-05',
      modified: '2023-03-09'
    },
    'doc-5': {
      id: 'doc-5',
      name: 'Market Analysis.pdf',
      type: 'PDF',
      size: '3.2 MB',
      uploaded: '2023-02-28',
      pages: '30',
      author: 'Charlie Wilson',
      created: '2023-02-20',
      modified: '2023-02-27'
    }
  };
  
  return documents[documentId] || documents['doc-1'];
}
