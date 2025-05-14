/**
 * Portfolio Information Extractor
 * 
 * This module extracts portfolio information from financial PDFs.
 */

/**
 * Extract portfolio information from text and tables
 * @param {string} text - Full text content of the PDF
 * @param {Array} tables - Extracted tables
 * @returns {object} - Extracted portfolio information
 */
function extractPortfolioInfo(text, tables) {
  console.log('Extracting portfolio information...');
  
  // Initialize portfolio info
  const portfolioInfo = {
    title: '',
    date: '',
    totalValue: null,
    currency: 'USD',
    owner: '',
    manager: '',
    accountNumber: '',
    custodian: '',
    benchmark: '',
    strategy: ''
  };
  
  // Extract from text
  const infoFromText = extractPortfolioInfoFromText(text);
  Object.assign(portfolioInfo, infoFromText);
  
  // Extract from tables
  const infoFromTables = extractPortfolioInfoFromTables(tables);
  
  // Merge, preferring non-empty values from tables
  for (const key in infoFromTables) {
    if (infoFromTables[key] && (!portfolioInfo[key] || key === 'totalValue')) {
      portfolioInfo[key] = infoFromTables[key];
    }
  }
  
  // Try to determine currency if not found
  if (!portfolioInfo.currency || portfolioInfo.currency === 'USD') {
    portfolioInfo.currency = determineCurrency(text, tables);
  }
  
  console.log('Extracted portfolio information:', portfolioInfo);
  
  return portfolioInfo;
}

/**
 * Extract portfolio information from text
 * @param {string} text - Full text content of the PDF
 * @returns {object} - Extracted portfolio information
 */
