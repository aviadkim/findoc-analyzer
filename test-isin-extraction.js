/**
 * Test script for ISIN extraction
 */

const fs = require('fs');
const path = require('path');
const { processPdf } = require('./services/pdf-processor');
const { extractFinancialData } = require('./services/enhanced-financial-extractor');

// Path to the messos.pdf file
const pdfFile = path.join(__dirname, 'test-pdfs', 'messos.pdf');

async function testIsinExtraction() {
  try {
    console.log('Testing ISIN extraction for messos.pdf');
    
    // Process the PDF
    console.log('Processing PDF...');
    const pdfData = await processPdf(pdfFile);
    
    // Extract financial data
    console.log('Extracting financial data...');
    const financialData = await extractFinancialData(pdfData.text, pdfData.tables);
    
    // Extract ISINs from text
    console.log('\nExtracting ISINs from text:');
    const isinPattern = /[A-Z]{2}[A-Z0-9]{10}/g;
    const isinMatches = [...pdfData.text.matchAll(isinPattern)];
    
    if (isinMatches.length > 0) {
      console.log(`Found ${isinMatches.length} ISIN matches in text`);
      
      // Deduplicate ISINs
      const uniqueIsins = [...new Set(isinMatches.map(match => match[0]))];
      
      console.log(`Found ${uniqueIsins.length} unique ISINs in text:`);
      uniqueIsins.slice(0, 20).forEach((isin, index) => {
        console.log(`${index + 1}. ${isin}`);
      });
      
      if (uniqueIsins.length > 20) {
        console.log(`... and ${uniqueIsins.length - 20} more`);
      }
    } else {
      console.log('No ISINs found in text');
    }
    
    // Check securities
    console.log('\nChecking securities:');
    if (financialData.securities && Array.isArray(financialData.securities)) {
      console.log(`Found ${financialData.securities.length} securities`);
      
      // Count securities with ISINs
      const securitiesWithISIN = financialData.securities.filter(s => s.isin);
      console.log(`Found ${securitiesWithISIN.length} securities with ISINs`);
      
      if (securitiesWithISIN.length > 0) {
        console.log('Securities with ISINs:');
        securitiesWithISIN.slice(0, 10).forEach((security, index) => {
          console.log(`${index + 1}. ${security.name}: ${security.isin}`);
        });
        
        if (securitiesWithISIN.length > 10) {
          console.log(`... and ${securitiesWithISIN.length - 10} more`);
        }
      }
    } else {
      console.log('No securities found or securities is not an array');
    }
  } catch (error) {
    console.error('Error during testing:', error);
  }
}

// Run the test
testIsinExtraction().then(() => {
  console.log('\nTesting completed.');
});
