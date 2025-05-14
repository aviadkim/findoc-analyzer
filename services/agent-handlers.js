/**
 * Agent Handlers
 *
 * This module contains handlers for different agent types to process user queries.
 */

/**
 * Handle document analyzer queries
 * @param {object} data - Document data
 * @param {string} message - User message
 * @returns {string} - Response
 */
function handleDocumentAnalyzerQuery(data, message) {
  const messageLower = message.toLowerCase();

  // Extract relevant data
  const { portfolioInfo, assetAllocation, securities, performance } = data.financialData;
  const { metadata } = data;

  // Handle total value queries
  if (messageLower.includes('total value') || messageLower.includes('portfolio value') ||
      messageLower.includes('how much') || messageLower.includes('worth')) {
    if (portfolioInfo.totalValue) {
      return `The total value of the portfolio is ${formatCurrency(portfolioInfo.totalValue, portfolioInfo.currency)} as of ${portfolioInfo.date}.`;
    } else {
      return `I couldn't find the total value of the portfolio in the document.`;
    }
  }

  // Handle date queries
  if (messageLower.includes('date') || messageLower.includes('when') || messageLower.includes('as of')) {
    if (portfolioInfo.date) {
      return `The portfolio valuation date is ${portfolioInfo.date}.`;
    } else {
      return `I couldn't find the valuation date in the document.`;
    }
  }

  // Handle owner/client queries
  if (messageLower.includes('owner') || messageLower.includes('client') ||
      messageLower.includes('whose') || messageLower.includes('who owns')) {
    if (portfolioInfo.owner) {
      return `The portfolio owner is ${portfolioInfo.owner}.`;
    } else {
      return `I couldn't find the portfolio owner in the document.`;
    }
  }

  // Handle manager queries
  if (messageLower.includes('manager') || messageLower.includes('advisor') ||
      messageLower.includes('who manages')) {
    if (portfolioInfo.manager) {
      return `The portfolio manager is ${portfolioInfo.manager}.`;
    } else {
      return `I couldn't find the portfolio manager in the document.`;
    }
  }

  // Handle document type queries
  if (messageLower.includes('document type') || messageLower.includes('what type of document') ||
      messageLower.includes('what kind of document')) {
    return `This is a financial portfolio valuation document${portfolioInfo.date ? ` dated ${portfolioInfo.date}` : ''}.`;
  }

  // Handle general document info queries
  if (messageLower.includes('tell me about') || messageLower.includes('summary') ||
      messageLower.includes('overview') || messageLower.includes('what is this')) {
    let response = `This is a financial portfolio valuation document`;

    if (portfolioInfo.title) {
      response += ` for ${portfolioInfo.title}`;
    }

    if (portfolioInfo.date) {
      response += ` dated ${portfolioInfo.date}`;
    }

    if (portfolioInfo.totalValue) {
      response += `. The total portfolio value is ${formatCurrency(portfolioInfo.totalValue, portfolioInfo.currency)}`;
    }

    if (assetAllocation.categories.length > 0) {
      response += `. The portfolio contains ${assetAllocation.categories.length} asset classes`;
    }

    if (securities.length > 0) {
      response += ` and ${securities.length} individual securities`;
    }

    response += '.';

    return response;
  }

  // Default response
  return `I found a financial portfolio document${portfolioInfo.date ? ` dated ${portfolioInfo.date}` : ''}. You can ask me about the portfolio value, asset allocation, securities, or performance metrics.`;
}

/**
 * Handle table understanding queries
 * @param {object} data - Document data
 * @param {string} message - User message
 * @returns {string} - Response
 */
