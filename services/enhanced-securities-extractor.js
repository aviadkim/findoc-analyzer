/**
 * Enhanced Securities Extractor
 * 
 * Provides advanced extraction of securities information from financial documents
 * with improved context detection and pattern matching.
 */

const { isValidISIN } = require('./financial-data-extractor');

/**
 * Extract securities from document content with enhanced pattern recognition
 * @param {object} content - Document content (text and tables)
 * @returns {Promise<Array>} - Extracted securities
 */
async function extractSecurities(content) {
  try {
    console.log('Extracting securities using enhanced extractor');
    
    const securities = [];
    
    // Extract securities from tables
    if (content.tables && content.tables.length > 0) {
      const securitiesTables = findSecuritiesTables(content.tables);
      
      for (const table of securitiesTables) {
        const extractedSecurities = extractSecuritiesFromTable(table);
        securities.push(...extractedSecurities);
      }
    }
    
    // Extract securities from text
    if (content.text) {
      const extractedSecurities = extractSecuritiesFromText(content.text);
      
      // Add securities that are not already in the list
      for (const security of extractedSecurities) {
        if (!securities.some(s => s.isin === security.isin)) {
          securities.push(security);
        }
      }
    }
    
    // Merge duplicate securities (same ISIN)
    const uniqueSecurities = mergeSecuritiesByIsin(securities);
    
    // Final verification and calculation step
    const verifiedSecurities = verifyAndCompleteSecurities(uniqueSecurities, content);
    
    console.log(`Extracted ${verifiedSecurities.length} securities with enhanced extractor`);
    return verifiedSecurities;
  } catch (error) {
    console.error('Error extracting securities with enhanced extractor:', error);
    return [];
  }
}

/**
 * Find tables that contain securities information with better pattern matching
 * @param {Array} tables - Tables from the document
 * @returns {Array} - Tables with securities information
 */
function findSecuritiesTables(tables) {
  try {
    return tables.filter(table => {
      // Check if the table has headers
      if (!table.headers || table.headers.length === 0) {
        return false;
      }
      
      // Check if the table has rows
      if (!table.rows || table.rows.length === 0) {
        return false;
      }
      
      // Convert headers to lowercase for easier matching
      const headerText = table.headers.join(' ').toLowerCase();
      const title = table.title ? table.title.toLowerCase() : '';
      
      // Check if table title indicates securities
      if (title.includes('securities') || title.includes('holding') || 
          title.includes('position') || title.includes('investment') ||
          title.includes('portfolio') || title.includes('asset') ||
          title.includes('bond') || title.includes('stock') ||
          title.includes('equity') || title.includes('fund')) {
        return true;
      }
      
      // Match key financial security markers in headers
      return (
        // Security name or identifier indicators
        (headerText.includes('security') || headerText.includes('name') || 
         headerText.includes('stock') || headerText.includes('bond') || 
         headerText.includes('fund') || headerText.includes('position') || 
         headerText.includes('investment') || headerText.includes('holding') ||
         headerText.includes('instrument') || headerText.includes('asset')) &&
        
        // Identifier indicators
        (headerText.includes('isin') || headerText.includes('cusip') || 
         headerText.includes('ticker') || headerText.includes('symbol') ||
         headerText.includes('id') || headerText.includes('code') ||
         headerText.includes('identifier')) ||
        
        // Look for rows that might contain ISINs
        table.rows.some(row => {
          return row.some(cell => {
            // Check for ISIN pattern (2 letters followed by 10 alphanumeric characters)
            return typeof cell === 'string' && /[A-Z]{2}[A-Z0-9]{10}/.test(cell);
          });
        })
      );
    });
  } catch (error) {
    console.error('Error finding securities tables:', error);
    return [];
  }
}

/**
 * Extract securities from a table with improved column detection
 * @param {object} table - Table with securities information
 * @returns {Array} - Extracted securities
 */
function extractSecuritiesFromTable(table) {
  try {
    const securities = [];
    
    // Define patterns for different column types in financial tables
    const columnPatterns = {
      name: ['security', 'name', 'description', 'instrument', 'holding', 'position', 'asset'],
      isin: ['isin', 'cusip', 'identifier', 'id', 'code', 'symbol'],
      quantity: ['quantity', 'amount', 'shares', 'units', 'number', 'count', 'volume'],
      price: ['price', 'rate', 'nav', 'market price', 'quote', 'value per', 'unit price', 'cost'],
      value: ['value', 'market value', 'total', 'amount', 'balance', 'worth', 'current value'],
      percentage: ['%', 'percent', 'allocation', 'weight', 'portion'],
      type: ['type', 'asset class', 'category', 'classification', 'asset type'],
      currency: ['currency', 'ccy', 'fx']
    };
    
    // Find column indices for each type
    const columns = {};
    for (const [type, patterns] of Object.entries(columnPatterns)) {
      columns[type] = findColumnIndex(table.headers, patterns);
    }
    
    // Process each row
    for (const row of table.rows) {
      // Skip if the row doesn't have enough columns
      if (row.length <= Math.max(...Object.values(columns).filter(val => val !== -1))) {
        continue;
      }
      
      // If no ISIN column is found, try to find ISIN in any column
      let isin = columns.isin !== -1 && row.length > columns.isin ? row[columns.isin] : null;
      if (!isin) {
        // Search all cells for ISIN pattern
        for (let i = 0; i < row.length; i++) {
          const match = String(row[i]).match(/[A-Z]{2}[A-Z0-9]{10}/);
          if (match) {
            isin = match[0];
            break;
          }
        }
      }
      
      // Skip if no ISIN found
      if (!isin || !isValidISIN(isin)) {
        continue;
      }
      
      // Get security name
      let name = columns.name !== -1 && row.length > columns.name ? row[columns.name] : null;
      if (!name || name.trim() === '') {
        name = `Security with ISIN ${isin}`;
      }
      
      // Get other values
      const quantity = columns.quantity !== -1 && row.length > columns.quantity ? parseAmount(row[columns.quantity]) : null;
      const price = columns.price !== -1 && row.length > columns.price ? parseAmount(row[columns.price]) : null;
      const value = columns.value !== -1 && row.length > columns.value ? parseAmount(row[columns.value]) : null;
      const percentage = columns.percentage !== -1 && row.length > columns.percentage ? parsePercentage(row[columns.percentage]) : null;
      const type = columns.type !== -1 && row.length > columns.type ? row[columns.type] : inferSecurityType(name);
      const currency = columns.currency !== -1 && row.length > columns.currency ? row[columns.currency] : null;
      
      // Add the security
      securities.push({
        name,
        isin,
        quantity,
        price,
        value,
        percentage,
        type,
        currency
      });
    }
    
    return securities;
  } catch (error) {
    console.error('Error extracting securities from table:', error);
    return [];
  }
}

