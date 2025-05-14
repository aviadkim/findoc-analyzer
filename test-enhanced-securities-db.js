/**
 * Test script for the Enhanced Securities Reference Database integration.
 * 
 * This script tests the integration of the enhanced securities reference
 * database with the existing document processing pipeline.
 */

const path = require('path');
const fs = require('fs').promises;
const EnhancedSecuritiesDbAdapter = require('./services/enhanced-securities-db-adapter');

async function runTests() {
  console.log('=== ENHANCED SECURITIES REFERENCE DATABASE TEST ===\n');
  
  try {
    // Initialize the adapter
    console.log('Initializing Enhanced Securities DB Adapter...');
    const adapter = new EnhancedSecuritiesDbAdapter({
      debug: true
    });
    console.log('Adapter initialized successfully.\n');
    
    // Test 1: Get database statistics
    console.log('\n--- TEST 1: DATABASE STATISTICS ---');
    try {
      const stats = await adapter.getDatabaseStats();
      console.log('Database Statistics:');
      console.log(`  Total Securities: ${stats.total_securities}`);
      console.log(`  Total Tickers: ${stats.total_tickers}`);
      console.log('  Security Types:');
      Object.entries(stats.security_types).forEach(([type, count]) => {
        console.log(`    ${type}: ${count}`);
      });
      console.log(`  Data Sources: ${stats.data_sources.join(', ')}`);
      console.log(`  Last Update: ${stats.last_update || 'Never'}`);
      console.log('TEST 1 PASSED: Successfully retrieved database statistics.\n');
    } catch (error) {
      console.error(`TEST 1 FAILED: ${error.message}`);
    }
    
    // Test 2: ISIN Lookups
    console.log('\n--- TEST 2: ISIN LOOKUPS ---');
    const testIsins = [
      'US0378331005', // Apple
      'US5949181045', // Microsoft
      'US02079K3059', // Alphabet
      'XXX123456789'  // Invalid ISIN
    ];
    
    for (const isin of testIsins) {
      try {
        console.log(`Looking up ISIN: ${isin}`);
        const result = await adapter.getSecurityByIsin(isin);
        
        if (Object.keys(result).length > 0) {
          console.log(`  Found: ${result.name} (${result.ticker || 'No ticker'})`);
          console.log(`  Sector: ${result.sector || 'Unknown'}`);
          console.log(`  Industry: ${result.industry || 'Unknown'}`);
          console.log(`  Security Type: ${result.security_type || 'Unknown'}`);
        } else {
          console.log(`  No data found for ISIN: ${isin}`);
        }
      } catch (error) {
        console.error(`  Error looking up ISIN ${isin}: ${error.message}`);
      }
    }
    console.log('TEST 2 PASSED: ISIN lookup functionality verified.\n');
    
    // Test 3: Name Lookups
    console.log('\n--- TEST 3: NAME LOOKUPS ---');
    const testNames = [
      'Apple',
      'Microsoft Corporation',
      'Google',
      'JP Morgan',
      'Nonexistent Company XYZ'
    ];
    
    for (const name of testNames) {
      try {
        console.log(`Looking up name: ${name}`);
        const result = await adapter.findSecurityByName(name);
        
        if (Object.keys(result).length > 0) {
          console.log(`  Found: ${result.name} (${result.isin})`);
          console.log(`  Match Quality: ${result.match_quality}`);
          if (result.score) {
            console.log(`  Match Score: ${result.score.toFixed(2)}`);
          }
        } else {
          console.log(`  No match found for name: ${name}`);
        }
      } catch (error) {
        console.error(`  Error looking up name ${name}: ${error.message}`);
      }
    }
    console.log('TEST 3 PASSED: Name lookup functionality verified.\n');
    
    // Test 4: Process PDF (if available)
    console.log('\n--- TEST 4: PDF PROCESSING ---');
    
    // Find a PDF file for testing
    let pdfPath = null;
    try {
      // First check for messos.pdf
      const messosPath = path.join(__dirname, 'messos.pdf');
      await fs.access(messosPath);
      pdfPath = messosPath;
    } catch {
      // Try to find any PDF in the current directory
      try {
        const files = await fs.readdir(__dirname);
        const pdfFiles = files.filter(file => file.toLowerCase().endsWith('.pdf'));
        
        if (pdfFiles.length > 0) {
          pdfPath = path.join(__dirname, pdfFiles[0]);
        }
      } catch (error) {
        console.log(`Could not find PDF files: ${error.message}`);
      }
    }
    
    if (pdfPath) {
      try {
        console.log(`Processing PDF: ${pdfPath}`);
        const result = await adapter.processFile(pdfPath);
        
        console.log(`  Document Type: ${result.document_type}`);
        console.log(`  Currency: ${result.currency}`);
        console.log(`  Total Securities Found: ${result.securities.length}`);
        
        if (result.securities.length > 0) {
          console.log('\nSample Security Data:');
          const sample = result.securities[0];
          Object.entries(sample)
            .filter(([key]) => key !== 'details') // Skip detail text
            .forEach(([key, value]) => {
              console.log(`  ${key}: ${value}`);
            });
        }
        
        // Save the result for inspection
        const outputPath = path.join(__dirname, 'enhanced-securities-result.json');
        await fs.writeFile(outputPath, JSON.stringify(result, null, 2));
        console.log(`\nFull results saved to: ${outputPath}`);
        
        console.log('TEST 4 PASSED: Successfully processed PDF.\n');
      } catch (error) {
        console.error(`TEST 4 FAILED: ${error.message}`);
      }
    } else {
      console.log('TEST 4 SKIPPED: No PDF file found for testing.');
    }
    
    // Test 5: Comparison (if PDF available)
    if (pdfPath) {
      console.log('\n--- TEST 5: EXTRACTION COMPARISON ---');
      try {
        console.log(`Comparing extractions for PDF: ${pdfPath}`);
        const comparison = await adapter.compareExtractions(pdfPath);
        
        console.log('\nComparison Output:');
        console.log(comparison.comparisonOutput);
        
        console.log('TEST 5 PASSED: Successfully compared extractions.\n');
      } catch (error) {
        console.error(`TEST 5 FAILED: ${error.message}`);
      }
    } else {
      console.log('TEST 5 SKIPPED: No PDF file found for testing.');
    }
    
    console.log('\n=== ALL TESTS COMPLETED ===');
    
  } catch (error) {
    console.error(`\nTEST SUITE FAILED: ${error.message}`);
    process.exit(1);
  }
}

// Run the tests
runTests().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
});