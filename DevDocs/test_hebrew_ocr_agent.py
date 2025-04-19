"""
Test script for the enhanced HebrewOCRAgent.
"""
import os
import sys
import json
import numpy as np
import cv2
from pathlib import Path
import argparse
import logging
from PIL import Image
import tempfile

# Set up logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Add the parent directory to the path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Import the agent
from DevDocs.backend.agents.hebrew_ocr_agent_fixed import HebrewOCRAgent

def create_test_image(text, output_path=None, lang="heb"):
    """
    Create a test image with Hebrew text.
    
    Args:
        text: Text to include in the image
        output_path: Path to save the image
        lang: Language of the text
        
    Returns:
        Path to the created image
    """
    # Create a blank image
    img = np.ones((800, 1200, 3), dtype=np.uint8) * 255
    
    # Add text
    font = cv2.FONT_HERSHEY_SIMPLEX
    font_scale = 1
    font_thickness = 2
    font_color = (0, 0, 0)  # Black
    
    # Split text into lines
    lines = text.split('\n')
    
    # Add each line
    y = 100
    for line in lines:
        # For Hebrew text, we need to reverse the text
        if lang == "heb":
            line = line[::-1]
        
        cv2.putText(img, line, (100, y), font, font_scale, font_color, font_thickness)
        y += 50
    
    # Add a simple table
    cv2.rectangle(img, (100, 400), (1100, 700), (0, 0, 0), 2)
    
    # Add table rows
    for i in range(1, 6):
        y = 400 + i * 50
        cv2.line(img, (100, y), (1100, y), (0, 0, 0), 1)
    
    # Add table columns
    for i in range(1, 4):
        x = 100 + i * 250
        cv2.line(img, (x, 400), (x, 700), (0, 0, 0), 1)
    
    # Add some table content
    table_content = [
        ["מספר", "תיאור", "סכום", "אחוז"],
        ["1", "מניות", "10,000", "25%"],
        ["2", "אג\"ח", "15,000", "37.5%"],
        ["3", "מזומן", "5,000", "12.5%"],
        ["4", "קרנות", "10,000", "25%"],
        ["סה\"כ", "", "40,000", "100%"]
    ]
    
    # Add table content
    for i, row in enumerate(table_content):
        y = 435 + i * 50
        for j, cell in enumerate(row):
            x = 125 + j * 250
            # For Hebrew text, we need to reverse the text
            if lang == "heb" and j != 0 and j != 2 and j != 3:  # Don't reverse numbers
                cell = cell[::-1]
            cv2.putText(img, cell, (x, y), font, 0.7, font_color, 1)
    
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
    Create a test PDF with Hebrew text and tables.
    
    Args:
        output_path: Path to save the PDF
        
    Returns:
        Path to the created PDF
    """
    try:
        from reportlab.lib.pagesizes import letter
        from reportlab.pdfgen import canvas
        from reportlab.pdfbase import pdfmetrics
        from reportlab.pdfbase.ttfonts import TTFont
        from reportlab.lib.utils import ImageReader
    except ImportError:
        logger.error("reportlab is not installed. Install with: pip install reportlab")
        return None
    
    # Create a canvas
    c = canvas.Canvas(output_path, pagesize=letter)
    
    # Create test images for each page
    page1_text = "דוח תיק השקעות\nלקוח: ישראל ישראלי\nתאריך: 01/01/2023\nמספר חשבון: 12345678"
    page1_img_path = create_test_image(page1_text)
    
    page2_text = "פירוט ניירות ערך\nסה\"כ שווי: 40,000 ש\"ח\nמספר ניירות: 4"
    page2_img_path = create_test_image(page2_text)
    
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

def test_hebrew_ocr_agent(api_key=None):
    """
    Test the HebrewOCRAgent with various inputs.
    
    Args:
        api_key: OpenRouter API key for AI-enhanced text correction
    """
    logger.info("Testing HebrewOCRAgent")
    
    # Create output directory
    output_dir = Path("agent_test_results")
    output_dir.mkdir(exist_ok=True)
    
    # Initialize the agent
    agent = HebrewOCRAgent(api_key=api_key)
    
    # Test 1: Process a test image with Hebrew text
    logger.info("Test 1: Processing a test image with Hebrew text")
    test_text = "דוח תיק השקעות\nלקוח: ישראל ישראלי\nתאריך: 01/01/2023\nמספר חשבון: 12345678"
    test_img_path = create_test_image(test_text, output_path=str(output_dir / "test_hebrew_image.png"))
    
    task1 = {
        'image_path': test_img_path,
        'with_positions': True,
        'detect_tables': True
    }
    
    result1 = agent.process(task1)
    
    # Save the result
    with open(output_dir / "hebrew_ocr_image_result.json", "w", encoding="utf-8") as f:
        json.dump(result1, f, ensure_ascii=False, indent=2)
    
    logger.info(f"Test 1 result saved to {output_dir / 'hebrew_ocr_image_result.json'}")
    
    # Test 2: Process a test PDF with Hebrew text and tables
    logger.info("Test 2: Processing a test PDF with Hebrew text and tables")
    test_pdf_path = create_test_pdf(str(output_dir / "test_hebrew_document.pdf"))
    
    if test_pdf_path:
        task2 = {
            'pdf_path': test_pdf_path,
            'with_positions': False,
            'detect_tables': True,
            'output_path': str(output_dir / "hebrew_ocr_pdf_result.json")
        }
        
        result2 = agent.process(task2)
        
        logger.info(f"Test 2 result saved to {output_dir / 'hebrew_ocr_pdf_result.json'}")
    else:
        logger.warning("Skipping PDF test due to missing dependencies")
    
    # Test 3: Test table detection
    logger.info("Test 3: Testing table detection")
    
    # Create a test image with a table
    table_img_path = str(output_dir / "test_table_image.png")
    create_test_image("טבלת נתונים פיננסיים", output_path=table_img_path)
    
    task3 = {
        'image_path': table_img_path,
        'detect_tables': True
    }
    
    result3 = agent.process(task3)
    
    # Save the result
    with open(output_dir / "hebrew_ocr_table_result.json", "w", encoding="utf-8") as f:
        json.dump(result3, f, ensure_ascii=False, indent=2)
    
    logger.info(f"Test 3 result saved to {output_dir / 'hebrew_ocr_table_result.json'}")
    
    # Print summary
    logger.info("HebrewOCRAgent tests completed")
    logger.info(f"Results saved to {output_dir}")
    
    return {
        'status': 'success',
        'test1_result': result1['status'],
        'test3_result': result3['status'],
        'output_dir': str(output_dir)
    }

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Test the HebrewOCRAgent")
    parser.add_argument("--api_key", help="OpenRouter API key for AI-enhanced text correction")
    args = parser.parse_args()
    
    # Get API key from environment variable if not provided
    api_key = args.api_key or os.environ.get("OPENROUTER_API_KEY")
    
    test_hebrew_ocr_agent(api_key=api_key)
