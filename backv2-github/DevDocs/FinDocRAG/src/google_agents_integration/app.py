"""
Main application for FinDocRAG with Google Agent Technologies integration.
"""
import os
import logging
import json
from typing import Dict, List, Any, Optional
from flask import Flask, request, jsonify, send_from_directory, render_template
from flask_cors import CORS
from werkzeug.utils import secure_filename
import threading

# Import coordinator agent
from agents.coordinator_agent import handle_request

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__, static_folder='static', template_folder='templates')
CORS(app)

# Configure upload settings
app.config["UPLOAD_FOLDER"] = os.environ.get("UPLOAD_FOLDER", "./uploads")
app.config["TEMP_FOLDER"] = os.environ.get("TEMP_FOLDER", "./temp")
app.config["RESULTS_FOLDER"] = os.environ.get("RESULTS_FOLDER", "./results")
app.config["MAX_CONTENT_LENGTH"] = 16 * 1024 * 1024  # 16MB max upload size
ALLOWED_EXTENSIONS = {"pdf", "xlsx", "xls", "csv"}

# Ensure directories exist
for directory in [app.config["UPLOAD_FOLDER"], app.config["TEMP_FOLDER"], app.config["RESULTS_FOLDER"]]:
    os.makedirs(directory, exist_ok=True)

# In-memory storage for processed documents
processed_documents = {}

def allowed_file(filename):
    """Check if the file extension is allowed."""
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/')
def index():
    """Serve the index page."""
    return render_template('index.html')

@app.route('/api/health')
def health_check():
    """Health check endpoint."""
    return jsonify({
        "status": "ok",
        "version": "1.0.0"
    })

@app.route('/api/document/upload', methods=['POST'])
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
    file_path = os.path.join(app.config["UPLOAD_FOLDER"], filename)
    file.save(file_path)
    
    # Process document in background
    def process_document_thread():
        try:
            # Create request for coordinator agent
            request_data = {
                "type": "process_document",
                "document_path": file_path
            }
            
            # Process document
            response = handle_request(request_data)
            
            # Store processed document
            document_id = os.path.splitext(filename)[0]
            processed_documents[document_id] = response["document_data"]
            
            logger.info(f"Document {document_id} processed successfully")
        except Exception as e:
            logger.error(f"Error processing document {filename}: {str(e)}")
    
    # Start processing thread
    threading.Thread(target=process_document_thread).start()
    
    return jsonify({
        "status": "success",
        "message": "Document uploaded and processing started",
        "document_id": os.path.splitext(filename)[0]
    })

@app.route('/api/document/status/<document_id>', methods=['GET'])
def document_status(document_id):
    """Get document processing status."""
    if document_id in processed_documents:
        return jsonify({
            "status": "completed",
            "document_id": document_id
        })
    else:
        # Check if file exists
        for ext in ALLOWED_EXTENSIONS:
            file_path = os.path.join(app.config["UPLOAD_FOLDER"], f"{document_id}.{ext}")
            if os.path.exists(file_path):
                return jsonify({
                    "status": "processing",
                    "document_id": document_id
                })
        
        return jsonify({
            "status": "not_found",
            "document_id": document_id
        }), 404

@app.route('/api/document/query', methods=['POST'])
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
    
    # Check if document is processed
    if document_id not in processed_documents:
        return jsonify({
            "status": "error",
            "message": f"Document {document_id} not found or still processing"
        }), 404
    
    # Create request for coordinator agent
    request_data = {
        "type": "query",
        "query": query,
        "document_data": processed_documents[document_id]
    }
    
    # Process query
    try:
        response = handle_request(request_data)
        
        return jsonify({
            "status": "success",
            "query": query,
            "answer": response["answer"]
        })
    except Exception as e:
        logger.error(f"Error processing query: {str(e)}")
        return jsonify({
            "status": "error",
            "message": f"Error processing query: {str(e)}"
        }), 500

@app.route('/api/document/summary/<document_id>', methods=['GET'])
def document_summary(document_id):
    """Get document summary."""
    # Check if document is processed
    if document_id not in processed_documents:
        return jsonify({
            "status": "error",
            "message": f"Document {document_id} not found or still processing"
        }), 404
    
    # Get document data
    document_data = processed_documents[document_id]
    
    # Extract summary information
    financial_data = document_data.get("financial_data", {})
    portfolio_analysis = document_data.get("portfolio_analysis", {})
    
    summary = {
        "document_id": document_id,
        "total_value": financial_data.get("total_value", 0),
        "currency": financial_data.get("currency", "USD"),
        "security_count": len(financial_data.get("securities", [])),
        "asset_allocation": financial_data.get("asset_allocation", {}),
        "diversification_score": portfolio_analysis.get("diversification_score", 0),
        "risk_profile": portfolio_analysis.get("risk_profile", "Unknown"),
        "recommendations": portfolio_analysis.get("recommendations", [])
    }
    
    return jsonify(summary)

@app.route('/api/document/securities/<document_id>', methods=['GET'])
def document_securities(document_id):
    """Get document securities."""
    # Check if document is processed
    if document_id not in processed_documents:
        return jsonify({
            "status": "error",
            "message": f"Document {document_id} not found or still processing"
        }), 404
    
    # Get document data
    document_data = processed_documents[document_id]
    
    # Extract securities information
    financial_data = document_data.get("financial_data", {})
    securities = financial_data.get("securities", [])
    security_evaluations = document_data.get("security_evaluations", [])
    
    # Combine securities with evaluations
    enhanced_securities = []
    
    for security in securities:
        # Find matching evaluation
        evaluation = None
        for eval in security_evaluations:
            if eval.get("identifier") == security.get("identifier"):
                evaluation = eval
                break
        
        # Combine data
        enhanced_security = {
            "name": security.get("name", ""),
            "identifier": security.get("identifier", ""),
            "quantity": security.get("quantity"),
            "value": security.get("value"),
            "asset_class": evaluation.get("asset_class", "Unknown") if evaluation else "Unknown",
            "security_type": evaluation.get("security_type", "Unknown") if evaluation else "Unknown",
            "risk_level": evaluation.get("risk_level", "Unknown") if evaluation else "Unknown",
            "recommendations": evaluation.get("recommendations", []) if evaluation else []
        }
        
        enhanced_securities.append(enhanced_security)
    
    return jsonify(enhanced_securities)

@app.route('/api/document/export/<document_id>', methods=['GET'])
def export_document(document_id):
    """Export document data to CSV."""
    # Check if document is processed
    if document_id not in processed_documents:
        return jsonify({
            "status": "error",
            "message": f"Document {document_id} not found or still processing"
        }), 404
    
    # Get document data
    document_data = processed_documents[document_id]
    
    # Extract securities information
    financial_data = document_data.get("financial_data", {})
    securities = financial_data.get("securities", [])
    
    # Create CSV file
    import pandas as pd
    
    # Convert securities to DataFrame
    df = pd.DataFrame(securities)
    
    # Save to CSV
    csv_path = os.path.join(app.config["RESULTS_FOLDER"], f"{document_id}_securities.csv")
    df.to_csv(csv_path, index=False)
    
    return jsonify({
        "status": "success",
        "download_url": f"/api/document/download/{document_id}_securities.csv"
    })

@app.route('/api/document/download/<filename>', methods=['GET'])
def download_file(filename):
    """Download an exported file."""
    return send_from_directory(app.config["RESULTS_FOLDER"], filename, as_attachment=True)

if __name__ == '__main__':
    # Get port from environment variable or use default
    port = int(os.environ.get('PORT', 5000))
    
    # Run the app
    app.run(host='0.0.0.0', port=port, debug=True)
