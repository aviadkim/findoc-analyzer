/**
 * Simple UI Components for FinDoc Analyzer
 * This file contains simple UI components that can be injected into the HTML
 */

console.log('Simple UI Components loaded');

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

// Create document chat components
function createDocumentChatComponents() {
  console.log('Creating document chat components...');

  // Check if we're on the document chat page
  if (window.location.pathname.includes('document-chat') || window.location.pathname.includes('chat')) {
    // Create document selector
    const documentSelector = document.createElement('select');
    documentSelector.id = 'document-select';
    documentSelector.style.margin = '10px';
    documentSelector.style.padding = '5px';
    documentSelector.style.borderRadius = '3px';
    documentSelector.style.border = '1px solid #ccc';

    // Add default option
    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = 'Select a document';
    documentSelector.appendChild(defaultOption);

    // Add sample documents
    const documents = [
      { id: 'doc-1', name: 'Financial Report 2023.pdf' },
      { id: 'doc-2', name: 'Investment Portfolio.pdf' },
      { id: 'doc-3', name: 'Tax Documents 2023.pdf' }
    ];

    documents.forEach(doc => {
      const option = document.createElement('option');
      option.value = doc.id;
      option.textContent = doc.name;
      documentSelector.appendChild(option);
    });

    // Create document chat container
    const documentChatContainer = document.createElement('div');
    documentChatContainer.id = 'document-chat-container';
    documentChatContainer.style.display = 'flex';
    documentChatContainer.style.flexDirection = 'column';
    documentChatContainer.style.height = '400px';
    documentChatContainer.style.border = '1px solid #ccc';
    documentChatContainer.style.borderRadius = '5px';
    documentChatContainer.style.margin = '10px';

    // Create document chat messages
    const documentChatMessages = document.createElement('div');
    documentChatMessages.id = 'document-chat-messages';
    documentChatMessages.style.flex = '1';
    documentChatMessages.style.padding = '10px';
    documentChatMessages.style.overflowY = 'auto';
    documentChatMessages.style.backgroundColor = '#f9f9f9';

    // Create document chat input container
    const documentChatInputContainer = document.createElement('div');
    documentChatInputContainer.style.display = 'flex';
    documentChatInputContainer.style.padding = '10px';
    documentChatInputContainer.style.borderTop = '1px solid #ccc';

    // Create document chat input
    const documentChatInput = document.createElement('input');
    documentChatInput.id = 'document-chat-input';
    documentChatInput.type = 'text';
    documentChatInput.placeholder = 'Ask a question about the document...';
    documentChatInput.style.flex = '1';
    documentChatInput.style.padding = '5px';
    documentChatInput.style.border = '1px solid #ccc';
    documentChatInput.style.borderRadius = '3px';

    // Create document chat send button
    const documentChatSendButton = document.createElement('button');
    documentChatSendButton.id = 'document-send-btn';
    documentChatSendButton.textContent = 'Send';
    documentChatSendButton.style.marginLeft = '5px';
    documentChatSendButton.style.backgroundColor = '#007bff';
    documentChatSendButton.style.color = 'white';
    documentChatSendButton.style.border = 'none';
    documentChatSendButton.style.padding = '5px 10px';
    documentChatSendButton.style.borderRadius = '3px';
    documentChatSendButton.style.cursor = 'pointer';

    // Add event listeners
    documentChatSendButton.addEventListener('click', sendDocumentChatMessage);
    documentChatInput.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        sendDocumentChatMessage();
      }
    });

    // Add elements to the page
    documentChatInputContainer.appendChild(documentChatInput);
    documentChatInputContainer.appendChild(documentChatSendButton);

    documentChatContainer.appendChild(documentChatMessages);
    documentChatContainer.appendChild(documentChatInputContainer);

    // Find a good place to add the components
    const mainContent = document.querySelector('main') || document.querySelector('.main-content') || document.body;
    mainContent.prepend(documentChatContainer);
    mainContent.prepend(documentSelector);

    console.log('Document chat components created');
  }
}

