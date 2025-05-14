/**
 * Test Securities Extractor Integration
 *
 * This script tests the integration of the enhanced securities extractor v2
 * with the document processing pipeline.
 */

const fs = require('fs');
const path = require('path');

// Import the document processor
const documentProcessor = require('./services/document-processor');

// Import entity extractor for comparison
const entityExtractor = require('./services/entity-extractor');

// Import the securities extractor integration
const securitiesExtractorIntegration = require('./services/securities-extractor-integration');

// Import the enhanced securities extractor
const enhancedExtractor = require('./services/enhanced-securities-extractor-v2');

// Load test data
async function loadTestDocument(filePath) {
  try {
    console.log(`Loading test document: ${filePath}`);

    // Create a sample document
    const documentId = 'test-document-id';
    const fileName = path.basename(filePath);
    const contentType = path.extname(filePath).toLowerCase().slice(1);
    const userId = 'test-user';
    const tenantId = 'test-tenant';

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      throw new Error(`Test file not found: ${filePath}`);
    }

    // Create document
    const document = await documentProcessor.createDocument({
      fileName,
      filePath,
      contentType,
      userId,
      tenantId
    });

    console.log(`Created test document with ID: ${document.id}`);
    return document;
  } catch (error) {
    console.error(`Error loading test document: ${error.message}`);
    throw error;
  }
}

// Process test document
async function processTestDocument(document) {
  try {
    console.log(`Processing test document: ${document.id}`);

    // Process document with enhanced securities extraction
    const processedDocument = await documentProcessor.processDocument(document.id, {
      extractText: true,
      extractTables: true,
      extractMetadata: true,
      extractSecurities: true,
      useMcp: false // Don't use MCP for testing
    });

    console.log(`Successfully processed document with ID: ${document.id}`);
    return processedDocument;
  } catch (error) {
    console.error(`Error processing test document: ${error.message}`);
    throw error;
  }
}

// Analyze extracted securities
function analyzeSecurities(securities) {
  // Count securities
  console.log(`Found ${securities.length} securities`);

  // Count securities with complete information
  const complete = securities.filter(
    s => s.name && s.isin && s.price !== null && s.value !== null && s.quantity !== null
  );
  console.log(`Securities with complete information: ${complete.length} (${Math.round(complete.length / securities.length * 100)}%)`);

  // Count securities with ISIN, name, and at least one of price, value, or quantity
  const partial = securities.filter(
    s => s.name && s.isin && (s.price !== null || s.value !== null || s.quantity !== null)
  );
  console.log(`Securities with partial information: ${partial.length} (${Math.round(partial.length / securities.length * 100)}%)`);

  // Count securities with only ISIN and name
  const minimal = securities.filter(
    s => s.name && s.isin && s.price === null && s.value === null && s.quantity === null
  );
  console.log(`Securities with minimal information: ${minimal.length} (${Math.round(minimal.length / securities.length * 100)}%)`);

  // Return analysis
  return {
    total: securities.length,
    complete: complete.length,
    partial: partial.length,
    minimal: minimal.length,
    completePercentage: Math.round(complete.length / securities.length * 100),
    partialPercentage: Math.round(partial.length / securities.length * 100),
    minimalPercentage: Math.round(minimal.length / securities.length * 100)
  };
}

