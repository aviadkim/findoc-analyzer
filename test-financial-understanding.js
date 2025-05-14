/**
 * Test script to demonstrate the system's understanding of financial data
 */

const fs = require('fs');
const path = require('path');
const { processPdf } = require('./services/pdf-processor');
const { extractFinancialData } = require('./services/enhanced-financial-extractor');

// Path to test PDFs directory
const testPdfsDir = path.join(__dirname, 'test-pdfs');
const messosPath = path.join(testPdfsDir, 'messos.pdf');

// Test function
async function testFinancialUnderstanding() {
  try {
    console.log('Testing financial data understanding...');

    // Process the PDF
    console.log('Processing PDF...');
    const pdfData = await processPdf(messosPath, { useOcr: false });

    console.log(`Extracted ${pdfData.text.length} characters of text`);
    console.log(`Detected ${pdfData.tables.length} tables`);

    // Extract financial data
    console.log('\nExtracting financial data...');
    const financialData = await extractFinancialData(pdfData.text, pdfData.tables);

    // Test 1: Check if the system understands portfolio total value
    console.log('\n=== TEST 1: Portfolio Total Value ===');
    console.log(`Portfolio total value: ${financialData.portfolioInfo.totalValue || 'Not found'} ${financialData.portfolioInfo.currency || 'USD'}`);

    // Test 2: Check if the system extracts securities with prices and values
    console.log('\n=== TEST 2: Securities with Prices and Values ===');
    if (financialData.securities && Array.isArray(financialData.securities) && financialData.securities.length > 0) {
      console.log(`Found ${financialData.securities.length} securities`);

      // Count securities with prices and values
      const securitiesWithPrice = financialData.securities.filter(s => s.price !== undefined && s.price !== null);
      const securitiesWithValue = financialData.securities.filter(s => s.value !== undefined && s.value !== null);

      console.log(`Securities with price: ${securitiesWithPrice.length}`);
      console.log(`Securities with value: ${securitiesWithValue.length}`);

      // Show some examples
      if (securitiesWithPrice.length > 0) {
        console.log('\nSample securities with prices:');
        securitiesWithPrice.slice(0, 5).forEach((security, index) => {
          console.log(`${index + 1}. ${security.name}: ${security.price} ${financialData.portfolioInfo.currency || 'USD'}`);
        });
      }

      if (securitiesWithValue.length > 0) {
        console.log('\nSample securities with values:');
        securitiesWithValue.slice(0, 5).forEach((security, index) => {
          console.log(`${index + 1}. ${security.name}: ${security.value} ${financialData.portfolioInfo.currency || 'USD'}`);
        });
      }
    } else {
      console.log('No securities found');
    }

    // Test 3: Check if the system can calculate the sum of security values
    console.log('\n=== TEST 3: Sum of Security Values ===');
    if (financialData.securities && Array.isArray(financialData.securities) && financialData.securities.length > 0) {
      // Calculate sum of security values
      const securitiesWithValue = financialData.securities.filter(s => s.value !== undefined && s.value !== null);
      const sumOfValues = securitiesWithValue.reduce((sum, security) => sum + security.value, 0);

      console.log(`Sum of security values: ${sumOfValues} ${financialData.portfolioInfo.currency || 'USD'}`);

      // Compare with portfolio total value
      if (financialData.portfolioInfo.totalValue !== null) {
        const difference = Math.abs(sumOfValues - financialData.portfolioInfo.totalValue);
        const percentDifference = (difference / financialData.portfolioInfo.totalValue) * 100;

        console.log(`Portfolio total value: ${financialData.portfolioInfo.totalValue} ${financialData.portfolioInfo.currency || 'USD'}`);
        console.log(`Difference: ${difference.toFixed(2)} ${financialData.portfolioInfo.currency || 'USD'} (${percentDifference.toFixed(2)}%)`);

        if (percentDifference < 1) {
          console.log('✓ Sum of security values matches portfolio total value (within 1%)');
        } else {
          console.log('✗ Sum of security values does not match portfolio total value');
        }
      } else {
        console.log('Cannot compare with portfolio total value (not found)');
      }
    } else {
      console.log('No securities found');
    }

    // Test 4: Check if the system understands ISINs with their corresponding prices and values
    console.log('\n=== TEST 4: ISINs with Prices and Values ===');
    if (financialData.securities && Array.isArray(financialData.securities) && financialData.securities.length > 0) {
      // Count securities with ISINs, prices, and values
      const securitiesWithISIN = financialData.securities.filter(s => s.isin);
      const securitiesWithISINAndPrice = securitiesWithISIN.filter(s => s.price !== undefined && s.price !== null);
      const securitiesWithISINAndValue = securitiesWithISIN.filter(s => s.value !== undefined && s.value !== null);

      console.log(`Securities with ISIN: ${securitiesWithISIN.length}`);
      console.log(`Securities with ISIN and price: ${securitiesWithISINAndPrice.length}`);
      console.log(`Securities with ISIN and value: ${securitiesWithISINAndValue.length}`);

      // Show some examples
      if (securitiesWithISINAndPrice.length > 0) {
        console.log('\nSample securities with ISINs and prices:');
        securitiesWithISINAndPrice.slice(0, 5).forEach((security, index) => {
          console.log(`${index + 1}. ${security.isin} (${security.name}): ${security.price} ${financialData.portfolioInfo.currency || 'USD'}`);
        });
      }

      if (securitiesWithISINAndValue.length > 0) {
        console.log('\nSample securities with ISINs and values:');
        securitiesWithISINAndValue.slice(0, 5).forEach((security, index) => {
          console.log(`${index + 1}. ${security.isin} (${security.name}): ${security.value} ${financialData.portfolioInfo.currency || 'USD'}`);
        });
      }
    } else {
      console.log('No securities found');
    }

    // Test 5: Check if the system can extract ISINs from text
    console.log('\n=== TEST 5: ISINs from Text ===');
    const isinPattern = /[A-Z]{2}[A-Z0-9]{10}/g;
    const isinMatches = [...pdfData.text.matchAll(isinPattern)];

    let uniqueIsins = [];
    if (isinMatches.length > 0) {
      // Deduplicate ISINs
      uniqueIsins = [...new Set(isinMatches.map(match => match[0]))];
      console.log(`Found ${uniqueIsins.length} unique ISINs in text`);

      // Show some examples
      console.log('\nSample ISINs from text:');
      uniqueIsins.slice(0, 10).forEach((isin, index) => {
        console.log(`${index + 1}. ${isin}`);
      });

      // Compare with ISINs from securities
      if (financialData.securities && Array.isArray(financialData.securities) && financialData.securities.length > 0) {
        const securitiesWithISIN = financialData.securities.filter(s => s.isin);
        const isinFromSecurities = securitiesWithISIN.map(s => s.isin);

        const isinsInBoth = uniqueIsins.filter(isin => isinFromSecurities.includes(isin));
        const isinsOnlyInText = uniqueIsins.filter(isin => !isinFromSecurities.includes(isin));
        const isinsOnlyInSecurities = isinFromSecurities.filter(isin => !uniqueIsins.includes(isin));

        console.log(`\nISINs in both text and securities: ${isinsInBoth.length}`);
        console.log(`ISINs only in text: ${isinsOnlyInText.length}`);
        console.log(`ISINs only in securities: ${isinsOnlyInSecurities.length}`);
      }
    } else {
      console.log('No ISINs found in text');
      uniqueIsins = [];
    }

    // Save results to a file
    const outputFile = path.join(__dirname, 'financial-understanding-results.json');
    fs.writeFileSync(outputFile, JSON.stringify({
      portfolioInfo: financialData.portfolioInfo,
      securitiesCount: financialData.securities && Array.isArray(financialData.securities) ? financialData.securities.length : 0,
      securitiesWithPrice: financialData.securities && Array.isArray(financialData.securities) ? financialData.securities.filter(s => s.price !== undefined && s.price !== null).length : 0,
      securitiesWithValue: financialData.securities && Array.isArray(financialData.securities) ? financialData.securities.filter(s => s.value !== undefined && s.value !== null).length : 0,
      securitiesWithISIN: financialData.securities && Array.isArray(financialData.securities) ? financialData.securities.filter(s => s.isin).length : 0,
      uniqueIsinsInText: uniqueIsins.length
    }, null, 2));

    console.log(`\nSaved results to: ${outputFile}`);
    console.log('\nTest completed successfully.');
  } catch (error) {
    console.error('Error during test:', error);
  }
}

// Run the test
testFinancialUnderstanding();
