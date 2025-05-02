/**
 * ISIN Controller
 * 
 * This file contains the controller functions for ISIN-related operations.
 */

/**
 * Get all ISINs
 * @route GET /api/isins
 * @access Public
 */
const getIsins = async (req, res) => {
  try {
    // Mock data
    const isins = [
      { isin: 'US0378331005', name: 'Apple Inc.', quantity: 10, price: 145.85, value: 1458.50, currency: 'USD', weight: 7.47 },
      { isin: 'US5949181045', name: 'Microsoft Corp.', quantity: 5, price: 280.57, value: 1402.85, currency: 'USD', weight: 7.19 },
      { isin: 'US0231351067', name: 'Amazon.com Inc.', quantity: 3, price: 102.24, value: 306.72, currency: 'USD', weight: 1.57 },
      { isin: 'US30303M1027', name: 'Meta Platforms Inc.', quantity: 4, price: 210.88, value: 843.52, currency: 'USD', weight: 4.32 },
      { isin: 'US02079K1079', name: 'Alphabet Inc.', quantity: 8, price: 124.67, value: 997.36, currency: 'USD', weight: 5.11 }
    ];
    
    res.json({
      success: true,
      count: isins.length,
      data: isins
    });
  } catch (error) {
    console.error('Error getting ISINs:', error);
    res.status(500).json({
      success: false,
      error: 'Error getting ISINs: ' + error.message
    });
  }
};

/**
 * Get ISIN by ID
 * @route GET /api/isins/:id
 * @access Public
 */
const getIsinById = async (req, res) => {
  try {
    const isinId = req.params.id;
    
    // Mock data
    const isins = {
      'US0378331005': { isin: 'US0378331005', name: 'Apple Inc.', quantity: 10, price: 145.85, value: 1458.50, currency: 'USD', weight: 7.47 },
      'US5949181045': { isin: 'US5949181045', name: 'Microsoft Corp.', quantity: 5, price: 280.57, value: 1402.85, currency: 'USD', weight: 7.19 },
      'US0231351067': { isin: 'US0231351067', name: 'Amazon.com Inc.', quantity: 3, price: 102.24, value: 306.72, currency: 'USD', weight: 1.57 },
      'US30303M1027': { isin: 'US30303M1027', name: 'Meta Platforms Inc.', quantity: 4, price: 210.88, value: 843.52, currency: 'USD', weight: 4.32 },
      'US02079K1079': { isin: 'US02079K1079', name: 'Alphabet Inc.', quantity: 8, price: 124.67, value: 997.36, currency: 'USD', weight: 5.11 }
    };
    
    if (!isins[isinId]) {
      return res.status(404).json({
        success: false,
        error: 'ISIN not found'
      });
    }
    
    res.json({
      success: true,
      data: isins[isinId]
    });
  } catch (error) {
    console.error('Error getting ISIN:', error);
    res.status(500).json({
      success: false,
      error: 'Error getting ISIN: ' + error.message
    });
  }
};

/**
 * Get ISIN details
 * @route GET /api/isins/:id/details
 * @access Public
 */
const getIsinDetails = async (req, res) => {
  try {
    const isinId = req.params.id;
    
    // Mock data
    const isinDetails = {
      'US0378331005': {
        isin: 'US0378331005',
        name: 'Apple Inc.',
        ticker: 'AAPL',
        exchange: 'NASDAQ',
        currency: 'USD',
        country: 'United States',
        sector: 'Technology',
        industry: 'Consumer Electronics',
        description: 'Apple Inc. designs, manufactures, and markets smartphones, personal computers, tablets, wearables, and accessories worldwide.',
        marketCap: 2400000000000,
        peRatio: 28.5,
        dividendYield: 0.0058,
        beta: 1.2,
        fiftyTwoWeekHigh: 182.94,
        fiftyTwoWeekLow: 124.17,
        averageVolume: 75000000,
        website: 'https://www.apple.com'
      },
      'US5949181045': {
        isin: 'US5949181045',
        name: 'Microsoft Corp.',
        ticker: 'MSFT',
        exchange: 'NASDAQ',
        currency: 'USD',
        country: 'United States',
        sector: 'Technology',
        industry: 'Software—Infrastructure',
        description: 'Microsoft Corporation develops, licenses, and supports software, services, devices, and solutions worldwide.',
        marketCap: 2100000000000,
        peRatio: 32.1,
        dividendYield: 0.0082,
        beta: 0.93,
        fiftyTwoWeekHigh: 315.95,
        fiftyTwoWeekLow: 213.43,
        averageVolume: 30000000,
        website: 'https://www.microsoft.com'
      }
    };
    
    if (!isinDetails[isinId]) {
      return res.status(404).json({
        success: false,
        error: 'ISIN details not found'
      });
    }
    
    res.json({
      success: true,
      data: isinDetails[isinId]
    });
  } catch (error) {
    console.error('Error getting ISIN details:', error);
    res.status(500).json({
      success: false,
      error: 'Error getting ISIN details: ' + error.message
    });
  }
};

module.exports = {
  getIsins,
  getIsinById,
  getIsinDetails
};
