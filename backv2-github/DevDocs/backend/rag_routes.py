"""
RAG API routes for the FinDoc Analyzer.
"""
import os
import json
import uuid
from flask import Blueprint, jsonify, request
from werkzeug.utils import secure_filename

# Import RAG components
try:
    from simple_rag_agent import SimpleRAGAgent
    rag_available = True

    # Create ensure_dir function
    def ensure_dir(directory):
        import os
        os.makedirs(directory, exist_ok=True)
except ImportError:
    print("Warning: RAG components not available. RAG features will be disabled.")
    rag_available = False

# Create blueprint
rag_bp = Blueprint('rag', __name__, url_prefix='/api/rag')

# Initialize RAG components
rag_agent = None
document_processor = None
isin_extractor_agent = None
upload_folder = None

def init_rag(app_document_processor, app_isin_extractor_agent, app_upload_folder, openai_api_key=None, google_api_key=None):
    """Initialize RAG components."""
    global rag_agent, document_processor, isin_extractor_agent, upload_folder

    # Set document processor and upload folder
    document_processor = app_document_processor
    isin_extractor_agent = app_isin_extractor_agent
    upload_folder = app_upload_folder

    # Initialize RAG agent if available
    if rag_available:
        # Create RAG output directory
        rag_output_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'rag_output')
        os.makedirs(rag_output_dir, exist_ok=True)

        # Initialize RAG agent
        rag_config = {
            "model": "gpt-4-vision-preview" if openai_api_key else "gemini-1.5-pro-vision",
            "max_tokens": 4096,
            "temperature": 0.2
        }
        rag_agent = SimpleRAGAgent(openai_api_key=openai_api_key, google_api_key=google_api_key, rag_config=rag_config)

def allowed_file(filename):
    """Check if file extension is allowed."""
    allowed_extensions = {'pdf', 'docx', 'xlsx', 'csv'}
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in allowed_extensions

@rag_bp.route("/process", methods=["POST"])
def process_document_with_rag():
    """Process a document with RAG."""
    # Check if RAG is available
    if not rag_available or not rag_agent:
        return jsonify({
            "status": "error",
            "message": "RAG processing is not available"
        }), 400

    # Check if the post request has the file part
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400

    file = request.files['file']

    # If user does not select file, browser also submit an empty part without filename
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    if file and allowed_file(file.filename):
        try:
            # Generate a secure filename
            secure_name = secure_filename(file.filename)
            # Add unique identifier to prevent filename collisions
            unique_id = str(uuid.uuid4())[:8]
            filename = f"{unique_id}_{secure_name}"

            # Save the file
            file_path = os.path.join(upload_folder, filename)
            file.save(file_path)

            # Create output directory for this document
            output_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'rag_output', unique_id)
            os.makedirs(output_dir, exist_ok=True)

            # Process the document with OCR
            ocr_results = document_processor.process_document(file_path, "PDF", {"extract_text": True})

            # Extract financial data
            financial_results = {
                "financial_data": {
                    "securities": [],
                    "total_value": 0,
                    "currency": "USD",
                    "asset_allocation": {},
                    "metrics": {}
                }
            }

            # Extract ISINs
            if ocr_results.get("text"):
                isin_task = {
                    "text": ocr_results["text"],
                    "validate": True,
                    "include_metadata": True
                }
                isin_results = isin_extractor_agent.process(isin_task)

                if isin_results.get("status") == "success" and isin_results.get("isins"):
                    # Add ISINs to financial results
                    financial_results["financial_data"]["securities"] = [
                        {
                            "name": f"Security {isin['isin']}",
                            "identifier": isin['isin'],
                            "quantity": 0,
                            "value": 0
                        } for isin in isin_results["isins"]
                    ]

            # Process with RAG
            rag_results = rag_agent.process(ocr_results, financial_results, file_path, output_dir)

            # Return results
            return jsonify({
                "status": "success",
                "message": "Document processed successfully with RAG",
                "document_id": unique_id,
                "results": {
                    "document_type": rag_results["validated_data"].get("document_type", "unknown"),
                    "total_value": rag_results["validated_data"].get("total_value", 0),
                    "currency": rag_results["validated_data"].get("currency", "USD"),
                    "securities_count": len(rag_results["validated_data"].get("securities", [])),
                    "asset_allocation": rag_results["validated_data"].get("asset_allocation", {}),
                    "has_financial_statements": len(rag_results["validated_data"].get("financial_statements", [])) > 0
                }
            })

        except Exception as e:
            return jsonify({
                "status": "error",
                "error": str(e)
            }), 500

    return jsonify({"error": "File type not allowed"}), 400

@rag_bp.route("/document/<document_id>", methods=["GET"])
def get_rag_document(document_id):
    """Get RAG document results."""
    # Check if RAG is available
    if not rag_available:
        return jsonify({
            "status": "error",
            "message": "RAG processing is not available"
        }), 400

    # Check if document exists
    output_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'rag_output', document_id)
    if not os.path.exists(output_dir):
        return jsonify({"error": "Document not found"}), 404

    # Get validated data
    validated_data_path = os.path.join(output_dir, "rag", "validated_data.json")
    if not os.path.exists(validated_data_path):
        return jsonify({"error": "Document processing results not found"}), 404

    # Load validated data
    with open(validated_data_path, "r", encoding="utf-8") as f:
        validated_data = json.load(f)

    return jsonify({
        "status": "success",
        "document_id": document_id,
        "data": validated_data
    })

@rag_bp.route("/query", methods=["POST"])
def query_rag_document():
    """Query a document processed with RAG."""
    # Check if RAG is available
    if not rag_available or not rag_agent:
        return jsonify({
            "status": "error",
            "message": "RAG processing is not available"
        }), 400

    data = request.json
    if not data:
        return jsonify({"error": "No data provided"}), 400

    document_id = data.get("document_id")
    query = data.get("query")

    if not document_id:
        return jsonify({"error": "No document_id provided"}), 400

    if not query:
        return jsonify({"error": "No query provided"}), 400

    # Check if document exists
    output_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'rag_output', document_id)
    if not os.path.exists(output_dir):
        return jsonify({"error": "Document not found"}), 404

    # Get validated data
    validated_data_path = os.path.join(output_dir, "rag", "validated_data.json")
    if not os.path.exists(validated_data_path):
        return jsonify({"error": "Document processing results not found"}), 404

    # Load validated data
    with open(validated_data_path, "r", encoding="utf-8") as f:
        validated_data = json.load(f)

    # Get image paths
    rag_dir = os.path.join(output_dir, "rag")
    image_paths = [os.path.join(rag_dir, f) for f in os.listdir(rag_dir) if f.endswith(".jpg")]

    # Prepare prompt
    prompt = f"""
    You are a financial document analysis expert. I need you to answer a question about a financial document.

    The document has been analyzed and the following information has been extracted:
    - Document type: {validated_data.get('document_type', 'unknown')}
    - Total value: {validated_data.get('total_value', 0)} {validated_data.get('currency', 'USD')}
    - Number of securities: {len(validated_data.get('securities', []))}
    - Asset allocation: {json.dumps(validated_data.get('asset_allocation', {}))}

    The user's question is: {query}

    Please analyze the document and answer the question as accurately as possible.
    If you cannot find the answer in the document, please say so.
    """

    try:
        # Call RAG API
        response = rag_agent._call_vision_api(prompt, image_paths)

        return jsonify({
            "status": "success",
            "document_id": document_id,
            "query": query,
            "answer": response
        })
    except Exception as e:
        return jsonify({
            "status": "error",
            "error": str(e)
        }), 500
