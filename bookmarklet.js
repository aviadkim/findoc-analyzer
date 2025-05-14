javascript:(function() {
  // Create chat button
  function createChatButton() {
    console.log('Creating chat button...');
    
    // Check if chat button already exists
    if (document.getElementById('chat-button')) {
      console.log('Chat button already exists');
      return;
    }
    
    // Create chat button
    const chatButton = document.createElement('button');
    chatButton.id = 'chat-button';
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
    
    // Add click event listener
    chatButton.addEventListener('click', function() {
      toggleChatContainer();
    });
    
    // Add to body
    document.body.appendChild(chatButton);
    console.log('Chat button created');
  }

  // Create chat container
  function createChatContainer() {
    console.log('Creating chat container...');
    
    // Check if chat container already exists
    if (document.getElementById('chat-container')) {
      console.log('Chat container already exists');
      return;
    }
    
    // Create chat container
    const chatContainer = document.createElement('div');
    chatContainer.id = 'chat-container';
    chatContainer.style.position = 'fixed';
    chatContainer.style.bottom = '80px';
    chatContainer.style.right = '20px';
    chatContainer.style.width = '300px';
    chatContainer.style.height = '400px';
    chatContainer.style.backgroundColor = 'white';
    chatContainer.style.border = '1px solid #ccc';
    chatContainer.style.borderRadius = '5px';
    chatContainer.style.display = 'none';
    chatContainer.style.flexDirection = 'column';
    chatContainer.style.zIndex = '998';
    
    // Create chat header
    const chatHeader = document.createElement('div');
    chatHeader.style.padding = '10px';
    chatHeader.style.backgroundColor = '#007bff';
    chatHeader.style.color = 'white';
    chatHeader.style.borderTopLeftRadius = '5px';
    chatHeader.style.borderTopRightRadius = '5px';
    chatHeader.style.display = 'flex';
    chatHeader.style.justifyContent = 'space-between';
    chatHeader.style.alignItems = 'center';
    
    // Create chat title
    const chatTitle = document.createElement('span');
    chatTitle.textContent = 'Document Chat';
    
    // Create close button
    const closeButton = document.createElement('button');
    closeButton.textContent = 'X';
    closeButton.style.backgroundColor = 'transparent';
    closeButton.style.border = 'none';
    closeButton.style.color = 'white';
    closeButton.style.cursor = 'pointer';
    closeButton.addEventListener('click', function() {
      toggleChatContainer();
    });
    
    // Add title and close button to header
    chatHeader.appendChild(chatTitle);
    chatHeader.appendChild(closeButton);
    
    // Create chat messages container
    const chatMessages = document.createElement('div');
    chatMessages.id = 'chat-messages';
    chatMessages.style.flex = '1';
    chatMessages.style.padding = '10px';
    chatMessages.style.overflowY = 'auto';
    
    // Create chat input container
    const chatInputContainer = document.createElement('div');
    chatInputContainer.style.padding = '10px';
    chatInputContainer.style.borderTop = '1px solid #ccc';
    chatInputContainer.style.display = 'flex';
    
    // Create chat input
    const chatInput = document.createElement('input');
    chatInput.id = 'chat-input';
    chatInput.type = 'text';
    chatInput.placeholder = 'Type your message...';
    chatInput.style.flex = '1';
    chatInput.style.padding = '5px';
    chatInput.style.border = '1px solid #ccc';
    chatInput.style.borderRadius = '3px';
    
    // Create send button
    const sendButton = document.createElement('button');
    sendButton.textContent = 'Send';
    sendButton.style.marginLeft = '5px';
    sendButton.style.backgroundColor = '#007bff';
    sendButton.style.color = 'white';
    sendButton.style.border = 'none';
    sendButton.style.padding = '5px 10px';
    sendButton.style.borderRadius = '3px';
    sendButton.style.cursor = 'pointer';
    
    // Add click event listener to send button
    sendButton.addEventListener('click', function() {
      sendMessage();
    });
    
    // Add keypress event listener to input
    chatInput.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        sendMessage();
      }
    });
    
    // Add input and send button to input container
    chatInputContainer.appendChild(chatInput);
    chatInputContainer.appendChild(sendButton);
    
    // Add header, messages, and input container to chat container
    chatContainer.appendChild(chatHeader);
    chatContainer.appendChild(chatMessages);
    chatContainer.appendChild(chatInputContainer);
    
    // Add to body
    document.body.appendChild(chatContainer);
    console.log('Chat container created');
  }

  // Toggle chat container
  function toggleChatContainer() {
    const chatContainer = document.getElementById('chat-container');
    if (chatContainer) {
      if (chatContainer.style.display === 'none') {
        chatContainer.style.display = 'flex';
      } else {
        chatContainer.style.display = 'none';
      }
    }
  }

  // Send message
  function sendMessage() {
    const chatInput = document.getElementById('chat-input');
    const chatMessages = document.getElementById('chat-messages');
    
    if (chatInput && chatMessages && chatInput.value.trim() !== '') {
      // Create user message
      const userMessage = document.createElement('div');
      userMessage.style.marginBottom = '10px';
      userMessage.style.textAlign = 'right';
      
      const userMessageText = document.createElement('span');
      userMessageText.textContent = chatInput.value;
      userMessageText.style.backgroundColor = '#007bff';
      userMessageText.style.color = 'white';
      userMessageText.style.padding = '5px 10px';
      userMessageText.style.borderRadius = '5px';
      userMessageText.style.display = 'inline-block';
      
      userMessage.appendChild(userMessageText);
      chatMessages.appendChild(userMessage);
      
      // Clear input
      const message = chatInput.value;
      chatInput.value = '';
      
      // Create bot message
      setTimeout(function() {
        const botMessage = document.createElement('div');
        botMessage.style.marginBottom = '10px';
        botMessage.style.textAlign = 'left';
        
        const botMessageText = document.createElement('span');
        botMessageText.textContent = `You asked: "${message}". This is a demo response.`;
        botMessageText.style.backgroundColor = '#f1f1f1';
        botMessageText.style.color = 'black';
        botMessageText.style.padding = '5px 10px';
        botMessageText.style.borderRadius = '5px';
        botMessageText.style.display = 'inline-block';
        
        botMessage.appendChild(botMessageText);
        chatMessages.appendChild(botMessage);
        
        // Scroll to bottom
        chatMessages.scrollTop = chatMessages.scrollHeight;
      }, 500);
      
      // Scroll to bottom
      chatMessages.scrollTop = chatMessages.scrollHeight;
    }
  }

  // Create process button
  function createProcessButton() {
    console.log('Creating process button...');
    
    // Check if process button already exists
    if (document.getElementById('process-button')) {
      console.log('Process button already exists');
      return;
    }
    
    // Create process button
    const processButton = document.createElement('button');
    processButton.id = 'process-button';
    processButton.textContent = 'Process Document';
    processButton.style.backgroundColor = '#28a745';
    processButton.style.color = 'white';
    processButton.style.border = 'none';
    processButton.style.padding = '10px 20px';
    processButton.style.borderRadius = '5px';
    processButton.style.cursor = 'pointer';
    processButton.style.margin = '10px';
    
    // Add click event listener
    processButton.addEventListener('click', function() {
      alert('Process button clicked! This is a demo.');
    });
    
    // Find a good place to add the button
    const mainContent = document.querySelector('main') || document.querySelector('.main-content') || document.body;
    mainContent.prepend(processButton);
    console.log('Process button created');
  }

  // Initialize UI components
  function initializeUIComponents() {
    console.log('Initializing UI components...');
    createChatButton();
    createChatContainer();
    createProcessButton();
    console.log('UI components initialized');
  }

  // Initialize UI components
  initializeUIComponents();
  
  // Show success message
  alert('UI components added successfully!');
})();
