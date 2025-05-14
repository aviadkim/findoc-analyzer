/**
 * Test Enhanced Spreadsheet Processing
 * 
 * Tests the enhanced spreadsheet processing capabilities of the MCP document processor,
 * including Excel table extraction and entity recognition.
 */

const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');
const mcpDocumentProcessor = require('./services/mcp-document-processor');

// Constants
const TEST_EXCEL_FILE = path.join(__dirname, 'test-portfolio.xlsx');
const DEBUG = true;

/**
 * Main test function
 */
async function runTests() {
  try {
    console.log('Testing Enhanced Spreadsheet Processing');
    console.log('======================================\n');

    // Ensure test file exists, create if not
    await ensureTestFileExists();

    // Test MCP document processor with Excel file
    console.log('Testing MCP document processor with Excel file...');
    await testMcpExcelProcessing();

    console.log('\nAll tests completed successfully!');
  } catch (error) {
    console.error(`\nTest failed: ${error.message}`);
    console.error(error);
    process.exit(1);
  }
}

/**
 * Test MCP document processor with Excel file
 */
async function testMcpExcelProcessing() {
  try {
    // Process the Excel file with MCP document processor
    const result = await mcpDocumentProcessor.processDocument(TEST_EXCEL_FILE);

    // Validate result structure
    validateResultStructure(result);

    // Display processing results
    displayResults(result);

    return result;
  } catch (error) {
    console.error(`Error in testMcpExcelProcessing: ${error.message}`);
    throw error;
  }
}

/**
 * Validate the structure of the processing result
 * @param {Object} result - Processing result
 */
function validateResultStructure(result) {
  // Check that result has required properties
  const requiredProperties = ['documentId', 'fileName', 'text', 'tables', 'metadata', 'entities'];
  
  for (const prop of requiredProperties) {
    if (result[prop] === undefined) {
      throw new Error(`Result missing required property: ${prop}`);
    }
  }

  // Check that text is not empty
  if (!result.text || result.text.length === 0) {
    throw new Error('Result has empty text');
  }

  // Check that tables were extracted
  if (!Array.isArray(result.tables) || result.tables.length === 0) {
    throw new Error('No tables were extracted from Excel file');
  }

  console.log('✓ Result structure validation passed');
}

/**
 * Display the processing results
 * @param {Object} result - Processing result
 */
function displayResults(result) {
  console.log('\nProcessing Results:');
  console.log('------------------');
  console.log(`Document ID: ${result.documentId}`);
  console.log(`File Name: ${result.fileName}`);
  
  // Display metadata
  console.log('\nMetadata:');
  console.log('---------');
  Object.entries(result.metadata).forEach(([key, value]) => {
    console.log(`${key}: ${value}`);
  });
  
  // Display text sample
  console.log('\nText Sample:');
  console.log('-----------');
  const textSample = result.text.substring(0, 200) + (result.text.length > 200 ? '...' : '');
  console.log(textSample);
  
  // Display tables
  console.log('\nTables:');
  console.log('------');
  console.log(`Total tables: ${result.tables.length}`);
  
  result.tables.forEach((table, index) => {
    console.log(`\nTable ${index + 1}: ${table.name || 'Unnamed'}`);
    console.log(`Type: ${table.type || 'general'}`);
    console.log(`Headers: ${table.headers ? table.headers.join(', ') : 'None'}`);
    console.log(`Rows: ${table.rows ? table.rows.length : 0}`);
    
    // Display first row as sample
    if (table.rows && table.rows.length > 0) {
      console.log('First row sample:', table.rows[0]);
    }
  });
  
  // Display entities
  console.log('\nEntities:');
  console.log('--------');
  console.log(`Total entities: ${result.entities.length}`);
  
  // Group entities by type
  const entityTypes = {};
  result.entities.forEach(entity => {
    if (!entityTypes[entity.type]) {
      entityTypes[entity.type] = [];
    }
    entityTypes[entity.type].push(entity);
  });
  
  Object.entries(entityTypes).forEach(([type, entities]) => {
    console.log(`\n${type} (${entities.length}):`);
    entities.slice(0, 3).forEach(entity => {
      console.log(`- ${entity.name || entity.isin || entity.value || 'Unnamed'}`);
    });
    if (entities.length > 3) {
      console.log(`  ... and ${entities.length - 3} more`);
    }
  });
}

