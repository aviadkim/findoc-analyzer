/**
 * Test script for both specific and general ISIN queries
 */

const { handleSecuritiesExtractorQuery } = require('./services/agent-handlers');

// Mock data
const data = {
  text: 'This is a test document with ISINs XS2761230684 and XS2631782468',
  financialData: {
    securities: [
      {
        name: 'LUMINIS',
        type: 'other',
        quantity: null,
        price: null,
        value: null,
        percentage: null,
        isin: 'XS2761230684'
      },
      {
        name: 'LUMINIS REPACK NOTES',
        type: 'bond',
        quantity: null,
        price: null,
        value: null,
        percentage: null,
        isin: 'XS2631782468'
      }
    ]
  }
};

// Test specific ISIN query
console.log('Testing specific ISIN query:');
const query1 = 'What is the ISIN for LUMINIS?';
console.log(`Query: "${query1}"`);

const response1 = handleSecuritiesExtractorQuery(data, query1);
console.log(`Response: ${response1}`);

// Test general ISIN query
console.log('\nTesting general ISIN query:');
const query2 = 'What are the ISINs?';
console.log(`Query: "${query2}"`);

const response2 = handleSecuritiesExtractorQuery(data, query2);
console.log(`Response: ${response2}`);
