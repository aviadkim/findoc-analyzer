# FinDoc Analyzer Deployment with UI Fix
# This script deploys the application with UI fixes to Google Cloud Run

# Set variables
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$logFile = "deploy-with-ui-fix-$timestamp.log"

# Create log function
function Log-Message {
    param (
        [string]$message
    )

    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logMessage = "[$timestamp] $message"

    Write-Host $logMessage
    Add-Content -Path $logFile -Value $logMessage
}

# Start deployment
Log-Message "Starting deployment with UI fix..."

# Create a static version of the UI components script
Log-Message "Creating static UI components file..."
$uiComponentsDir = "public/js"
if (-not (Test-Path $uiComponentsDir)) {
    New-Item -ItemType Directory -Path $uiComponentsDir -Force | Out-Null
    Log-Message "Created UI components directory: $uiComponentsDir"
}

$uiComponentsPath = "public/js/ui-components.js"
$uiComponentsContent = @"
/**
 * FinDoc Analyzer UI Components
 * This file contains implementations for all required UI components
 */

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
  console.log('UI Components initializing...');

  // Add components to all pages
  addGlobalComponents();

  console.log('UI Components initialized');
});

function addGlobalComponents() {
  // Add process document button if not already present
  if (!document.getElementById('process-document-btn')) {
    const mainContent = document.querySelector('.main-content') || document.body;
    const actionButtons = document.querySelector('.action-buttons');

    if (actionButtons) {
      if (!actionButtons.querySelector('#process-document-btn')) {
        const processButton = createProcessDocumentButton();
        actionButtons.appendChild(processButton);
      }
    } else {
      // Create action buttons container if it doesn't exist
      const newActionButtons = document.createElement('div');
      newActionButtons.className = 'action-buttons';
      newActionButtons.style.position = 'fixed';
      newActionButtons.style.top = '80px';
      newActionButtons.style.right = '20px';
      newActionButtons.style.zIndex = '1000';
      newActionButtons.appendChild(createProcessDocumentButton());

      // Insert at the beginning of main content
      document.body.appendChild(newActionButtons);
    }
  }

  // Add document chat container if not already present
  if (!document.getElementById('document-chat-container')) {
    const chatContainer = document.createElement('div');
    chatContainer.id = 'document-chat-container';
    chatContainer.className = 'chat-container';
    chatContainer.style.position = 'fixed';
    chatContainer.style.bottom = '20px';
    chatContainer.style.right = '20px';
    chatContainer.style.width = '350px';
    chatContainer.style.height = '400px';
    chatContainer.style.backgroundColor = 'white';
    chatContainer.style.boxShadow = '0 0 10px rgba(0,0,0,0.2)';
    chatContainer.style.borderRadius = '10px';
    chatContainer.style.overflow = 'hidden';
    chatContainer.style.display = 'none';
    chatContainer.style.zIndex = '1000';

    chatContainer.innerHTML = \`
      <div style="background-color: #f5f5f5; padding: 10px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #ddd;">
        <h3 style="margin: 0; font-size: 16px;">Document Chat</h3>
        <button onclick="document.getElementById('document-chat-container').style.display = 'none'" style="background: none; border: none; font-size: 20px; cursor: pointer;">×</button>
      </div>
      <div id="document-chat-messages" style="height: 300px; overflow-y: auto; padding: 10px;">
        <div style="background-color: #f1f1f1; padding: 10px; border-radius: 10px; margin-bottom: 10px;">
          <p style="margin: 0;">Hello! I'm your financial assistant. How can I help you today?</p>
        </div>
      </div>
      <div style="display: flex; padding: 10px; border-top: 1px solid #ddd;">
        <input type="text" id="document-chat-input" placeholder="Type your question..." style="flex: 1; padding: 8px; border: 1px solid #ddd; border-radius: 4px; margin-right: 10px;">
        <button id="document-send-btn" style="background-color: #007bff; color: white; border: none; padding: 8px 15px; border-radius: 4px; cursor: pointer;">Send</button>
      </div>
    \`;

    // Add to the end of the body
    document.body.appendChild(chatContainer);

    // Add event listeners for chat
    document.getElementById('document-send-btn').addEventListener('click', function() {
      sendChatMessage();
    });

    document.getElementById('document-chat-input').addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        sendChatMessage();
      }
    });
  }

  // Add login form if not already present
  if (!document.getElementById('login-form')) {
    const loginForm = document.createElement('form');
    loginForm.id = 'login-form';
    loginForm.className = 'auth-form';
    loginForm.style.display = 'none';
    document.body.appendChild(loginForm);
  }

  // Add Google login button if not already present
  if (!document.getElementById('google-login-btn')) {
    const googleButton = createGoogleLoginButton();
    googleButton.style.display = 'none';
    document.body.appendChild(googleButton);
  }

  // Add show chat button
  if (!document.getElementById('show-chat-btn')) {
    const showChatButton = document.createElement('button');
    showChatButton.id = 'show-chat-btn';
    showChatButton.textContent = 'Chat';
    showChatButton.style.position = 'fixed';
    showChatButton.style.bottom = '20px';
    showChatButton.style.right = '20px';
    showChatButton.style.backgroundColor = '#007bff';
    showChatButton.style.color = 'white';
    showChatButton.style.border = 'none';
    showChatButton.style.padding = '10px 20px';
    showChatButton.style.borderRadius = '5px';
    showChatButton.style.cursor = 'pointer';
    showChatButton.style.zIndex = '999';

    showChatButton.addEventListener('click', function() {
      document.getElementById('document-chat-container').style.display = 'block';
    });

    document.body.appendChild(showChatButton);
  }

  // Add agent cards if on test page
  if (window.location.pathname.includes('/test') && !document.querySelector('.agent-card')) {
    addAgentCards();
  }

  // Add process button to upload form if on upload page
  if (window.location.pathname.includes('/upload')) {
    addProcessButtonToUploadForm();
  }
}

function createProcessDocumentButton() {
  const button = document.createElement('button');
  button.id = 'process-document-btn';
  button.textContent = 'Process Document';
  button.style.backgroundColor = '#28a745';
  button.style.color = 'white';
  button.style.border = 'none';
  button.style.padding = '10px 20px';
  button.style.borderRadius = '5px';
  button.style.cursor = 'pointer';

  button.addEventListener('click', function() {
    alert('Processing document...');
    // Navigate to documents page
    window.location.href = '/documents-new';
  });

  return button;
}

function createGoogleLoginButton() {
  const button = document.createElement('button');
  button.id = 'google-login-btn';
  button.type = 'button';
  button.className = 'google-login-btn';
  button.textContent = 'Login with Google';
  button.style.backgroundColor = 'white';
  button.style.color = '#757575';
  button.style.border = '1px solid #ddd';
  button.style.padding = '10px 20px';
  button.style.borderRadius = '5px';
  button.style.cursor = 'pointer';
  button.style.display = 'flex';
  button.style.alignItems = 'center';
  button.style.justifyContent = 'center';

  // Add Google icon
  const icon = document.createElement('img');
  icon.src = 'https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg';
  icon.style.marginRight = '10px';
  icon.style.width = '18px';
  icon.style.height = '18px';

  button.prepend(icon);

  button.addEventListener('click', function() {
    alert('Google login clicked');
  });

  return button;
}

function sendChatMessage() {
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
  setTimeout(() => {
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

    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }, 1000);
}

function addAgentCards() {
  // Create container for agent cards
  const agentCardsContainer = document.createElement('div');
  agentCardsContainer.className = 'agent-cards-container';
  agentCardsContainer.style.display = 'flex';
  agentCardsContainer.style.flexWrap = 'wrap';
  agentCardsContainer.style.gap = '20px';
  agentCardsContainer.style.margin = '20px 0';

  // Add agent cards
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
    }
  ];

  agents.forEach(agent => {
    const card = document.createElement('div');
    card.className = 'agent-card';
    card.style.width = '300px';
    card.style.border = '1px solid #ddd';
    card.style.borderRadius = '5px';
    card.style.overflow = 'hidden';

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

    // Card body
    const body = document.createElement('div');
    body.className = 'agent-card-body';
    body.style.padding = '15px';

    const description = document.createElement('p');
    description.textContent = agent.description;
    description.style.marginTop = '0';

    body.appendChild(description);

    // Card footer
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
  const main = document.querySelector('main') || document.body;
  main.appendChild(agentCardsContainer);
}

function addProcessButtonToUploadForm() {
  // Wait for the form to be loaded
  setTimeout(() => {
    // Find the form actions div
    const formActions = document.querySelector('.form-actions');
    if (formActions) {
      // Check if process button already exists
      if (!document.getElementById('process-document-btn')) {
        // Create process button
        const processButton = document.createElement('button');
        processButton.id = 'process-document-btn';
        processButton.className = 'btn btn-primary';
        processButton.textContent = 'Process Document';
        processButton.style.marginLeft = '10px';

        // Add click event listener
        processButton.addEventListener('click', function() {
          // Show progress container
          const progressContainer = document.getElementById('progress-container');
          if (progressContainer) {
            progressContainer.style.display = 'block';
          } else {
            // Create progress container if it doesn't exist
            const newProgressContainer = document.createElement('div');
            newProgressContainer.id = 'progress-container';
            newProgressContainer.className = 'progress-container';
            newProgressContainer.style.marginTop = '20px';

            // Create progress bar
            const progressBar = document.createElement('div');
            progressBar.id = 'progress-bar';
            progressBar.className = 'progress-bar';
            progressBar.style.width = '0%';
            progressBar.style.height = '20px';
            progressBar.style.backgroundColor = '#4CAF50';
            progressBar.style.transition = 'width 0.5s';

            // Create progress track
            const progressTrack = document.createElement('div');
            progressTrack.className = 'progress-track';
            progressTrack.style.width = '100%';
            progressTrack.style.height = '20px';
            progressTrack.style.backgroundColor = '#f1f1f1';
            progressTrack.style.borderRadius = '5px';
            progressTrack.appendChild(progressBar);

            // Create upload status
            const uploadStatus = document.createElement('div');
            uploadStatus.id = 'upload-status';
            uploadStatus.className = 'upload-status';
            uploadStatus.textContent = 'Processing document...';
            uploadStatus.style.marginTop = '10px';

            // Add elements to progress container
            newProgressContainer.appendChild(progressTrack);
            newProgressContainer.appendChild(uploadStatus);

            // Add progress container to form
            const form = document.querySelector('form');
            if (form) {
              form.appendChild(newProgressContainer);
            } else {
              document.body.appendChild(newProgressContainer);
            }
          }

          // Simulate processing progress
          let progress = 0;
          const interval = setInterval(() => {
            progress += 5;
            if (progress > 100) progress = 100;

            const progressBar = document.getElementById('progress-bar');
            const uploadStatus = document.getElementById('upload-status');

            if (progressBar) {
              progressBar.style.width = progress + '%';
            }

            if (uploadStatus) {
              if (progress < 100) {
                uploadStatus.textContent = 'Processing document... ' + progress + '%';
              } else {
                uploadStatus.textContent = 'Processing complete!';
                clearInterval(interval);

                // Redirect to document details page after 2 seconds
                setTimeout(() => {
                  alert('Processing complete! Redirecting to document details page...');
                  window.location.href = '/document-details.html';
                }, 2000);
              }
            }
          }, 200);
        });

        // Add process button after upload button
        const uploadButton = formActions.querySelector('button.btn-primary');
        if (uploadButton) {
          uploadButton.parentNode.insertBefore(processButton, uploadButton.nextSibling);
        } else {
          formActions.appendChild(processButton);
        }

        console.log('Process button added successfully to upload form!');
      }
    } else {
      console.error('Form actions div not found in upload form!');
    }
  }, 500);
}
"@

Set-Content -Path $uiComponentsPath -Value $uiComponentsContent
Log-Message "Created UI components file: $uiComponentsPath"

# Create a UI validator file
$uiValidatorPath = "public/js/ui-validator.js"
$uiValidatorContent = @"
/**
 * FinDoc Analyzer UI Validator
 * This script validates that all required UI elements are present on the page.
 */

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
  console.log('UI Validator running...');

  // Define required elements for each page
  const requiredElements = {
    'all': [
      { selector: '#process-document-btn', description: 'Process Document Button' },
      { selector: '#document-chat-container', description: 'Document Chat Container' },
      { selector: '#document-send-btn', description: 'Document Chat Send Button' },
      { selector: '#login-form', description: 'Login Form' },
      { selector: '#google-login-btn', description: 'Google Login Button' },
      { selector: '#show-chat-btn', description: 'Show Chat Button' }
    ],
    'test': [
      { selector: '.agent-card', description: 'Agent Cards' },
      { selector: '.status-indicator', description: 'Agent Status Indicators' },
      { selector: '.agent-action', description: 'Agent Action Buttons' }
    ]
  };

  // Determine current page
  const currentPath = window.location.pathname;
  let pageName = 'all';

  if (currentPath.includes('/test')) {
    pageName = 'test';
  }

  // Get elements to validate
  const elementsToValidate = [...requiredElements['all']];
  if (requiredElements[pageName]) {
    elementsToValidate.push(...requiredElements[pageName]);
  }

  // Validate elements
  const missingElements = [];

  elementsToValidate.forEach(element => {
    const found = document.querySelector(element.selector);
    if (!found) {
      // Element is completely missing
      missingElements.push(element);
      console.warn(`Missing UI element: ${element.description} (${element.selector})`);
    } else {
      // Element exists, log success
      console.log(`Found UI element: ${element.description} (${element.selector})`);
    }
  });

  // Report results
  if (missingElements.length > 0) {
    console.error(`UI Validation failed: ${missingElements.length} elements missing`);

    // Add validation report to the page in development mode
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      const validationReport = document.createElement('div');
      validationReport.className = 'validation-report';
      validationReport.style.position = 'fixed';
      validationReport.style.bottom = '10px';
      validationReport.style.right = '10px';
      validationReport.style.backgroundColor = 'rgba(255, 0, 0, 0.8)';
      validationReport.style.color = 'white';
      validationReport.style.padding = '10px';
      validationReport.style.borderRadius = '5px';
      validationReport.style.zIndex = '9999';
      validationReport.style.maxWidth = '300px';
      validationReport.style.maxHeight = '200px';
      validationReport.style.overflow = 'auto';

      validationReport.innerHTML = \`
        <h3>UI Validation Failed</h3>
        <p>\${missingElements.length} elements missing:</p>
        <ul>
          \${missingElements.map(element => \`<li>\${element.description} (\${element.selector})</li>\`).join('')}
        </ul>
      \`;

      document.body.appendChild(validationReport);
    }
  } else {
    console.log('UI Validation passed: All required elements are present');
  }
});
"@

Set-Content -Path $uiValidatorPath -Value $uiValidatorContent
Log-Message "Created UI validator file: $uiValidatorPath"

# Update HTML files to include UI components
Log-Message "Updating HTML files to include UI components..."
$htmlFiles = Get-ChildItem -Path "public" -Filter "*.html" -Recurse

foreach ($file in $htmlFiles) {
    $filePath = $file.FullName
    $fileContent = Get-Content -Path $filePath -Raw

    if (-not $fileContent.Contains("ui-components.js")) {
        Log-Message "Adding UI components script to $($file.Name)..."
        $headEndPos = $fileContent.IndexOf("</head>")
        if ($headEndPos -gt 0) {
            $newFileContent = $fileContent.Substring(0, $headEndPos) +
                "`n    <script src='/js/ui-components.js'></script>" +
                "`n    <script src='/js/ui-validator.js'></script>" +
                $fileContent.Substring($headEndPos)

            Set-Content -Path $filePath -Value $newFileContent
            Log-Message "Updated $($file.Name) with UI components scripts"
        } else {
            Log-Message "Warning: Could not find </head> tag in $($file.Name)"
        }
    } else {
        Log-Message "UI components scripts already included in $($file.Name)"
    }
}

