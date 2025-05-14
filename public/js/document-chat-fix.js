/**
 * Document Chat Fix
 * This script fixes the document chat functionality
 */

(function() {
  console.log('Document Chat Fix loaded');

  // Wait for DOM to be ready
  document.addEventListener('DOMContentLoaded', function() {
    initDocumentChat();
  });

  // Initialize document chat
  function initDocumentChat() {
    console.log('Initializing document chat');

    // Get elements
    const chatContainer = document.getElementById('document-chat-container');
    const showChatBtn = document.getElementById('show-chat-btn');
    const sendBtn = document.getElementById('send-btn');
    const documentSendBtn = document.getElementById('document-send-btn');
    const questionInput = document.getElementById('question-input');
    const chatMessages = document.getElementById('chat-messages');
    const documentSelect = document.getElementById('document-select');

    // If we're on the document chat page, show the chat container
    if (document.body.classList.contains('document-chat-page')) {
      if (chatContainer) {
        chatContainer.style.display = 'block';
        chatContainer.style.position = 'static';
        chatContainer.style.width = '100%';
        chatContainer.style.maxWidth = '800px';
        chatContainer.style.margin = '20px auto';
      }

      // Hide show chat button on document chat page
      if (showChatBtn) {
        showChatBtn.style.display = 'none';
      }

      // Use document send button instead of regular send button
      if (sendBtn && documentSendBtn) {
        sendBtn.style.display = 'none';
        documentSendBtn.style.display = 'block';
      }
    }

    // Show/hide chat container when show chat button is clicked
    if (showChatBtn && chatContainer) {
      showChatBtn.addEventListener('click', function() {
        if (chatContainer.style.display === 'none' || chatContainer.style.display === '') {
          chatContainer.style.display = 'block';
        } else {
          chatContainer.style.display = 'none';
        }
      });
    }

    // Send message when send button is clicked
    if (sendBtn && questionInput && chatMessages) {
      sendBtn.addEventListener('click', function() {
        sendMessage();
      });
    }

    // Send message when document send button is clicked
    if (documentSendBtn && questionInput && chatMessages) {
      documentSendBtn.addEventListener('click', function() {
        sendDocumentMessage();
      });
    }

    // Send message when Enter key is pressed in question input
    if (questionInput) {
      questionInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          if (document.body.classList.contains('document-chat-page')) {
            sendDocumentMessage();
          } else {
            sendMessage();
          }
        }
      });
    }

    // Handle document selection
    if (documentSelect) {
      documentSelect.addEventListener('change', function() {
        console.log('Selected document: ' + this.value);
        // Clear previous messages except the first one
        if (chatMessages) {
          const messages = chatMessages.querySelectorAll('.message');
          if (messages.length > 1) {
            for (let i = 1; i < messages.length; i++) {
              messages[i].remove();
            }
          }
          
          // Update greeting message
          const greeting = chatMessages.querySelector('.message.ai-message p');
          if (greeting) {
            const documentName = this.options[this.selectedIndex].text;
            greeting.textContent = 'Hello! I\'m your financial assistant. I can help you with "' + documentName + '". What would you like to know?';
          }
        }
      });
    }

    // Function to send a regular message
    function sendMessage() {
      const message = questionInput.value.trim();
      if (message) {
        // Add user message to chat
        addMessage(message, 'user');
        
        // Clear input
        questionInput.value = '';
        
        // Simulate AI response
        setTimeout(function() {
          const response = getSimulatedResponse(message);
          addMessage(response, 'ai');
        }, 1000);
      }
    }

    // Function to send a document-specific message
    function sendDocumentMessage() {
      const message = questionInput.value.trim();
      if (message) {
        // Add user message to chat
        addMessage(message, 'user');
        
        // Clear input
        questionInput.value = '';
        
        // Get selected document
        const documentId = documentSelect ? documentSelect.value : null;
        
        // Simulate AI response based on document
        setTimeout(function() {
          const response = getDocumentResponse(message, documentId);
          addMessage(response, 'ai');
        }, 1000);
      }
    }

    // Function to add a message to the chat
    function addMessage(message, sender) {
      const messageElement = document.createElement('div');
      messageElement.classList.add('message');
      messageElement.classList.add(sender + '-message');
      
      const messageText = document.createElement('p');
      messageText.style.margin = '0';
      messageText.textContent = message;
      
      messageElement.appendChild(messageText);
      chatMessages.appendChild(messageElement);
      
      // Scroll to bottom
      chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // Function to get a simulated response
    function getSimulatedResponse(message) {
      // Simple responses based on keywords
      if (message.toLowerCase().includes('hello') || message.toLowerCase().includes('hi')) {
        return 'Hello! How can I help you today?';
      } else if (message.toLowerCase().includes('help')) {
        return 'I can help you analyze financial documents, extract information, and answer questions about your portfolio.';
      } else if (message.toLowerCase().includes('document')) {
        return 'You can upload documents on the upload page and then process them to extract information.';
      } else if (message.toLowerCase().includes('portfolio')) {
        return 'I can help you analyze your investment portfolio, track performance, and provide insights.';
      } else {
        return 'I\'m sorry, I don\'t have enough information to answer that question. Please try asking something else.';
      }
    }

    // Function to get a document-specific response
    function getDocumentResponse(message, documentId) {
      // Document-specific responses based on keywords
      if (documentId === 'doc-1') {
        // Financial Report 2023.pdf
        if (message.toLowerCase().includes('revenue')) {
          return 'The total revenue is $10,500,000.';
        } else if (message.toLowerCase().includes('profit')) {
          return 'The net profit is $3,300,000 with a profit margin of 31.4%.';
        } else if (message.toLowerCase().includes('asset')) {
          return 'The total assets are $25,000,000.';
        } else if (message.toLowerCase().includes('liabilit')) {
          return 'The total liabilities are $12,000,000.';
        } else if (message.toLowerCase().includes('equity')) {
          return 'The shareholders\' equity is $13,000,000.';
        } else if (message.toLowerCase().includes('apple') || message.toLowerCase().includes('microsoft') || message.toLowerCase().includes('amazon') || message.toLowerCase().includes('tesla') || message.toLowerCase().includes('google')) {
          return 'The investment portfolio includes holdings in Apple Inc., Microsoft, Amazon, Tesla, and Google. Would you like specific details about any of these securities?';
        } else {
          return 'Based on the Financial Report 2023, I can provide information about revenue, profit, assets, liabilities, equity, and the investment portfolio. What specific information are you looking for?';
        }
      } else if (documentId === 'doc-2') {
        // Investment Portfolio.pdf
        if (message.toLowerCase().includes('value')) {
          return 'The total portfolio value is $1,250,000.';
        } else if (message.toLowerCase().includes('return')) {
          return 'The annual return is 8.5%.';
        } else if (message.toLowerCase().includes('risk')) {
          return 'The risk level is Moderate.';
        } else if (message.toLowerCase().includes('allocation') || message.toLowerCase().includes('asset')) {
          return 'The asset allocation is 60% Stocks ($750,000), 30% Bonds ($375,000), and 10% Cash ($125,000).';
        } else {
          return 'Based on the Investment Portfolio document, I can provide information about the portfolio value, annual return, risk level, and asset allocation. What specific information are you looking for?';
        }
      } else if (documentId === 'doc-3') {
        // Tax Documents 2023.pdf
        if (message.toLowerCase().includes('income')) {
          return 'The total income is $120,000, with $100,000 from Salary, $15,000 from Dividends, and $5,000 from Interest.';
        } else if (message.toLowerCase().includes('deduction')) {
          return 'The total deductions are $25,000.';
        } else if (message.toLowerCase().includes('taxable')) {
          return 'The taxable income is $95,000.';
        } else if (message.toLowerCase().includes('tax due') || message.toLowerCase().includes('owe')) {
          return 'The tax due is $23,750.';
        } else {
          return 'Based on the Tax Documents 2023, I can provide information about income, deductions, taxable income, and tax due. What specific information are you looking for?';
        }
      } else {
        return 'I don\'t have enough information about this document to answer your question. Please try selecting a different document or asking a more general question.';
      }
    }
  }
})();
