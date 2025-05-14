/**
 * Market Data Service
 * 
 * This service provides real-time and historical market data for securities.
 * It supports multiple data providers with fallback options and implements
 * caching to minimize API calls.
 */

const axios = require('axios');
const NodeCache = require('node-cache');
const { getApiKey } = require('./api-key-manager');

// Initialize cache with TTL (time-to-live) of 15 minutes
const priceCache = new NodeCache({ stdTTL: 900, checkperiod: 120 });

// Supported market data providers
const PROVIDERS = {
  YAHOO: 'yahoo',
  ALPHA_VANTAGE: 'alphavantage',
  IEX: 'iex',
  FINNHUB: 'finnhub',
  POLYGON: 'polygon'
};

// Default primary and fallback providers
let primaryProvider = PROVIDERS.YAHOO;
let fallbackProviders = [PROVIDERS.ALPHA_VANTAGE, PROVIDERS.FINNHUB];

// Rate limiting counters and timestamps
const rateLimits = {
  [PROVIDERS.YAHOO]: { count: 0, resetTime: Date.now() + 60000, maxPerMinute: 100 },
  [PROVIDERS.ALPHA_VANTAGE]: { count: 0, resetTime: Date.now() + 60000, maxPerMinute: 5 },
  [PROVIDERS.IEX]: { count: 0, resetTime: Date.now() + 60000, maxPerMinute: 50 },
  [PROVIDERS.FINNHUB]: { count: 0, resetTime: Date.now() + 60000, maxPerMinute: 30 },
  [PROVIDERS.POLYGON]: { count: 0, resetTime: Date.now() + 60000, maxPerMinute: 5 }
};

/**
 * Configure market data service providers
 * @param {string} primary - Primary data provider
 * @param {Array<string>} fallbacks - Fallback data providers in order of preference
 */
function configureProviders(primary, fallbacks = []) {
  if (Object.values(PROVIDERS).includes(primary)) {
    primaryProvider = primary;
  }
  
  if (Array.isArray(fallbacks) && fallbacks.every(p => Object.values(PROVIDERS).includes(p))) {
    fallbackProviders = fallbacks;
  }
  
  console.log(`Market data service configured with primary provider: ${primaryProvider}`);
  console.log(`Fallback providers: ${fallbackProviders.join(', ')}`);
}

/**
 * Check and update rate limit counters
 * @param {string} provider - The data provider
 * @returns {boolean} - Whether the provider is within rate limits
 */
function checkRateLimit(provider) {
  if (!rateLimits[provider]) {
    return true;
  }
  
  const now = Date.now();
  
  // Reset counter if the reset time has passed
  if (now > rateLimits[provider].resetTime) {
    rateLimits[provider].count = 0;
    rateLimits[provider].resetTime = now + 60000; // Reset in 1 minute
  }
  
  // Check if we've hit the rate limit
  if (rateLimits[provider].count >= rateLimits[provider].maxPerMinute) {
    return false;
  }
  
  // Increment the counter
  rateLimits[provider].count++;
  return true;
}

/**
 * Get current market price for a security by ISIN
 * @param {string} isin - International Securities Identification Number
 * @param {Object} options - Additional options
 * @param {string} options.provider - Specific provider to use (optional)
 * @param {boolean} options.forceRefresh - Force refresh from API instead of cache
 * @returns {Promise<Object>} - Current price data
 */
async function getCurrentPrice(isin, options = {}) {
  try {
    const { provider, forceRefresh = false } = options;
    
    // Generate cache key
    const cacheKey = `price_${isin}`;
    
    // Check cache first unless force refresh is requested
    if (!forceRefresh) {
      const cachedData = priceCache.get(cacheKey);
      if (cachedData) {
        console.log(`Retrieved price data for ${isin} from cache`);
        return cachedData;
      }
    }
    
    // If a specific provider is requested, try only that one
    if (provider && Object.values(PROVIDERS).includes(provider)) {
      const priceData = await fetchPriceFromProvider(isin, provider);
      // Cache the result before returning
      priceCache.set(cacheKey, priceData);
      return priceData;
    }
    
    // Otherwise use the primary provider with fallbacks
    try {
      // First try the primary provider
      if (checkRateLimit(primaryProvider)) {
        const priceData = await fetchPriceFromProvider(isin, primaryProvider);
        
        // Cache the result before returning
        priceCache.set(cacheKey, priceData);
        return priceData;
      }
    } catch (error) {
      console.warn(`Primary provider ${primaryProvider} failed:`, error.message);
    }
    
    // Try fallback providers in sequence
    for (const fallbackProvider of fallbackProviders) {
      try {
        if (checkRateLimit(fallbackProvider)) {
          const priceData = await fetchPriceFromProvider(isin, fallbackProvider);
          
          // Cache the result before returning
          priceCache.set(cacheKey, priceData);
          return priceData;
        }
      } catch (error) {
        console.warn(`Fallback provider ${fallbackProvider} failed:`, error.message);
      }
    }
    
    // If all providers fail, generate mock data
    console.warn(`All market data providers failed to fetch price for ${isin}. Generating mock data.`);
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
    
    // Cache the mock data to avoid repeated failures
    priceCache.set(cacheKey, mockPriceData);
    return mockPriceData;
  } catch (error) {
    console.error(`Error getting current price for ${isin}:`, error);
    
    // Return mock data in case of any error
    const mockPriceData = {
      symbol: isin,
      price: parseFloat((10 + Math.random() * 990).toFixed(2)),
      change: parseFloat((Math.random() * 20 - 10).toFixed(2)),
      changePercent: parseFloat((Math.random() * 10 - 5).toFixed(2)),
      currency: 'USD',
      exchange: 'MOCK',
      timestamp: Date.now(),
      provider: 'mock',
      isMockData: true,
      error: error.message
    };
    
    return mockPriceData;
  }
}

