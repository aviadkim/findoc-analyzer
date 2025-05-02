/**
 * Chat Interface
 * 
 * This file contains the chat interface for the document chat.
 */

class ChatInterface {
  /**
   * Constructor
   * @param {object} options - Options
   * @param {string} options.apiUrl - API URL
   * @param {string} options.documentListSelector - Document list selector
   * @param {string} options.documentItemSelector - Document item selector
   * @param {string} options.chatMessagesSelector - Chat messages selector
   * @param {string} options.chatInputSelector - Chat input selector
   * @param {string} options.sendButtonSelector - Send button selector
   * @param {string} options.chatHeaderSelector - Chat header selector
   * @param {function} options.onError - Error callback
   */
  constructor(options) {
    this.apiUrl = options.apiUrl;
    this.documentListSelector = options.documentListSelector;
    this.documentItemSelector = options.documentItemSelector;
    this.chatMessagesSelector = options.chatMessagesSelector;
    this.chatInputSelector = options.chatInputSelector;
    this.sendButtonSelector = options.sendButtonSelector;
    this.chatHeaderSelector = options.chatHeaderSelector;
    this.onError = options.onError || console.error;
    
    this.documentList = document.querySelector(this.documentListSelector);
    this.chatMessages = document.querySelector(this.chatMessagesSelector);
    this.chatInput = document.querySelector(this.chatInputSelector);
    this.sendButton = document.querySelector(this.sendButtonSelector);
    this.chatHeader = document.querySelector(this.chatHeaderSelector);
    
    this.currentDocumentId = null;
    this.isLoading = false;
    
    this.init();
  }
  
