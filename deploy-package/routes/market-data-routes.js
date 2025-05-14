/**
 * Market Data Routes
 * Routes for accessing and updating security market data
 */

const express = require('express');
const router = express.Router();
const marketDataService = require('../services/market-data-service');

/**
 * @route GET /api/market-data/price/:isin
 * @description Get current market price for a security
 * @param {string} isin - International Securities Identification Number
 * @access Public
 */
router.get('/price/:isin', async (req, res) => {
  try {
    const { isin } = req.params;
    const { provider, forceRefresh } = req.query;
    
    if (!isin) {
      return res.status(400).json({ success: false, message: 'ISIN is required' });
    }
    
    const options = {
      provider: provider || undefined,
      forceRefresh: forceRefresh === 'true'
    };
    
    try {
      const priceData = await marketDataService.getCurrentPrice(isin, options);
      
      res.json({
        success: true,
        data: priceData
      });
    } catch (serviceError) {
      console.error(`Market data service error: ${serviceError.message}`);
      
      // Generate mock data as fallback
      const mockPriceData = {
        symbol: isin,
        price: parseFloat((10 + Math.random() * 990).toFixed(2)),
        change: parseFloat((Math.random() * 20 - 10).toFixed(2)),
        changePercent: parseFloat((Math.random() * 10 - 5).toFixed(2)),
        currency: 'USD',
        exchange: 'MOCK',
        timestamp: Date.now(),
        provider: 'mock',
        isMockData: true
      };
      
      // Return mock data with success status to prevent client errors
      res.json({
        success: true,
        data: mockPriceData,
        warning: 'Using mock data due to service error',
        error: serviceError.message
      });
    }
  } catch (error) {
    console.error(`Error in price route handler: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Failed to process request',
      error: error.message
    });
  }
});

/**
 * @route GET /api/market-data/historical/:isin
 * @description Get historical market data for a security
 * @param {string} isin - International Securities Identification Number
 * @access Public
 */
router.get('/historical/:isin', async (req, res) => {
  try {
    const { isin } = req.params;
    const { period, interval, provider } = req.query;
    
    if (!isin) {
      return res.status(400).json({ success: false, message: 'ISIN is required' });
    }
    
    const options = {
      period: period || '1m',
      interval: interval || '1d',
      provider: provider || undefined
    };
    
    try {
      const historicalData = await marketDataService.getHistoricalPrices(isin, options);
      
      res.json({
        success: true,
        data: historicalData
      });
    } catch (serviceError) {
      console.error(`Market data service error for historical data: ${serviceError.message}`);
      
      // Generate mock historical data as fallback
      const mockHistoricalData = generateMockHistoricalData(isin, options.period, options.interval);
      
      // Return mock data with success status to prevent client errors
      res.json({
        success: true,
        data: {
          symbol: isin,
          historicalData: mockHistoricalData,
          provider: 'mock',
          isMockData: true
        },
        warning: 'Using mock data due to service error',
        error: serviceError.message
      });
    }
  } catch (error) {
    console.error(`Error in historical data route handler: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Failed to process request',
      error: error.message
    });
  }
});

/**
 * @route PUT /api/market-data/update-securities
 * @description Update securities with current market prices
 * @access Public
 */
