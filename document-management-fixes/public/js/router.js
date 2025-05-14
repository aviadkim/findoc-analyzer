/**
 * Simple Client-Side Router for FinDoc Analyzer
 *
 * This script handles client-side routing for the application.
 */

// Initialize the router when the DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  console.log('Router initialized');

  // Handle initial route
  handleRoute(window.location.pathname);

  // Add event listener for popstate (browser back/forward buttons)
  window.addEventListener('popstate', function() {
    handleRoute(window.location.pathname);
  });

  // Add click event listeners to all internal links
  document.addEventListener('click', function(e) {
    // Find closest anchor tag
    const link = e.target.closest('a');

    // If it's an internal link, handle it with the router
    if (link && link.getAttribute('href') && link.getAttribute('href').startsWith('/') &&
        !link.getAttribute('href').startsWith('//') &&
        !link.hasAttribute('target') &&
        !link.hasAttribute('download')) {
      e.preventDefault();
      navigateTo(link.getAttribute('href'));
    }
  });
});

/**
 * Navigate to a new route
 * @param {string} path - The path to navigate to
 */
function navigateTo(path) {
  console.log('Navigating to:', path);

  // Push state to history
  history.pushState(null, null, path);

  // Handle the route
  handleRoute(path);
}

/**
 * Handle a route change
 * @param {string} path - The path to navigate to
 */
function handleRoute(path) {
  console.log('Handling route:', path);

  // Update active link in sidebar
  updateActiveSidebarLink(path);

  // Load content based on route
  loadContent(path);
}

/**
 * Update the active link in the sidebar
 * @param {string} path - The current path
 */
function updateActiveSidebarLink(path) {
  // Remove active class from all links
  document.querySelectorAll('.sidebar-nav a').forEach(link => {
    link.classList.remove('active');
  });

  // Add active class to the current page link
  let activeLink = null;

  // Handle special cases
  if (path === '/' || path === '/index.html') {
    activeLink = document.querySelector('.sidebar-nav a[href="/"]');
  } else {
    // For other pages, find the matching link
    activeLink = document.querySelector(`.sidebar-nav a[href="${path}"]`);

    // If no exact match, try to match by partial path
    if (!activeLink) {
      document.querySelectorAll('.sidebar-nav a').forEach(link => {
        const href = link.getAttribute('href');
        if (path.includes(href) && href !== '/') {
          activeLink = link;
        }
      });
    }
  }

  // Set the active class
  if (activeLink) {
    activeLink.classList.add('active');
    console.log('Active link set to:', activeLink.getAttribute('href'));
  }
}

/**
 * Load content based on the current route
 * @param {string} path - The current path
 */
function loadContent(path) {
  // Get the content container
  const contentContainer = document.getElementById('page-content');

  if (!contentContainer) {
    console.error('Content container not found');
    return;
  }

  // Define routes and their content
  const routes = {
    '/': renderDashboard,
    '/dashboard': renderDashboard,
    '/documents': renderDocuments,
    '/documents-new': renderDocuments,
    '/analytics': renderAnalytics,
    '/analytics-new': renderAnalytics,
    '/upload': renderUpload,
    '/chat': renderChat,
    '/document-chat': renderDocumentChat,
    '/document-comparison': renderDocumentComparison,
    '/settings': renderSettings,
    '/login': renderLogin,
    '/signup': renderSignup,
    '/test': renderTest,
    '/simple-test': renderSimpleTest
  };

  // Handle document detail routes
  if (path.match(/^\/documents\/[^\/]+$/)) {
    const documentId = path.split('/').pop();
    renderDocumentDetail(contentContainer, documentId);
    return;
  }

  // Check if the route exists
  if (routes[path]) {
    // Call the route handler
    routes[path](contentContainer);
  } else {
    // Handle 404
    renderNotFound(contentContainer);
  }
}

/**
 * Render the dashboard page
 * @param {HTMLElement} container - The content container
 */
function renderDashboard(container) {
  console.log('Rendering dashboard');

  container.innerHTML = `
    <div class="dashboard-page">
      <h1 class="page-title">Welcome to FinDoc Analyzer</h1>
      <p class="page-description">This application helps you analyze and extract information from financial documents.</p>

      <div class="dashboard-cards">
        <div class="dashboard-card">
          <div class="dashboard-card-header">
            <h2>Quick Upload</h2>
          </div>
          <div class="dashboard-card-body">
            <p>Upload a financial document to analyze and extract information.</p>
            <div class="dashboard-card-actions">
              <a href="/upload" class="btn btn-primary">Upload Document</a>
            </div>
          </div>
        </div>

        <div class="dashboard-card">
          <div class="dashboard-card-header">
            <h2>Recent Documents</h2>
          </div>
          <div class="dashboard-card-body">
            <p>View and manage your recently uploaded documents.</p>
            <div class="dashboard-card-actions">
              <a href="/documents-new" class="btn btn-primary">View Documents</a>
            </div>
          </div>
        </div>

        <div class="dashboard-card">
          <div class="dashboard-card-header">
            <h2>Analytics</h2>
          </div>
          <div class="dashboard-card-body">
            <p>View analytics and insights from your financial documents.</p>
            <div class="dashboard-card-actions">
              <a href="/analytics-new" class="btn btn-primary">View Analytics</a>
            </div>
          </div>
        </div>

        <div class="dashboard-card">
          <div class="dashboard-card-header">
            <h2>Document Chat</h2>
          </div>
          <div class="dashboard-card-body">
            <p>Ask questions about your financial documents and get accurate answers.</p>
            <div class="dashboard-card-actions">
              <a href="/document-chat" class="btn btn-primary">Chat with Documents</a>
            </div>
          </div>
        </div>

        <div class="dashboard-card">
          <div class="dashboard-card-header">
            <h2>Test Page</h2>
          </div>
          <div class="dashboard-card-body">
            <p>Test the application functionality and API endpoints.</p>
            <div class="dashboard-card-actions">
              <a href="/test" class="btn btn-primary">Go to Test Page</a>
            </div>
          </div>
        </div>
      </div>

      <div class="action-buttons">
        <a href="/upload" class="btn btn-primary">Upload New Document</a>
        <button id="process-document-btn" class="btn btn-primary">Process Document</button>
      </div>

      <div class="dashboard-section">
        <h2>Features</h2>
        <ul class="feature-list">
          <li>
            <span class="feature-icon">📄</span>
            <div class="feature-content">
              <h3>Document Processing</h3>
              <p>Upload and process financial documents to extract text, tables, and metadata.</p>
            </div>
          </li>
          <li>
            <span class="feature-icon">📊</span>
            <div class="feature-content">
              <h3>Table Extraction</h3>
              <p>Extract tables from financial documents with high accuracy.</p>
            </div>
          </li>
          <li>
            <span class="feature-icon">💰</span>
            <div class="feature-content">
              <h3>Securities Extraction</h3>
              <p>Automatically identify and extract securities information from financial documents.</p>
            </div>
          </li>
          <li>
            <span class="feature-icon">🤖</span>
            <div class="feature-content">
              <h3>AI-Powered Q&A</h3>
              <p>Ask questions about your financial documents and get accurate answers.</p>
            </div>
          </li>
        </ul>
      </div>

      <div class="dashboard-section">
        <h2>Quick Chat</h2>
        <div id="document-chat-container" class="dashboard-chat-container">
          <div class="chat-messages" id="dashboard-chat-messages">
            <div class="message ai-message">
              <p>Hello! I'm your financial assistant. How can I help you today?</p>
            </div>
          </div>
          <div class="chat-input">
            <input type="text" id="dashboard-chat-input" class="form-control" placeholder="Type your question...">
            <button id="document-send-btn" class="btn btn-primary">Send</button>
          </div>
        </div>
      </div>

      <div class="dashboard-section">
        <h2>AI Agents</h2>
        <ul class="feature-list">
          <li>
            <span class="feature-icon">🔍</span>
            <div class="feature-content">
              <h3>Document Analyzer</h3>
              <p>Analyzes financial documents to extract key information and insights.</p>
            </div>
          </li>
          <li>
            <span class="feature-icon">📋</span>
            <div class="feature-content">
              <h3>Table Understanding</h3>
              <p>Understands and extracts structured data from tables in financial documents.</p>
            </div>
          </li>
          <li>
            <span class="feature-icon">💼</span>
            <div class="feature-content">
              <h3>Securities Extractor</h3>
              <p>Identifies and extracts securities information, including ISIN, quantity, and valuation.</p>
            </div>
          </li>
          <li>
            <span class="feature-icon">🧠</span>
            <div class="feature-content">
              <h3>Financial Reasoner</h3>
              <p>Provides financial reasoning and insights based on the extracted data.</p>
            </div>
          </li>
          <li>
            <span class="feature-icon">📈</span>
            <div class="feature-content">
              <h3>Bloomberg Agent</h3>
              <p>Retrieves real-time financial data and market information for securities.</p>
            </div>
          </li>
        </ul>
      </div>
    </div>
  `;

  // Add event listeners to dashboard links
  container.querySelectorAll('.dashboard-card-actions a').forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      const href = this.getAttribute('href');
      navigateTo(href);
    });
  });

  // Add event listener to process document button
  const processDocumentBtn = container.querySelector('#process-document-btn');
  if (processDocumentBtn) {
    processDocumentBtn.addEventListener('click', function() {
      // Navigate to documents page
      navigateTo('/documents-new');

      // Show notification to select a document to process
      if (window.notification) {
        window.notification.showInfo('Please select a document to process');
      } else {
        alert('Please select a document to process');
      }
    });
  }

  // Set up dashboard chat
  const dashboardChatInput = container.querySelector('#dashboard-chat-input');
  const documentSendBtn = container.querySelector('#document-send-btn');
  const dashboardChatMessages = container.querySelector('#dashboard-chat-messages');

  if (dashboardChatInput && documentSendBtn && dashboardChatMessages) {
    // Handle send button click
    documentSendBtn.addEventListener('click', function() {
      sendDashboardMessage();
    });

    // Handle enter key press
    dashboardChatInput.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        sendDashboardMessage();
      }
    });

    // Send message function
    function sendDashboardMessage() {
      const message = dashboardChatInput.value.trim();

      if (!message) {
        return;
      }

      // Add user message
      dashboardChatMessages.innerHTML += `
        <div class="message user-message">
          <p>${message}</p>
        </div>
      `;

      // Clear input
      dashboardChatInput.value = '';

      // Scroll to bottom
      dashboardChatMessages.scrollTop = dashboardChatMessages.scrollHeight;

      // Simulate AI response
      setTimeout(() => {
        dashboardChatMessages.innerHTML += `
          <div class="message ai-message">
            <p>I'm a mock AI assistant. This is a simulated response to your question: "${message}"</p>
          </div>
        `;

        // Scroll to bottom
        dashboardChatMessages.scrollTop = dashboardChatMessages.scrollHeight;
      }, 1000);
    }
  }
}

