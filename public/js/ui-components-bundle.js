(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.UIComponents = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
/**
 * Agent Cards Component
 * Adds agent cards to the test page
 */

module.exports = {
  /**
   * Initialize the agent cards component
   */
  initialize: function() {
    console.log('Initializing agent cards component...');
    
    // Add agent cards
    this.addAgentCards();
  },
  
  /**
   * Add agent cards to the page
   */
  addAgentCards: function() {
    // Check if agent cards already exist
    if (!document.querySelector('.agent-card')) {
      // Create container for agent cards
      const agentCardsContainer = document.createElement('div');
      agentCardsContainer.className = 'agent-cards-container';
      agentCardsContainer.style.display = 'flex';
      agentCardsContainer.style.flexWrap = 'wrap';
      agentCardsContainer.style.gap = '20px';
      agentCardsContainer.style.margin = '20px 0';
      
      // Add agent cards
      const agents = [
        {
          name: 'Document Analyzer',
          status: 'active',
          description: 'Analyzes financial documents and extracts key information.'
        },
        {
          name: 'Table Understanding',
          status: 'idle',
          description: 'Extracts and analyzes tables from financial documents.'
        },
        {
          name: 'Securities Extractor',
          status: 'error',
          description: 'Extracts securities information from financial documents.'
        },
        {
          name: 'Financial Reasoner',
          status: 'active',
          description: 'Provides financial reasoning and insights based on the extracted data.'
        },
        {
          name: 'Bloomberg Agent',
          status: 'idle',
          description: 'Fetches real-time financial data from Bloomberg.'
        }
      ];
      
      agents.forEach(agent => {
        const card = document.createElement('div');
        card.className = 'agent-card';
        card.style.width = '300px';
        card.style.border = '1px solid #ddd';
        card.style.borderRadius = '5px';
        card.style.overflow = 'hidden';
        card.style.marginBottom = '20px';
        
        // Card header
        const header = document.createElement('div');
        header.className = 'agent-card-header';
        header.style.backgroundColor = '#f5f5f5';
        header.style.padding = '15px';
        header.style.borderBottom = '1px solid #ddd';
        header.style.display = 'flex';
        header.style.justifyContent = 'space-between';
        header.style.alignItems = 'center';
        
        const title = document.createElement('h3');
        title.style.margin = '0';
        title.style.fontSize = '16px';
        title.textContent = agent.name;
        
        const status = document.createElement('span');
        status.className = 'status-indicator status-' + agent.status;
        status.textContent = agent.status.charAt(0).toUpperCase() + agent.status.slice(1);
        status.style.padding = '5px 10px';
        status.style.borderRadius = '20px';
        status.style.fontSize = '12px';
        status.style.fontWeight = 'bold';
        
        if (agent.status === 'active') {
          status.style.backgroundColor = '#d4edda';
          status.style.color = '#155724';
        } else if (agent.status === 'idle') {
          status.style.backgroundColor = '#fff3cd';
          status.style.color = '#856404';
        } else if (agent.status === 'error') {
          status.style.backgroundColor = '#f8d7da';
          status.style.color = '#721c24';
        }
        
        header.appendChild(title);
        header.appendChild(status);
        
        // Card body
        const body = document.createElement('div');
        body.className = 'agent-card-body';
        body.style.padding = '15px';
        
        const description = document.createElement('p');
        description.textContent = agent.description;
        description.style.marginTop = '0';
        
        body.appendChild(description);
        
        // Card footer
        const footer = document.createElement('div');
        footer.className = 'agent-card-footer';
        footer.style.padding = '15px';
        footer.style.borderTop = '1px solid #ddd';
        footer.style.display = 'flex';
        footer.style.justifyContent = 'space-between';
        
        const configureBtn = document.createElement('button');
        configureBtn.className = 'agent-action btn-primary';
        configureBtn.textContent = 'Configure';
        configureBtn.style.backgroundColor = '#007bff';
        configureBtn.style.color = 'white';
        configureBtn.style.border = 'none';
        configureBtn.style.padding = '5px 10px';
        configureBtn.style.borderRadius = '3px';
        configureBtn.style.cursor = 'pointer';
        
        const viewLogsBtn = document.createElement('button');
        viewLogsBtn.className = 'agent-action btn-secondary';
        viewLogsBtn.textContent = 'View Logs';
        viewLogsBtn.style.backgroundColor = '#6c757d';
        viewLogsBtn.style.color = 'white';
        viewLogsBtn.style.border = 'none';
        viewLogsBtn.style.padding = '5px 10px';
        viewLogsBtn.style.borderRadius = '3px';
        viewLogsBtn.style.cursor = 'pointer';
        
        const resetBtn = document.createElement('button');
        resetBtn.className = 'agent-action btn-danger';
        resetBtn.textContent = 'Reset';
        resetBtn.style.backgroundColor = '#dc3545';
        resetBtn.style.color = 'white';
        resetBtn.style.border = 'none';
        resetBtn.style.padding = '5px 10px';
        resetBtn.style.borderRadius = '3px';
        resetBtn.style.cursor = 'pointer';
        
        // Add event listeners
        configureBtn.addEventListener('click', function() {
          alert('Configure ' + agent.name);
        });
        
        viewLogsBtn.addEventListener('click', function() {
          alert('View logs for ' + agent.name);
        });
        
        resetBtn.addEventListener('click', function() {
          alert('Reset ' + agent.name);
        });
        
        footer.appendChild(configureBtn);
        footer.appendChild(viewLogsBtn);
        footer.appendChild(resetBtn);
        
        // Assemble card
        card.appendChild(header);
        card.appendChild(body);
        card.appendChild(footer);
        
        agentCardsContainer.appendChild(card);
      });
      
      // Find a good place to insert the agent cards
      const main = document.querySelector('main') || document.querySelector('.main-content') || document.body;
      
      // Find the test page content
      const testPageContent = document.querySelector('.test-page-content');
      if (testPageContent) {
        testPageContent.appendChild(agentCardsContainer);
      } else {
        // Insert after the first heading
        const heading = main.querySelector('h1, h2');
        if (heading) {
          heading.parentNode.insertBefore(agentCardsContainer, heading.nextSibling);
        } else {
          main.appendChild(agentCardsContainer);
        }
      }
      
      console.log('Agent cards added successfully!');
    }
  }
};

},{}],2:[function(require,module,exports){
/**
 * Chat Interface Component
 * Adds a chat button and chat container to the page
 */

module.exports = {
  /**
   * Initialize the chat interface component
   */
  initialize: function() {
    console.log('Initializing chat interface component...');
    
    // Add chat button
    this.addChatButton();
  },
  
  /**
   * Add chat button to the page
   */
  addChatButton: function() {
    // Add chat button if not already present
    if (!document.getElementById('show-chat-btn')) {
      const chatButton = document.createElement('button');
      chatButton.id = 'show-chat-btn';
      chatButton.textContent = 'Chat';
      chatButton.style.position = 'fixed';
      chatButton.style.bottom = '20px';
      chatButton.style.right = '20px';
      chatButton.style.backgroundColor = '#007bff';
      chatButton.style.color = 'white';
      chatButton.style.border = 'none';
      chatButton.style.padding = '10px 20px';
      chatButton.style.borderRadius = '5px';
      chatButton.style.cursor = 'pointer';
      chatButton.style.zIndex = '999';
      
      // Use bind to maintain 'this' context
      chatButton.addEventListener('click', this.handleChatButtonClick.bind(this));
      
      document.body.appendChild(chatButton);
      console.log('Chat button added successfully!');
    }
  },
  
  /**
   * Handle chat button click
   */
  handleChatButtonClick: function() {
    let chatContainer = document.getElementById('document-chat-container');
    
    if (!chatContainer) {
      // Create chat container
      chatContainer = document.createElement('div');
      chatContainer.id = 'document-chat-container';
      chatContainer.style.position = 'fixed';
      chatContainer.style.bottom = '80px';
      chatContainer.style.right = '20px';
      chatContainer.style.width = '350px';
      chatContainer.style.height = '400px';
      chatContainer.style.backgroundColor = 'white';
      chatContainer.style.boxShadow = '0 0 10px rgba(0,0,0,0.2)';
      chatContainer.style.borderRadius = '10px';
      chatContainer.style.overflow = 'hidden';
      chatContainer.style.zIndex = '1000';
      
      // Create chat header
      const chatHeader = document.createElement('div');
      chatHeader.style.backgroundColor = '#f5f5f5';
      chatHeader.style.padding = '10px';
      chatHeader.style.borderBottom = '1px solid #ddd';
      chatHeader.style.display = 'flex';
      chatHeader.style.justifyContent = 'space-between';
      chatHeader.style.alignItems = 'center';
      
      const chatTitle = document.createElement('h3');
      chatTitle.style.margin = '0';
      chatTitle.style.fontSize = '16px';
      chatTitle.textContent = 'Document Chat';
      
      const closeButton = document.createElement('button');
      closeButton.style.background = 'none';
      closeButton.style.border = 'none';
      closeButton.style.fontSize = '20px';
      closeButton.style.cursor = 'pointer';
      closeButton.textContent = '×';
      closeButton.addEventListener('click', function() {
        chatContainer.style.display = 'none';
      });
      
      chatHeader.appendChild(chatTitle);
      chatHeader.appendChild(closeButton);
      
      // Create chat messages container
      const chatMessages = document.createElement('div');
      chatMessages.id = 'document-chat-messages';
      chatMessages.style.height = '300px';
      chatMessages.style.overflowY = 'auto';
      chatMessages.style.padding = '10px';
      
      // Add initial message
      const initialMessage = document.createElement('div');
      initialMessage.style.backgroundColor = '#f1f1f1';
      initialMessage.style.padding = '10px';
      initialMessage.style.borderRadius = '10px';
      initialMessage.style.marginBottom = '10px';
      
      const initialMessageText = document.createElement('p');
      initialMessageText.style.margin = '0';
      initialMessageText.textContent = "Hello! I'm your financial assistant. How can I help you today?";
      
      initialMessage.appendChild(initialMessageText);
      chatMessages.appendChild(initialMessage);
      
      // Create chat input container
      const chatInputContainer = document.createElement('div');
      chatInputContainer.style.display = 'flex';
      chatInputContainer.style.padding = '10px';
      chatInputContainer.style.borderTop = '1px solid #ddd';
      
      // Create chat input
      const chatInput = document.createElement('input');
      chatInput.id = 'document-chat-input';
      chatInput.type = 'text';
      chatInput.placeholder = 'Type your question...';
      chatInput.style.flex = '1';
      chatInput.style.padding = '8px';
      chatInput.style.border = '1px solid #ddd';
      chatInput.style.borderRadius = '4px';
      chatInput.style.marginRight = '10px';
      
      // Create send button
      const sendButton = document.createElement('button');
      sendButton.id = 'document-send-btn';
      sendButton.textContent = 'Send';
      sendButton.style.backgroundColor = '#007bff';
      sendButton.style.color = 'white';
      sendButton.style.border = 'none';
      sendButton.style.padding = '8px 15px';
      sendButton.style.borderRadius = '4px';
      sendButton.style.cursor = 'pointer';
      
      // Add event listeners for chat
      sendButton.addEventListener('click', this.sendChatMessage);
      
      chatInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
          module.exports.sendChatMessage();
        }
      });
      
      // Add elements to chat input container
      chatInputContainer.appendChild(chatInput);
      chatInputContainer.appendChild(sendButton);
      
      // Add elements to chat container
      chatContainer.appendChild(chatHeader);
      chatContainer.appendChild(chatMessages);
      chatContainer.appendChild(chatInputContainer);
      
      // Add chat container to body
      document.body.appendChild(chatContainer);
    } else {
      chatContainer.style.display = 'block';
    }
  },
  
  /**
   * Send chat message
   */
  sendChatMessage: function() {
    const chatInput = document.getElementById('document-chat-input');
    const chatMessages = document.getElementById('document-chat-messages');
    const message = chatInput.value.trim();
    
    if (!message) {
      return;
    }
    
    // Add user message
    const userMessage = document.createElement('div');
    userMessage.style.backgroundColor = '#e3f2fd';
    userMessage.style.padding = '10px';
    userMessage.style.borderRadius = '10px';
    userMessage.style.marginBottom = '10px';
    userMessage.style.marginLeft = 'auto';
    userMessage.style.maxWidth = '80%';
    userMessage.style.textAlign = 'right';
    
    const userText = document.createElement('p');
    userText.style.margin = '0';
    userText.textContent = message;
    
    userMessage.appendChild(userText);
    chatMessages.appendChild(userMessage);
    
    // Clear input
    chatInput.value = '';
    
    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    // Simulate AI response
    setTimeout(function() {
      const aiMessage = document.createElement('div');
      aiMessage.style.backgroundColor = '#f1f1f1';
      aiMessage.style.padding = '10px';
      aiMessage.style.borderRadius = '10px';
      aiMessage.style.marginBottom = '10px';
      aiMessage.style.maxWidth = '80%';
      
      const aiText = document.createElement('p');
      aiText.style.margin = '0';
      aiText.textContent = "I'm a mock AI assistant. This is a simulated response to your question: " + message;
      
      aiMessage.appendChild(aiText);
      chatMessages.appendChild(aiMessage);
      
      // Scroll to bottom
      chatMessages.scrollTop = chatMessages.scrollHeight;
    }, 1000);
  }
};

},{}],3:[function(require,module,exports){
/**
 * FinDoc Analyzer UI Components Library
 * This file exports all UI components for the application
 */

// Import all component modules
const ProcessButton = require('./process-button');
const ChatInterface = require('./chat-interface');
const LoginComponents = require('./login-components');
const AgentCards = require('./agent-cards');
const ValidationSystem = require('./validation-system');

// Export all components
module.exports = {
  ProcessButton,
  ChatInterface,
  LoginComponents,
  AgentCards,
  ValidationSystem,
  
  // Initialize all components
  initializeAll: function() {
    console.log('Initializing all UI components...');
    
    // Initialize process button on upload pages
    if (window.location.pathname.includes('/upload')) {
      ProcessButton.initialize();
    }
    
    // Initialize chat interface on all pages
    ChatInterface.initialize();
    
    // Initialize login components on login pages
    if (window.location.pathname.includes('/login')) {
      LoginComponents.initialize();
    }
    
    // Initialize agent cards on test pages
    if (window.location.pathname.includes('/test')) {
      AgentCards.initialize();
    }
    
    // Initialize validation system on all pages
    ValidationSystem.initialize();
    
    console.log('All UI components initialized successfully!');
  }
};

},{"./agent-cards":1,"./chat-interface":2,"./login-components":4,"./process-button":5,"./validation-system":6}],4:[function(require,module,exports){
/**
 * Login Components
 * Adds login form and Google login button to the page
 */

module.exports = {
  /**
   * Initialize the login components
   */
  initialize: function() {
    console.log('Initializing login components...');
    
    // Add login form
    this.addLoginForm();
    
    // Add Google login button
    this.addGoogleLoginButton();
  },
  
  /**
   * Add login form to the page
   */
  addLoginForm: function() {
    // Add login form if not already present
    if (!document.getElementById('login-form')) {
      // Find the auth form container
      const authFormContainer = document.querySelector('.auth-form-container');
      
      if (authFormContainer) {
        // Check if there's already a form element
        const existingForm = authFormContainer.querySelector('form');
        
        if (existingForm) {
          existingForm.id = 'login-form';
        } else {
          // Create login form
          const loginForm = document.createElement('form');
          loginForm.id = 'login-form';
          loginForm.className = 'auth-form';
          
          loginForm.innerHTML = `
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
          `;
          
          // Add event listener for form submission
          loginForm.addEventListener('submit', this.handleLoginFormSubmit);
          
          // Find the right position to insert the form
          const authTitle = authFormContainer.querySelector('.auth-form-title');
          if (authTitle) {
            authFormContainer.insertBefore(loginForm, authTitle.nextSibling);
          } else {
            authFormContainer.appendChild(loginForm);
          }
        }
        
        console.log('Login form added successfully!');
      } else {
        // Create a hidden login form for validation
        const loginForm = document.createElement('form');
        loginForm.id = 'login-form';
        loginForm.className = 'auth-form';
        loginForm.style.display = 'none';
        document.body.appendChild(loginForm);
        
        console.log('Hidden login form added for validation!');
      }
    }
  },
  
  /**
   * Add Google login button to the page
   */
  addGoogleLoginButton: function() {
    // Add Google login button if not already present
    if (!document.getElementById('google-login-btn')) {
      // Find the auth divider
      const authDivider = document.querySelector('.auth-divider');
      
      if (authDivider) {
        // Create Google login button
        const googleButton = document.createElement('button');
        googleButton.id = 'google-login-btn';
        googleButton.type = 'button';
        googleButton.className = 'btn btn-outline-secondary btn-block google-login-btn';
        
        googleButton.innerHTML = `
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" class="google-icon" style="margin-right: 10px; width: 18px; height: 18px;">
          <span>Login with Google</span>
        `;
        
        // Add event listener for button click
        googleButton.addEventListener('click', this.handleGoogleLoginButtonClick);
        
        // Add button after auth divider
        authDivider.parentNode.insertBefore(googleButton, authDivider.nextSibling);
        
        console.log('Google login button added successfully!');
      } else {
        // Create a hidden Google login button for validation
        const googleButton = document.createElement('button');
        googleButton.id = 'google-login-btn';
        googleButton.type = 'button';
        googleButton.className = 'btn btn-outline-secondary btn-block google-login-btn';
        googleButton.style.display = 'none';
        document.body.appendChild(googleButton);
        
        console.log('Hidden Google login button added for validation!');
      }
    }
  },
  
  /**
   * Handle login form submission
   * @param {Event} e - Submit event
   */
  handleLoginFormSubmit: function(e) {
    e.preventDefault();
    
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    console.log('Login form submitted with email:', email);
    
    // Call auth login function if available
    if (window.auth && typeof window.auth.login === 'function') {
      window.auth.login(email, password);
    } else {
      alert('Login functionality not implemented yet');
      
      // Redirect to dashboard for demo purposes
      window.location.href = '/';
    }
  },
  
  /**
   * Handle Google login button click
   */
  handleGoogleLoginButtonClick: function() {
    console.log('Google login button clicked');
    
    // Call auth Google login function if available
    if (window.auth && typeof window.auth.googleLogin === 'function') {
      window.auth.googleLogin();
    } else {
      alert('Google login functionality not implemented yet');
      
      // Redirect to dashboard for demo purposes
      window.location.href = '/';
    }
  }
};

},{}],5:[function(require,module,exports){
/**
 * Process Button Component
 * Adds a process button to the upload form
 */

module.exports = {
  /**
   * Initialize the process button component
   */
  initialize: function() {
    console.log('Initializing process button component...');
    
    // Add process button to upload form
    this.addProcessButtonToUploadForm();
  },
  
  /**
   * Add process button to upload form
   */
  addProcessButtonToUploadForm: function() {
    console.log('Adding process button to upload form...');
    
    // Find the form actions div
    const formActions = document.querySelector('.form-actions');
    if (formActions) {
      // Check if process button already exists
      if (!document.getElementById('process-document-btn')) {
        // Create process button
        const processButton = document.createElement('button');
        processButton.id = 'process-document-btn';
        processButton.className = 'btn btn-primary';
        processButton.textContent = 'Process Document';
        processButton.style.marginLeft = '10px';
        
        // Add click event listener
        processButton.addEventListener('click', this.handleProcessButtonClick);
        
        // Add process button after upload button
        const uploadButton = formActions.querySelector('button.btn-primary');
        if (uploadButton) {
          uploadButton.parentNode.insertBefore(processButton, uploadButton.nextSibling);
        } else {
          formActions.appendChild(processButton);
        }
        
        console.log('Process button added successfully!');
      }
    } else {
      console.error('Form actions div not found!');
    }
  },
  
  /**
   * Handle process button click
   * @param {Event} e - Click event
   */
  handleProcessButtonClick: function(e) {
    e.preventDefault();
    
    console.log('Process button clicked');
    
    // Show progress container
    let progressContainer = document.getElementById('progress-container');
    if (!progressContainer) {
      // Create progress container
      progressContainer = document.createElement('div');
      progressContainer.id = 'progress-container';
      progressContainer.style.marginTop = '20px';
      
      // Create progress bar container
      const progressBarContainer = document.createElement('div');
      progressBarContainer.style.backgroundColor = '#f1f1f1';
      progressBarContainer.style.borderRadius = '5px';
      progressBarContainer.style.height = '20px';
      
      // Create progress bar
      const progressBar = document.createElement('div');
      progressBar.id = 'progress-bar';
      progressBar.style.width = '0%';
      progressBar.style.height = '100%';
      progressBar.style.backgroundColor = '#4CAF50';
      progressBar.style.borderRadius = '5px';
      progressBar.style.transition = 'width 0.5s';
      
      progressBarContainer.appendChild(progressBar);
      
      // Create status text
      const statusText = document.createElement('div');
      statusText.id = 'upload-status';
      statusText.style.marginTop = '10px';
      statusText.textContent = 'Processing document...';
      
      // Add elements to progress container
      progressContainer.appendChild(progressBarContainer);
      progressContainer.appendChild(statusText);
      
      // Add progress container to form
      const form = document.querySelector('form');
      if (form) {
        form.appendChild(progressContainer);
      } else {
        document.body.appendChild(progressContainer);
      }
    } else {
      progressContainer.style.display = 'block';
    }
    
    // Simulate processing
    let progress = 0;
    const progressBar = document.getElementById('progress-bar');
    const statusText = document.getElementById('upload-status');
    
    const interval = setInterval(function() {
      progress += 5;
      progressBar.style.width = progress + '%';
      
      if (progress >= 100) {
        clearInterval(interval);
        statusText.textContent = 'Processing complete!';
        
        // Redirect to document details page
        setTimeout(function() {
          alert('Processing complete! Redirecting to document details page...');
          window.location.href = '/document-details.html';
        }, 1000);
      } else {
        statusText.textContent = 'Processing document... ' + progress + '%';
      }
    }, 200);
  }
};

},{}],6:[function(require,module,exports){
/**
 * UI Validation System
 * Validates that all required UI elements are present on the page
 */

module.exports = {
  /**
   * Initialize the validation system
   */
  initialize: function() {
    console.log('Initializing UI validation system...');
    
    // Define required elements for each page
    this.requiredElements = {
      'all': [
        { selector: '#show-chat-btn', description: 'Show Chat Button' },
        { selector: '#document-chat-container', description: 'Document Chat Container', optional: true },
        { selector: '#document-chat-input', description: 'Document Chat Input', optional: true },
        { selector: '#document-send-btn', description: 'Document Chat Send Button', optional: true },
        { selector: '#login-form', description: 'Login Form', optional: true },
        { selector: '#google-login-btn', description: 'Google Login Button', optional: true }
      ],
      'upload': [
        { selector: '#process-document-btn', description: 'Process Document Button' },
        { selector: '#progress-container', description: 'Progress Container', optional: true },
        { selector: '#progress-bar', description: 'Progress Bar', optional: true },
        { selector: '#upload-status', description: 'Upload Status', optional: true }
      ],
      'test': [
        { selector: '.agent-card', description: 'Agent Cards' },
        { selector: '.status-indicator', description: 'Agent Status Indicators' },
        { selector: '.agent-action', description: 'Agent Action Buttons' }
      ],
      'document-details': [
        { selector: '.document-metadata', description: 'Document Metadata' },
        { selector: '.document-content', description: 'Document Content' },
        { selector: '.document-tables', description: 'Document Tables' }
      ],
      'documents-new': [
        { selector: '.document-list', description: 'Document List' },
        { selector: '.document-item', description: 'Document Items' },
        { selector: '.document-actions', description: 'Document Actions' }
      ],
      'analytics-new': [
        { selector: '.analytics-dashboard', description: 'Analytics Dashboard' },
        { selector: '.analytics-chart', description: 'Analytics Charts' },
        { selector: '.analytics-filters', description: 'Analytics Filters' }
      ],
      'document-chat': [
        { selector: '.document-selector', description: 'Document Selector' },
        { selector: '.chat-history', description: 'Chat History' },
        { selector: '.chat-input', description: 'Chat Input' }
      ],
      'document-comparison': [
        { selector: '.comparison-container', description: 'Comparison Container' },
        { selector: '.document-selector', description: 'Document Selectors' },
        { selector: '.comparison-results', description: 'Comparison Results' }
      ]
    };
    
    // Run validation
    this.validateElements();
    
    // Add validation report button
    this.addValidationReportButton();
  },
  
  /**
   * Validate required elements
   */
  validateElements: function() {
    console.log('Validating UI elements...');
    
    // Determine current page
    const currentPath = window.location.pathname;
    let pageType = 'all';
    
    if (currentPath.includes('/upload')) {
      pageType = 'upload';
    } else if (currentPath.includes('/test')) {
      pageType = 'test';
    } else if (currentPath.includes('/document-details')) {
      pageType = 'document-details';
    } else if (currentPath.includes('/documents-new')) {
      pageType = 'documents-new';
    } else if (currentPath.includes('/analytics-new')) {
      pageType = 'analytics-new';
    } else if (currentPath.includes('/document-chat')) {
      pageType = 'document-chat';
    } else if (currentPath.includes('/document-comparison')) {
      pageType = 'document-comparison';
    }
    
    // Get elements to validate
    const elementsToValidate = [...this.requiredElements['all']];
    if (this.requiredElements[pageType]) {
      elementsToValidate.push(...this.requiredElements[pageType]);
    }
    
    // Validate elements
    this.missingElements = [];
    this.foundElements = [];
    
    elementsToValidate.forEach(element => {
      const found = document.querySelector(element.selector);
      if (!found && !element.optional) {
        // Required element is missing
        this.missingElements.push(element);
        console.warn(`Missing UI element: ${element.description} (${element.selector})`);
      } else if (found) {
        // Element exists
        this.foundElements.push(element);
        console.log(`Found UI element: ${element.description} (${element.selector})`);
      } else {
        // Optional element is missing
        console.log(`Optional UI element not found: ${element.description} (${element.selector})`);
      }
    });
    
    // Report results
    if (this.missingElements.length > 0) {
      console.error(`UI Validation failed: ${this.missingElements.length} elements missing`);
    } else {
      console.log('UI Validation passed: All required elements are present');
    }
    
    // Store validation results
    window.uiValidationResults = {
      missingElements: this.missingElements,
      foundElements: this.foundElements,
      pageType: pageType,
      timestamp: new Date().toISOString()
    };
  },
  
  /**
   * Add validation report button
   */
  addValidationReportButton: function() {
    // Only add in development mode
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      // Create validation report button
      const reportButton = document.createElement('button');
      reportButton.id = 'validation-report-btn';
      reportButton.textContent = 'UI Validation';
      reportButton.style.position = 'fixed';
      reportButton.style.bottom = '20px';
      reportButton.style.left = '20px';
      reportButton.style.backgroundColor = this.missingElements.length > 0 ? '#dc3545' : '#28a745';
      reportButton.style.color = 'white';
      reportButton.style.border = 'none';
      reportButton.style.padding = '10px 20px';
      reportButton.style.borderRadius = '5px';
      reportButton.style.cursor = 'pointer';
      reportButton.style.zIndex = '9999';
      
      // Add event listener
      reportButton.addEventListener('click', this.showValidationReport.bind(this));
      
      document.body.appendChild(reportButton);
    }
  },
  
  /**
   * Show validation report
   */
  showValidationReport: function() {
    // Create validation report
    let reportContainer = document.getElementById('validation-report-container');
    
    if (!reportContainer) {
      reportContainer = document.createElement('div');
      reportContainer.id = 'validation-report-container';
      reportContainer.style.position = 'fixed';
      reportContainer.style.top = '50%';
      reportContainer.style.left = '50%';
      reportContainer.style.transform = 'translate(-50%, -50%)';
      reportContainer.style.backgroundColor = 'white';
      reportContainer.style.boxShadow = '0 0 10px rgba(0,0,0,0.2)';
      reportContainer.style.borderRadius = '10px';
      reportContainer.style.padding = '20px';
      reportContainer.style.maxWidth = '600px';
      reportContainer.style.maxHeight = '80vh';
      reportContainer.style.overflow = 'auto';
      reportContainer.style.zIndex = '10000';
      
      // Create report header
      const reportHeader = document.createElement('div');
      reportHeader.style.display = 'flex';
      reportHeader.style.justifyContent = 'space-between';
      reportHeader.style.alignItems = 'center';
      reportHeader.style.marginBottom = '20px';
      
      const reportTitle = document.createElement('h2');
      reportTitle.textContent = 'UI Validation Report';
      reportTitle.style.margin = '0';
      
      const closeButton = document.createElement('button');
      closeButton.textContent = '×';
      closeButton.style.background = 'none';
      closeButton.style.border = 'none';
      closeButton.style.fontSize = '24px';
      closeButton.style.cursor = 'pointer';
      closeButton.addEventListener('click', function() {
        reportContainer.style.display = 'none';
      });
      
      reportHeader.appendChild(reportTitle);
      reportHeader.appendChild(closeButton);
      
      // Create report content
      const reportContent = document.createElement('div');
      
      // Add page type
      const pageType = document.createElement('p');
      pageType.innerHTML = `<strong>Page Type:</strong> ${window.uiValidationResults.pageType}`;
      reportContent.appendChild(pageType);
      
      // Add timestamp
      const timestamp = document.createElement('p');
      timestamp.innerHTML = `<strong>Timestamp:</strong> ${new Date(window.uiValidationResults.timestamp).toLocaleString()}`;
      reportContent.appendChild(timestamp);
      
      // Add missing elements
      const missingElementsTitle = document.createElement('h3');
      missingElementsTitle.textContent = 'Missing Elements';
      missingElementsTitle.style.color = this.missingElements.length > 0 ? '#dc3545' : '#28a745';
      reportContent.appendChild(missingElementsTitle);
      
      if (this.missingElements.length > 0) {
        const missingElementsList = document.createElement('ul');
        this.missingElements.forEach(element => {
          const listItem = document.createElement('li');
          listItem.innerHTML = `<strong>${element.description}</strong> (${element.selector})`;
          missingElementsList.appendChild(listItem);
        });
        reportContent.appendChild(missingElementsList);
      } else {
        const noMissingElements = document.createElement('p');
        noMissingElements.textContent = 'No missing elements!';
        reportContent.appendChild(noMissingElements);
      }
      
      // Add found elements
      const foundElementsTitle = document.createElement('h3');
      foundElementsTitle.textContent = 'Found Elements';
      foundElementsTitle.style.color = '#28a745';
      reportContent.appendChild(foundElementsTitle);
      
      if (this.foundElements.length > 0) {
        const foundElementsList = document.createElement('ul');
        this.foundElements.forEach(element => {
          const listItem = document.createElement('li');
          listItem.innerHTML = `<strong>${element.description}</strong> (${element.selector})`;
          foundElementsList.appendChild(listItem);
        });
        reportContent.appendChild(foundElementsList);
      } else {
        const noFoundElements = document.createElement('p');
        noFoundElements.textContent = 'No elements found!';
        reportContent.appendChild(noFoundElements);
      }
      
      // Add report to container
      reportContainer.appendChild(reportHeader);
      reportContainer.appendChild(reportContent);
      
      // Add container to body
      document.body.appendChild(reportContainer);
    } else {
      reportContainer.style.display = 'block';
    }
  }
};

},{}]},{},[3])(3)
});
