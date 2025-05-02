"""
Test script for the enhanced securities extraction with sequential thinking.

This script demonstrates the enhanced securities extraction capabilities
using sequential thinking and advanced AI.
"""
import os
import sys
import logging
import json
import argparse
from typing import Dict, List, Any, Optional

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Add the src directory to the path
sys.path.append(os.path.join(os.path.dirname(__file__), 'src'))

# Add the agents directory to the path
sys.path.append(os.path.join(os.path.dirname(__file__), 'src', 'google_agents_integration', 'agents'))

# Add the framework directory to the path
sys.path.append(os.path.join(os.path.dirname(__file__), 'src', 'framework'))

# Add the knowledge directory to the path
sys.path.append(os.path.join(os.path.dirname(__file__), 'src', 'knowledge'))

# Import the enhanced securities extraction agent
from securities_extraction_agent_enhanced import EnhancedSecuritiesExtractionAgent

# Import the verification agent
from verification_agent import VerificationAgent

def find_messos_pdf():
    """
    Find the messos PDF file.
    
    Returns:
        Path to the messos PDF file or None if not found
    """
    # Look for the messos PDF in the uploads directory
    uploads_dir = os.path.join(os.path.dirname(__file__), 'src', 'uploads')
    
    if os.path.exists(uploads_dir):
        for file in os.listdir(uploads_dir):
            if 'messos' in file.lower() and file.lower().endswith('.pdf'):
                return os.path.join(uploads_dir, file)
    
    # Look for the messos PDF in the current directory
    for file in os.listdir('.'):
        if 'messos' in file.lower() and file.lower().endswith('.pdf'):
            return os.path.join('.', file)
    
    # Look for the messos PDF in the parent directory
    for file in os.listdir('..'):
        if 'messos' in file.lower() and file.lower().endswith('.pdf'):
            return os.path.join('..', file)
    
    return None

def test_enhanced_extraction(pdf_path, api_key=None, output_path=None):
    """
    Test the enhanced securities extraction with sequential thinking.
    
    Args:
        pdf_path: Path to the PDF file
        api_key: Gemini API key
        output_path: Path to save the results to
    """
    # Check if the PDF file exists
    if not os.path.exists(pdf_path):
        logger.error(f"PDF file not found: {pdf_path}")
        return
    
    # Create the enhanced securities extraction agent
    agent = EnhancedSecuritiesExtractionAgent(api_key=api_key)
    
    # Create the verification agent
    verification_agent = VerificationAgent(api_key=api_key)
    
    # Extract securities
    logger.info(f"Extracting securities from {pdf_path} using sequential thinking and advanced AI")
    extraction_results = agent.extract_securities_from_pdf(pdf_path)
    
    # Verify extraction results
    verification_results = verification_agent.verify_extraction(extraction_results)
    
    # Combine results
    results = {
        "document_type": extraction_results.get("document_type", "unknown"),
        "securities": extraction_results.get("securities", []),
        "portfolio_summary": extraction_results.get("portfolio_summary", {}),
        "verification": verification_results
    }
    
    # Save the results
    if output_path:
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(results, f, indent=2, ensure_ascii=False)
        
        logger.info(f"Results saved to {output_path}")
    
    # Print summary
    print("\n=================================================")
    print("  Enhanced Securities Extraction Results")
    print("=================================================\n")
    
    print(f"Document Type: {results['document_type']}")
    
    if "portfolio_summary" in results:
        print("\nPortfolio Summary:")
        for key, value in results["portfolio_summary"].items():
            print(f"  {key}: {value}")
    
    securities_count = len(results["securities"])
    print(f"\nFound {securities_count} securities")
    
    # Print verification results
    if "verification" in results:
        verification = results["verification"]
        confidence = verification.get("confidence", {}).get("overall", "unknown")
        
        print(f"\nVerification Results:")
        print(f"  Overall Confidence: {confidence}")
        
        total_verification = verification.get("total_verification", {})
        extracted_total = total_verification.get("extracted_total", 0)
        portfolio_total = total_verification.get("portfolio_total", 0)
        match = total_verification.get("match", False)
        
        print(f"  Extracted Total: {extracted_total}")
        print(f"  Portfolio Total: {portfolio_total}")
        print(f"  Match: {match}")
        
        # Print suggestions
        suggestions = verification.get("suggestions", [])
        if suggestions:
            print("\nSuggestions for Improvement:")
            for suggestion in suggestions:
                print(f"  - {suggestion}")
    
    # Print first 5 securities as example
    print("\nExample Securities:")
    for i, security in enumerate(results["securities"][:5]):
        confidence = security.get("confidence", "unknown")
        
        print(f"\nSecurity {i+1} (Confidence: {confidence}):")
        print(f"  ISIN: {security.get('isin', 'Unknown')}")
        print(f"  Description: {security.get('description', 'Unknown')}")
        print(f"  Type: {security.get('type', 'Unknown')}")
        print(f"  Nominal Value: {security.get('nominal_value', 'Unknown')}")
        print(f"  Price: {security.get('price', 'Unknown')}")
        print(f"  Actual Value: {security.get('actual_value', 'Unknown')}")
        print(f"  Currency: {security.get('currency', 'Unknown')}")
        print(f"  Maturity: {security.get('maturity', 'Unknown')}")
        print(f"  Coupon: {security.get('coupon', 'Unknown')}")
        
        # Print validation results
        validation = security.get("validation", {})
        if validation:
            print("  Validation:")
            for key, value in validation.items():
                print(f"    {key}: {value}")

def main():
    """
    Main function.
    """
    # Parse command line arguments
    parser = argparse.ArgumentParser(description='Test the enhanced securities extraction with sequential thinking.')
    parser.add_argument('--pdf', type=str, help='Path to the PDF file')
    parser.add_argument('--api-key', type=str, help='Gemini API key')
    parser.add_argument('--output', type=str, help='Path to save the results to')
    
    args = parser.parse_args()
    
    # Get the API key
    api_key = args.api_key or os.environ.get('GEMINI_API_KEY')
    
    if not api_key:
        logger.warning("No API key provided. Using default OpenRouter key.")
        api_key = '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'
    
    # Get the PDF path
    pdf_path = args.pdf
    
    if not pdf_path:
        # Try to find the messos PDF
        pdf_path = find_messos_pdf()
        
        if not pdf_path:
            logger.error("No PDF file specified and could not find messos PDF")
            return
    
    # Get the output path
    output_path = args.output
    
    if not output_path:
        output_path = f"{os.path.splitext(pdf_path)[0]}_sequential_thinking.json"
    
    # Test the enhanced extraction
    test_enhanced_extraction(pdf_path, api_key, output_path)

if __name__ == "__main__":
    main()
