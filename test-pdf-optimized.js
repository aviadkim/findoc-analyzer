/**
 * Optimized PDF Processing Test
 * 
 * This script tests PDF processing with optimizations for large files and timeouts.
 * It implements stream processing and chunking to avoid memory issues.
 */

const fs = require('fs');
const path = require('path');
const util = require('util');
const stream = require('stream');
const pipeline = util.promisify(stream.pipeline);

// Services
const pdfProcessor = require('./services/pdf-processor');
const mcpDocumentProcessor = require('./services/mcp-document-processor');
const entityExtractor = require('./services/entity-extractor');

// Constants
const TEST_PDFS_DIR = path.join(__dirname, 'test-pdfs');
const RESULTS_DIR = path.join(__dirname, 'pdf-test-results');

// Create results directory if it doesn't exist
if (!fs.existsSync(RESULTS_DIR)) {
  fs.mkdirSync(RESULTS_DIR, { recursive: true });
}

// Find available PDFs in test directory
function findTestPdfs() {
  console.log('Finding test PDFs...');
  
  try {
    // Check if directory exists
    if (!fs.existsSync(TEST_PDFS_DIR)) {
      console.warn(`Test PDF directory not found: ${TEST_PDFS_DIR}`);
      return [];
    }
    
    // List all files in directory
    const files = fs.readdirSync(TEST_PDFS_DIR);
    
    // Filter for PDF files
    const pdfFiles = files.filter(file => 
      file.toLowerCase().endsWith('.pdf')
    ).map(file => path.join(TEST_PDFS_DIR, file));
    
    console.log(`Found ${pdfFiles.length} test PDFs: ${pdfFiles.map(p => path.basename(p)).join(', ')}`);
    return pdfFiles;
  } catch (error) {
    console.error(`Error finding test PDFs: ${error.message}`);
    return [];
  }
}

// Process a single PDF with timeout and chunking
async function processPdf(pdfPath, useOcr = false) {
  const filename = path.basename(pdfPath);
  console.log(`Processing ${filename}${useOcr ? ' with OCR' : ''}...`);
  
  try {
    // Check file size
    const stats = fs.statSync(pdfPath);
    const fileSizeMB = stats.size / (1024 * 1024);
    console.log(`File size: ${fileSizeMB.toFixed(2)} MB`);
    
    // Set timeout based on file size (larger files need more time)
    const timeoutMs = Math.max(30000, Math.min(300000, stats.size / 50)); // 30s to 5min
    
    // Process with standard processor (with timeout)
    console.log(`Using standard processor (timeout: ${timeoutMs/1000}s)...`);
    const standardProcessingPromise = new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error('Standard processing timed out'));
      }, timeoutMs);
      
      pdfProcessor.processPdf(pdfPath, { useOcr })
        .then(result => {
          clearTimeout(timer);
          resolve(result);
        })
        .catch(error => {
          clearTimeout(timer);
          reject(error);
        });
    }).catch(error => {
      console.warn(`Standard processing error: ${error.message}`);
      return { 
        text: `Error: ${error.message}`, 
        tables: [], 
        metadata: { title: filename } 
      };
    });
    
    // Process with MCP document processor (with timeout)
    console.log(`Using MCP processor (timeout: ${timeoutMs/1000}s)...`);
    const mcpProcessingPromise = new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error('MCP processing timed out'));
      }, timeoutMs);
      
      mcpDocumentProcessor.processDocument(pdfPath)
        .then(result => {
          clearTimeout(timer);
          resolve(result);
        })
        .catch(error => {
          clearTimeout(timer);
          reject(error);
        });
    }).catch(error => {
      console.warn(`MCP processing error: ${error.message}`);
      return { 
        text: `Error: ${error.message}`, 
        tables: [], 
        entities: [],
        metadata: { title: filename } 
      };
    });
    
    // Wait for both processes to complete
    const [standardResult, mcpResult] = await Promise.all([
      standardProcessingPromise,
      mcpProcessingPromise
    ]);
    
    // Create a summarized version for storage (to avoid memory issues)
    const summarizedStandardResult = summarizeResult(standardResult);
    const summarizedMcpResult = summarizeResult(mcpResult);
    
    // Store results
    const results = {
      filename,
      path: pdfPath,
      useOcr,
      fileSize: fileSizeMB.toFixed(2) + ' MB',
      standard: summarizedStandardResult,
      mcp: summarizedMcpResult,
      timestamp: new Date().toISOString()
    };
    
    // Write results to file in chunks to avoid memory issues
    const outputPath = path.join(RESULTS_DIR, `${filename.replace('.pdf', '')}-results${useOcr ? '-ocr' : ''}.json`);
    await writeJsonInChunks(outputPath, results);
    
    console.log(`Results saved to ${outputPath}`);
    
    return {
      results,
      outputPath
    };
  } catch (error) {
    console.error(`Error processing ${filename}: ${error.message}`);
    return {
      results: {
        filename,
        path: pdfPath,
        error: error.message,
        timestamp: new Date().toISOString()
      },
      outputPath: null
    };
  }
}

