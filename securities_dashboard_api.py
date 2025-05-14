"""
API endpoints for the Securities Extraction Monitoring Dashboard.

This module provides Flask API endpoints for retrieving securities extraction metrics.
"""

import os
import json
import datetime
from flask import Flask, request, jsonify
from securities_extraction_monitor import metrics

app = Flask(__name__)

@app.route('/api/extraction/metrics', methods=['GET'])
def get_extraction_metrics():
    """
    Get extraction metrics with optional filtering.
    
    Query parameters:
    - limit: Maximum number of records to return
    - start_time: Start of time range (ISO format)
    - end_time: End of time range (ISO format)
    - tenant_id: ID of the tenant to filter by
    
    Returns:
        JSON response with extraction metrics
    """
    limit = request.args.get('limit', default=100, type=int)
    tenant_id = request.args.get('tenant_id')
    
    # Time range filtering
    start_time_str = request.args.get('start_time')
    end_time_str = request.args.get('end_time')
    
    if start_time_str and end_time_str:
        try:
            start_time = datetime.datetime.fromisoformat(start_time_str)
            end_time = datetime.datetime.fromisoformat(end_time_str)
            result = metrics.get_metrics_by_time_range(start_time, end_time)
        except ValueError:
            return jsonify({'error': 'Invalid time format. Use ISO format (YYYY-MM-DDTHH:MM:SS)'}), 400
    elif tenant_id:
        result = metrics.get_metrics_by_tenant(tenant_id)
    else:
        result = metrics.get_recent_metrics(limit)
    
    return jsonify(result)

@app.route('/api/extraction/summary', methods=['GET'])
def get_extraction_summary():
    """
    Get a summary of extraction metrics.
    
    Returns:
        JSON response with extraction summary
    """
    summary = metrics.get_extraction_summary()
    return jsonify(summary)

