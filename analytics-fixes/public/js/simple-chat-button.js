// Simple Chat Button Component
console.log('Simple Chat Button initializing...');

// Add chat button to page
function addChatButton() {
  // Check if chat button already exists
  if (document.getElementById('show-chat-btn')) {
    console.log('Chat button already exists');
    return;
  }
  
  console.log('Adding chat button...');
  
  // Create chat button
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
    alert('Chat button clicked!');
  });
  
  document.body.appendChild(chatButton);
  console.log('Chat button added successfully!');
}

// Add chat button when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM loaded, adding chat button...');
  addChatButton();
});
