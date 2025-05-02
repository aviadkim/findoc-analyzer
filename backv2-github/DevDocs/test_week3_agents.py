"""
Combined test script for Week 3 agents and components.
"""
import os
import sys
import json
import argparse
import logging
from pathlib import Path
import time

# Set up logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Add the parent directory to the path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

def run_tests(api_key=None):
    """
    Run all tests for Week 3 agents and components.
    
    Args:
        api_key: OpenRouter API key for AI-enhanced processing
    """
    logger.info("Running Week 3 tests")
    
    # Create output directory
    output_dir = Path("agent_test_results")
    output_dir.mkdir(exist_ok=True)
    
    # Create a summary file
    summary = {
        'timestamp': time.strftime("%Y-%m-%d %H:%M:%S"),
        'tests': {}
    }
    
    # Test 1: HebrewOCRAgent
    logger.info("Test 1: HebrewOCRAgent")
    try:
        from DevDocs.test_hebrew_ocr_agent import test_hebrew_ocr_agent
        hebrew_ocr_result = test_hebrew_ocr_agent(api_key=api_key)
        summary['tests']['hebrew_ocr_agent'] = hebrew_ocr_result
        logger.info("HebrewOCRAgent test completed successfully")
    except Exception as e:
        logger.error(f"Error running HebrewOCRAgent test: {str(e)}")
        summary['tests']['hebrew_ocr_agent'] = {
            'status': 'error',
            'error': str(e)
        }
    
    # Test 2: EnhancedTableExtractor
    logger.info("Test 2: EnhancedTableExtractor")
    try:
        from DevDocs.test_enhanced_table_extractor import test_enhanced_table_extractor
        table_extractor_result = test_enhanced_table_extractor()
        summary['tests']['enhanced_table_extractor'] = table_extractor_result
        logger.info("EnhancedTableExtractor test completed successfully")
    except Exception as e:
        logger.error(f"Error running EnhancedTableExtractor test: {str(e)}")
        summary['tests']['enhanced_table_extractor'] = {
            'status': 'error',
            'error': str(e)
        }
    
    # Test 3: RAGTableProcessor
    logger.info("Test 3: RAGTableProcessor")
    try:
        from DevDocs.test_rag_table_processor import test_rag_table_processor
        rag_table_processor_result = test_rag_table_processor(api_key=api_key)
        summary['tests']['rag_table_processor'] = rag_table_processor_result
        logger.info("RAGTableProcessor test completed successfully")
    except Exception as e:
        logger.error(f"Error running RAGTableProcessor test: {str(e)}")
        summary['tests']['rag_table_processor'] = {
            'status': 'error',
            'error': str(e)
        }
    
    # Save the summary
    with open(output_dir / "week3_test_summary.json", "w", encoding="utf-8") as f:
        json.dump(summary, f, ensure_ascii=False, indent=2)
    
    logger.info(f"Week 3 tests completed. Summary saved to {output_dir / 'week3_test_summary.json'}")
    
    return summary

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Run Week 3 tests")
    parser.add_argument("--api_key", help="OpenRouter API key for AI-enhanced processing")
    args = parser.parse_args()
    
    # Get API key from environment variable if not provided
    api_key = args.api_key or os.environ.get("OPENROUTER_API_KEY")
    
    if not api_key:
        logger.warning("No OpenRouter API key provided. AI-enhanced processing will be disabled.")
    
    run_tests(api_key=api_key)
