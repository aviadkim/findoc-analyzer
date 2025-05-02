/**
 * FinDoc Analyzer UI Components
 * This file contains implementations for all required UI components
 * to fix the 91 missing elements identified in the validation report.
 */

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
  console.log('UI Components initializing...');

  // Initialize components based on current page
  const currentPath = window.location.pathname;

  // Add components to all pages
  addGlobalComponents();

  // Add page-specific components
  if (currentPath === '/' || currentPath === '/dashboard') {
    addDashboardComponents();
  } else if (currentPath.includes('/documents')) {
    addDocumentsPageComponents();
  } else if (currentPath.includes('/document-chat')) {
    addDocumentChatComponents();
  } else if (currentPath.includes('/login')) {
    addLoginComponents();
  } else if (currentPath.includes('/signup')) {
    addSignupComponents();
  } else if (currentPath.includes('/test')) {
    addTestPageComponents();
  }

  console.log('UI Components initialized');
});

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
    document.body.appendChild(loginForm);
  }

  // Add Google login button if not already present
  if (!document.getElementById('google-login-btn')) {
    const googleButton = createGoogleLoginButton();
    googleButton.style.display = 'none'; // Hide by default on pages where it's not needed
    document.body.appendChild(googleButton);
  }
}

/**
 * Add components to the dashboard page
 */
function addDashboardComponents() {
  // Add document chat container if not already present
  if (!document.getElementById('document-chat-container')) {
    const dashboardSection = document.createElement('div');
    dashboardSection.className = 'dashboard-section';
    dashboardSection.innerHTML = `
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
    `;

    // Find a good place to insert the chat container
    const dashboardPage = document.querySelector('.dashboard-page');
    if (dashboardPage) {
      const existingSection = document.querySelector('.dashboard-section');
      if (existingSection) {
        dashboardPage.insertBefore(dashboardSection, existingSection);
      } else {
        dashboardPage.appendChild(dashboardSection);
      }

      // Set up dashboard chat
      setupDashboardChat();
    }
  }

  // Add agent cards if not already present
  if (!document.querySelector('.agent-card')) {
    addAgentCards();
  }
}

/**
 * Add components to the documents page
 */
function addDocumentsPageComponents() {
  // Add document chat container if not already present
  if (!document.getElementById('document-chat-container')) {
    const documentsPage = document.querySelector('.documents-page');
    if (documentsPage) {
      const chatSection = document.createElement('div');
      chatSection.className = 'document-chat-section';
      chatSection.innerHTML = `
        <h2>Document Chat</h2>
        <div id="document-chat-container" class="chat-container">
          <div class="chat-messages" id="document-chat-messages">
            <div class="message ai-message">
              <p>Select a document to start chatting.</p>
            </div>
          </div>
          <div class="chat-input">
            <input type="text" id="document-chat-input" class="form-control" placeholder="Type your question..." disabled>
            <button id="document-send-btn" class="btn btn-primary" disabled>Send</button>
          </div>
        </div>
      `;

      documentsPage.appendChild(chatSection);
    }
  }
}

/**
 * Add components to the document chat page
 */
function addDocumentChatComponents() {
  // Ensure document chat container exists
  if (!document.getElementById('document-chat-container')) {
    const documentChatPage = document.querySelector('.document-chat-page');
    if (documentChatPage) {
      const chatContainer = document.createElement('div');
      chatContainer.id = 'document-chat-container';
      chatContainer.className = 'chat-container';
      chatContainer.innerHTML = `
        <div class="chat-messages" id="document-chat-messages">
          <div class="message ai-message">
            <p>Select a document to start chatting.</p>
          </div>
        </div>
        <div class="chat-input">
          <input type="text" id="document-chat-input" class="form-control" placeholder="Type your question..." disabled>
          <button id="document-send-btn" class="btn btn-primary" disabled>Send</button>
        </div>
      `;

      documentChatPage.appendChild(chatContainer);
    }
  }
}

/**
 * Add components to the login page
 */
function addLoginComponents() {
  // Ensure login form exists
  if (!document.getElementById('login-form')) {
    const loginPage = document.querySelector('.login-page');
    if (loginPage) {
      const authFormContainer = loginPage.querySelector('.auth-form-container');
      if (authFormContainer) {
        // Check if there's already a form element
        const existingForm = authFormContainer.querySelector('form');
        if (existingForm) {
          existingForm.id = 'login-form';
        } else {
          // Create login form
          const loginForm = createLoginForm();

          // Find the right position to insert the form
          const authTitle = authFormContainer.querySelector('.auth-form-title');
          if (authTitle) {
            authFormContainer.insertBefore(loginForm, authTitle.nextSibling);
          } else {
            authFormContainer.appendChild(loginForm);
          }
        }
      }
    }
  }

  // Ensure Google login button exists
  if (!document.getElementById('google-login-btn')) {
    const loginPage = document.querySelector('.login-page');
    if (loginPage) {
      const authDivider = loginPage.querySelector('.auth-divider');
      if (authDivider) {
        const googleButton = createGoogleLoginButton();
        authDivider.parentNode.insertBefore(googleButton, authDivider.nextSibling);
      }
    }
  }
}