/**
 * Render the documents page
 * @param {HTMLElement} container - The content container
 */
function renderDocuments(container) {
  console.log('Rendering documents page');

  container.innerHTML = `
    <div class="documents-page">
      <h1 class="page-title">My Documents</h1>
      <p class="page-description">View and manage your uploaded documents.</p>

      <div class="action-buttons">
        <a href="/upload" class="btn btn-primary">Upload New Document</a>
      </div>

      <div class="document-grid" id="document-grid">
        <div class="empty-state">
          <h2>No Documents Found</h2>
          <p>Upload a document to get started.</p>
          <a href="/upload" class="btn btn-primary">Upload Document</a>
        </div>
      </div>
    </div>
  `;

  // Load documents from API
  loadDocuments();
}

/**
 * Load documents from API
 */
function loadDocuments() {
  const documentGrid = document.getElementById('document-grid');

  if (!documentGrid) {
    console.error('Document grid not found');
    return;
  }

  // Show loading state
  documentGrid.innerHTML = `
    <div class="loading-state">
      <div class="loading-spinner"></div>
      <p>Loading documents...</p>
    </div>
  `;

  // Fetch documents from API
  fetch('/api/documents')
    .then(response => {
      if (!response.ok) {
        throw new Error('Failed to fetch documents');
      }
      return response.json();
    })
    .then(documents => {
      // Check if there are any documents
      if (!documents || documents.length === 0) {
        documentGrid.innerHTML = `
          <div class="empty-state">
            <h2>No Documents Found</h2>
            <p>Upload a document to get started.</p>
            <a href="/upload" class="btn btn-primary">Upload Document</a>
          </div>
        `;
        return;
      }

      // Clear loading state
      documentGrid.innerHTML = '';

      // Render documents
      documents.forEach(doc => {
        const uploadDate = new Date(doc.uploadDate).toLocaleDateString();
        const statusClass = doc.processed ? 'status-processed' : 'status-pending';
        const statusText = doc.status || (doc.processed ? 'Processed' : 'Pending');

        documentGrid.innerHTML += `
          <div class="document-card" data-id="${doc.id}">
            <div class="document-card-header">
              <h3>${doc.name}</h3>
            </div>
            <div class="document-card-body">
              <p>Type: ${doc.documentType || 'Unknown'}</p>
              <p>Status: <span class="document-status ${statusClass}">${statusText}</span></p>
            </div>
            <div class="document-card-footer">
              <span>Uploaded: ${uploadDate}</span>
              <div class="document-actions">
                <a href="/documents/${doc.id}" class="view-link">View</a>
                ${!doc.processed && !doc.processing ?
                  `<button class="process-btn" data-id="${doc.id}" id="process-document-btn-${doc.id}">Process Document</button>` :
                  doc.processing ?
                  `<span class="processing-badge">Processing...</span>` :
                  `<a href="/document-chat" class="chat-link" onclick="localStorage.setItem('selectedDocumentId', '${doc.id}')">Chat</a>`
                }
              </div>
            </div>
          </div>
        `;
      });

      // Add click event to document cards
      document.querySelectorAll('.document-card').forEach(card => {
        card.addEventListener('click', function(e) {
          // Don't navigate if clicking on a button or link
          if (e.target.tagName === 'BUTTON' || e.target.tagName === 'A') {
            return;
          }

          const docId = this.getAttribute('data-id');
          navigateTo(`/documents/${docId}`);
        });
      });

      // Add click event to process buttons
      document.querySelectorAll('.process-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
          e.stopPropagation(); // Prevent card click

          const docId = this.getAttribute('data-id');
          processDocument(docId);
        });
      });
    })
    .catch(error => {
      console.error('Error loading documents:', error);

      documentGrid.innerHTML = `
        <div class="error-state">
          <h2>Error Loading Documents</h2>
          <p>${error.message}</p>
          <button class="btn btn-primary" onclick="loadDocuments()">Try Again</button>
        </div>
      `;
    });
}

/**
 * Process a document from the documents page
 * @param {string} documentId - The document ID
 */
function processDocument(documentId) {
  console.log(`Processing document: ${documentId}`);

  // Find the document card
  const documentCard = document.querySelector(`.document-card[data-id="${documentId}"]`);

  if (!documentCard) {
    console.error('Document card not found');
    // If card not found, we might be on the detail page, try to process from there
    processDocumentFromDetail(documentId, false);
    return;
  }

  // Update card to show processing
  const cardBody = documentCard.querySelector('.document-card-body');
  const cardFooter = documentCard.querySelector('.document-card-footer');

  if (cardBody) {
    cardBody.innerHTML = `
      <p>Status: <span class="document-status status-pending">Processing</span></p>
      <div class="progress">
        <div class="progress-bar" style="width: 0%"></div>
      </div>
    `;
  }

  if (cardFooter) {
    const actionsDiv = cardFooter.querySelector('.document-actions');
    if (actionsDiv) {
      actionsDiv.innerHTML = `<span class="processing-badge">Processing...</span>`;
    }
  }

  // Start processing
  fetch(`/api/documents/${documentId}/process`, {
    method: 'POST'
  })
  .then(response => {
    if (!response.ok) {
      throw new Error('Failed to start processing');
    }
    return response.json();
  })
  .then(data => {
    console.log('Processing started:', data);

    // Poll for processing status
    pollProcessingStatus(documentId, documentCard);
  })
  .catch(error => {
    console.error('Error starting processing:', error);

    // Show error
    if (cardBody) {
      cardBody.innerHTML = `
        <p>Status: <span class="document-status status-error">Error</span></p>
        <p class="error-message">${error.message}</p>
      `;
    }

    if (cardFooter) {
      const actionsDiv = cardFooter.querySelector('.document-actions');
      if (actionsDiv) {
        actionsDiv.innerHTML = `
          <a href="/documents/${documentId}" class="view-link">View</a>
          <button class="process-btn" data-id="${documentId}">Retry</button>
        `;

        // Add click event to retry button
        const retryBtn = actionsDiv.querySelector('.process-btn');
        if (retryBtn) {
          retryBtn.addEventListener('click', function(e) {
            e.stopPropagation(); // Prevent card click
            processDocument(documentId);
          });
        }
      }
    }
  });
}

/**
 * Poll for processing status from the documents page
 * @param {string} documentId - The document ID
 * @param {HTMLElement} documentCard - The document card element
 */
