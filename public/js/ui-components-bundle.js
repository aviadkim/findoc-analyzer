/**
 * UI Components Bundle
 * This script bundles all UI components
 */

(function() {
  console.log('UI Components Bundle loaded');

  // Wait for DOM to be ready
  document.addEventListener('DOMContentLoaded', function() {
    initUIComponents();
  });

  // Initialize UI components
  function initUIComponents() {
    console.log('Initializing UI components');

    // Create UI components if they don't exist
    createProcessButton();
    createChatComponents();
    createLoginComponents();
    createAgentCards();
  }

  // Create process button
  function createProcessButton() {
    if (!document.getElementById('process-document-btn')) {
      console.log('Creating process button');
      
      const processBtn = document.createElement('button');
      processBtn.id = 'process-document-btn';
      processBtn.className = 'btn btn-primary';
      processBtn.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
          <path d="M5.5 7a.5.5 0 0 0 0 1h5a.5.5 0 0 0 0-1h-5zM5 9.5a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5zm0 2a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 0 1h-2a.5.5 0 0 1-.5-.5z"/>
          <path d="M9.5 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V4.5L9.5 0zm0 1v2A1.5 1.5 0 0 0 11 4.5h2V14a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h5.5z"/>
        </svg>
        Process Document
      `;
      
      // Add to body initially, will be positioned by process-button-fix.js
      document.body.appendChild(processBtn);
    }
  }

  // Create chat components
  function createChatComponents() {
    // Create show chat button
    if (!document.getElementById('show-chat-btn')) {
      console.log('Creating show chat button');
      
      const showChatBtn = document.createElement('button');
      showChatBtn.id = 'show-chat-btn';
      showChatBtn.textContent = 'Chat';
      
      document.body.appendChild(showChatBtn);
    }
    
    // Create document chat container
    if (!document.getElementById('document-chat-container')) {
      console.log('Creating document chat container');
      
      const chatContainer = document.createElement('div');
      chatContainer.id = 'document-chat-container';
      chatContainer.className = 'chat-container';
      chatContainer.innerHTML = `
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
      `;
      
      document.body.appendChild(chatContainer);
    }
    
    // Create document selector for document chat page
    if (document.body.classList.contains('document-chat-page') && !document.getElementById('document-selector-container')) {
      console.log('Creating document selector');
      
      const documentSelectorContainer = document.createElement('div');
      documentSelectorContainer.id = 'document-selector-container';
      documentSelectorContainer.style.marginBottom = '20px';
      documentSelectorContainer.innerHTML = `
        <label for="document-select" style="display:block;margin-bottom:5px;font-weight:bold;">Select Document:</label>
        <select id="document-select" style="width:100%;padding:8px;border:1px solid #ddd;border-radius:4px;">
          <option value="doc-1">Financial Report 2023.pdf</option>
          <option value="doc-2">Investment Portfolio.pdf</option>
          <option value="doc-3">Tax Documents 2023.pdf</option>
        </select>
      `;
      
      // Add to main content
      const mainContent = document.querySelector('main') || document.querySelector('.main-content') || document.body;
      mainContent.insertBefore(documentSelectorContainer, mainContent.firstChild);
    }
  }

  // Create login components
  function createLoginComponents() {
    // Create login form
    if (!document.getElementById('login-form')) {
      console.log('Creating login form');
      
      const loginForm = document.createElement('form');
      loginForm.id = 'login-form';
      loginForm.className = 'auth-form';
      loginForm.style.display = 'none';
      loginForm.innerHTML = `
        <div class="form-group">
          <label for="email">Email</label>
          <input type="email" id="email" name="email" placeholder="Enter your email">
        </div>
        <div class="form-group">
          <label for="password">Password</label>
          <input type="password" id="password" name="password" placeholder="Enter your password">
        </div>
        <button type="submit" class="btn btn-primary">Login</button>
      `;
      
      document.body.appendChild(loginForm);
    }
    
    // Create Google login button
    if (!document.getElementById('google-login-btn')) {
      console.log('Creating Google login button');
      
      const googleLoginBtn = document.createElement('button');
      googleLoginBtn.id = 'google-login-btn';
      googleLoginBtn.type = 'button';
      googleLoginBtn.className = 'btn btn-outline-secondary google-login-btn';
      googleLoginBtn.style.display = 'none';
      googleLoginBtn.innerHTML = `
        <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" class="google-icon">
        <span>Login with Google</span>
      `;
      
      document.body.appendChild(googleLoginBtn);
    }
  }

  // Create agent cards for test page
  function createAgentCards() {
    if (document.body.classList.contains('test-page') && !document.querySelector('.agent-cards-container')) {
      console.log('Creating agent cards');
      
      const agentCardsContainer = document.createElement('div');
      agentCardsContainer.className = 'agent-cards-container';
      agentCardsContainer.style.marginTop = '30px';
      agentCardsContainer.innerHTML = `
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
        
        <div class="agent-card">
          <div class="agent-card-header">
            <h3>Table Understanding</h3>
            <div class="status-indicator active">Active</div>
          </div>
          <div class="agent-card-body">
            <p>Extracts and analyzes tabular data from financial documents.</p>
            <div style="display: flex; margin: 15px 0;">
              <div style="flex: 1; text-align: center;">
                <div style="font-size: 24px; font-weight: bold;">85</div>
                <div style="color: #6c757d; font-size: 14px;">Tables Processed</div>
              </div>
              <div style="flex: 1; text-align: center;">
                <div style="font-size: 24px; font-weight: bold;">92%</div>
                <div style="color: #6c757d; font-size: 14px;">Accuracy</div>
              </div>
            </div>
            <div style="display: flex; gap: 10px;">
              <button class="agent-action btn-outline-primary">Configure</button>
              <button class="agent-action btn-primary">Run</button>
            </div>
          </div>
        </div>
        
        <div class="agent-card">
          <div class="agent-card-header">
            <h3>Securities Extractor</h3>
            <div class="status-indicator active">Active</div>
          </div>
          <div class="agent-card-body">
            <p>Identifies and extracts securities information from financial documents.</p>
            <div style="display: flex; margin: 15px 0;">
              <div style="flex: 1; text-align: center;">
                <div style="font-size: 24px; font-weight: bold;">342</div>
                <div style="color: #6c757d; font-size: 14px;">Securities Extracted</div>
              </div>
              <div style="flex: 1; text-align: center;">
                <div style="font-size: 24px; font-weight: bold;">96%</div>
                <div style="color: #6c757d; font-size: 14px;">Accuracy</div>
              </div>
            </div>
            <div style="display: flex; gap: 10px;">
              <button class="agent-action btn-outline-primary">Configure</button>
              <button class="agent-action btn-primary">Run</button>
            </div>
          </div>
        </div>
      `;
      
      // Add to main content
      const mainContent = document.querySelector('main') || document.querySelector('.main-content') || document.body;
      mainContent.appendChild(agentCardsContainer);
    }
  }
})();
