/**
 * Script to add chat component to all HTML files in the public directory
 * Version 2.0 - With improved script inclusion and loading
 */

const fs = require('fs');
const path = require('path');

// Directory to search for HTML files
const publicDir = path.join(__dirname, 'public');

// Process all HTML files
function processAllHtmlFiles() {
  console.log('Processing all HTML files in:', publicDir);
  
  // Find all HTML files
  const htmlFiles = findHtmlFiles(publicDir);
  console.log(`Found ${htmlFiles.length} HTML files to process`);
  
  // Add chat component to all HTML files
  let successCount = 0;
  let failCount = 0;
  
  for (const filePath of htmlFiles) {
    try {
      addChatComponent(filePath);
      successCount++;
    } catch (error) {
      console.error(`Error processing ${filePath}:`, error.message);
      failCount++;
    }
  }
  
  console.log('\nSummary:');
  console.log(`Total files processed: ${htmlFiles.length}`);
  console.log(`Successful: ${successCount}`);
  console.log(`Failed: ${failCount}`);
}

// Find all HTML files in directory and subdirectories
function findHtmlFiles(dir) {
  const files = [];
  
  // Read all files and directories in the specified directory
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const itemPath = path.join(dir, item);
    const stats = fs.statSync(itemPath);
    
    if (stats.isDirectory()) {
      // Skip node_modules, .git, and other special directories
      if (item !== 'node_modules' && item !== '.git' && !item.startsWith('.')) {
        // Recursively find HTML files in subdirectories
        const subFiles = findHtmlFiles(itemPath);
        files.push(...subFiles);
      }
    } else if (stats.isFile() && item.endsWith('.html')) {
      // Add HTML files to the list
      files.push(itemPath);
    }
  }
  
  return files;
}

// Add chat component script to HTML file
function addChatComponent(filePath) {
  console.log(`Processing: ${filePath}`);
  
  // Read file content
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Check if chat component is already included
  if (content.includes('ui-chat-component.js')) {
    console.log('  Chat component already added, skipping');
    return;
  }
  
  // Look for closing head tag
  const headCloseIndex = content.indexOf('</head>');
  
  if (headCloseIndex === -1) {
    console.log('  No </head> tag found, skipping');
    return;
  }
  
  // Create the script tag with deferred loading for better performance
  const scriptTag = `  <!-- Chat Interface Component -->
  <script src="/js/ui-chat-component.js"></script>
  <script>
    // Ensure chat components are initialized when the page loads
    document.addEventListener('DOMContentLoaded', function() {
      if (typeof initChatInterface === 'function') {
        initChatInterface();
      } else if (window.ChatComponent && typeof window.ChatComponent.initialize === 'function') {
        window.ChatComponent.initialize();
      }
    });
  </script>
`;
  
  // Insert before closing head tag
  content = content.slice(0, headCloseIndex) + scriptTag + content.slice(headCloseIndex);
  
  // Look for closing body tag
  const bodyCloseIndex = content.indexOf('</body>');
  
  if (bodyCloseIndex !== -1) {
    // Add fallback script at the end of body
    const fallbackScript = `  <!-- Chat Interface Component Fallback -->
  <script>
    // Ensure the chat button appears even if it wasn't created earlier
    (function() {
      setTimeout(function() {
        if (!document.getElementById('show-chat-btn') && typeof initChatInterface === 'function') {
          console.log('Chat button not found, initializing via fallback');
          initChatInterface();
        }
      }, 1000);
    })();
  </script>
`;
    
    // Insert before closing body tag
    content = content.slice(0, bodyCloseIndex) + fallbackScript + content.slice(bodyCloseIndex);
  }
  
  // Write updated content back to file
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('  Chat component added successfully');
}

// Run the script
processAllHtmlFiles();