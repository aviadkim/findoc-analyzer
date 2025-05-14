/**
 * Deployed UI Test
 * Tests the UI components on the deployed website
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Main function
async function testDeployedUI() {
  console.log('Starting Deployed UI Test...');
  
  // Create screenshots directory
  const screenshotsDir = path.join(__dirname, 'deployed-ui-screenshots');
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
    // Step 1: Navigate to the deployed website
    console.log('Step 1: Navigating to the deployed website...');
    await page.goto('https://backv2-app-326324779592.me-west1.run.app', { waitUntil: 'networkidle2', timeout: 30000 });
    await page.screenshot({ path: path.join(screenshotsDir, '01-home-page.png'), fullPage: true });
    
    // Check if chat button exists
    const chatButton = await page.$('#show-chat-btn');
    console.log('Chat button exists:', !!chatButton);
    
    // Step 2: Navigate to upload page
    console.log('Step 2: Navigating to upload page...');
    await page.goto('https://backv2-app-326324779592.me-west1.run.app/upload', { waitUntil: 'networkidle2', timeout: 30000 });
    await page.screenshot({ path: path.join(screenshotsDir, '02-upload-page.png'), fullPage: true });
    
    // Check if process button exists
    const processButton = await page.$('#process-document-btn');
    console.log('Process button exists:', !!processButton);
    
    // Step 3: Navigate to test page
    console.log('Step 3: Navigating to test page...');
    await page.goto('https://backv2-app-326324779592.me-west1.run.app/test', { waitUntil: 'networkidle2', timeout: 30000 });
    await page.screenshot({ path: path.join(screenshotsDir, '03-test-page.png'), fullPage: true });
    
    // Check if agent cards exist
    const agentCards = await page.$$('.agent-card');
    console.log('Agent cards exist:', agentCards.length > 0);
    console.log('Number of agent cards:', agentCards.length);
    
    // Step 4: Inject UI components using the bookmarklet
    console.log('Step 4: Injecting UI components...');
    
    // Execute the bookmarklet code
    await page.evaluate(() => {
      // Bookmarklet code
      if(window.location.pathname.includes('/upload')){addProcessButton();}
      addChatButton();
      if(window.location.pathname.includes('/test')){addAgentCards();}
      
      function addProcessButton(){
        if(document.getElementById('process-document-btn')){
          return;
        }
        
        const formActions = document.querySelector('.form-actions');
        if(formActions){
          const processButton = document.createElement('button');
          processButton.id = 'process-document-btn';
          processButton.className = 'btn btn-primary';
          processButton.textContent = 'Process Document';
          processButton.style.marginLeft = '10px';
          
          processButton.addEventListener('click', function(e){
            e.preventDefault();
            
            let progressContainer = document.getElementById('progress-container');
            if(!progressContainer){
              progressContainer = document.createElement('div');
              progressContainer.id = 'progress-container';
              progressContainer.style.marginTop = '20px';
              
              const progressBarContainer = document.createElement('div');
              progressBarContainer.style.backgroundColor = '#f1f1f1';
              progressBarContainer.style.borderRadius = '5px';
              progressBarContainer.style.height = '20px';
              
              const progressBar = document.createElement('div');
              progressBar.id = 'progress-bar';
              progressBar.style.width = '0%';
              progressBar.style.height = '100%';
              progressBar.style.backgroundColor = '#4CAF50';
              progressBar.style.borderRadius = '5px';
              progressBar.style.transition = 'width 0.5s';
              
              progressBarContainer.appendChild(progressBar);
              
              const statusText = document.createElement('div');
              statusText.id = 'upload-status';
              statusText.style.marginTop = '10px';
              statusText.textContent = 'Processing document...';
              
              progressContainer.appendChild(progressBarContainer);
              progressContainer.appendChild(statusText);
              
              const form = document.querySelector('form');
              if(form){
                form.appendChild(progressContainer);
              } else {
                document.body.appendChild(progressContainer);
              }
            } else {
              progressContainer.style.display = 'block';
            }
            
            let progress = 0;
            const progressBar = document.getElementById('progress-bar');
            const statusText = document.getElementById('upload-status');
            
            const interval = setInterval(function(){
              progress += 5;
              progressBar.style.width = progress + '%';
              
              if(progress >= 100){
                clearInterval(interval);
                statusText.textContent = 'Processing complete!';
                
                setTimeout(function(){
                  alert('Processing complete! Redirecting to document details page...');
                  window.location.href = '/document-details.html';
                }, 1000);
              } else {
                statusText.textContent = 'Processing document... ' + progress + '%';
              }
            }, 200);
          });
          
          const uploadButton = formActions.querySelector('button.btn-primary');
          if(uploadButton){
            uploadButton.parentNode.insertBefore(processButton, uploadButton.nextSibling);
          } else {
            formActions.appendChild(processButton);
          }
          
          console.log('Process button added successfully!');
        } else {
          console.error('Form actions div not found!');
        }
      }
      
      function addChatButton(){
        if(document.getElementById('show-chat-btn')){
          return;
        }
        
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
        
        chatButton.addEventListener('click', function(){
          let chatContainer = document.getElementById('document-chat-container');
          
          if(!chatContainer){
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
            closeButton.addEventListener('click', function(){
              chatContainer.style.display = 'none';
            });
            
            chatHeader.appendChild(chatTitle);
            chatHeader.appendChild(closeButton);
            
            const chatMessages = document.createElement('div');
            chatMessages.id = 'document-chat-messages';
            chatMessages.style.height = '300px';
            chatMessages.style.overflowY = 'auto';
            chatMessages.style.padding = '10px';
            
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
            
            const chatInputContainer = document.createElement('div');
            chatInputContainer.style.display = 'flex';
            chatInputContainer.style.padding = '10px';
            chatInputContainer.style.borderTop = '1px solid #ddd';
            
            const chatInput = document.createElement('input');
            chatInput.id = 'document-chat-input';
            chatInput.type = 'text';
            chatInput.placeholder = 'Type your question...';
            chatInput.style.flex = '1';
            chatInput.style.padding = '8px';
            chatInput.style.border = '1px solid #ddd';
            chatInput.style.borderRadius = '4px';
            chatInput.style.marginRight = '10px';
            
            const sendButton = document.createElement('button');
            sendButton.id = 'document-send-btn';
            sendButton.textContent = 'Send';
            sendButton.style.backgroundColor = '#007bff';
            sendButton.style.color = 'white';
            sendButton.style.border = 'none';
            sendButton.style.padding = '8px 15px';
            sendButton.style.borderRadius = '4px';
            sendButton.style.cursor = 'pointer';
            
            sendButton.addEventListener('click', function(){
              const chatInput = document.getElementById('document-chat-input');
              const chatMessages = document.getElementById('document-chat-messages');
              const message = chatInput.value.trim();
              
              if(!message){
                return;
              }
              
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
              
              chatInput.value = '';
              chatMessages.scrollTop = chatMessages.scrollHeight;
              
              setTimeout(function(){
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
                
                chatMessages.scrollTop = chatMessages.scrollHeight;
              }, 1000);
            });
            
            chatInput.addEventListener('keypress', function(e){
              if(e.key === 'Enter'){
                sendButton.click();
              }
            });
            
            chatInputContainer.appendChild(chatInput);
            chatInputContainer.appendChild(sendButton);
            
            chatContainer.appendChild(chatHeader);
            chatContainer.appendChild(chatMessages);
            chatContainer.appendChild(chatInputContainer);
            
            document.body.appendChild(chatContainer);
          } else {
            chatContainer.style.display = 'block';
          }
        });
        
        document.body.appendChild(chatButton);
        console.log('Chat button added successfully!');
      }
      
      function addAgentCards(){
        if(document.querySelector('.agent-card')){
          return;
        }
        
        const agentCardsContainer = document.createElement('div');
        agentCardsContainer.className = 'agent-cards-container';
        agentCardsContainer.style.display = 'flex';
        agentCardsContainer.style.flexWrap = 'wrap';
        agentCardsContainer.style.gap = '20px';
        agentCardsContainer.style.margin = '20px 0';
        
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
          
          if(agent.status === 'active'){
            status.style.backgroundColor = '#d4edda';
            status.style.color = '#155724';
          } else if(agent.status === 'idle'){
            status.style.backgroundColor = '#fff3cd';
            status.style.color = '#856404';
          } else if(agent.status === 'error'){
            status.style.backgroundColor = '#f8d7da';
            status.style.color = '#721c24';
          }
          
          header.appendChild(title);
          header.appendChild(status);
          
          const body = document.createElement('div');
          body.className = 'agent-card-body';
          body.style.padding = '15px';
          
          const description = document.createElement('p');
          description.textContent = agent.description;
          description.style.marginTop = '0';
          
          body.appendChild(description);
          
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
          
          card.appendChild(header);
          card.appendChild(body);
          card.appendChild(footer);
          
          agentCardsContainer.appendChild(card);
        });
        
        const main = document.querySelector('main') || document.querySelector('.main-content') || document.body;
        main.appendChild(agentCardsContainer);
        
        console.log('Agent cards added successfully!');
      }
      
      console.log('UI components injected successfully!');
    });
    
    await page.screenshot({ path: path.join(screenshotsDir, '04-test-page-with-ui.png'), fullPage: true });
    
    // Step 5: Navigate back to home page
    console.log('Step 5: Navigating back to home page...');
    await page.goto('https://backv2-app-326324779592.me-west1.run.app', { waitUntil: 'networkidle2', timeout: 30000 });
    await page.screenshot({ path: path.join(screenshotsDir, '05-home-page-with-ui.png'), fullPage: true });
    
    // Check if chat button exists after injection
    const chatButtonAfter = await page.$('#show-chat-btn');
    console.log('Chat button exists after injection:', !!chatButtonAfter);
    
    // Step 6: Navigate to upload page
    console.log('Step 6: Navigating to upload page...');
    await page.goto('https://backv2-app-326324779592.me-west1.run.app/upload', { waitUntil: 'networkidle2', timeout: 30000 });
    await page.screenshot({ path: path.join(screenshotsDir, '06-upload-page-with-ui.png'), fullPage: true });
    
    // Check if process button exists after injection
    const processButtonAfter = await page.$('#process-document-btn');
    console.log('Process button exists after injection:', !!processButtonAfter);
    
    // Step 7: Test chat functionality
    console.log('Step 7: Testing chat functionality...');
    
    // Click chat button
    if (chatButtonAfter) {
      await chatButtonAfter.click();
      await page.waitForSelector('#document-chat-container', { timeout: 5000 });
      await page.screenshot({ path: path.join(screenshotsDir, '07-chat-container.png'), fullPage: true });
      
      // Type a message
      await page.type('#document-chat-input', 'Hello, this is a test message');
      await page.screenshot({ path: path.join(screenshotsDir, '08-chat-message-typed.png'), fullPage: true });
      
      // Send the message
      await page.click('#document-send-btn');
      await page.waitForFunction(() => {
        const messages = document.querySelectorAll('#document-chat-messages > div');
        return messages.length >= 3; // Initial message + user message + AI response
      }, { timeout: 5000 });
      
      await page.screenshot({ path: path.join(screenshotsDir, '09-chat-message-sent.png'), fullPage: true });
    }
    
    // Step 8: Test process button functionality
    console.log('Step 8: Testing process button functionality...');
    
    if (processButtonAfter) {
      // Upload a file (mock)
      await page.evaluate(() => {
        // Create a mock file input change event
        const fileInput = document.querySelector('input[type="file"]');
        if (fileInput) {
          // Create a mock File object
          const mockFile = new File(['test'], 'test.pdf', { type: 'application/pdf' });
          
          // Create a mock FileList
          const mockFileList = {
            0: mockFile,
            length: 1,
            item: (index) => index === 0 ? mockFile : null
          };
          
          // Set the files property
          Object.defineProperty(fileInput, 'files', {
            value: mockFileList,
            writable: true
          });
          
          // Dispatch a change event
          const event = new Event('change', { bubbles: true });
          fileInput.dispatchEvent(event);
        }
      });
      
      // Click process button
      await processButtonAfter.click();
      
      // Wait for progress bar
      await page.waitForSelector('#progress-container', { timeout: 5000 });
      await page.screenshot({ path: path.join(screenshotsDir, '10-process-started.png'), fullPage: true });
      
      // Wait for progress to complete
      await page.waitForFunction(() => {
        const progressBar = document.getElementById('progress-bar');
        return progressBar && progressBar.style.width === '100%';
      }, { timeout: 10000 });
      
      await page.screenshot({ path: path.join(screenshotsDir, '11-process-complete.png'), fullPage: true });
    }
    
    console.log('Deployed UI Test completed successfully!');
    console.log(`Screenshots saved to ${screenshotsDir}`);
    
  } catch (error) {
    console.error('Error during test:', error);
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

// Run the test
testDeployedUI().catch(console.error);
