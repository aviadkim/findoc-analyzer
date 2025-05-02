"""
Example script demonstrating how to integrate Google Agent Technologies with FinDoc Analyzer.

This script shows how to integrate the Google Agent Technologies with the existing
FinDoc Analyzer application.
"""
import os
import sys
import logging
from flask import Flask, render_template, jsonify

# Add the parent directory to the path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Import the integration module
from integration_with_findoc import integrate_with_findoc

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create a simple Flask app for demonstration
app = Flask(__name__)

@app.route('/')
def index():
    """Serve the index page."""
    return jsonify({
        "status": "ok",
        "message": "FinDoc Analyzer with Google Agent Technologies is running"
    })

# Integrate with FinDoc Analyzer
integrate_with_findoc(app)

if __name__ == "__main__":
    # Get port from environment variable or use default
    port = int(os.environ.get('PORT', 5000))
    
    # Run the app
    logger.info(f"Starting FinDoc Analyzer with Google Agent Technologies on port {port}...")
    app.run(host='0.0.0.0', port=port, debug=True)
