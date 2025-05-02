"""
OCR engine for text extraction from images.
"""
import os
import logging
import pytesseract
from PIL import Image
from pdf2image import convert_from_path
from typing import List, Dict, Any, Optional

logger = logging.getLogger(__name__)

class OCREngine:
    """
    OCR engine for text extraction from images.
    """
    
    def __init__(self, config: Optional[Dict[str, Any]] = None):
        """
        Initialize the OCR engine.
        
        Args:
            config: Configuration options
        """
        self.config = config or {}
        
        # Configure pytesseract path if provided
        if "tesseract_cmd" in self.config:
            pytesseract.pytesseract.tesseract_cmd = self.config["tesseract_cmd"]
    
    def extract_text_from_image(self, image_path: str) -> str:
        """
        Extract text from an image.
        
        Args:
            image_path: Path to the image
            
        Returns:
            Extracted text
        """
        try:
            # Open image
            image = Image.open(image_path)
            
            # Extract text
            text = pytesseract.image_to_string(image)
            
            return text
        except Exception as e:
            logger.error(f"Error extracting text from image {image_path}: {str(e)}")
            return ""
    
    def extract_text_from_pdf(self, pdf_path: str) -> List[Dict[str, Any]]:
        """
        Extract text from a PDF using OCR.
        
        Args:
            pdf_path: Path to the PDF
            
        Returns:
            List of page data with extracted text
        """
        try:
            # Convert PDF to images
            images = convert_from_path(pdf_path)
            
            # Extract text from each image
            pages = []
            
            for i, image in enumerate(images):
                # Save image temporarily
                temp_path = f"temp_ocr_{i}.jpg"
                image.save(temp_path)
                
                # Extract text
                text = self.extract_text_from_image(temp_path)
                
                # Add to pages
                pages.append({
                    "page_num": i + 1,
                    "text": text
                })
                
                # Remove temporary image
                os.remove(temp_path)
            
            return pages
        except Exception as e:
            logger.error(f"Error extracting text from PDF {pdf_path}: {str(e)}")
            return []