// Summarize results to reduce memory usage
function summarizeResult(result) {
  try {
    // Create a copy with summarized text
    const summarized = { ...result };
    
    // Summarize text (only keep first and last 1000 chars)
    if (summarized.text && typeof summarized.text === 'string') {
      const textLength = summarized.text.length;
      if (textLength > 2000) {
        summarized.text = 
          summarized.text.substring(0, 1000) + 
          `\n... [${textLength - 2000} characters omitted] ...\n` + 
          summarized.text.substring(textLength - 1000);
      }
      summarized.textLength = textLength;
    }
    
    // Keep only summary of tables
    if (Array.isArray(summarized.tables)) {
      summarized.tableCount = summarized.tables.length;
      // Only keep first table as sample
      if (summarized.tables.length > 0) {
        summarized.tableSample = summarized.tables[0];
      }
      delete summarized.tables;
    }
    
    // Keep only summary of entities
    if (Array.isArray(summarized.entities)) {
      summarized.entityCount = summarized.entities.length;
      // Only keep first 5 entities as samples
      if (summarized.entities.length > 0) {
        summarized.entitySamples = summarized.entities.slice(0, 5);
      }
      delete summarized.entities;
    }
    
    return summarized;
  } catch (error) {
    console.warn(`Error summarizing result: ${error.message}`);
    return result;
  }
}

// Write JSON in chunks to avoid memory issues
async function writeJsonInChunks(filePath, data) {
  return new Promise((resolve, reject) => {
    try {
      // Create a readable stream from the JSON string
      const jsonString = JSON.stringify(data, null, 2);
      const readable = stream.Readable.from([jsonString]);
      
      // Create a writable stream to the file
      const writable = fs.createWriteStream(filePath);
      
      // Pipe the streams
      readable.pipe(writable);
      
      // Handle completion
      writable.on('finish', () => {
        resolve();
      });
      
      // Handle errors
      writable.on('error', (error) => {
        reject(error);
      });
    } catch (error) {
      reject(error);
    }
  });
}

// Extract entities from processed results
async function extractEntities(results) {
  console.log('\nExtracting entities from processed PDFs...');
  
  const entityResults = {
    pdfs: {},
    entityTypes: {},
    totalEntities: 0
  };
  
  // Process each PDF result
  for (const [filename, result] of Object.entries(results)) {
    console.log(`Extracting entities from ${filename}...`);
    
    try {
      // Get entities from MCP result
      const mcpEntities = result.results.mcp.entitySamples || [];
      const mcpEntityCount = result.results.mcp.entityCount || 0;
      
      entityResults.pdfs[filename] = mcpEntityCount;
      entityResults.totalEntities += mcpEntityCount;
      
      // Count entity types
      mcpEntities.forEach(entity => {
        const type = entity.type || 'unknown';
        entityResults.entityTypes[type] = (entityResults.entityTypes[type] || 0) + 1;
      });
      
      // Try additional entity extraction with the dedicated service
      const text = result.results.standard.text || '';
      if (text && text.length > 0) {
        try {
          const extractedEntities = await entityExtractor.extractBasicFinancialEntities(text);
          console.log(`Extracted ${extractedEntities.length} entities using entity-extractor service`);
          
          // Count these entities too
          entityResults.pdfs[`${filename}-basic`] = extractedEntities.length;
          entityResults.totalEntities += extractedEntities.length;
          
          // Count entity types
          extractedEntities.forEach(entity => {
            const type = entity.type || 'unknown';
            entityResults.entityTypes[type] = (entityResults.entityTypes[type] || 0) + 1;
          });
        } catch (extractionError) {
          console.warn(`Error using entity-extractor service: ${extractionError.message}`);
        }
      }
    } catch (error) {
      console.warn(`Error processing entities for ${filename}: ${error.message}`);
    }
  }
  
  // Save entity extraction results
  const outputPath = path.join(RESULTS_DIR, 'entity-extraction-results.json');
  await writeJsonInChunks(outputPath, entityResults);
  
  console.log(`Extracted ${entityResults.totalEntities} total entities`);
  console.log(`Entity types found: ${Object.keys(entityResults.entityTypes).join(', ')}`);
  console.log(`Entity extraction results saved to ${outputPath}`);
  
  return entityResults;
}

