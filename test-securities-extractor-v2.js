/**
 * Enhanced Securities Extractor Test Script
 * 
 * This script compares the original securities extractor with the enhanced v2 version
 * focusing on value extraction improvements.
 */

const fs = require('fs');
const path = require('path');
const { extractSecurities: extractSecuritiesOriginal } = require('./services/securities-extractor');
const { extractSecurities: extractSecuritiesEnhanced } = require('./services/enhanced-securities-extractor-v2');

// Sample financial document content
let content = null;

async function loadTestData() {
  try {
    // Load the test data from the sample file
    const testFilePath = './test-financial-document.txt';
    if (fs.existsSync(testFilePath)) {
      const text = fs.readFileSync(testFilePath, 'utf8');
      
      // Create a sample table from the financial document format
      const table = {
        title: "SECURITIES HOLDINGS",
        headers: ["ISIN", "Name", "Type", "Quantity", "Price", "Value", "Weight"],
        rows: extractTableFromText(text)
      };
      
      content = {
        text,
        tables: [table],
        financialData: {
          portfolioInfo: {
            title: "INVESTMENT PORTFOLIO STATEMENT",
            date: "April 27, 2025",
            totalValue: 43167.50,
            currency: 'USD'
          }
        }
      };
      console.log('Loaded test data from test-financial-document.txt');
    } else {
      console.error('Test file not found');
      process.exit(1);
    }
    
    // Log the data size for debugging
    console.log(`Test data contains ${content.text ? content.text.length : 0} characters of text and ${content.tables && content.tables.length ? content.tables.length : 0} tables`);
  } catch (error) {
    console.error('Error loading test data:', error);
    process.exit(1);
  }
}

/**
 * Extract table data from the formatted text
 */
function extractTableFromText(text) {
  const rows = [];
  const lines = text.split('\n');
  
  let currentSecurity = null;
  let isin = null;
  let name = null;
  let type = null;
  let quantity = null;
  let price = null;
  let value = null;
  let weight = null;
  
  for (const line of lines) {
    const trimmed = line.trim();
    
    // Check for ISIN
    if (trimmed.startsWith('ISIN:')) {
      isin = trimmed.split('ISIN:')[1].trim();
    }
    
    // Check if this is a new security entry (starts with a number followed by a dot)
    if (/^\d+\.\s+[A-Z]/.test(trimmed)) {
      // If we have a previous security, add it to the rows
      if (isin !== null) {
        rows.push([isin, name, type, quantity, price, value, weight]);
      }
      
      // Start a new security
      name = trimmed.split(/^\d+\.\s+/)[1].trim();
      isin = null;
      type = null;
      quantity = null;
      price = null;
      value = null;
      weight = null;
    }
    
    // Check for Type
    if (trimmed.startsWith('Type:')) {
      type = trimmed.split('Type:')[1].trim();
    }
    
    // Check for Quantity/Shares/Units/Amount
    if (trimmed.startsWith('Quantity:')) {
      quantity = trimmed.split('Quantity:')[1].trim();
    } else if (trimmed.startsWith('Shares:')) {
      quantity = trimmed.split('Shares:')[1].trim();
    } else if (trimmed.startsWith('Units:')) {
      quantity = trimmed.split('Units:')[1].trim();
    } else if (trimmed.startsWith('Amount:')) {
      quantity = trimmed.split('Amount:')[1].trim();
    }
    
    // Check for Price/Rate/Unit Price
    if (trimmed.startsWith('Price:')) {
      price = trimmed.split('Price:')[1].trim();
    } else if (trimmed.startsWith('Rate:')) {
      price = trimmed.split('Rate:')[1].trim();
    } else if (trimmed.startsWith('Unit Price:')) {
      price = trimmed.split('Unit Price:')[1].trim();
    }
    
    // Check for Value/Total Value/Market Value/Position Value
    if (trimmed.startsWith('Value:')) {
      value = trimmed.split('Value:')[1].trim();
    } else if (trimmed.startsWith('Total Value:')) {
      value = trimmed.split('Total Value:')[1].trim();
    } else if (trimmed.startsWith('Market Value:')) {
      value = trimmed.split('Market Value:')[1].trim();
    } else if (trimmed.startsWith('Position Value:')) {
      value = trimmed.split('Position Value:')[1].trim();
    }
    
    // Check for Weight/Allocation/% of Assets
    if (trimmed.startsWith('Weight:')) {
      weight = trimmed.split('Weight:')[1].trim();
    } else if (trimmed.startsWith('Allocation:')) {
      weight = trimmed.split('Allocation:')[1].trim();
    } else if (trimmed.startsWith('% of Assets:')) {
      weight = trimmed.split('% of Assets:')[1].trim();
    }
  }
  
  // Add the last security
  if (isin !== null) {
    rows.push([isin, name, type, quantity, price, value, weight]);
  }
  
  return rows;
}

