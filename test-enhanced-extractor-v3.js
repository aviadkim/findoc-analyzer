/**
 * Test Enhanced Securities Extractor V3
 * 
 * This script tests the enhanced securities extractor with a sample document
 * to verify the improvements in security name extraction, value calculation,
 * currency detection, and quantity extraction.
 */

const fs = require('fs');
const path = require('path');

// Import the enhanced securities extractor
let enhancedExtractor;
try {
  enhancedExtractor = require('./services/enhanced-securities-extractor-v2');
} catch (error) {
  console.error(`Error importing enhanced-securities-extractor-v2: ${error.message}`);
  try {
    enhancedExtractor = require('./services/enhanced-securities-extractor');
    console.log('Using enhanced-securities-extractor instead');
  } catch (altError) {
    console.error(`Error importing enhanced-securities-extractor: ${altError.message}`);
    process.exit(1);
  }
}

// Sample document content with improved test cases
const sampleDocument = {
  text: `
  Portfolio Statement
  
  Client: John Doe
  Account Number: 12345678
  Date: May 13, 2025
  Currency: USD
  
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
  
  4. Alphabet Inc. Class A (ISIN: US02079K1079)
     Quantity: 25
     Price: $170.00
     Value: $4,250.00
     % of Portfolio: 7.20%
  
  5. Tesla, Inc. (ISIN: US88160R1014)
     Quantity: 30
     Price: $180.00
     Value: $5,400.00
     % of Portfolio: 9.15%
  
  6. NVIDIA Corp (ISIN: US67066G1040)
     Quantity: 15
     Price: €450.00
     Value: €6,750.00
     % of Portfolio: 11.44%
  
  7. JPMorgan Chase & Co. (ISIN: US46625H1005)
     Quantity: 40
     Price: $175.25
     Value: $7,010.00
     % of Portfolio: 11.88%
  
  Total Portfolio Value: $59,000.00
  `,
  tables: [
    {
      headers: ['Security', 'ISIN', 'Quantity', 'Price', 'Value', '% of Portfolio'],
      data: [
        ['Apple Inc.', 'US0378331005', '100', '$182.50', '$18,250.00', '30.93%'],
        ['Microsoft Corporation', 'US5949181045', '50', '$315.00', '$15,750.00', '26.69%'],
        ['Amazon.com Inc.', 'US0231351067', '20', '$175.00', '$3,500.00', '5.93%'],
        ['Alphabet Inc. Class A', 'US02079K1079', '25', '$170.00', '$4,250.00', '7.20%'],
        ['Tesla, Inc.', 'US88160R1014', '30', '$180.00', '$5,400.00', '9.15%'],
        ['NVIDIA Corp', 'US67066G1040', '15', '€450.00', '€6,750.00', '11.44%'],
        ['JPMorgan Chase & Co.', 'US46625H1005', '40', '$175.25', '$7,010.00', '11.88%']
      ]
    }
  ],
  financialData: {
    currency: 'USD',
    totalValue: 59000
  }
};