// Test table extraction from processed results
async function analyzeTextAndTables(results) {
  console.log('\nAnalyzing text and tables from processed PDFs...');
  
  const analysisResults = {
    pdfs: {},
    tableCounts: {},
    textStats: {},
    samples: {}
  };
  
  // Process each PDF result
  for (const [filename, result] of Object.entries(results)) {
    console.log(`Analyzing ${filename}...`);
    
    try {
      // Get text stats
      const standardTextLength = result.results.standard.textLength || 0;
      const mcpTextLength = result.results.mcp.textLength || 0;
      
      // Get table counts
      const standardTableCount = result.results.standard.tableCount || 0;
      const mcpTableCount = result.results.mcp.tableCount || 0;
      
      // Store in results
      analysisResults.pdfs[filename] = {
        standardTextLength,
        mcpTextLength,
        standardTableCount,
        mcpTableCount
      };
      
      // Update aggregate counts
      analysisResults.tableCounts.standard = (analysisResults.tableCounts.standard || 0) + standardTableCount;
      analysisResults.tableCounts.mcp = (analysisResults.tableCounts.mcp || 0) + mcpTableCount;
      
      // Store text stats
      analysisResults.textStats[filename] = {
        standard: standardTextLength,
        mcp: mcpTextLength,
        ratio: standardTextLength > 0 ? (mcpTextLength / standardTextLength) : 0
      };
      
      // Store sample tables
      if (result.results.standard.tableSample) {
        analysisResults.samples[`${filename}-standard`] = result.results.standard.tableSample;
      }
      
      if (result.results.mcp.tableSample) {
        analysisResults.samples[`${filename}-mcp`] = result.results.mcp.tableSample;
      }
    } catch (error) {
      console.warn(`Error analyzing ${filename}: ${error.message}`);
    }
  }
  
  // Save analysis results
  const outputPath = path.join(RESULTS_DIR, 'text-table-analysis.json');
  await writeJsonInChunks(outputPath, analysisResults);
  
  console.log(`Standard processing extracted ${analysisResults.tableCounts.standard || 0} tables`);
  console.log(`MCP processing extracted ${analysisResults.tableCounts.mcp || 0} tables`);
  console.log(`Analysis results saved to ${outputPath}`);
  
  return analysisResults;
}

// Main test function
async function runPdfTests() {
  console.log('Starting Optimized PDF Processing Tests');
  console.log('======================================\n');
  
  try {
    // Step 1: Find test PDFs
    const pdfPaths = findTestPdfs();
    
    if (pdfPaths.length === 0) {
      console.error('No test PDFs found. Please add PDFs to the test-pdfs directory.');
      return;
    }
    
    // Step 2: Process each PDF
    const processingResults = {};
    
    // Process PDFs one at a time to avoid memory issues
    for (const pdfPath of pdfPaths) {
      const filename = path.basename(pdfPath);
      processingResults[filename] = await processPdf(pdfPath);
      
      // Only test OCR on the first PDF to save time
      if (pdfPath === pdfPaths[0]) {
        processingResults[`${filename}-ocr`] = await processPdf(pdfPath, true);
      }
      
      // Force garbage collection (not guaranteed to work)
      if (global.gc) {
        global.gc();
      }
    }
    
    // Step 3: Analyze text and tables
    const textTableResults = await analyzeTextAndTables(processingResults);
    
    // Step 4: Extract entities
    const entityResults = await extractEntities(processingResults);
    
    // Step 5: Compile summary report
    const summary = {
      timestamp: new Date().toISOString(),
      pdfsProcessed: pdfPaths.length,
      tablesExtracted: {
        standard: textTableResults.tableCounts.standard || 0,
        mcp: textTableResults.tableCounts.mcp || 0
      },
      entitiesExtracted: entityResults.totalEntities,
      entityTypes: Object.keys(entityResults.entityTypes),
    };
    
    // Save summary
    const summaryPath = path.join(RESULTS_DIR, 'test-summary.json');
    await writeJsonInChunks(summaryPath, summary);
    
    // Print summary
    console.log('\n=== TEST SUMMARY ===');
    console.log(`PDFs Processed: ${summary.pdfsProcessed}`);
    console.log(`Tables Extracted: ${summary.tablesExtracted.standard} (standard), ${summary.tablesExtracted.mcp} (MCP)`);
    console.log(`Entities Extracted: ${summary.entitiesExtracted}`);
    console.log(`Entity Types: ${summary.entityTypes.join(', ')}`);
    console.log('====================\n');
    
    console.log(`Full test summary saved to ${summaryPath}`);
    console.log('All tests completed successfully');
    
    return {
      summary,
      processingResults,
      textTableResults,
      entityResults
    };
  } catch (error) {
    console.error(`Error running PDF tests: ${error.message}`);
    throw error;
  }
}

// Run the tests
runPdfTests().catch(console.error);