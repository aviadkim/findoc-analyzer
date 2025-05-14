"""
Integration module for optimized document processor.

This module provides integrations to incorporate the optimized document processor
into the existing system with minimal changes to existing code. It includes:

1. Compatibility wrappers for existing APIs
2. Configuration utilities for processor settings
3. Detection logic to automatically select the best processor
4. Monitoring capabilities
"""

import os
import json
import logging
import time
from typing import Dict, List, Any, Optional, Tuple, Union
from functools import wraps

# Import processors
from document_processor import DocumentProcessor
from financial_document_processor import FinancialDocumentProcessor
from enhanced_processing.optimized_document_processor import OptimizedDocumentProcessor

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class ProcessorConfiguration:
    """Configuration for document processor selection and options."""
    
    # Default configuration
    DEFAULT_CONFIG = {
        "large_file_threshold_mb": 10,
        "max_workers": 4,
        "memory_limit_percent": 0.8,
        "optimize_all_pdfs": False,
        "optimize_all_excel": False,
        "optimize_all_word": False,
        "track_metrics": True,
        "async_processing": False,
        "chunk_size": 10,
        "distributed_mode": "local"  # options: local, celery, redis
    }
    
    def __init__(self, config_path: Optional[str] = None):
        """
        Initialize configuration.
        
        Args:
            config_path: Path to configuration file (JSON)
        """
        self.config = self.DEFAULT_CONFIG.copy()
        
        if config_path and os.path.exists(config_path):
            try:
                with open(config_path, 'r') as f:
                    user_config = json.load(f)
                self.config.update(user_config)
                logger.info(f"Loaded processor configuration from {config_path}")
            except Exception as e:
                logger.error(f"Error loading config from {config_path}: {e}")
    
    def get(self, key: str, default=None):
        """Get configuration value."""
        return self.config.get(key, default)
    
    def set(self, key: str, value):
        """Set configuration value."""
        self.config[key] = value
    
    def save(self, config_path: str):
        """Save configuration to file."""
        try:
            with open(config_path, 'w') as f:
                json.dump(self.config, f, indent=2)
            logger.info(f"Saved processor configuration to {config_path}")
            return True
        except Exception as e:
            logger.error(f"Error saving config to {config_path}: {e}")
            return False


class ProcessorSelector:
    """Selects the most appropriate processor based on file characteristics and config."""
    
    def __init__(self, config: Optional[ProcessorConfiguration] = None):
        """
        Initialize selector.
        
        Args:
            config: Processor configuration
        """
        self.config = config or ProcessorConfiguration()
        
        # Initialize processors
        self.standard_processor = FinancialDocumentProcessor()
        self.optimized_processor = OptimizedDocumentProcessor(
            max_workers=self.config.get("max_workers"),
            memory_limit=self.config.get("memory_limit_percent")
        )
    
    def select_processor(self, file_path: str, file_type: str, options: Dict[str, Any] = None) -> Tuple[Any, Dict[str, Any]]:
        """
        Select the most appropriate processor for a file.
        
        Args:
            file_path: Path to the file
            file_type: Type of the file
            options: Processing options
            
        Returns:
            Tuple of (processor, updated_options)
        """
        # Initialize options if None
        if options is None:
            options = {}
        
        # Calculate file size in MB
        file_size_mb = os.path.getsize(file_path) / (1024 * 1024) if os.path.exists(file_path) else 0
        
        # Get threshold
        threshold_mb = self.config.get("large_file_threshold_mb")
        
        # Check if we should use the optimized processor
        use_optimized = any([
            # Large file check
            file_size_mb >= threshold_mb,
            
            # File type specific settings
            (file_type.lower() == "pdf" and self.config.get("optimize_all_pdfs")),
            (file_type.lower() in ["xlsx", "xls"] and self.config.get("optimize_all_excel")),
            (file_type.lower() in ["doc", "docx"] and self.config.get("optimize_all_word")),
            
            # Explicit option
            options.get("use_optimized", False)
        ])
        
        # Update options
        updated_options = options.copy()
        updated_options["track_metrics"] = self.config.get("track_metrics")
        updated_options["large_file"] = file_size_mb >= threshold_mb
        updated_options["chunk_size"] = self.config.get("chunk_size")
        
        if use_optimized:
            logger.info(f"Using optimized processor for {file_path} ({file_size_mb:.2f} MB)")
            return self.optimized_processor, updated_options
        else:
            logger.info(f"Using standard processor for {file_path} ({file_size_mb:.2f} MB)")
            return self.standard_processor, updated_options


