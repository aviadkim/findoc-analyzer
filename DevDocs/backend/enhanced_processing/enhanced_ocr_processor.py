"""
Enhanced OCR Processor Module for Financial Documents

This module provides advanced OCR capabilities specifically optimized for financial documents.
It implements a multi-stage preprocessing pipeline, document structure analysis,
and financial-specific post-processing to achieve higher accuracy in text extraction.
"""

import os
import logging
import tempfile
import subprocess
from typing import List, Dict, Any, Optional, Tuple
import json
import numpy as np
import cv2
import pytesseract
from pdf2image import convert_from_path
import re

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class EnhancedOCRProcessor:
    """
    Enhanced OCR processing optimized for financial documents.
    
    This class provides advanced preprocessing, document type detection,
    structure analysis, and financial-specific post-processing.
    """
    
    def __init__(self, pdf_path: str):
        """
        Initialize the EnhancedOCRProcessor with a PDF file path.
        
        Args:
            pdf_path: Path to the PDF file
        """
        self.pdf_path = pdf_path
        self.output_path = None
        self.images = []
        self.ocr_text = ""
        self.document_type = "unknown"
        self.document_language = "eng"
        self.confidence_scores = []
        
        # Financial terms for post-processing and correction
        self.financial_terms = [
            "account", "balance", "portfolio", "investment", "security",
            "securities", "stock", "bond", "fund", "etf", "isin", "cusip",
            "dividend", "interest", "yield", "maturity", "equity", "asset",
            "allocation", "currency", "exchange", "rate", "price", "value",
            "total", "subtotal", "net", "gross", "fee", "commission", "tax",
            "capital", "gain", "loss", "income", "expense", "statement",
            "report", "bank", "broker", "client", "account", "holding",
            "position", "share", "unit", "quantity", "nominal", "market",
            "settlement", "transaction", "purchase", "sale", "transfer"
        ]
        
        # Common replacements for OCR errors in financial documents
        self.financial_replacements = {
            "lnvestment": "Investment",
            "lncome": "Income",
            "Portfollo": "Portfolio",
            "Securitles": "Securities",
            "ISiN": "ISIN",
            "Totai": "Total",
            "vaiue": "value",
            "Capitai": "Capital",
            "0ption": "Option",
            "Yieid": "Yield",
            "Caiculated": "Calculated",
            "Baiance": "Balance",
            "Vaiuation": "Valuation",
            "lnterest": "Interest",
            "Matunty": "Maturity",
            "Coupcn": "Coupon",
            "Annuai": "Annual",
            "Percentaqe": "Percentage"
        }
        
        # Currency symbols mapping
        self.currency_symbols = {
            "$": "USD",
            "€": "EUR", 
            "£": "GBP",
            "¥": "JPY",
            "Fr.": "CHF",
            "₣": "CHF",
            "C$": "CAD",
            "A$": "AUD",
            "HK$": "HKD"
        }
        
        # Verify the PDF file exists
        if not os.path.exists(pdf_path):
            raise FileNotFoundError(f"PDF file not found: {pdf_path}")
        
        logger.info(f"Initialized EnhancedOCRProcessor for {pdf_path}")
    
    def process(self, languages: List[str] = ['eng'], dpi: int = 300) -> str:
        """
        Process the PDF with enhanced OCR.
        
        Args:
            languages: List of language codes for OCR
            dpi: DPI for image conversion
            
        Returns:
            Path to the OCR-processed PDF
        """
        logger.info(f"Processing {self.pdf_path} with enhanced OCR (languages: {languages}, dpi: {dpi})")
        
        # Create a temporary output file
        with tempfile.NamedTemporaryFile(suffix='.pdf', delete=False) as tmp_file:
            self.output_path = tmp_file.name
        
        # Convert PDF to images
        self.images = convert_from_path(self.pdf_path, dpi=dpi)
        logger.info(f"Converted PDF to {len(self.images)} images")
        
        # Detect document type and language from first page
        self._detect_document_properties(self.images[0])
        logger.info(f"Detected document type: {self.document_type}, language: {self.document_language}")
        
        # Add detected language to the language list if not already present
        if self.document_language not in languages:
            languages.append(self.document_language)
        
        # Try to use OCRmyPDF if available
        if self._is_ocrmypdf_available():
            self._process_with_ocrmypdf(languages, self.output_path)
        else:
            # Process each page with enhanced OCR
            self._process_with_enhanced_ocr(languages, dpi, self.output_path)
        
        logger.info(f"OCR processing complete, output saved to {self.output_path}")
        
        return self.output_path
    
    def _is_ocrmypdf_available(self) -> bool:
        """
        Check if OCRmyPDF is available.
        
        Returns:
            Boolean indicating if OCRmyPDF is available
        """
        try:
            subprocess.run(['ocrmypdf', '--version'], 
                          stdout=subprocess.PIPE, 
                          stderr=subprocess.PIPE, 
                          check=True)
            return True
        except (subprocess.SubprocessError, FileNotFoundError):
            logger.warning("OCRmyPDF not available, falling back to enhanced Tesseract processing")
            return False
    
    def _process_with_ocrmypdf(self, languages: List[str], output_path: str) -> None:
        """
        Process the PDF with OCRmyPDF with enhanced options.
        
        Args:
            languages: List of language codes
            output_path: Path to save the output PDF
        """
        try:
            # Prepare language parameter
            lang_param = '+'.join(languages)
            
            # Set optimization level based on document type
            if self.document_type in ["portfolio_statement", "financial_statement"]:
                optimize_level = "3"  # Highest optimization for financial documents
            else:
                optimize_level = "2"  # Medium optimization for other documents
            
            # Run OCRmyPDF with enhanced options
            subprocess.run([
                'ocrmypdf',
                '--language', lang_param,
                '--deskew',              # Straighten skewed pages
                '--clean',               # Clean pages before OCR
                '--optimize', optimize_level,  # Optimize PDF based on document type
                '--skip-text',           # Skip pages with text
                '--force-ocr',           # Force OCR even if text is present
                '--output-type', 'pdf',  # Output as PDF
                '--rotate-pages',        # Automatically rotate pages
                '--remove-background',   # Remove background for cleaner text
                '--jobs', '4',           # Use 4 parallel jobs for processing
                self.pdf_path,
                output_path
            ], check=True)
            
            logger.info("OCRmyPDF processing successful")
        except subprocess.SubprocessError as e:
            logger.error(f"Error processing with OCRmyPDF: {e}")
            # Fallback to enhanced OCR
            self._process_with_enhanced_ocr(languages, 300, output_path)
    
    def _process_with_enhanced_ocr(self, languages: List[str], dpi: int, output_path: str) -> None:
        """
        Process the PDF with enhanced Tesseract OCR.
        
        Args:
            languages: List of languages for OCR
            dpi: DPI for image conversion
            output_path: Path to save the output PDF
        """
        try:
            # Prepare language parameter
            lang_param = '+'.join(languages)
            
            # Process each image with enhanced OCR
            all_text = []
            
            for i, image in enumerate(self.images):
                logger.info(f"Processing image {i+1}/{len(self.images)}")
                
                # Convert PIL image to OpenCV format for preprocessing
                img_cv = cv2.cvtColor(np.array(image), cv2.COLOR_RGB2BGR)
                
                # Analyze document structure to identify regions
                regions = self._analyze_document_structure(img_cv)
                
                # Preprocess image based on document type
                img_processed = self._enhanced_preprocess_image(img_cv)
                
                # For financial documents, try multiple preprocessing approaches
                if self.document_type in ["portfolio_statement", "financial_statement", "trading_statement"]:
                    # Get multiple versions of the processed image
                    img_versions = [
                        img_processed,  # Standard processing
                        self._preprocess_for_tables(img_cv),  # Table-optimized
                        self._preprocess_for_financial_text(img_cv)  # Text-optimized
                    ]
                    
                    # Process each version
                    version_texts = []
                    version_scores = []
                    
                    for v, img_version in enumerate(img_versions):
                        # Process with Tesseract
                        config = f'--oem 1 --psm 6'  # LSTM engine, assume single block of text
                        text = pytesseract.image_to_string(img_version, lang=lang_param, config=config)
                        
                        # Calculate confidence score
                        confidence = self._assess_ocr_quality(text)
                        version_texts.append(text)
                        version_scores.append(confidence)
                        
                        logger.debug(f"Page {i+1} version {v+1} confidence: {confidence:.2f}")
                    
                    # Select the best version
                    best_idx = version_scores.index(max(version_scores))
                    text = version_texts[best_idx]
                    logger.debug(f"Selected version {best_idx+1} with confidence {version_scores[best_idx]:.2f}")
                else:
                    # For non-financial documents, use standard processing
                    config = f'--oem 1 --psm 6'
                    text = pytesseract.image_to_string(img_processed, lang=lang_param, config=config)
                
                # Apply financial-specific post-processing
                text = self._financial_post_processing(text)
                
                all_text.append(text)
                
                # Save processed image for debugging
                with tempfile.NamedTemporaryFile(suffix='.jpg', delete=False) as tmp_img:
                    debug_path = tmp_img.name
                    cv2.imwrite(debug_path, img_processed)
                    logger.debug(f"Saved processed image to {debug_path}")
            
            # Combine all text
            self.ocr_text = '\n\n'.join(all_text)
            
            # Save OCR text to a file
            text_path = output_path.replace('.pdf', '.txt')
            with open(text_path, 'w', encoding='utf-8') as f:
                f.write(self.ocr_text)
            
            logger.info(f"Saved OCR text to {text_path}")
            
            # Create a PDF from the processed images
            self.images[0].save(
                output_path,
                save_all=True,
                append_images=self.images[1:],
                resolution=dpi
            )
            
            logger.info("Enhanced OCR processing successful")
        except Exception as e:
            logger.error(f"Error in enhanced OCR processing: {e}")
            # If output file doesn't exist, copy the original
            if not os.path.exists(output_path):
                import shutil
                shutil.copy(self.pdf_path, output_path)
    
    def _detect_document_properties(self, image) -> None:
        """
        Detect document type and language from the first page.
        
        Args:
            image: PIL Image of the first page
        """
        # Convert PIL image to OpenCV format
        img_cv = cv2.cvtColor(np.array(image), cv2.COLOR_RGB2BGR)
        
        # Extract text from a sample of the page
        sample = img_cv[:min(1000, img_cv.shape[0]), :min(1000, img_cv.shape[1])]
        sample_text = pytesseract.image_to_string(sample)
        
        # Detect document type
        self.document_type = self._detect_document_type(sample_text)
        
        # Detect language
        try:
            from langdetect import detect
            lang_code = detect(sample_text)
            # Map language codes to Tesseract codes
            lang_map = {
                'en': 'eng',
                'de': 'deu',
                'fr': 'fra',
                'it': 'ita',
                'es': 'spa',
                'he': 'heb',
                'ru': 'rus'
            }
            self.document_language = lang_map.get(lang_code, 'eng')
        except:
            # Fallback to English if language detection fails
            self.document_language = 'eng'
    
    def _detect_document_type(self, text: str) -> str:
        """
        Detect the type of financial document based on text content.
        
        Args:
            text: Text content to analyze
            
        Returns:
            Document type as string
        """
        text = text.lower()
        
        # Check for portfolio statement indicators
        if any(x in text for x in ["portfolio", "holdings", "isin", "securities", "investment summary"]):
            return "portfolio_statement"
            
        # Check for financial statement indicators
        elif any(x in text for x in ["balance sheet", "assets", "liabilities", "equity"]):
            return "financial_statement"
            
        # Check for income statement indicators
        elif any(x in text for x in ["income statement", "revenue", "expenses", "profit", "loss"]):
            return "income_statement"
            
        # Check for trading statement indicators
        elif any(x in text for x in ["trading", "positions", "buy", "sell", "trade confirmation"]):
            return "trading_statement"
            
        # Check for bank statement indicators
        elif any(x in text for x in ["account statement", "transaction", "deposit", "withdrawal"]):
            return "bank_statement"
            
        # Default to general financial document
        else:
            return "general_financial"
    
    def _enhanced_preprocess_image(self, image: np.ndarray) -> np.ndarray:
        """
        Enhanced preprocessing for financial documents.
        
        Args:
            image: Input image as numpy array
            
        Returns:
            Preprocessed image
        """
        # Convert to grayscale if needed
        if len(image.shape) == 3:
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        else:
            gray = image.copy()
        
        # Document deskewing
        try:
            # Find all non-zero points
            coords = np.column_stack(np.where(gray > 0))
            if len(coords) > 100:  # Only attempt deskew if we have enough points
                # Find the minimum area rectangle
                rect = cv2.minAreaRect(coords)
                angle = rect[-1]
                
                # Determine rotation angle
                if angle < -45:
                    angle = -(90 + angle)
                else:
                    angle = -angle
                
                # Only rotate if the angle is significant
                if abs(angle) > 0.5:
                    # Get image dimensions
                    (h, w) = gray.shape[:2]
                    center = (w // 2, h // 2)
                    
                    # Perform rotation
                    M = cv2.getRotationMatrix2D(center, angle, 1.0)
                    gray = cv2.warpAffine(gray, M, (w, h), flags=cv2.INTER_CUBIC, borderMode=cv2.BORDER_REPLICATE)
        except Exception as e:
            logger.warning(f"Deskewing failed: {e}")
        
        # Apply adaptive thresholding with optimization for financial documents
        # Use smaller block size for fine text common in financial docs
        try:
            thresh = cv2.adaptiveThreshold(
                gray, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, 
                cv2.THRESH_BINARY, 11, 2
            )
        except Exception as e:
            logger.warning(f"Adaptive thresholding failed: {e}")
            # Fallback to global thresholding
            _, thresh = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
        
        # Advanced noise removal for financial documents
        try:
            denoised = cv2.fastNlMeansDenoising(thresh, None, 10, 7, 21)
        except Exception as e:
            logger.warning(f"Denoising failed: {e}")
            denoised = thresh
        
        # Apply morphological operations to enhance text
        kernel = np.ones((1, 1), np.uint8)
        enhanced = cv2.morphologyEx(denoised, cv2.MORPH_CLOSE, kernel)
        
        return enhanced
    
    def _preprocess_for_tables(self, image: np.ndarray) -> np.ndarray:
        """
        Preprocessing optimized for table extraction.
        
        Args:
            image: Input image as numpy array
            
        Returns:
            Preprocessed image
        """
        # Convert to grayscale if needed
        if len(image.shape) == 3:
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        else:
            gray = image.copy()
        
        # Apply bilateral filter to preserve edges while reducing noise
        filtered = cv2.bilateralFilter(gray, 9, 75, 75)
        
        # Apply Canny edge detection to find table lines
        edges = cv2.Canny(filtered, 50, 150, apertureSize=3)
        
        # Dilate edges to connect broken lines
        kernel = np.ones((3, 3), np.uint8)
        dilated = cv2.dilate(edges, kernel, iterations=1)
        
        # Use global thresholding to enhance contrast
        _, thresh = cv2.threshold(filtered, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
        
        # Combine edge information with thresholded image
        combined = cv2.bitwise_and(thresh, thresh, mask=cv2.bitwise_not(dilated))
        
        return combined
    
    def _preprocess_for_financial_text(self, image: np.ndarray) -> np.ndarray:
        """
        Preprocessing optimized for financial text extraction.
        
        Args:
            image: Input image as numpy array
            
        Returns:
            Preprocessed image
        """
        # Convert to grayscale if needed
        if len(image.shape) == 3:
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        else:
            gray = image.copy()
        
        # Increase contrast with CLAHE (Contrast Limited Adaptive Histogram Equalization)
        clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
        enhanced = clahe.apply(gray)
        
        # Apply unsharp masking to enhance edges
        gaussian = cv2.GaussianBlur(enhanced, (0, 0), 3)
        unsharp = cv2.addWeighted(enhanced, 1.5, gaussian, -0.5, 0)
        
        # Apply adaptive thresholding
        binary = cv2.adaptiveThreshold(
            unsharp, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, 
            cv2.THRESH_BINARY, 15, 8
        )
        
        return binary
    
    def _analyze_document_structure(self, image: np.ndarray) -> Dict[str, Any]:
        """
        Analyze document structure to identify key regions.
        
        Args:
            image: Input image as numpy array
            
        Returns:
            Dictionary with structural information
        """
        # Convert to grayscale and binarize
        if len(image.shape) == 3:
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        else:
            gray = image.copy()
            
        _, binary = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)
        
        # Find contours for region analysis
        contours, _ = cv2.findContours(binary, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        # Identify document regions
        regions = []
        for contour in contours:
            x, y, w, h = cv2.boundingRect(contour)
            if w > 50 and h > 15:  # Filter small contours
                # Calculate region area
                area = w * h
                
                # Classify region type
                if w > 3 * h:  # Likely a header or footer
                    region_type = "header_footer"
                elif h > 3 * w:  # Likely a sidebar
                    region_type = "sidebar"
                elif w > image.shape[1] * 0.7 and h > image.shape[0] * 0.7:  # Large region
                    region_type = "main_content"
                else:  # Other regions
                    region_type = "content_block"
                
                regions.append({
                    "type": region_type,
                    "bbox": (x, y, w, h),
                    "area": area
                })
        
        return {
            "regions": regions,
            "page_size": gray.shape
        }
    
    def _assess_ocr_quality(self, text: str) -> float:
        """
        Assess the quality of OCR text.
        
        Args:
            text: OCR output text
            
        Returns:
            Quality score between 0 and 1
        """
        if not text:
            return 0.0
        
        score = 0.0
        
        # Check for common financial terms
        financial_term_count = sum(1 for term in self.financial_terms if term in text.lower())
        if financial_term_count > 0:
            # More financial terms indicates higher quality for our use case
            score += min(0.3, financial_term_count * 0.01)
        
        # Check for numbers (common in financial documents)
        number_count = len(re.findall(r'\d+(?:\.\d+)?', text))
        if number_count > 0:
            score += min(0.2, number_count * 0.005)
        
        # Check for currency symbols
        currency_count = sum(1 for symbol in self.currency_symbols.keys() if symbol in text)
        if currency_count > 0:
            score += min(0.1, currency_count * 0.02)
        
        # Check for ISIN codes (indicates good extraction of financial identifiers)
        isin_count = len(re.findall(r'[A-Z]{2}[A-Z0-9]{9}[0-9]', text))
        if isin_count > 0:
            score += min(0.2, isin_count * 0.05)
        
        # Check for common OCR errors
        error_count = sum(1 for error in self.financial_replacements.keys() if error in text)
        if error_count > 0:
            # More errors indicates lower quality
            score -= min(0.2, error_count * 0.02)
        
        # Check for word continuity (text with many spaces likely has OCR errors)
        space_ratio = text.count(' ') / max(1, len(text))
        if space_ratio > 0.3:
            score -= min(0.2, (space_ratio - 0.3) * 2)
        
        # Normalize score between 0 and 1
        score = max(0.0, min(1.0, score + 0.5))  # Add base score of 0.5
        
        return score
    
    def _financial_post_processing(self, text: str) -> str:
        """
        Apply financial-specific post-processing to OCR text.
        
        Args:
            text: OCR output text
            
        Returns:
            Processed text
        """
        if not text:
            return text
        
        # Fix common OCR errors in financial terms
        for error, correction in self.financial_replacements.items():
            text = re.sub(r'\b' + re.escape(error) + r'\b', correction, text)
        
        # Fix currency symbols
        for symbol in self.currency_symbols:
            if symbol in text and symbol != '$':  # $ is common and doesn't need fixing
                # Ensure proper spacing around currency symbols
                text = re.sub(r'(\d)\s*' + re.escape(symbol), r'\1 ' + symbol, text)
                text = re.sub(re.escape(symbol) + r'\s*(\d)', symbol + r' \1', text)
        
        # Fix numeric formats in financial documents
        # Convert "1 , 234 . 56" to "1,234.56"
        text = re.sub(r'(\d+)\s*,\s*(\d{3})\s*\.\s*(\d+)', r'\1,\2.\3', text)
        
        # Convert "1 234 , 56" (European format) to "1,234.56" (if in European format)
        text = re.sub(r'(\d+)\s+(\d{3})\s*,\s*(\d+)', r'\1,\2.\3', text)
        
        # Fix ISIN format (remove spaces and special characters)
        text = re.sub(r'([A-Z]{2})[^A-Z0-9]?([A-Z0-9]{9})[^A-Z0-9]?([0-9])', r'\1\2\3', text)
        
        # Fix percentage format (remove spaces between number and %)
        text = re.sub(r'(\d+(?:\.\d+)?)\s*%', r'\1%', text)
        
        # Fix dates in different formats
        # Format: DD.MM.YYYY or DD/MM/YYYY with spaces
        text = re.sub(r'(\d{1,2})\s*[\.\/]\s*(\d{1,2})\s*[\.\/]\s*(\d{4})', r'\1.\2.\3', text)
        
        # Fix total sums (often have errors in financial documents)
        # Look for totals and ensure they have proper formatting
        total_matches = re.finditer(r'(?:Total|Sum|Balance)(?:[^\d]*)([\d\s,.]+)', text, re.IGNORECASE)
        for match in total_matches:
            original = match.group(1)
            # Clean up total values
            cleaned = re.sub(r'\s+', '', original)  # Remove all spaces
            text = text.replace(original, cleaned)
        
        return text
    
    def extract_text(self) -> str:
        """
        Extract text from the OCR-processed PDF.
        
        Returns:
            Extracted text
        """
        if not self.ocr_text and self.output_path:
            # If we used OCRmyPDF, extract text from the output PDF
            try:
                import pdfplumber
                
                with pdfplumber.open(self.output_path) as pdf:
                    text_parts = []
                    for page in pdf.pages:
                        page_text = page.extract_text() or ''
                        # Apply financial post-processing to each page
                        page_text = self._financial_post_processing(page_text)
                        text_parts.append(page_text)
                    
                    self.ocr_text = '\n\n'.join(text_parts)
            except Exception as e:
                logger.error(f"Error extracting text from OCR-processed PDF: {e}")
        
        return self.ocr_text
    
    def cleanup(self) -> None:
        """
        Clean up temporary files.
        """
        if self.output_path and os.path.exists(self.output_path):
            try:
                os.remove(self.output_path)
                logger.info(f"Removed temporary file {self.output_path}")
                
                # Also remove text file if it exists
                text_path = self.output_path.replace('.pdf', '.txt')
                if os.path.exists(text_path):
                    os.remove(text_path)
                    logger.info(f"Removed temporary file {text_path}")
            except Exception as e:
                logger.error(f"Error cleaning up temporary files: {e}")


# Example usage
if __name__ == "__main__":
    # This will only run when the script is executed directly
    import sys
    
    if len(sys.argv) > 1:
        pdf_path = sys.argv[1]
        processor = EnhancedOCRProcessor(pdf_path)
        output_path = processor.process(languages=['eng'])
        
        print(f"OCR processing complete, output saved to {output_path}")
        
        # Extract text
        text = processor.extract_text()
        print(f"Extracted {len(text)} characters of text")
        
        # Print first 500 characters
        print(text[:500] + '...')
        
        # Clean up
        processor.cleanup()
    else:
        print("Please provide a PDF file path")