/**
 * Asset Allocation Extractor
 * 
 * This module extracts asset allocation information from financial PDFs.
 */

/**
 * Extract asset allocation from tables and text
 * @param {Array} tables - Extracted tables
 * @param {string} text - Full text content of the PDF
 * @returns {object} - Extracted asset allocation
 */
function extractAssetAllocation(tables, text) {
  console.log('Extracting asset allocation information...');
  
  // Initialize asset allocation
  const assetAllocation = {
    categories: [],
    total: 0
  };
  
  // Try to extract asset allocation from tables
  const allocationFromTables = extractAssetAllocationFromTables(tables);
  
  if (allocationFromTables.categories.length > 0) {
    return allocationFromTables;
  }
  
  // If no asset allocation found in tables, try to extract from text
  const allocationFromText = extractAssetAllocationFromText(text);
  
  if (allocationFromText.categories.length > 0) {
    return allocationFromText;
  }
  
  // If still no asset allocation found, try to infer from securities
  const allocationFromSecurities = inferAssetAllocationFromSecurities(tables, text);
  
  if (allocationFromSecurities.categories.length > 0) {
    return allocationFromSecurities;
  }
  
  return assetAllocation;
}

/**
 * Extract asset allocation from tables
 * @param {Array} tables - Extracted tables
 * @returns {object} - Extracted asset allocation
 */
function extractAssetAllocationFromTables(tables) {
  const assetAllocation = {
    categories: [],
    total: 0
  };
  
  // Find asset allocation tables
  const allocationTables = tables.filter(table => {
    const title = table.title ? table.title.toLowerCase() : '';
    const headers = table.headers.map(h => h.toLowerCase());
    
    return (
      title.includes('asset') && title.includes('allocation') ||
      title.includes('portfolio') && title.includes('allocation') ||
      headers.some(h => h.includes('asset') || h.includes('class')) &&
      headers.some(h => h.includes('allocation') || h.includes('weight') || h.includes('percentage') || h.includes('%'))
    );
  });
  
  if (allocationTables.length === 0) {
    return assetAllocation;
  }
  
  // Use the first allocation table
  const table = allocationTables[0];
  
  // Determine column indices
  const categoryColIndex = findColumnIndex(table.headers, [
    'asset', 'class', 'category', 'type'
  ]);
  
  const percentColIndex = findColumnIndex(table.headers, [
    'allocation', 'weight', 'percentage', '%'
  ]);
  
  const valueColIndex = findColumnIndex(table.headers, [
    'value', 'amount', 'balance', 'market', 'total'
  ]);
  
  // Extract categories
  if (categoryColIndex !== -1 && (percentColIndex !== -1 || valueColIndex !== -1)) {
    for (const row of table.rows) {
      // Skip rows that don't have enough columns
      if (row.length <= categoryColIndex) {
        continue;
      }
      
      const category = row[categoryColIndex].trim();
      
      // Skip empty categories and total rows
      if (!category || category.toLowerCase().includes('total')) {
        continue;
      }
      
      const percentage = percentColIndex !== -1 && percentColIndex < row.length ? 
                        parsePercentage(row[percentColIndex]) : 
                        null;
      
      const value = valueColIndex !== -1 && valueColIndex < row.length ? 
                   parseAmount(row[valueColIndex]) : 
                   null;
      
      assetAllocation.categories.push({
        name: category,
        percentage,
        value
      });
    }
    
    // Calculate total
    if (valueColIndex !== -1) {
      assetAllocation.total = assetAllocation.categories.reduce((sum, cat) => sum + (cat.value || 0), 0);
    }
  }
  
  return assetAllocation;
}

/**
 * Extract asset allocation from text
 * @param {string} text - Full text content of the PDF
 * @returns {object} - Extracted asset allocation
 */
function extractAssetAllocationFromText(text) {
  const assetAllocation = {
    categories: [],
    total: 0
  };
  
  // Look for asset allocation section
  const assetAllocationMatch = text.match(/Asset\s+Allocation.*?(?=\n\n|\n[A-Z]|$)/s);
  
  if (!assetAllocationMatch) {
    return assetAllocation;
  }
  
  const assetAllocationText = assetAllocationMatch[0];
  
  // Look for asset classes and percentages
  const assetClassMatches = [...assetAllocationText.matchAll(/([A-Za-z\s]+)(?:\s+|:)(\d+(?:\.\d+)?)%(?:\s+|\$|€|£|¥)?(?:\$|€|£|¥)?([0-9,.]+)?/g)];
  
  if (assetClassMatches.length > 0) {
    for (const match of assetClassMatches) {
      const name = match[1].trim();
      const percentage = parseFloat(match[2]);
      const value = match[3] ? parseAmount(match[3]) : null;
      
      assetAllocation.categories.push({
        name,
        percentage,
        value
      });
    }
    
    // Calculate total
    assetAllocation.total = assetAllocation.categories.reduce((sum, cat) => sum + (cat.value || 0), 0);
  } else {
    // Try another pattern: asset class followed by percentage
    const simpleAssetClassMatches = [...assetAllocationText.matchAll(/([A-Za-z\s]+)(?:\s+|:)(\d+(?:\.\d+)?)%/g)];
    
    if (simpleAssetClassMatches.length > 0) {
      for (const match of simpleAssetClassMatches) {
        const name = match[1].trim();
        const percentage = parseFloat(match[2]);
        
        assetAllocation.categories.push({
          name,
          percentage,
          value: null
        });
      }
    }
  }
  
  return assetAllocation;
}

