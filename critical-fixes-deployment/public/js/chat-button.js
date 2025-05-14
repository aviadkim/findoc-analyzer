/**
 * Chat Button Component
 * Adds a chat button to the page
 */

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  console.log('Chat Button Component initializing...');
  
  // Add chat button to all pages
  addChatButton();
  
  console.log('Chat Button Component initialized');
});

/**
 * Add chat button to page
 */
function addChatButton() {
  // Check if chat button already exists
  if (document.getElementById('show-chat-btn')) {
    return;
  }
  
  // Create chat button
  const chatButton = document.createElement('button');
  chatButton.id = 'show-chat-btn';
  chatButton.textContent = 'Chat';
  chatButton.style.position = 'fixed';
  chatButton.style.bottom = '20px';
  chatButton.style.right = '20px';
  chatButton.style.backgroundColor = '#007bff';
  chatButton.style.color = 'white';
  chatButton.style.border = 'none';
  chatButton.style.padding = '10px 20px';
  chatButton.style.borderRadius = '5px';
  chatButton.style.cursor = 'pointer';
  chatButton.style.zIndex = '999';
  
  chatButton.addEventListener('click', function() {
    let chatContainer = document.getElementById('document-chat-container');
    
    if (!chatContainer) {
      // Create chat container
      chatContainer = document.createElement('div');
      chatContainer.id = 'document-chat-container';
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
      sendButton.addEventListener('click', sendChatMessage);
      
      chatInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
          sendChatMessage();
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
    } else {
      chatContainer.style.display = 'block';
    }
  });
  
  document.body.appendChild(chatButton);
  console.log('Chat button added successfully!');
}

/**
 * Send chat message
 */
function sendChatMessage() {
  const chatInput = document.getElementById('document-chat-input');
  const chatMessages = document.getElementById('document-chat-messages');
  const message = chatInput.value.trim();
  
  if (!message) {
    return;
  }
  
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
