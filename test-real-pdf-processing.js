/**
 * Test Real PDF Processing
 * 
 * Script to test the PDF processing capabilities and save the results
 */

const fs = require('fs');
const path = require('path');
const pdfProcessor = require('./services/pdf-processor');
const mcpDocumentProcessor = require('./services/mcp-document-processor');

// Constants
const SAMPLE_PDF = path.join(__dirname, 'sample-pdfs/messos.pdf');
const OUTPUT_FILE = path.join(__dirname, 'pdf-processing-results.json');
const PRETTY_OUTPUT_FILE = path.join(__dirname, 'pdf-processing-results-pretty.json');
const TEXT_OUTPUT_FILE = path.join(__dirname, 'pdf-extracted-text.txt');

async function testPdfProcessing() {
  try {
    console.log('Testing PDF Processing');
    console.log('====================\n');
    
    // Ensure sample PDF exists
    if (!fs.existsSync(SAMPLE_PDF)) {
      console.error(`Sample PDF not found: ${SAMPLE_PDF}`);
      return;
    }
    
    console.log(`Using sample PDF: ${SAMPLE_PDF}`);
    
    // Process with standard PDF processor
    console.log('\nProcessing with standard PDF processor...');
    const standardResult = await pdfProcessor.processPdf(SAMPLE_PDF);
    
    // Process with MCP document processor
    console.log('\nProcessing with MCP document processor...');
    const mcpResult = await mcpDocumentProcessor.processDocument(SAMPLE_PDF);
    
    // Save results
    const results = {
      standard: standardResult,
      mcp: mcpResult
    };
    
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(results));
    fs.writeFileSync(PRETTY_OUTPUT_FILE, JSON.stringify(results, null, 2));
    
    // Save text separately for easy viewing
    fs.writeFileSync(TEXT_OUTPUT_FILE, standardResult.text || 'No text extracted');
    
    // Display summary
    console.log('\nProcessing Results Summary:');
    console.log('==========================');
    console.log('Standard Processing:');
    console.log(`- Text length: ${standardResult.text ? standardResult.text.length : 0} characters`);
    console.log(`- Tables: ${standardResult.tables ? standardResult.tables.length : 0}`);
    console.log(`- Entities: ${standardResult.entities ? standardResult.entities.length : 0}`);
    
    console.log('\nMCP Processing:');
    console.log(`- Text length: ${mcpResult.text ? mcpResult.text.length : 0} characters`);
    console.log(`- Tables: ${mcpResult.tables ? mcpResult.tables.length : 0}`);
    console.log(`- Entities: ${mcpResult.entities ? mcpResult.entities.length : 0}`);
    
    console.log('\nResults saved to:');
    console.log(`- ${OUTPUT_FILE}`);
    console.log(`- ${PRETTY_OUTPUT_FILE}`);
    console.log(`- ${TEXT_OUTPUT_FILE}`);
    
    // Display some entity examples
    if (mcpResult.entities && mcpResult.entities.length > 0) {
      console.log('\nSample Entities (MCP Processing):');
      mcpResult.entities.slice(0, 5).forEach(entity => {
        console.log(`- Type: ${entity.type}, Value: ${entity.name || entity.value || entity.isin || '(unnamed)'}`);
      });
    }
    
    // Display table examples
    if (standardResult.tables && standardResult.tables.length > 0) {
      console.log('\nSample Table (Standard Processing):');
      const sampleTable = standardResult.tables[0];
      console.log(`- Name: ${sampleTable.name || 'Unnamed'}`);
      console.log(`- Headers: ${sampleTable.headers ? sampleTable.headers.join(', ') : 'None'}`);
      console.log(`- Rows: ${sampleTable.rows ? sampleTable.rows.length : 0}`);
      
      if (sampleTable.rows && sampleTable.rows.length > 0) {
        console.log('- First row sample:');
        console.log(sampleTable.rows[0]);
      }
    }
    
    console.log('\nTest completed successfully!');
  } catch (error) {
    console.error(`\nTest failed: ${error.message}`);
    console.error(error);
  }
}

// Run the test
testPdfProcessing().catch(console.error);