class OptimizedProcessorAPI:
    """API compatibility wrapper for optimized document processor."""
    
    def __init__(self, config_path: Optional[str] = None):
        """
        Initialize API.
        
        Args:
            config_path: Path to configuration file
        """
        self.config = ProcessorConfiguration(config_path)
        self.selector = ProcessorSelector(self.config)
        
        # Track processing metrics
        self.processing_stats = {
            "total_calls": 0,
            "optimized_calls": 0,
            "standard_calls": 0,
            "errors": 0,
            "total_processing_time": 0,
            "total_files_size_mb": 0
        }
    
    def process_document(self, file_path: str, file_type: str = None, 
                        processing_options: Optional[Dict] = None) -> Dict[str, Any]:
        """
        Process a document, automatically selecting the best processor.
        
        This method is API-compatible with the standard DocumentProcessor.
        
        Args:
            file_path: Path to the document
            file_type: Type of the document (auto-detected if None)
            processing_options: Options for processing
            
        Returns:
            Extracted document data
        """
        # Update stats
        self.processing_stats["total_calls"] += 1
        
        start_time = time.time()
        
        try:
            # Detect file type if not provided
            if file_type is None:
                _, ext = os.path.splitext(file_path)
                file_type = ext.lower().lstrip('.')
            
            # Select processor
            processor, updated_options = self.selector.select_processor(file_path, file_type, processing_options)
            
            # Update stats based on processor type
            if isinstance(processor, OptimizedDocumentProcessor):
                self.processing_stats["optimized_calls"] += 1
            else:
                self.processing_stats["standard_calls"] += 1
            
            # Process document
            result = processor.process_document(file_path, file_type, updated_options)
            
            # Update file size stats
            if os.path.exists(file_path):
                file_size_mb = os.path.getsize(file_path) / (1024 * 1024)
                self.processing_stats["total_files_size_mb"] += file_size_mb
            
            end_time = time.time()
            processing_time = end_time - start_time
            self.processing_stats["total_processing_time"] += processing_time
            
            # Add processing info to result
            if self.config.get("track_metrics") and "performance_metrics" not in result:
                result["performance_metrics"] = {
                    "processing_time": processing_time,
                    "optimized_processor_used": isinstance(processor, OptimizedDocumentProcessor)
                }
            
            return result
            
        except Exception as e:
            logger.error(f"Error processing document {file_path}: {e}", exc_info=True)
            self.processing_stats["errors"] += 1
            
            # Calculate processing time even for errors
            end_time = time.time()
            self.processing_stats["total_processing_time"] += (end_time - start_time)
            
            return {
                "file_type": file_type or "unknown",
                "processed_at": time.time(),
                "error": str(e)
            }
    
    def process_document_async(self, file_path: str, file_type: str = None,
                              processing_options: Optional[Dict] = None) -> str:
        """
        Process a document asynchronously.
        
        Args:
            file_path: Path to the document
            file_type: Type of the document (auto-detected if None)
            processing_options: Options for processing
            
        Returns:
            Task ID for retrieving results
        """
        # Detect file type if not provided
        if file_type is None:
            _, ext = os.path.splitext(file_path)
            file_type = ext.lower().lstrip('.')
        
        # Select processor
        processor, updated_options = self.selector.select_processor(file_path, file_type, processing_options)
        
        # Make sure we're using the optimized processor for async processing
        if not isinstance(processor, OptimizedDocumentProcessor):
            processor = self.selector.optimized_processor
        
        # Process document asynchronously
        return processor.process_document_async(file_path, file_type, updated_options)
    
    def get_task_result(self, task_id: str) -> Dict[str, Any]:
        """
        Get result of an asynchronous task.
        
        Args:
            task_id: Task identifier
            
        Returns:
            Task result or status information
        """
        return self.selector.optimized_processor.get_task_result(task_id)
    
    def get_processing_stats(self) -> Dict[str, Any]:
        """
        Get processing statistics.
        
        Returns:
            Dictionary with processing statistics
        """
        stats = self.processing_stats.copy()
        
        # Add derived metrics
        if stats["total_calls"] > 0:
            stats["optimized_percentage"] = (stats["optimized_calls"] / stats["total_calls"]) * 100
            stats["error_percentage"] = (stats["errors"] / stats["total_calls"]) * 100
        else:
            stats["optimized_percentage"] = 0
            stats["error_percentage"] = 0
        
        if stats["total_processing_time"] > 0:
            stats["avg_processing_time"] = stats["total_processing_time"] / stats["total_calls"]
            stats["mb_per_second"] = stats["total_files_size_mb"] / stats["total_processing_time"]
        else:
            stats["avg_processing_time"] = 0
            stats["mb_per_second"] = 0
        
        return stats
    
    def reset_stats(self):
        """Reset processing statistics."""
        self.processing_stats = {
            "total_calls": 0,
            "optimized_calls": 0,
            "standard_calls": 0,
            "errors": 0,
            "total_processing_time": 0,
            "total_files_size_mb": 0
        }
    
    def update_config(self, config_updates: Dict[str, Any], save_path: Optional[str] = None):
        """
        Update configuration.
        
        Args:
            config_updates: Dictionary of configuration updates
            save_path: Path to save updated configuration
        """
        for key, value in config_updates.items():
            self.config.set(key, value)
        
        # Re-initialize selector with updated config
        self.selector = ProcessorSelector(self.config)
        
        # Save config if path provided
        if save_path:
            self.config.save(save_path)


