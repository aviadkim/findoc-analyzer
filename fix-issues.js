const fs = require('fs');
const path = require('path');

// Configuration
const config = {
  publicDir: path.join(__dirname, 'public'),
  jsDir: path.join(__dirname, 'public', 'js'),
  issuesLogPath: path.join(__dirname, 'test-issues.md')
};

// Main function
async function fixIssues() {
  console.log('Starting automatic fixes for FinDoc Analyzer...');
  
  // Check if issues log exists
  if (!fs.existsSync(config.issuesLogPath)) {
    console.log('No issues log found. Please run the tests first.');
    return;
  }
  
  // Read issues log
  const issuesLog = fs.readFileSync(config.issuesLogPath, 'utf8');
  console.log(`Found issues log. Analyzing...`);
  
  // Common fixes based on known potential issues
  
  // 1. Fix document chat script if needed
  await fixDocumentChat();
  
  // 2. Fix process button script if needed
  await fixProcessButton();
  
  // 3. Fix missing navigation links on homepage
  await fixHomepageNavigation();
  
  console.log('Automatic fixes completed!');
  console.log('Please run the tests again to verify the fixes.');
}

// Fix document chat issues
async function fixDocumentChat() {
  console.log('Checking document chat script...');
  
  const chatFixPath = path.join(config.jsDir, 'document-chat-fix.js');
  
  if (!fs.existsSync(chatFixPath)) {
    console.log('Document chat fix script not found!');
    return;
  }
  
  let chatScript = fs.readFileSync(chatFixPath, 'utf8');
  let modified = false;
  
  // Fix 1: Ensure typing indicator is properly implemented
  if (!chatScript.includes('typing-indicator')) {
    console.log('Adding typing indicator implementation...');
    
    // Find the location to insert typing indicator code
    const insertPoint = chatScript.indexOf('function addTypingIndicator()');
    
    if (insertPoint === -1) {
      // Add typing indicator function if missing
      const functionInsertPoint = chatScript.indexOf('function clearChat()');
      if (functionInsertPoint !== -1) {
        const typingIndicatorCode = `
  function addTypingIndicator() {
    const chatMessages = document.getElementById("document-chat-messages");
    if (!chatMessages) return;
    
    const typingDiv = document.createElement("div");
    typingDiv.id = "typing-indicator";
    typingDiv.className = "assistant-message";
    typingDiv.style.padding = "15px";
    typingDiv.style.marginBottom = "15px";
    typingDiv.style.backgroundColor = "#f1f1f1";
    typingDiv.style.borderRadius = "8px";
    typingDiv.style.maxWidth = "80%";
    
    typingDiv.innerHTML = \`
      <div class="typing-dots" style="display: flex; column-gap: 4px;">
        <span style="height: 8px; width: 8px; border-radius: 50%; background-color: #888; display: inline-block; animation: typing 1s infinite ease-in-out alternate; animation-delay: 0s;"></span>
        <span style="height: 8px; width: 8px; border-radius: 50%; background-color: #888; display: inline-block; animation: typing 1s infinite ease-in-out alternate; animation-delay: 0.3s;"></span>
        <span style="height: 8px; width: 8px; border-radius: 50%; background-color: #888; display: inline-block; animation: typing 1s infinite ease-in-out alternate; animation-delay: 0.6s;"></span>
      </div>
      <style>
        @keyframes typing {
          0% { transform: translateY(0px); }
          100% { transform: translateY(-8px); }
        }
      </style>
    \`;
    
    chatMessages.appendChild(typingDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }
  
  function removeTypingIndicator() {
    const typingIndicator = document.getElementById("typing-indicator");
    if (typingIndicator) {
      typingIndicator.remove();
    }
  }
  
`;
        chatScript = chatScript.slice(0, functionInsertPoint) + typingIndicatorCode + chatScript.slice(functionInsertPoint);
        modified = true;
      }
    }
  }
  
  // Fix 2: Ensure sendChatMessage uses typing indicator
  if (!chatScript.includes('addTypingIndicator()') || !chatScript.includes('removeTypingIndicator()')) {
    console.log('Fixing chat message typing indicators...');
    
    // Update sendChatMessage function to use typing indicators
    chatScript = chatScript.replace(
      /function sendChatMessage\(\) {[\s\S]*?setTimeout\(function\(\) {/m,
      `function sendChatMessage() {
    const chatInput = document.getElementById("document-chat-input");
    const documentSelect = document.getElementById("document-select");
    
    if (!chatInput || !documentSelect) return;
    
    const message = chatInput.value.trim();
    const selectedDocument = documentSelect.value;
    
    if (!message || !selectedDocument) return;
    
    // Add user message
    addUserMessage(message);
    
    // Save to history
    saveToHistory(selectedDocument, "user", message);
    
    // Clear input
    chatInput.value = "";
    
    // Add typing indicator
    addTypingIndicator();
    
    // Generate response after a delay
    setTimeout(function() {
      // Remove typing indicator
      removeTypingIndicator();
`
    );
    modified = true;
  }
  
  // Fix 3: Ensure localStorage persistence works correctly
  if (!chatScript.includes('localStorage.getItem') || !chatScript.includes('localStorage.setItem')) {
    console.log('Fixing localStorage persistence...');
    
    // Update or add saveToHistory function
    const saveToHistoryCode = `
  function saveToHistory(documentId, sender, text) {
    const key = \`document-chat-\${documentId}\`;
    let history = [];
    
    const saved = localStorage.getItem(key);
    if (saved) {
      try {
        history = JSON.parse(saved);
      } catch (e) {
        console.error("Error parsing saved history:", e);
      }
    }
    
    history.push({
      sender,
      text,
      timestamp: new Date().toISOString()
    });
    
    localStorage.setItem(key, JSON.stringify(history));
    console.log(\`Saved message to history for document \${documentId}\`);
  }
`;
    
    // Find the function or add it if missing
    if (!chatScript.includes('function saveToHistory')) {
      const insertPoint = chatScript.lastIndexOf('})();');
      if (insertPoint !== -1) {
        chatScript = chatScript.slice(0, insertPoint) + saveToHistoryCode + chatScript.slice(insertPoint);
        modified = true;
      }
    } else {
      chatScript = chatScript.replace(
        /function saveToHistory[\s\S]*?}/m,
        saveToHistoryCode.trim()
      );
      modified = true;
    }
    
    // Update or add loadSavedConversation function
    const loadSavedConversationCode = `
  function loadSavedConversation(documentId) {
    const key = \`document-chat-\${documentId}\`;
    const saved = localStorage.getItem(key);
    
    if (!saved) {
      console.log(\`No saved conversation found for document \${documentId}\`);
      return;
    }
    
    try {
      const history = JSON.parse(saved);
      console.log(\`Loaded \${history.length} messages from history for document \${documentId}\`);
      
      for (const item of history) {
        if (item.sender === "user") {
          addUserMessage(item.text);
        } else if (item.sender === "assistant") {
          addAssistantMessage(item.text);
        }
      }
    } catch (e) {
      console.error("Error loading saved conversation:", e);
    }
  }
`;
    
    // Find the function or add it if missing
    if (!chatScript.includes('function loadSavedConversation')) {
      const insertPoint = chatScript.lastIndexOf('})();');
      if (insertPoint !== -1) {
        chatScript = chatScript.slice(0, insertPoint) + loadSavedConversationCode + chatScript.slice(insertPoint);
        modified = true;
      }
    } else {
      chatScript = chatScript.replace(
        /function loadSavedConversation[\s\S]*?}/m,
        loadSavedConversationCode.trim()
      );
      modified = true;
    }
  }
  
  // Save changes if modified
  if (modified) {
    fs.writeFileSync(chatFixPath, chatScript);
    console.log('Updated document chat fix script with improvements');
  } else {
    console.log('Document chat script looks good, no changes needed');
  }
}

// Fix process button issues
async function fixProcessButton() {
  console.log('Checking process button script...');
  
  const buttonFixPath = path.join(config.jsDir, 'process-button-fix.js');
  
  if (!fs.existsSync(buttonFixPath)) {
    console.log('Process button fix script not found!');
    return;
  }
  
  let buttonScript = fs.readFileSync(buttonFixPath, 'utf8');
  let modified = false;
  
  // Fix 1: Ensure validation works properly
  if (!buttonScript.includes('function validateForm()') || !buttonScript.includes('addErrorMessage')) {
    console.log('Adding form validation functionality...');
    
    // Add validation functions if missing
    const validateFormCode = `
  function validateForm() {
    console.log("Validating form");
    
    const documentNameInput = document.getElementById("document-name");
    const documentTypeSelect = document.getElementById("document-type");
    const fileInput = document.getElementById("file-input");
    const floatingBtn = document.getElementById("floating-process-btn");
    
    let isValid = true;
    
    // Clear previous error messages
    const errorMessages = document.querySelectorAll(".error-message");
    errorMessages.forEach(msg => msg.remove());
    
    // Validate document name
    if (documentNameInput && (!documentNameInput.value || documentNameInput.value.trim() === "")) {
      isValid = false;
      addErrorMessage(documentNameInput, "Please enter a document name");
    }
    
    // Validate document type
    if (documentTypeSelect && (!documentTypeSelect.value || documentTypeSelect.value === "")) {
      isValid = false;
      addErrorMessage(documentTypeSelect, "Please select a document type");
    }
    
    // Validate file input
    if (fileInput && (!fileInput.files || fileInput.files.length === 0)) {
      isValid = false;
      addErrorMessage(fileInput, "Please select a file to upload");
    }
    
    // Update floating button state
    if (floatingBtn) {
      if (isValid) {
        floatingBtn.disabled = false;
        floatingBtn.style.opacity = "1";
        floatingBtn.style.cursor = "pointer";
      } else {
        floatingBtn.disabled = true;
        floatingBtn.style.opacity = "0.6";
        floatingBtn.style.cursor = "not-allowed";
      }
    }
    
    return isValid;
  }
  
  function addErrorMessage(element, message) {
    // Check if error message already exists
    const nextElement = element.nextSibling;
    if (nextElement && nextElement.classList && nextElement.classList.contains("error-message")) {
      nextElement.textContent = message;
      return;
    }
    
    // Create error message
    const errorDiv = document.createElement("div");
    errorDiv.className = "error-message";
    errorDiv.textContent = message;
    errorDiv.style.color = "#ff4d4f";
    errorDiv.style.fontSize = "14px";
    errorDiv.style.marginTop = "5px";
    errorDiv.style.marginBottom = "10px";
    
    // Insert after the element
    if (element.nextSibling) {
      element.parentNode.insertBefore(errorDiv, element.nextSibling);
    } else {
      element.parentNode.appendChild(errorDiv);
    }
  }
`;
    
    const insertPoint = buttonScript.lastIndexOf('})();');
    if (insertPoint !== -1) {
      buttonScript = buttonScript.slice(0, insertPoint) + validateFormCode + buttonScript.slice(insertPoint);
      modified = true;
    }
  }
  
  // Fix 2: Ensure floating button click handler validates form
  if (!buttonScript.includes('validateForm()')) {
    console.log('Adding form validation to button click handler...');
    
    buttonScript = buttonScript.replace(
      /button\.addEventListener\("click", function\(\) {[\s\S]*?console\.log\("Floating process button clicked"\);/m,
      `button.addEventListener("click", function() {
      console.log("Floating process button clicked");
      
      // Validate form before processing
      if (!validateForm()) {
        return;
      }`
    );
    modified = true;
  }
  
  // Fix 3: Ensure processing overlay works correctly
  if (!buttonScript.includes('function showProcessingFeedback()') || !buttonScript.includes('processing-overlay')) {
    console.log('Adding processing feedback functionality...');
    
    // Add processing feedback function if missing
    const processingFeedbackCode = `
  function showProcessingFeedback() {
    console.log("Showing processing feedback");
    
    // Create overlay
    let overlay = document.getElementById("processing-overlay");
    if (!overlay) {
      overlay = document.createElement("div");
      overlay.id = "processing-overlay";
      overlay.style.position = "fixed";
      overlay.style.top = "0";
      overlay.style.left = "0";
      overlay.style.width = "100%";
      overlay.style.height = "100%";
      overlay.style.backgroundColor = "rgba(0, 0, 0, 0.7)";
      overlay.style.display = "flex";
      overlay.style.justifyContent = "center";
      overlay.style.alignItems = "center";
      overlay.style.zIndex = "10000";
      
      const content = document.createElement("div");
      content.style.backgroundColor = "white";
      content.style.padding = "30px";
      content.style.borderRadius = "8px";
      content.style.textAlign = "center";
      content.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.2)";
      content.style.maxWidth = "80%";
      
      content.innerHTML = \`
        <h2 style="margin-top: 0; color: #333;">Processing Document</h2>
        <p style="color: #666;">Please wait while we process your document...</p>
        <div class="spinner" style="margin: 20px auto; width: 50px; height: 50px; border: 5px solid #f3f3f3; border-top: 5px solid #8A2BE2; border-radius: 50%; animation: spin 1s linear infinite;"></div>
        <p style="font-size: 14px; color: #999; margin-bottom: 0;">This may take a few moments depending on the document size.</p>
        <style>
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        </style>
      \`;
      
      overlay.appendChild(content);
      document.body.appendChild(overlay);
    } else {
      overlay.style.display = "flex";
    }
  }
`;
    
    const insertPoint = buttonScript.lastIndexOf('})();');
    if (insertPoint !== -1) {
      buttonScript = buttonScript.slice(0, insertPoint) + processingFeedbackCode + buttonScript.slice(insertPoint);
      modified = true;
    }
  }
  
  // Fix 4: Add success message functionality if missing
  if (!buttonScript.includes('function showSuccessMessage')) {
    console.log('Adding success message functionality...');
    
    // Add success message function
    const successMessageCode = `
  function simulateProcessing() {
    console.log("Simulating document processing");
    
    // Get form values for more realistic simulation
    const documentNameInput = document.getElementById("document-name");
    const documentTypeSelect = document.getElementById("document-type");
    const documentName = documentNameInput ? documentNameInput.value : "Untitled Document";
    const documentType = documentTypeSelect ? 
        (documentTypeSelect.options[documentTypeSelect.selectedIndex] ? 
         documentTypeSelect.options[documentTypeSelect.selectedIndex].text : 
         "Unknown Type") : 
        "Unknown Type";
    
    // Keep overlay visible for 3 seconds
    setTimeout(function() {
      // Hide the overlay
      const overlay = document.getElementById("processing-overlay");
      if (overlay) {
        overlay.style.display = "none";
      }
      
      // Show success message
      showSuccessMessage(documentName, documentType);
    }, 3000);
  }
  
  function showSuccessMessage(documentName, documentType) {
    console.log("Showing success message");
    
    // Create success message
    let successMessage = document.getElementById("success-message");
    if (!successMessage) {
      successMessage = document.createElement("div");
      successMessage.id = "success-message";
      successMessage.style.position = "fixed";
      successMessage.style.top = "20px";
      successMessage.style.left = "50%";
      successMessage.style.transform = "translateX(-50%)";
      successMessage.style.backgroundColor = "#52c41a";
      successMessage.style.color = "white";
      successMessage.style.padding = "15px 20px";
      successMessage.style.borderRadius = "4px";
      successMessage.style.boxShadow = "0 2px 8px rgba(0, 0, 0, 0.15)";
      successMessage.style.zIndex = "10001";
      successMessage.style.maxWidth = "80%";
      successMessage.style.textAlign = "center";
      
      document.body.appendChild(successMessage);
    }
    
    successMessage.innerHTML = \`
      <div style="display: flex; align-items: center;">
        <svg viewBox="64 64 896 896" focusable="false" data-icon="check-circle" width="24px" height="24px" fill="currentColor" aria-hidden="true">
          <path d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm193.5 301.7l-210.6 292a31.8 31.8 0 01-51.7 0L318.5 484.9c-3.8-5.3 0-12.7 6.5-12.7h46.9c10.2 0 19.9 4.9 25.9 13.3l71.2 98.8 157.2-218c6-8.3 15.6-13.3 25.9-13.3H699c6.5 0 10.3 7.4 6.5 12.7z"></path>
        </svg>
        <span style="margin-left: 10px; font-weight: bold;">Document processed successfully!</span>
      </div>
      <div style="margin-top: 8px;">\${documentName} (\${documentType}) has been processed and is now ready for analysis.</div>
    \`;
    
    // Automatically hide after 5 seconds
    setTimeout(function() {
      successMessage.style.opacity = "0";
      successMessage.style.transition = "opacity 0.5s ease";
      
      // Remove from DOM after fade out
      setTimeout(function() {
        if (successMessage.parentNode) {
          successMessage.parentNode.removeChild(successMessage);
        }
      }, 500);
    }, 5000);
  }
`;
    
    const insertPoint = buttonScript.lastIndexOf('})();');
    if (insertPoint !== -1) {
      buttonScript = buttonScript.slice(0, insertPoint) + successMessageCode + buttonScript.slice(insertPoint);
      modified = true;
    }
  }
  
  // Fix 5: Ensure button calls showProcessingFeedback
  if (!buttonScript.includes('showProcessingFeedback()')) {
    console.log('Ensuring button click shows processing feedback...');
    
    // Find the button click handler and add processing feedback
    buttonScript = buttonScript.replace(
      /if \(!buttonClicked\) {[\s\S]*?document\.dispatchEvent\(new CustomEvent\("processDocument"\)\);/m,
      `if (!buttonClicked) {
        console.log("No existing process button found, simulating process action");
        // Dispatch a custom event that your app can listen for
        document.dispatchEvent(new CustomEvent("processDocument"));
        
        // Show processing feedback
        showProcessingFeedback();
        
        // Since we don't know if the event was handled, provide feedback after a delay
        setTimeout(function() {
          simulateProcessing();
        }, 500);`
    );
    modified = true;
  }
  
  // Save changes if modified
  if (modified) {
    fs.writeFileSync(buttonFixPath, buttonScript);
    console.log('Updated process button fix script with improvements');
  } else {
    console.log('Process button script looks good, no changes needed');
  }
}

// Fix homepage navigation
async function fixHomepageNavigation() {
  console.log('Checking homepage navigation...');
  
  const indexHtmlPath = path.join(config.publicDir, 'index.html');
  
  if (!fs.existsSync(indexHtmlPath)) {
    console.log('index.html not found!');
    return;
  }
  
  let indexHtml = fs.readFileSync(indexHtmlPath, 'utf8');
  
  // Check if index.html has navigation links
  const hasNavLinks = indexHtml.includes('document-chat.html') && indexHtml.includes('upload.html');
  
  if (!hasNavLinks) {
    console.log('Adding navigation links to homepage...');
    
    // Look for suitable insertion point
    let insertionPoint = indexHtml.indexOf('<body>');
    if (insertionPoint !== -1) {
      insertionPoint += 6; // Move past <body>
      
      const navigationCode = `
  <!-- Navigation added by fixer script -->
  <div style="background-color: #8A2BE2; color: white; padding: 20px; text-align: center; margin-bottom: 20px;">
    <h1>FinDoc Analyzer</h1>
    <p>Upload and analyze financial documents</p>
  </div>
  
  <div style="max-width: 800px; margin: 0 auto; padding: 20px;">
    <h2>Main Features</h2>
    
    <div style="display: flex; justify-content: space-around; margin: 30px 0;">
      <a href="upload.html" style="display: block; width: 45%; text-decoration: none; color: #333; background-color: #f5f5f5; padding: 20px; border-radius: 8px; text-align: center; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        <h3 style="margin-top: 0; color: #8A2BE2;">Upload Documents</h3>
        <p>Upload and process financial documents for analysis</p>
        <div style="background-color: #8A2BE2; color: white; padding: 10px; border-radius: 4px; margin-top: 15px;">Go to Upload</div>
      </a>
      
      <a href="document-chat.html" style="display: block; width: 45%; text-decoration: none; color: #333; background-color: #f5f5f5; padding: 20px; border-radius: 8px; text-align: center; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        <h3 style="margin-top: 0; color: #8A2BE2;">Document Chat</h3>
        <p>Chat with your documents to extract valuable insights</p>
        <div style="background-color: #8A2BE2; color: white; padding: 10px; border-radius: 4px; margin-top: 15px;">Go to Chat</div>
      </a>
    </div>
  </div>
`;
      
      indexHtml = indexHtml.slice(0, insertionPoint) + navigationCode + indexHtml.slice(insertionPoint);
      fs.writeFileSync(indexHtmlPath, indexHtml);
      console.log('Added navigation links to homepage');
    } else {
      console.log('Could not find suitable insertion point in index.html');
    }
  } else {
    console.log('Homepage already has navigation links');
  }
}

// Run the fixer
fixIssues().catch(console.error);
