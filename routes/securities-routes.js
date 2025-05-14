/**
 * Securities Routes
 * Handles all API routes related to securities operations
 */

const express = require('express');
const router = express.Router();
const enhancedSecuritiesExtractor = require('../services/enhanced-securities-extractor');
const { isValidISIN } = require('../services/financial-data-extractor');

/**
 * @route GET /api/securities
 * @description Get all securities
 * @access Public
 */
router.get('/', async (req, res) => {
  try {
    // Generate mock securities data
    const securities = generateSampleSecurities(10);
    
    res.json({
      success: true,
      count: securities.length,
      securities
    });
  } catch (error) {
    console.error('Error retrieving securities:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to retrieve securities', 
      error: error.message 
    });
  }
});

/**
 * @route GET /api/securities/:isin
 * @description Get a security by ISIN
 * @access Public
 */
router.get('/:isin', async (req, res) => {
  try {
    const { isin } = req.params;
    
    // Validate ISIN format
    const financialDataExtractor = require('../services/financial-data-extractor');
    if (!financialDataExtractor.isValidISIN(isin)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid ISIN format'
      });
    }
    
    // Mock security data for the given ISIN
    const security = findSecurityByIsin(isin);
    
    if (!security) {
      return res.status(404).json({
        success: false,
        message: 'Security not found'
      });
    }
    
    res.json({
      success: true,
      security
    });
  } catch (error) {
    console.error(`Error retrieving security with ISIN ${req.params.isin}:`, error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to retrieve security', 
      error: error.message 
    });
  }
});

/**
 * @route POST /api/securities/extract
 * @description Extract securities from text or document content
 * @access Public
 */
router.post('/extract', async (req, res) => {
  try {
    const { text, tables, includeMarketData = true } = req.body;
    
    if (!text && (!tables || !tables.length)) {
      return res.status(400).json({
        success: false,
        message: 'Text or tables required for securities extraction'
      });
    }
    
    // Use the enhanced securities extractor
    const content = { text, tables };
    const securities = await enhancedSecuritiesExtractor.extractSecuritiesWithMarketData(
      content, 
      includeMarketData
    );
    
    res.json({
      success: true,
      count: securities.length,
      securities,
      includesMarketData: includeMarketData
    });
  } catch (error) {
    console.error('Error extracting securities:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to extract securities', 
      error: error.message 
    });
  }
});

/**
 * @route PUT /api/securities/:isin
 * @description Update security information
 * @access Public
 */
router.put('/:isin', async (req, res) => {
  try {
    const { isin } = req.params;
    const updates = req.body;
    
    // Validate ISIN format
    const financialDataExtractor = require('../services/financial-data-extractor');
    if (!financialDataExtractor.isValidISIN(isin)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid ISIN format'
      });
    }
    
    // Validate update data
    if (!updates || Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No update data provided'
      });
    }
    
    // Mock update by finding the security and merging the updates
    const security = findSecurityByIsin(isin);
    
    if (!security) {
      return res.status(404).json({
        success: false,
        message: 'Security not found'
      });
    }
    
    // Mock update - in a real implementation, this would update a database
    const updatedSecurity = {
      ...security,
      ...updates,
      lastUpdated: new Date().toISOString()
    };
    
    res.json({
      success: true,
      message: 'Security updated successfully',
      security: updatedSecurity
    });
  } catch (error) {
    console.error(`Error updating security with ISIN ${req.params.isin}:`, error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update security', 
      error: error.message 
    });
  }
});

/**
 * @route GET /api/securities/document/:documentId
 * @description Get securities for a specific document
 * @access Public
 */
