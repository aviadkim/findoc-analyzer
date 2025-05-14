/**
 * Test script for processing the messos.pdf file
 * 
 * This script tests the enhanced financial data extraction with OCR on the messos.pdf file.
 */

const fs = require('fs');
const path = require('path');
const { processPdf } = require('./services/pdf-processor');
const { extractFinancialData } = require('./services/enhanced-financial-extractor');

// Path to the messos.pdf file
const pdfFile = path.join(__dirname, 'test-pdfs', 'messos.pdf');

// Check if the file exists
if (!fs.existsSync(pdfFile)) {
  console.error(`File not found: ${pdfFile}`);
  console.log('Please make sure the messos.pdf file is in the test-pdfs directory.');
  process.exit(1);
}

// Import agent handlers
const {
  handleDocumentAnalyzerQuery,
  handleTableUnderstandingQuery,
  handleSecuritiesExtractorQuery,
  handleFinancialReasonerQuery,
  handleBloombergAgentQuery
} = require('./services/agent-handlers');

// Test queries to simulate
const testQueries = [
  { message: "What is the total value of the portfolio?", agent: "documentAnalyzer" },
  { message: "What is the date of this document?", agent: "documentAnalyzer" },
  { message: "What is the asset allocation?", agent: "tableUnderstanding" },
  { message: "What securities are in the portfolio?", agent: "securitiesExtractor" },
  { message: "What are the ISINs?", agent: "securitiesExtractor" },
  { message: "What is the risk profile?", agent: "financialReasoner" }
];

// Process the PDF with and without OCR
async function testMessosPdf() {
  console.log('Testing messos.pdf processing...');
  
  // Process without OCR
  console.log('\n=== Processing without OCR ===');
  await processPdfWithOptions(false);
  
  // Process with OCR
  console.log('\n=== Processing with OCR ===');
  await processPdfWithOptions(true);
}

// Process the PDF with the given options
async function processPdfWithOptions(useOcr) {
  try {
    console.log(`Processing messos.pdf${useOcr ? ' with OCR' : ''}...`);
    
    // Process the PDF
    console.log('Processing PDF...');
    const startTime = Date.now();
    const pdfData = await processPdf(pdfFile, { useOcr });
    const processingTime = (Date.now() - startTime) / 1000;
    console.log(`PDF processing completed in ${processingTime.toFixed(2)} seconds`);
    
    // Extract financial data
    console.log('Extracting financial data...');
    const financialData = await extractFinancialData(pdfData.text, pdfData.tables);
    
    // Combine data
    const data = {
      ...pdfData,
      financialData
    };
    
    // Save extracted data to a JSON file for inspection
    const outputFile = path.join(__dirname, 'test-pdfs', `messos-${useOcr ? 'with-ocr' : 'without-ocr'}.json`);
    fs.writeFileSync(outputFile, JSON.stringify(data, null, 2));
    console.log(`Saved extracted data to: ${outputFile}`);
    
    // Test queries
    console.log('\nTesting queries:');
    for (const query of testQueries) {
      console.log(`\nQuery: "${query.message}" (Agent: ${query.agent})`);
      
      let response;
      switch (query.agent) {
        case 'documentAnalyzer':
          response = handleDocumentAnalyzerQuery(data, query.message);
          break;
        case 'tableUnderstanding':
          response = handleTableUnderstandingQuery(data, query.message);
          break;
        case 'securitiesExtractor':
          response = handleSecuritiesExtractorQuery(data, query.message);
          break;
        case 'financialReasoner':
          response = handleFinancialReasonerQuery(data, query.message);
          break;
        case 'bloombergAgentQuery':
          response = handleBloombergAgentQuery(data, query.message);
          break;
        default:
          response = "Unknown agent type";
      }
      
      console.log(`Response: ${response}`);
    }
    
    // Print summary of extracted data
    console.log('\nExtracted Data Summary:');
    console.log(`- Text length: ${pdfData.text.length} characters`);
    console.log(`- Tables: ${pdfData.tables.length}`);
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
        console.log('\nISINs:');
        securitiesWithISIN.slice(0, 10).forEach((security, index) => {
          console.log(`  ${index + 1}. ${security.isin} (${security.name})`);
        });
        
        if (securitiesWithISIN.length > 10) {
          console.log(`  ... and ${securitiesWithISIN.length - 10} more`);
        }
      }
    } else {
      console.log('- Securities: N/A');
    }
    
    // Print performance metrics
    console.log('\nPerformance Metrics:');
    for (const [key, value] of Object.entries(financialData.performance)) {
      if (value !== null) {
        console.log(`  - ${key}: ${value}%`);
      }
    }
    
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
  } catch (error) {
    console.error(`Error processing messos.pdf${useOcr ? ' with OCR' : ''}:`, error);
  }
}

// Run the test
testMessosPdf().then(() => {
  console.log('\nTesting completed.');
}).catch(error => {
  console.error('Error during testing:', error);
});
