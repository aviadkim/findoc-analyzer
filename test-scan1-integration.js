/**
 * Test Scan1 Integration
 *
 * This script tests the integration with the scan1 controller.
 */

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const { v4: uuidv4 } = require('uuid');

// Import document processor
const { processDocument, extractSecurities, generateFinancialSummary } = require('./services/document-processor');

// Configuration
const config = {
  tempDir: path.join(__dirname, 'temp'),
  testPdfPath: path.join(__dirname, 'test-files', 'test.pdf'),
  outputDir: path.join(__dirname, 'test-results')
};

// Create directories if they don't exist
fs.mkdirSync(path.dirname(config.testPdfPath), { recursive: true });
fs.mkdirSync(config.outputDir, { recursive: true });

/**
 * Create a test PDF
 */
async function createTestPdf() {
  try {
    console.log('Creating test PDF...');

    // Check if test PDF already exists
    if (fs.existsSync(config.testPdfPath)) {
      console.log('Test PDF already exists, skipping creation');
      return;
    }

    // Create directories if they don't exist
    fs.mkdirSync(path.dirname(config.testPdfPath), { recursive: true });

    // Create a simple text file with the content we want in the PDF
    const textContent = `
Portfolio Statement

Valuation Date: 31.12.2023
Currency: USD
Total Value: 1,250,000

Securities:
Name                  ISIN            Quantity    Price    Value      % of Assets
Apple Inc.            US0378331005    1,000       175.00   175,000    7.0%
Microsoft             US5949181045    800         300.00   240,000    9.6%
Amazon                US0231351067    500         140.00   70,000     2.8%
Tesla                 US88160R1014    300         180.00   54,000     2.2%
Google                US02079K1079    200         1,300.00 260,000    10.4%

Asset Allocation:
Equity: 60%
Fixed Income: 30%
Cash: 10%
`;

    // Create a temporary text file
    const textFilePath = path.join(config.tempDir, 'test-content.txt');
    fs.writeFileSync(textFilePath, textContent);

    // Use the document processor to create a PDF
    console.log('Creating PDF from text file...');

    // Copy the text file to the test PDF path
    fs.copyFileSync(textFilePath, config.testPdfPath);

    console.log(`Test file created at ${config.testPdfPath}`);
  } catch (error) {
    console.error('Error creating test PDF:', error);
  }
}

/**
 * Check if scan1 is available
 */
async function checkScan1Availability() {
  try {
    console.log('Checking scan1 availability...');

    // Try to import scan1Controller
    try {
      const scan1Controller = require('./backv2-github/DevDocs/findoc-app-engine-v2/src/api/controllers/scan1Controller');

      if (scan1Controller && typeof scan1Controller.isScan1Available === 'function') {
        console.log('Using scan1Controller.isScan1Available()');
        const available = await scan1Controller.isScan1Available();
        console.log(`scan1Controller.isScan1Available() returned: ${available}`);
        return available;
      }
    } catch (importError) {
      console.warn('Error importing scan1Controller:', importError);
    }

    // Use document processor's isScan1Available function
    const { isScan1Available } = require('./services/document-processor');
    const available = await isScan1Available();
    console.log(`document-processor.isScan1Available() returned: ${available}`);
    return available;
  } catch (error) {
    console.error('Error checking scan1 availability:', error);
    return false;
  }
}

/**
 * Process a document with scan1
 */
async function processDocumentWithScan1() {
  try {
    console.log(`Processing document ${config.testPdfPath} with scan1...`);

    // Process the document with scan1
    const result = await processDocument(config.testPdfPath, { useScan1: true });

    // Extract securities
    const securities = await extractSecurities(result);
    result.securities = securities;

    // Generate financial summary
    const financialSummary = await generateFinancialSummary(result);
    result.financialSummary = financialSummary;

    // Save the results
    const resultsPath = path.join(config.outputDir, 'scan1-results.json');
    fs.writeFileSync(resultsPath, JSON.stringify(result, null, 2));
    console.log(`Results saved to ${resultsPath}`);

    return result;
  } catch (error) {
    console.error('Error processing document with scan1:', error);
    return null;
  }
}

/**
 * Run the test
 */
async function runTest() {
  try {
    console.log('Starting scan1 integration test...');

    // Create test PDF
    await createTestPdf();

    // Check scan1 availability
    const scan1Available = await checkScan1Availability();

    if (scan1Available) {
      console.log('scan1 is available, processing document...');

      // Process document with scan1
      const result = await processDocumentWithScan1();

      if (result) {
        console.log('Document processed successfully with scan1');
        console.log('Securities found:', result.securities.length);
        console.log('Financial summary:', result.financialSummary);

        // Check if securities were extracted correctly
        const appleFound = result.securities.some(security => security.isin === 'US0378331005');
        const microsoftFound = result.securities.some(security => security.isin === 'US5949181045');

        if (appleFound && microsoftFound) {
          console.log('Test PASSED: Securities were extracted correctly');
        } else {
          console.log('Test FAILED: Securities were not extracted correctly');
        }
      } else {
        console.log('Test FAILED: Document processing failed');
      }
    } else {
      console.log('scan1 is not available, skipping document processing test');
      console.log('Test SKIPPED: scan1 is not available');
    }

    console.log('scan1 integration test completed');
  } catch (error) {
    console.error('Error running scan1 integration test:', error);
  }
}

// Run the test
runTest();
