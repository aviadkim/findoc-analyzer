/**
 * Enhanced Extraction Evaluation Script
 * 
 * This script tests the original vs enhanced securities extraction on sample financial PDFs.
 */

const fs = require('fs');
const path = require('path');
const { processPdf } = require('./services/pdf-processor');
const { extractFinancialData } = require('./services/financial-data-extractor');
const { extractSecurities: extractSecuritiesOriginal } = require('./services/securities-extractor');
const { extractSecurities: extractSecuritiesEnhanced } = require('./services/enhanced-securities-extractor');

// Test PDF files - add paths to your test PDFs here
const testPdfs = [
  {
    name: 'messos.pdf',
    path: path.join(__dirname, 'test-pdfs', 'messos.pdf'),
    expectedIsinCount: 20, // Approximate expected ISIN count
    expectedSecuritiesCount: 15 // Approximate expected securities count
  }
];

// Function to evaluate extraction quality
function evaluateExtraction(securities, expectedIsinCount) {
  // Count securities with ISINs
  const securityCount = securities.length;
  const securityWithIsinCount = securities.filter(s => s.isin).length;

  // Count securities with name, price, and value
  const securityWithNameCount = securities.filter(s => s.name && s.name !== `Security with ISIN ${s.isin}`).length;
  const securityWithPriceCount = securities.filter(s => s.price !== null).length;
  const securityWithValueCount = securities.filter(s => s.value !== null).length;
  const securityWithTypeCount = securities.filter(s => s.type && s.type !== 'unknown').length;

  // Calculate scores
  const isinScore = securityWithIsinCount > 0 ? Math.min(securityWithIsinCount / expectedIsinCount, 1) * 100 : 0;
  const nameScore = securityWithIsinCount > 0 ? (securityWithNameCount / securityWithIsinCount) * 100 : 0;
  const priceScore = securityWithIsinCount > 0 ? (securityWithPriceCount / securityWithIsinCount) * 100 : 0;
  const valueScore = securityWithIsinCount > 0 ? (securityWithValueCount / securityWithIsinCount) * 100 : 0;
  const typeScore = securityWithIsinCount > 0 ? (securityWithTypeCount / securityWithIsinCount) * 100 : 0;

  // Calculate overall score (weighted average)
  const overallScore = (
    (isinScore * 0.3) + 
    (nameScore * 0.2) + 
    (priceScore * 0.2) + 
    (valueScore * 0.2) + 
    (typeScore * 0.1)
  );

  return {
    securityCount,
    securityWithIsinCount,
    securityWithNameCount,
    securityWithPriceCount,
    securityWithValueCount,
    securityWithTypeCount,
    scores: {
      isinScore: Math.round(isinScore),
      nameScore: Math.round(nameScore),
      priceScore: Math.round(priceScore),
      valueScore: Math.round(valueScore),
      typeScore: Math.round(typeScore),
      overallScore: Math.round(overallScore)
    }
  };
}

// Function to print securities
function printSecurities(securities, limit = 10) {
  if (securities.length === 0) {
    console.log('No securities found');
    return;
  }

  console.log(`Found ${securities.length} securities:`);
  const displayCount = Math.min(limit, securities.length);
  
  for (let i = 0; i < displayCount; i++) {
    const security = securities[i];
    console.log(`${i+1}. ISIN: ${security.isin || 'N/A'}`);
    console.log(`   Name: ${security.name || 'N/A'}`);
    console.log(`   Type: ${security.type || 'N/A'}`);
    console.log(`   Price: ${security.price !== null ? security.price : 'N/A'}`);
    console.log(`   Value: ${security.value !== null ? security.value : 'N/A'}`);
    console.log(`   Quantity: ${security.quantity !== null ? security.quantity : 'N/A'}`);
    console.log('');
  }

  if (securities.length > limit) {
    console.log(`... and ${securities.length - limit} more securities`);
  }
}

