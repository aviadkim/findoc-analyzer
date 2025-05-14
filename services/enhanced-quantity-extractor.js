/**
 * Enhanced Quantity Extractor
 * 
 * Provides improved extraction of security quantities from financial documents
 * with confidence-based pattern matching, cross-validation, and reasonableness checks.
 */

/**
 * Extract quantity from text with enhanced pattern recognition
 * @param {string} text - Document text
 * @param {string} isin - ISIN code
 * @param {string} name - Security name
 * @param {number|null} value - Security value if already found
 * @param {number|null} price - Security price if already found
 * @returns {number|null} - Extracted quantity or null if not found
 */
function extractQuantity(text, isin, name, value = null, price = null) {
  try {
    // If we have price and value, calculate expected quantity
    let calculatedQuantity = null;
    if (price !== null && price > 0 && value !== null) {
      calculatedQuantity = value / price;
    }
    
    // Collect potential quantities with confidence scores
    const candidates = [];
    
    // Step 1: Try patterns specifically designed for quantity extraction
    const patternResults = tryQuantityPatterns(text, isin, name);
    candidates.push(...patternResults);
    
    // Step 2: Look for quantities near relevant indicators
    const indicatorResults = findQuantitiesNearIndicators(text);
    candidates.push(...indicatorResults);
    
    // Step 3: Look for European format quantities
    const europeanResults = findEuropeanFormats(text);
    candidates.push(...europeanResults);
    
    // Step 4: Special case for lot sizes mentioned explicitly
    const lotSizeResults = findLotSizeMultipliers(text, candidates);
    candidates.push(...lotSizeResults);
    
    // Process collected candidates if any were found
    if (candidates.length > 0) {
      // Sort by confidence (highest first)
      candidates.sort((a, b) => b.confidence - a.confidence);
      
      // Check if calculated quantity is available for validation
      if (calculatedQuantity !== null) {
        // Try to find a direct match
        const directMatch = candidates.find(c => {
          const ratio = c.quantity / calculatedQuantity;
          return ratio >= 0.9 && ratio <= 1.1;
        });
        
        if (directMatch) {
          return directMatch.quantity;
        }
        
        // Try to find a match with common lot size multipliers
        const lotSizes = [10, 100, 1000];
        for (const candidate of candidates) {
          for (const lotSize of lotSizes) {
            const adjustedQuantity = candidate.quantity * lotSize;
            const ratio = adjustedQuantity / calculatedQuantity;
            if (ratio >= 0.9 && ratio <= 1.1) {
              return adjustedQuantity;
            }
          }
        }
        
        // If no match was found and we're confident in price & value,
        // use the calculated quantity (it's likely more accurate)
        if (isReasonableQuantity(calculatedQuantity)) {
          return Math.round(calculatedQuantity * 100) / 100; // Round to 2 decimal places
        }
      }
      
      // If no calculated quantity or no match, use highest confidence extraction
      return candidates[0].quantity;
    }
    
    // If we have price and value but couldn't extract quantity, calculate it
    if (calculatedQuantity !== null && isReasonableQuantity(calculatedQuantity)) {
      return Math.round(calculatedQuantity * 100) / 100;
    }
    
    return null;
  } catch (error) {
    console.error('Error extracting quantity:', error);
    return null;
  }
}

/**
 * Try quantity patterns on text
 * @param {string} text - Document text
 * @param {string} isin - ISIN code
 * @param {string} name - Security name
 * @returns {Array} - Extracted quantities with confidence scores
 */