# Create module-level API instance for easy import
default_api = OptimizedProcessorAPI()

# Monkey-patching decorator to replace standard processor with optimized one
def optimize_document_processor(func):
    """
    Decorator to replace standard document processor with optimized one.
    
    Usage:
        @optimize_document_processor
        def your_function(file_path, ...):
            # This will use the optimized processor
            result = document_processor.process_document(file_path, ...)
            return result
    """
    @wraps(func)
    def wrapper(*args, **kwargs):
        # Replace standard processor with optimized one during function execution
        global document_processor
        original_processor = None
        
        if 'document_processor' in globals():
            original_processor = globals()['document_processor']
            globals()['document_processor'] = default_api
        
        try:
            # Call the original function
            result = func(*args, **kwargs)
            return result
        finally:
            # Restore original processor
            if original_processor is not None:
                globals()['document_processor'] = original_processor
    
    return wrapper


# Example usage
if __name__ == "__main__":
    import sys
    
    if len(sys.argv) > 1:
        file_path = sys.argv[1]
        
        # Process a document using the API
        api = OptimizedProcessorAPI()
        result = api.process_document(file_path)
        
        print(f"Processing complete!")
        
        # Print processing stats
        stats = api.get_processing_stats()
        print(f"Processing Stats:")
        print(f"  - Total calls: {stats['total_calls']}")
        print(f"  - Optimized processor used: {stats['optimized_calls']} times ({stats['optimized_percentage']:.1f}%)")
        print(f"  - Total processing time: {stats['total_processing_time']:.2f} seconds")
        print(f"  - Average processing time: {stats['avg_processing_time']:.2f} seconds")
        print(f"  - Processing speed: {stats['mb_per_second']:.2f} MB/second")
        
        # Print result summary
        if "error" in result:
            print(f"Error: {result['error']}")
        else:
            print(f"Extracted {len(result.get('isins', []))} ISINs")
            print(f"Found {len(result.get('tables', []))} tables")
            print(f"Text length: {len(result.get('text', ''))}")
            
            # Print performance metrics if available
            if "performance_metrics" in result:
                metrics = result["performance_metrics"]
                if isinstance(metrics, dict) and "total_duration" in metrics:
                    print(f"Performance: {metrics['total_duration']:.2f} seconds")
                    
                    if "stages" in metrics:
                        print("Stage performance:")
                        for stage, stage_data in metrics["stages"].items():
                            if "total_duration" in stage_data:
                                print(f"  - {stage}: {stage_data['total_duration']:.2f} seconds")
    else:
        print("Please provide a file path to process")