/**
 * Infer asset allocation from securities
 * @param {Array} tables - Extracted tables
 * @param {string} text - Full text content of the PDF
 * @returns {object} - Inferred asset allocation
 */
function inferAssetAllocationFromSecurities(tables, text) {
  const assetAllocation = {
    categories: [],
    total: 0
  };
  
  // Find securities tables
  const securitiesTables = tables.filter(table => {
    const title = table.title ? table.title.toLowerCase() : '';
    const headers = table.headers.map(h => h.toLowerCase());
    
    return (
      title.includes('securities') || 
      title.includes('holdings') || 
      title.includes('positions') || 
      title.includes('investments') || 
      title.includes('portfolio') ||
      headers.some(h => 
        h.includes('security') || 
        h.includes('holding') || 
        h.includes('position') || 
        h.includes('instrument') ||
        h.includes('name') ||
        h.includes('isin')
      )
    );
  });
  
  if (securitiesTables.length === 0) {
    return assetAllocation;
  }
  
  // Use the first securities table
  const table = securitiesTables[0];
  
  // Determine column indices
  const typeColIndex = findColumnIndex(table.headers, [
    'type', 'asset', 'class', 'category'
  ]);
  
  const valueColIndex = findColumnIndex(table.headers, [
    'value', 'amount', 'balance', 'market', 'total'
  ]);
  
  // If we don't have a type column, we can't infer asset allocation
  if (typeColIndex === -1) {
    return assetAllocation;
  }
  
  // Group securities by type
  const typeGroups = {};
  let totalValue = 0;
  
  for (const row of table.rows) {
    // Skip rows that don't have enough columns
    if (row.length <= typeColIndex) {
      continue;
    }
    
    const type = row[typeColIndex].trim();
    
    // Skip empty types and total rows
    if (!type || type.toLowerCase().includes('total')) {
      continue;
    }
    
    // Get value
    const value = valueColIndex !== -1 && valueColIndex < row.length ? 
                 parseAmount(row[valueColIndex]) : 
                 null;
    
    // Add to group
    if (!typeGroups[type]) {
      typeGroups[type] = {
        count: 0,
        value: 0
      };
    }
    
    typeGroups[type].count++;
    
    if (value !== null) {
      typeGroups[type].value += value;
      totalValue += value;
    }
  }
  
  // Convert groups to categories
  for (const type in typeGroups) {
    const percentage = totalValue > 0 ? 
                      (typeGroups[type].value / totalValue) * 100 : 
                      null;
    
    assetAllocation.categories.push({
      name: type,
      percentage,
      value: typeGroups[type].value
    });
  }
  
  // Sort categories by value
  assetAllocation.categories.sort((a, b) => (b.value || 0) - (a.value || 0));
  
  // Set total
  assetAllocation.total = totalValue;
  
  return assetAllocation;
}

/**
 * Find column index in headers
 * @param {Array} headers - Table headers
 * @param {Array} keywords - Keywords to look for
 * @returns {number} - Column index or -1 if not found
 */
function findColumnIndex(headers, keywords) {
  for (let i = 0; i < headers.length; i++) {
    const header = headers[i].toLowerCase();
    
    if (keywords.some(keyword => header.includes(keyword.toLowerCase()))) {
      return i;
    }
  }
  
  return -1;
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

/**
 * Parse percentage from string
 * @param {string} value - String to parse
 * @returns {number|null} - Parsed percentage or null if parsing failed
 */
function parsePercentage(value) {
  if (!value) return null;
  
  // Remove % symbol
  const cleanValue = value.toString().replace(/%/g, '');
  
  // Try to parse as number
  const number = parseFloat(cleanValue);
  
  return isNaN(number) ? null : number;
}

module.exports = {
  extractAssetAllocation,
  parseAmount,
  parsePercentage
};
