/**
 * Inject Fix Script
 * 
 * This script injects the FinDoc Analyzer Fix script into all HTML pages.
 * It should be run after the server is started to modify the HTML files.
 */

const fs = require('fs');
const path = require('path');

// Configuration
const config = {
  // Directory containing HTML files
  htmlDir: path.join(__dirname, 'public'),
  
  // Fix script path
  fixScript: '/js/findoc-analyzer-fix.js',
  
  // Debug mode
  debug: true
};

/**
 * Main function
 */
function main() {
  console.log('Injecting FinDoc Analyzer Fix script into HTML files...');
  
  // Find all HTML files
  const htmlFiles = findHtmlFiles(config.htmlDir);
  
  console.log(`Found ${htmlFiles.length} HTML files`);
  
  // Inject fix script into each HTML file
  let injectedCount = 0;
  
  htmlFiles.forEach(file => {
    const injected = injectFixScript(file);
    
    if (injected) {
      injectedCount++;
    }
  });
  
  console.log(`Injected fix script into ${injectedCount} HTML files`);
}

/**
 * Find all HTML files in a directory
 * @param {string} dir - Directory to search
 * @returns {string[]} Array of HTML file paths
 */
function findHtmlFiles(dir) {
  const files = [];
  
  // Read directory
  const items = fs.readdirSync(dir);
  
  // Process each item
  items.forEach(item => {
    const itemPath = path.join(dir, item);
    const stats = fs.statSync(itemPath);
    
    if (stats.isDirectory()) {
      // Recursively search subdirectories
      const subFiles = findHtmlFiles(itemPath);
      files.push(...subFiles);
    } else if (stats.isFile() && item.endsWith('.html')) {
      // Add HTML file to list
      files.push(itemPath);
    }
  });
  
  return files;
}

/**
 * Inject fix script into an HTML file
 * @param {string} file - HTML file path
 * @returns {boolean} Whether the script was injected
 */
function injectFixScript(file) {
  try {
    // Read file
    let html = fs.readFileSync(file, 'utf8');
    
    // Check if fix script is already injected
    if (html.includes(config.fixScript)) {
      if (config.debug) {
        console.log(`Fix script already injected in ${file}`);
      }
      return false;
    }
    
    // Create script tag
    const scriptTag = `<script src="${config.fixScript}"></script>`;
    
    // Inject script tag before closing body tag
    if (html.includes('</body>')) {
      html = html.replace('</body>', `${scriptTag}\n</body>`);
    } else if (html.includes('</html>')) {
      html = html.replace('</html>', `${scriptTag}\n</html>`);
    } else {
      html += `\n${scriptTag}`;
    }
    
    // Write file
    fs.writeFileSync(file, html);
    
    console.log(`Injected fix script into ${file}`);
    return true;
  } catch (error) {
    console.error(`Error injecting fix script into ${file}:`, error);
    return false;
  }
}

// Run main function
main();
