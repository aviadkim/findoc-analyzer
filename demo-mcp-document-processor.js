/**
 * MCP Document Processor for Financial PDF Analysis
 *
 * This is a demonstration of how to create a custom MCP for processing financial PDFs
 * using docling and scan1 integration.
 */

const fs = require('fs');
const path = require('path');
const doclingIntegration = require('./docling-integration');
const scan1Controller = require('./controllers/scan1Controller');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

/**
 * Format entity for display
 * @param {Object} entity - Entity to format
 * @returns {string} - Formatted entity
 */
function formatEntity(entity) {
  let result = '';

  if (entity.type === 'company' || entity.type === 'security') {
    result += `${colors.yellow}${entity.name || 'Unknown'}${colors.reset}`;

    if (entity.ticker) {
      result += ` (${colors.cyan}${entity.ticker}${colors.reset})`;
    }

    if (entity.isin) {
      result += ` ISIN: ${colors.green}${entity.isin}${colors.reset}`;
    }

    if (entity.quantity) {
      result += ` Quantity: ${entity.quantity}`;
    }

    if (entity.price) {
      result += ` Price: ${entity.price}`;
    }

    if (entity.marketValue) {
      result += ` Value: ${colors.blue}${entity.marketValue}${colors.reset}`;
    }
  } else if (entity.type === 'metric') {
    result += `${colors.magenta}${entity.name}${colors.reset}: ${colors.blue}${entity.value}${colors.reset}`;
  } else {
    result += `${colors.yellow}${entity.type || 'Entity'}${colors.reset}: ${entity.name || entity.value || JSON.stringify(entity)}`;
  }

  if (entity.confidence) {
    const confidenceColor = entity.confidence > 0.8 ? colors.green :
                           entity.confidence > 0.5 ? colors.yellow : colors.red;
    result += ` (${confidenceColor}${Math.round(entity.confidence * 100)}% confidence${colors.reset})`;
  }

  if (entity.source) {
    result += `\n   Source: ${entity.source}`;
  }

  return result;
}

/**
 * Format table for display
 * @param {Object} table - Table to format
 * @returns {string} - Formatted table
 */
function formatTable(table) {
  let result = '';

  if (table.title) {
    result += `${colors.bright}${colors.yellow}${table.title}${colors.reset}\n`;
  }

  if (table.headers && table.headers.length > 0) {
    result += `${colors.cyan}${table.headers.join(' | ')}${colors.reset}\n`;
    result += `${colors.dim}${'-'.repeat(table.headers.join(' | ').length)}${colors.reset}\n`;
  }

  if (table.rows && table.rows.length > 0) {
    table.rows.forEach(row => {
      result += `${row.join(' | ')}\n`;
    });
  }

  if (table.source) {
    result += `${colors.dim}Source: ${table.source}${colors.reset}\n`;
  }

  return result;
}

/**
 * Document processor MCP service
 */
class DocumentProcessorMcp {
  /**
   * Initialize the document processor MCP
   * @param {Object} options - Configuration options
   */
  constructor(options = {}) {
    this.options = {
      resultsDir: path.join(__dirname, 'results'),
      debug: process.env.DEBUG === 'true',
      ...options
    };

    // Create results directory if it doesn't exist
    if (!fs.existsSync(this.options.resultsDir)) {
      fs.mkdirSync(this.options.resultsDir, { recursive: true });
      console.log(`Created results directory: ${this.options.resultsDir}`);
    }

    this.log('Document processor MCP initialized');
  }

  /**
   * Log a message if debug is enabled
   * @param {string} message - Message to log
   */
  log(message) {
    if (this.options.debug) {
      console.log(`${colors.dim}[DocumentProcessorMCP] ${message}${colors.reset}`);
    }
  }