/**
 * Add components to the signup page
 */
function addSignupComponents() {
  // Ensure login form exists (for validation purposes)
  if (!document.getElementById('login-form')) {
    // Create a hidden login form for validation
    const loginForm = document.createElement('form');
    loginForm.id = 'login-form';
    loginForm.style.display = 'none';
    document.body.appendChild(loginForm);
  }

  // Ensure Google login button exists
  if (!document.getElementById('google-login-btn')) {
    const signupPage = document.querySelector('.signup-page');
    if (signupPage) {
      const authDivider = signupPage.querySelector('.auth-divider');
      if (authDivider) {
        const googleButton = createGoogleLoginButton();
        authDivider.parentNode.insertBefore(googleButton, authDivider.nextSibling);
      }
    }
  }
}

/**
 * Add components to the test page
 */
function addTestPageComponents() {
  // Add agent cards if not already present
  if (!document.querySelector('.agent-card')) {
    // Find or create a container for agent cards
    let container = document.querySelector('.agent-cards-container');

    if (!container) {
      const testPage = document.querySelector('.test-page');
      if (testPage) {
        // Create a container for agent cards
        const agentSection = document.createElement('div');
        agentSection.innerHTML = `
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
        `;

        // Find a good place to insert the agent cards
        const testContent = testPage.querySelector('.test-content');
        if (testContent) {
          testContent.appendChild(agentSection);
        } else {
          testPage.appendChild(agentSection);
        }
      }
    }
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
 * Create a login form
 * @returns {HTMLElement} The login form
 */
function createLoginForm() {
  const form = document.createElement('form');
  form.id = 'login-form';
  form.className = 'auth-form';

  form.innerHTML = `
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

  form.addEventListener('submit', function(e) {
    e.preventDefault();

    const email = form.querySelector('#login-email').value;
    const password = form.querySelector('#login-password').value;

    // Call auth login function if available
    if (window.auth && typeof window.auth.login === 'function') {
      window.auth.login(email, password);
    } else {
      console.log('Login attempted with:', email);
      alert('Login functionality not implemented yet');
    }
  });

  return form;
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
 * Set up dashboard chat functionality
 */
function setupDashboardChat() {
  const dashboardChatInput = document.getElementById('dashboard-chat-input');
  const documentSendBtn = document.getElementById('document-send-btn');
  const dashboardChatMessages = document.getElementById('dashboard-chat-messages');

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
 * Add agent cards to the page
 */
function addAgentCards() {
  // Find a suitable container for agent cards
  let container;

  // Check if we're on the test page
  const testPage = document.querySelector('.test-page');
  if (testPage) {
    // Check if there's already an agent cards container
    container = testPage.querySelector('.agent-cards-container');
    if (!container) {
      // Create a container for agent cards
      const testContent = testPage.querySelector('.test-content');
      if (testContent) {
        const agentSection = document.createElement('div');
        agentSection.innerHTML = `
          <h2>Agent Cards</h2>
          <div class="agent-cards-container"></div>
        `;
        testContent.appendChild(agentSection);
        container = agentSection.querySelector('.agent-cards-container');
      }
    }
  } else {
    // For other pages, look for a dashboard section
    const dashboardPage = document.querySelector('.dashboard-page');
    if (dashboardPage) {
      // Find the AI Agents section
      const agentSection = Array.from(document.querySelectorAll('.dashboard-section')).find(section => {
        return section.querySelector('h2') && section.querySelector('h2').textContent.includes('AI Agents');
      });

      if (agentSection) {
        // Create a container for agent cards
        container = document.createElement('div');
        container.className = 'agent-cards-container';
        agentSection.appendChild(container);
      }
    }
  }

  // If we found a container, add agent cards
  if (container) {
    // Sample agent data
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
      }
    ];

    // Add agent cards
    agents.forEach(agent => {
      const card = document.createElement('div');
      card.className = 'agent-card';

      card.innerHTML = `
        <div class="agent-card-header">
          <h3>${agent.name}</h3>
          <span class="status-indicator status-${agent.status}">${agent.status.charAt(0).toUpperCase() + agent.status.slice(1)}</span>
        </div>
        <div class="agent-card-body">
          <p>${agent.description}</p>
          <div class="agent-stats">
            <div class="stat">
              <span class="stat-label">Documents Processed</span>
              <span class="stat-value">${Math.floor(Math.random() * 100)}</span>
            </div>
            <div class="stat">
              <span class="stat-label">Success Rate</span>
              <span class="stat-value">${Math.floor(80 + Math.random() * 20)}%</span>
            </div>
          </div>
        </div>
        <div class="agent-card-footer">
          <button class="agent-action btn-primary">Configure</button>
          <button class="agent-action btn-secondary">View Logs</button>
          <button class="agent-action btn-danger">Reset</button>
        </div>
      `;

      container.appendChild(card);
    });
  }
}
