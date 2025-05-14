/**
 * Cached Securities Extractor
 * 
 * This module provides a cached wrapper around the securities extraction functionality
 * to prevent reprocessing the same documents multiple times.
 */

// Import required modules
const { extractSecurities } = require('./enhanced-securities-extractor');
const { extractSecuritiesEnhanced } = require('./securities-extractor-integration');
const {
  generateDocumentFingerprint,
  getCachedExtraction,
  storeExtractionResult,
  invalidateExtraction,
  createCachedExtraction,
  DEFAULT_CACHE_TTL
} = require('./extraction-cache-service');

// Cache key operation types
const OPERATIONS = {
  SECURITIES_EXTRACTION: 'securities-extraction',
  SECURITIES_EXTRACTION_ENHANCED: 'securities-extraction-enhanced'
};

/**
 * Extract securities with caching
 * @param {Object} content - Document content with text and tables
 * @param {Object} options - Extraction options
 * @returns {Promise<Array>} - Extracted securities
 */
async function extractSecuritiesWithCache(content, options = {}) {
  try {
    // Get tenant ID if available
    const tenantId = content.tenantId || options.tenantId || null;
    
    // Generate document fingerprint
    const fingerprint = generateDocumentFingerprint(content, options);
    
    // Try to get from cache
    const cachedResult = await getCachedExtraction(
      fingerprint, 
      OPERATIONS.SECURITIES_EXTRACTION, 
      tenantId
    );
    
    if (cachedResult) {
      console.log(`Using cached securities extraction result for document`);
      return cachedResult;
    }
    
    // Perform extraction
    console.log(`Extracting securities for document with fingerprint: ${fingerprint}`);
    const securities = await extractSecurities(content);
    
    // Store in cache
    await storeExtractionResult(
      fingerprint, 
      OPERATIONS.SECURITIES_EXTRACTION, 
      securities, 
      options.ttl || DEFAULT_CACHE_TTL, 
      tenantId
    );
    
    return securities;
  } catch (error) {
    console.error(`Error in cached securities extraction: ${error.message}`);
    
    // Fall back to original function in case of cache error
    return extractSecurities(content);
  }
}

/**
 * Extract securities with enhanced extractor and caching
 * @param {Object} content - Document content with text and tables
 * @param {Object} options - Extraction options
 * @returns {Promise<Array>} - Extracted securities with enhanced information
 */
async function extractSecuritiesEnhancedWithCache(content, options = {}) {
  try {
    // Get tenant ID if available
    const tenantId = content.tenantId || options.tenantId || null;
    
    // Generate document fingerprint
    const fingerprint = generateDocumentFingerprint(content, options);
    
    // Try to get from cache
    const cachedResult = await getCachedExtraction(
      fingerprint, 
      OPERATIONS.SECURITIES_EXTRACTION_ENHANCED, 
      tenantId
    );
    
    if (cachedResult) {
      console.log(`Using cached enhanced securities extraction result for document`);
      return cachedResult;
    }
    
    // Perform extraction
    console.log(`Extracting enhanced securities for document with fingerprint: ${fingerprint}`);
    const securities = await extractSecuritiesEnhanced(content, options);
    
    // Store in cache
    await storeExtractionResult(
      fingerprint, 
      OPERATIONS.SECURITIES_EXTRACTION_ENHANCED, 
      securities, 
      options.ttl || DEFAULT_CACHE_TTL, 
      tenantId
    );
    
    return securities;
  } catch (error) {
    console.error(`Error in cached enhanced securities extraction: ${error.message}`);
    
    // Fall back to original function in case of cache error
    return extractSecuritiesEnhanced(content, options);
  }
}

/**
 * Invalidate cached securities extraction result
 * @param {Object} content - Document content
 * @param {string} tenantId - Optional tenant ID
 * @param {boolean} invalidateEnhanced - Whether to invalidate enhanced extraction results too
 * @returns {Promise<boolean>} - Whether the result was invalidated successfully
 */
async function invalidateSecuritiesCache(content, tenantId = null, invalidateEnhanced = true) {
  try {
    // Generate document fingerprint
    const fingerprint = generateDocumentFingerprint(content);
    
    // Invalidate basic extraction
    const basicResult = await invalidateExtraction(
      fingerprint, 
      OPERATIONS.SECURITIES_EXTRACTION, 
      tenantId
    );
    
    // Invalidate enhanced extraction if requested
    let enhancedResult = true;
    if (invalidateEnhanced) {
      enhancedResult = await invalidateExtraction(
        fingerprint, 
        OPERATIONS.SECURITIES_EXTRACTION_ENHANCED, 
        tenantId
      );
    }
    
    return basicResult || enhancedResult;
  } catch (error) {
    console.error(`Error invalidating securities cache: ${error.message}`);
    return false;
  }
}

// Create cached versions of extraction functions using the helper
const extractSecuritiesCached = createCachedExtraction(
  extractSecurities,
  OPERATIONS.SECURITIES_EXTRACTION
);

const extractSecuritiesEnhancedCached = createCachedExtraction(
  extractSecuritiesEnhanced,
  OPERATIONS.SECURITIES_EXTRACTION_ENHANCED
);

module.exports = {
  // Direct cached implementations
  extractSecuritiesWithCache,
  extractSecuritiesEnhancedWithCache,
  
  // Helper-created cached versions
  extractSecuritiesCached,
  extractSecuritiesEnhancedCached,
  
  // Cache management
  invalidateSecuritiesCache,
  
  // Re-export original functions for convenience
  extractSecurities,
  extractSecuritiesEnhanced
};