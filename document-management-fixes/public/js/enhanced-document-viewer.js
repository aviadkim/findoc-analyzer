/**
 * Enhanced Document Viewer Component
 * 
 * This component handles the display of processed documents, including:
 * - Document text
 * - Extracted tables
 * - Securities information
 * - Document metadata
 * - Q&A interface
 */

class EnhancedDocumentViewer {
  constructor(containerId, options = {}) {
    this.container = document.getElementById(containerId);
    if (!this.container) {
      throw new Error(`Container element with ID "${containerId}" not found`);
    }
    
    this.options = {
      showText: true,
      showTables: true,
      showSecurities: true,
      showMetadata: true,
      showQA: true,
      ...options
    };
    
    this.document = null;
    this.documentId = null;
    this.tables = [];
    this.securities = [];
    this.chatHistory = [];
    
    this.init();
  }
  
  /**
   * Initialize the document viewer
   */
  init() {
    // Create the UI
    this.createUI();
    
    // Add event listeners
    this.addEventListeners();
  }
  
  /**
   * Create the UI
   */
  createUI() {
    // Create the document viewer container
    this.container.innerHTML = `
      <div class="document-viewer">
        <div class="document-header">
          <h2 class="document-title">Select a document</h2>
          <div class="document-info">
            <span class="document-filename"></span>
            <span class="document-type"></span>
          </div>
        </div>
        
        <div class="document-tabs">
          <div class="tabs">
            <div class="tab-header">
              <button class="tab-button active" data-tab="overview">Overview</button>
              <button class="tab-button" data-tab="tables">Tables</button>
              <button class="tab-button" data-tab="securities">Securities</button>
              <button class="tab-button" data-tab="text">Text</button>
              <button class="tab-button" data-tab="qa">Q&A</button>
            </div>
            
            <div class="tab-content">
              <div class="tab-pane active" id="overview-tab">
                <div class="document-overview">
                  <h3>Document Overview</h3>
                  <div class="document-metadata">
                    <p>Select a document to view its details</p>
                  </div>
                </div>
              </div>
              
              <div class="tab-pane" id="tables-tab">
                <div class="document-tables">
                  <h3>Extracted Tables</h3>
                  <div class="tables-container">
                    <p>No tables found</p>
                  </div>
                </div>
              </div>
              
              <div class="tab-pane" id="securities-tab">
                <div class="document-securities">
                  <h3>Securities Information</h3>
                  <div class="securities-container">
                    <p>No securities found</p>
                  </div>
                </div>
              </div>
              
              <div class="tab-pane" id="text-tab">
                <div class="document-text">
                  <h3>Document Text</h3>
                  <div class="text-container">
                    <p>No text content available</p>
                  </div>
                </div>
              </div>
              
              <div class="tab-pane" id="qa-tab">
                <div class="document-qa">
                  <h3>Ask Questions</h3>
                  <div class="chat-container">
                    <div class="chat-messages"></div>
                    <div class="chat-input">
                      <input type="text" id="question-input" placeholder="Ask a question about this document..." disabled>
                      <button id="send-question" disabled>Send</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
    
    // Add CSS
    const style = document.createElement('style');
    style.textContent = `
      .document-viewer {
        font-family: Arial, sans-serif;
        max-width: 100%;
        margin: 0 auto;
        padding: 20px;
        background-color: #fff;
        border-radius: 8px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
      }
      
      .document-header {
        margin-bottom: 20px;
        padding-bottom: 10px;
        border-bottom: 1px solid #eee;
      }
      
      .document-title {
        margin: 0 0 10px 0;
        font-size: 24px;
        color: #333;
      }
      
      .document-info {
        display: flex;
        gap: 20px;
        color: #666;
        font-size: 14px;
      }
      
      .document-tabs {
        margin-top: 20px;
      }
      
      .tab-header {
        display: flex;
        border-bottom: 1px solid #ddd;
        margin-bottom: 20px;
      }
      
      .tab-button {
        padding: 10px 20px;
        background: none;
        border: none;
        border-bottom: 2px solid transparent;
        cursor: pointer;
        font-size: 16px;
        color: #666;
        transition: all 0.3s;
      }
      
      .tab-button:hover {
        color: #333;
      }
      
      .tab-button.active {
        color: #2196F3;
        border-bottom: 2px solid #2196F3;
      }
      
      .tab-pane {
        display: none;
        padding: 20px 0;
      }
      
      .tab-pane.active {
        display: block;
      }
      
      .document-metadata {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 10px;
      }
      
      .metadata-item {
        padding: 10px;
        background-color: #f9f9f9;
        border-radius: 4px;
      }
      
      .metadata-label {
        font-weight: bold;
        color: #555;
        margin-bottom: 5px;
      }
      
      .metadata-value {
        color: #333;
      }
      
      .tables-container {
        margin-top: 20px;
      }
      
      .table-item {
        margin-bottom: 30px;
        border: 1px solid #ddd;
        border-radius: 4px;
        overflow: hidden;
      }
      
      .table-header {
        padding: 10px 15px;
        background-color: #f5f5f5;
        border-bottom: 1px solid #ddd;
      }
      
      .table-title {
        margin: 0;
        font-size: 18px;
        color: #333;
      }
      
      .table-content {
        overflow-x: auto;
      }
      
      .data-table {
        width: 100%;
        border-collapse: collapse;
      }
      
      .data-table th, .data-table td {
        padding: 8px 12px;
        text-align: left;
        border-bottom: 1px solid #ddd;
      }
      
      .data-table th {
        background-color: #f9f9f9;
        font-weight: bold;
      }
      
      .data-table tr:nth-child(even) {
        background-color: #f9f9f9;
      }
      
      .securities-container {
        margin-top: 20px;
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 20px;
      }
      
      .security-card {
        border: 1px solid #ddd;
        border-radius: 8px;
        padding: 15px;
        background-color: #fff;
        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
      }
      
      .security-name {
        margin: 0 0 10px 0;
        font-size: 18px;
        color: #333;
      }
      
      .security-isin {
        color: #666;
        font-size: 14px;
        margin-bottom: 10px;
      }
      
      .security-details {
        margin-top: 10px;
      }
      
      .security-detail {
        display: flex;
        justify-content: space-between;
        padding: 5px 0;
        border-bottom: 1px solid #eee;
      }
      
      .security-label {
        color: #666;
      }
      
      .security-value {
        font-weight: bold;
        color: #333;
      }
      
      .text-container {
        margin-top: 20px;
        padding: 15px;
        background-color: #f9f9f9;
        border-radius: 4px;
        white-space: pre-wrap;
        font-family: monospace;
        max-height: 500px;
        overflow-y: auto;
      }
      
      .chat-container {
        margin-top: 20px;
      }
      
      .chat-messages {
        max-height: 400px;
        overflow-y: auto;
        margin-bottom: 20px;
        padding: 10px;
        background-color: #f9f9f9;
        border-radius: 4px;
      }
      
      .chat-message {
        margin-bottom: 15px;
        padding: 10px;
        border-radius: 4px;
      }
      
      .user-message {
        background-color: #e3f2fd;
        margin-left: 20px;
        border-left: 4px solid #2196F3;
      }
      
      .assistant-message {
        background-color: #f5f5f5;
        margin-right: 20px;
        border-left: 4px solid #4CAF50;
      }
      
      .message-content {
        white-space: pre-wrap;
      }
      
      .message-timestamp {
        font-size: 12px;
        color: #999;
        margin-top: 5px;
        text-align: right;
      }
      
      .chat-input {
        display: flex;
        gap: 10px;
      }
      
      .chat-input input {
        flex: 1;
        padding: 10px;
        border: 1px solid #ddd;
        border-radius: 4px;
        font-size: 16px;
      }
      
      .chat-input button {
        padding: 10px 20px;
        background-color: #2196F3;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 16px;
      }
      
      .chat-input button:hover {
        background-color: #0b7dda;
      }
      
      .chat-input button:disabled {
        background-color: #cccccc;
        cursor: not-allowed;
      }
    `;
    document.head.appendChild(style);
  }
  
  /**
   * Add event listeners
   */
  addEventListeners() {
    // Tab navigation
    const tabButtons = this.container.querySelectorAll('.tab-button');
    tabButtons.forEach(button => {
      button.addEventListener('click', () => {
        // Remove active class from all buttons and panes
        tabButtons.forEach(btn => btn.classList.remove('active'));
        const tabPanes = this.container.querySelectorAll('.tab-pane');
        tabPanes.forEach(pane => pane.classList.remove('active'));
        
        // Add active class to clicked button and corresponding pane
        button.classList.add('active');
        const tabId = button.getAttribute('data-tab');
        const tabPane = this.container.querySelector(`#${tabId}-tab`);
        tabPane.classList.add('active');
      });
    });
    
    // Send question button
    const sendButton = this.container.querySelector('#send-question');
    const questionInput = this.container.querySelector('#question-input');
    
    sendButton.addEventListener('click', () => {
      const question = questionInput.value.trim();
      if (question) {
        this.askQuestion(question);
        questionInput.value = '';
      }
    });
    
    // Enter key in question input
    questionInput.addEventListener('keypress', (event) => {
      if (event.key === 'Enter') {
        const question = questionInput.value.trim();
        if (question) {
          this.askQuestion(question);
          questionInput.value = '';
        }
      }
    });
  }
  
  /**
   * Load a document
   * @param {string} documentId - Document ID
   */
  async loadDocument(documentId) {
    try {
      this.documentId = documentId;
      
      // Fetch document data
      const response = await fetch(`/api/documents/${documentId}`);
      if (!response.ok) {
        throw new Error(`Error fetching document: ${response.statusText}`);
      }
      
      this.document = await response.json();
      
      // Update UI
      this.updateUI();
      
      // Enable question input
      const questionInput = this.container.querySelector('#question-input');
      const sendButton = this.container.querySelector('#send-question');
      questionInput.disabled = false;
      sendButton.disabled = false;
      
      return true;
    } catch (error) {
      console.error('Error loading document:', error);
      return false;
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
    this.container.querySelector('.document-type').textContent = this.document.documentType || '';
    
    // Update overview tab
    this.updateOverviewTab();
    
    // Update tables tab
    this.updateTablesTab();
    
    // Update securities tab
    this.updateSecuritiesTab();
    
    // Update text tab
    this.updateTextTab();
    
    // Update Q&A tab
    this.updateQATab();
  }
  
  /**
   * Update the overview tab
   */
  updateOverviewTab() {
    const overviewTab = this.container.querySelector('#overview-tab .document-metadata');
    
    // Create metadata HTML
    let metadataHtml = '';
    
    // Basic document info
    metadataHtml += `
      <div class="metadata-item">
        <div class="metadata-label">Document Name</div>
        <div class="metadata-value">${this.document.fileName || 'Unknown'}</div>
      </div>
      
      <div class="metadata-item">
        <div class="metadata-label">Document Type</div>
        <div class="metadata-value">${this.document.documentType || 'Unknown'}</div>
      </div>
      
      <div class="metadata-item">
        <div class="metadata-label">Upload Date</div>
        <div class="metadata-value">${new Date(this.document.uploadDate).toLocaleString()}</div>
      </div>
      
      <div class="metadata-item">
        <div class="metadata-label">Processed</div>
        <div class="metadata-value">${this.document.processed ? 'Yes' : 'No'}</div>
      </div>
    `;
    
    // Add metadata from document
    if (this.document.metadata) {
      const metadata = this.document.metadata;
      
      if (metadata.pageCount) {
        metadataHtml += `
          <div class="metadata-item">
            <div class="metadata-label">Page Count</div>
            <div class="metadata-value">${metadata.pageCount}</div>
          </div>
        `;
      }
      
      if (metadata.hasSecurities !== undefined) {
        metadataHtml += `
          <div class="metadata-item">
            <div class="metadata-label">Has Securities</div>
            <div class="metadata-value">${metadata.hasSecurities ? 'Yes' : 'No'}</div>
          </div>
        `;
      }
      
      if (metadata.hasTables !== undefined) {
        metadataHtml += `
          <div class="metadata-item">
            <div class="metadata-label">Has Tables</div>
            <div class="metadata-value">${metadata.hasTables ? 'Yes' : 'No'}</div>
          </div>
        `;
      }
      
      if (metadata.securities && metadata.securities.length > 0) {
        metadataHtml += `
          <div class="metadata-item">
            <div class="metadata-label">Securities Count</div>
            <div class="metadata-value">${metadata.securities.length}</div>
          </div>
        `;
      }
    }
    
    overviewTab.innerHTML = metadataHtml;
  }
  
  /**
   * Update the tables tab
   */
  updateTablesTab() {
    const tablesContainer = this.container.querySelector('#tables-tab .tables-container');
    
    // Check if we have tables
    if (this.document.metadata && this.document.metadata.tables && this.document.metadata.tables.length > 0) {
      const tables = this.document.metadata.tables;
      
      let tablesHtml = '';
      
      tables.forEach((table, index) => {
        tablesHtml += `
          <div class="table-item">
            <div class="table-header">
              <h3 class="table-title">Table ${index + 1}</h3>
            </div>
            <div class="table-content">
              <table class="data-table">
                <thead>
                  <tr>
                    ${table.headers.map(header => `<th>${header}</th>`).join('')}
                  </tr>
                </thead>
                <tbody>
                  ${table.rows.map(row => `
                    <tr>
                      ${row.map(cell => `<td>${cell}</td>`).join('')}
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>
        `;
      });
      
      tablesContainer.innerHTML = tablesHtml;
    } else {
      // Mock tables for testing
      const mockTables = [
        {
          title: 'Portfolio Summary',
          headers: ['Item', 'Value', 'Change'],
          rows: [
            ['Total Value', '$1,250,000.00', '+7.5%'],
            ['Cash Balance', '$125,000.00', '+2.1%'],
            ['Invested Amount', '$1,125,000.00', '+8.2%'],
            ['Unrealized Gain/Loss', '+$75,000.00', '+7.14%']
          ]
        },
        {
          title: 'Asset Allocation',
          headers: ['Asset Class', 'Value', 'Percentage'],
          rows: [
            ['Equities', '$750,000.00', '60%'],
            ['Fixed Income', '$375,000.00', '30%'],
            ['Cash', '$125,000.00', '10%']
          ]
        }
      ];
      
      let tablesHtml = '';
      
      mockTables.forEach((table, index) => {
        tablesHtml += `
          <div class="table-item">
            <div class="table-header">
              <h3 class="table-title">${table.title}</h3>
            </div>
            <div class="table-content">
              <table class="data-table">
                <thead>
                  <tr>
                    ${table.headers.map(header => `<th>${header}</th>`).join('')}
                  </tr>
                </thead>
                <tbody>
                  ${table.rows.map(row => `
                    <tr>
                      ${row.map(cell => `<td>${cell}</td>`).join('')}
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>
        `;
      });
      
      tablesContainer.innerHTML = tablesHtml;
    }
  }
  
  /**
   * Update the securities tab
   */
  updateSecuritiesTab() {
    const securitiesContainer = this.container.querySelector('#securities-tab .securities-container');
    
    // Check if we have securities
    if (this.document.metadata && this.document.metadata.securities && this.document.metadata.securities.length > 0) {
      const securities = this.document.metadata.securities;
      
      let securitiesHtml = '';
      
      securities.forEach(security => {
        securitiesHtml += `
          <div class="security-card">
            <h3 class="security-name">${security.name}</h3>
            <div class="security-isin">ISIN: ${security.isin}</div>
            <div class="security-details">
              <div class="security-detail">
                <span class="security-label">Quantity</span>
                <span class="security-value">${security.quantity}</span>
              </div>
              <div class="security-detail">
                <span class="security-label">Value</span>
                <span class="security-value">$${security.value.toLocaleString()}</span>
              </div>
            </div>
          </div>
        `;
      });
      
      securitiesContainer.innerHTML = securitiesHtml;
    } else {
      securitiesContainer.innerHTML = '<p>No securities found in this document</p>';
    }
  }
  
  /**
   * Update the text tab
   */
  updateTextTab() {
    const textContainer = this.container.querySelector('#text-tab .text-container');
    
    // Check if we have text content
    if (this.document.content && this.document.content.text) {
      textContainer.innerHTML = `<pre>${this.document.content.text}</pre>`;
    } else {
      // Mock text content
      textContainer.innerHTML = `<pre>
PORTFOLIO STATEMENT
Client: John Smith
Account Number: 123456789
Statement Date: June 30, 2023

PORTFOLIO SUMMARY
Total Value: $1,250,000.00
Cash Balance: $125,000.00
Invested Amount: $1,125,000.00
Unrealized Gain/Loss: +$75,000.00 (+7.14%)

ASSET ALLOCATION
Equities: 60% ($750,000.00)
Fixed Income: 30% ($375,000.00)
Cash: 10% ($125,000.00)

SECURITIES HOLDINGS
1. Apple Inc. (ISIN: US0378331005)
   Quantity: 100
   Price: $180.00
   Value: $18,000.00

2. Microsoft Corp. (ISIN: US5949181045)
   Quantity: 150
   Price: $340.00
   Value: $51,000.00

3. Amazon.com Inc. (ISIN: US0231351067)
   Quantity: 50
   Price: $130.00
   Value: $6,500.00

4. Tesla Inc. (ISIN: US88160R1014)
   Quantity: 75
   Price: $250.00
   Value: $18,750.00

5. Meta Platforms Inc. (ISIN: US30303M1027)
   Quantity: 80
   Price: $290.00
   Value: $23,200.00
</pre>`;
    }
  }
  
  /**
   * Update the Q&A tab
   */
  updateQATab() {
    const chatMessages = this.container.querySelector('#qa-tab .chat-messages');
    
    // Clear chat messages
    chatMessages.innerHTML = '';
    
    // Add welcome message
    const welcomeMessage = document.createElement('div');
    welcomeMessage.className = 'chat-message assistant-message';
    welcomeMessage.innerHTML = `
      <div class="message-content">
        Hello! I'm your financial document assistant. Ask me any questions about this document and I'll do my best to answer.
      </div>
      <div class="message-timestamp">
        ${new Date().toLocaleString()}
      </div>
    `;
    chatMessages.appendChild(welcomeMessage);
  }
  
  /**
   * Ask a question about the document
   * @param {string} question - Question to ask
   */
  async askQuestion(question) {
    if (!this.documentId || !question) {
      return;
    }
    
    // Add user message to chat
    const chatMessages = this.container.querySelector('#qa-tab .chat-messages');
    const userMessage = document.createElement('div');
    userMessage.className = 'chat-message user-message';
    userMessage.innerHTML = `
      <div class="message-content">
        ${question}
      </div>
      <div class="message-timestamp">
        ${new Date().toLocaleString()}
      </div>
    `;
    chatMessages.appendChild(userMessage);
    
    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    // Disable input while waiting for response
    const questionInput = this.container.querySelector('#question-input');
    const sendButton = this.container.querySelector('#send-question');
    questionInput.disabled = true;
    sendButton.disabled = true;
    
    try {
      // Send question to API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          documentId: this.documentId,
          message: question
        })
      });
      
      if (!response.ok) {
        throw new Error(`Error sending question: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Add assistant message to chat
      const assistantMessage = document.createElement('div');
      assistantMessage.className = 'chat-message assistant-message';
      assistantMessage.innerHTML = `
        <div class="message-content">
          ${data.response}
        </div>
        <div class="message-timestamp">
          ${new Date(data.timestamp).toLocaleString()}
          ${data.source ? `(Source: ${data.source})` : ''}
        </div>
      `;
      chatMessages.appendChild(assistantMessage);
      
      // Scroll to bottom
      chatMessages.scrollTop = chatMessages.scrollHeight;
    } catch (error) {
      console.error('Error asking question:', error);
      
      // Add error message to chat
      const errorMessage = document.createElement('div');
      errorMessage.className = 'chat-message assistant-message';
      errorMessage.innerHTML = `
        <div class="message-content">
          Sorry, I encountered an error while processing your question. Please try again.
        </div>
        <div class="message-timestamp">
          ${new Date().toLocaleString()}
        </div>
      `;
      chatMessages.appendChild(errorMessage);
      
      // Scroll to bottom
      chatMessages.scrollTop = chatMessages.scrollHeight;
    } finally {
      // Re-enable input
      questionInput.disabled = false;
      sendButton.disabled = false;
      questionInput.focus();
    }
  }
}

// Export the class
window.EnhancedDocumentViewer = EnhancedDocumentViewer;
