/**
 * Document Processor Test
 * 
 * This script tests the document processor with a sample PDF file.
 */

const fs = require('fs');
const path = require('path');
const documentProcessor = require('./services/document-processor');

// Test PDF path
const testPdfPath = path.join(__dirname, 'test-documents', 'sample-financial-report.pdf');

// Ensure test file exists
if (!fs.existsSync(testPdfPath)) {
  console.error(`Test file not found: ${testPdfPath}`);
  process.exit(1);
}

// Log test start
console.log('Starting document processor test...');
console.log(`Using test file: ${testPdfPath}`);

// Test document processing
async function testDocumentProcessing() {
  try {
    console.log('Processing document...');
    
    // Process the document
    const result = await documentProcessor.processDocument(testPdfPath, {
      extractISINs: true,
      extractTables: true
    });
    
    // Log results summary
    console.log('\nProcessing Results Summary:');
    console.log('---------------------------');
    console.log(`Document Type: ${result.type}`);
    
    if (result.type === 'pdf') {
      console.log(`Page Count: ${result.pageCount}`);
    }
    
    console.log(`Text Length: ${result.text.length} characters`);
    console.log(`Tables Found: ${result.tables.length}`);
    
    if (result.isins) {
      console.log(`ISINs Found: ${result.isins.length}`);
    }
    
    if (result.financialData) {
      console.log(`Financial Data Items: ${Array.isArray(result.financialData) ? result.financialData.length : 'Object with properties'}`);
    }
    
    // Log file metadata
    if (result.file) {
      console.log('\nFile Metadata:');
      console.log(`Name: ${result.file.name}`);
      console.log(`Size: ${result.file.size} bytes`);
      console.log(`Created: ${result.file.created}`);
      console.log(`Modified: ${result.file.modified}`);
    }
    
    // Log document summary
    if (result.summary) {
      console.log(`\nDocument Summary: ${result.summary}`);
    }
    
    console.log('\nTest completed successfully');
    return result;
  } catch (error) {
    console.error('\nTest failed with error:', error);
    throw error;
  }
}

// Run the test
testDocumentProcessing()
  .then(result => {
    // Save a portion of the results to a file for verification
    const resultSummary = {
      type: result.type,
      pageCount: result.pageCount,
      textLength: result.text.length,
      tableCount: result.tables.length,
      isinsCount: result.isins ? result.isins.length : 0,
      summary: result.summary,
      file: result.file
    };
    
    fs.writeFileSync(
      path.join(__dirname, 'test-results', 'document-processor-test-result.json'),
      JSON.stringify(resultSummary, null, 2)
    );
    
    console.log('Results saved to test-results/document-processor-test-result.json');
  })
  .catch(error => {
    console.error('Test execution failed:', error);
    process.exit(1);
  });
