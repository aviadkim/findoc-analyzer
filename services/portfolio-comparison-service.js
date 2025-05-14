/**
 * Portfolio Comparison Service
 * 
 * This service enables comparing portfolio compositions across different documents and time periods.
 * It identifies changes in holdings, asset allocation, and performance metrics.
 */

const { v4: uuidv4 } = require('uuid');
const marketDataService = require('./market-data-service');
const documentService = require('./document-service');

/**
 * Compare two portfolios from different documents
 * @param {string} document1Id - First document ID
 * @param {string} document2Id - Second document ID
 * @param {Object} options - Comparison options
 * @returns {Promise<Object>} - Comparison results
 */
async function comparePortfolios(document1Id, document2Id, options = {}) {
  try {
    console.log(`Comparing portfolios from documents: ${document1Id} and ${document2Id}`);
    
    // Get both documents
    const [document1, document2] = await Promise.all([
      documentService.getDocumentContent(document1Id),
      documentService.getDocumentContent(document2Id)
    ]);
    
    if (!document1 || !document2) {
      throw new Error('One or both documents not found');
    }
    
    // Extract securities from documents
    const securities1 = document1.content?.securities || [];
    const securities2 = document2.content?.securities || [];
    
    if (securities1.length === 0 || securities2.length === 0) {
      throw new Error('One or both documents have no securities data');
    }

    // Update market data if requested
    let doc1Securities = securities1;
    let doc2Securities = securities2;
    
    if (options.includeMarketData) {
      [doc1Securities, doc2Securities] = await Promise.all([
        marketDataService.updateSecuritiesWithMarketPrices(securities1),
        marketDataService.updateSecuritiesWithMarketPrices(securities2)
      ]);
      doc1Securities = doc1Securities.securities;
      doc2Securities = doc2Securities.securities;
    }
    
    // Compare portfolios
    const comparison = compareSecuritiesData(doc1Securities, doc2Securities, {
      thresholdPercentage: options.thresholdPercentage || 5.0,
      useMarketValues: options.useMarketValues || false,
      calculateGainLoss: options.calculateGainLoss || true
    });
    
    // Calculate portfolio-level metrics
    const portfolioMetrics = calculatePortfolioMetrics(doc1Securities, doc2Securities, comparison);
    
    // Store the comparison result
    const comparisonResult = {
      id: uuidv4(),
      document1: {
        id: document1Id,
        name: document1.fileName,
        date: document1.uploadDate
      },
      document2: {
        id: document2Id,
        name: document2.fileName,
        date: document2.uploadDate
      },
      portfolioMetrics,
      securitiesComparison: comparison,
      comparisonDate: new Date().toISOString(),
      options: {
        thresholdPercentage: options.thresholdPercentage || 5.0,
        useMarketValues: options.useMarketValues || false,
        includeMarketData: options.includeMarketData || false
      }
    };
    
    console.log(`Portfolio comparison completed: ${comparisonResult.id}`);
    
    return comparisonResult;
  } catch (error) {
    console.error(`Error comparing portfolios: ${error.message}`);
    throw error;
  }
}

/**
 * Compare two sets of securities data
 * @param {Array} securities1 - First set of securities
 * @param {Array} securities2 - Second set of securities
 * @param {Object} options - Comparison options
 * @returns {Object} - Securities comparison results
 */
