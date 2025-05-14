/**
 * Enhanced Security Extractor with Caching Support
 * 
 * This module extends the SecurityExtractor with caching functionality to
 * avoid reprocessing the same document multiple times.
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const os = require('os');
const crypto = require('crypto');
const logger = require('../utils/logger');

// Import the original SecurityExtractor
const SecurityExtractor = require('./security_extractor');

// Default reference database
const DEFAULT_REF_DB = {
  get_name_by_isin: (isin) => null,
  normalize_security_name: (name) => name,
  validate_isin: (isin) => {
    // Basic ISIN validation
    const regex = /^[A-Z]{2}[A-Z0-9]{9}[0-9]$/;
    return regex.test(isin);
  },
  find_best_match_for_name: (name, limit = 1) => {
    return [];
  },
  detect_security_type: (description) => null
};

class CachedSecurityExtractor extends SecurityExtractor {
  /**
   * Create a CachedSecurityExtractor instance
   * @param {Object} options - Configuration options
   * @param {boolean} options.debug - Whether to print debug information
   * @param {string} options.cacheDir - Directory to store cache files
   * @param {number} options.cacheTtl - Cache TTL in seconds (default: 24 hours)
   * @param {boolean} options.useTenantIsolation - Whether to isolate cache by tenant
   */
  constructor(options = {}) {
    super(options);
    
    this.debug = options.debug || false;
    this.securities_db = DEFAULT_REF_DB;
    
    // Cache settings
    this.cacheDir = options.cacheDir || path.resolve(__dirname, '../../cache');
    this.cacheTtl = options.cacheTtl || 86400; // 24 hours in seconds
    this.useTenantIsolation = options.useTenantIsolation !== false; // Default to true
    
    // Create cache directory if it doesn't exist
    if (!fs.existsSync(this.cacheDir)) {
      fs.mkdirSync(this.cacheDir, { recursive: true });
    }
    
    // Cache statistics
    this.cacheHits = 0;
    this.cacheMisses = 0;
    
    if (this.debug) {
      logger.info(`CachedSecurityExtractor initialized with cache at ${this.cacheDir}`);
    }
  }

  /**
   * Generate a unique hash/fingerprint for a document
   * @param {string} pdfPath - Path to the PDF file
   * @param {Object} metadata - Additional metadata to include in the fingerprint
   * @returns {string} - Document fingerprint
   */
  generateDocumentFingerprint(pdfPath, metadata = {}) {
    // Create hash object
    const hash = crypto.createHash('sha256');
    
    try {
      // Get file stats
      const stats = fs.statSync(pdfPath);
      
      // For smaller files, read the entire content
      if (stats.size < 10 * 1024 * 1024) { // Less than 10MB
        const content = fs.readFileSync(pdfPath);
        hash.update(content);
      } else {
        // For larger files, sample different parts
        const fd = fs.openSync(pdfPath, 'r');
        
        // Read first 1MB
        const firstChunk = Buffer.alloc(1024 * 1024);
        fs.readSync(fd, firstChunk, 0, firstChunk.length, 0);
        hash.update(firstChunk);
        
        // Read middle 1MB
        const middleChunk = Buffer.alloc(1024 * 1024);
        fs.readSync(fd, middleChunk, 0, middleChunk.length, Math.floor(stats.size / 2));
        hash.update(middleChunk);
        
        // Read last 1MB
        const lastChunk = Buffer.alloc(1024 * 1024);
        fs.readSync(fd, lastChunk, 0, lastChunk.length, Math.max(0, stats.size - lastChunk.length));
        hash.update(lastChunk);
        
        fs.closeSync(fd);
      }
      
      // Add filename and metadata to hash
      hash.update(path.basename(pdfPath));
      
      if (metadata && Object.keys(metadata).length > 0) {
        hash.update(JSON.stringify(metadata, Object.keys(metadata).sort()));
      }
      
    } catch (error) {
      logger.error(`Error generating document fingerprint: ${error.message}`);
      
      // If we can't read the file, use file metadata only
      const stats = fs.statSync(pdfPath);
      hash.update(String(stats.size));
      hash.update(String(stats.mtime.getTime()));
      hash.update(path.basename(pdfPath));
    }
    
    // Return the hex digest
    return hash.digest('hex');
  }

  /**
   * Get the cache file path for a document fingerprint
   * @param {string} fingerprint - Document fingerprint
   * @param {string} tenantId - Tenant ID for multi-tenant isolation
   * @returns {string} - Cache file path
   */
  getCachePath(fingerprint, tenantId) {
    if (this.useTenantIsolation && tenantId) {
      const tenantCacheDir = path.join(this.cacheDir, tenantId);
      if (!fs.existsSync(tenantCacheDir)) {
        fs.mkdirSync(tenantCacheDir, { recursive: true });
      }
      return path.join(tenantCacheDir, `${fingerprint}.json`);
    } else {
      return path.join(this.cacheDir, `${fingerprint}.json`);
    }
  }

  /**
   * Check if a document is in the cache
   * @param {string} fingerprint - Document fingerprint
   * @param {string} tenantId - Tenant ID for multi-tenant isolation
   * @returns {boolean} - Whether the document is in the cache
   */
  isInCache(fingerprint, tenantId) {
    const cachePath = this.getCachePath(fingerprint, tenantId);
    
    if (!fs.existsSync(cachePath)) {
      return false;
    }
    
    try {
      const cacheData = JSON.parse(fs.readFileSync(cachePath, 'utf8'));
      
      // Check if cache has expired
      if (cacheData.expirationTime) {
        const expirationTime = new Date(cacheData.expirationTime);
        if (Date.now() > expirationTime.getTime()) {
          if (this.debug) {
            logger.info(`Cache expired for fingerprint: ${fingerprint}`);
          }
          return false;
        }
      }
      
      return true;
    } catch (error) {
      logger.error(`Error checking cache: ${error.message}`);
      return false;
    }
  }

  /**
   * Get document from cache
   * @param {string} fingerprint - Document fingerprint
   * @param {string} tenantId - Tenant ID for multi-tenant isolation
   * @returns {Object|null} - Cached document data or null if not found
   */
  getFromCache(fingerprint, tenantId) {
    const cachePath = this.getCachePath(fingerprint, tenantId);
    
    if (!fs.existsSync(cachePath)) {
      this.cacheMisses++;
      return null;
    }
    
    try {
      const cacheData = JSON.parse(fs.readFileSync(cachePath, 'utf8'));
      
      // Check if cache has expired
      if (cacheData.expirationTime) {
        const expirationTime = new Date(cacheData.expirationTime);
        if (Date.now() > expirationTime.getTime()) {
          if (this.debug) {
            logger.info(`Cache expired for fingerprint: ${fingerprint}`);
          }
          this.cacheMisses++;
          return null;
        }
      }
      
      this.cacheHits++;
      if (this.debug) {
        logger.info(`Cache hit for fingerprint: ${fingerprint}`);
      }
      
      return cacheData.data;
    } catch (error) {
      logger.error(`Error reading cache: ${error.message}`);
      this.cacheMisses++;
      return null;
    }
  }

  /**
   * Save document to cache
   * @param {string} fingerprint - Document fingerprint
   * @param {Object} data - Document data to cache
   * @param {string} tenantId - Tenant ID for multi-tenant isolation
   * @param {number} ttl - Cache TTL in seconds (default: this.cacheTtl)
   * @returns {boolean} - Whether the document was successfully cached
   */
  saveToCache(fingerprint, data, tenantId, ttl = null) {
    const cachePath = this.getCachePath(fingerprint, tenantId);
    
    // Calculate expiration time
    const expirationTime = new Date(Date.now() + ((ttl || this.cacheTtl) * 1000));
    
    // Prepare cache entry
    const cacheEntry = {
      fingerprint,
      data,
      createdAt: new Date().toISOString(),
      expirationTime: expirationTime.toISOString(),
      tenantId: tenantId || null
    };
    
    try {
      fs.writeFileSync(cachePath, JSON.stringify(cacheEntry, null, 2));
      
      if (this.debug) {
        logger.info(`Saved to cache: ${fingerprint}`);
      }
      
      return true;
    } catch (error) {
      logger.error(`Error writing to cache: ${error.message}`);
      return false;
    }
  }

  /**
   * Invalidate (delete) a cache entry
   * @param {string} fingerprint - Document fingerprint
   * @param {string} tenantId - Tenant ID for multi-tenant isolation
   * @returns {boolean} - Whether the cache entry was successfully invalidated
   */
  invalidateCache(fingerprint, tenantId) {
    const cachePath = this.getCachePath(fingerprint, tenantId);
    
    if (!fs.existsSync(cachePath)) {
      return false;
    }
    
    try {
      fs.unlinkSync(cachePath);
      
      if (this.debug) {
        logger.info(`Invalidated cache: ${fingerprint}`);
      }
      
      return true;
    } catch (error) {
      logger.error(`Error invalidating cache: ${error.message}`);
      return false;
    }
  }

  /**
   * Clear all expired cache entries
   * @returns {number} - Number of cache entries cleared
   */
  clearExpiredCache() {
    let clearedCount = 0;
    
    // Walk through all cache directories
    const walkDir = (dir) => {
      const files = fs.readdirSync(dir);
      
      for (const file of files) {
        const filePath = path.join(dir, file);
        const stats = fs.statSync(filePath);
        
        if (stats.isDirectory()) {
          // Recursively walk subdirectories
          clearedCount += walkDir(filePath);
        } else if (file.endsWith('.json')) {
          try {
            const cacheData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
            
            // Check if cache has expired
            if (cacheData.expirationTime) {
              const expirationTime = new Date(cacheData.expirationTime);
              if (Date.now() > expirationTime.getTime()) {
                fs.unlinkSync(filePath);
                clearedCount++;
                
                if (this.debug) {
                  logger.debug(`Cleared expired cache: ${filePath}`);
                }
              }
            }
          } catch (error) {
            logger.error(`Error checking cache expiration: ${error.message}`);
          }
        }
      }
      
      return clearedCount;
    };
    
    // Start walking from the cache directory
    clearedCount = walkDir(this.cacheDir);
    
    if (this.debug) {
      logger.info(`Cleared ${clearedCount} expired cache entries`);
    }
    
    return clearedCount;
  }

  /**
   * Get cache statistics
   * @returns {Object} - Cache statistics
   */
  getCacheStats() {
    // Count total cache entries
    let totalEntries = 0;
    
    const countEntries = (dir) => {
      const files = fs.readdirSync(dir);
      
      for (const file of files) {
        const filePath = path.join(dir, file);
        const stats = fs.statSync(filePath);
        
        if (stats.isDirectory()) {
          // Recursively count subdirectories
          countEntries(filePath);
        } else if (file.endsWith('.json')) {
          totalEntries++;
        }
      }
    };
    
    try {
      countEntries(this.cacheDir);
    } catch (error) {
      logger.error(`Error counting cache entries: ${error.message}`);
    }
    
    // Calculate hit rate
    const totalRequests = this.cacheHits + this.cacheMisses;
    const hitRate = totalRequests > 0 ? (this.cacheHits / totalRequests) * 100 : 0;
    
    return {
      totalEntries,
      cacheHits: this.cacheHits,
      cacheMisses: this.cacheMisses,
      hitRate: `${hitRate.toFixed(2)}%`,
      cacheDirectory: this.cacheDir
    };
  }

  /**
   * Extract securities information from a PDF file with caching
   * @param {string} pdfPath - Path to the PDF file
   * @param {Object} options - Options for extraction and caching
   * @param {string} options.tenantId - Tenant ID for multi-tenant isolation
   * @param {Object} options.metadata - Additional metadata for fingerprinting
   * @param {boolean} options.forceRefresh - Whether to bypass cache and force processing
   * @returns {Promise<Object>} - Extracted securities information
   */
  async extract_from_pdf_cached(pdfPath, options = {}) {
    const { tenantId, metadata = {}, forceRefresh = false } = options;
    
    if (!pdfPath || !fs.existsSync(pdfPath)) {
      return Promise.reject(new Error(`PDF file not found: ${pdfPath}`));
    }
    
    // Generate document fingerprint
    const fingerprint = this.generateDocumentFingerprint(pdfPath, metadata);
    
    // Check cache first if not forcing refresh
    if (!forceRefresh) {
      const cachedData = this.getFromCache(fingerprint, tenantId);
      
      if (cachedData) {
        return Promise.resolve(cachedData);
      }
    }
    
    try {
      // Process document
      const result = await super.extract_from_pdf(pdfPath);
      
      // Save to cache
      this.saveToCache(fingerprint, result, tenantId);
      
      return result;
    } catch (error) {
      logger.error(`Error in extract_from_pdf_cached: ${error.message}`);
      return Promise.reject(error);
    }
  }
}

module.exports = CachedSecurityExtractor;