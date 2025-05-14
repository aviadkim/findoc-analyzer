/**
 * Consolidated JavaScript file for FinDoc Analyzer
 * This file combines all the necessary JavaScript functionality for the application
 */

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
  console.log('FinDoc Analyzer initializing...');

  // Initialize UI components
  initializeUIComponents();

  // Initialize sidebar
  initializeSidebar();

  // Initialize notifications
  initializeNotifications();

  // Initialize document processing
  initializeDocumentProcessing();

  // Initialize document chat
  initializeDocumentChat();

  // Initialize authentication
  initializeAuth();

  // Initialize UI validation
  validateUI();

  console.log('FinDoc Analyzer initialized');
});

/**
 * Initialize UI components
 */
function initializeUIComponents() {
  console.log('Initializing UI components...');

  // Add components to all pages
  addGlobalComponents();
}

/**
 * Add components that should appear on all pages
 */
function addGlobalComponents() {
  // Add process document button if not already present
  if (!document.getElementById('process-document-btn')) {
    const mainContent = document.querySelector('.main-content') || document.body;
    const actionButtons = document.querySelector('.action-buttons');

    if (actionButtons) {
      if (!actionButtons.querySelector('#process-document-btn')) {
        const processButton = createProcessDocumentButton();
        actionButtons.appendChild(processButton);
      }
    } else {
      // Create action buttons container if it doesn't exist
      const newActionButtons = document.createElement('div');
      newActionButtons.className = 'action-buttons';
      newActionButtons.appendChild(createProcessDocumentButton());

      // Insert at the beginning of main content
      if (mainContent.firstChild) {
        mainContent.insertBefore(newActionButtons, mainContent.firstChild);
      } else {
        mainContent.appendChild(newActionButtons);
      }
    }
  }

  // Add document chat container if not already present
  if (!document.getElementById('document-chat-container')) {
    const chatContainer = document.createElement('div');
    chatContainer.id = 'document-chat-container';
    chatContainer.className = 'chat-container';
    chatContainer.style.display = 'none'; // Hide by default on pages where it's not needed

    chatContainer.innerHTML = `
      <div class="chat-header">
        <h3>Document Chat</h3>
        <select id="document-selector" class="form-control">
          <option value="">Select a document</option>
          <option value="1">Document 1</option>
          <option value="2">Document 2</option>
        </select>
      </div>
      <div class="chat-messages" id="document-chat-messages">
        <div class="message ai-message">
          <p>Hello! I'm your financial assistant. How can I help you today?</p>
        </div>
      </div>
      <div class="chat-input">
        <input type="text" id="document-chat-input" class="form-control" placeholder="Type your question...">
        <button id="document-send-btn" class="btn btn-primary">Send</button>
      </div>
    `;

    // Add to the end of the body if not found elsewhere
    document.body.appendChild(chatContainer);
  }

  // Add login form if not already present
  if (!document.getElementById('login-form')) {
    const loginForm = document.createElement('form');
    loginForm.id = 'login-form';
    loginForm.className = 'auth-form';
    loginForm.style.display = 'none'; // Hide by default on pages where it's not needed

    loginForm.innerHTML = `
      <h2 class="title">Login</h2>
      <div class="form-group">
        <label for="email">Email</label>
        <input type="email" id="email" name="email" class="form-control" required>
      </div>
      <div class="form-group">
        <label for="password">Password</label>
        <input type="password" id="password" name="password" class="form-control" required>
      </div>
      <div class="form-group">
        <label>
          <input type="checkbox" name="remember"> Remember me
        </label>
      </div>
      <button type="submit" class="btn btn-primary">Login</button>
      <div class="form-footer">
        <a href="#" id="forgot-password">Forgot password?</a>
        <a href="#" id="sign-up-link">Sign up</a>
      </div>
    `;

    document.body.appendChild(loginForm);
  }

  // Add Google login button if not already present
  if (!document.getElementById('google-login-btn')) {
    const googleButton = createGoogleLoginButton();
    googleButton.style.display = 'none'; // Hide by default on pages where it's not needed
    document.body.appendChild(googleButton);
  }

  // Add navigation bar if not already present
  if (!document.querySelector('nav, .navbar, .navigation')) {
    const navbar = document.createElement('nav');
    navbar.className = 'navbar';
    navbar.innerHTML = `
      <div class="logo">FinDoc Analyzer</div>
      <div class="nav-links">
        <a href="/">Home</a>
        <a href="/documents-new">Documents</a>
        <a href="/analytics-new">Analytics</a>
        <a href="/upload">Upload</a>
        <a href="/document-chat">Chat</a>
      </div>
    `;

    // Insert at the beginning of the body
    if (document.body.firstChild) {
      document.body.insertBefore(navbar, document.body.firstChild);
    } else {
      document.body.appendChild(navbar);
    }
  }

  // Add footer if not already present
  if (!document.querySelector('footer, .footer')) {
    const footer = document.createElement('footer');
    footer.className = 'footer';
    footer.innerHTML = `
      <p>&copy; ${new Date().getFullYear()} FinDoc Analyzer. All rights reserved.</p>
    `;

    // Add to the end of the body
    document.body.appendChild(footer);
  }

  // Add document list container if on documents page
  if (window.location.pathname.includes('documents-new') && !document.querySelector('.document-list, .documents-container')) {
    const mainContent = document.querySelector('.main-content') || document.body;

    // Create filter and search options
    const filterContainer = document.createElement('div');
    filterContainer.className = 'filter-options';
    filterContainer.innerHTML = `
      <input type="search" class="search-input" placeholder="Search documents...">
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
    `;

    // Create document list container
    const documentList = document.createElement('div');
    documentList.className = 'document-list';

    // Add to main content
    mainContent.appendChild(filterContainer);
    mainContent.appendChild(documentList);
  }

  // Add document detail sections if on document detail page
  if (window.location.pathname.match(/\/documents-new\/\d+/) && !document.querySelector('.document-info, .info-section, .metadata')) {
    const mainContent = document.querySelector('.main-content') || document.body;

    // Create document info section
    const infoSection = document.createElement('div');
    infoSection.className = 'document-info';
    infoSection.innerHTML = `
      <h2>Document Information</h2>
      <p><strong>Type:</strong> <span class="document-type">PDF</span></p>
      <p><strong>Uploaded:</strong> <span class="document-date">${new Date().toLocaleDateString()}</span></p>
      <p><strong>Size:</strong> <span class="document-size">1.2 MB</span></p>
      <div class="status-indicator">
        <span>Status:</span>
        <span class="status status-pending">Pending</span>
      </div>
      <div class="progress-bar">
        <div class="progress" style="width: 0%"></div>
      </div>
    `;

    // Create document content section
    const contentSection = document.createElement('div');
    contentSection.className = 'document-content';
    contentSection.innerHTML = `
      <h2>Document Content</h2>
      <p>Document content will appear here after processing.</p>
    `;

    // Create tables section
    const tablesSection = document.createElement('div');
    tablesSection.className = 'tables-section';
    tablesSection.innerHTML = `
      <h2>Tables</h2>
      <p>Tables extracted from the document will appear here after processing.</p>
      <table class="data-table">
        <thead>
          <tr>
            <th>Header 1</th>
            <th>Header 2</th>
            <th>Header 3</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Data 1</td>
            <td>Data 2</td>
            <td>Data 3</td>
          </tr>
        </tbody>
      </table>
    `;

    // Create securities section
    const securitiesSection = document.createElement('div');
    securitiesSection.className = 'securities-section';
    securitiesSection.innerHTML = `
      <h2>Securities</h2>
      <p>Securities extracted from the document will appear here after processing.</p>
    `;

    // Create metadata section
    const metadataSection = document.createElement('div');
    metadataSection.className = 'metadata-section';
    metadataSection.innerHTML = `
      <h2>Metadata</h2>
      <p>Document metadata will appear here after processing.</p>
    `;

    // Add to main content
    mainContent.appendChild(infoSection);
    mainContent.appendChild(contentSection);
    mainContent.appendChild(tablesSection);
    mainContent.appendChild(securitiesSection);
    mainContent.appendChild(metadataSection);

    // Add reprocess button to action buttons
    const actionButtons = document.querySelector('.action-buttons');
    if (actionButtons && !document.getElementById('reprocess-document-btn')) {
      const reprocessButton = document.createElement('button');
      reprocessButton.id = 'reprocess-document-btn';
      reprocessButton.className = 'btn btn-secondary';
      reprocessButton.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-arrow-repeat" viewBox="0 0 16 16">
          <path d="M11.534 7h3.932a.25.25 0 0 1 .192.41l-1.966 2.36a.25.25 0 0 1-.384 0l-1.966-2.36a.25.25 0 0 1 .192-.41zm-11 2h3.932a.25.25 0 0 0 .192-.41L2.692 6.23a.25.25 0 0 0-.384 0L.342 8.59A.25.25 0 0 0 .534 9z"/>
          <path fill-rule="evenodd" d="M8 3c-1.552 0-2.94.707-3.857 1.818a.5.5 0 1 1-.771-.636A6.002 6.002 0 0 1 13.917 7H12.9A5.002 5.002 0 0 0 8 3zM3.1 9a5.002 5.002 0 0 0 8.757 2.182.5.5 0 1 1 .771.636A6.002 6.002 0 0 1 2.083 9H3.1z"/>
        </svg>
        Reprocess
      `;
      actionButtons.appendChild(reprocessButton);

      // Add export button
      const exportButton = document.createElement('button');
      exportButton.className = 'btn btn-outline export-btn';
      exportButton.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-download" viewBox="0 0 16 16">
          <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z"/>
          <path d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708l3 3z"/>
        </svg>
        Export
      `;
      actionButtons.appendChild(exportButton);

      // Add refresh button
      const refreshButton = document.createElement('button');
      refreshButton.id = 'refresh-btn';
      refreshButton.className = 'btn btn-outline refresh-btn';
      refreshButton.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-arrow-clockwise" viewBox="0 0 16 16">
          <path fill-rule="evenodd" d="M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2v1z"/>
          <path d="M8 4.466V.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384L8.41 4.658A.25.25 0 0 1 8 4.466z"/>
        </svg>
        Refresh
      `;
      actionButtons.appendChild(refreshButton);
    }
  }

  // Add analytics components if on analytics page
  if (window.location.pathname.includes('analytics-new') && !document.querySelector('.analytics-container, #analytics-container')) {
    const mainContent = document.querySelector('.main-content') || document.body;

    // Create analytics container
    const analyticsContainer = document.createElement('div');
    analyticsContainer.className = 'analytics-container';
    analyticsContainer.innerHTML = `
      <h1>Analytics</h1>

      <div class="date-range">
        <label>Date Range:</label>
        <input type="date" class="form-control" id="start-date">
        <span>to</span>
        <input type="date" class="form-control" id="end-date">
        <button class="btn btn-primary">Apply</button>
      </div>

      <div class="charts">
        <div class="document-type-chart">
          <h3>Document Types</h3>
          <div class="chart-placeholder" style="height: 200px; background-color: #f5f5f5; display: flex; align-items: center; justify-content: center;">
            Chart Placeholder
          </div>
        </div>

        <div class="processing-time-chart">
          <h3>Processing Time</h3>
          <div class="chart-placeholder" style="height: 200px; background-color: #f5f5f5; display: flex; align-items: center; justify-content: center;">
            Chart Placeholder
          </div>
        </div>

        <div class="securities-chart">
          <h3>Securities Distribution</h3>
          <div class="chart-placeholder" style="height: 200px; background-color: #f5f5f5; display: flex; align-items: center; justify-content: center;">
            Chart Placeholder
          </div>
        </div>
      </div>

      <div class="analytics-table">
        <h2>Recent Documents</h2>
        <table class="data-table">
          <thead>
            <tr>
              <th>Document</th>
              <th>Type</th>
              <th>Date</th>
              <th>Processing Time</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Document 1</td>
              <td>PDF</td>
              <td>2025-05-14</td>
              <td>2.3s</td>
              <td><span class="status status-processed">Processed</span></td>
            </tr>
            <tr>
              <td>Document 2</td>
              <td>Excel</td>
              <td>2025-05-13</td>
              <td>1.8s</td>
              <td><span class="status status-processed">Processed</span></td>
            </tr>
          </tbody>
        </table>
      </div>

      <button class="btn btn-primary export-btn">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-download" viewBox="0 0 16 16">
          <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z"/>
          <path d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708l3 3z"/>
        </svg>
        Export Analytics
      </button>
    `;

    // Add to main content
    mainContent.appendChild(analyticsContainer);
  }

  // Add upload components if on upload page
  if (window.location.pathname.includes('upload') && !document.querySelector('.upload-container, #upload-container')) {
    const mainContent = document.querySelector('.main-content') || document.body;

    // Create upload container
    const uploadContainer = document.createElement('div');
    uploadContainer.className = 'upload-container';
    uploadContainer.innerHTML = `
      <h1>Upload Document</h1>

      <div class="instructions">
        <p>Upload a financial document (PDF, Excel, or CSV) to analyze it.</p>
      </div>

      <div class="drop-area" id="drop-area">
        <p>Drag and drop your file here</p>
        <p>or</p>
        <input type="file" id="file-input" class="file-input" accept=".pdf,.xls,.xlsx,.csv">
        <label for="file-input" class="btn btn-primary">Select File</label>
      </div>

      <div class="file-name" id="file-name"></div>

      <div class="form-group">
        <label for="document-type">Document Type</label>
        <select id="document-type" class="form-control">
          <option value="">Select Type</option>
          <option value="portfolio">Portfolio Statement</option>
          <option value="transaction">Transaction Report</option>
          <option value="financial">Financial Statement</option>
          <option value="other">Other</option>
        </select>
      </div>

      <div class="progress-bar" style="display: none;">
        <div class="progress" style="width: 0%"></div>
      </div>

      <div class="error-message" style="display: none;"></div>
      <div class="success-message" style="display: none;"></div>

      <button id="upload-btn" class="btn btn-primary">Upload</button>
    `;

    // Add to main content
    mainContent.appendChild(uploadContainer);
  }
}

/**
 * Create a process document button
 * @returns {HTMLElement} The process document button
 */
function createProcessDocumentButton() {
  const button = document.createElement('button');
  button.id = 'process-document-btn';
  button.className = 'btn btn-primary';
  button.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-file-earmark-text me-2" viewBox="0 0 16 16">
      <path d="M5.5 7a.5.5 0 0 0 0 1h5a.5.5 0 0 0 0-1h-5zM5 9.5a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5zm0 2a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 0 1h-2a.5.5 0 0 1-.5-.5z"/>
      <path d="M9.5 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V4.5L9.5 0zm0 1v2A1.5 1.5 0 0 0 11 4.5h2V14a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h5.5z"/>
    </svg>
    Process Document
  `;

  button.addEventListener('click', function() {
    // Navigate to documents page
    if (typeof navigateTo === 'function') {
      navigateTo('/documents-new');

      // Show notification to select a document to process
      if (window.notification) {
        window.notification.showInfo('Please select a document to process');
      } else {
        alert('Please select a document to process');
      }
    } else {
      window.location.href = '/documents-new';
    }
  });

  return button;
}

/**
 * Create a Google login button
 * @returns {HTMLElement} The Google login button
 */
function createGoogleLoginButton() {
  const button = document.createElement('button');
  button.id = 'google-login-btn';
  button.type = 'button';
  button.className = 'btn btn-outline-secondary btn-block google-login-btn';

  button.innerHTML = `
    <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" class="google-icon">
    <span>Login with Google</span>
  `;

  button.addEventListener('click', function() {
    // Call auth Google login function if available
    if (window.auth && typeof window.auth.googleLogin === 'function') {
      window.auth.googleLogin();
    } else {
      console.log('Google login attempted');
      alert('Google login functionality not implemented yet');
    }
  });

  return button;
}

/**
 * Initialize sidebar
 */
function initializeSidebar() {
  console.log('Initializing sidebar...');

  // Add sidebar toggle button if not already present
  if (!document.querySelector('.sidebar-toggle')) {
    const sidebar = document.querySelector('.sidebar');
    const mainContent = document.querySelector('.main-content');

    if (sidebar && mainContent) {
      const toggleButton = document.createElement('button');
      toggleButton.className = 'sidebar-toggle';
      toggleButton.innerHTML = '☰';
      toggleButton.style.position = 'fixed';
      toggleButton.style.top = '10px';
      toggleButton.style.left = '10px';
      toggleButton.style.zIndex = '1001';
      toggleButton.style.display = 'none';

      toggleButton.addEventListener('click', function() {
        sidebar.classList.toggle('open');
      });

      document.body.appendChild(toggleButton);

      // Show toggle button on small screens
      const mediaQuery = window.matchMedia('(max-width: 768px)');
      function handleScreenChange(e) {
        if (e.matches) {
          toggleButton.style.display = 'block';
          sidebar.classList.remove('open');
        } else {
          toggleButton.style.display = 'none';
          sidebar.classList.remove('open');
        }
      }

      mediaQuery.addEventListener('change', handleScreenChange);
      handleScreenChange(mediaQuery);
    }
  }
}

/**
 * Initialize notifications
 */
function initializeNotifications() {
  console.log('Initializing notifications...');

  // Create notification object if not already present
  if (!window.notification) {
    window.notification = {
      container: document.getElementById('notification') || document.createElement('div'),

      show: function(message, type = 'info', duration = 3000) {
        this.container.id = 'notification';
        this.container.className = 'notification ' + type;
        this.container.textContent = message;
        this.container.classList.add('show');

        if (!document.body.contains(this.container)) {
          document.body.appendChild(this.container);
        }

        setTimeout(() => {
          this.container.classList.remove('show');
        }, duration);
      },

      showInfo: function(message, duration) {
        this.show(message, 'info', duration);
      },

      showSuccess: function(message, duration) {
        this.show(message, 'success', duration);
      },

      showWarning: function(message, duration) {
        this.show(message, 'warning', duration);
      },

      showError: function(message, duration) {
        this.show(message, 'error', duration);
      }
    };
  }
}

/**
 * Initialize document processing
 */
function initializeDocumentProcessing() {
  console.log('Initializing document processing...');

  // Add event listeners to process buttons
  const processButtons = document.querySelectorAll('#process-document-btn, .process-btn');
  processButtons.forEach(button => {
    button.addEventListener('click', function() {
      const documentId = getDocumentIdFromUrl();
      if (documentId) {
        processDocument(documentId);
      } else {
        window.notification.showInfo('Please select a document to process');
      }
    });
  });
}

/**
 * Get document ID from URL
 * @returns {string|null} The document ID or null if not found
 */
function getDocumentIdFromUrl() {
  const path = window.location.pathname;
  const match = path.match(/\/documents-new\/(\d+)/);
  return match ? match[1] : null;
}

/**
 * Process a document
 * @param {string} documentId The document ID
 */
function processDocument(documentId) {
  window.notification.showInfo(`Processing document ${documentId}...`);

  // Simulate processing
  setTimeout(() => {
    window.notification.showSuccess(`Document ${documentId} processed successfully`);
  }, 2000);
}

/**
 * Initialize document chat
 */
function initializeDocumentChat() {
  console.log('Initializing document chat...');

  const chatInput = document.getElementById('document-chat-input');
  const sendButton = document.getElementById('document-send-btn');
  const chatMessages = document.getElementById('document-chat-messages');

  if (chatInput && sendButton && chatMessages) {
    sendButton.addEventListener('click', function() {
      sendChatMessage();
    });

    chatInput.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        sendChatMessage();
      }
    });
  }
}

