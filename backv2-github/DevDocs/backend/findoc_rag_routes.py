"""
FinDocRAG integration routes for the FinDoc Analyzer backend.

This module provides routes for integrating the FinDocRAG functionality
with the existing FinDoc Analyzer backend.
"""
import os
import logging
import json
import requests
import tempfile
from flask import Blueprint, jsonify, request, send_from_directory
from werkzeug.utils import secure_filename
import uuid
import google.auth
from google.cloud import secretmanager

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create blueprint
findoc_rag_bp = Blueprint('findoc_rag', __name__, url_prefix='/api/findoc-rag')

# Configuration
FINDOC_RAG_API_URL = os.environ.get('FINDOC_RAG_API_URL', 'http://localhost:5000')
UPLOAD_FOLDER = os.environ.get('UPLOAD_FOLDER', tempfile.gettempdir())
ALLOWED_EXTENSIONS = {'pdf', 'xlsx', 'xls', 'csv'}

# In-memory storage for processed documents
processed_documents = {}

# Get Gemini API key from Secret Manager
def get_gemini_api_key():
    """Get Gemini API key from Secret Manager."""
    try:
        # Only attempt to access Secret Manager in production environment
        if os.environ.get('GAE_ENV', '') == 'standard':
            # For Google App Engine standard environment
            client = secretmanager.SecretManagerServiceClient()
            name = 'projects/findoc-deploy/secrets/gemini-api-key/versions/latest'
            response = client.access_secret_version(request={"name": name})
            return response.payload.data.decode('UTF-8')
        else:
            # In development, use environment variable
            return os.environ.get('GEMINI_API_KEY', '')
    except Exception as e:
        logger.error(f"Error accessing Gemini API key: {str(e)}")
        return os.environ.get('GEMINI_API_KEY', '')

def allowed_file(filename):
    """Check if the file extension is allowed."""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@findoc_rag_bp.route('/health')
