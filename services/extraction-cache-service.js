/**
 * Extraction Cache Service
 * 
 * This service provides caching capabilities for document extraction operations
 * to avoid repetitive processing of the same documents.
 */

const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');

// Import the existing cache service if available, otherwise use a default implementation
let cacheService;
try {
  // Try to load the existing cache service
  cacheService = require('../DevDocs/backend/services/cache/cacheService');
  console.log('Using existing cache service from DevDocs');
} catch (err) {
  // If not available, create a fallback implementation using node-cache
  const NodeCache = require('node-cache');
  
  // Create a simple cache instance
  const cache = new NodeCache({
    stdTTL: 60 * 60 * 24, // 1 day default TTL
    checkperiod: 60 * 10, // Check every 10 minutes
    useClones: false // For better performance with large objects
  });
  
  // Create a minimal cache service
  cacheService = {
    get: (key) => cache.get(key),
    set: (key, value, ttl) => cache.set(key, value, ttl),
    has: (key) => cache.has(key),
    del: (key) => cache.del(key),
    flush: () => cache.flushAll(),
    memoize: (fn, keyFn, ttl) => {
      return async function(...args) {
        const key = keyFn(...args);
        if (cache.has(key)) {
          return cache.get(key);
        }
        const result = await fn(...args);
        cache.set(key, result, ttl);
        return result;
      };
    }
  };
  
  console.log('Using fallback cache service');
}

// Constants
const DEFAULT_CACHE_TTL = 60 * 60 * 24 * 7; // 7 days
const CACHE_NAMESPACE = 'extraction';

/**
 * Generate a unique document fingerprint
 * @param {Object} document - Document content or document object
 * @param {Object} options - Options for fingerprint generation
 * @returns {string} - Document fingerprint
 */
function generateDocumentFingerprint(document, options = {}) {
  try {
    // Initialize hasher
    const hasher = crypto.createHash('sha256');
    
    // Handle different document formats
    let content = '';
    
    if (typeof document === 'string') {
      // If document is a string (file path)
      if (fs.existsSync(document)) {
        // Use file metadata for fingerprint
        const stats = fs.statSync(document);
        content = `${document}|${stats.size}|${stats.mtimeMs}`;
      } else {
        // Use the string content directly
        content = document;
      }
    } else if (document.filePath && fs.existsSync(document.filePath)) {
      // If document has a file path that exists
      const stats = fs.statSync(document.filePath);
      const fileName = path.basename(document.filePath);
      
      // Include file metadata and options in the fingerprint
      content = `${document.filePath}|${fileName}|${stats.size}|${stats.mtimeMs}`;
      
      // If document has tenant info, include it
      if (document.tenantId) {
        content += `|tenant:${document.tenantId}`;
      }
    } else if (document.text || document.content) {
      // If document has text content
      content = document.text || (document.content ? document.content.text : '');
      
      // Include table data if available
      if (document.tables || (document.content && document.content.tables)) {
        const tables = document.tables || (document.content ? document.content.tables : []);
        content += `|tables:${tables.length}`;
      }
      
      // If document has tenant info, include it
      if (document.tenantId) {
        content += `|tenant:${document.tenantId}`;
      }
    } else if (document.id) {
      // If document just has an ID, use that with a timestamp
      content = `${document.id}|${Date.now()}`;
      
      // If document has tenant info, include it
      if (document.tenantId) {
        content += `|tenant:${document.tenantId}`;
      }
    } else {
      // Fallback to JSON stringification
      content = JSON.stringify(document);
    }
    
    // Include additional options in the fingerprint if provided
    if (options) {
      content += `|options:${JSON.stringify(options)}`;
    }
    
    // Generate the hash
    hasher.update(content);
    return hasher.digest('hex');
  } catch (error) {
    console.error(`Error generating document fingerprint: ${error.message}`);
    // Fallback to random UUID in case of error
    return uuidv4();
  }
}

/**
 * Get complete cache key with namespace
 * @param {string} fingerprint - Document fingerprint
 * @param {string} operation - Extraction operation type
 * @param {string} tenantId - Optional tenant ID for multi-tenant scenarios
 * @returns {string} - Cache key
 */