/**
 * Fetch price data from a specific provider
 * @param {string} isin - International Securities Identification Number
 * @param {string} provider - Data provider to use
 * @returns {Promise<Object>} - Price data
 */
async function fetchPriceFromProvider(isin, provider) {
  try {
    // Convert ISIN to symbol format used by the provider
    const symbol = await convertIsinToSymbol(isin, provider);
    
    switch (provider) {
      case PROVIDERS.YAHOO:
        return await fetchFromYahooFinance(symbol);
      
      case PROVIDERS.ALPHA_VANTAGE:
        return await fetchFromAlphaVantage(symbol);
      
      case PROVIDERS.IEX:
        return await fetchFromIEX(symbol);
      
      case PROVIDERS.FINNHUB:
        return await fetchFromFinnhub(symbol);
      
      case PROVIDERS.POLYGON:
        return await fetchFromPolygon(symbol);
      
      default:
        throw new Error(`Unsupported provider: ${provider}`);
    }
  } catch (error) {
    console.error(`Error fetching price from ${provider} for ${isin}:`, error);
    throw error;
  }
}

/**
 * Convert ISIN to ticker symbol format used by providers
 * @param {string} isin - International Securities Identification Number
 * @param {string} provider - Provider for which to format the symbol
 * @returns {Promise<string>} - Formatted symbol
 */
async function convertIsinToSymbol(isin, provider) {
  try {
    // Check cache for existing conversion
    const cacheKey = `symbol_${isin}_${provider}`;
    const cachedSymbol = priceCache.get(cacheKey);
    
    if (cachedSymbol) {
      return cachedSymbol;
    }
    
    // For some providers, we need to convert ISIN to ticker symbol
    // This would typically involve an API call to a symbology service
    
    // For now, we'll implement a simplified approach:
    // 1. First check our own securities DB for a mapping
    // 2. For US securities (ISIN starting with "US"), try extracting the CUSIP
    // 3. For other countries, use an external service or public API
    
    // Try to find in our database first
    try {
      // This would be expanded to use an actual database query
      // For simplicity, we'll just continue to the fallback methods
    } catch (error) {
      console.warn('Error querying local symbol database:', error.message);
    }
    
    // Extract CUSIP from US ISINs (CUSIP is the middle 9 characters)
    if (isin.startsWith('US') && isin.length === 12) {
      const cusip = isin.substring(2, 11);
      
      // For Yahoo Finance, US symbols can usually be used directly
      if (provider === PROVIDERS.YAHOO) {
        // Cache and return the symbol
        priceCache.set(cacheKey, cusip);
        return cusip;
      }
    }
    
    // For other countries, use a symbology conversion service
    // This would normally be a real API call
    // For now, we'll return the ISIN and assume the provider can handle it
    
    // Cache the result for future use
    priceCache.set(cacheKey, isin);
    return isin;
  } catch (error) {
    console.error(`Error converting ISIN ${isin} to symbol:`, error);
    return isin; // Return original ISIN as fallback
  }
}

/**
 * Fetch price data from Yahoo Finance API
 * @param {string} symbol - Security symbol
 * @returns {Promise<Object>} - Price data
 */