@app.route('/api/extraction/errors', methods=['GET'])
def get_extraction_errors():
    """
    Get extraction errors.
    
    Query parameters:
    - limit: Maximum number of errors to return
    
    Returns:
        JSON response with extraction errors
    """
    limit = request.args.get('limit', default=100, type=int)
    
    try:
        conn = metrics._get_db_connection()
        conn.row_factory = lambda cursor, row: {
            col[0]: row[idx] for idx, col in enumerate(cursor.description)
        }
        cursor = conn.cursor()
        
        cursor.execute('''
        SELECT e.*, j.document_type, j.tenant_id, j.document_id
        FROM extraction_errors e
        JOIN extraction_jobs j ON e.extraction_job_id = j.id
        ORDER BY e.timestamp DESC
        LIMIT ?
        ''', (limit,))
        
        result = cursor.fetchall()
        conn.close()
        
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/extraction/performance', methods=['GET'])
def get_extraction_performance():
    """
    Get extraction performance metrics over time.
    
    Query parameters:
    - period: Time period for aggregation (hourly, daily, weekly, monthly)
    - days: Number of days to include (default: 7)
    
    Returns:
        JSON response with performance metrics over time
    """
    period = request.args.get('period', default='daily')
    days = request.args.get('days', default=7, type=int)
    
    # Validate period
    if period not in ['hourly', 'daily', 'weekly', 'monthly']:
        return jsonify({'error': 'Invalid period. Use hourly, daily, weekly, or monthly'}), 400
    
    # Map period to SQLite time format
    period_format = {
        'hourly': '%Y-%m-%d %H:00',
        'daily': '%Y-%m-%d',
        'weekly': '%Y-%W',
        'monthly': '%Y-%m'
    }
    
    # Get performance metrics
    try:
        conn = metrics._get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute(f'''
        SELECT strftime('{period_format[period]}', timestamp) AS time_period,
               COUNT(*) AS total_jobs,
               SUM(CASE WHEN success = 1 THEN 1 ELSE 0 END) AS successful_jobs,
               AVG(processing_time_ms) AS avg_processing_time,
               AVG(memory_usage_mb) AS avg_memory_usage,
               AVG(cpu_usage_percent) AS avg_cpu_usage
        FROM extraction_jobs
        WHERE timestamp >= datetime('now', '-{days} days')
        GROUP BY time_period
        ORDER BY time_period
        ''')
        
        rows = cursor.fetchall()
        conn.close()
        
        result = []
        for row in rows:
            result.append({
                'time_period': row[0],
                'total_jobs': row[1],
                'successful_jobs': row[2],
                'success_rate_percent': (row[2] / row[1] * 100) if row[1] > 0 else 0,
                'avg_processing_time_ms': row[3] if row[3] is not None else 0,
                'avg_memory_usage_mb': row[4] if row[4] is not None else 0,
                'avg_cpu_usage_percent': row[5] if row[5] is not None else 0
            })
        
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/extraction/document-types', methods=['GET'])
def get_document_types():
    """
    Get statistics by document type.
    
    Returns:
        JSON response with document type statistics
    """
    try:
        conn = metrics._get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute('''
        SELECT document_type,
               COUNT(*) AS total_jobs,
               SUM(CASE WHEN success = 1 THEN 1 ELSE 0 END) AS successful_jobs,
               AVG(processing_time_ms) AS avg_processing_time,
               AVG(num_securities) AS avg_securities,
               AVG(num_complete_securities) AS avg_complete_securities
        FROM extraction_jobs
        GROUP BY document_type
        ORDER BY total_jobs DESC
        ''')
        
        rows = cursor.fetchall()
        conn.close()
        
        result = []
        for row in rows:
            result.append({
                'document_type': row[0],
                'total_jobs': row[1],
                'successful_jobs': row[2],
                'success_rate_percent': (row[2] / row[1] * 100) if row[1] > 0 else 0,
                'avg_processing_time_ms': row[3] if row[3] is not None else 0,
                'avg_securities': row[4] if row[4] is not None else 0,
                'avg_complete_securities': row[5] if row[5] is not None else 0,
                'completion_rate_percent': (row[5] / row[4] * 100) if row[4] is not None and row[4] > 0 else 0
            })
        
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/extraction/tenants', methods=['GET'])
def get_tenant_metrics():
    """
    Get metrics by tenant.
    
    Returns:
        JSON response with tenant metrics
    """
    try:
        conn = metrics._get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute('''
        SELECT tenant_id,
               COUNT(*) AS total_jobs,
               SUM(CASE WHEN success = 1 THEN 1 ELSE 0 END) AS successful_jobs,
               AVG(processing_time_ms) AS avg_processing_time,
               AVG(num_securities) AS avg_securities,
               MAX(timestamp) AS last_extraction
        FROM extraction_jobs
        WHERE tenant_id IS NOT NULL
        GROUP BY tenant_id
        ORDER BY total_jobs DESC
        ''')
        
        rows = cursor.fetchall()
        conn.close()
        
        result = []
        for row in rows:
            result.append({
                'tenant_id': row[0],
                'total_jobs': row[1],
                'successful_jobs': row[2],
                'success_rate_percent': (row[2] / row[1] * 100) if row[1] > 0 else 0,
                'avg_processing_time_ms': row[3] if row[3] is not None else 0,
                'avg_securities': row[4] if row[4] is not None else 0,
                'last_extraction': row[5]
            })
        
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/extraction/resource-usage', methods=['GET'])
def get_resource_usage():
    """
    Get resource usage metrics over time.
    
    Query parameters:
    - period: Time period for aggregation (hourly, daily, weekly, monthly)
    - days: Number of days to include (default: 7)
    
    Returns:
        JSON response with resource usage metrics over time
    """
    period = request.args.get('period', default='hourly')
    days = request.args.get('days', default=7, type=int)
    
    # Validate period
    if period not in ['hourly', 'daily', 'weekly', 'monthly']:
        return jsonify({'error': 'Invalid period. Use hourly, daily, weekly, or monthly'}), 400
    
    # Map period to SQLite time format
    period_format = {
        'hourly': '%Y-%m-%d %H:00',
        'daily': '%Y-%m-%d',
        'weekly': '%Y-%W',
        'monthly': '%Y-%m'
    }
    
    # Get resource usage metrics
    try:
        conn = metrics._get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute(f'''
        SELECT strftime('{period_format[period]}', timestamp) AS time_period,
               AVG(memory_usage_mb) AS avg_memory_usage,
               MAX(memory_usage_mb) AS max_memory_usage,
               AVG(cpu_usage_percent) AS avg_cpu_usage,
               MAX(cpu_usage_percent) AS max_cpu_usage,
               COUNT(*) AS num_jobs
        FROM extraction_jobs
        WHERE timestamp >= datetime('now', '-{days} days')
        GROUP BY time_period
        ORDER BY time_period
        ''')
        
        rows = cursor.fetchall()
        conn.close()
        
        result = []
        for row in rows:
            result.append({
                'time_period': row[0],
                'avg_memory_usage_mb': row[1] if row[1] is not None else 0,
                'max_memory_usage_mb': row[2] if row[2] is not None else 0,
                'avg_cpu_usage_percent': row[3] if row[3] is not None else 0,
                'max_cpu_usage_percent': row[4] if row[4] is not None else 0,
                'num_jobs': row[5]
            })
        
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/extraction/cache', methods=['GET'])
def get_cache_metrics():
    """
    Get cache metrics.
    
    Query parameters:
    - days: Number of days to include (default: 7)
    
    Returns:
        JSON response with cache metrics
    """
    days = request.args.get('days', default=7, type=int)
    
    try:
        conn = metrics._get_db_connection()
        conn.row_factory = lambda cursor, row: {
            col[0]: row[idx] for idx, col in enumerate(cursor.description)
        }
        cursor = conn.cursor()
        
        cursor.execute('''
        SELECT tenant_id,
               timestamp,
               cache_size,
               hit_count,
               miss_count,
               hit_rate_percent
        FROM cache_metrics
        WHERE timestamp >= datetime('now', '-? days')
        ORDER BY timestamp DESC
        ''', (days,))
        
        result = cursor.fetchall()
        conn.close()
        
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/extraction/queue', methods=['GET'])
def get_queue_status():
    """
    Get document processing queue status.
    
    This is a mock endpoint as we don't have actual queue data.
    In a real implementation, this would query the document processing queue.
    
    Returns:
        JSON response with queue status
    """
    return jsonify({
        'queue_length': 0,
        'processing_now': 0,
        'completed_last_hour': 0,
        'oldest_item_age_seconds': 0,
        'status': 'idle'
    })

@app.route('/')
def index():
    """Redirect to static dashboard page."""
    return app.send_static_file('index.html')

def add_cors_headers(response):
    """Add CORS headers to the response."""
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type'
    response.headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS'
    return response

# Add CORS headers to all responses
app.after_request(add_cors_headers)

# Helper method to connect to the database
def _get_db_connection():
    """Get a connection to the SQLite database."""
    import sqlite3
    conn = sqlite3.connect(metrics.db_path)
    return conn

# Add this method to the metrics object for use in the API
metrics._get_db_connection = _get_db_connection

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)