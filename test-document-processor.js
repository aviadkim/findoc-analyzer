/**
 * Test Document Processor Script
 * 
 * This script tests the document processor on a sample PDF file
 */

// Import required modules
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Import document processor
const documentProcessor = require('./services/document-processor');

// Set up test environment
require('dotenv').config();

// Configure test parameters
const DEBUG = true;
const TEST_FILE = process.argv[2] || './messos.pdf';
const TEST_EXCEL_FILE = './sample_portfolio.xlsx';
const PDF_OUTPUT_FILE = './test-pdf-output.json';
const EXCEL_OUTPUT_FILE = './test-excel-output.json';

/**
 * Main test function
 */
async function runTest() {
  try {
    console.log('========================================');
    console.log('TESTING DOCUMENT PROCESSOR');
    console.log('========================================\n');

    // Test PDF processing
    await testPdfProcessing();

    // Test Excel processing
    await testExcelProcessing();

    console.log('\n========================================');
    console.log('ALL TESTS COMPLETED SUCCESSFULLY');
    console.log('========================================');

  } catch (error) {
    console.error(`Test failed: ${error.message}`);
    console.error(error.stack);
    process.exit(1);
  }
}

/**
 * Test PDF processing
 */
async function testPdfProcessing() {
  try {
    console.log('----------------------------------------');
    console.log(`TESTING PDF PROCESSING: ${TEST_FILE}`);
    console.log('----------------------------------------\n');

    // Check if file exists
    if (!fs.existsSync(TEST_FILE)) {
      console.error(`Error: Test file not found: ${TEST_FILE}`);
      return;
    }

    // Create test document
    const documentId = uuidv4();
    const document = await documentProcessor.createDocument({
      fileName: path.basename(TEST_FILE),
      filePath: TEST_FILE,
      contentType: 'application/pdf',
      userId: 'test-user',
      tenantId: 'test-tenant'
    });

    console.log(`Created test document with ID: ${document.id}`);

    // Process document
    console.log('Processing PDF document...');
    const processingOptions = {
      extractText: true,
      extractTables: true,
      extractMetadata: true,
      extractSecurities: true,
      tenantId: 'test-tenant',
      useMcp: true
    };

    console.time('PDF Processing time');
    const processedDocument = await documentProcessor.processDocument(document.id, processingOptions);
    console.timeEnd('PDF Processing time');

    // Output results
    console.log('\nPDF Processing complete!');
    console.log(`Document ID: ${processedDocument.id}`);
    console.log(`File name: ${processedDocument.fileName}`);

    // Print metadata
    console.log('\nMetadata:');
    console.log(JSON.stringify(processedDocument.content.metadata, null, 2));

    // Print text sample
    if (processedDocument.content.text) {
      const textSample = processedDocument.content.text.substring(0, 200) + '...';
      console.log('\nText sample:');
      console.log(textSample);
      console.log(`Total text length: ${processedDocument.content.text.length} characters`);
    } else {
      console.log('\nNo text extracted');
    }

    // Print tables
    if (processedDocument.content.tables && processedDocument.content.tables.length > 0) {
      console.log(`\nExtracted ${processedDocument.content.tables.length} tables`);

      processedDocument.content.tables.forEach((table, index) => {
        console.log(`\nTable ${index + 1}: ${table.name || 'Unnamed table'}`);
        console.log(`Headers: ${JSON.stringify(table.headers)}`);
        console.log(`Rows: ${table.rows.length}`);
        if (table.rows.length > 0) {
          console.log('Sample row:');
          console.log(JSON.stringify(table.rows[0]));
        }
      });
    } else {
      console.log('\nNo tables extracted');
    }

    // Print entities
    if (processedDocument.content.entities && processedDocument.content.entities.length > 0) {
      console.log(`\nExtracted ${processedDocument.content.entities.length} entities`);

      // Group entities by type
      const groupedEntities = processedDocument.content.entities.reduce((groups, entity) => {
        const type = entity.type || 'unknown';
        if (!groups[type]) {
          groups[type] = [];
        }
        groups[type].push(entity);
        return groups;
      }, {});

      Object.entries(groupedEntities).forEach(([type, entities]) => {
        console.log(`\n${type} entities (${entities.length}):`);

        // Print up to 5 sample entities
        entities.slice(0, 5).forEach((entity, index) => {
          console.log(`  ${index + 1}. ${entity.name || entity.value || 'Unnamed entity'}`);
        });

        if (entities.length > 5) {
          console.log(`  ... and ${entities.length - 5} more`);
        }
      });
    } else {
      console.log('\nNo entities extracted');
    }

    // Print securities
    if (processedDocument.content.securities && processedDocument.content.securities.length > 0) {
      console.log(`\nExtracted ${processedDocument.content.securities.length} securities`);

      processedDocument.content.securities.forEach((security, index) => {
        console.log(`\nSecurity ${index + 1}:`);
        console.log(`  Name: ${security.name || 'Unknown'}`);
        console.log(`  ISIN: ${security.isin || 'Unknown'}`);
        console.log(`  Ticker: ${security.ticker || 'Unknown'}`);
        if (security.quantity) console.log(`  Quantity: ${security.quantity}`);
        if (security.price) console.log(`  Price: ${security.price}`);
        if (security.value) console.log(`  Value: ${security.value}`);
      });
    } else {
      console.log('\nNo securities extracted');
    }

    // Save full output to file
    fs.writeFileSync(PDF_OUTPUT_FILE, JSON.stringify(processedDocument, null, 2));
    console.log(`\nFull PDF output saved to: ${PDF_OUTPUT_FILE}`);

  } catch (error) {
    console.error(`PDF test failed: ${error.message}`);
    throw error;
  }
}