/**
 * Extract securities from text with enhanced context detection
 * @param {string} text - Document text
 * @returns {Array} - Extracted securities
 */
function extractSecuritiesFromText(text) {
  try {
    const securities = [];
    
    // Regular expression for ISIN (12 alphanumeric characters)
    const isinRegex = /[A-Z]{2}[A-Z0-9]{9}[0-9]/g;
    
    // Find all ISINs in the text
    const isins = text.match(isinRegex) || [];
    const uniqueIsins = [...new Set(isins)];
    
    console.log(`Found ${uniqueIsins.length} unique ISINs in text`);
    
    // Process each ISIN
    for (const isin of uniqueIsins) {
      if (!isValidISIN(isin)) continue;
      
      // Find the security name with enhanced context window
      const name = findSecurityName(text, isin);
      
      // Find other information in a larger context window
      const contextWindow = getContextWindow(text, isin, 500);
      
      const quantity = findSecurityQuantity(contextWindow, isin, name);
      const price = findSecurityPrice(contextWindow, isin, name);
      const value = findSecurityValue(contextWindow, isin, name, price, quantity);
      const percentage = findSecurityPercentage(contextWindow, isin, name);
      const type = findSecurityType(contextWindow, isin, name) || inferSecurityType(name);
      const currency = findSecurityCurrency(contextWindow, isin, name);
      
      // Add the security
      securities.push({
        name: name || `Security with ISIN ${isin}`,
        isin,
        quantity,
        price,
        value,
        percentage,
        type,
        currency
      });
    }
    
    return securities;
  } catch (error) {
    console.error('Error extracting securities from text:', error);
    return [];
  }
}

/**
 * Get context window around an ISIN in text
 * @param {string} text - Document text
 * @param {string} isin - ISIN
 * @param {number} windowSize - Size of context window on each side
 * @returns {string} - Context window
 */
function getContextWindow(text, isin, windowSize = 500) {
  const isinIndex = text.indexOf(isin);
  if (isinIndex === -1) return text;
  
  const start = Math.max(0, isinIndex - windowSize);
  const end = Math.min(text.length, isinIndex + isin.length + windowSize);
  
  return text.substring(start, end);
}

/**
 * Find the security name for an ISIN in text with enhanced detection
 * @param {string} text - Document text
 * @param {string} isin - ISIN
 * @returns {string} - Security name or empty string if not found
 */
function findSecurityName(text, isin) {
  try {
    // Find the position of the ISIN
    const isinIndex = text.indexOf(isin);
    
    // Skip if ISIN not found
    if (isinIndex === -1) {
      return '';
    }
    
    // Increase context window from 100 to 300 characters
    const beforeIsin = text.substring(Math.max(0, isinIndex - 300), isinIndex);
    const afterIsin = text.substring(isinIndex + isin.length, Math.min(text.length, isinIndex + 300));
    
    // Common financial security name patterns
    const namePatterns = [
      // Name followed by ISIN
      /([A-Z][A-Za-z0-9\s\.\,\-\&\(\)]{5,60})(?:[\s\n\r]*[A-Z]{2}[A-Z0-9]{10})/,
      // Name followed by ticker or identifier
      /([A-Z][A-Za-z0-9\s\.\,\-\&\(\)]{5,60})(?:[\s\n\r]*\([A-Z0-9\.]+\))/,
      // Name after labels like "name:" or "security:"
      /(?:name|security|instrument|position|holding)[\s\:\-]+([A-Z][A-Za-z0-9\s\.\,\-\&\(\)]{5,60})/i,
      // Name in parentheses
      /\(([A-Z][A-Za-z0-9\s\.\,\-\&]{5,60})\)/,
      // Name after ISIN (sometimes identifier comes first)
      /[A-Z]{2}[A-Z0-9]{10}[\s\n\r\:\-]+([A-Z][A-Za-z0-9\s\.\,\-\&\(\)]{5,60})/
    ];
    
    // Try patterns before the ISIN
    for (const pattern of namePatterns) {
      const nameMatch = beforeIsin.match(pattern);
      if (nameMatch && nameMatch[1] && nameMatch[1].trim().length > 3) {
        return nameMatch[1].trim();
      }
    }
    
    // Try patterns after the ISIN
    for (const pattern of namePatterns) {
      const nameMatch = afterIsin.match(pattern);
      if (nameMatch && nameMatch[1] && nameMatch[1].trim().length > 3) {
        return nameMatch[1].trim();
      }
    }
    
    // Look for the name in nearby text blocks
    const lines = [...beforeIsin.split('\n'), ...afterIsin.split('\n')];
    
    // Filter lines to find potential name candidates
    const nameLines = lines.filter(line => {
      const trimmed = line.trim();
      return (
        // Not too short or too long
        trimmed.length > 3 && trimmed.length < 100 &&
        // Starts with capital letter
        /^[A-Z]/.test(trimmed) &&
        // Not just a number or date
        !/^\d+(\.\d+)?$/.test(trimmed) &&
        // Not likely to be a table header
        !/(isin|cusip|quantity|price|value|amount|shares|percent)/i.test(trimmed) &&
        // Not likely a table row with multiple numbers
        (trimmed.match(/\d+(\.\d+)?/g) || []).length < 3
      );
    });
    
    if (nameLines.length > 0) {
      // Find the line closest to the ISIN location
      const isinLineIndex = beforeIsin.split('\n').length - 1;
      const closestLine = nameLines.reduce((closest, line) => {
        const lineIndex = lines.indexOf(line);
        const currentDistance = Math.abs(lineIndex - isinLineIndex);
        
        if (closest.distance === null || currentDistance < closest.distance) {
          return { line, distance: currentDistance };
        } else {
          return closest;
        }
      }, { line: null, distance: null });
      
      if (closestLine.line) {
        return closestLine.line.trim();
      }
    }
    
    return '';
  } catch (error) {
    console.error('Error finding security name:', error);
    return '';
  }
}

