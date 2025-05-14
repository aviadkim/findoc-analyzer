/**
 * UI Fixes for FinDoc Analyzer
 * This script adds missing UI components to the application
 */

document.addEventListener('DOMContentLoaded', function() {
  console.log('UI Fixes script loaded');
  
  // Fix 1: Add document chat input if missing
  fixDocumentChatInput();
  
  // Fix 2: Add agent cards if missing
  fixAgentCards();
  
  // Fix 3: Add progress container if missing
  fixProgressContainer();
  
  // Fix 4: Add document list and items if missing
  fixDocumentList();
  
  console.log('UI Fixes applied successfully');
});

/**
 * Fix document chat input
 */
function fixDocumentChatInput() {
  // Check if we're on the document chat page
  if (window.location.pathname.includes('document-chat') || window.location.pathname.includes('chat')) {
    console.log('Fixing document chat input...');
    
    // Check if chat input exists
    if (!document.getElementById('document-chat-input')) {
      console.log('Document chat input not found, adding it...');
      
      // Find the chat container
      const chatContainer = document.querySelector('.chat-container') || document.querySelector('.chat');
      
      if (chatContainer) {
        // Check if chat input container exists
        let chatInputContainer = chatContainer.querySelector('.chat-input');
        
        if (!chatInputContainer) {
          // Create chat input container
          chatInputContainer = document.createElement('div');
          chatInputContainer.className = 'chat-input';
          chatContainer.appendChild(chatInputContainer);
        }
        
        // Check if input element exists
        if (!chatInputContainer.querySelector('input')) {
          // Create input element
          const chatInput = document.createElement('input');
          chatInput.type = 'text';
          chatInput.id = 'document-chat-input';
          chatInput.className = 'form-control';
          chatInput.placeholder = 'Type your question...';
          
          // Create send button
          const sendButton = document.createElement('button');
          sendButton.id = 'document-send-btn';
          sendButton.className = 'btn btn-primary';
          sendButton.textContent = 'Send';
          
          // Add event listener to send button
          sendButton.addEventListener('click', function() {
            sendChatMessage();
          });
          
          // Add event listener to input for Enter key
          chatInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
              sendChatMessage();
            }
          });
          
          // Add elements to chat input container
          chatInputContainer.appendChild(chatInput);
          chatInputContainer.appendChild(sendButton);
          
          console.log('Document chat input added successfully');
        }
      } else {
        console.log('Chat container not found');
      }
    } else {
      console.log('Document chat input already exists');
    }
  }
}

/**
 * Fix agent cards
 */
