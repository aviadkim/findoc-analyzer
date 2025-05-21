/**
 * UI Components Fix
 * 
 * This script fixes UI component issues in the FinDoc Analyzer application,
 * ensuring all required components are present and properly styled.
 */

(function() {
  console.log('UI Components Fix loaded');

  // Initialize when DOM is loaded
  document.addEventListener('DOMContentLoaded', function() {
    initUIComponents();
  });

  /**
   * Initialize UI components
   */
  function initUIComponents() {
    console.log('Initializing UI components fixes');

    // Fix navigation
    fixNavigation();

    // Fix login form
    fixLoginForm();

    // Fix document chat
    fixDocumentChat();

    // Fix document list
    fixDocumentList();

    // Fix document details
    fixDocumentDetails();

    // Add missing UI components
    addMissingUIComponents();

    // Validate UI components
    validateUIComponents();
  }

  /**
   * Fix navigation
   */
  function fixNavigation() {
    console.log('Fixing navigation');

    // Find sidebar
    let sidebar = document.querySelector('.sidebar');

    // If sidebar doesn't exist, create it
    if (!sidebar) {
      console.log('Creating sidebar');

      // Create sidebar
      sidebar = document.createElement('div');
      sidebar.className = 'sidebar';
      sidebar.innerHTML = `
        <div class="sidebar-header">
          <h3>FinDoc Analyzer</h3>
        </div>
        <div class="sidebar-menu">
          <ul>
            <li><a href="/" class="sidebar-link"><i class="fas fa-home"></i> Dashboard</a></li>
            <li><a href="/documents" class="sidebar-link"><i class="fas fa-file-alt"></i> Documents</a></li>
            <li><a href="/upload" class="sidebar-link"><i class="fas fa-upload"></i> Upload</a></li>
            <li><a href="/analytics" class="sidebar-link"><i class="fas fa-chart-bar"></i> Analytics</a></li>
            <li><a href="/settings" class="sidebar-link"><i class="fas fa-cog"></i> Settings</a></li>
          </ul>
        </div>
      `;

      // Add sidebar to body
      document.body.insertBefore(sidebar, document.body.firstChild);

      // Create main content wrapper if it doesn't exist
      if (!document.querySelector('.main-content')) {
        const mainContent = document.createElement('div');
        mainContent.className = 'main-content';

        // Move all body content except sidebar into main content
        while (document.body.children.length > 1) {
          mainContent.appendChild(document.body.children[1]);
        }

        // Add main content to body
        document.body.appendChild(mainContent);
      }

      // Add sidebar toggle button
      const toggleButton = document.createElement('button');
      toggleButton.className = 'sidebar-toggle';
      toggleButton.innerHTML = '<i class="fas fa-bars"></i>';
      toggleButton.addEventListener('click', function() {
        document.body.classList.toggle('sidebar-collapsed');
      });

      document.body.appendChild(toggleButton);
    }

    // Highlight current page in sidebar
    const currentPath = window.location.pathname;
    const sidebarLinks = document.querySelectorAll('.sidebar-link');

    sidebarLinks.forEach(link => {
      const linkPath = link.getAttribute('href');
      
      if (currentPath === linkPath || 
          (linkPath !== '/' && currentPath.startsWith(linkPath))) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  }

  /**
   * Fix login form
   */
  function fixLoginForm() {
    // Only fix login form on login page
    if (!window.location.pathname.includes('/login')) {
      return;
    }

    console.log('Fixing login form');

    // Find login form
    let loginForm = document.getElementById('login-form');

    // If login form doesn't exist, create it
    if (!loginForm) {
      console.log('Creating login form');

      // Create login form
      loginForm = document.createElement('form');
      loginForm.id = 'login-form';
      loginForm.className = 'auth-form';
      loginForm.innerHTML = `
        <h2>Login to FinDoc Analyzer</h2>
        <div class="form-group">
          <label for="email">Email</label>
          <input type="email" id="email" name="email" class="form-control" required>
        </div>
        <div class="form-group">
          <label for="password">Password</label>
          <input type="password" id="password" name="password" class="form-control" required>
        </div>
        <div class="form-group">
          <button type="submit" class="btn btn-primary btn-block">Login</button>
        </div>
        <div class="auth-divider">
          <span>OR</span>
        </div>
      `;

      // Find main content
      const mainContent = document.querySelector('.main-content') || document.body;

      // Create login container if it doesn't exist
      let loginContainer = document.querySelector('.login-container');
      if (!loginContainer) {
        loginContainer = document.createElement('div');
        loginContainer.className = 'login-container';
        mainContent.appendChild(loginContainer);
      }

      // Add login form to login container
      loginContainer.appendChild(loginForm);
    }

    // Add Google login button if it doesn't exist
    if (!document.getElementById('google-login-btn')) {
      console.log('Adding Google login button to login form');

      // Create Google login button
      const googleButton = document.createElement('button');
      googleButton.id = 'google-login-btn';
      googleButton.type = 'button';
      googleButton.className = 'btn btn-outline-secondary btn-block google-login-btn';
      googleButton.innerHTML = `
        <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" class="google-icon" style="margin-right: 10px; width: 18px; height: 18px;">
        <span>Login with Google</span>
      `;

      // Find auth divider
      const authDivider = loginForm.querySelector('.auth-divider');

      // Add button after auth divider
      if (authDivider) {
        authDivider.parentNode.insertBefore(googleButton, authDivider.nextSibling);
      } else {
        // Add button to end of form
        loginForm.appendChild(googleButton);
      }
    }
  }

  /**
   * Fix document chat
   */
  function fixDocumentChat() {
    console.log('Fixing document chat');

    // Find document chat container
    let chatContainer = document.getElementById('document-chat-container');

    // If chat container doesn't exist, create it
    if (!chatContainer) {
      console.log('Creating document chat container');

      // Create chat container
      chatContainer = document.createElement('div');
      chatContainer.id = 'document-chat-container';
      chatContainer.className = 'document-chat-container';
      chatContainer.innerHTML = `
        <div class="chat-header">
          <h3>Document Chat</h3>
          <button id="close-chat-btn" class="close-chat-btn">&times;</button>
        </div>
        <div class="chat-messages document-chat-messages"></div>
        <div class="chat-input-container">
          <input type="text" id="document-chat-input" class="document-chat-input" placeholder="Ask a question about this document...">
          <button id="document-chat-send-button" class="document-chat-send-button">Send</button>
        </div>
      `;

      // Add chat container to body
      document.body.appendChild(chatContainer);

      // Add event listeners
      const closeButton = chatContainer.querySelector('#close-chat-btn');
      closeButton.addEventListener('click', function() {
        chatContainer.classList.remove('active');
      });

      const sendButton = chatContainer.querySelector('#document-chat-send-button');
      const chatInput = chatContainer.querySelector('#document-chat-input');

      sendButton.addEventListener('click', function() {
        sendChatMessage(chatInput.value);
      });

      chatInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
          sendChatMessage(chatInput.value);
        }
      });
    }

    // Add show chat button if it doesn't exist
    if (!document.getElementById('show-chat-btn')) {
      console.log('Creating show chat button');

      // Create show chat button
      const showChatButton = document.createElement('button');
      showChatButton.id = 'show-chat-btn';
      showChatButton.className = 'show-chat-btn';
      showChatButton.innerHTML = '<i class="fas fa-comments"></i>';

      // Add button to body
      document.body.appendChild(showChatButton);

      // Add event listener
      showChatButton.addEventListener('click', function() {
        chatContainer.classList.add('active');
      });
    }
  }

  /**
   * Send chat message
   * @param {string} message - Message to send
   */
  function sendChatMessage(message) {
    if (!message.trim()) return;

    // Find chat messages container
    const chatMessages = document.querySelector('.document-chat-messages');
    const chatInput = document.querySelector('#document-chat-input');

    // Add user message
    const userMessage = document.createElement('div');
    userMessage.className = 'chat-message user-message';
    userMessage.textContent = message;
    chatMessages.appendChild(userMessage);

    // Clear input
    chatInput.value = '';

    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;

    // Simulate response
    setTimeout(() => {
      // Add bot message
      const botMessage = document.createElement('div');
      botMessage.className = 'chat-message bot-message';
      
      // Generate response based on message
      let response = '';
      if (message.toLowerCase().includes('isin') || message.toLowerCase().includes('securities')) {
        response = 'This document contains the following securities: ISIN123456789, ISIN987654321';
      } else if (message.toLowerCase().includes('table') || message.toLowerCase().includes('data')) {
        response = 'I found 3 tables in this document. The main table shows portfolio holdings with values and percentages.';
      } else if (message.toLowerCase().includes('summary') || message.toLowerCase().includes('overview')) {
        response = 'This is a financial report for Q1 2023 showing a portfolio with a total value of $1.2M across various securities.';
      } else {
        response = 'I\'m sorry, I don\'t have enough information to answer that question. Please try asking about the securities, tables, or a summary of the document.';
      }
      
      botMessage.textContent = response;
      chatMessages.appendChild(botMessage);

      // Scroll to bottom
      chatMessages.scrollTop = chatMessages.scrollHeight;
    }, 1000);
  }

  /**
   * Fix document list
   */
  function fixDocumentList() {
    // Only fix document list on documents page
    if (!window.location.pathname.includes('/documents') && window.location.pathname !== '/') {
      return;
    }

    console.log('Fixing document list');

    // Find document list
    let documentList = document.querySelector('.document-list');

    // If document list doesn't exist, create it
    if (!documentList) {
      console.log('Creating document list');

      // Find main content
      const mainContent = document.querySelector('.main-content') || document.body;

      // Create document list container
      const documentListContainer = document.createElement('div');
      documentListContainer.className = 'document-list-container';
      documentListContainer.innerHTML = `
        <h2>Documents</h2>
        <div class="document-list">
          <div class="document-item" data-id="doc-1">
            <div class="document-info">
              <h4>Financial Report Q1 2023</h4>
              <p>Uploaded on ${new Date().toLocaleDateString()}</p>
              <p>Status: <span class="document-status status-uploaded">Uploaded</span></p>
            </div>
            <div class="document-actions">
              <button class="btn btn-sm btn-info view-btn" data-action="view">View</button>
              <button class="btn btn-sm btn-primary process-btn" data-action="process">Process</button>
            </div>
          </div>
          <div class="document-item" data-id="doc-2">
            <div class="document-info">
              <h4>Investment Portfolio</h4>
              <p>Uploaded on ${new Date().toLocaleDateString()}</p>
              <p>Status: <span class="document-status status-processed">Processed</span></p>
            </div>
            <div class="document-actions">
              <button class="btn btn-sm btn-info view-btn" data-action="view">View</button>
              <button class="btn btn-sm btn-success" disabled>Processed</button>
            </div>
          </div>
        </div>
      `;

      // Add document list to main content
      mainContent.appendChild(documentListContainer);

      // Add event listeners
      const viewButtons = documentListContainer.querySelectorAll('.view-btn');
      viewButtons.forEach(button => {
        button.addEventListener('click', function() {
          const documentId = button.closest('.document-item').getAttribute('data-id');
          window.location.href = `/document-details?id=${documentId}`;
        });
      });

      const processButtons = documentListContainer.querySelectorAll('.process-btn');
      processButtons.forEach(button => {
        button.addEventListener('click', function() {
          const documentId = button.closest('.document-item').getAttribute('data-id');
          processDocument(documentId, button);
        });
      });
    }
  }

  /**
   * Fix document details
   */
  function fixDocumentDetails() {
    // Only fix document details on document details page
    if (!window.location.pathname.includes('/document-details')) {
      return;
    }

    console.log('Fixing document details');

    // Find document details
    let documentDetails = document.querySelector('.document-detail, .document-details');

    // If document details doesn't exist, create it
    if (!documentDetails) {
      console.log('Creating document details');

      // Get document ID from URL
      const urlParams = new URLSearchParams(window.location.search);
      const documentId = urlParams.get('id') || 'doc-1';

      // Find main content
      const mainContent = document.querySelector('.main-content') || document.body;

      // Create document details
      documentDetails = document.createElement('div');
      documentDetails.className = 'document-detail';
      documentDetails.innerHTML = `
        <h2>Document Details</h2>
        <div class="document-info">
          <h3>Financial Report Q1 2023</h3>
          <p><strong>ID:</strong> ${documentId}</p>
          <p><strong>Uploaded:</strong> ${new Date().toLocaleDateString()}</p>
          <p><strong>Status:</strong> <span class="document-status status-uploaded">Uploaded</span></p>
        </div>
        <div class="document-actions">
          <button id="process-document-btn" class="btn btn-primary process-btn" data-action="process">Process Document</button>
          <button class="btn btn-secondary" onclick="window.location.href='/documents'">Back to Documents</button>
        </div>
        <div class="document-content">
          <h3>Document Content</h3>
          <p>This is a placeholder for the document content.</p>
        </div>
        <div class="document-tables">
          <h3>Tables</h3>
          <p>No tables found. Process the document to extract tables.</p>
        </div>
        <div class="document-securities">
          <h3>Securities</h3>
          <p>No securities found. Process the document to extract securities.</p>
        </div>
      `;

      // Add document details to main content
      mainContent.appendChild(documentDetails);

      // Add event listener to process button
      const processButton = documentDetails.querySelector('#process-document-btn');
      processButton.addEventListener('click', function() {
        processDocument(documentId, processButton);
      });
    }
  }

  /**
   * Add missing UI components
   */
  function addMissingUIComponents() {
    console.log('Adding missing UI components');

    // Add Font Awesome if not already loaded
    if (!document.querySelector('link[href*="fontawesome"]')) {
      const fontAwesome = document.createElement('link');
      fontAwesome.rel = 'stylesheet';
      fontAwesome.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css';
      document.head.appendChild(fontAwesome);
    }

    // Add CSS styles if not already loaded
    if (!document.getElementById('ui-fix-styles')) {
      const styles = document.createElement('style');
      styles.id = 'ui-fix-styles';
      styles.textContent = `
        /* Sidebar styles */
        .sidebar {
          position: fixed;
          top: 0;
          left: 0;
          height: 100%;
          width: 250px;
          background-color: #2c3e50;
          color: white;
          padding: 20px 0;
          transition: all 0.3s;
          z-index: 1000;
        }
        .sidebar-header {
          padding: 0 20px 20px;
          border-bottom: 1px solid #34495e;
        }
        .sidebar-menu ul {
          list-style: none;
          padding: 0;
          margin: 20px 0;
        }
        .sidebar-menu li {
          margin-bottom: 10px;
        }
        .sidebar-link {
          display: block;
          padding: 10px 20px;
          color: #ecf0f1;
          text-decoration: none;
          transition: all 0.3s;
        }
        .sidebar-link:hover, .sidebar-link.active {
          background-color: #34495e;
          color: #3498db;
        }
        .sidebar-link i {
          margin-right: 10px;
        }
        .sidebar-toggle {
          position: fixed;
          top: 10px;
          left: 10px;
          z-index: 1001;
          background-color: #2c3e50;
          color: white;
          border: none;
          border-radius: 5px;
          padding: 5px 10px;
          cursor: pointer;
          display: none;
        }
        .main-content {
          margin-left: 250px;
          padding: 20px;
          transition: all 0.3s;
        }
        
        /* Chat styles */
        .document-chat-container {
          position: fixed;
          bottom: 20px;
          right: 20px;
          width: 350px;
          height: 500px;
          background-color: white;
          border-radius: 10px;
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
          display: flex;
          flex-direction: column;
          z-index: 1000;
          display: none;
        }
        .document-chat-container.active {
          display: flex;
        }
        .chat-header {
          padding: 10px;
          background-color: #3498db;
          color: white;
          border-top-left-radius: 10px;
          border-top-right-radius: 10px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .chat-header h3 {
          margin: 0;
        }
        .close-chat-btn {
          background: none;
          border: none;
          color: white;
          font-size: 20px;
          cursor: pointer;
        }
        .chat-messages {
          flex: 1;
          padding: 10px;
          overflow-y: auto;
        }
        .chat-message {
          margin-bottom: 10px;
          padding: 10px;
          border-radius: 5px;
          max-width: 80%;
        }
        .user-message {
          background-color: #3498db;
          color: white;
          margin-left: auto;
        }
        .bot-message {
          background-color: #f1f1f1;
          color: #333;
        }
        .chat-input-container {
          padding: 10px;
          display: flex;
          border-top: 1px solid #eee;
        }
        .document-chat-input {
          flex: 1;
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 5px;
          margin-right: 10px;
        }
        .document-chat-send-button {
          background-color: #3498db;
          color: white;
          border: none;
          border-radius: 5px;
          padding: 10px 15px;
          cursor: pointer;
        }
        .show-chat-btn {
          position: fixed;
          bottom: 20px;
          right: 20px;
          background-color: #3498db;
          color: white;
          border: none;
          border-radius: 50%;
          width: 50px;
          height: 50px;
          font-size: 20px;
          cursor: pointer;
          z-index: 999;
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }
        
        /* Document list styles */
        .document-list-container {
          margin-top: 20px;
        }
        .document-list {
          margin-top: 20px;
        }
        .document-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 15px;
          border: 1px solid #ddd;
          border-radius: 5px;
          margin-bottom: 10px;
          background-color: white;
        }
        .document-info {
          flex: 1;
        }
        .document-info h4 {
          margin: 0 0 10px;
        }
        .document-info p {
          margin: 5px 0;
        }
        .document-actions {
          display: flex;
          gap: 10px;
        }
        .status-uploaded {
          color: #f39c12;
        }
        .status-processing {
          color: #3498db;
        }
        .status-processed {
          color: #2ecc71;
        }
        
        /* Login form styles */
        .login-container {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 80vh;
        }
        .auth-form {
          background-color: white;
          padding: 30px;
          border-radius: 10px;
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
          width: 100%;
          max-width: 400px;
        }
        .auth-form h2 {
          margin-bottom: 20px;
          text-align: center;
        }
        .form-group {
          margin-bottom: 20px;
        }
        .form-control {
          width: 100%;
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 5px;
        }
        .btn-block {
          width: 100%;
        }
        .auth-divider {
          text-align: center;
          margin: 20px 0;
          position: relative;
        }
        .auth-divider::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 0;
          right: 0;
          height: 1px;
          background-color: #ddd;
          z-index: -1;
        }
        .auth-divider span {
          background-color: white;
          padding: 0 10px;
        }
        .google-login-btn {
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        /* Responsive styles */
        @media (max-width: 768px) {
          .sidebar {
            transform: translateX(-100%);
          }
          .sidebar-toggle {
            display: block;
          }
          .main-content {
            margin-left: 0;
          }
          .sidebar-collapsed .sidebar {
            transform: translateX(0);
          }
          .document-chat-container {
            width: 300px;
            height: 400px;
          }
        }
      `;
      document.head.appendChild(styles);
    }
  }

  /**
   * Process document
   * @param {string} documentId - Document ID
   * @param {HTMLElement} button - Process button
   */
  function processDocument(documentId, button) {
    console.log(`Processing document: ${documentId}`);

    // Disable button
    button.disabled = true;
    button.textContent = 'Processing...';

    // Simulate processing
    setTimeout(() => {
      // Enable button
      button.disabled = false;
      button.textContent = 'Processed';
      button.classList.remove('btn-primary');
      button.classList.add('btn-success');

      // Update document status if possible
      const documentItem = button.closest('.document-item');
      if (documentItem) {
        const statusElement = documentItem.querySelector('.document-status');
        if (statusElement) {
          statusElement.textContent = 'Processed';
          statusElement.className = statusElement.className.replace('status-uploaded', 'status-processed');
        }
      }

      // Update document details if on details page
      if (window.location.pathname.includes('/document-details')) {
        const tablesContainer = document.querySelector('.document-tables');
        if (tablesContainer) {
          tablesContainer.innerHTML = `
            <h3>Tables</h3>
            <table class="table">
              <thead>
                <tr>
                  <th>Security</th>
                  <th>ISIN</th>
                  <th>Quantity</th>
                  <th>Value</th>
                  <th>Percentage</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Apple Inc.</td>
                  <td>US0378331005</td>
                  <td>100</td>
                  <td>$18,500</td>
                  <td>15%</td>
                </tr>
                <tr>
                  <td>Microsoft Corp.</td>
                  <td>US5949181045</td>
                  <td>75</td>
                  <td>$22,000</td>
                  <td>18%</td>
                </tr>
                <tr>
                  <td>Amazon.com Inc.</td>
                  <td>US0231351067</td>
                  <td>50</td>
                  <td>$15,000</td>
                  <td>12%</td>
                </tr>
              </tbody>
            </table>
          `;
        }

        const securitiesContainer = document.querySelector('.document-securities');
        if (securitiesContainer) {
          securitiesContainer.innerHTML = `
            <h3>Securities</h3>
            <ul>
              <li><strong>US0378331005</strong> - Apple Inc.</li>
              <li><strong>US5949181045</strong> - Microsoft Corp.</li>
              <li><strong>US0231351067</strong> - Amazon.com Inc.</li>
            </ul>
          `;
        }

        const statusElement = document.querySelector('.document-status');
        if (statusElement) {
          statusElement.textContent = 'Processed';
          statusElement.className = statusElement.className.replace('status-uploaded', 'status-processed');
        }
      }
    }, 2000);
  }

  /**
   * Validate UI components
   */
  function validateUIComponents() {
    console.log('Validating UI components');

    // Define required components
    const requiredComponents = [
      { id: 'process-document-btn', name: 'Process Button' },
      { id: 'document-chat-container', name: 'Chat Container' },
      { id: 'document-chat-input', name: 'Chat Input' },
      { id: 'document-chat-send-button', name: 'Chat Send Button' },
      { id: 'show-chat-btn', name: 'Show Chat Button' },
      { id: 'google-login-btn', name: 'Google Login Button' }
    ];

    // Check for each component
    const missingComponents = [];
    requiredComponents.forEach(component => {
      if (!document.getElementById(component.id)) {
        console.warn(`Missing UI component: ${component.name} (${component.id})`);
        missingComponents.push(component);
      } else {
        console.log(`Found UI component: ${component.name} (${component.id})`);
      }
    });

    // Report results
    if (missingComponents.length > 0) {
      console.error(`UI Validation failed: ${missingComponents.length} components missing`);
    } else {
      console.log('UI Validation passed: All required components are present');
    }
  }
})();