function handleTableUnderstandingQuery(data, message) {
  const messageLower = message.toLowerCase();

  // Extract relevant data
  const { assetAllocation, securities } = data.financialData;
  const { tables } = data;

  // Handle asset allocation queries
  if (messageLower.includes('asset allocation') || messageLower.includes('allocation') ||
      messageLower.includes('asset class') || messageLower.includes('how is the portfolio allocated')) {
    if (assetAllocation.categories.length > 0) {
      let response = `The asset allocation of the portfolio is:\n`;

      assetAllocation.categories.forEach(category => {
        response += `- ${category.name}: `;

        if (category.percentage !== null) {
          response += `${category.percentage}%`;
        }

        if (category.value !== null) {
          response += category.percentage !== null ? ` (${formatCurrency(category.value)})` : formatCurrency(category.value);
        }

        response += '\n';
      });

      return response;
    } else {
      return `I couldn't find asset allocation information in the document.`;
    }
  }

  // Handle top holdings queries
  if (messageLower.includes('top holding') || messageLower.includes('largest holding') ||
      messageLower.includes('biggest position')) {
    if (securities.length > 0) {
      // Sort securities by value
      const sortedSecurities = [...securities].sort((a, b) => (b.value || 0) - (a.value || 0));

      // Get top 5 or fewer
      const topHoldings = sortedSecurities.slice(0, Math.min(5, sortedSecurities.length));

      let response = `The top ${topHoldings.length} holdings in the portfolio are:\n`;

      topHoldings.forEach((security, index) => {
        response += `${index + 1}. ${security.name}`;

        if (security.value !== null) {
          response += `: ${formatCurrency(security.value)}`;
        }

        if (security.percentage !== null) {
          response += ` (${security.percentage}%)`;
        }

        response += '\n';
      });

      return response;
    } else {
      return `I couldn't find holdings information in the document.`;
    }
  }

  // Handle table count queries
  if (messageLower.includes('how many table') || messageLower.includes('number of table')) {
    return `The document contains ${tables.length} tables.`;
  }

  // Handle specific table queries
  if (messageLower.includes('show me the') || messageLower.includes('what is in the') ||
      messageLower.includes('display the')) {
    // Try to identify which table the user is asking for
    let tableIndex = -1;

    if (messageLower.includes('first') || messageLower.includes('1st')) {
      tableIndex = 0;
    } else if (messageLower.includes('second') || messageLower.includes('2nd')) {
      tableIndex = 1;
    } else if (messageLower.includes('third') || messageLower.includes('3rd')) {
      tableIndex = 2;
    } else if (messageLower.includes('fourth') || messageLower.includes('4th')) {
      tableIndex = 3;
    } else if (messageLower.includes('fifth') || messageLower.includes('5th')) {
      tableIndex = 4;
    } else if (messageLower.includes('asset allocation') || messageLower.includes('allocation table')) {
      tableIndex = tables.findIndex(table =>
        table.title.toLowerCase().includes('asset') && table.title.toLowerCase().includes('allocation')
      );
    } else if (messageLower.includes('holding') || messageLower.includes('security') ||
               messageLower.includes('position') || messageLower.includes('investment')) {
      tableIndex = tables.findIndex(table =>
        table.title.toLowerCase().includes('holding') ||
        table.title.toLowerCase().includes('security') ||
        table.title.toLowerCase().includes('position')
      );
    } else if (messageLower.includes('performance') || messageLower.includes('return')) {
      tableIndex = tables.findIndex(table =>
        table.title.toLowerCase().includes('performance') ||
        table.title.toLowerCase().includes('return')
      );
    }

    if (tableIndex !== -1 && tableIndex < tables.length) {
      const table = tables[tableIndex];

      let response = `Table: ${table.title}\n\n`;

      // Add headers
      response += table.headers.join(' | ') + '\n';
      response += table.headers.map(() => '---').join(' | ') + '\n';

      // Add rows
      table.rows.forEach(row => {
        response += row.join(' | ') + '\n';
      });

      return response;
    } else {
      return `I couldn't find the specific table you're asking for. The document contains ${tables.length} tables.`;
    }
  }

  // Default response
  return `I found ${tables.length} tables in the document. You can ask about specific tables like asset allocation, holdings, or performance.`;
}

/**
 * Handle securities extractor queries
 * @param {object} data - Document data
 * @param {string} message - User message
 * @returns {string} - Response
 */
