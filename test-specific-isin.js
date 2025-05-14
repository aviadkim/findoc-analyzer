/**
 * Test script for specific ISIN query
 */

const { handleSecuritiesExtractorQuery } = require('./services/agent-handlers');

// Mock data
const data = {
  text: 'This is a test document with ISIN XS2761230684 for LUMINIS',
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
      }
    ]
  }
};

// Test specific ISIN query
console.log('Testing specific ISIN query:');
const query = 'What is the ISIN for LUMINIS?';
console.log(`Query: "${query}"`);

const response = handleSecuritiesExtractorQuery(data, query);
console.log(`Response: ${response}`);
