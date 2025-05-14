/**
 * Enhanced Financial Data Extractor v2
 *
 * This module provides comprehensive financial data extraction from PDFs
 * with improved securities extraction.
 */

const { extractPortfolioInfo } = require('./portfolio-info-extractor');
const { extractAssetAllocation } = require('./asset-allocation-extractor');
const { extractPerformanceMetrics } = require('./performance-extractor');
const { extractSecurities } = require('./enhanced-securities-extractor-v2');
const { detectTables } = require('./table-detector');
const { extractTables } = require('./table-extractor');

/**
 * Extract comprehensive financial data from PDF text and tables
 * @param {string} text - Extracted text from the PDF
 * @param {Array} tables - Extracted tables from the PDF
 * @returns {object} - Extracted financial data
 */
async function extractFinancialData(text, tables) {
  try {
    console.log('Extracting comprehensive financial data with enhanced extractor v2...');
    console.log('Text length:', text.length);
    console.log('Number of tables:', tables.length);

    // If no tables provided, detect and extract them
    if (!tables || tables.length === 0) {
      console.log('No tables provided, detecting and extracting tables...');
      const tableRegions = detectTables(text);
      tables = extractTables(text, tableRegions);
      console.log(`Detected and extracted ${tables.length} tables`);
    }

    // Extract portfolio information
    const portfolioInfo = extractPortfolioInfo(text, tables);

    // Extract asset allocation
    const assetAllocation = extractAssetAllocation(tables, text);

    // Extract securities with enhanced extractor
    const securities = await extractSecurities({
      text,
      tables,
      financialData: { portfolioInfo }
    });

    // Extract performance metrics
    const performance = extractPerformanceMetrics(tables, text);

    // Calculate and verify totals
    const verifiedData = verifyFinancialData({
      portfolioInfo,
      assetAllocation,
      securities,
      performance
    });

    console.log('Extracted comprehensive financial data with enhanced extractor v2');

    return verifiedData;
  } catch (error) {
    console.error('Error extracting comprehensive financial data:', error);

    // Return basic structure even if extraction fails
    return {
      portfolioInfo: {
        title: '',
        date: '',
        totalValue: null,
        currency: 'USD',
        owner: '',
        manager: '',
        accountNumber: '',
        custodian: '',
        benchmark: '',
        strategy: ''
      },
      assetAllocation: {
        categories: [],
        total: 0
      },
      securities: [],
      performance: {
        ytd: null,
        oneMonth: null,
        threeMonth: null,
        sixMonth: null,
        oneYear: null,
        threeYear: null,
        fiveYear: null,
        tenYear: null,
        sinceInception: null
      }
    };
  }
}

/**
 * Verify and complete financial data
 * @param {object} data - Extracted financial data
 * @returns {object} - Verified financial data
 */
function verifyFinancialData(data) {
  const { portfolioInfo, assetAllocation, securities, performance } = data;

  // Calculate total value of securities
  let securitiesTotal = 0;
  let securitiesWithValueCount = 0;

  securities.forEach(security => {
    if (security.value !== null && !isNaN(security.value)) {
      securitiesTotal += security.value;
      securitiesWithValueCount++;
    }
  });

  // If we have enough securities with values, compare with portfolio total
  if (securitiesWithValueCount >= 3 && portfolioInfo.totalValue !== null) {
    // If the total differs significantly, adjust it
    const percentDifference = Math.abs((securitiesTotal - portfolioInfo.totalValue) / portfolioInfo.totalValue);
    
    if (percentDifference > 0.5) { // More than 50% difference
      console.log(`Portfolio total value (${portfolioInfo.totalValue}) is very different from sum of securities (${securitiesTotal})`);
      
      // If we have a good number of securities with values, trust that more
      if (securitiesWithValueCount >= 5 && securitiesWithValueCount >= securities.length * 0.3) {
        console.log(`Using securities total (${securitiesTotal}) as portfolio total value`);
        portfolioInfo.totalValue = securitiesTotal;
      }
    }
  }

  // Calculate total allocation percentage and normalize if needed
  let allocationTotal = 0;
  assetAllocation.categories.forEach(category => {
    if (category.percentage !== null && !isNaN(category.percentage)) {
      allocationTotal += category.percentage;
    }
  });

  // If allocation percentages sum to something significantly different from 100%, normalize them
  if (assetAllocation.categories.length > 0 && Math.abs(allocationTotal - 100) > 5) {
    console.log(`Asset allocation total (${allocationTotal}%) is not close to 100%, normalizing`);
    
    // Normalize percentages
    if (allocationTotal > 0) {
      assetAllocation.categories.forEach(category => {
        if (category.percentage !== null) {
          category.percentage = (category.percentage / allocationTotal) * 100;
        }
      });
    }
  }

  // Return the verified data
  return {
    portfolioInfo,
    assetAllocation,
    securities,
    performance,
    analysis: {
      securitiesTotal,
      securitiesWithValueCount,
      allocationTotal
    }
  };
}

module.exports = {
  extractFinancialData
};