function getCacheKey(fingerprint, operation, tenantId = null) {
  let key = `${CACHE_NAMESPACE}:${operation}:${fingerprint}`;
  
  // Add tenant ID if provided
  if (tenantId) {
    key = `tenant:${tenantId}:${key}`;
  }
  
  return key;
}

/**
 * Get cached extraction result
 * @param {string} fingerprint - Document fingerprint
 * @param {string} operation - Extraction operation type
 * @param {string} tenantId - Optional tenant ID
 * @returns {Promise<Object|null>} - Cached extraction result or null if not found
 */
async function getCachedExtraction(fingerprint, operation, tenantId = null) {
  try {
    const key = getCacheKey(fingerprint, operation, tenantId);
    
    // Check if operation result is in cache
    if (cacheService.has(key)) {
      const result = cacheService.get(key);
      console.log(`Cache hit for ${operation} with fingerprint: ${fingerprint}`);
      return result;
    }
    
    console.log(`Cache miss for ${operation} with fingerprint: ${fingerprint}`);
    return null;
  } catch (error) {
    console.error(`Error getting cached extraction: ${error.message}`);
    return null;
  }
}

/**
 * Store extraction result in cache
 * @param {string} fingerprint - Document fingerprint
 * @param {string} operation - Extraction operation type
 * @param {Object} result - Extraction result
 * @param {number} ttl - Time to live in seconds
 * @param {string} tenantId - Optional tenant ID
 * @returns {Promise<boolean>} - Whether the result was stored successfully
 */
async function storeExtractionResult(fingerprint, operation, result, ttl = DEFAULT_CACHE_TTL, tenantId = null) {
  try {
    const key = getCacheKey(fingerprint, operation, tenantId);
    
    // Store in cache
    cacheService.set(key, result, ttl);
    
    console.log(`Stored ${operation} result in cache with fingerprint: ${fingerprint}`);
    return true;
  } catch (error) {
    console.error(`Error storing extraction result: ${error.message}`);
    return false;
  }
}

/**
 * Invalidate cached extraction result
 * @param {string} fingerprint - Document fingerprint
 * @param {string} operation - Extraction operation type
 * @param {string} tenantId - Optional tenant ID
 * @returns {Promise<boolean>} - Whether the result was invalidated successfully
 */
async function invalidateExtraction(fingerprint, operation, tenantId = null) {
  try {
    const key = getCacheKey(fingerprint, operation, tenantId);
    
    // Remove from cache
    if (cacheService.has(key)) {
      cacheService.del(key);
      console.log(`Invalidated ${operation} cache with fingerprint: ${fingerprint}`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`Error invalidating extraction: ${error.message}`);
    return false;
  }
}

/**
 * Create a cached version of an extraction function
 * @param {Function} extractionFn - The extraction function to cache
 * @param {string} operation - Extraction operation type
 * @param {number} ttl - Time to live in seconds
 * @returns {Function} - Cached extraction function
 */
function createCachedExtraction(extractionFn, operation, ttl = DEFAULT_CACHE_TTL) {
  return async function(document, options = {}) {
    try {
      // Get tenant ID if available
      const tenantId = document.tenantId || options.tenantId || null;
      
      // Generate document fingerprint
      const fingerprint = generateDocumentFingerprint(document, options);
      
      // Try to get from cache
      const cachedResult = await getCachedExtraction(fingerprint, operation, tenantId);
      if (cachedResult) {
        return cachedResult;
      }
      
      // Call original extraction function
      console.log(`Performing ${operation} extraction for document`);
      const result = await extractionFn(document, options);
      
      // Store in cache
      await storeExtractionResult(fingerprint, operation, result, ttl, tenantId);
      
      return result;
    } catch (error) {
      console.error(`Error in cached extraction: ${error.message}`);
      // Fall back to original function
      return extractionFn(document, options);
    }
  };
}

module.exports = {
  generateDocumentFingerprint,
  getCachedExtraction,
  storeExtractionResult,
  invalidateExtraction,
  createCachedExtraction,
  DEFAULT_CACHE_TTL,
  CACHE_NAMESPACE
};