function pollProcessingStatus(documentId, documentCard) {
  const cardBody = documentCard.querySelector('.document-card-body');
  const progressBar = cardBody ? cardBody.querySelector('.progress-bar') : null;

  if (!cardBody || !progressBar) {
    console.error('Document card elements not found');
    return;
  }

  // Poll for status
  const pollInterval = setInterval(() => {
    fetch(`/api/documents/${documentId}/status`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to get processing status');
        }
        return response.json();
      })
      .then(status => {
        console.log('Processing status:', status);

        // Update progress
        if (progressBar) {
          progressBar.style.width = `${status.progress || 0}%`;
        }

        // Check if processing is complete
        if (status.processed || status.status === 'completed') {
          clearInterval(pollInterval);

          // Reload documents to show updated status
          loadDocuments();
        }

        // Check if processing failed
        if (status.status === 'error') {
          clearInterval(pollInterval);

          // Show error
          if (cardBody) {
            cardBody.innerHTML = `
              <p>Status: <span class="document-status status-error">Error</span></p>
              <p class="error-message">${status.message || 'Processing failed'}</p>
            `;
          }

          const cardFooter = documentCard.querySelector('.document-card-footer');
          if (cardFooter) {
            const actionsDiv = cardFooter.querySelector('.document-actions');
            if (actionsDiv) {
              actionsDiv.innerHTML = `
                <a href="/documents/${documentId}" class="view-link">View</a>
                <button class="process-btn" data-id="${documentId}">Retry</button>
              `;

              // Add click event to retry button
              const retryBtn = actionsDiv.querySelector('.process-btn');
              if (retryBtn) {
                retryBtn.addEventListener('click', function(e) {
                  e.stopPropagation(); // Prevent card click
                  processDocument(documentId);
                });
              }
            }
          }
        }
      })
      .catch(error => {
        console.error('Error polling processing status:', error);
        // Continue polling even if there's an error
      });
  }, 2000); // Poll every 2 seconds
}

/**
 * Render the analytics page
 * @param {HTMLElement} container - The content container
 */
function renderAnalytics(container) {
  console.log('Rendering analytics page');

  container.innerHTML = `
    <div class="analytics-page">
      <h1 class="page-title">Analytics</h1>
      <p class="page-description">View analytics and insights from your financial documents.</p>

      <div class="analytics-content">
        <div class="empty-state">
          <h2>No Analytics Available</h2>
          <p>Upload and process documents to view analytics.</p>
          <a href="/upload" class="btn btn-primary">Upload Document</a>
        </div>
      </div>
    </div>
  `;
}

/**
 * Render the upload page
 * @param {HTMLElement} container - The content container
 */
function renderUpload(container) {
  console.log('Rendering upload page');

  container.innerHTML = `
    <div class="upload-page">
      <h1 class="page-title">Upload Document</h1>
      <p class="page-description">Upload a financial document to analyze and extract information.</p>

      <div class="upload-form">
        <div class="form-group">
          <label for="document-name">Document Name (Optional)</label>
          <input type="text" id="document-name" class="form-control" placeholder="Enter document name">
        </div>

        <div class="form-group">
          <label for="document-type">Document Type</label>
          <select id="document-type" class="form-control">
            <option value="financial">Financial Report</option>
            <option value="portfolio">Portfolio Statement</option>
            <option value="tax">Tax Document</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div class="upload-area" id="upload-area">
          <p>Drag and drop your document here, or click to select a file</p>
          <input type="file" id="file-input" style="display: none">
          <button class="btn btn-primary" id="select-file-btn">Select File</button>
        </div>

        <div class="selected-file" id="selected-file" style="display: none">
          <p>Selected file: <span id="file-name"></span></p>
        </div>

        <div class="progress-container" id="progress-container" style="display: none">
          <p>Uploading...</p>
          <div class="progress">
            <div class="progress-bar" id="progress-bar"></div>
          </div>
          <p id="progress-text">0%</p>
        </div>

        <div class="form-actions">
          <button class="btn btn-primary" id="upload-btn">Upload Document</button>
          <button class="btn btn-secondary" id="cancel-btn">Cancel</button>
        </div>
      </div>
    </div>
  `;

  // Set up upload functionality
  setupUpload();
}

/**
 * Set up upload functionality
 */
function setupUpload() {
  const uploadArea = document.getElementById('upload-area');
  const fileInput = document.getElementById('file-input');
  const selectFileBtn = document.getElementById('select-file-btn');
  const selectedFile = document.getElementById('selected-file');
  const fileName = document.getElementById('file-name');
  const uploadBtn = document.getElementById('upload-btn');
  const cancelBtn = document.getElementById('cancel-btn');
  const progressContainer = document.getElementById('progress-container');
  const progressBar = document.getElementById('progress-bar');
  const progressText = document.getElementById('progress-text');

  if (!uploadArea || !fileInput || !selectFileBtn || !selectedFile || !fileName || !uploadBtn || !cancelBtn || !progressContainer || !progressBar || !progressText) {
    console.error('Upload elements not found');
    return;
  }

  // Handle file selection
  selectFileBtn.addEventListener('click', function() {
    fileInput.click();
  });

  fileInput.addEventListener('change', function() {
    if (this.files.length > 0) {
      fileName.textContent = this.files[0].name;
      selectedFile.style.display = 'block';
      uploadArea.style.display = 'none';
    }
  });

  // Handle drag and drop
  uploadArea.addEventListener('dragover', function(e) {
    e.preventDefault();
    this.classList.add('dragover');
  });

  uploadArea.addEventListener('dragleave', function() {
    this.classList.remove('dragover');
  });

  uploadArea.addEventListener('drop', function(e) {
    e.preventDefault();
    this.classList.remove('dragover');

    if (e.dataTransfer.files.length > 0) {
      fileInput.files = e.dataTransfer.files;
      fileName.textContent = e.dataTransfer.files[0].name;
      selectedFile.style.display = 'block';
      uploadArea.style.display = 'none';
    }
  });

  // Handle upload
  uploadBtn.addEventListener('click', function() {
    if (!fileInput.files.length) {
      alert('Please select a file to upload');
      return;
    }

    // Show progress
    progressContainer.style.display = 'block';
    uploadBtn.disabled = true;
    cancelBtn.disabled = true;

    // Create form data
    const formData = new FormData();
    formData.append('file', fileInput.files[0]);
    formData.append('name', document.getElementById('document-name').value || fileInput.files[0].name);
    formData.append('type', document.getElementById('document-type').value);

    // Upload file
    fetch('/api/documents/upload', {
      method: 'POST',
      body: formData
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Upload failed');
      }
      return response.json();
    })
    .then(data => {
      console.log('Upload successful:', data);

      // Set progress to 100%
      progressBar.style.width = '100%';
      progressText.textContent = '100%';

      // Show success message with option to process
      setTimeout(() => {
        const processNow = confirm('Document uploaded successfully! Would you like to process it now?');
        if (processNow && data.documentId) {
          // Navigate to document detail page and trigger processing
          localStorage.setItem('processDocumentOnLoad', 'true');
          navigateTo(`/documents/${data.documentId}`);
        } else {
          navigateTo('/documents-new');
        }
      }, 500);
    })
    .catch(error => {
      console.error('Error uploading document:', error);

      // Show error message
      alert('Error uploading document: ' + error.message);

      // Reset progress
      progressContainer.style.display = 'none';
      uploadBtn.disabled = false;
      cancelBtn.disabled = false;
    });
  });

  // Handle cancel
  cancelBtn.addEventListener('click', function() {
    navigateTo('/documents');
  });
}

/**
 * Render the chat page
 * @param {HTMLElement} container - The content container
 */
function renderChat(container) {
  console.log('Rendering chat page');

  container.innerHTML = `
    <div class="chat-page">
      <h1 class="page-title">Chat</h1>
      <p class="page-description">Ask questions about financial topics.</p>

      <div class="chat-container">
        <div class="chat-messages" id="chat-messages">
          <div class="message ai-message">
            <p>Hello! I'm your financial assistant. How can I help you today?</p>
          </div>
        </div>

        <div class="chat-input">
          <input type="text" id="chat-input" class="form-control" placeholder="Type your question...">
          <button class="btn btn-primary" id="send-btn">Send</button>
        </div>
      </div>
    </div>
  `;

  // Set up chat functionality
  setupChat();
}

/**
 * Set up chat functionality
 */
function setupChat() {
  const chatInput = document.getElementById('chat-input');
  const sendBtn = document.getElementById('send-btn');
  const chatMessages = document.getElementById('chat-messages');

  if (!chatInput || !sendBtn || !chatMessages) {
    console.error('Chat elements not found');
    return;
  }

  // Handle send button click
  sendBtn.addEventListener('click', function() {
    sendMessage();
  });

  // Handle enter key press
  chatInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
      sendMessage();
    }
  });

  // Send message function
  function sendMessage() {
    const message = chatInput.value.trim();

    if (!message) {
      return;
    }

    // Add user message
    chatMessages.innerHTML += `
      <div class="message user-message">
        <p>${message}</p>
      </div>
    `;

    // Clear input
    chatInput.value = '';

    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;

    // Simulate AI response
    setTimeout(() => {
      chatMessages.innerHTML += `
        <div class="message ai-message">
          <p>I'm a mock AI assistant. This is a simulated response to your question: "${message}"</p>
        </div>
      `;

      // Scroll to bottom
      chatMessages.scrollTop = chatMessages.scrollHeight;
    }, 1000);
  }
}

/**
 * Render the document chat page
 * @param {HTMLElement} container - The content container
 */
