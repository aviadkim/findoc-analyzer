/**
 * UI Component Fixer
 * Fixes missing UI components based on test results
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const config = {
  testResultsPath: path.join(__dirname, '../tests/results/basic-ui-test-results.json'),
  componentsDir: path.join(__dirname, '../public/components'),
  publicDir: path.join(__dirname, '../public'),
  backupDir: path.join(__dirname, '../backups')
};

// Create directories if they don't exist
if (!fs.existsSync(config.componentsDir)) {
  fs.mkdirSync(config.componentsDir, { recursive: true });
}

if (!fs.existsSync(config.backupDir)) {
  fs.mkdirSync(config.backupDir, { recursive: true });
}

// Component templates
const componentTemplates = {
  'Navigation Bar': `
<nav class="navbar">
  <div class="navbar-brand">
    <a href="/" class="navbar-logo">FinDoc Analyzer</a>
  </div>
  <div class="navbar-menu">
    <a href="/" class="navbar-item">Dashboard</a>
    <a href="/documents-new" class="navbar-item">Documents</a>
    <a href="/analytics-new" class="navbar-item">Analytics</a>
    <a href="/upload" class="navbar-item">Upload</a>
    <a href="/document-chat" class="navbar-item">Chat</a>
  </div>
</nav>
  `,
  'Document List': `
<div id="document-list" class="document-list">
  <div class="document-list-header">
    <h2>My Documents</h2>
    <div class="document-list-actions">
      <button class="btn btn-primary" onclick="location.href='/upload'">Upload New</button>
    </div>
  </div>
  <div class="document-list-content">
    <div class="document-item">
      <div class="document-info">
        <h3 class="document-title">Sample Document</h3>
        <p class="document-date">Uploaded: 2025-05-04</p>
      </div>
      <div class="document-actions">
        <button class="btn btn-secondary" onclick="viewDocument(1)">View</button>
        <button class="btn btn-danger" onclick="deleteDocument(1)">Delete</button>
      </div>
    </div>
    <div class="no-documents" style="display: none;">
      <p>No documents found. Upload a document to get started.</p>
    </div>
  </div>
</div>
  `,
  'Upload Form': `
<form id="upload-form" enctype="multipart/form-data" class="upload-form">
  <div class="form-group">
    <label for="file-input">Select a document to upload:</label>
    <input type="file" id="file-input" name="file" accept=".pdf,.csv,.xlsx,.xls" required>
  </div>
  <div class="form-group">
    <label for="document-title">Document Title (optional):</label>
    <input type="text" id="document-title" name="title" placeholder="Enter a title for your document">
  </div>
  <div id="progress-container" class="progress-container" style="display: none;">
    <div class="progress-bar">
      <div class="progress" style="width: 0%"></div>
    </div>
    <p class="progress-text">Uploading: 0%</p>
  </div>
  <div class="form-actions">
    <button type="submit" class="btn btn-primary">Upload Document</button>
  </div>
</form>
  `,
  'Chat Input': `
<div id="document-chat-container" class="chat-container">
  <div class="chat-messages" id="chat-messages">
    <div class="message system">
      Hello! I'm your financial document assistant. Select a document and ask me questions about it.
    </div>
  </div>
  <div class="chat-input-container">
    <input type="text" id="document-chat-input" class="chat-input" placeholder="Type your question here..." disabled>
    <button id="document-send-btn" class="chat-send-btn" disabled>Send</button>
  </div>
</div>
  `,
  'Chat Send Button': `
<!-- This is included in the Chat Input component -->
  `,
  'Agent Card': `
<div class="agent-card">
  <div class="agent-header">
    <h3 class="agent-name">Document Analyzer</h3>
    <div class="status-indicator active"></div>
  </div>
  <div class="agent-body">
    <p class="agent-description">Analyzes financial documents to extract key information and insights.</p>
  </div>
  <div class="agent-footer">
    <button class="agent-action btn btn-primary">Run Agent</button>
  </div>
</div>
  `
};

// CSS for components
const componentCSS = `
/* Navigation Bar */
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #2c3e50;
  color: white;
  padding: 1rem;
}

.navbar-brand {
  font-size: 1.5rem;
  font-weight: bold;
}

.navbar-logo {
  color: white;
  text-decoration: none;
}

.navbar-menu {
  display: flex;
  gap: 1rem;
}

