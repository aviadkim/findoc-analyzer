/**
 * Simple Test for Enhanced Securities Extractor V2
 * 
 * This script tests the enhanced securities extractor v2 with sample data
 * without relying on the full document processing pipeline.
 */

const fs = require('fs');
const path = require('path');

// Import the required modules
const enhancedExtractor = require('./services/enhanced-securities-extractor-v2');
const securitiesIntegration = require('./services/securities-extractor-integration');

// Sample text from messos.pdf for testing
const sampleText = fs.readFileSync(path.join(__dirname, 'messos-text-sample.txt'), 'utf8');

// Sample tables structure (simplified)
const sampleTables = [
  {
    title: 'Securities',
    headers: ['Security', 'ISIN', 'Quantity', 'Price', 'Value'],
    rows: [
      ['Microsoft Corp', 'US5949181045', '100', '300.50', '30050.00'],
      ['Apple Inc', 'US0378331005', '50', '180.95', '9047.50'],
      ['Amazon.com Inc', 'US0231351067', '20', '130.00', '2600.00']
    ]
  }
];

// Create a sample document content object
const sampleContent = {
  text: sampleText,
  tables: sampleTables,
  financialData: {}
};

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
  
  // Display a few examples
  console.log('\nSample securities:');
  const samples = securities.slice(0, 3);
  console.log(JSON.stringify(samples, null, 2));
  
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

// Test the enhanced securities extractor directly
async function testEnhancedExtractor() {
  try {
    console.log('Testing enhanced securities extractor v2...');
    
    // Extract securities with enhanced extractor
    const securities = await enhancedExtractor.extractSecurities(sampleContent);
    
    console.log('\n--- ENHANCED EXTRACTOR RESULTS ---');
    const analysis = analyzeSecurities(securities);
    
    return analysis;
  } catch (error) {
    console.error(`Error testing enhanced extractor: ${error.message}`);
    throw error;
  }
}

// Test the securities extractor integration
async function testExtractorIntegration() {
  try {
    console.log('\nTesting securities extractor integration...');
    
    // Extract securities with integration module
    const securities = await securitiesIntegration.extractSecuritiesEnhanced(sampleContent);
    
    console.log('\n--- INTEGRATION RESULTS ---');
    const analysis = analyzeSecurities(securities);
    
    return analysis;
  } catch (error) {
    console.error(`Error testing extractor integration: ${error.message}`);
    throw error;
  }
}

// Compare extraction with original text vs. tables
async function compareExtractionSources() {
  try {
    console.log('\nComparing extraction from different sources...');
    
    // Test with only text
    const textOnlyContent = {
      text: sampleText,
      tables: [],
      financialData: {}
    };
    
    // Test with only tables
    const tablesOnlyContent = {
      text: '',
      tables: sampleTables,
      financialData: {}
    };
    
    // Extract from each source
    console.log('\n--- TEXT-ONLY EXTRACTION ---');
    const textSecurities = await enhancedExtractor.extractSecurities(textOnlyContent);
    const textAnalysis = analyzeSecurities(textSecurities);
    
    console.log('\n--- TABLES-ONLY EXTRACTION ---');
    const tableSecurities = await enhancedExtractor.extractSecurities(tablesOnlyContent);
    const tableAnalysis = analyzeSecurities(tableSecurities);
    
    console.log('\n--- COMBINED EXTRACTION ---');
    const combinedSecurities = await enhancedExtractor.extractSecurities(sampleContent);
    const combinedAnalysis = analyzeSecurities(combinedSecurities);
    
    // Check for overlapping securities between text and tables
    const textIsins = new Set(textSecurities.map(s => s.isin));
    const tableIsins = new Set(tableSecurities.map(s => s.isin));
    
    const overlap = [...textIsins].filter(isin => tableIsins.has(isin));
    
    console.log(`\nOverlapping securities (found in both text and tables): ${overlap.length}`);
    console.log(`Unique securities from text: ${textIsins.size - overlap.length}`);
    console.log(`Unique securities from tables: ${tableIsins.size - overlap.length}`);
    console.log(`Total unique securities: ${combinedSecurities.length}`);
    
    return {
      textAnalysis,
      tableAnalysis,
      combinedAnalysis,
      overlap: overlap.length,
      textOnly: textIsins.size - overlap.length,
      tableOnly: tableIsins.size - overlap.length,
      total: combinedSecurities.length
    };
  } catch (error) {
    console.error(`Error comparing extraction sources: ${error.message}`);
    throw error;
  }
}

// Run all tests
async function runAllTests() {
  try {
    // Test the enhanced extractor
    const enhancedResults = await testEnhancedExtractor();
    
    // Test the integration module
    const integrationResults = await testExtractorIntegration();
    
    // Compare extraction sources
    const comparisonResults = await compareExtractionSources();
    
    // Print final summary
    console.log('\n=== FINAL SUMMARY ===');
    console.log(`Enhanced extractor found ${enhancedResults.total} securities with ${enhancedResults.completePercentage}% complete information`);
    console.log(`Integration module found ${integrationResults.total} securities with ${integrationResults.completePercentage}% complete information`);
    console.log(`Source comparison shows ${comparisonResults.total} unique securities from all sources`);
    
    // Return all results
    return {
      enhancedResults,
      integrationResults,
      comparisonResults
    };
  } catch (error) {
    console.error(`Error running tests: ${error.message}`);
    throw error;
  }
}

// Run the test if this is the main module
if (require.main === module) {
  console.log('Starting Enhanced Securities Extractor Test...');
  runAllTests()
    .then(results => {
      console.log('All tests completed successfully!');
    })
    .catch(error => {
      console.error(`Tests failed: ${error.message}`);
      process.exit(1);
    });
}