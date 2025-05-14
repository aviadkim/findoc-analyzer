/**
 * Simple script to check if the messos.pdf file exists and can be processed
 */

const fs = require('fs');
const path = require('path');

// Check in different possible locations
const possibleLocations = [
  path.join(__dirname, 'test-pdfs', 'messos.pdf'),
  path.join(__dirname, 'messos.pdf'),
  path.join(__dirname, 'uploads', 'messos.pdf'),
  path.join(__dirname, '..', 'messos.pdf')
];

console.log('Checking for messos.pdf file...');

let fileFound = false;

for (const location of possibleLocations) {
  if (fs.existsSync(location)) {
    console.log(`Found messos.pdf at: ${location}`);
    
    // Get file stats
    const stats = fs.statSync(location);
    console.log(`File size: ${stats.size} bytes`);
    console.log(`Last modified: ${stats.mtime}`);
    
    fileFound = true;
    break;
  }
}

if (!fileFound) {
  console.log('messos.pdf file not found in any of the checked locations:');
  possibleLocations.forEach(location => console.log(`- ${location}`));
  
  // Check if test-pdfs directory exists
  const testPdfsDir = path.join(__dirname, 'test-pdfs');
  if (!fs.existsSync(testPdfsDir)) {
    console.log('Creating test-pdfs directory...');
    fs.mkdirSync(testPdfsDir, { recursive: true });
    console.log(`Created directory: ${testPdfsDir}`);
  } else {
    console.log(`test-pdfs directory exists at: ${testPdfsDir}`);
    
    // List files in the directory
    const files = fs.readdirSync(testPdfsDir);
    console.log('Files in test-pdfs directory:');
    files.forEach(file => console.log(`- ${file}`));
  }
}

// List all PDF files in the current directory
console.log('\nListing all PDF files in the current directory:');
const currentDirFiles = fs.readdirSync(__dirname);
const pdfFiles = currentDirFiles.filter(file => file.toLowerCase().endsWith('.pdf'));

if (pdfFiles.length > 0) {
  console.log('PDF files found:');
  pdfFiles.forEach(file => console.log(`- ${file}`));
} else {
  console.log('No PDF files found in the current directory.');
}

console.log('\nCheck completed.');
