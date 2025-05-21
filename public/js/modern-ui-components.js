/**
 * FinDoc Analyzer - Modern UI Components
 * JavaScript implementation of modern UI components for the FinDoc Analyzer application
 */

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
  console.log('Modern UI Components loaded');

  // Initialize all components
  initializeSidebar();
  initializeHeader();
  initializeProcessButton();
  initializeDocumentChat();
  initializeLoginForm();
  initializeGoogleLogin();
  initializeAgentCards();
  initializeDarkMode();

  // Run validation to check if all required elements are present
  validateUIComponents();
});

/**
 * Initialize sidebar functionality
 */
function initializeSidebar() {
  const sidebarToggle = document.querySelector('.sidebar-toggle');
  const sidebar = document.querySelector('.sidebar');
  const mainContent = document.querySelector('.main-content');
  const mobileSidebarToggle = document.querySelector('.mobile-sidebar-toggle');
  const sidebarOverlay = document.querySelector('.sidebar-overlay');

  if (sidebarToggle) {
    sidebarToggle.addEventListener('click', function() {
      sidebar.classList.toggle('sidebar-collapsed');
      mainContent.classList.toggle('main-content-expanded');
    });
  }

  if (mobileSidebarToggle) {
    mobileSidebarToggle.addEventListener('click', function() {
      sidebar.classList.toggle('mobile-visible');
      sidebarOverlay.classList.toggle('visible');
    });
  }

  if (sidebarOverlay) {
    sidebarOverlay.addEventListener('click', function() {
      sidebar.classList.remove('mobile-visible');
      sidebarOverlay.classList.remove('visible');
    });
  }

  // Set active link based on current page
  const currentPath = window.location.pathname;
  const navLinks = document.querySelectorAll('.nav-link');

  navLinks.forEach(link => {
    const linkPath = link.getAttribute('href');
    if (currentPath === linkPath || (linkPath !== '/' && currentPath.startsWith(linkPath))) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
}

/**
 * Initialize header functionality
 */
function initializeHeader() {
  const userMenuButton = document.querySelector('.user-menu-button');
  const userMenuDropdown = document.querySelector('.user-menu-dropdown');

  if (userMenuButton && userMenuDropdown) {
    userMenuButton.addEventListener('click', function() {
      userMenuDropdown.classList.toggle('show');
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', function(event) {
      if (!userMenuButton.contains(event.target) && !userMenuDropdown.contains(event.target)) {
        userMenuDropdown.classList.remove('show');
      }
    });
  }
}

/**
 * Initialize process button functionality
 */
function initializeProcessButton() {
  // Check if we need to create the process button
  if (!document.getElementById('process-document-btn')) {
    // Check if we're on a page that needs the process button
    const isUploadPage = window.location.pathname.includes('/upload');
    const isDocumentDetailsPage = window.location.pathname.includes('/document/');

    if (isUploadPage) {
      createProcessButtonForUpload();
    } else if (isDocumentDetailsPage) {
      createProcessButtonForDocumentDetails();
    }
  } else {
    // Process button already exists, just add event listener
    const processButton = document.getElementById('process-document-btn');
    processButton.addEventListener('click', handleProcessButtonClick);
  }
}

/**
 * Create process button for upload page
 */
function createProcessButtonForUpload() {
  const uploadActions = document.querySelector('.upload-options-content');

  if (uploadActions) {
    const processButton = document.createElement('button');
    processButton.id = 'process-document-btn';
    processButton.innerHTML = '<span class="process-button-icon">⚙️</span> Process Document';
    processButton.addEventListener('click', handleProcessButtonClick);

    uploadActions.appendChild(processButton);
    console.log('Process button added to upload page');
  }
}

/**
 * Create process button for document details page
 */
function createProcessButtonForDocumentDetails() {
  const documentSidebar = document.querySelector('.document-sidebar');

  if (documentSidebar) {
    const processButton = document.createElement('button');
    processButton.id = 'process-document-btn';
    processButton.innerHTML = '<span class="process-button-icon">⚙️</span> Process Document';
    processButton.addEventListener('click', handleProcessButtonClick);

    documentSidebar.appendChild(processButton);
    console.log('Process button added to document details page');
  }
}

/**
 * Handle process button click
 */
function handleProcessButtonClick() {
  console.log('Process button clicked');

  // Show progress container
  const progressContainer = document.getElementById('progress-container');
  if (progressContainer) {
    progressContainer.classList.add('visible');
  } else {
    createProgressContainer();
  }

  // Simulate processing
  simulateDocumentProcessing();
}

/**
 * Create progress container
 */
function createProgressContainer() {
  const container = document.createElement('div');
  container.id = 'progress-container';
  container.classList.add('visible');
  container.innerHTML = `
    <div class="progress-title">Processing Document...</div>
    <div class="progress-bar-container">
      <div id="progress-bar" style="width: 0%"></div>
    </div>
    <div id="upload-status">Starting process...</div>
  `;

  // Find appropriate place to add the progress container
  const uploadPage = document.querySelector('.upload-page');
  const documentDetailsPage = document.querySelector('.document-details-page');

  if (uploadPage) {
    uploadPage.appendChild(container);
  } else if (documentDetailsPage) {
    const documentSidebar = document.querySelector('.document-sidebar');
    if (documentSidebar) {
      documentSidebar.appendChild(container);
    }
  }
}

/**
 * Simulate document processing
 */
function simulateDocumentProcessing() {
  const progressBar = document.getElementById('progress-bar');
  const uploadStatus = document.getElementById('upload-status');
  const processButton = document.getElementById('process-document-btn');

  if (progressBar && uploadStatus && processButton) {
    let progress = 0;
    processButton.disabled = true;

    const interval = setInterval(() => {
      progress += 5;
      progressBar.style.width = `${progress}%`;

      if (progress < 30) {
        uploadStatus.textContent = 'Extracting text...';
      } else if (progress < 60) {
        uploadStatus.textContent = 'Analyzing content...';
      } else if (progress < 90) {
        uploadStatus.textContent = 'Extracting financial data...';
      } else {
        uploadStatus.textContent = 'Finalizing...';
      }

      if (progress >= 100) {
        clearInterval(interval);
        uploadStatus.textContent = 'Processing complete!';
        processButton.disabled = false;

        // Redirect to document details page after processing (for upload page)
        if (window.location.pathname.includes('/upload')) {
          setTimeout(() => {
            window.location.href = '/documents-new';
          }, 1000);
        }
      }
    }, 200);
  }
}

/**
 * Initialize document chat functionality
 */
function initializeDocumentChat() {
  // Check if we need to create the document chat container
  if (!document.getElementById('document-chat-container')) {
    // Check if we're on a page that needs the document chat
    const isDocumentDetailsPage = window.location.pathname.includes('/document/');
    const isDocumentChatPage = window.location.pathname.includes('/document-chat');

    if (isDocumentDetailsPage || isDocumentChatPage) {
      createDocumentChatContainer();
    } else {
      // Add floating chat button to other pages
      createFloatingChatButton();
    }
  } else {
    // Document chat already exists, just add event listeners
    initializeChatEventListeners();
  }
}

/**
 * Create document chat container
 */
function createDocumentChatContainer() {
  const container = document.createElement('div');
  container.id = 'document-chat-container';
  container.innerHTML = `
    <div class="chat-header">
      <div class="chat-title">
        <span class="chat-title-icon">💬</span>
        Document Chat
      </div>
      <div class="chat-actions">
        <button class="chat-action" title="Clear Chat">🗑️</button>
        <button class="chat-action" title="Minimize">➖</button>
      </div>
    </div>
    <div class="chat-messages">
      <div class="chat-message">
        <div class="chat-message-avatar">AI</div>
        <div class="chat-message-content">
          <div class="chat-message-bubble">
            Hello! I'm your document assistant. Ask me anything about this document.
          </div>
          <div class="chat-message-meta">
            <div class="chat-message-time">Just now</div>
          </div>
        </div>
      </div>
    </div>
    <div class="chat-input-container">
      <input type="text" class="chat-input" placeholder="Ask a question about this document...">
      <button id="document-send-btn" title="Send Message">📤</button>
    </div>
  `;

  // Find appropriate place to add the chat container
  const documentSidebar = document.querySelector('.document-sidebar');
  const documentChatPage = document.querySelector('.document-chat-page');

  if (documentSidebar) {
    documentSidebar.appendChild(container);
  } else if (documentChatPage) {
    documentChatPage.appendChild(container);
  }

  // Initialize chat event listeners
  initializeChatEventListeners();
}

/**
 * Initialize chat event listeners
 */
function initializeChatEventListeners() {
  const chatInput = document.querySelector('.chat-input');
  const sendButton = document.getElementById('document-send-btn');
  const chatMessages = document.querySelector('.chat-messages');

  if (chatInput && sendButton && chatMessages) {
    // Send message on button click
    sendButton.addEventListener('click', () => {
      sendChatMessage(chatInput.value);
    });

    // Send message on Enter key
    chatInput.addEventListener('keypress', (event) => {
      if (event.key === 'Enter') {
        sendChatMessage(chatInput.value);
      }
    });

    // Clear chat button
    const clearButton = document.querySelector('.chat-action[title="Clear Chat"]');
    if (clearButton) {
      clearButton.addEventListener('click', () => {
        chatMessages.innerHTML = `
          <div class="chat-message">
            <div class="chat-message-avatar">AI</div>
            <div class="chat-message-content">
              <div class="chat-message-bubble">
                Hello! I'm your document assistant. Ask me anything about this document.
              </div>
              <div class="chat-message-meta">
                <div class="chat-message-time">Just now</div>
              </div>
            </div>
          </div>
        `;
      });
    }

    // Minimize chat button
    const minimizeButton = document.querySelector('.chat-action[title="Minimize"]');
    if (minimizeButton) {
      minimizeButton.addEventListener('click', () => {
        const chatContainer = document.getElementById('document-chat-container');
        chatContainer.style.display = 'none';

        // Show floating chat button
        createFloatingChatButton();
      });
    }
  }
}

/**
 * Send chat message
 */
function sendChatMessage(message) {
  if (!message.trim()) return;

  const chatMessages = document.querySelector('.chat-messages');
  const chatInput = document.querySelector('.chat-input');

  if (chatMessages && chatInput) {
    // Add user message
    const userMessage = document.createElement('div');
    userMessage.className = 'chat-message user';
    userMessage.innerHTML = `
      <div class="chat-message-avatar">You</div>
      <div class="chat-message-content">
        <div class="chat-message-bubble">${message}</div>
        <div class="chat-message-meta">
          <div class="chat-message-time">Just now</div>
        </div>
      </div>
    `;
    chatMessages.appendChild(userMessage);

    // Clear input
    chatInput.value = '';

    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;

    // Show loading indicator
    const loadingIndicator = document.createElement('div');
    loadingIndicator.className = 'chat-loading';
    loadingIndicator.innerHTML = `
      <div class="chat-loading-dots">
        <div class="chat-loading-dot"></div>
        <div class="chat-loading-dot"></div>
        <div class="chat-loading-dot"></div>
      </div>
    `;
    chatMessages.appendChild(loadingIndicator);

    // Simulate AI response
    setTimeout(() => {
      // Remove loading indicator
      chatMessages.removeChild(loadingIndicator);

      // Add AI response
      const aiResponse = document.createElement('div');
      aiResponse.className = 'chat-message';
      aiResponse.innerHTML = `
        <div class="chat-message-avatar">AI</div>
        <div class="chat-message-content">
          <div class="chat-message-bubble">
            ${generateAIResponse(message)}
          </div>
          <div class="chat-message-meta">
            <div class="chat-message-time">Just now</div>
          </div>
        </div>
      `;
      chatMessages.appendChild(aiResponse);

      // Scroll to bottom
      chatMessages.scrollTop = chatMessages.scrollHeight;
    }, 1500);
  }
}

/**
 * Generate AI response based on user message
 */
function generateAIResponse(message) {
  const responses = [
    "Based on the document, the total portfolio value is $1,245,678.90.",
    "The document contains 15 securities, with the largest position being Apple Inc. at 12% of the portfolio.",
    "According to the financial report, the company's revenue increased by 8.3% year-over-year.",
    "The document shows that the debt-to-equity ratio is 0.45, which is considered healthy for this industry.",
    "Based on my analysis, the portfolio has a diversification score of 7.2/10, suggesting room for improvement in sector allocation.",
    "The document indicates that the annual return for this investment was 9.7%, outperforming the benchmark by 1.2%.",
    "I found that the document contains information about 3 different asset classes: equities (65%), fixed income (25%), and alternatives (10%).",
    "According to the financial statement, the company's operating margin improved from 15.3% to 17.8% in the last fiscal year."
  ];

  return responses[Math.floor(Math.random() * responses.length)];
}

/**
 * Create floating chat button
 */
function createFloatingChatButton() {
  // Check if floating button already exists
  if (document.querySelector('.chat-floating-button')) return;

  const button = document.createElement('button');
  button.className = 'chat-floating-button';
  button.innerHTML = '<span class="chat-floating-icon">💬</span>';
  button.addEventListener('click', toggleFloatingChat);

  document.body.appendChild(button);
}

/**
 * Toggle floating chat
 */
function toggleFloatingChat() {
  let chatContainer = document.querySelector('.chat-floating-container');

  if (!chatContainer) {
    // Create floating chat container
    chatContainer = document.createElement('div');
    chatContainer.className = 'chat-floating-container';
    chatContainer.innerHTML = `
      <div class="chat-header">
        <div class="chat-title">
          <span class="chat-title-icon">💬</span>
          Document Chat
        </div>
        <div class="chat-actions">
          <button class="chat-action" title="Clear Chat">🗑️</button>
          <button class="chat-action" title="Close">✖️</button>
        </div>
      </div>
      <div class="chat-messages">
        <div class="chat-message">
          <div class="chat-message-avatar">AI</div>
          <div class="chat-message-content">
            <div class="chat-message-bubble">
              Hello! I'm your document assistant. Ask me anything about your documents.
            </div>
            <div class="chat-message-meta">
              <div class="chat-message-time">Just now</div>
            </div>
          </div>
        </div>
      </div>
      <div class="chat-input-container">
        <input type="text" class="chat-input" placeholder="Ask a question...">
        <button id="document-send-btn" title="Send Message">📤</button>
      </div>
    `;

    document.body.appendChild(chatContainer);

    // Initialize chat event listeners
    initializeChatEventListeners();

    // Add close button event listener
    const closeButton = chatContainer.querySelector('.chat-action[title="Close"]');
    if (closeButton) {
      closeButton.addEventListener('click', () => {
        chatContainer.classList.remove('visible');
      });
    }
  }

  // Toggle visibility
  chatContainer.classList.toggle('visible');

  // Hide floating button when chat is visible
  const floatingButton = document.querySelector('.chat-floating-button');
  if (floatingButton) {
    floatingButton.style.display = chatContainer.classList.contains('visible') ? 'none' : 'flex';
  }
}

/**
 * Initialize login form functionality
 */
function initializeLoginForm() {
  // Check if we need to create the login form
  if (!document.getElementById('login-form')) {
    // Check if we're on a login page
    const isLoginPage = window.location.pathname.includes('/login');

    if (isLoginPage) {
      createLoginForm();
    }
  } else {
    // Login form already exists, just add event listeners
    const loginForm = document.getElementById('login-form');
    loginForm.addEventListener('submit', handleLoginFormSubmit);
  }
}

/**
 * Create login form
 */
function createLoginForm() {
  const loginPage = document.querySelector('.login-page');

  if (!loginPage) return;

  const loginContainer = document.createElement('div');
  loginContainer.className = 'login-container';
  loginContainer.innerHTML = `
    <div class="login-header">
      <div class="login-logo">
        <img src="/images/logo.png" alt="FinDoc Analyzer Logo">
      </div>
      <h1 class="login-title">Welcome to FinDoc Analyzer</h1>
      <p class="login-subtitle">Sign in to your account to continue</p>
    </div>

    <form id="login-form">
      <div class="login-form-group">
        <label for="email" class="login-form-label">Email Address</label>
        <input type="email" id="email" class="login-form-input" placeholder="Enter your email" required>
      </div>

      <div class="login-form-group">
        <label for="password" class="login-form-label">Password</label>
        <input type="password" id="password" class="login-form-input" placeholder="Enter your password" required>
      </div>

      <div class="login-form-options">
        <div class="login-form-remember">
          <input type="checkbox" id="remember" checked>
          <label for="remember">Remember me</label>
        </div>
        <a href="/forgot-password" class="login-form-forgot">Forgot password?</a>
      </div>

      <button type="submit" class="login-form-submit">
        <span class="login-form-submit-icon">🔒</span>
        Sign In
      </button>
    </form>

    <div class="login-divider">OR</div>

    <div class="social-login">
      <button id="google-login-btn">
        <span class="google-login-icon">G</span>
        Sign in with Google
      </button>
    </div>

    <div class="login-footer">
      <p class="login-signup">
        Don't have an account? <a href="/register" class="login-signup-link">Sign up</a>
      </p>
    </div>
  `;

  loginPage.appendChild(loginContainer);

  // Add event listeners
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', handleLoginFormSubmit);
  }
}

/**
 * Handle login form submit
 */
function handleLoginFormSubmit(event) {
  event.preventDefault();

  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  console.log('Login attempt:', { email, password });

  // Simulate login process
  const loginForm = document.getElementById('login-form');
  const submitButton = loginForm.querySelector('.login-form-submit');

  submitButton.disabled = true;
  submitButton.innerHTML = '<span class="login-form-submit-icon">⏳</span> Signing In...';

  setTimeout(() => {
    // Redirect to dashboard after successful login
    window.location.href = '/';
  }, 1500);
}

/**
 * Initialize Google login functionality
 */
function initializeGoogleLogin() {
  // Check if we need to create the Google login button
  const googleLoginBtn = document.getElementById('google-login-btn');

  if (googleLoginBtn) {
    googleLoginBtn.addEventListener('click', handleGoogleLogin);
  }
}

/**
 * Handle Google login
 */
function handleGoogleLogin() {
  console.log('Google login clicked');

  // Simulate Google login process
  const googleLoginBtn = document.getElementById('google-login-btn');

  googleLoginBtn.disabled = true;
  googleLoginBtn.innerHTML = '<span class="google-login-icon">G</span> Signing in with Google...';

  setTimeout(() => {
    // Redirect to dashboard after successful login
    window.location.href = '/';
  }, 1500);
}

/**
 * Initialize agent cards functionality
 */
function initializeAgentCards() {
  // Check if we need to create agent cards
  const agentCardsContainer = document.querySelector('.agent-cards-container');

  if (!agentCardsContainer) {
    // Check if we're on a page that needs agent cards
    const isDashboardPage = window.location.pathname === '/' || window.location.pathname.includes('/dashboard');
    const isAgentsPage = window.location.pathname.includes('/agents');

    if (isDashboardPage || isAgentsPage) {
      createAgentCards();
    }
  } else {
    // Agent cards already exist, just add event listeners
    initializeAgentCardEventListeners();
  }
}

/**
 * Create agent cards
 */
function createAgentCards() {
  const dashboardSection = document.querySelector('.dashboard-section');
  const agentsPage = document.querySelector('.agents-page');

  if (!dashboardSection && !agentsPage) return;

  const container = document.createElement('div');
  container.className = 'agent-cards-container';

  // Define agent data
  const agents = [
    {
      id: 'document-analyzer',
      title: 'Document Analyzer',
      icon: '📄',
      description: 'Extracts text and structure from financial documents.',
      status: 'active',
      stats: {
        processed: 152,
        success: '98%'
      },
      progress: 85
    },
    {
      id: 'table-understanding',
      title: 'Table Understanding',
      icon: '📊',
      description: 'Extracts and analyzes tables from financial documents.',
      status: 'active',
      stats: {
        processed: 87,
        success: '92%'
      },
      progress: 78
    },
    {
      id: 'securities-extractor',
      title: 'Securities Extractor',
      icon: '💼',
      description: 'Identifies and extracts securities information.',
      status: 'active',
      stats: {
        processed: 124,
        success: '95%'
      },
      progress: 90
    },
    {
      id: 'financial-reasoner',
      title: 'Financial Reasoner',
      icon: '🧠',
      description: 'Analyzes financial data and provides insights.',
      status: 'active',
      stats: {
        processed: 98,
        success: '89%'
      },
      progress: 72
    }
  ];

  // Create agent cards
  agents.forEach(agent => {
    const agentCard = document.createElement('div');
    agentCard.className = `agent-card ${agent.id}`;
    agentCard.innerHTML = `
      <div class="agent-card-header">
        <div class="agent-card-title">
          <div class="agent-card-icon">${agent.icon}</div>
          ${agent.title}
        </div>
        <div class="agent-card-subtitle">AI Agent</div>
        <div class="status-indicator ${agent.status}">
          <span class="status-indicator-icon">●</span>
          ${agent.status.charAt(0).toUpperCase() + agent.status.slice(1)}
        </div>
      </div>
      <div class="agent-card-body">
        <div class="agent-card-description">${agent.description}</div>
        <div class="agent-card-stats">
          <div class="agent-card-stat">
            <div class="agent-card-stat-value">${agent.stats.processed}</div>
            <div class="agent-card-stat-label">Documents</div>
          </div>
          <div class="agent-card-stat">
            <div class="agent-card-stat-value">${agent.stats.success}</div>
            <div class="agent-card-stat-label">Success Rate</div>
          </div>
        </div>
        <div class="agent-card-progress">
          <div class="agent-card-progress-header">
            <div class="agent-card-progress-label">Performance</div>
            <div class="agent-card-progress-value">${agent.progress}%</div>
          </div>
          <div class="agent-card-progress-bar">
            <div class="agent-card-progress-fill" style="width: ${agent.progress}%"></div>
          </div>
        </div>
      </div>
      <div class="agent-card-footer">
        <div class="agent-card-updated">Updated 2 hours ago</div>
        <div class="agent-card-actions">
          <button class="agent-action" data-agent-id="${agent.id}">
            <span class="agent-action-icon">📊</span>
            Details
          </button>
        </div>
      </div>
    `;

    container.appendChild(agentCard);
  });

  // Add container to the page
  if (dashboardSection) {
    dashboardSection.appendChild(container);
  } else if (agentsPage) {
    agentsPage.appendChild(container);
  }

  // Initialize agent card event listeners
  initializeAgentCardEventListeners();
}

/**
 * Initialize agent card event listeners
 */
function initializeAgentCardEventListeners() {
  const agentActions = document.querySelectorAll('.agent-action');

  agentActions.forEach(action => {
    action.addEventListener('click', () => {
      const agentId = action.getAttribute('data-agent-id');
      console.log(`Agent action clicked for ${agentId}`);

      // Show agent details
      showAgentDetails(agentId);
    });
  });
}

/**
 * Show agent details
 */
function showAgentDetails(agentId) {
  // Create agent details modal
  const modal = document.createElement('div');
  modal.className = 'agent-card-expanded';
  modal.innerHTML = `
    <div class="agent-card-expanded-content">
      <div class="agent-card-expanded-header">
        <div class="agent-card-expanded-title">Agent Details: ${agentId.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}</div>
        <button class="agent-card-expanded-close">✖️</button>
      </div>
      <div class="agent-card-expanded-body">
        <p>Detailed information about this agent will be displayed here.</p>
        <p>This would include performance metrics, configuration options, and usage statistics.</p>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  // Show modal with animation
  setTimeout(() => {
    modal.classList.add('visible');
  }, 10);

  // Add close button event listener
  const closeButton = modal.querySelector('.agent-card-expanded-close');
  if (closeButton) {
    closeButton.addEventListener('click', () => {
      modal.classList.remove('visible');
      setTimeout(() => {
        document.body.removeChild(modal);
      }, 300);
    });
  }
}

/**
 * Initialize dark mode functionality
 */
function initializeDarkMode() {
  // Check if dark mode toggle exists
  let darkModeToggle = document.querySelector('.dark-mode-toggle');

  if (!darkModeToggle) {
    // Create dark mode toggle
    darkModeToggle = document.createElement('button');
    darkModeToggle.className = 'dark-mode-toggle';
    darkModeToggle.innerHTML = '<span class="dark-mode-toggle-icon">🌙</span>';
    darkModeToggle.title = 'Toggle Dark Mode';

    document.body.appendChild(darkModeToggle);
  }

  // Check if user prefers dark mode
  const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;

  // Check if dark mode is stored in localStorage
  const storedDarkMode = localStorage.getItem('darkMode') === 'true';

  // Apply dark mode if needed
  if (storedDarkMode || (prefersDarkMode && localStorage.getItem('darkMode') === null)) {
    document.body.classList.add('dark-mode');
    darkModeToggle.innerHTML = '<span class="dark-mode-toggle-icon">☀️</span>';
  }

  // Add event listener
  darkModeToggle.addEventListener('click', toggleDarkMode);
}

/**
 * Toggle dark mode
 */
function toggleDarkMode() {
  const darkModeToggle = document.querySelector('.dark-mode-toggle');
  const isDarkMode = document.body.classList.toggle('dark-mode');

  // Update toggle icon
  darkModeToggle.innerHTML = isDarkMode ?
    '<span class="dark-mode-toggle-icon">☀️</span>' :
    '<span class="dark-mode-toggle-icon">🌙</span>';

  // Store preference
  localStorage.setItem('darkMode', isDarkMode);
}

/**
 * Validate UI components
 */
function validateUIComponents() {
  console.log('Validating UI components...');

  // List of required components
  const requiredComponents = [
    { name: 'Process Document Button', selector: '#process-document-btn' },
    { name: 'Document Chat Container', selector: '#document-chat-container' },
    { name: 'Document Chat Send Button', selector: '#document-send-btn' },
    { name: 'Login Form', selector: '#login-form' },
    { name: 'Google Login Button', selector: '#google-login-btn' }
  ];

  // Check if we're on a page that requires these components
  const isUploadPage = window.location.pathname.includes('/upload');
  const isDocumentDetailsPage = window.location.pathname.includes('/document/');
  const isLoginPage = window.location.pathname.includes('/login');

  // Filter required components based on current page
  let pageRequiredComponents = [];

  if (isUploadPage) {
    pageRequiredComponents.push(
      { name: 'Process Document Button', selector: '#process-document-btn' }
    );
  } else if (isDocumentDetailsPage) {
    pageRequiredComponents.push(
      { name: 'Process Document Button', selector: '#process-document-btn' },
      { name: 'Document Chat Container', selector: '#document-chat-container' },
      { name: 'Document Chat Send Button', selector: '#document-send-btn' }
    );
  } else if (isLoginPage) {
    pageRequiredComponents.push(
      { name: 'Login Form', selector: '#login-form' },
      { name: 'Google Login Button', selector: '#google-login-btn' }
    );
  }

  // Check if required components exist
  const missingComponents = pageRequiredComponents.filter(component => {
    return !document.querySelector(component.selector);
  });

  // Log missing components
  if (missingComponents.length > 0) {
    console.warn('Missing UI components:', missingComponents.map(c => c.name).join(', '));

    // Create missing components
    missingComponents.forEach(component => {
      console.log(`Creating missing component: ${component.name}`);

      if (component.name === 'Process Document Button') {
        initializeProcessButton();
      } else if (component.name === 'Document Chat Container' || component.name === 'Document Chat Send Button') {
        initializeDocumentChat();
      } else if (component.name === 'Login Form') {
        initializeLoginForm();
      } else if (component.name === 'Google Login Button') {
        initializeGoogleLogin();
      }
    });
  } else {
    console.log('All required UI components are present.');
  }
}
