"""
Run A2A Server for FinDocRAG

This script runs the A2A server for the FinDocRAG system.
"""
import os
import sys
import logging
import argparse

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Add google_agents_integration to path
sys.path.append(os.path.join(os.path.dirname(__file__), 'google_agents_integration'))

# Import A2A server
from google_agents_integration.a2a.a2a_server import app

def main():
    """Main function."""
    parser = argparse.ArgumentParser(description="Run A2A Server for FinDocRAG")
    parser.add_argument("--host", default="0.0.0.0", help="Host to run the server on")
    parser.add_argument("--port", type=int, default=5001, help="Port to run the server on")
    parser.add_argument("--debug", action="store_true", help="Run in debug mode")
    args = parser.parse_args()
    
    logger.info(f"Starting A2A server on {args.host}:{args.port}")
    
    # Run the app
    app.run(host=args.host, port=args.port, debug=args.debug)

if __name__ == "__main__":
    main()
