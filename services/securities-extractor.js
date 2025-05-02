/**
 * Securities Extraction Service
 * 
 * This service provides functionality for extracting securities information from financial documents.
 */

/**
 * Extract securities from document content
 * @param {object} content - Document content
 * @returns {Promise<Array>} - Extracted securities
 */
async function extractSecurities(content) {
  try {
    console.log('Extracting securities from document content');
    
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
    
    return securities;
  } catch (error) {
    console.error('Error extracting securities:', error);
    return [];
  }
}

/**
 * Find tables that contain securities information
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
      
      // Check if the table has securities-related headers
      const headerText = table.headers.join(' ').toLowerCase();
      
      return (
        // Check for security name
        (headerText.includes('security') || headerText.includes('name') || headerText.includes('stock') || headerText.includes('bond') || headerText.includes('fund')) &&
        
        // Check for ISIN or other identifiers
        (headerText.includes('isin') || headerText.includes('cusip') || headerText.includes('ticker') || headerText.includes('symbol')) &&
        
        // Check for quantity or value
        (headerText.includes('quantity') || headerText.includes('amount') || headerText.includes('value') || headerText.includes('price'))
      );
    });
  } catch (error) {
    console.error('Error finding securities tables:', error);
    return [];
  }
}

/**
 * Extract securities from a table
 * @param {object} table - Table with securities information
 * @returns {Array} - Extracted securities
 */
