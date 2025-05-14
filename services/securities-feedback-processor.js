/**
 * Securities Feedback Processor
 * This module processes user feedback on securities extraction to improve the algorithm over time
 */

const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Constants
const FEEDBACK_FILE = path.join(__dirname, '../data/securities-feedback.json');
const IMPROVEMENT_DATASET_FILE = path.join(__dirname, '../data/extraction-improvements.json');
const EXTRACTION_RULES_FILE = path.join(__dirname, '../data/extraction-rules.json');

/**
 * Ensure the data directory exists
 */
function ensureDataDirectory() {
  const dataDir = path.join(__dirname, '../data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  
  // Initialize improvement dataset if it doesn't exist
  if (!fs.existsSync(IMPROVEMENT_DATASET_FILE)) {
    fs.writeFileSync(IMPROVEMENT_DATASET_FILE, JSON.stringify([]));
  }
  
  // Initialize extraction rules if they don't exist
  if (!fs.existsSync(EXTRACTION_RULES_FILE)) {
    fs.writeFileSync(EXTRACTION_RULES_FILE, JSON.stringify({
      identifierRules: [],
      nameRules: [],
      typeRules: [],
      quantityRules: [],
      priceRules: [],
      valueRules: [],
      currencyRules: []
    }));
  }
}

/**
 * Load all feedback items
 * @returns {Array} Feedback items
 */
function loadFeedbackItems() {
  ensureDataDirectory();
  
  try {
    if (fs.existsSync(FEEDBACK_FILE)) {
      const data = fs.readFileSync(FEEDBACK_FILE, 'utf8');
      return JSON.parse(data);
    }
    return [];
  } catch (error) {
    console.error('Error loading feedback data:', error);
    return [];
  }
}

/**
 * Load improvement dataset
 * @returns {Array} Improvement dataset
 */
function loadImprovementDataset() {
  ensureDataDirectory();
  
  try {
    if (fs.existsSync(IMPROVEMENT_DATASET_FILE)) {
      const data = fs.readFileSync(IMPROVEMENT_DATASET_FILE, 'utf8');
      return JSON.parse(data);
    }
    return [];
  } catch (error) {
    console.error('Error loading improvement dataset:', error);
    return [];
  }
}

/**
 * Save improvement dataset
 * @param {Array} dataset - Improvement dataset
 * @returns {boolean} Success flag
 */
function saveImprovementDataset(dataset) {
  ensureDataDirectory();
  
  try {
    fs.writeFileSync(IMPROVEMENT_DATASET_FILE, JSON.stringify(dataset, null, 2));
    return true;
  } catch (error) {
    console.error('Error saving improvement dataset:', error);
    return false;
  }
}

/**
 * Load extraction rules
 * @returns {Object} Extraction rules
 */
function loadExtractionRules() {
  ensureDataDirectory();
  
  try {
    if (fs.existsSync(EXTRACTION_RULES_FILE)) {
      const data = fs.readFileSync(EXTRACTION_RULES_FILE, 'utf8');
      return JSON.parse(data);
    }
    return {
      identifierRules: [],
      nameRules: [],
      typeRules: [],
      quantityRules: [],
      priceRules: [],
      valueRules: [],
      currencyRules: []
    };
  } catch (error) {
    console.error('Error loading extraction rules:', error);
    return {
      identifierRules: [],
      nameRules: [],
      typeRules: [],
      quantityRules: [],
      priceRules: [],
      valueRules: [],
      currencyRules: []
    };
  }
}

/**
 * Save extraction rules
 * @param {Object} rules - Extraction rules
 * @returns {boolean} Success flag
 */
function saveExtractionRules(rules) {
  ensureDataDirectory();
  
  try {
    fs.writeFileSync(EXTRACTION_RULES_FILE, JSON.stringify(rules, null, 2));
    return true;
  } catch (error) {
    console.error('Error saving extraction rules:', error);
    return false;
  }
}

/**
 * Add feedback to improvement dataset
 * @param {Object} feedbackItem - Feedback item
 * @returns {boolean} Success flag
 */
function addToImprovementDataset(feedbackItem) {
  // Skip if not fixed or no correction provided
  if (feedbackItem.status !== 'fixed' || !feedbackItem.correctValue) {
    return false;
  }
  
  try {
    // Load existing dataset
    const dataset = loadImprovementDataset();
    
    // Check if this feedback is already in the dataset
    const existingIndex = dataset.findIndex(item => item.feedbackId === feedbackItem.id);
    
    // Create improvement data
    const improvementData = {
      id: existingIndex >= 0 ? dataset[existingIndex].id : uuidv4(),
      feedbackId: feedbackItem.id,
      documentId: feedbackItem.documentId,
      fieldType: feedbackItem.errorType,
      originalValue: getOriginalValue(feedbackItem),
      correctedValue: feedbackItem.correctValue,
      dateAdded: new Date().toISOString()
    };
    
    // Update or add to dataset
    if (existingIndex >= 0) {
      dataset[existingIndex] = improvementData;
    } else {
      dataset.push(improvementData);
    }
    
    // Save updated dataset
    return saveImprovementDataset(dataset);
  } catch (error) {
    console.error('Error adding to improvement dataset:', error);
    return false;
  }
}

/**
 * Helper method to extract the original value from feedback data
 * @param {Object} feedbackItem - The feedback item
 * @returns {string} The original value
 */
function getOriginalValue(feedbackItem) {
  if (!feedbackItem.securityData) return '';
  
  switch (feedbackItem.errorType) {
    case 'wrong-identifier':
      return feedbackItem.securityData.isin || '';
    case 'wrong-name':
      return feedbackItem.securityData.name || '';
    case 'wrong-type':
      return feedbackItem.securityData.type || '';
    case 'wrong-quantity':
      return feedbackItem.securityData.quantity || '';
    case 'wrong-price':
      return feedbackItem.securityData.price || '';
    case 'wrong-value':
      return feedbackItem.securityData.value || '';
    case 'wrong-currency':
      return feedbackItem.securityData.currency || '';
    default:
      return '';
  }
}

/**
 * Update extraction rules based on improvement dataset
 * @returns {boolean} Success flag
 */
function updateExtractionRules() {
  try {
    // Load improvement dataset
    const dataset = loadImprovementDataset();
    
    // Skip if no data
    if (dataset.length === 0) {
      return false;
    }
    
    // Load current rules
    const rules = loadExtractionRules();
    
    // Process dataset by field type
    const identifierImprovements = dataset.filter(item => item.fieldType === 'wrong-identifier');
    const nameImprovements = dataset.filter(item => item.fieldType === 'wrong-name');
    const typeImprovements = dataset.filter(item => item.fieldType === 'wrong-type');
    const quantityImprovements = dataset.filter(item => item.fieldType === 'wrong-quantity');
    const priceImprovements = dataset.filter(item => item.fieldType === 'wrong-price');
    const valueImprovements = dataset.filter(item => item.fieldType === 'wrong-value');
    const currencyImprovements = dataset.filter(item => item.fieldType === 'wrong-currency');
    
    // Update identifier rules
    if (identifierImprovements.length > 0) {
      updateIdentifierRules(rules, identifierImprovements);
    }
    
    // Update name rules
    if (nameImprovements.length > 0) {
      updateNameRules(rules, nameImprovements);
    }
    
    // Update type rules
    if (typeImprovements.length > 0) {
      updateTypeRules(rules, typeImprovements);
    }
    
    // Update quantity rules
    if (quantityImprovements.length > 0) {
      updateQuantityRules(rules, quantityImprovements);
    }
    
    // Update price rules
    if (priceImprovements.length > 0) {
      updatePriceRules(rules, priceImprovements);
    }
    
    // Update value rules
    if (valueImprovements.length > 0) {
      updateValueRules(rules, valueImprovements);
    }
    
    // Update currency rules
    if (currencyImprovements.length > 0) {
      updateCurrencyRules(rules, currencyImprovements);
    }
    
    // Save updated rules
    return saveExtractionRules(rules);
  } catch (error) {
    console.error('Error updating extraction rules:', error);
    return false;
  }
}

/**
 * Update identifier rules
 * @param {Object} rules - Extraction rules
 * @param {Array} improvements - Identifier improvements
 */
function updateIdentifierRules(rules, improvements) {
  improvements.forEach(improvement => {
    // Check if we already have a rule for this pattern
    const ruleIndex = rules.identifierRules.findIndex(rule => 
      rule.pattern === improvement.originalValue || 
      rule.replacement === improvement.correctedValue
    );
    
    // Create or update rule
    const newRule = {
      pattern: improvement.originalValue,
      replacement: improvement.correctedValue,
      confidence: 0.9,
      dateAdded: new Date().toISOString(),
      source: 'user-feedback'
    };
    
    if (ruleIndex >= 0) {
      rules.identifierRules[ruleIndex] = newRule;
    } else {
      rules.identifierRules.push(newRule);
    }
  });
}

/**
 * Update name rules
 * @param {Object} rules - Extraction rules
 * @param {Array} improvements - Name improvements
 */
function updateNameRules(rules, improvements) {
  improvements.forEach(improvement => {
    // Check if we already have a rule for this pattern
    const ruleIndex = rules.nameRules.findIndex(rule => 
      rule.pattern === improvement.originalValue || 
      rule.replacement === improvement.correctedValue
    );
    
    // Create or update rule
    const newRule = {
      pattern: improvement.originalValue,
      replacement: improvement.correctedValue,
      confidence: 0.9,
      dateAdded: new Date().toISOString(),
      source: 'user-feedback'
    };
    
    if (ruleIndex >= 0) {
      rules.nameRules[ruleIndex] = newRule;
    } else {
      rules.nameRules.push(newRule);
    }
  });
}

/**
 * Update type rules
 * @param {Object} rules - Extraction rules
 * @param {Array} improvements - Type improvements
 */
function updateTypeRules(rules, improvements) {
  improvements.forEach(improvement => {
    // Check if we already have a rule for this pattern
    const ruleIndex = rules.typeRules.findIndex(rule => 
      rule.pattern === improvement.originalValue || 
      rule.replacement === improvement.correctedValue
    );
    
    // Create or update rule
    const newRule = {
      pattern: improvement.originalValue,
      replacement: improvement.correctedValue,
      confidence: 0.9,
      dateAdded: new Date().toISOString(),
      source: 'user-feedback'
    };
    
    if (ruleIndex >= 0) {
      rules.typeRules[ruleIndex] = newRule;
    } else {
      rules.typeRules.push(newRule);
    }
  });
}

/**
 * Update quantity rules
 * @param {Object} rules - Extraction rules
 * @param {Array} improvements - Quantity improvements
 */
function updateQuantityRules(rules, improvements) {
  improvements.forEach(improvement => {
    // For quantities, we might want to identify patterns
    // like decimal places, thousand separators, etc.
    const originalClean = improvement.originalValue.replace(/[^0-9.]/g, '');
    const correctedClean = improvement.correctedValue.replace(/[^0-9.]/g, '');
    
    // Create pattern that matches the format
    const patternFormat = improvement.originalValue.replace(/\d+/g, '\\d+').replace(/\./g, '\\.');
    
    // Check if we already have a rule for this pattern
    const ruleIndex = rules.quantityRules.findIndex(rule => 
      rule.patternFormat === patternFormat
    );
    
    // Create or update rule
    const newRule = {
      pattern: improvement.originalValue,
      replacement: improvement.correctedValue,
      patternFormat: patternFormat,
      numericalRatio: originalClean && correctedClean ? parseFloat(correctedClean) / parseFloat(originalClean) : 1,
      confidence: 0.9,
      dateAdded: new Date().toISOString(),
      source: 'user-feedback'
    };
    
    if (ruleIndex >= 0) {
      rules.quantityRules[ruleIndex] = newRule;
    } else {
      rules.quantityRules.push(newRule);
    }
  });
}

/**
 * Update price rules
 * @param {Object} rules - Extraction rules
 * @param {Array} improvements - Price improvements
 */
function updatePriceRules(rules, improvements) {
  improvements.forEach(improvement => {
    // For prices, handle currency symbols and decimal places
    const originalClean = improvement.originalValue.replace(/[^0-9.]/g, '');
    const correctedClean = improvement.correctedValue.replace(/[^0-9.]/g, '');
    
    // Create pattern that matches the format
    const patternFormat = improvement.originalValue.replace(/\d+/g, '\\d+').replace(/\./g, '\\.');
    
    // Check if we already have a rule for this pattern
    const ruleIndex = rules.priceRules.findIndex(rule => 
      rule.patternFormat === patternFormat
    );
    
    // Create or update rule
    const newRule = {
      pattern: improvement.originalValue,
      replacement: improvement.correctedValue,
      patternFormat: patternFormat,
      numericalRatio: originalClean && correctedClean ? parseFloat(correctedClean) / parseFloat(originalClean) : 1,
      confidence: 0.9,
      dateAdded: new Date().toISOString(),
      source: 'user-feedback'
    };
    
    if (ruleIndex >= 0) {
      rules.priceRules[ruleIndex] = newRule;
    } else {
      rules.priceRules.push(newRule);
    }
  });
}

/**
 * Update value rules
 * @param {Object} rules - Extraction rules
 * @param {Array} improvements - Value improvements
 */
function updateValueRules(rules, improvements) {
  improvements.forEach(improvement => {
    // For values, handle currency symbols, commas, and decimal places
    const originalClean = improvement.originalValue.replace(/[^0-9.]/g, '');
    const correctedClean = improvement.correctedValue.replace(/[^0-9.]/g, '');
    
    // Create pattern that matches the format
    const patternFormat = improvement.originalValue.replace(/\d+/g, '\\d+').replace(/\./g, '\\.');
    
    // Check if we already have a rule for this pattern
    const ruleIndex = rules.valueRules.findIndex(rule => 
      rule.patternFormat === patternFormat
    );
    
    // Create or update rule
    const newRule = {
      pattern: improvement.originalValue,
      replacement: improvement.correctedValue,
      patternFormat: patternFormat,
      numericalRatio: originalClean && correctedClean ? parseFloat(correctedClean) / parseFloat(originalClean) : 1,
      confidence: 0.9,
      dateAdded: new Date().toISOString(),
      source: 'user-feedback'
    };
    
    if (ruleIndex >= 0) {
      rules.valueRules[ruleIndex] = newRule;
    } else {
      rules.valueRules.push(newRule);
    }
  });
}

/**
 * Update currency rules
 * @param {Object} rules - Extraction rules
 * @param {Array} improvements - Currency improvements
 */
function updateCurrencyRules(rules, improvements) {
  improvements.forEach(improvement => {
    // Check if we already have a rule for this pattern
    const ruleIndex = rules.currencyRules.findIndex(rule => 
      rule.pattern === improvement.originalValue || 
      rule.replacement === improvement.correctedValue
    );
    
    // Create or update rule
    const newRule = {
      pattern: improvement.originalValue,
      replacement: improvement.correctedValue,
      confidence: 0.9,
      dateAdded: new Date().toISOString(),
      source: 'user-feedback'
    };
    
    if (ruleIndex >= 0) {
      rules.currencyRules[ruleIndex] = newRule;
    } else {
      rules.currencyRules.push(newRule);
    }
  });
}

/**
 * Process all pending feedback
 * @returns {Object} Processing results
 */
function processAllPendingFeedback() {
  try {
    // Load all feedback
    const allFeedback = loadFeedbackItems();
    
    // Filter for fixed items that haven't been processed yet
    const fixedFeedback = allFeedback.filter(item => 
      item.status === 'fixed' && 
      item.correctValue && 
      !item.processed
    );
    
    if (fixedFeedback.length === 0) {
      return { 
        success: true, 
        message: 'No pending feedback to process',
        processed: 0
      };
    }
    
    // Add each item to the improvement dataset
    let processedCount = 0;
    fixedFeedback.forEach(item => {
      const added = addToImprovementDataset(item);
      if (added) {
        // Mark as processed
        item.processed = true;
        processedCount++;
      }
    });
    
    // Save updated feedback items (with processed flag)
    fs.writeFileSync(FEEDBACK_FILE, JSON.stringify(allFeedback, null, 2));
    
    // Update extraction rules
    const rulesUpdated = updateExtractionRules();
    
    return {
      success: true,
      message: `Processed ${processedCount} feedback items`,
      processed: processedCount,
      rulesUpdated
    };
  } catch (error) {
    console.error('Error processing feedback:', error);
    return {
      success: false,
      message: `Error processing feedback: ${error.message}`,
      processed: 0
    };
  }
}

/**
 * Apply extraction rules to correct a security
 * @param {Object} security - Security data to correct
 * @returns {Object} Corrected security data
 */
function applyExtractionRules(security) {
  try {
    // Clone the security to avoid modifying the original
    const correctedSecurity = { ...security };
    
    // Load rules
    const rules = loadExtractionRules();
    
    // Apply identifier rules
    if (correctedSecurity.isin) {
      for (const rule of rules.identifierRules) {
        if (correctedSecurity.isin === rule.pattern) {
          correctedSecurity.isin = rule.replacement;
          break;
        }
      }
    }
    
    // Apply name rules
    if (correctedSecurity.name) {
      for (const rule of rules.nameRules) {
        if (correctedSecurity.name === rule.pattern) {
          correctedSecurity.name = rule.replacement;
          break;
        }
      }
    }
    
    // Apply type rules
    if (correctedSecurity.type) {
      for (const rule of rules.typeRules) {
        if (correctedSecurity.type === rule.pattern) {
          correctedSecurity.type = rule.replacement;
          break;
        }
      }
    }
    
    // Apply quantity rules
    if (correctedSecurity.quantity) {
      for (const rule of rules.quantityRules) {
        if (correctedSecurity.quantity === rule.pattern || 
            new RegExp(rule.patternFormat).test(correctedSecurity.quantity)) {
          const numericValue = parseFloat(correctedSecurity.quantity.replace(/[^0-9.]/g, ''));
          const correctedValue = (numericValue * rule.numericalRatio).toString();
          correctedSecurity.quantity = correctedValue;
          break;
        }
      }
    }
    
    // Apply price rules
    if (correctedSecurity.price) {
      for (const rule of rules.priceRules) {
        if (correctedSecurity.price === rule.pattern || 
            new RegExp(rule.patternFormat).test(correctedSecurity.price)) {
          const numericValue = parseFloat(correctedSecurity.price.replace(/[^0-9.]/g, ''));
          const correctedValue = (numericValue * rule.numericalRatio).toString();
          // Format the price correctly
          const currencySymbol = correctedSecurity.price.match(/[^\d.,]/)?.[0] || '';
          correctedSecurity.price = currencySymbol + correctedValue;
          break;
        }
      }
    }
    
    // Apply value rules
    if (correctedSecurity.value) {
      for (const rule of rules.valueRules) {
        if (correctedSecurity.value === rule.pattern || 
            new RegExp(rule.patternFormat).test(correctedSecurity.value)) {
          const numericValue = parseFloat(correctedSecurity.value.replace(/[^0-9.]/g, ''));
          const correctedValue = (numericValue * rule.numericalRatio).toString();
          // Format the value correctly
          const currencySymbol = correctedSecurity.value.match(/[^\d.,]/)?.[0] || '';
          correctedSecurity.value = currencySymbol + correctedValue;
          break;
        }
      }
    }
    
    // Apply currency rules
    if (correctedSecurity.currency) {
      for (const rule of rules.currencyRules) {
        if (correctedSecurity.currency === rule.pattern) {
          correctedSecurity.currency = rule.replacement;
          break;
        }
      }
    }
    
    return correctedSecurity;
  } catch (error) {
    console.error('Error applying extraction rules:', error);
    return security; // Return original if error
  }
}

/**
 * Generate improvement insights
 * @returns {Object} Improvement insights
 */
function generateImprovementInsights() {
  try {
    // Load feedback and dataset
    const allFeedback = loadFeedbackItems();
    const dataset = loadImprovementDataset();
    
    // Skip if no data
    if (allFeedback.length === 0) {
      return {
        feedbackCount: 0,
        insights: [],
        errorTypeDistribution: {}
      };
    }
    
    // Calculate statistics
    const errorTypeDistribution = {};
    
    allFeedback.forEach(item => {
      if (!errorTypeDistribution[item.errorType]) {
        errorTypeDistribution[item.errorType] = 0;
      }
      errorTypeDistribution[item.errorType]++;
    });
    
    // Generate insights
    const insights = [];
    
    // Insight 1: Most common error types
    const sortedErrorTypes = Object.entries(errorTypeDistribution)
      .sort((a, b) => b[1] - a[1]);
    
    if (sortedErrorTypes.length > 0) {
      const [mostCommonErrorType, count] = sortedErrorTypes[0];
      const percentage = Math.round((count / allFeedback.length) * 100);
      
      insights.push({
        type: 'most-common-error',
        title: `Most common error type: ${formatErrorType(mostCommonErrorType)}`,
        description: `${percentage}% of feedback reports issues with ${formatErrorType(mostCommonErrorType).toLowerCase()}.`,
        recommendation: getRecommendationForErrorType(mostCommonErrorType)
      });
    }
    
    // Insight 2: Documents with multiple feedback items
    const feedbackByDocument = {};
    
    allFeedback.forEach(item => {
      if (!feedbackByDocument[item.documentId]) {
        feedbackByDocument[item.documentId] = [];
      }
      feedbackByDocument[item.documentId].push(item);
    });
    
    const documentsWithMultipleFeedback = Object.entries(feedbackByDocument)
      .filter(([_, items]) => items.length > 1)
      .sort((a, b) => b[1].length - a[1].length);
    
    if (documentsWithMultipleFeedback.length > 0) {
      const [documentId, items] = documentsWithMultipleFeedback[0];
      
      insights.push({
        type: 'problematic-document',
        title: `Document with most feedback: ${documentId}`,
        description: `This document has ${items.length} reported issues.`,
        recommendation: 'Review the document structure and improve extraction for similar document layouts.'
      });
    }
    
    // Insight 3: Improvement effectiveness
    if (dataset.length > 0) {
      const improvementRatio = allFeedback.filter(item => item.status === 'fixed').length / allFeedback.length;
      const percentage = Math.round(improvementRatio * 100);
      
      insights.push({
        type: 'improvement-effectiveness',
        title: `Improvement effectiveness: ${percentage}%`,
        description: `${percentage}% of reported issues have been fixed and incorporated into the extraction algorithm.`,
        recommendation: percentage < 50 ? 
          'Increase focus on applying feedback to improve the algorithm.' : 
          'Continue leveraging user feedback to maintain high quality extraction.'
      });
    }
    
    return {
      feedbackCount: allFeedback.length,
      insights,
      errorTypeDistribution
    };
  } catch (error) {
    console.error('Error generating improvement insights:', error);
    return {
      feedbackCount: 0,
      insights: [],
      errorTypeDistribution: {}
    };
  }
}

/**
 * Format error type for display
 * @param {string} errorType - Error type
 * @returns {string} - Formatted error type
 */
function formatErrorType(errorType) {
  switch (errorType) {
    case 'wrong-identifier':
      return 'Security Identifier';
    case 'wrong-name':
      return 'Security Name';
    case 'wrong-type':
      return 'Security Type';
    case 'wrong-quantity':
      return 'Quantity';
    case 'wrong-price':
      return 'Price';
    case 'wrong-value':
      return 'Value';
    case 'wrong-currency':
      return 'Currency';
    case 'missing-data':
      return 'Missing Data';
    case 'other':
      return 'Other';
    default:
      return errorType;
  }
}

/**
 * Get recommendation for error type
 * @param {string} errorType - Error type
 * @returns {string} - Recommendation
 */
function getRecommendationForErrorType(errorType) {
  switch (errorType) {
    case 'wrong-identifier':
      return 'Enhance ISIN/CUSIP validation by implementing a checksum verification and referencing an external securities database.';
    case 'wrong-name':
      return 'Improve security name extraction by implementing fuzzy matching against a known securities database.';
    case 'wrong-type':
      return 'Standardize security type classification with a predefined taxonomy and implement consistent categorization rules.';
    case 'wrong-quantity':
      return 'Enhance numerical extraction to better handle formatting variations and decimal place precision.';
    case 'wrong-price':
      return 'Improve price extraction by better handling currency symbols and thousands separators.';
    case 'wrong-value':
      return 'Validate total value calculations by cross-checking price × quantity for consistency.';
    case 'wrong-currency':
      return 'Implement better currency code detection and standardization to ISO 4217 format.';
    case 'missing-data':
      return 'Enhance table structure detection to correctly identify all relevant data columns.';
    case 'other':
      return 'Review common patterns in these errors and develop targeted extraction improvements.';
    default:
      return 'Analyze specific patterns in the error types and implement targeted extraction improvements.';
  }
}

// Export functions
module.exports = {
  addToImprovementDataset,
  processAllPendingFeedback,
  applyExtractionRules,
  generateImprovementInsights,
  updateExtractionRules
};