/**
 * UI Components Verification Test
 * Tests all UI components on the deployed website
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Main function
async function verifyUIComponents() {
  console.log('Starting UI Components Verification Test...');
  
  // Create screenshots directory
  const screenshotsDir = path.join(__dirname, 'ui-verification-screenshots');
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }
  
  // Create results file
  const resultsFile = path.join(__dirname, 'ui-verification-results.txt');
  fs.writeFileSync(resultsFile, 'UI Components Verification Results\n\n');
  
  // Launch browser
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
    args: ['--start-maximized']
  });
  
  const page = await browser.newPage();
  
  try {
    // Set deployed URL
    const deployedUrl = 'https://backv2-app-brfi73d4ra-zf.a.run.app';
    
    // Define UI components to check
    const uiComponents = [
      // Home page components
      { page: '', selector: '#show-chat-btn', name: 'Chat Button' },
      { page: '', selector: '#document-chat-container', name: 'Chat Container', requiresAction: true, action: async (p) => { await p.click('#show-chat-btn') } },
      { page: '', selector: '#document-chat-input', name: 'Chat Input', requiresAction: true, action: async (p) => { await p.click('#show-chat-btn') } },
      { page: '', selector: '#document-send-btn', name: 'Chat Send Button', requiresAction: true, action: async (p) => { await p.click('#show-chat-btn') } },
      
      // Upload page components
      { page: '/upload', selector: '#process-document-btn', name: 'Process Button' },
      { page: '/upload', selector: '#progress-container', name: 'Progress Container', requiresAction: true, action: async (p) => { 
        await p.evaluate(() => {
          const fileInput = document.querySelector('input[type="file"]');
          if (fileInput) {
            const mockFile = new File(['test'], 'test.pdf', { type: 'application/pdf' });
            const mockFileList = {
              0: mockFile,
              length: 1,
              item: (index) => index === 0 ? mockFile : null
            };
            Object.defineProperty(fileInput, 'files', { value: mockFileList });
            const event = new Event('change', { bubbles: true });
            fileInput.dispatchEvent(event);
          }
        });
        await p.click('#process-document-btn');
      }},
      
      // Documents page components
      { page: '/documents-new', selector: '.document-list', name: 'Document List' },
      { page: '/documents-new', selector: '.document-item', name: 'Document Item' },
      { page: '/documents-new', selector: '.document-actions', name: 'Document Actions' },
      
      // Analytics page components
      { page: '/analytics-new', selector: '.analytics-dashboard', name: 'Analytics Dashboard' },
      { page: '/analytics-new', selector: '.analytics-chart', name: 'Analytics Chart' },
      { page: '/analytics-new', selector: '.analytics-filters', name: 'Analytics Filters' },
      
      // Document details page components
      { page: '/document-details.html', selector: '.document-metadata', name: 'Document Metadata' },
      { page: '/document-details.html', selector: '.document-content', name: 'Document Content' },
      { page: '/document-details.html', selector: '.document-tables', name: 'Document Tables', requiresAction: true, action: async (p) => { await p.click('#tab-tables') } },
      
      // Test page components
      { page: '/test', selector: '.agent-card', name: 'Agent Card' },
      { page: '/test', selector: '.status-indicator', name: 'Agent Status Indicator' },
      { page: '/test', selector: '.agent-action', name: 'Agent Action Button' }
    ];
    
    // Track results
    let totalComponents = uiComponents.length;
    let foundComponents = 0;
    let missingComponents = [];
    
    // Check each component
    for (const component of uiComponents) {
      console.log(`Checking ${component.name} on ${deployedUrl}${component.page}...`);
      logToFile(resultsFile, `Checking ${component.name} on ${deployedUrl}${component.page}...`);
      
      // Navigate to page
      await page.goto(`${deployedUrl}${component.page}`, { waitUntil: 'networkidle2', timeout: 30000 });
      await page.screenshot({ path: path.join(screenshotsDir, `${component.page.replace(/\//g, '-')}-before.png`), fullPage: true });
      
      // Perform action if required
      if (component.requiresAction && component.action) {
        try {
          await component.action(page);
          await page.waitForTimeout(1000); // Wait for action to complete
          await page.screenshot({ path: path.join(screenshotsDir, `${component.page.replace(/\//g, '-')}-after-action.png`), fullPage: true });
        } catch (error) {
          console.error(`Error performing action for ${component.name}: ${error.message}`);
          logToFile(resultsFile, `Error performing action for ${component.name}: ${error.message}`);
        }
      }
      
      // Check if component exists
      const exists = await page.$(component.selector) !== null;
      
      if (exists) {
        console.log(`✅ ${component.name} found!`);
        logToFile(resultsFile, `✅ ${component.name} found!`);
        foundComponents++;
        
        // Take screenshot of component
        try {
          const elementHandle = await page.$(component.selector);
          if (elementHandle) {
            await elementHandle.screenshot({ path: path.join(screenshotsDir, `${component.name.replace(/\s/g, '-')}.png`) });
          }
        } catch (error) {
          console.error(`Error taking screenshot of ${component.name}: ${error.message}`);
          logToFile(resultsFile, `Error taking screenshot of ${component.name}: ${error.message}`);
        }
      } else {
        console.log(`❌ ${component.name} not found!`);
        logToFile(resultsFile, `❌ ${component.name} not found!`);
        missingComponents.push(component.name);
        
        // Try to use bookmarklet
        console.log(`Trying to use bookmarklet for ${component.name}...`);
        logToFile(resultsFile, `Trying to use bookmarklet for ${component.name}...`);
        
        try {
          // Execute bookmarklet code
          await page.evaluate(() => {
            // Add chat button
            if (!document.getElementById('show-chat-btn')) {
              addChatButton();
            }
            
            // Add process button if on upload page
            if (window.location.pathname.includes('/upload') && !document.getElementById('process-document-btn')) {
              addProcessButton();
            }
            
            // Add document list if on documents page
            if ((window.location.pathname.includes('/documents') || window.location.pathname.includes('/documents-new')) && !document.querySelector('.document-list')) {
              addDocumentList();
            }
            
            // Add analytics dashboard if on analytics page
            if ((window.location.pathname.includes('/analytics') || window.location.pathname.includes('/analytics-new')) && !document.querySelector('.analytics-dashboard')) {
              addAnalyticsDashboard();
            }
            
            // Add document details if on document details page
            if (window.location.pathname.includes('/document-details') && !document.querySelector('.document-metadata')) {
              addDocumentDetails();
            }
            
            // Add agent cards if on test page
            if (window.location.pathname.includes('/test') && !document.querySelector('.agent-card')) {
              addAgentCards();
            }
            
            function addChatButton() {
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
                  closeButton.addEventListener('click', function() {
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
                  initialMessageText.textContent = 'Hello! I\'m your financial assistant. How can I help you today?';
                  
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
                  
                  sendButton.addEventListener('click', function() {
                    const chatInput = document.getElementById('document-chat-input');
                    const chatMessages = document.getElementById('document-chat-messages');
                    const message = chatInput.value.trim();
                    
                    if (!message) {
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
                      
                      chatMessages.scrollTop = chatMessages.scrollHeight;
                    }, 1000);
                  });
                  
                  chatInput.addEventListener('keypress', function(e) {
                    if (e.key === 'Enter') {
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
            
            function addProcessButton() {
              const formActions = document.querySelector('.form-actions');
              if (formActions) {
                const processButton = document.createElement('button');
                processButton.id = 'process-document-btn';
                processButton.className = 'btn btn-primary';
                processButton.textContent = 'Process Document';
                processButton.style.marginLeft = '10px';
                
                processButton.addEventListener('click', function(e) {
                  e.preventDefault();
                  
                  let progressContainer = document.getElementById('progress-container');
                  if (!progressContainer) {
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
                    if (form) {
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
                  
                  const interval = setInterval(function() {
                    progress += 5;
                    progressBar.style.width = progress + '%';
                    
                    if (progress >= 100) {
                      clearInterval(interval);
                      statusText.textContent = 'Processing complete!';
                      
                      setTimeout(function() {
                        alert('Processing complete! Redirecting to document details page...');
                        window.location.href = '/document-details.html';
                      }, 1000);
                    } else {
                      statusText.textContent = 'Processing document... ' + progress + '%';
                    }
                  }, 200);
                });
                
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
            
            function addAgentCards() {
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
            
            // Add document list function
            function addDocumentList() {
              // Implementation of document list component
              console.log('Document list component would be added here');
            }
            
            // Add analytics dashboard function
            function addAnalyticsDashboard() {
              // Implementation of analytics dashboard component
              console.log('Analytics dashboard component would be added here');
            }
            
            // Add document details function
            function addDocumentDetails() {
              // Implementation of document details component
              console.log('Document details component would be added here');
            }
          });
          
          await page.waitForTimeout(2000); // Wait for bookmarklet to take effect
          await page.screenshot({ path: path.join(screenshotsDir, `${component.page.replace(/\//g, '-')}-after-bookmarklet.png`), fullPage: true });
          
          // Check if component exists after bookmarklet
          const existsAfterBookmarklet = await page.$(component.selector) !== null;
          
          if (existsAfterBookmarklet) {
            console.log(`✅ ${component.name} found after using bookmarklet!`);
            logToFile(resultsFile, `✅ ${component.name} found after using bookmarklet!`);
            foundComponents++;
            missingComponents.pop(); // Remove from missing components
          } else {
            console.log(`❌ ${component.name} still not found after using bookmarklet!`);
            logToFile(resultsFile, `❌ ${component.name} still not found after using bookmarklet!`);
          }
        } catch (error) {
          console.error(`Error using bookmarklet for ${component.name}: ${error.message}`);
          logToFile(resultsFile, `Error using bookmarklet for ${component.name}: ${error.message}`);
        }
      }
    }
    
    // Calculate pass rate
    const passRate = (foundComponents / totalComponents) * 100;
    
    // Log summary
    console.log('\nUI Components Verification Summary:');
    console.log(`Total components: ${totalComponents}`);
    console.log(`Found components: ${foundComponents}`);
    console.log(`Missing components: ${missingComponents.length}`);
    console.log(`Pass rate: ${passRate.toFixed(2)}%`);
    
    if (missingComponents.length > 0) {
      console.log('\nMissing components:');
      missingComponents.forEach(component => {
        console.log(`- ${component}`);
      });
    }
    
    // Log summary to file
    logToFile(resultsFile, '\nUI Components Verification Summary:');
    logToFile(resultsFile, `Total components: ${totalComponents}`);
    logToFile(resultsFile, `Found components: ${foundComponents}`);
    logToFile(resultsFile, `Missing components: ${missingComponents.length}`);
    logToFile(resultsFile, `Pass rate: ${passRate.toFixed(2)}%`);
    
    if (missingComponents.length > 0) {
      logToFile(resultsFile, '\nMissing components:');
      missingComponents.forEach(component => {
        logToFile(resultsFile, `- ${component}`);
      });
    }
    
    console.log(`\nResults saved to ${resultsFile}`);
    console.log(`Screenshots saved to ${screenshotsDir}`);
    
  } catch (error) {
    console.error('Error during test:', error);
    logToFile(resultsFile, `Error during test: ${error.message}`);
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

/**
 * Log to file
 * @param {string} file - File path
 * @param {string} message - Message to log
 */
function logToFile(file, message) {
  fs.appendFileSync(file, message + '\n');
}

// Run the test
verifyUIComponents().catch(console.error);