function extractSecuritiesFromTable(table) {
  try {
    const securities = [];
    
    // Find column indices
    const nameIndex = findColumnIndex(table.headers, ['security', 'name', 'stock', 'bond', 'fund']);
    const isinIndex = findColumnIndex(table.headers, ['isin', 'cusip', 'ticker', 'symbol']);
    const quantityIndex = findColumnIndex(table.headers, ['quantity', 'amount', 'shares']);
    const acquisitionPriceIndex = findColumnIndex(table.headers, ['acquisition', 'purchase', 'cost', 'buy']);
    const currentValueIndex = findColumnIndex(table.headers, ['current', 'value', 'price', 'market']);
    const percentOfAssetsIndex = findColumnIndex(table.headers, ['%', 'percent', 'allocation', 'weight']);
    
    // Skip if we can't find the name and ISIN columns
    if (nameIndex === -1 || isinIndex === -1) {
      return securities;
    }
    
    // Process each row
    for (const row of table.rows) {
      // Skip if the row doesn't have enough columns
      if (row.length <= Math.max(nameIndex, isinIndex)) {
        continue;
      }
      
      // Get values
      const name = row[nameIndex];
      const isin = row[isinIndex];
      const quantity = quantityIndex !== -1 && row.length > quantityIndex ? row[quantityIndex] : '';
      const acquisitionPrice = acquisitionPriceIndex !== -1 && row.length > acquisitionPriceIndex ? row[acquisitionPriceIndex] : '';
      const currentValue = currentValueIndex !== -1 && row.length > currentValueIndex ? row[currentValueIndex] : '';
      const percentOfAssets = percentOfAssetsIndex !== -1 && row.length > percentOfAssetsIndex ? row[percentOfAssetsIndex] : '';
      
      // Skip if name or ISIN is empty
      if (!name || !isin) {
        continue;
      }
      
      // Add the security
      securities.push({
        name,
        isin,
        quantity,
        acquisitionPrice,
        currentValue,
        percentOfAssets
      });
    }
    
    return securities;
  } catch (error) {
    console.error('Error extracting securities from table:', error);
    return [];
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

/**
 * Extract securities from text
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
    
    // Process each ISIN
    for (const isin of isins) {
      // Find the security name
      const name = findSecurityName(text, isin);
      
      // Skip if we couldn't find a name
      if (!name) {
        continue;
      }
      
      // Find other information
      const quantity = findSecurityQuantity(text, isin, name);
      const acquisitionPrice = findSecurityAcquisitionPrice(text, isin, name);
      const currentValue = findSecurityCurrentValue(text, isin, name);
      const percentOfAssets = findSecurityPercentOfAssets(text, isin, name);
      
      // Add the security
      securities.push({
        name,
        isin,
        quantity,
        acquisitionPrice,
        currentValue,
        percentOfAssets
      });
    }
    
    return securities;
  } catch (error) {
    console.error('Error extracting securities from text:', error);
    return [];
  }
}

/**
 * Find the security name for an ISIN in text
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
    
    // Look for the name before the ISIN
    const beforeIsin = text.substring(Math.max(0, isinIndex - 100), isinIndex).trim();
    
    // Split into lines
    const lines = beforeIsin.split('\n');
    
    // Get the last line
    const lastLine = lines[lines.length - 1].trim();
    
    // If the last line is short, it's probably the name
    if (lastLine.length < 50) {
      return lastLine;
    }
    
    // Otherwise, look for the name in the words before the ISIN
    const words = lastLine.split(/\s+/);
    
    // Get the last few words
    const nameWords = words.slice(Math.max(0, words.length - 5));
    
    return nameWords.join(' ');
  } catch (error) {
    console.error('Error finding security name:', error);
    return '';
  }
}

/**
 * Find the security quantity in text
 * @param {string} text - Document text
 * @param {string} isin - ISIN
 * @param {string} name - Security name
 * @returns {string} - Quantity or empty string if not found
 */
function findSecurityQuantity(text, isin, name) {
  try {
    // Look for quantity near the ISIN or name
    const isinIndex = text.indexOf(isin);
    const nameIndex = text.indexOf(name);
    
    // Skip if ISIN or name not found
    if (isinIndex === -1 || nameIndex === -1) {
      return '';
    }
    
    // Look for quantity keywords
    const quantityKeywords = ['quantity', 'amount', 'shares'];
    
    for (const keyword of quantityKeywords) {
      const keywordIndex = text.indexOf(keyword, Math.min(isinIndex, nameIndex));
      
      // Skip if keyword not found
      if (keywordIndex === -1) {
        continue;
      }
      
      // Look for a number after the keyword
      const afterKeyword = text.substring(keywordIndex + keyword.length, keywordIndex + keyword.length + 50);
      const numberMatch = afterKeyword.match(/[0-9,]+/);
      
      if (numberMatch) {
        return numberMatch[0];
      }
    }
    
    return '';
  } catch (error) {
    console.error('Error finding security quantity:', error);
    return '';
  }
}

/**
 * Find the security acquisition price in text
 * @param {string} text - Document text
 * @param {string} isin - ISIN
 * @param {string} name - Security name
 * @returns {string} - Acquisition price or empty string if not found
 */
function findSecurityAcquisitionPrice(text, isin, name) {
  try {
    // Look for acquisition price near the ISIN or name
    const isinIndex = text.indexOf(isin);
    const nameIndex = text.indexOf(name);
    
    // Skip if ISIN or name not found
    if (isinIndex === -1 || nameIndex === -1) {
      return '';
    }
    
    // Look for acquisition price keywords
    const acquisitionPriceKeywords = ['acquisition price', 'purchase price', 'cost', 'buy price'];
    
    for (const keyword of acquisitionPriceKeywords) {
      const keywordIndex = text.indexOf(keyword, Math.min(isinIndex, nameIndex));
      
      // Skip if keyword not found
      if (keywordIndex === -1) {
        continue;
      }
      
      // Look for a price after the keyword
      const afterKeyword = text.substring(keywordIndex + keyword.length, keywordIndex + keyword.length + 50);
      const priceMatch = afterKeyword.match(/[$€£¥]?[0-9,.]+/);
      
      if (priceMatch) {
        return priceMatch[0];
      }
    }
    
    return '';
  } catch (error) {
    console.error('Error finding security acquisition price:', error);
    return '';
  }
}

/**
 * Find the security current value in text
 * @param {string} text - Document text
 * @param {string} isin - ISIN
 * @param {string} name - Security name
 * @returns {string} - Current value or empty string if not found
 */
function findSecurityCurrentValue(text, isin, name) {
  try {
    // Look for current value near the ISIN or name
    const isinIndex = text.indexOf(isin);
    const nameIndex = text.indexOf(name);
    
    // Skip if ISIN or name not found
    if (isinIndex === -1 || nameIndex === -1) {
      return '';
    }
    
    // Look for current value keywords
    const currentValueKeywords = ['current value', 'market value', 'value', 'price'];
    
    for (const keyword of currentValueKeywords) {
      const keywordIndex = text.indexOf(keyword, Math.min(isinIndex, nameIndex));
      
      // Skip if keyword not found
      if (keywordIndex === -1) {
        continue;
      }
      
      // Look for a price after the keyword
      const afterKeyword = text.substring(keywordIndex + keyword.length, keywordIndex + keyword.length + 50);
      const priceMatch = afterKeyword.match(/[$€£¥]?[0-9,.]+/);
      
      if (priceMatch) {
        return priceMatch[0];
      }
    }
    
    return '';
  } catch (error) {
    console.error('Error finding security current value:', error);
    return '';
  }
}

/**
 * Find the security percent of assets in text
 * @param {string} text - Document text
 * @param {string} isin - ISIN
 * @param {string} name - Security name
 * @returns {string} - Percent of assets or empty string if not found
 */
function findSecurityPercentOfAssets(text, isin, name) {
  try {
    // Look for percent of assets near the ISIN or name
    const isinIndex = text.indexOf(isin);
    const nameIndex = text.indexOf(name);
    
    // Skip if ISIN or name not found
    if (isinIndex === -1 || nameIndex === -1) {
      return '';
    }
    
    // Look for percent of assets keywords
    const percentOfAssetsKeywords = ['% of assets', 'percent of assets', 'allocation', 'weight'];
    
    for (const keyword of percentOfAssetsKeywords) {
      const keywordIndex = text.indexOf(keyword, Math.min(isinIndex, nameIndex));
      
      // Skip if keyword not found
      if (keywordIndex === -1) {
        continue;
      }
      
      // Look for a percentage after the keyword
      const afterKeyword = text.substring(keywordIndex + keyword.length, keywordIndex + keyword.length + 50);
      const percentMatch = afterKeyword.match(/[0-9,.]+%/);
      
      if (percentMatch) {
        return percentMatch[0];
      }
    }
    
    return '';
  } catch (error) {
    console.error('Error finding security percent of assets:', error);
    return '';
  }
}

module.exports = {
  extractSecurities
};
