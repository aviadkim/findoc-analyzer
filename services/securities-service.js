/**
 * Securities Service
 * Provides functionality for working with securities data
 */

const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Mock data for testing
const mockSecurities = [
  {
    id: 'sec-001',
    name: 'Apple Inc.',
    ticker: 'AAPL',
    isin: 'US0378331005',
    type: 'Equity',
    sector: 'Technology',
    country: 'United States',
    currency: 'USD',
    price: 175.34,
    priceDate: '2025-05-13T00:00:00.000Z',
    marketCap: 2750000000000,
    description: 'Apple Inc. designs, manufactures, and markets smartphones, personal computers, tablets, wearables, and accessories worldwide.'
  },
  {
    id: 'sec-002',
    name: 'Microsoft Corporation',
    ticker: 'MSFT',
    isin: 'US5949181045',
    type: 'Equity',
    sector: 'Technology',
    country: 'United States',
    currency: 'USD',
    price: 325.76,
    priceDate: '2025-05-13T00:00:00.000Z',
    marketCap: 2420000000000,
    description: 'Microsoft Corporation develops, licenses, and supports software, services, devices, and solutions worldwide.'
  },
  {
    id: 'sec-003',
    name: 'Amazon.com, Inc.',
    ticker: 'AMZN',
    isin: 'US0231351067',
    type: 'Equity',
    sector: 'Consumer Cyclical',
    country: 'United States',
    currency: 'USD',
    price: 132.45,
    priceDate: '2025-05-13T00:00:00.000Z',
    marketCap: 1350000000000,
    description: 'Amazon.com, Inc. engages in the retail sale of consumer products and subscriptions in North America and internationally.'
  },
  {
    id: 'sec-004',
    name: 'Alphabet Inc.',
    ticker: 'GOOGL',
    isin: 'US02079K1079',
    type: 'Equity',
    sector: 'Communication Services',
    country: 'United States',
    currency: 'USD',
    price: 145.87,
    priceDate: '2025-05-13T00:00:00.000Z',
    marketCap: 1850000000000,
    description: 'Alphabet Inc. provides various products and platforms in the United States, Europe, the Middle East, Africa, the Asia-Pacific, Canada, and Latin America.'
  },
  {
    id: 'sec-005',
    name: 'Tesla, Inc.',
    ticker: 'TSLA',
    isin: 'US88160R1014',
    type: 'Equity',
    sector: 'Consumer Cyclical',
    country: 'United States',
    currency: 'USD',
    price: 187.23,
    priceDate: '2025-05-13T00:00:00.000Z',
    marketCap: 595000000000,
    description: 'Tesla, Inc. designs, develops, manufactures, leases, and sells electric vehicles, and energy generation and storage systems.'
  }
];

/**
 * Get all securities
 * @param {Object} options - Options for filtering securities
 * @returns {Promise<Array>} - Array of securities
 */
async function getAllSecurities(options = {}) {
  try {
    // In a real implementation, this would fetch from a database
    // For now, return mock data
    
    // Apply filters if provided
    let result = [...mockSecurities];
    
    if (options.type) {
      result = result.filter(sec => sec.type === options.type);
    }
    
    if (options.sector) {
      result = result.filter(sec => sec.sector === options.sector);
    }
    
    if (options.country) {
      result = result.filter(sec => sec.country === options.country);
    }
    
    return result;
  } catch (error) {
    console.error('Error getting securities:', error);
    return [];
  }
}

/**
 * Get a security by ID
 * @param {String} id - Security ID
 * @returns {Promise<Object|null>} - Security object or null if not found
 */
async function getSecurityById(id) {
  try {
    // In a real implementation, this would fetch from a database
    // For now, search mock data
    const security = mockSecurities.find(sec => sec.id === id);
    
    return security || null;
  } catch (error) {
    console.error(`Error getting security ${id}:`, error);
    return null;
  }
}

/**
 * Get a security by ticker
 * @param {String} ticker - Security ticker
 * @returns {Promise<Object|null>} - Security object or null if not found
 */
async function getSecurityByTicker(ticker) {
  try {
    // In a real implementation, this would fetch from a database
    // For now, search mock data
    const security = mockSecurities.find(sec => sec.ticker === ticker);
    
    return security || null;
  } catch (error) {
    console.error(`Error getting security by ticker ${ticker}:`, error);
    return null;
  }
}

/**
 * Get a security by ISIN
 * @param {String} isin - Security ISIN
 * @returns {Promise<Object|null>} - Security object or null if not found
 */
async function getSecurityByIsin(isin) {
  try {
    // In a real implementation, this would fetch from a database
    // For now, search mock data
    const security = mockSecurities.find(sec => sec.isin === isin);
    
    return security || null;
  } catch (error) {
    console.error(`Error getting security by ISIN ${isin}:`, error);
    return null;
  }
}

/**
 * Create a new security
 * @param {Object} securityData - Security data
 * @returns {Promise<Object>} - Created security
 */
async function createSecurity(securityData) {
  try {
    // Generate ID if not provided
    const newSecurity = {
      id: securityData.id || `sec-${uuidv4().substring(0, 8)}`,
      ...securityData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // In a real implementation, this would save to a database
    // For now, just return the new security
    
    return newSecurity;
  } catch (error) {
    console.error('Error creating security:', error);
    throw error;
  }
}

/**
 * Update a security
 * @param {String} id - Security ID
 * @param {Object} securityData - Updated security data
 * @returns {Promise<Object|null>} - Updated security or null if not found
 */
async function updateSecurity(id, securityData) {
  try {
    // In a real implementation, this would update in a database
    // For now, just return a mock updated security
    
    return {
      id,
      ...securityData,
      updatedAt: new Date().toISOString()
    };
  } catch (error) {
    console.error(`Error updating security ${id}:`, error);
    throw error;
  }
}

/**
 * Delete a security
 * @param {String} id - Security ID
 * @returns {Promise<Boolean>} - Whether the security was deleted
 */
async function deleteSecurity(id) {
  try {
    // In a real implementation, this would delete from a database
    // For now, just return success
    
    return true;
  } catch (error) {
    console.error(`Error deleting security ${id}:`, error);
    throw error;
  }
}

/**
 * Search for securities
 * @param {String} query - Search query
 * @param {Object} options - Search options
 * @returns {Promise<Array>} - Array of matching securities
 */
async function searchSecurities(query, options = {}) {
  try {
    // In a real implementation, this would search in a database
    // For now, search mock data
    
    if (!query) {
      return [];
    }
    
    const lowerQuery = query.toLowerCase();
    
    const results = mockSecurities.filter(sec => 
      sec.name.toLowerCase().includes(lowerQuery) ||
      sec.ticker.toLowerCase().includes(lowerQuery) ||
      sec.isin.toLowerCase().includes(lowerQuery) ||
      (sec.description && sec.description.toLowerCase().includes(lowerQuery))
    );
    
    // Apply limit if provided
    if (options.limit && options.limit > 0) {
      return results.slice(0, options.limit);
    }
    
    return results;
  } catch (error) {
    console.error(`Error searching securities for "${query}":`, error);
    return [];
  }
}

module.exports = {
  getAllSecurities,
  getSecurityById,
  getSecurityByTicker,
  getSecurityByIsin,
  createSecurity,
  updateSecurity,
  deleteSecurity,
  searchSecurities
};
