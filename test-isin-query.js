/**
 * Test script for ISIN query handling
 */

const fs = require('fs');
const path = require('path');
const { processPdf } = require('./services/pdf-processor');
const { extractFinancialData } = require('./services/financial-data-extractor');
const { handleSecuritiesExtractorQuery } = require('./services/agent-handlers');

// Path to the messos.pdf file
const pdfFile = path.join(__dirname, 'test-pdfs', 'messos.pdf');

async function testIsinQuery() {
  try {
    console.log('Testing ISIN query handling for messos.pdf');

    // Process the PDF
    console.log('Processing PDF...');
    const pdfData = await processPdf(pdfFile);

    // Extract financial data
    console.log('Extracting financial data...');
    const financialData = await extractFinancialData(pdfData.text, pdfData.tables);

    // Combine data
    const data = {
      ...pdfData,
      financialData
    };

    // Test ISIN queries
    console.log('\nTesting general ISIN query:');
    const query1 = 'What are the ISINs?';
    console.log(`Query: "${query1}"`);

    const response1 = handleSecuritiesExtractorQuery(data, query1);
    console.log(`Response: ${response1}`);

    console.log('\nTesting specific ISIN query:');
    const query2 = 'What is the ISIN for LUMINIS?';
    console.log(`Query: "${query2}"`);

    const response2 = handleSecuritiesExtractorQuery(data, query2);
    console.log(`Response: ${response2}`);
  } catch (error) {
    console.error('Error during testing:', error);
  }
}

// Run the test
testIsinQuery().then(() => {
  console.log('\nTesting completed.');
});