  /**
   * Initialize
   */
  init() {
    // Add event listeners
    this.sendButton.addEventListener('click', () => this.sendMessage());
    
    this.chatInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        this.sendMessage();
      }
    });
    
    // Add document selection event listeners
    this.documentList.addEventListener('click', (e) => {
      const documentItem = e.target.closest(this.documentItemSelector);
      
      if (documentItem) {
        this.selectDocument(documentItem);
      }
    });
  }
  
  /**
   * Load documents
   */
  async loadDocuments() {
    try {
      // Show loading state
      this.documentList.innerHTML = '<div class="loading-spinner"></div>';
      
      // Get documents from API
      const response = await fetch('/api/documents');
      
      if (!response.ok) {
        throw new Error('Failed to load documents');
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to load documents');
      }
      
      // Update document list
      this.updateDocumentList(data.data.documents);
      
      // Select first document if available
      if (data.data.documents && data.data.documents.length > 0) {
        const firstDocumentItem = this.documentList.querySelector(this.documentItemSelector);
        
        if (firstDocumentItem) {
          this.selectDocument(firstDocumentItem);
        }
      } else {
        // Show empty state
        this.documentList.innerHTML = '<div class="empty-state">No documents available</div>';
      }
    } catch (error) {
      console.error('Error loading documents:', error);
      
      // Show error state
      this.documentList.innerHTML = `<div class="error-state">Error loading documents: ${error.message}</div>`;
      
      // Call error callback
      this.onError(error);
    }
  }
  
  /**
   * Update document list
   * @param {Array} documents - Documents
   */
  updateDocumentList(documents) {
    // Clear document list
    this.documentList.innerHTML = '';
    
    // Add documents to list
    documents.forEach(document => {
      const documentItem = document.createElement('div');
      documentItem.className = 'document-item';
      documentItem.setAttribute('data-document-id', document.id);
      
      const documentIcon = document.createElement('div');
      documentIcon.className = 'document-item-icon';
      documentIcon.innerHTML = this.getDocumentIcon(document.type);
      
      const documentInfo = document.createElement('div');
      documentInfo.className = 'document-item-info';
      
      const documentName = document.createElement('div');
      documentName.className = 'document-item-name';
      documentName.textContent = document.name;
      
      const documentMeta = document.createElement('div');
      documentMeta.className = 'document-item-meta';
      documentMeta.textContent = `${document.type} • ${this.formatFileSize(document.size)} • ${document.status}`;
      
      documentInfo.appendChild(documentName);
      documentInfo.appendChild(documentMeta);
      
      documentItem.appendChild(documentIcon);
      documentItem.appendChild(documentInfo);
      
      this.documentList.appendChild(documentItem);
    });
  }
  
  /**
   * Select document
   * @param {HTMLElement} documentItem - Document item
   */
  async selectDocument(documentItem) {
    // Get document ID
    const documentId = documentItem.getAttribute('data-document-id');
    
    if (!documentId) {
      return;
    }
    
    // Update active document
    const documentItems = this.documentList.querySelectorAll(this.documentItemSelector);
    
    documentItems.forEach(item => {
      item.classList.remove('active');
    });
    
    documentItem.classList.add('active');
    
    // Update current document ID
    this.currentDocumentId = documentId;
    
    // Update chat header
    const documentName = documentItem.querySelector('.document-item-name').textContent;
    const documentMeta = documentItem.querySelector('.document-item-meta').textContent;
    const documentIcon = documentItem.querySelector('.document-item-icon').innerHTML;
    
    this.chatHeader.querySelector('.chat-header-icon').innerHTML = documentIcon;
    this.chatHeader.querySelector('.chat-header-info h3').textContent = documentName;
    this.chatHeader.querySelector('.chat-header-info p').textContent = documentMeta;
    
    // Load chat history
    await this.loadChatHistory(documentId);
  }
  
  /**
   * Load chat history
   * @param {string} documentId - Document ID
   */
  async loadChatHistory(documentId) {
    try {
      // Show loading state
      this.chatMessages.innerHTML = '<div class="loading-spinner"></div>';
      
      // Get chat history from API
      const response = await fetch(`${this.apiUrl}/history/${documentId}`);
      
      if (!response.ok) {
        throw new Error('Failed to load chat history');
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to load chat history');
      }
      
      // Clear chat messages
      this.chatMessages.innerHTML = '';
      
      // Add welcome message if no history
      if (!data.data.history || data.data.history.length === 0) {
        const welcomeMessage = document.createElement('div');
        welcomeMessage.className = 'chat-message assistant';
        welcomeMessage.innerHTML = `
          <div class="chat-bubble">
            Hello! I'm your document assistant. I've analyzed this document and I'm ready to answer any questions you have about it.
          </div>
        `;
        
        this.chatMessages.appendChild(welcomeMessage);
        return;
      }
      
      // Add messages to chat
      data.data.history.forEach(message => {
        const messageElement = document.createElement('div');
        messageElement.className = `chat-message ${message.role}`;
        messageElement.innerHTML = `
          <div class="chat-bubble">
            ${this.formatMessageContent(message.content)}
          </div>
        `;
        
        this.chatMessages.appendChild(messageElement);
      });
      
      // Scroll to bottom
      this.scrollToBottom();
    } catch (error) {
      console.error('Error loading chat history:', error);
      
      // Show error state
      this.chatMessages.innerHTML = `<div class="error-state">Error loading chat history: ${error.message}</div>`;
      
      // Call error callback
      this.onError(error);
    }
  }
  
  /**
   * Send message
   */
  async sendMessage() {
    // Get message
    const message = this.chatInput.value.trim();
    
    if (!message || !this.currentDocumentId || this.isLoading) {
      return;
    }
    
    try {
      // Set loading state
      this.isLoading = true;
      this.sendButton.disabled = true;
      this.chatInput.disabled = true;
      
      // Add user message to chat
      const userMessageElement = document.createElement('div');
      userMessageElement.className = 'chat-message user';
      userMessageElement.innerHTML = `
        <div class="chat-bubble">
          ${this.formatMessageContent(message)}
        </div>
      `;
      
      this.chatMessages.appendChild(userMessageElement);
      
      // Clear input
      this.chatInput.value = '';
      
      // Scroll to bottom
      this.scrollToBottom();
      
      // Add loading message
      const loadingMessageElement = document.createElement('div');
      loadingMessageElement.className = 'chat-message assistant loading';
      loadingMessageElement.innerHTML = `
        <div class="chat-bubble">
          <div class="typing-indicator">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      `;
      
      this.chatMessages.appendChild(loadingMessageElement);
      
      // Scroll to bottom
      this.scrollToBottom();
      
      // Send message to API
      const response = await fetch(`${this.apiUrl}/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          documentId: this.currentDocumentId,
          message
        })
      });
      
      // Remove loading message
      loadingMessageElement.remove();
      
      if (!response.ok) {
        throw new Error('Failed to send message');
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to send message');
      }
      
      // Add assistant message to chat
      const assistantMessageElement = document.createElement('div');
      assistantMessageElement.className = 'chat-message assistant';
      assistantMessageElement.innerHTML = `
        <div class="chat-bubble">
          ${this.formatMessageContent(data.data.message.content)}
        </div>
      `;
      
      this.chatMessages.appendChild(assistantMessageElement);
      
      // Scroll to bottom
      this.scrollToBottom();
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Show error message
      const errorMessageElement = document.createElement('div');
      errorMessageElement.className = 'chat-message error';
      errorMessageElement.innerHTML = `
        <div class="chat-bubble">
          Error: ${error.message}
        </div>
      `;
      
      this.chatMessages.appendChild(errorMessageElement);
      
      // Scroll to bottom
      this.scrollToBottom();
      
      // Call error callback
      this.onError(error);
    } finally {
      // Reset loading state
      this.isLoading = false;
      this.sendButton.disabled = false;
      this.chatInput.disabled = false;
      this.chatInput.focus();
    }
  }
  
  /**
   * Scroll to bottom
   */
  scrollToBottom() {
    this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
  }
  
  /**
   * Format message content
   * @param {string} content - Message content
   * @returns {string} Formatted content
   */
  formatMessageContent(content) {
    // Replace newlines with <br>
    content = content.replace(/\n/g, '<br>');
    
    // Replace markdown-style links
    content = content.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>');
    
    // Replace markdown-style bold
    content = content.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    
    // Replace markdown-style italic
    content = content.replace(/\*([^*]+)\*/g, '<em>$1</em>');
    
    // Replace markdown-style code
    content = content.replace(/`([^`]+)`/g, '<code>$1</code>');
    
    return content;
  }
  
  /**
   * Get document icon
   * @param {string} type - Document type
   * @returns {string} Icon HTML
   */
  getDocumentIcon(type) {
    switch (type.toLowerCase()) {
      case 'pdf':
        return '<i class="fas fa-file-pdf"></i>';
      case 'excel':
      case 'xlsx':
      case 'xls':
        return '<i class="fas fa-file-excel"></i>';
      case 'word':
      case 'docx':
      case 'doc':
        return '<i class="fas fa-file-word"></i>';
      case 'csv':
        return '<i class="fas fa-file-csv"></i>';
      case 'image':
      case 'png':
      case 'jpg':
      case 'jpeg':
        return '<i class="fas fa-file-image"></i>';
      default:
        return '<i class="fas fa-file-alt"></i>';
    }
  }
  
  /**
   * Format file size
   * @param {number} size - File size in bytes
   * @returns {string} Formatted file size
   */
  formatFileSize(size) {
    if (!size) return 'Unknown';
    
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    let unitIndex = 0;
    
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    
    return `${size.toFixed(1)} ${units[unitIndex]}`;
  }
}
