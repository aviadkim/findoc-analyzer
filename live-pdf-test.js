/**
 * Live demonstration of enhanced PDF processing
 */

const fs = require('fs');
const path = require('path');
const { processPdf } = require('./services/pdf-processor');
const { extractFinancialData } = require('./services/enhanced-financial-extractor');

// Path to test PDFs directory
const testPdfsDir = path.join(__dirname, 'test-pdfs');

// Create directory if it doesn't exist
if (!fs.existsSync(testPdfsDir)) {
  fs.mkdirSync(testPdfsDir, { recursive: true });
  console.log(`Created test PDFs directory: ${testPdfsDir}`);
}

// Check for messos.pdf
const messosPath = path.join(testPdfsDir, 'messos.pdf');
const hasMessos = fs.existsSync(messosPath);

// Find any PDF in the current directory if messos.pdf doesn't exist
let testPdfPath = messosPath;
if (!hasMessos) {
  console.log('messos.pdf not found, looking for any PDF file...');

  const files = fs.readdirSync(__dirname);
  const pdfFiles = files.filter(file => file.toLowerCase().endsWith('.pdf'));

  if (pdfFiles.length > 0) {
    testPdfPath = path.join(__dirname, pdfFiles[0]);
    console.log(`Using ${pdfFiles[0]} for testing`);
  } else {
    console.error('No PDF files found for testing.');
    process.exit(1);
  }
}

