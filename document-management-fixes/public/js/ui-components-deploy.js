/**
 * FinDoc Analyzer UI Components - Deployment Version
 * This script adds all required UI elements to the page
 */

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  console.log('UI Components initializing...');
  
  // Add process button to upload form if on upload page
  if (window.location.pathname.includes('/upload')) {
    addProcessButton();
  }
  
  // Add chat button to all pages
  addChatButton();
  
  // Add agent cards if on test page
  if (window.location.pathname.includes('/test')) {
    addAgentCards();
  }
  
  console.log('UI Components initialized');
});

/**
 * Add process button to upload form
 */
function addProcessButton() {
  // Check if process button already exists
  if (document.getElementById('process-document-btn')) {
    return;
  }
  
  // Find the form actions div
  const formActions = document.querySelector('.form-actions');
  if (formActions) {
    // Create process button
    const processButton = document.createElement('button');
    processButton.id = 'process-document-btn';
    processButton.className = 'btn btn-primary';
    processButton.textContent = 'Process Document';
    processButton.style.marginLeft = '10px';
    
    // Add click event listener
    processButton.addEventListener('click', function(e) {
      e.preventDefault();
      
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
        if (form) {
          form.appendChild(progressContainer);
        } else {
          document.body.appendChild(progressContainer);
        }
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
  } else {
    console.error('Form actions div not found!');
  }
}

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

/**
 * Add agent cards to page
 */
function addAgentCards() {
  // Check if agent cards already exist
  if (document.querySelector('.agent-card')) {
    return;
  }
  
  // Create container for agent cards
  const agentCardsContainer = document.createElement('div');
  agentCardsContainer.className = 'agent-cards-container';
  agentCardsContainer.style.display = 'flex';
  agentCardsContainer.style.flexWrap = 'wrap';
  agentCardsContainer.style.gap = '20px';
  agentCardsContainer.style.margin = '20px 0';
  
  // Add agent cards
  const agents = [
    {
      name: 'Document Analyzer',
      status: 'active',
      description: 'Analyzes financial documents and extracts key information.'
    },
    {
      name: 'Table Understanding',
      status: 'idle',
      description: 'Extracts and analyzes tables from financial documents.'
    },
    {
      name: 'Securities Extractor',
      status: 'error',
      description: 'Extracts securities information from financial documents.'
    },
    {
      name: 'Financial Reasoner',
      status: 'active',
      description: 'Provides financial reasoning and insights based on the extracted data.'
    },
    {
      name: 'Bloomberg Agent',
      status: 'idle',
      description: 'Fetches real-time financial data from Bloomberg.'
    }
  ];
  
  agents.forEach(agent => {
    const card = document.createElement('div');
    card.className = 'agent-card';
    card.style.width = '300px';
    card.style.border = '1px solid #ddd';
    card.style.borderRadius = '5px';
    card.style.overflow = 'hidden';
    card.style.marginBottom = '20px';
    
    // Card header
    const header = document.createElement('div');
    header.className = 'agent-card-header';
    header.style.backgroundColor = '#f5f5f5';
    header.style.padding = '15px';
    header.style.borderBottom = '1px solid #ddd';
    header.style.display = 'flex';
    header.style.justifyContent = 'space-between';
    header.style.alignItems = 'center';
    
    const title = document.createElement('h3');
    title.style.margin = '0';
    title.style.fontSize = '16px';
    title.textContent = agent.name;
    
    const status = document.createElement('span');
    status.className = 'status-indicator status-' + agent.status;
    status.textContent = agent.status.charAt(0).toUpperCase() + agent.status.slice(1);
    status.style.padding = '5px 10px';
    status.style.borderRadius = '20px';
    status.style.fontSize = '12px';
    status.style.fontWeight = 'bold';
    
    if (agent.status === 'active') {
      status.style.backgroundColor = '#d4edda';
      status.style.color = '#155724';
    } else if (agent.status === 'idle') {
      status.style.backgroundColor = '#fff3cd';
      status.style.color = '#856404';
    } else if (agent.status === 'error') {
      status.style.backgroundColor = '#f8d7da';
      status.style.color = '#721c24';
    }
    
    header.appendChild(title);
    header.appendChild(status);
    
    // Card body
    const body = document.createElement('div');
    body.className = 'agent-card-body';
    body.style.padding = '15px';
    
    const description = document.createElement('p');
    description.textContent = agent.description;
    description.style.marginTop = '0';
    
    body.appendChild(description);
    
    // Card footer
    const footer = document.createElement('div');
    footer.className = 'agent-card-footer';
    footer.style.padding = '15px';
    footer.style.borderTop = '1px solid #ddd';
    footer.style.display = 'flex';
    footer.style.justifyContent = 'space-between';
    
    const configureBtn = document.createElement('button');
    configureBtn.className = 'agent-action btn-primary';
    configureBtn.textContent = 'Configure';
    configureBtn.style.backgroundColor = '#007bff';
    configureBtn.style.color = 'white';
    configureBtn.style.border = 'none';
    configureBtn.style.padding = '5px 10px';
    configureBtn.style.borderRadius = '3px';
    configureBtn.style.cursor = 'pointer';
    
    const viewLogsBtn = document.createElement('button');
    viewLogsBtn.className = 'agent-action btn-secondary';
    viewLogsBtn.textContent = 'View Logs';
    viewLogsBtn.style.backgroundColor = '#6c757d';
    viewLogsBtn.style.color = 'white';
    viewLogsBtn.style.border = 'none';
    viewLogsBtn.style.padding = '5px 10px';
    viewLogsBtn.style.borderRadius = '3px';
    viewLogsBtn.style.cursor = 'pointer';
    
    const resetBtn = document.createElement('button');
    resetBtn.className = 'agent-action btn-danger';
    resetBtn.textContent = 'Reset';
    resetBtn.style.backgroundColor = '#dc3545';
    resetBtn.style.color = 'white';
    resetBtn.style.border = 'none';
    resetBtn.style.padding = '5px 10px';
    resetBtn.style.borderRadius = '3px';
    resetBtn.style.cursor = 'pointer';
    
    // Add event listeners
    configureBtn.addEventListener('click', function() {
      alert('Configure ' + agent.name);
    });
    
    viewLogsBtn.addEventListener('click', function() {
      alert('View logs for ' + agent.name);
    });
    
    resetBtn.addEventListener('click', function() {
      alert('Reset ' + agent.name);
    });
    
    footer.appendChild(configureBtn);
    footer.appendChild(viewLogsBtn);
    footer.appendChild(resetBtn);
    
    // Assemble card
    card.appendChild(header);
    card.appendChild(body);
    card.appendChild(footer);
    
    agentCardsContainer.appendChild(card);
  });
  
  // Find a good place to insert the agent cards
  const main = document.querySelector('main') || document.querySelector('.main-content') || document.body;
  main.appendChild(agentCardsContainer);
  
  console.log('Agent cards added successfully!');
}