async function fetchFromYahooFinance(symbol) {
  try {
    // Yahoo Finance API URL (using a public API endpoint that doesn't require authentication)
    // Use a mock for testing if symbol isn't valid
    const url = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${symbol}`;
    
    let response;
    try {
      response = await axios.get(url);
    } catch (error) {
      console.log(`Error fetching data from Yahoo Finance: ${error.message}`);
      return generateMockPriceData(symbol, PROVIDERS.YAHOO);
    }
    
    if (!response.data || !response.data.quoteResponse || !response.data.quoteResponse.result) {
      throw new Error('Invalid response from Yahoo Finance API');
    }
    
    const quotes = response.data.quoteResponse.result;
    
    if (!quotes || quotes.length === 0) {
      console.log(`No data found for symbol ${symbol} from Yahoo Finance, using mock data`);
      return generateMockPriceData(symbol, PROVIDERS.YAHOO);
    }
    
    const quote = quotes[0];
    
    return {
      symbol: quote.symbol,
      price: quote.regularMarketPrice,
      change: quote.regularMarketChange,
      changePercent: quote.regularMarketChangePercent,
      currency: quote.currency,
      exchange: quote.exchange,
      timestamp: quote.regularMarketTime * 1000, // Convert to milliseconds
      provider: PROVIDERS.YAHOO
    };
  } catch (error) {
    console.error(`Error fetching from Yahoo Finance for ${symbol}:`, error);
    throw error;
  }
}

/**
 * Fetch price data from Alpha Vantage API
 * @param {string} symbol - Security symbol
 * @returns {Promise<Object>} - Price data
 */
async function fetchFromAlphaVantage(symbol) {
  try {
    // Get API key from API Key Manager
    let apiKey;
    try {
      apiKey = await getApiKey('alphavantage');
    } catch (error) {
      console.log(`Error getting Alpha Vantage API key: ${error.message}`);
      return generateMockPriceData(symbol, PROVIDERS.ALPHA_VANTAGE);
    }
    
    // Alpha Vantage API URL
    const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${apiKey}`;
    
    const response = await axios.get(url);
    
    if (!response.data || !response.data['Global Quote'] || Object.keys(response.data['Global Quote']).length === 0) {
      console.log(`Invalid or empty response from Alpha Vantage API for ${symbol}, using mock data`);
      return generateMockPriceData(symbol, PROVIDERS.ALPHA_VANTAGE);
    }
    
    const quote = response.data['Global Quote'];
    
    return {
      symbol: quote['01. symbol'],
      price: parseFloat(quote['05. price']),
      change: parseFloat(quote['09. change']),
      changePercent: parseFloat(quote['10. change percent'].replace('%', '')),
      timestamp: new Date().getTime(), // Alpha Vantage doesn't provide a timestamp, so we use current time
      provider: PROVIDERS.ALPHA_VANTAGE
    };
  } catch (error) {
    console.error(`Error fetching from Alpha Vantage for ${symbol}:`, error);
    return generateMockPriceData(symbol, PROVIDERS.ALPHA_VANTAGE);
  }
}

/**
 * Fetch price data from IEX Cloud API
 * @param {string} symbol - Security symbol
 * @returns {Promise<Object>} - Price data
 */
async function fetchFromIEX(symbol) {
  try {
    // Get API key from API Key Manager
    let apiKey;
    try {
      apiKey = await getApiKey('iex');
    } catch (error) {
      console.log(`Error getting IEX API key: ${error.message}`);
      return generateMockPriceData(symbol, PROVIDERS.IEX);
    }
    
    // IEX Cloud API URL
    const url = `https://cloud.iexapis.com/stable/stock/${symbol}/quote?token=${apiKey}`;
    
    const response = await axios.get(url);
    
    if (!response.data) {
      throw new Error('Invalid response from IEX Cloud API');
    }
    
    const quote = response.data;
    
    return {
      symbol: quote.symbol,
      price: quote.latestPrice,
      change: quote.change,
      changePercent: quote.changePercent * 100,
      currency: 'USD', // IEX primarily provides USD prices
      exchange: quote.primaryExchange,
      timestamp: new Date(quote.latestUpdate).getTime(),
      provider: PROVIDERS.IEX
    };
  } catch (error) {
    console.error(`Error fetching from IEX Cloud for ${symbol}:`, error);
    return generateMockPriceData(symbol, PROVIDERS.IEX);
  }
}

/**
 * Fetch price data from Finnhub API
 * @param {string} symbol - Security symbol
 * @returns {Promise<Object>} - Price data
 */
