#!/usr/bin/env python3
"""
Cache Manager Script

This script provides a command-line interface for managing the document cache.
It is used by the cache API endpoints to perform various operations on the cache.
"""

import os
import sys
import json
import argparse
import shutil
from datetime import datetime
import logging
from typing import Dict, Any, List, Optional

# Import the document cache service
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
from services.cache.document_cache_service import DocumentCacheService

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def get_stats(cache_service: DocumentCacheService) -> Dict[str, Any]:
    """
    Get cache statistics.
    
    Args:
        cache_service: The document cache service
        
    Returns:
        Dictionary with cache statistics
    """
    stats = cache_service.get_cache_stats()
    
    # Add disk usage information
    cache_dir = cache_service.cache_dir
    total_size = 0
    file_count = 0
    
    for root, _, files in os.walk(cache_dir):
        for file in files:
            if file.endswith('.json'):
                file_path = os.path.join(root, file)
                total_size += os.path.getsize(file_path)
                file_count += 1
    
    stats['disk_usage'] = {
        'total_bytes': total_size,
        'total_mb': round(total_size / (1024 * 1024), 2),
        'file_count': file_count
    }
    
    # Add tenant information
    tenant_dirs = []
    for item in os.listdir(cache_dir):
        item_path = os.path.join(cache_dir, item)
        if os.path.isdir(item_path) and not item.startswith('.'):
            # Count files and size for this tenant
            tenant_size = 0
            tenant_file_count = 0
            
            for root, _, files in os.walk(item_path):
                for file in files:
                    if file.endswith('.json'):
                        file_path = os.path.join(root, file)
                        tenant_size += os.path.getsize(file_path)
                        tenant_file_count += 1
            
            tenant_dirs.append({
                'tenant_id': item,
                'file_count': tenant_file_count,
                'size_bytes': tenant_size,
                'size_mb': round(tenant_size / (1024 * 1024), 2)
            })
    
    stats['tenants'] = tenant_dirs
    
    return stats

def get_tenant_stats(cache_service: DocumentCacheService, tenant_id: str) -> Dict[str, Any]:
    """
    Get cache statistics for a specific tenant.
    
    Args:
        cache_service: The document cache service
        tenant_id: Tenant ID
        
    Returns:
        Dictionary with tenant cache statistics
    """
    tenant_cache_dir = os.path.join(cache_service.cache_dir, tenant_id)
    
    if not os.path.exists(tenant_cache_dir):
        return {
            'tenant_id': tenant_id,
            'file_count': 0,
            'size_bytes': 0,
            'size_mb': 0,
            'exists': False
        }
    
    # Count files and size for this tenant
    tenant_size = 0
    tenant_file_count = 0
    
    for root, _, files in os.walk(tenant_cache_dir):
        for file in files:
            if file.endswith('.json'):
                file_path = os.path.join(root, file)
                tenant_size += os.path.getsize(file_path)
                tenant_file_count += 1
    
    return {
        'tenant_id': tenant_id,
        'file_count': tenant_file_count,
        'size_bytes': tenant_size,
        'size_mb': round(tenant_size / (1024 * 1024), 2),
        'exists': True
    }

def clear_expired_cache(cache_service: DocumentCacheService) -> Dict[str, Any]:
    """
    Clear all expired cache entries.
    
    Args:
        cache_service: The document cache service
        
    Returns:
        Dictionary with operation result
    """
    cleared_count = cache_service.clear_expired_cache()
    
    return {
        'cleared_count': cleared_count,
        'timestamp': datetime.now().isoformat()
    }

def invalidate_cache_entry(cache_service: DocumentCacheService, fingerprint: str, tenant_id: Optional[str] = None) -> Dict[str, Any]:
    """
    Invalidate a specific cache entry.
    
    Args:
        cache_service: The document cache service
        fingerprint: Document fingerprint
        tenant_id: Tenant ID for multi-tenant isolation
        
    Returns:
        Dictionary with operation result
    """
    invalidated = cache_service.invalidate_cache(fingerprint, tenant_id)
    
    return {
        'fingerprint': fingerprint,
        'tenant_id': tenant_id,
        'invalidated': invalidated,
        'timestamp': datetime.now().isoformat()
    }

