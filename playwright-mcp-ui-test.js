/**
 * UI Test using Playwright MCP
 * This script tests the UI of the FinDoc Analyzer application
 */

// Use axios instead of fetch
const axios = require('axios');

// Configuration
const config = {
  baseUrl: 'http://localhost:8080',
  playwrightMcpUrl: 'http://localhost:8083/mcp',
  timeout: 30000
};

// Utility function to make a request to the Playwright MCP
async function playwrightMcp(action, options = {}) {
  try {
    console.log(`Executing Playwright MCP action: ${action}`);

    const response = await axios({
      method: 'POST',
      url: config.playwrightMcpUrl,
      headers: {
        'Content-Type': 'application/json'
      },
      data: {
        action,
        ...options
      },
      timeout: config.timeout
    });

    return response.data;
  } catch (error) {
    console.error(`Playwright MCP error (${action}):`, error.message);
    throw error;
  }
}

// Run the UI tests
async function runUiTests() {
  console.log('Starting UI tests with Playwright MCP...');
  
  try {
    // Create a new browser context
    const { contextId } = await playwrightMcp('createContext', {
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36'
    });
    
    console.log(`Created browser context: ${contextId}`);
    
    try {
      // Test homepage
      console.log('\nTesting homepage...');
      await playwrightMcp('goto', {
        contextId,
        url: config.baseUrl,
        waitUntil: 'networkidle'
      });
      
      // Take screenshot of homepage
      await playwrightMcp('screenshot', {
        contextId,
        path: 'playwright-homepage.png',
        fullPage: true
      });
      
      // Check for sidebar navigation
      const hasSidebar = await playwrightMcp('evaluate', {
        contextId,
        script: `
          !!document.querySelector('.sidebar, .sidebar-nav, nav, .navigation')
        `
      });
      
      console.log(`Homepage has sidebar: ${hasSidebar.result ? 'Yes' : 'No'}`);
      
      // Navigate to the upload page
      console.log('\nNavigating to upload page...');
      const uploadLinkExists = await playwrightMcp('evaluate', {
        contextId,
        script: `
          !!document.querySelector('a[href="/upload"], a[href="/upload.html"], a:has-text("Upload")')
        `
      });
      
      if (uploadLinkExists.result) {
        await playwrightMcp('click', {
          contextId,
          selector: 'a[href="/upload"], a[href="/upload.html"], a:has-text("Upload")'
        });
        
        // Wait for navigation to complete
        await playwrightMcp('waitForLoadState', {
          contextId,
          state: 'networkidle'
        });
        
        // Take screenshot of upload page
        await playwrightMcp('screenshot', {
          contextId,
          path: 'playwright-upload-page.png',
          fullPage: true
        });
        
        // Check if we're on the upload page
        const currentUrl = await playwrightMcp('evaluate', {
          contextId,
          script: 'window.location.href'
        });
        
        console.log(`Current URL: ${currentUrl.result}`);
        
        // Check for file input
        const hasFileInput = await playwrightMcp('evaluate', {
          contextId,
          script: `
            !!document.querySelector('input[type="file"], #file-input')
          `
        });
        
        console.log(`Upload page has file input: ${hasFileInput.result ? 'Yes' : 'No'}`);
        
        // Check for process button
        const hasProcessButton = await playwrightMcp('evaluate', {
          contextId,
          script: `
            !!document.querySelector('#process-document-btn, #floating-process-btn, button:has-text("Process")')
          `
        });
        
        console.log(`Upload page has process button: ${hasProcessButton.result ? 'Yes' : 'No'}`);
        
        // Check for chat button
        const hasChatButton = await playwrightMcp('evaluate', {
          contextId,
          script: `
            !!document.querySelector('#show-chat-btn, button:has-text("Chat")')
          `
        });
        
        console.log(`Page has chat button: ${hasChatButton.result ? 'Yes' : 'No'}`);
        
        // If chat button exists, click it to open chat
        if (hasChatButton.result) {
          await playwrightMcp('click', {
            contextId,
            selector: '#show-chat-btn, button:has-text("Chat")'
          });
          
          // Wait for chat to appear
          await playwrightMcp('waitForTimeout', {
            contextId,
            timeout: 1000
          });
          
          // Take screenshot with chat open
          await playwrightMcp('screenshot', {
            contextId,
            path: 'playwright-chat-open.png',
            fullPage: true
          });
          
          // Check if chat container is visible
          const hasChatContainer = await playwrightMcp('evaluate', {
            contextId,
            script: `
              const chat = document.querySelector('#document-chat-container, .chat-container');
              return chat && window.getComputedStyle(chat).display !== 'none';
            `
          });
          
          console.log(`Chat container is visible: ${hasChatContainer.result ? 'Yes' : 'No'}`);
          
          // Test sending a message if chat container is visible
          if (hasChatContainer.result) {
            // Type a test message
            await playwrightMcp('fill', {
              contextId,
              selector: '#document-chat-input, .chat-input input',
              value: 'Test message from Playwright MCP'
            });
            
            // Click send button
            await playwrightMcp('click', {
              contextId,
              selector: '#document-send-btn, button:has-text("Send")'
            });
            
            // Wait for the response
            await playwrightMcp('waitForTimeout', {
              contextId,
              timeout: 2000
            });
            
            // Take screenshot after sending message
            await playwrightMcp('screenshot', {
              contextId,
              path: 'playwright-chat-message.png',
              fullPage: true
            });
            
            // Check for message elements
            const hasMessages = await playwrightMcp('evaluate', {
              contextId,
              script: `
                document.querySelectorAll('.message, .chat-message').length > 1
              `
            });
            
            console.log(`Chat has messages: ${hasMessages.result ? 'Yes' : 'No'}`);
          }
        }
        
        // If process button exists, try clicking it
        if (hasProcessButton.result) {
          // First we need to make sure a file is selected
          // Since we can't actually upload a file without UI interaction,
          // we'll check if there's a way to mock file selection
          const canMockFileInput = await playwrightMcp('evaluate', {
            contextId,
            script: `
              const fileInput = document.querySelector('input[type="file"], #file-input');
              if (!fileInput) return false;
              
              // Try to create a File object
              try {
                const file = new File(['test content'], 'test.pdf', { type: 'application/pdf' });
                
                // Create a DataTransfer to set files
                const dataTransfer = new DataTransfer();
                dataTransfer.items.add(file);
                
                // Try to set files property (this might be blocked by browser security)
                try {
                  fileInput.files = dataTransfer.files;
                  return true;
                } catch (e) {
                  console.error("Couldn't set files:", e);
                  return false;
                }
              } catch (e) {
                console.error("Couldn't create File:", e);
                return false;
              }
            `
          });
          
          console.log(`Can mock file input: ${canMockFileInput.result ? 'Yes' : 'No'}`);
          
          // If we can't mock file input, we'll log that we're skipping process button test
          if (!canMockFileInput.result) {
            console.log('Skipping process button test due to file input limitations');
          } else {
            // Click the process button
            await playwrightMcp('click', {
              contextId,
              selector: '#process-document-btn, #floating-process-btn, button:has-text("Process")'
            });
            
            // Wait for processing feedback
            await playwrightMcp('waitForTimeout', {
              contextId,
              timeout: 1000
            });
            
            // Take screenshot after clicking process button
            await playwrightMcp('screenshot', {
              contextId,
              path: 'playwright-process-click.png',
              fullPage: true
            });
            
            // Check for progress indicator
            const hasProgress = await playwrightMcp('evaluate', {
              contextId,
              script: `
                const progress = document.querySelector('.progress, .progress-container, .progress-bar');
                return progress && window.getComputedStyle(progress).display !== 'none';
              `
            });
            
            console.log(`Processing shows progress: ${hasProgress.result ? 'Yes' : 'No'}`);
          }
        }
      } else {
        console.log('Upload link not found, skipping upload page tests');
      }
      
      // Navigate to documents page
      console.log('\nNavigating to documents page...');
      const documentsLinkExists = await playwrightMcp('evaluate', {
        contextId,
        script: `
          !!document.querySelector('a[href="/documents-new"], a[href="/documents-new.html"], a:has-text("Documents")')
        `
      });
      
      if (documentsLinkExists.result) {
        await playwrightMcp('click', {
          contextId,
          selector: 'a[href="/documents-new"], a[href="/documents-new.html"], a:has-text("Documents")'
        });
        
        // Wait for navigation to complete
        await playwrightMcp('waitForLoadState', {
          contextId,
          state: 'networkidle'
        });
        
        // Take screenshot of documents page
        await playwrightMcp('screenshot', {
          contextId,
          path: 'playwright-documents-page.png',
          fullPage: true
        });
        
        // Check for document elements
        const hasDocumentElements = await playwrightMcp('evaluate', {
          contextId,
          script: `
            !!document.querySelector('.document-card, .document-list, .document-grid')
          `
        });
        
        console.log(`Documents page has document elements: ${hasDocumentElements.result ? 'Yes' : 'No'}`);
      } else {
        console.log('Documents link not found, skipping documents page tests');
      }
      
      console.log('\nUI tests completed successfully!');
    } finally {
      // Close the browser context
      await playwrightMcp('closeContext', { contextId });
      console.log(`Closed browser context: ${contextId}`);
    }
  } catch (error) {
    console.error('Error during UI tests:', error);
  }
}

// Run the tests
runUiTests().catch(console.error);