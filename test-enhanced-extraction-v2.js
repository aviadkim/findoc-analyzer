/**
 * Test Enhanced Financial Extraction v2
 * 
 * This script tests the enhanced financial data extraction with the improved securities extractor.
 */

const fs = require('fs');
const path = require('path');
const { processPdf } = require('./services/pdf-processor');
const { extractFinancialData: extractOriginal } = require('./services/financial-data-extractor');
const { extractFinancialData: extractEnhancedV2 } = require('./services/enhanced-financial-extractor-v2');

// Path to the test PDF
const pdfFile = path.join(__dirname, 'test-pdfs', 'messos.pdf');

// Function to compare and print two extraction results
function compareExtractions(original, enhanced) {
  console.log('\nExtraction Comparison:');
  console.log('====================');
  
  // Compare portfolio info
  console.log('\nPortfolio Info:');
  console.log(`Original: ${original.portfolioInfo.title || 'N/A'}`);
  console.log(`Enhanced: ${enhanced.portfolioInfo.title || 'N/A'}`);
  console.log(`Original date: ${original.portfolioInfo.date || 'N/A'}`);
  console.log(`Enhanced date: ${enhanced.portfolioInfo.date || 'N/A'}`);
  console.log(`Original total value: ${original.portfolioInfo.totalValue || 'N/A'} ${original.portfolioInfo.currency || 'USD'}`);
  console.log(`Enhanced total value: ${enhanced.portfolioInfo.totalValue || 'N/A'} ${enhanced.portfolioInfo.currency || 'USD'}`);
  
  // Compare asset allocation
  console.log('\nAsset Allocation:');
  console.log(`Original categories: ${original.assetAllocation.categories.length}`);
  console.log(`Enhanced categories: ${enhanced.assetAllocation.categories.length}`);
  
  // Compare securities
  console.log('\nSecurities:');
  console.log(`Original count: ${original.securities.length}`);
  console.log(`Enhanced count: ${enhanced.securities.length}`);
  
  // Count securities with values
  const originalWithValues = original.securities.filter(s => s.value !== null).length;
  const enhancedWithValues = enhanced.securities.filter(s => s.value !== null).length;
  console.log(`Original with values: ${originalWithValues} (${Math.round((originalWithValues / original.securities.length) * 100)}%)`);
  console.log(`Enhanced with values: ${enhancedWithValues} (${Math.round((enhancedWithValues / enhanced.securities.length) * 100)}%)`);
  
  // Count securities with prices
  const originalWithPrices = original.securities.filter(s => s.price !== null).length;
  const enhancedWithPrices = enhanced.securities.filter(s => s.price !== null).length;
  console.log(`Original with prices: ${originalWithPrices} (${Math.round((originalWithPrices / original.securities.length) * 100)}%)`);
  console.log(`Enhanced with prices: ${enhancedWithPrices} (${Math.round((enhancedWithPrices / enhanced.securities.length) * 100)}%)`);
  
  // Count securities with names (other than default ISIN names)
  const originalWithNames = original.securities.filter(s => s.name && !s.name.includes('Security with ISIN')).length;
  const enhancedWithNames = enhanced.securities.filter(s => s.name && !s.name.includes('Security with ISIN')).length;
  console.log(`Original with proper names: ${originalWithNames} (${Math.round((originalWithNames / original.securities.length) * 100)}%)`);
  console.log(`Enhanced with proper names: ${enhancedWithNames} (${Math.round((enhancedWithNames / enhanced.securities.length) * 100)}%)`);
  
  // Calculate overall improvement
  const originalNamePercentage = original.securities.length > 0 ? (originalWithNames / original.securities.length) * 100 : 0;
  const enhancedNamePercentage = enhanced.securities.length > 0 ? (enhancedWithNames / enhanced.securities.length) * 100 : 0;
  
  const originalValuePercentage = original.securities.length > 0 ? (originalWithValues / original.securities.length) * 100 : 0;
  const enhancedValuePercentage = enhanced.securities.length > 0 ? (enhancedWithValues / enhanced.securities.length) * 100 : 0;
  
  const originalPricePercentage = original.securities.length > 0 ? (originalWithPrices / original.securities.length) * 100 : 0;
  const enhancedPricePercentage = enhanced.securities.length > 0 ? (enhancedWithPrices / enhanced.securities.length) * 100 : 0;
  
  const overallImprovement = (
    (enhancedNamePercentage - originalNamePercentage) * 0.3 +
    (enhancedValuePercentage - originalValuePercentage) * 0.4 +
    (enhancedPricePercentage - originalPricePercentage) * 0.3
  );
  
  console.log(`\nOverall improvement: ${Math.round(overallImprovement)}%`);
  
  // Print first 5 securities from each
  console.log('\nSample Securities from Original:');
  for (let i = 0; i < Math.min(5, original.securities.length); i++) {
    const security = original.securities[i];
    console.log(`${i+1}. ${security.name || 'N/A'} (${security.isin || 'N/A'})`);
    console.log(`   Value: ${security.value !== null ? security.value : 'N/A'}, Price: ${security.price !== null ? security.price : 'N/A'}`);
  }
  
  console.log('\nSample Securities from Enhanced:');
  for (let i = 0; i < Math.min(5, enhanced.securities.length); i++) {
    const security = enhanced.securities[i];
    console.log(`${i+1}. ${security.name || 'N/A'} (${security.isin || 'N/A'})`);
    console.log(`   Value: ${security.value !== null ? security.value : 'N/A'}, Price: ${security.price !== null ? security.price : 'N/A'}`);
  }
}

// Main function to test the enhanced extraction
async function testEnhancedExtraction() {
  try {
    console.log(`Processing ${path.basename(pdfFile)}...`);
    
    // Process the PDF
    const pdfData = await processPdf(pdfFile, { useOcr: false });
    console.log(`Extracted ${pdfData.text.length} characters of text and ${pdfData.tables.length} tables`);
    
    // Extract ISINs using regex for reference
    const isinPattern = /[A-Z]{2}[A-Z0-9]{10}/g;
    const isinMatches = [...pdfData.text.matchAll(isinPattern)];
    const uniqueIsins = [...new Set(isinMatches.map(match => match[0]))];
    console.log(`Found ${uniqueIsins.length} unique ISINs in the text`);
    
    // Extract with original extractor
    console.log('\nExtracting with original extractor...');
    console.time('original-extraction');
    const originalResult = await extractOriginal(pdfData.text, pdfData.tables);
    console.timeEnd('original-extraction');
    
    // Extract with enhanced extractor v2
    console.log('\nExtracting with enhanced extractor v2...');
    console.time('enhanced-extraction-v2');
    const enhancedResult = await extractEnhancedV2(pdfData.text, pdfData.tables);
    console.timeEnd('enhanced-extraction-v2');
    
    // Compare the results
    compareExtractions(originalResult, enhancedResult);
    
    // Save results to JSON for further analysis
    const results = {
      pdfFile: path.basename(pdfFile),
      rawIsinCount: uniqueIsins.length,
      rawIsins: uniqueIsins,
      originalResult,
      enhancedResult
    };
    
    const outputFile = path.join(__dirname, `extraction-results-${path.basename(pdfFile, '.pdf')}.json`);
    fs.writeFileSync(outputFile, JSON.stringify(results, null, 2));
    console.log(`\nResults saved to ${outputFile}`);
    
  } catch (error) {
    console.error('Error testing enhanced extraction:', error);
  }
}

// Run the test
testEnhancedExtraction().catch(error => {
  console.error('Error:', error);
});