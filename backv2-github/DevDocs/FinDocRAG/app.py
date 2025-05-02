"""
Main application entry point for FinDocRAG.
"""
import os
import logging
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from werkzeug.utils import secure_filename
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Import core modules
from document_processor import DocumentProcessor
from agent_orchestrator import AgentOrchestrator
from ai_service_proxy import AIServiceProxy
from utils.auth import get_client_id_from_request
from utils.storage import ensure_dirs, get_document_data, save_document_data

# Configure logging
logging.basicConfig(
    level=getattr(logging, os.getenv("LOG_LEVEL", "INFO")),
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# Configure upload settings
app.config["UPLOAD_FOLDER"] = os.getenv("UPLOAD_FOLDER", "./uploads")
app.config["TEMP_FOLDER"] = os.getenv("TEMP_FOLDER", "./temp")
app.config["RESULTS_FOLDER"] = os.getenv("RESULTS_FOLDER", "./results")
app.config["MAX_CONTENT_LENGTH"] = 16 * 1024 * 1024  # 16MB max upload size
ALLOWED_EXTENSIONS = {"pdf", "xlsx", "xls", "csv"}

# Ensure directories exist
ensure_dirs([
    app.config["UPLOAD_FOLDER"],
    app.config["TEMP_FOLDER"],
    app.config["RESULTS_FOLDER"]
])

# Initialize services
ai_service = AIServiceProxy({
    "primary_provider": os.getenv("PRIMARY_AI_PROVIDER", "gemini"),
    "gemini_api_key": os.getenv("GEMINI_API_KEY"),
    "openai_api_key": os.getenv("OPENAI_API_KEY"),
    "anthropic_api_key": os.getenv("ANTHROPIC_API_KEY"),
})

document_processor = DocumentProcessor()
agent_orchestrator = AgentOrchestrator(ai_service)

def allowed_file(filename):
    """Check if the file extension is allowed."""
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route("/", methods=["GET"])
def index():
    """Serve the index page."""
    return jsonify({
        "status": "ok",
        "message": "FinDocRAG API is running",
        "version": "1.0.0"
    })

@app.route("/api/health", methods=["GET"])
def health_check():
    """Health check endpoint."""
    return jsonify({
        "status": "ok",
        "services": {
            "ai_service": ai_service.health_check(),
            "document_processor": True,
            "agent_orchestrator": True
        }
    })

@app.route("/api/document/upload", methods=["POST"])
def upload_document():
    """Upload a document for processing."""
    # Get client ID from authentication
    client_id = get_client_id_from_request(request)
    
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
    file_path = os.path.join(app.config["UPLOAD_FOLDER"], f"{client_id}_{filename}")
    file.save(file_path)
    
    # Process document
    try:
        document_data = document_processor.process(file_path)
        
        # Save document data
        document_id = save_document_data(document_data, client_id)
        
        return jsonify({
            "status": "success",
            "message": "Document uploaded and processed successfully",
            "document_id": document_id
        })
    except Exception as e:
        logger.error(f"Error processing document: {str(e)}")
        return jsonify({"error": f"Error processing document: {str(e)}"}), 500

@app.route("/api/document/process", methods=["POST"])
def process_document():
    """Process an already uploaded document with the agent orchestrator."""
    # Get client ID from authentication
    client_id = get_client_id_from_request(request)
    
    # Get document ID
    data = request.json
    document_id = data.get("document_id")
    
    if not document_id:
        return jsonify({"error": "No document_id provided"}), 400
    
    # Get document data
    document_data = get_document_data(document_id)
    
    if not document_data:
        return jsonify({"error": f"Document with ID {document_id} not found"}), 404
    
    # Process with agent orchestrator
    try:
        results = agent_orchestrator.process_document(document_data)
        
        return jsonify({
            "status": "success",
            "results": results
        })
    except Exception as e:
        logger.error(f"Error processing document with agent orchestrator: {str(e)}")
        return jsonify({"error": f"Error processing document: {str(e)}"}), 500

@app.route("/api/document/query", methods=["POST"])
def query_document():
    """Query a document with natural language."""
    # Get client ID from authentication
    client_id = get_client_id_from_request(request)
    
    # Get document ID and query
    data = request.json
    document_id = data.get("document_id")
    query = data.get("query")
    
    if not document_id:
        return jsonify({"error": "No document_id provided"}), 400
    
    if not query:
        return jsonify({"error": "No query provided"}), 400
    
    # Get document data
    document_data = get_document_data(document_id)
    
    if not document_data:
        return jsonify({"error": f"Document with ID {document_id} not found"}), 404
    
    # Query with agent orchestrator
    try:
        results = agent_orchestrator.query_document(document_data, query)
        
        return jsonify({
            "status": "success",
            "results": results
        })
    except Exception as e:
        logger.error(f"Error querying document: {str(e)}")
        return jsonify({"error": f"Error querying document: {str(e)}"}), 500

@app.route("/api/document/export", methods=["POST"])
def export_document():
    """Export document data to CSV."""
    # Get client ID from authentication
    client_id = get_client_id_from_request(request)
    
    # Get document ID and export options
    data = request.json
    document_id = data.get("document_id")
    export_format = data.get("format", "csv")
    export_options = data.get("options", {})
    
    if not document_id:
        return jsonify({"error": "No document_id provided"}), 400
    
    # Get document data
    document_data = get_document_data(document_id)
    
    if not document_data:
        return jsonify({"error": f"Document with ID {document_id} not found"}), 404
    
    # Export document
    try:
        export_path = agent_orchestrator.export_document(document_data, export_format, export_options)
        
        # Return file download URL
        export_filename = os.path.basename(export_path)
        download_url = f"/api/document/download/{export_filename}"
        
        return jsonify({
            "status": "success",
            "download_url": download_url
        })
    except Exception as e:
        logger.error(f"Error exporting document: {str(e)}")
        return jsonify({"error": f"Error exporting document: {str(e)}"}), 500

@app.route("/api/document/download/<filename>", methods=["GET"])
def download_file(filename):
    """Download an exported file."""
    return send_from_directory(app.config["RESULTS_FOLDER"], filename, as_attachment=True)

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=os.getenv("DEBUG", "False").lower() == "true")
