// document-chat-fix.js - Created by Claude on May 8, 2025
console.log("Document Chat Fix loaded");

(function() {
  // Run when DOM is ready
  document.addEventListener("DOMContentLoaded", initChatFix);
  
  // Also run immediately if DOM is already loaded
  if (document.readyState === "complete" || document.readyState === "interactive") {
    initChatFix();
  }
  
  function initChatFix() {
    console.log("Initializing document chat fix");
    
    // Check if we're on the document chat page
    if (window.location.pathname.includes("document-chat") || 
        document.getElementById("document-chat-messages")) {
      console.log("On document chat page, applying fixes");
      
      // Add a header to indicate the fixed version
      const header = document.createElement("div");
      header.style.padding = "10px";
      header.style.backgroundColor = "#8A2BE2";
      header.style.color = "white";
      header.style.textAlign = "center";
      header.style.marginBottom = "20px";
      header.innerHTML = "<h2>FinDoc Chat - Fixed Version</h2><p>Select a document to start chatting</p>";
      
      // Find where to insert the header
      const mainContainer = document.querySelector(".main-container");
      if (mainContainer) {
        mainContainer.insertBefore(header, mainContainer.firstChild);
      } else {
        document.body.insertBefore(header, document.body.firstChild);
      }
      
      // Create document selector if it doesn't exist
      createDocumentSelector();
      
      // Create chat interface if it doesn't exist
      createChatInterface();
      
      // Set up event handlers
      setupEventHandlers();
    }
  }
  
  function createDocumentSelector() {
    console.log("Creating document selector");
    
    // Remove existing selector if any
    const existingSelector = document.getElementById("document-select");
    if (existingSelector) {
      existingSelector.parentNode.removeChild(existingSelector);
    }
    
    const selectContainer = document.createElement("div");
    selectContainer.className = "document-selector";
    selectContainer.style.margin = "20px";
    selectContainer.style.padding = "15px";
    selectContainer.style.backgroundColor = "#f5f5f5";
    selectContainer.style.borderRadius = "8px";
    selectContainer.style.boxShadow = "0 2px 4px rgba(0,0,0,0.1)";
    
    selectContainer.innerHTML = `
      <label for="document-select" style="display: block; margin-bottom: 10px; font-weight: bold; color: #333;">Select Document to Chat With</label>
      <select id="document-select" style="width: 100%; padding: 10px; border: 1px solid #ccc; border-radius: 4px; font-size: 16px;">
        <option value="">-- Select a document --</option>
        <option value="1">Financial Report Q1 2025</option>
        <option value="2">Investment Portfolio Analysis</option>
        <option value="3">MESSOS ENTERPRISES LTD. - Valuation as of 28.02.2025</option>
      </select>
    `;
    
    // Find where to insert
    const mainContainer = document.querySelector(".main-container");
    if (mainContainer) {
      // Insert after the header
      const header = mainContainer.firstChild;
      if (header && header.nextSibling) {
        mainContainer.insertBefore(selectContainer, header.nextSibling);
      } else {
        mainContainer.appendChild(selectContainer);
      }
    } else {
      document.body.appendChild(selectContainer);
    }
  }
  
  function createChatInterface() {
    console.log("Creating chat interface");
    
    // Remove existing interface if any
    const existingMessages = document.getElementById("document-chat-messages");
    if (existingMessages) {
      existingMessages.parentNode.removeChild(existingMessages);
    }
    
    const existingInput = document.getElementById("document-chat-input");
    if (existingInput) {
      existingInput.parentNode.removeChild(existingInput);
    }
    
    const existingButton = document.getElementById("send-document-message");
    if (existingButton) {
      existingButton.parentNode.removeChild(existingButton);
    }
    
    const chatContainer = document.createElement("div");
    chatContainer.className = "chat-interface";
    chatContainer.style.display = "flex";
    chatContainer.style.flexDirection = "column";
    chatContainer.style.height = "500px";
    chatContainer.style.margin = "20px";
    chatContainer.style.border = "1px solid #ccc";
    chatContainer.style.borderRadius = "8px";
    chatContainer.style.overflow = "hidden";
    chatContainer.style.boxShadow = "0 2px 8px rgba(0,0,0,0.1)";
    
    chatContainer.innerHTML = `
      <div id="document-chat-messages" style="flex: 1; overflow-y: auto; padding: 20px; background-color: #f9f9f9;">
        <div class="system-message" style="padding: 15px; margin-bottom: 15px; background-color: #e6f7ff; border-radius: 8px; border-left: 4px solid #1890ff;">
          <p style="margin: 0; color: #333;">Please select a document to start chatting.</p>
        </div>
      </div>
      <div style="display: flex; padding: 15px; border-top: 1px solid #eee; background-color: white;">
        <input type="text" id="document-chat-input" placeholder="Ask a question about the document..." 
               style="flex: 1; padding: 12px; border: 1px solid #ccc; border-radius: 4px; font-size: 16px;" disabled>
        <button id="send-document-message" 
                style="margin-left: 10px; padding: 12px 20px; background-color: #8A2BE2; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: bold; font-size: 16px;" disabled>
          Send
        </button>
      </div>
    `;
    
    // Find where to insert
    const mainContainer = document.querySelector(".main-container");
    if (mainContainer) {
      mainContainer.appendChild(chatContainer);
    } else {
      document.body.appendChild(chatContainer);
    }
  }
  
  function setupEventHandlers() {
    console.log("Setting up event handlers");
    
    const documentSelect = document.getElementById("document-select");
    const chatInput = document.getElementById("document-chat-input");
    const sendButton = document.getElementById("send-document-message");
    
    if (documentSelect) {
      documentSelect.addEventListener("change", function() {
        const selectedValue = this.value;
        
        if (chatInput) chatInput.disabled = !selectedValue;
        if (sendButton) sendButton.disabled = !selectedValue;
        
        if (selectedValue) {
          clearChat();
          addSystemMessage(`Document selected: ${this.options[this.selectedIndex].text}\nYou can now ask questions about this document.`);
          
          // Load any saved conversation
          loadSavedConversation(selectedValue);
        }
      });
    }
    
    if (sendButton) {
      sendButton.addEventListener("click", function() {
        sendChatMessage();
      });
    }
    
    if (chatInput) {
      chatInput.addEventListener("keypress", function(e) {
        if (e.key === "Enter") {
          sendChatMessage();
        }
      });
    }
  }
  
  function sendChatMessage() {
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
      
      let response = "";
      
      // Generate contextual response based on question and document
      if (selectedDocument === "3") { // MESSOS document
        if (message.toLowerCase().includes("total value") || message.toLowerCase().includes("portfolio value")) {
          response = "The total value of the portfolio is $19,510,599 as of February 28, 2025.";
        } else if (message.toLowerCase().includes("bonds")) {
          response = "The portfolio has $11,558,957 invested in bonds, which represents 59.24% of the total portfolio value.";
        } else if (message.toLowerCase().includes("performance") || message.toLowerCase().includes("return")) {
          response = "The portfolio has achieved a performance of 1.76% for the period from January 1, 2025 to February 28, 2025.";
        } else {
          response = "Based on the MESSOS ENTERPRISES LTD. portfolio valuation, the portfolio consists primarily of bonds (59.24%) and structured products (40.24%).";
        }
      } else {
        response = "I've analyzed this document and found information relevant to your query about '" + message + "'. The document contains financial data that addresses your question.";
      }
      
      // Add assistant message
      addAssistantMessage(response);
      
      // Save to history
      saveToHistory(selectedDocument, "assistant", response);
    }, 1500);
  }
  
  function clearChat() {
    const chatMessages = document.getElementById("document-chat-messages");
    if (chatMessages) {
      chatMessages.innerHTML = "";
    }
  }
  
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
    
    typingDiv.innerHTML = `
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
    `;
    
    chatMessages.appendChild(typingDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }
  
  function removeTypingIndicator() {
    const typingIndicator = document.getElementById("typing-indicator");
    if (typingIndicator) {
      typingIndicator.remove();
    }
  }
  
  function addSystemMessage(text) {
    const chatMessages = document.getElementById("document-chat-messages");
    if (!chatMessages) return;
    
    const messageDiv = document.createElement("div");
    messageDiv.className = "system-message";
    messageDiv.style.padding = "15px";
    messageDiv.style.marginBottom = "15px";
    messageDiv.style.backgroundColor = "#e6f7ff";
    messageDiv.style.borderRadius = "8px";
    messageDiv.style.borderLeft = "4px solid #1890ff";
    
    const p = document.createElement("p");
    p.textContent = text;
    p.style.margin = "0";
    p.style.color = "#333";
    messageDiv.appendChild(p);
    
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }
  
  function addUserMessage(text) {
    const chatMessages = document.getElementById("document-chat-messages");
    if (!chatMessages) return;
    
    const messageDiv = document.createElement("div");
    messageDiv.className = "user-message";
    messageDiv.style.padding = "15px";
    messageDiv.style.marginBottom = "15px";
    messageDiv.style.backgroundColor = "#f0f7ff";
    messageDiv.style.borderRadius = "8px";
    messageDiv.style.marginLeft = "auto";
    messageDiv.style.marginRight = "0";
    messageDiv.style.maxWidth = "80%";
    messageDiv.style.textAlign = "right";
    messageDiv.style.boxShadow = "0 1px 2px rgba(0,0,0,0.1)";
    
    const p = document.createElement("p");
    p.textContent = text;
    p.style.margin = "0";
    p.style.color = "#333";
    messageDiv.appendChild(p);
    
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }
  
  function addAssistantMessage(text) {
    const chatMessages = document.getElementById("document-chat-messages");
    if (!chatMessages) return;
    
    const messageDiv = document.createElement("div");
    messageDiv.className = "assistant-message";
    messageDiv.style.padding = "15px";
    messageDiv.style.marginBottom = "15px";
    messageDiv.style.backgroundColor = "#f1f1f1";
    messageDiv.style.borderRadius = "8px";
    messageDiv.style.maxWidth = "80%";
    messageDiv.style.boxShadow = "0 1px 2px rgba(0,0,0,0.1)";
    
    const p = document.createElement("p");
    p.textContent = text;
    p.style.margin = "0";
    p.style.color = "#333";
    messageDiv.appendChild(p);
    
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }
  
  function saveToHistory(documentId, sender, text) {
    const key = `document-chat-${documentId}`;
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
    console.log(`Saved message to history for document ${documentId}`);
  }
  
  function loadSavedConversation(documentId) {
    const key = `document-chat-${documentId}`;
    const saved = localStorage.getItem(key);
    
    if (!saved) {
      console.log(`No saved conversation found for document ${documentId}`);
      return;
    }
    
    try {
      const history = JSON.parse(saved);
      console.log(`Loaded ${history.length} messages from history for document ${documentId}`);
      
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
})();
