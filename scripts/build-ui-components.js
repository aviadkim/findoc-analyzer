/**
 * Build UI Components
 * Bundles UI components into a single file
 */

const fs = require('fs');
const path = require('path');
const browserify = require('browserify');

// Define paths
const componentsDir = path.join(__dirname, '..', 'public', 'js', 'ui-components');
const outputFile = path.join(__dirname, '..', 'public', 'js', 'ui-components-bundle.js');

// Create output directory if it doesn't exist
const outputDir = path.dirname(outputFile);
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Bundle UI components
console.log('Bundling UI components...');

// Create browserify instance
const b = browserify({
  entries: [path.join(componentsDir, 'index.js')],
  standalone: 'UIComponents'
});

// Bundle components
b.bundle((err, buf) => {
  if (err) {
    console.error('Error bundling UI components:', err);
    process.exit(1);
  }
  
  // Write bundle to file
  fs.writeFileSync(outputFile, buf);
  
  console.log(`UI components bundled successfully: ${outputFile}`);
});
