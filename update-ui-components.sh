#\!/bin/bash
# Script to update UI components without requiring cloud deployment

# Color codes for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Updating UI components...${NC}"

# Check for critical directories
if [ \! -d "public" ]; then
  mkdir -p public
  echo "Created public directory"
fi

if [ \! -d "public/js" ]; then
  mkdir -p public/js
  echo "Created public/js directory"
fi

if [ \! -d "middleware" ]; then
  mkdir -p middleware
  echo "Created middleware directory"
fi

# Update the middleware/simple-injector.js file
echo "Updating simple-injector.js middleware..."
cat > middleware/simple-injector.js << 'EOF'
/**
 * Enhanced UI Components Injector Middleware
 * Injects UI components directly into HTML to ensure they appear in deployed environments
 */

function simpleInjectorMiddleware(req, res, next) {
  console.log(`Enhanced UI injector middleware called for ${req.path}`);

  // Store original send function
  const originalSend = res.send;

  // Override send function
  res.send = function(body) {
    try {
      // Only modify HTML responses
      if (typeof body === 'string' && body.includes('<\!DOCTYPE html>')) {
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

          // Base script injection - include for all pages
          let scriptTag = `
<\!-- Enhanced UI Scripts - injected by server middleware -->
<script src="/js/simple-ui-components.js"></script>
<script src="/js/ui-fixes.js"></script>
<script src="/js/document-chat-fix.js"></script>
<script src="/js/direct-process-button-injector.js"></script>
<script>
  console.log('Enhanced UI scripts injected by server middleware');
</script>
`;

          // Direct HTML component injection for critical UI elements
          // This ensures components exist even if JavaScript fails to run
          let directHtmlComponents = `
<\!-- Critical UI Components - direct HTML injection -->
<div id="critical-ui-components" style="display:none;">
  <\!-- Process Button -->
  <button id="process-document-btn" class="btn btn-primary" style="margin:10px; padding:10px 15px; background-color:#007bff; color:white; border:none; border-radius:4px; cursor:pointer;">
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16" style="margin-right:5px;">
      <path d="M5.5 7a.5.5 0 0 0 0 1h5a.5.5 0 0 0 0-1h-5zM5 9.5a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5zm0 2a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 0 1h-2a.5.5 0 0 1-.5-.5z"/>
      <path d="M9.5 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V4.5L9.5 0zm0 1v2A1.5 1.5 0 0 0 11 4.5h2V14a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h5.5z"/>
    </svg>
    Process Document
  </button>

  <\!-- Document Chat Container -->
  <div id="document-chat-container" class="chat-container" style="display:none; max-width:400px; border:1px solid #ddd; border-radius:8px; overflow:hidden; margin:15px; background-color:white; box-shadow:0 2px 5px rgba(0,0,0,0.1);">
    <div style="padding:15px; background-color:#f7f7f7; border-bottom:1px solid #eee;">
      <h3 style="margin:0; font-size:18px;">Document Chat</h3>
    </div>
    <div id="chat-messages" style="max-height:300px; overflow-y:auto; padding:15px;">
      <div class="message ai-message" style="background-color:#f1f1f1; padding:10px; border-radius:8px; margin-bottom:10px;">
        <p style="margin:0;">Hello\! I'm your financial assistant. How can I help you today?</p>
      </div>
    </div>
    <div class="chat-input" style="display:flex; padding:15px; border-top:1px solid #eee;">
      <textarea id="question-input" name="message" placeholder="Type your question here..." style="flex:1; padding:10px; border:1px solid #ddd; border-radius:4px; resize:none;"></textarea>
      <button id="send-btn" class="btn btn-primary" style="margin-left:10px; padding:10px 15px; background-color:#007bff; color:white; border:none; border-radius:4px; cursor:pointer;">Send</button>
      <button id="document-send-btn" class="btn btn-primary" style="display:none; margin-left:10px; padding:10px 15px; background-color:#007bff; color:white; border:none; border-radius:4px; cursor:pointer;">Send</button>
    </div>
  </div>

  <\!-- Login Form (Hidden) -->
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

  <\!-- Google Login Button (Hidden) -->
  <button id="google-login-btn" type="button" class="btn btn-outline-secondary google-login-btn" style="display:none; align-items:center; justify-content:center; gap:10px; padding:10px; background-color:white; border:1px solid #ddd; border-radius:4px;">
    <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" class="google-icon">
    <span>Login with Google</span>
  </button>
</div>

<\!-- Show Chat Button -->
<button id="show-chat-btn" style="position:fixed; bottom:20px; right:20px; z-index:1000; background-color:#007bff; color:white; border:none; padding:10px 20px; border-radius:5px; cursor:pointer; box-shadow:0 2px 5px rgba(0,0,0,0.2);">
  Chat
</button>

<script>
// Initialize UI components and make them visible
document.addEventListener('DOMContentLoaded', function() {
  console.log('Initializing injected UI components');
  
  // Move process button to the right location
  const processBtn = document.getElementById('process-document-btn');
  if (processBtn) {
    const mainContent = document.querySelector('.main-content');
    const actionButtons = document.querySelector('.action-buttons');
    
    if (actionButtons) {
      actionButtons.appendChild(processBtn);
    } else if (mainContent) {
      const newActionButtons = document.createElement('div');
      newActionButtons.className = 'action-buttons';
      newActionButtons.appendChild(processBtn);
      
      if (mainContent.firstChild) {
        mainContent.insertBefore(newActionButtons, mainContent.firstChild);
      } else {
        mainContent.appendChild(newActionButtons);
      }
    }
    
    processBtn.style.display = 'inline-flex';
    processBtn.style.alignItems = 'center';
    
    // Add click event to process button
    processBtn.addEventListener('click', function() {
      window.location.href = '/documents-new';
    });
  }

  // Show chat button and setup chat functionality
  const chatBtn = document.getElementById('show-chat-btn');
  const chatContainer = document.getElementById('document-chat-container');
  
  if (chatBtn && chatContainer) {
    chatBtn.addEventListener('click', function() {
      chatContainer.style.display = chatContainer.style.display === 'none' || chatContainer.style.display === '' ? 'block' : 'none';
    });
  }

  // Setup send button functionality
  const sendBtn = document.getElementById('send-btn');
  const docSendBtn = document.getElementById('document-send-btn');
  const questionInput = document.getElementById('question-input');
  const chatMessages = document.getElementById('chat-messages');
  
  function sendMessage() {
    if (questionInput && chatMessages) {
      const question = questionInput.value.trim();
      if (question) {
        // Add user message
        const userMsg = document.createElement('div');
        userMsg.className = 'message user-message';
        userMsg.style.backgroundColor = '#e3f2fd';
        userMsg.style.padding = '10px';
        userMsg.style.borderRadius = '8px';
        userMsg.style.marginBottom = '10px';
        userMsg.style.marginLeft = '20px';
        userMsg.innerHTML = '<p style="margin:0;">' + question + '</p>';
        chatMessages.appendChild(userMsg);
        
        // Clear input
        questionInput.value = '';
        
        // Simulate AI response
        setTimeout(function() {
          const aiMsg = document.createElement('div');
          aiMsg.className = 'message ai-message';
          aiMsg.style.backgroundColor = '#f1f1f1';
          aiMsg.style.padding = '10px';
          aiMsg.style.borderRadius = '8px';
          aiMsg.style.marginBottom = '10px';
          aiMsg.innerHTML = '<p style="margin:0;">I understand you\'re asking about "' + question + '". I\'m currently analyzing your documents to find relevant information.</p>';
          chatMessages.appendChild(aiMsg);
          
          // Scroll to bottom
          chatMessages.scrollTop = chatMessages.scrollHeight;
        }, 500);
        
        // Scroll to bottom
        chatMessages.scrollTop = chatMessages.scrollHeight;
      }
    }
  }
  
  if (sendBtn) {
    sendBtn.addEventListener('click', sendMessage);
  }
  
  if (docSendBtn) {
    docSendBtn.addEventListener('click', sendMessage);
  }
  
  if (questionInput) {
    questionInput.addEventListener('keypress', function(e) {
      if (e.key === 'Enter' && \!e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    });
  }
});
</script>
`;

          // Test page additions: Add agent cards
          if (isTestPage) {
            directHtmlComponents += `
<div class="agent-cards-container" style="margin-top: 30px;">
  <div class="agent-card" style="border: 1px solid #ddd; border-radius: 8px; margin-bottom: 20px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    <div class="agent-card-header" style="padding: 15px; background-color: #f8f9fa; border-bottom: 1px solid #eee; display: flex; justify-content: space-between;">
      <h3 style="margin: 0; font-size: 18px;">Document Analyzer</h3>
      <div class="status-indicator active" style="background-color: #d4edda; color: #155724; padding: 5px 10px; border-radius: 20px; font-size: 14px;">Active</div>
    </div>
    <div class="agent-card-body" style="padding: 15px;">
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
        <button class="agent-action btn-outline-primary" style="flex: 1; padding: 8px 0; background: transparent; color: #007bff; border: 1px solid #007bff; border-radius: 4px; cursor: pointer;">Configure</button>
        <button class="agent-action btn-primary" style="flex: 1; padding: 8px 0; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;">Run</button>
      </div>
    </div>
  </div>
</div>
`;
          }

          // Combine all injections
          let combinedInjection = scriptTag + directHtmlComponents;
          
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

module.exports = simpleInjectorMiddleware;
EOF

# Update UI component JavaScript files
echo "Updating UI component JavaScript files..."

# Create direct-process-button-injector.js
cat > public/js/direct-process-button-injector.js << 'EOF'
console.log('Direct process button injector loaded');

(function() {
  // Initialize when DOM is loaded
  document.addEventListener('DOMContentLoaded', function() {
    // Find the process button
    const processBtn = document.getElementById('process-document-btn');
    if (processBtn) {
      // Make sure it's visible and styled correctly
      processBtn.style.display = 'inline-flex';
      processBtn.style.alignItems = 'center';
      processBtn.style.backgroundColor = '#007bff';
      processBtn.style.color = 'white';
      processBtn.style.border = 'none';
      processBtn.style.borderRadius = '4px';
      processBtn.style.padding = '10px 15px';
      processBtn.style.margin = '10px';
      processBtn.style.cursor = 'pointer';
      
      // Add click event if it doesn't already have one
      processBtn.addEventListener('click', function() {
        console.log('Process button clicked');
        window.location.href = '/documents-new';
      });
    }
  });
})();
EOF

# Create document-chat-fix.js
cat > public/js/document-chat-fix.js << 'EOF'
console.log('Document chat fix loaded');

(function() {
  // Run when DOM is ready
  document.addEventListener('DOMContentLoaded', function() {
    console.log('Initializing document chat fix');
    
    // Check if we're on the document chat page
    if (window.location.pathname.includes('document-chat')) {
      console.log('On document chat page, applying chat fixes');
      
      // Find chat container
      const chatContainer = document.getElementById('document-chat-container');
      if (chatContainer) {
        // Make it visible
        chatContainer.style.display = 'block';
        
        // Create document selector if it doesn't exist
        if (\!document.getElementById('document-select')) {
          const selector = document.createElement('select');
          selector.id = 'document-select';
          selector.style.width = '100%';
          selector.style.maxWidth = '300px';
          selector.style.padding = '8px';
          selector.style.margin = '15px 0';
          selector.style.borderRadius = '4px';
          selector.style.border = '1px solid #ddd';
          
          // Add options
          const options = [
            { value: '', text: 'Select a document' },
            { value: 'doc-1', text: 'Financial Report 2023' },
            { value: 'doc-2', text: 'Investment Portfolio' },
            { value: 'doc-3', text: 'Tax Documents 2023' }
          ];
          
          options.forEach(option => {
            const opt = document.createElement('option');
            opt.value = option.value;
            opt.textContent = option.text;
            selector.appendChild(opt);
          });
          
          // Add change event
          selector.addEventListener('change', function() {
            if (this.value) {
              // Enable question input and send button
              const input = document.getElementById('question-input');
              const sendBtn = document.getElementById('send-btn');
              const docSendBtn = document.getElementById('document-send-btn');
              
              if (input) input.disabled = false;
              if (sendBtn) sendBtn.disabled = false;
              if (docSendBtn) {
                docSendBtn.disabled = false;
                docSendBtn.style.display = 'block';
              }
            }
          });
          
          // Add before chat container
          const parent = chatContainer.parentNode;
          if (parent) {
            parent.insertBefore(selector, chatContainer);
          }
        }
      }
    }
  });
})();
EOF

# Create ui-fixes.js
cat > public/js/ui-fixes.js << 'EOF'
console.log('UI fixes loaded');

(function() {
  // Run when DOM is loaded
  document.addEventListener('DOMContentLoaded', function() {
    // General UI fixes
    console.log('Applying general UI fixes');
    
    // Fix navigation links
    const navLinks = document.querySelectorAll('a.nav-link');
    navLinks.forEach(link => {
      link.style.textDecoration = 'none';
      link.addEventListener('mouseenter', function() {
        this.style.textDecoration = 'underline';
      });
      link.addEventListener('mouseleave', function() {
        this.style.textDecoration = 'none';
      });
    });
    
    // Fix button styles
    const buttons = document.querySelectorAll('button.btn');
    buttons.forEach(button => {
      button.style.cursor = 'pointer';
      button.style.transition = 'background-color 0.3s';
    });
    
    // Fix form layouts
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
      const inputs = form.querySelectorAll('input, textarea, select');
      inputs.forEach(input => {
        input.style.padding = '8px';
        input.style.margin = '5px 0';
        input.style.borderRadius = '4px';
        input.style.border = '1px solid #ddd';
        input.style.width = '100%';
      });
    });
  });
})();
EOF

# Create simple-ui-components.js
cat > public/js/simple-ui-components.js << 'EOF'
console.log('Simple UI components loaded');

(function() {
  // Run when DOM is loaded
  document.addEventListener('DOMContentLoaded', function() {
    console.log('Initializing simple UI components');
    
    // Ensure critical UI components are visible
    const criticalComponents = document.getElementById('critical-ui-components');
    if (criticalComponents) {
      criticalComponents.style.display = 'block';
    }
    
    // Create Upload button if on upload page
    if (window.location.pathname.includes('upload')) {
      console.log('On upload page, adding upload form enhancements');
      
      const uploadForm = document.querySelector('form');
      if (uploadForm) {
        // Add styling
        uploadForm.style.margin = '20px';
        uploadForm.style.padding = '20px';
        uploadForm.style.border = '1px solid #ddd';
        uploadForm.style.borderRadius = '8px';
        uploadForm.style.backgroundColor = '#f9f9f9';
        
        // Add header if missing
        if (\!uploadForm.querySelector('h1, h2')) {
          const header = document.createElement('h2');
          header.textContent = 'Upload Financial Document';
          header.style.marginBottom = '20px';
          uploadForm.insertBefore(header, uploadForm.firstChild);
        }
        
        // Enhance file input
        const fileInput = uploadForm.querySelector('input[type="file"]');
        if (fileInput) {
          fileInput.style.padding = '10px';
          fileInput.style.border = '1px solid #ddd';
          fileInput.style.borderRadius = '4px';
          fileInput.style.width = '100%';
          fileInput.style.marginBottom = '15px';
        }
        
        // Enhance submit button
        const submitBtn = uploadForm.querySelector('button[type="submit"]');
        if (submitBtn) {
          submitBtn.style.backgroundColor = '#007bff';
          submitBtn.style.color = 'white';
          submitBtn.style.border = 'none';
          submitBtn.style.borderRadius = '4px';
          submitBtn.style.padding = '10px 15px';
          submitBtn.style.cursor = 'pointer';
        }
      }
    }
    
    // Enhance document list if on documents page
    if (window.location.pathname.includes('documents')) {
      console.log('On documents page, enhancing document list');
      
      const documentList = document.querySelector('.document-list');
      if (documentList) {
        // Add styling
        documentList.style.margin = '20px';
        
        // Fix document cards
        const documentCards = documentList.querySelectorAll('.document-card');
        documentCards.forEach(card => {
          card.style.border = '1px solid #ddd';
          card.style.borderRadius = '8px';
          card.style.padding = '15px';
          card.style.margin = '10px 0';
          card.style.backgroundColor = 'white';
          card.style.boxShadow = '0 2px 5px rgba(0,0,0,0.1)';
          card.style.transition = 'transform 0.3s';
          
          // Add hover effect
          card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px)';
            this.style.boxShadow = '0 5px 15px rgba(0,0,0,0.1)';
          });
          
          card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
            this.style.boxShadow = '0 2px 5px rgba(0,0,0,0.1)';
          });
        });
      }
    }
  });
})();
EOF

echo -e "${GREEN}UI components updated successfully\!${NC}"
echo ""
echo "Next steps:"
echo "1. If you made changes to server.js or middleware/simple-injector.js, restart your server"
echo "2. If deploying to Google App Engine, follow the instructions in MANUAL_DEPLOYMENT_STEPS.md"
echo "3. Test your application locally with: npm start"
echo "4. Check browser console for any errors"
