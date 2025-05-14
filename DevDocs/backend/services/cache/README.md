# Document Cache Service

This directory contains the caching components for the FinDoc Analyzer project.

## Purpose

The cache service provides efficient document processing by:

1. Generating unique fingerprints for documents based on their content
2. Storing processed results in a cache (file-based)
3. Retrieving cached results when processing the same document again
4. Managing cache expiration (TTL) to ensure data freshness
5. Supporting multi-tenant isolation for security

## Structure

- **cacheService.js**: Core JavaScript caching service for general purpose caching
- **document_cache_service.py**: Python implementation for document-specific caching
- **cache_manager.py**: CLI tool for cache management operations
- **README.md**: This documentation file

## Usage Examples

### JavaScript Usage

```javascript
const CachedSecurityExtractor = require('./enhanced_processing/security_extractor_cached');

// Create a cached extractor
const extractor = new CachedSecurityExtractor({
  debug: true,
  cacheDir: './cache',
  cacheTtl: 86400, // 24 hours
  useTenantIsolation: true
});

// Extract securities with caching
async function processDocument(pdfPath, tenantId) {
  try {
    const result = await extractor.extract_from_pdf_cached(pdfPath, {
      tenantId,
      metadata: { documentType: 'portfolio' },
      forceRefresh: false
    });
    
    console.log(`Extracted ${result.securities.length} securities`);
    console.log(`Cache stats: ${JSON.stringify(extractor.getCacheStats())}`);
    
    return result;
  } catch (error) {
    console.error(`Error: ${error.message}`);
  }
}
```

### Python Usage

```python
from services.cache.document_cache_service import DocumentCacheService
from enhanced_processing.document_processor_cached import CachedDocumentProcessor

# Create a cached processor
processor = CachedDocumentProcessor(
    api_key="your-api-key",
    cache_dir="./cache",
    cache_ttl=86400,  # 24 hours
    use_tenant_isolation=True
)

# Process a document with caching
def process_document(pdf_path, tenant_id=None):
    result = processor.process(
        pdf_path,
        output_dir="./output",
        languages=["eng", "heb"],
        tenant_id=tenant_id,
        metadata={"document_type": "portfolio"},
        force_refresh=False
    )
    
    print(f"Processed document with {len(result['portfolio']['securities'])} securities")
    print(f"Cache stats: {processor.get_cache_stats()}")
    
    return result
```

## API Endpoints

The cache service exposes the following API endpoints:

- `GET /api/cache/stats` - Get cache statistics (admin only)
- `GET /api/cache/info` - Get tenant-specific cache info
- `POST /api/cache/clear` - Clear expired cache entries (admin only)
- `DELETE /api/cache/:fingerprint` - Invalidate a specific cache entry
- `DELETE /api/cache/tenant/:tenant_id` - Clear all cache for a tenant (admin only)
- `DELETE /api/cache` - Clear all cache entries (admin only)

## Cache Fingerprinting

Documents are fingerprinted using a SHA-256 hash of:
- Document content (or samples of content for large documents)
- Document filename
- Additional metadata (if provided)

This ensures that even if the filename changes, the same document will have the same fingerprint.

## Multi-Tenant Considerations

The caching system supports multi-tenant isolation by:
- Storing each tenant's cache in a separate subdirectory
- Isolating cache retrieval by tenant ID
- Implementing permission checks for cache management operations

## Error Handling

The cache service implements robust error handling:
- Graceful degradation when cache operations fail
- Automatic fallback to full processing when cache retrieval fails
- Logging of all cache operations for troubleshooting

## Performance Impact

Enabling document caching can significantly improve performance:
- Eliminates redundant processing of identical documents
- Reduces CPU and memory usage
- Decreases response time for repeat document processing
- Minimizes API costs for external services

## Cache Maintenance

The system automatically maintains the cache:
- Expired entries are cleared periodically
- Entries follow a configurable TTL (Time-To-Live) policy
- Command-line tools are available for administrative operations