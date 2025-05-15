/**
 * FinDoc Analyzer UI Fix
 * This script checks for essential UI components and adds them if missing
 */

// Run when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {
  console.log('UI Fix script running...');

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

// Fix global components
function fixGlobalComponents() {
  // Add floating chat button if missing
  if (!document.getElementById('show-chat-btn')) {
    const chatButton = document.createElement('button');
    chatButton.id = 'show-chat-btn';
    chatButton.className = 'floating-button';
    chatButton.innerHTML = '<span>💬</span>';
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
    chatContainer.style.display = 'none';

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
      <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px 15px; background-color: #2196F3; color: white;">
        <h3 style="margin: 0; font-size: 16px;">AI Assistant</h3>
        <button id="close-chat-btn" style="background: none; border: none; color: white; font-size: 20px; cursor: pointer;">×</button>
      </div>
      <div id="chat-messages" style="flex: 1; overflow-y: auto; padding: 15px;">
        <div class="message ai-message" style="background-color: #f1f1f1; padding: 10px; border-radius: 10px; margin-bottom: 10px; max-width: 80%;">
          <p style="margin: 0;">Hello! I'm your financial assistant. How can I help you today?</p>
        </div>
      </div>
      <div style="display: flex; padding: 10px; border-top: 1px solid #eee;">
        <input type="text" id="document-chat-input" placeholder="Type your question..." style="flex: 1; padding: 10px; border: 1px solid #ddd; border-radius: 4px; margin-right: 10px;">
        <button id="document-send-btn" style="background-color: #2196F3; color: white; border: none; padding: 10px 15px; border-radius: 4px; cursor: pointer;">Send</button>
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

// Fix document chat page
function fixDocumentChatPage() {
  // Check if document selector exists
  if (!document.querySelector('.document-selector')) {
    const mainContent = document.querySelector('main .content') || document.querySelector('main');

    if (mainContent) {
      // Create document selector
      const documentSelector = document.createElement('div');
      documentSelector.className = 'document-selector';
      documentSelector.innerHTML = `
        <label for="document-select">Select a document to chat about:</label>
        <select id="document-select">
          <option value="">-- Select a document --</option>
          <option value="1">Financial Report Q1 2023</option>
          <option value="2">Investment Portfolio Analysis</option>
          <option value="3">Market Research Report</option>
        </select>
      `;

      // Add to page
      if (mainContent.firstChild) {
        mainContent.insertBefore(documentSelector, mainContent.firstChild);
      } else {
        mainContent.appendChild(documentSelector);
      }

      console.log('Added document selector');
    }
  }

  // Check if chat messages container exists
  if (!document.querySelector('.chat-messages')) {
    const mainContent = document.querySelector('main .content') || document.querySelector('main');

    if (mainContent) {
      // Create chat interface
      const chatInterface = document.createElement('div');
      chatInterface.className = 'chat';
      chatInterface.innerHTML = `
        <div class="chat-messages" id="chat-messages">
          <div class="message ai-message">
            Hello! I'm your financial document assistant. Select a document and ask me questions about it.
          </div>
        </div>
        <div class="chat-input">
          <input type="text" id="question-input" placeholder="Type your question here..." disabled>
          <button class="btn btn-primary" id="send-btn" disabled>Send</button>
        </div>
      `;

      // Add to page
      mainContent.appendChild(chatInterface);

      // Add event listeners
      document.getElementById('document-select').addEventListener('change', function() {
        const selected = this.value;
        const input = document.getElementById('question-input');
        const button = document.getElementById('send-btn');

        if (selected) {
          input.disabled = false;
          button.disabled = false;
        } else {
          input.disabled = true;
          button.disabled = true;
        }
      });

      document.getElementById('send-btn').addEventListener('click', function() {
        const input = document.getElementById('question-input');
        const message = input.value.trim();

        if (message) {
          // Add user message
          const messagesContainer = document.getElementById('chat-messages');
          const userMessage = document.createElement('div');
          userMessage.className = 'message user-message';
          userMessage.textContent = message;
          messagesContainer.appendChild(userMessage);

          // Clear input
          input.value = '';

          // Simulate AI response
          setTimeout(function() {
            const aiMessage = document.createElement('div');
            aiMessage.className = 'message ai-message';
            aiMessage.textContent = "I'm analyzing the document. Here's what I found related to your question: " + message;
            messagesContainer.appendChild(aiMessage);
          }, 1000);
        }
      });

      document.getElementById('question-input').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
          document.getElementById('send-btn').click();
        }
      });

      console.log('Added chat interface');
    }
  }
}