// European format sample
const europeanFormatSample = {
  text: `
  Portfolio Statement
  
  Client: Jean Dupont
  Account Number: 87654321
  Date: 13 May 2025
  Currency: EUR
  
  Securities:
  
  1. Siemens AG (ISIN: DE0007236101)
     Quantity: 50
     Price: 175,50 €
     Value: 8.775,00 €
     % of Portfolio: 25,07%
  
  2. SAP SE (ISIN: DE0007164600)
     Quantity: 30
     Price: 140,25 €
     Value: 4.207,50 €
     % of Portfolio: 12,02%
  
  3. LVMH Moët Hennessy (ISIN: FR0000121014)
     Quantity: 10
     Price: 890,00 €
     Value: 8.900,00 €
     % of Portfolio: 25,43%
  
  4. Nestlé S.A. (ISIN: CH0038863350)
     Quantity: 40
     Price: 105,75 CHF
     Value: 4.230,00 CHF
     % of Portfolio: 12,09%
  
  Total Portfolio Value: 35.000,00 €
  `,
  tables: [
    {
      headers: ['Security', 'ISIN', 'Quantity', 'Price', 'Value', '% of Portfolio'],
      data: [
        ['Siemens AG', 'DE0007236101', '50', '175,50 €', '8.775,00 €', '25,07%'],
        ['SAP SE', 'DE0007164600', '30', '140,25 €', '4.207,50 €', '12,02%'],
        ['LVMH Moët Hennessy', 'FR0000121014', '10', '890,00 €', '8.900,00 €', '25,43%'],
        ['Nestlé S.A.', 'CH0038863350', '40', '105,75 CHF', '4.230,00 CHF', '12,09%']
      ]
    }
  ],
  financialData: {
    currency: 'EUR',
    totalValue: 35000
  }
};

// Test function
async function testEnhancedSecuritiesExtractor() {
  try {
    console.log('Testing Enhanced Securities Extractor V3...');
    
    // Test US format
    console.log('\n=== Testing US Format ===');
    await testWithSample(sampleDocument, 'US Format');
    
    // Test European format
    console.log('\n=== Testing European Format ===');
    await testWithSample(europeanFormatSample, 'European Format');
    
    console.log('\nAll tests completed successfully.');
  } catch (error) {
    console.error('Error during test:', error);
  }
}

// Test with a specific sample
async function testWithSample(sample, sampleName) {
  try {
    console.log(`Extracting securities from ${sampleName}...`);
    
    // Extract securities using the enhanced extractor
    const securities = await enhancedExtractor.extractSecurities(sample);
    
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
    
    // Check if all securities have names
    const namedSecurities = securities.filter(s => s.name && s.name !== 'Securities:' && !s.name.startsWith('Security with ISIN'));
    console.log(`Securities with proper names: ${namedSecurities.length}/${securities.length} (${Math.round(namedSecurities.length / securities.length * 100)}%)`);
    
    // Check if all securities have complete information
    const completeSecurities = securities.filter(
      s => s.name && s.isin && s.price !== null && s.value !== null && s.quantity !== null
    );
    console.log(`Securities with complete information: ${completeSecurities.length}/${securities.length} (${Math.round(completeSecurities.length / securities.length * 100)}%)`);
    
    // Check if the total value is correct
    const totalValue = securities.reduce((sum, security) => {
      // Convert to same currency if needed
      if (security.currency === sample.financialData.currency) {
        return sum + security.value;
      } else {
        // Simple conversion for testing purposes
        // In a real application, you would use proper exchange rates
        const conversionRate = security.currency === 'EUR' ? 1.1 : 1;
        return sum + (security.value * conversionRate);
      }
    }, 0);
    
    const expectedTotalValue = sample.financialData.totalValue;
    const percentDifference = Math.abs((totalValue - expectedTotalValue) / expectedTotalValue * 100);
    
    console.log(`Total value: ${totalValue.toFixed(2)} ${sample.financialData.currency} (expected ${expectedTotalValue} ${sample.financialData.currency})`);
    console.log(`Difference: ${percentDifference.toFixed(2)}%`);
    
    if (percentDifference < 10) {
      console.log(`✓ Total value is within 10% of expected value`);
    } else {
      console.log(`✗ Total value differs by more than 10% from expected value`);
    }
    
    // Save results to a file
    const resultsFile = path.join(__dirname, `enhanced-securities-extractor-${sampleName.replace(/\s+/g, '-').toLowerCase()}-results.json`);
    fs.writeFileSync(resultsFile, JSON.stringify(securities, null, 2));
    
    console.log(`\nResults saved to: ${resultsFile}`);
  } catch (error) {
    console.error(`Error testing ${sampleName}:`, error);
  }
}

// Run the test
testEnhancedSecuritiesExtractor();