async function runTest() {
  try {
    console.log('Running extraction test...');
    
    // Extract securities using original extractor
    console.log('Running original extractor...');
    console.time('original-extraction');
    const originalSecurities = await extractSecuritiesOriginal(content);
    console.timeEnd('original-extraction');
    
    // Extract securities using enhanced extractor
    console.log('Running enhanced extractor v2...');
    console.time('enhanced-extraction-v2');
    const enhancedSecurities = await extractSecuritiesEnhanced(content);
    console.timeEnd('enhanced-extraction-v2');
    
    // Compare results
    console.log('\nExtraction Results:');
    console.log('-------------------');
    console.log(`Original Extractor: ${originalSecurities.length} securities found`);
    console.log(`Enhanced Extractor: ${enhancedSecurities.length} securities found`);
    
    // Count securities with ISINs
    const originalWithIsins = originalSecurities.filter(s => s.isin).length;
    const enhancedWithIsins = enhancedSecurities.filter(s => s.isin).length;
    
    console.log(`\nSecurities with ISINs:`);
    console.log(`Original: ${originalWithIsins} (${Math.round(originalWithIsins / originalSecurities.length * 100)}%)`);
    console.log(`Enhanced: ${enhancedWithIsins} (${Math.round(enhancedWithIsins / enhancedSecurities.length * 100)}%)`);
    
    // Count securities with names
    const originalWithNames = originalSecurities.filter(s => s.name && s.name !== `Security with ISIN ${s.isin}`).length;
    const enhancedWithNames = enhancedSecurities.filter(s => s.name && s.name !== `Security with ISIN ${s.isin}`).length;
    
    console.log(`\nSecurities with proper names:`);
    console.log(`Original: ${originalWithNames} (${Math.round(originalWithNames / originalSecurities.length * 100)}%)`);
    console.log(`Enhanced: ${enhancedWithNames} (${Math.round(enhancedWithNames / enhancedSecurities.length * 100)}%)`);
    
    // Count securities with prices
    const originalWithPrices = originalSecurities.filter(s => s.price !== null && s.price !== undefined).length;
    const enhancedWithPrices = enhancedSecurities.filter(s => s.price !== null).length;
    
    console.log(`\nSecurities with prices:`);
    console.log(`Original: ${originalWithPrices} (${Math.round(originalWithPrices / originalSecurities.length * 100)}%)`);
    console.log(`Enhanced: ${enhancedWithPrices} (${Math.round(enhancedWithPrices / enhancedSecurities.length * 100)}%)`);
    
    // Count securities with values
    const originalWithValues = originalSecurities.filter(s => s.value !== null && s.value !== undefined).length;
    const enhancedWithValues = enhancedSecurities.filter(s => s.value !== null).length;
    
    console.log(`\nSecurities with values:`);
    console.log(`Original: ${originalWithValues} (${Math.round(originalWithValues / originalSecurities.length * 100)}%)`);
    console.log(`Enhanced: ${enhancedWithValues} (${Math.round(enhancedWithValues / enhancedSecurities.length * 100)}%)`);
    
    // Calculate improvement percentage
    const valueImprovement = originalWithValues > 0 
      ? Math.round((enhancedWithValues - originalWithValues) / originalWithValues * 100)
      : 'N/A';
    
    const priceImprovement = originalWithPrices > 0
      ? Math.round((enhancedWithPrices - originalWithPrices) / originalWithPrices * 100)
      : 'N/A';
    
    const nameImprovement = originalWithNames > 0
      ? Math.round((enhancedWithNames - originalWithNames) / originalWithNames * 100)
      : 'N/A';
    
    console.log(`\nImprovement in name extraction: ${nameImprovement}%`);
    console.log(`Improvement in price extraction: ${priceImprovement}%`);
    console.log(`Improvement in value extraction: ${valueImprovement}%`);
    
    // Get a combined score
    let overallImprovement = 0;
    let totalMetrics = 0;
    
    if (nameImprovement !== 'N/A') {
      overallImprovement += nameImprovement;
      totalMetrics++;
    }
    
    if (priceImprovement !== 'N/A') {
      overallImprovement += priceImprovement;
      totalMetrics++;
    }
    
    if (valueImprovement !== 'N/A') {
      overallImprovement += valueImprovement;
      totalMetrics++;
    }
    
    const averageImprovement = totalMetrics > 0 ? Math.round(overallImprovement / totalMetrics) : 'N/A';
    console.log(`\nOverall improvement: ${averageImprovement}%`);
    
    // Save detailed results to file
    const results = {
      originalSecurities,
      enhancedSecurities,
      stats: {
        originalCount: originalSecurities.length,
        enhancedCount: enhancedSecurities.length,
        originalWithIsins,
        enhancedWithIsins,
        originalWithNames,
        enhancedWithNames,
        originalWithPrices,
        enhancedWithPrices,
        originalWithValues,
        enhancedWithValues,
        nameImprovement,
        priceImprovement,
        valueImprovement,
        averageImprovement
      },
      comparison: compareSecuritiesData(originalSecurities, enhancedSecurities)
    };
    
    fs.writeFileSync('securities-extractor-comparison-v2.json', JSON.stringify(results, null, 2));
    console.log('\nDetailed results saved to securities-extractor-comparison-v2.json');
    
    // Print ISIN and value comparison
    console.log('\nISIN and Value Comparison (sample):');
    console.log('--------------------------------');
    
    // Get shared ISINs
    const originalIsins = new Set(originalSecurities.filter(s => s.isin).map(s => s.isin));
    const enhancedIsins = new Set(enhancedSecurities.filter(s => s.isin).map(s => s.isin));
    
    const sharedIsins = [...originalIsins].filter(isin => enhancedIsins.has(isin));
    const sampleIsins = sharedIsins.slice(0, Math.min(5, sharedIsins.length));
    
    for (const isin of sampleIsins) {
      const original = originalSecurities.find(s => s.isin === isin);
      const enhanced = enhancedSecurities.find(s => s.isin === isin);
      
      console.log(`ISIN: ${isin}`);
      console.log(`  Name (Original): ${original.name || 'N/A'}`);
      console.log(`  Name (Enhanced): ${enhanced.name || 'N/A'}`);
      console.log(`  Value (Original): ${original.value !== null && original.value !== undefined ? original.value : 'N/A'}`);
      console.log(`  Value (Enhanced): ${enhanced.value !== null ? enhanced.value : 'N/A'}`);
      console.log(`  Price (Original): ${original.price !== null && original.price !== undefined ? original.price : 'N/A'}`);
      console.log(`  Price (Enhanced): ${enhanced.price !== null ? enhanced.price : 'N/A'}`);
      console.log('');
    }
    
    // Print securities that were only found by the enhanced extractor
    const newIsins = [...enhancedIsins].filter(isin => !originalIsins.has(isin));
    
    if (newIsins.length > 0) {
      console.log('\nSecurities found only by enhanced extractor:');
      console.log('------------------------------------------');
      
      for (const isin of newIsins.slice(0, Math.min(5, newIsins.length))) {
        const security = enhancedSecurities.find(s => s.isin === isin);
        console.log(`ISIN: ${isin}`);
        console.log(`  Name: ${security.name || 'N/A'}`);
        console.log(`  Value: ${security.value !== null ? security.value : 'N/A'}`);
        console.log(`  Price: ${security.price !== null ? security.price : 'N/A'}`);
        console.log('');
      }
      
      if (newIsins.length > 5) {
        console.log(`...and ${newIsins.length - 5} more`);
      }
    }
    
    // Print validation summary
    console.log('\nData Quality Check:');
    console.log('-----------------');
    const originalValidValues = originalSecurities.filter(s => s.value !== null && 
                                                         s.value !== undefined && 
                                                         !Number.isNaN(s.value) && 
                                                         s.value > 0 && 
                                                         s.value < 1000000000).length;
    
    const enhancedValidValues = enhancedSecurities.filter(s => s.value !== null && 
                                                         !Number.isNaN(s.value) && 
                                                         s.value > 0 && 
                                                         s.value < 1000000000).length;
    
    console.log(`Original extractor valid values: ${originalValidValues} (${Math.round(originalValidValues / originalSecurities.length * 100)}%)`);
    console.log(`Enhanced extractor valid values: ${enhancedValidValues} (${Math.round(enhancedValidValues / enhancedSecurities.length * 100)}%)`);
    
    const validValueImprovement = originalValidValues > 0
      ? Math.round((enhancedValidValues - originalValidValues) / originalValidValues * 100)
      : 'N/A';
      
    console.log(`Improvement in valid values: ${validValueImprovement}%`);
  } catch (error) {
    console.error('Error running test:', error);
  }
}