// Process the PDF and show results
async function demonstrateProcessing() {
  try {
    console.log(`\n=== LIVE DEMONSTRATION OF ENHANCED PDF PROCESSING ===`);
    console.log(`Processing file: ${testPdfPath}`);

    // Step 1: Process the PDF
    console.log('\n--- STEP 1: Processing PDF ---');
    console.log('Starting PDF processing...');
    const startTime = Date.now();
    const pdfData = await processPdf(testPdfPath, { useOcr: false });
    const processingTime = (Date.now() - startTime) / 1000;

    console.log(`✓ PDF processing completed in ${processingTime.toFixed(2)} seconds`);
    console.log(`✓ Extracted ${pdfData.text.length} characters of text`);
    console.log(`✓ Detected ${pdfData.tables.length} tables`);

    // Step 2: Extract financial data
    console.log('\n--- STEP 2: Extracting Financial Data ---');
    console.log('Starting financial data extraction...');
    const financialStartTime = Date.now();
    const financialData = await extractFinancialData(pdfData.text, pdfData.tables);
    const financialProcessingTime = (Date.now() - financialStartTime) / 1000;

    console.log(`✓ Financial data extraction completed in ${financialProcessingTime.toFixed(2)} seconds`);

    // Step 3: Show extracted data
    console.log('\n--- STEP 3: Extracted Data Summary ---');

    // Portfolio information
    console.log('\n📄 PORTFOLIO INFORMATION:');
    console.log(`• Title: ${financialData.portfolioInfo.title || 'N/A'}`);
    console.log(`• Date: ${financialData.portfolioInfo.date || 'N/A'}`);
    console.log(`• Currency: ${financialData.portfolioInfo.currency || 'N/A'}`);
    console.log(`• Total Value: ${financialData.portfolioInfo.totalValue || 'N/A'}`);
    console.log(`• Owner: ${financialData.portfolioInfo.owner || 'N/A'}`);

    // Asset allocation
    console.log('\n📊 ASSET ALLOCATION:');
    if (financialData.assetAllocation && financialData.assetAllocation.categories.length > 0) {
      console.log(`• Found ${financialData.assetAllocation.categories.length} asset categories`);
      console.log('• Top categories:');
      financialData.assetAllocation.categories.slice(0, 5).forEach((category, index) => {
        console.log(`  ${index + 1}. ${category.name}: ${category.percentage || 'N/A'}%`);
      });

      if (financialData.assetAllocation.categories.length > 5) {
        console.log(`  ... and ${financialData.assetAllocation.categories.length - 5} more categories`);
      }
    } else {
      console.log('• No asset allocation data found');
    }

    // Securities
    console.log('\n💼 SECURITIES:');
    if (financialData.securities && Array.isArray(financialData.securities) && financialData.securities.length > 0) {
      console.log(`• Found ${financialData.securities.length} securities`);

      // Count securities with ISINs
      const securitiesWithISIN = financialData.securities.filter(s => s.isin);
      console.log(`• ${securitiesWithISIN.length} securities have ISIN codes`);

      // Show some securities
      if (securitiesWithISIN.length > 0) {
        console.log('• Sample securities with ISINs:');
        securitiesWithISIN.slice(0, 5).forEach((security, index) => {
          console.log(`  ${index + 1}. ${security.name}: ${security.isin}`);
        });

        if (securitiesWithISIN.length > 5) {
          console.log(`  ... and ${securitiesWithISIN.length - 5} more securities with ISINs`);
        }
      }
    } else {
      console.log('• No securities data found in structured format');
    }

    // Extract ISINs from text
    console.log('\n🔍 ISIN EXTRACTION FROM TEXT:');
    const isinPattern = /[A-Z]{2}[A-Z0-9]{10}/g;
    const isinMatches = [...pdfData.text.matchAll(isinPattern)];

    if (isinMatches.length > 0) {
      // Deduplicate ISINs
      const uniqueIsins = [...new Set(isinMatches.map(match => match[0]))];
      console.log(`• Found ${uniqueIsins.length} unique ISINs in text`);

      console.log('• Sample ISINs:');
      uniqueIsins.slice(0, 10).forEach((isin, index) => {
        console.log(`  ${index + 1}. ${isin}`);
      });

      if (uniqueIsins.length > 10) {
        console.log(`  ... and ${uniqueIsins.length - 10} more ISINs`);
      }
    } else {
      console.log('• No ISINs found in text');
    }

    // Performance metrics
    console.log('\n📈 PERFORMANCE METRICS:');
    const performanceMetrics = financialData.performance;
    const hasPerformanceData = Object.values(performanceMetrics).some(v => v !== null);

    if (hasPerformanceData) {
      for (const [key, value] of Object.entries(performanceMetrics)) {
        if (value !== null) {
          console.log(`• ${key}: ${value}%`);
        }
      }
    } else {
      console.log('• No performance metrics found');
    }

    // Step 4: Save extracted data
    console.log('\n--- STEP 4: Saving Extracted Data ---');
    const outputFile = path.join(__dirname, 'live-extracted-data.json');
    fs.writeFileSync(outputFile, JSON.stringify({
      portfolioInfo: financialData.portfolioInfo,
      assetAllocation: {
        categories: financialData.assetAllocation.categories.slice(0, 10),
        totalCategories: financialData.assetAllocation.categories.length
      },
      securities: financialData.securities && Array.isArray(financialData.securities) ? {
        count: financialData.securities.length,
        samples: financialData.securities.slice(0, 10)
      } : null,
      isins: uniqueIsins ? {
        count: uniqueIsins.length,
        samples: uniqueIsins.slice(0, 20)
      } : null,
      performance: financialData.performance,
      tables: {
        count: pdfData.tables.length,
        samples: pdfData.tables.slice(0, 3)
      }
    }, null, 2));

    console.log(`✓ Saved extracted data to: ${outputFile}`);

    // Step 5: Demonstrate OCR capabilities
    console.log('\n--- STEP 5: OCR Capabilities ---');
    console.log('The enhanced system now includes OCR capabilities:');
    console.log('• Automatic detection of scanned PDFs');
    console.log('• Integration with scan1Controller');
    console.log('• Fallback to basic OCR when scan1Controller is not available');
    console.log('• Improved text extraction from images in PDFs');

    console.log('\n=== DEMONSTRATION COMPLETED SUCCESSFULLY ===');
    console.log(`Total processing time: ${((Date.now() - startTime) / 1000).toFixed(2)} seconds`);
  } catch (error) {
    console.error('Error during demonstration:', error);
  }
}

// Run the demonstration
demonstrateProcessing().then(() => {
  console.log('\nDemonstration completed. Check the live-extracted-data.json file for full results.');
});