/**
 * Ensure the test Excel file exists by creating it if necessary
 */
async function ensureTestFileExists() {
  try {
    // Check if file exists
    if (fs.existsSync(TEST_EXCEL_FILE)) {
      console.log(`Using existing test file: ${TEST_EXCEL_FILE}`);
      return;
    }
    
    console.log(`Creating test Excel file: ${TEST_EXCEL_FILE}`);
    
    // Create a workbook
    const workbook = XLSX.utils.book_new();
    
    // Portfolio holdings data
    const portfolioData = [
      ['Security Name', 'ISIN', 'Ticker', 'Quantity', 'Price', 'Market Value', 'Asset Class', '% of Portfolio'],
      ['Apple Inc.', 'US0378331005', 'AAPL', 100, 187.51, 18751.00, 'Equity', 15.5],
      ['Microsoft Corporation', 'US5949181045', 'MSFT', 75, 319.76, 23982.00, 'Equity', 19.8],
      ['Amazon.com Inc.', 'US0231351067', 'AMZN', 50, 178.22, 8911.00, 'Equity', 7.4],
      ['Alphabet Inc.', 'US02079K1079', 'GOOGL', 80, 162.68, 13014.40, 'Equity', 10.7],
      ['Tesla Inc.', 'US88160R1014', 'TSLA', 60, 223.45, 13407.00, 'Equity', 11.1],
      ['NVIDIA Corporation', 'US67066G1040', 'NVDA', 40, 405.38, 16215.20, 'Equity', 13.4],
      ['JPMorgan Chase & Co.', 'US46625H1005', 'JPM', 65, 183.27, 11912.55, 'Equity', 9.8],
      ['Johnson & Johnson', 'US4781601046', 'JNJ', 70, 155.78, 10904.60, 'Equity', 9.0],
      ['Visa Inc.', 'US92826C8394', 'V', 30, 274.94, 8248.20, 'Equity', 6.8]
    ];
    
    // Asset allocation data
    const allocationData = [
      ['Asset Class', 'Market Value', '% of Portfolio'],
      ['Equity', 121000.00, 100.0],
      ['Fixed Income', 0.00, 0.0],
      ['Cash', 0.00, 0.0],
      ['Alternative', 0.00, 0.0],
      ['Total', 121000.00, 100.0]
    ];
    
    // Performance data
    const performanceData = [
      ['Period', 'Return', 'Benchmark Return', 'Relative Performance'],
      ['1 Month', 2.4, 1.8, 0.6],
      ['3 Months', 7.8, 6.2, 1.6],
      ['6 Months', 15.3, 12.1, 3.2],
      ['1 Year', 22.7, 18.4, 4.3],
      ['3 Years', 68.4, 52.1, 16.3],
      ['5 Years', 114.2, 89.7, 24.5]
    ];
    
    // Account information data
    const accountData = [
      ['Account Number', 'ACCT-12345-6789'],
      ['Account Name', 'Test Portfolio'],
      ['Account Type', 'Individual Investment Account'],
      ['Currency', 'USD'],
      ['Opening Date', '2020-01-01'],
      ['Advisor', 'Jane Smith'],
      ['Contact Email', 'advisor@example.com'],
      ['Risk Profile', 'Growth']
    ];
    
    // Create worksheets
    const worksheetPortfolio = XLSX.utils.aoa_to_sheet(portfolioData);
    const worksheetAllocation = XLSX.utils.aoa_to_sheet(allocationData);
    const worksheetPerformance = XLSX.utils.aoa_to_sheet(performanceData);
    const worksheetAccount = XLSX.utils.aoa_to_sheet(accountData);
    
    // Add worksheets to workbook
    XLSX.utils.book_append_sheet(workbook, worksheetPortfolio, 'Portfolio Holdings');
    XLSX.utils.book_append_sheet(workbook, worksheetAllocation, 'Asset Allocation');
    XLSX.utils.book_append_sheet(workbook, worksheetPerformance, 'Performance');
    XLSX.utils.book_append_sheet(workbook, worksheetAccount, 'Account Information');
    
    // Write to file
    XLSX.writeFile(workbook, TEST_EXCEL_FILE);
    
    console.log('Test Excel file created successfully');
  } catch (error) {
    console.error(`Error creating test Excel file: ${error.message}`);
    throw error;
  }
}

// Run the tests
runTests().catch(console.error);