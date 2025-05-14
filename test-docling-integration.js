/**
 * Test script for Docling integration with PDF processing
 *
 * This script demonstrates the integration between Docling and Scan1 for enhanced PDF processing.
 */

const fs = require('fs');
const path = require('path');
const doclingIntegration = require('./docling-integration');
const scan1Controller = require('./controllers/scan1Controller');

// Configuration
const config = {
  tempDir: path.join(__dirname, 'temp'),
  resultsDir: path.join(__dirname, 'results'),
  uploadsDir: path.join(__dirname, 'uploads'),
  testFilesDir: path.join(__dirname, 'test-files')
};

// Create directories if they don't exist
for (const dir of [config.tempDir, config.resultsDir, config.uploadsDir, config.testFilesDir]) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`Created directory: ${dir}`);
  }
}

/**
 * Creates a test PDF with financial data if it doesn't exist
 * @returns {string} - Path to the test PDF
 */
function createTestPdf() {
  const testPdfPath = path.join(config.testFilesDir, 'test.pdf');

  if (fs.existsSync(testPdfPath)) {
    console.log(`Test PDF already exists at ${testPdfPath}`);
    return testPdfPath;
  }

  console.log(`Creating test PDF at ${testPdfPath}`);

  // Create a simple PDF with some text and an ISIN code
  const pdfContent = `
%PDF-1.5
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>
endobj
4 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
5 0 obj
<< /Length 178 >>
stream
BT
/F1 12 Tf
72 720 Td
(This is a test PDF document for Docling integration testing.) Tj
0 -20 Td
(It contains an ISIN code: US0378331005 (Apple Inc.)) Tj
0 -20 Td
(And another one: US5949181045 (Microsoft Corporation)) Tj
ET
endstream
endobj
xref
0 6
0000000000 65535 f
0000000010 00000 n
0000000059 00000 n
0000000118 00000 n
0000000217 00000 n
0000000284 00000 n
trailer
<< /Size 6 /Root 1 0 R >>
startxref
514
%%EOF
`;

  fs.writeFileSync(testPdfPath, pdfContent);
  return testPdfPath;
}

/**
 * Test processing sample PDF with both Docling and Scan1
 */
async function testPdfProcessing() {
  console.log('='.repeat(80));
  console.log('TESTING PDF PROCESSING WITH DOCLING AND SCAN1 INTEGRATION');
  console.log('='.repeat(80));

  try {
    // Create a test document ID and prepare the test PDF
    const documentId = `test-${Date.now()}`;
    const testPdfPath = createTestPdf();
    const filePath = path.join(config.uploadsDir, documentId);

    // Copy the test PDF to the uploads directory
    console.log(`Copying test PDF to: ${filePath}`);
    fs.copyFileSync(testPdfPath, filePath);

    // Process with Docling
    console.log('\nPROCESSING WITH DOCLING:');
    console.log('-'.repeat(40));
    const doclingResults = await doclingIntegration.processDocument(documentId);
    console.log('Docling processing results:', JSON.stringify(doclingResults, null, 2));

    // Process with Scan1
    console.log('\nPROCESSING WITH SCAN1:');
    console.log('-'.repeat(40));
    const document = {
      id: documentId,
      filePath,
      name: `Document-${documentId}`,
    };
    const scan1Results = await scan1Controller.processDocument(document, {
      extractText: true,
      extractTables: true,
      extractMetadata: true,
      extractSecurities: true,
    });
    console.log('Scan1 processing results:', JSON.stringify(scan1Results, null, 2));

    // Process with enhanced Scan1 using Docling integration
    console.log('\nPROCESSING WITH ENHANCED SCAN1 (DOCLING INTEGRATION):');
    console.log('-'.repeat(40));
    // Check if enhancedProcessDocument method exists
    if (scan1Controller.enhancedProcessDocument) {
      const enhancedResults = await scan1Controller.enhancedProcessDocument(document, {
        extractText: true,
        extractTables: true,
        extractMetadata: true,
        extractSecurities: true,
      });
      console.log('Enhanced processing results:', JSON.stringify(enhancedResults, null, 2));
    } else {
      console.log('Enhanced Scan1 processing not available');
    }

    // Extract tables with Docling
    console.log('\nEXTRACTING TABLES WITH DOCLING:');
    console.log('-'.repeat(40));
    const tables = await doclingIntegration.extractTables(documentId);
    console.log('Extracted tables:', JSON.stringify(tables, null, 2));

    // Extract securities with Docling
    console.log('\nEXTRACTING SECURITIES WITH DOCLING:');
    console.log('-'.repeat(40));
    const securities = await doclingIntegration.extractSecurities(documentId);
    console.log('Extracted securities:', JSON.stringify(securities, null, 2));

    // Financial analysis with Docling
    console.log('\nFINANCIAL ANALYSIS WITH DOCLING:');
    console.log('-'.repeat(40));
    const analysis = await doclingIntegration.analyzeFinancialDocument(documentId);
    console.log('Financial analysis:', JSON.stringify(analysis, null, 2));

    // Compare Docling and Scan1 results
    console.log('\nCOMPARING DOCLING AND SCAN1 RESULTS:');
    console.log('-'.repeat(40));

    // Save Scan1 results for comparison
    const scan1ResultsPath = path.join(config.resultsDir, `${documentId}-scan1.json`);
    fs.writeFileSync(scan1ResultsPath, JSON.stringify(scan1Results, null, 2));
    console.log(`Scan1 results saved to: ${scan1ResultsPath}`);

    // Compare results
    try {
      const comparison = await doclingIntegration.compareWithScan1(documentId);
      console.log('Comparison results:', JSON.stringify(comparison, null, 2));
    } catch (comparisonError) {
      console.error('Error comparing results:', comparisonError.message);
    }

    console.log('\nTEST COMPLETED SUCCESSFULLY');
    return {
      documentId,
      filePath,
      doclingResults,
      scan1Results
    };
  } catch (error) {
    console.error('Error in PDF processing test:', error);
    throw error;
  }
}

// Demo functions for MCP integration
/**
 * Create a simple MCP server for document processing
 */
function createMcpDocumentProcessor() {
  console.log('Creating MCP document processor (mock implementation)');
  return {
    processDocument: async (document, options = {}) => {
      console.log(`MCP processing document: ${document.id}`);

      // Use Docling and Scan1 for processing
      const doclingResults = await doclingIntegration.processDocument(document.id);
      const scan1Results = await scan1Controller.processDocument(document, options);

      // Combine results
      return {
        id: document.id,
        timestamp: new Date().toISOString(),
        docling: doclingResults,
        scan1: scan1Results,
        combinedResults: {
          text: doclingResults.text || scan1Results.text,
          tables: [...(doclingResults.tables || []), ...(scan1Results.tables || [])],
          securities: [...(doclingResults.securities || []), ...(scan1Results.securities || [])],
          images: [...(doclingResults.images || []), ...(scan1Results.images || [])]
        }
      };
    }
  };
}

// Run the tests if this file is executed directly
if (require.main === module) {
  testPdfProcessing()
    .then(results => {
      console.log('Demo MCP integration:');
      console.log('-'.repeat(40));

      const mcpProcessor = createMcpDocumentProcessor();
      console.log('MCP document processor created. Ready to process documents with Docling and Scan1 integration.');
    })
    .catch(error => {
      console.error('Error:', error);
    });
}

module.exports = {
  testPdfProcessing,
  createMcpDocumentProcessor
};