// Send document chat message
function sendDocumentChatMessage() {
  const documentChatInput = document.getElementById('document-chat-input');
  const documentChatMessages = document.getElementById('document-chat-messages');
  const documentSelector = document.getElementById('document-select');

  if (documentChatInput && documentChatMessages && documentChatInput.value.trim() !== '') {
    // Check if a document is selected
    if (documentSelector && documentSelector.value === '') {
      alert('Please select a document first');
      return;
    }

    // Create user message
    const userMessage = document.createElement('div');
    userMessage.style.marginBottom = '10px';
    userMessage.style.textAlign = 'right';

    const userMessageText = document.createElement('span');
    userMessageText.textContent = documentChatInput.value;
    userMessageText.style.backgroundColor = '#007bff';
    userMessageText.style.color = 'white';
    userMessageText.style.padding = '5px 10px';
    userMessageText.style.borderRadius = '5px';
    userMessageText.style.display = 'inline-block';

    userMessage.appendChild(userMessageText);
    documentChatMessages.appendChild(userMessage);

    // Clear input
    const message = documentChatInput.value;
    documentChatInput.value = '';

    // Create bot message
    setTimeout(function() {
      const botMessage = document.createElement('div');
      botMessage.style.marginBottom = '10px';
      botMessage.style.textAlign = 'left';

      const botMessageText = document.createElement('span');

      // Generate a response based on the question
      let response = 'I don\'t know the answer to that question.';

      if (message.toLowerCase().includes('revenue')) {
        response = 'The total revenue is $10,500,000.';
      } else if (message.toLowerCase().includes('profit')) {
        response = 'The net profit is $3,300,000 with a profit margin of 31.4%.';
      } else if (message.toLowerCase().includes('asset')) {
        response = 'The total assets are $25,000,000.';
      } else if (message.toLowerCase().includes('liabilit')) {
        response = 'The total liabilities are $12,000,000.';
      } else if (message.toLowerCase().includes('equity')) {
        response = 'The shareholders\' equity is $13,000,000.';
      } else if (message.toLowerCase().includes('apple') || message.toLowerCase().includes('microsoft') || message.toLowerCase().includes('amazon') || message.toLowerCase().includes('tesla') || message.toLowerCase().includes('google')) {
        response = 'The investment portfolio includes holdings in Apple Inc., Microsoft, Amazon, Tesla, and Google. Would you like specific details about any of these securities?';
      }

      botMessageText.textContent = response;
      botMessageText.style.backgroundColor = '#f1f1f1';
      botMessageText.style.color = 'black';
      botMessageText.style.padding = '5px 10px';
      botMessageText.style.borderRadius = '5px';
      botMessageText.style.display = 'inline-block';

      botMessage.appendChild(botMessageText);
      documentChatMessages.appendChild(botMessage);

      // Scroll to bottom
      documentChatMessages.scrollTop = documentChatMessages.scrollHeight;
    }, 500);

    // Scroll to bottom
    documentChatMessages.scrollTop = documentChatMessages.scrollHeight;
  }
}

