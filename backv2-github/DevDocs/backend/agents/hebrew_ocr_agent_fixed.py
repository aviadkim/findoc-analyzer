"""
Hebrew OCR Agent for accurate text recognition in Hebrew financial documents.
"""
import pytesseract
from PIL import Image
import numpy as np
import cv2
import os
import tempfile
import json
import re
import logging
from pathlib import Path
from typing import Dict, Any, List, Optional, Union, Tuple
from .base_agent import BaseAgent

# Set up logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class HebrewOCRAgent(BaseAgent):
    """Agent specialized in recognizing Hebrew text in financial documents."""

    def __init__(
        self,
        api_key: Optional[str] = None,
        **kwargs
    ):
        """
        Initialize the Hebrew OCR agent.

        Args:
            api_key: OpenRouter API key for AI-enhanced text correction
            **kwargs: Additional parameters for the base agent
        """
        super().__init__(name="Hebrew OCR Agent")
        self.api_key = api_key
        self.description = "I specialize in recognizing Hebrew text in financial documents with high accuracy."

        # OCR configuration
        self.lang = kwargs.get('lang', "heb+eng")  # Support for Hebrew and English
        self.config = kwargs.get('config', "--psm 6 --oem 1")  # Tesseract configuration
        
        # Enhanced options
        self.enhance_contrast = kwargs.get('enhance_contrast', True)
        self.deskew = kwargs.get('deskew', True)
        self.denoise = kwargs.get('denoise', True)
        self.detect_orientation = kwargs.get('detect_orientation', True)
        self.use_ai_enhancement = kwargs.get('use_ai_enhancement', True) and api_key is not None
        
        # Confidence threshold for text recognition
        self.confidence_threshold = kwargs.get('confidence_threshold', 60)

        # Financial keywords in Hebrew for improving recognition accuracy
        self.financial_keywords = [
            "סה\"כ", "סך הכל", "חשבון", "תיק", "השקעות", "ריבית",
            "מניות", "אג\"ח", "תשואה", "דיבידנד", "עמלה", "מט\"ח",
            "יתרה", "הפקדה", "משיכה", "שער", "עו\"ש", "ני\"ע",
            "נייר ערך", "מספר חשבון", "תאריך", "שווי", "כמות",
            "מחיר", "עלות", "רווח", "הפסד", "אחוז", "סיכום"
        ]
        
        # Check if Tesseract is installed
        self.tesseract_available = self._check_tesseract()
        if not self.tesseract_available:
            logger.warning("Tesseract OCR is not installed or not in PATH. OCR functionality will be limited.")

    def _check_tesseract(self) -> bool:
        """Check if Tesseract is installed and available."""
        try:
            pytesseract.get_tesseract_version()
            return True
        except Exception:
            return False

    def process(self, task: Dict[str, Any]) -> Dict[str, Any]:
        """
        Process a task to extract text from an image or PDF.

        Args:
            task: Task dictionary with the following keys:
                - image_path: Path to the image file
                - or
                - image: Image as numpy array
                - or
                - pdf_path: Path to the PDF file
                - with_positions: Whether to include text positions (default: False)
                - language: OCR language (default: "heb+eng")
                - financial_doc: Whether this is a financial document (default: True)
                - output_path: Path to save the processed output (optional)
                - page_numbers: Specific page numbers to process (optional)
                - detect_tables: Whether to detect tables (default: True)

        Returns:
            Dictionary with extracted text and/or tables
        """
        # Get options
        with_positions = task.get('with_positions', False)
        language = task.get('language', self.lang)
        financial_doc = task.get('financial_doc', True)
        output_path = task.get('output_path', None)
        page_numbers = task.get('page_numbers', None)
        detect_tables = task.get('detect_tables', True)

        # Check if Tesseract is available
        if not self.tesseract_available:
            return {
                'status': 'error',
                'message': 'Tesseract OCR is not installed or not in PATH'
            }

        # Check if this is a PDF file
        if 'pdf_path' in task:
            pdf_path = task['pdf_path']
            if not isinstance(pdf_path, str):
                return {
                    'status': 'error',
                    'message': 'pdf_path must be a string'
                }

            try:
                # Process the PDF
                return self._process_pdf(
                    pdf_path, 
                    output_path=output_path,
                    language=language,
                    financial_doc=financial_doc,
                    with_positions=with_positions,
                    page_numbers=page_numbers,
                    detect_tables=detect_tables
                )
            except Exception as e:
                logger.error(f"Error processing PDF: {str(e)}")
                return {
                    'status': 'error',
                    'message': f'Failed to process PDF: {str(e)}'
                }

        # Get the image
        if 'image_path' in task:
            image_path = task['image_path']
            if isinstance(image_path, str) or isinstance(image_path, Path):
                try:
                    img = Image.open(image_path)
                    img_array = np.array(img)
                except Exception as e:
                    return {
                        'status': 'error',
                        'message': f'Failed to read image from {image_path}: {str(e)}'
                    }
            else:
                return {
                    'status': 'error',
                    'message': 'image_path must be a string or Path object'
                }
        elif 'image' in task:
            img_array = task['image']
            if not isinstance(img_array, np.ndarray):
                return {
                    'status': 'error',
                    'message': 'image must be a numpy array'
                }
        else:
            return {
                'status': 'error',
                'message': 'Task must contain either image_path, image, or pdf_path'
            }

        # Process the image
        if with_positions:
            result = self.extract_text_with_positions(img_array, financial_doc=financial_doc)
            
            # Detect tables if requested
            tables = []
            if detect_tables:
                tables = self.detect_tables(img_array)
                
            return {
                'status': 'success',
                'text_with_positions': result,
                'tables': tables if tables else []
            }
        else:
            text = self.extract_text(img_array, financial_doc=financial_doc)
            
            # Detect tables if requested
            tables = []
            if detect_tables:
                tables = self.detect_tables(img_array)
                
            return {
                'status': 'success',
                'text': text,
                'tables': tables if tables else []
            }

    def _process_pdf(
        self, 
        pdf_path: str, 
        output_path: Optional[str] = None,
        language: str = "heb+eng",
        financial_doc: bool = True,
        with_positions: bool = False,
        page_numbers: Optional[List[int]] = None,
        detect_tables: bool = True
    ) -> Dict[str, Any]:
        """
        Process a PDF file to extract text and tables.

        Args:
            pdf_path: Path to the PDF file
            output_path: Path to save the processed output
            language: OCR language
            financial_doc: Whether this is a financial document
            with_positions: Whether to include text positions
            page_numbers: Specific page numbers to process
            detect_tables: Whether to detect tables

        Returns:
            Dictionary with extracted text and/or tables
        """
        # Check if PDF file exists
        if not os.path.exists(pdf_path):
            return {
                'status': 'error',
                'message': f'PDF file not found: {pdf_path}'
            }
            
        # Try to import pdf2image
        try:
            from pdf2image import convert_from_path
        except ImportError:
            return {
                'status': 'error',
                'message': 'pdf2image is not installed. Install with: pip install pdf2image'
            }
            
        # Create a temporary directory for the images
        with tempfile.TemporaryDirectory() as temp_dir:
            try:
                # Convert PDF to images
                logger.info(f"Converting PDF to images: {pdf_path}")
                images = convert_from_path(
                    pdf_path,
                    dpi=300,
                    output_folder=temp_dir,
                    fmt="png",
                    paths_only=False
                )
                
                # Filter pages if page_numbers is provided
                if page_numbers:
                    filtered_images = []
                    for i, img in enumerate(images):
                        if i + 1 in page_numbers:  # 1-based indexing for page numbers
                            filtered_images.append(img)
                    images = filtered_images
                
                # Process each page
                all_text = []
                all_text_with_positions = []
                all_tables = []
                
                for i, img in enumerate(images):
                    page_num = i + 1
                    logger.info(f"Processing page {page_num}")
                    
                    # Convert PIL Image to numpy array
                    img_array = np.array(img)
                    
                    # Extract text
                    if with_positions:
                        text_result = self.extract_text_with_positions(img_array, financial_doc=financial_doc)
                        all_text_with_positions.append({
                            'page': page_num,
                            'text_elements': text_result
                        })
                    else:
                        text = self.extract_text(img_array, financial_doc=financial_doc)
                        all_text.append({
                            'page': page_num,
                            'text': text
                        })
                    
                    # Detect tables if requested
                    if detect_tables:
                        tables = self.detect_tables(img_array)
                        if tables:
                            for table in tables:
                                table['page'] = page_num
                            all_tables.extend(tables)
                
                # Prepare the result
                result = {
                    'status': 'success',
                    'pdf_path': pdf_path,
                    'page_count': len(images),
                    'processed_pages': len(all_text) if not with_positions else len(all_text_with_positions),
                    'tables': all_tables
                }
                
                if with_positions:
                    result['text_with_positions'] = all_text_with_positions
                else:
                    result['text_by_page'] = all_text
                    # Also include a combined text for convenience
                    result['text'] = '\n\n'.join([page['text'] for page in all_text])
                
                # Save the result if output_path is provided
                if output_path:
                    os.makedirs(os.path.dirname(output_path), exist_ok=True)
                    with open(output_path, 'w', encoding='utf-8') as f:
                        json.dump(result, f, ensure_ascii=False, indent=2)
                    result['output_path'] = output_path
                
                return result
                
            except Exception as e:
                logger.error(f"Error processing PDF: {str(e)}")
                return {
                    'status': 'error',
                    'message': f'Failed to process PDF: {str(e)}'
                }

    def extract_text(self, image, financial_doc: bool = True) -> str:
        """
        Extract text from an image with emphasis on Hebrew text.

        Args:
            image: Input image (path, PIL Image, or numpy array)
            financial_doc: Whether this is a financial document

        Returns:
            Extracted text
        """
        # Load the image
        if isinstance(image, str) or isinstance(image, Path):
            img = Image.open(image)
            img_array = np.array(img)
        else:
            # If already received as numpy array
            img_array = image

        # Preprocess the image
        preprocessed = self._preprocess_image(img_array, financial_doc=financial_doc)

        # Run OCR
        text = pytesseract.image_to_string(preprocessed, lang=self.lang, config=self.config)

        # Post-process the text
        processed_text = self._postprocess_text(text, financial_doc=financial_doc)

        # Enhance with AI if enabled and API key is available
        if self.use_ai_enhancement and self.api_key and financial_doc:
            try:
                enhanced_text = self._enhance_text_with_ai(processed_text)
                if enhanced_text:
                    return enhanced_text
            except Exception as e:
                logger.error(f"Error enhancing text with AI: {str(e)}")
                # Fall back to the processed text

        return processed_text

    def extract_text_with_positions(self, image, financial_doc: bool = True) -> List[Dict[str, Any]]:
        """
        Extract text with position in the image - important for document structure recognition.

        Args:
            image: Input image (path, PIL Image, or numpy array)
            financial_doc: Whether this is a financial document

        Returns:
            List of dictionaries with text and position information
        """
        if isinstance(image, str) or isinstance(image, Path):
            img = Image.open(image)
            img_array = np.array(img)
        else:
            img_array = image

        # Preprocess the image
        preprocessed = self._preprocess_image(img_array, financial_doc=financial_doc)

        # Get text data with position
        data = pytesseract.image_to_data(
            preprocessed, lang=self.lang, config=self.config,
            output_type=pytesseract.Output.DICT
        )

        # Create list of words with positions
        text_with_positions = []
        for i in range(len(data['text'])):
            if data['text'][i].strip() and int(data['conf'][i]) > self.confidence_threshold:
                # Apply post-processing to individual text elements
                text = data['text'][i]
                if financial_doc:
                    text = self._fix_common_errors(text)
                
                text_with_positions.append({
                    'text': text,
                    'x': data['left'][i],
                    'y': data['top'][i],
                    'width': data['width'][i],
                    'height': data['height'][i],
                    'conf': data['conf'][i],
                    'block_num': data['block_num'][i],
                    'par_num': data['par_num'][i],
                    'line_num': data['line_num'][i],
                    'word_num': data['word_num'][i]
                })

        return text_with_positions

    def detect_tables(self, image) -> List[Dict[str, Any]]:
        """
        Detect tables in an image.

        Args:
            image: Input image (path, PIL Image, or numpy array)

        Returns:
            List of dictionaries with table information
        """
        if isinstance(image, str) or isinstance(image, Path):
            img = Image.open(image)
            img_array = np.array(img)
        else:
            img_array = image

        # Convert to grayscale if needed
        if len(img_array.shape) == 3:
            gray = cv2.cvtColor(img_array, cv2.COLOR_BGR2GRAY)
        else:
            gray = img_array.copy()

        # Apply binary thresholding
        _, binary = cv2.threshold(gray, 150, 255, cv2.THRESH_BINARY_INV)

        # Find contours
        contours, _ = cv2.findContours(binary, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

        # Filter contours to find potential tables
        tables = []
        for i, contour in enumerate(contours):
            x, y, w, h = cv2.boundingRect(contour)
            
            # Filter by size (tables are usually large)
            if w > img_array.shape[1] * 0.3 and h > img_array.shape[0] * 0.1:
                # Check if it has a grid-like structure
                roi = binary[y:y+h, x:x+w]
                
                # Detect horizontal and vertical lines
                horizontal_kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (25, 1))
                vertical_kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (1, 25))
                
                horizontal_lines = cv2.morphologyEx(roi, cv2.MORPH_OPEN, horizontal_kernel)
                vertical_lines = cv2.morphologyEx(roi, cv2.MORPH_OPEN, vertical_kernel)
                
                # Combine lines
                table_structure = cv2.add(horizontal_lines, vertical_lines)
                
                # Count lines
                h_lines = cv2.HoughLinesP(horizontal_lines, 1, np.pi/180, 100, minLineLength=w*0.3, maxLineGap=20)
                v_lines = cv2.HoughLinesP(vertical_lines, 1, np.pi/180, 100, minLineLength=h*0.3, maxLineGap=20)
                
                # If there are enough lines, it's likely a table
                if (h_lines is not None and len(h_lines) >= 3) or (v_lines is not None and len(v_lines) >= 3):
                    # Extract table content
                    table_img = gray[y:y+h, x:x+w]
                    
                    # Extract text from the table
                    table_text = pytesseract.image_to_string(table_img, lang=self.lang, config=self.config)
                    
                    # Extract table data
                    table_data = self._extract_table_data(table_img)
                    
                    tables.append({
                        'id': f'table_{i+1}',
                        'x': x,
                        'y': y,
                        'width': w,
                        'height': h,
                        'text': table_text,
                        'data': table_data,
                        'row_count': len(table_data) if table_data else 0,
                        'col_count': len(table_data[0]) if table_data and len(table_data) > 0 else 0
                    })

        return tables

    def _extract_table_data(self, table_img) -> List[List[str]]:
        """
        Extract structured data from a table image.

        Args:
            table_img: Table image as numpy array

        Returns:
            List of rows, each containing a list of cell values
        """
        # Use Tesseract's table extraction capability
        try:
            # Get data with bounding boxes
            data = pytesseract.image_to_data(
                table_img, lang=self.lang, config=self.config + ' --psm 6',
                output_type=pytesseract.Output.DICT
            )
            
            # Group text by lines
            lines = {}
            for i in range(len(data['text'])):
                if data['text'][i].strip() and int(data['conf'][i]) > self.confidence_threshold:
                    line_num = data['line_num'][i]
                    if line_num not in lines:
                        lines[line_num] = []
                    
                    lines[line_num].append({
                        'text': data['text'][i],
                        'x': data['left'][i],
                        'width': data['width'][i]
                    })
            
            # Sort lines by y-coordinate
            sorted_lines = sorted(lines.items())
            
            # Extract rows
            rows = []
            for _, line in sorted_lines:
                # Sort text elements by x-coordinate
                sorted_line = sorted(line, key=lambda item: item['x'])
                
                # Extract text
                row = [item['text'] for item in sorted_line]
                rows.append(row)
            
            return rows
        except Exception as e:
            logger.error(f"Error extracting table data: {str(e)}")
            return []

    def _preprocess_image(self, img_array, financial_doc: bool = True):
        """
        Preprocess the image for better OCR results.

        Args:
            img_array: Input image as numpy array
            financial_doc: Whether this is a financial document

        Returns:
            Preprocessed image
        """
        # Convert to grayscale if needed
        if len(img_array.shape) == 3:
            gray = cv2.cvtColor(img_array, cv2.COLOR_BGR2GRAY)
        else:
            gray = img_array.copy()

        # Detect and correct orientation if enabled
        if self.detect_orientation:
            try:
                # Use Tesseract to detect orientation
                osd = pytesseract.image_to_osd(gray)
                angle = int(re.search(r'Rotate: (\d+)', osd).group(1))
                
                # Rotate if needed
                if angle != 0:
                    (h, w) = gray.shape[:2]
                    center = (w // 2, h // 2)
                    M = cv2.getRotationMatrix2D(center, angle, 1.0)
                    gray = cv2.warpAffine(gray, M, (w, h), flags=cv2.INTER_CUBIC, borderMode=cv2.BORDER_REPLICATE)
            except Exception as e:
                logger.warning(f"Error detecting orientation: {str(e)}")

        # Apply deskewing if enabled
        if self.deskew:
            try:
                # Calculate skew angle
                coords = np.column_stack(np.where(gray > 0))
                angle = cv2.minAreaRect(coords)[-1]
                
                if angle < -45:
                    angle = -(90 + angle)
                else:
                    angle = -angle
                    
                # Rotate to correct skew if angle is significant
                if abs(angle) > 0.5:
                    (h, w) = gray.shape[:2]
                    center = (w // 2, h // 2)
                    M = cv2.getRotationMatrix2D(center, angle, 1.0)
                    gray = cv2.warpAffine(gray, M, (w, h), flags=cv2.INTER_CUBIC, borderMode=cv2.BORDER_REPLICATE)
            except Exception as e:
                logger.warning(f"Error deskewing image: {str(e)}")

        # Apply denoising if enabled
        if self.denoise:
            gray = cv2.fastNlMeansDenoising(gray, None, 10, 7, 21)

        # Enhance contrast if enabled
        if self.enhance_contrast:
            # Apply CLAHE (Contrast Limited Adaptive Histogram Equalization)
            clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
            gray = clahe.apply(gray)

        # Additional enhancement for financial documents
        if financial_doc:
            # Use filter to improve small text (common in financial tables)
            blurred = cv2.GaussianBlur(gray, (3, 3), 0)
            gray = cv2.addWeighted(gray, 1.5, blurred, -0.5, 0)

        return gray

    def _postprocess_text(self, text: str, financial_doc: bool = True) -> str:
        """
        Additional processing to improve recognized text.

        Args:
            text: OCR-recognized text
            financial_doc: Whether this is a financial document

        Returns:
            Processed text
        """
        # Fix spacing
        processed = ' '.join(text.split())
        
        # Apply common error fixes
        processed = self._fix_common_errors(processed)
        
        # Additional processing for financial documents
        if financial_doc:
            # Improve keyword recognition
            for keyword in self.financial_keywords:
                # Check if there's a similar but not identical word to a keyword
                for word in processed.split():
                    if self._similar_words(word, keyword) and word != keyword:
                        processed = processed.replace(word, keyword)
            
            # Fix number formats
            processed = self._fix_number_formats(processed)

        return processed

    def _fix_common_errors(self, text: str) -> str:
        """
        Fix common OCR errors, especially for Hebrew text.

        Args:
            text: OCR-recognized text

        Returns:
            Corrected text
        """
        # Handle specific replacements for common OCR errors in Hebrew
        replacements = {
            'ו1': 'ני',
            '11"ס': 'ני"ע',
            'סהי"נ': 'סה"כ',
            'טר\'ח': 'מט"ח',
            'אג"ה': 'אג"ח',
            'מניוח': 'מניות',
            'השקעוח': 'השקעות',
            'חשבוו': 'חשבון',
            'ריביח': 'ריבית',
            'חשואה': 'תשואה',
            'דיבידנר': 'דיבידנד',
            'עמלח': 'עמלה',
            'יחרה': 'יתרה',
            'הפקרה': 'הפקדה',
            'משיכח': 'משיכה',
            'שעו': 'שער'
        }

        for old, new in replacements.items():
            text = text.replace(old, new)

        return text

    def _fix_number_formats(self, text: str) -> str:
        """
        Fix number formats in financial documents.

        Args:
            text: OCR-recognized text

        Returns:
            Text with corrected number formats
        """
        # Fix decimal separators (replace comma with period in numbers)
        # This regex finds numbers with commas as decimal separators
        text = re.sub(r'(\d+),(\d+)', r'\1.\2', text)
        
        # Fix thousand separators (ensure consistent format)
        # This regex finds numbers with periods as thousand separators
        text = re.sub(r'(\d{1,3})\.(\d{3})(?![\d\.])', r'\1,\2', text)
        
        return text

    def _similar_words(self, word1: str, word2: str, threshold: float = 0.7) -> bool:
        """
        Check if two words are similar (Levenshtein distance).

        Args:
            word1: First word
            word2: Second word
            threshold: Similarity threshold

        Returns:
            True if words are similar, False otherwise
        """
        # For financial documents, we can use a simpler similarity check
        # if there are many identical letters and similar length
        if abs(len(word1) - len(word2)) > 2:
            return False

        # Calculate number of common characters
        common_chars = set(word1) & set(word2)
        similarity = len(common_chars) / max(len(set(word1)), len(set(word2)))

        return similarity > threshold

    def _enhance_text_with_ai(self, text: str) -> str:
        """
        Enhance OCR text using AI (OpenRouter API).

        Args:
            text: OCR-recognized text

        Returns:
            Enhanced text
        """
        if not self.api_key or not text:
            return text
            
        try:
            import requests
            
            # Prepare the prompt
            prompt = f"""
            You are an expert in correcting OCR errors in Hebrew and English financial documents.
            Below is text extracted from a financial document using OCR. It may contain errors.
            Please correct any OCR errors, focusing on:
            
            1. Fixing Hebrew characters that were incorrectly recognized
            2. Correcting financial terms and numbers
            3. Maintaining the original format and structure
            4. Preserving all financial data (numbers, percentages, etc.)
            
            Here is the OCR text:
            
            {text}
            
            Return only the corrected text without any explanations or additional comments.
            """
            
            # Call the OpenRouter API
            response = requests.post(
                "https://openrouter.ai/api/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {self.api_key}",
                    "Content-Type": "application/json"
                },
                json={
                    "model": "anthropic/claude-3-opus:beta",
                    "messages": [
                        {"role": "user", "content": prompt}
                    ],
                    "max_tokens": 4000,
                    "temperature": 0.2
                }
            )
            
            # Check if the request was successful
            if response.status_code == 200:
                result = response.json()
                enhanced_text = result["choices"][0]["message"]["content"]
                return enhanced_text
            else:
                logger.error(f"Error calling OpenRouter API: {response.status_code} {response.text}")
                return text
                
        except Exception as e:
            logger.error(f"Error enhancing text with AI: {str(e)}")
            return text
