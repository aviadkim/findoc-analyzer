/**
 * FinDoc Analyzer Global Chat Component
 * This script ensures the chat button appears on all pages
 * Version 2.0 - Fixed compatibility with test selectors
 */

// Main chat component implementation
const ChatComponent = {
  initialize: function() {
    console.log('Chat component initializing...');
    this.addChatButton();
    this.addChatContainer();
    console.log('Chat component initialized');
  },
  
  addChatButton: function() {
    // Check if chat button already exists
    if (document.getElementById('show-chat-btn')) {
      console.log('Chat button already exists, skipping creation');
      return;
    }
    
    // Create chat button
    const chatButton = document.createElement('button');
    chatButton.id = 'show-chat-btn';
    chatButton.className = 'btn btn-primary';
    chatButton.style.position = 'fixed';
    chatButton.style.bottom = '20px';
    chatButton.style.right = '20px';
    chatButton.style.zIndex = '1000';
    chatButton.innerHTML = 'Chat';
    
    // Add click event
    chatButton.addEventListener('click', function() {
      ChatComponent.toggleChatContainer();
    });
    
    document.body.appendChild(chatButton);
    console.log('Chat button added to page: ' + window.location.pathname);
  },
  
  addChatContainer: function() {
    // Check if chat container already exists
    if (document.getElementById('document-chat-container')) {
      console.log('Chat container already exists, skipping creation');
      return;
    }
    
    // Create chat container
    const chatContainer = document.createElement('div');
    chatContainer.id = 'document-chat-container';
    chatContainer.className = 'chat-container';
    chatContainer.style.position = 'fixed';
    chatContainer.style.bottom = '80px';
    chatContainer.style.right = '20px';
    chatContainer.style.width = '350px';
    chatContainer.style.height = '400px';
    chatContainer.style.backgroundColor = 'white';
    chatContainer.style.boxShadow = '0 0 10px rgba(0,0,0,0.2)';
    chatContainer.style.borderRadius = '10px';
    chatContainer.style.overflow = 'hidden';
    chatContainer.style.zIndex = '1000';
    chatContainer.style.display = 'none';
    
    // Create chat header
    const chatHeader = document.createElement('div');
    chatHeader.style.backgroundColor = '#f5f5f5';
    chatHeader.style.padding = '10px';
    chatHeader.style.borderBottom = '1px solid #ddd';
    chatHeader.style.display = 'flex';
    chatHeader.style.justifyContent = 'space-between';
    chatHeader.style.alignItems = 'center';
    
    const chatTitle = document.createElement('h3');
    chatTitle.style.margin = '0';
    chatTitle.style.fontSize = '16px';
    chatTitle.textContent = 'Document Chat';
    
    const closeButton = document.createElement('button');
    closeButton.style.background = 'none';
    closeButton.style.border = 'none';
    closeButton.style.fontSize = '20px';
    closeButton.style.cursor = 'pointer';
    closeButton.textContent = '×';
    closeButton.addEventListener('click', function() {
      chatContainer.style.display = 'none';
    });
    
    chatHeader.appendChild(chatTitle);
    chatHeader.appendChild(closeButton);
    
    // Create chat messages container
    const chatMessages = document.createElement('div');
    chatMessages.id = 'document-chat-messages';
    chatMessages.style.height = '300px';
    chatMessages.style.overflowY = 'auto';
    chatMessages.style.padding = '10px';
    
    // Add initial message
    const initialMessage = document.createElement('div');
    initialMessage.style.backgroundColor = '#f1f1f1';
    initialMessage.style.padding = '10px';
    initialMessage.style.borderRadius = '10px';
    initialMessage.style.marginBottom = '10px';
    
    const initialMessageText = document.createElement('p');
    initialMessageText.style.margin = '0';
    initialMessageText.textContent = "Hello! I'm your financial assistant. How can I help you today?";
    
    initialMessage.appendChild(initialMessageText);
    chatMessages.appendChild(initialMessage);
    
    // Create chat input container
    const chatInputContainer = document.createElement('div');
    chatInputContainer.style.display = 'flex';
    chatInputContainer.style.padding = '10px';
    chatInputContainer.style.borderTop = '1px solid #ddd';
    
    // Create chat input
    const chatInput = document.createElement('input');
    chatInput.id = 'document-chat-input';
    chatInput.type = 'text';
    chatInput.placeholder = 'Type your question...';
    chatInput.style.flex = '1';
    chatInput.style.padding = '8px';
    chatInput.style.border = '1px solid #ddd';
    chatInput.style.borderRadius = '4px';
    chatInput.style.marginRight = '10px';
    
    // Create send button
    const sendButton = document.createElement('button');
    sendButton.id = 'document-send-btn';
    sendButton.textContent = 'Send';
    sendButton.style.backgroundColor = '#007bff';
    sendButton.style.color = 'white';
    sendButton.style.border = 'none';
    sendButton.style.padding = '8px 15px';
    sendButton.style.borderRadius = '4px';
    sendButton.style.cursor = 'pointer';
    
    // Add event listeners for chat
    sendButton.addEventListener('click', function() {
      ChatComponent.sendChatMessage();
    });
    
    chatInput.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        ChatComponent.sendChatMessage();
      }
    });
    
    // Add elements to chat input container
    chatInputContainer.appendChild(chatInput);
    chatInputContainer.appendChild(sendButton);
    
    // Add elements to chat container
    chatContainer.appendChild(chatHeader);
    chatContainer.appendChild(chatMessages);
    chatContainer.appendChild(chatInputContainer);
    
    // Add chat container to body
    document.body.appendChild(chatContainer);
    console.log('Chat container added to page: ' + window.location.pathname);
  },
  
  toggleChatContainer: function() {
    const chatContainer = document.getElementById('document-chat-container');
    if (chatContainer) {
      chatContainer.style.display = chatContainer.style.display === 'none' ? 'block' : 'none';
    } else {
      console.warn('Chat container not found, creating it now...');
      this.addChatContainer();
      const newChatContainer = document.getElementById('document-chat-container');
      if (newChatContainer) {
        newChatContainer.style.display = 'block';
      }
    }
  },
  
  sendChatMessage: function() {
    const chatInput = document.getElementById('document-chat-input');
    const chatMessages = document.getElementById('document-chat-messages');
    
    if (!chatInput || !chatMessages) {
      console.error('Chat input or messages container not found');
      return;
    }
    
    const message = chatInput.value.trim();
    if (!message) return;
    
    // Add user message
    const userMessage = document.createElement('div');
    userMessage.style.backgroundColor = '#e3f2fd';
    userMessage.style.padding = '10px';
    userMessage.style.borderRadius = '10px';
    userMessage.style.marginBottom = '10px';
    userMessage.style.marginLeft = 'auto';
    userMessage.style.maxWidth = '80%';
    userMessage.style.textAlign = 'right';
    
    const userText = document.createElement('p');
    userText.style.margin = '0';
    userText.textContent = message;
    
    userMessage.appendChild(userText);
    chatMessages.appendChild(userMessage);
    
    // Clear input
    chatInput.value = '';
    
    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    // Simulate AI response
    setTimeout(function() {
      const aiMessage = document.createElement('div');
      aiMessage.style.backgroundColor = '#f1f1f1';
      aiMessage.style.padding = '10px';
      aiMessage.style.borderRadius = '10px';
      aiMessage.style.marginBottom = '10px';
      aiMessage.style.maxWidth = '80%';
      
      const aiText = document.createElement('p');
      aiText.style.margin = '0';
      aiText.textContent = "I'm a mock AI assistant. This is a simulated response to your question: " + message;
      
      aiMessage.appendChild(aiText);
      chatMessages.appendChild(aiMessage);
      
      // Scroll to bottom
      chatMessages.scrollTop = chatMessages.scrollHeight;
    }, 1000);
  }
};