// Create document processing components
function createDocumentProcessingComponents() {
  console.log('Creating document processing components...');

  // Check if we're on the document detail page
  if (window.location.pathname.includes('document-details')) {
    // Create process document button
    const processDocumentButton = document.createElement('button');
    processDocumentButton.id = 'process-document-btn';
    processDocumentButton.textContent = 'Process Document';
    processDocumentButton.style.backgroundColor = '#28a745';
    processDocumentButton.style.color = 'white';
    processDocumentButton.style.border = 'none';
    processDocumentButton.style.padding = '10px 20px';
    processDocumentButton.style.borderRadius = '5px';
    processDocumentButton.style.cursor = 'pointer';
    processDocumentButton.style.margin = '10px';

    // Create reprocess document button
    const reprocessDocumentButton = document.createElement('button');
    reprocessDocumentButton.id = 'reprocess-document-btn';
    reprocessDocumentButton.textContent = 'Reprocess Document';
    reprocessDocumentButton.style.backgroundColor = '#ffc107';
    reprocessDocumentButton.style.color = 'black';
    reprocessDocumentButton.style.border = 'none';
    reprocessDocumentButton.style.padding = '10px 20px';
    reprocessDocumentButton.style.borderRadius = '5px';
    reprocessDocumentButton.style.cursor = 'pointer';
    reprocessDocumentButton.style.margin = '10px';

    // Create download document button
    const downloadDocumentButton = document.createElement('button');
    downloadDocumentButton.id = 'download-document-btn';
    downloadDocumentButton.textContent = 'Download Document';
    downloadDocumentButton.style.backgroundColor = '#17a2b8';
    downloadDocumentButton.style.color = 'white';
    downloadDocumentButton.style.border = 'none';
    downloadDocumentButton.style.padding = '10px 20px';
    downloadDocumentButton.style.borderRadius = '5px';
    downloadDocumentButton.style.cursor = 'pointer';
    downloadDocumentButton.style.margin = '10px';

    // Create processing status indicator
    const processingStatusIndicator = document.createElement('div');
    processingStatusIndicator.id = 'processing-status';
    processingStatusIndicator.textContent = 'Processing Status: Complete';
    processingStatusIndicator.style.margin = '10px';
    processingStatusIndicator.style.padding = '10px';
    processingStatusIndicator.style.backgroundColor = '#e9ecef';
    processingStatusIndicator.style.borderRadius = '5px';

    // Create processing progress bar container
    const processingProgressBarContainer = document.createElement('div');
    processingProgressBarContainer.style.margin = '10px';
    processingProgressBarContainer.style.backgroundColor = '#e9ecef';
    processingProgressBarContainer.style.borderRadius = '5px';
    processingProgressBarContainer.style.overflow = 'hidden';

    // Create processing progress bar
    const processingProgressBar = document.createElement('div');
    processingProgressBar.id = 'processing-progress-bar';
    processingProgressBar.style.width = '100%';
    processingProgressBar.style.height = '20px';
    processingProgressBar.style.backgroundColor = '#28a745';

    // Add progress bar to container
    processingProgressBarContainer.appendChild(processingProgressBar);

    // Add event listeners
    processDocumentButton.addEventListener('click', function() {
      alert('Processing document...');
      processingStatusIndicator.textContent = 'Processing Status: In Progress';
      processingProgressBar.style.width = '0%';

      // Simulate processing
      let progress = 0;
      const interval = setInterval(function() {
        progress += 10;
        processingProgressBar.style.width = progress + '%';

        if (progress >= 100) {
          clearInterval(interval);
          processingStatusIndicator.textContent = 'Processing Status: Complete';
        }
      }, 500);
    });

    reprocessDocumentButton.addEventListener('click', function() {
      alert('Reprocessing document...');
      processingStatusIndicator.textContent = 'Processing Status: In Progress';
      processingProgressBar.style.width = '0%';

      // Simulate processing
      let progress = 0;
      const interval = setInterval(function() {
        progress += 10;
        processingProgressBar.style.width = progress + '%';

        if (progress >= 100) {
          clearInterval(interval);
          processingStatusIndicator.textContent = 'Processing Status: Complete';
        }
      }, 500);
    });

    downloadDocumentButton.addEventListener('click', function() {
      alert('Downloading document...');
    });

    // Find a good place to add the components
    const mainContent = document.querySelector('main') || document.querySelector('.main-content') || document.body;
    mainContent.prepend(processingProgressBarContainer);
    mainContent.prepend(processingStatusIndicator);
    mainContent.prepend(downloadDocumentButton);
    mainContent.prepend(reprocessDocumentButton);
    mainContent.prepend(processDocumentButton);

    console.log('Document processing components created');
  }
}