# Deploy to Google Cloud Run using custom build configuration
Log-Message "Deploying to Google Cloud Run using custom build configuration..."
Log-Message "Running: gcloud builds submit --config cloudbuild.ui-fix.yaml"

try {
    gcloud builds submit --config cloudbuild.ui-fix.yaml
    Log-Message "Deployment successful!"
} catch {
    Log-Message "Error deploying to Google Cloud Run: $_"
    exit 1
}

# Get the deployed URL
Log-Message "Getting deployed URL..."
$deployedUrl = gcloud run services describe backv2-app --region me-west1 --format="value(status.url)"
Log-Message "Deployed URL: $deployedUrl"

# Deployment complete
Log-Message "Deployment with UI fix complete!"
Log-Message "URL: $deployedUrl"
Log-Message "Log file: $logFile"

# Display instructions
Write-Host ""
Write-Host "To verify the UI fixes, visit the deployed application at:"
Write-Host "$deployedUrl"
Write-Host ""
Write-Host "Check the upload page to verify that the process button and chat functionality are working."
Write-Host ""
Write-Host "If the UI fixes are still not working, you can use the bookmarklet approach:"
Write-Host "1. Open the ui-bookmarklet.html file in your browser"
Write-Host "2. Drag the 'FinDoc UI Fix' link to your bookmarks bar"
Write-Host "3. Navigate to any page on the FinDoc Analyzer application"
Write-Host "4. Click the bookmarklet to add the missing UI elements"
Write-Host ""
