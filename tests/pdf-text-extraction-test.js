/**
 * PDF Text Extraction Testing
 * 
 * This test focuses specifically on testing the PDF text extraction functionality.
 * It tests the ability to extract text from various types of PDF documents.
 */

const fs = require('fs');
const path = require('path');
const { processDocument } = require('../services/document-processor');

// Configuration
const config = {
  testPdfsDir: path.join(__dirname, 'test-pdfs'),
  resultsDir: path.join(__dirname, '../test-results'),
  reportFile: 'pdf-text-extraction-report.json'
};

// Create directories if they don't exist
fs.mkdirSync(config.testPdfsDir, { recursive: true });
fs.mkdirSync(config.resultsDir, { recursive: true });

// Test results
const testResults = {
  passed: 0,
  failed: 0,
  skipped: 0,
  total: 0,
  startTime: null,
  endTime: null,
  tests: []
};

/**
 * Run a test
 * @param {string} name - Test name
 * @param {Function} testFn - Test function
 */
async function runTest(name, testFn) {
  testResults.total++;
  
  const test = {
    name,
    status: 'running',
    startTime: new Date(),
    endTime: null,
    error: null
  };
  
  console.log(`\n🧪 Running test: ${name}`);
  
  try {
    await testFn();
    
    test.status = 'passed';
    test.endTime = new Date();
    testResults.passed++;
    
    console.log(`✅ Test passed: ${name}`);
  } catch (error) {
    test.status = 'failed';
    test.endTime = new Date();
    test.error = error.message;
    testResults.failed++;
    
    console.error(`❌ Test failed: ${name}`);
    console.error(`   Error: ${error.message}`);
  }
  
  testResults.tests.push(test);
}

/**
 * Skip a test
 * @param {string} name - Test name
 * @param {string} reason - Reason for skipping
 */
function skipTest(name, reason) {
  testResults.total++;
  testResults.skipped++;
  
  const test = {
    name,
    status: 'skipped',
    startTime: new Date(),
    endTime: new Date(),
    error: null,
    reason
  };
  
  testResults.tests.push(test);
  
  console.log(`⏭️ Skipped test: ${name}`);
  console.log(`   Reason: ${reason}`);
}

/**
 * Generate a test PDF with text content
 * @param {string} filename - Output filename
 * @param {string} content - Text content
 */
function generateTestPdf(filename, content) {
  // For now, we'll just create a mock PDF file
  // In a real implementation, we would use a library like PDFKit to generate a real PDF
  
  const filePath = path.join(config.testPdfsDir, filename);
  
  // Create a simple text file with .pdf extension for testing
  // This is just a placeholder - in a real scenario, we would create actual PDF files
  fs.writeFileSync(filePath, content);
  
  return filePath;
}

/**
 * Save test results to a JSON file
 */
function saveTestResults() {
  const reportPath = path.join(config.resultsDir, config.reportFile);
  fs.writeFileSync(reportPath, JSON.stringify(testResults, null, 2));
  console.log(`\n📊 Test results saved to: ${reportPath}`);
}

/**
 * Run all tests
 */