.navbar-item {
  color: white;
  text-decoration: none;
  padding: 0.5rem;
}

.navbar-item:hover {
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
}

/* Document List */
.document-list {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  margin-bottom: 2rem;
}

.document-list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.document-list-actions {
  display: flex;
  gap: 0.5rem;
}

.document-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid #eee;
}

.document-item:last-child {
  border-bottom: none;
}

.document-info {
  flex: 1;
}

.document-title {
  margin: 0 0 0.5rem 0;
  font-size: 1.2rem;
}

.document-date {
  color: #666;
  margin: 0;
  font-size: 0.9rem;
}

.document-actions {
  display: flex;
  gap: 0.5rem;
}

.no-documents {
  text-align: center;
  padding: 2rem;
  color: #666;
}

/* Upload Form */
.upload-form {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  max-width: 600px;
  margin: 0 auto;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: bold;
}

.form-group input[type="file"],
.form-group input[type="text"] {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.progress-container {
  margin: 1.5rem 0;
}

.progress-bar {
  height: 20px;
  background-color: #f0f0f0;
  border-radius: 10px;
  overflow: hidden;
}

.progress {
  height: 100%;
  background-color: #4caf50;
  transition: width 0.3s ease;
}

.progress-text {
  text-align: center;
  margin-top: 0.5rem;
  font-size: 0.9rem;
  color: #666;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
}

/* Chat */
.chat-container {
  display: flex;
  flex-direction: column;
  height: 500px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.chat-messages {
  flex: 1;
  padding: 1rem;
  overflow-y: auto;
}

.message {
  margin-bottom: 1rem;
  padding: 0.75rem;
  border-radius: 8px;
  max-width: 80%;
}

.message.system {
  background-color: #f0f0f0;
  align-self: center;
  text-align: center;
  max-width: 100%;
}

.message.user {
  background-color: #e3f2fd;
  align-self: flex-end;
  margin-left: auto;
}

.message.assistant {
  background-color: #f1f8e9;
  align-self: flex-start;
}

.chat-input-container {
  display: flex;
  padding: 1rem;
  border-top: 1px solid #eee;
}

.chat-input {
  flex: 1;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px 0 0 4px;
}

.chat-send-btn {
  padding: 0.75rem 1.5rem;
  background-color: #2196f3;
  color: white;
  border: none;
  border-radius: 0 4px 4px 0;
  cursor: pointer;
}

.chat-send-btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

/* Agent Card */
.agent-card {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  margin-bottom: 1.5rem;
}

.agent-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.agent-name {
  margin: 0;
  font-size: 1.2rem;
}

.status-indicator {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: #ccc;
}

.status-indicator.active {
  background-color: #4caf50;
}

.agent-body {
  margin-bottom: 1rem;
}

.agent-description {
  margin: 0;
  color: #666;
}

.agent-footer {
  display: flex;
  justify-content: flex-end;
}

/* Buttons */
.btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
}

.btn-primary {
  background-color: #2196f3;
  color: white;
}

.btn-secondary {
  background-color: #f0f0f0;
  color: #333;
}

.btn-danger {
  background-color: #f44336;
  color: white;
}

.btn:hover {
  opacity: 0.9;
}
`;

// JavaScript for components
const componentJS = `
// Document List Functions
function viewDocument(id) {
  window.location.href = '/document-details?id=' + id;
}

function deleteDocument(id) {
  if (confirm('Are you sure you want to delete this document?')) {
    // Send delete request to server
    fetch('/api/documents/' + id, {
      method: 'DELETE'
    })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        // Reload the page to update the document list
        window.location.reload();
      } else {
        alert('Error deleting document: ' + data.message);
      }
    })
    .catch(error => {
      console.error('Error:', error);
      alert('Error deleting document');
    });
  }
}

