"""
FinDocRAG Backend - Simplified Version

This is a simplified version of the FinDocRAG backend that doesn't require PyMuPDF.
It provides mock responses for testing the frontend integration.
"""
import os
import json
import logging
import uuid
from datetime import datetime
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# Configuration
UPLOAD_FOLDER = os.environ.get('UPLOAD_FOLDER', './uploads')
TEMP_FOLDER = os.environ.get('TEMP_FOLDER', './temp')
RESULTS_FOLDER = os.environ.get('RESULTS_FOLDER', './results')
GEMINI_API_KEY = os.environ.get('GEMINI_API_KEY', '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')

# Create directories if they don't exist
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(TEMP_FOLDER, exist_ok=True)
os.makedirs(RESULTS_FOLDER, exist_ok=True)

# In-memory storage for processed documents
processed_documents = {}

# Mock data for testing
MOCK_SECURITIES = [
    {
        "name": "Apple Inc.",
        "identifier": "US0378331005",
        "security_type": "Equity",
        "asset_class": "Stocks",
        "quantity": 100,
        "value": 18500.00,
        "risk_level": "Medium"
    },
    {
        "name": "Microsoft Corporation",
        "identifier": "US5949181045",
        "security_type": "Equity",
        "asset_class": "Stocks",
        "quantity": 75,
        "value": 24750.00,
        "risk_level": "Low"
    },
    {
        "name": "Tesla Inc.",
        "identifier": "US88160R1014",
        "security_type": "Equity",
        "asset_class": "Stocks",
        "quantity": 50,
        "value": 12500.00,
        "risk_level": "High"
    },
    {
        "name": "US Treasury Bond 2.5% 2030",
        "identifier": "US912810TL45",
        "security_type": "Bond",
        "asset_class": "Fixed Income",
        "quantity": 10000,
        "value": 9800.00,
        "risk_level": "Low"
    },
    {
        "name": "Vanguard S&P 500 ETF",
        "identifier": "US9229083632",
        "security_type": "ETF",
        "asset_class": "Funds",
        "quantity": 200,
        "value": 80000.00,
        "risk_level": "Medium"
    }
]

