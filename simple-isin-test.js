/**
 * Simple ISIN extraction test
 */

const fs = require('fs');
const path = require('path');
const { processPdf } = require('./services/pdf-processor');

// Path to test PDFs directory
const testPdfsDir = path.join(__dirname, 'test-pdfs');
const messosPath = path.join(testPdfsDir, 'messos.pdf');

// Simple test function
async function testIsinExtraction() {
  try {
    console.log('Testing ISIN extraction from messos.pdf...');
    
    // Process the PDF
    console.log('Processing PDF...');
    const pdfData = await processPdf(messosPath, { useOcr: false });
    
    console.log(`Extracted ${pdfData.text.length} characters of text`);
    console.log(`Detected ${pdfData.tables.length} tables`);
    
    // Extract ISINs from text
    console.log('\nExtracting ISINs from text:');
    const isinPattern = /[A-Z]{2}[A-Z0-9]{10}/g;
    const isinMatches = [...pdfData.text.matchAll(isinPattern)];
    
    if (isinMatches.length > 0) {
      // Deduplicate ISINs
      const uniqueIsins = [...new Set(isinMatches.map(match => match[0]))];
      console.log(`Found ${uniqueIsins.length} unique ISINs in text:`);
      
      uniqueIsins.forEach((isin, index) => {
        console.log(`${index + 1}. ${isin}`);
      });
    } else {
      console.log('No ISINs found in text');
    }
    
    // Save the first 1000 characters of text to a file
    const outputFile = path.join(__dirname, 'messos-text-sample.txt');
    fs.writeFileSync(outputFile, pdfData.text.substring(0, 1000));
    console.log(`\nSaved first 1000 characters of text to: ${outputFile}`);
    
    // Save tables to a file
    const tablesFile = path.join(__dirname, 'messos-tables.json');
    fs.writeFileSync(tablesFile, JSON.stringify(pdfData.tables, null, 2));
    console.log(`Saved tables to: ${tablesFile}`);
    
    console.log('\nTest completed successfully.');
  } catch (error) {
    console.error('Error during test:', error);
  }
}

// Run the test
testIsinExtraction();