router.get('/document/:documentId', async (req, res) => {
  try {
    const { documentId } = req.params;
    const { includeMarketData = true } = req.query;
    const includeMkt = includeMarketData !== 'false'; // Default to true
    
    // Generate mock securities for the document
    const securities = generateSampleSecurities(5);
    
    res.json({
      success: true,
      documentId,
      count: securities.length,
      securities,
      includesMarketData: includeMkt,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error(`Error getting securities for document ${req.params.documentId}:`, error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get securities for document', 
      error: error.message 
    });
  }
});

/**
 * Helper function to generate sample securities data
 * @param {number} count - Number of securities to generate
 * @returns {Array} - Array of security objects
 */
function generateSampleSecurities(count = 10) {
  const securities = [];
  const types = ['Stock', 'Bond', 'ETF', 'Fund', 'Cash', 'Option'];
  const currencies = ['USD', 'EUR', 'GBP', 'ILS'];

  const companyNames = [
    'Apple Inc.', 'Microsoft Corp.', 'Alphabet Inc.', 'Amazon.com Inc.', 'Tesla Inc.',
    'Meta Platforms Inc.', 'NVIDIA Corp.', 'Berkshire Hathaway Inc.', 'JPMorgan Chase & Co.',
    'Johnson & Johnson', 'Visa Inc.', 'Procter & Gamble Co.', 'Mastercard Inc.', 'UnitedHealth Group Inc.',
    'Home Depot Inc.', 'Bank of America Corp.', 'Walt Disney Co.', 'Verizon Communications Inc.'
  ];

  const sectors = [
    'Technology', 'Healthcare', 'Financial Services', 'Consumer Cyclical', 'Consumer Defensive',
    'Industrials', 'Energy', 'Utilities', 'Communication Services', 'Real Estate'
  ];

  const isinPrefixes = ['US', 'GB', 'DE', 'FR', 'JP', 'IL'];

  for (let i = 0; i < count; i++) {
    const type = types[Math.floor(Math.random() * types.length)];
    const currency = currencies[Math.floor(Math.random() * currencies.length)];
    const companyName = companyNames[Math.floor(Math.random() * companyNames.length)];
    const sector = sectors[Math.floor(Math.random() * sectors.length)];
    const isinPrefix = isinPrefixes[Math.floor(Math.random() * isinPrefixes.length)];

    // Generate a random ISIN
    const isin = `${isinPrefix}${Math.floor(Math.random() * 10000000000).toString().padStart(10, '0')}`;

    // Generate price and quantity
    const price = parseFloat((10 + Math.random() * 990).toFixed(2));
    const quantity = Math.floor(10 + Math.random() * 990);
    const value = parseFloat((price * quantity).toFixed(2));

    // Generate market data
    const priceChangePercent = parseFloat((Math.random() * 10 - 5).toFixed(2));
    const marketPrice = parseFloat((price * (1 + priceChangePercent / 100)).toFixed(2));
    const marketValue = parseFloat((marketPrice * quantity).toFixed(2));
    const priceChange = parseFloat((marketPrice - price).toFixed(2));

    securities.push({
      id: `sec-${i + 1}`,
      isin,
      name: companyName,
      symbol: companyName.split(' ')[0].toUpperCase(),
      type,
      quantity,
      price,
      value,
      marketPrice,
      marketValue,
      priceChange,
      priceChangePercent,
      currency,
      sector,
      country: isinPrefix,
      lastUpdated: new Date().toISOString(),
      dataProvider: 'Yahoo Finance'
    });
  }

  return securities;
}

/**
 * Helper function to find a security by ISIN
 * @param {string} isin - The ISIN to search for
 * @returns {Object|null} - The security or null if not found
 */
function findSecurityByIsin(isin) {
  // In a real implementation, this would query a database
  // For now, generate a security for the given ISIN if it's valid
  if (!isValidISIN(isin)) {
    return null;
  }
  
  const isinPrefix = isin.slice(0, 2);
  const companyNameMap = {
    'US': 'U.S. Company Corp.',
    'GB': 'British Holdings Ltd.',
    'DE': 'Deutsche Firma GmbH',
    'FR': 'Société Française SA',
    'JP': 'Japanese Enterprise Co.',
    'IL': 'Israeli Tech Ltd.'
  };
  
  const companyName = companyNameMap[isinPrefix] || 'Global Corporation';
  const symbol = companyName.split(' ')[0].toUpperCase();
  
  return {
    id: `sec-${Date.now()}`,
    isin,
    name: companyName,
    symbol,
    type: 'Stock',
    quantity: 100,
    price: 150.00,
    value: 15000.00,
    marketPrice: 155.25,
    marketValue: 15525.00,
    priceChange: 5.25,
    priceChangePercent: 3.5,
    currency: 'USD',
    sector: 'Technology',
    country: isinPrefix,
    lastUpdated: new Date().toISOString(),
    dataProvider: 'Yahoo Finance'
  };
}

module.exports = router;