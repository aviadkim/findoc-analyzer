#!/usr/bin/env python3
"""
Run the Securities Extraction Monitoring Dashboard.

This script starts the monitoring dashboard server and provides command-line options
for customizing the server behavior.
"""

import os
import sys
import argparse
from securities_dashboard_api import app

def main():
    """Run the monitoring dashboard server."""
    parser = argparse.ArgumentParser(description="Securities Extraction Monitoring Dashboard")
    parser.add_argument('--host', default='0.0.0.0', help='Host to bind the server to')
    parser.add_argument('--port', type=int, default=5000, help='Port to bind the server to')
    parser.add_argument('--debug', action='store_true', help='Run in debug mode')
    
    args = parser.parse_args()
    
    # Ensure the static directory exists
    os.makedirs('static', exist_ok=True)
    
    print(f"Starting Securities Extraction Monitoring Dashboard on http://{args.host}:{args.port}")
    print("Press Ctrl+C to stop the server")
    
    # Run the server
    app.run(host=args.host, port=args.port, debug=args.debug)

if __name__ == "__main__":
    main()