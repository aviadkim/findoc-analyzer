"""
FinDocRAG Backend

This is the main application file for the FinDocRAG backend.
It provides API endpoints for document upload, processing, and querying.
"""
import os
import json
import logging
import uuid
from datetime import datetime
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import google.generativeai as genai

# Import our PDF processor
from pdf_processor import PDFProcessor

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
GEMINI_API_KEY = os.environ.get('GEMINI_API_KEY', '')

# Check if API key is provided
if not GEMINI_API_KEY:
    print("WARNING: No GEMINI_API_KEY provided. Please set the GEMINI_API_KEY environment variable.")

# Create directories if they don't exist
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(TEMP_FOLDER, exist_ok=True)
os.makedirs(RESULTS_FOLDER, exist_ok=True)

# Initialize PDF processor
pdf_processor = PDFProcessor(
    upload_folder=UPLOAD_FOLDER,
    temp_folder=TEMP_FOLDER,
    results_folder=RESULTS_FOLDER
)

# Initialize Gemini API
genai.configure(api_key=GEMINI_API_KEY)
model = genai.GenerativeModel('gemini-pro')

# In-memory storage for processed documents
processed_documents = {}

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

    # Process the document in a separate thread
    def process_document():
        import threading
        import time

        try:
            # Process the document
            logger.info(f"Processing document: {file_path}")
            results = pdf_processor.process_pdf(file_path)

            # Save results
            results_path = pdf_processor.save_results(results, document_id)

            # Export securities to CSV
            csv_path = pdf_processor.export_to_csv(results['securities'], f"{document_id}_securities")

            # Update document info
            processed_documents[document_id].update({
                "status": "completed",
                "results_path": results_path,
                "csv_path": csv_path,
                "isins": results['isins'],
                "securities": results['securities'],
                "portfolio_analysis": results['portfolio_analysis']
            })

            logger.info(f"Document processed successfully: {document_id}")
        except Exception as e:
            logger.error(f"Error processing document: {e}")
            processed_documents[document_id]["status"] = "error"
            processed_documents[document_id]["error"] = str(e)

    threading.Thread(target=process_document).start()

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

    # Get document data
    doc_data = processed_documents[document_id]

    # Create context for the query
    context = {
        "filename": doc_data["original_filename"],
        "isins": doc_data.get("isins", []),
        "securities": doc_data.get("securities", []),
        "portfolio_analysis": doc_data.get("portfolio_analysis", {})
    }

    # Create prompt for Gemini
    prompt = f"""
    You are a financial document analysis assistant. Answer the following question based on the provided financial document data.

    Document: {context['filename']}

    Securities in the document:
    {json.dumps(context['securities'], indent=2)}

    Portfolio Analysis:
    {json.dumps(context['portfolio_analysis'], indent=2)}

    Question: {query}

    Provide a clear, concise, and accurate answer based only on the information provided above.
    """

    try:
        # Generate response using Gemini
        response = model.generate_content(prompt)
        answer = response.text
    except Exception as e:
        logger.error(f"Error generating response: {e}")

        # Fallback to rule-based answers
        if "total" in query.lower() or "value" in query.lower():
            total_value = context['portfolio_analysis'].get('total_value', 0)
            currency = context['portfolio_analysis'].get('currency', 'USD')
            answer = f"The total portfolio value is ${total_value:,.2f} {currency}."
        elif "risk" in query.lower():
            risk_profile = context['portfolio_analysis'].get('risk_profile', 'Unknown')
            answer = f"The portfolio has a {risk_profile.lower()} risk profile."
        elif "diversification" in query.lower():
            diversification_score = context['portfolio_analysis'].get('diversification_score', 0)
            answer = f"The portfolio has a diversification score of {diversification_score}/100."
        elif "asset" in query.lower() or "allocation" in query.lower():
            asset_allocation = context['portfolio_analysis'].get('asset_allocation', {})
            allocation_text = ", ".join([f"{asset}: {percentage}%" for asset, percentage in asset_allocation.items()])
            answer = f"The asset allocation is: {allocation_text}."
        elif "recommendation" in query.lower():
            recommendations = context['portfolio_analysis'].get('recommendations', [])
            if recommendations:
                recommendations_text = "\n".join([f"{i+1}) {rec}" for i, rec in enumerate(recommendations)])
                answer = f"Recommendations:\n{recommendations_text}"
            else:
                answer = "No specific recommendations are available for this portfolio."
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

    # Return portfolio analysis as summary
    return jsonify(processed_documents[document_id].get("portfolio_analysis", {}))

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

    # Return securities
    return jsonify(processed_documents[document_id].get("securities", []))

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

    # Check if CSV file exists
    csv_path = processed_documents[document_id].get("csv_path")
    if not csv_path or not os.path.exists(csv_path):
        # Generate CSV file
        securities = processed_documents[document_id].get("securities", [])
        csv_filename = f"{document_id}_securities.csv"
        csv_path = pdf_processor.export_to_csv(securities, f"{document_id}_securities")

        if not csv_path:
            return jsonify({
                "status": "error",
                "message": "Failed to generate CSV file"
            }), 500

    return jsonify({
        "status": "success",
        "document_id": document_id,
        "download_url": f"/api/document/download/{os.path.basename(csv_path)}"
    })

@app.route('/api/document/download/<filename>', methods=['GET'])
def download_file(filename):
    """Download an exported file."""
    return send_from_directory(RESULTS_FOLDER, filename, as_attachment=True)

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)
