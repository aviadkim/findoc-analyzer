/**
 * Simple PDF Processing Test
 * 
 * This script tests PDF processing using our custom implementations for MCPs
 * and provides basic feedback on the results.
 */

const fs = require('fs');
const path = require('path');
const pdfProcessor = require('./services/pdf-processor');
const mcpDocumentProcessor = require('./services/mcp-document-processor');

// Enable debugging
process.env.DEBUG = 'true';

// Constants
const TEST_PDFS_DIR = path.join(__dirname, 'test-pdfs');
const RESULTS_DIR = path.join(__dirname, 'pdf-test-results');

// Create results directory if it doesn't exist
if (!fs.existsSync(RESULTS_DIR)) {
  fs.mkdirSync(RESULTS_DIR, { recursive: true });
}

// Load environment variables
try {
  require('dotenv').config();
} catch (error) {
  console.warn('Could not load dotenv, continuing without it');
}

/**
 * Main function to test PDF processing
 */
async function testPdfProcessing() {
  console.log('Starting simple PDF processing test...');
  
  try {
    // Find PDF files
    const pdfFiles = findPdfFiles();
    
    if (pdfFiles.length === 0) {
      console.error('No PDF files found in the test-pdfs directory');
      return;
    }
    
    console.log(`Found ${pdfFiles.length} PDF files: ${pdfFiles.map(f => path.basename(f)).join(', ')}`);
    
    // Process each PDF
    for (const pdfFile of pdfFiles) {
      await processPdf(pdfFile);
    }
    
    console.log('All PDFs processed successfully!');
    console.log(`Results saved to ${RESULTS_DIR}`);
  } catch (error) {
    console.error(`Error in test: ${error.message}`);
  }
}

/**
 * Find PDF files in the test directory
 * @returns {Array<string>} - Array of PDF file paths
 */
function findPdfFiles() {
  try {
    // Check if directory exists
    if (!fs.existsSync(TEST_PDFS_DIR)) {
      console.warn(`Test PDF directory not found: ${TEST_PDFS_DIR}`);
      return [];
    }
    
    // List all files in directory
    const files = fs.readdirSync(TEST_PDFS_DIR);
    
    // Filter for PDF files
    return files
      .filter(file => file.toLowerCase().endsWith('.pdf'))
      .map(file => path.join(TEST_PDFS_DIR, file));
  } catch (error) {
    console.error(`Error finding PDF files: ${error.message}`);
    return [];
  }
}

/**
 * Process a single PDF file
 * @param {string} pdfPath - Path to the PDF file
 */
async function processPdf(pdfPath) {
  const filename = path.basename(pdfPath);
  console.log(`\nProcessing ${filename}...`);
  
  try {
    // Process with standard processor
    console.log('Using standard processor...');
    const standardResult = await pdfProcessor.processPdf(pdfPath);
    
    console.log(`Extracted ${standardResult.text ? standardResult.text.length : 0} characters of text`);
    console.log(`Extracted ${standardResult.tables ? standardResult.tables.length : 0} tables`);
    
    // Process with MCP processor
    console.log('Using MCP processor...');
    const mcpResult = await mcpDocumentProcessor.processDocument(pdfPath);
    
    console.log(`Extracted ${mcpResult.entities ? mcpResult.entities.length : 0} entities`);
    
    // Count entity types
    const entityTypes = {};
    if (mcpResult.entities) {
      mcpResult.entities.forEach(entity => {
        const type = entity.type || 'unknown';
        entityTypes[type] = (entityTypes[type] || 0) + 1;
      });
      
      console.log('Entity types:');
      Object.entries(entityTypes).forEach(([type, count]) => {
        console.log(`  - ${type}: ${count}`);
      });
    }
    
    // Save results
    const outputPath = path.join(RESULTS_DIR, `${filename.replace('.pdf', '')}-simple-results.json`);
    
    const results = {
      filename,
      timestamp: new Date().toISOString(),
      textLength: standardResult.text ? standardResult.text.length : 0,
      tableCount: standardResult.tables ? standardResult.tables.length : 0,
      entityCount: mcpResult.entities ? mcpResult.entities.length : 0,
      entityTypes,
      metadata: standardResult.metadata || {},
      sampleText: standardResult.text 
        ? standardResult.text.substring(0, Math.min(500, standardResult.text.length)) + '...'
        : '',
      sampleEntities: mcpResult.entities
        ? mcpResult.entities.slice(0, Math.min(5, mcpResult.entities.length))
        : []
    };
    
    fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
    console.log(`Results saved to ${outputPath}`);
    
    return results;
  } catch (error) {
    console.error(`Error processing ${filename}: ${error.message}`);
    throw error;
  }
}

// Run the test
testPdfProcessing().catch(console.error);