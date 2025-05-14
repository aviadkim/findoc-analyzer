#!/usr/bin/env python3
"""
CLI Wrapper for the Enhanced Securities Extractor.

This script provides a command-line interface for the SecurityExtractor class,
making it easier to use from other programming languages or scripts.
"""

import argparse
import json
import os
import sys
import traceback

# Add the parent directory to the Python path so we can import the securities extractor
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Try to import the enhanced securities extractor
try:
    from enhanced_securities_extractor import SecurityExtractor
except ImportError:
    # If not found in current package, try the project root
    sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
    try:
        from enhanced_securities_extractor import SecurityExtractor
    except ImportError:
        print("Error: Could not import SecurityExtractor. Make sure the enhanced_securities_extractor.py file is in your Python path.", file=sys.stderr)
        sys.exit(1)

def parse_args():
    """Parse command line arguments."""
    parser = argparse.ArgumentParser(description="Extract securities information from PDF files")
    parser.add_argument("--pdf", required=True, help="Path to the PDF file")
    parser.add_argument("--output", required=True, help="Path to write the output JSON")
    parser.add_argument("--debug", action="store_true", help="Enable debug output")
    parser.add_argument("--ref-db", help="Path to securities reference database")
    parser.add_argument("--log-file", help="Path to write log output")
    return parser.parse_args()

def main():
    """Main CLI entry point."""
    args = parse_args()
    
    # Create log directory if needed
    if args.log_file:
        log_dir = os.path.dirname(args.log_file)
        if log_dir and not os.path.exists(log_dir):
            os.makedirs(log_dir, exist_ok=True)
    
    try:
        # Configure log level
        log_level = "DEBUG" if args.debug else "INFO"
        
        # Initialize security extractor
        extractor = SecurityExtractor(
            debug=args.debug,
            reference_db_path=args.ref_db,
            log_level=log_level
        )
        
        # Configure file logging if requested
        if args.log_file:
            from enhanced_securities_extractor import configure_file_logging
            configure_file_logging(args.log_file)
        
        # Process the PDF file
        result = extractor.extract_from_pdf(args.pdf)
        
        # Write output to JSON file
        with open(args.output, 'w', encoding='utf-8') as f:
            json.dump(result, f, indent=2, ensure_ascii=False)
        
        if args.debug:
            print(f"Extraction completed, results written to {args.output}")
        
        sys.exit(0)
        
    except Exception as e:
        # Print error to stderr
        error_message = f"Error extracting securities information: {str(e)}"
        print(error_message, file=sys.stderr)
        if args.debug:
            traceback.print_exc(file=sys.stderr)
        
        # Write error to output file
        with open(args.output, 'w', encoding='utf-8') as f:
            json.dump({
                "error": error_message,
                "document_type": "unknown",
                "securities": []
            }, f, indent=2, ensure_ascii=False)
        
        sys.exit(1)

if __name__ == "__main__":
    main()