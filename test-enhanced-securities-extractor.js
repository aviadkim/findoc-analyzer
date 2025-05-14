/**
 * Test Enhanced Securities Extractor
 * 
 * This script tests the enhanced securities extractor with a sample document.
 */

const fs = require('fs');
const path = require('path');

// Import the enhanced securities extractor
const enhancedExtractor = require('./services/enhanced-securities-extractor-v2');

// Sample document content
const sampleDocument = {
  text: `
  Portfolio Statement
  
  Client: John Doe
  Account Number: 12345678
  Date: May 13, 2025
  
  Securities:
  
  1. Apple Inc. (ISIN: US0378331005)
     Quantity: 100
     Price: $182.50
     Value: $18,250.00
     % of Portfolio: 30.93%
  
  2. Microsoft Corporation (ISIN: US5949181045)
     Quantity: 50
     Price: $315.00
     Value: $15,750.00
     % of Portfolio: 26.69%
  
  3. Amazon.com Inc. (ISIN: US0231351067)
     Quantity: 20
     Price: $175.00
     Value: $3,500.00
     % of Portfolio: 5.93%
  
  4. Alphabet Inc. (ISIN: US02079K1079)
     Quantity: 25
     Price: $170.00
     Value: $4,250.00
     % of Portfolio: 7.20%
  
  5. Tesla Inc. (ISIN: US88160R1014)
     Quantity: 30
     Price: $180.00
     Value: $5,400.00
     % of Portfolio: 9.15%
  
  Total Portfolio Value: $59,000.00
  `,
  tables: [
    {
      headers: ['Security', 'ISIN', 'Quantity', 'Price', 'Value', '% of Portfolio'],
      data: [
        ['Apple Inc.', 'US0378331005', '100', '$182.50', '$18,250.00', '30.93%'],
        ['Microsoft Corporation', 'US5949181045', '50', '$315.00', '$15,750.00', '26.69%'],
        ['Amazon.com Inc.', 'US0231351067', '20', '$175.00', '$3,500.00', '5.93%'],
        ['Alphabet Inc.', 'US02079K1079', '25', '$170.00', '$4,250.00', '7.20%'],
        ['Tesla Inc.', 'US88160R1014', '30', '$180.00', '$5,400.00', '9.15%']
      ]
    }
  ],
  financialData: {}
};

// Test function
async function testEnhancedSecuritiesExtractor() {
  try {
    console.log('Testing Enhanced Securities Extractor...');
    
    // Extract securities using the enhanced extractor
    console.log('Extracting securities...');
    const securities = await enhancedExtractor.extractSecurities(sampleDocument);
    
    // Print results
    console.log(`\nExtracted ${securities.length} securities:`);
    securities.forEach((security, index) => {
      console.log(`\n${index + 1}. ${security.name} (${security.isin})`);
      console.log(`   Quantity: ${security.quantity}`);
      console.log(`   Price: ${security.price} ${security.currency || 'USD'}`);
      console.log(`   Value: ${security.value} ${security.currency || 'USD'}`);
      console.log(`   % of Portfolio: ${security.percentage}%`);
    });
    
    // Verify extraction
    console.log('\nVerifying extraction...');
    
    // Check if all securities were extracted
    const expectedCount = 5;
    if (securities.length === expectedCount) {
      console.log(`✓ Extracted ${expectedCount} securities as expected`);
    } else {
      console.log(`✗ Expected ${expectedCount} securities, but got ${securities.length}`);
    }
    
    // Check if all securities have complete information
    const completeSecurities = securities.filter(
      s => s.name && s.isin && s.price !== null && s.value !== null && s.quantity !== null
    );
    
    if (completeSecurities.length === expectedCount) {
      console.log(`✓ All securities have complete information`);
    } else {
      console.log(`✗ Expected ${expectedCount} securities with complete information, but got ${completeSecurities.length}`);
    }
    
    // Check if the total value is correct
    const totalValue = securities.reduce((sum, security) => sum + security.value, 0);
    const expectedTotalValue = 59000;
    
    if (Math.abs(totalValue - expectedTotalValue) < 1) {
      console.log(`✓ Total value is correct: ${totalValue} (expected ${expectedTotalValue})`);
    } else {
      console.log(`✗ Total value is incorrect: ${totalValue} (expected ${expectedTotalValue})`);
    }
    
    // Save results to a file
    const resultsFile = path.join(__dirname, 'enhanced-securities-extractor-results.json');
    fs.writeFileSync(resultsFile, JSON.stringify(securities, null, 2));
    
    console.log(`\nResults saved to: ${resultsFile}`);
    console.log('\nTest completed successfully.');
  } catch (error) {
    console.error('Error during test:', error);
  }
}

// Run the test
testEnhancedSecuritiesExtractor();