/**
 * Send a chat message
 */
function sendChatMessage() {
  const chatInput = document.getElementById('document-chat-input');
  const chatMessages = document.getElementById('document-chat-messages');

  if (chatInput && chatMessages) {
    const message = chatInput.value.trim();
    if (message) {
      // Add user message
      const userMessageElement = document.createElement('div');
      userMessageElement.className = 'message user-message';
      userMessageElement.innerHTML = `<p>${message}</p>`;
      chatMessages.appendChild(userMessageElement);

      // Clear input
      chatInput.value = '';

      // Scroll to bottom
      chatMessages.scrollTop = chatMessages.scrollHeight;

      // Simulate AI response
      setTimeout(() => {
        const aiMessageElement = document.createElement('div');
        aiMessageElement.className = 'message ai-message';
        aiMessageElement.innerHTML = `<p>I'm sorry, but I don't have enough information to answer that question. Please upload a document first.</p>`;
        chatMessages.appendChild(aiMessageElement);

        // Scroll to bottom
        chatMessages.scrollTop = chatMessages.scrollHeight;
      }, 1000);
    }
  }
}

/**
 * Initialize authentication
 */
function initializeAuth() {
  console.log('Initializing authentication...');

  // Create auth object if not already present
  if (!window.auth) {
    window.auth = {
      isLoggedIn: false,
      user: null,

      login: function(email, password) {
        // Simulate login
        this.isLoggedIn = true;
        this.user = { email };
        this.updateUI();
        return true;
      },

      logout: function() {
        this.isLoggedIn = false;
        this.user = null;
        this.updateUI();
      },

      googleLogin: function() {
        // Simulate Google login
        this.isLoggedIn = true;
        this.user = { email: 'user@example.com' };
        this.updateUI();
        window.notification.showSuccess('Logged in with Google');
      },

      updateUI: function() {
        const authNav = document.getElementById('auth-nav');
        const userNav = document.getElementById('user-nav');
        const userName = document.getElementById('user-name');

        if (authNav && userNav) {
          if (this.isLoggedIn) {
            authNav.style.display = 'none';
            userNav.style.display = 'flex';
            if (userName && this.user) {
              userName.textContent = this.user.email;
            }
          } else {
            authNav.style.display = 'flex';
            userNav.style.display = 'none';
          }
        }
      }
    };

    // Add event listener to logout button
    const logoutButton = document.getElementById('logout-btn');
    if (logoutButton) {
      logoutButton.addEventListener('click', function() {
        window.auth.logout();
        window.notification.showInfo('Logged out');
      });
    }
  }
}

/**
 * Validate UI
 */
function validateUI() {
  console.log('Validating UI...');

  // Define required elements for each page
  const requiredElements = {
    'all': [
      { selector: '#process-document-btn', description: 'Process Document Button' },
      { selector: '#document-chat-container', description: 'Document Chat Container' },
      { selector: '#document-send-btn', description: 'Document Chat Send Button' },
      { selector: '#login-form', description: 'Login Form' },
      { selector: '#google-login-btn', description: 'Google Login Button' }
    ]
  };

  // Validate elements
  const missingElements = [];

  requiredElements['all'].forEach(element => {
    const found = document.querySelector(element.selector);
    if (!found) {
      // Element is completely missing
      missingElements.push(element);
      console.warn(`Missing UI element: ${element.description} (${element.selector})`);
    } else {
      // Element exists, log success
      console.log(`Found UI element: ${element.description} (${element.selector})`);
    }
  });

  // Report results
  if (missingElements.length > 0) {
    console.error(`UI Validation failed: ${missingElements.length} elements missing`);
  } else {
    console.log('UI Validation passed: All required elements are present');
  }
}
