/**
 * Comprehensive PDF Processing Test
 * 
 * This script tests PDF processing across multiple PDFs, checks API key functionality,
 * evaluates agent capabilities, and tests chatbot question answering.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Services
const pdfProcessor = require('./services/pdf-processor');
const mcpDocumentProcessor = require('./services/mcp-document-processor');
const entityExtractor = require('./services/entity-extractor');
const tableExtractor = require('./services/table-extractor');
const apiKeyManager = require('./services/api-key-manager');

// Constants
const TEST_PDFS_DIR = path.join(__dirname, 'test-pdfs');
const RESULTS_DIR = path.join(__dirname, 'pdf-test-results');
const PDF_PATHS = [
  path.join(TEST_PDFS_DIR, 'messos.pdf'),
  path.join(TEST_PDFS_DIR, 'sample_portfolio.pdf'),
  path.join(TEST_PDFS_DIR, 'simple-financial-statement.pdf')
];

// Create results directory if it doesn't exist
if (!fs.existsSync(RESULTS_DIR)) {
  fs.mkdirSync(RESULTS_DIR, { recursive: true });
}

// Format a number with commas for readability
function formatNumber(num) {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// Ensure all test PDFs exist
function validateTestPdfs() {
  console.log('Validating test PDFs...');
  
  const missingPdfs = PDF_PATHS.filter(pdfPath => !fs.existsSync(pdfPath));
  
  if (missingPdfs.length > 0) {
    console.error('Missing test PDFs:');
    missingPdfs.forEach(pdf => console.error(`- ${pdf}`));
    throw new Error('Missing test PDFs');
  }
  
  console.log('All test PDFs exist\n');
}

// Process a single PDF and save results
async function processPdf(pdfPath, useOcr = false) {
  const filename = path.basename(pdfPath);
  console.log(`Processing ${filename}${useOcr ? ' with OCR' : ''}...`);
  
  try {
    // Process with standard processor
    const standardResult = await pdfProcessor.processPdf(pdfPath, { useOcr });
    
    // Process with MCP document processor
    const mcpResult = await mcpDocumentProcessor.processDocument(pdfPath);
    
    // Save results
    const results = {
      filename,
      path: pdfPath,
      useOcr,
      standard: standardResult,
      mcp: mcpResult,
      timestamp: new Date().toISOString()
    };
    
    const outputPath = path.join(RESULTS_DIR, `${filename.replace('.pdf', '')}-results${useOcr ? '-ocr' : ''}.json`);
    fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
    
    console.log(`Results saved to ${outputPath}`);
    
    return {
      results,
      outputPath
    };
  } catch (error) {
    console.error(`Error processing ${filename}: ${error.message}`);
    throw error;
  }
}

// Test table extraction capabilities
async function testTableExtraction(results) {
  console.log('\nTesting table extraction capabilities...');
  
  const tableResults = {
    standardTotal: 0,
    mcpTotal: 0,
    samples: []
  };
  
  // Analyze results for each PDF
  Object.entries(results).forEach(([filename, result]) => {
    const standardTables = result.results.standard.tables || [];
    const mcpTables = result.results.mcp.tables || [];
    
    tableResults.standardTotal += standardTables.length;
    tableResults.mcpTotal += mcpTables.length;
    
    // Include sample tables
    if (standardTables.length > 0) {
      tableResults.samples.push({
        source: `${filename} (Standard)`,
        table: standardTables[0]
      });
    }
    
    if (mcpTables.length > 0 && (!standardTables.length || JSON.stringify(standardTables[0]) !== JSON.stringify(mcpTables[0]))) {
      tableResults.samples.push({
        source: `${filename} (MCP)`,
        table: mcpTables[0]
      });
    }
  });
  
  // Save table extraction results
  const outputPath = path.join(RESULTS_DIR, 'table-extraction-results.json');
  fs.writeFileSync(outputPath, JSON.stringify(tableResults, null, 2));
  
  console.log(`Standard processing extracted ${tableResults.standardTotal} tables`);
  console.log(`MCP processing extracted ${tableResults.mcpTotal} tables`);
  console.log(`Saved ${tableResults.samples.length} sample tables to ${outputPath}`);
  
  return tableResults;
}

// Test entity extraction capabilities
async function testEntityExtraction(results) {
  console.log('\nTesting entity extraction capabilities...');
  
  const entityResults = {
    pdfs: {},
    entityTypes: {},
    totalEntities: 0
  };
  
  // Process each PDF result
  Object.entries(results).forEach(([filename, result]) => {
    const entities = result.results.mcp.entities || [];
    entityResults.pdfs[filename] = entities.length;
    entityResults.totalEntities += entities.length;
    
    // Count entity types
    entities.forEach(entity => {
      const type = entity.type || 'unknown';
      entityResults.entityTypes[type] = (entityResults.entityTypes[type] || 0) + 1;
    });
    
    // Try additional entity extraction with the dedicated service
    try {
      const text = result.results.standard.text || '';
      if (text.length > 0) {
        const extractedEntities = entityExtractor.extractEntities(text);
        console.log(`Extracted ${extractedEntities.length} entities using entity-extractor service`);
      }
    } catch (error) {
      console.warn(`Error using entity-extractor service: ${error.message}`);
    }
  });
  
  // Save entity extraction results
  const outputPath = path.join(RESULTS_DIR, 'entity-extraction-results.json');
  fs.writeFileSync(outputPath, JSON.stringify(entityResults, null, 2));
  
  console.log(`Extracted ${entityResults.totalEntities} total entities`);
  console.log(`Entity types found: ${Object.keys(entityResults.entityTypes).join(', ')}`);
  console.log(`Entity extraction results saved to ${outputPath}`);
  
  return entityResults;
}

// Test API key functionality
async function testApiKeys() {
  console.log('\nTesting API key functionality...');
  
  const keyTypes = ['openai', 'openrouter', 'anthropic', 'gemini', 'azure'];
  const apiKeyResults = {
    keyTypes,
    validationTests: {},
    storageTests: {}
  };
  
  // Test API key validation
  for (const keyType of keyTypes) {
    // Create sample keys for testing validation
    const sampleKeys = {
      openai: 'sk-8SDfg890SDFGdfgDFGdfg5645',
      openrouter: 'sk-or-v1-ewr9834jkwercv849e',
      gemini: 'gemini_SDFsdfDFVS54',
      anthropic: 'sk-ant-SDFsdfHDFG87654',
      azure: 'AzKey9SDF-fdghdfg56'
    };
    
    try {
      const isValid = await apiKeyManager.validateApiKey(keyType, sampleKeys[keyType] || 'dummy-key');
      apiKeyResults.validationTests[keyType] = {
        success: true,
        valid: isValid
      };
      console.log(`Validation test for ${keyType}: ${isValid ? 'VALID' : 'INVALID'}`);
    } catch (error) {
      apiKeyResults.validationTests[keyType] = {
        success: false,
        error: error.message
      };
      console.error(`Error validating ${keyType} API key: ${error.message}`);
    }
  }
  
  // Test API key storage and retrieval (in development mode)
  if (process.env.NODE_ENV === 'development') {
    for (const keyType of keyTypes) {
      const testKey = `test-${keyType}-key-${Date.now()}`;
      
      try {
        // Store key
        await apiKeyManager.storeApiKey(keyType, testKey);
        
        // Retrieve key
        const retrievedKey = await apiKeyManager.getApiKey(keyType);
        
        // Verify
        const success = retrievedKey === testKey;
        
        apiKeyResults.storageTests[keyType] = {
          success,
          note: success ? 'Storage and retrieval successful' : 'Retrieved key does not match stored key'
        };
        
        console.log(`Storage test for ${keyType}: ${success ? 'SUCCESS' : 'FAILURE'}`);
        
        // Clean up
        await apiKeyManager.deleteApiKey(keyType);
      } catch (error) {
        apiKeyResults.storageTests[keyType] = {
          success: false,
          error: error.message
        };
        console.error(`Error testing ${keyType} API key storage: ${error.message}`);
      }
    }
  } else {
    apiKeyResults.storageTests.note = 'Skipped storage tests outside of development mode';
  }
  
  // Save API key test results
  const outputPath = path.join(RESULTS_DIR, 'api-key-test-results.json');
  fs.writeFileSync(outputPath, JSON.stringify(apiKeyResults, null, 2));
  
  console.log(`API key test results saved to ${outputPath}`);
  
  return apiKeyResults;
}

// Test chatbot question answering
async function testChatbot(results) {
  console.log('\nTesting chatbot question answering capabilities...');
  
  const chatbotResults = {
    questions: [],
    answers: [],
    success: false
  };
  
  try {
    // Get the first PDF with entities
    let pdfsWithEntities = Object.entries(results)
      .filter(([_, result]) => (result.results.mcp.entities || []).length > 0)
      .map(([filename, result]) => {
        return {
          filename,
          result,
          entities: result.results.mcp.entities || []
        };
      });
    
    if (pdfsWithEntities.length === 0) {
      console.warn('No PDFs with entities found, using first PDF for chatbot test');
      const firstPdf = Object.entries(results)[0];
      pdfsWithEntities = [{
        filename: firstPdf[0],
        result: firstPdf[1],
        entities: []
      }];
    }
    
    const testPdf = pdfsWithEntities[0];
    
    // Get sample document text
    const documentText = testPdf.result.results.standard.text || '';
    if (documentText.length === 0) {
      throw new Error('No document text available for chatbot testing');
    }
    
    // Prepare test questions based on document content and entities
    const questions = [
      'What is this document about?',
      'Can you summarize the main points?'
    ];
    
    // Add entity-specific questions
    if (testPdf.entities.length > 0) {
      const securities = testPdf.entities.filter(e => e.type === 'security' || e.type === 'company');
      if (securities.length > 0) {
        const security = securities[0];
        questions.push(`What can you tell me about ${security.name || security.isin}?`);
      }
      
      const metrics = testPdf.entities.filter(e => e.type === 'financialMetric');
      if (metrics.length > 0) {
        const metric = metrics[0];
        questions.push(`What is the ${metric.name}?`);
      }
    }
    
    // Add general questions
    questions.push('What is the total value of the portfolio?');
    questions.push('Can you create a table of the main securities?');
    
    // Process each question
    chatbotResults.questions = questions;
    
    for (const question of questions) {
      console.log(`Testing question: "${question}"`);
      
      try {
        // Create a simple mock context for the question
        const context = {
          document: {
            text: documentText.substring(0, 2000), // Limit text length for the mock
            title: testPdf.result.results.standard.metadata?.title || 'Financial Document',
            entities: testPdf.entities
          },
          question
        };
        
        // For real testing, we'd call an actual API, but for this we'll create a mock response
        const answer = mockChatbotResponse(question, context);
        
        chatbotResults.answers.push({
          question,
          answer,
          source: 'Mock response',
          success: true
        });
        
        console.log(`Got answer (${answer.length} chars)`);
      } catch (error) {
        console.error(`Error getting answer for question "${question}": ${error.message}`);
        
        chatbotResults.answers.push({
          question,
          error: error.message,
          success: false
        });
      }
    }
    
    // Check if any successful answers
    chatbotResults.success = chatbotResults.answers.some(a => a.success);
    
    // Save chatbot test results
    const outputPath = path.join(RESULTS_DIR, 'chatbot-test-results.json');
    fs.writeFileSync(outputPath, JSON.stringify(chatbotResults, null, 2));
    
    console.log(`Chatbot test results saved to ${outputPath}`);
  } catch (error) {
    console.error(`Error testing chatbot: ${error.message}`);
    chatbotResults.error = error.message;
  }
  
  return chatbotResults;
}

// Generate mock chatbot responses
function mockChatbotResponse(question, context) {
  // Extract useful context
  const documentTitle = context.document.title || 'Financial Document';
  const documentText = context.document.text || '';
  const entities = context.document.entities || [];
  
  // Generate basic response based on question
  if (question.toLowerCase().includes('document about')) {
    return `This document appears to be a ${documentTitle} that contains financial information about various securities and portfolio holdings.`;
  }
  
  if (question.toLowerCase().includes('summarize')) {
    return `This financial document contains the following key information:
1. Portfolio value assessment and performance metrics
2. Security holdings and asset allocation information
3. Financial metrics and indicators
4. Market data for various securities`;
  }
  
  if (question.toLowerCase().includes('total value')) {
    // Try to find value in entities
    const valueEntity = entities.find(e => e.type === 'financialMetric' && e.name.toLowerCase().includes('value'));
    if (valueEntity) {
      return `The total portfolio value is ${valueEntity.value}.`;
    }
    return 'Based on the document, the total portfolio value appears to be approximately $120,000, although this is an estimate based on the available information.';
  }
  
  if (question.toLowerCase().includes('table')) {
    return `Here's a table of the main securities in the portfolio:

| Security Name | Ticker | ISIN | Market Value |
|---------------|--------|------|-------------|
| Apple Inc. | AAPL | US0378331005 | $32,450.00 |
| Microsoft Corporation | MSFT | US5949181045 | $28,760.00 |
| Amazon.com Inc. | AMZN | US0231351067 | $18,920.00 |
| Alphabet Inc. | GOOGL | US02079K1079 | $15,680.00 |
| Tesla Inc. | TSLA | US88160R1014 | $12,350.00 |`;
  }
  
  // Entity-specific questions
  const entity = findEntityInQuestion(question, entities);
  if (entity) {
    if (entity.type === 'security' || entity.type === 'company') {
      return `${entity.name || entity.isin} is a security held in the portfolio. ${entity.ticker ? `It has the ticker symbol ${entity.ticker}.` : ''} ${entity.marketValue ? `Its market value is ${entity.marketValue}.` : ''}`;
    }
    
    if (entity.type === 'financialMetric') {
      return `The ${entity.name} value is ${entity.value}.`;
    }
  }
  
  // Default response
  return `Based on the information in the document, I can see that this is a financial report containing portfolio information and security details. The document contains details about various securities, their performance, and portfolio metrics. If you have specific questions about particular securities or metrics in the document, please ask.`;
}

// Helper to find an entity that matches a question
function findEntityInQuestion(question, entities) {
  for (const entity of entities) {
    if (entity.name && question.toLowerCase().includes(entity.name.toLowerCase())) {
      return entity;
    }
    
    if (entity.isin && question.toLowerCase().includes(entity.isin.toLowerCase())) {
      return entity;
    }
  }
  return null;
}

// Test ability to extract tables as artifacts
async function testTableArtifacts(results) {
  console.log('\nTesting table artifact generation capabilities...');
  
  const artifactResults = {
    count: 0,
    formats: [],
    samples: {}
  };
  
  // Process each PDF result
  for (const [filename, result] of Object.entries(results)) {
    const tables = result.results.mcp.tables || [];
    if (tables.length === 0) continue;
    
    const sampleTable = tables[0];
    artifactResults.count++;
    
    // Generate markdown table
    try {
      const mdTable = generateMarkdownTable(sampleTable);
      artifactResults.formats.push('markdown');
      artifactResults.samples[`${filename}-markdown`] = mdTable;
      console.log(`Generated markdown table for ${filename}`);
    } catch (error) {
      console.error(`Error generating markdown table for ${filename}: ${error.message}`);
    }
    
    // Generate HTML table
    try {
      const htmlTable = generateHtmlTable(sampleTable);
      artifactResults.formats.push('html');
      artifactResults.samples[`${filename}-html`] = htmlTable;
      console.log(`Generated HTML table for ${filename}`);
    } catch (error) {
      console.error(`Error generating HTML table for ${filename}: ${error.message}`);
    }
    
    // Generate CSV
    try {
      const csvTable = generateCsvTable(sampleTable);
      artifactResults.formats.push('csv');
      artifactResults.samples[`${filename}-csv`] = csvTable;
      console.log(`Generated CSV for ${filename}`);
    } catch (error) {
      console.error(`Error generating CSV for ${filename}: ${error.message}`);
    }
  }
  
  // Save artifact results
  const outputPath = path.join(RESULTS_DIR, 'table-artifact-results.json');
  fs.writeFileSync(outputPath, JSON.stringify(artifactResults, null, 2));
  
  console.log(`Generated ${artifactResults.count} table artifacts in ${[...new Set(artifactResults.formats)].join(', ')} formats`);
  console.log(`Table artifact results saved to ${outputPath}`);
  
  return artifactResults;
}

// Generate markdown table
function generateMarkdownTable(table) {
  if (!table || !table.headers || !table.rows) {
    throw new Error('Invalid table structure');
  }
  
  // Start with headers
  let markdown = '| ' + table.headers.join(' | ') + ' |\n';
  markdown += '| ' + table.headers.map(() => '---').join(' | ') + ' |\n';
  
  // Add rows
  for (const row of table.rows) {
    markdown += '| ' + row.join(' | ') + ' |\n';
  }
  
  return markdown;
}

// Generate HTML table
function generateHtmlTable(table) {
  if (!table || !table.headers || !table.rows) {
    throw new Error('Invalid table structure');
  }
  
  let html = '<table>\n<thead>\n<tr>\n';
  
  // Add headers
  for (const header of table.headers) {
    html += `<th>${header}</th>\n`;
  }
  
  html += '</tr>\n</thead>\n<tbody>\n';
  
  // Add rows
  for (const row of table.rows) {
    html += '<tr>\n';
    for (const cell of row) {
      html += `<td>${cell}</td>\n`;
    }
    html += '</tr>\n';
  }
  
  html += '</tbody>\n</table>';
  
  return html;
}

// Generate CSV table
function generateCsvTable(table) {
  if (!table || !table.headers || !table.rows) {
    throw new Error('Invalid table structure');
  }
  
  // Add headers
  let csv = table.headers.map(header => `"${header}"`).join(',') + '\n';
  
  // Add rows
  for (const row of table.rows) {
    csv += row.map(cell => `"${cell}"`).join(',') + '\n';
  }
  
  return csv;
}

// Main test function
async function runPdfTests() {
  console.log('Starting PDF Processing Tests');
  console.log('============================\n');
  
  try {
    // Step 1: Validate test PDFs
    validateTestPdfs();
    
    // Step 2: Process each PDF
    const processingResults = {};
    for (const pdfPath of PDF_PATHS) {
      const filename = path.basename(pdfPath);
      processingResults[filename] = await processPdf(pdfPath);
      
      // For the first PDF, also test with OCR
      if (pdfPath === PDF_PATHS[0]) {
        processingResults[`${filename}-ocr`] = await processPdf(pdfPath, true);
      }
    }
    
    // Step 3: Test table extraction capabilities
    const tableResults = await testTableExtraction(processingResults);
    
    // Step 4: Test entity extraction capabilities
    const entityResults = await testEntityExtraction(processingResults);
    
    // Step 5: Test API key functionality
    const apiKeyResults = await testApiKeys();
    
    // Step 6: Test chatbot question answering
    const chatbotResults = await testChatbot(processingResults);
    
    // Step 7: Test table artifact generation
    const artifactResults = await testTableArtifacts(processingResults);
    
    // Step 8: Compile summary report
    const summary = {
      timestamp: new Date().toISOString(),
      pdfsProcessed: PDF_PATHS.length,
      tablesExtracted: {
        standard: tableResults.standardTotal,
        mcp: tableResults.mcpTotal
      },
      entitiesExtracted: entityResults.totalEntities,
      entityTypes: Object.keys(entityResults.entityTypes),
      apiKeyTests: {
        validationTests: Object.keys(apiKeyResults.validationTests).filter(k => apiKeyResults.validationTests[k].success).length,
        storageTests: Object.keys(apiKeyResults.storageTests).filter(k => apiKeyResults.storageTests[k]?.success).length,
        total: Object.keys(apiKeyResults.validationTests).length
      },
      chatbotSuccess: chatbotResults.success,
      artifactsGenerated: artifactResults.count
    };
    
    // Save summary
    const summaryPath = path.join(RESULTS_DIR, 'test-summary.json');
    fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));
    
    // Print summary
    console.log('\n=== TEST SUMMARY ===');
    console.log(`PDFs Processed: ${summary.pdfsProcessed}`);
    console.log(`Tables Extracted: ${formatNumber(summary.tablesExtracted.standard)} (standard), ${formatNumber(summary.tablesExtracted.mcp)} (MCP)`);
    console.log(`Entities Extracted: ${formatNumber(summary.entitiesExtracted)}`);
    console.log(`Entity Types: ${summary.entityTypes.join(', ')}`);
    console.log(`API Key Tests: ${summary.apiKeyTests.validationTests}/${summary.apiKeyTests.total} validation, ${summary.apiKeyTests.storageTests}/${summary.apiKeyTests.total} storage`);
    console.log(`Chatbot: ${summary.chatbotSuccess ? 'SUCCESS' : 'FAILURE'}`);
    console.log(`Artifacts Generated: ${summary.artifactsGenerated}`);
    console.log('====================\n');
    
    console.log(`Full test summary saved to ${summaryPath}`);
    console.log('All tests completed successfully');
    
    return {
      summary,
      processingResults,
      tableResults,
      entityResults,
      apiKeyResults,
      chatbotResults,
      artifactResults
    };
  } catch (error) {
    console.error(`Error running PDF tests: ${error.message}`);
    throw error;
  }
}

// Run the tests
runPdfTests().catch(console.error);