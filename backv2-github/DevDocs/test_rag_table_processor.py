"""
Test script for the RAG Table Processor.
"""
import os
import sys
import json
import argparse
import logging
from pathlib import Path

# Set up logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Add the parent directory to the path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Import the table extractor and RAG table processor
from DevDocs.backend.enhanced_processing.enhanced_table_extractor import EnhancedTableExtractor
from DevDocs.backend.enhanced_processing.rag_table_processor import RAGTableProcessor

# Import the test table creation functions
from DevDocs.test_enhanced_table_extractor import create_test_table_image, create_test_pdf

def test_rag_table_processor(api_key=None):
    """
    Test the RAG Table Processor with various inputs.
    
    Args:
        api_key: OpenRouter API key for AI-enhanced processing
    """
    logger.info("Testing RAG Table Processor")
    
    # Create output directory
    output_dir = Path("agent_test_results")
    output_dir.mkdir(exist_ok=True)
    
    # Initialize the table extractor
    extractor = EnhancedTableExtractor(
        use_camelot=True,
        use_pdfplumber=True,
        use_tabula=True,
        use_ocr=True,
        lang="eng+heb"
    )
    
    # Initialize the RAG table processor
    processor = RAGTableProcessor(api_key=api_key)
    
    # Test 1: Process tables from a test image
    logger.info("Test 1: Processing tables from a test image")
    test_img_path = create_test_table_image(output_path=str(output_dir / "test_table_image.png"))
    
    image_tables = extractor.extract_tables_from_image(test_img_path)
    
    if image_tables:
        # Process the tables
        image_result = processor.process_tables(
            image_tables,
            output_dir=str(output_dir / "rag_table_processor_image")
        )
        
        logger.info(f"Test 1 result saved to {output_dir / 'rag_table_processor_image'}")
    else:
        logger.warning("No tables extracted from the test image")
        image_result = None
    
    # Test 2: Process tables from a test PDF
    logger.info("Test 2: Processing tables from a test PDF")
    test_pdf_path = create_test_pdf(str(output_dir / "test_table_document.pdf"))
    
    if test_pdf_path:
        pdf_tables = extractor.extract_tables_from_pdf(test_pdf_path)
        
        if pdf_tables:
            # Process the tables
            pdf_result = processor.process_tables(
                pdf_tables,
                output_dir=str(output_dir / "rag_table_processor_pdf")
            )
            
            logger.info(f"Test 2 result saved to {output_dir / 'rag_table_processor_pdf'}")
        else:
            logger.warning("No tables extracted from the test PDF")
            pdf_result = None
    else:
        logger.warning("Skipping PDF test due to missing dependencies")
        pdf_result = None
    
    # Test 3: Process tables from a Hebrew test image
    logger.info("Test 3: Processing tables from a Hebrew test image")
    hebrew_img_path = create_test_table_image(output_path=str(output_dir / "test_hebrew_table_image.png"), lang="heb")
    
    hebrew_image_tables = extractor.extract_tables_from_image(hebrew_img_path)
    
    if hebrew_image_tables:
        # Process the tables
        hebrew_result = processor.process_tables(
            hebrew_image_tables,
            output_dir=str(output_dir / "rag_table_processor_hebrew")
        )
        
        logger.info(f"Test 3 result saved to {output_dir / 'rag_table_processor_hebrew'}")
    else:
        logger.warning("No tables extracted from the Hebrew test image")
        hebrew_result = None
    
    # Save the combined results
    combined_result = {
        'image_result': image_result,
        'pdf_result': pdf_result,
        'hebrew_result': hebrew_result
    }
    
    with open(output_dir / "rag_table_processor_results.json", "w", encoding="utf-8") as f:
        json.dump(combined_result, f, ensure_ascii=False, indent=2)
    
    # Print summary
    logger.info("RAG Table Processor tests completed")
    logger.info(f"Results saved to {output_dir}")
    
    return {
        'status': 'success',
        'test1_result': image_result is not None,
        'test2_result': pdf_result is not None,
        'test3_result': hebrew_result is not None,
        'output_dir': str(output_dir)
    }

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Test the RAG Table Processor")
    parser.add_argument("--api_key", help="OpenRouter API key for AI-enhanced processing")
    args = parser.parse_args()
    
    # Get API key from environment variable if not provided
    api_key = args.api_key or os.environ.get("OPENROUTER_API_KEY")
    
    test_rag_table_processor(api_key=api_key)