// Main test function
async function testEnhancedExtraction() {
  console.log('Testing enhanced vs original extraction for financial documents');
  console.log('==============================================================\n');

  for (const testPdf of testPdfs) {
    console.log(`Processing ${testPdf.name}...`);
    
    try {
      // Process the PDF
      const pdfData = await processPdf(testPdf.path, { useOcr: false });
      console.log(`Extracted ${pdfData.text.length} characters of text and ${pdfData.tables.length} tables`);

      // Extract ISINs using regex for baseline
      const isinPattern = /[A-Z]{2}[A-Z0-9]{10}/g;
      const isinMatches = [...pdfData.text.matchAll(isinPattern)];
      const uniqueIsins = [...new Set(isinMatches.map(match => match[0]))];
      console.log(`Raw ISIN extraction found ${uniqueIsins.length} unique ISINs`);

      console.log('\nTesting original extraction:');
      console.time('original-extraction');
      
      // Test original extraction
      const originalSecurities = await extractSecuritiesOriginal({
        text: pdfData.text,
        tables: pdfData.tables
      });
      console.timeEnd('original-extraction');
      
      // Evaluate original extraction
      const originalEvaluation = evaluateExtraction(originalSecurities, testPdf.expectedIsinCount);
      
      console.log('\nTesting enhanced extraction:');
      console.time('enhanced-extraction');
      
      // Test enhanced extraction
      const enhancedSecurities = await extractSecuritiesEnhanced({
        text: pdfData.text,
        tables: pdfData.tables,
        financialData: { portfolioInfo: { currency: 'USD' } }
      });
      console.timeEnd('enhanced-extraction');
      
      // Evaluate enhanced extraction
      const enhancedEvaluation = evaluateExtraction(enhancedSecurities, testPdf.expectedIsinCount);

      // Print comparison
      console.log('\nExtraction Results Comparison:');
      console.log('=============================');
      console.log(`Document: ${testPdf.name}`);
      console.log(`Raw ISIN count: ${uniqueIsins.length}`);
      console.log('');
      
      console.log('Original Extractor:');
      console.log(`- Securities found: ${originalEvaluation.securityCount}`);
      console.log(`- Securities with ISIN: ${originalEvaluation.securityWithIsinCount}`);
      console.log(`- Securities with name: ${originalEvaluation.securityWithNameCount}`);
      console.log(`- Securities with price: ${originalEvaluation.securityWithPriceCount}`);
      console.log(`- Securities with value: ${originalEvaluation.securityWithValueCount}`);
      console.log('Scores:');
      console.log(`- ISIN extraction: ${originalEvaluation.scores.isinScore}%`);
      console.log(`- Name extraction: ${originalEvaluation.scores.nameScore}%`);
      console.log(`- Price extraction: ${originalEvaluation.scores.priceScore}%`);
      console.log(`- Value extraction: ${originalEvaluation.scores.valueScore}%`);
      console.log(`- Type extraction: ${originalEvaluation.scores.typeScore}%`);
      console.log(`- Overall score: ${originalEvaluation.scores.overallScore}%`);
      console.log('');
      
      console.log('Enhanced Extractor:');
      console.log(`- Securities found: ${enhancedEvaluation.securityCount}`);
      console.log(`- Securities with ISIN: ${enhancedEvaluation.securityWithIsinCount}`);
      console.log(`- Securities with name: ${enhancedEvaluation.securityWithNameCount}`);
      console.log(`- Securities with price: ${enhancedEvaluation.securityWithPriceCount}`);
      console.log(`- Securities with value: ${enhancedEvaluation.securityWithValueCount}`);
      console.log('Scores:');
      console.log(`- ISIN extraction: ${enhancedEvaluation.scores.isinScore}%`);
      console.log(`- Name extraction: ${enhancedEvaluation.scores.nameScore}%`);
      console.log(`- Price extraction: ${enhancedEvaluation.scores.priceScore}%`);
      console.log(`- Value extraction: ${enhancedEvaluation.scores.valueScore}%`);
      console.log(`- Type extraction: ${enhancedEvaluation.scores.typeScore}%`);
      console.log(`- Overall score: ${enhancedEvaluation.scores.overallScore}%`);

      console.log('\nImprovement:');
      const overallImprovement = enhancedEvaluation.scores.overallScore - originalEvaluation.scores.overallScore;
      console.log(`- Overall score improvement: ${overallImprovement > 0 ? '+' : ''}${overallImprovement}%`);
      
      // Print sample securities
      console.log('\nSample Original Securities:');
      printSecurities(originalSecurities, 5);
      
      console.log('\nSample Enhanced Securities:');
      printSecurities(enhancedSecurities, 5);
      
      // Save results to JSON for further analysis
      const results = {
        document: testPdf.name,
        rawIsinCount: uniqueIsins.length,
        uniqueIsins,
        original: {
          evaluation: originalEvaluation,
          securities: originalSecurities
        },
        enhanced: {
          evaluation: enhancedEvaluation,
          securities: enhancedSecurities
        },
        improvement: {
          overallScore: overallImprovement,
          securityCount: enhancedEvaluation.securityCount - originalEvaluation.securityCount,
          securityWithIsinCount: enhancedEvaluation.securityWithIsinCount - originalEvaluation.securityWithIsinCount,
          securityWithNameCount: enhancedEvaluation.securityWithNameCount - originalEvaluation.securityWithNameCount,
          securityWithPriceCount: enhancedEvaluation.securityWithPriceCount - originalEvaluation.securityWithPriceCount,
          securityWithValueCount: enhancedEvaluation.securityWithValueCount - originalEvaluation.securityWithValueCount
        }
      };
      
      fs.writeFileSync(
        path.join(__dirname, `extraction-test-results-${testPdf.name.replace('.pdf', '')}.json`),
        JSON.stringify(results, null, 2)
      );
      console.log(`\nResults saved to extraction-test-results-${testPdf.name.replace('.pdf', '')}.json`);
      
    } catch (error) {
      console.error(`Error testing ${testPdf.name}:`, error);
    }
    
    console.log('\n-------------------------------------------\n');
  }
  
  console.log('All tests completed');
}

// Run the tests
testEnhancedExtraction().catch(error => {
  console.error('Error during testing:', error);
});