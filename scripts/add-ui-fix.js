/**
 * Add UI Fix Script to HTML Pages
 * This script adds the UI fix script to all HTML pages in the public directory
 */

const fs = require('fs');
const path = require('path');

// Configuration
const config = {
  publicDir: path.join(__dirname, '../public'),
  uiFixScript: '<script src="/js/ui-fix.js"></script>',
  backupDir: path.join(__dirname, '../backups')
};

// Create backup directory if it doesn't exist
if (!fs.existsSync(config.backupDir)) {
  fs.mkdirSync(config.backupDir, { recursive: true });
}

// Get all HTML files in the public directory
function getHtmlFiles(dir) {
  const files = [];
  
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const itemPath = path.join(dir, item);
    const stats = fs.statSync(itemPath);
    
    if (stats.isDirectory()) {
      // Recursively get HTML files from subdirectories
      files.push(...getHtmlFiles(itemPath));
    } else if (item.endsWith('.html')) {
      // Add HTML file to the list
      files.push(itemPath);
    }
  }
  
  return files;
}

// Backup a file
function backupFile(filePath) {
  const fileName = path.basename(filePath);
  const backupPath = path.join(config.backupDir, `${fileName}.${Date.now()}.bak`);
  
  fs.copyFileSync(filePath, backupPath);
  console.log(`Backed up ${filePath} to ${backupPath}`);
  
  return backupPath;
}

// Add UI fix script to an HTML file
function addUiFixScript(filePath) {
  console.log(`Processing ${filePath}...`);
  
  // Read the file
  let html = fs.readFileSync(filePath, 'utf8');
  
  // Check if the UI fix script is already included
  if (html.includes(config.uiFixScript)) {
    console.log(`UI fix script already included in ${filePath}`);
    return false;
  }
  
  // Backup the file
  backupFile(filePath);
  
  // Add the UI fix script before the closing body tag
  const bodyCloseIndex = html.lastIndexOf('</body>');
  
  if (bodyCloseIndex !== -1) {
    html = html.slice(0, bodyCloseIndex) + '\n  ' + config.uiFixScript + '\n' + html.slice(bodyCloseIndex);
    
    // Write the updated file
    fs.writeFileSync(filePath, html);
    console.log(`Added UI fix script to ${filePath}`);
    
    return true;
  } else {
    console.error(`Could not find closing body tag in ${filePath}`);
    return false;
  }
}

// Main function
function main() {
  console.log('Adding UI fix script to HTML pages...');
  
  // Get all HTML files
  const htmlFiles = getHtmlFiles(config.publicDir);
  console.log(`Found ${htmlFiles.length} HTML files`);
  
  // Add UI fix script to each file
  let addedCount = 0;
  let skippedCount = 0;
  let errorCount = 0;
  
  for (const file of htmlFiles) {
    try {
      const added = addUiFixScript(file);
      
      if (added) {
        addedCount++;
      } else {
        skippedCount++;
      }
    } catch (error) {
      console.error(`Error processing ${file}: ${error.message}`);
      errorCount++;
    }
  }
  
  // Print summary
  console.log('\nSummary:');
  console.log(`- Added UI fix script to ${addedCount} files`);
  console.log(`- Skipped ${skippedCount} files (script already included)`);
  console.log(`- Errors: ${errorCount}`);
  
  console.log('\nDone!');
}

// Run the main function
main();