/**
 * Compare securities data between original and enhanced extractors
 */
function compareSecuritiesData(originalSecurities, enhancedSecurities) {
  const originalMap = new Map(originalSecurities.filter(s => s.isin).map(s => [s.isin, s]));
  const enhancedMap = new Map(enhancedSecurities.filter(s => s.isin).map(s => [s.isin, s]));
  
  const comparison = [];
  
  // Compare all ISINs from both extractors
  const allIsins = new Set([...originalMap.keys(), ...enhancedMap.keys()]);
  
  for (const isin of allIsins) {
    const original = originalMap.get(isin);
    const enhanced = enhancedMap.get(isin);
    
    let valueImproved = false;
    let priceImproved = false;
    let nameImproved = false;
    
    if (original && enhanced) {
      // Check if name improved
      nameImproved = !isProperName(original.name) && isProperName(enhanced.name);
      
      // Check if value improved
      valueImproved = checkValueImproved(
        original.value !== undefined ? original.value : null, 
        enhanced.value
      );
      
      // Check if price improved
      priceImproved = checkPriceImproved(
        original.price !== undefined ? original.price : null, 
        enhanced.price
      );
    }
    
    comparison.push({
      isin,
      inOriginal: !!original,
      inEnhanced: !!enhanced,
      original: original || null,
      enhanced: enhanced || null,
      // For securities in both, analyze differences
      differences: original && enhanced ? {
        nameChanged: original.name !== enhanced.name,
        valueChanged: original.value !== enhanced.value,
        priceChanged: original.price !== enhanced.price,
        nameImproved,
        valueImproved,
        priceImproved
      } : null
    });
  }
  
  // Analyze overall improvements
  const inBoth = comparison.filter(c => c.inOriginal && c.inEnhanced);
  const valueImprovements = inBoth.filter(c => c.differences && c.differences.valueImproved).length;
  const priceImprovements = inBoth.filter(c => c.differences && c.differences.priceImproved).length;
  const nameImprovements = inBoth.filter(c => c.differences && c.differences.nameImproved).length;
  
  console.log('\nDetailed Comparison:');
  console.log(`Securities in both extractors: ${inBoth.length}`);
  console.log(`Securities with improved names: ${nameImprovements} (${inBoth.length > 0 ? Math.round(nameImprovements / inBoth.length * 100) : 0}%)`);
  console.log(`Securities with improved prices: ${priceImprovements} (${inBoth.length > 0 ? Math.round(priceImprovements / inBoth.length * 100) : 0}%)`);
  console.log(`Securities with improved values: ${valueImprovements} (${inBoth.length > 0 ? Math.round(valueImprovements / inBoth.length * 100) : 0}%)`);
  
  return {
    securities: comparison,
    summary: {
      total: comparison.length,
      inBoth: inBoth.length,
      onlyInOriginal: comparison.filter(c => c.inOriginal && !c.inEnhanced).length,
      onlyInEnhanced: comparison.filter(c => !c.inOriginal && c.inEnhanced).length,
      nameImprovements,
      priceImprovements,
      valueImprovements
    }
  };
}