function extractPortfolioInfoFromText(text) {
  const portfolioInfo = {
    title: '',
    date: '',
    totalValue: null,
    currency: '',
    owner: '',
    manager: '',
    accountNumber: '',
    custodian: '',
    benchmark: '',
    strategy: ''
  };
  
  // Extract title
  const titlePatterns = [
    /Portfolio\s+Statement\s+for\s+([A-Za-z0-9\s\.\,\-\&]+)/i,
    /([A-Za-z0-9\s\.\,\-\&]+)\s+Portfolio\s+Statement/i,
    /([A-Za-z0-9\s\.\,\-\&]+)\s+Investment\s+Portfolio/i,
    /Portfolio\s+Valuation\s+for\s+([A-Za-z0-9\s\.\,\-\&]+)/i,
    /([A-Za-z0-9\s\.\,\-\&]+)\s+Portfolio\s+Valuation/i,
    /([A-Za-z0-9\s\.\,\-\&]+)\s+Account\s+Statement/i,
    /Account\s+Statement\s+for\s+([A-Za-z0-9\s\.\,\-\&]+)/i
  ];
  
  for (const pattern of titlePatterns) {
    const match = text.match(pattern);
    
    if (match) {
      portfolioInfo.title = match[1].trim();
      break;
    }
  }
  
  // If no title found, try to find any capitalized text that might be a title
  if (!portfolioInfo.title) {
    const titleMatch = text.match(/([A-Z][A-Za-z0-9\s\.\,\-\&]{5,50})\s*(?:\r|\n)/);
    
    if (titleMatch) {
      portfolioInfo.title = titleMatch[1].trim();
    }
  }
  
  // Extract date
  const datePatterns = [
    /(?:as of|dated|date|valuation date|statement date)(?:\s*|:)\s*(\d{1,2}[\/\.\-]\d{1,2}[\/\.\-]\d{2,4})/i,
    /(?:as of|dated|date|valuation date|statement date)(?:\s*|:)\s*(\d{1,2}\s+[A-Za-z]+\s+\d{2,4})/i,
    /(?:as of|dated|date|valuation date|statement date)(?:\s*|:)\s*([A-Za-z]+\s+\d{1,2},?\s+\d{2,4})/i
  ];
  
  for (const pattern of datePatterns) {
    const match = text.match(pattern);
    
    if (match) {
      portfolioInfo.date = match[1].trim();
      break;
    }
  }
  
  // If no date found, try to find any date-like pattern
  if (!portfolioInfo.date) {
    const dateMatch = text.match(/(\d{1,2}[\/\.\-]\d{1,2}[\/\.\-]\d{2,4})/);
    
    if (dateMatch) {
      portfolioInfo.date = dateMatch[1].trim();
    }
  }
  
  // Extract total value
  const valuePatterns = [
    /(?:total|portfolio|value|worth|amount|net asset value|nav)(?:\s+value)?(?:\s+of)?\s*[:=]?\s*[$€£¥]?([0-9,]+(?:\.[0-9]{1,2})?)\s*(?:USD|EUR|GBP|JPY|CHF|ALL)?/i,
    /(?:total|portfolio|value|worth|amount|net asset value|nav)(?:\s+value)?(?:\s+of)?\s*[:=]?\s*(?:USD|EUR|GBP|JPY|CHF|ALL)?\s*([0-9,]+(?:\.[0-9]{1,2})?)/i
  ];
  
  for (const pattern of valuePatterns) {
    const match = text.match(pattern);
    
    if (match) {
      portfolioInfo.totalValue = parseAmount(match[1]);
      break;
    }
  }
  
  // Extract currency
  const currencyPatterns = [
    /(?:currency|denominated in|valued in|in)\s*[:=]?\s*([A-Z]{3})/i,
    /(?:USD|EUR|GBP|JPY|CHF|ALL)/i
  ];
  
  for (const pattern of currencyPatterns) {
    const match = text.match(pattern);
    
    if (match) {
      portfolioInfo.currency = match[1] ? match[1].trim() : match[0].trim();
      break;
    }
  }
  
  // Extract owner
  const ownerPatterns = [
    /(?:owner|client|investor|account holder|prepared for)(?:\s+name)?(?:\s+is)?\s*[:=]?\s*([A-Z][A-Za-z0-9\s\.\,\-\&]+)(?:\r|\n|,)/i,
    /(?:name|client):\s*([A-Z][A-Za-z0-9\s\.\,\-\&]+)(?:\r|\n|,)/i
  ];
  
  for (const pattern of ownerPatterns) {
    const match = text.match(pattern);
    
    if (match) {
      portfolioInfo.owner = match[1].trim();
      break;
    }
  }
  
  // Extract manager
  const managerPatterns = [
    /(?:manager|advisor|portfolio manager|investment manager)(?:\s+name)?(?:\s+is)?\s*[:=]?\s*([A-Z][A-Za-z0-9\s\.\,\-\&]+)(?:\r|\n|,)/i,
    /(?:managed by|advised by)(?:\s+name)?(?:\s+is)?\s*[:=]?\s*([A-Z][A-Za-z0-9\s\.\,\-\&]+)(?:\r|\n|,)/i
  ];
  
  for (const pattern of managerPatterns) {
    const match = text.match(pattern);
    
    if (match) {
      portfolioInfo.manager = match[1].trim();
      break;
    }
  }
  
  // Extract account number
  const accountNumberPatterns = [
    /(?:account|account number|account #|a\/c)(?:\s*|:)\s*([A-Za-z0-9\-]+)/i,
    /(?:account|account number|account #|a\/c)(?:\s*|:)\s*([0-9]{5,})/i
  ];
  
  for (const pattern of accountNumberPatterns) {
    const match = text.match(pattern);
    
    if (match) {
      portfolioInfo.accountNumber = match[1].trim();
      break;
    }
  }
  
  // Extract custodian
  const custodianPatterns = [
    /(?:custodian|custodian bank|depository)(?:\s*|:)\s*([A-Z][A-Za-z0-9\s\.\,\-\&]+)(?:\r|\n|,)/i,
    /(?:held at|held with|held by)(?:\s*|:)\s*([A-Z][A-Za-z0-9\s\.\,\-\&]+)(?:\r|\n|,)/i
  ];
  
  for (const pattern of custodianPatterns) {
    const match = text.match(pattern);
    
    if (match) {
      portfolioInfo.custodian = match[1].trim();
      break;
    }
  }
  
  // Extract benchmark
  const benchmarkPatterns = [
    /(?:benchmark|index|compared to)(?:\s*|:)\s*([A-Z][A-Za-z0-9\s\.\,\-\&]+)(?:\r|\n|,)/i,
    /(?:benchmark|index|compared to)(?:\s*|:)\s*([A-Z][A-Za-z0-9\s\.\,\-\&]+)/i
  ];
  
  for (const pattern of benchmarkPatterns) {
    const match = text.match(pattern);
    
    if (match) {
      portfolioInfo.benchmark = match[1].trim();
      break;
    }
  }
  
  // Extract strategy
  const strategyPatterns = [
    /(?:strategy|investment strategy|approach)(?:\s*|:)\s*([A-Z][A-Za-z0-9\s\.\,\-\&]+)(?:\r|\n|,)/i,
    /(?:strategy|investment strategy|approach)(?:\s*|:)\s*([A-Z][A-Za-z0-9\s\.\,\-\&]+)/i
  ];
  
  for (const pattern of strategyPatterns) {
    const match = text.match(pattern);
    
    if (match) {
      portfolioInfo.strategy = match[1].trim();
      break;
    }
  }
  
  return portfolioInfo;
}

/**
 * Extract portfolio information from tables
 * @param {Array} tables - Extracted tables
 * @returns {object} - Extracted portfolio information
 */
function extractPortfolioInfoFromTables(tables) {
  const portfolioInfo = {
    title: '',
    date: '',
    totalValue: null,
    currency: '',
    owner: '',
    manager: '',
    accountNumber: '',
    custodian: '',
    benchmark: '',
    strategy: ''
  };
  
  // Look for summary or overview tables
  const summaryTables = tables.filter(table => {
    const title = table.title ? table.title.toLowerCase() : '';
    
    return (
      title.includes('summary') || 
      title.includes('overview') || 
      title.includes('information') ||
      title.includes('details')
    );
  });
  
  for (const table of summaryTables) {
    // Look for key-value pairs in the table
    for (const row of table.rows) {
      if (row.length < 2) {
        continue;
      }
      
      const key = row[0].toLowerCase();
      const value = row[1];
      
      if (key.includes('portfolio') || key.includes('account') || key.includes('title')) {
        portfolioInfo.title = value;
      } else if (key.includes('date') || key.includes('as of')) {
        portfolioInfo.date = value;
      } else if (key.includes('total') || key.includes('value') || key.includes('worth') || key.includes('amount')) {
        portfolioInfo.totalValue = parseAmount(value);
      } else if (key.includes('currency')) {
        portfolioInfo.currency = value;
      } else if (key.includes('owner') || key.includes('client') || key.includes('investor')) {
        portfolioInfo.owner = value;
      } else if (key.includes('manager') || key.includes('advisor')) {
        portfolioInfo.manager = value;
      } else if (key.includes('account number') || key.includes('account #') || key.includes('a/c')) {
        portfolioInfo.accountNumber = value;
      } else if (key.includes('custodian') || key.includes('depository')) {
        portfolioInfo.custodian = value;
      } else if (key.includes('benchmark') || key.includes('index')) {
        portfolioInfo.benchmark = value;
      } else if (key.includes('strategy') || key.includes('approach')) {
        portfolioInfo.strategy = value;
      }
    }
  }
  
  // Look for total value in any table
  if (portfolioInfo.totalValue === null) {
    for (const table of tables) {
      for (const row of table.rows) {
        const firstCell = row[0] ? row[0].toLowerCase() : '';
        
        if (firstCell.includes('total') || firstCell.includes('portfolio value') || firstCell.includes('net asset value')) {
          if (row.length > 1) {
            portfolioInfo.totalValue = parseAmount(row[row.length - 1]);
            break;
          }
        }
      }
      
      if (portfolioInfo.totalValue !== null) {
        break;
      }
    }
  }
  
  return portfolioInfo;
}

/**
 * Determine currency from text and tables
 * @param {string} text - Full text content of the PDF
 * @param {Array} tables - Extracted tables
 * @returns {string} - Determined currency
 */
function determineCurrency(text, tables) {
  // Check for currency symbols in text
  if (text.includes('$') || text.includes('USD')) {
    return 'USD';
  } else if (text.includes('€') || text.includes('EUR')) {
    return 'EUR';
  } else if (text.includes('£') || text.includes('GBP')) {
    return 'GBP';
  } else if (text.includes('¥') || text.includes('JPY')) {
    return 'JPY';
  } else if (text.includes('CHF')) {
    return 'CHF';
  } else if (text.includes('ALL')) {
    return 'ALL';
  }
  
  // Check for currency in tables
  for (const table of tables) {
    for (const row of table.rows) {
      for (const cell of row) {
        if (cell.includes('$') || cell.includes('USD')) {
          return 'USD';
        } else if (cell.includes('€') || cell.includes('EUR')) {
          return 'EUR';
        } else if (cell.includes('£') || cell.includes('GBP')) {
          return 'GBP';
        } else if (cell.includes('¥') || cell.includes('JPY')) {
          return 'JPY';
        } else if (cell.includes('CHF')) {
          return 'CHF';
        } else if (cell.includes('ALL')) {
          return 'ALL';
        }
      }
    }
  }
  
  // Default to USD
  return 'USD';
}

/**
 * Parse amount from string
 * @param {string} value - String to parse
 * @returns {number|null} - Parsed amount or null if parsing failed
 */
function parseAmount(value) {
  if (!value) return null;
  
  // Remove currency symbols and commas
  const cleanValue = value.toString().replace(/[$€£¥]/g, '').replace(/,/g, '');
  
  // Try to parse as number
  const number = parseFloat(cleanValue);
  
  return isNaN(number) ? null : number;
}

module.exports = {
  extractPortfolioInfo,
  parseAmount
};
