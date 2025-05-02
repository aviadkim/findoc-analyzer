/**
 * Financial Summary Generator
 * 
 * This service generates financial summaries from processed documents.
 */

/**
 * Generate a financial summary from document content
 * @param {object} content - Document content
 * @returns {Promise<object>} - Financial summary
 */
async function generateFinancialSummary(content) {
  try {
    console.log('Generating financial summary');
    
    // Extract financial metrics
    const metrics = extractFinancialMetrics(content);
    
    // Extract asset allocation
    const assetAllocation = extractAssetAllocation(content);
    
    // Extract top holdings
    const topHoldings = extractTopHoldings(content);
    
    // Extract performance metrics
    const performanceMetrics = extractPerformanceMetrics(content);
    
    return {
      metrics,
      assetAllocation,
      topHoldings,
      performanceMetrics
    };
  } catch (error) {
    console.error('Error generating financial summary:', error);
    return {
      metrics: {},
      assetAllocation: [],
      topHoldings: [],
      performanceMetrics: {}
    };
  }
}

/**
 * Extract financial metrics from document content
 * @param {object} content - Document content
 * @returns {object} - Financial metrics
 */
function extractFinancialMetrics(content) {
  try {
    const metrics = {};
    
    // Extract from text
    if (content.text) {
      // Extract total assets
      const totalAssetsMatch = content.text.match(/total assets:?\s*[$€£¥]?([0-9,.]+)/i);
      if (totalAssetsMatch) {
        metrics.totalAssets = totalAssetsMatch[1];
      }
      
      // Extract total liabilities
      const totalLiabilitiesMatch = content.text.match(/total liabilities:?\s*[$€£¥]?([0-9,.]+)/i);
      if (totalLiabilitiesMatch) {
        metrics.totalLiabilities = totalLiabilitiesMatch[1];
      }
      
      // Extract net worth / equity
      const netWorthMatch = content.text.match(/(?:net worth|equity|shareholders[''']? equity):?\s*[$€£¥]?([0-9,.]+)/i);
      if (netWorthMatch) {
        metrics.netWorth = netWorthMatch[1];
      }
      
      // Extract revenue
      const revenueMatch = content.text.match(/(?:revenue|income|sales):?\s*[$€£¥]?([0-9,.]+)/i);
      if (revenueMatch) {
        metrics.revenue = revenueMatch[1];
      }
      
      // Extract expenses
      const expensesMatch = content.text.match(/(?:expenses|costs|expenditures):?\s*[$€£¥]?([0-9,.]+)/i);
      if (expensesMatch) {
        metrics.expenses = expensesMatch[1];
      }
      
      // Extract profit
      const profitMatch = content.text.match(/(?:profit|net income|earnings):?\s*[$€£¥]?([0-9,.]+)/i);
      if (profitMatch) {
        metrics.profit = profitMatch[1];
      }
      
      // Extract profit margin
      const profitMarginMatch = content.text.match(/(?:profit margin|margin):?\s*([0-9,.]+)%/i);
      if (profitMarginMatch) {
        metrics.profitMargin = profitMarginMatch[1] + '%';
      }
    }
    
    // Extract from tables
    if (content.tables && content.tables.length > 0) {
      for (const table of content.tables) {
        // Skip if the table doesn't have headers or rows
        if (!table.headers || !table.rows || table.rows.length === 0) {
          continue;
        }
        
        // Check if the table has financial metrics
        const headerText = table.headers.join(' ').toLowerCase();
        
        if (headerText.includes('asset') || headerText.includes('liability') || headerText.includes('equity') ||
            headerText.includes('revenue') || headerText.includes('expense') || headerText.includes('profit')) {
          
          // Process each row
          for (const row of table.rows) {
            // Skip if the row doesn't have enough columns
            if (row.length < 2) {
              continue;
            }
            
            // Get the metric name and value
            const metricName = row[0].toLowerCase();
            const metricValue = row[1];
            
            // Add the metric
            if (metricName.includes('total assets')) {
              metrics.totalAssets = metricValue;
            } else if (metricName.includes('total liabilities')) {
              metrics.totalLiabilities = metricValue;
            } else if (metricName.includes('equity') || metricName.includes('net worth')) {
              metrics.netWorth = metricValue;
            } else if (metricName.includes('revenue') || metricName.includes('income') || metricName.includes('sales')) {
              metrics.revenue = metricValue;
            } else if (metricName.includes('expenses') || metricName.includes('costs')) {
              metrics.expenses = metricValue;
            } else if (metricName.includes('profit') || metricName.includes('earnings')) {
              metrics.profit = metricValue;
            } else if (metricName.includes('margin')) {
              metrics.profitMargin = metricValue;
            }
          }
        }
      }
    }
    
    return metrics;
  } catch (error) {
    console.error('Error extracting financial metrics:', error);
    return {};
  }
}

/**
 * Extract asset allocation from document content
 * @param {object} content - Document content
 * @returns {Array} - Asset allocation
 */
function extractAssetAllocation(content) {
  try {
    const assetAllocation = [];
    
    // Extract from tables
    if (content.tables && content.tables.length > 0) {
      for (const table of content.tables) {
        // Skip if the table doesn't have headers or rows
        if (!table.headers || !table.rows || table.rows.length === 0) {
          continue;
        }
        
        // Check if the table has asset allocation information
        const headerText = table.headers.join(' ').toLowerCase();
        const titleText = table.title ? table.title.toLowerCase() : '';
        
        if ((headerText.includes('asset') && headerText.includes('allocation')) ||
            (titleText.includes('asset') && titleText.includes('allocation'))) {
          
          // Find column indices
          const assetClassIndex = findColumnIndex(table.headers, ['asset', 'class', 'type']);
          const allocationIndex = findColumnIndex(table.headers, ['allocation', 'weight', '%', 'percent']);
          const valueIndex = findColumnIndex(table.headers, ['value', 'amount', 'balance']);
          
          // Skip if we can't find the asset class and allocation columns
          if (assetClassIndex === -1 || (allocationIndex === -1 && valueIndex === -1)) {
            continue;
          }
          
          // Process each row
          for (const row of table.rows) {
            // Skip if the row doesn't have enough columns
            if (row.length <= Math.max(assetClassIndex, allocationIndex, valueIndex)) {
              continue;
            }
            
            // Get values
            const assetClass = row[assetClassIndex];
            const allocation = allocationIndex !== -1 ? row[allocationIndex] : '';
            const value = valueIndex !== -1 ? row[valueIndex] : '';
            
            // Skip if asset class is empty
            if (!assetClass) {
              continue;
            }
            
            // Add the asset allocation
            assetAllocation.push({
              assetClass,
              allocation,
              value
            });
          }
        }
      }
    }
    
    // Extract from text
    if (content.text && assetAllocation.length === 0) {
      // Look for asset allocation section
      const assetAllocationMatch = content.text.match(/asset allocation[^]*?(?=\n\n|\n[A-Z]|$)/i);
      
      if (assetAllocationMatch) {
        const assetAllocationText = assetAllocationMatch[0];
        
        // Look for asset classes and allocations
        const assetClassMatches = assetAllocationText.matchAll(/([A-Za-z ]+):\s*([0-9,.]+)%/g);
        
        for (const match of assetClassMatches) {
          const assetClass = match[1].trim();
          const allocation = match[2] + '%';
          
          // Add the asset allocation
          assetAllocation.push({
            assetClass,
            allocation,
            value: ''
          });
        }
      }
    }
    
    return assetAllocation;
  } catch (error) {
    console.error('Error extracting asset allocation:', error);
    return [];
  }
}

/**
 * Extract top holdings from document content
 * @param {object} content - Document content
 * @returns {Array} - Top holdings
 */
function extractTopHoldings(content) {
  try {
    const topHoldings = [];
    
    // Extract from securities
    if (content.securities && content.securities.length > 0) {
      // Sort securities by value (if available)
      const sortedSecurities = [...content.securities].sort((a, b) => {
        // Extract numeric values
        const valueA = a.currentValue ? parseFloat(a.currentValue.replace(/[^0-9.]/g, '')) : 0;
        const valueB = b.currentValue ? parseFloat(b.currentValue.replace(/[^0-9.]/g, '')) : 0;
        
        return valueB - valueA;
      });
      
      // Get top 10 securities
      const top10Securities = sortedSecurities.slice(0, 10);
      
      // Add to top holdings
      for (const security of top10Securities) {
        topHoldings.push({
          name: security.name,
          value: security.currentValue,
          allocation: security.percentOfAssets
        });
      }
    }
    
    return topHoldings;
  } catch (error) {
    console.error('Error extracting top holdings:', error);
    return [];
  }
}

/**
 * Extract performance metrics from document content
 * @param {object} content - Document content
 * @returns {object} - Performance metrics
 */
function extractPerformanceMetrics(content) {
  try {
    const performanceMetrics = {};
    
    // Extract from text
    if (content.text) {
      // Extract annual return
      const annualReturnMatch = content.text.match(/annual return:?\s*([0-9,.]+)%/i);
      if (annualReturnMatch) {
        performanceMetrics.annualReturn = annualReturnMatch[1] + '%';
      }
      
      // Extract 3-year return
      const threeYearReturnMatch = content.text.match(/3(?:-|\s)year return:?\s*([0-9,.]+)%/i);
      if (threeYearReturnMatch) {
        performanceMetrics.threeYearReturn = threeYearReturnMatch[1] + '%';
      }
      
      // Extract 5-year return
      const fiveYearReturnMatch = content.text.match(/5(?:-|\s)year return:?\s*([0-9,.]+)%/i);
      if (fiveYearReturnMatch) {
        performanceMetrics.fiveYearReturn = fiveYearReturnMatch[1] + '%';
      }
      
      // Extract 10-year return
      const tenYearReturnMatch = content.text.match(/10(?:-|\s)year return:?\s*([0-9,.]+)%/i);
      if (tenYearReturnMatch) {
        performanceMetrics.tenYearReturn = tenYearReturnMatch[1] + '%';
      }
      
      // Extract since inception return
      const sinceInceptionReturnMatch = content.text.match(/since inception return:?\s*([0-9,.]+)%/i);
      if (sinceInceptionReturnMatch) {
        performanceMetrics.sinceInceptionReturn = sinceInceptionReturnMatch[1] + '%';
      }
      
      // Extract volatility
      const volatilityMatch = content.text.match(/volatility:?\s*([0-9,.]+)%/i);
      if (volatilityMatch) {
        performanceMetrics.volatility = volatilityMatch[1] + '%';
      }
      
      // Extract Sharpe ratio
      const sharpeRatioMatch = content.text.match(/sharpe ratio:?\s*([0-9,.]+)/i);
      if (sharpeRatioMatch) {
        performanceMetrics.sharpeRatio = sharpeRatioMatch[1];
      }
      
      // Extract beta
      const betaMatch = content.text.match(/beta:?\s*([0-9,.]+)/i);
      if (betaMatch) {
        performanceMetrics.beta = betaMatch[1];
      }
      
      // Extract alpha
      const alphaMatch = content.text.match(/alpha:?\s*([0-9,.]+)/i);
      if (alphaMatch) {
        performanceMetrics.alpha = alphaMatch[1];
      }
    }
    
    // Extract from tables
    if (content.tables && content.tables.length > 0) {
      for (const table of content.tables) {
        // Skip if the table doesn't have headers or rows
        if (!table.headers || !table.rows || table.rows.length === 0) {
          continue;
        }
        
        // Check if the table has performance metrics
        const headerText = table.headers.join(' ').toLowerCase();
        const titleText = table.title ? table.title.toLowerCase() : '';
        
        if ((headerText.includes('performance') || headerText.includes('return') || headerText.includes('metric')) ||
            (titleText.includes('performance') || titleText.includes('return') || titleText.includes('metric'))) {
          
          // Process each row
          for (const row of table.rows) {
            // Skip if the row doesn't have enough columns
            if (row.length < 2) {
              continue;
            }
            
            // Get the metric name and value
            const metricName = row[0].toLowerCase();
            const metricValue = row[1];
            
            // Add the metric
            if (metricName.includes('annual return')) {
              performanceMetrics.annualReturn = metricValue;
            } else if (metricName.includes('3-year') || metricName.includes('3 year')) {
              performanceMetrics.threeYearReturn = metricValue;
            } else if (metricName.includes('5-year') || metricName.includes('5 year')) {
              performanceMetrics.fiveYearReturn = metricValue;
            } else if (metricName.includes('10-year') || metricName.includes('10 year')) {
              performanceMetrics.tenYearReturn = metricValue;
            } else if (metricName.includes('since inception')) {
              performanceMetrics.sinceInceptionReturn = metricValue;
            } else if (metricName.includes('volatility')) {
              performanceMetrics.volatility = metricValue;
            } else if (metricName.includes('sharpe')) {
              performanceMetrics.sharpeRatio = metricValue;
            } else if (metricName.includes('beta')) {
              performanceMetrics.beta = metricValue;
            } else if (metricName.includes('alpha')) {
              performanceMetrics.alpha = metricValue;
            }
          }
        }
      }
    }
    
    return performanceMetrics;
  } catch (error) {
    console.error('Error extracting performance metrics:', error);
    return {};
  }
}

/**
 * Find the index of a column in a table
 * @param {Array} headers - Table headers
 * @param {Array} keywords - Keywords to look for
 * @returns {number} - Column index or -1 if not found
 */
function findColumnIndex(headers, keywords) {
  for (let i = 0; i < headers.length; i++) {
    const header = headers[i].toLowerCase();
    
    for (const keyword of keywords) {
      if (header.includes(keyword.toLowerCase())) {
        return i;
      }
    }
  }
  
  return -1;
}

module.exports = {
  generateFinancialSummary
};
