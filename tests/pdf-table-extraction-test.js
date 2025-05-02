/**
 * PDF Table Extraction Testing
 * 
 * This test focuses specifically on testing the PDF table extraction functionality.
 * It tests the ability to extract tables from various types of PDF documents.
 */

const fs = require('fs');
const path = require('path');
const { processDocument } = require('../services/document-processor');

// Configuration
const config = {
  testPdfsDir: path.join(__dirname, 'test-pdfs'),
  resultsDir: path.join(__dirname, '../test-results'),
  reportFile: 'pdf-table-extraction-report.json'
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
 * Generate a test PDF with table content
 * @param {string} filename - Output filename
 * @param {string} content - Text content
 * @param {Array} tables - Table data
 */
function generateTestPdf(filename, content, tables = []) {
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
    // Test 1: Extract a simple table from a PDF
    await runTest('Extract a simple table from a PDF', async () => {
      // Generate a test PDF
      const content = `
This PDF contains a simple table:

Column 1 | Column 2 | Column 3
---------|----------|----------
Value 1  | Value 2  | Value 3
Value 4  | Value 5  | Value 6
Value 7  | Value 8  | Value 9
`;
      const filePath = generateTestPdf('simple-table.pdf', content);
      
      // Process the document
      const result = await processDocument(filePath, { extractText: false, extractTables: true, extractMetadata: false });
      
      // Check if the table was extracted correctly
      if (!result.tables || result.tables.length === 0) {
        throw new Error('Table extraction failed: no tables extracted');
      }
      
      const table = result.tables[0];
      
      // Check table headers
      if (!table.headers || table.headers.length !== 3 || 
          !table.headers.includes('Column 1') || 
          !table.headers.includes('Column 2') || 
          !table.headers.includes('Column 3')) {
        throw new Error('Table extraction failed: headers not extracted correctly');
      }
      
      // Check table rows
      if (!table.rows || table.rows.length !== 3) {
        throw new Error('Table extraction failed: incorrect number of rows');
      }
      
      // Check specific cell values
      if (table.rows[0][0] !== 'Value 1' || 
          table.rows[1][1] !== 'Value 5' || 
          table.rows[2][2] !== 'Value 9') {
        throw new Error('Table extraction failed: cell values not extracted correctly');
      }
    });
    
    // Test 2: Extract multiple tables from a PDF
    await runTest('Extract multiple tables from a PDF', async () => {
      // Generate a test PDF
      const content = `
This PDF contains multiple tables:

Table 1:
Column 1 | Column 2
---------|----------
Value 1  | Value 2
Value 3  | Value 4

Table 2:
Column A | Column B | Column C
---------|----------|----------
Value A  | Value B  | Value C
Value D  | Value E  | Value F
`;
      const filePath = generateTestPdf('multiple-tables.pdf', content);
      
      // Process the document
      const result = await processDocument(filePath, { extractText: false, extractTables: true, extractMetadata: false });
      
      // Check if the tables were extracted correctly
      if (!result.tables || result.tables.length !== 2) {
        throw new Error('Table extraction failed: incorrect number of tables extracted');
      }
      
      // Check first table
      const table1 = result.tables[0];
      if (!table1.headers || table1.headers.length !== 2 || 
          !table1.headers.includes('Column 1') || 
          !table1.headers.includes('Column 2')) {
        throw new Error('Table extraction failed: first table headers not extracted correctly');
      }
      
      // Check second table
      const table2 = result.tables[1];
      if (!table2.headers || table2.headers.length !== 3 || 
          !table2.headers.includes('Column A') || 
          !table2.headers.includes('Column B') || 
          !table2.headers.includes('Column C')) {
        throw new Error('Table extraction failed: second table headers not extracted correctly');
      }
    });
    
    // Test 3: Extract a table with numeric data
    await runTest('Extract a table with numeric data', async () => {
      // Generate a test PDF
      const content = `
This PDF contains a table with numeric data:

Item      | Quantity | Price  | Total
----------|----------|--------|--------
Product A | 10       | $5.00  | $50.00
Product B | 5        | $10.00 | $50.00
Product C | 2        | $25.00 | $50.00
          |          |        | $150.00
`;
      const filePath = generateTestPdf('numeric-table.pdf', content);
      
      // Process the document
      const result = await processDocument(filePath, { extractText: false, extractTables: true, extractMetadata: false });
      
      // Check if the table was extracted correctly
      if (!result.tables || result.tables.length === 0) {
        throw new Error('Table extraction failed: no tables extracted');
      }
      
      const table = result.tables[0];
      
      // Check table headers
      if (!table.headers || table.headers.length !== 4 || 
          !table.headers.includes('Item') || 
          !table.headers.includes('Quantity') || 
          !table.headers.includes('Price') || 
          !table.headers.includes('Total')) {
        throw new Error('Table extraction failed: headers not extracted correctly');
      }
      
      // Check specific cell values
      if (!table.rows.some(row => row.includes('$5.00')) || 
          !table.rows.some(row => row.includes('10')) || 
          !table.rows.some(row => row.includes('$150.00'))) {
        throw new Error('Table extraction failed: numeric values not extracted correctly');
      }
    });
    
    // Test 4: Extract a table with merged cells
    await runTest('Extract a table with merged cells', async () => {
      // Generate a test PDF
      const content = `
This PDF contains a table with merged cells:

Category  | Product   | Price
----------|-----------|--------
Category A| Product 1 | $10.00
          | Product 2 | $15.00
Category B| Product 3 | $20.00
          | Product 4 | $25.00
`;
      const filePath = generateTestPdf('merged-cells-table.pdf', content);
      
      // Process the document
      const result = await processDocument(filePath, { extractText: false, extractTables: true, extractMetadata: false });
      
      // Check if the table was extracted correctly
      if (!result.tables || result.tables.length === 0) {
        throw new Error('Table extraction failed: no tables extracted');
      }
      
      // Note: Handling merged cells is complex and depends on the extraction library
      // For now, we'll just check if the table was extracted at all
      const table = result.tables[0];
      
      // Check table headers
      if (!table.headers || table.headers.length !== 3 || 
          !table.headers.includes('Category') || 
          !table.headers.includes('Product') || 
          !table.headers.includes('Price')) {
        throw new Error('Table extraction failed: headers not extracted correctly');
      }
    });
    
    // Test 5: Extract a table with special characters
    await runTest('Extract a table with special characters', async () => {
      // Generate a test PDF
      const content = `
This PDF contains a table with special characters:

Name      | Symbol   | Description
----------|----------|------------
Alpha     | α        | Greek letter alpha
Beta      | β        | Greek letter beta
Euro      | €        | Euro currency symbol
Degree    | °        | Degree symbol
`;
      const filePath = generateTestPdf('special-chars-table.pdf', content);
      
      // Process the document
      const result = await processDocument(filePath, { extractText: false, extractTables: true, extractMetadata: false });
      
      // Check if the table was extracted correctly
      if (!result.tables || result.tables.length === 0) {
        throw new Error('Table extraction failed: no tables extracted');
      }
      
      const table = result.tables[0];
      
      // Check table headers
      if (!table.headers || table.headers.length !== 3 || 
          !table.headers.includes('Name') || 
          !table.headers.includes('Symbol') || 
          !table.headers.includes('Description')) {
        throw new Error('Table extraction failed: headers not extracted correctly');
      }
      
      // Check if special characters were extracted
      // Note: This depends on the extraction library's ability to handle special characters
      if (!table.rows.some(row => row.includes('Alpha')) || 
          !table.rows.some(row => row.includes('Euro'))) {
        throw new Error('Table extraction failed: special character rows not extracted correctly');
      }
    });
    
    // Test 6: Extract a table from a financial report
    await runTest('Extract a table from a financial report', async () => {
      // Generate a test PDF
      const content = `
Financial Report 2023

Balance Sheet
Assets                 | 2023      | 2022
-----------------------|-----------|----------
Cash and Equivalents   | $1,000,000| $800,000
Accounts Receivable    | $500,000  | $450,000
Inventory              | $750,000  | $700,000
Total Current Assets   | $2,250,000| $1,950,000
Property and Equipment | $3,000,000| $2,800,000
Total Assets           | $5,250,000| $4,750,000

Liabilities and Equity | 2023      | 2022
-----------------------|-----------|----------
Accounts Payable       | $300,000  | $250,000
Short-term Debt        | $200,000  | $300,000
Total Current Liabilities | $500,000 | $550,000
Long-term Debt         | $1,500,000| $1,700,000
Total Liabilities      | $2,000,000| $2,250,000
Shareholders' Equity   | $3,250,000| $2,500,000
Total Liabilities and Equity | $5,250,000| $4,750,000
`;
      const filePath = generateTestPdf('financial-report-table.pdf', content);
      
      // Process the document
      const result = await processDocument(filePath, { extractText: false, extractTables: true, extractMetadata: false });
      
      // Check if the tables were extracted correctly
      if (!result.tables || result.tables.length === 0) {
        throw new Error('Table extraction failed: no tables extracted');
      }
      
      // Check if at least one table has financial data
      let foundFinancialTable = false;
      for (const table of result.tables) {
        if (table.headers && 
            (table.headers.includes('Assets') || table.headers.includes('Liabilities and Equity')) && 
            table.headers.includes('2023') && 
            table.headers.includes('2022')) {
          foundFinancialTable = true;
          break;
        }
      }
      
      if (!foundFinancialTable) {
        throw new Error('Table extraction failed: financial tables not extracted correctly');
      }
    });
    
    // Test 7: Extract a table with investment portfolio data
    await runTest('Extract a table with investment portfolio data', async () => {
      // Generate a test PDF
      const content = `
Investment Portfolio

Security   | ISIN         | Quantity | Acquisition Price | Current Value | % of Assets
-----------|--------------|----------|-------------------|---------------|------------
Apple Inc. | US0378331005 | 1,000    | $150.00           | $175.00       | 7.0%
Microsoft  | US5949181045 | 800      | $250.00           | $300.00       | 9.6%
Amazon     | US0231351067 | 500      | $120.00           | $140.00       | 2.8%
Tesla      | US88160R1014 | 300      | $200.00           | $180.00       | 2.2%
Google     | US02079K1079 | 200      | $1,200.00         | $1,300.00     | 10.4%
`;
      const filePath = generateTestPdf('investment-portfolio-table.pdf', content);
      
      // Process the document
      const result = await processDocument(filePath, { extractText: false, extractTables: true, extractMetadata: false });
      
      // Check if the table was extracted correctly
      if (!result.tables || result.tables.length === 0) {
        throw new Error('Table extraction failed: no tables extracted');
      }
      
      const table = result.tables[0];
      
      // Check table headers
      if (!table.headers || 
          !table.headers.includes('Security') || 
          !table.headers.includes('ISIN') || 
          !table.headers.includes('Quantity') || 
          !table.headers.includes('Acquisition Price') || 
          !table.headers.includes('Current Value') || 
          !table.headers.includes('% of Assets')) {
        throw new Error('Table extraction failed: investment portfolio headers not extracted correctly');
      }
      
      // Check if specific securities were extracted
      if (!table.rows.some(row => row.includes('Apple Inc.')) || 
          !table.rows.some(row => row.includes('Microsoft')) || 
          !table.rows.some(row => row.includes('Amazon'))) {
        throw new Error('Table extraction failed: investment portfolio data not extracted correctly');
      }
    });
    
    // Test 8: Extract a table with complex formatting
    await runTest('Extract a table with complex formatting', async () => {
      // Generate a test PDF
      const content = `
This PDF contains a table with complex formatting:

+-------------------+-------------------+-------------------+
|     Header 1      |     Header 2      |     Header 3      |
+===================+===================+===================+
| Cell 1,1          | Cell 1,2          | Cell 1,3          |
+-------------------+-------------------+-------------------+
| Cell 2,1          | Cell 2,2          | Cell 2,3          |
+-------------------+-------------------+-------------------+
| Cell 3,1          | Cell 3,2          | Cell 3,3          |
+-------------------+-------------------+-------------------+
`;
      const filePath = generateTestPdf('complex-formatting-table.pdf', content);
      
      // Process the document
      const result = await processDocument(filePath, { extractText: false, extractTables: true, extractMetadata: false });
      
      // Check if the table was extracted correctly
      if (!result.tables || result.tables.length === 0) {
        throw new Error('Table extraction failed: no tables extracted');
      }
      
      const table = result.tables[0];
      
      // Check table headers
      if (!table.headers || table.headers.length !== 3 || 
          !table.headers.includes('Header 1') || 
          !table.headers.includes('Header 2') || 
          !table.headers.includes('Header 3')) {
        throw new Error('Table extraction failed: complex formatting headers not extracted correctly');
      }
      
      // Check table rows
      if (!table.rows || table.rows.length !== 3) {
        throw new Error('Table extraction failed: incorrect number of rows in complex formatting table');
      }
    });
    
    // Test 9: Extract a table from a PDF with multiple pages
    await runTest('Extract a table from a PDF with multiple pages', async () => {
      // Generate a test PDF
      const content = `
Page 1

This is the first page.

Page 2

This page contains a table:

Column 1 | Column 2 | Column 3
---------|----------|----------
Value 1  | Value 2  | Value 3
Value 4  | Value 5  | Value 6

Page 3

This is the third page.
`;
      const filePath = generateTestPdf('multipage-table.pdf', content);
      
      // Process the document
      const result = await processDocument(filePath, { extractText: false, extractTables: true, extractMetadata: false });
      
      // Check if the table was extracted correctly
      if (!result.tables || result.tables.length === 0) {
        throw new Error('Table extraction failed: no tables extracted from multipage PDF');
      }
      
      const table = result.tables[0];
      
      // Check table headers
      if (!table.headers || table.headers.length !== 3 || 
          !table.headers.includes('Column 1') || 
          !table.headers.includes('Column 2') || 
          !table.headers.includes('Column 3')) {
        throw new Error('Table extraction failed: headers not extracted correctly from multipage PDF');
      }
    });
    
    // Test 10: Extract a table with empty cells
    await runTest('Extract a table with empty cells', async () => {
      // Generate a test PDF
      const content = `
This PDF contains a table with empty cells:

Product | Q1    | Q2    | Q3    | Q4
--------|-------|-------|-------|-------
Product A| $1,000|       | $1,500| $2,000
Product B| $500  | $750  |       | $1,000
Product C|       |       | $2,000| $2,500
`;
      const filePath = generateTestPdf('empty-cells-table.pdf', content);
      
      // Process the document
      const result = await processDocument(filePath, { extractText: false, extractTables: true, extractMetadata: false });
      
      // Check if the table was extracted correctly
      if (!result.tables || result.tables.length === 0) {
        throw new Error('Table extraction failed: no tables extracted');
      }
      
      const table = result.tables[0];
      
      // Check table headers
      if (!table.headers || table.headers.length !== 5 || 
          !table.headers.includes('Product') || 
          !table.headers.includes('Q1') || 
          !table.headers.includes('Q2') || 
          !table.headers.includes('Q3') || 
          !table.headers.includes('Q4')) {
        throw new Error('Table extraction failed: headers not extracted correctly from table with empty cells');
      }
      
      // Check if empty cells are handled correctly
      // This depends on how the extraction library handles empty cells
      if (!table.rows || table.rows.length !== 3) {
        throw new Error('Table extraction failed: incorrect number of rows in table with empty cells');
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