// Upload Form Functions
document.addEventListener('DOMContentLoaded', function() {
  const uploadForm = document.getElementById('upload-form');
  
  if (uploadForm) {
    uploadForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      const fileInput = document.getElementById('file-input');
      const titleInput = document.getElementById('document-title');
      const progressContainer = document.getElementById('progress-container');
      const progressBar = progressContainer.querySelector('.progress');
      const progressText = progressContainer.querySelector('.progress-text');
      
      if (!fileInput.files.length) {
        alert('Please select a file to upload');
        return;
      }
      
      // Create FormData object
      const formData = new FormData();
      formData.append('file', fileInput.files[0]);
      
      if (titleInput.value) {
        formData.append('title', titleInput.value);
      }
      
      // Show progress container
      progressContainer.style.display = 'block';
      
      // Send upload request
      fetch('/api/documents/upload', {
        method: 'POST',
        body: formData
      })
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        if (data.success) {
          // Redirect to document details page
          window.location.href = '/document-details?id=' + data.documentId;
        } else {
          alert('Error uploading document: ' + data.message);
          progressContainer.style.display = 'none';
        }
      })
      .catch(error => {
        console.error('Error:', error);
        alert('Error uploading document');
        progressContainer.style.display = 'none';
      });
      
      // Simulate progress updates (in a real app, this would come from the server)
      let progress = 0;
      const interval = setInterval(() => {
        progress += 10;
        if (progress > 100) {
          clearInterval(interval);
          return;
        }
        
        progressBar.style.width = progress + '%';
        progressText.textContent = 'Uploading: ' + progress + '%';
      }, 500);
    });
  }
});

// Document Chat Functions
document.addEventListener('DOMContentLoaded', function() {
  const documentSelect = document.querySelector('select');
  const chatInput = document.getElementById('document-chat-input');
  const sendButton = document.getElementById('document-send-btn');
  const chatMessages = document.getElementById('chat-messages');
  
  if (documentSelect && chatInput && sendButton) {
    // Enable/disable chat based on document selection
    documentSelect.addEventListener('change', function() {
      const documentId = this.value;
      
      if (documentId && documentId !== '') {
        chatInput.disabled = false;
        sendButton.disabled = false;
      } else {
        chatInput.disabled = true;
        sendButton.disabled = true;
      }
    });
    
    // Send message when button is clicked
    sendButton.addEventListener('click', sendMessage);
    
    // Send message when Enter key is pressed
    chatInput.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        sendMessage();
      }
    });
    
    function sendMessage() {
      const documentId = documentSelect.value;
      const question = chatInput.value.trim();
      
      if (!documentId || documentId === '') {
        alert('Please select a document first');
        return;
      }
      
      if (!question) {
        return;
      }
      
      // Add user message to chat
      const userMessage = document.createElement('div');
      userMessage.className = 'message user';
      userMessage.textContent = question;
      chatMessages.appendChild(userMessage);
      
      // Clear input
      chatInput.value = '';
      
      // Scroll to bottom
      chatMessages.scrollTop = chatMessages.scrollHeight;
      
      // Disable input and button while waiting for response
      chatInput.disabled = true;
      sendButton.disabled = true;
      
      // Add loading message
      const loadingMessage = document.createElement('div');
      loadingMessage.className = 'message system';
      loadingMessage.textContent = 'Thinking...';
      chatMessages.appendChild(loadingMessage);
      
      // Send question to server
      fetch('/api/documents/' + documentId + '/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ question })
      })
      .then(response => response.json())
      .then(data => {
        // Remove loading message
        chatMessages.removeChild(loadingMessage);
        
        // Add assistant message
        const assistantMessage = document.createElement('div');
        assistantMessage.className = 'message assistant';
        assistantMessage.textContent = data.answer || 'Sorry, I could not answer that question.';
        chatMessages.appendChild(assistantMessage);
        
        // Re-enable input and button
        chatInput.disabled = false;
        sendButton.disabled = false;
        
        // Focus input
        chatInput.focus();
        
        // Scroll to bottom
        chatMessages.scrollTop = chatMessages.scrollHeight;
      })
      .catch(error => {
        console.error('Error:', error);
        
        // Remove loading message
        chatMessages.removeChild(loadingMessage);
        
        // Add error message
        const errorMessage = document.createElement('div');
        errorMessage.className = 'message system';
        errorMessage.textContent = 'Error: Could not get a response. Please try again.';
        chatMessages.appendChild(errorMessage);
        
        // Re-enable input and button
        chatInput.disabled = false;
        sendButton.disabled = false;
        
        // Scroll to bottom
        chatMessages.scrollTop = chatMessages.scrollHeight;
      });
    }
  }
});

