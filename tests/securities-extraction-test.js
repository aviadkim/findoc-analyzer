/**
 * Securities Extraction Testing
 * 
 * This test focuses specifically on testing the securities extraction functionality.
 * It tests the ability to extract securities information from financial documents.
 */

const fs = require('fs');
const path = require('path');
const { processDocument, extractSecurities } = require('../services/document-processor');

// Configuration
const config = {
  testPdfsDir: path.join(__dirname, 'test-pdfs'),
  resultsDir: path.join(__dirname, '../test-results'),
  reportFile: 'securities-extraction-report.json'
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
 * Generate a test PDF with securities information
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
    // Test 1: Extract securities from a simple investment portfolio
    await runTest('Extract securities from a simple investment portfolio', async () => {
      // Generate a test PDF
      const content = `
Investment Portfolio

Security   | ISIN         | Quantity | Acquisition Price | Current Value | % of Assets
-----------|--------------|----------|-------------------|---------------|------------
Apple Inc. | US0378331005 | 1,000    | $150.00           | $175.00       | 7.0%
Microsoft  | US5949181045 | 800      | $250.00           | $300.00       | 9.6%
Amazon     | US0231351067 | 500      | $120.00           | $140.00       | 2.8%
`;
      const filePath = generateTestPdf('simple-portfolio.pdf', content);
      
      // Process the document
      const result = await processDocument(filePath);
      
      // Extract securities
      const securities = await extractSecurities(result);
      
      // Check if securities were extracted correctly
      if (!securities || securities.length === 0) {
        throw new Error('Securities extraction failed: no securities extracted');
      }
      
      // Check if specific securities were extracted
      const appleFound = securities.some(security => 
        security.name === 'Apple Inc.' && 
        security.isin === 'US0378331005' && 
        security.quantity === '1,000' && 
        security.acquisitionPrice === '$150.00' && 
        security.currentValue === '$175.00' && 
        security.percentOfAssets === '7.0%'
      );
      
      const microsoftFound = securities.some(security => 
        security.name === 'Microsoft' && 
        security.isin === 'US5949181045'
      );
      
      const amazonFound = securities.some(security => 
        security.name === 'Amazon' && 
        security.isin === 'US0231351067'
      );
      
      if (!appleFound || !microsoftFound || !amazonFound) {
        throw new Error('Securities extraction failed: not all securities were extracted correctly');
      }
    });
    
    // Test 2: Extract securities from a document with multiple tables
    await runTest('Extract securities from a document with multiple tables', async () => {
      // Generate a test PDF
      const content = `
Financial Report 2023

Balance Sheet
Assets                 | 2023      | 2022
-----------------------|-----------|----------
Cash and Equivalents   | $1,000,000| $800,000
Accounts Receivable    | $500,000  | $450,000
Total Assets           | $1,500,000| $1,250,000

Investment Portfolio
Security   | ISIN         | Quantity | Acquisition Price | Current Value | % of Assets
-----------|--------------|----------|-------------------|---------------|------------
Tesla      | US88160R1014 | 300      | $200.00           | $180.00       | 2.2%
Google     | US02079K1079 | 200      | $1,200.00         | $1,300.00     | 10.4%
`;
      const filePath = generateTestPdf('multiple-tables.pdf', content);
      
      // Process the document
      const result = await processDocument(filePath);
      
      // Extract securities
      const securities = await extractSecurities(result);
      
      // Check if securities were extracted correctly
      if (!securities || securities.length === 0) {
        throw new Error('Securities extraction failed: no securities extracted from document with multiple tables');
      }
      
      // Check if specific securities were extracted
      const teslaFound = securities.some(security => 
        security.name === 'Tesla' && 
        security.isin === 'US88160R1014'
      );
      
      const googleFound = securities.some(security => 
        security.name === 'Google' && 
        security.isin === 'US02079K1079'
      );
      
      if (!teslaFound || !googleFound) {
        throw new Error('Securities extraction failed: not all securities were extracted correctly from document with multiple tables');
      }
    });
    
    // Test 3: Extract securities from a document with different table format
    await runTest('Extract securities from a document with different table format', async () => {
      // Generate a test PDF
      const content = `
Investment Holdings

Name: Apple Inc.
ISIN: US0378331005
Quantity: 1,000
Purchase Price: $150.00
Current Price: $175.00
Total Value: $175,000.00
Percentage of Portfolio: 7.0%

Name: Microsoft
ISIN: US5949181045
Quantity: 800
Purchase Price: $250.00
Current Price: $300.00
Total Value: $240,000.00
Percentage of Portfolio: 9.6%
`;
      const filePath = generateTestPdf('different-format.pdf', content);
      
      // Process the document
      const result = await processDocument(filePath);
      
      // Extract securities
      const securities = await extractSecurities(result);
      
      // Check if securities were extracted correctly
      if (!securities || securities.length === 0) {
        throw new Error('Securities extraction failed: no securities extracted from document with different format');
      }
      
      // Check if specific securities were extracted
      const appleFound = securities.some(security => 
        security.name === 'Apple Inc.' && 
        security.isin === 'US0378331005'
      );
      
      const microsoftFound = securities.some(security => 
        security.name === 'Microsoft' && 
        security.isin === 'US5949181045'
      );
      
      if (!appleFound || !microsoftFound) {
        throw new Error('Securities extraction failed: not all securities were extracted correctly from document with different format');
      }
    });
    
    // Test 4: Extract securities from a document with incomplete information
    await runTest('Extract securities from a document with incomplete information', async () => {
      // Generate a test PDF
      const content = `
Investment Portfolio

Security   | ISIN         | Quantity | Current Value
-----------|--------------|----------|---------------
Apple Inc. | US0378331005 | 1,000    | $175,000.00
Microsoft  | US5949181045 | 800      | $240,000.00
Amazon     |              | 500      | $70,000.00
Tesla      | US88160R1014 |          | $54,000.00
`;
      const filePath = generateTestPdf('incomplete-info.pdf', content);
      
      // Process the document
      const result = await processDocument(filePath);
      
      // Extract securities
      const securities = await extractSecurities(result);
      
      // Check if securities were extracted correctly
      if (!securities || securities.length === 0) {
        throw new Error('Securities extraction failed: no securities extracted from document with incomplete information');
      }
      
      // Check if specific securities were extracted
      const appleFound = securities.some(security => 
        security.name === 'Apple Inc.' && 
        security.isin === 'US0378331005' && 
        security.quantity === '1,000'
      );
      
      const amazonFound = securities.some(security => 
        security.name === 'Amazon'
      );
      
      const teslaFound = securities.some(security => 
        security.name === 'Tesla' && 
        security.isin === 'US88160R1014'
      );
      
      if (!appleFound || !amazonFound || !teslaFound) {
        throw new Error('Securities extraction failed: not all securities were extracted correctly from document with incomplete information');
      }
    });
    
    // Test 5: Extract securities from a document with non-standard security names
    await runTest('Extract securities from a document with non-standard security names', async () => {
      // Generate a test PDF
      const content = `
Investment Portfolio

Security                      | ISIN         | Quantity | Value
------------------------------|--------------|----------|---------------
AAPL (Apple Inc.)            | US0378331005 | 1,000    | $175,000.00
MSFT (Microsoft Corporation) | US5949181045 | 800      | $240,000.00
AMZN (Amazon.com, Inc.)      | US0231351067 | 500      | $70,000.00
`;
      const filePath = generateTestPdf('non-standard-names.pdf', content);
      
      // Process the document
      const result = await processDocument(filePath);
      
      // Extract securities
      const securities = await extractSecurities(result);
      
      // Check if securities were extracted correctly
      if (!securities || securities.length === 0) {
        throw new Error('Securities extraction failed: no securities extracted from document with non-standard names');
      }
      
      // Check if specific securities were extracted
      const appleFound = securities.some(security => 
        (security.name === 'AAPL (Apple Inc.)' || security.name === 'Apple Inc.') && 
        security.isin === 'US0378331005'
      );
      
      const microsoftFound = securities.some(security => 
        (security.name === 'MSFT (Microsoft Corporation)' || security.name === 'Microsoft') && 
        security.isin === 'US5949181045'
      );
      
      const amazonFound = securities.some(security => 
        (security.name === 'AMZN (Amazon.com, Inc.)' || security.name === 'Amazon') && 
        security.isin === 'US0231351067'
      );
      
      if (!appleFound || !microsoftFound || !amazonFound) {
        throw new Error('Securities extraction failed: not all securities were extracted correctly from document with non-standard names');
      }
    });
    
    // Test 6: Extract securities from a document with different currency formats
    await runTest('Extract securities from a document with different currency formats', async () => {
      // Generate a test PDF
      const content = `
Global Investment Portfolio

Security   | ISIN         | Quantity | Acquisition Price | Current Value | % of Assets
-----------|--------------|----------|-------------------|---------------|------------
Apple Inc. | US0378331005 | 1,000    | $150.00           | $175.00       | 7.0%
Nestlé     | CH0038863350 | 500      | CHF 100.00        | CHF 110.00    | 5.5%
Toyota     | JP3633400001 | 300      | ¥7,000            | ¥7,500        | 4.5%
HSBC       | GB0005405286 | 1,000    | £6.00             | £6.50         | 6.5%
`;
      const filePath = generateTestPdf('different-currencies.pdf', content);
      
      // Process the document
      const result = await processDocument(filePath);
      
      // Extract securities
      const securities = await extractSecurities(result);
      
      // Check if securities were extracted correctly
      if (!securities || securities.length === 0) {
        throw new Error('Securities extraction failed: no securities extracted from document with different currency formats');
      }
      
      // Check if specific securities were extracted
      const appleFound = securities.some(security => 
        security.name === 'Apple Inc.' && 
        security.isin === 'US0378331005' && 
        security.acquisitionPrice === '$150.00'
      );
      
      const nestleFound = securities.some(security => 
        security.name === 'Nestlé' && 
        security.isin === 'CH0038863350' && 
        security.acquisitionPrice === 'CHF 100.00'
      );
      
      const toyotaFound = securities.some(security => 
        security.name === 'Toyota' && 
        security.isin === 'JP3633400001' && 
        security.acquisitionPrice === '¥7,000'
      );
      
      const hsbcFound = securities.some(security => 
        security.name === 'HSBC' && 
        security.isin === 'GB0005405286' && 
        security.acquisitionPrice === '£6.00'
      );
      
      if (!appleFound || !nestleFound || !toyotaFound || !hsbcFound) {
        throw new Error('Securities extraction failed: not all securities were extracted correctly from document with different currency formats');
      }
    });
    
    // Test 7: Extract securities from a document with bonds
    await runTest('Extract securities from a document with bonds', async () => {
      // Generate a test PDF
      const content = `
Fixed Income Portfolio

Bond                      | ISIN         | Face Value | Coupon | Maturity    | Current Value
--------------------------|--------------|------------|--------|-------------|---------------
US Treasury 10Y           | US912828ZQ64 | $100,000   | 1.50%  | 2030-05-15  | $95,000
Apple Inc. 2.40% 2023     | US037833AK68 | $50,000    | 2.40%  | 2023-05-03  | $50,500
Microsoft 2.70% 2025      | US594918BB96 | $75,000    | 2.70%  | 2025-02-12  | $76,200
`;
      const filePath = generateTestPdf('bonds.pdf', content);
      
      // Process the document
      const result = await processDocument(filePath);
      
      // Extract securities
      const securities = await extractSecurities(result);
      
      // Check if securities were extracted correctly
      if (!securities || securities.length === 0) {
        throw new Error('Securities extraction failed: no securities extracted from document with bonds');
      }
      
      // Check if specific securities were extracted
      const treasuryFound = securities.some(security => 
        security.name === 'US Treasury 10Y' && 
        security.isin === 'US912828ZQ64'
      );
      
      const appleBondFound = securities.some(security => 
        security.name === 'Apple Inc. 2.40% 2023' && 
        security.isin === 'US037833AK68'
      );
      
      const microsoftBondFound = securities.some(security => 
        security.name === 'Microsoft 2.70% 2025' && 
        security.isin === 'US594918BB96'
      );
      
      if (!treasuryFound || !appleBondFound || !microsoftBondFound) {
        throw new Error('Securities extraction failed: not all securities were extracted correctly from document with bonds');
      }
    });
    
    // Test 8: Extract securities from a document with funds
    await runTest('Extract securities from a document with funds', async () => {
      // Generate a test PDF
      const content = `
Fund Portfolio

Fund Name                           | ISIN         | Quantity | NAV    | Current Value | % of Assets
------------------------------------|--------------|----------|--------|---------------|------------
Vanguard S&P 500 ETF                | US9229083632 | 1,000    | $350.00| $350,000.00   | 35.0%
iShares MSCI World ETF              | IE00B4L5Y983 | 2,000    | $75.00 | $150,000.00   | 15.0%
Fidelity Emerging Markets Fund      | US3159128087 | 5,000    | $40.00 | $200,000.00   | 20.0%
`;
      const filePath = generateTestPdf('funds.pdf', content);
      
      // Process the document
      const result = await processDocument(filePath);
      
      // Extract securities
      const securities = await extractSecurities(result);
      
      // Check if securities were extracted correctly
      if (!securities || securities.length === 0) {
        throw new Error('Securities extraction failed: no securities extracted from document with funds');
      }
      
      // Check if specific securities were extracted
      const vanguardFound = securities.some(security => 
        security.name === 'Vanguard S&P 500 ETF' && 
        security.isin === 'US9229083632'
      );
      
      const iSharesFound = securities.some(security => 
        security.name === 'iShares MSCI World ETF' && 
        security.isin === 'IE00B4L5Y983'
      );
      
      const fidelityFound = securities.some(security => 
        security.name === 'Fidelity Emerging Markets Fund' && 
        security.isin === 'US3159128087'
      );
      
      if (!vanguardFound || !iSharesFound || !fidelityFound) {
        throw new Error('Securities extraction failed: not all securities were extracted correctly from document with funds');
      }
    });
    
    // Test 9: Extract securities from a document with mixed security types
    await runTest('Extract securities from a document with mixed security types', async () => {
      // Generate a test PDF
      const content = `
Mixed Investment Portfolio

Type      | Name                      | ISIN         | Quantity | Current Value | % of Assets
----------|---------------------------|--------------|----------|---------------|------------
Stock     | Apple Inc.                | US0378331005 | 1,000    | $175,000.00   | 17.5%
Bond      | US Treasury 10Y           | US912828ZQ64 | $100,000 | $95,000.00    | 9.5%
Fund      | Vanguard S&P 500 ETF      | US9229083632 | 1,000    | $350,000.00   | 35.0%
Stock     | Microsoft                 | US5949181045 | 800      | $240,000.00   | 24.0%
Bond      | Apple Inc. 2.40% 2023     | US037833AK68 | $50,000  | $50,500.00    | 5.0%
Fund      | iShares MSCI World ETF    | IE00B4L5Y983 | 2,000    | $150,000.00   | 15.0%
`;
      const filePath = generateTestPdf('mixed-types.pdf', content);
      
      // Process the document
      const result = await processDocument(filePath);
      
      // Extract securities
      const securities = await extractSecurities(result);
      
      // Check if securities were extracted correctly
      if (!securities || securities.length === 0) {
        throw new Error('Securities extraction failed: no securities extracted from document with mixed security types');
      }
      
      // Check if specific securities were extracted
      const appleFound = securities.some(security => 
        security.name === 'Apple Inc.' && 
        security.isin === 'US0378331005'
      );
      
      const treasuryFound = securities.some(security => 
        security.name === 'US Treasury 10Y' && 
        security.isin === 'US912828ZQ64'
      );
      
      const vanguardFound = securities.some(security => 
        security.name === 'Vanguard S&P 500 ETF' && 
        security.isin === 'US9229083632'
      );
      
      if (!appleFound || !treasuryFound || !vanguardFound) {
        throw new Error('Securities extraction failed: not all securities were extracted correctly from document with mixed security types');
      }
    });
    
    // Test 10: Extract securities from a document with non-standard table format
    await runTest('Extract securities from a document with non-standard table format', async () => {
      // Generate a test PDF
      const content = `
Investment Portfolio - December 31, 2023

+-------------------+-------------------+-------------------+-------------------+-------------------+
|     Security      |       ISIN        |     Quantity      |   Current Value   |   % of Assets    |
+===================+===================+===================+===================+===================+
| Apple Inc.        | US0378331005      | 1,000             | $175,000.00       | 17.5%            |
+-------------------+-------------------+-------------------+-------------------+-------------------+
| Microsoft         | US5949181045      | 800               | $240,000.00       | 24.0%            |
+-------------------+-------------------+-------------------+-------------------+-------------------+
| Amazon            | US0231351067      | 500               | $70,000.00        | 7.0%             |
+-------------------+-------------------+-------------------+-------------------+-------------------+
`;
      const filePath = generateTestPdf('non-standard-format.pdf', content);
      
      // Process the document
      const result = await processDocument(filePath);
      
      // Extract securities
      const securities = await extractSecurities(result);
      
      // Check if securities were extracted correctly
      if (!securities || securities.length === 0) {
        throw new Error('Securities extraction failed: no securities extracted from document with non-standard table format');
      }
      
      // Check if specific securities were extracted
      const appleFound = securities.some(security => 
        security.name === 'Apple Inc.' && 
        security.isin === 'US0378331005'
      );
      
      const microsoftFound = securities.some(security => 
        security.name === 'Microsoft' && 
        security.isin === 'US5949181045'
      );
      
      const amazonFound = securities.some(security => 
        security.name === 'Amazon' && 
        security.isin === 'US0231351067'
      );
      
      if (!appleFound || !microsoftFound || !amazonFound) {
        throw new Error('Securities extraction failed: not all securities were extracted correctly from document with non-standard table format');
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
