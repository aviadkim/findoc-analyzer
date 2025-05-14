/**
 * Special fix for chat button on all pages
 * This script specifically targets the remaining pages that don't properly display the chat button
 */

const fs = require('fs');
const path = require('path');

// List of pages that need special attention
const targetPages = [
  { path: '/mnt/c/Users/aviad/OneDrive/Desktop/backv2-main/public/index.html', name: 'Home page' },
  { path: '/mnt/c/Users/aviad/OneDrive/Desktop/backv2-main/public/document-details.html', name: 'Document Details page' },
  { path: '/mnt/c/Users/aviad/OneDrive/Desktop/backv2-main/public/documents-new.html', name: 'Documents page' },
  { path: '/mnt/c/Users/aviad/OneDrive/Desktop/backv2-main/public/test.html', name: 'Test page' }
];

// Process each target page
targetPages.forEach(page => {
  console.log(`Processing ${page.name}: ${page.path}`);
  
  // Check if file exists
  if (!fs.existsSync(page.path)) {
    console.error(`  Error: File not found`);
    return;
  }
  
  // Read file content
  let content = fs.readFileSync(page.path, 'utf8');
  
  // Add direct chat button creation in body
  const bodyCloseIndex = content.indexOf('</body>');
  
  if (bodyCloseIndex === -1) {
    console.log('  Error: No </body> tag found');
    return;
  }
  
  // Create a direct chat button script
  const chatButtonScript = `
  <!-- Direct Chat Button Creation -->
  <script>
    (function() {
      // Create chat button if it doesn't exist
      if (!document.getElementById('show-chat-btn')) {
        console.log('Creating chat button directly on ${page.name}');
        
        // Create chat button
        const chatButton = document.createElement('button');
        chatButton.id = 'show-chat-btn';
        chatButton.className = 'btn btn-primary';
        chatButton.textContent = 'Chat';
        chatButton.style.position = 'fixed';
        chatButton.style.bottom = '20px';
        chatButton.style.right = '20px';
        chatButton.style.zIndex = '1000';
        chatButton.style.backgroundColor = '#007bff';
        chatButton.style.color = 'white';
        chatButton.style.border = 'none';
        chatButton.style.padding = '10px 20px';
        chatButton.style.borderRadius = '5px';
        chatButton.style.cursor = 'pointer';
        
        // Add click event
        chatButton.addEventListener('click', function() {
          // Get chat container
          let chatContainer = document.getElementById('document-chat-container');
          
          if (!chatContainer) {
            // Create basic chat container if it doesn't exist
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
            chatContainer.style.padding = '20px';
            chatContainer.style.zIndex = '1000';
            chatContainer.style.display = 'none';
            chatContainer.innerHTML = '<h3>Document Chat</h3><p>Chat functionality is available. Please ask questions about the current document.</p>';
            document.body.appendChild(chatContainer);
          }
          
          // Toggle chat container visibility
          chatContainer.style.display = chatContainer.style.display === 'none' ? 'block' : 'none';
        });
        
        // Add button to document
        document.body.appendChild(chatButton);
      }
    })();
  </script>
`;

  // Insert the script just before the closing body tag
  content = content.slice(0, bodyCloseIndex) + chatButtonScript + content.slice(bodyCloseIndex);
  
  // Write back to file
  fs.writeFileSync(page.path, content, 'utf8');
  console.log(`  Fixed chat button on ${page.name}`);
});

console.log('Completed chat button fixes');