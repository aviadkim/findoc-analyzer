"""
Script to run the A2A server with the enhanced securities extractor.
"""
import os
import sys
import logging
import subprocess
import time
import signal
import argparse

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def run_a2a_server(port=5000, gemini_api_key=None):
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
        return
    
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
            
            # Wait for the user to press Ctrl+C
            try:
                while True:
                    time.sleep(1)
            except KeyboardInterrupt:
                logger.info("Stopping A2A server...")
                
                # Stop the server
                process.send_signal(signal.SIGINT)
                process.wait()
                
                logger.info("A2A server stopped")
        else:
            logger.error("A2A server failed to start")
    except Exception as e:
        logger.error(f"Error running A2A server: {str(e)}")

def main():
    """
    Main function.
    """
    # Parse command line arguments
    parser = argparse.ArgumentParser(description='Run the A2A server with the enhanced securities extractor.')
    parser.add_argument('--port', type=int, default=5000, help='Port to run the server on')
    parser.add_argument('--api-key', type=str, help='Gemini API key')
    
    args = parser.parse_args()
    
    # Run the A2A server
    run_a2a_server(port=args.port, gemini_api_key=args.api_key)

if __name__ == "__main__":
    main()