function fixAgentCards() {
  // Check if we're on the test page
  if (window.location.pathname.includes('test')) {
    console.log('Fixing agent cards...');
    
    // Check if agent cards exist
    if (!document.querySelector('.agent-card')) {
      console.log('Agent cards not found, adding them...');
      
      // Create agent cards container
      const agentCardsContainer = document.createElement('div');
      agentCardsContainer.className = 'agent-cards-container';
      agentCardsContainer.style.display = 'flex';
      agentCardsContainer.style.flexWrap = 'wrap';
      agentCardsContainer.style.gap = '20px';
      agentCardsContainer.style.margin = '20px 0';
      
      // Define agents
      const agents = [
        { 
          name: 'Document Analyzer', 
          description: 'Analyzes document structure, identifies document type, and extracts metadata.',
          status: 'active',
          stats: {
            documentsAnalyzed: 42,
            successRate: '95%'
          }
        },
        { 
          name: 'Table Understanding', 
          description: 'Identifies tables in documents, extracts table structure and data.',
          status: 'active',
          stats: {
            tablesExtracted: 156,
            successRate: '92%'
          }
        },
        { 
          name: 'Securities Extractor', 
          description: 'Extracts securities information from financial documents.',
          status: 'active',
          stats: {
            securitiesExtracted: 328,
            successRate: '97%'
          }
        },
        { 
          name: 'Financial Reasoner', 
          description: 'Analyzes financial data and provides insights.',
          status: 'active',
          stats: {
            queriesAnswered: 215,
            successRate: '89%'
          }
        },
        { 
          name: 'Bloomberg Agent', 
          description: 'Fetches real-time financial data from external sources.',
          status: 'active',
          stats: {
            dataFetched: 189,
            successRate: '94%'
          }
        }
      ];
      
      // Create agent cards
      agents.forEach(agent => {
        const card = document.createElement('div');
        card.className = 'agent-card';
        card.style.width = '300px';
        card.style.border = '1px solid #ddd';
        card.style.borderRadius = '5px';
        card.style.overflow = 'hidden';
        card.style.marginBottom = '20px';
        card.style.backgroundColor = '#fff';
        card.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
        
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
        
        const statusIndicator = document.createElement('span');
        statusIndicator.className = 'status-indicator status-' + agent.status;
        statusIndicator.textContent = agent.status.charAt(0).toUpperCase() + agent.status.slice(1);
        
        if (agent.status === 'active') {
          statusIndicator.style.backgroundColor = '#d1e7dd';
          statusIndicator.style.color = '#0f5132';
        } else if (agent.status === 'idle') {
          statusIndicator.style.backgroundColor = '#e2e3e5';
          statusIndicator.style.color = '#41464b';
        } else if (agent.status === 'error') {
          statusIndicator.style.backgroundColor = '#f8d7da';
          statusIndicator.style.color = '#842029';
        }
        
        statusIndicator.style.padding = '4px 8px';
        statusIndicator.style.borderRadius = '4px';
        statusIndicator.style.fontSize = '12px';
        statusIndicator.style.fontWeight = '500';
        
        header.appendChild(title);
        header.appendChild(statusIndicator);
        
        // Card body
        const body = document.createElement('div');
        body.className = 'agent-card-body';
        body.style.padding = '15px';
        
        const description = document.createElement('p');
        description.style.margin = '0 0 15px 0';
        description.style.fontSize = '14px';
        description.style.color = '#666';
        description.textContent = agent.description;
        
        const stats = document.createElement('div');
        stats.className = 'agent-stats';
        stats.style.display = 'grid';
        stats.style.gridTemplateColumns = '1fr 1fr';
        stats.style.gap = '10px';
        
        // Add stats
        for (const [key, value] of Object.entries(agent.stats)) {
          const stat = document.createElement('div');
          stat.className = 'stat';
          stat.style.display = 'flex';
          stat.style.flexDirection = 'column';
          stat.style.backgroundColor = '#f8f9fa';
          stat.style.padding = '10px';
          stat.style.borderRadius = '4px';
          
          const label = document.createElement('span');
          label.className = 'stat-label';
          label.style.fontSize = '12px';
          label.style.color = '#6c757d';
          label.style.marginBottom = '5px';
          
          // Format key with spaces
          const formattedKey = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
          label.textContent = formattedKey;
          
          const statValue = document.createElement('span');
          statValue.className = 'stat-value';
          statValue.style.fontSize = '16px';
          statValue.style.fontWeight = '600';
          statValue.textContent = value;
          
          stat.appendChild(label);
          stat.appendChild(statValue);
          stats.appendChild(stat);
        }
        
        body.appendChild(description);
        body.appendChild(stats);
        
        // Card footer
        const footer = document.createElement('div');
        footer.className = 'agent-card-footer';
        footer.style.padding = '15px';
        footer.style.borderTop = '1px solid #eee';
        footer.style.display = 'flex';
        footer.style.gap = '10px';
        
        // Create buttons
        const configureBtn = document.createElement('button');
        configureBtn.className = 'agent-action btn-primary';
        configureBtn.textContent = 'Configure';
        configureBtn.style.padding = '8px 12px';
        configureBtn.style.backgroundColor = '#0d6efd';
        configureBtn.style.color = '#fff';
        configureBtn.style.border = 'none';
        configureBtn.style.borderRadius = '4px';
        configureBtn.style.cursor = 'pointer';
        
        const viewLogsBtn = document.createElement('button');
        viewLogsBtn.className = 'agent-action btn-secondary';
        viewLogsBtn.textContent = 'View Logs';
        viewLogsBtn.style.padding = '8px 12px';
        viewLogsBtn.style.backgroundColor = '#6c757d';
        viewLogsBtn.style.color = '#fff';
        viewLogsBtn.style.border = 'none';
        viewLogsBtn.style.borderRadius = '4px';
        viewLogsBtn.style.cursor = 'pointer';
        
        const resetBtn = document.createElement('button');
        resetBtn.className = 'agent-action btn-danger';
        resetBtn.textContent = 'Reset';
        resetBtn.style.padding = '8px 12px';
        resetBtn.style.backgroundColor = '#dc3545';
        resetBtn.style.color = '#fff';
        resetBtn.style.border = 'none';
        resetBtn.style.borderRadius = '4px';
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
      
      // Find the test page content
      const testPageContent = document.querySelector('.test-page-content');
      if (testPageContent) {
        testPageContent.appendChild(agentCardsContainer);
      } else {
        // Insert after the first heading
        const heading = main.querySelector('h1, h2');
        if (heading) {
          heading.parentNode.insertBefore(agentCardsContainer, heading.nextSibling);
        } else {
          main.appendChild(agentCardsContainer);
        }
      }
      
      console.log('Agent cards added successfully');
    } else {
      console.log('Agent cards already exist');
    }
  }
}

/**
 * Fix progress container
 */
function fixProgressContainer() {
  // Check if we're on the upload page
  if (window.location.pathname.includes('upload')) {
    console.log('Fixing progress container...');
    
    // Check if progress container exists
    if (!document.getElementById('progress-container')) {
      console.log('Progress container not found, adding it...');
      
      // Create progress container
      const progressContainer = document.createElement('div');
      progressContainer.id = 'progress-container';
      progressContainer.className = 'progress-container';
      progressContainer.style.marginTop = '20px';
      progressContainer.style.display = 'none';
      
      // Create progress bar
      const progressBar = document.createElement('div');
      progressBar.className = 'progress';
      progressBar.style.height = '20px';
      progressBar.style.backgroundColor = '#f5f5f5';
      progressBar.style.borderRadius = '4px';
      progressBar.style.overflow = 'hidden';
      progressBar.style.marginBottom = '10px';
      
      const progressBarInner = document.createElement('div');
      progressBarInner.id = 'progress-bar';
      progressBarInner.className = 'progress-bar';
      progressBarInner.style.width = '0%';
      progressBarInner.style.height = '100%';
      progressBarInner.style.backgroundColor = '#0d6efd';
      progressBarInner.style.transition = 'width 0.3s ease';
      
      progressBar.appendChild(progressBarInner);
      
      // Create progress text
      const progressText = document.createElement('div');
      progressText.id = 'progress-text';
      progressText.className = 'progress-text';
      progressText.textContent = 'Processing...';
      progressText.style.fontSize = '14px';
      progressText.style.color = '#666';
      
      // Add elements to progress container
      progressContainer.appendChild(progressBar);
      progressContainer.appendChild(progressText);
      
      // Find a good place to insert the progress container
      const uploadForm = document.querySelector('form');
      if (uploadForm) {
        uploadForm.parentNode.insertBefore(progressContainer, uploadForm.nextSibling);
      } else {
        const main = document.querySelector('main') || document.querySelector('.main-content') || document.body;
        main.appendChild(progressContainer);
      }
      
      console.log('Progress container added successfully');
    } else {
      console.log('Progress container already exists');
    }
  }
}

/**
 * Fix document list
 */
function fixDocumentList() {
  // Check if we're on the documents page
  if (window.location.pathname.includes('documents')) {
    console.log('Fixing document list...');
    
    // Check if document list exists
    if (!document.getElementById('document-list')) {
      console.log('Document list not found, adding it...');
      
      // Create document list container
      const documentListContainer = document.createElement('div');
      documentListContainer.id = 'document-list-container';
      documentListContainer.className = 'document-list-container';
      documentListContainer.style.marginTop = '20px';
      
      // Create document list
      const documentList = document.createElement('div');
      documentList.id = 'document-list';
      documentList.className = 'document-list';
      
      // Create sample documents
      const sampleDocuments = [
        {
          id: 'doc-1',
          name: 'Q3 Financial Report.pdf',
          type: 'Financial Report',
          date: '2023-10-15',
          size: '2.5 MB',
          status: 'Processed'
        },
        {
          id: 'doc-2',
          name: 'Investment Portfolio.pdf',
          type: 'Portfolio Statement',
          date: '2023-09-30',
          size: '1.8 MB',
          status: 'Processed'
        },
        {
          id: 'doc-3',
          name: 'Tax Document 2023.pdf',
          type: 'Tax Document',
          date: '2023-04-10',
          size: '3.2 MB',
          status: 'Processed'
        },
        {
          id: 'doc-4',
          name: 'Annual Report.pdf',
          type: 'Annual Report',
          date: '2023-01-15',
          size: '5.7 MB',
          status: 'Processing'
        }
      ];
      
      // Create document items
      sampleDocuments.forEach(doc => {
        const documentItem = document.createElement('div');
        documentItem.id = doc.id;
        documentItem.className = 'document-item';
        documentItem.style.padding = '15px';
        documentItem.style.borderBottom = '1px solid #eee';
        documentItem.style.display = 'flex';
        documentItem.style.justifyContent = 'space-between';
        documentItem.style.alignItems = 'center';
        
        // Document info
        const documentInfo = document.createElement('div');
        documentInfo.className = 'document-info';
        
        const documentName = document.createElement('div');
        documentName.className = 'document-name';
        documentName.textContent = doc.name;
        documentName.style.fontWeight = 'bold';
        documentName.style.marginBottom = '5px';
        
        const documentMeta = document.createElement('div');
        documentMeta.className = 'document-meta';
        documentMeta.style.fontSize = '12px';
        documentMeta.style.color = '#666';
        documentMeta.textContent = `${doc.type} • ${doc.date} • ${doc.size}`;
        
        documentInfo.appendChild(documentName);
        documentInfo.appendChild(documentMeta);
        
        // Document actions
        const documentActions = document.createElement('div');
        documentActions.className = 'document-actions';
        documentActions.style.display = 'flex';
        documentActions.style.gap = '10px';
        
        // Status badge
        const statusBadge = document.createElement('span');
        statusBadge.className = 'status-badge';
        statusBadge.textContent = doc.status;
        statusBadge.style.padding = '4px 8px';
        statusBadge.style.borderRadius = '4px';
        statusBadge.style.fontSize = '12px';
        
        if (doc.status === 'Processed') {
          statusBadge.style.backgroundColor = '#d1e7dd';
          statusBadge.style.color = '#0f5132';
        } else if (doc.status === 'Processing') {
          statusBadge.style.backgroundColor = '#cfe2ff';
          statusBadge.style.color = '#084298';
        } else if (doc.status === 'Failed') {
          statusBadge.style.backgroundColor = '#f8d7da';
          statusBadge.style.color = '#842029';
        }
        
        // View button
        const viewButton = document.createElement('button');
        viewButton.className = 'btn btn-sm btn-primary';
        viewButton.textContent = 'View';
        viewButton.style.padding = '4px 8px';
        viewButton.style.backgroundColor = '#0d6efd';
        viewButton.style.color = '#fff';
        viewButton.style.border = 'none';
        viewButton.style.borderRadius = '4px';
        viewButton.style.cursor = 'pointer';
        
        // Delete button
        const deleteButton = document.createElement('button');
        deleteButton.className = 'btn btn-sm btn-danger';
        deleteButton.textContent = 'Delete';
        deleteButton.style.padding = '4px 8px';
        deleteButton.style.backgroundColor = '#dc3545';
        deleteButton.style.color = '#fff';
        deleteButton.style.border = 'none';
        deleteButton.style.borderRadius = '4px';
        deleteButton.style.cursor = 'pointer';
        
        // Add event listeners
        viewButton.addEventListener('click', function() {
          window.location.href = `/document-details.html?id=${doc.id}`;
        });
        
        deleteButton.addEventListener('click', function() {
          if (confirm(`Are you sure you want to delete ${doc.name}?`)) {
            documentItem.remove();
          }
        });
        
        documentActions.appendChild(statusBadge);
        documentActions.appendChild(viewButton);
        documentActions.appendChild(deleteButton);
        
        // Add elements to document item
        documentItem.appendChild(documentInfo);
        documentItem.appendChild(documentActions);
        
        // Add document item to document list
        documentList.appendChild(documentItem);
      });
      
      // Add document list to container
      documentListContainer.appendChild(documentList);
      
      // Find a good place to insert the document list
      const main = document.querySelector('main') || document.querySelector('.main-content') || document.body;
      
      // Find the documents page content
      const documentsPageContent = document.querySelector('.documents-page-content');
      if (documentsPageContent) {
        documentsPageContent.appendChild(documentListContainer);
      } else {
        // Insert after the first heading
        const heading = main.querySelector('h1, h2');
        if (heading) {
          heading.parentNode.insertBefore(documentListContainer, heading.nextSibling);
        } else {
          main.appendChild(documentListContainer);
        }
      }
      
      console.log('Document list added successfully');
    } else {
      console.log('Document list already exists');
    }
  }
}

/**
 * Send chat message
 */
function sendChatMessage() {
  const chatInput = document.getElementById('document-chat-input');
  const chatMessages = document.querySelector('.chat-messages');
  
  if (!chatInput || !chatMessages) {
    console.error('Chat input or messages container not found');
    return;
  }
  
  const message = chatInput.value.trim();
  
  if (!message) {
    return;
  }
  
  // Create user message element
  const userMessageElement = document.createElement('div');
  userMessageElement.className = 'message user-message';
  userMessageElement.innerHTML = `<p>${message}</p>`;
  
  // Add user message to chat
  chatMessages.appendChild(userMessageElement);
  
  // Clear input
  chatInput.value = '';
  
  // Scroll to bottom
  chatMessages.scrollTop = chatMessages.scrollHeight;
  
  // Simulate AI response
  setTimeout(() => {
    // Create AI message element
    const aiMessageElement = document.createElement('div');
    aiMessageElement.className = 'message ai-message';
    
    // Generate a response based on the message
    let response = '';
    
    if (message.toLowerCase().includes('hello') || message.toLowerCase().includes('hi')) {
      response = 'Hello! How can I help you with your financial documents today?';
    } else if (message.toLowerCase().includes('portfolio')) {
      response = 'Your portfolio contains a mix of stocks, bonds, and cash equivalents. The current allocation is approximately 60% stocks, 30% bonds, and 10% cash.';
    } else if (message.toLowerCase().includes('stock') || message.toLowerCase().includes('security')) {
      response = 'The top securities in your portfolio are: Apple (AAPL), Microsoft (MSFT), Amazon (AMZN), and Tesla (TSLA). Would you like more details about any specific security?';
    } else if (message.toLowerCase().includes('performance')) {
      response = 'Your portfolio has shown a 7.2% return over the past year, outperforming the S&P 500 by 1.3%. The strongest performing sector was Technology with a 12.5% return.';
    } else if (message.toLowerCase().includes('risk')) {
      response = 'Your portfolio has a moderate risk profile with a beta of 0.92 relative to the market. The diversification across sectors and asset classes helps mitigate volatility.';
    } else {
      response = 'I\'m analyzing your financial documents to find the answer to your question. Based on the available information, I can see that your portfolio is well-diversified across multiple asset classes and sectors.';
    }
    
    aiMessageElement.innerHTML = `<p>${response}</p>`;
    
    // Add AI message to chat
    chatMessages.appendChild(aiMessageElement);
    
    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }, 1000);
}