function compareSecuritiesData(securities1, securities2, options = {}) {
  // Create maps of securities by ISIN
  const securities1Map = new Map();
  const securities2Map = new Map();
  
  securities1.forEach(security => {
    if (security.isin) {
      securities1Map.set(security.isin, security);
    }
  });
  
  securities2.forEach(security => {
    if (security.isin) {
      securities2Map.set(security.isin, security);
    }
  });
  
  // Identify common, added, and removed securities
  const commonSecurities = [];
  const addedSecurities = [];
  const removedSecurities = [];
  
  // Find securities in both portfolios
  for (const [isin, security2] of securities2Map.entries()) {
    if (securities1Map.has(isin)) {
      const security1 = securities1Map.get(isin);
      const comparison = compareSecurityDetails(security1, security2, options);
      commonSecurities.push(comparison);
    } else {
      addedSecurities.push({
        security: security2,
        isin: security2.isin,
        name: security2.name,
        value: options.useMarketValues ? (security2.marketValue || security2.value) : security2.value,
        quantity: security2.quantity,
        percentage: security2.percentage || security2.percent_of_assets,
        action: 'added'
      });
    }
  }
  
  // Find securities only in first portfolio
  for (const [isin, security1] of securities1Map.entries()) {
    if (!securities2Map.has(isin)) {
      removedSecurities.push({
        security: security1,
        isin: security1.isin,
        name: security1.name,
        value: options.useMarketValues ? (security1.marketValue || security1.value) : security1.value,
        quantity: security1.quantity,
        percentage: security1.percentage || security1.percent_of_assets,
        action: 'removed'
      });
    }
  }
  
  // Sort all lists by value (descending)
  commonSecurities.sort((a, b) => (b.security2.value || 0) - (a.security2.value || 0));
  addedSecurities.sort((a, b) => (b.value || 0) - (a.value || 0));
  removedSecurities.sort((a, b) => (b.value || 0) - (a.value || 0));
  
  // Identify securities with significant changes
  const significantChanges = commonSecurities.filter(item => 
    Math.abs(item.percentageChange) >= options.thresholdPercentage || 
    Math.abs(item.allocationChange) >= (options.thresholdPercentage / 100)
  );
  
  // Sort by percentage change (descending)
  significantChanges.sort((a, b) => Math.abs(b.percentageChange) - Math.abs(a.percentageChange));
  
  return {
    common: commonSecurities,
    added: addedSecurities,
    removed: removedSecurities,
    significantChanges,
    totalCommon: commonSecurities.length,
    totalAdded: addedSecurities.length,
    totalRemoved: removedSecurities.length,
    totalSignificantChanges: significantChanges.length
  };
}

/**
 * Compare details between two instances of the same security
 * @param {Object} security1 - Security from first portfolio
 * @param {Object} security2 - Security from second portfolio
 * @param {Object} options - Comparison options
 * @returns {Object} - Security comparison results
 */
function compareSecurityDetails(security1, security2, options) {
  // Determine which values to use (market values or reported values)
  const value1 = options.useMarketValues ? (security1.marketValue || security1.value) : security1.value;
  const value2 = options.useMarketValues ? (security2.marketValue || security2.value) : security2.value;
  
  // Calculate value changes
  const valueChange = value2 - value1;
  const percentageChange = value1 !== 0 ? (valueChange / value1) * 100 : 0;
  
  // Calculate quantity changes
  const quantity1 = security1.quantity || 0;
  const quantity2 = security2.quantity || 0;
  const quantityChange = quantity2 - quantity1;
  const quantityPercentageChange = quantity1 !== 0 ? (quantityChange / quantity1) * 100 : 0;
  
  // Calculate allocation changes
  const allocation1 = security1.percentage || security1.percent_of_assets || 0;
  const allocation2 = security2.percentage || security2.percent_of_assets || 0;
  const allocationChange = allocation2 - allocation1;
  
  // Calculate price changes
  const price1 = security1.price || (security1.quantity ? security1.value / security1.quantity : 0);
  const price2 = security2.price || (security2.quantity ? security2.value / security2.quantity : 0);
  const priceChange = price2 - price1;
  const pricePercentageChange = price1 !== 0 ? (priceChange / price1) * 100 : 0;
  
  // Determine change classification
  let changeType = 'unchanged';
  if (Math.abs(percentageChange) >= options.thresholdPercentage) {
    changeType = percentageChange > 0 ? 'increased' : 'decreased';
  }
  
  // Determine quantity change classification
  let quantityChangeType = 'unchanged';
  if (Math.abs(quantityPercentageChange) >= 1.0) { // 1% threshold for quantity changes
    quantityChangeType = quantityPercentageChange > 0 ? 'increased' : 'decreased';
  }
  
  return {
    isin: security1.isin,
    name: security2.name || security1.name,
    security1,
    security2,
    value: {
      old: value1,
      new: value2,
      change: valueChange,
      percentageChange
    },
    quantity: {
      old: quantity1,
      new: quantity2,
      change: quantityChange,
      percentageChange: quantityPercentageChange
    },
    allocation: {
      old: allocation1,
      new: allocation2,
      change: allocationChange
    },
    price: {
      old: price1,
      new: price2,
      change: priceChange,
      percentageChange: pricePercentageChange
    },
    changeType,
    quantityChangeType,
    percentageChange,
    allocationChange
  };
}