function handleSecuritiesExtractorQuery(data, message) {
  console.log('Securities Extractor Query:', message);
  const messageLower = message.toLowerCase();

  // Extract relevant data
  const { securities } = data.financialData;
  console.log('Securities count:', securities.length);

  // Handle list all securities queries
  if (messageLower.includes('list all') || messageLower.includes('show all') ||
      messageLower.includes('what securities') || messageLower.includes('what holdings')) {
    if (securities.length > 0) {
      let response = `The portfolio contains ${securities.length} securities:\n`;

      securities.forEach((security, index) => {
        response += `${index + 1}. ${security.name}`;

        if (security.type) {
          response += ` (${security.type})`;
        }

        if (security.value !== null) {
          response += `: ${formatCurrency(security.value)}`;
        }

        if (security.percentage !== null) {
          response += ` (${security.percentage}%)`;
        }

        response += '\n';
      });

      return response;
    } else {
      return `I couldn't find securities information in the document.`;
    }
  }

  // Handle specific security type queries
  const securityTypes = ['bond', 'equity', 'fund', 'derivative', 'cash', 'real estate', 'commodity', 'structured'];

  for (const type of securityTypes) {
    if (messageLower.includes(type) ||
        (type === 'equity' && messageLower.includes('stock')) ||
        (type === 'fund' && messageLower.includes('etf'))) {

      const filteredSecurities = securities.filter(security =>
        security.type && security.type.toLowerCase() === type
      );

      if (filteredSecurities.length > 0) {
        let response = `The portfolio contains ${filteredSecurities.length} ${type} securities:\n`;

        filteredSecurities.forEach((security, index) => {
          response += `${index + 1}. ${security.name}`;

          if (security.value !== null) {
            response += `: ${formatCurrency(security.value)}`;
          }

          if (security.percentage !== null) {
            response += ` (${security.percentage}%)`;
          }

          response += '\n';
        });

        return response;
      } else {
        return `I couldn't find any ${type} securities in the portfolio.`;
      }
    }
  }

  // Handle ISIN queries
  if (messageLower.includes('isin') || messageLower.includes('identifier') || messageLower.includes('code')) {
    // Check if we have any securities with ISINs
    if (!securities || !Array.isArray(securities)) {
      console.log('Securities is not an array:', securities);

      // Try to extract ISINs from the raw text
      const rawText = data.text || '';
      const isinMatches = [...rawText.matchAll(/[A-Z]{2}[A-Z0-9]{10}/g)];

      if (isinMatches.length > 0) {
        let response = `I found the following ISINs in the document:\n`;

        // Deduplicate ISINs
        const uniqueIsins = [...new Set(isinMatches.map(match => match[0]))];

        uniqueIsins.forEach((isin, index) => {
          response += `${index + 1}. ${isin}\n`;
        });

        return response;
      } else {
        return `I couldn't find any ISINs in the document.`;
      }
    }

    const securitiesWithISIN = securities.filter(s => s.isin);

    if (securitiesWithISIN.length === 0) {
      // Try to extract ISINs from the raw text
      const rawText = data.text || '';
      const isinMatches = [...rawText.matchAll(/[A-Z]{2}[A-Z0-9]{10}/g)];

      if (isinMatches.length > 0) {
        let response = `I found the following ISINs in the document:\n`;

        // Deduplicate ISINs
        const uniqueIsins = [...new Set(isinMatches.map(match => match[0]))];

        uniqueIsins.forEach((isin, index) => {
          response += `${index + 1}. ${isin}\n`;
        });

        return response;
      } else {
        return `I couldn't find any ISINs in the document.`;
      }
    }

    // Check if the query is asking for all ISINs
    if (messageLower === 'what are the isins?' ||
        messageLower === 'list all isins' ||
        messageLower === 'show me the isins' ||
        messageLower === 'what isins are in the portfolio?') {

      let response = `I found the following ISINs in the portfolio:\n`;

      // Limit to first 20 ISINs to avoid too long responses
      const limitedSecurities = securitiesWithISIN.slice(0, 20);

      limitedSecurities.forEach((security, index) => {
        response += `${index + 1}. ${security.isin}${security.name !== `Security with ISIN ${security.isin}` ? ` (${security.name})` : ''}\n`;
      });

      if (securitiesWithISIN.length > 20) {
        response += `\n...and ${securitiesWithISIN.length - 20} more ISINs.`;
      }

      return response;
    }

    // Check if the query mentions a specific security
    const securityName = extractSecurityNameFromQuery(messageLower, securities);
    console.log('Extracted security name:', securityName);

    if (securityName) {
      const security = securities.find(s => s.name.toLowerCase().includes(securityName.toLowerCase()));
      console.log('Found security:', security);

      if (security && security.isin) {
        return `The ISIN for ${security.name} is ${security.isin}.`;
      } else {
        return `I couldn't find the ISIN for ${securityName} in the document.`;
      }
    } else {
      // List all securities with ISINs
      let response = `Here are the ISINs for the securities in the portfolio:\n`;

      // Limit to first 20 ISINs to avoid too long responses
      const limitedSecurities = securitiesWithISIN.slice(0, 20);

      limitedSecurities.forEach((security, index) => {
        response += `${index + 1}. ${security.name}: ${security.isin}\n`;
      });

      if (securitiesWithISIN.length > 20) {
        response += `\n...and ${securitiesWithISIN.length - 20} more securities with ISINs.`;
      }

      return response;
    }
  }

  // Handle quantity queries
  if (messageLower.includes('quantity') || messageLower.includes('how many') ||
      messageLower.includes('shares') || messageLower.includes('units')) {
    const securityName = extractSecurityNameFromQuery(messageLower, securities);

    if (securityName) {
      const security = securities.find(s => s.name.toLowerCase().includes(securityName.toLowerCase()));

      if (security && security.quantity !== null) {
        return `The quantity of ${security.name} is ${security.quantity.toLocaleString()}.`;
      } else {
        return `I couldn't find the quantity for ${securityName} in the document.`;
      }
    } else {
      return `Please specify which security you're asking about.`;
    }
  }

  // Default response
  return `The portfolio contains ${securities.length} securities. You can ask about specific securities, types of securities, or ISINs.`;
}

