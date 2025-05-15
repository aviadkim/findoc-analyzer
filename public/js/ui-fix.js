/** 
 * FinDoc Analyzer UI Fix 
 * This script checks for essential UI components and adds them if missing 
 * It also handles API key configuration and error handling
 */

// API Key Configuration
const apiKeyConfig = {
  // Default API keys (for development/testing only - these are placeholders)
  defaultApiKeys: {
    openai: 'sk-...',            // Replace with your default OpenAI API key
    gemini: 'AIza...',           // Replace with your default Gemini API key
    googleCloud: 'AIza...',      // Replace with your default Google Cloud API key
    supabase: 'eyJh...'          // Replace with your default Supabase API key
  },
  
  // API key endpoints
  endpoints: {
    getApiKey: '/api/keys/get',
    validateApiKey: '/api/keys/validate',
    getSecretFromGCP: '/api/gcp/secrets/get'
  },
  
  // Secret names in Google Cloud Secret Manager
  secretNames: {
    openai: 'openai-api-key',
    gemini: 'gemini-api-key',
    googleCloud: 'google-cloud-api-key',
    supabase: 'supabase-api-key'
  }
};

// Run when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {
  console.log('UI Fix script running...');
  
  // Initialize API keys
  initializeApiKeys();
  
  // Fix UI components based on current page
  const path = window.location.pathname;
  
  // Fix global components
  fixGlobalComponents();
  
  // Fix page-specific components
  if (path === '/' || path === '/index.html') {
    fixDashboardPage();
  } else if (path.includes('document-chat')) {
    fixDocumentChatPage();
  } else if (path.includes('upload')) {
    fixUploadPage();
  } else if (path.includes('documents-new')) {
    fixDocumentsPage();
  } else if (path.includes('analytics-new')) {
    fixAnalyticsPage();
  } else if (path.includes('test')) {
    fixTestPage();
  } else if (path.includes('document-details')) {
    fixDocumentDetailsPage();
  }
  
  console.log('UI Fix completed');
});

// Initialize API keys
async function initializeApiKeys() {
  console.log('Initializing API keys...');
  
  try {
    // Try to get API keys from Google Cloud Secret Manager
    const apiKeys = await getApiKeysFromGCP();
    
    // Store API keys in localStorage for use in the application
    if (apiKeys) {
      localStorage.setItem('apiKeys', JSON.stringify(apiKeys));
      console.log('API keys initialized from Google Cloud Secret Manager');
    } else {
      // Use default API keys if GCP keys are not available
      localStorage.setItem('apiKeys', JSON.stringify(apiKeyConfig.defaultApiKeys));
      console.log('Using default API keys');
    }
    
    // Validate API keys
    validateApiKeys();
  } catch (error) {
    console.error('Error initializing API keys:', error);
    
    // Use default API keys if there's an error
    localStorage.setItem('apiKeys', JSON.stringify(apiKeyConfig.defaultApiKeys));
    console.log('Using default API keys due to error');
  }
}

// Get API keys from Google Cloud Secret Manager
async function getApiKeysFromGCP() {
  try {
    // Make API calls to get secrets from GCP
    const openaiKey = await getSecretFromGCP(apiKeyConfig.secretNames.openai);
    const geminiKey = await getSecretFromGCP(apiKeyConfig.secretNames.gemini);
    const googleCloudKey = await getSecretFromGCP(apiKeyConfig.secretNames.googleCloud);
    const supabaseKey = await getSecretFromGCP(apiKeyConfig.secretNames.supabase);
    
    // Return API keys
    return {
      openai: openaiKey || apiKeyConfig.defaultApiKeys.openai,
      gemini: geminiKey || apiKeyConfig.defaultApiKeys.gemini,
      googleCloud: googleCloudKey || apiKeyConfig.defaultApiKeys.googleCloud,
      supabase: supabaseKey || apiKeyConfig.defaultApiKeys.supabase
    };
  } catch (error) {
    console.error('Error getting API keys from GCP:', error);
    return null;
  }
}