/**
 * Calculate portfolio-level metrics based on securities comparison
 * @param {Array} securities1 - Securities from first portfolio
 * @param {Array} securities2 - Securities from second portfolio
 * @param {Object} comparison - Securities comparison results
 * @returns {Object} - Portfolio metrics
 */
function calculatePortfolioMetrics(securities1, securities2, comparison) {
  // Calculate total portfolio values
  const totalValue1 = securities1.reduce((sum, security) => sum + (security.value || 0), 0);
  const totalValue2 = securities2.reduce((sum, security) => sum + (security.value || 0), 0);
  
  // Calculate portfolio value change
  const valueChange = totalValue2 - totalValue1;
  const percentageChange = totalValue1 !== 0 ? (valueChange / totalValue1) * 100 : 0;
  
  // Calculate asset allocation at portfolio level
  const assetAllocation1 = calculateAssetAllocation(securities1);
  const assetAllocation2 = calculateAssetAllocation(securities2);
  
  // Compare asset allocations
  const allocationComparison = compareAssetAllocations(assetAllocation1, assetAllocation2);
  
  // Calculate turnover metrics
  const additionsValue = comparison.added.reduce((sum, security) => sum + (security.value || 0), 0);
  const removalsValue = comparison.removed.reduce((sum, security) => sum + (security.value || 0), 0);
  const turnover = (additionsValue + removalsValue) / 2;
  const turnoverRatio = totalValue1 !== 0 ? (turnover / totalValue1) * 100 : 0;
  
  // Calculate diversification metrics
  const diversification1 = calculateDiversificationMetrics(securities1);
  const diversification2 = calculateDiversificationMetrics(securities2);
  
  return {
    portfolioValue: {
      old: totalValue1,
      new: totalValue2,
      change: valueChange,
      percentageChange
    },
    assetAllocation: {
      old: assetAllocation1,
      new: assetAllocation2,
      comparison: allocationComparison
    },
    turnover: {
      additionsValue,
      removalsValue,
      turnover,
      turnoverRatio
    },
    diversification: {
      old: diversification1,
      new: diversification2,
      change: {
        securitiesCount: diversification2.securitiesCount - diversification1.securitiesCount,
        topHoldingsConcentration: diversification2.topHoldingsConcentration - diversification1.topHoldingsConcentration
      }
    }
  };
}

/**
 * Calculate asset allocation from securities
 * @param {Array} securities - Securities data
 * @returns {Object} - Asset allocation by type
 */
function calculateAssetAllocation(securities) {
  const allocation = {};
  
  securities.forEach(security => {
    // Determine asset type (use type, assetClass, or infer from name)
    const assetType = security.type || security.assetClass || inferAssetType(security.name);
    
    if (!allocation[assetType]) {
      allocation[assetType] = 0;
    }
    
    // Use percentage if available, otherwise calculate it
    const percentage = security.percentage || security.percent_of_assets || 
      (security.value / securities.reduce((sum, s) => sum + (s.value || 0), 0));
    
    allocation[assetType] += percentage;
  });
  
  return allocation;
}