def clear_tenant_cache(cache_service: DocumentCacheService, tenant_id: str) -> Dict[str, Any]:
    """
    Clear all cache entries for a specific tenant.
    
    Args:
        cache_service: The document cache service
        tenant_id: Tenant ID
        
    Returns:
        Dictionary with operation result
    """
    tenant_cache_dir = os.path.join(cache_service.cache_dir, tenant_id)
    
    if not os.path.exists(tenant_cache_dir):
        return {
            'tenant_id': tenant_id,
            'cleared': False,
            'message': 'Tenant cache directory not found',
            'timestamp': datetime.now().isoformat()
        }
    
    # Count files before deletion
    file_count = 0
    for root, _, files in os.walk(tenant_cache_dir):
        for file in files:
            if file.endswith('.json'):
                file_count += 1
    
    # Remove tenant cache directory
    shutil.rmtree(tenant_cache_dir)
    
    # Recreate empty directory
    os.makedirs(tenant_cache_dir, exist_ok=True)
    
    return {
        'tenant_id': tenant_id,
        'cleared': True,
        'cleared_count': file_count,
        'timestamp': datetime.now().isoformat()
    }

def clear_all_cache(cache_service: DocumentCacheService) -> Dict[str, Any]:
    """
    Clear all cache entries.
    
    Args:
        cache_service: The document cache service
        
    Returns:
        Dictionary with operation result
    """
    cache_dir = cache_service.cache_dir
    
    # Count files before deletion
    file_count = 0
    for root, _, files in os.walk(cache_dir):
        for file in files:
            if file.endswith('.json'):
                file_count += 1
    
    # Remove all files and subdirectories
    for item in os.listdir(cache_dir):
        item_path = os.path.join(cache_dir, item)
        if os.path.isdir(item_path):
            shutil.rmtree(item_path)
        elif item.endswith('.json'):
            os.remove(item_path)
    
    return {
        'cleared': True,
        'cleared_count': file_count,
        'timestamp': datetime.now().isoformat()
    }

def main():
    # Parse command line arguments
    parser = argparse.ArgumentParser(description='Document Cache Manager')
    parser.add_argument('--command', required=True, choices=[
        'stats', 'tenant-stats', 'clear-expired', 'invalidate', 'clear-tenant', 'clear-all'
    ], help='Command to execute')
    parser.add_argument('--cache-dir', default=None, help='Cache directory')
    parser.add_argument('--tenant-id', default=None, help='Tenant ID')
    parser.add_argument('--fingerprint', default=None, help='Document fingerprint')
    parser.add_argument('--ttl', type=int, default=86400, help='Default TTL in seconds')
    
    args = parser.parse_args()
    
    # Initialize the cache service
    cache_service = DocumentCacheService(
        cache_dir=args.cache_dir,
        default_ttl=args.ttl,
        use_tenant_isolation=True
    )
    
    # Execute the requested command
    result = {}
    
    if args.command == 'stats':
        result = get_stats(cache_service)
    elif args.command == 'tenant-stats':
        if not args.tenant_id:
            result = {'error': 'Tenant ID is required for tenant-stats command'}
        else:
            result = get_tenant_stats(cache_service, args.tenant_id)
    elif args.command == 'clear-expired':
        result = clear_expired_cache(cache_service)
    elif args.command == 'invalidate':
        if not args.fingerprint:
            result = {'error': 'Document fingerprint is required for invalidate command'}
        else:
            result = invalidate_cache_entry(cache_service, args.fingerprint, args.tenant_id)
    elif args.command == 'clear-tenant':
        if not args.tenant_id:
            result = {'error': 'Tenant ID is required for clear-tenant command'}
        else:
            result = clear_tenant_cache(cache_service, args.tenant_id)
    elif args.command == 'clear-all':
        result = clear_all_cache(cache_service)
    
    # Print result as JSON
    print(json.dumps(result, indent=2))

if __name__ == "__main__":
    main()