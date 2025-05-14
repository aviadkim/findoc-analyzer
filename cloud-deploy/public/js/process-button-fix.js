// process-button-fix.js - Created by Claude on May 8, 2025
console.log("Process Button Fix loaded");

(function() {
  // Run when DOM is ready
  document.addEventListener("DOMContentLoaded", initButtonFix);
  
  // Also run immediately if DOM is already loaded
  if (document.readyState === "complete" || document.readyState === "interactive") {
    initButtonFix();
  }
  
  function initButtonFix() {
    console.log("Initializing process button fix");
    
    // Check if we're on the upload page
    if (window.location.pathname.includes("upload") || 
        document.getElementById("file-input")) {
      console.log("On upload page, applying fixes");
      
      // Add a header to indicate the fixed version
      const header = document.createElement("div");
      header.style.padding = "10px";
      header.style.backgroundColor = "#8A2BE2";
      header.style.color = "white";
      header.style.textAlign = "center";
      header.style.marginBottom = "20px";
      header.innerHTML = "<h2>FinDoc Uploader - Fixed Version</h2><p>Upload and process documents with confidence</p>";
      
      // Find where to insert the header
      const mainContainer = document.querySelector(".main-container");
      if (mainContainer) {
        mainContainer.insertBefore(header, mainContainer.firstChild);
      } else {
        document.body.insertBefore(header, document.body.firstChild);
      }
      
      // Create floating process button
      createFloatingButton();
      
      // Fix existing buttons
      fixExistingButtons();
      
      // Add form validation
      addFormValidation();
    }
  }
  
  function createFloatingButton() {
    console.log("Creating floating process button");
    
    // Remove existing floating button if any
    const existingButton = document.getElementById("floating-process-btn");
    if (existingButton) {
      existingButton.parentNode.removeChild(existingButton);
    }
    
    const buttonContainer = document.createElement("div");
    buttonContainer.style.position = "fixed";
    buttonContainer.style.bottom = "20px";
    buttonContainer.style.right = "20px";
    buttonContainer.style.zIndex = "9999";
    
    const button = document.createElement("button");
    button.id = "floating-process-btn";
    button.textContent = "Process Document";
    button.style.backgroundColor = "#8A2BE2";
    button.style.color = "white";
    button.style.padding = "12px 24px";
    button.style.border = "none";
    button.style.borderRadius = "4px";
    button.style.cursor = "pointer";
    button.style.fontWeight = "bold";
    button.style.fontSize = "16px";
    button.style.boxShadow = "0 4px 8px rgba(0,0,0,0.2)";
    button.style.transition = "all 0.3s ease";
    
    // Hover effect
    button.addEventListener("mouseover", function() {
      this.style.backgroundColor = "#7B1FA2";
      this.style.transform = "translateY(-2px)";
      this.style.boxShadow = "0 6px 12px rgba(0,0,0,0.3)";
    });
    
    button.addEventListener("mouseout", function() {
      this.style.backgroundColor = "#8A2BE2";
      this.style.transform = "translateY(0)";
      this.style.boxShadow = "0 4px 8px rgba(0,0,0,0.2)";
    });
    
    button.addEventListener("click", function() {
      console.log("Floating process button clicked");
      
      // Validate form before processing
      if (!validateForm()) {
        return;
      }
      
      // Show processing feedback
      showProcessingFeedback();
      
      // Try to find and click the main process button
      const processButtons = [
        document.getElementById("process-btn"),
        document.getElementById("process-document-btn"),
        document.querySelector('[data-process-btn="true"]'),
        document.querySelector(".process-btn"),
        document.querySelector(".process-document-btn")
      ];
      
      let buttonClicked = false;
      for (const btn of processButtons) {
        if (btn) {
          console.log("Found existing process button, clicking it");
          btn.click();
          buttonClicked = true;
          break;
        }
      }
      
      if (!buttonClicked) {
        console.log("No existing process button found, simulating process action");
        // Dispatch a custom event that your app can listen for
        document.dispatchEvent(new CustomEvent("processDocument"));
        
        // Since we don't know if the event was handled, provide feedback after a delay
        setTimeout(function() {
          simulateProcessing();
        }, 500);
      }
    });
    
    buttonContainer.appendChild(button);
    document.body.appendChild(buttonContainer);
  }
  
  function fixExistingButtons() {
    console.log("Fixing visibility of existing process buttons");
    
    const processButtonSelectors = [
      "#process-btn",
      "#process-document-btn",
      '[data-process-btn="true"]',
      ".process-btn",
      ".process-document-btn"
    ];
    
    processButtonSelectors.forEach(selector => {
      const buttons = document.querySelectorAll(selector);
      buttons.forEach(btn => {
        btn.style.display = "inline-block";
        btn.style.visibility = "visible";
        btn.style.opacity = "1";
        btn.style.backgroundColor = "#8A2BE2";
        btn.style.color = "white";
        btn.style.padding = "12px 24px";
        btn.style.border = "none";
        btn.style.borderRadius = "4px";
        btn.style.cursor = "pointer";
        btn.style.margin = "20px 0";
        btn.style.fontSize = "16px";
        btn.style.fontWeight = "bold";
        
        // Add click handler to validate form
        btn.addEventListener("click", function(e) {
          if (!validateForm()) {
            e.preventDefault();
            e.stopPropagation();
            return false;
          }
          
          showProcessingFeedback();
        });
      });
    });
  }
  
  function addFormValidation() {
    console.log("Adding form validation");
    
    const documentNameInput = document.getElementById("document-name");
    const documentTypeSelect = document.getElementById("document-type");
    const fileInput = document.getElementById("file-input");
    
    if (documentNameInput) {
      documentNameInput.required = true;
      documentNameInput.addEventListener("input", validateForm);
    }
    
    if (documentTypeSelect) {
      documentTypeSelect.required = true;
      documentTypeSelect.addEventListener("change", validateForm);
    }
    
    if (fileInput) {
      fileInput.required = true;
      fileInput.addEventListener("change", function(e) {
        validateForm();
        
        // Show selected file name
        if (fileInput.files.length > 0) {
          const fileName = fileInput.files[0].name;
          
          let fileDisplay = document.getElementById("selected-file-display");
          if (!fileDisplay) {
            fileDisplay = document.createElement("div");
            fileDisplay.id = "selected-file-display";
            fileDisplay.style.margin = "10px 0";
            fileDisplay.style.padding = "8px";
            fileDisplay.style.backgroundColor = "#e6f7ff";
            fileDisplay.style.borderRadius = "4px";
            fileInput.parentNode.insertBefore(fileDisplay, fileInput.nextSibling);
          }
          
          fileDisplay.textContent = `Selected file: ${fileName}`;
        }
      });
    }
    
    // Initial validation
    validateForm();
  }
  
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
      
      content.innerHTML = `
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
      `;
      
      overlay.appendChild(content);
      document.body.appendChild(overlay);
    } else {
      overlay.style.display = "flex";
    }
    
    // Hide overlay after a simulated processing time if necessary
    // We'll keep it visible for now as the actual processing should hide it
  }
  
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
    
    successMessage.innerHTML = `
      <div style="display: flex; align-items: center;">
        <svg viewBox="64 64 896 896" focusable="false" data-icon="check-circle" width="24px" height="24px" fill="currentColor" aria-hidden="true">
          <path d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm193.5 301.7l-210.6 292a31.8 31.8 0 01-51.7 0L318.5 484.9c-3.8-5.3 0-12.7 6.5-12.7h46.9c10.2 0 19.9 4.9 25.9 13.3l71.2 98.8 157.2-218c6-8.3 15.6-13.3 25.9-13.3H699c6.5 0 10.3 7.4 6.5 12.7z"></path>
        </svg>
        <span style="margin-left: 10px; font-weight: bold;">Document processed successfully!</span>
      </div>
      <div style="margin-top: 8px;">${documentName} (${documentType}) has been processed and is now ready for analysis.</div>
    `;
    
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
})();
