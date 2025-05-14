/**
 * Mock Data Generator
 * Provides functions to generate mock data for testing and development
 */

/**
 * Generate mock securities data
 * @param {number} count - Number of securities to generate
 * @returns {Array} - Array of security objects
 */
function generateMockSecurities(count = 10) {
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
      dataProvider: 'Mock Data Provider',
      isMockData: true
    });
  }

  return securities;
}

/**
 * Generate mock portfolio data
 * @param {number} numSecurities - Number of securities in the portfolio
 * @returns {Object} - Mock portfolio data
 */
function generateMockPortfolio(numSecurities = 10) {
  const securities = generateMockSecurities(numSecurities);
  
  // Calculate portfolio totals
  let totalValue = 0;
  let totalMarketValue = 0;
  
  securities.forEach(security => {
    totalValue += security.value;
    totalMarketValue += security.marketValue;
  });
  
  const portfolioReturn = parseFloat(((totalMarketValue - totalValue) / totalValue * 100).toFixed(2));
  
  // Generate asset allocation
  const assetAllocation = {};
  const sectorAllocation = {};
  const currencyAllocation = {};
  const countryAllocation = {};
  
  // Initialize with zeros
  ['Stock', 'Bond', 'ETF', 'Fund', 'Cash', 'Option'].forEach(type => {
    assetAllocation[type] = 0;
  });
  
  ['Technology', 'Healthcare', 'Financial Services', 'Consumer Cyclical', 
   'Consumer Defensive', 'Industrials', 'Energy', 'Utilities', 
   'Communication Services', 'Real Estate'].forEach(sector => {
    sectorAllocation[sector] = 0;
  });
  
  ['USD', 'EUR', 'GBP', 'ILS'].forEach(currency => {
    currencyAllocation[currency] = 0;
  });
  
  ['US', 'GB', 'DE', 'FR', 'JP', 'IL'].forEach(country => {
    countryAllocation[country] = 0;
  });
  
  // Calculate allocations
  securities.forEach(security => {
    assetAllocation[security.type] += security.marketValue;
    sectorAllocation[security.sector] += security.marketValue;
    currencyAllocation[security.currency] += security.marketValue;
    countryAllocation[security.country] += security.marketValue;
  });
  
  // Convert to percentages
  Object.keys(assetAllocation).forEach(key => {
    assetAllocation[key] = parseFloat((assetAllocation[key] / totalMarketValue * 100).toFixed(2));
  });
  
  Object.keys(sectorAllocation).forEach(key => {
    sectorAllocation[key] = parseFloat((sectorAllocation[key] / totalMarketValue * 100).toFixed(2));
  });
  
  Object.keys(currencyAllocation).forEach(key => {
    currencyAllocation[key] = parseFloat((currencyAllocation[key] / totalMarketValue * 100).toFixed(2));
  });
  
  Object.keys(countryAllocation).forEach(key => {
    countryAllocation[key] = parseFloat((countryAllocation[key] / totalMarketValue * 100).toFixed(2));
  });
  
  return {
    id: `portfolio-${Date.now()}`,
    name: 'Mock Portfolio',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    securities,
    totalValue,
    totalMarketValue,
    return: portfolioReturn,
    currency: 'USD',
    allocations: {
      asset: assetAllocation,
      sector: sectorAllocation,
      currency: currencyAllocation,
      country: countryAllocation
    },
    isMockData: true
  };
}

/**
 * Generate mock historical price data
 * @param {string} symbol - Security symbol
 * @param {string} period - Time period
 * @param {string} interval - Data interval
 * @returns {Array} - Mock historical data
 */
function generateMockHistoricalData(symbol, period = '1y', interval = '1d') {
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

module.exports = {
  generateMockSecurities,
  generateMockPortfolio,
  generateMockHistoricalData
};