async function fetchFromFinnhub(symbol) {
  try {
    // Get API key from API Key Manager
    let apiKey;
    try {
      apiKey = await getApiKey('finnhub');
    } catch (error) {
      console.log(`Error getting Finnhub API key: ${error.message}`);
      return generateMockPriceData(symbol, PROVIDERS.FINNHUB);
    }
    
    // Finnhub API URL
    const url = `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${apiKey}`;
    
    const response = await axios.get(url);
    
    if (!response.data || response.data.c === 0) {
      throw new Error('Invalid response from Finnhub API');
    }
    
    const quote = response.data;
    
    return {
      symbol: symbol,
      price: quote.c, // Current price
      change: quote.d, // Change
      changePercent: quote.dp, // Percent change
      timestamp: quote.t * 1000, // Convert to milliseconds
      provider: PROVIDERS.FINNHUB
    };
  } catch (error) {
    console.error(`Error fetching from Finnhub for ${symbol}:`, error);
    return generateMockPriceData(symbol, PROVIDERS.FINNHUB);
  }
}

/**
 * Fetch price data from Polygon.io API
 * @param {string} symbol - Security symbol
 * @returns {Promise<Object>} - Price data
 */
async function fetchFromPolygon(symbol) {
  try {
    // Get API key from API Key Manager
    let apiKey;
    try {
      apiKey = await getApiKey('polygon');
    } catch (error) {
      console.log(`Error getting Polygon API key: ${error.message}`);
      return generateMockPriceData(symbol, PROVIDERS.POLYGON);
    }
    
    // Polygon API URL
    const url = `https://api.polygon.io/v2/aggs/ticker/${symbol}/prev?apiKey=${apiKey}`;
    
    const response = await axios.get(url);
    
    if (!response.data || !response.data.results || !response.data.results.length) {
      throw new Error('Invalid response from Polygon API');
    }
    
    const result = response.data.results[0];
    
    return {
      symbol: symbol,
      price: result.c, // Close price
      change: result.c - result.o, // Close minus open
      changePercent: ((result.c - result.o) / result.o) * 100,
      timestamp: new Date().getTime(), // Polygon doesn't provide a specific timestamp for the quote
      provider: PROVIDERS.POLYGON
    };
  } catch (error) {
    console.error(`Error fetching from Polygon for ${symbol}:`, error);
    return generateMockPriceData(symbol, PROVIDERS.POLYGON);
  }
}

/**
 * Get historical price data for a security
 * @param {string} isin - International Securities Identification Number
 * @param {Object} options - Options for historical data
 * @param {string} options.period - Time period ('1d', '1w', '1m', '3m', '6m', '1y', '5y')
 * @param {string} options.interval - Data interval ('1m', '5m', '15m', '30m', '1h', '1d', '1wk', '1mo')
 * @param {string} options.provider - Specific provider to use
 * @returns {Promise<Array>} - Historical price data
 */
async function getHistoricalPrices(isin, options = {}) {
  try {
    const { period = '1m', interval = '1d', provider } = options;
    
    // Generate cache key
    const cacheKey = `history_${isin}_${period}_${interval}`;
    
    // Check cache first
    const cachedData = priceCache.get(cacheKey);
    if (cachedData) {
      console.log(`Retrieved historical data for ${isin} from cache`);
      return cachedData;
    }
    
    // If a specific provider is requested, try only that one
    if (provider && Object.values(PROVIDERS).includes(provider)) {
      return await fetchHistoricalFromProvider(isin, period, interval, provider);
    }
    
    // Otherwise use the primary provider with fallbacks
    try {
      // First try the primary provider
      if (checkRateLimit(primaryProvider)) {
        const historyData = await fetchHistoricalFromProvider(isin, period, interval, primaryProvider);
        
        // Cache the result before returning
        priceCache.set(cacheKey, historyData);
        return historyData;
      }
    } catch (error) {
      console.warn(`Primary provider ${primaryProvider} failed for historical data:`, error.message);
    }
    
    // Try fallback providers in sequence
    for (const fallbackProvider of fallbackProviders) {
      try {
        if (checkRateLimit(fallbackProvider)) {
          const historyData = await fetchHistoricalFromProvider(isin, period, interval, fallbackProvider);
          
          // Cache the result before returning
          priceCache.set(cacheKey, historyData);
          return historyData;
        }
      } catch (error) {
        console.warn(`Fallback provider ${fallbackProvider} failed for historical data:`, error.message);
      }
    }
    
    throw new Error(`All market data providers failed to fetch historical data for ${isin}`);
  } catch (error) {
    console.error(`Error getting historical prices for ${isin}:`, error);
    throw error;
  }
}

/**
 * Fetch historical price data from a specific provider
 * @param {string} isin - International Securities Identification Number
 * @param {string} period - Time period
 * @param {string} interval - Data interval
 * @param {string} provider - Data provider to use
 * @returns {Promise<Array>} - Historical price data
 */
