/**
 * Document Cache Manager
 * 
 * This service provides a comprehensive caching layer for document processing
 * to improve performance and reduce unnecessary reprocessing.
 * 
 * Features:
 * - Document fingerprinting for unique identification
 * - Multi-level caching (memory and persistent)
 * - Tenant-aware caching
 * - TTL (Time-To-Live) policies
 * - Cache invalidation API
 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { extractionCacheService } = require('./extraction-cache-service');

// Try to load Node-Cache for in-memory caching
let NodeCache;
try {
  NodeCache = require('node-cache');
} catch (error) {
  console.warn('node-cache not found, falling back to Map-based cache');
  // Create a simple Map-based cache implementation
  NodeCache = class SimpleCache {
    constructor(options = {}) {
      this.cache = new Map();
      this.ttl = options.stdTTL || 3600; // Default 1 hour
      this.checkperiod = options.checkperiod || 600; // Default 10 minutes
      
      // Set up periodic cleanup
      if (this.checkperiod > 0) {
        this.interval = setInterval(() => this.cleanup(), this.checkperiod * 1000);
      }
    }
    
    set(key, value, ttl = this.ttl) {
      const expires = Date.now() + (ttl * 1000);
      this.cache.set(key, { value, expires });
      return true;
    }
    
    get(key) {
      const item = this.cache.get(key);
      if (!item) return undefined;
      
      // Check if expired
      if (item.expires && item.expires < Date.now()) {
        this.cache.delete(key);
        return undefined;
      }
      
      return item.value;
    }
    
    has(key) {
      return this.get(key) !== undefined;
    }
    
    del(key) {
      return this.cache.delete(key);
    }
    
    flush() {
      this.cache.clear();
      return true;
    }
    
    cleanup() {
      const now = Date.now();
      for (const [key, item] of this.cache.entries()) {
        if (item.expires && item.expires < now) {
          this.cache.delete(key);
        }
      }
    }
    
    close() {
      if (this.interval) {
        clearInterval(this.interval);
      }
    }
  };
}

// Constants
const CACHE_NAMESPACE = 'document-cache';
const DEFAULT_TTL = 60 * 60 * 24 * 7; // 7 days
const DEFAULT_MEMORY_TTL = 60 * 60; // 1 hour
const CACHE_OPERATIONS = {
  DOCUMENT_PROCESSING: 'document-processing',
  ENTITY_EXTRACTION: 'entity-extraction',
  SECURITIES_EXTRACTION: 'securities-extraction',
  TABLE_EXTRACTION: 'table-extraction',
  TEXT_EXTRACTION: 'text-extraction',
  METADATA_EXTRACTION: 'metadata-extraction'
};

// Initialize in-memory cache
const memoryCache = new NodeCache({
  stdTTL: DEFAULT_MEMORY_TTL,
  checkperiod: 600, // Check every 10 minutes
  useClones: false // For better performance with large objects
});

/**
 * Generate a unique document fingerprint
 * @param {Object} document - Document content or document object
 * @param {Object} options - Options that affect processing outcome
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
      
      // Include document ID if available
      if (document.id) {
        content = `id:${document.id}|${content}`;
      }
      
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
    // This is important as processing options affect the outcome
    if (options && Object.keys(options).length > 0) {
      // Filter out non-deterministic options
      const relevantOptions = { ...options };
      
      // Filter out the useCache option itself
      delete relevantOptions.useCache;
      delete relevantOptions.cacheTTL;
      
      // Keep only options that affect processing outcome
      const processingOptions = [
        'extractText', 'extractTables', 'extractMetadata', 'extractSecurities',
        'processWithOcr', 'enhancedProcessing', 'language', 'useMcp'
      ];
      
      const filteredOptions = {};
      for (const key of processingOptions) {
        if (key in relevantOptions) {
          filteredOptions[key] = relevantOptions[key];
        }
      }
      
      content += `|options:${JSON.stringify(filteredOptions)}`;
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
 * Get cache key with namespace and tenant
 * @param {string} fingerprint - Document fingerprint
 * @param {string} operation - Cache operation type
 * @param {string} tenantId - Optional tenant ID
 * @returns {string} - Complete cache key
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
 * Get document from cache
 * @param {string} fingerprint - Document fingerprint
 * @param {string} operation - Cache operation type
 * @param {string} tenantId - Optional tenant ID
 * @returns {Promise<Object|null>} - Cached document or null if not found
 */
async function getCachedDocument(fingerprint, operation, tenantId = null) {
  try {
    const key = getCacheKey(fingerprint, operation, tenantId);
    
    // Try memory cache first (fastest)
    if (memoryCache.has(key)) {
      console.log(`Memory cache hit for ${operation} with fingerprint: ${fingerprint}`);
      return memoryCache.get(key);
    }
    
    // Try persistent cache next
    try {
      const result = await extractionCacheService.getCachedExtraction(fingerprint, operation, tenantId);
      if (result) {
        console.log(`Persistent cache hit for ${operation} with fingerprint: ${fingerprint}`);
        
        // Store in memory cache for faster subsequent access
        memoryCache.set(key, result, DEFAULT_MEMORY_TTL);
        
        return result;
      }
    } catch (persistentCacheError) {
      console.warn(`Persistent cache error: ${persistentCacheError.message}`);
      // Continue to check file cache even if persistent cache fails
    }
    
    console.log(`Cache miss for ${operation} with fingerprint: ${fingerprint}`);
    return null;
  } catch (error) {
    console.error(`Error getting cached document: ${error.message}`);
    return null;
  }
}