// Agent Functions
document.addEventListener('DOMContentLoaded', function() {
  const agentButtons = document.querySelectorAll('.agent-action');
  
  if (agentButtons.length) {
    agentButtons.forEach(button => {
      button.addEventListener('click', function() {
        const agentCard = this.closest('.agent-card');
        const agentName = agentCard.querySelector('.agent-name').textContent;
        
        // Call the agent
        fetch('/api/agents/run', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ agent: agentName })
        })
        .then(response => response.json())
        .then(data => {
          if (data.success) {
            alert('Agent ' + agentName + ' started successfully');
          } else {
            alert('Error starting agent: ' + data.message);
          }
        })
        .catch(error => {
          console.error('Error:', error);
          alert('Error starting agent');
        });
      });
    });
  }
});
`;

// Function to read test results
function readTestResults() {
  try {
    const data = fs.readFileSync(config.testResultsPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error reading test results: ${error.message}`);
    return null;
  }
}

// Function to backup a file
function backupFile(filePath) {
  try {
    if (fs.existsSync(filePath)) {
      const fileName = path.basename(filePath);
      const backupPath = path.join(config.backupDir, `${fileName}.${Date.now()}.bak`);
      fs.copyFileSync(filePath, backupPath);
      console.log(`Backed up ${filePath} to ${backupPath}`);
    }
  } catch (error) {
    console.error(`Error backing up file ${filePath}: ${error.message}`);
  }
}

// Function to inject component into HTML file
function injectComponentIntoHTML(htmlFilePath, componentName, componentHTML) {
  try {
    // Backup the file
    backupFile(htmlFilePath);
    
    // Read the HTML file
    let html = fs.readFileSync(htmlFilePath, 'utf8');
    
    // Check if the component already exists
    const componentSelector = componentName === 'Navigation Bar' ? 'nav' : 
                             componentName === 'Document List' ? '#document-list' :
                             componentName === 'Upload Form' ? 'form[enctype="multipart/form-data"]' :
                             componentName === 'Chat Input' ? '#document-chat-input' :
                             componentName === 'Chat Send Button' ? '#document-send-btn' :
                             componentName === 'Agent Card' ? '.agent-card' : '';
    
    if (componentSelector && html.includes(componentSelector)) {
      console.log(`Component ${componentName} already exists in ${htmlFilePath}`);
      return false;
    }
    
    // Determine where to inject the component
    let injectionPoint;
    
    if (componentName === 'Navigation Bar') {
      // Inject after <body> tag
      injectionPoint = html.indexOf('<body>') + 6;
    } else if (componentName === 'Document List') {
      // Inject into main content
      injectionPoint = html.indexOf('<main') > -1 ? 
                      html.indexOf('>', html.indexOf('<main')) + 1 :
                      html.indexOf('<body>') + 6;
    } else if (componentName === 'Upload Form') {
      // Inject into main content
      injectionPoint = html.indexOf('<main') > -1 ? 
                      html.indexOf('>', html.indexOf('<main')) + 1 :
                      html.indexOf('<body>') + 6;
    } else if (componentName === 'Chat Input' || componentName === 'Chat Send Button') {
      // Inject before closing main tag
      injectionPoint = html.indexOf('</main>') > -1 ?
                      html.indexOf('</main>') :
                      html.indexOf('</body>');
    } else if (componentName === 'Agent Card') {
      // Inject into main content
      injectionPoint = html.indexOf('<main') > -1 ? 
                      html.indexOf('>', html.indexOf('<main')) + 1 :
                      html.indexOf('<body>') + 6;
    } else {
      // Default to before closing body tag
      injectionPoint = html.indexOf('</body>');
    }
    
    // Inject the component
    html = html.slice(0, injectionPoint) + '\n' + componentHTML + '\n' + html.slice(injectionPoint);
    
    // Write the updated HTML
    fs.writeFileSync(htmlFilePath, html);
    
    console.log(`Injected ${componentName} into ${htmlFilePath}`);
    return true;
  } catch (error) {
    console.error(`Error injecting component ${componentName} into ${htmlFilePath}: ${error.message}`);
    return false;
  }
}

// Function to create component CSS file
function createComponentCSS() {
  const cssFilePath = path.join(config.componentsDir, 'components.css');
  
  try {
    // Check if file already exists
    if (fs.existsSync(cssFilePath)) {
      // Backup the file
      backupFile(cssFilePath);
    }
    
    // Write the CSS
    fs.writeFileSync(cssFilePath, componentCSS);
    
    console.log(`Created component CSS file at ${cssFilePath}`);
    return true;
  } catch (error) {
    console.error(`Error creating component CSS file: ${error.message}`);
    return false;
  }
}

