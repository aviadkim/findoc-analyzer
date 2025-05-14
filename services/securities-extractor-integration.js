/**
 * Securities Extractor Integration
 * 
 * This module integrates the enhanced-securities-extractor-v2 with the document processing pipeline
 * to improve financial document understanding for chatbots and agents.
 */

// Import the enhanced securities extractor
const { extractSecurities } = require('./enhanced-securities-extractor-v2');

// Import the caching service
const {
  generateDocumentFingerprint,
  getCachedExtraction,
  storeExtractionResult,
  DEFAULT_CACHE_TTL
} = require('./extraction-cache-service');

// Define operation type for cache keys
const SECURITIES_EXTRACTION_OPERATION = 'securities-extraction';

/**
 * Extract securities using the enhanced extractor v2
 * @param {Object} content - Document content with text and tables
 * @param {Object} options - Extraction options
 * @returns {Promise<Array>} - Extracted securities with enhanced information
 */
async function extractSecuritiesEnhanced(content, options = {}) {
  try {
    console.log('Extracting securities using enhanced extractor v2');
    
    // Create document content object if needed
    const documentContent = {
      text: content.text || '',
      tables: content.tables || [],
      financialData: content.financialData || {},
      tenantId: content.tenantId || options.tenantId || null
    };
    
    // Generate document fingerprint for caching
    const fingerprint = generateDocumentFingerprint(documentContent, options);
    
    // Try to get from cache
    const cachedResult = await getCachedExtraction(
      fingerprint,
      SECURITIES_EXTRACTION_OPERATION,
      documentContent.tenantId
    );
    
    if (cachedResult) {
      console.log(`Using cached securities extraction result for document with fingerprint: ${fingerprint}`);
      return cachedResult;
    }
    
    // Extract securities with enhanced extractor
    const securities = await extractSecurities(documentContent);
    
    // Map to standard security format
    const mappedSecurities = securities.map(security => ({
      type: 'security',
      isin: security.isin,
      name: security.name || `Security ${security.isin}`,
      ticker: security.ticker || '',
      quantity: security.quantity || 0,
      price: security.price || 0,
      value: security.value || 0,
      percentage: security.percentage || 0,
      asset_type: security.type || 'unknown',
      currency: security.currency || 'USD',
      confidence: 0.95, // High confidence for enhanced extraction
      source: 'enhanced-extractor-v2'
    }));
    
    // Store in cache
    await storeExtractionResult(
      fingerprint,
      SECURITIES_EXTRACTION_OPERATION,
      mappedSecurities,
      options.ttl || DEFAULT_CACHE_TTL,
      documentContent.tenantId
    );
    
    return mappedSecurities;
  } catch (error) {
    console.error(`Error extracting securities with enhanced extractor: ${error.message}`);
    return [];
  }
}

/**
 * Convert raw securities from the enhanced extractor to entity format
 * @param {Array} securities - Securities from the enhanced extractor
 * @returns {Array} - Securities in entity format
 */
function convertSecuritiesToEntities(securities) {
  return securities.map(security => ({
    id: require('uuid').v4(),
    type: 'security',
    name: security.name,
    isin: security.isin,
    ticker: security.ticker || '',
    quantity: security.quantity || 0,
    price: security.price || 0,
    value: security.value || 0,
    percentage: security.percentage || 0,
    asset_type: security.type || 'unknown',
    currency: security.currency || 'USD',
    confidence: security.confidence || 0.95,
    source: security.source || 'enhanced-extractor-v2'
  }));
}

/**
 * Merge basic entities with enhanced securities
 * @param {Array} basicEntities - Basic extracted entities
 * @param {Array} enhancedSecurities - Securities from enhanced extractor
 * @returns {Array} - Merged entities with improved security information
 */
function mergeEntitiesWithSecurities(basicEntities, enhancedSecurities) {
  // Create a set of ISINs from enhanced securities
  const enhancedIsins = new Set(enhancedSecurities.map(s => s.isin));
  
  // Filter out basic entities that are securities with ISINs in the enhanced set
  const filteredEntities = basicEntities.filter(entity => {
    if ((entity.type === 'security' || entity.type === 'isin') && entity.isin) {
      return !enhancedIsins.has(entity.isin);
    }
    return true;
  });
  
  // Merge the filtered basic entities with enhanced securities
  return [...filteredEntities, ...enhancedSecurities];
}

/**
 * Enhanced extraction of securities from combined document content
 * @param {Object} document - Document with text, tables and entities
 * @param {Object} options - Extraction options
 * @returns {Promise<Array>} - Enhanced entities with improved securities
 */
async function extractEnhancedEntities(document, options = {}) {
  try {
    console.log('Performing enhanced entity extraction');
    
    // Get basic entities first
    let basicEntities = document.entities || [];
    
    // If no entities provided, try to extract them
    if (basicEntities.length === 0 && document.text) {
      try {
        const entityExtractor = require('./entity-extractor');
        basicEntities = await entityExtractor.extractBasicFinancialEntities(document.text);
      } catch (error) {
        console.warn(`Basic entity extraction failed: ${error.message}`);
        basicEntities = [];
      }
    }
    
    // Extract enhanced securities
    const enhancedSecurities = await extractSecuritiesEnhanced({
      text: document.text || '',
      tables: document.tables || [],
      financialData: document.financialData || {}
    }, options);
    
    // Convert to entity format
    const securityEntities = convertSecuritiesToEntities(enhancedSecurities);
    
    // Merge entities
    const mergedEntities = mergeEntitiesWithSecurities(basicEntities, securityEntities);
    
    return mergedEntities;
  } catch (error) {
    console.error(`Error in enhanced entity extraction: ${error.message}`);
    return document.entities || [];
  }
}

// Export functions
module.exports = {
  extractSecuritiesEnhanced,
  convertSecuritiesToEntities,
  mergeEntitiesWithSecurities,
  extractEnhancedEntities
};