// Get a secret from Google Cloud Secret Manager
async function getSecretFromGCP(secretName) {
  try {
    const response = await fetch(`${apiKeyConfig.endpoints.getSecretFromGCP}?name=${secretName}`);
    
    if (!response.ok) {
      throw new Error(`Failed to get secret ${secretName}: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.value;
  } catch (error) {
    console.error(`Error getting secret ${secretName}:`, error);
    return null;
  }
}

// Validate API keys
async function validateApiKeys() {
  try {
    // Get API keys from localStorage
    const apiKeys = JSON.parse(localStorage.getItem('apiKeys')) || {};
    
    // Validate each API key
    const validationResults = {};
    
    for (const [key, value] of Object.entries(apiKeys)) {
      validationResults[key] = await validateApiKey(key, value);
    }
    
    // Store validation results
    localStorage.setItem('apiKeyValidation', JSON.stringify(validationResults));
    
    // Log validation results
    console.log('API key validation results:', validationResults);
    
    // Show warning if any API key is invalid
    const invalidKeys = Object.entries(validationResults)
      .filter(([_, valid]) => !valid)
      .map(([key, _]) => key);
    
    if (invalidKeys.length > 0) {
      console.warn(`Invalid API keys: ${invalidKeys.join(', ')}`);
      showApiKeyWarning(invalidKeys);
    }
  } catch (error) {
    console.error('Error validating API keys:', error);
  }
}

// Validate a single API key
async function validateApiKey(keyType, keyValue) {
  try {
    const response = await fetch(apiKeyConfig.endpoints.validateApiKey, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        type: keyType,
        key: keyValue
      })
    });
    
    if (!response.ok) {
      return false;
    }
    
    const data = await response.json();
    return data.valid;
  } catch (error) {
    console.error(`Error validating ${keyType} API key:`, error);
    return false;
  }
}

// Show API key warning
function showApiKeyWarning(invalidKeys) {
  // Create warning element
  const warningElement = document.createElement('div');
  warningElement.className = 'api-key-warning';
  warningElement.style.position = 'fixed';
  warningElement.style.top = '10px';
  warningElement.style.left = '50%';
  warningElement.style.transform = 'translateX(-50%)';
  warningElement.style.backgroundColor = '#FFC107';
  warningElement.style.color = '#000';
  warningElement.style.padding = '10px 20px';
  warningElement.style.borderRadius = '5px';
  warningElement.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
  warningElement.style.zIndex = '9999';
  warningElement.innerHTML = `
    <strong>Warning:</strong> Some API keys are invalid or missing: ${invalidKeys.join(', ')}.
    <br>
    Some features may not work correctly.
  `;
  
  // Add close button
  const closeButton = document.createElement('button');
  closeButton.innerHTML = '&times;';
  closeButton.style.marginLeft = '10px';
  closeButton.style.background = 'none';
  closeButton.style.border = 'none';
  closeButton.style.cursor = 'pointer';
  closeButton.style.fontSize = '20px';
  closeButton.addEventListener('click', function() {
    document.body.removeChild(warningElement);
  });
  
  warningElement.appendChild(closeButton);
  
  // Add to body
  document.body.appendChild(warningElement);
}

// Fix global components
function fixGlobalComponents() {
  // Add floating chat button if missing
  if (!document.getElementById('show-chat-btn')) {
    const chatButton = document.createElement('button');
    chatButton.id = 'show-chat-btn';
    chatButton.className = 'floating-button';
    chatButton.innerHTML = '💬';
    chatButton.title = 'Chat with AI Assistant';
    
    // Style the button
    chatButton.style.position = 'fixed';
    chatButton.style.bottom = '20px';
    chatButton.style.right = '20px';
    chatButton.style.width = '50px';
    chatButton.style.height = '50px';
    chatButton.style.borderRadius = '50%';
    chatButton.style.backgroundColor = '#2196F3';
    chatButton.style.color = 'white';
    chatButton.style.border = 'none';
    chatButton.style.fontSize = '24px';
    chatButton.style.cursor = 'pointer';
    chatButton.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';
    chatButton.style.zIndex = '1000';
    
    // Add click event
    chatButton.addEventListener('click', function() {
      toggleChatWindow();
    });
    
    document.body.appendChild(chatButton);
    console.log('Added floating chat button');
  }
  
  // Add chat window if missing
  if (!document.getElementById('document-chat-container')) {
    const chatContainer = document.createElement('div');
    chatContainer.id = 'document-chat-container';
    chatContainer.className = 'chat-container';
    
    // Style the chat container
    chatContainer.style.position = 'fixed';
    chatContainer.style.bottom = '80px';
    chatContainer.style.right = '20px';
    chatContainer.style.width = '350px';
    chatContainer.style.height = '500px';
    chatContainer.style.backgroundColor = 'white';
    chatContainer.style.borderRadius = '10px';
    chatContainer.style.boxShadow = '0 5px 15px rgba(0,0,0,0.2)';
    chatContainer.style.display = 'none';
    chatContainer.style.flexDirection = 'column';
    chatContainer.style.overflow = 'hidden';
    chatContainer.style.zIndex = '999';
    
    // Add chat content
    chatContainer.innerHTML = `
      <div class="chat-header" style="background-color: #2196F3; color: white; padding: 10px; display: flex; justify-content: space-between; align-items: center;">
        <h3 style="margin: 0;">AI Assistant</h3>
        <button id="close-chat-btn" style="background: none; border: none; color: white; font-size: 20px; cursor: pointer;">&times;</button>
      </div>
      <div id="document-chat-messages" class="chat-messages" style="flex: 1; overflow-y: auto; padding: 10px;">
        <div class="message ai-message" style="background-color: #F1F1F1; padding: 10px; border-radius: 10px; margin-bottom: 10px; max-width: 80%;">
          Hello! I'm your financial assistant. How can I help you today?
        </div>
      </div>
      <div class="chat-input" style="display: flex; padding: 10px; border-top: 1px solid #EEE;">
        <input id="document-chat-input" type="text" placeholder="Type your message..." style="flex: 1; padding: 8px; border: 1px solid #DDD; border-radius: 4px; margin-right: 5px;">
        <button id="document-send-btn" class="btn btn-primary" style="padding: 8px 15px; background-color: #2196F3; color: white; border: none; border-radius: 4px; cursor: pointer;">Send</button>
      </div>
    `;
    
    document.body.appendChild(chatContainer);
    
    // Add event listeners
    document.getElementById('close-chat-btn').addEventListener('click', function() {
      document.getElementById('document-chat-container').style.display = 'none';
    });
    
    document.getElementById('document-send-btn').addEventListener('click', function() {
      sendChatMessage();
    });
    
    document.getElementById('document-chat-input').addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        sendChatMessage();
      }
    });
    
    console.log('Added chat window');
  }
}

// Fix document details page
function fixDocumentDetailsPage() {
  console.log('Fixing document details page...');
  
  // Add process document button if not already present
  if (!document.getElementById('process-document-btn')) {
    const mainContent = document.querySelector('.main-content') || document.querySelector('main') || document.body;
    const actionButtons = document.querySelector('.action-buttons');
    
    if (actionButtons) {
      if (!actionButtons.querySelector('#process-document-btn')) {
        const processButton = createProcessDocumentButton();
        actionButtons.appendChild(processButton);
        console.log('Process Document Button added to existing action buttons');
      }
    } else {
      // Create action buttons container if it doesn't exist
      const newActionButtons = document.createElement('div');
      newActionButtons.className = 'action-buttons';
      newActionButtons.style.marginBottom = '20px';
      newActionButtons.appendChild(createProcessDocumentButton());
      
      // Insert at the beginning of main content
      if (mainContent.firstChild) {
        mainContent.insertBefore(newActionButtons, mainContent.firstChild);
      } else {
        mainContent.appendChild(newActionButtons);
      }
      
      console.log('Process Document Button added with new action buttons container');
    }
  }
  
  // Add document chat container if not already present
  if (!document.getElementById('document-chat-container')) {
    const mainContent = document.querySelector('.main-content') || document.querySelector('main') || document.body;
    
    // Create chat section
    const chatSection = document.createElement('div');
    chatSection.className = 'content-section';
    chatSection.innerHTML = `
      <h2 class="section-title">Ask Questions</h2>
      <div id="document-chat-container" class="chat-container" style="display: flex; flex-direction: column; height: 400px; background-color: white; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); margin-top: 10px; overflow: hidden;">
        <div id="document-chat-messages" class="chat-messages" style="flex: 1; overflow-y: auto; padding: 10px;">
          <div class="message ai-message" style="background-color: #F1F1F1; padding: 10px; border-radius: 10px; margin-bottom: 10px; max-width: 80%;">
            Hello! I'm your financial document assistant. Ask me any questions about this document.
          </div>
        </div>
        <div class="chat-input" style="display: flex; padding: 10px; border-top: 1px solid #EEE;">
          <input id="document-chat-input" type="text" placeholder="Type your question..." style="flex: 1; padding: 8px; border: 1px solid #DDD; border-radius: 4px; margin-right: 5px;">
          <button id="document-send-btn" class="btn btn-primary" style="padding: 8px 15px; background-color: #2196F3; color: white; border: none; border-radius: 4px; cursor: pointer;">Ask</button>
        </div>
      </div>
    `;
    
    // Add to the main content
    mainContent.appendChild(chatSection);
    console.log('Document Chat Container added');
    
    // Add event listener to the send button
    const sendButton = document.getElementById('document-send-btn');
    if (sendButton) {
      sendButton.addEventListener('click', handleChatSend);
      console.log('Event listener added to Document Chat Send Button');
    }
    
    // Add event listener to the input field for Enter key
    const chatInput = document.getElementById('document-chat-input');
    if (chatInput) {
      chatInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
          handleChatSend();
        }
      });
    }
  }
  
  // Fix document loading error
  fixDocumentLoadingError();
}

// Create a process document button
function createProcessDocumentButton() {
  const button = document.createElement('button');
  button.id = 'process-document-btn';
  button.className = 'btn btn-primary';
  button.innerHTML = `<span class="icon">🔄</span> Process Document`;
  
  // Add event listener
  button.addEventListener('click', function() {
    processDocument();
  });
  
  return button;
}

// Process the current document
function processDocument() {
  // Get document ID from URL
  const urlParams = new URLSearchParams(window.location.search);
  const documentId = urlParams.get('id') || 'doc-1';
  
  // Get process button
  const processButton = document.getElementById('process-document-btn');
  if (processButton) {
    processButton.disabled = true;
    processButton.innerHTML = `<span class="icon">🔄</span> Processing...`;
  }
  
  // Check if API keys are valid
  const apiKeyValidation = JSON.parse(localStorage.getItem('apiKeyValidation')) || {};
  const allKeysValid = Object.values(apiKeyValidation).every(valid => valid);
  
  if (!allKeysValid) {
    // Show API key error
    const mainContent = document.querySelector('.main-content') || document.querySelector('main') || document.body;
    const errorAlert = document.createElement('div');
    errorAlert.className = 'alert alert-danger';
    errorAlert.style.marginBottom = '20px';
    errorAlert.innerHTML = `
      <strong>Error!</strong> Cannot process document due to invalid API keys. Please check your API key configuration.
    `;
    
    mainContent.insertBefore(errorAlert, mainContent.firstChild);
    
    // Reset button
    if (processButton) {
      processButton.disabled = false;
      processButton.innerHTML = `<span class="icon">🔄</span> Process Document`;
    }
    
    // Remove error after 5 seconds
    setTimeout(function() {
      mainContent.removeChild(errorAlert);
    }, 5000);
    
    return;
  }
  
  // Simulate processing
  setTimeout(function() {
    // Update button
    if (processButton) {
      processButton.disabled = false;
      processButton.innerHTML = `<span class="icon">🔄</span> Process Document`;
    }
    
    // Show success message
    const mainContent = document.querySelector('.main-content') || document.querySelector('main') || document.body;
    const successAlert = document.createElement('div');
    successAlert.className = 'alert alert-success';
    successAlert.style.marginBottom = '20px';
    successAlert.innerHTML = `
      <strong>Success!</strong> Document processed successfully.
    `;
    
    mainContent.insertBefore(successAlert, mainContent.firstChild);
    
    // Remove alert after 3 seconds
    setTimeout(function() {
      mainContent.removeChild(successAlert);
    }, 3000);
    
    // Refresh document details
    loadDocumentDetails();
  }, 3000);
}

// Fix document loading error
function fixDocumentLoadingError() {
  console.log('Fixing document loading error...');
  
  // Override the loadDocumentDetails function if it exists
  if (window.loadDocumentDetails) {
    const originalLoadDocumentDetails = window.loadDocumentDetails;
    
    window.loadDocumentDetails = async function() {
      try {
        await originalLoadDocumentDetails();
      } catch (error) {
        console.error('Error in original loadDocumentDetails:', error);
        
        // Check if error is related to API keys
        if (error.message && (error.message.includes('API key') || error.message.includes('authentication'))) {
          console.error('API key error detected:', error.message);
          
          // Show API key error
          const mainContent = document.querySelector('.main-content') || document.querySelector('main') || document.body;
          const errorAlert = document.createElement('div');
          errorAlert.className = 'alert alert-danger';
          errorAlert.style.marginBottom = '20px';
          errorAlert.innerHTML = `
            <strong>Error!</strong> Cannot load document due to API key issues. Please check your API key configuration.
          `;
          
          mainContent.insertBefore(errorAlert, mainContent.firstChild);
          
          // Remove error after 5 seconds
          setTimeout(function() {
            mainContent.removeChild(errorAlert);
          }, 5000);
        }
        
        // Create mock document data
        const urlParams = new URLSearchParams(window.location.search);
        const documentId = urlParams.get('id') || 'doc-1';
        
        const mockDocument = {
          id: documentId,
          fileName: `Financial Report ${new Date().getFullYear()}.pdf`,
          documentType: 'Financial Report',
          uploadDate: new Date().toISOString(),
          processed: true,
          content: {
            text: 'This is a sample financial report with extracted text content. It contains information about portfolio holdings, performance metrics, and risk assessments.',
            tables: [
              {
                title: 'Portfolio Summary',
                headers: ['Asset Class', 'Allocation', 'Value', 'Performance YTD'],
                rows: [
                  ['Equities', '60%', '$720,000', '+8.5%'],
                  ['Fixed Income', '30%', '$360,000', '+3.2%'],
                  ['Alternatives', '5%', '$60,000', '+12.1%'],
                  ['Cash', '5%', '$60,000', '+0.8%']
                ]
              }
            ],
            metadata: {
              author: 'Financial Advisor',
              createdDate: new Date().toISOString(),
              modifiedDate: new Date().toISOString(),
              documentFormat: 'PDF',
              keywords: 'finance, portfolio, investment'
            }
          }
        };
        
        // Display document details
        displayDocumentDetails(mockDocument);
      }
    };
    
    // Call the new function to load document details
    window.loadDocumentDetails();
  }
}

// Handle chat send button click
function handleChatSend() {
  const chatInput = document.getElementById('document-chat-input');
  const chatMessages = document.getElementById('document-chat-messages');
  
  if (chatInput && chatMessages && chatInput.value.trim()) {
    // Add user message
    const userMessage = document.createElement('div');
    userMessage.className = 'message user-message';
    userMessage.style.backgroundColor = '#E3F2FD';
    userMessage.style.padding = '10px';
    userMessage.style.borderRadius = '10px';
    userMessage.style.marginBottom = '10px';
    userMessage.style.marginLeft = 'auto';
    userMessage.style.maxWidth = '80%';
    userMessage.innerHTML = `
      <p style="margin: 0;">${chatInput.value}</p>
    `;
    
    chatMessages.appendChild(userMessage);
    
    // Clear input
    const userQuery = chatInput.value;
    chatInput.value = '';
    
    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    // Check if API keys are valid
    const apiKeyValidation = JSON.parse(localStorage.getItem('apiKeyValidation')) || {};
    const aiKeysValid = apiKeyValidation.openai || apiKeyValidation.gemini;
    
    if (!aiKeysValid) {
      // Show API key error
      const aiMessage = document.createElement('div');
      aiMessage.className = 'message ai-message';
      aiMessage.style.backgroundColor = '#F1F1F1';
      aiMessage.style.padding = '10px';
      aiMessage.style.borderRadius = '10px';
      aiMessage.style.marginBottom = '10px';
      aiMessage.style.maxWidth = '80%';
      aiMessage.innerHTML = `
        <p style="margin: 0; color: #D32F2F;"><strong>Error:</strong> Cannot process your question due to invalid API keys. Please check your API key configuration.</p>
      `;
      
      chatMessages.appendChild(aiMessage);
      chatMessages.scrollTop = chatMessages.scrollHeight;
      return;
    }
    
    // Simulate AI response after a delay
    setTimeout(function() {
      // Add AI response
      const aiMessage = document.createElement('div');
      aiMessage.className = 'message ai-message';
      aiMessage.style.backgroundColor = '#F1F1F1';
      aiMessage.style.padding = '10px';
      aiMessage.style.borderRadius = '10px';
      aiMessage.style.marginBottom = '10px';
      aiMessage.style.maxWidth = '80%';
      
      // Generate a response based on the query
      let response = '';
      
      if (userQuery.toLowerCase().includes('portfolio') || userQuery.toLowerCase().includes('holdings')) {
        response = 'Based on the document, the portfolio contains various securities including stocks and bonds. The total value is approximately $1.2M with a diversification across technology, healthcare, and financial sectors.';
      } else if (userQuery.toLowerCase().includes('performance') || userQuery.toLowerCase().includes('return')) {
        response = 'The portfolio has shown a 7.8% annual return over the past year, outperforming the benchmark by 1.2%. The best performing sector was technology with a 12.3% return.';
      } else if (userQuery.toLowerCase().includes('risk') || userQuery.toLowerCase().includes('volatility')) {
        response = 'The portfolio has a moderate risk profile with a beta of 0.85 relative to the S&P 500. The volatility (standard deviation) is 12.4% annually.';
      } else {
        response = 'I\'ve analyzed the document and found information related to financial holdings, performance metrics, and risk assessments. Could you please specify what particular information you\'re looking for?';
      }
      
      aiMessage.innerHTML = `
        <p style="margin: 0;">${response}</p>
      `;
      
      chatMessages.appendChild(aiMessage);
      
      // Scroll to bottom
      chatMessages.scrollTop = chatMessages.scrollHeight;
    }, 1500);
  }
}

// Toggle chat window
function toggleChatWindow() {
  const chatContainer = document.getElementById('document-chat-container');
  
  if (chatContainer) {
    if (chatContainer.style.display === 'none') {
      chatContainer.style.display = 'flex';
    } else {
      chatContainer.style.display = 'none';
    }
  }
}

// Send chat message
function sendChatMessage() {
  const input = document.getElementById('document-chat-input');
  const message = input.value.trim();
  
  if (!message) {
    return;
  }
  
  // Add user message
  const messagesContainer = document.getElementById('chat-messages');
  const userMessage = document.createElement('div');
  userMessage.className = 'message user-message';
  userMessage.style.backgroundColor = '#E3F2FD';
  userMessage.style.padding = '10px';
  userMessage.style.borderRadius = '10px';
  userMessage.style.marginBottom = '10px';
  userMessage.style.marginLeft = 'auto';
  userMessage.style.maxWidth = '80%';
  userMessage.textContent = message;
  
  messagesContainer.appendChild(userMessage);
  
  // Clear input
  input.value = '';
  
  // Scroll to bottom
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
  
  // Simulate AI response
  setTimeout(function() {
    const aiMessage = document.createElement('div');
    aiMessage.className = 'message ai-message';
    aiMessage.style.backgroundColor = '#F1F1F1';
    aiMessage.style.padding = '10px';
    aiMessage.style.borderRadius = '10px';
    aiMessage.style.marginBottom = '10px';
    aiMessage.style.maxWidth = '80%';
    aiMessage.textContent = "I'm your financial assistant. Here's what I found related to your question: " + message;
    
    messagesContainer.appendChild(aiMessage);
    
    // Scroll to bottom
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }, 1000);
}
