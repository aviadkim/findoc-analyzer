"""
Sample script to demonstrate how to process a PDF file with the Google Agent technologies.
"""
import os
import sys
import json
import argparse
import logging
from dotenv import load_dotenv

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

def process_pdf(pdf_path):
    """
    Process a PDF file with the Google Agent technologies.
    
    Args:
        pdf_path: Path to the PDF file
    """
    logger.info(f"Processing PDF: {pdf_path}")
    
    try:
        # Import the coordinator agent
        sys.path.append(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'agents'))
        from coordinator_agent import process_document, answer_query
        
        # Process the document
        logger.info("Processing document with Document Processing Agent...")
        document_data = process_document(pdf_path)
        
        # Save the document data
        output_dir = os.environ.get("RESULTS_FOLDER", "./results")
        os.makedirs(output_dir, exist_ok=True)
        
        document_id = os.path.splitext(os.path.basename(pdf_path))[0]
        output_path = os.path.join(output_dir, f"{document_id}_data.json")
        
        with open(output_path, "w") as f:
            json.dump(document_data, f, indent=2)
        
        logger.info(f"Document data saved to: {output_path}")
        
        # Print summary
        financial_data = document_data.get("financial_data", {})
        portfolio_analysis = document_data.get("portfolio_analysis", {})
        
        print("\n=== Document Summary ===")
        print(f"Document: {pdf_path}")
        print(f"Pages: {document_data.get('metadata', {}).get('page_count', 0)}")
        print(f"ISINs found: {len(financial_data.get('isins', []))}")
        print(f"Securities found: {len(financial_data.get('securities', []))}")
        print(f"Total value: {financial_data.get('total_value', 0)} {financial_data.get('currency', 'USD')}")
        print(f"Risk profile: {portfolio_analysis.get('risk_profile', 'Unknown')}")
        print(f"Diversification score: {portfolio_analysis.get('diversification_score', 0)}/100")
        
        # Ask questions
        print("\n=== Ask Questions ===")
        print("Type 'exit' to quit")
        
        while True:
            query = input("\nEnter your question: ")
            
            if query.lower() == "exit":
                break
            
            # Answer the question
            answer = answer_query(query, document_data)
            print(f"Answer: {answer}")
        
        return document_data
    
    except ImportError as e:
        logger.error(f"Error importing agents: {str(e)}")
        logger.error("Make sure you have installed all the required dependencies.")
        logger.error("Run: pip install -r requirements.txt")
        return None
    
    except Exception as e:
        logger.error(f"Error processing PDF: {str(e)}")
        return None

def main():
    """Main function."""
    parser = argparse.ArgumentParser(description="Process a PDF file with the Google Agent technologies")
    parser.add_argument("pdf_path", help="Path to the PDF file")
    
    args = parser.parse_args()
    
    # Process the PDF
    process_pdf(args.pdf_path)

if __name__ == "__main__":
    main()
