/**
 * Financial Controller
 * 
 * This controller handles financial analysis operations.
 */

/**
 * Get market data
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @returns {Promise<void>}
 */
const getMarketData = async (req, res) => {
  try {
    // Mock data for testing
    const marketData = {
      indices: [
        { name: 'S&P 500', value: 4500.25, change: 15.75, changePercent: 0.35 },
        { name: 'Dow Jones', value: 35250.50, change: 125.30, changePercent: 0.36 },
        { name: 'NASDAQ', value: 14200.75, change: 75.50, changePercent: 0.53 },
        { name: 'Russell 2000', value: 2250.30, change: -5.25, changePercent: -0.23 }
      ],
      sectors: [
        { name: 'Technology', performance: 1.2 },
        { name: 'Healthcare', performance: 0.8 },
        { name: 'Financials', performance: -0.3 },
        { name: 'Consumer Discretionary', performance: 0.5 },
        { name: 'Industrials', performance: 0.2 },
        { name: 'Energy', performance: -0.7 },
        { name: 'Materials', performance: 0.1 },
        { name: 'Utilities', performance: -0.2 },
        { name: 'Real Estate', performance: -0.5 },
        { name: 'Communication Services', performance: 0.9 },
        { name: 'Consumer Staples', performance: 0.3 }
      ],
      currencies: [
        { pair: 'EUR/USD', value: 1.0925, change: 0.0015, changePercent: 0.14 },
        { pair: 'USD/JPY', value: 149.75, change: -0.25, changePercent: -0.17 },
        { pair: 'GBP/USD', value: 1.2650, change: 0.0035, changePercent: 0.28 },
        { pair: 'USD/CHF', value: 0.9050, change: -0.0010, changePercent: -0.11 }
      ],
      commodities: [
        { name: 'Gold', value: 1950.25, change: 15.50, changePercent: 0.80 },
        { name: 'Silver', value: 23.75, change: 0.35, changePercent: 1.49 },
        { name: 'Oil (WTI)', value: 75.50, change: -1.25, changePercent: -1.63 },
        { name: 'Natural Gas', value: 2.85, change: 0.05, changePercent: 1.79 }
      ],
      timestamp: new Date().toISOString()
    };

    return res.json({
      success: true,
      data: marketData
    });
  } catch (error) {
    console.error('Error getting market data:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

module.exports = {
  getMarketData
};