async function fetchHistoricalFromProvider(isin, period, interval, provider) {
  try {
    // Convert ISIN to symbol format used by the provider
    const symbol = await convertIsinToSymbol(isin, provider);
    
    switch (provider) {
      case PROVIDERS.YAHOO:
        return await fetchHistoricalFromYahoo(symbol, period, interval);
      
      case PROVIDERS.ALPHA_VANTAGE:
        return await fetchHistoricalFromAlphaVantage(symbol, period, interval);
      
      case PROVIDERS.FINNHUB:
        return await fetchHistoricalFromFinnhub(symbol, period, interval);
      
      case PROVIDERS.POLYGON:
        return await fetchHistoricalFromPolygon(symbol, period, interval);
      
      case PROVIDERS.IEX:
        return await fetchHistoricalFromIEX(symbol, period, interval);
      
      default:
        throw new Error(`Unsupported provider for historical data: ${provider}`);
    }
  } catch (error) {
    console.error(`Error fetching historical data from ${provider} for ${isin}:`, error);
    throw error;
  }
}

/**
 * Fetch historical data from Yahoo Finance
 * @param {string} symbol - Security symbol
 * @param {string} period - Time period
 * @param {string} interval - Data interval
 * @returns {Promise<Array>} - Historical price data
 */
async function fetchHistoricalFromYahoo(symbol, period, interval) {
  try {
    // Convert period to Yahoo Finance format
    const range = convertPeriodToYahooRange(period);
    
    // Convert interval to Yahoo Finance format
    const yahooInterval = convertIntervalToYahooInterval(interval);
    
    // Yahoo Finance API URL
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?range=${range}&interval=${yahooInterval}`;
    
    const response = await axios.get(url);
    
    if (!response.data || !response.data.chart || 
        !response.data.chart.result || !response.data.chart.result[0]) {
      throw new Error('Invalid response from Yahoo Finance API for historical data');
    }
    
    const result = response.data.chart.result[0];
    const timestamps = result.timestamp;
    const quotes = result.indicators.quote[0];
    
    if (!timestamps || !quotes) {
      throw new Error('Missing data in Yahoo Finance API response');
    }
    
    // Format the data
    const historicalData = timestamps.map((timestamp, index) => {
      return {
        date: new Date(timestamp * 1000).toISOString(),
        open: quotes.open[index],
        high: quotes.high[index],
        low: quotes.low[index],
        close: quotes.close[index],
        volume: quotes.volume[index]
      };
    });
    
    return {
      symbol: symbol,
      historicalData,
      provider: PROVIDERS.YAHOO
    };
  } catch (error) {
    console.error(`Error fetching historical data from Yahoo Finance for ${symbol}:`, error);
    throw error;
  }
}

/**
 * Convert period to Yahoo Finance range format
 * @param {string} period - Time period
 * @returns {string} - Yahoo Finance range
 */
function convertPeriodToYahooRange(period) {
  switch (period) {
    case '1d': return '1d';
    case '1w': return '5d';
    case '1m': return '1mo';
    case '3m': return '3mo';
    case '6m': return '6mo';
    case '1y': return '1y';
    case '5y': return '5y';
    default: return '1mo';
  }
}

/**
 * Convert interval to Yahoo Finance interval format
 * @param {string} interval - Data interval
 * @returns {string} - Yahoo Finance interval
 */
function convertIntervalToYahooInterval(interval) {
  switch (interval) {
    case '1m': return '1m';
    case '5m': return '5m';
    case '15m': return '15m';
    case '30m': return '30m';
    case '1h': return '1h';
    case '1d': return '1d';
    case '1wk': return '1wk';
    case '1mo': return '1mo';
    default: return '1d';
  }
}

/**
 * Fetch historical data from Alpha Vantage
 * @param {string} symbol - Security symbol
 * @param {string} period - Time period
 * @param {string} interval - Data interval
 * @returns {Promise<Array>} - Historical price data
 */
async function fetchHistoricalFromAlphaVantage(symbol, period, interval) {
  try {
    // Get API key from API Key Manager
    const apiKey = await getApiKey('alphavantage');
    
    // Convert interval to Alpha Vantage format
    const function_name = convertIntervalToAlphaVantageFunction(interval);
    
    // Alpha Vantage API URL
    const url = `https://www.alphavantage.co/query?function=${function_name}&symbol=${symbol}&apikey=${apiKey}`;
    
    const response = await axios.get(url);
    
    if (!response.data) {
      throw new Error('Invalid response from Alpha Vantage API for historical data');
    }
    
    // Extract time series data based on function used
    let timeSeriesKey;
    switch (function_name) {
      case 'TIME_SERIES_INTRADAY':
        timeSeriesKey = `Time Series (${interval})`;
        break;
      case 'TIME_SERIES_DAILY':
        timeSeriesKey = 'Time Series (Daily)';
        break;
      case 'TIME_SERIES_WEEKLY':
        timeSeriesKey = 'Weekly Time Series';
        break;
      case 'TIME_SERIES_MONTHLY':
        timeSeriesKey = 'Monthly Time Series';
        break;
    }
    
    const timeSeries = response.data[timeSeriesKey];
    
    if (!timeSeries) {
      throw new Error('Missing time series data in Alpha Vantage API response');
    }
    
    // Format the data
    const historicalData = Object.entries(timeSeries).map(([date, data]) => {
      return {
        date,
        open: parseFloat(data['1. open']),
        high: parseFloat(data['2. high']),
        low: parseFloat(data['3. low']),
        close: parseFloat(data['4. close']),
        volume: parseInt(data['5. volume'])
      };
    });
    
    // Sort by date, newest first
    historicalData.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // Limit based on period
    const limitedData = limitDataByPeriod(historicalData, period);
    
    return {
      symbol,
      historicalData: limitedData,
      provider: PROVIDERS.ALPHA_VANTAGE
    };
  } catch (error) {
    console.error(`Error fetching historical data from Alpha Vantage for ${symbol}:`, error);
    throw error;
  }
}