function renderDocumentChat(container) {
  console.log('Rendering document chat page');

  // Show loading state
  container.innerHTML = `
    <div class="document-chat-page">
      <h1 class="page-title">Document Chat</h1>
      <p class="page-description">Ask questions about your financial documents.</p>

      <div class="loading-container">
        <p>Loading documents...</p>
        <div class="loading-spinner"></div>
      </div>
    </div>
  `;

  // Fetch documents
  fetch('/api/documents')
    .then(response => {
      if (!response.ok) {
        throw new Error('Failed to fetch documents');
      }
      return response.json();
    })
    .then(documents => {
      // Filter processed documents
      const processedDocuments = documents.filter(doc => doc.processed);

      // Render document chat UI
      container.innerHTML = `
        <div class="document-chat-page">
          <h1 class="page-title">Document Chat</h1>
          <p class="page-description">Ask questions about your financial documents.</p>

          <div class="document-selector">
            <label for="document-select">Select a document:</label>
            <select id="document-select" class="form-control">
              <option value="">-- Select a document --</option>
              ${processedDocuments.map(doc => `
                <option value="${doc.id}">${doc.name}</option>
              `).join('')}
            </select>
          </div>

          ${processedDocuments.length === 0 ? `
            <div class="empty-state">
              <p>No processed documents found. Please process a document first.</p>
              <a href="/documents" class="btn btn-primary">Go to Documents</a>
            </div>
          ` : ''}

          <div class="document-chat-container" id="document-chat-container" style="display: none">
            <div class="chat-messages" id="document-chat-messages">
              <div class="message ai-message">
                <p>I'm ready to answer questions about the selected document.</p>
              </div>
            </div>

            <div class="chat-input">
              <input type="text" id="document-chat-input" class="form-control" placeholder="Type your question...">
              <button class="btn btn-primary" id="document-send-btn">Send</button>
            </div>
          </div>
        </div>
      `;

      // Set up document chat functionality
      setupDocumentChat(processedDocuments);
    })
    .catch(error => {
      console.error('Error fetching documents:', error);

      // Show error message
      container.innerHTML = `
        <div class="document-chat-page">
          <h1 class="page-title">Document Chat</h1>
          <p class="page-description">Ask questions about your financial documents.</p>

          <div class="error-message">
            <p>Error loading documents: ${error.message}</p>
            <button class="btn btn-primary" onclick="window.location.reload()">Retry</button>
          </div>
        </div>
      `;
    });
}

/**
 * Set up document chat functionality
 * @param {Array} documents - List of processed documents
 */
function setupDocumentChat(documents = []) {
  const documentSelect = document.getElementById('document-select');
  const documentChatContainer = document.getElementById('document-chat-container');
  const documentChatInput = document.getElementById('document-chat-input');
  const documentSendBtn = document.getElementById('document-send-btn');
  const documentChatMessages = document.getElementById('document-chat-messages');

  if (!documentSelect || !documentChatContainer || !documentChatInput || !documentSendBtn || !documentChatMessages) {
    console.error('Document chat elements not found');
    return;
  }

  // Store selected document
  let selectedDocument = null;

  // Handle document selection
  documentSelect.addEventListener('change', function() {
    selectDocument(this.value);
  });

  // Check if there's a selected document in localStorage (from document detail page)
  const savedDocumentId = localStorage.getItem('selectedDocumentId');
  if (savedDocumentId) {
    // Find the option with this value
    const option = documentSelect.querySelector(`option[value="${savedDocumentId}"]`);
    if (option) {
      // Select this option
      documentSelect.value = savedDocumentId;
      // Trigger document selection
      selectDocument(savedDocumentId);
    }
    // Clear the saved document ID
    localStorage.removeItem('selectedDocumentId');
  }

  // Function to select a document
  function selectDocument(documentId) {
    if (documentId) {
      // Find selected document
      selectedDocument = documents.find(doc => doc.id === documentId);

      if (selectedDocument) {
        // Show chat container
        documentChatContainer.style.display = 'block';

        // Clear messages
        documentChatMessages.innerHTML = `
          <div class="message ai-message">
            <p>I'm ready to answer questions about "${selectedDocument.name}". What would you like to know?</p>
          </div>
        `;

        // Focus on input
        documentChatInput.focus();
      } else {
        documentChatContainer.style.display = 'none';
        console.error('Selected document not found:', documentId);
      }
    } else {
      // Hide chat container if no document selected
      documentChatContainer.style.display = 'none';
      selectedDocument = null;
    }
  }

  // Handle send button click
  documentSendBtn.addEventListener('click', function() {
    sendDocumentMessage();
  });

  // Handle enter key press
  documentChatInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
      sendDocumentMessage();
    }
  });

  // Send message function
  function sendDocumentMessage() {
    const message = documentChatInput.value.trim();

    if (!message || !selectedDocument) {
      if (!selectedDocument) {
        // Show notification
        if (window.notification) {
          window.notification.showWarning('Please select a document first');
        } else {
          alert('Please select a document first');
        }
      }
      return;
    }

    // Add user message
    documentChatMessages.innerHTML += `
      <div class="message user-message">
        <p>${message}</p>
      </div>
    `;

    // Clear input
    documentChatInput.value = '';

    // Scroll to bottom
    documentChatMessages.scrollTop = documentChatMessages.scrollHeight;

    // Add loading message
    const loadingMessageId = 'loading-' + Date.now();
    documentChatMessages.innerHTML += `
      <div class="message ai-message" id="${loadingMessageId}">
        <p>Thinking...</p>
      </div>
    `;

    // Scroll to bottom
    documentChatMessages.scrollTop = documentChatMessages.scrollHeight;

    // Determine the correct API endpoint
    let apiEndpoint = `/api/documents/${selectedDocument.id}/chat`;

    // If document processor is available, use it
    if (window.documentProcessor && typeof window.documentProcessor.askDocumentQuestion === 'function') {
      window.documentProcessor.askDocumentQuestion(selectedDocument.id, message)
        .then(data => handleChatResponse(data, loadingMessageId))
        .catch(error => handleChatError(error, loadingMessageId));
    } else {
      // Send request to server
      fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(window.auth ? window.auth.getAuthHeaders() : {})
        },
        body: JSON.stringify({ question: message })
      })
      .then(response => {
        if (!response.ok) {
          throw new Error(`Failed to get response: ${response.status} ${response.statusText}`);
        }
        return response.json();
      })
      .then(data => handleChatResponse(data, loadingMessageId))
      .catch(error => handleChatError(error, loadingMessageId));
    }
  }

  // Handle chat response
  function handleChatResponse(data, loadingMessageId) {
    // Remove loading message
    const loadingMessage = document.getElementById(loadingMessageId);
    if (loadingMessage) {
      loadingMessage.remove();
    }

    // Get answer from response
    const answer = data.answer || data.response || data.content || data.text || 'I could not find an answer to your question.';

    // Format answer (replace newlines with <br>)
    const formattedAnswer = answer.replace(/\n/g, '<br>');

    // Add AI response
    documentChatMessages.innerHTML += `
      <div class="message ai-message">
        <p>${formattedAnswer}</p>
      </div>
    `;

    // Scroll to bottom
    documentChatMessages.scrollTop = documentChatMessages.scrollHeight;
  }

  // Handle chat error
  function handleChatError(error, loadingMessageId) {
    console.error('Error getting response:', error);

    // Remove loading message
    const loadingMessage = document.getElementById(loadingMessageId);
    if (loadingMessage) {
      loadingMessage.remove();
    }

    // Add error message
    documentChatMessages.innerHTML += `
      <div class="message ai-message error-message">
        <p>Sorry, I encountered an error: ${error.message}</p>
      </div>
    `;

    // Scroll to bottom
    documentChatMessages.scrollTop = documentChatMessages.scrollHeight;

    // Show notification
    if (window.notification) {
      window.notification.showError(`Chat error: ${error.message}`);
    }
  }
}

/**
 * Render the document comparison page
 * @param {HTMLElement} container - The content container
 */
function renderDocumentComparison(container) {
  console.log('Rendering document comparison page');

  container.innerHTML = `
    <div class="document-comparison-page">
      <h1 class="page-title">Document Comparison</h1>
      <p class="page-description">Compare two financial documents.</p>

      <div class="document-selectors">
        <div class="form-group">
          <label for="document-select-1">Select first document:</label>
          <select id="document-select-1" class="form-control">
            <option value="">-- Select a document --</option>
            <option value="doc-1">Financial Report 2023</option>
            <option value="doc-2">Investment Portfolio</option>
            <option value="doc-3">Tax Documents 2023</option>
          </select>
        </div>

        <div class="form-group">
          <label for="document-select-2">Select second document:</label>
          <select id="document-select-2" class="form-control">
            <option value="">-- Select a document --</option>
            <option value="doc-1">Financial Report 2023</option>
            <option value="doc-2">Investment Portfolio</option>
            <option value="doc-3">Tax Documents 2023</option>
          </select>
        </div>

        <button class="btn btn-primary" id="compare-btn">Compare Documents</button>
      </div>

      <div class="comparison-results" id="comparison-results" style="display: none">
        <h2>Comparison Results</h2>
        <p>This is a placeholder for document comparison results.</p>
      </div>
    </div>
  `;

  // Set up document comparison functionality
  setupDocumentComparison();
}