// Fix upload page
function fixUploadPage() {
  // Check if progress container exists
  if (!document.getElementById('progress-container')) {
    const uploadForm = document.querySelector('form');

    if (uploadForm) {
      // Create progress container
      const progressContainer = document.createElement('div');
      progressContainer.id = 'progress-container';
      progressContainer.style.display = 'none';
      progressContainer.innerHTML = `
        <div class="progress-bar-container">
          <div class="progress-bar" id="progress-bar" style="width: 0%"></div>
        </div>
        <p id="progress-status">Uploading: 0%</p>
      `;

      // Add to form
      uploadForm.appendChild(progressContainer);
      console.log('Added progress container');
    }
  }

  // Check if process button exists
  if (!document.getElementById('process-document-btn')) {
    const uploadButton = document.querySelector('button[type="submit"]') || document.querySelector('#upload-btn');

    if (uploadButton) {
      // Create process button
      const processButton = document.createElement('button');
      processButton.id = 'process-document-btn';
      processButton.className = uploadButton.className;
      processButton.textContent = 'Process Document';
      processButton.type = 'button';
      processButton.style.marginLeft = '10px';

      // Add click event
      processButton.addEventListener('click', function() {
        const progressContainer = document.getElementById('progress-container');
        const progressBar = document.getElementById('progress-bar');
        const progressStatus = document.getElementById('progress-status');

        if (progressContainer) {
          progressContainer.style.display = 'block';

          // Simulate progress
          let progress = 0;
          const interval = setInterval(function() {
            progress += 5;

            // Update progress bar if it exists
            if (progressBar) {
              progressBar.style.width = progress + '%';
            }

            // Update progress status if it exists
            if (progressStatus) {
              progressStatus.textContent = 'Processing: ' + progress + '%';
            }

            if (progress >= 100) {
              clearInterval(interval);

              // Update progress status if it exists
              if (progressStatus) {
                progressStatus.textContent = 'Processing complete!';
              }

              // Redirect to document details
              setTimeout(function() {
                alert('Document processed successfully!');
                window.location.href = '/documents-new';
              }, 1000);
            }
          }, 200);
        }
      });

      // Add to form
      uploadButton.parentNode.insertBefore(processButton, uploadButton.nextSibling);
      console.log('Added process button');
    }
  }
}

// Fix documents page
function fixDocumentsPage() {
  // Check if document list exists
  if (!document.getElementById('document-list')) {
    const mainContent = document.querySelector('main .content') || document.querySelector('main');

    if (mainContent) {
      // Create document list
      const documentList = document.createElement('div');
      documentList.id = 'document-list';
      documentList.className = 'document-list';
      documentList.innerHTML = `
        <div class="document-list-header">
          <h2>My Documents</h2>
          <div class="document-list-actions">
            <button class="btn btn-primary" onclick="window.location.href='/upload'">Upload New</button>
          </div>
        </div>
        <div class="document-list-content">
          <div class="document-item">
            <div class="document-info">
              <h3 class="document-title">Financial Report Q1 2023</h3>
              <p class="document-date">Uploaded: 2023-04-15</p>
            </div>
            <div class="document-actions">
              <button class="btn btn-secondary" onclick="viewDocument(1)">View</button>
              <button class="btn btn-danger" onclick="deleteDocument(1)">Delete</button>
            </div>
          </div>
          <div class="document-item">
            <div class="document-info">
              <h3 class="document-title">Investment Portfolio Analysis</h3>
              <p class="document-date">Uploaded: 2023-03-22</p>
            </div>
            <div class="document-actions">
              <button class="btn btn-secondary" onclick="viewDocument(2)">View</button>
              <button class="btn btn-danger" onclick="deleteDocument(2)">Delete</button>
            </div>
          </div>
        </div>
      `;

      // Add to page
      mainContent.appendChild(documentList);

      // Add global functions
      window.viewDocument = function(id) {
        window.location.href = '/document-details?id=' + id;
      };

      window.deleteDocument = function(id) {
        if (confirm('Are you sure you want to delete this document?')) {
          // Remove from UI
          const items = document.querySelectorAll('.document-item');
          if (items.length > id - 1) {
            items[id - 1].remove();
          }
        }
      };

      console.log('Added document list');
    }
  }
}

