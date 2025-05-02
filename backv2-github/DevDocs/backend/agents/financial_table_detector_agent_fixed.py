"""
Financial Table Detector Agent for identifying and extracting tables from financial documents.
"""
import cv2
import numpy as np
import pandas as pd
from PIL import Image
import pytesseract
import re
import os
import json
from typing import Dict, Any, List, Optional, Union, Tuple
from pathlib import Path
from .base_agent import BaseAgent

class FinancialTableDetectorAgent(BaseAgent):
    """Agent for identifying and extracting tables from financial documents."""

    def __init__(
        self,
        api_key: Optional[str] = None,
        lang: str = "eng",
        **kwargs
    ):
        """
        Initialize the financial table detector agent.

        Args:
            api_key: OpenRouter API key
            lang: OCR language (default: "eng")
            **kwargs: Additional parameters for the base agent
        """
        super().__init__(name="Financial Table Detector")
        self.api_key = api_key
        self.description = "I identify and extract tables from financial documents."

        self.lang = lang

        # Common structures of financial tables
        self.table_headers = {
            'balance_sheet': [
                'assets', 'liabilities', 'equity', 'total',
                'fixed assets', 'current assets', 'cash', 'investments'
            ],
            'income_statement': [
                'revenue', 'expenses', 'profit', 'loss', 'cost of sales',
                'gross profit', 'operating profit', 'net profit'
            ],
            'portfolio': [
                'security', 'ISIN', 'quantity', 'price', 'value', 'return',
                'cost', 'profit', 'percentage', '%', 'date', 'type', 'weight'
            ]
        }

    def process(self, task: Dict[str, Any]) -> Dict[str, Any]:
        """
        Process a task to detect and extract tables from an image.

        Args:
            task: Task dictionary with the following keys:
                - image_path: Path to the image file
                - or
                - image: Image as numpy array
                - language: OCR language (optional)

        Returns:
            Dictionary with detected tables and extracted data
        """
        # Get the language
        if 'language' in task:
            self.lang = task['language']

        # Get the image
        if 'image_path' in task:
            image_path = task['image_path']
            if isinstance(image_path, str):
                image = cv2.imread(image_path)
            else:
                raise ValueError("image_path must be a string")
        elif 'image' in task:
            image = task['image']
        else:
            raise ValueError("Task must contain either 'image_path' or 'image'")

        # Detect tables
        tables = self.detect_tables(image)

        # Extract data from tables
        results = []
        for i, table in enumerate(tables):
            try:
                table_data = self.extract_table_data(image, table)

                # Convert DataFrame to list for JSON serialization
                if isinstance(table_data.get('data'), pd.DataFrame):
                    table_data['data'] = table_data['data'].to_dict(orient='records')

                # Add table index
                table_data['table_id'] = i + 1

                # Add region information
                table_data['region'] = {
                    'x1': table['x1'],
                    'y1': table['y1'],
                    'x2': table['x2'],
                    'y2': table['y2'],
                    'rows': table.get('rows', 0),
                    'cols': table.get('cols', 0)
                }

                results.append(table_data)
            except Exception as e:
                print(f"Error extracting data from table {i}: {e}")
                # Add a placeholder for the failed table
                results.append({
                    'table_id': i + 1,
                    'type': 'unknown',
                    'error': str(e),
                    'region': {
                        'x1': table['x1'],
                        'y1': table['y1'],
                        'x2': table['x2'],
                        'y2': table['y2']
                    },
                    'data': []
                })

        return {
            'status': 'success',
            'tables': results,
            'count': len(results)
        }

    def detect_tables(self, image):
        """
        Detect table regions in an image.

        Args:
            image: Image as numpy array or path to image file

        Returns:
            List of detected table regions
        """
        if isinstance(image, str):
            img = cv2.imread(image)
        else:
            img = image.copy()

        # Convert to grayscale
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

        # Apply thresholding to get a binary image
        _, binary = cv2.threshold(gray, 150, 255, cv2.THRESH_BINARY_INV)

        # Detect edges
        edges = cv2.Canny(gray, 50, 150, apertureSize=3)

        # Detect lines using Hough transform
        lines = cv2.HoughLinesP(
            edges,
            rho=1,
            theta=np.pi/180,
            threshold=100,
            minLineLength=100,
            maxLineGap=10
        )

        # If no lines are detected, try a different approach
        if lines is None or len(lines) < 5:  # Need at least 5 lines for a table
            return self._detect_tables_by_contours(img)

        # Analyze lines to detect table structure
        horizontal_lines = []
        vertical_lines = []

        for line in lines:
            x1, y1, x2, y2 = line[0]
            # Calculate line angle
            if x2 - x1 == 0:  # Avoid division by zero
                angle = 90
            else:
                angle = np.abs(np.arctan2(y2 - y1, x2 - x1) * 180.0 / np.pi)

            # Sort into horizontal and vertical lines
            if angle < 20:  # Horizontal line
                horizontal_lines.append((min(y1, y2), min(x1, x2), max(x1, x2)))
            elif angle > 70:  # Vertical line
                vertical_lines.append((min(x1, x2), min(y1, y2), max(y1, y2)))

        # Sort lines
        horizontal_lines.sort()
        vertical_lines.sort()

        # Group horizontal lines that are close to each other
        grouped_h_lines = self._group_lines(horizontal_lines, axis=0, threshold=10)
        grouped_v_lines = self._group_lines(vertical_lines, axis=0, threshold=10)

        # Identify table regions by finding intersections of horizontal and vertical lines
        table_regions = []

        # If there are enough lines for a table (at least 3 rows and 2 columns)
        if len(grouped_h_lines) >= 3 and len(grouped_v_lines) >= 2:
            # Find the boundaries of the table
            top = grouped_h_lines[0][0]
            bottom = grouped_h_lines[-1][0]
            left = grouped_v_lines[0][0]
            right = grouped_v_lines[-1][0]

            # Add some margin
            margin = 20
            table_regions.append({
                'x1': max(0, left - margin),
                'y1': max(0, top - margin),
                'x2': min(img.shape[1], right + margin),
                'y2': min(img.shape[0], bottom + margin),
                'rows': len(grouped_h_lines) - 1,
                'cols': len(grouped_v_lines) - 1,
                'confidence': 0.9  # High confidence for line-based detection
            })

        # If no tables were detected with lines, try text-based detection
        if not table_regions:
            text_regions = self._detect_tables_by_text(img)
            table_regions.extend(text_regions)

        # If still no tables, try contour-based detection
        if not table_regions:
            contour_regions = self._detect_tables_by_contours(img)
            table_regions.extend(contour_regions)

        return table_regions

    def _group_lines(self, lines, axis=0, threshold=10):
        """Group lines that are close to each other."""
        if not lines:
            return []

        # Sort lines by position
        lines.sort()

        # Group lines
        groups = [[lines[0]]]
        for line in lines[1:]:
            # If the line is close to the last line in the current group
            if abs(line[axis] - groups[-1][-1][axis]) <= threshold:
                groups[-1].append(line)
            else:
                groups.append([line])

        # Take the average position for each group
        result = []
        for group in groups:
            avg_pos = sum(line[axis] for line in group) / len(group)
            # For horizontal lines, take the leftmost and rightmost x
            if axis == 0:  # Horizontal lines
                left_x = min(line[1] for line in group)
                right_x = max(line[2] for line in group)
                result.append((avg_pos, left_x, right_x))
            else:  # Vertical lines
                top_y = min(line[1] for line in group)
                bottom_y = max(line[2] for line in group)
                result.append((avg_pos, top_y, bottom_y))

        return result

    def _detect_tables_by_text(self, img):
        """Detect tables based on text layout."""
        # Use OCR to detect text
        data = pytesseract.image_to_data(
            img, lang=self.lang, config='--psm 6',
            output_type=pytesseract.Output.DICT
        )

        # Filter out empty text
        valid_indices = [i for i in range(len(data['text'])) if data['text'][i].strip()]

        if not valid_indices:
            return []

        # Group text by lines (similar y-coordinates)
        lines = {}
        for i in valid_indices:
            y = data['top'][i]
            if y not in lines:
                lines[y] = []
            lines[y].append({
                'text': data['text'][i],
                'x': data['left'][i],
                'width': data['width'][i],
                'height': data['height'][i]
            })

        # Sort lines by y-coordinate
        sorted_lines = sorted(lines.items())

        # Check if text is arranged in a grid pattern
        if len(sorted_lines) < 3:  # Need at least 3 rows for a table
            return []

        # Check for column alignment
        x_positions = []
        for y, line in sorted_lines:
            for item in line:
                x_positions.append(item['x'])

        # Count occurrences of each x-position (with some tolerance)
        x_counts = {}
        for x in x_positions:
            # Round to nearest 10 pixels for tolerance
            x_rounded = round(x / 10) * 10
            x_counts[x_rounded] = x_counts.get(x_rounded, 0) + 1

        # Find x-positions that occur in multiple rows (potential columns)
        columns = [x for x, count in x_counts.items() if count >= 2]

        if len(columns) < 2:  # Need at least 2 columns for a table
            return []

        # Find table boundaries
        min_x = min(item['x'] for y, line in sorted_lines for item in line)
        max_x = max(item['x'] + item['width'] for y, line in sorted_lines for item in line)
        min_y = min(y for y, line in sorted_lines)
        max_y = max(y + max(item['height'] for item in line) for y, line in sorted_lines)

        # Add margin
        margin = 20
        return [{
            'x1': max(0, min_x - margin),
            'y1': max(0, min_y - margin),
            'x2': max_x + margin,
            'y2': max_y + margin,
            'rows': len(sorted_lines),
            'cols': len(columns),
            'confidence': 0.7  # Medium confidence for text-based detection
        }]

    def _detect_tables_by_contours(self, img):
        """Detect tables using contour detection."""
        # Convert to grayscale
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

        # Apply thresholding
        _, thresh = cv2.threshold(gray, 150, 255, cv2.THRESH_BINARY_INV)

        # Apply morphological operations to enhance table structure
        kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (3, 3))
        morph = cv2.morphologyEx(thresh, cv2.MORPH_CLOSE, kernel)

        # Find contours
        contours, _ = cv2.findContours(morph, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

        # Filter contours by size
        min_area = img.shape[0] * img.shape[1] * 0.05  # At least 5% of image area
        large_contours = [cnt for cnt in contours if cv2.contourArea(cnt) > min_area]

        if not large_contours:
            return []

        # Find rectangular contours (potential tables)
        table_regions = []
        for contour in large_contours:
            # Approximate contour to a polygon
            epsilon = 0.02 * cv2.arcLength(contour, True)
            approx = cv2.approxPolyDP(contour, epsilon, True)

            # If the polygon has 4 vertices, it's likely a rectangle
            if len(approx) == 4:
                x, y, w, h = cv2.boundingRect(contour)

                # Check aspect ratio (tables are usually wider than tall)
                aspect_ratio = w / h
                if 0.5 <= aspect_ratio <= 5:  # Reasonable aspect ratio for a table
                    table_regions.append({
                        'x1': x,
                        'y1': y,
                        'x2': x + w,
                        'y2': y + h,
                        'rows': 0,  # Unknown at this point
                        'cols': 0,  # Unknown at this point
                        'confidence': 0.5  # Lower confidence for contour-based detection
                    })

        return table_regions

    def extract_table_data(self, img, region):
        """
        Extract table data from a detected table region.

        Args:
            img: Image as numpy array or path to image file
            region: Table region dictionary with x1, y1, x2, y2 coordinates

        Returns:
            Dictionary with table data
        """
        # Load image if it's a path
        if isinstance(img, str):
            full_img = cv2.imread(img)
        else:
            full_img = img.copy()

        # Crop the table region
        x1, y1, x2, y2 = region['x1'], region['y1'], region['x2'], region['y2']

        # Ensure coordinates are within image bounds and are integers
        height, width = full_img.shape[:2]
        x1 = max(0, min(int(x1), width - 1))
        y1 = max(0, min(int(y1), height - 1))
        x2 = max(0, min(int(x2), width))
        y2 = max(0, min(int(y2), height))

        # Check if the region is valid
        if x1 >= x2 or y1 >= y2:
            return {
                'type': 'unknown',
                'data': pd.DataFrame()
            }

        table_img = full_img[y1:y2, x1:x2]

        # Try different methods to extract table data
        methods = [
            self._extract_with_grid_detection,
            self._extract_with_ocr,
            self._extract_with_structure_analysis
        ]

        for method in methods:
            try:
                result = method(table_img)
                if not result['data'].empty:
                    return result
            except Exception as e:
                print(f"Method {method.__name__} failed: {e}")
                continue

        # If all methods fail, return empty result
        return {
            'type': 'unknown',
            'data': pd.DataFrame()
        }

    def _extract_with_grid_detection(self, table_img):
        """Extract table data by detecting grid lines."""
        # Convert to grayscale
        gray = cv2.cvtColor(table_img, cv2.COLOR_BGR2GRAY)

        # Apply thresholding
        _, thresh = cv2.threshold(gray, 150, 255, cv2.THRESH_BINARY_INV)

        # Detect horizontal and vertical lines
        horizontal_kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (25, 1))
        vertical_kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (1, 25))

        horizontal_lines = cv2.morphologyEx(thresh, cv2.MORPH_OPEN, horizontal_kernel)
        vertical_lines = cv2.morphologyEx(thresh, cv2.MORPH_OPEN, vertical_kernel)

        # Combine lines
        grid = cv2.add(horizontal_lines, vertical_lines)

        # Find contours (cells)
        contours, _ = cv2.findContours(grid, cv2.RETR_TREE, cv2.CHAIN_APPROX_SIMPLE)

        # Filter and sort cells
        cells = []
        for contour in contours:
            x, y, w, h = cv2.boundingRect(contour)
            if w > 20 and h > 20:  # Filter out cells that are too small
                cells.append({
                    'x': x, 'y': y, 'w': w, 'h': h
                })

        if len(cells) < 4:  # Need at least 2x2 cells for a table
            return {
                'type': 'unknown',
                'data': pd.DataFrame()
            }

        # Group cells into rows
        cells.sort(key=lambda c: c['y'])
        rows = []
        current_row = [cells[0]]

        for cell in cells[1:]:
            # If the cell is in the same row (with tolerance)
            if abs(cell['y'] - current_row[0]['y']) < 15:
                current_row.append(cell)
            else:
                # Sort cells in the row by X (left to right)
                current_row.sort(key=lambda c: c['x'])
                rows.append(current_row)
                current_row = [cell]

        # Add the last row
        if current_row:
            current_row.sort(key=lambda c: c['x'])
            rows.append(current_row)

        # Extract text from each cell
        table_data = []
        for row in rows:
            row_data = []
            for cell in row:
                # Crop the cell from the image
                cell_img = gray[cell['y']:cell['y']+cell['h'], cell['x']:cell['x']+cell['w']]

                # Extract text from the cell
                text = pytesseract.image_to_string(cell_img, lang=self.lang, config='--psm 6')

                # Clean the text
                clean_text = text.strip().replace('\n', ' ')
                row_data.append(clean_text)

            table_data.append(row_data)

        # Create DataFrame
        if table_data and len(table_data) > 1:
            # First row is header
            header = table_data[0]
            data = table_data[1:]

            # Ensure all rows have the same number of columns
            max_cols = max(len(row) for row in table_data)
            standardized_data = []

            for row in data:
                if len(row) < max_cols:
                    row = row + [''] * (max_cols - len(row))
                standardized_data.append(row[:max_cols])

            # If there are fewer headers than columns
            if len(header) < max_cols:
                header = header + [f'Column{i+1}' for i in range(len(header), max_cols)]

            df = pd.DataFrame(standardized_data, columns=header[:max_cols])

            # Detect table type
            table_type = self._detect_table_type(' '.join(header))

            return {
                'type': table_type,
                'data': df
            }

        return {
            'type': 'unknown',
            'data': pd.DataFrame(table_data)
        }

    def _extract_with_ocr(self, table_img):
        """Extract table data using OCR directly."""
        # Use OCR with table settings
        custom_config = f'--psm 6 -l {self.lang}'
        data = pytesseract.image_to_data(
            table_img, config=custom_config,
            output_type=pytesseract.Output.DICT
        )

        # Filter out empty text
        valid_indices = [i for i in range(len(data['text'])) if data['text'][i].strip()]

        if not valid_indices:
            return {
                'type': 'unknown',
                'data': pd.DataFrame()
            }

        # Group text by lines (similar y-coordinates)
        lines = {}
        for i in valid_indices:
            # Round y-coordinate to nearest 10 pixels for grouping
            y_key = round(data['top'][i] / 10) * 10
            if y_key not in lines:
                lines[y_key] = []
            lines[y_key].append({
                'text': data['text'][i],
                'x': data['left'][i]
            })

        # Sort lines by y-coordinate
        sorted_lines = sorted(lines.items())

        # Extract text from each line
        table_data = []
        for y, line in sorted_lines:
            # Sort text items by x-coordinate
            sorted_line = sorted(line, key=lambda item: item['x'])
            row_data = [item['text'] for item in sorted_line]
            table_data.append(row_data)

        # Create DataFrame
        if table_data and len(table_data) > 1:
            # First row is header
            header = table_data[0]
            data = table_data[1:]

            # Ensure all rows have the same number of columns
            max_cols = max(len(row) for row in table_data)
            standardized_data = []

            for row in data:
                if len(row) < max_cols:
                    row = row + [''] * (max_cols - len(row))
                standardized_data.append(row[:max_cols])

            # If there are fewer headers than columns
            if len(header) < max_cols:
                header = header + [f'Column{i+1}' for i in range(len(header), max_cols)]

            df = pd.DataFrame(standardized_data, columns=header[:max_cols])

            # Detect table type
            table_type = self._detect_table_type(' '.join(header))

            return {
                'type': table_type,
                'data': df
            }

        return {
            'type': 'unknown',
            'data': pd.DataFrame(table_data)
        }

    def _extract_with_structure_analysis(self, table_img):
        """Extract table data by analyzing the structure of the image."""
        # Convert to grayscale
        gray = cv2.cvtColor(table_img, cv2.COLOR_BGR2GRAY)

        # Apply adaptive thresholding
        binary = cv2.adaptiveThreshold(
            gray, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
            cv2.THRESH_BINARY_INV, 11, 2
        )

        # Extract all text from the image
        text = pytesseract.image_to_string(table_img, lang=self.lang, config='--psm 6')

        # Split text into lines
        lines = [line.strip() for line in text.split('\n') if line.strip()]

        if not lines:
            return {
                'type': 'unknown',
                'data': pd.DataFrame()
            }

        # Try to detect table structure from text
        # Look for consistent delimiters (spaces, tabs, |, etc.)
        delimiters = ['\t', '|', '  ']
        table_data = []

        for delimiter in delimiters:
            # Try splitting each line by the delimiter
            split_lines = [line.split(delimiter) for line in lines]

            # Check if all lines have the same number of columns
            col_counts = [len(line) for line in split_lines]
            if len(set(col_counts)) == 1 and col_counts[0] > 1:
                # All lines have the same number of columns
                table_data = split_lines
                break

        # If no consistent delimiter was found, try another approach
        if not table_data:
            # Use OCR with table settings
            data = pytesseract.image_to_data(
                table_img, lang=self.lang, config='--psm 6',
                output_type=pytesseract.Output.DICT
            )

            # Group text by lines
            lines = {}
            for i in range(len(data['text'])):
                if data['text'][i].strip():
                    # Round y-coordinate to nearest 10 pixels for grouping
                    y_key = round(data['top'][i] / 10) * 10
                    if y_key not in lines:
                        lines[y_key] = []
                    lines[y_key].append({
                        'text': data['text'][i],
                        'x': data['left'][i]
                    })

            # Sort lines by y-coordinate
            sorted_lines = sorted(lines.items())

            # Extract text from each line
            table_data = []
            for y, line in sorted_lines:
                # Sort text items by x-coordinate
                sorted_line = sorted(line, key=lambda item: item['x'])
                row_data = [item['text'] for item in sorted_line]
                table_data.append(row_data)

        # Create DataFrame
        if table_data and len(table_data) > 1:
            # First row is header
            header = table_data[0]
            data = table_data[1:]

            # Ensure all rows have the same number of columns
            max_cols = max(len(row) for row in table_data)
            standardized_data = []

            for row in data:
                if len(row) < max_cols:
                    row = row + [''] * (max_cols - len(row))
                standardized_data.append(row[:max_cols])

            # If there are fewer headers than columns
            if len(header) < max_cols:
                header = header + [f'Column{i+1}' for i in range(len(header), max_cols)]

            df = pd.DataFrame(standardized_data, columns=header[:max_cols])

            # Detect table type
            table_type = self._detect_table_type(' '.join(header))

            return {
                'type': table_type,
                'data': df
            }

        return {
            'type': 'unknown',
            'data': pd.DataFrame(table_data)
        }

    def _detect_table_type(self, header_text):
        """Detect table type based on header text."""
        header_text = header_text.lower()

        # Count matches for each table type
        matches = {}
        for table_type, keywords in self.table_headers.items():
            matches[table_type] = sum(1 for keyword in keywords
                                    if keyword.lower() in header_text)

        # Choose the type with the highest number of matches
        if any(matches.values()):
            return max(matches.items(), key=lambda x: x[1])[0]

        return "unknown"

    def save_results(self, tables, output_dir):
        """
        Save table detection results to files.

        Args:
            tables: List of detected tables
            output_dir: Output directory

        Returns:
            Dictionary with paths to saved files
        """
        # Create output directory if it doesn't exist
        os.makedirs(output_dir, exist_ok=True)

        # Save results to JSON file
        results_file = os.path.join(output_dir, "table_detection_results.json")

        # Convert DataFrames to lists for JSON serialization
        serializable_tables = []
        for table in tables:
            serializable_table = table.copy()
            if 'data' in serializable_table and isinstance(serializable_table['data'], pd.DataFrame):
                serializable_table['data'] = serializable_table['data'].to_dict(orient='records')
            serializable_tables.append(serializable_table)

        with open(results_file, 'w', encoding='utf-8') as f:
            json.dump({
                'status': 'success',
                'tables': serializable_tables,
                'count': len(serializable_tables)
            }, f, indent=2)

        return {
            'results_file': results_file
        }