/**
 * Set up document comparison functionality
 */
function setupDocumentComparison() {
  const documentSelect1 = document.getElementById('document-select-1');
  const documentSelect2 = document.getElementById('document-select-2');
  const compareBtn = document.getElementById('compare-btn');
  const comparisonResults = document.getElementById('comparison-results');

  if (!documentSelect1 || !documentSelect2 || !compareBtn || !comparisonResults) {
    console.error('Document comparison elements not found');
    return;
  }

  // Handle compare button click
  compareBtn.addEventListener('click', function() {
    if (!documentSelect1.value || !documentSelect2.value) {
      alert('Please select two documents to compare');
      return;
    }

    if (documentSelect1.value === documentSelect2.value) {
      alert('Please select two different documents');
      return;
    }

    // Show comparison results
    comparisonResults.style.display = 'block';

    // Simulate API call
    setTimeout(() => {
      comparisonResults.innerHTML = `
        <h2>Comparison Results</h2>
        <p>This is a simulated comparison between the selected documents.</p>
        <div class="comparison-table">
          <table>
            <thead>
              <tr>
                <th>Feature</th>
                <th>${documentSelect1.options[documentSelect1.selectedIndex].text}</th>
                <th>${documentSelect2.options[documentSelect2.selectedIndex].text}</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Document Type</td>
                <td>Financial Report</td>
                <td>Portfolio Statement</td>
              </tr>
              <tr>
                <td>Date</td>
                <td>December 31, 2023</td>
                <td>December 15, 2023</td>
              </tr>
              <tr>
                <td>Total Value</td>
                <td>$1,250,000.00</td>
                <td>$1,125,000.00</td>
              </tr>
              <tr>
                <td>Securities Count</td>
                <td>15</td>
                <td>12</td>
              </tr>
            </tbody>
          </table>
        </div>
      `;
    }, 1000);
  });
}

/**
 * Render the settings page
 * @param {HTMLElement} container - The content container
 */
function renderSettings(container) {
  console.log('Rendering settings page');

  container.innerHTML = `
    <div class="settings-page">
      <h1 class="page-title">Settings</h1>
      <p class="page-description">Manage your account settings.</p>

      <div class="settings-form">
        <div class="form-group">
          <label for="user-name">Name</label>
          <input type="text" id="user-name" class="form-control" value="Test User">
        </div>

        <div class="form-group">
          <label for="user-email">Email</label>
          <input type="email" id="user-email" class="form-control" value="test@example.com" disabled>
        </div>

        <div class="form-group">
          <label>Notification Preferences</label>
          <div class="checkbox-group">
            <label>
              <input type="checkbox" checked> Email notifications
            </label>
            <label>
              <input type="checkbox" checked> Document processing alerts
            </label>
          </div>
        </div>

        <div class="form-actions">
          <button class="btn btn-primary" id="save-settings-btn">Save Settings</button>
        </div>
      </div>
    </div>
  `;

  // Set up settings functionality
  setupSettings();
}

/**
 * Set up settings functionality
 */
function setupSettings() {
  const saveSettingsBtn = document.getElementById('save-settings-btn');

  if (!saveSettingsBtn) {
    console.error('Settings elements not found');
    return;
  }

  // Handle save button click
  saveSettingsBtn.addEventListener('click', function() {
    alert('Settings saved successfully!');
  });
}

/**
 * Render the test page
 * @param {HTMLElement} container - The content container
 */
