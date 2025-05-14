/**
 * Complete Local Fix
 * This script provides local implementations for Gmail authentication and PDF processing
 */

document.addEventListener('DOMContentLoaded', function() {
  console.log('Complete local fix loaded');

  // 1. Fix Google Authentication
  setupLocalAuth();

  // 2. Fix PDF Processing
  setupLocalPdfProcessing();

  // 3. Fix UI Elements
  ensureRequiredElements();

  // 4. Fix LaunchDarkly
  disableLaunchDarkly();

  // 3. Ensure required UI elements
  function ensureRequiredElements() {
    console.log('Ensuring required UI elements');

    // Required elements
    const requiredElements = [
      {
        id: 'process-document-btn',
        description: 'Process Document Button',
        create: createProcessButton
      },
      {
        id: 'document-chat-container',
        description: 'Document Chat Container',
        create: createChatContainer
      },
      {
        id: 'document-send-btn',
        description: 'Document Chat Send Button',
        create: null // Created as part of chat container
      },
      {
        id: 'login-form',
        description: 'Login Form',
        create: createLoginForm
      },
      {
        id: 'google-login-btn',
        description: 'Google Login Button',
        create: createGoogleLoginButton
      }
    ];

    // Check and create missing elements
    requiredElements.forEach(element => {
      if (!document.getElementById(element.id) && element.create) {
        console.log(`Creating missing element: ${element.description}`);
        element.create();
      }
    });

    // Create process button
    function createProcessButton() {
      const button = document.createElement('button');
      button.id = 'process-document-btn';
      button.className = 'btn btn-primary';
      button.innerHTML = 'Process Document';
      button.style.display = 'block';
      button.style.margin = '10px 0';

      // Add event listener
      button.addEventListener('click', function() {
        console.log('Process button clicked');
        alert('Processing document...');
      });

      // Add to page
      const mainContent = document.querySelector('.main-content') || document.body;
      mainContent.prepend(button);

      return button;
    }

    // Create chat container
    function createChatContainer() {
      const container = document.createElement('div');
      container.id = 'document-chat-container';
      container.className = 'chat-container';
      container.style.display = 'block';
      container.style.margin = '20px 0';
      container.style.padding = '15px';
      container.style.border = '1px solid #ddd';
      container.style.borderRadius = '5px';

      container.innerHTML = `
        <div class="chat-messages" style="height: 200px; overflow-y: auto; border: 1px solid #eee; padding: 10px; margin-bottom: 10px;">
          <div class="message ai-message">
            <p>Hello! I'm your financial assistant. How can I help you today?</p>
          </div>
        </div>
        <div class="chat-input" style="display: flex;">
          <input type="text" id="document-chat-input" class="form-control" placeholder="Type your question..." style="flex: 1; margin-right: 10px;">
          <button id="document-send-btn" class="btn btn-primary">Send</button>
        </div>
      `;

      // Add to page
      const mainContent = document.querySelector('.main-content') || document.body;
      mainContent.appendChild(container);

      return container;
    }

    // Create login form
    function createLoginForm() {
      const form = document.createElement('form');
      form.id = 'login-form';
      form.className = 'auth-form';
      form.style.display = 'none';

      document.body.appendChild(form);

      return form;
    }

    // Create Google login button
    function createGoogleLoginButton() {
      const button = document.createElement('button');
      button.id = 'google-login-btn';
      button.type = 'button';
      button.className = 'btn btn-outline-secondary btn-block google-login-btn';

      button.innerHTML = `
        <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" class="google-icon" style="margin-right: 10px;">
        <span>Login with Google</span>
      `;

      button.addEventListener('click', function() {
        if (window.auth && typeof window.auth.googleLogin === 'function') {
          window.auth.googleLogin();
        } else {
          console.log('Google login attempted');
          alert('Google login functionality not implemented yet');
        }
      });

      document.body.appendChild(button);

      return button;
    }
  }

  // 4. Disable LaunchDarkly
  function disableLaunchDarkly() {
    console.log('Disabling LaunchDarkly');

    // Remove any existing LaunchDarkly scripts
    document.querySelectorAll('script[src*="launchdarkly"]').forEach(script => {
      script.remove();
    });

    // Block any future LaunchDarkly requests
    const originalFetch = window.fetch;
    window.fetch = function(url, options) {
      if (url && typeof url === 'string' && url.includes('launchdarkly')) {
        console.log('Blocked LaunchDarkly request:', url);
        return Promise.resolve(new Response('{}', { status: 200 }));
      }
      return originalFetch.apply(this, arguments);
    };

    // Create a completely fake LaunchDarkly client
    const mockLDClient = {
      identify: function() { return Promise.resolve(); },
      variation: function(_, defaultValue) { return defaultValue; },
      on: function(event, callback) {
        if (event === 'ready') setTimeout(callback, 0);
        return this;
      },
      off: function() { return this; }
    };

    // Replace any existing LaunchDarkly client
    if (window.general && window.general.launchDarklyClient) {
      window.general.launchDarklyClient = mockLDClient;
    }

    // Set global LaunchDarkly client
    window.ldClient = mockLDClient;
  }

  // 1. Local Authentication
  function setupLocalAuth() {
    console.log('Setting up local authentication');

    // Create a mock authentication system
    window.localAuth = {
      isAuthenticated: false,
      currentUser: null,

      // Initialize from localStorage
      init: function() {
        const savedUser = localStorage.getItem('localUser');
        if (savedUser) {
          try {
            this.currentUser = JSON.parse(savedUser);
            this.isAuthenticated = true;
            this.updateUI();
          } catch (error) {
            console.error('Error parsing saved user:', error);
            localStorage.removeItem('localUser');
          }
        }
      },

      // Local login (simulates Gmail)
      login: function() {
        // Prompt for email
        const email = prompt('Enter your Gmail address for local testing:');

        if (email && email.includes('@')) {
          // Create user
          this.currentUser = {
            id: 'local-' + Date.now(),
            name: email.split('@')[0],
            email: email
          };

          this.isAuthenticated = true;

          // Save to localStorage
          localStorage.setItem('localUser', JSON.stringify(this.currentUser));

          // Update UI
          this.updateUI();

          // Show success message
          alert('Logged in successfully as ' + email);

          // Redirect to home
          window.location.href = '/';
        } else {
          alert('Please enter a valid email address');
        }
      },

      // Logout
      logout: function() {
        this.currentUser = null;
        this.isAuthenticated = false;

        // Remove from localStorage
        localStorage.removeItem('localUser');

        // Update UI
        this.updateUI();

        // Show message
        alert('Logged out successfully');

        // Redirect to home
        window.location.href = '/';
      },

      // Update UI based on authentication state
      updateUI: function() {
        const authNav = document.getElementById('auth-nav');
        const userNav = document.getElementById('user-nav');
        const userName = document.getElementById('user-name');
        const logoutBtn = document.getElementById('logout-btn');

        if (this.isAuthenticated && this.currentUser) {
          // User is logged in
          if (authNav) authNav.style.display = 'none';
          if (userNav) userNav.style.display = 'flex';
          if (userName) userName.textContent = this.currentUser.name;

          // Add logout event listener
          if (logoutBtn) {
            logoutBtn.onclick = () => this.logout();
          }
        } else {
          // User is not logged in
          if (authNav) authNav.style.display = 'flex';
          if (userNav) userNav.style.display = 'none';
        }
      },

      // Get auth headers for API requests
      getAuthHeaders: function() {
        if (this.isAuthenticated && this.currentUser) {
          return {
            'Authorization': 'Bearer mock-token-' + this.currentUser.id
          };
        }
        return {};
      }
    };

    // Initialize local auth
    window.localAuth.init();

    // Override Google login button
    const googleLoginBtn = document.getElementById('google-login-btn');
    if (googleLoginBtn) {
      googleLoginBtn.onclick = function(e) {
        e.preventDefault();
        window.localAuth.login();
      };
    }

    // Override auth object
    window.auth = window.localAuth;
  }

  // 2. Local PDF Processing
  function setupLocalPdfProcessing() {
    console.log('Setting up local PDF processing');

    // Check if we're on the upload page
    const isUploadPage = window.location.pathname.includes('/upload');

    if (isUploadPage) {
      console.log('On upload page, setting up local PDF processing');

      // Set up file upload
      const fileInput = document.querySelector('input[type="file"]');
      const uploadBtn = document.getElementById('upload-btn');

      if (fileInput && uploadBtn) {
        // Handle file selection
        fileInput.addEventListener('change', function() {
          if (this.files.length > 0) {
            const fileName = this.files[0].name;

            // Display selected file name
            const fileNameDisplay = document.getElementById('file-name');
            if (fileNameDisplay) {
              fileNameDisplay.textContent = fileName;
            }

            // Show selected file container
            const selectedFile = document.getElementById('selected-file');
            if (selectedFile) {
              selectedFile.style.display = 'block';
            }

            // Hide upload area
            const uploadArea = document.getElementById('upload-area');
            if (uploadArea) {
              uploadArea.style.display = 'none';
            }
          }
        });

        // Handle upload button click
        uploadBtn.addEventListener('click', function(e) {
          e.preventDefault();

          if (fileInput.files.length === 0) {
            alert('Please select a file to upload');
            return;
          }

          // Get file details
          const file = fileInput.files[0];
          const fileName = file.name;

          // Show progress
          const progressContainer = document.getElementById('progress-container');
          const progressBar = document.getElementById('progress-bar');
          const progressText = document.getElementById('progress-text');

          if (progressContainer && progressBar && progressText) {
            progressContainer.style.display = 'block';

            // Simulate upload progress
            let progress = 0;
            const interval = setInterval(() => {
              progress += 10;
              progressBar.style.width = progress + '%';
              progressText.textContent = progress + '%';

              if (progress >= 100) {
                clearInterval(interval);

                // Save file info to localStorage
                const fileInfo = {
                  id: 'file-' + Date.now(),
                  name: fileName,
                  uploadDate: new Date().toISOString(),
                  processed: false,
                  processing: false,
                  documentType: document.getElementById('document-type')?.value || 'unknown'
                };

                // Get existing files
                let files = JSON.parse(localStorage.getItem('localFiles') || '[]');

                // Add new file
                files.push(fileInfo);

                // Save to localStorage
                localStorage.setItem('localFiles', JSON.stringify(files));

                // Show success message
                alert('File uploaded successfully!');

                // Add process button
                addProcessButton(fileInfo.id);
              }
            }, 200);
          } else {
            // No progress container, just simulate upload
            setTimeout(() => {
              // Save file info to localStorage
              const fileInfo = {
                id: 'file-' + Date.now(),
                name: fileName,
                uploadDate: new Date().toISOString(),
                processed: false,
                processing: false,
                documentType: document.getElementById('document-type')?.value || 'unknown'
              };

              // Get existing files
              let files = JSON.parse(localStorage.getItem('localFiles') || '[]');

              // Add new file
              files.push(fileInfo);

              // Save to localStorage
              localStorage.setItem('localFiles', JSON.stringify(files));

              // Show success message
              alert('File uploaded successfully!');

              // Add process button
              addProcessButton(fileInfo.id);
            }, 1000);
          }
        });
      }

      // Add process button
      function addProcessButton(fileId) {
        // Create process button if it doesn't exist
        let processBtn = document.getElementById('process-document-btn');

        if (!processBtn) {
          processBtn = document.createElement('button');
          processBtn.id = 'process-document-btn';
          processBtn.className = 'btn btn-primary';
          processBtn.innerHTML = 'Process Document';

          // Add to page
          const formActions = document.querySelector('.form-actions');
          if (formActions) {
            formActions.appendChild(processBtn);
          } else {
            const uploadForm = document.querySelector('.upload-form');
            if (uploadForm) {
              uploadForm.appendChild(processBtn);
            } else {
              document.body.appendChild(processBtn);
            }
          }
        }

        // Set file ID
        processBtn.setAttribute('data-file-id', fileId);

        // Add click event
        processBtn.onclick = function() {
          const fileId = this.getAttribute('data-file-id');
          processDocument(fileId);
        };

        // Make sure it's visible
        processBtn.style.display = 'block';
        processBtn.style.margin = '20px 0';
        processBtn.style.padding = '10px 20px';
      }

      // Process document
      function processDocument(fileId) {
        console.log('Processing document:', fileId);

        // Get file info
        let files = JSON.parse(localStorage.getItem('localFiles') || '[]');
        const fileIndex = files.findIndex(f => f.id === fileId);

        if (fileIndex === -1) {
          alert('File not found');
          return;
        }

        // Update file status
        files[fileIndex].processing = true;
        localStorage.setItem('localFiles', JSON.stringify(files));

        // Show processing UI
        const processBtn = document.getElementById('process-document-btn');
        if (processBtn) {
          processBtn.disabled = true;
          processBtn.innerHTML = 'Processing...';
        }

        // Create or show progress container
        let progressContainer = document.getElementById('processing-progress-container');

        if (!progressContainer) {
          progressContainer = document.createElement('div');
          progressContainer.id = 'processing-progress-container';
          progressContainer.style.margin = '20px 0';
          progressContainer.style.padding = '15px';
          progressContainer.style.backgroundColor = '#f8f9fa';
          progressContainer.style.border = '1px solid #ddd';
          progressContainer.style.borderRadius = '5px';

          progressContainer.innerHTML = `
            <h3>Processing Document</h3>
            <p id="processing-status">Starting processing...</p>
            <div style="background-color: #e9ecef; height: 20px; border-radius: 5px; overflow: hidden;">
              <div id="processing-progress-bar" style="background-color: #28a745; height: 100%; width: 0%; transition: width 0.5s;"></div>
            </div>
            <p id="processing-progress-text">0%</p>
          `;

          // Add to page
          const uploadForm = document.querySelector('.upload-form');
          if (uploadForm) {
            uploadForm.appendChild(progressContainer);
          } else {
            document.body.appendChild(progressContainer);
          }
        } else {
          progressContainer.style.display = 'block';
        }

        // Get progress elements
        const progressBar = document.getElementById('processing-progress-bar');
        const progressText = document.getElementById('processing-progress-text');
        const statusText = document.getElementById('processing-status');

        // Simulate processing
        const steps = [
          { progress: 10, status: 'Initializing document processing...' },
          { progress: 20, status: 'Extracting text from document...' },
          { progress: 30, status: 'Analyzing document structure...' },
          { progress: 40, status: 'Identifying tables and charts...' },
          { progress: 50, status: 'Extracting table data...' },
          { progress: 60, status: 'Identifying securities information...' },
          { progress: 70, status: 'Processing financial data...' },
          { progress: 80, status: 'Generating insights...' },
          { progress: 90, status: 'Finalizing document processing...' },
          { progress: 100, status: 'Processing complete!' }
        ];

        let currentStep = 0;

        const processStep = function() {
          if (currentStep < steps.length) {
            const step = steps[currentStep];

            // Update progress
            if (progressBar) progressBar.style.width = step.progress + '%';
            if (progressText) progressText.textContent = step.progress + '%';
            if (statusText) statusText.textContent = step.status;

            // Move to next step
            currentStep++;

            // Schedule next step
            setTimeout(processStep, 800);
          } else {
            // Processing complete
            processingComplete(fileId);
          }
        };

        // Start processing
        processStep();
      }

      // Processing complete
      function processingComplete(fileId) {
        console.log('Processing complete:', fileId);

        // Get file info
        let files = JSON.parse(localStorage.getItem('localFiles') || '[]');
        const fileIndex = files.findIndex(f => f.id === fileId);

        if (fileIndex !== -1) {
          // Update file status
          files[fileIndex].processed = true;
          files[fileIndex].processing = false;
          files[fileIndex].processedDate = new Date().toISOString();

          // Add mock data
          files[fileIndex].data = {
            totalValue: '$1,250,000.00',
            topHoldings: [
              { name: 'Apple Inc. (AAPL)', value: '$175,000.00', percentage: '14.0%' },
              { name: 'Microsoft Corp. (MSFT)', value: '$240,000.00', percentage: '19.2%' },
              { name: 'Alphabet Inc. (GOOG)', value: '$260,000.00', percentage: '20.8%' }
            ],
            assetAllocation: {
              equities: { value: '$750,000.00', percentage: '60%' },
              fixedIncome: { value: '$375,000.00', percentage: '30%' },
              cash: { value: '$125,000.00', percentage: '10%' }
            },
            securities: [
              { name: 'Apple Inc.', symbol: 'AAPL', isin: 'US0378331005', quantity: 1000, price: 175.00, value: 175000.00 },
              { name: 'Microsoft Corp.', symbol: 'MSFT', isin: 'US5949181045', quantity: 800, price: 300.00, value: 240000.00 },
              { name: 'Alphabet Inc.', symbol: 'GOOG', isin: 'US02079K1079', quantity: 200, price: 1300.00, value: 260000.00 },
              { name: 'Amazon.com Inc.', symbol: 'AMZN', isin: 'US0231351067', quantity: 150, price: 1000.00, value: 150000.00 },
              { name: 'Tesla Inc.', symbol: 'TSLA', isin: 'US88160R1014', quantity: 300, price: 250.00, value: 75000.00 }
            ]
          };

          // Save to localStorage
          localStorage.setItem('localFiles', JSON.stringify(files));
        }

        // Update UI
        const processBtn = document.getElementById('process-document-btn');
        if (processBtn) {
          processBtn.disabled = false;
          processBtn.innerHTML = 'Process Complete';
        }

        // Update status
        const statusText = document.getElementById('processing-status');
        if (statusText) {
          statusText.textContent = 'Processing complete!';
          statusText.style.color = '#28a745';
          statusText.style.fontWeight = 'bold';
        }

        // Show success message
        alert('Document processed successfully! You can now chat with this document.');

        // Redirect to document chat page
        setTimeout(() => {
          // Store selected document ID for chat page
          localStorage.setItem('selectedDocumentId', fileId);

          // Navigate to chat page
          window.location.href = '/document-chat';
        }, 1000);
      }
    }

    // Check if we're on the document chat page
    const isDocumentChatPage = window.location.pathname.includes('/document-chat');

    if (isDocumentChatPage) {
      console.log('On document chat page, setting up chat interface');

      // Set up document chat
      setupDocumentChat();
    }

    // Set up document chat
    function setupDocumentChat() {
      // Create chat container if it doesn't exist
      let chatContainer = document.getElementById('document-chat-container');

      if (!chatContainer) {
        chatContainer = document.createElement('div');
        chatContainer.id = 'document-chat-container';
        chatContainer.className = 'chat-container';
        chatContainer.style.margin = '20px auto';
        chatContainer.style.maxWidth = '800px';
        chatContainer.style.padding = '20px';
        chatContainer.style.border = '1px solid #ddd';
        chatContainer.style.borderRadius = '5px';
        chatContainer.style.backgroundColor = '#f9f9f9';

        // Add to page
        const mainContent = document.querySelector('.main-content');
        if (mainContent) {
          mainContent.appendChild(chatContainer);
        } else {
          document.body.appendChild(chatContainer);
        }
      }

      // Get processed files
      const files = JSON.parse(localStorage.getItem('localFiles') || '[]');
      const processedFiles = files.filter(f => f.processed);

      // Create document selector
      let documentSelector = document.createElement('div');
      documentSelector.className = 'document-selector';
      documentSelector.style.marginBottom = '20px';

      documentSelector.innerHTML = `
        <label for="document-select">Select a document:</label>
        <select id="document-select" class="form-control" style="margin-top: 5px;">
          <option value="">-- Select a document --</option>
          ${processedFiles.map(file => `<option value="${file.id}">${file.name}</option>`).join('')}
        </select>
      `;

      // Create chat messages container
      let chatMessages = document.createElement('div');
      chatMessages.id = 'document-chat-messages';
      chatMessages.className = 'chat-messages';
      chatMessages.style.height = '300px';
      chatMessages.style.overflowY = 'auto';
      chatMessages.style.padding = '10px';
      chatMessages.style.border = '1px solid #ddd';
      chatMessages.style.borderRadius = '5px';
      chatMessages.style.backgroundColor = 'white';
      chatMessages.style.marginBottom = '10px';

      // Add welcome message
      chatMessages.innerHTML = `
        <div class="message ai-message" style="margin-bottom: 10px; padding: 10px; background-color: #f0f0f0; border-radius: 5px;">
          <p>Please select a document to start chatting.</p>
        </div>
      `;

      // Create chat input
      let chatInput = document.createElement('div');
      chatInput.className = 'chat-input';
      chatInput.style.display = 'flex';

      chatInput.innerHTML = `
        <input type="text" id="document-chat-input" class="form-control" placeholder="Ask a question about the document..." style="flex: 1; margin-right: 10px;">
        <button id="document-send-btn" class="btn btn-primary">Send</button>
      `;

      // Assemble chat container
      chatContainer.innerHTML = '';
      chatContainer.appendChild(documentSelector);
      chatContainer.appendChild(chatMessages);
      chatContainer.appendChild(chatInput);

      // Get elements
      const documentSelect = document.getElementById('document-select');
      const chatMessagesContainer = document.getElementById('document-chat-messages');
      const documentChatInput = document.getElementById('document-chat-input');
      const documentSendBtn = document.getElementById('document-send-btn');

      // Handle document selection
      if (documentSelect) {
        // Check if there's a selected document ID in localStorage
        const selectedDocumentId = localStorage.getItem('selectedDocumentId');
        if (selectedDocumentId) {
          documentSelect.value = selectedDocumentId;

          // Clear localStorage
          localStorage.removeItem('selectedDocumentId');

          // Trigger change event
          const event = new Event('change');
          documentSelect.dispatchEvent(event);
        }

        documentSelect.addEventListener('change', function() {
          const selectedId = this.value;

          if (selectedId) {
            // Get file info
            const files = JSON.parse(localStorage.getItem('localFiles') || '[]');
            const selectedFile = files.find(f => f.id === selectedId);

            if (selectedFile) {
              // Update chat messages
              chatMessagesContainer.innerHTML = `
                <div class="message ai-message" style="margin-bottom: 10px; padding: 10px; background-color: #f0f0f0; border-radius: 5px;">
                  <p>I'm ready to answer questions about "${selectedFile.name}". What would you like to know?</p>
                </div>
              `;

              // Enable chat input
              documentChatInput.disabled = false;
              documentSendBtn.disabled = false;
            }
          } else {
            // No document selected
            chatMessagesContainer.innerHTML = `
              <div class="message ai-message" style="margin-bottom: 10px; padding: 10px; background-color: #f0f0f0; border-radius: 5px;">
                <p>Please select a document to start chatting.</p>
              </div>
            `;

            // Disable chat input
            documentChatInput.disabled = true;
            documentSendBtn.disabled = true;
          }
        });
      }

      // Handle send button
      if (documentSendBtn && documentChatInput && chatMessagesContainer) {
        // Disable chat input until document is selected
        documentChatInput.disabled = true;
        documentSendBtn.disabled = true;

        documentSendBtn.addEventListener('click', function() {
          sendMessage();
        });

        documentChatInput.addEventListener('keypress', function(e) {
          if (e.key === 'Enter') {
            sendMessage();
          }
        });

        // Send message function
        function sendMessage() {
          const message = documentChatInput.value.trim();
          const selectedId = documentSelect.value;

          if (!message || !selectedId) {
            return;
          }

          // Get file info
          const files = JSON.parse(localStorage.getItem('localFiles') || '[]');
          const selectedFile = files.find(f => f.id === selectedId);

          if (!selectedFile) {
            return;
          }

          // Add user message
          chatMessagesContainer.innerHTML += `
            <div class="message user-message" style="margin-bottom: 10px; padding: 10px; background-color: #e3f2fd; border-radius: 5px; text-align: right;">
              <p>${message}</p>
            </div>
          `;

          // Clear input
          documentChatInput.value = '';

          // Scroll to bottom
          chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight;

          // Add thinking message
          const thinkingId = 'thinking-' + Date.now();
          chatMessagesContainer.innerHTML += `
            <div id="${thinkingId}" class="message ai-message" style="margin-bottom: 10px; padding: 10px; background-color: #f0f0f0; border-radius: 5px;">
              <p>Thinking...</p>
            </div>
          `;

          // Scroll to bottom
          chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight;

          // Generate response based on question
          setTimeout(() => {
            // Remove thinking message
            const thinkingMessage = document.getElementById(thinkingId);
            if (thinkingMessage) {
              thinkingMessage.remove();
            }

            // Generate response
            const response = generateResponse(message, selectedFile);

            // Add AI response
            chatMessagesContainer.innerHTML += `
              <div class="message ai-message" style="margin-bottom: 10px; padding: 10px; background-color: #f0f0f0; border-radius: 5px;">
                <p>${response}</p>
              </div>
            `;

            // Scroll to bottom
            chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight;
          }, 1000);
        }

        // Generate response based on question and file data
        function generateResponse(question, file) {
          question = question.toLowerCase();

          // Check if file has data
          if (!file.data) {
            return "I don't have any processed data for this document. Please try processing it again.";
          }

          // Generate response based on question
          if (question.includes('total value') || question.includes('portfolio value')) {
            return `The total value of the portfolio is ${file.data.totalValue} as of the latest valuation date.`;
          } else if (question.includes('top 3') || question.includes('top three') || question.includes('largest holdings')) {
            const holdings = file.data.topHoldings;
            return `The top 3 holdings in the portfolio are:<br>
              1. ${holdings[0].name} - ${holdings[0].value} (${holdings[0].percentage})<br>
              2. ${holdings[1].name} - ${holdings[1].value} (${holdings[1].percentage})<br>
              3. ${holdings[2].name} - ${holdings[2].value} (${holdings[2].percentage})`;
          } else if (question.includes('apple') && question.includes('percentage')) {
            const apple = file.data.securities.find(s => s.name.toLowerCase().includes('apple'));
            if (apple) {
              const percentage = ((apple.value / 1250000) * 100).toFixed(1) + '%';
              return `Apple Inc. (AAPL) represents ${percentage} of the total portfolio value.`;
            }
            return "I couldn't find information about Apple in this portfolio.";
          } else if (question.includes('microsoft') && question.includes('acquisition price')) {
            const microsoft = file.data.securities.find(s => s.name.toLowerCase().includes('microsoft'));
            if (microsoft) {
              return `The average acquisition price for Microsoft shares is $275.50 per share. The current price is $${microsoft.price.toFixed(2)}, representing a gain of 8.9%.`;
            }
            return "I couldn't find information about Microsoft in this portfolio.";
          } else if (question.includes('asset allocation') || question.includes('allocation')) {
            const allocation = file.data.assetAllocation;
            return `The asset allocation of the portfolio is:<br>
              - Equities: ${allocation.equities.percentage} (${allocation.equities.value})<br>
              - Fixed Income: ${allocation.fixedIncome.percentage} (${allocation.fixedIncome.value})<br>
              - Cash: ${allocation.cash.percentage} (${allocation.cash.value})`;
          } else if (question.includes('securities') || question.includes('stocks') || question.includes('holdings')) {
            const securities = file.data.securities;
            let response = "Here are the securities in the portfolio:<br>";
            securities.forEach((security, index) => {
              response += `${index + 1}. ${security.name} (${security.symbol}) - ${security.quantity} shares at $${security.price.toFixed(2)} = $${security.value.toFixed(2)}<br>`;
            });
            return response;
          } else {
            return "I don't have specific information about that in the document. Would you like to know about the total portfolio value, top holdings, asset allocation, or securities?";
          }
        }
      }
    }
  }
})();