function tryQuantityPatterns(text, isin, name) {
  const results = [];
  
  // Patterns organized by confidence level
  const patterns = [
    // === High Confidence Patterns (explicit quantity labels) ===
    {
      pattern: /quantity\s*:?\s*(\d[\d\,\'\`\.\s]*\d|\d)\s*(?:shares?|units?|pieces?|pcs\.?)/i,
      confidence: 0.95
    },
    {
      pattern: /(?:number|no\.|num\.)\s+of\s+shares\s*:?\s*(\d[\d\,\'\`\.\s]*\d|\d)/i,
      confidence: 0.95
    },
    {
      pattern: /shares\s*:?\s*(\d[\d\,\'\`\.\s]*\d|\d)\b/i,
      confidence: 0.90
    },
    
    // === Medium-High Confidence Patterns ===
    {
      pattern: /holding\s*:?\s*(\d[\d\,\'\`\.\s]*\d|\d)\s*(?:shares?|units?|pieces?|pcs\.?)/i,
      confidence: 0.87
    },
    {
      pattern: /position\s*:?\s*(\d[\d\,\'\`\.\s]*\d|\d)\s*(?:shares?|units?|pieces?|pcs\.?)/i,
      confidence: 0.87
    },
    {
      pattern: /(\d[\d\,\'\`\.\s]*\d|\d)\s*(?:shares?|units?|pieces?|pcs\.?)\b/i,
      confidence: 0.85
    },
    
    // === Medium Confidence Patterns ===
    {
      pattern: /\((\d[\d\,\'\`\.\s]*\d|\d)\s*(?:shares?|units?|pieces?|pcs\.?)\)/i,
      confidence: 0.80
    },
    {
      pattern: /(?:contains|has|with)\s+(\d[\d\,\'\`\.\s]*\d|\d)\s+(?:shares?|units?|pieces?|pcs\.?)/i,
      confidence: 0.80
    },
    
    // === Lower Confidence Patterns ===
    {
      pattern: /\((\d[\d\,\'\`\.\s]*\d|\d)\)/i,
      confidence: 0.70
    }
  ];
  
  // Add ISIN-specific pattern if ISIN is provided
  if (isin) {
    patterns.push({
      pattern: new RegExp(isin + "[\\s\\:\\-]*([\\d\\,\\'\\`\\.\\s]+)", 'i'),
      confidence: 0.65
    });
  }
  
  // Try each pattern
  for (const { pattern, confidence } of patterns) {
    const matches = [...text.matchAll(new RegExp(pattern, 'g'))];
    
    for (const match of matches) {
      const rawQuantity = match[1];
      // Handle both US and European formats
      const clean = cleanNumberFormat(rawQuantity);
      const number = parseFloat(clean);
      
      if (!isNaN(number) && number > 0 && isReasonableQuantity(number)) {
        results.push({
          quantity: number,
          confidence,
          source: 'pattern',
          pattern: pattern.toString().substring(0, 30) + '...'
        });
      }
    }
  }
  
  return results;
}

/**
 * Find quantities near quantity indicators
 * @param {string} text - Document text
 * @returns {Array} - Extracted quantities with confidence scores
 */
function findQuantitiesNearIndicators(text) {
  const results = [];
  const quantityIndicators = [
    'shares', 'units', 'quantity', 'holding', 'position', 
    'pieces', 'pcs', 'qty', 'volume', 'amount'
  ];
  
  for (const indicator of quantityIndicators) {
    // Find all occurrences of the indicator
    let startIndex = 0;
    let indicatorIndex;
    
    while ((indicatorIndex = text.toLowerCase().indexOf(indicator, startIndex)) !== -1) {
      // Define a context window around the indicator
      const contextStart = Math.max(0, indicatorIndex - 40);
      const contextEnd = Math.min(text.length, indicatorIndex + indicator.length + 60);
      const context = text.substring(contextStart, contextEnd);
      
      // Try different number patterns
      const numberPatterns = [
        /(\d[\d\,\'\`\.\s]*\.\d+)/g, // Decimal number
        /(\d[\d\,\'\`\.\s]+)(?!\.\d)/g, // Whole number with separators
        /(\d+)(?!\.\d)/g // Simple whole number
      ];
      
      for (const pattern of numberPatterns) {
        const matches = [...context.matchAll(pattern)];
        
        for (const match of matches) {
          const rawQuantity = match[1];
          const clean = cleanNumberFormat(rawQuantity);
          const number = parseFloat(clean);
          
          if (!isNaN(number) && number > 0 && isReasonableQuantity(number)) {
            // Calculate position in context
            const matchPositionInContext = match.index;
            const indicatorPositionInContext = context.toLowerCase().indexOf(indicator);
            
            // Calculate proximity score - closer is better
            const distance = Math.abs(matchPositionInContext - indicatorPositionInContext);
            const maxDistance = 50; // Maximum reasonable distance to consider
            const proximityScore = Math.max(0, 1 - (distance / maxDistance));
            
            // Numbers before indicators are often quantities
            const isBeforeIndicator = matchPositionInContext < indicatorPositionInContext;
            const positionModifier = isBeforeIndicator ? 1.2 : 0.8;
            
            // Calculate final confidence score
            const baseConfidence = 0.75; // Base confidence for indicator-based matching
            const finalConfidence = baseConfidence * proximityScore * positionModifier;
            
            // Make sure number isn't just part of the ISIN
            if (proximityScore > 0.3 && !text.includes(`${rawQuantity}${indicator}`)) {
              results.push({
                quantity: number,
                confidence: finalConfidence,
                source: 'indicator',
                indicator,
                distance,
                position: isBeforeIndicator ? 'before' : 'after'
              });
            }
          }
        }
      }
      
      startIndex = indicatorIndex + 1; // Move past this occurrence
    }
  }
  
  return results;
}

/**
 * Find European format quantities
 * @param {string} text - Document text
 * @returns {Array} - Extracted quantities with confidence scores
 */
function findEuropeanFormats(text) {
  const results = [];
  
  // European format patterns
  const europeanPatterns = [
    // Format: 1.234,56
    {
      pattern: /(\d{1,3}(?:\.\d{3})+\,\d{1,3})\s*(?:shares?|units?|pieces?|pcs\.?)/i,
      confidence: 0.90
    },
    // Format: 1.234,56 without unit specifier
    {
      pattern: /(\d{1,3}(?:\.\d{3})+\,\d{1,3})/g,
      confidence: 0.75
    },
    // Swiss format: 1'234.56
    {
      pattern: /(\d{1,3}(?:'\d{3})+(?:\.\d{1,3})?)\s*(?:shares?|units?|pieces?|pcs\.?)/i,
      confidence: 0.90
    },
    // Swiss format without unit specifier
    {
      pattern: /(\d{1,3}(?:'\d{3})+(?:\.\d{1,3})?)/g,
      confidence: 0.75
    }
  ];
  
  // Try each pattern
  for (const { pattern, confidence } of europeanPatterns) {
    const matches = [...text.matchAll(new RegExp(pattern, 'g'))];
    
    for (const match of matches) {
      const rawQuantity = match[1];
      // Special handling for European formats
      const number = parseEuropeanFormat(rawQuantity);
      
      if (!isNaN(number) && number > 0 && isReasonableQuantity(number)) {
        results.push({
          quantity: number,
          confidence,
          source: 'european',
          format: rawQuantity
        });
      }
    }
  }
  
  return results;
}

/**
 * Find lot size multipliers
 * @param {string} text - Document text
 * @param {Array} existingCandidates - Existing quantity candidates
 * @returns {Array} - Additional quantities with lot size adjustments
 */
function findLotSizeMultipliers(text, existingCandidates) {
  const results = [];
  
  // Look for lot size mentions
  const lotSizePatterns = [
    /lot\s*size\s*:?\s*(\d[\d\,\'\`\.\s]*\d|\d)/i,
    /lot\s*:?\s*(\d[\d\,\'\`\.\s]*\d|\d)/i,
    /contract\s*size\s*:?\s*(\d[\d\,\'\`\.\s]*\d|\d)/i,
    /multiplier\s*:?\s*(\d[\d\,\'\`\.\s]*\d|\d)/i
  ];
  
  for (const pattern of lotSizePatterns) {
    const match = text.match(pattern);
    if (match) {
      const rawLotSize = match[1];
      const clean = cleanNumberFormat(rawLotSize);
      const lotSize = parseFloat(clean);
      
      if (!isNaN(lotSize) && lotSize > 0) {
        // Apply lot size to existing candidates
        for (const candidate of existingCandidates) {
          const adjustedQuantity = candidate.quantity * lotSize;
          if (isReasonableQuantity(adjustedQuantity)) {
            results.push({
              quantity: adjustedQuantity,
              confidence: candidate.confidence * 0.9, // Slightly lower confidence for lot size adjustments
              source: 'lotsize',
              originalQuantity: candidate.quantity,
              lotSize
            });
          }
        }
      }
    }
  }
  
  return results;
}

/**
 * Clean and normalize a number string
 * @param {string} str - Number string to clean
 * @returns {string} - Cleaned number string ready to parse
 */
function cleanNumberFormat(str) {
  if (!str) return '';
  
  // Remove non-numeric chars except for decimal points and separators
  let clean = str.replace(/[^\d\.\,\']/g, '');
  
  // Detect format (US, European, or Swiss)
  if (clean.includes(',') && clean.includes('.')) {
    // Determine which is the decimal separator based on position
    const lastComma = clean.lastIndexOf(',');
    const lastDot = clean.lastIndexOf('.');
    
    if (lastComma > lastDot) {
      // European format: 1.234,56
      // Convert to US format for parsing
      return clean.replace(/\./g, '').replace(',', '.');
    } else {
      // US format: 1,234.56
      return clean.replace(/,/g, '');
    }
  } else if (clean.includes("'")) {
    // Swiss format: 1'234.56
    return clean.replace(/'/g, '');
  } else if (clean.includes(',') && !clean.includes('.')) {
    // Check if comma is likely a decimal separator
    const commaIndex = clean.lastIndexOf(',');
    const digitsAfterComma = clean.length - commaIndex - 1;
    
    if (digitsAfterComma > 0 && digitsAfterComma <= 4) {
      // Likely European decimal format
      return clean.replace(',', '.');
    } else {
      // Likely thousand separator format
      return clean.replace(/,/g, '');
    }
  }
  
  return clean;
}

/**
 * Parse European format number
 * @param {string} str - European format number string
 * @returns {number} - Parsed number
 */
function parseEuropeanFormat(str) {
  if (!str) return NaN;
  
  if (str.includes('.') && str.includes(',')) {
    // Standard European format: 1.234,56
    const cleaned = str.replace(/\./g, '').replace(',', '.');
    return parseFloat(cleaned);
  } else if (str.includes("'")) {
    // Swiss format: 1'234.56 or 1'234,56
    let cleaned = str.replace(/'/g, '');
    if (cleaned.includes(',')) {
      cleaned = cleaned.replace(',', '.');
    }
    return parseFloat(cleaned);
  }
  
  return parseFloat(str.replace(',', '.'));
}

/**
 * Check if a quantity seems reasonable
 * @param {number} quantity - Quantity to check
 * @returns {boolean} - True if quantity seems reasonable
 */
function isReasonableQuantity(quantity) {
  // Basic range check
  if (quantity <= 0) return false;
  if (quantity > 10000000) return false; // 10 million shares is usually max for retail investors
  
  // Check for suspiciously large numbers that might be misinterpreted
  if (quantity > 1000000000) return false;
  
  // Check decimal places - quantities usually have 0-6 decimal places max
  const quantityStr = quantity.toString();
  if (quantityStr.includes('.')) {
    const decimalPlaces = quantityStr.split('.')[1].length;
    if (decimalPlaces > 6) return false;
  }
  
  // Avoid ISIN-like numbers
  const isinPattern = /^[0-9]{9,12}$/;
  if (isinPattern.test(quantityStr)) return false;
  
  return true;
}

module.exports = {
  extractQuantity,
  isReasonableQuantity,
  cleanNumberFormat,
  parseEuropeanFormat
};