/**
 * Test Multi-Document Analysis
 *
 * This script tests the multi-document analysis feature using the sequential testing framework.
 */

const { SequentialTestRunner } = require('./sequential-testing-framework');
const MultiDocumentAnalyzer = require('../services/multi-document-analyzer');
const fs = require('fs');
const path = require('path');

// Create test runner
const runner = new SequentialTestRunner();

// Create multi-document analyzer
const multiDocAnalyzer = new MultiDocumentAnalyzer();

/**
 * Run all tests
 */
async function runAllTests() {
  try {
    // Initialize the test runner
    await runner.init();

    // Test 1: Create Test Documents
    await runner.runTest('MULTIDOC-01', 'Create Test Documents', [
      // Step 1: Create first test document
      async (runner, stepResult) => {
        console.log('Creating first test document...');
        
        const documentText1 = `
        Portfolio Statement
        Client: John Doe
        Account: 123456
        Date: 2023-12-31
        
        Securities:
        ISIN          | Name           | Quantity | Price    | Value     | Currency
        US0378331005  | Apple Inc.     | 100      | 190.50   | 19,050.00 | USD
        US5949181045  | Microsoft Corp.| 50       | 380.20   | 19,010.00 | USD
        US88160R1014  | Tesla Inc.     | 25       | 248.48   | 6,212.00  | USD
        
        Asset Allocation:
        Asset Class | Allocation | Value
        Stocks      | 60%        | 750,000.00
        Bonds       | 30%        | 375,000.00
        Cash        | 10%        | 125,000.00
        `;
        
        // Save the document text to a file
        const filePath1 = path.join(runner.config.testFilesDir, 'portfolio-statement.txt');
        fs.writeFileSync(filePath1, documentText1);
        
        console.log('First test document created successfully');
      },
      
      // Step 2: Create second test document
      async (runner, stepResult) => {
        console.log('Creating second test document...');
        
        const documentText2 = `
        Account Statement
        Client: John Doe
        Account: 123456
        Date: 2023-12-31
        
        Account Summary:
        Opening Balance: $1,000,000.00
        Deposits: $50,000.00
        Withdrawals: $25,000.00
        Investment Returns: $75,000.00
        Closing Balance: $1,100,000.00
        
        Transactions:
        Date       | Type        | Description      | Amount
        2023-12-01 | Deposit     | Monthly Deposit  | $50,000.00
        2023-12-15 | Withdrawal  | Holiday Expenses | $25,000.00
        2023-12-31 | Dividend    | Apple Inc.       | $500.00
        2023-12-31 | Dividend    | Microsoft Corp.  | $750.00
        `;
        
        // Save the document text to a file
        const filePath2 = path.join(runner.config.testFilesDir, 'account-statement.txt');
        fs.writeFileSync(filePath2, documentText2);
        
        console.log('Second test document created successfully');
      }
    ]);

    // Test 2: Compare Documents
    await runner.runTest('MULTIDOC-02', 'Compare Documents', [
      // Step 1: Load test documents
      async (runner, stepResult) => {
        console.log('Loading test documents...');
        
        const document1 = {
          id: 'doc-1',
          fileName: 'portfolio-statement.txt',
          documentType: 'portfolio',
          text: fs.readFileSync(
            path.join(runner.config.testFilesDir, 'portfolio-statement.txt'),
            'utf-8'
          )
        };
        
        const document2 = {
          id: 'doc-2',
          fileName: 'account-statement.txt',
          documentType: 'account',
          text: fs.readFileSync(
            path.join(runner.config.testFilesDir, 'account-statement.txt'),
            'utf-8'
          )
        };
        
        // Store documents in step result for next step
        stepResult.document1 = document1;
        stepResult.document2 = document2;
        
        console.log('Test documents loaded successfully');
      },
      
      // Step 2: Compare documents
      async (runner, stepResult) => {
        console.log('Comparing documents...');
        
        const { document1, document2 } = stepResult;
        
        const comparison = await multiDocAnalyzer.compareDocuments(document1, document2);
        
        if (!comparison) {
          throw new Error('Failed to compare documents');
        }
        
        console.log('Documents compared successfully');
        console.log('Comparison:', JSON.stringify(comparison, null, 2));
        
        // Save the comparison to a file
        const resultsPath = path.join(
          runner.config.resultsDir,
          'document-comparison.json'
        );
        
        fs.writeFileSync(resultsPath, JSON.stringify(comparison, null, 2));
        
        console.log('Comparison saved to:', resultsPath);
        
        // Store comparison in step result for next step
        stepResult.comparison = comparison;
      },
      
      // Step 3: Verify comparison results
      async (runner, stepResult) => {
        console.log('Verifying comparison results...');
        
        const { comparison } = stepResult;
        
        // Verify that the comparison has similarities, differences, and implications
        if (!comparison.similarities || !Array.isArray(comparison.similarities)) {
          throw new Error('Comparison does not include similarities array');
        }
        
        if (!comparison.differences || !Array.isArray(comparison.differences)) {
          throw new Error('Comparison does not include differences array');
        }
        
        if (!comparison.implications || !Array.isArray(comparison.implications)) {
          throw new Error('Comparison does not include implications array');
        }
        
        console.log('Comparison results verified successfully');
      }
    ]);

    // Test 3: Analyze Multiple Documents
    await runner.runTest('MULTIDOC-03', 'Analyze Multiple Documents', [
      // Step 1: Load test documents
      async (runner, stepResult) => {
        console.log('Loading test documents...');
        
        const documents = [
          {
            id: 'doc-1',
            fileName: 'portfolio-statement.txt',
            documentType: 'portfolio',
            text: fs.readFileSync(
              path.join(runner.config.testFilesDir, 'portfolio-statement.txt'),
              'utf-8'
            )
          },
          {
            id: 'doc-2',
            fileName: 'account-statement.txt',
            documentType: 'account',
            text: fs.readFileSync(
              path.join(runner.config.testFilesDir, 'account-statement.txt'),
              'utf-8'
            )
          }
        ];
        
        // Store documents in step result for next step
        stepResult.documents = documents;
        
        console.log('Test documents loaded successfully');
      },
      
      // Step 2: Analyze multiple documents
      async (runner, stepResult) => {
        console.log('Analyzing multiple documents...');
        
        const { documents } = stepResult;
        
        const results = await multiDocAnalyzer.analyzeDocuments(documents);
        
        if (!results) {
          throw new Error('Failed to analyze multiple documents');
        }
        
        console.log('Multiple documents analyzed successfully');
        console.log('Results:', JSON.stringify(results, null, 2));
        
        // Save the results to a file
        const resultsPath = path.join(
          runner.config.resultsDir,
          'multi-document-analysis.json'
        );
        
        fs.writeFileSync(resultsPath, JSON.stringify(results, null, 2));
        
        console.log('Analysis results saved to:', resultsPath);
        
        // Store results in step result for next step
        stepResult.results = results;
      },
      
      // Step 3: Verify analysis results
      async (runner, stepResult) => {
        console.log('Verifying analysis results...');
        
        const { results } = stepResult;
        
        // Verify that the results have documents, relationships, and report
        if (!results.documents || !Array.isArray(results.documents)) {
          throw new Error('Results do not include documents array');
        }
        
        if (!results.relationships || !Array.isArray(results.relationships)) {
          throw new Error('Results do not include relationships array');
        }
        
        if (!results.report) {
          throw new Error('Results do not include report');
        }
        
        console.log('Analysis results verified successfully');
      }
    ]);

  } catch (error) {
    console.error('Error running tests:', error);
  } finally {
    // Save test results
    runner.saveTestResults();
    
    // Clean up resources
    await runner.cleanup();
  }
}

// Run all tests
runAllTests();
