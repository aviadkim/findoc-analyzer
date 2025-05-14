"""
Document Cache Service

This service provides caching functionality for document processing results.
It generates unique fingerprints for documents and stores/retrieves results from the cache.
"""

import os
import json
import hashlib
import logging
import time
from typing import Dict, Any, Optional, List, Union
from datetime import datetime, timedelta

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class DocumentCacheService:
    """
    Service for caching document processing results based on document content fingerprints.
    Supports file-based caching with TTL (Time-To-Live) and tenant isolation.
    """
    
    def __init__(self, cache_dir: Optional[str] = None, default_ttl: int = 86400, use_tenant_isolation: bool = True):
        """
        Initialize the document cache service.
        
        Args:
            cache_dir: Directory to store cache files (defaults to ./cache)
            default_ttl: Default Time-To-Live in seconds (defaults to 24 hours)
            use_tenant_isolation: Whether to isolate cache by tenant
        """
        self.cache_dir = cache_dir or os.path.join(os.path.dirname(__file__), '../../../cache')
        self.default_ttl = default_ttl
        self.use_tenant_isolation = use_tenant_isolation
        
        # Create cache directory if it doesn't exist
        os.makedirs(self.cache_dir, exist_ok=True)
        
        # For statistics
        self.cache_hits = 0
        self.cache_misses = 0
        
        logger.info(f"Document cache service initialized with cache directory: {self.cache_dir}")
    
    def _get_cache_path(self, document_fingerprint: str, tenant_id: Optional[str] = None) -> str:
        """
        Get the path to the cache file for a document.
        
        Args:
            document_fingerprint: Unique fingerprint of the document
            tenant_id: Tenant ID for multi-tenant isolation
            
        Returns:
            Path to the cache file
        """
        if self.use_tenant_isolation and tenant_id:
            # Create tenant-specific subdirectory
            tenant_cache_dir = os.path.join(self.cache_dir, tenant_id)
            os.makedirs(tenant_cache_dir, exist_ok=True)
            return os.path.join(tenant_cache_dir, f"{document_fingerprint}.json")
        else:
            return os.path.join(self.cache_dir, f"{document_fingerprint}.json")
    
    def generate_document_fingerprint(self, file_path: str, metadata: Optional[Dict[str, Any]] = None) -> str:
        """
        Generate a unique fingerprint/hash for a document based on its content.
        
        Args:
            file_path: Path to the document file
            metadata: Additional metadata to include in the fingerprint
            
        Returns:
            Unique document fingerprint
        """
        # Initialize hash object
        hasher = hashlib.sha256()
        
        # Add file content to hash
        try:
            # For smaller files, read the entire content
            if os.path.getsize(file_path) < 10 * 1024 * 1024:  # Less than 10MB
                with open(file_path, 'rb') as f:
                    hasher.update(f.read())
            else:
                # For larger files, read in chunks and sample parts
                with open(file_path, 'rb') as f:
                    # Read first 1MB
                    hasher.update(f.read(1024 * 1024))
                    
                    # Seek to middle and read 1MB
                    f.seek(os.path.getsize(file_path) // 2)
                    hasher.update(f.read(1024 * 1024))
                    
                    # Seek to near end and read last 1MB
                    f.seek(-1024 * 1024, 2)
                    hasher.update(f.read())
        except Exception as e:
            logger.error(f"Error reading file for fingerprinting: {e}")
            # If we can't read the file, use file metadata
            file_stat = os.stat(file_path)
            hasher.update(str(file_stat.st_size).encode())
            hasher.update(str(file_stat.st_mtime).encode())
        
        # Add file path and metadata to hash
        hasher.update(os.path.basename(file_path).encode())
        
        if metadata:
            # Ensure consistent serialization of metadata
            hasher.update(json.dumps(metadata, sort_keys=True).encode())
        
        # Return the hexadecimal digest
        return hasher.hexdigest()
    
    def get_from_cache(self, document_fingerprint: str, tenant_id: Optional[str] = None) -> Optional[Dict[str, Any]]:
        """
        Get document processing results from cache.
        
        Args:
            document_fingerprint: Unique fingerprint of the document
            tenant_id: Tenant ID for multi-tenant isolation
            
        Returns:
            Cached processing results or None if not found
        """
        cache_path = self._get_cache_path(document_fingerprint, tenant_id)
        
        if not os.path.exists(cache_path):
            self.cache_misses += 1
            return None
        
        try:
            with open(cache_path, 'r', encoding='utf-8') as f:
                cache_data = json.load(f)
            
            # Check if cache entry has expired
            if 'expiration_time' in cache_data:
                expiration_time = datetime.fromisoformat(cache_data['expiration_time'])
                if datetime.now() > expiration_time:
                    logger.info(f"Cache entry for {document_fingerprint} has expired.")
                    self.cache_misses += 1
                    return None
            
            self.cache_hits += 1
            logger.info(f"Cache hit for document fingerprint: {document_fingerprint}")
            return cache_data['data']
            
        except Exception as e:
            logger.error(f"Error reading cache for {document_fingerprint}: {e}")
            self.cache_misses += 1
            return None
    
    def save_to_cache(self, document_fingerprint: str, data: Dict[str, Any], 
                      ttl: Optional[int] = None, tenant_id: Optional[str] = None) -> bool:
        """
        Save document processing results to cache.
        
        Args:
            document_fingerprint: Unique fingerprint of the document
            data: Processing results to cache
            ttl: Time-To-Live in seconds (optional, defaults to default_ttl)
            tenant_id: Tenant ID for multi-tenant isolation
            
        Returns:
            Whether the data was successfully cached
        """
        ttl = ttl or self.default_ttl
        cache_path = self._get_cache_path(document_fingerprint, tenant_id)
        
        # Calculate expiration time
        expiration_time = (datetime.now() + timedelta(seconds=ttl)).isoformat()
        
        # Prepare cache entry
        cache_entry = {
            'fingerprint': document_fingerprint,
            'data': data,
            'created_at': datetime.now().isoformat(),
            'expiration_time': expiration_time,
            'tenant_id': tenant_id
        }
        
        try:
            with open(cache_path, 'w', encoding='utf-8') as f:
                json.dump(cache_entry, f, indent=2, ensure_ascii=False)
            
            logger.info(f"Saved document processing results to cache: {document_fingerprint}")
            return True
            
        except Exception as e:
            logger.error(f"Error saving to cache for {document_fingerprint}: {e}")
            return False
    
    def invalidate_cache(self, document_fingerprint: str, tenant_id: Optional[str] = None) -> bool:
        """
        Invalidate (delete) a cache entry.
        
        Args:
            document_fingerprint: Unique fingerprint of the document
            tenant_id: Tenant ID for multi-tenant isolation
            
        Returns:
            Whether the cache entry was successfully invalidated
        """
        cache_path = self._get_cache_path(document_fingerprint, tenant_id)
        
        if os.path.exists(cache_path):
            try:
                os.remove(cache_path)
                logger.info(f"Invalidated cache for document fingerprint: {document_fingerprint}")
                return True
            except Exception as e:
                logger.error(f"Error invalidating cache for {document_fingerprint}: {e}")
                return False
        else:
            logger.info(f"No cache entry found for document fingerprint: {document_fingerprint}")
            return False
    
    def clear_expired_cache(self) -> int:
        """
        Clear all expired cache entries.
        
        Returns:
            Number of cache entries cleared
        """
        cleared_count = 0
        
        # Walk through all files in cache directory and its subdirectories
        for root, _, files in os.walk(self.cache_dir):
            for file in files:
                if file.endswith('.json'):
                    file_path = os.path.join(root, file)
                    try:
                        with open(file_path, 'r', encoding='utf-8') as f:
                            cache_data = json.load(f)
                        
                        # Check if cache entry has expired
                        if 'expiration_time' in cache_data:
                            expiration_time = datetime.fromisoformat(cache_data['expiration_time'])
                            if datetime.now() > expiration_time:
                                os.remove(file_path)
                                cleared_count += 1
                                logger.debug(f"Cleared expired cache entry: {file_path}")
                    except Exception as e:
                        logger.error(f"Error checking cache expiration for {file_path}: {e}")
        
        logger.info(f"Cleared {cleared_count} expired cache entries")
        return cleared_count
    
    def get_cache_stats(self) -> Dict[str, Any]:
        """
        Get cache statistics.
        
        Returns:
            Dictionary with cache statistics
        """
        # Count total cache entries
        total_entries = 0
        for root, _, files in os.walk(self.cache_dir):
            for file in files:
                if file.endswith('.json'):
                    total_entries += 1
        
        # Calculate hit rate
        total_requests = self.cache_hits + self.cache_misses
        hit_rate = (self.cache_hits / total_requests) * 100 if total_requests > 0 else 0
        
        return {
            'total_entries': total_entries,
            'cache_hits': self.cache_hits,
            'cache_misses': self.cache_misses,
            'hit_rate': f"{hit_rate:.2f}%",
            'cache_directory': self.cache_dir
        }
    
    def get_tenant_cache_size(self, tenant_id: str) -> int:
        """
        Get the size of cache entries for a specific tenant.
        
        Args:
            tenant_id: Tenant ID
            
        Returns:
            Size of tenant's cache in bytes
        """
        if not self.use_tenant_isolation:
            logger.warning("Tenant isolation is disabled, cannot get tenant cache size.")
            return 0
        
        tenant_cache_dir = os.path.join(self.cache_dir, tenant_id)
        
        if not os.path.exists(tenant_cache_dir):
            return 0
        
        total_size = 0
        for root, _, files in os.walk(tenant_cache_dir):
            for file in files:
                if file.endswith('.json'):
                    file_path = os.path.join(root, file)
                    total_size += os.path.getsize(file_path)
        
        return total_size


# Example usage
if __name__ == "__main__":
    # Create cache service
    cache_service = DocumentCacheService()
    
    # Example document
    sample_document = "/path/to/document.pdf"
    
    # Generate fingerprint
    if os.path.exists(sample_document):
        fingerprint = cache_service.generate_document_fingerprint(sample_document)
        
        # Check if in cache
        cached_data = cache_service.get_from_cache(fingerprint)
        
        if cached_data:
            print(f"Found in cache: {cached_data}")
        else:
            # Mock processing results
            processing_results = {
                "document_id": "sample123",
                "securities": [
                    {"isin": "US0378331005", "name": "Apple Inc.", "value": 1000},
                    {"isin": "US5949181045", "name": "Microsoft Corp.", "value": 2000}
                ],
                "total_value": 3000,
                "processed_at": datetime.now().isoformat()
            }
            
            # Save to cache with 1 hour TTL
            cache_service.save_to_cache(fingerprint, processing_results, ttl=3600)
            
            print(f"Saved to cache with fingerprint: {fingerprint}")
    else:
        print(f"Sample document not found: {sample_document}")
    
    # Print cache stats
    print(f"Cache stats: {cache_service.get_cache_stats()}")