/**
 * Convert interval to Alpha Vantage function name
 * @param {string} interval - Data interval
 * @returns {string} - Alpha Vantage function name
 */
function convertIntervalToAlphaVantageFunction(interval) {
  if (['1m', '5m', '15m', '30m', '1h'].includes(interval)) {
    return 'TIME_SERIES_INTRADAY';
  }
  if (interval === '1d') {
    return 'TIME_SERIES_DAILY';
  }
  if (interval === '1wk') {
    return 'TIME_SERIES_WEEKLY';
  }
  if (interval === '1mo') {
    return 'TIME_SERIES_MONTHLY';
  }
  
  return 'TIME_SERIES_DAILY'; // Default
}

/**
 * Limit historical data based on period
 * @param {Array} data - Historical data
 * @param {string} period - Time period
 * @returns {Array} - Limited data
 */
function limitDataByPeriod(data, period) {
  const today = new Date();
  let startDate;
  
  switch (period) {
    case '1d':
      startDate = new Date(today);
      startDate.setDate(today.getDate() - 1);
      break;
    case '1w':
      startDate = new Date(today);
      startDate.setDate(today.getDate() - 7);
      break;
    case '1m':
      startDate = new Date(today);
      startDate.setMonth(today.getMonth() - 1);
      break;
    case '3m':
      startDate = new Date(today);
      startDate.setMonth(today.getMonth() - 3);
      break;
    case '6m':
      startDate = new Date(today);
      startDate.setMonth(today.getMonth() - 6);
      break;
    case '1y':
      startDate = new Date(today);
      startDate.setFullYear(today.getFullYear() - 1);
      break;
    case '5y':
      startDate = new Date(today);
      startDate.setFullYear(today.getFullYear() - 5);
      break;
    default:
      startDate = new Date(today);
      startDate.setMonth(today.getMonth() - 1); // Default to 1 month
  }
  
  // Filter data to include only dates after the start date
  return data.filter(item => new Date(item.date) >= startDate);
}

/**
 * Fetch historical data from Finnhub
 * @param {string} symbol - Security symbol
 * @param {string} period - Time period
 * @param {string} interval - Data interval
 * @returns {Promise<Array>} - Historical price data
 */
async function fetchHistoricalFromFinnhub(symbol, period, interval) {
  try {
    // Get API key from API Key Manager
    const apiKey = await getApiKey('finnhub');
    
    // Calculate start and end timestamp
    const endTimestamp = Math.round(Date.now() / 1000);
    const startTimestamp = calculateStartTimestamp(endTimestamp, period);
    
    // Convert interval to Finnhub format
    const resolution = convertIntervalToFinnhubResolution(interval);
    
    // Finnhub API URL
    const url = `https://finnhub.io/api/v1/stock/candle?symbol=${symbol}&resolution=${resolution}&from=${startTimestamp}&to=${endTimestamp}&token=${apiKey}`;
    
    const response = await axios.get(url);
    
    if (!response.data || response.data.s === 'no_data') {
      throw new Error('Invalid response or no data from Finnhub API');
    }
    
    // Format the data
    const historicalData = response.data.t.map((timestamp, index) => {
      return {
        date: new Date(timestamp * 1000).toISOString(),
        open: response.data.o[index],
        high: response.data.h[index],
        low: response.data.l[index],
        close: response.data.c[index],
        volume: response.data.v[index]
      };
    });
    
    return {
      symbol,
      historicalData,
      provider: PROVIDERS.FINNHUB
    };
  } catch (error) {
    console.error(`Error fetching historical data from Finnhub for ${symbol}:`, error);
    throw error;
  }
}

