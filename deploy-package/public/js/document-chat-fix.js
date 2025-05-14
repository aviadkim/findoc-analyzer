console.log('Document chat fix loaded');

(function() {
  // Run when DOM is ready
  document.addEventListener('DOMContentLoaded', function() {
    console.log('Initializing document chat fix');
    
    // Check if we're on the document chat page
    if (window.location.pathname.includes('document-chat')) {
      console.log('On document chat page, applying chat fixes');
      
      // Find chat container
      const chatContainer = document.getElementById('document-chat-container');
      if (chatContainer) {
        // Make it visible
        chatContainer.style.display = 'block';
        
        // Create document selector if it doesn't exist
        if (\!document.getElementById('document-select')) {
          const selector = document.createElement('select');
          selector.id = 'document-select';
          selector.style.width = '100%';
          selector.style.maxWidth = '300px';
          selector.style.padding = '8px';
          selector.style.margin = '15px 0';
          selector.style.borderRadius = '4px';
          selector.style.border = '1px solid #ddd';
          
          // Add options
          const options = [
            { value: '', text: 'Select a document' },
            { value: 'doc-1', text: 'Financial Report 2023' },
            { value: 'doc-2', text: 'Investment Portfolio' },
            { value: 'doc-3', text: 'Tax Documents 2023' }
          ];
          
          options.forEach(option => {
            const opt = document.createElement('option');
            opt.value = option.value;
            opt.textContent = option.text;
            selector.appendChild(opt);
          });
          
          // Add change event
          selector.addEventListener('change', function() {
            if (this.value) {
              // Enable question input and send button
              const input = document.getElementById('question-input');
              const sendBtn = document.getElementById('send-btn');
              const docSendBtn = document.getElementById('document-send-btn');
              
              if (input) input.disabled = false;
              if (sendBtn) sendBtn.disabled = false;
              if (docSendBtn) {
                docSendBtn.disabled = false;
                docSendBtn.style.display = 'block';
              }
            }
          });
          
          // Add before chat container
          const parent = chatContainer.parentNode;
          if (parent) {
            parent.insertBefore(selector, chatContainer);
          }
        }
      }
    }
  });
})();