/**
 * Check if a name is proper (not just "Security with ISIN...")
 */
function isProperName(name) {
  if (!name) return false;
  return !name.startsWith('Security with ISIN');
}

/**
 * Check if the value extraction has improved
 */
function checkValueImproved(originalValue, enhancedValue) {
  if (originalValue === null && enhancedValue !== null) {
    return true;
  }
  
  if (originalValue !== null && enhancedValue !== null) {
    // If both values are present, check if the enhanced value seems more reasonable
    const originalStr = originalValue.toString();
    const enhancedStr = enhancedValue.toString();
    
    // More precise (has decimal points)
    if (!originalStr.includes('.') && enhancedStr.includes('.')) {
      return true;
    }
    
    // Check for suspiciously large values in original that might be ISIN numbers
    if (originalValue > 1000000000 && enhancedValue < 1000000000) {
      return true;
    }
    
    // Check for very small values that might be missing decimal places
    if (originalValue < 100 && enhancedValue > originalValue * 10) {
      return true;
    }
  }
  
  return false;
}

/**
 * Check if the price extraction has improved
 */
function checkPriceImproved(originalPrice, enhancedPrice) {
  if (originalPrice === null && enhancedPrice !== null) {
    return true;
  }
  
  if (originalPrice !== null && enhancedPrice !== null) {
    // If both prices are present, check if the enhanced price seems more reasonable
    const originalStr = originalPrice.toString();
    const enhancedStr = enhancedPrice.toString();
    
    // More precise (has decimal points)
    if (!originalStr.includes('.') && enhancedStr.includes('.')) {
      return true;
    }
    
    // Suspicious values
    if (originalPrice > 10000 && enhancedPrice < 10000) {
      return true;
    }
    
    // Check for very small values that might be missing decimal places
    if (originalPrice < 10 && enhancedPrice > originalPrice * 5) {
      return true;
    }
  }
  
  return false;
}

// Run the test
(async () => {
  await loadTestData();
  await runTest();
})();