MOCK_SUMMARY = {
    "total_value": 145550.00,
    "currency": "USD",
    "security_count": 5,
    "risk_profile": "Moderate",
    "diversification_score": 68.5,
    "asset_allocation": {
        "Stocks": 38.3,
        "Fixed Income": 6.7,
        "Funds": 55.0
    },
    "recommendations": [
        "Consider increasing fixed income allocation for better diversification",
        "The portfolio has a moderate risk profile suitable for long-term growth",
        "Tesla position represents a higher risk component that should be monitored"
    ]
}

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint."""
    return jsonify({
        "status": "ok",
        "version": "1.0.0",
        "api": "FinDocRAG Backend API"
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
    
    # Generate a secure filename
    filename = str(uuid.uuid4())[:8] + "_" + file.filename
    
    # Save the file
    file_path = os.path.join(UPLOAD_FOLDER, filename)
    file.save(file_path)
    
    # Generate a document ID
    document_id = str(uuid.uuid4())
    
    # Store document info
    processed_documents[document_id] = {
        "file_path": file_path,
        "original_filename": file.filename,
        "upload_time": datetime.now().isoformat(),
        "status": "processing"
    }
    
    # Simulate processing delay (in a real implementation, this would be done asynchronously)
    # For now, we'll just set a timer to update the status after a few seconds
    def update_status():
        import threading
        import time
        time.sleep(5)  # Simulate 5 seconds of processing
        processed_documents[document_id]["status"] = "completed"
    
    threading.Thread(target=update_status).start()
    
    return jsonify({
        "document_id": document_id,
        "status": "processing",
        "message": "Document uploaded and processing started"
    })

@app.route('/api/document/status/<document_id>', methods=['GET'])
def document_status(document_id):
    """Get document processing status."""
    if document_id not in processed_documents:
        return jsonify({
            "status": "not_found",
            "document_id": document_id
        }), 404
    
    return jsonify({
        "document_id": document_id,
        "status": processed_documents[document_id]["status"],
        "original_filename": processed_documents[document_id]["original_filename"],
        "upload_time": processed_documents[document_id]["upload_time"]
    })

@app.route('/api/document/query', methods=['POST'])
def query_document():
    """Query a document."""
    data = request.json
    
    if not data:
        return jsonify({"error": "No data provided"}), 400
    
    document_id = data.get("document_id")
    query = data.get("query")
    
    if not document_id:
        return jsonify({"error": "No document_id provided"}), 400
    
    if not query:
        return jsonify({"error": "No query provided"}), 400
    
    if document_id not in processed_documents:
        return jsonify({
            "status": "not_found",
            "document_id": document_id
        }), 404
    
    if processed_documents[document_id]["status"] != "completed":
        return jsonify({
            "status": "processing",
            "message": "Document is still being processed"
        }), 400
    
    # Mock response based on the query
    if "total" in query.lower() or "value" in query.lower():
        answer = f"The total portfolio value is $145,550.00 USD."
    elif "risk" in query.lower():
        answer = "The portfolio has a moderate risk profile. Tesla Inc. has a high risk level, while Microsoft Corporation and US Treasury Bond have low risk levels."
    elif "diversification" in query.lower():
        answer = "The portfolio has a diversification score of 68.5/100. It is recommended to increase fixed income allocation for better diversification."
    elif "asset" in query.lower() or "allocation" in query.lower():
        answer = "The asset allocation is: 38.3% Stocks, 6.7% Fixed Income, and 55.0% Funds."
    elif "recommendation" in query.lower():
        answer = "Recommendations: 1) Consider increasing fixed income allocation for better diversification. 2) The portfolio has a moderate risk profile suitable for long-term growth. 3) Tesla position represents a higher risk component that should be monitored."
    else:
        answer = "I don't have specific information about that in the document. Please try asking about the portfolio value, risk profile, asset allocation, or recommendations."
    
    return jsonify({
        "document_id": document_id,
        "query": query,
        "answer": answer
    })

@app.route('/api/document/summary/<document_id>', methods=['GET'])
def document_summary(document_id):
    """Get document summary."""
    if document_id not in processed_documents:
        return jsonify({
            "status": "not_found",
            "document_id": document_id
        }), 404
    
    if processed_documents[document_id]["status"] != "completed":
        return jsonify({
            "status": "processing",
            "message": "Document is still being processed"
        }), 400
    
    # Return mock summary
    return jsonify(MOCK_SUMMARY)

@app.route('/api/document/securities/<document_id>', methods=['GET'])
def document_securities(document_id):
    """Get document securities."""
    if document_id not in processed_documents:
        return jsonify({
            "status": "not_found",
            "document_id": document_id
        }), 404
    
    if processed_documents[document_id]["status"] != "completed":
        return jsonify({
            "status": "processing",
            "message": "Document is still being processed"
        }), 400
    
    # Return mock securities
    return jsonify(MOCK_SECURITIES)

@app.route('/api/document/export/<document_id>', methods=['GET'])
def export_document(document_id):
    """Export document data to CSV."""
    if document_id not in processed_documents:
        return jsonify({
            "status": "not_found",
            "document_id": document_id
        }), 404
    
    if processed_documents[document_id]["status"] != "completed":
        return jsonify({
            "status": "processing",
            "message": "Document is still being processed"
        }), 400
    
    # Generate CSV file
    csv_filename = f"{document_id}_securities.csv"
    csv_path = os.path.join(RESULTS_FOLDER, csv_filename)
    
    with open(csv_path, 'w') as f:
        f.write("Name,ISIN,Type,Asset Class,Quantity,Value,Risk Level\n")
        for security in MOCK_SECURITIES:
            f.write(f"{security['name']},{security['identifier']},{security['security_type']},{security['asset_class']},{security['quantity']},{security['value']},{security['risk_level']}\n")
    
    return jsonify({
        "status": "success",
        "document_id": document_id,
        "download_url": f"/document/download/{csv_filename}"
    })

@app.route('/api/document/download/<filename>', methods=['GET'])
def download_file(filename):
    """Download an exported file."""
    return send_from_directory(RESULTS_FOLDER, filename, as_attachment=True)

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)