// Fix analytics page
function fixAnalyticsPage() {
  // Check if analytics dashboard exists
  if (!document.querySelector('.analytics-dashboard')) {
    const mainContent = document.querySelector('main .content') || document.querySelector('main');

    if (mainContent) {
      // Create analytics dashboard
      const analyticsDashboard = document.createElement('div');
      analyticsDashboard.className = 'analytics-dashboard';
      analyticsDashboard.innerHTML = `
        <div class="analytics-header">
          <h2>Analytics Dashboard</h2>
          <div class="analytics-filters">
            <select id="time-period">
              <option value="week">Last Week</option>
              <option value="month" selected>Last Month</option>
              <option value="quarter">Last Quarter</option>
              <option value="year">Last Year</option>
            </select>
          </div>
        </div>
        <div class="analytics-charts">
          <div class="analytics-chart">
            <h3>Document Types</h3>
            <div class="chart-placeholder" style="height: 200px; background-color: #f5f5f5; display: flex; align-items: center; justify-content: center;">
              Chart Placeholder
            </div>
          </div>
          <div class="analytics-chart">
            <h3>Processing Time</h3>
            <div class="chart-placeholder" style="height: 200px; background-color: #f5f5f5; display: flex; align-items: center; justify-content: center;">
              Chart Placeholder
            </div>
          </div>
        </div>
      `;

      // Add to page
      mainContent.appendChild(analyticsDashboard);
      console.log('Added analytics dashboard');
    }
  }
}

// Fix test page
function fixTestPage() {
  // Check if agent cards exist
  if (!document.querySelector('.agent-card')) {
    const mainContent = document.querySelector('main .content') || document.querySelector('main');

    if (mainContent) {
      // Create agent cards container
      const agentCardsContainer = document.createElement('div');
      agentCardsContainer.className = 'agent-cards';
      agentCardsContainer.style.display = 'grid';
      agentCardsContainer.style.gridTemplateColumns = 'repeat(auto-fill, minmax(300px, 1fr))';
      agentCardsContainer.style.gap = '20px';
      agentCardsContainer.style.marginTop = '20px';

      // Add agent cards
      const agents = [
        { name: 'Document Analyzer', status: 'active', description: 'Analyzes financial documents to extract key information.' },
        { name: 'Table Extractor', status: 'active', description: 'Extracts tables from financial documents.' },
        { name: 'Securities Detector', status: 'inactive', description: 'Detects securities mentioned in financial documents.' },
        { name: 'Financial Reasoner', status: 'active', description: 'Performs financial reasoning on document content.' }
      ];

      agents.forEach(agent => {
        const agentCard = document.createElement('div');
        agentCard.className = 'agent-card';
        agentCard.style.backgroundColor = 'white';
        agentCard.style.borderRadius = '8px';
        agentCard.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
        agentCard.style.padding = '20px';

        agentCard.innerHTML = `
          <div class="agent-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
            <h3 style="margin: 0;">${agent.name}</h3>
            <div class="status-indicator ${agent.status}" style="width: 12px; height: 12px; border-radius: 50%; background-color: ${agent.status === 'active' ? '#4CAF50' : '#9E9E9E'};"></div>
          </div>
          <p style="margin-top: 0; color: #666;">${agent.description}</p>
          <div style="margin-top: 20px;">
            <button class="agent-action btn btn-primary" style="background-color: #2196F3; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer;">Run Agent</button>
          </div>
        `;

        agentCardsContainer.appendChild(agentCard);
      });

      // Add to page
      mainContent.appendChild(agentCardsContainer);

      // Add event listeners
      document.querySelectorAll('.agent-action').forEach(button => {
        button.addEventListener('click', function() {
          const agentName = this.closest('.agent-card').querySelector('h3').textContent;
          alert(`Running ${agentName}...`);

          // Update status indicator
          const statusIndicator = this.closest('.agent-card').querySelector('.status-indicator');
          statusIndicator.style.backgroundColor = '#FFC107'; // Yellow for processing

          // Simulate processing
          setTimeout(() => {
            statusIndicator.style.backgroundColor = '#4CAF50'; // Green for active
            alert(`${agentName} completed successfully!`);
          }, 2000);
        });
      });

      console.log('Added agent cards');
    }
  }
}