// Create authentication components
function createAuthComponents() {
  console.log('Creating authentication components...');

  // Check if we're on the login page
  if (window.location.pathname.includes('login')) {
    // Create login form
    const loginForm = document.createElement('form');
    loginForm.id = 'login-form';
    loginForm.style.margin = '20px auto';
    loginForm.style.maxWidth = '400px';
    loginForm.style.padding = '20px';
    loginForm.style.backgroundColor = '#f9f9f9';
    loginForm.style.borderRadius = '5px';
    loginForm.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.1)';

    // Create email input
    const emailInput = document.createElement('input');
    emailInput.type = 'email';
    emailInput.placeholder = 'Email';
    emailInput.style.width = '100%';
    emailInput.style.padding = '10px';
    emailInput.style.marginBottom = '10px';
    emailInput.style.borderRadius = '3px';
    emailInput.style.border = '1px solid #ccc';

    // Create password input
    const passwordInput = document.createElement('input');
    passwordInput.type = 'password';
    passwordInput.placeholder = 'Password';
    passwordInput.style.width = '100%';
    passwordInput.style.padding = '10px';
    passwordInput.style.marginBottom = '10px';
    passwordInput.style.borderRadius = '3px';
    passwordInput.style.border = '1px solid #ccc';

    // Create login button
    const loginButton = document.createElement('button');
    loginButton.type = 'submit';
    loginButton.textContent = 'Login';
    loginButton.style.width = '100%';
    loginButton.style.padding = '10px';
    loginButton.style.backgroundColor = '#007bff';
    loginButton.style.color = 'white';
    loginButton.style.border = 'none';
    loginButton.style.borderRadius = '3px';
    loginButton.style.cursor = 'pointer';
    loginButton.style.marginBottom = '10px';

    // Create Google login button
    const googleLoginButton = document.createElement('button');
    googleLoginButton.id = 'google-login-btn';
    googleLoginButton.type = 'button';
    googleLoginButton.textContent = 'Login with Google';
    googleLoginButton.style.width = '100%';
    googleLoginButton.style.padding = '10px';
    googleLoginButton.style.backgroundColor = '#db4437';
    googleLoginButton.style.color = 'white';
    googleLoginButton.style.border = 'none';
    googleLoginButton.style.borderRadius = '3px';
    googleLoginButton.style.cursor = 'pointer';
    googleLoginButton.style.marginBottom = '10px';

    // Create auth error display
    const authError = document.createElement('div');
    authError.id = 'auth-error';
    authError.style.color = 'red';
    authError.style.marginTop = '10px';
    authError.style.display = 'none';

    // Add event listeners
    loginForm.addEventListener('submit', function(e) {
      e.preventDefault();
      alert('Login functionality is not implemented in this demo');
    });

    googleLoginButton.addEventListener('click', function() {
      alert('Google login functionality is not implemented in this demo');
    });

    // Add elements to the form
    loginForm.appendChild(emailInput);
    loginForm.appendChild(passwordInput);
    loginForm.appendChild(loginButton);
    loginForm.appendChild(googleLoginButton);
    loginForm.appendChild(authError);

    // Find a good place to add the form
    const mainContent = document.querySelector('main') || document.querySelector('.main-content') || document.body;
    mainContent.prepend(loginForm);

    console.log('Login form created');
  }

  // Check if we're on the signup page
  if (window.location.pathname.includes('signup')) {
    // Create register form
    const registerForm = document.createElement('form');
    registerForm.id = 'register-form';
    registerForm.style.margin = '20px auto';
    registerForm.style.maxWidth = '400px';
    registerForm.style.padding = '20px';
    registerForm.style.backgroundColor = '#f9f9f9';
    registerForm.style.borderRadius = '5px';
    registerForm.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.1)';

    // Create name input
    const nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.placeholder = 'Name';
    nameInput.style.width = '100%';
    nameInput.style.padding = '10px';
    nameInput.style.marginBottom = '10px';
    nameInput.style.borderRadius = '3px';
    nameInput.style.border = '1px solid #ccc';

    // Create email input
    const emailInput = document.createElement('input');
    emailInput.type = 'email';
    emailInput.placeholder = 'Email';
    emailInput.style.width = '100%';
    emailInput.style.padding = '10px';
    emailInput.style.marginBottom = '10px';
    emailInput.style.borderRadius = '3px';
    emailInput.style.border = '1px solid #ccc';

    // Create password input
    const passwordInput = document.createElement('input');
    passwordInput.type = 'password';
    passwordInput.placeholder = 'Password';
    passwordInput.style.width = '100%';
    passwordInput.style.padding = '10px';
    passwordInput.style.marginBottom = '10px';
    passwordInput.style.borderRadius = '3px';
    passwordInput.style.border = '1px solid #ccc';

    // Create register button
    const registerButton = document.createElement('button');
    registerButton.type = 'submit';
    registerButton.textContent = 'Register';
    registerButton.style.width = '100%';
    registerButton.style.padding = '10px';
    registerButton.style.backgroundColor = '#28a745';
    registerButton.style.color = 'white';
    registerButton.style.border = 'none';
    registerButton.style.borderRadius = '3px';
    registerButton.style.cursor = 'pointer';
    registerButton.style.marginBottom = '10px';

    // Create Google login button
    const googleLoginButton = document.createElement('button');
    googleLoginButton.id = 'google-login-btn';
    googleLoginButton.type = 'button';
    googleLoginButton.textContent = 'Register with Google';
    googleLoginButton.style.width = '100%';
    googleLoginButton.style.padding = '10px';
    googleLoginButton.style.backgroundColor = '#db4437';
    googleLoginButton.style.color = 'white';
    googleLoginButton.style.border = 'none';
    googleLoginButton.style.borderRadius = '3px';
    googleLoginButton.style.cursor = 'pointer';
    googleLoginButton.style.marginBottom = '10px';

    // Create auth error display
    const authError = document.createElement('div');
    authError.id = 'auth-error';
    authError.style.color = 'red';
    authError.style.marginTop = '10px';
    authError.style.display = 'none';

    // Add event listeners
    registerForm.addEventListener('submit', function(e) {
      e.preventDefault();
      alert('Registration functionality is not implemented in this demo');
    });

    googleLoginButton.addEventListener('click', function() {
      alert('Google registration functionality is not implemented in this demo');
    });

    // Add elements to the form
    registerForm.appendChild(nameInput);
    registerForm.appendChild(emailInput);
    registerForm.appendChild(passwordInput);
    registerForm.appendChild(registerButton);
    registerForm.appendChild(googleLoginButton);
    registerForm.appendChild(authError);

    // Find a good place to add the form
    const mainContent = document.querySelector('main') || document.querySelector('.main-content') || document.body;
    mainContent.prepend(registerForm);

    console.log('Register form created');
  }
}