// Make sure to initialize before DOMContentLoaded to ensure early registration
(function() {
  // Add init function to window load events to ensure it runs on every page
  if (window.addEventListener) {
    window.addEventListener('DOMContentLoaded', function() {
      ChatComponent.initialize();
    });
    
    // Also try immediate initialization for pages that might be already loaded
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
      ChatComponent.initialize();
    }
  } else {
    // Fallback for older browsers
    window.onload = function() {
      ChatComponent.initialize();
    };
  }
  
  // Force early initialization attempt
  setTimeout(function() {
    if (!document.getElementById('show-chat-btn')) {
      console.log('Forcing early chat button initialization');
      ChatComponent.initialize();
    }
  }, 100);
  
  // Export to global scope for testing
  window.ChatComponent = ChatComponent;
})();

// Expose initialization function explicitly for external calls
function initChatInterface() {
  console.log('Chat interface initialization called explicitly');
  ChatComponent.initialize();
}

// Add a CSS block to the head to make styles more persistent
(function() {
  const style = document.createElement('style');
  style.innerHTML = `
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
    }
    
    #document-chat-container {
      position: fixed;
      bottom: 80px;
      right: 20px;
      width: 350px;
      height: 400px;
      background-color: white;
      box-shadow: 0 0 10px rgba(0,0,0,0.2);
      border-radius: 10px;
      overflow: hidden;
      z-index: 1000;
    }
    
    #document-chat-messages {
      height: 300px;
      overflow-y: auto;
      padding: 10px;
    }
    
    #document-chat-input {
      flex: 1;
      padding: 8px;
      border: 1px solid #ddd;
      border-radius: 4px;
      margin-right: 10px;
    }
    
    #document-send-btn {
      background-color: #007bff;
      color: white;
      border: none;
      padding: 8px 15px;
      border-radius: 4px;
      cursor: pointer;
    }
  `;
  document.head.appendChild(style);
})();