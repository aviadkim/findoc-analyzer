"""
Feedback API for FinDocRAG.

This module provides a Flask API for collecting user feedback on the FinDocRAG system.
"""
import os
import logging
import json
import uuid
from datetime import datetime
from flask import Blueprint, request, jsonify
from google.cloud import storage, bigquery

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create Blueprint
feedback_bp = Blueprint('feedback', __name__, url_prefix='/api/rag/feedback')

# Initialize Google Cloud clients
try:
    storage_client = storage.Client()
    bigquery_client = bigquery.Client()
except Exception as e:
    logger.warning(f"Failed to initialize Google Cloud clients: {str(e)}")
    storage_client = None
    bigquery_client = None

# Configuration
FEEDBACK_BUCKET = os.environ.get("FEEDBACK_BUCKET", "findoc-rag-feedback")
FEEDBACK_DATASET = os.environ.get("FEEDBACK_DATASET", "findoc_rag_feedback")
FEEDBACK_TABLE = os.environ.get("FEEDBACK_TABLE", "user_feedback")

@feedback_bp.route('/submit', methods=['POST'])
def submit_feedback():
    """Submit user feedback."""
    # Get request data
    data = request.json
    
    if not data:
        return jsonify({"error": "No data provided"}), 400
    
    # Validate required fields
    required_fields = ["sessionId", "feedbackType", "rating"]
    for field in required_fields:
        if field not in data:
            return jsonify({"error": f"Missing required field: {field}"}), 400
    
    # Add metadata
    feedback_id = str(uuid.uuid4())
    timestamp = datetime.utcnow().isoformat()
    
    feedback_data = {
        "feedbackId": feedback_id,
        "timestamp": timestamp,
        "sessionId": data["sessionId"],
        "feedbackType": data["feedbackType"],
        "rating": data["rating"],
        "comment": data.get("comment", ""),
        "documentId": data.get("documentId", ""),
        "query": data.get("query", ""),
        "answer": data.get("answer", ""),
        "userAgent": request.headers.get("User-Agent", ""),
        "ipAddress": request.remote_addr
    }
    
    # Store feedback
    try:
        # Store in Cloud Storage
        if storage_client:
            store_feedback_in_storage(feedback_data)
        
        # Store in BigQuery
        if bigquery_client:
            store_feedback_in_bigquery(feedback_data)
        
        # Store locally if Google Cloud clients are not available
        if not storage_client and not bigquery_client:
            store_feedback_locally(feedback_data)
        
        return jsonify({
            "status": "success",
            "feedbackId": feedback_id
        })
    
    except Exception as e:
        logger.error(f"Error storing feedback: {str(e)}")
        return jsonify({
            "status": "error",
            "message": f"Error storing feedback: {str(e)}"
        }), 500

@feedback_bp.route('/stats', methods=['GET'])
def get_feedback_stats():
    """Get feedback statistics."""
    try:
        # Get statistics from BigQuery
        if bigquery_client:
            stats = get_stats_from_bigquery()
        else:
            # Get statistics from local storage
            stats = get_stats_locally()
        
        return jsonify(stats)
    
    except Exception as e:
        logger.error(f"Error getting feedback statistics: {str(e)}")
        return jsonify({
            "status": "error",
            "message": f"Error getting feedback statistics: {str(e)}"
        }), 500

def store_feedback_in_storage(feedback_data):
    """
    Store feedback data in Cloud Storage.
    
    Args:
        feedback_data: Feedback data to store
    """
    # Get or create bucket
    try:
        bucket = storage_client.get_bucket(FEEDBACK_BUCKET)
    except Exception:
        bucket = storage_client.create_bucket(FEEDBACK_BUCKET)
    
    # Create blob
    feedback_id = feedback_data["feedbackId"]
    timestamp = feedback_data["timestamp"].split("T")[0]  # Get date part
    blob_name = f"{timestamp}/{feedback_id}.json"
    blob = bucket.blob(blob_name)
    
    # Upload data
    blob.upload_from_string(
        json.dumps(feedback_data),
        content_type="application/json"
    )
    
    logger.info(f"Stored feedback in Cloud Storage: {blob_name}")

def store_feedback_in_bigquery(feedback_data):
    """
    Store feedback data in BigQuery.
    
    Args:
        feedback_data: Feedback data to store
    """
    # Get or create dataset
    try:
        dataset = bigquery_client.get_dataset(FEEDBACK_DATASET)
    except Exception:
        dataset = bigquery.Dataset(f"{bigquery_client.project}.{FEEDBACK_DATASET}")
        dataset = bigquery_client.create_dataset(dataset)
    
    # Get or create table
    table_id = f"{bigquery_client.project}.{FEEDBACK_DATASET}.{FEEDBACK_TABLE}"
    try:
        table = bigquery_client.get_table(table_id)
    except Exception:
        # Create table schema
        schema = [
            bigquery.SchemaField("feedbackId", "STRING"),
            bigquery.SchemaField("timestamp", "TIMESTAMP"),
            bigquery.SchemaField("sessionId", "STRING"),
            bigquery.SchemaField("feedbackType", "STRING"),
            bigquery.SchemaField("rating", "INTEGER"),
            bigquery.SchemaField("comment", "STRING"),
            bigquery.SchemaField("documentId", "STRING"),
            bigquery.SchemaField("query", "STRING"),
            bigquery.SchemaField("answer", "STRING"),
            bigquery.SchemaField("userAgent", "STRING"),
            bigquery.SchemaField("ipAddress", "STRING")
        ]
        
        table = bigquery.Table(table_id, schema=schema)
        table = bigquery_client.create_table(table)
    
    # Insert data
    rows_to_insert = [feedback_data]
    errors = bigquery_client.insert_rows_json(table, rows_to_insert)
    
    if errors:
        logger.error(f"Error inserting feedback into BigQuery: {errors}")
        raise Exception(f"Error inserting feedback into BigQuery: {errors}")
    
    logger.info(f"Stored feedback in BigQuery: {feedback_data['feedbackId']}")

