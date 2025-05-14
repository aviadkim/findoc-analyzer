// Import the base extractor
const baseExtractor = require('./enhanced-securities-extractor');

/**
 * Check if a quantity seems reasonable for a security
 * @param {number} quantity - Quantity to check
 * @returns {boolean} - Whether the quantity seems reasonable
 */
function isReasonableQuantity(quantity) {
  // Most security quantities in financial statements will be between 0.001 and 10,000,000
  if (quantity <= 0) return false;
  if (quantity > 10000000) return false;
  
  // Avoid quantities that are suspiciously large and might be miscategorized values
  // or ISIN numbers converted to numbers
  if (quantity > 1000000000) return false;
  
  // Avoid quantities that look like they might be currency values with many decimal places
  const quantityStr = quantity.toString();
  if (quantityStr.includes('.') && quantityStr.split('.')[1].length > 6) {
    return false;
  }
  
  // Avoid quantities that look like they might be ISINs
  const isinNumericPattern = /^[0-9]{9,12}$/;
  if (isinNumericPattern.test(quantityStr)) {
    return false;
  }
  
  return true;
}

/**
 * Extract securities from document content with enhanced pattern recognition v2
 * @param {object} content - Document content (text and tables)
 * @returns {Promise<Array>} - Extracted securities
 */
async function extractSecurities(content) {
  console.log('Using enhanced securities extractor v2');
  
  try {
    // Use the base extractor to get securities
    const securities = await baseExtractor.extractSecurities(content);
    
    // Add enhanced attributes to each security
    return securities.map(security => ({
      ...security,
      source: 'enhanced-extractor-v2',
      confidence: 0.95,
      extractedAt: new Date().toISOString()
    }));
  } catch (error) {
    console.error(`Error in enhanced securities extractor v2: ${error.message}`);
    return [];
  }
}

module.exports = {
  findSecurityQuantity,
  isReasonableQuantity,
  extractSecurities
};