/**
 * Simple script to process the messos.pdf file
 */

const fs = require('fs');
const path = require('path');
const { processPdf } = require('./services/pdf-processor');
const { extractFinancialData } = require('./services/enhanced-financial-extractor');

// Path to the messos.pdf file
const pdfFile = path.join(__dirname, 'test-pdfs', 'messos.pdf');

async function processMessosPdf() {
  try {
    console.log(`Processing messos.pdf...`);
    
    // Process the PDF without OCR
    console.log('Processing PDF without OCR...');
    const pdfData = await processPdf(pdfFile, { useOcr: false });
    
    console.log(`Text extracted (${pdfData.text.length} characters)`);
    console.log(`Tables extracted: ${pdfData.tables.length}`);
    
    // Extract financial data
    console.log('Extracting financial data...');
    const financialData = await extractFinancialData(pdfData.text, pdfData.tables);
    
    // Save extracted data to a JSON file for inspection
    const outputFile = path.join(__dirname, 'messos-extracted.json');
    fs.writeFileSync(outputFile, JSON.stringify({
      text: pdfData.text.substring(0, 1000) + '...', // Just save the first 1000 characters
      tableCount: pdfData.tables.length,
      financialData
    }, null, 2));
    
    console.log(`Saved extracted data to: ${outputFile}`);
    
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
        console.log(`  ${index + 1}. ${isin}`);
      });
      
      if (uniqueIsins.length > 20) {
        console.log(`  ... and ${uniqueIsins.length - 20} more`);
      }
    } else {
      console.log('No ISINs found in text');
    }
    
    // Print summary of extracted data
    console.log('\nExtracted Data Summary:');
    console.log(`- Portfolio Title: ${financialData.portfolioInfo.title || 'N/A'}`);
    console.log(`- Date: ${financialData.portfolioInfo.date || 'N/A'}`);
    console.log(`- Total Value: ${financialData.portfolioInfo.totalValue || 'N/A'} ${financialData.portfolioInfo.currency || 'USD'}`);
    console.log(`- Owner: ${financialData.portfolioInfo.owner || 'N/A'}`);
    console.log(`- Asset Allocation Categories: ${financialData.assetAllocation.categories.length}`);
    
    // Check securities
    if (financialData.securities && Array.isArray(financialData.securities)) {
      console.log(`- Securities: ${financialData.securities.length}`);
      
      // Count securities with ISINs
      const securitiesWithISIN = financialData.securities.filter(s => s.isin);
      console.log(`- Securities with ISIN: ${securitiesWithISIN.length}`);
      
      // Print ISINs
      if (securitiesWithISIN.length > 0) {
        console.log('\nSecurities with ISINs:');
        securitiesWithISIN.slice(0, 10).forEach((security, index) => {
          console.log(`  ${index + 1}. ${security.name}: ${security.isin}`);
        });
        
        if (securitiesWithISIN.length > 10) {
          console.log(`  ... and ${securitiesWithISIN.length - 10} more`);
        }
      }
    } else {
      console.log('- Securities: N/A');
    }
    
    console.log('\nProcessing completed successfully.');
  } catch (error) {
    console.error('Error processing messos.pdf:', error);
  }
}

// Run the function
processMessosPdf().then(() => {
  console.log('Done!');
}).catch(error => {
  console.error('Error:', error);
});
