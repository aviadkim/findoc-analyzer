/**
 * Enhanced Financial Data Extractor
 *
 * This module provides comprehensive financial data extraction from PDFs.
 */

const { extractPortfolioInfo } = require('./portfolio-info-extractor');
const { extractAssetAllocation } = require('./asset-allocation-extractor');
const { extractSecurities } = require('./securities-extractor');
const { extractPerformanceMetrics } = require('./performance-extractor');
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
    console.log('Extracting comprehensive financial data...');
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

    // Extract securities
    const securities = extractSecurities(tables, text);

    // Extract performance metrics
    const performance = extractPerformanceMetrics(tables, text);

    // Combine all data
    const financialData = {
      portfolioInfo,
      assetAllocation,
      securities,
      performance
    };

    console.log('Extracted comprehensive financial data');

    return financialData;
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

module.exports = {
  extractFinancialData
};
