/**
 * Cache Configuration
 * 
 * Configuration for the document caching system.
 */

const path = require('path');

module.exports = {
  // Default cache directory
  cacheDir: process.env.CACHE_DIR || path.resolve(__dirname, '../../cache'),
  
  // Default TTL in seconds (24 hours)
  defaultTtl: parseInt(process.env.CACHE_DEFAULT_TTL || '86400', 10),
  
  // Whether to use tenant isolation
  useTenantIsolation: process.env.CACHE_USE_TENANT_ISOLATION !== 'false',
  
  // Maximum cache size per tenant in bytes (100MB default)
  maxTenantCacheSize: parseInt(process.env.CACHE_MAX_TENANT_SIZE || '104857600', 10),
  
  // Whether to log cache operations
  logCacheOperations: process.env.CACHE_LOG_OPERATIONS !== 'false',
  
  // Cache maintenance schedule (cron format) - default is every day at 2AM
  maintenanceSchedule: process.env.CACHE_MAINTENANCE_SCHEDULE || '0 2 * * *',
  
  // Cache middleware settings
  middleware: {
    enabled: process.env.CACHE_MIDDLEWARE_ENABLED !== 'false',
    // Routes to exclude from caching (regex patterns)
    excludeRoutes: [
      /^\/api\/auth/,
      /^\/api\/health/,
      /^\/api\/documents\/upload/
    ],
    // HTTP methods to cache (default: only GET)
    methods: ['GET'],
    // HTTP status codes to cache (default: only 200)
    statusCodes: [200]
  },
  
  // Document fingerprinting options
  fingerprinting: {
    // Whether to use whole file content for small files
    useWholeContentForSmallFiles: true,
    // Size threshold for considering a file "small" (10MB)
    smallFileSizeThreshold: 10 * 1024 * 1024,
    // Whether to include file metadata in fingerprint
    includeFileMetadata: true
  }
};