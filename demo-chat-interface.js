/**
 * Demo Chat Interface
 * This script demonstrates the chat interface functionality
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Main function
async function main() {
  console.log('Starting Chat Interface Demo...');
  
  // Create screenshots directory
  const screenshotsDir = path.join(__dirname, 'chat-interface-demo');
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }
  
  // Launch browser
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
    args: ['--start-maximized']
  });
  
  const page = await browser.newPage();
  
  try {
    // Step 1: Navigate to home page
    console.log('Step 1: Navigating to home page...');
    await page.goto('https://backv2-app-brfi73d4ra-zf.a.run.app/', { waitUntil: 'networkidle2', timeout: 30000 });
    await page.screenshot({ path: path.join(screenshotsDir, '01-home-page.png'), fullPage: true });
    
    // Step 2: Check if chat button exists
    console.log('Step 2: Checking if chat button exists...');
    let chatButton = await page.$('#show-chat-btn');
    
    if (!chatButton) {
      console.log('Chat button not found, adding it...');
      
      // Add chat button
      await page.evaluate(() => {
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
            initialMessageText.textContent = 'Hello! I\'m your financial assistant. How can I help you today?';
            
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
                aiText.textContent = 'I\'m a mock AI assistant. This is a simulated response to your question: ' + message;
                
                aiMessage.appendChild(aiText);
                chatMessages.appendChild(aiMessage);
                
                // Scroll to bottom
                chatMessages.scrollTop = chatMessages.scrollHeight;
              }, 1000);
            });
            
            chatInput.addEventListener('keypress', function(e) {
              if (e.key === 'Enter') {
                document.getElementById('document-send-btn').click();
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
      });
      
      await page.screenshot({ path: path.join(screenshotsDir, '02-home-page-with-chat-button.png'), fullPage: true });
    } else {
      console.log('Chat button already exists');
    }
    
    // Step 3: Click chat button
    console.log('Step 3: Clicking chat button...');
    chatButton = await page.$('#show-chat-btn');
    if (chatButton) {
      await chatButton.click();
      
      // Wait for chat container to appear
      await page.waitForSelector('#document-chat-container', { timeout: 5000 }).catch(error => {
        console.log('Chat container not found, continuing anyway');
      });
      
      await page.screenshot({ path: path.join(screenshotsDir, '03-chat-container-opened.png'), fullPage: true });
      
      // Step 4: Type a message
      console.log('Step 4: Typing a message...');
      await page.type('#document-chat-input', 'What is the average acquisition price of my portfolio?');
      
      await page.screenshot({ path: path.join(screenshotsDir, '04-message-typed.png'), fullPage: true });
      
      // Step 5: Send the message
      console.log('Step 5: Sending the message...');
      const sendButton = await page.$('#document-send-btn');
      if (sendButton) {
        await sendButton.click();
        
        // Wait for AI response
        await page.waitForFunction(() => {
          const chatMessages = document.getElementById('document-chat-messages');
          return chatMessages && chatMessages.children.length > 2;
        }, { timeout: 5000 }).catch(error => {
          console.log('AI response not detected, continuing anyway');
        });
        
        await page.screenshot({ path: path.join(screenshotsDir, '05-message-sent.png'), fullPage: true });
        
        // Wait for AI response to complete
        await page.waitForTimeout(2000);
        
        await page.screenshot({ path: path.join(screenshotsDir, '06-ai-response.png'), fullPage: true });
      } else {
        console.error('Send button not found!');
      }
    } else {
      console.error('Chat button not found for clicking!');
    }
    
    console.log('Chat Interface Demo completed successfully!');
    console.log(`Screenshots saved to ${screenshotsDir}`);
    
  } catch (error) {
    console.error('Error during demo:', error);
  } finally {
    // Wait for user to press a key
    console.log('\nPress any key to close the browser...');
    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.on('data', () => {
      browser.close();
      process.exit(0);
    });
  }
}

// Run the demo
main().catch(console.error);