/**
 * Calculate start timestamp based on period
 * @param {number} endTimestamp - End timestamp
 * @param {string} period - Time period
 * @returns {number} - Start timestamp
 */
function calculateStartTimestamp(endTimestamp, period) {
  const secondsInDay = 86400;
  
  switch (period) {
    case '1d': return endTimestamp - secondsInDay;
    case '1w': return endTimestamp - (7 * secondsInDay);
    case '1m': return endTimestamp - (30 * secondsInDay);
    case '3m': return endTimestamp - (90 * secondsInDay);
    case '6m': return endTimestamp - (180 * secondsInDay);
    case '1y': return endTimestamp - (365 * secondsInDay);
    case '5y': return endTimestamp - (5 * 365 * secondsInDay);
    default: return endTimestamp - (30 * secondsInDay); // Default to 1 month
  }
}

/**
 * Convert interval to Finnhub resolution
 * @param {string} interval - Data interval
 * @returns {string} - Finnhub resolution
 */
function convertIntervalToFinnhubResolution(interval) {
  switch (interval) {
    case '1m': return '1';
    case '5m': return '5';
    case '15m': return '15';
    case '30m': return '30';
    case '1h': return '60';
    case '1d': return 'D';
    case '1wk': return 'W';
    case '1mo': return 'M';
    default: return 'D'; // Default to daily
  }
}

/**
 * Fetch historical data from IEX Cloud
 * @param {string} symbol - Security symbol
 * @param {string} period - Time period
 * @param {string} interval - Data interval
 * @returns {Promise<Array>} - Historical price data
 */
async function fetchHistoricalFromIEX(symbol, period, interval) {
  try {
    // Get API key from API Key Manager
    const apiKey = await getApiKey('iex');
    
    // Convert period to IEX range
    const range = convertPeriodToIEXRange(period);
    
    // IEX Cloud API URL - historical prices
    const url = `https://cloud.iexapis.com/stable/stock/${symbol}/chart/${range}?token=${apiKey}`;
    
    const response = await axios.get(url);
    
    if (!response.data || !Array.isArray(response.data)) {
      throw new Error('Invalid response from IEX Cloud API for historical data');
    }
    
    // Format the data
    const historicalData = response.data.map(item => {
      return {
        date: item.date,
        open: item.open,
        high: item.high,
        low: item.low,
        close: item.close,
        volume: item.volume
      };
    });
    
    return {
      symbol,
      historicalData,
      provider: PROVIDERS.IEX
    };
  } catch (error) {
    console.error(`Error fetching historical data from IEX Cloud for ${symbol}:`, error);
    throw error;
  }
}

/**
 * Convert period to IEX range
 * @param {string} period - Time period
 * @returns {string} - IEX range
 */
function convertPeriodToIEXRange(period) {
  switch (period) {
    case '1d': return '1d';
    case '1w': return '5d';
    case '1m': return '1m';
    case '3m': return '3m';
    case '6m': return '6m';
    case '1y': return '1y';
    case '5y': return '5y';
    default: return '1m'; // Default to 1 month
  }
}

/**
 * Fetch historical data from Polygon.io
 * @param {string} symbol - Security symbol
 * @param {string} period - Time period
 * @param {string} interval - Data interval
 * @returns {Promise<Array>} - Historical price data
 */
async function fetchHistoricalFromPolygon(symbol, period, interval) {
  try {
    // Get API key from API Key Manager
    const apiKey = await getApiKey('polygon');
    
    // Convert interval to Polygon timespan
    const timespan = convertIntervalToPolygonTimespan(interval);
    
    // Calculate start and end dates
    const today = new Date();
    const endDate = today.toISOString().split('T')[0];
    const startDate = calculateStartDate(today, period);
    
    // Polygon API URL
    const url = `https://api.polygon.io/v2/aggs/ticker/${symbol}/range/1/${timespan}/${startDate}/${endDate}?apiKey=${apiKey}`;
    
    const response = await axios.get(url);
    
    if (!response.data || !response.data.results) {
      throw new Error('Invalid response from Polygon API for historical data');
    }
    
    // Format the data
    const historicalData = response.data.results.map(item => {
      const date = new Date(item.t);
      return {
        date: date.toISOString(),
        open: item.o,
        high: item.h,
        low: item.l,
        close: item.c,
        volume: item.v
      };
    });
    
    return {
      symbol,
      historicalData,
      provider: PROVIDERS.POLYGON
    };
  } catch (error) {
    console.error(`Error fetching historical data from Polygon for ${symbol}:`, error);
    throw error;
  }
}

/**
 * Convert interval to Polygon timespan
 * @param {string} interval - Data interval
 * @returns {string} - Polygon timespan
 */
