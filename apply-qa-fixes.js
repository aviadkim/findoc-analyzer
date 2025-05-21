/**
 * Apply QA Fixes
 * 
 * This script applies all QA fixes to the FinDoc Analyzer application.
 * It creates the necessary directories and files, and injects the fix script into all HTML pages.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const config = {
  // Directories to create
  directories: [
    'public/js',
    'docs/security'
  ],
  
  // Files to create
  files: [
    {
      path: 'public/js/auth-fix.js',
      source: './public/js/auth-fix.js'
    },
    {
      path: 'public/js/document-processing-fix.js',
      source: './public/js/document-processing-fix.js'
    },
    {
      path: 'public/js/ui-components-fix.js',
      source: './public/js/ui-components-fix.js'
    },
    {
      path: 'public/js/findoc-analyzer-fix.js',
      source: './public/js/findoc-analyzer-fix.js'
    },
    {
      path: 'inject-fix.js',
      source: './inject-fix.js'
    },
    {
      path: 'QA_REPORT.md',
      source: './QA_REPORT.md'
    }
  ],
  
  // Debug mode
  debug: true
};

/**
 * Main function
 */
function main() {
  console.log('Applying QA fixes to FinDoc Analyzer...');
  
  try {
    // Create directories
    createDirectories();
    
    // Create files
    createFiles();
    
    // Inject fix script
    injectFixScript();
    
    console.log('QA fixes applied successfully!');
    console.log('Please restart your server to apply the changes.');
  } catch (error) {
    console.error('Error applying QA fixes:', error);
    process.exit(1);
  }
}

/**
 * Create directories
 */
function createDirectories() {
  console.log('Creating directories...');
  
  config.directories.forEach(dir => {
    const dirPath = path.resolve(dir);
    
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
      console.log(`Created directory: ${dirPath}`);
    } else {
      console.log(`Directory already exists: ${dirPath}`);
    }
  });
}

/**
 * Create files
 */
function createFiles() {
  console.log('Creating files...');
  
  config.files.forEach(file => {
    const filePath = path.resolve(file.path);
    const sourcePath = path.resolve(file.source);
    
    try {
      // Check if source file exists
      if (!fs.existsSync(sourcePath)) {
        throw new Error(`Source file does not exist: ${sourcePath}`);
      }
      
      // Read source file
      const content = fs.readFileSync(sourcePath, 'utf8');
      
      // Write file
      fs.writeFileSync(filePath, content);
      
      console.log(`Created file: ${filePath}`);
    } catch (error) {
      console.error(`Error creating file ${filePath}:`, error);
      throw error;
    }
  });
}

/**
 * Inject fix script
 */
function injectFixScript() {
  console.log('Injecting fix script...');
  
  try {
    // Run inject-fix.js
    execSync('node inject-fix.js', { stdio: 'inherit' });
  } catch (error) {
    console.error('Error injecting fix script:', error);
    throw error;
  }
}

// Run main function
main();
