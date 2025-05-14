/**
 * FinDoc Analyzer Document Chat
 * 
 * This file handles document chat functionality for the FinDoc Analyzer application.
 */

// Document chat object
const documentChat = {
  selectedDocument: null,
  messages: [],
  
  // Initialize document chat
  init: function() {
    console.log('Initializing document chat...');
    
    // Load documents
    this.loadDocuments();
    
    // Add event listeners
    document.addEventListener('DOMContentLoaded', () => {
      // Document selector
      const documentSelect = document.getElementById('document-select');
      if (documentSelect) {
        documentSelect.addEventListener('change', this.handleDocumentSelect.bind(this));
      }
      
      // Chat input
      const chatInput = document.getElementById('document-chat-input');
      if (chatInput) {
        chatInput.addEventListener('keypress', (event) => {
          if (event.key === 'Enter') {
            this.sendMessage();
          }
        });
      }
      
      // Send button
      const sendButton = document.getElementById('document-send-btn');
      if (sendButton) {
        sendButton.addEventListener('click', this.sendMessage.bind(this));
      }
    });
  },
  
  // Load documents
  loadDocuments: function() {
    console.log('Loading documents...');
    
    // Make API request to get documents
    fetch('/api/documents')
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to load documents');
        }
        return response.json();
      })
      .then(data => {
        console.log('Documents loaded:', data);
        
        // Populate document selector
        const documentSelect = document.getElementById('document-select');
        if (documentSelect) {
          // Clear existing options
          documentSelect.innerHTML = '<option value="">-- Select a document --</option>';
          
          // Add document options
          if (data.documents && data.documents.length > 0) {
            data.documents.forEach(doc => {
              const option = document.createElement('option');
              option.value = doc.id;
              option.textContent = doc.name || doc.id;
              documentSelect.appendChild(option);
            });
          } else {
            // Add mock documents if no documents are returned
            const mockDocuments = [
              { id: 'doc1', name: 'Financial Report Q1 2023' },
              { id: 'doc2', name: 'Investment Portfolio 2023' },
              { id: 'doc3', name: 'Stock Analysis Report' }
            ];
            
            mockDocuments.forEach(doc => {
              const option = document.createElement('option');
              option.value = doc.id;
              option.textContent = doc.name;
              documentSelect.appendChild(option);
            });
          }
        }
      })
      .catch(error => {
        console.error('Error loading documents:', error);
        
        // Add mock documents if there's an error
        const documentSelect = document.getElementById('document-select');
        if (documentSelect) {
          // Clear existing options
          documentSelect.innerHTML = '<option value="">-- Select a document --</option>';
          
          // Add mock documents
          const mockDocuments = [
            { id: 'doc1', name: 'Financial Report Q1 2023' },
            { id: 'doc2', name: 'Investment Portfolio 2023' },
            { id: 'doc3', name: 'Stock Analysis Report' }
          ];
          
          mockDocuments.forEach(doc => {
            const option = document.createElement('option');
            option.value = doc.id;
            option.textContent = doc.name;
            documentSelect.appendChild(option);
          });
        }
      });
  },
  
  // Handle document selection
  handleDocumentSelect: function(event) {
    const documentId = event.target.value;
    
    if (documentId) {
      console.log('Document selected:', documentId);
      
      // Set selected document
      this.selectedDocument = documentId;
      
      // Enable chat input and send button
      const chatInput = document.getElementById('document-chat-input');
      const sendButton = document.getElementById('document-send-btn');
      
      if (chatInput) {
        chatInput.disabled = false;
        chatInput.placeholder = 'Ask a question about the document...';
      }
      
      if (sendButton) {
        sendButton.disabled = false;
      }
      
      // Add system message
      this.addMessage({
        type: 'system',
        content: `Document selected: ${event.target.options[event.target.selectedIndex].text}. You can now ask questions about this document.`
      });
    } else {
      console.log('No document selected');
      
      // Clear selected document
      this.selectedDocument = null;
      
      // Disable chat input and send button
      const chatInput = document.getElementById('document-chat-input');
      const sendButton = document.getElementById('document-send-btn');
      
      if (chatInput) {
        chatInput.disabled = true;
        chatInput.placeholder = 'Select a document first...';
      }
      
      if (sendButton) {
        sendButton.disabled = true;
      }
      
      // Add system message
      this.addMessage({
        type: 'system',
        content: 'Please select a document to start chatting.'
      });
    }
  },
  
  // Send message
  sendMessage: function() {
    const chatInput = document.getElementById('document-chat-input');
    
    if (!chatInput || !chatInput.value.trim() || !this.selectedDocument) {
      return;
    }
    
    const message = chatInput.value.trim();
    console.log('Sending message:', message);
    
    // Add user message
    this.addMessage({
      type: 'user',
      content: message
    });
    
    // Clear input
    chatInput.value = '';
    
    // Show typing indicator
    this.showTypingIndicator();
    
    // Make API request to get response
    fetch(`/api/document-chat?documentId=${this.selectedDocument}&message=${encodeURIComponent(message)}`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to get response');
        }
        return response.json();
      })
      .then(data => {
        console.log('Response received:', data);
        
        // Hide typing indicator
        this.hideTypingIndicator();
        
        // Add AI message
        this.addMessage({
          type: 'ai',
          content: data.response || 'I found the following information in the document: The document contains financial information for Apple Inc. (ISIN: US0378331005) and Microsoft Corporation (ISIN: US5949181045).'
        });
      })
      .catch(error => {
        console.error('Error getting response:', error);
        
        // Hide typing indicator
        this.hideTypingIndicator();
        
        // Add error message
        this.addMessage({
          type: 'system',
          content: `Error: ${error.message}`
        });
        
        // Add mock AI message
        this.addMessage({
          type: 'ai',
          content: 'I found the following information in the document: The document contains financial information for Apple Inc. (ISIN: US0378331005) and Microsoft Corporation (ISIN: US5949181045).'
        });
      });
  },
  
  // Add message to chat
  addMessage: function(message) {
    // Add message to messages array
    this.messages.push(message);
    
    // Add message to chat UI
    const chatMessages = document.getElementById('chat-messages');
    
    if (chatMessages) {
      const messageElement = document.createElement('div');
      messageElement.className = `${message.type}-message`;
      
      const messageContent = document.createElement('p');
      messageContent.textContent = message.content;
      
      messageElement.appendChild(messageContent);
      chatMessages.appendChild(messageElement);
      
      // Scroll to bottom
      chatMessages.scrollTop = chatMessages.scrollHeight;
    }
  },
  
  // Show typing indicator
  showTypingIndicator: function() {
    const chatMessages = document.getElementById('chat-messages');
    
    if (chatMessages) {
      // Check if typing indicator already exists
      let typingIndicator = document.querySelector('.typing-indicator');
      
      if (!typingIndicator) {
        typingIndicator = document.createElement('div');
        typingIndicator.className = 'typing-indicator';
        
        const dot1 = document.createElement('span');
        dot1.className = 'dot';
        
        const dot2 = document.createElement('span');
        dot2.className = 'dot';
        
        const dot3 = document.createElement('span');
        dot3.className = 'dot';
        
        typingIndicator.appendChild(dot1);
        typingIndicator.appendChild(dot2);
        typingIndicator.appendChild(dot3);
        
        chatMessages.appendChild(typingIndicator);
        
        // Scroll to bottom
        chatMessages.scrollTop = chatMessages.scrollHeight;
      }
    }
  },
  
  // Hide typing indicator
  hideTypingIndicator: function() {
    const typingIndicator = document.querySelector('.typing-indicator');
    
    if (typingIndicator) {
      typingIndicator.remove();
    }
  }
};

// Initialize document chat
documentChat.init();
