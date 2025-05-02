"""
Advanced Image Processing Module for Financial Documents.

This module provides enhanced image processing capabilities specifically
designed for financial documents, with a focus on table detection and extraction.
"""

import os
import logging
import numpy as np
import cv2
from PIL import Image
import pytesseract
from typing import List, Dict, Any, Tuple, Optional
import tempfile

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class AdvancedImageProcessor:
    """
    Advanced image processing for financial documents.
    """
    
    def __init__(
        self,
        languages: List[str] = ['eng'],
        dpi: int = 300,
        debug: bool = False,
        output_dir: Optional[str] = None
    ):
        """
        Initialize the advanced image processor.
        
        Args:
            languages: List of language codes for OCR
            dpi: DPI for image conversion
            debug: Whether to enable debug mode
            output_dir: Directory to save debug images
        """
        self.languages = languages
        self.dpi = dpi
        self.debug = debug
        
        # Create output directory if provided
        if output_dir:
            self.output_dir = output_dir
            os.makedirs(output_dir, exist_ok=True)
        else:
            self.output_dir = tempfile.mkdtemp()
        
        # OCR configuration
        self.ocr_config = {
            'page_segmentation_mode': 6,  # Assume a single uniform block of text
            'ocr_engine_mode': 3,         # Default, based on what is available
            'lang': '+'.join(languages)
        }
    
    def process_image(self, image_path: str) -> Dict[str, Any]:
        """
        Process an image for enhanced table detection and text extraction.
        
        Args:
            image_path: Path to the image
            
        Returns:
            Dictionary with processing results
        """
        logger.info(f"Processing image: {image_path}")
        
        # Load image
        image = cv2.imread(image_path)
        if image is None:
            logger.error(f"Failed to load image: {image_path}")
            return {"error": "Failed to load image"}
        
        # Preprocess image
        preprocessed = self._preprocess_image(image)
        
        # Save preprocessed image if in debug mode
        if self.debug:
            preprocessed_path = os.path.join(self.output_dir, "preprocessed.png")
            cv2.imwrite(preprocessed_path, preprocessed)
            logger.debug(f"Saved preprocessed image to {preprocessed_path}")
        
        # Detect tables
        tables = self._detect_tables(preprocessed)
        
        # Extract text from tables
        table_data = self._extract_table_data(preprocessed, tables)
        
        # Perform OCR on the entire image
        ocr_results = self._perform_ocr(preprocessed)
        
        return {
            "tables": table_data,
            "ocr_results": ocr_results,
            "table_count": len(tables)
        }
    
    def _preprocess_image(self, image: np.ndarray) -> np.ndarray:
        """
        Preprocess an image for better table detection and OCR.
        
        Args:
            image: Input image
            
        Returns:
            Preprocessed image
        """
        # Convert to grayscale if needed
        if len(image.shape) == 3:
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        else:
            gray = image.copy()
        
        # Apply adaptive thresholding
        thresh = cv2.adaptiveThreshold(
            gray, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, 
            cv2.THRESH_BINARY, 11, 2
        )
        
        # Denoise
        denoised = cv2.fastNlMeansDenoising(thresh, None, 10, 7, 21)
        
        # Deskew if needed
        deskewed = self._deskew_image(denoised)
        
        return deskewed
    
    def _deskew_image(self, image: np.ndarray) -> np.ndarray:
        """
        Deskew an image to correct rotation.
        
        Args:
            image: Input image
            
        Returns:
            Deskewed image
        """
        try:
            # Calculate skew angle
            coords = np.column_stack(np.where(image > 0))
            angle = cv2.minAreaRect(coords)[-1]
            
            # Adjust angle
            if angle < -45:
                angle = -(90 + angle)
            else:
                angle = -angle
            
            # Rotate image if angle is significant
            if abs(angle) > 0.5:
                (h, w) = image.shape[:2]
                center = (w // 2, h // 2)
                M = cv2.getRotationMatrix2D(center, angle, 1.0)
                rotated = cv2.warpAffine(
                    image, M, (w, h),
                    flags=cv2.INTER_CUBIC,
                    borderMode=cv2.BORDER_REPLICATE
                )
                return rotated
        except Exception as e:
            logger.warning(f"Deskew failed: {str(e)}")
        
        return image
    
    def _detect_tables(self, image: np.ndarray) -> List[Dict[str, Any]]:
        """
        Detect tables in an image using multiple methods.
        
        Args:
            image: Preprocessed image
            
        Returns:
            List of detected tables with coordinates
        """
        tables = []
        
        # Method 1: Line detection
        line_tables = self._detect_tables_with_lines(image)
        tables.extend(line_tables)
        
        # Method 2: Grid detection
        grid_tables = self._detect_tables_with_grid(image)
        tables.extend(grid_tables)
        
        # Method 3: Contour detection
        contour_tables = self._detect_tables_with_contours(image)
        tables.extend(contour_tables)
        
        # Remove overlapping tables
        filtered_tables = self._filter_overlapping_tables(tables)
        
        return filtered_tables
    
    def _detect_tables_with_lines(self, image: np.ndarray) -> List[Dict[str, Any]]:
        """
        Detect tables using line detection.
        
        Args:
            image: Preprocessed image
            
        Returns:
            List of detected tables
        """
        tables = []
        
        try:
            # Create a copy of the image
            img_copy = image.copy()
            
            # Apply edge detection
            edges = cv2.Canny(img_copy, 50, 150, apertureSize=3)
            
            # Dilate edges to connect nearby lines
            kernel = np.ones((3, 3), np.uint8)
            dilated = cv2.dilate(edges, kernel, iterations=1)
            
            # Detect lines using Hough transform
            lines = cv2.HoughLinesP(
                dilated, 1, np.pi/180, 
                threshold=100, minLineLength=100, maxLineGap=20
            )
            
            if lines is None:
                return []
            
            # Group lines into horizontal and vertical
            h_lines = []
            v_lines = []
            
            for line in lines:
                x1, y1, x2, y2 = line[0]
                if abs(x2 - x1) > abs(y2 - y1):
                    h_lines.append(line[0])
                else:
                    v_lines.append(line[0])
            
            # Find intersections of horizontal and vertical lines
            if len(h_lines) > 0 and len(v_lines) > 0:
                # Create a mask for visualization
                if self.debug:
                    line_mask = np.zeros_like(image)
                    for line in h_lines:
                        x1, y1, x2, y2 = line
                        cv2.line(line_mask, (x1, y1), (x2, y2), 255, 2)
                    for line in v_lines:
                        x1, y1, x2, y2 = line
                        cv2.line(line_mask, (x1, y1), (x2, y2), 255, 2)
                    
                    line_mask_path = os.path.join(self.output_dir, "line_mask.png")
                    cv2.imwrite(line_mask_path, line_mask)
                
                # Find table boundaries
                h_lines = sorted(h_lines, key=lambda x: x[1])
                v_lines = sorted(v_lines, key=lambda x: x[0])
                
                # Group horizontal lines that are close to each other
                h_groups = self._group_lines(h_lines, axis=1, threshold=20)
                v_groups = self._group_lines(v_lines, axis=0, threshold=20)
                
                # Find potential tables
                for h_group in h_groups:
                    if len(h_group) < 2:
                        continue
                    
                    for v_group in v_groups:
                        if len(v_group) < 2:
                            continue
                        
                        # Calculate table boundaries
                        x_min = min(line[0] for line in v_group)
                        x_max = max(line[2] for line in v_group)
                        y_min = min(line[1] for line in h_group)
                        y_max = max(line[3] for line in h_group)
                        
                        # Check if table is large enough
                        width = x_max - x_min
                        height = y_max - y_min
                        
                        if width > 100 and height > 50:
                            tables.append({
                                "x": int(x_min),
                                "y": int(y_min),
                                "width": int(width),
                                "height": int(height),
                                "method": "line_detection",
                                "confidence": 0.8
                            })
        except Exception as e:
            logger.warning(f"Line-based table detection failed: {str(e)}")
        
        return tables
    
    def _detect_tables_with_grid(self, image: np.ndarray) -> List[Dict[str, Any]]:
        """
        Detect tables using grid detection.
        
        Args:
            image: Preprocessed image
            
        Returns:
            List of detected tables
        """
        tables = []
        
        try:
            # Create a copy of the image
            img_copy = image.copy()
            
            # Apply morphological operations to highlight grid structure
            kernel = np.ones((3, 3), np.uint8)
            morph = cv2.morphologyEx(img_copy, cv2.MORPH_CLOSE, kernel)
            
            # Apply adaptive threshold
            thresh = cv2.adaptiveThreshold(
                morph, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, 
                cv2.THRESH_BINARY_INV, 11, 2
            )
            
            # Dilate to connect grid lines
            dilated = cv2.dilate(thresh, kernel, iterations=1)
            
            # Find contours
            contours, _ = cv2.findContours(
                dilated, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE
            )
            
            # Filter contours by size
            for contour in contours:
                x, y, w, h = cv2.boundingRect(contour)
                
                # Check if contour is large enough to be a table
                if w > 100 and h > 50:
                    # Check if it has a grid-like structure
                    roi = dilated[y:y+h, x:x+w]
                    
                    # Count horizontal and vertical lines
                    h_projection = np.sum(roi, axis=1)
                    v_projection = np.sum(roi, axis=0)
                    
                    h_lines = np.sum(h_projection > 0)
                    v_lines = np.sum(v_projection > 0)
                    
                    # If there are multiple lines in both directions, it's likely a table
                    if h_lines > 3 and v_lines > 3:
                        tables.append({
                            "x": x,
                            "y": y,
                            "width": w,
                            "height": h,
                            "method": "grid_detection",
                            "confidence": 0.85
                        })
        except Exception as e:
            logger.warning(f"Grid-based table detection failed: {str(e)}")
        
        return tables
    
    def _detect_tables_with_contours(self, image: np.ndarray) -> List[Dict[str, Any]]:
        """
        Detect tables using contour detection.
        
        Args:
            image: Preprocessed image
            
        Returns:
            List of detected tables
        """
        tables = []
        
        try:
            # Create a copy of the image
            img_copy = image.copy()
            
            # Apply threshold
            _, thresh = cv2.threshold(img_copy, 150, 255, cv2.THRESH_BINARY_INV)
            
            # Find contours
            contours, _ = cv2.findContours(
                thresh, cv2.RETR_TREE, cv2.CHAIN_APPROX_SIMPLE
            )
            
            # Filter contours by size and shape
            for contour in contours:
                # Get bounding rectangle
                x, y, w, h = cv2.boundingRect(contour)
                
                # Check if contour is large enough to be a table
                if w > 200 and h > 100:
                    # Calculate contour area and bounding rectangle area
                    contour_area = cv2.contourArea(contour)
                    rect_area = w * h
                    
                    # Calculate aspect ratio
                    aspect_ratio = w / h
                    
                    # Tables typically have a reasonable aspect ratio and fill most of their bounding rectangle
                    if 0.2 < aspect_ratio < 5 and contour_area / rect_area > 0.3:
                        tables.append({
                            "x": x,
                            "y": y,
                            "width": w,
                            "height": h,
                            "method": "contour_detection",
                            "confidence": 0.7
                        })
        except Exception as e:
            logger.warning(f"Contour-based table detection failed: {str(e)}")
        
        return tables
    
    def _filter_overlapping_tables(self, tables: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Filter out overlapping tables, keeping the one with higher confidence.
        
        Args:
            tables: List of detected tables
            
        Returns:
            Filtered list of tables
        """
        if not tables:
            return []
        
        # Sort tables by confidence
        sorted_tables = sorted(tables, key=lambda x: x["confidence"], reverse=True)
        
        filtered_tables = []
        for table in sorted_tables:
            # Check if this table overlaps with any table in the filtered list
            overlapping = False
            for filtered_table in filtered_tables:
                if self._is_overlapping(table, filtered_table):
                    overlapping = True
                    break
            
            if not overlapping:
                filtered_tables.append(table)
        
        return filtered_tables
    
    def _is_overlapping(self, table1: Dict[str, Any], table2: Dict[str, Any]) -> bool:
        """
        Check if two tables overlap.
        
        Args:
            table1: First table
            table2: Second table
            
        Returns:
            True if tables overlap, False otherwise
        """
        # Calculate intersection
        x1 = max(table1["x"], table2["x"])
        y1 = max(table1["y"], table2["y"])
        x2 = min(table1["x"] + table1["width"], table2["x"] + table2["width"])
        y2 = min(table1["y"] + table1["height"], table2["y"] + table2["height"])
        
        # Check if there is an intersection
        if x2 <= x1 or y2 <= y1:
            return False
        
        # Calculate intersection area
        intersection_area = (x2 - x1) * (y2 - y1)
        
        # Calculate areas of both tables
        area1 = table1["width"] * table1["height"]
        area2 = table2["width"] * table2["height"]
        
        # Calculate overlap ratio
        smaller_area = min(area1, area2)
        overlap_ratio = intersection_area / smaller_area
        
        # Consider tables as overlapping if the overlap ratio is significant
        return overlap_ratio > 0.5
    
    def _group_lines(self, lines: List[List[int]], axis: int, threshold: int) -> List[List[List[int]]]:
        """
        Group lines that are close to each other.
        
        Args:
            lines: List of lines
            axis: Axis to group by (0 for x, 1 for y)
            threshold: Distance threshold
            
        Returns:
            List of line groups
        """
        if not lines:
            return []
        
        # Sort lines by the specified axis
        sorted_lines = sorted(lines, key=lambda x: x[axis])
        
        groups = []
        current_group = [sorted_lines[0]]
        
        for i in range(1, len(sorted_lines)):
            current_line = sorted_lines[i]
            prev_line = sorted_lines[i-1]
            
            # Check if current line is close to previous line
            if abs(current_line[axis] - prev_line[axis]) <= threshold:
                current_group.append(current_line)
            else:
                # Start a new group
                groups.append(current_group)
                current_group = [current_line]
        
        # Add the last group
        if current_group:
            groups.append(current_group)
        
        return groups
    
    def _extract_table_data(self, image: np.ndarray, tables: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Extract data from detected tables.
        
        Args:
            image: Preprocessed image
            tables: List of detected tables
            
        Returns:
            List of tables with extracted data
        """
        table_data = []
        
        for i, table in enumerate(tables):
            # Extract table region
            x, y, w, h = table["x"], table["y"], table["width"], table["height"]
            table_img = image[y:y+h, x:x+w]
            
            # Save table image if in debug mode
            if self.debug:
                table_img_path = os.path.join(self.output_dir, f"table_{i+1}.png")
                cv2.imwrite(table_img_path, table_img)
            
            # Detect grid structure
            grid_structure = self._detect_grid_structure(table_img)
            
            # Extract text from cells
            cells_text = self._extract_cells_text(table_img, grid_structure)
            
            # Create table data
            table_info = {
                "id": f"table_{i+1}",
                "x": x,
                "y": y,
                "width": w,
                "height": h,
                "method": table["method"],
                "confidence": table["confidence"],
                "grid_structure": grid_structure,
                "cells": cells_text
            }
            
            table_data.append(table_info)
        
        return table_data
    
    def _detect_grid_structure(self, table_img: np.ndarray) -> Dict[str, Any]:
        """
        Detect grid structure in a table image.
        
        Args:
            table_img: Table image
            
        Returns:
            Dictionary with grid structure information
        """
        # Create a copy of the image
        img_copy = table_img.copy()
        
        # Apply edge detection
        edges = cv2.Canny(img_copy, 50, 150, apertureSize=3)
        
        # Dilate edges to connect nearby lines
        kernel = np.ones((3, 3), np.uint8)
        dilated = cv2.dilate(edges, kernel, iterations=1)
        
        # Detect lines using Hough transform
        lines = cv2.HoughLinesP(
            dilated, 1, np.pi/180, 
            threshold=50, minLineLength=50, maxLineGap=10
        )
        
        if lines is None:
            return {"rows": 0, "columns": 0, "cell_coordinates": []}
        
        # Group lines into horizontal and vertical
        h_lines = []
        v_lines = []
        
        for line in lines:
            x1, y1, x2, y2 = line[0]
            if abs(x2 - x1) > abs(y2 - y1):
                h_lines.append((min(x1, x2), y1, max(x1, x2), y2))
            else:
                v_lines.append((x1, min(y1, y2), x2, max(y1, y2)))
        
        # Group horizontal and vertical lines
        h_groups = self._group_lines_by_position(h_lines, axis=1)
        v_groups = self._group_lines_by_position(v_lines, axis=0)
        
        # Get representative lines from each group
        h_representatives = [self._get_representative_line(group) for group in h_groups]
        v_representatives = [self._get_representative_line(group) for group in v_groups]
        
        # Sort lines by position
        h_representatives.sort(key=lambda x: x[1])
        v_representatives.sort(key=lambda x: x[0])
        
        # Calculate cell coordinates
        cell_coordinates = []
        
        for i in range(len(h_representatives) - 1):
            for j in range(len(v_representatives) - 1):
                top = h_representatives[i][1]
                bottom = h_representatives[i+1][1]
                left = v_representatives[j][0]
                right = v_representatives[j+1][0]
                
                cell_coordinates.append({
                    "row": i,
                    "column": j,
                    "x": left,
                    "y": top,
                    "width": right - left,
                    "height": bottom - top
                })
        
        return {
            "rows": len(h_representatives) - 1,
            "columns": len(v_representatives) - 1,
            "cell_coordinates": cell_coordinates
        }
    
    def _group_lines_by_position(self, lines: List[Tuple[int, int, int, int]], axis: int) -> List[List[Tuple[int, int, int, int]]]:
        """
        Group lines by their position.
        
        Args:
            lines: List of lines
            axis: Axis to group by (0 for x, 1 for y)
            
        Returns:
            List of line groups
        """
        if not lines:
            return []
        
        # Sort lines by the specified axis
        sorted_lines = sorted(lines, key=lambda x: x[axis])
        
        groups = []
        current_group = [sorted_lines[0]]
        
        for i in range(1, len(sorted_lines)):
            current_line = sorted_lines[i]
            prev_line = current_group[-1]
            
            # Check if current line is close to previous line
            if abs(current_line[axis] - prev_line[axis]) <= 10:
                current_group.append(current_line)
            else:
                # Start a new group
                groups.append(current_group)
                current_group = [current_line]
        
        # Add the last group
        if current_group:
            groups.append(current_group)
        
        return groups
    
    def _get_representative_line(self, lines: List[Tuple[int, int, int, int]]) -> Tuple[int, int, int, int]:
        """
        Get a representative line from a group of lines.
        
        Args:
            lines: Group of lines
            
        Returns:
            Representative line
        """
        if not lines:
            return (0, 0, 0, 0)
        
        # Calculate average coordinates
        x1_avg = sum(line[0] for line in lines) // len(lines)
        y1_avg = sum(line[1] for line in lines) // len(lines)
        x2_avg = sum(line[2] for line in lines) // len(lines)
        y2_avg = sum(line[3] for line in lines) // len(lines)
        
        return (x1_avg, y1_avg, x2_avg, y2_avg)
    
    def _extract_cells_text(self, table_img: np.ndarray, grid_structure: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        Extract text from cells in a table.
        
        Args:
            table_img: Table image
            grid_structure: Grid structure information
            
        Returns:
            List of cells with extracted text
        """
        cells_text = []
        
        for cell in grid_structure.get("cell_coordinates", []):
            # Extract cell region
            x, y, w, h = cell["x"], cell["y"], cell["width"], cell["height"]
            
            # Check if coordinates are valid
            if x < 0 or y < 0 or x + w > table_img.shape[1] or y + h > table_img.shape[0]:
                continue
            
            cell_img = table_img[y:y+h, x:x+w]
            
            # Skip empty cells
            if np.mean(cell_img) > 250:
                continue
            
            # Perform OCR on cell
            text = self._ocr_on_cell(cell_img)
            
            # Add cell with text
            cells_text.append({
                "row": cell["row"],
                "column": cell["column"],
                "text": text.strip()
            })
        
        return cells_text
    
    def _ocr_on_cell(self, cell_img: np.ndarray) -> str:
        """
        Perform OCR on a cell image.
        
        Args:
            cell_img: Cell image
            
        Returns:
            Extracted text
        """
        try:
            # Convert to PIL image
            pil_img = Image.fromarray(cell_img)
            
            # Perform OCR
            config = f"--psm {self.ocr_config['page_segmentation_mode']} --oem {self.ocr_config['ocr_engine_mode']}"
            text = pytesseract.image_to_string(pil_img, lang=self.ocr_config['lang'], config=config)
            
            return text.strip()
        except Exception as e:
            logger.warning(f"OCR on cell failed: {str(e)}")
            return ""
    
    def _perform_ocr(self, image: np.ndarray) -> Dict[str, Any]:
        """
        Perform OCR on the entire image.
        
        Args:
            image: Preprocessed image
            
        Returns:
            Dictionary with OCR results
        """
        try:
            # Convert to PIL image
            pil_img = Image.fromarray(image)
            
            # Prepare OCR configuration
            config = f"--psm {self.ocr_config['page_segmentation_mode']} --oem {self.ocr_config['ocr_engine_mode']}"
            
            # Perform OCR
            text = pytesseract.image_to_string(pil_img, lang=self.ocr_config['lang'], config=config)
            
            # Get bounding boxes for words
            boxes = pytesseract.image_to_data(pil_img, lang=self.ocr_config['lang'], config=config, output_type=pytesseract.Output.DICT)
            
            # Filter valid boxes
            valid_indices = [i for i, conf in enumerate(boxes["conf"]) if conf > 0]
            
            words = []
            for i in valid_indices:
                word = {
                    "text": boxes["text"][i],
                    "conf": boxes["conf"][i],
                    "x": boxes["left"][i],
                    "y": boxes["top"][i],
                    "width": boxes["width"][i],
                    "height": boxes["height"][i],
                    "line_num": boxes["line_num"][i],
                    "block_num": boxes["block_num"][i]
                }
                words.append(word)
            
            return {
                "text": text,
                "words": words
            }
        except Exception as e:
            logger.error(f"OCR failed: {str(e)}")
            return {"text": "", "words": []}
