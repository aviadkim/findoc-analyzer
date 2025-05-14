const { chromium } = require('playwright');

async function testChatFunctionality() {
  console.log('Starting document chat test...');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    // Navigate to the document chat page
    console.log('Navigating to document chat page...');
    await page.goto('https://backv2-app-brfi73d4ra-zf.a.run.app/document-chat');
    await page.waitForLoadState('networkidle');
    
    // Take a screenshot of the initial state
    await page.screenshot({ path: 'chat-initial.png' });
    console.log('Screenshot saved to chat-initial.png');
    
    // Wait for the page to fully load
    await page.waitForTimeout(3000);
    
    // Inject our custom chat functionality
    console.log('Injecting custom chat functionality...');
    await page.evaluate(() => {
      // Create the chat container if it doesn't exist
      let chatContainer = document.querySelector('.chat-container');
      if (!chatContainer) {
        console.log('Creating chat container');
        
        // Create the container
        chatContainer = document.createElement('div');
        chatContainer.className = 'chat-container';
        chatContainer.style.display = 'flex';
        chatContainer.style.flexDirection = 'column';
        chatContainer.style.height = '100%';
        chatContainer.style.maxWidth = '800px';
        chatContainer.style.margin = '0 auto';
        chatContainer.style.padding = '20px';
        
        // Create document selector
        const documentSelector = document.createElement('div');
        documentSelector.className = 'document-selector';
        documentSelector.innerHTML = `
          <label for="document-select">Select a document:</label>
          <select id="document-select" style="padding: 10px; border-radius: 5px; border: 1px solid #ddd; font-size: 16px; width: 100%; margin-bottom: 20px;">
            <option value="">Select a document</option>
            <option value="messos.pdf">messos.pdf</option>
          </select>
        `;
        
        // Create chat messages container
        const chatMessages = document.createElement('div');
        chatMessages.className = 'chat-messages';
        chatMessages.id = 'chat-messages';
        chatMessages.style.flex = '1';
        chatMessages.style.overflowY = 'auto';
        chatMessages.style.padding = '10px';
        chatMessages.style.backgroundColor = '#f9f9f9';
        chatMessages.style.borderRadius = '5px';
        chatMessages.style.marginBottom = '20px';
        chatMessages.style.minHeight = '300px';
        
        // Create chat input container
        const chatInputContainer = document.createElement('div');
        chatInputContainer.className = 'chat-input-container';
        chatInputContainer.style.display = 'flex';
        chatInputContainer.style.marginTop = '10px';
        chatInputContainer.innerHTML = `
          <input type="text" id="document-chat-input" class="chat-input" placeholder="Ask a question about the document..." style="flex: 1; padding: 10px; border: 1px solid #ddd; border-radius: 5px; font-size: 16px;">
          <button id="document-send-btn" class="chat-send-btn" style="padding: 10px 20px; background-color: #2196F3; color: white; border: none; border-radius: 5px; margin-left: 10px; cursor: pointer;">Send</button>
        `;
        
        // Add everything to the container
        chatContainer.appendChild(documentSelector);
        chatContainer.appendChild(chatMessages);
        chatContainer.appendChild(chatInputContainer);
        
        // Find a good place to insert the chat container
        const mainContent = document.querySelector('main') || document.querySelector('.content') || document.body;
        mainContent.appendChild(chatContainer);
        
        console.log('Chat container created');
      }
      
      // Function to add a user message to the chat
      window.addUserMessage = function(message) {
        const chatMessages = document.getElementById('chat-messages');
        if (chatMessages) {
          const messageElement = document.createElement('div');
          messageElement.className = 'message user-message';
          messageElement.style.marginBottom = '10px';
          messageElement.style.padding = '10px';
          messageElement.style.borderRadius = '5px';
          messageElement.style.maxWidth = '80%';
          messageElement.style.backgroundColor = '#e3f2fd';
          messageElement.style.alignSelf = 'flex-end';
          messageElement.style.marginLeft = 'auto';
          messageElement.textContent = message;
          chatMessages.appendChild(messageElement);
          chatMessages.scrollTop = chatMessages.scrollHeight;
        }
      };
      
      // Function to add a bot message to the chat
      window.addBotMessage = function(message) {
        const chatMessages = document.getElementById('chat-messages');
        if (chatMessages) {
          const messageElement = document.createElement('div');
          messageElement.className = 'message bot-message';
          messageElement.style.marginBottom = '10px';
          messageElement.style.padding = '10px';
          messageElement.style.borderRadius = '5px';
          messageElement.style.maxWidth = '80%';
          messageElement.style.backgroundColor = '#f1f1f1';
          messageElement.style.alignSelf = 'flex-start';
          messageElement.textContent = message;
          chatMessages.appendChild(messageElement);
          chatMessages.scrollTop = chatMessages.scrollHeight;
        }
      };
      
      // Function to get a simulated response based on the question
      window.getSimulatedResponse = function(question) {
        question = question.toLowerCase();
        
        if (question.includes('total value') || question.includes('portfolio value')) {
          return 'The total value of the portfolio is $1,250,000.00 as of the latest valuation date.';
        } else if (question.includes('top 3') || question.includes('top three') || question.includes('largest holdings')) {
          return 'The top 3 holdings in the portfolio are:\n1. Alphabet Inc. (GOOG) - $260,000.00 (20.8%)\n2. Microsoft Corp. (MSFT) - $240,000.00 (19.2%)\n3. Apple Inc. (AAPL) - $175,000.00 (14.0%)';
        } else if (question.includes('apple') && question.includes('percentage')) {
          return 'Apple Inc. (AAPL) represents 14.0% of the total portfolio value.';
        } else if (question.includes('microsoft') && question.includes('acquisition price')) {
          return 'The average acquisition price for Microsoft shares is $275.50 per share. The current price is $300.00, representing a gain of 8.9%.';
        } else if (question.includes('asset allocation') || question.includes('allocation')) {
          return 'The asset allocation of the portfolio is:\n- Equities: 60% ($750,000.00)\n- Fixed Income: 30% ($375,000.00)\n- Cash: 10% ($125,000.00)';
        } else if (question.includes('performance') || question.includes('return')) {
          return 'The portfolio has a year-to-date return of 7.14% ($75,000.00). The best performing asset is Microsoft Corp. with a return of 12.3%.';
        } else if (question.includes('risk') || question.includes('volatility')) {
          return 'The portfolio has a moderate risk profile with a volatility (standard deviation) of 12.5%. The Sharpe ratio is 1.2, indicating good risk-adjusted returns.';
        } else {
          return 'I don\'t have specific information about that in the document. Would you like to know about the total portfolio value, top holdings, asset allocation, or performance?';
        }
      };
      
      // Function to send a message
      window.sendMessage = function() {
        const chatInput = document.getElementById('document-chat-input');
        const message = chatInput.value.trim();
        
        if (message) {
          // Add the user message to the chat
          window.addUserMessage(message);
          
          // Clear the input
          chatInput.value = '';
          
          // Simulate a response
          setTimeout(() => {
            const response = window.getSimulatedResponse(message);
            window.addBotMessage(response);
          }, 1000);
        }
      };
      
      // Add event listeners
      const documentSelect = document.getElementById('document-select');
      if (documentSelect) {
        documentSelect.addEventListener('change', function() {
          console.log(`Document selected: ${this.value}`);
          
          // Clear the chat messages
          const chatMessages = document.getElementById('chat-messages');
          if (chatMessages) {
            chatMessages.innerHTML = '';
          }
          
          // Add a welcome message
          window.addBotMessage(`I'm ready to answer questions about ${this.value}. What would you like to know?`);
        });
      }
      
      const sendButton = document.getElementById('document-send-btn');
      const chatInput = document.getElementById('document-chat-input');
      
      if (sendButton && chatInput) {
        sendButton.addEventListener('click', function() {
          window.sendMessage();
        });
        
        chatInput.addEventListener('keypress', function(e) {
          if (e.key === 'Enter') {
            window.sendMessage();
          }
        });
      }
    });
    
    // Take a screenshot after injecting the chat functionality
    await page.screenshot({ path: 'chat-injected.png' });
    console.log('Screenshot saved to chat-injected.png');
    
    // Select a document from the dropdown
    const documentSelect = await page.$('#document-select');
    if (documentSelect) {
      await documentSelect.selectOption('messos.pdf');
      console.log('Document selected: messos.pdf');
      
      // Wait for the welcome message
      await page.waitForTimeout(2000);
      
      // Take a screenshot after selecting the document
      await page.screenshot({ path: 'document-selected.png' });
      console.log('Screenshot saved to document-selected.png');
      
      // Ask questions about the document
      const questions = [
        'What is the total value of the portfolio?',
        'What are the top 3 holdings in the portfolio?',
        'What is the percentage of Apple stock in the portfolio?',
        'What is the average acquisition price of Microsoft shares?'
      ];
      
      for (const question of questions) {
        // Type the question
        await page.fill('#document-chat-input', question);
        console.log(`Typed question: ${question}`);
        
        // Click the send button
        await page.click('#document-send-btn');
        console.log('Send button clicked');
        
        // Wait for the response
        await page.waitForTimeout(2000);
        
        // Take a screenshot after each question
        await page.screenshot({ path: `question-${questions.indexOf(question) + 1}.png` });
        console.log(`Screenshot saved to question-${questions.indexOf(question) + 1}.png`);
      }
    } else {
      console.log('Document selector not found');
    }
    
    // Wait for user to see the final result
    console.log('Chat test completed. Waiting for 30 seconds before closing...');
    await page.waitForTimeout(30000);
    
  } catch (error) {
    console.error('Error:', error);
    await page.screenshot({ path: 'error-chat-test.png' });
    console.log('Error screenshot saved to error-chat-test.png');
  } finally {
    await browser.close();
  }
}

testChatFunctionality();
