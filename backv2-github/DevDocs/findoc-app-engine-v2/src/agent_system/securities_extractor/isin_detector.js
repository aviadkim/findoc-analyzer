/**
 * ISIN Detector Module
 * 
 * This module provides functions for detecting and validating ISINs in text.
 */

/**
 * Detect ISINs in text
 * @param {string} text - Text to search for ISINs
 * @returns {Array<object>} Detected ISINs with context
 */
const detectISINs = (text) => {
  try {
    console.log('Detecting ISINs in text');
    
    // ISIN pattern: 2 letters followed by 10 characters (letters or digits)
    const isinPattern = /\b([A-Z]{2}[A-Z0-9]{10})\b/g;
    
    // Find all matches
    const matches = [];
    let match;
    
    while ((match = isinPattern.exec(text)) !== null) {
      const isin = match[1];
      
      // Validate ISIN
      if (validateISIN(isin)) {
        // Get context (text around the ISIN)
        const contextStart = Math.max(0, match.index - 50);
        const contextEnd = Math.min(text.length, match.index + isin.length + 50);
        const context = text.substring(contextStart, contextEnd);
        
        matches.push({
          isin,
          index: match.index,
          context,
          valid: true
        });
      }
    }
    
    return matches;
  } catch (error) {
    console.error('Error detecting ISINs:', error);
    return [];
  }
};

/**
 * Validate an ISIN
 * @param {string} isin - ISIN to validate
 * @returns {boolean} Whether the ISIN is valid
 */
const validateISIN = (isin) => {
  try {
    // Check length
    if (isin.length !== 12) {
      return false;
    }
    
    // Check country code (first 2 characters)
    const countryCode = isin.substring(0, 2);
    if (!/^[A-Z]{2}$/.test(countryCode)) {
      return false;
    }
    
    // Check characters (letters and digits)
    if (!/^[A-Z0-9]+$/.test(isin)) {
      return false;
    }
    
    // Check checksum
    return validateISINChecksum(isin);
  } catch (error) {
    console.error('Error validating ISIN:', error);
    return false;
  }
};

/**
 * Validate ISIN checksum
 * @param {string} isin - ISIN to validate
 * @returns {boolean} Whether the checksum is valid
 */
const validateISINChecksum = (isin) => {
  try {
    // Convert letters to numbers (A=10, B=11, ..., Z=35)
    let digits = '';
    
    for (let i = 0; i < isin.length; i++) {
      const char = isin.charAt(i);
      
      if (/[0-9]/.test(char)) {
        digits += char;
      } else {
        // Convert letter to number (A=10, B=11, ..., Z=35)
        const code = char.charCodeAt(0) - 'A'.charCodeAt(0) + 10;
        digits += code.toString();
      }
    }
    
    // Apply Luhn algorithm
    let sum = 0;
    let double = false;
    
    // Start from the right
    for (let i = digits.length - 1; i >= 0; i--) {
      let digit = parseInt(digits.charAt(i), 10);
      
      if (double) {
        digit *= 2;
        
        if (digit > 9) {
          digit -= 9;
        }
      }
      
      sum += digit;
      double = !double;
    }
    
    return sum % 10 === 0;
  } catch (error) {
    console.error('Error validating ISIN checksum:', error);
    return false;
  }
};

/**
 * Extract security information for an ISIN
 * @param {string} isin - ISIN to extract information for
 * @param {string} context - Text context around the ISIN
 * @returns {object} Security information
 */
