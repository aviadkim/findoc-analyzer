"""
Enhanced Document Processor with Caching

This module extends the DocumentProcessor with caching capabilities to avoid
reprocessing the same document multiple times, improving performance and
reducing resource usage.
"""

import os
import logging
import time
import json
from typing import Dict, Any, Optional, List
from datetime import datetime

from .document_processor import DocumentProcessor
from ..services.cache.document_cache_service import DocumentCacheService

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class CachedDocumentProcessor(DocumentProcessor):
    """
    Document processor with caching capabilities.
    Extends the base DocumentProcessor to add caching of processing results.
    """
    
    def __init__(self, api_key: Optional[str] = None, 
                 cache_dir: Optional[str] = None,
                 cache_ttl: int = 86400,
                 use_tenant_isolation: bool = True):
        """
        Initialize the CachedDocumentProcessor.
        
        Args:
            api_key: API key for AI services
            cache_dir: Directory to store cache files
            cache_ttl: Default Time-To-Live in seconds (defaults to 24 hours)
            use_tenant_isolation: Whether to isolate cache by tenant
        """
        super().__init__(api_key)
        
        # Initialize cache service
        self.cache_service = DocumentCacheService(
            cache_dir=cache_dir,
            default_ttl=cache_ttl,
            use_tenant_isolation=use_tenant_isolation
        )
        
        logger.info("Initialized CachedDocumentProcessor")
    
    def process(self, pdf_path: str, output_dir: Optional[str] = None, 
                languages: List[str] = ['eng', 'heb'],
                tenant_id: Optional[str] = None,
                metadata: Optional[Dict[str, Any]] = None,
                force_refresh: bool = False) -> Dict[str, Any]:
        """
        Process a financial document with caching.
        
        Args:
            pdf_path: Path to the PDF file
            output_dir: Directory to save output files
            languages: List of languages for OCR
            tenant_id: Tenant ID for multi-tenant isolation
            metadata: Additional metadata to include in the fingerprint
            force_refresh: Whether to bypass cache and force processing
            
        Returns:
            Processed financial data
        """
        start_time = time.time()
        
        # Set output directory
        self.output_dir = output_dir or os.path.join(os.path.dirname(pdf_path), 'output')
        os.makedirs(self.output_dir, exist_ok=True)
        
        logger.info(f"Processing document: {pdf_path}")
        logger.info(f"Output directory: {self.output_dir}")
        
        # Generate document fingerprint
        document_fingerprint = self.cache_service.generate_document_fingerprint(pdf_path, metadata)
        
        # Check if result is in cache and we're not forcing a refresh
        if not force_refresh:
            cached_result = self.cache_service.get_from_cache(document_fingerprint, tenant_id)
            
            if cached_result:
                logger.info(f"Using cached result for document {os.path.basename(pdf_path)} (fingerprint: {document_fingerprint})")
                logger.info(f"Retrieved from cache in {time.time() - start_time:.2f} seconds")
                
                # Save cached result to output directory
                output_path = os.path.join(self.output_dir, f"{os.path.basename(pdf_path).split('.')[0]}_processed.json")
                with open(output_path, 'w', encoding='utf-8') as f:
                    json.dump(cached_result, f, indent=2, ensure_ascii=False)
                
                return cached_result
        
        # If not in cache or forcing refresh, process the document
        logger.info(f"Processing document (fingerprint: {document_fingerprint})")
        
        # Process document using parent class method
        result = super().process(pdf_path, output_dir, languages)
        
        # Save result to cache
        self.cache_service.save_to_cache(document_fingerprint, result, tenant_id=tenant_id)
        
        logger.info(f"Processing completed and result cached in {time.time() - start_time:.2f} seconds")
        
        return result
    
    def invalidate_cache(self, document_fingerprint: str, tenant_id: Optional[str] = None) -> bool:
        """
        Invalidate the cache for a document.
        
        Args:
            document_fingerprint: Unique fingerprint of the document
            tenant_id: Tenant ID for multi-tenant isolation
            
        Returns:
            Whether the cache was successfully invalidated
        """
        return self.cache_service.invalidate_cache(document_fingerprint, tenant_id)
    
    def get_cache_stats(self) -> Dict[str, Any]:
        """
        Get cache statistics.
        
        Returns:
            Dictionary with cache statistics
        """
        return self.cache_service.get_cache_stats()
    
    def clear_expired_cache(self) -> int:
        """
        Clear all expired cache entries.
        
        Returns:
            Number of cache entries cleared
        """
        return self.cache_service.clear_expired_cache()


# Example usage
if __name__ == "__main__":
    # This will only run when the script is executed directly
    import sys
    import os
    
    if len(sys.argv) > 1:
        pdf_path = sys.argv[1]
        output_dir = sys.argv[2] if len(sys.argv) > 2 else None
        
        # Get API key from environment
        api_key = os.getenv('GOOGLE_API_KEY') or os.getenv('OPENAI_API_KEY')
        
        # Create processor
        processor = CachedDocumentProcessor(api_key=api_key)
        
        # Process document
        result = processor.process(pdf_path, output_dir)
        
        print(f"Processing complete, extracted {len(result['portfolio']['securities'])} securities")
        print(f"Total value: {result['portfolio']['total_value']} {result['portfolio']['currency']}")
        
        # Print cache stats
        print(f"Cache stats: {processor.get_cache_stats()}")
    else:
        print("Please provide a PDF file path")