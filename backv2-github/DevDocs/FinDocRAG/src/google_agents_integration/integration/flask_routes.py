"""
Flask routes for integrating Google Agent Technologies with FinDoc Analyzer.

This module provides Flask routes for integrating the Google Agent Technologies
with the existing FinDoc Analyzer backend.
"""
import os
import logging
from flask import Blueprint, request, jsonify, send_from_directory
from werkzeug.utils import secure_filename

from .backend_integration import FinDocRAGBackendIntegration

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create Blueprint
findoc_rag_bp = Blueprint('findoc_rag', __name__, url_prefix='/api/rag')

# Initialize backend integration
integration = FinDocRAGBackendIntegration({
    "upload_folder": os.environ.get("UPLOAD_FOLDER", "./uploads"),
    "results_folder": os.environ.get("RESULTS_FOLDER", "./results")
})

# Configure upload settings
ALLOWED_EXTENSIONS = {"pdf", "xlsx", "xls", "csv"}

def allowed_file(filename):
    """Check if the file extension is allowed."""
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS

@findoc_rag_bp.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint."""
    return jsonify({
        "status": "ok",
        "version": "1.0.0"
    })

@findoc_rag_bp.route('/document/upload', methods=['POST'])
def upload_document():
    """Upload a document for processing."""
    # Check if file is in request
    if "file" not in request.files:
        return jsonify({"error": "No file part"}), 400
    
    file = request.files["file"]
    
    # Check if file is empty
    if file.filename == "":
        return jsonify({"error": "No selected file"}), 400
    
    # Check if file type is allowed
    if not allowed_file(file.filename):
        return jsonify({"error": f"File type not allowed. Allowed types: {', '.join(ALLOWED_EXTENSIONS)}"}), 400
    
    # Save file
    filename = secure_filename(file.filename)
    upload_folder = os.environ.get("UPLOAD_FOLDER", "./uploads")
    os.makedirs(upload_folder, exist_ok=True)
    file_path = os.path.join(upload_folder, filename)
    file.save(file_path)
    
    # Process document
    document_id = integration.process_document(file_path)
    
    return jsonify({
        "status": "success",
        "message": "Document uploaded and processing started",
        "document_id": document_id
    })

@findoc_rag_bp.route('/document/status/<document_id>', methods=['GET'])
def document_status(document_id):
    """Get document processing status."""
    status = integration.get_document_status(document_id)
    
    if status == "not_found":
        return jsonify({
            "status": "not_found",
            "document_id": document_id
        }), 404
    
    return jsonify({
        "status": status,
        "document_id": document_id
    })

@findoc_rag_bp.route('/document/query', methods=['POST'])
def query_document():
    """Query a document."""
    # Get request data
    data = request.json
    
    if not data:
        return jsonify({"error": "No data provided"}), 400
    
    document_id = data.get("document_id")
    query = data.get("query")
    
    if not document_id:
        return jsonify({"error": "No document_id provided"}), 400
    
    if not query:
        return jsonify({"error": "No query provided"}), 400
    
    # Query document
    try:
        result = integration.query_document(document_id, query)
        
        return jsonify({
            "status": "success",
            "query": query,
            "answer": result["answer"]
        })
    except ValueError as e:
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 404
    except Exception as e:
        logger.error(f"Error processing query: {str(e)}")
        return jsonify({
            "status": "error",
            "message": f"Error processing query: {str(e)}"
        }), 500

@findoc_rag_bp.route('/document/summary/<document_id>', methods=['GET'])
def document_summary(document_id):
    """Get document summary."""
    try:
        summary = integration.get_document_summary(document_id)
        return jsonify(summary)
    except ValueError as e:
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 404
    except Exception as e:
        logger.error(f"Error getting document summary: {str(e)}")
        return jsonify({
            "status": "error",
            "message": f"Error getting document summary: {str(e)}"
        }), 500

@findoc_rag_bp.route('/document/securities/<document_id>', methods=['GET'])
def document_securities(document_id):
    """Get document securities."""
    try:
        securities = integration.get_document_securities(document_id)
        return jsonify(securities)
    except ValueError as e:
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 404
    except Exception as e:
        logger.error(f"Error getting document securities: {str(e)}")
        return jsonify({
            "status": "error",
            "message": f"Error getting document securities: {str(e)}"
        }), 500

@findoc_rag_bp.route('/document/export/<document_id>', methods=['GET'])
def export_document(document_id):
    """Export document data to CSV."""
    try:
        csv_path = integration.export_document_to_csv(document_id)
        
        return jsonify({
            "status": "success",
            "download_url": f"/api/rag/document/download/{os.path.basename(csv_path)}"
        })
    except ValueError as e:
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 404
    except Exception as e:
        logger.error(f"Error exporting document: {str(e)}")
        return jsonify({
            "status": "error",
            "message": f"Error exporting document: {str(e)}"
        }), 500

@findoc_rag_bp.route('/document/download/<filename>', methods=['GET'])
def download_file(filename):
    """Download an exported file."""
    results_folder = os.environ.get("RESULTS_FOLDER", "./results")
    return send_from_directory(results_folder, filename, as_attachment=True)

def register_routes(app):
    """Register routes with Flask app."""
    app.register_blueprint(findoc_rag_bp)
