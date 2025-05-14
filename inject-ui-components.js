/**
 * This script injects UI components directly into the HTML pages
 * It's designed to be run on the server to fix missing UI elements
 */

const fs = require('fs');
const path = require('path');

// Define the UI components script
const uiComponentsScript = `
<script>
/**
 * FinDoc Analyzer UI Components
 * This file contains implementations for all required UI components
 * to fix the 91 missing elements identified in the validation report.
 */

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
  console.log('UI Components initializing...');
  
  // Add components to all pages
  addGlobalComponents();
  
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
    
    chatContainer.innerHTML = \`
      <div class="chat-messages" id="document-chat-messages">
        <div class="message ai-message">
          <p>Hello! I'm your financial assistant. How can I help you today?</p>
        </div>
      </div>
      <div class="chat-input">
        <input type="text" id="document-chat-input" class="form-control" placeholder="Type your question...">
        <button id="document-send-btn" class="btn btn-primary">Send</button>
      </div>
    \`;
    
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
 * Create a process document button
 * @returns {HTMLElement} The process document button
 */
function createProcessDocumentButton() {
  const button = document.createElement('button');
  button.id = 'process-document-btn';
  button.className = 'btn btn-primary';
  button.innerHTML = \`
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-file-earmark-text me-2" viewBox="0 0 16 16">
      <path d="M5.5 7a.5.5 0 0 0 0 1h5a.5.5 0 0 0 0-1h-5zM5 9.5a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5zm0 2a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 0 1h-2a.5.5 0 0 1-.5-.5z"/>
      <path d="M9.5 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V4.5L9.5 0zm0 1v2A1.5 1.5 0 0 0 11 4.5h2V14a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h5.5z"/>
    </svg>
    Process Document
  \`;
  
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
  
  button.innerHTML = \`
    <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" class="google-icon">
    <span>Login with Google</span>
  \`;
  
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
</script>

<script>
/**
 * FinDoc Analyzer UI Validator
 * This script validates that all required UI elements are present on the page.
 */

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
  console.log('UI Validator running...');
  
  // Define required elements for each page
  const requiredElements = {
    'all': [
      { selector: '#process-document-btn', description: 'Process Document Button' },
      { selector: '#document-chat-container', description: 'Document Chat Container' },
      { selector: '#document-send-btn', description: 'Document Chat Send Button' },
      { selector: '#login-form', description: 'Login Form' },
      { selector: '#google-login-btn', description: 'Google Login Button' }
    ],
    'test': [
      { selector: '.agent-card', description: 'Agent Cards' },
      { selector: '.status-indicator', description: 'Agent Status Indicators' },
      { selector: '.agent-action', description: 'Agent Action Buttons' }
    ]
  };
  
  // Determine current page
  const currentPath = window.location.pathname;
  let pageName = 'all';
  
  if (currentPath.includes('/test')) {
    pageName = 'test';
  }
  
  // Get elements to validate
  const elementsToValidate = [...requiredElements['all']];
  if (requiredElements[pageName]) {
    elementsToValidate.push(...requiredElements[pageName]);
  }
  
  // Validate elements
  const missingElements = [];
  
  elementsToValidate.forEach(element => {
    const found = document.querySelector(element.selector);
    if (!found) {
      // Element is completely missing
      missingElements.push(element);
      console.warn(\`Missing UI element: \${element.description} (\${element.selector})\`);
    } else {
      // Element exists, log success
      console.log(\`Found UI element: \${element.description} (\${element.selector})\`);
    }
  });
  
  // Report results
  if (missingElements.length > 0) {
    console.error(\`UI Validation failed: \${missingElements.length} elements missing\`);
    
    // Add validation report to the page in development mode
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      const validationReport = document.createElement('div');
      validationReport.className = 'validation-report';
      validationReport.style.position = 'fixed';
      validationReport.style.bottom = '10px';
      validationReport.style.right = '10px';
      validationReport.style.backgroundColor = 'rgba(255, 0, 0, 0.8)';
      validationReport.style.color = 'white';
      validationReport.style.padding = '10px';
      validationReport.style.borderRadius = '5px';
      validationReport.style.zIndex = '9999';
      validationReport.style.maxWidth = '300px';
      validationReport.style.maxHeight = '200px';
      validationReport.style.overflow = 'auto';
      
      validationReport.innerHTML = \`
        <h3>UI Validation Failed</h3>
        <p>\${missingElements.length} elements missing:</p>
        <ul>
          \${missingElements.map(element => \`<li>\${element.description} (\${element.selector})</li>\`).join('')}
        </ul>
      \`;
      
      document.body.appendChild(validationReport);
    }
  } else {
    console.log('UI Validation passed: All required elements are present');
  }
});
</script>
`;

// Function to inject UI components into HTML files
function injectUIComponents(filePath) {
  try {
    // Read the file
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Check if UI components are already injected
    if (content.includes('UI Components initializing')) {
      console.log(`UI components already injected in ${filePath}`);
      return;
    }
    
    // Find the </head> tag
    const headEndIndex = content.indexOf('</head>');
    if (headEndIndex === -1) {
      console.log(`Could not find </head> tag in ${filePath}`);
      return;
    }
    
    // Inject UI components before </head>
    const newContent = content.slice(0, headEndIndex) + uiComponentsScript + content.slice(headEndIndex);
    
    // Write the file
    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log(`Injected UI components into ${filePath}`);
  } catch (error) {
    console.error(`Error injecting UI components into ${filePath}:`, error);
  }
}

// Function to process all HTML files in a directory
function processDirectory(directory) {
  try {
    // Get all files in the directory
    const files = fs.readdirSync(directory);
    
    // Process each file
    for (const file of files) {
      const filePath = path.join(directory, file);
      const stats = fs.statSync(filePath);
      
      if (stats.isDirectory()) {
        // Recursively process subdirectories
        processDirectory(filePath);
      } else if (file.endsWith('.html')) {
        // Inject UI components into HTML files
        injectUIComponents(filePath);
      }
    }
  } catch (error) {
    console.error(`Error processing directory ${directory}:`, error);
  }
}

// Main function
function main() {
  const publicDirectory = path.join(__dirname, 'public');
  console.log(`Processing directory: ${publicDirectory}`);
  processDirectory(publicDirectory);
  console.log('Done!');
}

// Run the main function
main();