  /**
   * Process a document using both Docling and Scan1
   * @param {Object|string} document - Document object or file path
   * @param {Object} options - Processing options
   * @returns {Promise<Object>} - Processing results
   */
  async processDocument(document, options = {}) {
    // Convert string path to document object if needed
    if (typeof document === 'string') {
      const filePath = document;
      document = {
        id: `doc-${Date.now()}`,
        filePath,
        name: path.basename(filePath)
      };
    }

    this.log(`Processing document: ${document.id}`);

    // Default processing options
    const processingOptions = {
      extractText: true,
      extractTables: true,
      extractMetadata: true,
      extractSecurities: true,
      ...options
    };

    try {
      // Copy the file to uploads directory if it doesn't exist there
      const uploadsDir = path.join(__dirname, 'uploads');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      const uploadFilePath = path.join(uploadsDir, document.id);
      if (!fs.existsSync(uploadFilePath) && fs.existsSync(document.filePath)) {
        fs.copyFileSync(document.filePath, uploadFilePath);
      }

      // Start processing with both engines
      this.log(`Starting parallel processing with Docling and Scan1`);

      // Process with Docling and Scan1 in parallel
      const [doclingResults, scan1Results] = await Promise.all([
        doclingIntegration.processDocument(document.id).catch(err => {
          this.log(`Error processing with Docling: ${err.message}`);
          return null;
        }),
        scan1Controller.processDocument(document, processingOptions).catch(err => {
          this.log(`Error processing with Scan1: ${err.message}`);
          return null;
        })
      ]);

      // Check if enhanced processing is available
      let enhancedResults = null;
      if (scan1Controller.enhancedProcessDocument) {
        this.log('Enhanced processing available, using it');
        enhancedResults = await scan1Controller.enhancedProcessDocument(document, processingOptions).catch(err => {
          this.log(`Error in enhanced processing: ${err.message}`);
          return null;
        });
      }

      // Combine results from all processors
      const combinedResults = this.combineResults(document, doclingResults, scan1Results, enhancedResults);

      // Save the combined results
      const resultsPath = path.join(this.options.resultsDir, `${document.id}-combined.json`);
      fs.writeFileSync(resultsPath, JSON.stringify(combinedResults, null, 2));
      this.log(`Combined results saved to: ${resultsPath}`);

      return combinedResults;
    } catch (error) {
      this.log(`Error processing document: ${error.message}`);
      throw error;
    }
  }

  /**
   * Combine results from different processors
   * @param {Object} document - Document object
   * @param {Object} doclingResults - Results from Docling
   * @param {Object} scan1Results - Results from Scan1
   * @param {Object} enhancedResults - Results from enhanced processing
   * @returns {Object} - Combined results
   */
  combineResults(document, doclingResults, scan1Results, enhancedResults) {
    this.log('Combining results from all processors');

    // Get arrays from each result, or empty arrays if not available
    const getArray = (obj, key) => (obj && Array.isArray(obj[key])) ? obj[key] : [];

    // Get text from each result, or empty string if not available
    const getText = (obj, key) => (obj && obj[key]) ? obj[key] : '';

    // Extract securities from results
    const securities = [
      ...getArray(doclingResults, 'securities').map(s => ({ ...s, source: 'docling' })),
      ...getArray(scan1Results, 'securities').map(s => ({ ...s, source: 'scan1' })),
      ...(enhancedResults ? getArray(enhancedResults, 'securities').map(s => ({ ...s, source: 'enhanced' })) : [])
    ];

    // Extract entities from results
    const entities = [
      ...securities,
      ...getArray(doclingResults, 'entities').map(e => ({ ...e, source: 'docling' })),
      ...getArray(scan1Results, 'entities').map(e => ({ ...e, source: 'scan1' })),
      ...(enhancedResults ? getArray(enhancedResults, 'entities').map(e => ({ ...e, source: 'enhanced' })) : [])
    ];

    // Extract tables from results
    const tables = [
      ...getArray(doclingResults, 'tables').map(t => ({ ...t, source: 'docling' })),
      ...getArray(scan1Results, 'tables').map(t => ({ ...t, source: 'scan1' })),
      ...(enhancedResults ? getArray(enhancedResults, 'tables').map(t => ({ ...t, source: 'enhanced' })) : [])
    ];

    // Return the combined results
    return {
      documentId: document.id,
      fileName: document.name,
      filePath: document.filePath,
      processingDate: new Date().toISOString(),
      sources: {
        docling: !!doclingResults,
        scan1: !!scan1Results,
        enhanced: !!enhancedResults
      },
      text: enhancedResults?.text || doclingResults?.text || scan1Results?.text || '',
      entities,
      securities,
      tables,
      summary: this.generateSummary(document, entities, tables)
    };
  }

