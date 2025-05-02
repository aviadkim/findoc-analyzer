"""
Test script for the Layout Analyzer.

This script tests the Layout Analyzer on a PDF document.
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

# Import the Layout Analyzer
try:
    from layout_analyzer import LayoutAnalyzer, test_layout_analyzer
    LAYOUT_AVAILABLE = True
except ImportError as e:
    logger.error(f"Error importing Layout Analyzer: {str(e)}")
    LAYOUT_AVAILABLE = False


def find_messos_pdf() -> Optional[str]:
    """
    Find the messos PDF file.

    Returns:
        Path to the messos PDF file, or None if not found
    """
    # Check in the current directory
    if os.path.exists("messos.pdf"):
        return "messos.pdf"

    # Check in the src/uploads directory
    uploads_dir = os.path.join("src", "uploads")
    if os.path.exists(uploads_dir):
        for file in os.listdir(uploads_dir):
            if file.endswith(".pdf") and "messos" in file.lower():
                return os.path.join(uploads_dir, file)

    return None


def test_layout_analysis(pdf_path: str, output_path: Optional[str] = None) -> Dict[str, Any]:
    """
    Test the Layout Analyzer.

    Args:
        pdf_path: Path to the PDF file
        output_path: Path to save the results

    Returns:
        Layout analysis results
    """
    if not LAYOUT_AVAILABLE:
        logger.error("Layout Analyzer not available")
        print("Layout Analyzer not available")
        return {"error": "Layout Analyzer not available"}

    # Test the Layout Analyzer
    result = test_layout_analyzer(pdf_path, output_path)

    # Print summary
    print(f"\nAnalyzed {result.get('page_count', 0)} pages")

    # Print layout summary for each page
    for page in result.get("pages", []):
        page_num = page.get("page_number", 0)
        layout = page.get("layout", {})
        blocks = layout.get("blocks", [])

        print(f"\nPage {page_num}:")

        # Count block types
        block_types = {}
        for block in blocks:
            block_type = block.get("type", "Unknown")
            if block_type not in block_types:
                block_types[block_type] = 0
            block_types[block_type] += 1

        # Print block type counts
        for block_type, count in block_types.items():
            print(f"  {block_type}: {count}")

        # Print text content of all blocks
        print(f"\nText content on page {page_num}:")
        for i, block in enumerate(blocks):
            text = block.get("text", "")
            if i < 10:  # Only print the first 10 blocks to avoid overwhelming output
                print(f"  Block {i+1}: {text[:100]}..." if len(text) > 100 else f"  Block {i+1}: {text}")

    # Save output
    if output_path:
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(result, f, indent=2, ensure_ascii=False)

        print(f"\nSaved layout analysis to {output_path}")

    return result


def main():
    """
    Main function.
    """
    # Parse command line arguments
    parser = argparse.ArgumentParser(description='Test layout analysis.')
    parser.add_argument('--pdf', type=str, help='Path to the PDF file')
    parser.add_argument('--output', type=str, help='Path to save the layout analysis output')

    args = parser.parse_args()

    # Get the PDF path
    pdf_path = args.pdf

    if not pdf_path:
        # Try to find the messos PDF
        pdf_path = find_messos_pdf()

        if not pdf_path:
            logger.error("No PDF file specified and could not find messos PDF")
            print("No PDF file specified and could not find messos PDF")
            return

    # Set output path
    output_path = args.output or f"{os.path.splitext(pdf_path)[0]}_layout_analysis.json"

    # Test layout analyzer
    print("\n=================================================")
    print("  Testing Layout Analyzer")
    print("=================================================")

    layout_results = test_layout_analysis(pdf_path, output_path)

    print("\n=================================================")
    print("  Testing Complete")
    print("=================================================")


if __name__ == "__main__":
    main()