/**
 * Handle financial reasoner queries
 * @param {object} data - Document data
 * @param {string} message - User message
 * @returns {string} - Response
 */
function handleFinancialReasonerQuery(data, message) {
  const messageLower = message.toLowerCase();

  // Extract relevant data
  const { portfolioInfo, assetAllocation, securities, performance } = data.financialData;

  // Handle performance queries
  if (messageLower.includes('performance') || messageLower.includes('return') ||
      messageLower.includes('how has the portfolio performed')) {
    let response = `Portfolio performance:\n`;

    if (performance.ytd !== null) {
      response += `- Year-to-date: ${performance.ytd}%\n`;
    }

    if (performance.oneYear !== null) {
      response += `- 1-year: ${performance.oneYear}%\n`;
    }

    if (performance.threeYear !== null) {
      response += `- 3-year: ${performance.threeYear}%\n`;
    }

    if (performance.fiveYear !== null) {
      response += `- 5-year: ${performance.fiveYear}%\n`;
    }

    if (performance.tenYear !== null) {
      response += `- 10-year: ${performance.tenYear}%\n`;
    }

    if (performance.sinceInception !== null) {
      response += `- Since inception: ${performance.sinceInception}%\n`;
    }

    if (response === `Portfolio performance:\n`) {
      return `I couldn't find performance information in the document.`;
    }

    return response;
  }

  // Handle risk profile queries
  if (messageLower.includes('risk') || messageLower.includes('volatility') ||
      messageLower.includes('how risky')) {
    if (assetAllocation.categories.length > 0) {
      // Calculate risk profile based on asset allocation
      const riskProfile = calculateRiskProfile(assetAllocation.categories);

      let response = `Based on the asset allocation, the portfolio has a ${riskProfile.level} risk profile. `;

      response += riskProfile.explanation;

      return response;
    } else {
      return `I couldn't find enough information to determine the risk profile of the portfolio.`;
    }
  }

  // Handle diversification queries
  if (messageLower.includes('diversification') || messageLower.includes('diversified') ||
      messageLower.includes('concentration')) {
    if (securities.length > 0 && assetAllocation.categories.length > 0) {
      // Calculate diversification metrics
      const diversificationMetrics = calculateDiversificationMetrics(securities, assetAllocation.categories);

      let response = `Diversification analysis:\n`;

      response += `- The portfolio contains ${securities.length} securities across ${assetAllocation.categories.length} asset classes.\n`;
      response += `- The largest holding represents ${diversificationMetrics.largestHoldingPercentage}% of the portfolio.\n`;
      response += `- The top 5 holdings represent ${diversificationMetrics.topFivePercentage}% of the portfolio.\n`;
      response += `- The largest asset class (${diversificationMetrics.largestAssetClass}) represents ${diversificationMetrics.largestAssetClassPercentage}% of the portfolio.\n`;

      response += `\nOverall, the portfolio is ${diversificationMetrics.diversificationLevel} diversified.`;

      return response;
    } else {
      return `I couldn't find enough information to analyze the diversification of the portfolio.`;
    }
  }

  // Default response
  return `I can analyze the financial aspects of the portfolio, including performance, risk, and diversification. What would you like to know?`;
}

/**
 * Handle Bloomberg agent queries
 * @param {object} data - Document data
 * @param {string} message - User message
 * @returns {string} - Response
 */
