/**
 * Inject UI Fixes
 * This script injects the UI fixes into all HTML files
 */

const fs = require('fs');
const path = require('path');

// Directory to search for HTML files
const publicDir = path.join(__dirname, 'public');

// Find all HTML files
function findHtmlFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      findHtmlFiles(filePath, fileList);
    } else if (path.extname(file) === '.html') {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

// Inject UI fixes into HTML file
function injectUiFixes(filePath) {
  console.log(`Injecting UI fixes into ${filePath}...`);
  
  let html = fs.readFileSync(filePath, 'utf8');
  
  // Check if UI fixes are already injected
  if (html.includes('ui-fixes.css') || html.includes('ui-fixes.js')) {
    console.log(`UI fixes already injected into ${filePath}`);
    return;
  }
  
  // Inject CSS
  const cssLink = '<link rel="stylesheet" href="/css/ui-fixes.css">';
  html = html.replace('</head>', `  ${cssLink}\n</head>`);
  
  // Inject JS
  const jsScript = '<script src="/js/ui-fixes.js"></script>';
  html = html.replace('</body>', `  ${jsScript}\n</body>`);
  
  // Write the updated HTML
  fs.writeFileSync(filePath, html);
  
  console.log(`UI fixes injected into ${filePath}`);
}

// Main function
function main() {
  console.log('Injecting UI fixes into HTML files...');
  
  // Find all HTML files
  const htmlFiles = findHtmlFiles(publicDir);
  
  // Inject UI fixes into each HTML file
  htmlFiles.forEach(injectUiFixes);
  
  console.log(`UI fixes injected into ${htmlFiles.length} HTML files`);
}

// Run the main function
main();