/**
 * Store document in cache
 * @param {string} fingerprint - Document fingerprint
 * @param {string} operation - Cache operation type
 * @param {Object} document - Document to cache
 * @param {number} ttl - Time to live in seconds
 * @param {string} tenantId - Optional tenant ID
 * @returns {Promise<boolean>} - Whether document was cached successfully
 */
async function cacheDocument(fingerprint, operation, document, ttl = DEFAULT_TTL, tenantId = null) {
  try {
    const key = getCacheKey(fingerprint, operation, tenantId);
    
    // Store in memory cache
    memoryCache.set(key, document, Math.min(ttl, DEFAULT_MEMORY_TTL));
    
    // Store in persistent cache
    try {
      await extractionCacheService.storeExtractionResult(fingerprint, operation, document, ttl, tenantId);
    } catch (persistentCacheError) {
      console.warn(`Persistent cache store error: ${persistentCacheError.message}`);
      // Continue even if persistent cache fails
    }
    
    console.log(`Cached ${operation} result with fingerprint: ${fingerprint}`);
    return true;
  } catch (error) {
    console.error(`Error caching document: ${error.message}`);
    return false;
  }
}

/**
 * Invalidate document cache
 * @param {string} fingerprint - Document fingerprint
 * @param {string} operation - Cache operation type, or null to invalidate all operations
 * @param {string} tenantId - Optional tenant ID
 * @returns {Promise<boolean>} - Whether cache was invalidated
 */
async function invalidateCache(fingerprint, operation = null, tenantId = null) {
  try {
    let success = false;
    
    // If operation is null, invalidate all operations
    const operations = operation 
      ? [operation] 
      : Object.values(CACHE_OPERATIONS);
    
    for (const op of operations) {
      const key = getCacheKey(fingerprint, op, tenantId);
      
      // Remove from memory cache
      if (memoryCache.has(key)) {
        memoryCache.del(key);
        success = true;
      }
      
      // Remove from persistent cache
      try {
        const persistentResult = await extractionCacheService.invalidateExtraction(fingerprint, op, tenantId);
        success = success || persistentResult;
      } catch (persistentCacheError) {
        console.warn(`Persistent cache invalidation error: ${persistentCacheError.message}`);
        // Continue even if persistent cache fails
      }
    }
    
    if (success) {
      console.log(`Invalidated cache for fingerprint: ${fingerprint}`);
    }
    
    return success;
  } catch (error) {
    console.error(`Error invalidating cache: ${error.message}`);
    return false;
  }
}

/**
 * Create a cached version of a document processing function
 * @param {Function} processFn - Document processing function to cache
 * @param {string} operation - Cache operation type
 * @param {number} ttl - Time to live in seconds
 * @returns {Function} - Cached document processing function
 */
function createCachedProcessor(processFn, operation, ttl = DEFAULT_TTL) {
  return async function(document, options = {}) {
    try {
      // Skip cache if explicitly disabled
      if (options.useCache === false) {
        return await processFn(document, options);
      }
      
      // Get tenant ID if available
      const tenantId = document.tenantId || options.tenantId || null;
      
      // Generate document fingerprint
      const fingerprint = generateDocumentFingerprint(document, options);
      
      // Try to get from cache
      const cachedResult = await getCachedDocument(fingerprint, operation, tenantId);
      if (cachedResult) {
        return cachedResult;
      }
      
      // Call original processor function
      console.log(`Performing ${operation} for document`);
      const result = await processFn(document, options);
      
      // Store in cache with TTL
      const cacheTTL = options.cacheTTL || ttl;
      await cacheDocument(fingerprint, operation, result, cacheTTL, tenantId);
      
      return result;
    } catch (error) {
      console.error(`Error in cached processor: ${error.message}`);
      // Fall back to original function
      return processFn(document, options);
    }
  };
}

/**
 * Clear all caches (memory and persistent)
 * @returns {Promise<boolean>} - Whether caches were cleared
 */
async function clearAllCaches() {
  try {
    // Clear memory cache
    memoryCache.flush();
    
    // Try to clear persistent cache
    try {
      const result = await extractionCacheService.clearAllCaches();
      console.log('All caches cleared');
      return result;
    } catch (persistentCacheError) {
      console.warn(`Persistent cache clear error: ${persistentCacheError.message}`);
      // Return true if at least memory cache was cleared
      return true;
    }
  } catch (error) {
    console.error(`Error clearing caches: ${error.message}`);
    return false;
  }
}

/**
 * Get cache statistics
 * @returns {Promise<Object>} - Cache statistics
 */
async function getCacheStats() {
  try {
    // Get memory cache stats
    const memoryStats = {
      keys: memoryCache.keys().length,
      hits: memoryCache.getStats().hits,
      misses: memoryCache.getStats().misses,
      ksize: memoryCache.getStats().ksize,
      vsize: memoryCache.getStats().vsize
    };
    
    // Try to get persistent cache stats
    let persistentStats = {};
    try {
      persistentStats = await extractionCacheService.getCacheStats();
    } catch (persistentCacheError) {
      console.warn(`Error getting persistent cache stats: ${persistentCacheError.message}`);
      persistentStats = { error: persistentCacheError.message };
    }
    
    return {
      memory: memoryStats,
      persistent: persistentStats
    };
  } catch (error) {
    console.error(`Error getting cache stats: ${error.message}`);
    return { error: error.message };
  }
}

module.exports = {
  // Core functions
  generateDocumentFingerprint,
  getCachedDocument,
  cacheDocument,
  invalidateCache,
  createCachedProcessor,
  
  // Cache management
  clearAllCaches,
  getCacheStats,
  
  // Re-export extraction cache service
  extractionCacheService,
  
  // Constants
  CACHE_OPERATIONS,
  DEFAULT_TTL,
  DEFAULT_MEMORY_TTL,
  CACHE_NAMESPACE
};