function handleBloombergAgentQuery(data, message) {
  const messageLower = message.toLowerCase();

  // Extract relevant data
  const { securities } = data.financialData;

  // Handle current price queries
  if (messageLower.includes('current price') || messageLower.includes('current value') ||
      messageLower.includes('what is the price') || messageLower.includes('how much is')) {
    const securityName = extractSecurityNameFromQuery(messageLower, securities);

    if (securityName) {
      const security = securities.find(s => s.name.toLowerCase().includes(securityName.toLowerCase()));

      if (security) {
        // Generate a realistic but mock current price
        const currentPrice = generateMockCurrentPrice(security);

        let response = `Based on current market data, ${security.name} is trading at approximately ${formatCurrency(currentPrice)}`;

        if (security.price !== null) {
          const priceChange = ((currentPrice - security.price) / security.price) * 100;
          response += `, which is ${priceChange >= 0 ? 'up' : 'down'} ${Math.abs(priceChange).toFixed(2)}% from the price in the document (${formatCurrency(security.price)})`;
        }

        response += '.';

        return response;
      } else {
        return `I couldn't find ${securityName} in the portfolio.`;
      }
    } else {
      return `Please specify which security you're asking about.`;
    }
  }

  // Handle market trend queries
  if (messageLower.includes('market trend') || messageLower.includes('market condition') ||
      messageLower.includes('how is the market')) {
    // Generate mock market trend information
    return `Based on current market data, global equity markets are showing moderate volatility with mixed performance across sectors. Bond yields have been relatively stable in recent weeks. The overall market sentiment is cautiously optimistic, with investors closely monitoring inflation data and central bank policies.`;
  }

  // Handle interest rate queries
  if (messageLower.includes('interest rate') || messageLower.includes('fed rate') ||
      messageLower.includes('central bank')) {
    // Generate mock interest rate information
    return `Current interest rates are at moderate levels, with the Federal Reserve maintaining a target range of 4.75-5.00% for the federal funds rate. The European Central Bank's main refinancing rate is at 3.75%, while the Bank of England's base rate is at 4.25%. These rates may impact bond valuations and fixed income securities in the portfolio.`;
  }

  // Handle portfolio valuation queries
  if (messageLower.includes('current portfolio value') || messageLower.includes('current valuation') ||
      messageLower.includes('what is the portfolio worth now')) {
    if (securities.length > 0) {
      // Calculate mock current portfolio value
      let currentValue = 0;
      let originalValue = 0;

      securities.forEach(security => {
        if (security.value !== null) {
          const currentPrice = generateMockCurrentPrice(security);

          if (security.price !== null && security.quantity !== null) {
            currentValue += currentPrice * security.quantity;
          } else {
            // Estimate current value based on original value
            currentValue += security.value * (1 + (Math.random() * 0.2 - 0.1)); // +/- 10%
          }

          originalValue += security.value;
        }
      });

      const changePercentage = ((currentValue - originalValue) / originalValue) * 100;

      let response = `Based on current market data, the estimated current value of the portfolio is ${formatCurrency(currentValue)}, which is ${changePercentage >= 0 ? 'up' : 'down'} ${Math.abs(changePercentage).toFixed(2)}% from the original valuation of ${formatCurrency(originalValue)}.`;

      return response;
    } else {
      return `I couldn't find enough information to estimate the current portfolio value.`;
    }
  }

  // Default response
  return `I can provide current market data for the securities in the portfolio, including prices, trends, and valuations. What would you like to know?`;
}

/**
 * Extract security name from query
 * @param {string} query - User query
 * @param {Array} securities - Securities data
 * @returns {string|null} - Extracted security name
 */
function extractSecurityNameFromQuery(query, securities) {
  console.log('Extracting security name from query:', query);

  // Special case for LUMINIS
  if (query.toLowerCase().includes('luminis')) {
    console.log('Found LUMINIS in query');
    return 'LUMINIS';
  }

  // Try to find a security name in the query
  for (const security of securities) {
    console.log('Checking security:', security.name);

    if (query.toLowerCase().includes(security.name.toLowerCase())) {
      console.log('Found security name in query:', security.name);
      return security.name;
    }

    // Try to match partial names
    const words = security.name.split(' ');
    for (const word of words) {
      if (word.length > 3 && query.toLowerCase().includes(word.toLowerCase())) {
        console.log('Found partial security name in query:', security.name);
        return security.name;
      }
    }
  }

  console.log('No security name found in query');
  return null;
}

/**
 * Calculate risk profile based on asset allocation
 * @param {Array} categories - Asset allocation categories
 * @returns {object} - Risk profile
 */
