"""
Test script for the TableExtractorAgent.
"""
import os
import sys
import json
import argparse
import logging
import tempfile
import numpy as np
import cv2
from pathlib import Path

# Set up logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Add the parent directory to the path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Import the agent
from DevDocs.backend.agents.table_extractor_agent_fixed import TableExtractorAgent

def create_test_table_image(output_path=None):
    """
    Create a test image with a table.
    
    Args:
        output_path: Path to save the image
        
    Returns:
        Path to the created image
    """
    # Create a blank image
    img = np.ones((800, 1200, 3), dtype=np.uint8) * 255
    
    # Add title
    font = cv2.FONT_HERSHEY_SIMPLEX
    font_scale = 1.5
    font_thickness = 2
    font_color = (0, 0, 0)  # Black
    
    cv2.putText(img, "Financial Portfolio Summary", (400, 50), font, font_scale, font_color, font_thickness)
    
    # Draw table outline
    cv2.rectangle(img, (100, 100), (1100, 700), (0, 0, 0), 2)
    
    # Add table headers
    headers = ["Security", "ISIN", "Quantity", "Price", "Value", "Weight"]
    
    # Draw header row
    cv2.rectangle(img, (100, 100), (1100, 150), (200, 200, 200), -1)  # Gray background
    cv2.line(img, (100, 150), (1100, 150), (0, 0, 0), 2)  # Bottom line
    
    # Add header text
    header_x = [150, 350, 550, 700, 850, 1000]
    for i, header in enumerate(headers):
        cv2.putText(img, header, (header_x[i], 135), font, 0.7, font_color, 1)
    
    # Add vertical lines
    for x in [300, 500, 650, 800, 950]:
        cv2.line(img, (x, 100), (x, 700), (0, 0, 0), 1)
    
    # Add data rows
    data = [
        ["Apple Inc.", "US0378331005", "100", "150.25", "15,025.00", "25.0%"],
        ["Microsoft Corp.", "US5949181045", "75", "240.50", "18,037.50", "30.0%"],
        ["Amazon.com Inc.", "US0231351067", "20", "320.75", "6,415.00", "10.7%"],
        ["Tesla Inc.", "US88160R1014", "30", "180.30", "5,409.00", "9.0%"],
        ["Alphabet Inc.", "US02079K1079", "25", "260.40", "6,510.00", "10.8%"],
        ["Meta Platforms Inc.", "US30303M1027", "40", "215.60", "8,624.00", "14.3%"],
        ["NVIDIA Corp.", "US67066G1040", "15", "420.80", "6,312.00", "10.5%"],
        ["JPMorgan Chase & Co.", "US46625H1005", "50", "140.20", "7,010.00", "11.7%"],
        ["Johnson & Johnson", "US4781601046", "60", "160.35", "9,621.00", "16.0%"],
        ["Visa Inc.", "US92826C8394", "45", "200.15", "9,006.75", "15.0%"]
    ]
    
    # Add data rows
    for i, row in enumerate(data):
        y = 190 + i * 50
        
        # Draw horizontal line
        if i > 0:
            cv2.line(img, (100, y - 40), (1100, y - 40), (0, 0, 0), 1)
        
        # Add row data
        for j, cell in enumerate(row):
            x = header_x[j]
            cv2.putText(img, cell, (x, y), font, 0.6, font_color, 1)
    
    # Add total row
    cv2.rectangle(img, (100, 650), (1100, 700), (220, 220, 220), -1)  # Light gray background
    cv2.line(img, (100, 650), (1100, 650), (0, 0, 0), 2)  # Top line
    
    # Add total text
    cv2.putText(img, "Total", (150, 685), font, 0.8, font_color, 2)
    cv2.putText(img, "91,970.25", (850, 685), font, 0.8, font_color, 2)
    cv2.putText(img, "100.0%", (1000, 685), font, 0.8, font_color, 2)
    
    # Save the image if output_path is provided
    if output_path:
        cv2.imwrite(output_path, img)
        return output_path
    else:
        # Create a temporary file
        with tempfile.NamedTemporaryFile(suffix=".png", delete=False) as temp:
            temp_path = temp.name
        
        cv2.imwrite(temp_path, img)
        return temp_path