def store_feedback_locally(feedback_data):
    """
    Store feedback data locally.
    
    Args:
        feedback_data: Feedback data to store
    """
    # Create feedback directory if it doesn't exist
    feedback_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "data")
    os.makedirs(feedback_dir, exist_ok=True)
    
    # Create file
    feedback_id = feedback_data["feedbackId"]
    file_path = os.path.join(feedback_dir, f"{feedback_id}.json")
    
    # Write data
    with open(file_path, "w") as f:
        json.dump(feedback_data, f, indent=2)
    
    logger.info(f"Stored feedback locally: {file_path}")

def get_stats_from_bigquery():
    """
    Get feedback statistics from BigQuery.
    
    Returns:
        Dictionary containing feedback statistics
    """
    # Query for average rating
    query_avg_rating = f"""
    SELECT AVG(rating) as average_rating
    FROM `{bigquery_client.project}.{FEEDBACK_DATASET}.{FEEDBACK_TABLE}`
    """
    
    avg_rating_result = bigquery_client.query(query_avg_rating).result()
    avg_rating = next(avg_rating_result).average_rating
    
    # Query for rating distribution
    query_rating_dist = f"""
    SELECT rating, COUNT(*) as count
    FROM `{bigquery_client.project}.{FEEDBACK_DATASET}.{FEEDBACK_TABLE}`
    GROUP BY rating
    ORDER BY rating
    """
    
    rating_dist_result = bigquery_client.query(query_rating_dist).result()
    rating_distribution = {row.rating: row.count for row in rating_dist_result}
    
    # Query for feedback type distribution
    query_type_dist = f"""
    SELECT feedbackType, COUNT(*) as count
    FROM `{bigquery_client.project}.{FEEDBACK_DATASET}.{FEEDBACK_TABLE}`
    GROUP BY feedbackType
    ORDER BY count DESC
    """
    
    type_dist_result = bigquery_client.query(query_type_dist).result()
    type_distribution = {row.feedbackType: row.count for row in type_dist_result}
    
    # Query for recent feedback
    query_recent = f"""
    SELECT *
    FROM `{bigquery_client.project}.{FEEDBACK_DATASET}.{FEEDBACK_TABLE}`
    ORDER BY timestamp DESC
    LIMIT 10
    """
    
    recent_result = bigquery_client.query(query_recent).result()
    recent_feedback = [dict(row) for row in recent_result]
    
    # Compile statistics
    stats = {
        "averageRating": avg_rating,
        "ratingDistribution": rating_distribution,
        "typeDistribution": type_distribution,
        "recentFeedback": recent_feedback,
        "totalFeedback": sum(rating_distribution.values())
    }
    
    return stats

def get_stats_locally():
    """
    Get feedback statistics from local storage.
    
    Returns:
        Dictionary containing feedback statistics
    """
    # Get feedback directory
    feedback_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "data")
    
    if not os.path.exists(feedback_dir):
        return {
            "averageRating": 0,
            "ratingDistribution": {},
            "typeDistribution": {},
            "recentFeedback": [],
            "totalFeedback": 0
        }
    
    # Load all feedback files
    feedback_files = [f for f in os.listdir(feedback_dir) if f.endswith(".json")]
    feedback_data = []
    
    for file_name in feedback_files:
        file_path = os.path.join(feedback_dir, file_name)
        with open(file_path, "r") as f:
            feedback_data.append(json.load(f))
    
    # Calculate statistics
    if not feedback_data:
        return {
            "averageRating": 0,
            "ratingDistribution": {},
            "typeDistribution": {},
            "recentFeedback": [],
            "totalFeedback": 0
        }
    
    # Calculate average rating
    ratings = [data["rating"] for data in feedback_data]
    avg_rating = sum(ratings) / len(ratings)
    
    # Calculate rating distribution
    rating_distribution = {}
    for rating in ratings:
        rating_distribution[rating] = rating_distribution.get(rating, 0) + 1
    
    # Calculate feedback type distribution
    type_distribution = {}
    for data in feedback_data:
        feedback_type = data["feedbackType"]
        type_distribution[feedback_type] = type_distribution.get(feedback_type, 0) + 1
    
    # Get recent feedback
    recent_feedback = sorted(feedback_data, key=lambda x: x["timestamp"], reverse=True)[:10]
    
    # Compile statistics
    stats = {
        "averageRating": avg_rating,
        "ratingDistribution": rating_distribution,
        "typeDistribution": type_distribution,
        "recentFeedback": recent_feedback,
        "totalFeedback": len(feedback_data)
    }
    
    return stats

def register_routes(app):
    """Register routes with Flask app."""
    app.register_blueprint(feedback_bp)