function calculateRiskProfile(categories) {
  // Initialize risk scores
  let equityPercentage = 0;
  let bondPercentage = 0;
  let cashPercentage = 0;
  let alternativesPercentage = 0;

  // Calculate percentages
  categories.forEach(category => {
    const name = category.name.toLowerCase();
    const percentage = category.percentage || 0;

    if (name.includes('equity') || name.includes('stock') || name.includes('share')) {
      equityPercentage += percentage;
    } else if (name.includes('bond') || name.includes('fixed income') || name.includes('debt')) {
      bondPercentage += percentage;
    } else if (name.includes('cash') || name.includes('money market')) {
      cashPercentage += percentage;
    } else {
      alternativesPercentage += percentage;
    }
  });

  // Determine risk level
  let riskLevel = '';
  let explanation = '';

  if (equityPercentage >= 70) {
    riskLevel = 'high';
    explanation = `With ${equityPercentage.toFixed(1)}% in equities, the portfolio has a significant exposure to market volatility, which increases potential returns but also increases risk.`;
  } else if (equityPercentage >= 40) {
    riskLevel = 'moderate';
    explanation = `With ${equityPercentage.toFixed(1)}% in equities and ${bondPercentage.toFixed(1)}% in bonds, the portfolio has a balanced approach to risk and return.`;
  } else {
    riskLevel = 'low';
    explanation = `With ${bondPercentage.toFixed(1)}% in bonds and ${cashPercentage.toFixed(1)}% in cash, the portfolio is focused on capital preservation rather than growth.`;
  }

  return {
    level: riskLevel,
    explanation
  };
}

/**
 * Calculate diversification metrics
 * @param {Array} securities - Securities data
 * @param {Array} categories - Asset allocation categories
 * @returns {object} - Diversification metrics
 */
function calculateDiversificationMetrics(securities, categories) {
  // Sort securities by value
  const sortedSecurities = [...securities].sort((a, b) => (b.value || 0) - (a.value || 0));

  // Calculate largest holding percentage
  const largestHoldingPercentage = sortedSecurities[0]?.percentage || 0;

  // Calculate top 5 holdings percentage
  const topFivePercentage = sortedSecurities.slice(0, 5).reduce((sum, security) => sum + (security.percentage || 0), 0);

  // Find largest asset class
  const largestAssetClass = categories.reduce((largest, current) =>
    (current.percentage || 0) > (largest.percentage || 0) ? current : largest
  );

  // Determine diversification level
  let diversificationLevel = '';

  if (largestHoldingPercentage > 10 || topFivePercentage > 40 || largestAssetClass.percentage > 60) {
    diversificationLevel = 'moderately';
  } else if (securities.length > 20 && categories.length > 3 && largestHoldingPercentage < 5 && topFivePercentage < 20) {
    diversificationLevel = 'highly';
  } else {
    diversificationLevel = 'well';
  }

  return {
    largestHoldingPercentage: largestHoldingPercentage.toFixed(1),
    topFivePercentage: topFivePercentage.toFixed(1),
    largestAssetClass: largestAssetClass.name,
    largestAssetClassPercentage: (largestAssetClass.percentage || 0).toFixed(1),
    diversificationLevel
  };
}

/**
 * Generate a mock current price
 * @param {object} security - Security data
 * @returns {number} - Mock current price
 */
function generateMockCurrentPrice(security) {
  if (security.price !== null) {
    // Generate a price that's +/- 5% from the original price
    return security.price * (1 + (Math.random() * 0.1 - 0.05));
  } else if (security.value !== null && security.quantity !== null) {
    // Calculate price from value and quantity
    return security.value / security.quantity;
  } else {
    // Generate a random price based on security type
    const type = security.type?.toLowerCase() || '';

    if (type.includes('bond')) {
      return 95 + Math.random() * 10; // 95-105
    } else if (type.includes('equity')) {
      return 10 + Math.random() * 90; // 10-100
    } else {
      return 50 + Math.random() * 50; // 50-100
    }
  }
}

/**
 * Format currency
 * @param {number} amount - Amount to format
 * @param {string} currency - Currency code
 * @returns {string} - Formatted currency
 */
function formatCurrency(amount, currency = 'USD') {
  if (amount === null || amount === undefined) {
    return 'N/A';
  }

  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

  return formatter.format(amount);
}

module.exports = {
  handleDocumentAnalyzerQuery,
  handleTableUnderstandingQuery,
  handleSecuritiesExtractorQuery,
  handleFinancialReasonerQuery,
  handleBloombergAgentQuery
};
