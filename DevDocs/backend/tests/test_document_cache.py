"""
Document Cache Service Tests

Tests for the Python implementation of the document caching functionality.
"""

import os
import sys
import unittest
import tempfile
import shutil
import json
import time
from datetime import datetime, timedelta
import hashlib

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Import the document cache service
from services.cache.document_cache_service import DocumentCacheService

class TestDocumentCacheService(unittest.TestCase):
    """Test cases for the document cache service."""
    
    def setUp(self):
        """Set up test fixtures."""
        # Create temporary directory for cache
        self.cache_dir = tempfile.mkdtemp()
        
        # Create a test document
        self.test_doc_dir = tempfile.mkdtemp()
        self.test_doc_path = os.path.join(self.test_doc_dir, 'test_document.pdf')
        
        # Create a dummy PDF file
        with open(self.test_doc_path, 'wb') as f:
            f.write(b'%PDF-1.5\nTest PDF content\n%%EOF')
        
        # Create the cache service
        self.cache_service = DocumentCacheService(
            cache_dir=self.cache_dir,
            default_ttl=60,  # 1 minute
            use_tenant_isolation=True
        )
        
        # Test data
        self.test_data = {
            'document_id': 'test123',
            'securities': [
                {'isin': 'US0378331005', 'name': 'Apple Inc.', 'value': 1000},
                {'isin': 'US5949181045', 'name': 'Microsoft Corp.', 'value': 2000}
            ],
            'total_value': 3000,
            'processed_at': datetime.now().isoformat()
        }
    
    def tearDown(self):
        """Tear down test fixtures."""
        # Remove test directories
        shutil.rmtree(self.cache_dir, ignore_errors=True)
        shutil.rmtree(self.test_doc_dir, ignore_errors=True)
    
    def test_generate_document_fingerprint(self):
        """Test document fingerprint generation."""
        # Generate fingerprint
        fingerprint1 = self.cache_service.generate_document_fingerprint(self.test_doc_path)
        fingerprint2 = self.cache_service.generate_document_fingerprint(self.test_doc_path)
        
        # Fingerprints should be consistent
        self.assertEqual(fingerprint1, fingerprint2)
        self.assertTrue(isinstance(fingerprint1, str))
        self.assertTrue(len(fingerprint1) > 0)
        
        # Test with metadata
        metadata = {'document_type': 'portfolio', 'user_id': '12345'}
        fingerprint_with_metadata = self.cache_service.generate_document_fingerprint(
            self.test_doc_path, metadata
        )
        
        # Should be different with metadata
        self.assertNotEqual(fingerprint1, fingerprint_with_metadata)
    
    def test_cache_operations(self):
        """Test basic cache operations."""
        # Generate fingerprint
        fingerprint = self.cache_service.generate_document_fingerprint(self.test_doc_path)
        
        # Initially should not be in cache
        self.assertIsNone(self.cache_service.get_from_cache(fingerprint))
        
        # Save to cache
        self.assertTrue(self.cache_service.save_to_cache(fingerprint, self.test_data))
        
        # Should now be in cache
        cached_data = self.cache_service.get_from_cache(fingerprint)
        self.assertIsNotNone(cached_data)
        self.assertEqual(cached_data['document_id'], self.test_data['document_id'])
        self.assertEqual(len(cached_data['securities']), len(self.test_data['securities']))
        
        # Invalidate cache
        self.assertTrue(self.cache_service.invalidate_cache(fingerprint))
        
        # Should no longer be in cache
        self.assertIsNone(self.cache_service.get_from_cache(fingerprint))
    
    def test_tenant_isolation(self):
        """Test tenant isolation."""
        tenant1 = 'tenant1'
        tenant2 = 'tenant2'
        
        fingerprint = self.cache_service.generate_document_fingerprint(self.test_doc_path)
        
        # Save to cache for tenant1
        self.cache_service.save_to_cache(fingerprint, self.test_data, tenant_id=tenant1)
        
        # Save different data for tenant2
        tenant2_data = self.test_data.copy()
        tenant2_data['document_id'] = 'tenant2-doc'
        self.cache_service.save_to_cache(fingerprint, tenant2_data, tenant_id=tenant2)
        
        # Get from cache for each tenant
        tenant1_cached = self.cache_service.get_from_cache(fingerprint, tenant_id=tenant1)
        tenant2_cached = self.cache_service.get_from_cache(fingerprint, tenant_id=tenant2)
        
        # Should be isolated
        self.assertEqual(tenant1_cached['document_id'], 'test123')
        self.assertEqual(tenant2_cached['document_id'], 'tenant2-doc')
        
        # Tenant directories should exist
        self.assertTrue(os.path.exists(os.path.join(self.cache_dir, tenant1)))
        self.assertTrue(os.path.exists(os.path.join(self.cache_dir, tenant2)))
    
    def test_cache_expiration(self):
        """Test cache expiration."""
        fingerprint = self.cache_service.generate_document_fingerprint(self.test_doc_path)
        
        # Save to cache with 1 second TTL
        self.cache_service.save_to_cache(fingerprint, self.test_data, ttl=1)
        
        # Should be in cache initially
        self.assertIsNotNone(self.cache_service.get_from_cache(fingerprint))
        
        # Wait for expiration
        time.sleep(2)
        
        # Should no longer be in cache
        self.assertIsNone(self.cache_service.get_from_cache(fingerprint))
    
    def test_clear_expired_cache(self):
        """Test clearing expired cache entries."""
        fingerprint1 = 'test-fingerprint-1'
        fingerprint2 = 'test-fingerprint-2'
        
        # Save one with short TTL and one with long TTL
        self.cache_service.save_to_cache(fingerprint1, self.test_data, ttl=1)
        self.cache_service.save_to_cache(fingerprint2, self.test_data, ttl=60)
        
        # Wait for first to expire
        time.sleep(2)
        
        # Clear expired entries
        cleared_count = self.cache_service.clear_expired_cache()
        
        # Should have cleared one entry
        self.assertEqual(cleared_count, 1)
        
        # First should be gone, second should remain
        self.assertIsNone(self.cache_service.get_from_cache(fingerprint1))
        self.assertIsNotNone(self.cache_service.get_from_cache(fingerprint2))
    
    def test_cache_stats(self):
        """Test cache statistics."""
        # Initial stats
        stats = self.cache_service.get_cache_stats()
        self.assertEqual(stats['cache_hits'], 0)
        self.assertEqual(stats['cache_misses'], 0)
        
        fingerprint = self.cache_service.generate_document_fingerprint(self.test_doc_path)
        
        # Miss
        self.cache_service.get_from_cache(fingerprint)
        stats = self.cache_service.get_cache_stats()
        self.assertEqual(stats['cache_misses'], 1)
        
        # Save to cache
        self.cache_service.save_to_cache(fingerprint, self.test_data)
        
        # Hit
        self.cache_service.get_from_cache(fingerprint)
        stats = self.cache_service.get_cache_stats()
        self.assertEqual(stats['cache_hits'], 1)
        self.assertEqual(stats['cache_misses'], 1)


if __name__ == '__main__':
    unittest.main()