/**
 * Document Viewer Component
 * 
 * This component handles the display of processed documents, including:
 * - Document text
 * - Extracted tables
 * - Document metadata
 * - Q&A interface
 */

class DocumentViewer {
  constructor(containerId, options = {}) {
    this.container = document.getElementById(containerId);
    if (!this.container) {
      throw new Error(`Container element with ID "${containerId}" not found`);
    }
    
    this.options = {
      showText: true,
      showTables: true,
      showMetadata: true,
      showQA: true,
      ...options
    };
    
    this.document = null;
    this.documentId = null;
    this.chatHistory = [];
    
    this.init();
  }
  
  /**
   * Initialize the document viewer
   */
  init() {
    // Create the document viewer structure
    this.container.innerHTML = `
      <div class="document-viewer">
        <div class="document-header">
          <h2 class="document-title">Document Viewer</h2>
          <div class="document-info">
            <span class="document-filename"></span>
            <span class="document-type"></span>
          </div>
        </div>
        
        <div class="document-content">
          <div class="document-tabs">
            <button class="tab-button active" data-tab="text">Text</button>
            <button class="tab-button" data-tab="tables">Tables</button>
            <button class="tab-button" data-tab="metadata">Metadata</button>
            <button class="tab-button" data-tab="qa">Q&A</button>
          </div>
          
          <div class="document-tab-content">
            <div class="tab-pane active" id="text-tab">
              <div class="document-text"></div>
            </div>
            
            <div class="tab-pane" id="tables-tab">
              <div class="document-tables"></div>
            </div>
            
            <div class="tab-pane" id="metadata-tab">
              <div class="document-metadata"></div>
            </div>
            
            <div class="tab-pane" id="qa-tab">
              <div class="document-qa">
                <div class="chat-history"></div>
                <div class="chat-input">
                  <input type="text" id="question-input" placeholder="Ask a question about this document...">
                  <button id="ask-btn">Ask</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
    
    // Add event listeners
    this.addEventListeners();
    
    // Try to load document from localStorage
    this.loadDocumentFromStorage();
  }
  
  /**
   * Add event listeners
   */
  addEventListeners() {
    // Tab buttons
    const tabButtons = this.container.querySelectorAll('.tab-button');
    tabButtons.forEach(button => {
      button.addEventListener('click', () => {
        const tabName = button.dataset.tab;
        this.showTab(tabName);
      });
    });
    
    // Ask button
    const askButton = this.container.querySelector('#ask-btn');
    askButton.addEventListener('click', () => {
      this.askQuestion();
    });
    
    // Question input (Enter key)
    const questionInput = this.container.querySelector('#question-input');
    questionInput.addEventListener('keypress', (event) => {
      if (event.key === 'Enter') {
        this.askQuestion();
      }
    });
  }
  
  /**
   * Show a specific tab
   * @param {string} tabName - Name of the tab to show
   */
  showTab(tabName) {
    // Update tab buttons
    const tabButtons = this.container.querySelectorAll('.tab-button');
    tabButtons.forEach(button => {
      if (button.dataset.tab === tabName) {
        button.classList.add('active');
      } else {
        button.classList.remove('active');
      }
    });
    
    // Update tab panes
    const tabPanes = this.container.querySelectorAll('.tab-pane');
    tabPanes.forEach(pane => {
      if (pane.id === `${tabName}-tab`) {
        pane.classList.add('active');
      } else {
        pane.classList.remove('active');
      }
    });
  }
  
  /**
   * Load document from API
   * @param {string} documentId - Document ID
   */
  async loadDocument(documentId) {
    try {
      this.documentId = documentId;
      
      // Show loading state
      this.container.querySelector('.document-title').textContent = 'Loading document...';
      
      // Fetch document from API
      const response = await fetch(`/api/documents/${documentId}`);
      
      if (!response.ok) {
        throw new Error(`Failed to load document: ${response.status} ${response.statusText}`);
      }
      
      const document = await response.json();
      
      // Store document
      this.document = document;
      
      // Update UI
      this.updateUI();
      
      // Save document ID to localStorage
      localStorage.setItem('selectedDocumentId', documentId);
      
      return document;
    } catch (error) {
      console.error('Error loading document:', error);
      this.container.querySelector('.document-title').textContent = 'Error loading document';
      
      // Show error message
      this.container.querySelector('.document-text').innerHTML = `
        <div class="error-message">
          <h3>Error loading document</h3>
          <p>${error.message}</p>
          <button onclick="window.location.href = '/documents-new'">Back to Documents</button>
        </div>
      `;
    }
  }
  
  /**
   * Load document from localStorage
   */
  loadDocumentFromStorage() {
    const documentId = localStorage.getItem('selectedDocumentId');
    
    if (documentId) {
      this.loadDocument(documentId);
    }
  }
  
  /**
   * Update the UI with document data
   */
  updateUI() {
    if (!this.document) {
      return;
    }
    
    // Update document header
    this.container.querySelector('.document-title').textContent = this.document.fileName || 'Untitled Document';
    this.container.querySelector('.document-filename').textContent = this.document.fileName || '';
    this.container.querySelector('.document-type').textContent = this.document.fileType || '';
    
    // Update document text
    if (this.options.showText) {
      const textContent = this.document.content?.text || 'No text content available';
      this.container.querySelector('.document-text').innerHTML = `<pre>${textContent}</pre>`;
    }
    
    // Update document tables
    if (this.options.showTables) {
      const tablesContainer = this.container.querySelector('.document-tables');
      tablesContainer.innerHTML = '';
      
      const tables = this.document.content?.tables || [];
      
      if (tables.length === 0) {
        tablesContainer.innerHTML = '<p>No tables found in this document</p>';
      } else {
        tables.forEach(table => {
          const tableElement = document.createElement('div');
          tableElement.className = 'document-table';
          
          let tableHtml = `<h3>${table.title || 'Untitled Table'}</h3>`;
          tableHtml += '<table>';
          
          // Table headers
          tableHtml += '<thead><tr>';
          table.headers.forEach(header => {
            tableHtml += `<th>${header}</th>`;
          });
          tableHtml += '</tr></thead>';
          
          // Table rows
          tableHtml += '<tbody>';
          table.rows.forEach(row => {
            tableHtml += '<tr>';
            row.forEach(cell => {
              tableHtml += `<td>${cell}</td>`;
            });
            tableHtml += '</tr>';
          });
          tableHtml += '</tbody>';
          
          tableHtml += '</table>';
          
          tableElement.innerHTML = tableHtml;
          tablesContainer.appendChild(tableElement);
        });
      }
    }
    
    // Update document metadata
    if (this.options.showMetadata) {
      const metadataContainer = this.container.querySelector('.document-metadata');
      metadataContainer.innerHTML = '';
      
      const metadata = this.document.content?.metadata || {};
      
      if (Object.keys(metadata).length === 0) {
        metadataContainer.innerHTML = '<p>No metadata available for this document</p>';
      } else {
        const metadataTable = document.createElement('table');
        metadataTable.className = 'metadata-table';
        
        Object.entries(metadata).forEach(([key, value]) => {
          const row = document.createElement('tr');
          
          const keyCell = document.createElement('th');
          keyCell.textContent = key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1');
          
          const valueCell = document.createElement('td');
          valueCell.textContent = value;
          
          row.appendChild(keyCell);
          row.appendChild(valueCell);
          
          metadataTable.appendChild(row);
        });
        
        metadataContainer.appendChild(metadataTable);
      }
    }
    
    // Update Q&A interface
    if (this.options.showQA) {
      // Nothing to do here, the Q&A interface is already set up
    }
  }
  
  /**
   * Ask a question about the document
   */
  async askQuestion() {
    if (!this.document || !this.documentId) {
      alert('Please load a document first');
      return;
    }
    
    const questionInput = this.container.querySelector('#question-input');
    const question = questionInput.value.trim();
    
    if (!question) {
      return;
    }
    
    try {
      // Clear the input
      questionInput.value = '';
      
      // Add the question to the chat history
      this.addMessageToChat('user', question);
      
      // Show loading state
      this.addMessageToChat('assistant', '...', 'loading');
      
      // Send the question to the API
      const response = await fetch(`/api/documents/${this.documentId}/questions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ question })
      });
      
      if (!response.ok) {
        throw new Error(`Failed to get answer: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Remove loading message
      this.removeLoadingMessage();
      
      // Add the answer to the chat history
      this.addMessageToChat('assistant', data.answer);
      
      // Show the Q&A tab
      this.showTab('qa');
      
      // Scroll to the bottom of the chat history
      const chatHistory = this.container.querySelector('.chat-history');
      chatHistory.scrollTop = chatHistory.scrollHeight;
    } catch (error) {
      console.error('Error asking question:', error);
      
      // Remove loading message
      this.removeLoadingMessage();
      
      // Add error message to chat
      this.addMessageToChat('assistant', `Error: ${error.message}`, 'error');
    }
  }
  
  /**
   * Add a message to the chat history
   * @param {string} role - Message role ('user' or 'assistant')
   * @param {string} content - Message content
   * @param {string} className - Additional CSS class
   */
  addMessageToChat(role, content, className = '') {
    const chatHistory = this.container.querySelector('.chat-history');
    
    const messageElement = document.createElement('div');
    messageElement.className = `chat-message ${role}-message ${className}`;
    
    const contentElement = document.createElement('div');
    contentElement.className = 'message-content';
    contentElement.textContent = content;
    
    messageElement.appendChild(contentElement);
    chatHistory.appendChild(messageElement);
    
    // Scroll to the bottom of the chat history
    chatHistory.scrollTop = chatHistory.scrollHeight;
    
    // Add to chat history array
    if (className !== 'loading') {
      this.chatHistory.push({ role, content });
    }
  }
  
  /**
   * Remove the loading message from the chat history
   */
  removeLoadingMessage() {
    const loadingMessage = this.container.querySelector('.chat-message.loading');
    if (loadingMessage) {
      loadingMessage.remove();
    }
  }
}

// Export the DocumentViewer class
window.DocumentViewer = DocumentViewer;