function renderTest(container) {
  console.log('Rendering test page');

  container.innerHTML = `
    <div class="test-page">
      <h1 class="page-title">Test Page</h1>
      <p class="page-description">This page is for testing purposes.</p>

      <div class="test-content">
        <h2>API Test</h2>
        <button class="btn btn-primary" id="test-api-btn">Test API</button>
        <div id="api-result"></div>

        <h2>UI Components</h2>
        <div class="ui-components">
          <button class="btn btn-primary">Primary Button</button>
          <button class="btn btn-secondary">Secondary Button</button>
          <button class="btn btn-danger">Danger Button</button>
        </div>

        <h2>Agent Cards</h2>
        <div class="agent-cards-container">
          <div class="agent-card">
            <div class="agent-card-header">
              <h3>Document Analyzer</h3>
              <span class="status-indicator status-active">Active</span>
            </div>
            <div class="agent-card-body">
              <p>Analyzes financial documents and extracts key information.</p>
              <div class="agent-stats">
                <div class="stat">
                  <span class="stat-label">Documents Processed</span>
                  <span class="stat-value">24</span>
                </div>
                <div class="stat">
                  <span class="stat-label">Success Rate</span>
                  <span class="stat-value">98%</span>
                </div>
              </div>
            </div>
            <div class="agent-card-footer">
              <button class="agent-action btn-primary">Configure</button>
              <button class="agent-action btn-secondary">View Logs</button>
              <button class="agent-action btn-danger">Reset</button>
            </div>
          </div>

          <div class="agent-card">
            <div class="agent-card-header">
              <h3>Table Understanding</h3>
              <span class="status-indicator status-idle">Idle</span>
            </div>
            <div class="agent-card-body">
              <p>Extracts and analyzes tables from financial documents.</p>
              <div class="agent-stats">
                <div class="stat">
                  <span class="stat-label">Tables Processed</span>
                  <span class="stat-value">56</span>
                </div>
                <div class="stat">
                  <span class="stat-label">Success Rate</span>
                  <span class="stat-value">92%</span>
                </div>
              </div>
            </div>
            <div class="agent-card-footer">
              <button class="agent-action btn-primary">Configure</button>
              <button class="agent-action btn-secondary">View Logs</button>
              <button class="agent-action btn-danger">Reset</button>
            </div>
          </div>

          <div class="agent-card">
            <div class="agent-card-header">
              <h3>Securities Extractor</h3>
              <span class="status-indicator status-error">Error</span>
            </div>
            <div class="agent-card-body">
              <p>Extracts securities information from financial documents.</p>
              <div class="agent-stats">
                <div class="stat">
                  <span class="stat-label">Securities Found</span>
                  <span class="stat-value">128</span>
                </div>
                <div class="stat">
                  <span class="stat-label">Success Rate</span>
                  <span class="stat-value">85%</span>
                </div>
              </div>
            </div>
            <div class="agent-card-footer">
              <button class="agent-action btn-primary">Configure</button>
              <button class="agent-action btn-secondary">View Logs</button>
              <button class="agent-action btn-danger">Reset</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  // Set up test functionality
  setupTest();
}

/**
 * Set up test functionality
 */
function setupTest() {
  const testApiBtn = document.getElementById('test-api-btn');
  const apiResult = document.getElementById('api-result');

  if (!testApiBtn || !apiResult) {
    console.error('Test elements not found');
    return;
  }

  // Handle test API button click
  testApiBtn.addEventListener('click', function() {
    apiResult.innerHTML = '<p>Testing API...</p>';

    // Simulate API call
    setTimeout(() => {
      apiResult.innerHTML = `
        <p>API test successful!</p>
        <pre>{
  "success": true,
  "message": "API is working",
  "timestamp": "${new Date().toISOString()}"
}</pre>
      `;
    }, 1000);
  });
}

/**
 * Render the simple test page
 * @param {HTMLElement} container - The content container
 */
function renderSimpleTest(container) {
  console.log('Rendering simple test page');

  container.innerHTML = `
    <div class="simple-test-page">
      <h1 class="page-title">Simple Test</h1>
      <p class="page-description">This is a simple test page.</p>

      <div class="test-content">
        <p>This page is working correctly if you can see this text.</p>
      </div>
    </div>
  `;
}

/**
 * Render the 404 page
 * @param {HTMLElement} container - The content container
 */
function renderNotFound(container) {
  console.log('Rendering 404 page');

  container.innerHTML = `
    <div class="not-found-page">
      <h1 class="page-title">404 - Page Not Found</h1>
      <p class="page-description">The page you are looking for does not exist.</p>

      <div class="not-found-content">
        <p>Please check the URL or go back to the <a href="/" onclick="navigateTo('/'); return false;">dashboard</a>.</p>
      </div>
    </div>
  `;
}

/**
 * Render the document detail page
 * @param {HTMLElement} container - The content container
 * @param {string} documentId - The document ID
 */
function renderDocumentDetail(container, documentId) {
  console.log('Rendering document detail page for document:', documentId);

  // Show loading state
  container.innerHTML = `
    <div class="document-detail-page">
      <h1 class="page-title">Document Details</h1>
      <p class="page-description">Loading document details...</p>
      <div class="loading-spinner"></div>
    </div>
  `;

  // Fetch document details
  fetch(`/api/documents/${documentId}`)
    .then(response => {
      if (!response.ok) {
        throw new Error('Failed to fetch document details');
      }
      return response.json();
    })
    .then(document => {
      // Render document details
      renderDocumentDetails(container, document);
    })
    .catch(error => {
      console.error('Error fetching document details:', error);

      // Show error message
      container.innerHTML = `
        <div class="document-detail-page">
          <h1 class="page-title">Document Details</h1>
          <p class="page-description">Error loading document details</p>
          <div class="error-message">
            <p>${error.message}</p>
          </div>
          <div class="action-buttons">
            <a href="/documents" class="btn btn-primary">Back to Documents</a>
          </div>
        </div>
      `;
    });
}

/**
 * Render document details
 * @param {HTMLElement} container - The content container
 * @param {Object} document - The document object
 */
function renderDocumentDetails(container, document) {
  console.log('Rendering document details:', document);

  // Format dates
  const uploadDate = new Date(document.uploadDate).toLocaleString();
  const processedDate = document.processedAt ? new Date(document.processedAt).toLocaleString() : 'Not processed';

  // Get status class and text
  const statusClass = document.processed ? 'status-processed' :
                     document.processing ? 'status-processing' : 'status-pending';
  const statusText = document.processed ? 'Processed' :
                    document.processing ? 'Processing' : 'Pending';

  // Render document details
  container.innerHTML = `
    <div class="document-detail-page">
      <div class="document-header">
        <h1 class="page-title">${document.name}</h1>
        <div class="document-status ${statusClass}">
          ${statusText}
        </div>
      </div>

      <div class="document-info">
        <div class="info-item">
          <span class="info-label">File Name:</span>
          <span class="info-value">${document.fileName}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Document Type:</span>
          <span class="info-value">${document.documentType || 'Unknown'}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Upload Date:</span>
          <span class="info-value">${uploadDate}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Processing Date:</span>
          <span class="info-value">${processedDate}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Status:</span>
          <span class="info-value">${document.status || (document.processed ? 'Completed' : 'Pending')}</span>
        </div>
      </div>

      <div class="action-buttons">
        <a href="/documents" class="btn btn-secondary">Back to Documents</a>
        ${!document.processed && !document.processing ?
          `<button id="process-document-btn" class="btn btn-primary">Process Document</button>` :
          document.processed ?
          `<button id="reprocess-document-btn" class="btn btn-primary">Reprocess Document</button>` :
          ''
        }
        <button id="download-document-btn" class="btn btn-secondary">Download Document</button>
        ${document.processed ?
          `<a href="/document-chat" class="btn btn-primary" onclick="localStorage.setItem('selectedDocumentId', '${document.id}')">Chat with Document</a>` :
          ''
        }
      </div>

      ${document.processed ? renderProcessedContent(document) : ''}

      <div id="processing-status" class="processing-status" style="display: ${document.processing ? 'block' : 'none'};">
        <h3>Processing Document...</h3>
        <div class="progress">
          <div class="progress-bar" id="processing-progress-bar" style="width: ${document.progress || 0}%"></div>
        </div>
        <p id="processing-status-text">${document.statusMessage || 'Starting processing...'}</p>
      </div>
    </div>
  `;

  // Add event listeners
  setupDocumentDetailActions(document.id);

  // Check if we should automatically process the document
  const shouldProcessOnLoad = localStorage.getItem('processDocumentOnLoad') === 'true';
  if (shouldProcessOnLoad && !document.processed && !document.processing) {
    // Clear the flag
    localStorage.removeItem('processDocumentOnLoad');

    // Trigger processing after a short delay
    setTimeout(() => {
      const processBtn = document.getElementById('process-document-btn');
      if (processBtn) {
        processBtn.click();
      }
    }, 500);
  }
}

/**
 * Render processed content
 * @param {Object} document - The document object
 * @returns {string} - HTML for processed content
 */
function renderProcessedContent(document) {
  if (!document.processed || !document.content) {
    return '';
  }

  let html = '<div class="processed-content">';

  // Add extracted text if available
  if (document.content.text) {
    html += `
      <div class="content-section">
        <h3>Extracted Text</h3>
        <div class="text-content">
          <p>${document.content.text.substring(0, 500)}${document.content.text.length > 500 ? '...' : ''}</p>
          ${document.content.text.length > 500 ?
            '<button class="btn btn-link" id="show-more-text">Show More</button>' :
            ''
          }
        </div>
      </div>
    `;
  }

  // Add tables if available
  if (document.content.tables && document.content.tables.length > 0) {
    html += `
      <div class="content-section">
        <h3>Extracted Tables (${document.content.tables.length})</h3>
        <div class="tables-list">
    `;

    // Add first table
    const firstTable = document.content.tables[0];
    html += renderTable(firstTable);

    // Add button to show all tables if there are more
    if (document.content.tables.length > 1) {
      html += `<button class="btn btn-link" id="show-all-tables">Show All Tables (${document.content.tables.length})</button>`;
    }

    html += '</div></div>';
  }

  // Add securities if available
  if (document.content.securities && document.content.securities.length > 0) {
    html += `
      <div class="content-section">
        <h3>Extracted Securities (${document.content.securities.length})</h3>
        <div class="securities-list">
          <table class="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>ISIN</th>
                <th>Quantity</th>
                <th>Price</th>
              </tr>
            </thead>
            <tbody>
    `;

    // Add securities
    document.content.securities.forEach(security => {
      const price = typeof security.price === 'object' ?
        `${security.price.currency || ''}${security.price.value}` :
        security.price;

      html += `
        <tr>
          <td>${security.name || ''}</td>
          <td>${security.isin || ''}</td>
          <td>${security.quantity !== null ? security.quantity : ''}</td>
          <td>${price !== null ? price : ''}</td>
        </tr>
      `;
    });

    html += '</tbody></table></div></div>';
  }

  html += '</div>';
  return html;
}

/**
 * Render a table
 * @param {Object} table - The table object
 * @returns {string} - HTML for the table
 */
function renderTable(table) {
  if (!table || !table.headers || !table.rows) {
    return '<p>No table data available</p>';
  }

  let html = `
    <div class="table-container">
      <h4>${table.name || 'Table'}</h4>
      <table class="data-table">
        <thead>
          <tr>
  `;

  // Add headers
  table.headers.forEach(header => {
    html += `<th>${header}</th>`;
  });

  html += '</tr></thead><tbody>';

  // Add rows (limit to 10 rows initially)
  const rowsToShow = Math.min(10, table.rows.length);
  for (let i = 0; i < rowsToShow; i++) {
    html += '<tr>';
    table.rows[i].forEach(cell => {
      html += `<td>${cell}</td>`;
    });
    html += '</tr>';
  }

  html += '</tbody></table>';

  // Add button to show more rows if there are more
  if (table.rows.length > 10) {
    html += `<button class="btn btn-link show-more-rows" data-table-id="${table.id}">Show More Rows (${table.rows.length - 10} more)</button>`;
  }

  html += '</div>';
  return html;
}

/**
 * Set up document detail actions
 * @param {Object} document - The document object
 */
function setupDocumentDetailActions(document) {
  // Process document button
  const processBtn = document.getElementById('process-document-btn');
  if (processBtn) {
    processBtn.addEventListener('click', function() {
      processDocument(document.id);
    });
  }

  // Reprocess document button
  const reprocessBtn = document.getElementById('reprocess-document-btn');
  if (reprocessBtn) {
    reprocessBtn.addEventListener('click', function() {
      processDocument(document.id, true);
    });
  }

  // Download document button
  const downloadBtn = document.getElementById('download-document-btn');
  if (downloadBtn) {
    downloadBtn.addEventListener('click', function() {
      // Create a temporary link to download the file
      const link = document.createElement('a');
      link.href = `/api/documents/${document.id}/download`;
      link.download = document.fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
  }

  // Show more text button
  const showMoreTextBtn = document.getElementById('show-more-text');
  if (showMoreTextBtn) {
    showMoreTextBtn.addEventListener('click', function() {
      const textContent = document.querySelector('.text-content');
      if (textContent) {
        textContent.innerHTML = `<p>${document.content.text}</p>`;
      }
    });
  }

  // Show all tables button
  const showAllTablesBtn = document.getElementById('show-all-tables');
  if (showAllTablesBtn) {
    showAllTablesBtn.addEventListener('click', function() {
      const tablesList = document.querySelector('.tables-list');
      if (tablesList) {
        let tablesHtml = '';
        document.content.tables.forEach(table => {
          tablesHtml += renderTable(table);
        });
        tablesList.innerHTML = tablesHtml;
      }
    });
  }

  // Show more rows buttons
  document.querySelectorAll('.show-more-rows').forEach(btn => {
    btn.addEventListener('click', function() {
      const tableId = this.getAttribute('data-table-id');
      const table = document.content.tables.find(t => t.id === tableId);
      if (table) {
        const tableContainer = this.closest('.table-container');
        if (tableContainer) {
          tableContainer.innerHTML = renderTable(table, true); // Render with all rows
        }
      }
    });
  });
}

/**
 * Process a document
 * @param {string} documentId - The document ID
 * @param {boolean} reprocess - Whether to reprocess the document
 */
function processDocument(documentId, reprocess = false) {
  console.log(`${reprocess ? 'Reprocessing' : 'Processing'} document:`, documentId);

  // Show processing status
  const processingStatus = document.getElementById('processing-status');
  const progressBar = document.getElementById('processing-progress-bar');
  const statusText = document.getElementById('processing-status-text');

  if (processingStatus && progressBar && statusText) {
    processingStatus.style.display = 'block';
    progressBar.style.width = '0%';
    statusText.textContent = 'Starting processing...';

    // Disable process buttons
    const processBtn = document.getElementById('process-document-btn');
    const reprocessBtn = document.getElementById('reprocess-document-btn');

    if (processBtn) processBtn.disabled = true;
    if (reprocessBtn) reprocessBtn.disabled = true;

    // Start processing
    fetch(`/api/documents/${documentId}/process${reprocess ? '?reprocess=true' : ''}`, {
      method: 'POST'
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Failed to start processing');
      }
      return response.json();
    })
    .then(data => {
      console.log('Processing started:', data);

      // Update status
      statusText.textContent = 'Processing started. This may take a few minutes...';
      progressBar.style.width = '10%';

      // Poll for processing status
      pollProcessingStatus(documentId);
    })
    .catch(error => {
      console.error('Error starting processing:', error);

      // Show error
      statusText.textContent = `Error: ${error.message}`;
      processingStatus.classList.add('error');

      // Re-enable process buttons
      if (processBtn) processBtn.disabled = false;
      if (reprocessBtn) reprocessBtn.disabled = false;
    });
  }
}

/**
 * Poll for processing status
 * @param {string} documentId - The document ID
 */
function pollProcessingStatus(documentId) {
  const processingStatus = document.getElementById('processing-status');
  const progressBar = document.getElementById('processing-progress-bar');
  const statusText = document.getElementById('processing-status-text');

  if (!processingStatus || !progressBar || !statusText) {
    return;
  }

  // Poll for status
  const pollInterval = setInterval(() => {
    fetch(`/api/documents/${documentId}/status`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to get processing status');
        }
        return response.json();
      })
      .then(status => {
        console.log('Processing status:', status);

        // Update progress
        progressBar.style.width = `${status.progress || 0}%`;
        statusText.textContent = status.message || `Processing: ${status.progress || 0}%`;

        // Check if processing is complete
        if (status.processed || status.status === 'completed') {
          clearInterval(pollInterval);

          // Show success
          statusText.textContent = 'Processing completed successfully!';
          progressBar.style.width = '100%';

          // Reload document details after a short delay
          setTimeout(() => {
            // Reload the page to show the processed document
            window.location.reload();
          }, 1500);
        }

        // Check if processing failed
        if (status.status === 'error') {
          clearInterval(pollInterval);

          // Show error
          statusText.textContent = `Error: ${status.message || 'Processing failed'}`;
          processingStatus.classList.add('error');

          // Re-enable process buttons
          const processBtn = document.getElementById('process-document-btn');
          const reprocessBtn = document.getElementById('reprocess-document-btn');

          if (processBtn) processBtn.disabled = false;
          if (reprocessBtn) reprocessBtn.disabled = false;
        }
      })
      .catch(error => {
        console.error('Error polling processing status:', error);

        // Continue polling even if there's an error
        statusText.textContent = 'Checking processing status...';
      });
  }, 2000); // Poll every 2 seconds
}

/**
 * Set up document detail actions
 * @param {string} documentId - The document ID
 */
function setupDocumentDetailActions(documentId) {
  // Get action buttons
  const processBtn = document.getElementById('process-document-btn');
  const reprocessBtn = document.getElementById('reprocess-document-btn');
  const downloadBtn = document.getElementById('download-document-btn');

  // Add event listener to process button
  if (processBtn) {
    processBtn.addEventListener('click', function() {
      processDocumentFromDetail(documentId, false);
    });
  }

  // Add event listener to reprocess button
  if (reprocessBtn) {
    reprocessBtn.addEventListener('click', function() {
      processDocumentFromDetail(documentId, true);
    });
  }

  // Add event listener to download button
  if (downloadBtn) {
    downloadBtn.addEventListener('click', function() {
      window.open(`/api/documents/${documentId}/download`, '_blank');
    });
  }
}

/**
 * Process a document from the detail page
 * @param {string} documentId - The document ID
 * @param {boolean} reprocess - Whether to reprocess the document
 */
function processDocumentFromDetail(documentId, reprocess = false) {
  console.log(`${reprocess ? 'Reprocessing' : 'Processing'} document from detail page:`, documentId);

  // Show processing status
  const processingStatus = document.getElementById('processing-status');
  const progressBar = document.getElementById('processing-progress-bar');
  const statusText = document.getElementById('processing-status-text');

  if (!processingStatus || !progressBar || !statusText) {
    console.error('Processing status elements not found');
    return;
  }

  // Show processing status
  processingStatus.style.display = 'block';
  progressBar.style.width = '0%';
  statusText.textContent = 'Starting processing...';

  // Update document status
  const statusElement = document.querySelector('.document-status');
  if (statusElement) {
    statusElement.className = 'document-status status-processing';
    statusElement.textContent = 'Processing';
  }

  // Disable buttons
  const processButton = document.getElementById('process-document-btn');
  const reprocessButton = document.getElementById('reprocess-document-btn');

  if (processButton) processButton.disabled = true;
  if (reprocessButton) reprocessButton.disabled = true;

  // Start processing
  fetch(`/api/documents/${documentId}/process${reprocess ? '?reprocess=true' : ''}`, {
    method: 'POST'
  })
  .then(response => {
    if (!response.ok) {
      throw new Error('Failed to start processing');
    }
    return response.json();
  })
  .then(data => {
    console.log('Processing started:', data);

    // Update progress
    progressBar.style.width = '10%';
    statusText.textContent = 'Processing started. This may take a few minutes...';

    // Start polling for status
    pollProcessingStatusFromDetail(documentId);
  })
  .catch(error => {
    console.error('Error starting processing:', error);

    // Show error
    statusText.textContent = `Error: ${error.message}`;
    processingStatus.classList.add('error');

    // Re-enable buttons
    if (processButton) processButton.disabled = false;
    if (reprocessButton) reprocessButton.disabled = false;

    // Update status
    if (statusElement) {
      statusElement.className = 'document-status status-error';
      statusElement.textContent = 'Error';
    }
  });
}

/**
 * Poll for processing status from the detail page
 * @param {string} documentId - The document ID
 */
function pollProcessingStatusFromDetail(documentId) {
  const processingStatus = document.getElementById('processing-status');
  const progressBar = document.getElementById('processing-progress-bar');
  const statusText = document.getElementById('processing-status-text');

  if (!processingStatus || !progressBar || !statusText) {
    console.error('Processing status elements not found');
    return;
  }

  // Poll for status
  const pollInterval = setInterval(() => {
    fetch(`/api/documents/${documentId}/status`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to get processing status');
        }
        return response.json();
      })
      .then(status => {
        console.log('Processing status:', status);

        // Update progress
        progressBar.style.width = `${status.progress || 0}%`;
        statusText.textContent = status.message || `Processing: ${status.progress || 0}%`;

        // Check if processing is complete
        if (status.processed || status.status === 'completed') {
          clearInterval(pollInterval);

          // Show success
          statusText.textContent = 'Processing completed successfully!';
          progressBar.style.width = '100%';

          // Reload document details after a short delay
          setTimeout(() => {
            window.location.reload();
          }, 1500);
        }

        // Check if processing failed
        if (status.status === 'error') {
          clearInterval(pollInterval);

          // Show error
          statusText.textContent = `Error: ${status.message || 'Processing failed'}`;
          processingStatus.classList.add('error');

          // Re-enable buttons
          const processButton = document.getElementById('process-document-btn');
          const reprocessButton = document.getElementById('reprocess-document-btn');

          if (processButton) processButton.disabled = false;
          if (reprocessButton) reprocessButton.disabled = false;

          // Update status
          const statusElement = document.querySelector('.document-status');
          if (statusElement) {
            statusElement.className = 'document-status status-error';
            statusElement.textContent = 'Error';
          }
        }
      })
      .catch(error => {
        console.error('Error polling processing status:', error);
        // Continue polling even if there's an error
      });
  }, 2000); // Poll every 2 seconds
}

/**
 * Process a document from the detail page
 * @param {string} documentId - The document ID
 * @param {boolean} reprocess - Whether to reprocess the document
 */
function processDocumentFromDetail(documentId, reprocess = false) {
  console.log(`${reprocess ? 'Reprocessing' : 'Processing'} document from detail page:`, documentId);

  // Use the document processor if available
  if (window.documentProcessor && typeof window.documentProcessor.processDocument === 'function') {
    // Show processing status
    const processingStatus = document.getElementById('processing-status');
    const progressBar = document.getElementById('processing-progress-bar');
    const statusText = document.getElementById('processing-status-text');

    if (processingStatus && progressBar && statusText) {
      processingStatus.style.display = 'block';
      progressBar.style.width = '0%';
      statusText.textContent = 'Starting processing...';

      // Disable process buttons
      const processBtn = document.getElementById('process-document-btn');
      const reprocessBtn = document.getElementById('reprocess-document-btn');

      if (processBtn) processBtn.disabled = true;
      if (reprocessBtn) reprocessBtn.disabled = true;

      // Process document using the document processor
      window.documentProcessor.processDocument(documentId, reprocess)
        .then(data => {
          console.log('Processing started:', data);

          // Update status
          statusText.textContent = 'Processing started. This may take a few minutes...';
          progressBar.style.width = '10%';

          // Poll for processing status
          const pollInterval = window.documentProcessor.pollDocumentProcessingStatus(
            documentId,
            // Progress callback
            (status) => {
              console.log('Processing status update:', status);
              progressBar.style.width = `${status.progress || 0}%`;
              statusText.textContent = status.message || `Processing: ${status.progress || 0}%`;
            },
            // Complete callback
            (status) => {
              console.log('Processing completed:', status);
              statusText.textContent = 'Processing completed successfully!';
              progressBar.style.width = '100%';

              // Reload document details after a short delay
              setTimeout(() => {
                window.location.reload();
              }, 1500);
            },
            // Error callback
            (error) => {
              console.error('Processing error:', error);
              statusText.textContent = `Error: ${error.message || 'Processing failed'}`;
              processingStatus.classList.add('error');

              // Re-enable process buttons
              if (processBtn) processBtn.disabled = false;
              if (reprocessBtn) reprocessBtn.disabled = false;
            }
          );
        })
        .catch(error => {
          console.error('Error starting processing:', error);

          // Show error
          statusText.textContent = `Error: ${error.message}`;
          processingStatus.classList.add('error');

          // Re-enable process buttons
          if (processBtn) processBtn.disabled = false;
          if (reprocessBtn) reprocessBtn.disabled = false;
        });
    }
  } else {
    // Fall back to the built-in process function
    processDocument(documentId, reprocess);
  }
}

/**
 * Render the login page
 * @param {HTMLElement} container - The content container
 */
function renderLogin(container) {
  console.log('Rendering login page');

  container.innerHTML = `
    <div class="login-page">
      <div class="auth-form-container">
        <h1 class="auth-form-title">Login to FinDoc Analyzer</h1>
        <p class="auth-form-subtitle">Access your financial documents and analytics</p>

        <div id="auth-error" class="auth-error"></div>

        <form id="login-form" class="auth-form">
          <div class="form-group">
            <label for="login-email">Email</label>
            <input type="email" id="login-email" name="email" class="form-control" placeholder="Enter your email" required>
          </div>

          <div class="form-group">
            <label for="login-password">Password</label>
            <input type="password" id="login-password" name="password" class="form-control" placeholder="Enter your password" required>
          </div>

          <div class="form-group form-check">
            <input type="checkbox" id="remember-me" class="form-check-input">
            <label for="remember-me" class="form-check-label">Remember me</label>
            <a href="/forgot-password" class="forgot-password-link">Forgot password?</a>
          </div>

          <div class="auth-form-actions">
            <button type="submit" class="btn btn-primary btn-block">Login</button>
          </div>
        </form>

        <div class="auth-divider">
          <span>OR</span>
        </div>

        <button type="button" id="google-login-btn" class="btn btn-outline-secondary btn-block google-login-btn">
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" class="google-icon">
          <span>Login with Google</span>
        </button>

        <div class="auth-form-footer">
          <p>Don't have an account? <a href="/signup" onclick="navigateTo('/signup'); return false;">Sign up</a></p>
        </div>
      </div>
    </div>
  `;

  // Set up auth listeners after rendering the form
  setupAuthListeners();
}

/**
 * Render the signup page
 * @param {HTMLElement} container - The content container
 */
function renderSignup(container) {
  console.log('Rendering signup page');

  container.innerHTML = `
    <div class="signup-page">
      <div class="auth-form-container">
        <h1 class="auth-form-title">Create an Account</h1>
        <p class="auth-form-subtitle">Join FinDoc Analyzer to analyze your financial documents</p>

        <div id="auth-error" class="auth-error"></div>

        <form id="register-form" class="auth-form">
          <div class="form-group">
            <label for="register-name">Full Name</label>
            <input type="text" id="register-name" name="name" class="form-control" placeholder="Enter your full name" required>
          </div>

          <div class="form-group">
            <label for="register-email">Email</label>
            <input type="email" id="register-email" name="email" class="form-control" placeholder="Enter your email" required>
          </div>

          <div class="form-group">
            <label for="register-password">Password</label>
            <input type="password" id="register-password" name="password" class="form-control" placeholder="Create a password" required>
            <div class="password-strength-meter">
              <div class="strength-bar"></div>
            </div>
            <small class="password-hint">Password must be at least 8 characters long with letters and numbers</small>
          </div>

          <div class="form-group form-check">
            <input type="checkbox" id="terms-checkbox" class="form-check-input" required>
            <label for="terms-checkbox" class="form-check-label">I agree to the <a href="/terms" target="_blank">Terms of Service</a> and <a href="/privacy" target="_blank">Privacy Policy</a></label>
          </div>

          <div class="auth-form-actions">
            <button type="submit" class="btn btn-primary btn-block">Create Account</button>
          </div>
        </form>

        <div class="auth-divider">
          <span>OR</span>
        </div>

        <button type="button" id="google-login-btn" class="btn btn-outline-secondary btn-block google-login-btn">
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" class="google-icon">
          <span>Sign up with Google</span>
        </button>

        <div class="auth-form-footer">
          <p>Already have an account? <a href="/login" onclick="navigateTo('/login'); return false;">Login</a></p>
        </div>
      </div>
    </div>
  `;

  // Set up auth listeners after rendering the form
  setupAuthListeners();

  // Set up password strength meter
  setupPasswordStrengthMeter();
}

/**
 * Set up password strength meter
 */
function setupPasswordStrengthMeter() {
  const passwordInput = document.getElementById('register-password');
  const strengthBar = document.querySelector('.strength-bar');
  const passwordHint = document.querySelector('.password-hint');

  if (!passwordInput || !strengthBar || !passwordHint) {
    return;
  }

  passwordInput.addEventListener('input', function() {
    const password = this.value;
    const strength = calculatePasswordStrength(password);

    // Update strength bar
    strengthBar.style.width = `${strength}%`;

    // Update color based on strength
    if (strength < 30) {
      strengthBar.style.backgroundColor = '#ff4d4d'; // Weak (red)
      passwordHint.textContent = 'Weak password. Try adding numbers and special characters.';
    } else if (strength < 60) {
      strengthBar.style.backgroundColor = '#ffa64d'; // Medium (orange)
      passwordHint.textContent = 'Medium strength. Try adding special characters.';
    } else if (strength < 80) {
      strengthBar.style.backgroundColor = '#ffff4d'; // Good (yellow)
      passwordHint.textContent = 'Good password. Consider making it longer.';
    } else {
      strengthBar.style.backgroundColor = '#4dff4d'; // Strong (green)
      passwordHint.textContent = 'Strong password!';
    }
  });
}

/**
 * Calculate password strength percentage
 * @param {string} password - The password to check
 * @returns {number} - Strength percentage (0-100)
 */
function calculatePasswordStrength(password) {
  if (!password) {
    return 0;
  }

  let strength = 0;

  // Length contribution (up to 40%)
  const lengthContribution = Math.min(password.length * 4, 40);
  strength += lengthContribution;

  // Character variety contribution (up to 60%)
  if (/[a-z]/.test(password)) strength += 10; // lowercase
  if (/[A-Z]/.test(password)) strength += 10; // uppercase
  if (/[0-9]/.test(password)) strength += 10; // numbers
  if (/[^a-zA-Z0-9]/.test(password)) strength += 15; // special chars

  // Bonus for mixed character types
  const varietyCount = (/[a-z]/.test(password) ? 1 : 0) +
                       (/[A-Z]/.test(password) ? 1 : 0) +
                       (/[0-9]/.test(password) ? 1 : 0) +
                       (/[^a-zA-Z0-9]/.test(password) ? 1 : 0);

  if (varietyCount >= 3) strength += 15;

  return Math.min(strength, 100);
}

/**
 * Render the not found page
 * @param {HTMLElement} container - The content container
 */
function renderNotFound(container) {
  console.log('Rendering 404 page');

  container.innerHTML = `
    <div class="not-found-page">
      <h1 class="page-title">404 - Page Not Found</h1>
      <p>The page you are looking for does not exist.</p>
      <a href="/" class="btn btn-primary">Go to Dashboard</a>
    </div>
  `;
}

// Export the navigateTo function for use in other scripts
window.navigateTo = navigateTo;