def create_test_pdf(output_path):
    """
    Create a test PDF with tables.
    
    Args:
        output_path: Path to save the PDF
        
    Returns:
        Path to the created PDF
    """
    try:
        from reportlab.lib.pagesizes import letter
        from reportlab.pdfgen import canvas
        from reportlab.lib.utils import ImageReader
    except ImportError:
        logger.error("reportlab is not installed. Install with: pip install reportlab")
        return None
    
    # Create a canvas
    c = canvas.Canvas(output_path, pagesize=letter)
    
    # Create test images for each page
    page1_img_path = create_test_table_image()
    
    # Create a second table image (asset allocation)
    page2_img_path = tempfile.NamedTemporaryFile(suffix=".png", delete=False).name
    
    # Create a blank image
    img = np.ones((800, 1200, 3), dtype=np.uint8) * 255
    
    # Add title
    font = cv2.FONT_HERSHEY_SIMPLEX
    font_scale = 1.5
    font_thickness = 2
    font_color = (0, 0, 0)  # Black
    
    cv2.putText(img, "Asset Allocation", (400, 50), font, font_scale, font_color, font_thickness)
    
    # Draw table outline
    cv2.rectangle(img, (300, 100), (900, 400), (0, 0, 0), 2)
    
    # Add table headers
    headers = ["Asset Class", "Value", "Weight"]
    
    # Draw header row
    cv2.rectangle(img, (300, 100), (900, 150), (200, 200, 200), -1)  # Gray background
    cv2.line(img, (300, 150), (900, 150), (0, 0, 0), 2)  # Bottom line
    
    # Add header text
    header_x = [350, 600, 800]
    for i, header in enumerate(headers):
        cv2.putText(img, header, (header_x[i], 135), font, 0.7, font_color, 1)
    
    # Add vertical lines
    for x in [500, 700]:
        cv2.line(img, (x, 100), (x, 400), (0, 0, 0), 1)
    
    # Add data rows
    data = [
        ["Equities", "60,000.00", "65.2%"],
        ["Bonds", "20,000.00", "21.7%"],
        ["Cash", "10,000.00", "10.9%"],
        ["Other", "2,000.00", "2.2%"]
    ]
    
    # Add data rows
    for i, row in enumerate(data):
        y = 190 + i * 50
        
        # Draw horizontal line
        if i > 0:
            cv2.line(img, (300, y - 40), (900, y - 40), (0, 0, 0), 1)
        
        # Add row data
        for j, cell in enumerate(row):
            x = header_x[j]
            cv2.putText(img, cell, (x, y), font, 0.6, font_color, 1)
    
    # Add total row
    cv2.rectangle(img, (300, 350), (900, 400), (220, 220, 220), -1)  # Light gray background
    cv2.line(img, (300, 350), (900, 350), (0, 0, 0), 2)  # Top line
    
    # Add total text
    cv2.putText(img, "Total", (350, 385), font, 0.8, font_color, 2)
    cv2.putText(img, "92,000.00", (600, 385), font, 0.8, font_color, 2)
    cv2.putText(img, "100.0%", (800, 385), font, 0.8, font_color, 2)
    
    # Save the image
    cv2.imwrite(page2_img_path, img)
    
    # Add images to PDF
    img1 = ImageReader(page1_img_path)
    img2 = ImageReader(page2_img_path)
    
    # Add first page
    c.drawImage(img1, 0, 0, width=letter[0], height=letter[1])
    c.showPage()
    
    # Add second page
    c.drawImage(img2, 0, 0, width=letter[0], height=letter[1])
    c.showPage()
    
    # Save the PDF
    c.save()
    
    # Clean up temporary image files
    os.unlink(page1_img_path)
    os.unlink(page2_img_path)
    
    return output_path