/**
 * Find the security quantity in text with enhanced pattern matching
 * @param {string} text - Document text
 * @param {string} isin - ISIN
 * @param {string} name - Security name
 * @returns {number|null} - Quantity or null if not found
 */
function findSecurityQuantity(text, isin, name) {
  try {
    // Combined pattern - quantity followed by or preceded by quantity-related terms
    const patterns = [
      // Common quantity formats
      /(?:quantity|amount|shares|units|number of shares)[\s\:\-]*([0-9\,\'\`\.\s]+)(?![\%\$\€\£])/i,
      /([0-9\,\'\`\.\s]+)(?![\%\$\€\£])\s*(?:shares|units|quantity)/i,
      // Quantity in parentheses
      /\(([0-9\,\'\`\.\s]+)(?:\s*(?:shares|units))?\)/i,
      // Quantity after identifier
      new RegExp(`${isin}[\s\:\-]*([0-9\,\'\`\.\s]+)(?![\%\$\€\£])`, 'i')
    ];
    
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        // Clean the matched string
        const clean = match[1].replace(/[\,\'\`\s]/g, '');
        const number = parseFloat(clean);
        if (!isNaN(number) && number > 0) {
          return number;
        }
      }
    }
    
    // Search for numbers near certain quantity indicators
    const quantityIndicators = ['shares', 'units', 'quantity', 'holding', 'amount'];
    for (const indicator of quantityIndicators) {
      const indicatorIndex = text.toLowerCase().indexOf(indicator);
      if (indicatorIndex !== -1) {
        // Look for numbers in close proximity
        const surroundingText = text.substring(Math.max(0, indicatorIndex - 20), Math.min(text.length, indicatorIndex + 30));
        const numberMatch = surroundingText.match(/([0-9\,\'\`\.\s]+)(?![\%\$\€\£])/i);
        
        if (numberMatch) {
          const clean = numberMatch[1].replace(/[\,\'\`\s]/g, '');
          const number = parseFloat(clean);
          if (!isNaN(number) && number > 0) {
            return number;
          }
        }
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error finding security quantity:', error);
    return null;
  }
}

/**
 * Find the security price in text with enhanced pattern matching
 * @param {string} text - Document text
 * @param {string} isin - ISIN
 * @param {string} name - Security name
 * @returns {number|null} - Price or null if not found
 */
function findSecurityPrice(text, isin, name) {
  try {
    // First, search for prices near the ISIN or security name for better context
    const isinIndex = text.indexOf(isin);
    let contextText = text;
    
    // If we found the ISIN in the text, focus our search around it
    if (isinIndex !== -1) {
      const contextStart = Math.max(0, isinIndex - 200);
      const contextEnd = Math.min(text.length, isinIndex + isin.length + 300);
      contextText = text.substring(contextStart, contextEnd);
    } else if (name && text.indexOf(name) !== -1) {
      // If we found the name in the text, focus around it
      const nameIndex = text.indexOf(name);
      const contextStart = Math.max(0, nameIndex - 200);
      const contextEnd = Math.min(text.length, nameIndex + name.length + 300);
      contextText = text.substring(contextStart, contextEnd);
    }
    
    // Common price-specific patterns in financial statements
    const pricePatterns = [
      // Price per share with currency symbol
      /(?:price|rate|nav|cost|quote)\s*(?:per|\/)\s*(?:share|unit)\s*(?:of|:)?\s*[$€£¥]\s*([0-9]{1,3}(?:[\,\.\']\d{1,3})*(?:[\,\.]\d{1,4})?)/i,
      
      // Price with currency symbol in financial reports
      /(?:price|rate|nav|quote|cost)[\s\:\-]*[$€£¥]\s*([0-9]{1,3}(?:[\,\.\']\d{1,3})*(?:[\,\.]\d{1,4})?)/i,
      
      // Currency symbol with price
      /[$€£¥]\s*([0-9]{1,3}(?:[\,\.\']\d{1,3})*(?:[\,\.]\d{1,4})?)(?:\s*per\s*(?:share|unit))?/i,
      
      // Price with currency code
      /([0-9]{1,3}(?:[\,\.\']\d{1,3})*(?:[\,\.]\d{1,4})?)\s*(?:USD|EUR|GBP|JPY|CHF)(?:\s*per\s*(?:share|unit))?/i,
      
      // Price per share/unit
      /([0-9]{1,3}(?:[\,\.\']\d{1,3})*(?:[\,\.]\d{1,4})?)\s*(?:per|\/)\s*(?:share|unit)/i,
      
      // NAV or Net Asset Value
      /(?:NAV|Net\s+Asset\s+Value)[\s\:\-]*([0-9]{1,3}(?:[\,\.\']\d{1,3})*(?:[\,\.]\d{1,4})?)/i,
      
      // Price with percentage changes often found in financial statements
      /(?:price|rate)[\s\:\-]+([0-9]{1,3}(?:[\,\.\']\d{1,3})*(?:[\,\.]\d{1,4})?)\s*(?:\+|\-)?\s*\d+(?:\.\d+)?\s*%/i,
      
      // Price formatted in parentheses
      /\(([0-9]{1,3}(?:[\,\.\']\d{1,3})*(?:[\,\.]\d{1,4})?)\)\s*(?:USD|EUR|GBP|JPY|CHF)?/i,
      
      // Common Swiss format with apostrophes
      /([0-9]{1,3}(?:\'[0-9]{3})*(?:\.[0-9]{1,4})?)/
    ];
    
    // Look for matches in the focused context first
    for (const pattern of pricePatterns) {
      const match = contextText.match(pattern);
      if (match) {
        const rawPrice = match[1];
        const cleanPrice = cleanCurrencyValue(rawPrice);
        if (cleanPrice !== null && isReasonablePrice(cleanPrice)) {
          return cleanPrice;
        }
      }
    }
    
    // If we didn't find a price yet, look for price keywords
    const priceKeywords = [
      'price per share', 'share price', 'nav per share', 'market price', 'price', 
      'rate', 'nav', 'quote', 'cost per unit', 'unit price'
    ];
    
    for (const keyword of priceKeywords) {
      const keywordIndex = contextText.toLowerCase().indexOf(keyword);
      if (keywordIndex !== -1) {
        // Look for numbers near the keyword
        const nearKeyword = contextText.substring(
          Math.max(0, keywordIndex - 30), 
          Math.min(contextText.length, keywordIndex + keyword.length + 50)
        );
        
        // Try various number patterns
        const patterns = [
          // Number with currency symbol
          /[$€£¥]\s*([0-9]{1,3}(?:[\,\.\']\d{1,3})*(?:[\,\.]\d{1,4})?)/,
          // Number with up to 4 decimal places (common for share prices)
          /([0-9]{1,3}(?:[\,\.\']\d{1,3})*\.[0-9]{1,4})/,
          // Simple decimal number
          /([0-9]{1,3}(?:\.[0-9]{1,4})?)/
        ];
        
        for (const pattern of patterns) {
          const numberMatch = nearKeyword.match(pattern);
          if (numberMatch) {
            const rawPrice = numberMatch[1];
            const cleanPrice = cleanCurrencyValue(rawPrice);
            if (cleanPrice !== null && isReasonablePrice(cleanPrice)) {
              return cleanPrice;
            }
          }
        }
      }
    }
    
    // Check for common price patterns in financial tables
    // Often prices are presented in sequences of numbers for bid/ask/last
    const tablePatterns = [
      // Price sequences like "100.2000 99.5002" where second number is often the price
      /([0-9]{1,3}(?:\.[0-9]{4})?)\s+([0-9]{1,3}(?:\.[0-9]{4})?)/
    ];
    
    for (const pattern of tablePatterns) {
      const match = contextText.match(pattern);
      if (match) {
        // In these sequences, usually the second number is more likely to be the price
        const rawPrice = match[2] || match[1];
        const cleanPrice = cleanCurrencyValue(rawPrice);
        if (cleanPrice !== null && isReasonablePrice(cleanPrice)) {
          return cleanPrice;
        }
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error finding security price:', error);
    return null;
  }
}

/**
 * Check if a price seems reasonable
 * @param {number} price - Price to check
 * @returns {boolean} - Whether the price seems reasonable
 */
function isReasonablePrice(price) {
  // Most security prices in financial statements will be between 0.01 and 10,000
  if (price <= 0) return false;
  if (price > 10000) return false;
  
  // Avoid prices that are suspiciously large and might be misclassified values
  // or ISIN numbers converted to numbers
  if (price > 1000000) return false;
  
  return true;
}

/**
 * Find the security value in text with enhanced pattern matching
 * @param {string} text - Document text
 * @param {string} isin - ISIN
 * @param {string} name - Security name
 * @param {number|null} price - Security price if already found
 * @param {number|null} quantity - Security quantity if already found
 * @returns {number|null} - Value or null if not found
 */
function findSecurityValue(text, isin, name, price, quantity) {
  try {
    // Try to calculate value from price and quantity if both are available
    if (price !== null && quantity !== null) {
      return price * quantity;
    }
    
    // First, search for values near the ISIN or security name for better context
    const isinIndex = text.indexOf(isin);
    let contextText = text;
    
    // If we found the ISIN in the text, focus our search around it
    if (isinIndex !== -1) {
      const contextStart = Math.max(0, isinIndex - 200);
      const contextEnd = Math.min(text.length, isinIndex + isin.length + 300);
      contextText = text.substring(contextStart, contextEnd);
    } else if (name && text.indexOf(name) !== -1) {
      // If we found the name in the text, focus around it
      const nameIndex = text.indexOf(name);
      const contextStart = Math.max(0, nameIndex - 200);
      const contextEnd = Math.min(text.length, nameIndex + name.length + 300);
      contextText = text.substring(contextStart, contextEnd);
    }
    
    // Define more precise value patterns for financial documents
    const valuePatterns = [
      // Value with currency symbol and formatting commonly found in financial statements
      // Like: $123,456.78 or € 1.234.567,89
      /(?:value|total|amount|balance|market|price)[\s\:\-]*[$€£¥]\s*([0-9]{1,3}(?:[\,\.\']\d{3})+(?:[\,\.]\d{1,2})?)/i,
      /[$€£¥]\s*([0-9]{1,3}(?:[\,\.\']\d{3})+(?:[\,\.]\d{1,2})?)/i,
      
      // Value with apostrophes as thousands separators (common in Swiss/European formats)
      // Like: 123'456.78 or 1'234'567.89
      /([0-9]{1,3}(?:\'[0-9]{3})+(?:\.[0-9]{1,2})?)/,
      
      // Value followed by currency code
      // Like: 123,456.78 USD or 1.234.567,89 EUR
      /([0-9]{1,3}(?:[\,\.\']\d{3})+(?:[\,\.]\d{1,2})?)\s*(?:USD|EUR|GBP|CHF|JPY)/i,
      
      // Value in European format (periods as thousands separators, comma as decimal)
      // Like: 1.234.567,89
      /([0-9]{1,3}(?:\.[0-9]{3})+(?:\,[0-9]{1,2})?)/,
      
      // Moderate-sized numbers that appear near value-related terms
      // Avoiding matching on ISINs or very large numbers
      /(?:value|worth|amount|balance|market|total)\s*(?:of|:)?\s*([0-9]{1,3}(?:[\,\.\']\d{3})*(?:[\,\.]\d{1,2})?)/i,
    ];
    
    // Look for matches in the focused context text first
    for (const pattern of valuePatterns) {
      const match = contextText.match(pattern);
      if (match) {
        const rawValue = match[1];
        // Process the value based on its format
        const cleanValue = cleanCurrencyValue(rawValue);
        if (cleanValue !== null && isReasonableValue(cleanValue)) {
          return cleanValue;
        }
      }
    }
    
    // If we didn't find anything in the context, try specific keywords that often precede values
    const valueKeywords = [
      'market value', 'total value', 'position value', 'worth', 
      'balance', 'current value', 'amount', 'valuation'
    ];
    
    for (const keyword of valueKeywords) {
      const keywordIndex = contextText.toLowerCase().indexOf(keyword);
      if (keywordIndex !== -1) {
        // Look for numbers after the keyword (within a reasonable distance)
        const afterKeyword = contextText.substring(
          keywordIndex + keyword.length, 
          Math.min(contextText.length, keywordIndex + keyword.length + 80)
        );
        
        // Try multiple number patterns
        const patterns = [
          // Currency symbol followed by number with thousands separators
          /[$€£¥]\s*([0-9]{1,3}(?:[\,\.\']\d{3})*(?:[\,\.]\d{1,2})?)/,
          // Number with thousands separators
          /([0-9]{1,3}(?:[\,\.\']\d{3})*(?:[\,\.]\d{1,2})?)/,
          // Simple number (may not have separators)
          /([0-9]{1,6}(?:[\,\.]\d{1,2})?)/
        ];
        
        for (const pattern of patterns) {
          const numberMatch = afterKeyword.match(pattern);
          if (numberMatch) {
            const rawValue = numberMatch[1];
            const cleanValue = cleanCurrencyValue(rawValue);
            if (cleanValue !== null && isReasonableValue(cleanValue)) {
              return cleanValue;
            }
          }
        }
      }
    }
    
    // Check for patterns like "XXX shares at YYY" which can also indicate value
    if (quantity !== null) {
      const sharesPatterns = [
        new RegExp(`${quantity}\\s*(?:shares|units)\\s*(?:at|@)\\s*([0-9]{1,3}(?:[\\,\\.\\']\\d{3})*(?:[\\,\\.]\\d{1,2})?)`, 'i'),
        new RegExp(`([0-9]{1,3}(?:[\\,\\.\\']\\d{3})*(?:[\\,\\.]\\d{1,2})?)\\s*(?:per|each)\\s*(?:share|unit)`, 'i')
      ];
      
      for (const pattern of sharesPatterns) {
        const match = contextText.match(pattern);
        if (match) {
          const rawValue = match[1];
          const cleanValue = cleanCurrencyValue(rawValue);
          if (cleanValue !== null && isReasonableValue(cleanValue)) {
            // This is likely the price per share, so calculate the total value
            return cleanValue * quantity;
          }
        }
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error finding security value:', error);
    return null;
  }
}

/**
 * Clean a currency value string and convert to number
 * @param {string} valueStr - Value string to clean
 * @returns {number|null} - Cleaned value as number or null if invalid
 */
function cleanCurrencyValue(valueStr) {
  try {
    if (!valueStr) return null;
    
    // Remove currency symbols and spaces
    let clean = valueStr.replace(/[$€£¥\s]/g, '');
    
    // Detect format (European vs US)
    // If it has both commas and periods, we need to determine which is the decimal separator
    if (clean.includes(',') && clean.includes('.')) {
      // European format typically has the last separator as the decimal point
      const lastCommaIndex = clean.lastIndexOf(',');
      const lastPeriodIndex = clean.lastIndexOf('.');
      
      if (lastCommaIndex > lastPeriodIndex) {
        // European format (comma is decimal separator)
        // Convert to US format for parsing
        clean = clean.replace(/\./g, '').replace(/,/g, '.');
      } else {
        // US format (period is decimal separator)
        clean = clean.replace(/,/g, '');
      }
    } else if (clean.includes(',') && !clean.includes('.')) {
      // If only commas, check if it looks like a decimal separator or thousands
      if (clean.lastIndexOf(',') === clean.length - 3 && clean.length > 3) {
        // Likely European format with comma as decimal
        clean = clean.replace(/,/g, '.');
      } else {
        // Likely US format with comma as thousands
        clean = clean.replace(/,/g, '');
      }
    }
    
    // Replace apostrophes (Swiss notation for thousands)
    clean = clean.replace(/'/g, '');
    
    // Parse as float
    const value = parseFloat(clean);
    if (isNaN(value)) return null;
    
    return value;
  } catch (error) {
    console.error('Error cleaning currency value:', error);
    return null;
  }
}

/**
 * Check if a value seems reasonable for a security value
 * @param {number} value - Value to check
 * @returns {boolean} - Whether the value seems reasonable
 */
function isReasonableValue(value) {
  // Avoid values that are likely ISIN numbers converted to values (typically very large)
  // Most security values in financial statements will be between 0.01 and 100,000,000
  if (value <= 0) return false;
  if (value > 100000000) return false;
  
  // Avoid values that are suspiciously close to ISIN number format
  // ISIN format starts with 2 letters followed by 10 digits
  // Converted to a number, this would be a large number typically between 1-9 billion
  if (value > 1000000000 && value < 9999999999) return false;
  
  return true;
}

/**
 * Find the security percentage in text with enhanced pattern matching
 * @param {string} text - Document text
 * @param {string} isin - ISIN
 * @param {string} name - Security name
 * @returns {number|null} - Percentage or null if not found
 */
function findSecurityPercentage(text, isin, name) {
  try {
    // Percentage patterns
    const percentPatterns = [
      // Percentage sign after number
      /(?:percent|allocation|weight|portion|%)[\s\:\-]*([0-9\,\.]+)\s*%?/i,
      /([0-9\,\.]+)\s*(?:%|percent|pct)/i,
      
      // Specific percentage formats
      /allocation[\s\:\-]*([0-9\,\.]+)\s*%?/i,
      /weight[\s\:\-]*([0-9\,\.]+)\s*%?/i
    ];
    
    for (const pattern of percentPatterns) {
      const match = text.match(pattern);
      if (match) {
        const clean = match[1].replace(/[\,\s]/g, '');
        const number = parseFloat(clean);
        if (!isNaN(number) && number >= 0 && number <= 100) {
          return number;
        }
      }
    }
    
    // Look for percentage indicators
    const percentKeywords = ['%', 'percent', 'allocation', 'weight', 'portion'];
    for (const keyword of percentKeywords) {
      const keywordIndex = text.toLowerCase().indexOf(keyword);
      if (keywordIndex !== -1) {
        // Look for numbers before the keyword
        const beforeKeyword = text.substring(Math.max(0, keywordIndex - 30), keywordIndex);
        const numberMatch = beforeKeyword.match(/([0-9\,\.]+)\s*$/);
        
        if (numberMatch) {
          const clean = numberMatch[1].replace(/[\,\s]/g, '');
          const number = parseFloat(clean);
          if (!isNaN(number) && number >= 0 && number <= 100) {
            return number;
          }
        }
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error finding security percentage:', error);
    return null;
  }
}

/**
 * Find the security type in text
 * @param {string} text - Document text
 * @param {string} isin - ISIN
 * @param {string} name - Security name
 * @returns {string|null} - Security type or null if not found
 */
function findSecurityType(text, isin, name) {
  try {
    // Type patterns
    const typePatterns = [
      /(?:type|asset class|category)[\s\:\-]*((?:equity|stock|share|bond|fund|etf|derivative|cash|money market|real estate|commodity|structured|note)[a-z\s]*)/i,
      /((?:ordinary|zero|callable)\s*(?:bond|note|debenture))/i,
      /((?:common|preferred)\s*(?:stock|equity|share))/i,
      /((?:mutual|index|exchange traded|etf|money market)\s*fund)/i
    ];
    
    for (const pattern of typePatterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        return match[1].trim();
      }
    }
    
    // Check for type in name as fallback
    return null;
  } catch (error) {
    console.error('Error finding security type:', error);
    return null;
  }
}

/**
 * Find the security currency in text
 * @param {string} text - Document text
 * @param {string} isin - ISIN
 * @param {string} name - Security name
 * @returns {string|null} - Currency code or null if not found
 */
function findSecurityCurrency(text, isin, name) {
  try {
    // Currency patterns
    const currencyPatterns = [
      /(?:currency|ccy|fx)[\s\:\-]*((?:USD|EUR|GBP|JPY|CHF|[A-Z]{3}))/i,
      /(?:in|of)\s*((?:USD|EUR|GBP|JPY|CHF|[A-Z]{3}))/i,
      /((?:USD|EUR|GBP|JPY|CHF|[A-Z]{3}))\s*(?:denominated)/i,
      /[$€£¥]([0-9\,\.\s]+)/
    ];
    
    for (const pattern of currencyPatterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        if (pattern.toString().includes('[$€£¥]')) {
          // If matched a currency symbol, convert to code
          const symbol = match[0][0];
          switch (symbol) {
            case '$': return 'USD';
            case '€': return 'EUR';
            case '£': return 'GBP';
            case '¥': return 'JPY';
            default: return null;
          }
        } else {
          return match[1].trim().toUpperCase();
        }
      }
    }
    
    // Look for common currency codes
    const currencyCodes = ['USD', 'EUR', 'GBP', 'JPY', 'CHF', 'CAD', 'AUD', 'NZD'];
    for (const code of currencyCodes) {
      if (text.includes(code)) {
        return code;
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error finding security currency:', error);
    return null;
  }
}

/**
 * Find the column index in a table
 * @param {Array} headers - Table headers
 * @param {Array} keywords - Keywords to look for
 * @returns {number} - Column index or -1 if not found
 */
function findColumnIndex(headers, keywords) {
  if (!headers || !Array.isArray(headers)) return -1;
  
  // Convert headers to lowercase for case-insensitive matching
  const lowercaseHeaders = headers.map(h => h.toLowerCase());
  
  // First try exact matches
  for (let i = 0; i < lowercaseHeaders.length; i++) {
    const header = lowercaseHeaders[i];
    
    for (const keyword of keywords) {
      if (header === keyword.toLowerCase()) {
        return i;
      }
    }
  }
  
  // Then try partial matches
  for (let i = 0; i < lowercaseHeaders.length; i++) {
    const header = lowercaseHeaders[i];
    
    for (const keyword of keywords) {
      if (header.includes(keyword.toLowerCase())) {
        return i;
      }
    }
  }
  
  return -1;
}

/**
 * Parse a percentage string
 * @param {string} str - Percentage string
 * @returns {number|null} - Parsed percentage
 */
function parsePercentage(str) {
  if (!str) return null;
  if (typeof str === 'number') return str;
  
  // Convert to string if not already
  const text = String(str);
  
  // Try to extract percentage value
  const percentMatch = text.match(/([\-+]?[0-9]+(?:\.[0-9]+)?)\s*%?/);
  if (percentMatch) {
    return parseFloat(percentMatch[1]);
  }
  
  return null;
}

/**
 * Parse an amount string
 * @param {string} str - Amount string
 * @returns {number|null} - Parsed amount
 */
function parseAmount(str) {
  if (!str) return null;
  if (typeof str === 'number') return str;
  
  // Convert to string if not already
  const text = String(str);
  
  // Remove currency symbols, commas, apostrophes, and other non-numeric characters except decimal points
  const cleanStr = text.replace(/[$€£¥]/g, '').replace(/[\,\'\`\s]/g, '');
  
  // Handle European number format (replace comma decimal separator with period)
  let normalizedStr = cleanStr;
  if (cleanStr.includes(',') && !cleanStr.includes('.')) {
    normalizedStr = cleanStr.replace(/,/g, '.');
  }
  
  // Extract the number
  const amountMatch = normalizedStr.match(/([\-+]?[0-9]+(?:\.[0-9]+)?)/);
  if (amountMatch) {
    return parseFloat(amountMatch[1]);
  }
  
  return null;
}

/**
 * Infer security type from name
 * @param {string} name - Security name
 * @returns {string} - Inferred security type
 */
function inferSecurityType(name) {
  if (!name) return 'unknown';
  
  const nameLower = name.toLowerCase();
  
  // Different security type patterns
  const patterns = [
    { type: 'bond', keywords: ['bond', 'treasury', 'note', 'bill', 'debt', 'fixed income', 'debenture', 'coupon'] },
    { type: 'equity', keywords: ['stock', 'share', 'equity', 'common', 'preferred'] },
    { type: 'fund', keywords: ['fund', 'etf', 'index', 'mutual', 'investment trust', 'sicav', 'unit trust'] },
    { type: 'derivative', keywords: ['option', 'future', 'swap', 'forward', 'derivative'] },
    { type: 'cash', keywords: ['cash', 'money market', 'deposit', 'liquidity'] },
    { type: 'real estate', keywords: ['reit', 'real estate', 'property'] },
    { type: 'commodity', keywords: ['commodity', 'gold', 'silver', 'oil', 'gas', 'precious metal'] },
    { type: 'structured', keywords: ['structured', 'certificate', 'product', 'note', 'autocall', 'callable'] }
  ];
  
  for (const { type, keywords } of patterns) {
    for (const keyword of keywords) {
      if (nameLower.includes(keyword)) {
        return type;
      }
    }
  }
  
  return 'unknown';
}

/**
 * Verify and complete securities data by combining information and applying business logic
 * @param {Array} securities - Extracted securities
 * @param {object} content - Document content
 * @returns {Array} - Verified and completed securities
 */
function verifyAndCompleteSecurities(securities, content) {
  const result = [];
  const isinTracker = new Set(); // To prevent duplicate ISINs
  
  // Extract portfolio total value for validation if available
  const portfolioTotalValue = content.financialData && 
                             content.financialData.portfolioInfo && 
                             content.financialData.portfolioInfo.totalValue;
  
  // Step 1: Validate and complete each security
  for (const security of securities) {
    // Skip securities without ISIN (mandatory)
    if (!security.isin) continue;
    
    // Skip if we've already processed this ISIN
    if (isinTracker.has(security.isin)) continue;
    isinTracker.add(security.isin);
    
    // Calculate missing values when possible
    let { quantity, price, value } = security;
    
    // Calculate value from price and quantity if missing
    if (value === null && price !== null && quantity !== null) {
      value = price * quantity;
    }
    
    // Calculate price from value and quantity if missing
    if (price === null && value !== null && quantity !== null && quantity > 0) {
      price = value / quantity;
    }
    
    // Calculate quantity from value and price if missing
    if (quantity === null && value !== null && price !== null && price > 0) {
      quantity = value / price;
    }
    
    // Validate all values using reasonable range checks
    const isValidPrice = price === null || isReasonablePrice(price);
    const isValidValue = value === null || isReasonableValue(value);
    const isValidQuantity = quantity === null || (quantity > 0 && quantity < 1000000000);
    const isValidPercentage = security.percentage === null || 
                             (security.percentage >= 0 && security.percentage <= 100);
    
    // Log and skip invalid securities
    if (!isValidPrice || !isValidValue || !isValidQuantity || !isValidPercentage) {
      console.warn(`Skipping security with invalid values:`, {
        isin: security.isin,
        price,
        value,
        quantity,
        percentage: security.percentage
      });
      continue;
    }
    
    // Add completed security with cleaned up data
    result.push({
      name: security.name || `Security with ISIN ${security.isin}`,
      isin: security.isin,
      type: security.type || inferSecurityType(security.name),
      quantity,
      price,
      value,
      percentage: security.percentage,
      currency: security.currency || inferCurrencyFromContent(content)
    });
  }
  
  // Step 2: Cross-validate using portfolio totals
  // If we have a portfolio total value and enough securities, verify they make sense together
  if (portfolioTotalValue !== null && portfolioTotalValue > 0 && result.length > 0) {
    // Calculate the sum of security values
    const securitiesWithValues = result.filter(s => s.value !== null);
    const totalSecuritiesValue = securitiesWithValues.reduce((sum, s) => sum + s.value, 0);
    
    // If we have enough securities with values and they sum to something very different
    // from the portfolio total, something might be wrong
    if (securitiesWithValues.length >= 3 && securitiesWithValues.length >= result.length * 0.3) {
      const percentDifference = Math.abs((totalSecuritiesValue - portfolioTotalValue) / portfolioTotalValue);
      
      // If the difference is more than 100%, securities might have wrong values
      if (percentDifference > 1.0) {
        console.warn(`Securities total value (${totalSecuritiesValue}) differs significantly from portfolio total (${portfolioTotalValue}). Values might be incorrect.`);
        
        // Try to scale values if they're all off by a similar factor
        if (securitiesWithValues.length >= 5 && percentDifference > 2.0) {
          // Calculate scaling factor
          const scalingFactor = portfolioTotalValue / totalSecuritiesValue;
          
          // Apply scaling if it seems reasonable (avoiding extreme adjustments)
          if (scalingFactor > 0.001 && scalingFactor < 1000) {
            console.log(`Adjusting security values by factor ${scalingFactor}`);
            
            // Scale all values
            for (const security of result) {
              if (security.value !== null) {
                security.value = security.value * scalingFactor;
                
                // Adjust price if quantity is available
                if (security.quantity !== null && security.quantity > 0) {
                  security.price = security.value / security.quantity;
                }
              }
            }
          }
        }
      }
    }
  }
  
  // Step 3: Fill in percentages if missing but values are available
  const securitiesWithValues = result.filter(s => s.value !== null);
  if (securitiesWithValues.length > 0) {
    const totalValue = securitiesWithValues.reduce((sum, s) => sum + s.value, 0);
    
    if (totalValue > 0) {
      for (const security of result) {
        if (security.value !== null && security.percentage === null) {
          security.percentage = (security.value / totalValue) * 100;
        }
      }
    }
  }
  
  // Sort securities by value (if available) or alphabetically by name
  result.sort((a, b) => {
    if (a.value !== null && b.value !== null) {
      return b.value - a.value; // Sort by value, descending
    } else if (a.value !== null) {
      return -1; // Securities with values come first
    } else if (b.value !== null) {
      return 1; 
    } else {
      return a.name.localeCompare(b.name); // Sort by name, ascending
    }
  });
  
  return result;
}

/**
 * Infer the currency from document content
 * @param {object} content - Document content
 * @returns {string} - Inferred currency
 */
function inferCurrencyFromContent(content) {
  // Check if portfolio info has currency
  if (content.financialData && 
      content.financialData.portfolioInfo && 
      content.financialData.portfolioInfo.currency) {
    return content.financialData.portfolioInfo.currency;
  }
  
  // Check text for common currencies
  const text = content.text || '';
  
  if (text.includes('USD') || text.includes('$') || text.includes('US Dollar')) {
    return 'USD';
  } else if (text.includes('EUR') || text.includes('€') || text.includes('Euro')) {
    return 'EUR';
  } else if (text.includes('GBP') || text.includes('£') || text.includes('Sterling')) {
    return 'GBP';
  } else if (text.includes('JPY') || text.includes('¥') || text.includes('Yen')) {
    return 'JPY';
  } else if (text.includes('CHF') || text.includes('Swiss Franc')) {
    return 'CHF';
  }
  
  // Default to USD
  return 'USD';
}

/**
 * Merge securities with the same ISIN
 * @param {Array} securities - Extracted securities
 * @returns {Array} - Merged securities
 */
function mergeSecuritiesByIsin(securities) {
  const merged = {};
  
  for (const security of securities) {
    const isin = security.isin;
    if (!isin) continue;
    
    if (!merged[isin]) {
      merged[isin] = { ...security };
    } else {
      // Merge properties, preferring non-null values
      const existing = merged[isin];
      
      // Keep the more informative name
      if (!existing.name || (security.name && security.name !== `Security with ISIN ${isin}` && 
          existing.name === `Security with ISIN ${isin}`)) {
        existing.name = security.name;
      }
      
      // Prefer non-null values for other properties
      existing.type = existing.type || security.type;
      existing.quantity = existing.quantity !== null ? existing.quantity : security.quantity;
      existing.price = existing.price !== null ? existing.price : security.price;
      existing.value = existing.value !== null ? existing.value : security.value;
      existing.percentage = existing.percentage !== null ? existing.percentage : security.percentage;
      existing.currency = existing.currency || security.currency;
    }
  }
  
  return Object.values(merged);
}

// Add market data integration
const marketDataService = require('./market-data-service');

/**
 * Extract securities with enhanced market data
 * @param {object} content - Document content
 * @param {boolean} includeMarketData - Whether to include market data
 * @returns {Promise<Array>} - Extracted securities with market data
 */
async function extractSecuritiesWithMarketData(content, includeMarketData = true) {
  try {
    console.log('Extracting securities with market data integration');
    
    // First extract securities using the standard method
    const securities = await extractSecurities(content);
    
    // If market data is not requested, return the securities as is
    if (!includeMarketData) {
      return securities;
    }
    
    // Update securities with market data
    console.log(`Updating ${securities.length} securities with market data`);
    const result = await marketDataService.updateSecuritiesWithMarketPrices(securities);
    
    return result.securities;
  } catch (error) {
    console.error('Error extracting securities with market data:', error);
    
    // Fallback to basic extraction if market data integration fails
    const securities = await extractSecurities(content);
    return securities;
  }
}

module.exports = {
  extractSecurities,
  extractSecuritiesWithMarketData,
  findSecuritiesTables,
  extractSecuritiesFromTable,
  extractSecuritiesFromText,
  findSecurityName,
  findSecurityQuantity,
  findSecurityPrice,
  findSecurityValue,
  findSecurityPercentage,
  parseAmount,
  parsePercentage,
  inferSecurityType
};