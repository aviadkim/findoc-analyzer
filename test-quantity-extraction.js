/**
 * Test script for enhanced security quantity extraction
 * 
 * Tests the improved quantity extraction functionality with various financial document data
 */

const fs = require('fs');
const path = require('path');
// Use more targeted approach with direct function import
const enhancedExtractor = require('./services/enhanced-securities-extractor-v2');

// Create a test version of the extraction function
async function extractSecurities(content) {
  const { text } = content;
  
  // Simplified extraction for testing quantity functionality
  const securities = [];
  
  // Find ISIN
  const isinRegex = /[A-Z]{2}[A-Z0-9]{9}[0-9]/g;
  const isins = text.match(isinRegex) || [];
  
  if (isins.length > 0) {
    const isin = isins[0];
    const name = text.match(/\n([A-Z][A-Za-z0-9\s\.\,\-\&\(\)\/]{5,60})\n/) ? 
      text.match(/\n([A-Z][A-Za-z0-9\s\.\,\-\&\(\)\/]{5,60})\n/)[1] : 
      `Security with ISIN ${isin}`;
      
    // Extract price and value first (to help quantity calculation)
    const priceMatch = text.match(/Price:?\s*\$?([0-9\,\.]+)/i);
    const price = priceMatch ? parseFloat(priceMatch[1].replace(/,/g, '')) : null;
    
    const valueMatch = text.match(/Value:?\s*\$?([0-9\,\.]+)/i) || 
                      text.match(/Market Value:?\s*\$?([0-9\,\.]+)/i) ||
                      text.match(/Total:?\s*\$?([0-9\,\.]+)/i);
    const value = valueMatch ? parseFloat(valueMatch[1].replace(/,/g, '')) : null;
    
    // Extract quantity - this is what we're really testing
    const quantity = enhancedExtractor.findSecurityQuantity(text, isin, name, value, price);
    
    securities.push({
      isin,
      name,
      quantity,
      price,
      value
    });
  }
  
  return securities;
}

// Test data
const testCases = [
  {
    name: "Simple quantity with shares label",
    text: "ISIN: US5949181045\nMicrosoft Corporation\nQuantity: 100 shares\nPrice: $350.45\nValue: $35,045.00",
    expectedQuantity: 100
  },
  {
    name: "Quantity with calculation validation",
    text: "ISIN: US0231351067\nAmazon.com Inc.\nPrice per share: $125.78\nMarket Value: $25,156.00",
    expectedQuantity: 200 // Should calculate from value/price
  },
  {
    name: "European format with units",
    text: "ISIN: DE000BASF111\nBASF AG\n1.000,00 units\nPrice: 48,75 EUR\nValue: 48.750,00 EUR",
    expectedQuantity: 1000
  },
  {
    name: "Quantity with discrepancy resolution",
    text: "ISIN: US88160R1014\nTesla Inc.\nQuantity: 50 shares\nPrice: $220.00\nTotal Value: $22,000.00",
    expectedQuantity: 100 // Should resolve discrepancy and find that value/(price) = 100
  },
  {
    name: "Quantity in parentheses",
    text: "US4592001014, IBM, (500 shares), $138.45, $69,225.00",
    expectedQuantity: 500
  },
  {
    name: "Quantity near indicator",
    text: "ISIN: GB00B03MLX29\nRoyal Dutch Shell PLC\nShares 750\nPrice: £22.15\nValue: £16,612.50",
    expectedQuantity: 750
  },
  {
    name: "Multiple quantity candidates with validation",
    text: "ISIN: US67066G1040\nNVIDIA Corporation\nHolding: 25 shares\nLot size: 100\nMarket Price: $420.55\nTotal Value: $1,051,375.00",
    expectedQuantity: 2500 // Should recognize the lot size adjustment
  },
  {
    name: "Quantity implied from context",
    text: "Apple Inc.\nISIN: US0378331005\nThe position contains 325 shares at $180.00 per share with a total of $58,500.00",
    expectedQuantity: 325
  },
  {
    name: "Decimal quantity",
    text: "ISIN: CH0012032048\nRoche Holding AG\nHolding: 10.5 units\nPrice: CHF 267.50\nMarket Value: CHF 2,808.75",
    expectedQuantity: 10.5
  }
];

async function runTests() {
  console.log("ENHANCED QUANTITY EXTRACTION TEST\n");
  console.log("==================================\n");
  
  let passCount = 0;
  
  for (const testCase of testCases) {
    console.log(`Test: ${testCase.name}`);
    
    // Create content object with text
    const content = {
      text: testCase.text,
      tables: []
    };
    
    try {
      // Extract securities
      const securities = await extractSecurities(content);
      
      if (securities.length === 0) {
        console.log("  FAIL: No securities extracted");
        console.log(`  Expected quantity: ${testCase.expectedQuantity}`);
        console.log("  Actual: None\n");
        continue;
      }
      
      const security = securities[0];
      console.log(`  Security: ${security.name || security.isin}`);
      console.log(`  Extracted quantity: ${security.quantity}`);
      console.log(`  Expected quantity: ${testCase.expectedQuantity}`);
      
      const quantityMatch = Math.abs((security.quantity - testCase.expectedQuantity) / testCase.expectedQuantity) < 0.01;
      
      if (quantityMatch) {
        console.log("  PASS ✓");
        passCount++;
      } else {
        console.log("  FAIL ✗");
      }
      
      if (security.price !== null) {
        console.log(`  Price: ${security.price}`);
      }
      
      if (security.value !== null) {
        console.log(`  Value: ${security.value}`);
      }
      
      console.log("");
    } catch (error) {
      console.error(`  ERROR: ${error.message}`);
      console.log("");
    }
  }
  
  // Summary
  console.log("==================================");
  console.log(`SUMMARY: ${passCount}/${testCases.length} tests passed`);
  console.log(`Success rate: ${((passCount / testCases.length) * 100).toFixed(2)}%`);
}

runTests().catch(console.error);