  /**
   * Generate a summary of the document
   * @param {Object} document - Document object
   * @param {Array} entities - Extracted entities
   * @param {Array} tables - Extracted tables
   * @returns {Object} - Document summary
   */
  generateSummary(document, entities, tables) {
    // Count entities by type
    const entityTypes = {};
    entities.forEach(entity => {
      const type = entity.type || 'unknown';
      entityTypes[type] = (entityTypes[type] || 0) + 1;
    });

    // Calculate total value if available
    let totalValue = 0;
    let valueCount = 0;
    entities.forEach(entity => {
      if (entity.marketValue && typeof entity.marketValue === 'number') {
        totalValue += entity.marketValue;
        valueCount++;
      }
    });

    return {
      documentName: document.name,
      entityCounts: entityTypes,
      tableCount: tables.length,
      totalValueFound: valueCount > 0 ? totalValue : null,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Generate synthetic securities for testing
   * @param {number} count - Number of securities to generate
   * @returns {Array} - Array of synthetic securities
   */
  generateSyntheticSecurities(count = 5) {
    const companies = [
      { name: 'Apple Inc.', ticker: 'AAPL', isin: 'US0378331005' },
      { name: 'Microsoft Corporation', ticker: 'MSFT', isin: 'US5949181045' },
      { name: 'Alphabet Inc.', ticker: 'GOOGL', isin: 'US02079K1079' },
      { name: 'Amazon.com Inc.', ticker: 'AMZN', isin: 'US0231351067' },
      { name: 'Tesla Inc.', ticker: 'TSLA', isin: 'US88160R1014' },
      { name: 'Meta Platforms Inc.', ticker: 'META', isin: 'US30303M1027' },
      { name: 'Nvidia Corporation', ticker: 'NVDA', isin: 'US67066G1040' },
      { name: 'JPMorgan Chase & Co.', ticker: 'JPM', isin: 'US46625H1005' },
      { name: 'Johnson & Johnson', ticker: 'JNJ', isin: 'US4781601046' },
      { name: 'Visa Inc.', ticker: 'V', isin: 'US92826C8394' }
    ];

    const result = [];
    for (let i = 0; i < count; i++) {
      const company = companies[i % companies.length];
      const quantity = Math.floor(Math.random() * 100) + 1;
      const price = Math.round(Math.random() * 500 + 50);
      const marketValue = quantity * price;

      result.push({
        type: 'security',
        ...company,
        quantity,
        price,
        marketValue,
        confidence: Math.random() * 0.3 + 0.7,
        source: 'synthetic'
      });
    }

    return result;
  }

  /**
   * Get status of the document processor
   * @returns {Object} - Status information
   */
  getStatus() {
    return {
      name: 'Document Processor MCP',
      version: '1.0.0',
      status: 'online',
      timestamp: new Date().toISOString(),
      engines: {
        docling: true,
        scan1: true
      }
    };
  }
}

// Create an instance of the MCP
const documentProcessorMcp = new DocumentProcessorMcp({
  debug: true
});

/**
 * Run the demo
 */
async function runDemo() {
  console.log(`${colors.bright}${colors.magenta}===================================${colors.reset}`);
  console.log(`${colors.bright}${colors.magenta} FinDoc Analyzer MCP Document Processor Demo ${colors.reset}`);
  console.log(`${colors.bright}${colors.magenta}===================================${colors.reset}\n`);

  // Step 1: Create a test directory and file if not exists
  console.log(`${colors.bright}${colors.blue}Step 1: Setting up test environment...${colors.reset}`);

  const testDir = path.join(__dirname, 'test-files');
  if (!fs.existsSync(testDir)) {
    fs.mkdirSync(testDir, { recursive: true });
    console.log(`${colors.green}Created test directory: ${testDir}${colors.reset}`);
  } else {
    console.log(`${colors.yellow}Test directory already exists: ${testDir}${colors.reset}`);
  }

  const testFilePath = path.join(testDir, 'test.pdf');
  if (!fs.existsSync(testFilePath)) {
    // Create a test PDF with some text and ISIN codes
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
    fs.writeFileSync(testFilePath, pdfContent);
    console.log(`${colors.green}Created test PDF at: ${testFilePath}${colors.reset}`);
  } else {
    console.log(`${colors.yellow}Test file already exists: ${testFilePath}${colors.reset}`);
  }

  // Step 2: Process the document using MCP
  console.log(`\n${colors.bright}${colors.blue}Step 2: Processing document with MCP...${colors.reset}`);

  console.log(`Processing document: ${testFilePath}`);

  try {
    const result = await documentProcessorMcp.processDocument(testFilePath);

    console.log(`${colors.green}Document processed successfully${colors.reset}`);
    console.log(`Document ID: ${result.documentId}`);
    console.log(`File name: ${result.fileName}`);
    console.log(`Processing date: ${result.processingDate}`);

    // Step 3: Display extracted entities
    console.log(`\n${colors.bright}${colors.blue}Step 3: Displaying extracted entities...${colors.reset}`);

    if (result.entities && result.entities.length > 0) {
      console.log(`${colors.green}Found ${result.entities.length} entities:${colors.reset}\n`);

      result.entities.forEach((entity, index) => {
        console.log(`${index + 1}. ${formatEntity(entity)}`);
      });
    } else {
      console.log(`${colors.yellow}No entities found in the document${colors.reset}`);
    }

    // Step 4: Display extracted tables
    console.log(`\n${colors.bright}${colors.blue}Step 4: Displaying extracted tables...${colors.reset}`);

    if (result.tables && result.tables.length > 0) {
      console.log(`${colors.green}Found ${result.tables.length} tables:${colors.reset}\n`);

      result.tables.forEach((table, index) => {
        console.log(`${colors.bright}Table ${index + 1}:${colors.reset}`);
        console.log(formatTable(table));
        console.log();
      });
    } else {
      console.log(`${colors.yellow}No tables found in the document${colors.reset}`);
    }

    // Step 5: Generate synthetic data
    console.log(`\n${colors.bright}${colors.blue}Step 5: Generating synthetic securities data...${colors.reset}`);

    const syntheticSecurities = documentProcessorMcp.generateSyntheticSecurities(5);

    console.log(`${colors.green}Generated ${syntheticSecurities.length} synthetic securities:${colors.reset}\n`);

    syntheticSecurities.forEach((security, index) => {
      console.log(`${index + 1}. ${formatEntity(security)}`);
    });

    // Final message
    console.log(`\n${colors.bright}${colors.green}Demo completed successfully!${colors.reset}`);
    console.log(`${colors.yellow}Next steps:${colors.reset}`);
    console.log(`1. Create custom MCP servers for your specific processing needs`);
    console.log(`2. Start using them in your application with ${colors.blue}require('./demo-mcp-document-processor')${colors.reset}`);
    console.log(`3. Check ${colors.blue}test-docling-integration.js${colors.reset} for more integration examples`);

  } catch (error) {
    console.error(`${colors.red}Error: ${error.message}${colors.reset}`);
    console.error(error);
  }
}

// Run the demo if this file is executed directly
if (require.main === module) {
  runDemo().catch(error => {
    console.error(`${colors.red}Unhandled error:${colors.reset}`, error);
    process.exit(1);
  });
}

// Export the MCP instance
module.exports = documentProcessorMcp;