"""
Securities Extraction Monitoring System

This module provides tools to monitor the performance, success rates, and resource usage 
of the Enhanced Securities Extractor.
"""

import os
import json
import time
import logging
import datetime
import threading
import sqlite3
import psutil
from typing import Dict, List, Any, Optional, Tuple
from collections import defaultdict, deque

# Configure logging
logger = logging.getLogger('securities_monitor')
logger.setLevel(logging.INFO)

# Create console handler if not already set up
if not logger.handlers:
    console_handler = logging.StreamHandler()
    console_handler.setLevel(logging.INFO)
    formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
    console_handler.setFormatter(formatter)
    logger.addHandler(console_handler)

class ExtractionMetrics:
    """
    Class for tracking and storing metrics related to securities extraction.
    """
    
    def __init__(self, db_path: str = 'securities_metrics.db'):
        """
        Initialize the extraction metrics.
        
        Args:
            db_path: Path to the SQLite database for storing metrics
        """
        self.db_path = db_path
        self.memory_queue = deque(maxlen=100)  # For in-memory recent metrics
        self.process = psutil.Process(os.getpid())
        self.lock = threading.Lock()
        
        # Initialize database
        self._init_db()
    
    def _init_db(self):
        """Initialize the SQLite database for storing metrics."""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            # Create tables if they don't exist
            cursor.execute('''
            CREATE TABLE IF NOT EXISTS extraction_jobs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                document_type TEXT,
                tenant_id TEXT,
                document_id TEXT,
                processing_time_ms INTEGER,
                success BOOLEAN,
                error_message TEXT,
                num_securities INTEGER,
                num_complete_securities INTEGER,
                memory_usage_mb REAL,
                cpu_usage_percent REAL
            )
            ''')
            
            cursor.execute('''
            CREATE TABLE IF NOT EXISTS extraction_errors (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                extraction_job_id INTEGER,
                error_type TEXT,
                error_message TEXT,
                trace TEXT,
                FOREIGN KEY (extraction_job_id) REFERENCES extraction_jobs (id)
            )
            ''')
            
            cursor.execute('''
            CREATE TABLE IF NOT EXISTS cache_metrics (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                tenant_id TEXT,
                cache_size INTEGER,
                hit_count INTEGER,
                miss_count INTEGER,
                hit_rate_percent REAL
            )
            ''')
            
            conn.commit()
            conn.close()
            
            logger.info(f"Successfully initialized metrics database at {self.db_path}")
        except Exception as e:
            logger.error(f"Error initializing metrics database: {e}")
    
    def record_extraction_job(self, 
                             document_type: str,
                             tenant_id: Optional[str] = None,
                             document_id: Optional[str] = None,
                             processing_time_ms: Optional[int] = None,
                             success: bool = True,
                             error_message: Optional[str] = None,
                             num_securities: Optional[int] = None,
                             num_complete_securities: Optional[int] = None) -> int:
        """
        Record metrics for an extraction job.
        
        Args:
            document_type: Type of document processed
            tenant_id: ID of the tenant (for multi-tenant systems)
            document_id: ID of the document processed
            processing_time_ms: Time taken to process in milliseconds
            success: Whether the extraction was successful
            error_message: Error message if the extraction failed
            num_securities: Number of securities extracted
            num_complete_securities: Number of complete securities (with all fields)
            
        Returns:
            ID of the inserted record
        """
        try:
            # Get current resource usage
            memory_usage_mb = self.process.memory_info().rss / 1024 / 1024
            cpu_usage_percent = self.process.cpu_percent()
            
            # Insert record into database
            with self.lock:
                conn = sqlite3.connect(self.db_path)
                cursor = conn.cursor()
                
                cursor.execute('''
                INSERT INTO extraction_jobs
                (document_type, tenant_id, document_id, processing_time_ms, success, 
                error_message, num_securities, num_complete_securities, memory_usage_mb, cpu_usage_percent)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ''', (
                    document_type, tenant_id, document_id, processing_time_ms, success,
                    error_message, num_securities, num_complete_securities, memory_usage_mb, cpu_usage_percent
                ))
                
                job_id = cursor.lastrowid
                conn.commit()
                conn.close()
            
            # Add to in-memory queue for quick access to recent metrics
            self.memory_queue.append({
                'id': job_id,
                'timestamp': datetime.datetime.now().isoformat(),
                'document_type': document_type,
                'tenant_id': tenant_id,
                'document_id': document_id,
                'processing_time_ms': processing_time_ms,
                'success': success,
                'error_message': error_message,
                'num_securities': num_securities,
                'num_complete_securities': num_complete_securities,
                'memory_usage_mb': memory_usage_mb,
                'cpu_usage_percent': cpu_usage_percent
            })
            
            logger.info(f"Recorded extraction job metrics with ID {job_id}")
            return job_id
            
        except Exception as e:
            logger.error(f"Error recording extraction job metrics: {e}")
            return -1
    
    def record_extraction_error(self, 
                               extraction_job_id: int,
                               error_type: str,
                               error_message: str,
                               trace: Optional[str] = None):
        """
        Record an error that occurred during extraction.
        
        Args:
            extraction_job_id: ID of the related extraction job
            error_type: Type of error
            error_message: Error message
            trace: Stack trace if available
        """
        try:
            with self.lock:
                conn = sqlite3.connect(self.db_path)
                cursor = conn.cursor()
                
                cursor.execute('''
                INSERT INTO extraction_errors
                (extraction_job_id, error_type, error_message, trace)
                VALUES (?, ?, ?, ?)
                ''', (extraction_job_id, error_type, error_message, trace))
                
                conn.commit()
                conn.close()
            
            logger.info(f"Recorded extraction error for job ID {extraction_job_id}")
            
        except Exception as e:
            logger.error(f"Error recording extraction error: {e}")
    
    def record_cache_metrics(self, 
                           tenant_id: Optional[str] = None,
                           cache_size: Optional[int] = None,
                           hit_count: Optional[int] = None,
                           miss_count: Optional[int] = None):
        """
        Record cache metrics.
        
        Args:
            tenant_id: ID of the tenant (for multi-tenant systems)
            cache_size: Size of the cache
            hit_count: Number of cache hits
            miss_count: Number of cache misses
        """
        try:
            hit_rate_percent = 0
            if hit_count is not None and miss_count is not None and (hit_count + miss_count) > 0:
                hit_rate_percent = (hit_count / (hit_count + miss_count)) * 100
            
            with self.lock:
                conn = sqlite3.connect(self.db_path)
                cursor = conn.cursor()
                
                cursor.execute('''
                INSERT INTO cache_metrics
                (tenant_id, cache_size, hit_count, miss_count, hit_rate_percent)
                VALUES (?, ?, ?, ?, ?)
                ''', (tenant_id, cache_size, hit_count, miss_count, hit_rate_percent))
                
                conn.commit()
                conn.close()
            
            logger.info(f"Recorded cache metrics for tenant {tenant_id}")
            
        except Exception as e:
            logger.error(f"Error recording cache metrics: {e}")
    
    def get_recent_metrics(self, limit: int = 100) -> List[Dict[str, Any]]:
        """
        Get the most recent extraction metrics.
        
        Args:
            limit: Maximum number of records to return
            
        Returns:
            List of recent extraction metrics
        """
        try:
            with self.lock:
                conn = sqlite3.connect(self.db_path)
                conn.row_factory = sqlite3.Row
                cursor = conn.cursor()
                
                cursor.execute('''
                SELECT * FROM extraction_jobs
                ORDER BY timestamp DESC
                LIMIT ?
                ''', (limit,))
                
                rows = cursor.fetchall()
                conn.close()
            
            return [dict(row) for row in rows]
            
        except Exception as e:
            logger.error(f"Error getting recent metrics: {e}")
            return []
    
    def get_metrics_by_time_range(self, 
                                start_time: datetime.datetime,
                                end_time: datetime.datetime) -> List[Dict[str, Any]]:
        """
        Get extraction metrics within a time range.
        
        Args:
            start_time: Start of the time range
            end_time: End of the time range
            
        Returns:
            List of extraction metrics within the time range
        """
        try:
            with self.lock:
                conn = sqlite3.connect(self.db_path)
                conn.row_factory = sqlite3.Row
                cursor = conn.cursor()
                
                cursor.execute('''
                SELECT * FROM extraction_jobs
                WHERE timestamp BETWEEN ? AND ?
                ORDER BY timestamp DESC
                ''', (start_time.isoformat(), end_time.isoformat()))
                
                rows = cursor.fetchall()
                conn.close()
            
            return [dict(row) for row in rows]
            
        except Exception as e:
            logger.error(f"Error getting metrics by time range: {e}")
            return []
    
    def get_metrics_by_tenant(self, tenant_id: str) -> List[Dict[str, Any]]:
        """
        Get extraction metrics for a specific tenant.
        
        Args:
            tenant_id: ID of the tenant
            
        Returns:
            List of extraction metrics for the tenant
        """
        try:
            with self.lock:
                conn = sqlite3.connect(self.db_path)
                conn.row_factory = sqlite3.Row
                cursor = conn.cursor()
                
                cursor.execute('''
                SELECT * FROM extraction_jobs
                WHERE tenant_id = ?
                ORDER BY timestamp DESC
                ''', (tenant_id,))
                
                rows = cursor.fetchall()
                conn.close()
            
            return [dict(row) for row in rows]
            
        except Exception as e:
            logger.error(f"Error getting metrics by tenant: {e}")
            return []
    
    def get_extraction_summary(self) -> Dict[str, Any]:
        """
        Get a summary of extraction metrics.
        
        Returns:
            Dictionary with summary statistics
        """
        try:
            with self.lock:
                conn = sqlite3.connect(self.db_path)
                cursor = conn.cursor()
                
                # Get total jobs and success rate
                cursor.execute('''
                SELECT COUNT(*) AS total_jobs,
                       SUM(CASE WHEN success = 1 THEN 1 ELSE 0 END) AS successful_jobs
                FROM extraction_jobs
                ''')
                
                row = cursor.fetchone()
                total_jobs = row[0] if row else 0
                successful_jobs = row[1] if row else 0
                success_rate = (successful_jobs / total_jobs * 100) if total_jobs > 0 else 0
                
                # Get average processing time
                cursor.execute('''
                SELECT AVG(processing_time_ms) AS avg_processing_time
                FROM extraction_jobs
                WHERE processing_time_ms IS NOT NULL
                ''')
                
                row = cursor.fetchone()
                avg_processing_time = row[0] if row and row[0] is not None else 0
                
                # Get document type distribution
                cursor.execute('''
                SELECT document_type, COUNT(*) AS count
                FROM extraction_jobs
                GROUP BY document_type
                ORDER BY count DESC
                ''')
                
                document_types = {}
                for row in cursor.fetchall():
                    document_types[row[0]] = row[1]
                
                # Get common error types
                cursor.execute('''
                SELECT error_type, COUNT(*) AS count
                FROM extraction_errors
                GROUP BY error_type
                ORDER BY count DESC
                LIMIT 10
                ''')
                
                error_types = {}
                for row in cursor.fetchall():
                    error_types[row[0]] = row[1]
                
                # Get resource usage trends
                cursor.execute('''
                SELECT AVG(memory_usage_mb) AS avg_memory_usage,
                       MAX(memory_usage_mb) AS max_memory_usage,
                       AVG(cpu_usage_percent) AS avg_cpu_usage,
                       MAX(cpu_usage_percent) AS max_cpu_usage
                FROM extraction_jobs
                WHERE memory_usage_mb IS NOT NULL AND cpu_usage_percent IS NOT NULL
                ''')
                
                row = cursor.fetchone()
                resource_usage = {
                    'avg_memory_usage_mb': row[0] if row and row[0] is not None else 0,
                    'max_memory_usage_mb': row[1] if row and row[1] is not None else 0,
                    'avg_cpu_usage_percent': row[2] if row and row[2] is not None else 0,
                    'max_cpu_usage_percent': row[3] if row and row[3] is not None else 0
                }
                
                # Get cache performance
                cursor.execute('''
                SELECT AVG(hit_rate_percent) AS avg_hit_rate,
                       MAX(hit_rate_percent) AS max_hit_rate,
                       MIN(hit_rate_percent) AS min_hit_rate
                FROM cache_metrics
                WHERE hit_rate_percent IS NOT NULL
                ''')
                
                row = cursor.fetchone()
                cache_performance = {
                    'avg_hit_rate_percent': row[0] if row and row[0] is not None else 0,
                    'max_hit_rate_percent': row[1] if row and row[1] is not None else 0,
                    'min_hit_rate_percent': row[2] if row and row[2] is not None else 0
                }
                
                # Get time-based trends (last 24 hours)
                cursor.execute('''
                SELECT strftime('%H', timestamp) AS hour,
                       COUNT(*) AS count,
                       AVG(processing_time_ms) AS avg_processing_time,
                       SUM(CASE WHEN success = 1 THEN 1 ELSE 0 END) * 100.0 / COUNT(*) AS success_rate
                FROM extraction_jobs
                WHERE timestamp >= datetime('now', '-1 day')
                GROUP BY hour
                ORDER BY hour
                ''')
                
                hourly_trends = {}
                for row in cursor.fetchall():
                    hourly_trends[row[0]] = {
                        'count': row[1],
                        'avg_processing_time_ms': row[2] if row[2] is not None else 0,
                        'success_rate_percent': row[3] if row[3] is not None else 0
                    }
                
                conn.close()
            
            # Combine all metrics into a summary
            summary = {
                'total_jobs': total_jobs,
                'successful_jobs': successful_jobs,
                'success_rate_percent': success_rate,
                'avg_processing_time_ms': avg_processing_time,
                'document_types': document_types,
                'common_error_types': error_types,
                'resource_usage': resource_usage,
                'cache_performance': cache_performance,
                'hourly_trends': hourly_trends,
                'last_updated': datetime.datetime.now().isoformat()
            }
            
            return summary
            
        except Exception as e:
            logger.error(f"Error getting extraction summary: {e}")
            return {
                'error': str(e),
                'last_updated': datetime.datetime.now().isoformat()
            }

