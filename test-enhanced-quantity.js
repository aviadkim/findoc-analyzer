/**
 * Test for Enhanced Quantity Extractor
 * 
 * Comprehensive tests for the improved quantity extraction from financial documents.
 */

const { extractQuantity } = require('./services/enhanced-quantity-extractor');

// Standard test cases
const testCases = [
  {
    name: "Simple quantity with shares label",
    text: "ISIN: US5949181045\nMicrosoft Corporation\nQuantity: 100 shares\nPrice: $350.45\nValue: $35,045.00",
    isin: "US5949181045",
    name: "Microsoft Corporation",
    price: 350.45,
    value: 35045.00,
    expectedQuantity: 100
  },
  {
    name: "Quantity with calculation validation",
    text: "ISIN: US0231351067\nAmazon.com Inc.\nPrice per share: $125.78\nMarket Value: $25,156.00",
    isin: "US0231351067",
    name: "Amazon.com Inc.",
    price: 125.78,
    value: 25156.00,
    expectedQuantity: 200
  },
  {
    name: "European format with units",
    text: "ISIN: DE000BASF111\nBASF AG\n1.000,00 units\nPrice: 48,75 EUR\nValue: 48.750,00 EUR",
    isin: "DE000BASF111",
    name: "BASF AG",
    price: 48.75,
    value: 48750.00,
    expectedQuantity: 1000
  },
  {
    name: "Quantity with discrepancy resolution",
    text: "ISIN: US88160R1014\nTesla Inc.\nQuantity: 50 shares\nPrice: $220.00\nTotal Value: $22,000.00",
    isin: "US88160R1014",
    name: "Tesla Inc.",
    price: 220.00,
    value: 22000.00,
    expectedQuantity: 100
  },
  {
    name: "Quantity in parentheses",
    text: "US4592001014, IBM, (500 shares), $138.45, $69,225.00",
    isin: "US4592001014",
    name: "IBM",
    price: 138.45,
    value: 69225.00,
    expectedQuantity: 500
  },
  {
    name: "Quantity near indicator",
    text: "ISIN: GB00B03MLX29\nRoyal Dutch Shell PLC\nShares 750\nPrice: £22.15\nValue: £16,612.50",
    isin: "GB00B03MLX29",
    name: "Royal Dutch Shell PLC",
    price: 22.15,
    value: 16612.50,
    expectedQuantity: 750
  },
  {
    name: "Multiple quantity candidates with validation",
    text: "ISIN: US67066G1040\nNVIDIA Corporation\nHolding: 25 shares\nLot size: 100\nMarket Price: $420.55\nTotal Value: $1,051,375.00",
    isin: "US67066G1040",
    name: "NVIDIA Corporation",
    price: 420.55,
    value: 1051375.00,
    expectedQuantity: 2500
  },
  {
    name: "Quantity implied from context",
    text: "Apple Inc.\nISIN: US0378331005\nThe position contains 325 shares at $180.00 per share with a total of $58,500.00",
    isin: "US0378331005",
    name: "Apple Inc.",
    price: 180.00,
    value: 58500.00,
    expectedQuantity: 325
  },
  {
    name: "Decimal quantity",
    text: "ISIN: CH0012032048\nRoche Holding AG\nHolding: 10.5 units\nPrice: CHF 267.50\nMarket Value: CHF 2,808.75",
    isin: "CH0012032048",
    name: "Roche Holding AG",
    price: 267.50,
    value: 2808.75,
    expectedQuantity: 10.5
  },
  {
    name: "Swiss format",
    text: "ISIN: CH0038863350\nNestlé S.A.\nPosition: 1'200 shares\nPrice: CHF 93.42\nValue: CHF 112'104.00",
    isin: "CH0038863350",
    name: "Nestlé S.A.",
    price: 93.42,
    value: 112104.00,
    expectedQuantity: 1200
  },
  {
    name: "Value calculation only",
    text: "ISIN: FR0000131104\nBNP Paribas\nMarket Value: EUR 5,600.00\nPrice: EUR 56.00",
    isin: "FR0000131104",
    name: "BNP Paribas",
    price: 56.00,
    value: 5600.00,
    expectedQuantity: 100
  }
];

// Run the tests
function runTests() {
  console.log("ENHANCED QUANTITY EXTRACTION TEST\n");
  console.log("==================================\n");
  
  let passCount = 0;
  
  for (const testCase of testCases) {
    try {
      console.log(`Test: ${testCase.name}`);
      
      // Extract the quantity
      const extractedQuantity = extractQuantity(
        testCase.text, 
        testCase.isin, 
        testCase.name,
        testCase.value,
        testCase.price
      );
      
      console.log(`  Extracted quantity: ${extractedQuantity}`);
      console.log(`  Expected quantity: ${testCase.expectedQuantity}`);
      
      // Check if the extraction matches the expected result
      // Allow a small margin of error (1%)
      const quantityMatch = extractedQuantity !== null && 
                          Math.abs((extractedQuantity - testCase.expectedQuantity) / testCase.expectedQuantity) < 0.01;
      
      if (quantityMatch) {
        console.log("  PASS ✓");
        passCount++;
      } else {
        console.log("  FAIL ✗");
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

runTests();