// Compare extraction results
async function compareExtractionMethods(document) {
  try {
    console.log('Comparing extraction methods...');

    // Get document content
    const content = await documentProcessor.getDocumentContent(document.id);

    if (!content || !content.content || !content.content.text) {
      throw new Error('Document content not found');
    }

    const documentContent = {
      text: content.content.text,
      tables: content.content.tables || [],
      financialData: {}
    };

    // 1. Extract with original method
    console.log('\n--- ORIGINAL EXTRACTION ---');
    const originalEntities = await entityExtractor.extractBasicFinancialEntities(documentContent.text);
    const originalSecurities = await entityExtractor.extractSecuritiesFromEntities(originalEntities);
    console.log(`Original extraction: ${originalSecurities.length} securities found`);
    const originalAnalysis = analyzeSecurities(originalSecurities);

    // 2. Extract with enhanced extractor directly
    console.log('\n--- ENHANCED EXTRACTOR V2 ---');
    const enhancedSecurities = await enhancedExtractor.extractSecurities(documentContent);
    console.log(`Enhanced extraction: ${enhancedSecurities.length} securities found`);
    const enhancedAnalysis = analyzeSecurities(enhancedSecurities);

    // 3. Extract with integrated method (document processor)
    console.log('\n--- INTEGRATED EXTRACTION (DOCUMENT PROCESSOR) ---');
    const integratedSecurities = content.content.securities;
    console.log(`Integrated extraction: ${integratedSecurities.length} securities found`);
    const integratedAnalysis = analyzeSecurities(integratedSecurities);

    // 4. Sample securities for comparison
    console.log('\n--- SAMPLE SECURITIES COMPARISON ---');

    const originalSample = originalSecurities.slice(0, 2);
    const enhancedSample = enhancedSecurities.slice(0, 2);
    const integratedSample = integratedSecurities.slice(0, 2);

    console.log('Original sample:');
    console.log(JSON.stringify(originalSample, null, 2));

    console.log('Enhanced sample:');
    console.log(JSON.stringify(enhancedSample, null, 2));

    console.log('Integrated sample:');
    console.log(JSON.stringify(integratedSample, null, 2));

    // 5. Calculate improvement percentages
    const enhancedImprovement = calculateImprovement(originalAnalysis, enhancedAnalysis);
    const integratedImprovement = calculateImprovement(originalAnalysis, integratedAnalysis);

    console.log('\n--- IMPROVEMENT SUMMARY ---');
    console.log(`Enhanced extractor v2 improvement: ${enhancedImprovement}%`);
    console.log(`Integrated extraction improvement: ${integratedImprovement}%`);

    return {
      original: originalAnalysis,
      enhanced: enhancedAnalysis,
      integrated: integratedAnalysis,
      enhancedImprovement,
      integratedImprovement
    };
  } catch (error) {
    console.error(`Error comparing extraction methods: ${error.message}`);
    throw error;
  }
}

// Calculate improvement percentage
function calculateImprovement(baseline, improved) {
  // Weighted improvement calculation
  const completeWeight = 0.7; // 70% weight for complete securities
  const partialWeight = 0.3; // 30% weight for partial securities

  const baselineScore = (baseline.completePercentage * completeWeight) +
                       (baseline.partialPercentage * partialWeight);

  const improvedScore = (improved.completePercentage * completeWeight) +
                       (improved.partialPercentage * partialWeight);

  // Calculate improvement percentage
  if (baselineScore === 0) {
    return improvedScore > 0 ? 100 : 0;
  }

  return Math.round(((improvedScore - baselineScore) / baselineScore) * 100);
}

// Test with multiple files to ensure robustness
async function runMultipleTests() {
  // Array of test files to process
  const testFiles = [
    {
      path: 'test-pdfs/messos.pdf',
      description: 'Messos Financial Statement'
    },
    // Add more test files if available
  ];

  const results = [];

  for (const testFile of testFiles) {
    try {
      console.log(`\n=== TESTING WITH: ${testFile.description} ===`);
      console.log(`File: ${testFile.path}`);

      // Load and process test document
      const document = await loadTestDocument(testFile.path);
      const processedDocument = await processTestDocument(document);

      // Compare extraction methods
      const comparison = await compareExtractionMethods(document);

      // Store results
      results.push({
        file: testFile.path,
        description: testFile.description,
        comparison
      });

      // Clean up
      await documentProcessor.deleteDocument(document.id);

    } catch (error) {
      console.error(`Error testing with ${testFile.path}: ${error.message}`);
    }
  }

  // Print summary results
  console.log('\n=== OVERALL RESULTS ===');
  for (const result of results) {
    console.log(`${result.description}:`);
    console.log(`- Original extraction: ${result.comparison.original.completePercentage}% complete securities`);
    console.log(`- Enhanced extraction: ${result.comparison.enhanced.completePercentage}% complete securities (${result.comparison.enhancedImprovement}% improvement)`);
    console.log(`- Integrated extraction: ${result.comparison.integrated.completePercentage}% complete securities (${result.comparison.integratedImprovement}% improvement)`);
  }
}

// Run the tests
console.log('Starting Securities Extractor V2 Integration Test...');
runMultipleTests()
  .then(() => {
    console.log('Tests completed successfully');
  })
  .catch(error => {
    console.error(`Test failed: ${error.message}`);
  });