/**
 * Infer asset type from security name
 * @param {string} securityName - Security name
 * @returns {string} - Inferred asset type
 */
function inferAssetType(securityName) {
  if (!securityName) return 'Other';
  
  const name = securityName.toLowerCase();
  
  if (name.includes('bond') || name.includes('treasury') || name.includes('note')) {
    return 'Fixed Income';
  } else if (name.includes('fund') || name.includes('etf')) {
    if (name.includes('bond') || name.includes('income')) {
      return 'Fixed Income';
    } else if (name.includes('real estate') || name.includes('reit')) {
      return 'Real Estate';
    } else if (name.includes('commodity') || name.includes('gold') || name.includes('silver')) {
      return 'Commodities';
    } else {
      return 'Equity';
    }
  } else if (name.includes('reit') || name.includes('real estate')) {
    return 'Real Estate';
  } else if (name.includes('gold') || name.includes('silver') || name.includes('oil')) {
    return 'Commodities';
  } else {
    return 'Equity';
  }
}

/**
 * Compare asset allocations between portfolios
 * @param {Object} allocation1 - First portfolio asset allocation
 * @param {Object} allocation2 - Second portfolio asset allocation
 * @returns {Array} - Asset allocation changes
 */
function compareAssetAllocations(allocation1, allocation2) {
  const allAssetTypes = new Set([
    ...Object.keys(allocation1),
    ...Object.keys(allocation2)
  ]);
  
  const changes = [];
  
  for (const assetType of allAssetTypes) {
    const oldAllocation = allocation1[assetType] || 0;
    const newAllocation = allocation2[assetType] || 0;
    const change = newAllocation - oldAllocation;
    
    changes.push({
      assetType,
      old: oldAllocation,
      new: newAllocation,
      change,
      changeType: change > 0 ? 'increased' : (change < 0 ? 'decreased' : 'unchanged')
    });
  }
  
  // Sort by absolute change (largest first)
  changes.sort((a, b) => Math.abs(b.change) - Math.abs(a.change));
  
  return changes;
}

/**
 * Calculate diversification metrics
 * @param {Array} securities - Securities data
 * @returns {Object} - Diversification metrics
 */
function calculateDiversificationMetrics(securities) {
  // Count securities
  const securitiesCount = securities.length;
  
  // Calculate top holdings concentration (top 5 securities)
  const sortedSecurities = [...securities]
    .sort((a, b) => (b.value || 0) - (a.value || 0));
  
  const top5Securities = sortedSecurities.slice(0, 5);
  const totalValue = securities.reduce((sum, security) => sum + (security.value || 0), 0);
  const top5Value = top5Securities.reduce((sum, security) => sum + (security.value || 0), 0);
  const topHoldingsConcentration = totalValue > 0 ? top5Value / totalValue : 0;
  
  return {
    securitiesCount,
    topHoldingsConcentration,
    topHoldings: top5Securities.map(security => ({
      name: security.name,
      isin: security.isin,
      value: security.value,
      percentage: security.percentage || security.percent_of_assets || (security.value / totalValue)
    }))
  };
}

/**
 * Get comparison by ID
 * @param {string} comparisonId - Comparison ID
 * @returns {Promise<Object>} - Comparison result
 */
async function getComparisonById(comparisonId) {
  // In a production environment, this would retrieve the comparison from a database
  // For now, we'll throw an error since we don't have persistence
  throw new Error('Comparison retrieval from storage not implemented');
}

/**
 * List recent comparisons
 * @param {Object} options - List options
 * @returns {Promise<Array>} - Recent comparisons
 */
async function listRecentComparisons(options = {}) {
  // In a production environment, this would retrieve recent comparisons from a database
  // For now, we'll throw an error since we don't have persistence
  throw new Error('Listing comparisons from storage not implemented');
}

module.exports = {
  comparePortfolios,
  getComparisonById,
  listRecentComparisons
};