// Create agent components
function createAgentComponents() {
  console.log('Creating agent components...');

  // Check if we're on the test page
  if (window.location.pathname.includes('test')) {
    // Create agent cards container
    const agentCardsContainer = document.createElement('div');
    agentCardsContainer.style.display = 'flex';
    agentCardsContainer.style.flexWrap = 'wrap';
    agentCardsContainer.style.gap = '20px';
    agentCardsContainer.style.margin = '20px';

    // Create agent cards
    const agents = [
      { name: 'Document Analyzer', status: 'active' },
      { name: 'Table Understanding', status: 'active' },
      { name: 'Securities Extractor', status: 'active' },
      { name: 'Financial Reasoner', status: 'active' },
      { name: 'Bloomberg Agent', status: 'active' }
    ];

    agents.forEach(agent => {
      // Create agent card
      const agentCard = document.createElement('div');
      agentCard.className = 'agent-card';
      agentCard.style.width = '300px';
      agentCard.style.padding = '20px';
      agentCard.style.backgroundColor = '#f9f9f9';
      agentCard.style.borderRadius = '5px';
      agentCard.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.1)';

      // Create agent name
      const agentName = document.createElement('h3');
      agentName.textContent = agent.name;
      agentName.style.marginTop = '0';

      // Create agent status indicator
      const statusIndicator = document.createElement('div');
      statusIndicator.className = 'status-indicator';
      statusIndicator.style.display = 'inline-block';
      statusIndicator.style.width = '10px';
      statusIndicator.style.height = '10px';
      statusIndicator.style.borderRadius = '50%';
      statusIndicator.style.backgroundColor = agent.status === 'active' ? '#28a745' : '#dc3545';
      statusIndicator.style.marginRight = '5px';

      // Create agent status text
      const statusText = document.createElement('span');
      statusText.textContent = agent.status === 'active' ? 'Active' : 'Inactive';

      // Create agent status container
      const statusContainer = document.createElement('div');
      statusContainer.style.marginBottom = '10px';
      statusContainer.appendChild(statusIndicator);
      statusContainer.appendChild(statusText);

      // Create agent action buttons container
      const actionButtonsContainer = document.createElement('div');
      actionButtonsContainer.style.display = 'flex';
      actionButtonsContainer.style.gap = '10px';

      // Create configure button
      const configureButton = document.createElement('button');
      configureButton.className = 'agent-action';
      configureButton.textContent = 'Configure';
      configureButton.style.padding = '5px 10px';
      configureButton.style.backgroundColor = '#007bff';
      configureButton.style.color = 'white';
      configureButton.style.border = 'none';
      configureButton.style.borderRadius = '3px';
      configureButton.style.cursor = 'pointer';

      // Create view logs button
      const viewLogsButton = document.createElement('button');
      viewLogsButton.className = 'agent-action';
      viewLogsButton.textContent = 'View Logs';
      viewLogsButton.style.padding = '5px 10px';
      viewLogsButton.style.backgroundColor = '#17a2b8';
      viewLogsButton.style.color = 'white';
      viewLogsButton.style.border = 'none';
      viewLogsButton.style.borderRadius = '3px';
      viewLogsButton.style.cursor = 'pointer';

      // Create reset button
      const resetButton = document.createElement('button');
      resetButton.className = 'agent-action';
      resetButton.textContent = 'Reset';
      resetButton.style.padding = '5px 10px';
      resetButton.style.backgroundColor = '#dc3545';
      resetButton.style.color = 'white';
      resetButton.style.border = 'none';
      resetButton.style.borderRadius = '3px';
      resetButton.style.cursor = 'pointer';

      // Add event listeners
      configureButton.addEventListener('click', function() {
        alert(`Configure ${agent.name}`);
      });

      viewLogsButton.addEventListener('click', function() {
        alert(`View logs for ${agent.name}`);
      });

      resetButton.addEventListener('click', function() {
        alert(`Reset ${agent.name}`);
      });

      // Add buttons to container
      actionButtonsContainer.appendChild(configureButton);
      actionButtonsContainer.appendChild(viewLogsButton);
      actionButtonsContainer.appendChild(resetButton);

      // Add elements to card
      agentCard.appendChild(agentName);
      agentCard.appendChild(statusContainer);
      agentCard.appendChild(actionButtonsContainer);

      // Add card to container
      agentCardsContainer.appendChild(agentCard);
    });

    // Find a good place to add the container
    const mainContent = document.querySelector('main') || document.querySelector('.main-content') || document.body;
    mainContent.prepend(agentCardsContainer);

    console.log('Agent components created');
  }
}

// Initialize UI components
function initializeUIComponents() {
  console.log('Initializing UI components...');

  // Create basic UI components
  createChatButton();
  createChatContainer();
  createProcessButton();

  // Create page-specific components
  createDocumentChatComponents();
  createDocumentProcessingComponents();
  createAuthComponents();
  createAgentComponents();

  console.log('UI components initialized');
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM loaded, initializing UI components...');
  initializeUIComponents();
});

// Initialize immediately if DOM is already loaded
if (document.readyState === 'complete' || document.readyState === 'interactive') {
  console.log('DOM already loaded, initializing UI components immediately...');
  initializeUIComponents();
}
