/**
 * Simplified test for quantity extraction
 */

// Define the findSecurityQuantity function with our enhanced implementation
function findSecurityQuantity(text, isin, name, value = null, price = null) {
  try {
    console.log(`Finding quantity for ${name || isin} with value=${value}, price=${price}`);
    
    // If we have price and value, we can calculate quantity directly
    let calculatedQuantity = null;
    if (price !== null && price > 0 && value !== null) {
      calculatedQuantity = value / price;
      console.log(`Calculated quantity from price/value: ${calculatedQuantity}`);
    }
    
    // Extract potential quantities with confidence scores
    const extractedQuantities = [];
    
    // Create context window for more focused extraction
    let contextText = text;
    
    // Define more precise quantity patterns with confidence scores
    const quantityPatterns = [
      // High confidence patterns - explicitly labeled quantities
      { 
        pattern: /(?:quantity|number of shares|shares|units|volume)[\s\:\-]*(\d[\d\,\'\`\.\s]*\d|\d)(?![\%\$\€\£])/i,
        confidence: 0.95
      },
      { 
        pattern: /(?:holding|position)[\s\:\-]*(\d[\d\,\'\`\.\s]*\d|\d)(?![\%\$\€\£])\s*(?:shares|units|pieces)/i,
        confidence: 0.9
      },
      // Quantity followed by shares/units - medium-high confidence
      { 
        pattern: /(\d[\d\,\'\`\.\s]*\d|\d)(?![\%\$\€\£])\s*(?:shares|units|pieces|pcs)/i,
        confidence: 0.85
      },
      // Quantity in parentheses with share indicator - medium-high confidence
      { 
        pattern: /\((\d[\d\,\'\`\.\s]*\d|\d)\s*(?:shares|units|pieces|pcs)\)/i,
        confidence: 0.8
      },
      // Quantity in parentheses - medium confidence
      { 
        pattern: /\((\d[\d\,\'\`\.\s]*\d|\d)\)/i,
        confidence: 0.7
      },
      // Quantity after text with shares/units - medium confidence
      { 
        pattern: /(?:contains|has|with)\s+(\d[\d\,\'\`\.\s]*\d|\d)\s+(?:shares|units|pieces|pcs)/i,
        confidence: 0.8
      },
      // Handle exact European format with decimal comma
      { 
        pattern: /(\d{1,3}(?:\.\d{3})*\,\d{1,2})\s*(?:shares|units|pieces|pcs)/i,
        confidence: 0.9
      }
    ];
    
    // First collect all potential quantities from patterns
    for (const { pattern, confidence } of quantityPatterns) {
      const matches = [...contextText.matchAll(new RegExp(pattern, 'g'))];
      
      for (const match of matches) {
        const rawQuantity = match[1];
        const clean = rawQuantity.replace(/[\,\'\`\s]/g, '').replace(/\,/g, '.');
        const number = parseFloat(clean);
        
        // Basic validation
        if (!isNaN(number) && number > 0 && isReasonableQuantity(number)) {
          extractedQuantities.push({
            quantity: number,
            confidence: confidence,
            pattern: pattern.toString().substring(0, 30) + '...'
          });
        }
      }
    }
    
    // Search for numbers near specific quantity indicators
    const quantityIndicators = ['shares', 'units', 'quantity', 'holding', 'amount', 'pieces', 'pcs', 'qty', 'volume'];
    for (const indicator of quantityIndicators) {
      if (contextText.toLowerCase().includes(indicator)) {
        const indicatorIndex = contextText.toLowerCase().indexOf(indicator);
        
        // Look for numbers in close proximity
        const surroundingText = contextText.substring(
          Math.max(0, indicatorIndex - 30), 
          Math.min(contextText.length, indicatorIndex + indicator.length + 50)
        );
        
        console.log(`Looking near indicator '${indicator}': "${surroundingText.substring(0, 50)}..."`);
        
        // Try different number patterns
        const numberPatterns = [
          /(\d[\d\,\'\`\s]*\.\d+)/, // Decimal number
          /(\d[\d\,\'\`\s]+)(?!\.\d)/, // Whole number with separators
          /(\d+)(?!\.\d)/ // Simple whole number
        ];
        
        for (const pattern of numberPatterns) {
          const matches = [...surroundingText.matchAll(new RegExp(pattern, 'g'))];
          
          for (const match of matches) {
            const rawQuantity = match[1];
            const clean = rawQuantity.replace(/[\,\'\`\s]/g, '');
            const number = parseFloat(clean);
            
            if (!isNaN(number) && number > 0 && isReasonableQuantity(number)) {
              console.log(`Found number ${number} near '${indicator}'`);
              
              extractedQuantities.push({
                quantity: number,
                confidence: 0.85,
                pattern: `Near '${indicator}'`
              });
            }
          }
        }
      }
    }
    
    // Process the collected quantities
    if (extractedQuantities.length > 0) {
      console.log(`Found ${extractedQuantities.length} potential quantities`);
      for (const q of extractedQuantities.slice(0, 3)) {
        console.log(`  - ${q.quantity} (confidence: ${q.confidence.toFixed(2)}, pattern: ${q.pattern})`);
      }
      
      // Sort by confidence (highest first)
      extractedQuantities.sort((a, b) => b.confidence - a.confidence);
      
      // Get the highest confidence quantity
      const bestQuantity = extractedQuantities[0].quantity;
      
      // If we have a calculated quantity from price and value, cross-validate
      if (calculatedQuantity !== null) {
        // Compare with calculated quantity (within 10% margin of error)
        const ratio = bestQuantity / calculatedQuantity;
        
        if (ratio > 0.9 && ratio < 1.1) {
          // Very close match, high confidence
          console.log(`Found matching quantity: ${bestQuantity} (calculated: ${calculatedQuantity})`);
          return bestQuantity;
        } else {
          console.log(`Quantity discrepancy: extracted=${bestQuantity}, calculated=${calculatedQuantity}, ratio=${ratio}`);
          
          // Check if the discrepancy might be due to lot size
          const lotSizes = [10, 100, 1000];
          for (const lotSize of lotSizes) {
            const adjustedRatio = (bestQuantity * lotSize) / calculatedQuantity;
            if (adjustedRatio > 0.9 && adjustedRatio < 1.1) {
              return bestQuantity * lotSize;
            }
          }
          
          // If no lot size match, favor calculated quantity for high confidence
          if (value !== null && price !== null) {
            return Math.round(calculatedQuantity * 100) / 100; // Round to 2 decimal places
          } else {
            return bestQuantity;
          }
        }
      }
      
      return bestQuantity;
    }
    
    // Last resort: If we have price and value but couldn't extract quantity
    if (value !== null && price !== null && price > 0) {
      const calculated = value / price;
      if (isReasonableQuantity(calculated)) {
        return Math.round(calculated * 100) / 100; // Round to 2 decimal places
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error finding security quantity:', error);
    return null;
  }
}

/**
 * Check if a quantity seems reasonable for a security
 */
function isReasonableQuantity(quantity) {
  if (quantity <= 0) return false;
  if (quantity > 10000000) return false;
  return true;
}

// Test cases for quantity extraction
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

// Run tests
function runTests() {
  console.log("ENHANCED QUANTITY EXTRACTION TEST\n");
  console.log("==================================\n");
  
  let passCount = 0;
  
  for (const testCase of testCases) {
    console.log(`Test: ${testCase.name}`);
    
    try {
      // Extract ISIN from test case
      const isinMatch = testCase.text.match(/[A-Z]{2}[A-Z0-9]{9}[0-9]/);
      const isin = isinMatch ? isinMatch[0] : "US0000000000";
      
      // Extract name from test case
      const nameMatch = testCase.text.match(/\n([A-Z][A-Za-z0-9\s\.\,\-\&\(\)]+)/);
      const name = nameMatch ? nameMatch[1].trim() : null;
      
      // Extract price from test case
      const priceMatch = testCase.text.match(/Price:?\s*\$?([0-9\,\.]+)/i);
      const price = priceMatch ? parseFloat(priceMatch[1].replace(/,/g, '')) : null;
      
      // Extract value from test case
      const valueMatch = testCase.text.match(/Value:?\s*\$?([0-9\,\.]+)/i) || 
                       testCase.text.match(/Market Value:?\s*\$?([0-9\,\.]+)/i) ||
                       testCase.text.match(/Total Value:?\s*\$?([0-9\,\.]+)/i) ||
                       testCase.text.match(/Total:?\s*\$?([0-9\,\.]+)/i);
      const value = valueMatch ? parseFloat(valueMatch[1].replace(/,/g, '')) : null;
      
      console.log(`  Extracted ISIN: ${isin}, Name: ${name}, Price: ${price}, Value: ${value}`);
      
      // Test quantity extraction
      const extractedQuantity = findSecurityQuantity(testCase.text, isin, name, value, price);
      console.log(`  Extracted quantity: ${extractedQuantity}`);
      console.log(`  Expected quantity: ${testCase.expectedQuantity}`);
      
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