/**
 * Brave Search MCP Implementation
 * 
 * A custom implementation of the Brave Search MCP for entity enrichment
 */

const axios = require('axios');
const { EventEmitter } = require('events');

// Create event emitter
const emitter = new EventEmitter();

// Brave Search API endpoint
const BRAVE_SEARCH_API = 'https://api.search.brave.com/res/v1/web/search';

/**
 * Perform a web search
 * @param {Object} params - Search parameters
 * @param {string} params.q - The search query
 * @param {string} params.type - The search type (web, news, etc.)
 * @param {number} params.count - Number of results to return
 * @returns {Promise<Object>} - Search results
 */
async function search(params) {
  try {
    const { q, type = 'web', count = 5 } = params;
    
    // Get the API key from environment variables
    const apiKey = process.env.BRAVE_API_KEY || 'not-available';
    
    // If no API key is available, return mock results
    if (apiKey === 'not-available') {
      console.log('No Brave API key available, returning mock results');
      return getMockSearchResults(q, type, count);
    }
    
    // Make the API request
    const response = await axios.get(BRAVE_SEARCH_API, {
      params: {
        q,
        count: Math.min(count, 10)
      },
      headers: {
        'Accept': 'application/json',
        'Accept-Encoding': 'gzip',
        'X-Subscription-Token': apiKey
      }
    });
    
    // Return the results
    return {
      query: q,
      results: response.data.web.results.map(result => ({
        title: result.title,
        description: result.description,
        url: result.url
      })),
      count: response.data.web.results.length
    };
  } catch (error) {
    console.error(`Error in Brave search: ${error.message}`);
    
    // If the API request fails, return mock results
    return getMockSearchResults(params.q, params.type, params.count);
  }
}

/**
 * Get mock search results
 * @param {string} query - The search query
 * @param {string} type - The search type
 * @param {number} count - Number of results to return
 * @returns {Object} - Mock search results
 */
function getMockSearchResults(query, type, count) {
  // Parse the query for entities
  const entities = parseQueryForEntities(query);
  
  // Generate mock results based on entities
  const results = [];
  
  for (let i = 0; i < Math.min(count, 5); i++) {
    results.push(generateMockResult(entities, i));
  }
  
  return {
    query,
    results,
    count: results.length,
    mock: true
  };
}

/**
 * Parse query for entities
 * @param {string} query - The search query
 * @returns {Object} - Extracted entities
 */
function parseQueryForEntities(query) {
  // Extract company names
  const companyMatch = query.match(/([A-Z][a-zA-Z]+(?:\s[A-Z][a-zA-Z]+)*)/);
  const company = companyMatch ? companyMatch[1] : null;
  
  // Extract ISINs
  const isinMatch = query.match(/[A-Z]{2}[A-Z0-9]{10}/);
  const isin = isinMatch ? isinMatch[0] : null;
  
  // Extract ticker symbols
  const tickerMatch = query.match(/\b[A-Z]{1,5}\b/);
  const ticker = tickerMatch ? tickerMatch[0] : null;
  
  return {
    company,
    isin,
    ticker
  };
}

/**
 * Generate a mock search result
 * @param {Object} entities - Extracted entities
 * @param {number} index - Result index
 * @returns {Object} - Mock result
 */
function generateMockResult(entities, index) {
  const { company, isin, ticker } = entities;
  
  // Default mock results
  const mockResults = [
    {
      title: 'Financial Markets Overview | Latest Stock News & Data',
      description: 'Get the latest stock market news, financial data, and trading information.',
      url: 'https://example.com/finance'
    },
    {
      title: 'Company Profile | Business Information & Analysis',
      description: 'Detailed information about companies, their financials, and market performance.',
      url: 'https://example.com/companies'
    },
    {
      title: 'ISIN Database | Security Identifiers Reference',
      description: 'Comprehensive database of International Securities Identification Numbers (ISINs).',
      url: 'https://example.com/isin'
    },
    {
      title: 'Stock Tickers & Symbols | Market Listings',
      description: 'Find stock ticker symbols for publicly traded companies around the world.',
      url: 'https://example.com/tickers'
    },
    {
      title: 'Financial News & Analysis | Market Insights',
      description: 'Breaking financial news, market analysis, and investment insights.',
      url: 'https://example.com/news'
    }
  ];
  
  // If we have a company, customize the result
  if (company && index === 0) {
    return {
      title: `${company} - Company Profile & Financial Information`,
      description: `${company} (${ticker || 'TICKER'}) is a publicly traded company with various financial products and services.`,
      url: `https://example.com/company/${company.toLowerCase().replace(/\s/g, '-')}`
    };
  }
  
  // If we have an ISIN, customize the result
  if (isin && index === 1) {
    return {
      title: `ISIN: ${isin} - Security Information`,
      description: `Information about security with ISIN ${isin}, including market data and trading details.`,
      url: `https://example.com/isin/${isin}`
    };
  }
  
  // If we have a ticker, customize the result
  if (ticker && index === 2) {
    return {
      title: `${ticker} Stock Price & Chart | ${company || 'Company'} Ticker`,
      description: `View the stock price chart and financial information for ${company || 'company'} with ticker symbol ${ticker}.`,
      url: `https://example.com/stock/${ticker}`
    };
  }
  
  // Otherwise, return a generic mock result
  return mockResults[index % mockResults.length];
}

/**
 * Handle Brave search requests
 * @param {Object} request - Request object
 * @returns {Promise<Object>} - Response object
 */
async function handleRequest(request) {
  try {
    const { action, params } = request;
    
    switch (action) {
      case 'search':
        return await search(params);
      default:
        return {
          error: `Unknown action: ${action}`
        };
    }
  } catch (error) {
    console.error(`Error handling request: ${error.message}`);
    return {
      error: error.message
    };
  }
}

// Export the module
module.exports = {
  search,
  handleRequest,
  emitter
};