class ExtractionPerformanceTracker:
    """
    Decorator class for tracking securities extraction performance.
    """
    
    def __init__(self, metrics: ExtractionMetrics):
        """
        Initialize the tracker.
        
        Args:
            metrics: ExtractionMetrics instance for storing metrics
        """
        self.metrics = metrics
    
    def __call__(self, func):
        """
        Decorator to track extraction performance.
        
        Args:
            func: Function to decorate
            
        Returns:
            Decorated function
        """
        def wrapper(*args, **kwargs):
            # Extract document info from arguments if available
            document_type = kwargs.get('document_type', 'unknown')
            tenant_id = kwargs.get('tenant_id')
            document_id = kwargs.get('document_id')
            
            # For methods of SecurityExtractor class
            if args and hasattr(args[0], '_detect_document_type'):
                if 'pdf_path' in kwargs:
                    document_id = os.path.basename(kwargs['pdf_path'])
                elif len(args) > 1 and isinstance(args[1], str) and args[1].endswith('.pdf'):
                    document_id = os.path.basename(args[1])
            
            start_time = time.time()
            success = True
            error_message = None
            num_securities = 0
            num_complete_securities = 0
            
            try:
                # Call the original function
                result = func(*args, **kwargs)
                
                # Extract metrics from result if possible
                if isinstance(result, dict):
                    if 'document_type' in result:
                        document_type = result['document_type']
                    
                    if 'securities' in result and isinstance(result['securities'], list):
                        num_securities = len(result['securities'])
                        
                        # Count complete securities
                        num_complete_securities = sum(1 for s in result['securities'] if 
                                                  s.get('isin') and 
                                                  s.get('description') and 
                                                  s.get('value') is not None and 
                                                  s.get('price') is not None and 
                                                  s.get('nominal') is not None)
                    
                    if 'error' in result and result['error']:
                        success = False
                        error_message = result['error']
                
                return result
                
            except Exception as e:
                success = False
                error_message = str(e)
                raise
                
            finally:
                # Calculate processing time
                end_time = time.time()
                processing_time_ms = int((end_time - start_time) * 1000)
                
                # Record metrics
                job_id = self.metrics.record_extraction_job(
                    document_type=document_type,
                    tenant_id=tenant_id,
                    document_id=document_id,
                    processing_time_ms=processing_time_ms,
                    success=success,
                    error_message=error_message,
                    num_securities=num_securities,
                    num_complete_securities=num_complete_securities
                )
                
                # Record error details if needed
                if not success and error_message:
                    import traceback
                    trace = traceback.format_exc()
                    error_type = error_message.split(':')[0] if ':' in error_message else 'Unknown'
                    
                    self.metrics.record_extraction_error(
                        extraction_job_id=job_id,
                        error_type=error_type,
                        error_message=error_message,
                        trace=trace
                    )
        
        return wrapper

# Initialize singleton instance
metrics = ExtractionMetrics()

def track_extraction_performance(func):
    """
    Decorator for tracking securities extraction performance.
    
    Args:
        func: Function to decorate
        
    Returns:
        Decorated function
    """
    tracker = ExtractionPerformanceTracker(metrics)
    return tracker(func)

def get_extraction_metrics():
    """
    Get the global extraction metrics instance.
    
    Returns:
        ExtractionMetrics instance
    """
    return metrics