def test_table_extractor_agent():
    """
    Test the TableExtractorAgent with various inputs.
    """
    logger.info("Testing TableExtractorAgent")
    
    # Create output directory
    output_dir = Path("agent_test_results")
    output_dir.mkdir(exist_ok=True)
    
    # Initialize the agent
    agent = TableExtractorAgent()
    
    # Test 1: Extract tables from a test image
    logger.info("Test 1: Extracting tables from a test image")
    test_img_path = create_test_table_image(output_path=str(output_dir / "test_table_image.png"))
    
    task1 = {
        "image_path": test_img_path,
        "output_format": "json"
    }
    
    result1 = agent.process(task1)
    
    # Save the result
    with open(output_dir / "table_extractor_image_result.json", "w", encoding="utf-8") as f:
        json.dump(result1, f, ensure_ascii=False, indent=2)
    
    logger.info(f"Test 1 result saved to {output_dir / 'table_extractor_image_result.json'}")
    
    # Test 2: Extract tables from a test PDF
    logger.info("Test 2: Extracting tables from a test PDF")
    test_pdf_path = create_test_pdf(str(output_dir / "test_table_document.pdf"))
    
    if test_pdf_path:
        task2 = {
            "file_path": test_pdf_path,
            "pages": "all",
            "output_format": "json"
        }
        
        result2 = agent.process(task2)
        
        # Save the result
        with open(output_dir / "table_extractor_pdf_result.json", "w", encoding="utf-8") as f:
            json.dump(result2, f, ensure_ascii=False, indent=2)
        
        logger.info(f"Test 2 result saved to {output_dir / 'table_extractor_pdf_result.json'}")
    else:
        logger.warning("Skipping PDF test due to missing dependencies")
        result2 = {"status": "skipped"}
    
    # Test 3: Extract tables with specific extractors
    if test_pdf_path:
        logger.info("Test 3: Extracting tables with specific extractors")
        
        task3 = {
            "file_path": test_pdf_path,
            "pages": "all",
            "output_format": "json",
            "extractors": ["pytesseract"]
        }
        
        result3 = agent.process(task3)
        
        # Save the result
        with open(output_dir / "table_extractor_specific_result.json", "w", encoding="utf-8") as f:
            json.dump(result3, f, ensure_ascii=False, indent=2)
        
        logger.info(f"Test 3 result saved to {output_dir / 'table_extractor_specific_result.json'}")
    else:
        logger.warning("Skipping specific extractors test due to missing dependencies")
        result3 = {"status": "skipped"}
    
    # Test 4: Classify tables
    logger.info("Test 4: Classifying tables")
    
    if result1['status'] == 'success' and 'tables' in result1:
        classified_tables = agent.classify_tables(result1['tables'])
        
        # Save the result
        with open(output_dir / "table_extractor_classified_result.json", "w", encoding="utf-8") as f:
            json.dump({
                'status': 'success',
                'tables': classified_tables,
                'count': len(classified_tables)
            }, f, ensure_ascii=False, indent=2)
        
        logger.info(f"Test 4 result saved to {output_dir / 'table_extractor_classified_result.json'}")
        result4 = {"status": "success"}
    else:
        logger.warning("Skipping table classification test due to missing tables")
        result4 = {"status": "skipped"}
    
    # Print summary
    logger.info("TableExtractorAgent tests completed")
    logger.info(f"Results saved to {output_dir}")
    
    return {
        'status': 'success',
        'test1_result': result1['status'] == 'success',
        'test2_result': result2['status'] == 'success' or result2['status'] == 'skipped',
        'test3_result': result3['status'] == 'success' or result3['status'] == 'skipped',
        'test4_result': result4['status'] == 'success' or result4['status'] == 'skipped',
        'output_dir': str(output_dir)
    }

if __name__ == "__main__":
    test_table_extractor_agent()