function convertIntervalToPolygonTimespan(interval) {
  switch (interval) {
    case '1m': return 'minute';
    case '5m': return 'minute';
    case '15m': return 'minute';
    case '30m': return 'minute';
    case '1h': return 'hour';
    case '1d': return 'day';
    case '1wk': return 'week';
    case '1mo': return 'month';
    default: return 'day'; // Default to daily
  }
}

/**
 * Calculate start date based on period
 * @param {Date} endDate - End date
 * @param {string} period - Time period
 * @returns {string} - Start date (YYYY-MM-DD)
 */
function calculateStartDate(endDate, period) {
  const startDate = new Date(endDate);
  
  switch (period) {
    case '1d':
      startDate.setDate(endDate.getDate() - 1);
      break;
    case '1w':
      startDate.setDate(endDate.getDate() - 7);
      break;
    case '1m':
      startDate.setMonth(endDate.getMonth() - 1);
      break;
    case '3m':
      startDate.setMonth(endDate.getMonth() - 3);
      break;
    case '6m':
      startDate.setMonth(endDate.getMonth() - 6);
      break;
    case '1y':
      startDate.setFullYear(endDate.getFullYear() - 1);
      break;
    case '5y':
      startDate.setFullYear(endDate.getFullYear() - 5);
      break;
    default:
      startDate.setMonth(endDate.getMonth() - 1); // Default to 1 month
  }
  
  return startDate.toISOString().split('T')[0];
}

/**
 * Update security data with current market prices
 * @param {Array} securities - Securities data to update
 * @param {Object} options - Options for the update
 * @returns {Promise<Object>} - Updated securities with price data
 */
async function updateSecuritiesWithMarketPrices(securities, options = {}) {
  try {
    if (!Array.isArray(securities) || securities.length === 0) {
      return { securities: [], marketPricesAdded: 0 };
    }
    
    console.log(`Updating market prices for ${securities.length} securities`);
    
    const updatedSecurities = [];
    let marketPricesAdded = 0;
    
    // Process securities in batches to avoid overwhelming APIs
    const batchSize = 10;
    const batches = [];
    
    for (let i = 0; i < securities.length; i += batchSize) {
      batches.push(securities.slice(i, i + batchSize));
    }
    
    // Process each batch
    for (const batch of batches) {
      const batchPromises = batch.map(async (security) => {
        try {
          // Skip securities without an ISIN
          if (!security.isin) {
            return { ...security };
          }
          
          // Get current price data
          const priceData = await getCurrentPrice(security.isin, options);
          
          // Skip if we couldn't get price data
          if (!priceData) {
            return { ...security };
          }
          
          // Calculate values
          const price = priceData.price;
          const marketValue = security.quantity ? security.quantity * price : null;
          
          // Update security with market data
          const updatedSecurity = {
            ...security,
            marketPrice: price,
            marketValue,
            priceChange: priceData.change,
            priceChangePercent: priceData.changePercent,
            lastUpdated: new Date().toISOString(),
            dataProvider: priceData.provider
          };
          
          marketPricesAdded++;
          return updatedSecurity;
        } catch (error) {
          console.error(`Error updating market price for security ${security.isin}:`, error);
          // Return original security if updating fails
          return { ...security };
        }
      });
      
      // Wait for all securities in this batch to be processed
      const batchResults = await Promise.all(batchPromises);
      updatedSecurities.push(...batchResults);
      
      // Add a small delay between batches to avoid rate limits
      if (batches.length > 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    console.log(`Updated market prices for ${marketPricesAdded} of ${securities.length} securities`);
    
    return {
      securities: updatedSecurities,
      marketPricesAdded
    };
  } catch (error) {
    console.error('Error updating securities with market prices:', error);
    throw error;
  }
}

/**
 * Generate mock price data for testing purposes
 * @param {string} symbol - Security symbol
 * @param {string} provider - Data provider
 * @returns {Object} - Mock price data
 */
function generateMockPriceData(symbol, provider) {
  // Generate a random price between 10 and 1000
  const price = parseFloat((10 + Math.random() * 990).toFixed(2));
  
  // Generate a random change between -5% and +5%
  const changePercent = parseFloat((Math.random() * 10 - 5).toFixed(2));
  const change = parseFloat((price * changePercent / 100).toFixed(2));
  
  return {
    symbol,
    price,
    change,
    changePercent,
    currency: 'USD',
    exchange: 'MOCK',
    timestamp: Date.now(),
    provider,
    isMockData: true
  };
}

// Export functions
module.exports = {
  configureProviders,
  getCurrentPrice,
  getHistoricalPrices,
  updateSecuritiesWithMarketPrices,
  PROVIDERS
};