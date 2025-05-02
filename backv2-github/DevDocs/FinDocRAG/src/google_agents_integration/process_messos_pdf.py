"""
Script to demonstrate how to process the messos PDF with the Google Agent technologies.
"""
import os
import sys
import json
import logging
from dotenv import load_dotenv

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

def process_messos_pdf():
    """
    Process the messos PDF with the Google Agent technologies.
    """
    # Find the messos PDF
    messos_pdf_path = None
    possible_paths = [
        "DevDocs/frontend/public/messos.pdf",
        "../frontend/public/messos.pdf",
        "../../frontend/public/messos.pdf",
        "../../../frontend/public/messos.pdf",
        "messos.pdf"
    ]
    
    for path in possible_paths:
        if os.path.exists(path):
            messos_pdf_path = path
            break
    
    if not messos_pdf_path:
        logger.error("Could not find messos.pdf. Please provide the path to the file.")
        return None
    
    logger.info(f"Found messos PDF at: {messos_pdf_path}")
    
    try:
        # Import the coordinator agent
        sys.path.append(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'agents'))
        from coordinator_agent import process_document, answer_query
        
        # Process the document
        logger.info("Processing messos PDF with Document Processing Agent...")
        document_data = process_document(messos_pdf_path)
        
        # Save the document data
        output_dir = os.environ.get("RESULTS_FOLDER", "./results")
        os.makedirs(output_dir, exist_ok=True)
        
        output_path = os.path.join(output_dir, "messos_data.json")
        
        with open(output_path, "w") as f:
            json.dump(document_data, f, indent=2)
        
        logger.info(f"Document data saved to: {output_path}")
        
        # Print summary
        financial_data = document_data.get("financial_data", {})
        portfolio_analysis = document_data.get("portfolio_analysis", {})
        
        print("\n=== Messos PDF Summary ===")
        print(f"Pages: {document_data.get('metadata', {}).get('page_count', 0)}")
        print(f"ISINs found: {len(financial_data.get('isins', []))}")
        print(f"Securities found: {len(financial_data.get('securities', []))}")
        print(f"Total value: {financial_data.get('total_value', 0)} {financial_data.get('currency', 'USD')}")
        print(f"Risk profile: {portfolio_analysis.get('risk_profile', 'Unknown')}")
        print(f"Diversification score: {portfolio_analysis.get('diversification_score', 0)}/100")
        
        # Print ISINs
        print("\n=== ISINs Found ===")
        for i, isin in enumerate(financial_data.get("isins", []), 1):
            print(f"{i}. {isin}")
        
        # Print securities
        print("\n=== Securities Found ===")
        for i, security in enumerate(financial_data.get("securities", []), 1):
            print(f"{i}. {security.get('name', 'Unknown')} ({security.get('identifier', 'Unknown')}) - {security.get('value', 0)} {financial_data.get('currency', 'USD')}")
        
        # Print asset allocation
        print("\n=== Asset Allocation ===")
        for asset_class, percentage in financial_data.get("asset_allocation", {}).items():
            print(f"{asset_class}: {percentage}%")
        
        # Print recommendations
        print("\n=== Recommendations ===")
        for i, recommendation in enumerate(portfolio_analysis.get("recommendations", []), 1):
            print(f"{i}. {recommendation}")
        
        # Ask questions
        print("\n=== Ask Questions About Messos PDF ===")
        print("Type 'exit' to quit")
        
        # Example questions
        example_questions = [
            "What is the total portfolio value?",
            "Which securities have the highest value?",
            "What is the asset allocation?",
            "How diversified is my portfolio?",
            "What recommendations do you have for my portfolio?"
        ]
        
        print("\nExample questions:")
        for i, question in enumerate(example_questions, 1):
            print(f"{i}. {question}")
        
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
        logger.error(f"Error processing messos PDF: {str(e)}")
        return None

if __name__ == "__main__":
    process_messos_pdf()
