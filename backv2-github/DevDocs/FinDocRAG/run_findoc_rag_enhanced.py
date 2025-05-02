"""
Script to run the FinDocRAG system with the enhanced securities extractor and A2A agents.
"""
import os
import sys
import logging
import subprocess
import time
import signal
import argparse
import threading

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def run_findoc_rag(port=5000, debug=False):
    """
    Run the FinDocRAG backend.
    
    Args:
        port: Port to run the server on
        debug: Whether to run in debug mode
    """
    # Set environment variables
    env = os.environ.copy()
    env['PORT'] = str(port)
    env['FLASK_APP'] = 'src/app.py'
    
    if debug:
        env['FLASK_ENV'] = 'development'
        env['FLASK_DEBUG'] = '1'
    
    # Get the path to the app
    app_path = os.path.join(os.path.dirname(__file__), 'src', 'app.py')
    
    # Check if the app exists
    if not os.path.exists(app_path):
        logger.error(f"App not found at {app_path}")
        return None
    
    # Run the app
    logger.info(f"Starting FinDocRAG backend on port {port}")
    
    try:
        process = subprocess.Popen([sys.executable, app_path], env=env)
        
        # Wait for the server to start
        logger.info("Waiting for the server to start...")
        time.sleep(2)
        
        # Check if the server is running
        if process.poll() is None:
            logger.info("FinDocRAG backend is running")
            return process
        else:
            logger.error("FinDocRAG backend failed to start")
            return None
    except Exception as e:
        logger.error(f"Error running FinDocRAG backend: {str(e)}")
        return None

def run_a2a_server(port=5001, gemini_api_key=None):
    """
    Run the A2A server.
    
    Args:
        port: Port to run the server on
        gemini_api_key: Gemini API key
    """
    # Set environment variables
    env = os.environ.copy()
    if gemini_api_key:
        env['GEMINI_API_KEY'] = gemini_api_key
    
    # Set the port
    env['PORT'] = str(port)
    
    # Get the path to the A2A server
    a2a_server_path = os.path.join(os.path.dirname(__file__), 'src', 'google_agents_integration', 'a2a', 'a2a_server.py')
    
    # Check if the A2A server exists
    if not os.path.exists(a2a_server_path):
        logger.error(f"A2A server not found at {a2a_server_path}")
        return None
    
    # Run the A2A server
    logger.info(f"Starting A2A server on port {port}")
    
    try:
        process = subprocess.Popen([sys.executable, a2a_server_path], env=env)
        
        # Wait for the server to start
        logger.info("Waiting for the server to start...")
        time.sleep(2)
        
        # Check if the server is running
        if process.poll() is None:
            logger.info("A2A server is running")
            return process
        else:
            logger.error("A2A server failed to start")
            return None
    except Exception as e:
        logger.error(f"Error running A2A server: {str(e)}")
        return None

def main():
    """
    Main function.
    """
    # Parse command line arguments
    parser = argparse.ArgumentParser(description='Run the FinDocRAG system with the enhanced securities extractor and A2A agents.')
    parser.add_argument('--backend-port', type=int, default=5000, help='Port to run the FinDocRAG backend on')
    parser.add_argument('--a2a-port', type=int, default=5001, help='Port to run the A2A server on')
    parser.add_argument('--api-key', type=str, help='Gemini API key')
    parser.add_argument('--debug', action='store_true', help='Run in debug mode')
    
    args = parser.parse_args()
    
    # Run the FinDocRAG backend
    backend_process = run_findoc_rag(port=args.backend_port, debug=args.debug)
    
    # Run the A2A server
    a2a_process = run_a2a_server(port=args.a2a_port, gemini_api_key=args.api_key)
    
    if backend_process and a2a_process:
        # Wait for the user to press Ctrl+C
        try:
            while True:
                time.sleep(1)
        except KeyboardInterrupt:
            logger.info("Stopping servers...")
            
            # Stop the servers
            backend_process.send_signal(signal.SIGINT)
            a2a_process.send_signal(signal.SIGINT)
            
            backend_process.wait()
            a2a_process.wait()
            
            logger.info("Servers stopped")

if __name__ == "__main__":
    main()