const extractSecurityInfo = (isin, context) => {
  try {
    console.log(`Extracting security information for ISIN: ${isin}`);
    
    // Extract security name
    const namePattern = new RegExp(`([\\w\\s\\-\\&\\.\\,]{3,50})\\s+(?:${isin}|near\\s+${isin})`, 'i');
    const nameMatch = context.match(namePattern);
    const name = nameMatch ? nameMatch[1].trim() : null;
    
    // Extract quantity
    const quantityPattern = /(\d{1,3}(?:,\d{3})*(?:\.\d+)?)\s+(?:shares|units|stocks)/i;
    const quantityMatch = context.match(quantityPattern);
    const quantity = quantityMatch ? parseFloat(quantityMatch[1].replace(/,/g, '')) : null;
    
    // Extract price
    const pricePattern = /(?:price|value|cost|nav)(?:\s+per\s+(?:share|unit))?\s*(?:of|:|\s)\s*(?:USD|EUR|GBP|JPY|CHF|CAD|AUD|NZD|\$|€|£|¥|₣)?\s*(\d{1,3}(?:,\d{3})*(?:\.\d+)?)/i;
    const priceMatch = context.match(pricePattern);
    const price = priceMatch ? parseFloat(priceMatch[1].replace(/,/g, '')) : null;
    
    // Extract currency
    const currencyPattern = /(USD|EUR|GBP|JPY|CHF|CAD|AUD|NZD|\$|€|£|¥|₣)/i;
    const currencyMatch = context.match(currencyPattern);
    let currency = currencyMatch ? currencyMatch[1].toUpperCase() : null;
    
    // Convert currency symbols to codes
    const currencyMap = {
      '$': 'USD',
      '€': 'EUR',
      '£': 'GBP',
      '¥': 'JPY',
      '₣': 'CHF'
    };
    
    if (currency && currencyMap[currency]) {
      currency = currencyMap[currency];
    }
    
    // Extract type
    const typePattern = /(equity|stock|bond|fund|etf|option|future|warrant|certificate|note)/i;
    const typeMatch = context.match(typePattern);
    const type = typeMatch ? typeMatch[1].charAt(0).toUpperCase() + typeMatch[1].slice(1).toLowerCase() : null;
    
    return {
      isin,
      name,
      quantity,
      price,
      currency,
      type,
      value: quantity && price ? quantity * price : null
    };
  } catch (error) {
    console.error('Error extracting security information:', error);
    
    return {
      isin,
      name: null,
      quantity: null,
      price: null,
      currency: null,
      type: null,
      value: null
    };
  }
};

/**
 * Get country information for an ISIN
 * @param {string} isin - ISIN to get country information for
 * @returns {object} Country information
 */
const getISINCountryInfo = (isin) => {
  try {
    // Extract country code (first 2 characters)
    const countryCode = isin.substring(0, 2);
    
    // Country code to country name mapping
    const countryMap = {
      'US': { name: 'United States', region: 'North America' },
      'GB': { name: 'United Kingdom', region: 'Europe' },
      'DE': { name: 'Germany', region: 'Europe' },
      'FR': { name: 'France', region: 'Europe' },
      'JP': { name: 'Japan', region: 'Asia' },
      'CH': { name: 'Switzerland', region: 'Europe' },
      'CA': { name: 'Canada', region: 'North America' },
      'AU': { name: 'Australia', region: 'Oceania' },
      'NZ': { name: 'New Zealand', region: 'Oceania' },
      'CN': { name: 'China', region: 'Asia' },
      'HK': { name: 'Hong Kong', region: 'Asia' },
      'SG': { name: 'Singapore', region: 'Asia' },
      'IN': { name: 'India', region: 'Asia' },
      'BR': { name: 'Brazil', region: 'South America' },
      'MX': { name: 'Mexico', region: 'North America' },
      'ZA': { name: 'South Africa', region: 'Africa' },
      'RU': { name: 'Russia', region: 'Europe' },
      'IT': { name: 'Italy', region: 'Europe' },
      'ES': { name: 'Spain', region: 'Europe' },
      'NL': { name: 'Netherlands', region: 'Europe' },
      'SE': { name: 'Sweden', region: 'Europe' },
      'DK': { name: 'Denmark', region: 'Europe' },
      'NO': { name: 'Norway', region: 'Europe' },
      'FI': { name: 'Finland', region: 'Europe' },
      'IE': { name: 'Ireland', region: 'Europe' },
      'BE': { name: 'Belgium', region: 'Europe' },
      'LU': { name: 'Luxembourg', region: 'Europe' },
      'AT': { name: 'Austria', region: 'Europe' },
      'PT': { name: 'Portugal', region: 'Europe' },
      'GR': { name: 'Greece', region: 'Europe' }
    };
    
    return countryMap[countryCode] || { name: 'Unknown', region: 'Unknown' };
  } catch (error) {
    console.error('Error getting ISIN country information:', error);
    return { name: 'Unknown', region: 'Unknown' };
  }
};

module.exports = {
  detectISINs,
  validateISIN,
  extractSecurityInfo,
  getISINCountryInfo
};