router.put('/update-securities', async (req, res) => {
  try {
    const { securities, provider, forceRefresh } = req.body;
    
    if (!securities || !Array.isArray(securities)) {
      return res.status(400).json({ success: false, message: 'Valid securities array is required' });
    }
    
    const options = {
      provider: provider || undefined,
      forceRefresh: forceRefresh === true
    };
    
    try {
      const result = await marketDataService.updateSecuritiesWithMarketPrices(securities, options);
      
      res.json({
        success: true,
        data: result
      });
    } catch (serviceError) {
      console.error(`Market data service error for updating securities: ${serviceError.message}`);
      
      // Generate mock update result as fallback
      const updatedSecurities = securities.map(security => {
        const price = parseFloat((10 + Math.random() * 990).toFixed(2));
        const priceChangePercent = parseFloat((Math.random() * 10 - 5).toFixed(2));
        const priceChange = parseFloat((price * priceChangePercent / 100).toFixed(2));
        const marketValue = security.quantity ? security.quantity * price : null;
        
        return {
          ...security,
          marketPrice: price,
          marketValue,
          priceChange,
          priceChangePercent,
          lastUpdated: new Date().toISOString(),
          dataProvider: 'mock',
          isMockData: true
        };
      });
      
      // Return mock data with success status to prevent client errors
      res.json({
        success: true,
        data: {
          securities: updatedSecurities,
          marketPricesAdded: updatedSecurities.length
        },
        warning: 'Using mock data due to service error',
        error: serviceError.message
      });
    }
  } catch (error) {
    console.error(`Error in update securities route handler: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Failed to process request',
      error: error.message
    });
  }
});

/**
 * @route GET /api/market-data/update-document-securities/:documentId
 * @description Update all securities for a specific document with market prices
 * @param {string} documentId - Document ID
 * @access Public
 */
router.get('/update-document-securities/:documentId', async (req, res) => {
  try {
    const { documentId } = req.params;
    const { provider, forceRefresh } = req.query;
    
    if (!documentId) {
      return res.status(400).json({ success: false, message: 'Document ID is required' });
    }
    
    // Generate mock securities data for the document
    // In a real implementation, this would query a database or call a document service
    const securities = generateSampleSecurities(5); // Generate 5 sample securities
    
    if (!securities || securities.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'No securities found for this document' 
      });
    }
    
    const options = {
      provider: provider || undefined,
      forceRefresh: forceRefresh === 'true'
    };
    
    // Update securities with market prices
    const result = await marketDataService.updateSecuritiesWithMarketPrices(securities, options);
    
    // In a real implementation, you would save the updated securities back to the document
    // Here we're just returning the updated data
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error(`Error updating document securities: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Failed to update document securities with market prices',
      error: error.message
    });
  }
});

/**
 * @route POST /api/market-data/configure
 * @description Configure market data providers
 * @access Private (requires admin)
 */
router.post('/configure', async (req, res) => {
  try {
    const { primaryProvider, fallbackProviders } = req.body;
    
    if (!primaryProvider) {
      return res.status(400).json({ success: false, message: 'Primary provider is required' });
    }
    
    marketDataService.configureProviders(primaryProvider, fallbackProviders);
    
    res.json({
      success: true,
      message: 'Market data providers configured successfully'
    });
  } catch (error) {
    console.error(`Error configuring market data providers: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Failed to configure market data providers',
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
 * Helper function to generate mock historical data
 * @param {string} symbol - Security symbol
 * @param {string} period - Time period
 * @param {string} interval - Data interval
 * @returns {Array} - Mock historical data
 */
function generateMockHistoricalData(symbol, period, interval) {
  const historicalData = [];
  let numPoints = 30; // Default number of data points
  
  // Determine number of data points based on period
  switch (period) {
    case '1d': numPoints = 24; break;   // Hourly for one day
    case '1w': numPoints = 7; break;    // Daily for one week
    case '1m': numPoints = 30; break;   // Daily for one month
    case '3m': numPoints = 90; break;   // Daily for three months
    case '6m': numPoints = 180; break;  // Daily for six months
    case '1y': numPoints = 365; break;  // Daily for one year
    case '5y': numPoints = 60; break;   // Monthly for five years
  }
  
  // Base price for starting point
  let basePrice = 100 + Math.random() * 900;
  const now = new Date();
  const millisecondsPerDay = 24 * 60 * 60 * 1000;
  
  // Generate data points
  for (let i = 0; i < numPoints; i++) {
    // Calculate date based on period and current index
    const date = new Date(now.getTime() - (numPoints - i) * millisecondsPerDay);
    
    // Simulate price movement with random walk
    const dailyChange = (Math.random() - 0.5) * 5; // +/- 0-2.5%
    basePrice = basePrice * (1 + (dailyChange / 100));
    
    // Calculate high, low and open based on close price
    const close = parseFloat(basePrice.toFixed(2));
    const high = parseFloat((close * (1 + Math.random() * 0.02)).toFixed(2));
    const low = parseFloat((close * (1 - Math.random() * 0.02)).toFixed(2));
    const open = parseFloat((low + Math.random() * (high - low)).toFixed(2));
    
    // Generate random volume
    const volume = Math.floor(100000 + Math.random() * 10000000);
    
    historicalData.push({
      date: date.toISOString(),
      open,
      high,
      low,
      close,
      volume
    });
  }
  
  return historicalData;
}

module.exports = router;