// Function to create component JS file
function createComponentJS() {
  const jsFilePath = path.join(config.componentsDir, 'components.js');
  
  try {
    // Check if file already exists
    if (fs.existsSync(jsFilePath)) {
      // Backup the file
      backupFile(jsFilePath);
    }
    
    // Write the JS
    fs.writeFileSync(jsFilePath, componentJS);
    
    console.log(`Created component JS file at ${jsFilePath}`);
    return true;
  } catch (error) {
    console.error(`Error creating component JS file: ${error.message}`);
    return false;
  }
}

// Function to add component CSS and JS to HTML files
function addComponentAssetsToHTML(htmlFilePath) {
  try {
    // Backup the file
    backupFile(htmlFilePath);
    
    // Read the HTML file
    let html = fs.readFileSync(htmlFilePath, 'utf8');
    
    // Check if component CSS is already included
    if (!html.includes('/components/components.css')) {
      // Find the closing head tag
      const headCloseIndex = html.indexOf('</head>');
      
      if (headCloseIndex > -1) {
        // Add CSS link before closing head tag
        const cssLink = '<link rel="stylesheet" href="/components/components.css">';
        html = html.slice(0, headCloseIndex) + '\n  ' + cssLink + '\n  ' + html.slice(headCloseIndex);
      }
    }
    
    // Check if component JS is already included
    if (!html.includes('/components/components.js')) {
      // Find the closing body tag
      const bodyCloseIndex = html.indexOf('</body>');
      
      if (bodyCloseIndex > -1) {
        // Add JS script before closing body tag
        const jsScript = '<script src="/components/components.js"></script>';
        html = html.slice(0, bodyCloseIndex) + '\n  ' + jsScript + '\n' + html.slice(bodyCloseIndex);
      }
    }
    
    // Write the updated HTML
    fs.writeFileSync(htmlFilePath, html);
    
    console.log(`Added component assets to ${htmlFilePath}`);
    return true;
  } catch (error) {
    console.error(`Error adding component assets to ${htmlFilePath}: ${error.message}`);
    return false;
  }
}

// Main function
function main() {
  console.log('Starting UI Component Fixer...');
  
  // Read test results
  const testResults = readTestResults();
  
  if (!testResults) {
    console.error('No test results found. Run the basic UI test first.');
    return;
  }
  
  console.log(`Found ${testResults.total} components in test results.`);
  console.log(`${testResults.passed} components passed, ${testResults.failed} components failed.`);
  
  if (testResults.failed === 0) {
    console.log('All components passed. Nothing to fix.');
    return;
  }
  
  // Create component CSS and JS files
  createComponentCSS();
  createComponentJS();
  
  // Fix missing components
  const missingComponents = Object.entries(testResults.components)
    .filter(([_, data]) => !data.exists)
    .map(([name, data]) => ({ name, ...data }));
  
  console.log(`Found ${missingComponents.length} missing components to fix.`);
  
  // Map of pages to HTML files
  const pageToFileMap = {
    '/': path.join(config.publicDir, 'index.html'),
    '/documents-new': path.join(config.publicDir, 'documents-new.html'),
    '/upload': path.join(config.publicDir, 'upload.html'),
    '/document-chat': path.join(config.publicDir, 'document-chat.html'),
    '/test': path.join(config.publicDir, 'test.html')
  };
  
  // Fix each missing component
  for (const component of missingComponents) {
    console.log(`Fixing ${component.name}...`);
    
    // Get the HTML file for this component's page
    const htmlFile = pageToFileMap[component.page];
    
    if (!htmlFile || !fs.existsSync(htmlFile)) {
      console.error(`HTML file for page ${component.page} not found.`);
      continue;
    }
    
    // Get the component template
    const template = componentTemplates[component.name];
    
    if (!template) {
      console.error(`Template for component ${component.name} not found.`);
      continue;
    }
    
    // Inject the component into the HTML file
    const injected = injectComponentIntoHTML(htmlFile, component.name, template);
    
    if (injected) {
      // Add component assets to the HTML file
      addComponentAssetsToHTML(htmlFile);
    }
  }
  
  console.log('UI Component Fixer completed.');
}

// Run the main function
main();
