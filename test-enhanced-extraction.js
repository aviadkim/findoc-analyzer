/**
 * Test script for enhanced financial data extraction
 * 
 * This script tests the enhanced financial data extraction functionality with different PDFs.
 */

const fs = require('fs');
const path = require('path');
const { processPdf } = require('./services/pdf-processor');
const { extractFinancialData } = require('./services/enhanced-financial-extractor');

// Directory containing test PDFs
const testPdfsDir = path.join(__dirname, 'test-pdfs');

// Create directory if it doesn't exist
if (!fs.existsSync(testPdfsDir)) {
  fs.mkdirSync(testPdfsDir);
  console.log(`Created test PDFs directory: ${testPdfsDir}`);
  console.log('Please add test PDFs to this directory and run the script again.');
  process.exit(0);
}

// Get all PDF files in the directory
const pdfFiles = fs.readdirSync(testPdfsDir)
  .filter(file => file.toLowerCase().endsWith('.pdf'))
  .map(file => path.join(testPdfsDir, file));

if (pdfFiles.length === 0) {
  console.log('No PDF files found in the test directory.');
  console.log(`Please add test PDFs to: ${testPdfsDir}`);
  process.exit(0);
}

console.log(`Found ${pdfFiles.length} PDF files for testing.`);

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

// Process each PDF file
async function testPdfs() {
  for (const pdfFile of pdfFiles) {
    console.log(`\n\n========== Testing PDF: ${path.basename(pdfFile)} ==========`);
    
    try {
      // Process the PDF
      console.log('Processing PDF...');
      const pdfData = await processPdf(pdfFile);
      
      // Extract financial data
      console.log('Extracting financial data...');
      const financialData = await extractFinancialData(pdfData.text, pdfData.tables);
      
      // Combine data
      const data = {
        ...pdfData,
        financialData
      };
      
      // Save extracted data to a JSON file for inspection
      const outputFile = path.join(testPdfsDir, `${path.basename(pdfFile, '.pdf')}-enhanced-extracted.json`);
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
      console.log(`- Portfolio Title: ${financialData.portfolioInfo.title || 'N/A'}`);
      console.log(`- Date: ${financialData.portfolioInfo.date || 'N/A'}`);
      console.log(`- Total Value: ${financialData.portfolioInfo.totalValue || 'N/A'} ${financialData.portfolioInfo.currency || 'USD'}`);
      console.log(`- Owner: ${financialData.portfolioInfo.owner || 'N/A'}`);
      console.log(`- Asset Allocation Categories: ${financialData.assetAllocation.categories.length}`);
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
      
      // Print performance metrics
      console.log('\nPerformance Metrics:');
      for (const [key, value] of Object.entries(financialData.performance)) {
        if (value !== null) {
          console.log(`  - ${key}: ${value}%`);
        }
      }
      
    } catch (error) {
      console.error(`Error processing ${path.basename(pdfFile)}:`, error);
    }
  }
}

// Run the tests
testPdfs().then(() => {
  console.log('\nTesting completed.');
}).catch(error => {
  console.error('Error during testing:', error);
});