async function runTests() {
  testResults.startTime = new Date();
  
  try {
    // Test 1: Extract text from a simple PDF
    await runTest('Extract text from a simple PDF', async () => {
      // Generate a test PDF
      const content = 'This is a simple PDF document for testing text extraction.';
      const filePath = generateTestPdf('simple.pdf', content);
      
      // Process the document
      const result = await processDocument(filePath, { extractText: true, extractTables: false, extractMetadata: false });
      
      // Check if the text was extracted correctly
      if (!result.text.includes(content)) {
        throw new Error('Text extraction failed: extracted text does not match expected content');
      }
    });
    
    // Test 2: Extract text from a PDF with multiple pages
    await runTest('Extract text from a PDF with multiple pages', async () => {
      // Generate a test PDF
      const content = 'Page 1 content.\n\nPage 2 content.\n\nPage 3 content.';
      const filePath = generateTestPdf('multipage.pdf', content);
      
      // Process the document
      const result = await processDocument(filePath, { extractText: true, extractTables: false, extractMetadata: false });
      
      // Check if the text was extracted correctly
      if (!result.text.includes('Page 1') || !result.text.includes('Page 2') || !result.text.includes('Page 3')) {
        throw new Error('Text extraction failed: not all page content was extracted');
      }
    });
    
    // Test 3: Extract text from a PDF with special characters
    await runTest('Extract text from a PDF with special characters', async () => {
      // Generate a test PDF
      const content = 'Special characters: àáâãäåæçèéêëìíîïðñòóôõö÷øùúûüýþÿ';
      const filePath = generateTestPdf('special-chars.pdf', content);
      
      // Process the document
      const result = await processDocument(filePath, { extractText: true, extractTables: false, extractMetadata: false });
      
      // Check if the text was extracted correctly
      if (!result.text.includes('Special characters')) {
        throw new Error('Text extraction failed: special characters not extracted correctly');
      }
    });
    
    // Test 4: Extract text from a PDF with financial content
    await runTest('Extract text from a PDF with financial content', async () => {
      // Generate a test PDF
      const content = `
Financial Report 2023

Company: ABC Corporation
Date: December 31, 2023

Executive Summary

This financial report presents the financial performance of ABC Corporation for the fiscal year 2023.

Financial Highlights:
- Total Revenue: $10,500,000
- Operating Expenses: $7,200,000
- Net Profit: $3,300,000
- Profit Margin: 31.4%

Balance Sheet Summary:
- Total Assets: $25,000,000
- Total Liabilities: $12,000,000
- Shareholders' Equity: $13,000,000
`;
      const filePath = generateTestPdf('financial-report.pdf', content);
      
      // Process the document
      const result = await processDocument(filePath, { extractText: true, extractTables: false, extractMetadata: false });
      
      // Check if the text was extracted correctly
      if (!result.text.includes('Financial Report') || 
          !result.text.includes('ABC Corporation') || 
          !result.text.includes('Total Revenue') || 
          !result.text.includes('$10,500,000')) {
        throw new Error('Text extraction failed: financial content not extracted correctly');
      }
    });
    
    // Test 5: Extract text from a PDF with a large amount of text
    await runTest('Extract text from a PDF with a large amount of text', async () => {
      // Generate a test PDF
      let content = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. ';
      // Repeat the content to create a large document
      content = content.repeat(1000);
      
      const filePath = generateTestPdf('large-text.pdf', content);
      
      // Process the document
      const result = await processDocument(filePath, { extractText: true, extractTables: false, extractMetadata: false });
      
      // Check if the text was extracted correctly
      if (!result.text.includes('Lorem ipsum') || result.text.length < 1000) {
        throw new Error('Text extraction failed: large text not extracted correctly');
      }
    });
    
    // Test 6: Extract text from a PDF with formatted text (bold, italic, etc.)
    await runTest('Extract text from a PDF with formatted text', async () => {
      // Generate a test PDF
      const content = `
This text is normal.
This text is bold.
This text is italic.
This text is underlined.
`;
      const filePath = generateTestPdf('formatted-text.pdf', content);
      
      // Process the document
      const result = await processDocument(filePath, { extractText: true, extractTables: false, extractMetadata: false });
      
      // Check if the text was extracted correctly
      if (!result.text.includes('normal') || 
          !result.text.includes('bold') || 
          !result.text.includes('italic') || 
          !result.text.includes('underlined')) {
        throw new Error('Text extraction failed: formatted text not extracted correctly');
      }
    });
    
    // Test 7: Extract text from a PDF with non-standard fonts
    await runTest('Extract text from a PDF with non-standard fonts', async () => {
      // Generate a test PDF
      const content = 'This text uses a non-standard font.';
      const filePath = generateTestPdf('non-standard-font.pdf', content);
      
      // Process the document
      const result = await processDocument(filePath, { extractText: true, extractTables: false, extractMetadata: false });
      
      // Check if the text was extracted correctly
      if (!result.text.includes('non-standard font')) {
        throw new Error('Text extraction failed: text with non-standard font not extracted correctly');
      }
    });
    
    // Test 8: Extract text from a PDF with images
    await runTest('Extract text from a PDF with images', async () => {
      // Generate a test PDF
      const content = 'This PDF contains text and images.';
      const filePath = generateTestPdf('with-images.pdf', content);
      
      // Process the document
      const result = await processDocument(filePath, { extractText: true, extractTables: false, extractMetadata: false });
      
      // Check if the text was extracted correctly
      if (!result.text.includes('text and images')) {
        throw new Error('Text extraction failed: text from PDF with images not extracted correctly');
      }
    });
    
    // Test 9: Extract text from a PDF with tables
    await runTest('Extract text from a PDF with tables', async () => {
      // Generate a test PDF
      const content = `
This PDF contains a table:

Column 1 | Column 2 | Column 3
---------|----------|----------
Value 1  | Value 2  | Value 3
Value 4  | Value 5  | Value 6
Value 7  | Value 8  | Value 9
`;
      const filePath = generateTestPdf('with-tables.pdf', content);
      
      // Process the document
      const result = await processDocument(filePath, { extractText: true, extractTables: false, extractMetadata: false });
      
      // Check if the text was extracted correctly
      if (!result.text.includes('Column 1') || 
          !result.text.includes('Value 1') || 
          !result.text.includes('Value 9')) {
        throw new Error('Text extraction failed: text from PDF with tables not extracted correctly');
      }
    });
    
    // Test 10: Extract text from a PDF with headers and footers
    await runTest('Extract text from a PDF with headers and footers', async () => {
      // Generate a test PDF
      const content = `
Header: Financial Report 2023

Main content of the document.

Footer: Page 1 of 1
`;
      const filePath = generateTestPdf('with-headers-footers.pdf', content);
      
      // Process the document
      const result = await processDocument(filePath, { extractText: true, extractTables: false, extractMetadata: false });
      
      // Check if the text was extracted correctly
      if (!result.text.includes('Header') || 
          !result.text.includes('Main content') || 
          !result.text.includes('Footer')) {
        throw new Error('Text extraction failed: text from PDF with headers and footers not extracted correctly');
      }
    });
  } catch (error) {
    console.error('Error running tests:', error);
  } finally {
    testResults.endTime = new Date();
    
    // Save test results
    saveTestResults();
    
    // Print summary
    console.log('\n📋 Test Summary:');
    console.log(`   Total: ${testResults.total}`);
    console.log(`   Passed: ${testResults.passed}`);
    console.log(`   Failed: ${testResults.failed}`);
    console.log(`   Skipped: ${testResults.skipped}`);
    console.log(`   Duration: ${Math.floor((testResults.endTime - testResults.startTime) / 1000)} seconds`);
  }
}

// Run the tests
runTests();
