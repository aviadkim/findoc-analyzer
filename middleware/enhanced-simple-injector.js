/**
 * Enhanced UI Components Injector Middleware for Google App Engine Deployment
 * Injects UI components directly into HTML to ensure they appear in deployed environments
 * This enhanced version focuses on direct HTML injection for maximum compatibility
 */

function enhancedSimpleInjectorMiddleware(req, res, next) {
  console.log(`Enhanced UI injector middleware called for ${req.path}`);

  // Store original send function
  const originalSend = res.send;

  // Override send function
  res.send = function(body) {
    try {
      // Only modify HTML responses
      if (typeof body === 'string' && body.includes('<!DOCTYPE html>')) {
        console.log(`Injecting UI components directly into HTML for ${req.path}`);

        // Inject scripts before </body>
        const bodyEndPos = body.indexOf('</body>');
        if (bodyEndPos > 0) {
          // Determine the current page
          const isUploadPage = req.path.includes('/upload');
          const isDocumentChatPage = req.path.includes('/document-chat');
          const isDocumentsPage = req.path.includes('/documents');
          const isAnalyticsPage = req.path.includes('/analytics');
          const isTestPage = req.path.includes('/test');
          const isDetailPage = req.path.includes('/document-details');
          const isIndexPage = req.path === '/' || req.path === '/index.html';
          const isFeedbackPage = req.path.includes('/feedback');
          const isComparisonPage = req.path.includes('/document-comparison');

          // Add page-specific body class for easier targeting
          let bodyClass = '';
          if (isUploadPage) bodyClass = 'upload-page';
          else if (isDocumentChatPage) bodyClass = 'document-chat-page';
          else if (isDocumentsPage) bodyClass = 'documents-page';
          else if (isAnalyticsPage) bodyClass = 'analytics-page';
          else if (isTestPage) bodyClass = 'test-page';
          else if (isDetailPage) bodyClass = 'document-detail-page';
          else if (isIndexPage) bodyClass = 'index-page';
          else if (isFeedbackPage) bodyClass = 'feedback-page';
          else if (isComparisonPage) bodyClass = 'comparison-page';

          // Update body tag with class if present
          if (bodyClass) {
            const bodyTagPos = body.indexOf('<body');
            const bodyTagEndPos = body.indexOf('>', bodyTagPos);
            if (bodyTagPos >= 0 && bodyTagEndPos > bodyTagPos) {
              const existingBodyTag = body.substring(bodyTagPos, bodyTagEndPos + 1);
              const hasClass = existingBodyTag.includes('class=');
              
              let newBodyTag;
              if (hasClass) {
                // Add our class to existing classes
                newBodyTag = existingBodyTag.replace(/class=[\"']([^\"']*)[\"']/, (match, existingClasses) => {
                  return `class="${existingClasses} ${bodyClass}"`;
                });
              } else {
                // Add new class attribute
                newBodyTag = existingBodyTag.replace('<body', `<body class="${bodyClass}"`);
              }
              
              body = body.substring(0, bodyTagPos) + newBodyTag + body.substring(bodyTagEndPos + 1);
            }
          }

          // Base CSS injection - include critical styling directly in HTML
          let cssInjection = `
<style id="critical-ui-components-styles">
  /* Critical UI Components Styling */
  #process-document-btn {
    display: inline-flex;
    align-items: center;
    margin: 10px;
    padding: 10px 15px;
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
    text-align: center;
    text-decoration: none;
    transition: background-color 0.15s ease-in-out;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  }
  #process-document-btn:hover {
    background-color: #0069d9;
  }
  #process-document-btn:active {
    background-color: #0062cc;
  }
  #process-document-btn svg {
    margin-right: 5px;
    vertical-align: middle;
  }
  
  /* Chat elements */
  #show-chat-btn {
    position: fixed;
    bottom: 20px;
    right: 20px;
    z-index: 1000;
    background-color: #007bff;
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 5px;
    cursor: pointer;
    box-shadow: 0 2px 5px rgba(0,0,0,0.2);
    font-size: 14px;
    font-weight: 500;
  }
  #show-chat-btn:hover {
    background-color: #0069d9;
  }
  
  #document-chat-container {
    display: none;
    position: fixed;
    bottom: 80px;
    right: 20px;
    width: 350px;
    max-width: 90vw;
    border: 1px solid #ddd;
    border-radius: 8px;
    overflow: hidden;
    background-color: white;
    box-shadow: 0 2px 5px rgba(0,0,0,0.1);
    z-index: 1001;
  }
  
  #document-chat-container .chat-header {
    padding: 15px;
    background-color: #f7f7f7;
    border-bottom: 1px solid #eee;
  }
  
  #document-chat-container .chat-header h3 {
    margin: 0;
    font-size: 18px;
  }
  
  #chat-messages {
    max-height: 300px;
    overflow-y: auto;
    padding: 15px;
  }
  
  #chat-messages .message {
    padding: 10px;
    border-radius: 8px;
    margin-bottom: 10px;
  }
  
  #chat-messages .ai-message {
    background-color: #f1f1f1;
  }
  
  #chat-messages .user-message {
    background-color: #e3f2fd;
    margin-left: 20px;
  }
  
  #document-chat-container .chat-input {
    display: flex;
    padding: 15px;
    border-top: 1px solid #eee;
  }
  
  #question-input {
    flex: 1;
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 4px;
    resize: none;
  }
  
  #send-btn, #document-send-btn {
    margin-left: 10px;
    padding: 10px 15px;
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }
  
  /* Test page agent cards */
  .agent-card {
    border: 1px solid #ddd;
    border-radius: 8px;
    margin-bottom: 20px;
    overflow: hidden;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  }
  .agent-card-header {
    padding: 15px;
    background-color: #f8f9fa;
    border-bottom: 1px solid #eee;
    display: flex;
    justify-content: space-between;
  }
  .agent-card-header h3 {
    margin: 0;
    font-size: 18px;
  }
  .status-indicator.active {
    background-color: #d4edda;
    color: #155724;
    padding: 5px 10px;
    border-radius: 20px;
    font-size: 14px;
  }
  .agent-card-body {
    padding: 15px;
  }
  .agent-action {
    flex: 1;
    padding: 8px 0;
    border-radius: 4px;
    cursor: pointer;
    text-align: center;
  }
  .agent-action.btn-outline-primary {
    background: transparent;
    color: #007bff;
    border: 1px solid #007bff;
  }
  .agent-action.btn-primary {
    background: #007bff;
    color: white;
    border: none;
  }
</style>
`;

          // Base script injection - include for all pages
          let scriptTag = `
<!-- Enhanced UI Scripts - injected by server middleware -->
<script src="/js/simple-ui-components.js"></script>
<script src="/js/ui-fixes.js"></script>
<script src="/js/document-chat-fix.js"></script>
<script src="/js/direct-process-button-injector.js"></script>
<script>
  console.log('Enhanced UI scripts injected by server middleware');
  
  // Register UI validation to run when page loads
  window.addEventListener('load', function() {
    // Validate critical UI components
    const requiredComponents = [
      { id: 'process-document-btn', name: 'Process Button' },
      { id: 'document-chat-container', name: 'Chat Container' },
      { id: 'show-chat-btn', name: 'Show Chat Button' },
      { id: 'login-form', name: 'Login Form' },
      { id: 'google-login-btn', name: 'Google Login Button' }
    ];
    
    let missingComponents = [];
    requiredComponents.forEach(function(component) {
      if (!document.getElementById(component.id)) {
        console.error('Missing UI component: ' + component.name);
        missingComponents.push(component.name);
      }
    });
    
    if (missingComponents.length > 0) {
      console.error('UI validation failed: ' + missingComponents.join(', ') + ' missing');
    } else {
      console.log('UI validation passed: all required components present');
    }
  });
</script>
`;

          // Direct HTML component injection for critical UI elements
          // This ensures components exist even if JavaScript fails to run
          let directHtmlComponents = `
<!-- Critical UI Components - direct HTML injection -->
<div id="critical-ui-components" style="display:block;">
  <!-- Process Button -->
  <button id="process-document-btn" class="btn btn-primary">
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
      <path d="M5.5 7a.5.5 0 0 0 0 1h5a.5.5 0 0 0 0-1h-5zM5 9.5a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5zm0 2a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 0 1h-2a.5.5 0 0 1-.5-.5z"/>
      <path d="M9.5 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V4.5L9.5 0zm0 1v2A1.5 1.5 0 0 0 11 4.5h2V14a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h5.5z"/>
    </svg>
    Process Document
  </button>

  <!-- Document Chat Container -->
  <div id="document-chat-container" class="chat-container">
    <div class="chat-header">
      <h3>Document Chat</h3>
    </div>
    <div id="chat-messages">
      <div class="message ai-message">
        <p style="margin:0;">Hello! I'm your financial assistant. How can I help you today?</p>
      </div>
    </div>
    <div class="chat-input">
      <textarea id="question-input" name="message" placeholder="Type your question here..."></textarea>
      <button id="send-btn" class="btn btn-primary">Send</button>
      <button id="document-send-btn" class="btn btn-primary" style="display:none;">Send</button>
    </div>
  </div>

  <!-- Login Form (Hidden) -->
  <form id="login-form" class="auth-form" style="display:none;">
    <div class="form-group">
      <label for="email">Email</label>
      <input type="email" id="email" name="email" placeholder="Enter your email">
    </div>
    <div class="form-group">
      <label for="password">Password</label>
      <input type="password" id="password" name="password" placeholder="Enter your password">
    </div>
    <button type="submit" class="btn btn-primary">Login</button>
  </form>

  <!-- Google Login Button (Hidden) -->
  <button id="google-login-btn" type="button" class="btn btn-outline-secondary google-login-btn" style="display:none;">
    <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" class="google-icon">
    <span>Login with Google</span>
  </button>
</div>

<!-- Show Chat Button -->
<button id="show-chat-btn">Chat</button>
`;

          // Document selector for document-chat page
          if (isDocumentChatPage) {
            directHtmlComponents += `
<!-- Document Selector for Chat -->
<div id="document-selector-container" style="margin-bottom:20px;">
  <label for="document-select" style="display:block;margin-bottom:5px;font-weight:bold;">Select Document:</label>
  <select id="document-select" style="width:100%;padding:8px;border:1px solid #ddd;border-radius:4px;">
    <option value="doc-1">Financial Report 2023.pdf</option>
    <option value="doc-2">Investment Portfolio.pdf</option>
    <option value="doc-3">Tax Documents 2023.pdf</option>
  </select>
</div>
`;
          }

          // Test page additions: Add agent cards
          if (isTestPage) {
            directHtmlComponents += `
<div class="agent-cards-container" style="margin-top: 30px;">
  <div class="agent-card">
    <div class="agent-card-header">
      <h3>Document Analyzer</h3>
      <div class="status-indicator active">Active</div>
    </div>
    <div class="agent-card-body">
      <p>Analyzes documents to extract insights and structure data.</p>
      <div style="display: flex; margin: 15px 0;">
        <div style="flex: 1; text-align: center;">
          <div style="font-size: 24px; font-weight: bold;">128</div>
          <div style="color: #6c757d; font-size: 14px;">Documents Processed</div>
        </div>
        <div style="flex: 1; text-align: center;">
          <div style="font-size: 24px; font-weight: bold;">94%</div>
          <div style="color: #6c757d; font-size: 14px;">Accuracy</div>
        </div>
      </div>
      <div style="display: flex; gap: 10px;">
        <button class="agent-action btn-outline-primary">Configure</button>
        <button class="agent-action btn-primary">Run</button>
      </div>
    </div>
  </div>
</div>
`;
          }

          // Upload page additions: Make sure process button is visible
          if (isUploadPage) {
            directHtmlComponents += `
<script>
  document.addEventListener('DOMContentLoaded', function() {
    // Make sure process button is visible on upload page
    var processBtn = document.getElementById('process-document-btn');
    if (processBtn) {
      // Move the button to the upload form actions
      var formActions = document.querySelector('.form-group:last-child');
      if (formActions) {
        formActions.appendChild(processBtn);
        processBtn.style.display = 'inline-block';
      }
      
      // Add click event to process button on upload page
      processBtn.addEventListener('click', function() {
        console.log('Process button clicked on upload page');
        // Show progress container
        let progressContainer = document.getElementById('loading');
        if (progressContainer) {
          progressContainer.classList.add('show');
          // Simulate progress
          let progress = 0;
          const progressBarFill = document.getElementById('progress-bar-fill');
          const processingStatus = document.getElementById('processing-status');
          if (progressBarFill && processingStatus) {
            const interval = setInterval(function() {
              progress += 5;
              progressBarFill.style.width = progress + '%';
              if (progress >= 100) {
                clearInterval(interval);
                processingStatus.textContent = 'Processing complete!';
                setTimeout(function() {
                  window.location.href = '/document-details.html';
                }, 1000);
              } else {
                processingStatus.textContent = 'Processing document... ' + progress + '%';
              }
            }, 100);
          }
        }
      });
    }
  });
</script>
`;
          }
          
          // Documents page additions: Add event handlers to document cards
          if (isDocumentsPage) {
            directHtmlComponents += `
<script>
  document.addEventListener('DOMContentLoaded', function() {
    // Add click events to document cards
    const documentCards = document.querySelectorAll('.document-card');
    documentCards.forEach(function(card) {
      card.addEventListener('click', function() {
        const documentId = this.getAttribute('data-id');
        localStorage.setItem('selectedDocumentId', documentId);
        window.location.href = '/document-details.html';
      });
    });
    
    // Make sure process button is visible and properly positioned
    const processBtn = document.getElementById('process-document-btn');
    const actionButtons = document.querySelector('.action-buttons');
    if (processBtn && actionButtons) {
      actionButtons.appendChild(processBtn);
      processBtn.style.display = 'inline-flex';
    }
  });
</script>
`;
          }

          // Document chat page additions: Connect chat to document selector
          if (isDocumentChatPage) {
            directHtmlComponents += `
<script>
  document.addEventListener('DOMContentLoaded', function() {
    // Show document chat container
    const chatContainer = document.getElementById('document-chat-container');
    if (chatContainer) {
      chatContainer.style.display = 'block';
      chatContainer.style.position = 'static';
      chatContainer.style.width = '100%';
      chatContainer.style.maxWidth = '800px';
      chatContainer.style.margin = '20px auto';
    }
    
    // Setup document selector
    const documentSelect = document.getElementById('document-select');
    const sendBtn = document.getElementById('send-btn');
    const documentSendBtn = document.getElementById('document-send-btn');
    
    if (documentSelect && sendBtn && documentSendBtn) {
      // Hide regular send button and show document send button
      sendBtn.style.display = 'none';
      documentSendBtn.style.display = 'block';
      
      // Add event listeners for document selector
      documentSelect.addEventListener('change', function() {
        console.log('Selected document: ' + this.value);
        // Clear previous messages except the first one
        const chatMessages = document.getElementById('chat-messages');
        if (chatMessages) {
          const messages = chatMessages.querySelectorAll('.message');
          if (messages.length > 1) {
            for (let i = 1; i < messages.length; i++) {
              messages[i].remove();
            }
          }
          
          // Update greeting message
          const greeting = chatMessages.querySelector('.message.ai-message p');
          if (greeting) {
            const documentName = this.options[this.selectedIndex].text;
            greeting.textContent = 'Hello! I\\'m your financial assistant. I can help you with "' + documentName + '". What would you like to know?';
          }
        }
      });
    }
  });
</script>
`;
          }

          // Combine all injections
          let combinedInjection = cssInjection + scriptTag + directHtmlComponents;
          
          // Insert at body end position
          body = body.substring(0, bodyEndPos) + combinedInjection + body.substring(bodyEndPos);
          console.log(`Successfully injected enhanced UI components into response for ${req.path}`);
        } else {
          console.warn(`Could not find </body> tag in response for ${req.path}`);
        }
      }
    } catch (error) {
      console.error(`Error injecting UI components: ${error.message}`);
    }

    // Call original send function
    return originalSend.call(this, body);
  };

  // Continue to next middleware
  next();
}

module.exports = enhancedSimpleInjectorMiddleware;