/**
 * Test Excel processing
 */
async function testExcelProcessing() {
  try {
    console.log('\n----------------------------------------');
    console.log(`TESTING EXCEL PROCESSING: ${TEST_EXCEL_FILE}`);
    console.log('----------------------------------------\n');

    // Check if file exists
    if (!fs.existsSync(TEST_EXCEL_FILE)) {
      console.error(`Error: Test file not found: ${TEST_EXCEL_FILE}`);
      return;
    }

    // Create test document
    const documentId = uuidv4();
    const document = await documentProcessor.createDocument({
      fileName: path.basename(TEST_EXCEL_FILE),
      filePath: TEST_EXCEL_FILE,
      contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      userId: 'test-user',
      tenantId: 'test-tenant'
    });

    console.log(`Created test document with ID: ${document.id}`);

    // Process document
    console.log('Processing Excel document...');
    const processingOptions = {
      extractText: true,
      extractTables: true,
      extractMetadata: true,
      extractSecurities: true,
      tenantId: 'test-tenant',
      useMcp: true
    };

    console.time('Excel Processing time');
    const processedDocument = await documentProcessor.processDocument(document.id, processingOptions);
    console.timeEnd('Excel Processing time');

    // Output results
    console.log('\nExcel Processing complete!');
    console.log(`Document ID: ${processedDocument.id}`);
    console.log(`File name: ${processedDocument.fileName}`);

    // Print metadata
    console.log('\nMetadata:');
    console.log(JSON.stringify(processedDocument.content.metadata, null, 2));

    // Print text sample
    if (processedDocument.content.text) {
      const textSample = processedDocument.content.text.substring(0, 200) + '...';
      console.log('\nText sample:');
      console.log(textSample);
      console.log(`Total text length: ${processedDocument.content.text.length} characters`);
    } else {
      console.log('\nNo text extracted');
    }

    // Print tables
    if (processedDocument.content.tables && processedDocument.content.tables.length > 0) {
      console.log(`\nExtracted ${processedDocument.content.tables.length} tables`);

      processedDocument.content.tables.forEach((table, index) => {
        console.log(`\nTable ${index + 1}: ${table.name || 'Unnamed table'}`);
        console.log(`Headers: ${JSON.stringify(table.headers)}`);
        console.log(`Rows: ${table.rows.length}`);
        if (table.rows.length > 0) {
          console.log('Sample row:');
          console.log(JSON.stringify(table.rows[0]));
        }
      });
    } else {
      console.log('\nNo tables extracted');
    }

    // Print entities
    if (processedDocument.content.entities && processedDocument.content.entities.length > 0) {
      console.log(`\nExtracted ${processedDocument.content.entities.length} entities`);

      // Group entities by type
      const groupedEntities = processedDocument.content.entities.reduce((groups, entity) => {
        const type = entity.type || 'unknown';
        if (!groups[type]) {
          groups[type] = [];
        }
        groups[type].push(entity);
        return groups;
      }, {});

      Object.entries(groupedEntities).forEach(([type, entities]) => {
        console.log(`\n${type} entities (${entities.length}):`);

        // Print up to 5 sample entities
        entities.slice(0, 5).forEach((entity, index) => {
          console.log(`  ${index + 1}. ${entity.name || entity.value || 'Unnamed entity'}`);
        });

        if (entities.length > 5) {
          console.log(`  ... and ${entities.length - 5} more`);
        }
      });
    } else {
      console.log('\nNo entities extracted');
    }

    // Print securities
    if (processedDocument.content.securities && processedDocument.content.securities.length > 0) {
      console.log(`\nExtracted ${processedDocument.content.securities.length} securities`);

      processedDocument.content.securities.forEach((security, index) => {
        console.log(`\nSecurity ${index + 1}:`);
        console.log(`  Name: ${security.name || 'Unknown'}`);
        console.log(`  ISIN: ${security.isin || 'Unknown'}`);
        console.log(`  Ticker: ${security.ticker || 'Unknown'}`);
        if (security.quantity) console.log(`  Quantity: ${security.quantity}`);
        if (security.price) console.log(`  Price: ${security.price}`);
        if (security.value) console.log(`  Value: ${security.value}`);
      });
    } else {
      console.log('\nNo securities extracted');
    }

    // Save full output to file
    fs.writeFileSync(EXCEL_OUTPUT_FILE, JSON.stringify(processedDocument, null, 2));
    console.log(`\nFull Excel output saved to: ${EXCEL_OUTPUT_FILE}`);

  } catch (error) {
    console.error(`Excel test failed: ${error.message}`);
    throw error;
  }
}

// Run the test
runTest();