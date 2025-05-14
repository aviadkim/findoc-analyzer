/**
 * FinDoc Analyzer UI Components
 */
document.addEventListener('DOMContentLoaded', function() {
  console.log('UI Components initializing...');
  
  // Add process button to upload form if on upload page
  if (window.location.pathname.includes('/upload')) {
    addProcessButtonToUploadForm();
  }
  
  // Add chat button
  addChatButton();
  
  console.log('UI Components initialized');
});

function addProcessButtonToUploadForm() {
  console.log('Adding process button to upload form...');
  
  // Find the form actions div
  const formActions = document.querySelector('.form-actions');
  if (formActions) {
    // Check if process button already exists
    if (!document.getElementById('process-document-btn')) {
      // Create process button
      const processButton = document.createElement('button');
      processButton.id = 'process-document-btn';
      processButton.className = 'btn btn-primary';
      processButton.textContent = 'Process Document';
      processButton.style.marginLeft = '10px';
      
      // Add click event listener
      processButton.addEventListener('click', function(e) {
        e.preventDefault();
        
        console.log('Process button clicked');
        
        // Show progress container
        let progressContainer = document.getElementById('progress-container');
        if (!progressContainer) {
          // Create progress container
          progressContainer = document.createElement('div');
          progressContainer.id = 'progress-container';
          progressContainer.style.marginTop = '20px';
          
          // Create progress bar container
          const progressBarContainer = document.createElement('div');
          progressBarContainer.style.backgroundColor = '#f1f1f1';
          progressBarContainer.style.borderRadius = '5px';
          progressBarContainer.style.height = '20px';
          
          // Create progress bar
          const progressBar = document.createElement('div');
          progressBar.id = 'progress-bar';
          progressBar.style.width = '0%';
          progressBar.style.height = '100%';
          progressBar.style.backgroundColor = '#4CAF50';
          progressBar.style.borderRadius = '5px';
          progressBar.style.transition = 'width 0.5s';
          
          progressBarContainer.appendChild(progressBar);
          
          // Create status text
          const statusText = document.createElement('div');
          statusText.id = 'upload-status';
          statusText.style.marginTop = '10px';
          statusText.textContent = 'Processing document...';
          
          // Add elements to progress container
          progressContainer.appendChild(progressBarContainer);
          progressContainer.appendChild(statusText);
          
          // Add progress container to form
          const form = document.querySelector('form');
          form.appendChild(progressContainer);
        } else {
          progressContainer.style.display = 'block';
        }
        
        // Simulate processing
        let progress = 0;
        const progressBar = document.getElementById('progress-bar');
        const statusText = document.getElementById('upload-status');
        
        const interval = setInterval(function() {
          progress += 5;
          progressBar.style.width = progress + '%';
          
          if (progress >= 100) {
            clearInterval(interval);
            statusText.textContent = 'Processing complete!';
            
            // Redirect to document details page
            setTimeout(function() {
              alert('Processing complete! Redirecting to document details page...');
              window.location.href = '/document-details.html';
            }, 1000);
          } else {
            statusText.textContent = 'Processing document... ' + progress + '%';
          }
        }, 200);
      });
      
      // Add process button after upload button
      const uploadButton = formActions.querySelector('button.btn-primary');
      if (uploadButton) {
        uploadButton.parentNode.insertBefore(processButton, uploadButton.nextSibling);
      } else {
        formActions.appendChild(processButton);
      }
      
      console.log('Process button added successfully!');
    }
  } else {
    console.error('Form actions div not found!');
  }
}

function addChatButton() {
  // Add chat button if not already present
  if (!document.getElementById('show-chat-btn')) {
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
        sendButton.addEventListener('click', function() {
          sendChatMessage();
        });
        
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
}

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
