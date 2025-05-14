#!/usr/bin/env python3
"""
Simple test script for the enhanced securities extractor.
This script extracts securities from a sample PDF and prints the results.
"""

import os
import json
import sys
from enhanced_securities_extractor import SecurityExtractor

def find_sample_pdf():
    """Find a sample PDF file to test."""
    # First try to find messos PDF
    for root, dirs, files in os.walk('.'):
        for file in files:
            if 'messos' in file.lower() and file.lower().endswith('.pdf'):
                return os.path.join(root, file)
    
    # If messos PDF not found, try any PDF
    for root, dirs, files in os.walk('.'):
        for file in files:
            if file.lower().endswith('.pdf'):
                return os.path.join(root, file)
    
    return None

def main():
    """Run the test."""
    # Find a sample PDF
    pdf_path = find_sample_pdf()
    
    if not pdf_path:
        print("No PDF files found. Please provide a path to a PDF file.")
        return 1
    
    print(f"Using PDF file: {pdf_path}")
    
    # Initialize the extractor
    extractor = SecurityExtractor(debug=True)
    
    # Extract securities
    print("Extracting securities...")
    result = extractor.extract_from_pdf(pdf_path)
    
    # Print results
    print("\n=== Document Information ===")
    print(f"Document Type: {result.get('document_type', 'Unknown')}")
    print(f"Currency: {result.get('currency', 'Unknown')}")
    
    if "portfolio_summary" in result:
        print("\n=== Portfolio Summary ===")
        for key, value in result["portfolio_summary"].items():
            print(f"{key}: {value}")
    
    if "asset_allocation" in result:
        print("\n=== Asset Allocation ===")
        for key, value in result["asset_allocation"].items():
            print(f"{key}: {value}")
    
    if "securities" in result:
        print(f"\n=== Securities ({len(result['securities'])}) ===")
        for i, security in enumerate(result["securities"], 1):
            print(f"\nSecurity {i}:")
            print(f"  ISIN: {security.get('isin', 'Unknown')}")
            print(f"  Description: {security.get('description', 'Unknown')}")
            print(f"  Type: {security.get('type', 'Unknown')}")
            print(f"  Nominal/Quantity: {security.get('nominal', 'Unknown')}")
            print(f"  Price: {security.get('price', 'Unknown')}")
            print(f"  Value: {security.get('value', 'Unknown')}")
            print(f"  Currency: {security.get('currency', 'Unknown')}")
            if "weight" in security:
                print(f"  Weight: {security.get('weight')}%")
    
    # Check for complete securities
    securities = result.get("securities", [])
    complete_securities = [s for s in securities if
                         s.get("isin") and
                         s.get("description") and
                         s.get("value") is not None and
                         s.get("price") is not None and
                         s.get("nominal") is not None]
    
    print(f"\nComplete securities: {len(complete_securities)}/{len(securities)} ({100 * len(complete_securities) / len(securities) if securities else 0:.1f}%)")

    # Save the results to a file
    output_file = "extraction_results.json"
    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(result, f, indent=2, ensure_ascii=False)
    
    print(f"\nResults saved to {output_file}")
    return 0

if __name__ == "__main__":
    sys.exit(main())