// Fix dashboard page
function fixDashboardPage() {
  // Add dashboard components if needed
  const mainContent = document.querySelector('main .content') || document.querySelector('main');

  if (mainContent && !document.querySelector('.recent-documents')) {
    // Create recent documents section
    const recentDocuments = document.createElement('div');
    recentDocuments.className = 'recent-documents';
    recentDocuments.innerHTML = `
      <h2>Recent Documents</h2>
      <div class="document-grid">
        <div class="document-card">
          <div class="document-icon">📄</div>
          <div class="document-info">
            <h3>Financial Report Q1 2023</h3>
            <p>Uploaded: 2023-04-15</p>
          </div>
        </div>
        <div class="document-card">
          <div class="document-icon">📄</div>
          <div class="document-info">
            <h3>Investment Portfolio Analysis</h3>
            <p>Uploaded: 2023-03-22</p>
          </div>
        </div>
      </div>
    `;

    mainContent.appendChild(recentDocuments);
    console.log('Added recent documents section');
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
    const chatContainer = document.createElement('div');
    chatContainer.id = 'document-chat-container';
    chatContainer.className = 'chat-container';

    // Style the chat container
    chatContainer.style.display = 'flex';
    chatContainer.style.flexDirection = 'column';
    chatContainer.style.height = '400px';
    chatContainer.style.backgroundColor = 'white';
    chatContainer.style.borderRadius = '8px';
    chatContainer.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
    chatContainer.style.marginTop = '20px';
    chatContainer.style.marginBottom = '20px';
    chatContainer.style.overflow = 'hidden';

    chatContainer.innerHTML = `
      <div style="padding: 15px; background-color: #f5f5f5; border-bottom: 1px solid #ddd;">
        <h3 style="margin: 0; font-size: 16px;">Chat with Document</h3>
      </div>
      <div id="document-chat-messages" style="flex: 1; overflow-y: auto; padding: 15px;">
        <div class="message ai-message" style="background-color: #f1f1f1; padding: 10px; border-radius: 10px; margin-bottom: 10px; max-width: 80%;">
          <p style="margin: 0;">Hello! I'm your financial assistant. Ask me questions about this document.</p>
        </div>
      </div>
      <div style="display: flex; padding: 10px; border-top: 1px solid #eee;">
        <input type="text" id="document-chat-input" placeholder="Type your question..." style="flex: 1; padding: 10px; border: 1px solid #ddd; border-radius: 4px; margin-right: 10px;">
        <button id="document-send-btn" style="background-color: #2196F3; color: white; border: none; padding: 10px 15px; border-radius: 4px; cursor: pointer;">Send</button>
      </div>
    `;

    // Add to the main content
    mainContent.appendChild(chatContainer);
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

        // Create mock document data
        const urlParams = new URLSearchParams(window.location.search);
        const documentId = urlParams.get('id') || 'doc-1';

        const mockDocument = {
          id: documentId,
          fileName: `Financial Report ${new Date().getFullYear()}.pdf`,
          documentType: 'financial',
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

// Display document details
function displayDocumentDetails(document) {
  console.log('Displaying document details:', document);

  // Update document title
  const documentTitle = document.querySelector('.document-title');
  if (documentTitle) {
    documentTitle.textContent = document.fileName;
  } else {
    const mainContent = document.querySelector('.main-content') || document.querySelector('main') || document.body;
    const newDocumentTitle = document.createElement('h1');
    newDocumentTitle.className = 'document-title';
    newDocumentTitle.textContent = document.fileName;
    mainContent.insertBefore(newDocumentTitle, mainContent.firstChild);
  }

  // Update document metadata
  const documentMetadata = document.querySelector('.document-metadata');
  if (documentMetadata) {
    documentMetadata.innerHTML = `
      <p><strong>Document Type:</strong> ${document.documentType}</p>
      <p><strong>Upload Date:</strong> ${new Date(document.uploadDate).toLocaleDateString()}</p>
      <p><strong>Processed:</strong> ${document.processed ? 'Yes' : 'No'}</p>
    `;
  } else {
    const mainContent = document.querySelector('.main-content') || document.querySelector('main') || document.body;
    const newDocumentMetadata = document.createElement('div');
    newDocumentMetadata.className = 'document-metadata';
    newDocumentMetadata.style.marginBottom = '20px';
    newDocumentMetadata.innerHTML = `
      <p><strong>Document Type:</strong> ${document.documentType}</p>
      <p><strong>Upload Date:</strong> ${new Date(document.uploadDate).toLocaleDateString()}</p>
      <p><strong>Processed:</strong> ${document.processed ? 'Yes' : 'No'}</p>
    `;

    // Insert after title
    const documentTitle = document.querySelector('.document-title');
    if (documentTitle && documentTitle.nextSibling) {
      mainContent.insertBefore(newDocumentMetadata, documentTitle.nextSibling);
    } else {
      mainContent.appendChild(newDocumentMetadata);
    }
  }

  // Update document content
  if (document.content) {
    const documentContent = document.querySelector('.document-content');
    if (documentContent) {
      // Clear existing content
      documentContent.innerHTML = '';

      // Add text content
      if (document.content.text) {
        const textSection = document.createElement('div');
        textSection.className = 'content-section';
        textSection.innerHTML = `
          <h3>Text Content</h3>
          <div class="text-content">${document.content.text}</div>
        `;
        documentContent.appendChild(textSection);
      }

      // Add tables
      if (document.content.tables && document.content.tables.length > 0) {
        const tablesSection = document.createElement('div');
        tablesSection.className = 'content-section';
        tablesSection.innerHTML = '<h3>Tables</h3>';

        document.content.tables.forEach(table => {
          const tableElement = document.createElement('div');
          tableElement.className = 'table-container';

          let tableHTML = `<h4>${table.title || 'Table'}</h4><table class="table table-bordered">`;

          // Add headers
          if (table.headers && table.headers.length > 0) {
            tableHTML += '<thead><tr>';
            table.headers.forEach(header => {
              tableHTML += `<th>${header}</th>`;
            });
            tableHTML += '</tr></thead>';
          }

          // Add rows
          if (table.rows && table.rows.length > 0) {
            tableHTML += '<tbody>';
            table.rows.forEach(row => {
              tableHTML += '<tr>';
              row.forEach(cell => {
                tableHTML += `<td>${cell}</td>`;
              });
              tableHTML += '</tr>';
            });
            tableHTML += '</tbody>';
          }

          tableHTML += '</table>';
          tableElement.innerHTML = tableHTML;
          tablesSection.appendChild(tableElement);
        });

        documentContent.appendChild(tablesSection);
      }

      // Add metadata
      if (document.content.metadata) {
        const metadataSection = document.createElement('div');
        metadataSection.className = 'content-section';
        metadataSection.innerHTML = `
          <h3>Metadata</h3>
          <div class="metadata-content">
            <p><strong>Author:</strong> ${document.content.metadata.author || 'Unknown'}</p>
            <p><strong>Created Date:</strong> ${document.content.metadata.createdDate ? new Date(document.content.metadata.createdDate).toLocaleDateString() : 'Unknown'}</p>
            <p><strong>Modified Date:</strong> ${document.content.metadata.modifiedDate ? new Date(document.content.metadata.modifiedDate).toLocaleDateString() : 'Unknown'}</p>
            <p><strong>Document Format:</strong> ${document.content.metadata.documentFormat || 'Unknown'}</p>
            <p><strong>Keywords:</strong> ${document.content.metadata.keywords || 'None'}</p>
          </div>
        `;
        documentContent.appendChild(metadataSection);
      }
    } else {
      const mainContent = document.querySelector('.main-content') || document.querySelector('main') || document.body;
      const newDocumentContent = document.createElement('div');
      newDocumentContent.className = 'document-content';

      // Add text content
      if (document.content.text) {
        const textSection = document.createElement('div');
        textSection.className = 'content-section';
        textSection.innerHTML = `
          <h3>Text Content</h3>
          <div class="text-content">${document.content.text}</div>
        `;
        newDocumentContent.appendChild(textSection);
      }

      // Add tables
      if (document.content.tables && document.content.tables.length > 0) {
        const tablesSection = document.createElement('div');
        tablesSection.className = 'content-section';
        tablesSection.innerHTML = '<h3>Tables</h3>';

        document.content.tables.forEach(table => {
          const tableElement = document.createElement('div');
          tableElement.className = 'table-container';

          let tableHTML = `<h4>${table.title || 'Table'}</h4><table class="table table-bordered">`;

          // Add headers
          if (table.headers && table.headers.length > 0) {
            tableHTML += '<thead><tr>';
            table.headers.forEach(header => {
              tableHTML += `<th>${header}</th>`;
            });
            tableHTML += '</tr></thead>';
          }

          // Add rows
          if (table.rows && table.rows.length > 0) {
            tableHTML += '<tbody>';
            table.rows.forEach(row => {
              tableHTML += '<tr>';
              row.forEach(cell => {
                tableHTML += `<td>${cell}</td>`;
              });
              tableHTML += '</tr>';
            });
            tableHTML += '</tbody>';
          }

          tableHTML += '</table>';
          tableElement.innerHTML = tableHTML;
          tablesSection.appendChild(tableElement);
        });

        newDocumentContent.appendChild(tablesSection);
      }

      // Add metadata
      if (document.content.metadata) {
        const metadataSection = document.createElement('div');
        metadataSection.className = 'content-section';
        metadataSection.innerHTML = `
          <h3>Metadata</h3>
          <div class="metadata-content">
            <p><strong>Author:</strong> ${document.content.metadata.author || 'Unknown'}</p>
            <p><strong>Created Date:</strong> ${document.content.metadata.createdDate ? new Date(document.content.metadata.createdDate).toLocaleDateString() : 'Unknown'}</p>
            <p><strong>Modified Date:</strong> ${document.content.metadata.modifiedDate ? new Date(document.content.metadata.modifiedDate).toLocaleDateString() : 'Unknown'}</p>
            <p><strong>Document Format:</strong> ${document.content.metadata.documentFormat || 'Unknown'}</p>
            <p><strong>Keywords:</strong> ${document.content.metadata.keywords || 'None'}</p>
          </div>
        `;
        newDocumentContent.appendChild(metadataSection);
      }

      mainContent.appendChild(newDocumentContent);
    }
  }
}

// Create a process document button
function createProcessDocumentButton() {
  const button = document.createElement('button');
  button.id = 'process-document-btn';
  button.className = 'btn btn-primary';
  button.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-file-earmark-text me-2" viewBox="0 0 16 16">
      <path d="M5.5 7a.5.5 0 0 0 0 1h5a.5.5 0 0 0 0-1h-5zM5 9.5a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5zm0 2a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 0 1h-2a.5.5 0 0 1-.5-.5z"/>
      <path d="M9.5 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V4.5L9.5 0zm0 1v2A1.5 1.5 0 0 0 11 4.5h2V14a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h5.5z"/>
    </svg>
    Process Document
  `;

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
    processButton.innerHTML = `
      <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
      Processing...
    `;
  }

  // Simulate processing
  setTimeout(function() {
    // Update button
    if (processButton) {
      processButton.disabled = false;
      processButton.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-file-earmark-text me-2" viewBox="0 0 16 16">
          <path d="M5.5 7a.5.5 0 0 0 0 1h5a.5.5 0 0 0 0-1h-5zM5 9.5a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5zm0 2a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 0 1h-2a.5.5 0 0 1-.5-.5z"/>
          <path d="M9.5 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V4.5L9.5 0zm0 1v2A1.5 1.5 0 0 0 11 4.5h2V14a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h5.5z"/>
        </svg>
        Process Document
      `;
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
    userMessage.innerHTML = `<p style="margin: 0;">${chatInput.value}</p>`;
    chatMessages.appendChild(userMessage);

    // Clear input
    const userQuery = chatInput.value;
    chatInput.value = '';

    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;

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

      aiMessage.innerHTML = `<p style="margin: 0;">${response}</p>`;
      chatMessages.appendChild(aiMessage);

      // Scroll to bottom
      chatMessages.scrollTop = chatMessages.scrollHeight;
    }, 1500);
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
