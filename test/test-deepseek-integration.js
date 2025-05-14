/**
 * Test DeepSeek API Integration
 *
 * This script tests the DeepSeek API integration using the sequential testing framework.
 */

const { SequentialTestRunner, config } = require('./sequential-testing-framework');
const deepSeekService = require('../services/deepseek-service');
const fs = require('fs');
const path = require('path');

// Create test runner
const runner = new SequentialTestRunner();

/**
 * Run all tests
 */
async function runAllTests() {
  try {
    // Initialize the test runner
    await runner.init();

    // Test 1: DeepSeek API Key Retrieval
    await runner.runTest('DEEPSEEK-01', 'Test DeepSeek API Key Retrieval', [
      // Step 1: Get the DeepSeek API key
      async (runner, stepResult) => {
        console.log('Getting DeepSeek API key...');

        const apiKey = await deepSeekService.getDeepSeekApiKey();

        if (!apiKey) {
          throw new Error('Failed to get DeepSeek API key');
        }

        console.log('DeepSeek API key retrieved successfully');
        console.log('API Key:', apiKey.substring(0, 5) + '...' + apiKey.substring(apiKey.length - 5));
      }
    ]);

    // Test 2: Text Generation
    await runner.runTest('DEEPSEEK-02', 'Test Text Generation', [
      // Step 1: Generate text
      async (runner, stepResult) => {
        console.log('Generating text...');

        const prompt = 'Explain what a financial document analyzer does in 3 sentences.';

        const response = await deepSeekService.generateText(prompt, {
          temperature: 0.2,
          maxTokens: 100
        });

        if (!response) {
          throw new Error('Failed to generate text');
        }

        console.log('Text generated successfully');
        console.log('Response:', response);
      }
    ]);

    // Test 3: Table Extraction
    await runner.runTest('DEEPSEEK-03', 'Test Table Extraction', [
      // Step 1: Create a test document with tables
      async (runner, stepResult) => {
        console.log('Creating test document with tables...');

        const documentText = `
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
        const filePath = path.join(config.testFilesDir, 'test-document.txt');
        fs.writeFileSync(filePath, documentText);

        console.log('Test document created successfully');
      },

      // Step 2: Extract tables from the document
      async (runner, stepResult) => {
        console.log('Extracting tables from document...');

        const documentText = fs.readFileSync(
          path.join(config.testFilesDir, 'test-document.txt'),
          'utf-8'
        );

        const tables = await deepSeekService.extractTables(documentText);

        if (!tables || tables.length === 0) {
          throw new Error('Failed to extract tables');
        }

        console.log('Tables extracted successfully');
        console.log('Number of tables:', tables.length);
        console.log('Tables:', JSON.stringify(tables, null, 2));

        // Verify the tables
        if (tables.length < 2) {
          throw new Error('Expected at least 2 tables, but got ' + tables.length);
        }

        // Save the tables to a file
        const resultsPath = path.join(
          config.resultsDir,
          'deepseek-tables.json'
        );

        fs.writeFileSync(resultsPath, JSON.stringify(tables, null, 2));

        console.log('Tables saved to:', resultsPath);
      }
    ]);

    // Test 4: Document Analysis
    await runner.runTest('DEEPSEEK-04', 'Test Document Analysis', [
      // Step 1: Analyze a document
      async (runner, stepResult) => {
        console.log('Analyzing document...');

        const documentText = fs.readFileSync(
          path.join(config.testFilesDir, 'test-document.txt'),
          'utf-8'
        );

        const analysis = await deepSeekService.analyzeDocument(documentText);

        if (!analysis) {
          throw new Error('Failed to analyze document');
        }

        console.log('Document analyzed successfully');
        console.log('Analysis:', JSON.stringify(analysis, null, 2));

        // Verify the analysis
        if (!analysis.documentType) {
          throw new Error('Analysis does not include document type');
        }

        // Save the analysis to a file
        const resultsPath = path.join(
          config.resultsDir,
          'deepseek-analysis.json'
        );

        fs.writeFileSync(resultsPath, JSON.stringify(analysis, null, 2));

        console.log('Analysis saved to:', resultsPath);
      }
    ]);

    // Test 5: Question Answering
    await runner.runTest('DEEPSEEK-05', 'Test Question Answering', [
      // Step 1: Answer a question about a document
      async (runner, stepResult) => {
        console.log('Answering question about document...');

        const documentText = fs.readFileSync(
          path.join(config.testFilesDir, 'test-document.txt'),
          'utf-8'
        );

        const question = 'What is the total value of Apple shares?';

        const answer = await deepSeekService.answerQuestion(documentText, question);

        if (!answer) {
          throw new Error('Failed to answer question');
        }

        console.log('Question answered successfully');
        console.log('Question:', question);
        console.log('Answer:', answer);

        // Save the answer to a file
        const resultsPath = path.join(
          config.resultsDir,
          'deepseek-answer.txt'
        );

        fs.writeFileSync(resultsPath, `Question: ${question}\n\nAnswer: ${answer}`);

        console.log('Answer saved to:', resultsPath);
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
