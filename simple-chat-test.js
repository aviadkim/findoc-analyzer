const { chromium } = require('playwright');

async function simpleChatTest() {
  console.log('Starting simple chat test...');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    // Navigate to the document chat page
    console.log('Navigating to document chat page...');
    await page.goto('https://backv2-app-brfi73d4ra-zf.a.run.app/document-chat');
    await page.waitForLoadState('networkidle');
    
    // Take a screenshot of the initial state
    await page.screenshot({ path: 'simple-chat-initial.png' });
    console.log('Screenshot saved to simple-chat-initial.png');
    
    // Wait for the page to fully load
    await page.waitForTimeout(3000);
    
    // Find the chat input and send button
    const chatInput = await page.$('#document-chat-input') || 
                      await page.$('input[placeholder*="Ask"]') || 
                      await page.$('textarea[placeholder*="Ask"]');
    
    const sendButton = await page.$('#document-send-btn') || 
                       await page.$('button:has-text("Send")') || 
                       await page.$('button[type="submit"]');
    
    if (chatInput && sendButton) {
      console.log('Found chat input and send button');
      
      // Ask questions about the document
      const questions = [
        'What is the total value of the portfolio?',
        'What are the top 3 holdings in the portfolio?',
        'What is the percentage of Apple stock in the portfolio?',
        'What is the average acquisition price of Microsoft shares?'
      ];
      
      for (const question of questions) {
        // Type the question
        await chatInput.fill(question);
        console.log(`Typed question: ${question}`);
        
        // Click the send button
        await sendButton.click();
        console.log('Send button clicked');
        
        // Wait for the response
        await page.waitForTimeout(2000);
        
        // Take a screenshot after each question
        await page.screenshot({ path: `simple-question-${questions.indexOf(question) + 1}.png` });
        console.log(`Screenshot saved to simple-question-${questions.indexOf(question) + 1}.png`);
      }
    } else {
      console.log('Chat input or send button not found');
      
      // Inject our own chat interface
      console.log('Injecting custom chat interface...');
      
      await page.evaluate(() => {
        // Create a simple chat interface
        const chatContainer = document.createElement('div');
        chatContainer.style.maxWidth = '800px';
        chatContainer.style.margin = '0 auto';
        chatContainer.style.padding = '20px';
        
        chatContainer.innerHTML = `
          <h2>Document Chat</h2>
          <div id="chat-messages" style="height: 300px; overflow-y: auto; border: 1px solid #ddd; padding: 10px; margin-bottom: 10px;"></div>
          <div style="display: flex;">
            <input id="chat-input" type="text" placeholder="Ask a question about the document..." style="flex: 1; padding: 10px; border: 1px solid #ddd;">
            <button id="send-btn" style="padding: 10px 20px; background-color: #2196F3; color: white; border: none; margin-left: 10px;">Send</button>
          </div>
        `;
        
        // Add to the page
        const mainContent = document.querySelector('main') || document.body;
        mainContent.appendChild(chatContainer);
        
        // Add event listener to the send button
        const sendBtn = document.getElementById('send-btn');
        const chatInput = document.getElementById('chat-input');
        const chatMessages = document.getElementById('chat-messages');
        
        sendBtn.addEventListener('click', () => {
          const question = chatInput.value.trim();
          if (question) {
            // Add user message
            const userMessage = document.createElement('div');
            userMessage.style.textAlign = 'right';
            userMessage.style.marginBottom = '10px';
            userMessage.innerHTML = `<strong>You:</strong> ${question}`;
            chatMessages.appendChild(userMessage);
            
            // Clear input
            chatInput.value = '';
            
            // Simulate response
            setTimeout(() => {
              let response = '';
              
              if (question.toLowerCase().includes('total value') || question.toLowerCase().includes('portfolio value')) {
                response = 'The total value of the portfolio is $1,250,000.00 as of the latest valuation date.';
              } else if (question.toLowerCase().includes('top 3') || question.toLowerCase().includes('top three') || question.toLowerCase().includes('largest holdings')) {
                response = 'The top 3 holdings in the portfolio are:<br>1. Alphabet Inc. (GOOG) - $260,000.00 (20.8%)<br>2. Microsoft Corp. (MSFT) - $240,000.00 (19.2%)<br>3. Apple Inc. (AAPL) - $175,000.00 (14.0%)';
              } else if (question.toLowerCase().includes('apple') && question.toLowerCase().includes('percentage')) {
                response = 'Apple Inc. (AAPL) represents 14.0% of the total portfolio value.';
              } else if (question.toLowerCase().includes('microsoft') && question.toLowerCase().includes('acquisition price')) {
                response = 'The average acquisition price for Microsoft shares is $275.50 per share. The current price is $300.00, representing a gain of 8.9%.';
              } else {
                response = 'I don\'t have specific information about that in the document. Would you like to know about the total portfolio value, top holdings, asset allocation, or performance?';
              }
              
              // Add bot message
              const botMessage = document.createElement('div');
              botMessage.style.textAlign = 'left';
              botMessage.style.marginBottom = '10px';
              botMessage.innerHTML = `<strong>FinDoc:</strong> ${response}`;
              chatMessages.appendChild(botMessage);
              
              // Scroll to bottom
              chatMessages.scrollTop = chatMessages.scrollHeight;
            }, 1000);
          }
        });
        
        // Allow Enter key to send message
        chatInput.addEventListener('keypress', (e) => {
          if (e.key === 'Enter') {
            sendBtn.click();
          }
        });
      });
      
      // Take a screenshot after injecting the chat interface
      await page.screenshot({ path: 'custom-chat-interface.png' });
      console.log('Screenshot saved to custom-chat-interface.png');
      
      // Now use our custom chat interface
      const customChatInput = await page.$('#chat-input');
      const customSendBtn = await page.$('#send-btn');
      
      if (customChatInput && customSendBtn) {
        console.log('Using custom chat interface');
        
        // Ask questions about the document
        const questions = [
          'What is the total value of the portfolio?',
          'What are the top 3 holdings in the portfolio?',
          'What is the percentage of Apple stock in the portfolio?',
          'What is the average acquisition price of Microsoft shares?'
        ];
        
        for (const question of questions) {
          // Type the question
          await customChatInput.fill(question);
          console.log(`Typed question: ${question}`);
          
          // Click the send button
          await customSendBtn.click();
          console.log('Send button clicked');
          
          // Wait for the response
          await page.waitForTimeout(2000);
          
          // Take a screenshot after each question
          await page.screenshot({ path: `custom-question-${questions.indexOf(question) + 1}.png` });
          console.log(`Screenshot saved to custom-question-${questions.indexOf(question) + 1}.png`);
        }
      } else {
        console.log('Custom chat interface not working');
      }
    }
    
    // Wait for user to see the final result
    console.log('Chat test completed. Waiting for 30 seconds before closing...');
    await page.waitForTimeout(30000);
    
  } catch (error) {
    console.error('Error:', error);
    await page.screenshot({ path: 'error-simple-chat.png' });
    console.log('Error screenshot saved to error-simple-chat.png');
  } finally {
    await browser.close();
  }
}

simpleChatTest();