def health_check():
    """Health check endpoint."""
    try:
        # Check if the FinDocRAG API is available
        response = requests.get(f"{FINDOC_RAG_API_URL}/api/health", timeout=5)
        if response.status_code == 200:
            return jsonify({
                "status": "ok",
                "version": "1.0.0",
                "findoc_rag_api": "connected"
            })
        else:
            return jsonify({
                "status": "warning",
                "version": "1.0.0",
                "findoc_rag_api": "error",
                "error": f"FinDocRAG API returned status code {response.status_code}"
            })
    except requests.exceptions.RequestException as e:
        return jsonify({
            "status": "warning",
            "version": "1.0.0",
            "findoc_rag_api": "error",
            "error": str(e)
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

    try:
        # Generate a secure filename
        secure_name = secure_filename(file.filename)
        # Add unique identifier to prevent filename collisions
        unique_id = str(uuid.uuid4())[:8]
        filename = f"{unique_id}_{secure_name}"

        # Save the file
        file_path = os.path.join(UPLOAD_FOLDER, filename)
        file.save(file_path)

        # Upload to FinDocRAG API
        files = {'file': open(file_path, 'rb')}
        response = requests.post(f"{FINDOC_RAG_API_URL}/api/document/upload", files=files)

        if response.status_code != 200 and response.status_code != 201:
            return jsonify({
                "status": "error",
                "error": f"FinDocRAG API returned status code {response.status_code}"
            }), 500

        result = response.json()

        # Store document ID for future reference
        document_id = result.get('document_id')
        if document_id:
            processed_documents[document_id] = {
                "file_path": file_path,
                "original_filename": file.filename,
                "status": "processing"
            }

        return jsonify(result)

    except Exception as e:
        logger.error(f"Error uploading document: {str(e)}")
        return jsonify({
            "status": "error",
            "error": str(e)
        }), 500

@findoc_rag_bp.route('/document/status/<document_id>', methods=['GET'])
def document_status(document_id):
    """Get document processing status."""
    try:
        # Check if document is in our local storage
        if document_id in processed_documents:
            # Check status from FinDocRAG API
            response = requests.get(f"{FINDOC_RAG_API_URL}/api/document/status/{document_id}")

            if response.status_code != 200:
                return jsonify({
                    "status": "error",
                    "error": f"FinDocRAG API returned status code {response.status_code}"
                }), 500

            result = response.json()

            # Update local status
            processed_documents[document_id]["status"] = result.get("status", "unknown")

            return jsonify(result)
        else:
            return jsonify({
                "status": "not_found",
                "document_id": document_id
            }), 404

    except Exception as e:
        logger.error(f"Error checking document status: {str(e)}")
        return jsonify({
            "status": "error",
            "error": str(e)
        }), 500

@findoc_rag_bp.route('/document/query', methods=['POST'])
def query_document():
    """Query a document."""
    try:
        # Get request data
        data = request.json

        if not data:
            return jsonify({"error": "No data provided"}), 400

        # Forward request to FinDocRAG API
        response = requests.post(f"{FINDOC_RAG_API_URL}/api/document/query", json=data)

        if response.status_code != 200:
            return jsonify({
                "status": "error",
                "error": f"FinDocRAG API returned status code {response.status_code}"
            }), 500

        return jsonify(response.json())

    except Exception as e:
        logger.error(f"Error querying document: {str(e)}")
        return jsonify({
            "status": "error",
            "error": str(e)
        }), 500

@findoc_rag_bp.route('/document/summary/<document_id>', methods=['GET'])
def document_summary(document_id):
    """Get document summary."""
    try:
        # Check if document is in our local storage
        if document_id in processed_documents:
            # Get summary from FinDocRAG API
            response = requests.get(f"{FINDOC_RAG_API_URL}/api/document/summary/{document_id}")

            if response.status_code != 200:
                return jsonify({
                    "status": "error",
                    "error": f"FinDocRAG API returned status code {response.status_code}"
                }), 500

            return jsonify(response.json())
        else:
            return jsonify({
                "status": "error",
                "message": f"Document {document_id} not found"
            }), 404

    except Exception as e:
        logger.error(f"Error getting document summary: {str(e)}")
        return jsonify({
            "status": "error",
            "error": str(e)
        }), 500

@findoc_rag_bp.route('/document/securities/<document_id>', methods=['GET'])
def document_securities(document_id):
    """Get document securities."""
    try:
        # Check if document is in our local storage
        if document_id in processed_documents:
            # Get securities from FinDocRAG API
            response = requests.get(f"{FINDOC_RAG_API_URL}/api/document/securities/{document_id}")

            if response.status_code != 200:
                return jsonify({
                    "status": "error",
                    "error": f"FinDocRAG API returned status code {response.status_code}"
                }), 500

            return jsonify(response.json())
        else:
            return jsonify({
                "status": "error",
                "message": f"Document {document_id} not found"
            }), 404

    except Exception as e:
        logger.error(f"Error getting document securities: {str(e)}")
        return jsonify({
            "status": "error",
            "error": str(e)
        }), 500

@findoc_rag_bp.route('/document/export/<document_id>', methods=['GET'])
def export_document(document_id):
    """Export document data to CSV."""
    try:
        # Check if document is in our local storage
        if document_id in processed_documents:
            # Get export from FinDocRAG API
            response = requests.get(f"{FINDOC_RAG_API_URL}/api/document/export/{document_id}")

            if response.status_code != 200:
                return jsonify({
                    "status": "error",
                    "error": f"FinDocRAG API returned status code {response.status_code}"
                }), 500

            result = response.json()

            # Modify download URL to use our proxy
            if "download_url" in result:
                result["download_url"] = f"/api/findoc-rag/document/download/{document_id}_securities.csv"

            return jsonify(result)
        else:
            return jsonify({
                "status": "error",
                "message": f"Document {document_id} not found"
            }), 404

    except Exception as e:
        logger.error(f"Error exporting document: {str(e)}")
        return jsonify({
            "status": "error",
            "error": str(e)
        }), 500

@findoc_rag_bp.route('/document/download/<filename>', methods=['GET'])
def download_file(filename):
    """Download an exported file."""
    try:
        # Get the file from FinDocRAG API
        response = requests.get(f"{FINDOC_RAG_API_URL}/api/document/download/{filename}", stream=True)

        if response.status_code != 200:
            return jsonify({
                "status": "error",
                "error": f"FinDocRAG API returned status code {response.status_code}"
            }), 500

        # Save the file locally
        local_path = os.path.join(UPLOAD_FOLDER, filename)
        with open(local_path, 'wb') as f:
            for chunk in response.iter_content(chunk_size=8192):
                f.write(chunk)

        # Send the file
        return send_from_directory(UPLOAD_FOLDER, filename, as_attachment=True)

    except Exception as e:
        logger.error(f"Error downloading file: {str(e)}")
        return jsonify({
            "status": "error",
            "error": str(e)
        }), 500

def init_findoc_rag(app):
    """Initialize the FinDocRAG integration."""
    # Create upload folder if it doesn't exist
    os.makedirs(UPLOAD_FOLDER, exist_ok=True)

    # Set Gemini API key
    if not os.environ.get('GEMINI_API_KEY'):
        os.environ['GEMINI_API_KEY'] = get_gemini_api_key()
        logger.info("Gemini API key loaded from Secret Manager")

    # Register blueprint
    app.register_blueprint(findoc_rag_bp)

    logger.info("FinDocRAG integration initialized")

# Function to process a document using the FinDocRAG system
def process_document(file_path):
    """
    Process a document using the FinDocRAG system.

    Args:
        file_path: Path to the document file

    Returns:
        Processing result
    """
    try:
        # Check if file exists
        if not os.path.exists(file_path):
            return {"error": "File not found"}

        # Check if file type is allowed
        if not allowed_file(file_path):
            return {"error": f"File type not allowed. Allowed types: {', '.join(ALLOWED_EXTENSIONS)}"}

        # Generate a document ID
        document_id = str(uuid.uuid4())

        # Store document info
        processed_documents[document_id] = {
            "file_path": file_path,
            "original_filename": os.path.basename(file_path),
            "status": "processing"
        }

        # Process the document using the enhanced securities extractor
        try:
            from enhanced_processing.improved_securities_extractor import ImprovedSecuritiesExtractor
            from enhanced_processing.financial_document_processor import FinancialDocumentProcessor

            # Initialize the securities extractor
            securities_extractor = ImprovedSecuritiesExtractor(debug=True)

            # Extract securities
            securities_result = securities_extractor.extract_securities(file_path)

            # Initialize the financial document processor
            document_processor = FinancialDocumentProcessor()

            # Process the document
            processing_result = document_processor.process_document(file_path)

            # Combine results
            result = {
                "document_id": document_id,
                "status": "completed",
                "securities": securities_result.get("securities", []),
                "document_type": processing_result.get("document_type", "unknown"),
                "summary": processing_result.get("summary", {})
            }

            # Update document status
            processed_documents[document_id]["status"] = "completed"

            return result
        except ImportError:
            logger.warning("Enhanced processing modules not available, using basic processing")

            # Basic processing
            result = {
                "document_id": document_id,
                "status": "completed",
                "message": "Document processed with basic processing",
                "file_path": file_path
            }

            # Update document status
            processed_documents[document_id]["status"] = "completed"

            return result
    except Exception as e:
        logger.error(f"Error processing document: {str(e)}")
        return {"error": str(e)}
