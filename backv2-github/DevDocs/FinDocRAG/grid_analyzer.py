"""
Grid Analyzer for financial documents.

This module provides functions to analyze grid structures in financial documents,
particularly focusing on tables and their relationships.
"""

import os
import logging
import json
import re
import numpy as np
import pandas as pd
from typing import List, Dict, Any, Optional, Tuple
import cv2
import fitz  # PyMuPDF
import camelot
from PIL import Image
import tempfile

# Import ISIN validator
from isin_validator import is_valid_isin

# Import enhanced column detector
from enhanced_column_detector import detect_column_type, detect_column_types

# Try to import PaddleOCR
try:
    from paddleocr import PaddleOCR
    PADDLE_OCR_AVAILABLE = True
except ImportError:
    PADDLE_OCR_AVAILABLE = False
    logging.warning("PaddleOCR not available. Text extraction will be limited.")

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class GridAnalyzer:
    """
    Analyzer for grid structures in financial documents.
    """

    def __init__(self, debug: bool = False, use_ocr: bool = True):
        """
        Initialize the grid analyzer.

        Args:
            debug: Whether to print debug information
            use_ocr: Whether to use OCR for text extraction
        """
        self.debug = debug
        self.use_ocr = use_ocr and PADDLE_OCR_AVAILABLE

        # Initialize OCR if available
        if self.use_ocr:
            try:
                self.ocr = PaddleOCR(use_angle_cls=True, lang='en', use_gpu=False)
                logger.info("PaddleOCR initialized successfully")
            except Exception as e:
                logger.error(f"Error initializing PaddleOCR: {str(e)}")
                self.use_ocr = False

    def analyze_pdf(self, pdf_path: str) -> Dict[str, Any]:
        """
        Analyze grid structures in a PDF.

        Args:
            pdf_path: Path to the PDF file

        Returns:
            Dictionary containing grid analysis results
        """
        if self.debug:
            logger.info(f"Analyzing grid structures in {pdf_path}")

        # Extract tables using multiple methods
        tables = self._extract_tables(pdf_path)

        # Analyze table structures
        table_structures = self._analyze_table_structures(tables)

        # Identify relationships between tables
        table_relationships = self._identify_table_relationships(tables)

        return {
            "tables": tables,
            "table_structures": table_structures,
            "table_relationships": table_relationships
        }

    def _extract_tables(self, pdf_path: str) -> List[Dict[str, Any]]:
        """
        Extract tables from a PDF using multiple methods.

        Args:
            pdf_path: Path to the PDF file

        Returns:
            List of extracted tables
        """
        tables = []

        # Extract tables using Camelot (lattice method)
        try:
            lattice_tables = camelot.read_pdf(
                pdf_path,
                pages='all',
                flavor='lattice',
                suppress_stdout=True
            )

            if self.debug:
                logger.info(f"Found {len(lattice_tables)} tables with Camelot (lattice)")

            for i, table in enumerate(lattice_tables):
                tables.append({
                    "id": f"lattice_{i+1}",
                    "page": table.page,
                    "method": "camelot_lattice",
                    "accuracy": table.accuracy,
                    "data": table.df.to_dict(orient="records"),
                    "headers": table.df.columns.tolist(),
                    "rows": table.df.values.tolist(),
                    "dataframe": table.df
                })
        except Exception as e:
            if self.debug:
                logger.error(f"Error extracting tables with Camelot (lattice): {str(e)}")

        # Extract tables using Camelot (stream method)
        try:
            stream_tables = camelot.read_pdf(
                pdf_path,
                pages='all',
                flavor='stream',
                suppress_stdout=True,
                edge_tol=50,
                row_tol=10
            )

            if self.debug:
                logger.info(f"Found {len(stream_tables)} tables with Camelot (stream)")

            for i, table in enumerate(stream_tables):
                tables.append({
                    "id": f"stream_{i+1}",
                    "page": table.page,
                    "method": "camelot_stream",
                    "accuracy": table.accuracy,
                    "data": table.df.to_dict(orient="records"),
                    "headers": table.df.columns.tolist(),
                    "rows": table.df.values.tolist(),
                    "dataframe": table.df
                })
        except Exception as e:
            if self.debug:
                logger.error(f"Error extracting tables with Camelot (stream): {str(e)}")

        # Extract tables using Tabula
        try:
            import tabula

            tabula_tables = tabula.read_pdf(
                pdf_path,
                pages='all',
                multiple_tables=True
            )

            if self.debug:
                logger.info(f"Found {len(tabula_tables)} tables with Tabula")

            for i, df in enumerate(tabula_tables):
                if not df.empty:
                    tables.append({
                        "id": f"tabula_{i+1}",
                        "page": i + 1,  # Approximate page number
                        "method": "tabula",
                        "accuracy": 0.75,  # Arbitrary accuracy for Tabula
                        "data": df.to_dict(orient="records"),
                        "headers": df.columns.tolist(),
                        "rows": df.values.tolist(),
                        "dataframe": df
                    })
        except Exception as e:
            if self.debug:
                logger.error(f"Error extracting tables with Tabula: {str(e)}")

        # Extract tables using visual grid detection
        try:
            visual_tables = self._extract_tables_visual(pdf_path)

            if self.debug:
                logger.info(f"Found {len(visual_tables)} tables with visual grid detection")

            tables.extend(visual_tables)
        except Exception as e:
            if self.debug:
                logger.error(f"Error extracting tables with visual grid detection: {str(e)}")

        return tables

    def _extract_tables_visual(self, pdf_path: str) -> List[Dict[str, Any]]:
        """
        Extract tables using visual grid detection.

        Args:
            pdf_path: Path to the PDF file

        Returns:
            List of extracted tables
        """
        tables = []

        # Open the PDF
        doc = fitz.open(pdf_path)

        # Process each page
        for page_num, page in enumerate(doc):
            # Convert page to image
            pix = page.get_pixmap(matrix=fitz.Matrix(300/72, 300/72))

            # Save image to temporary file
            with tempfile.NamedTemporaryFile(suffix='.png', delete=False) as tmp_file:
                pix.save(tmp_file.name)
                img_path = tmp_file.name

            try:
                # Load image with OpenCV
                img = cv2.imread(img_path)
                gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

                # Apply adaptive thresholding for better line detection
                thresh = cv2.adaptiveThreshold(gray, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY_INV, 11, 2)

                # Noise removal
                kernel = np.ones((2, 2), np.uint8)
                thresh = cv2.morphologyEx(thresh, cv2.MORPH_CLOSE, kernel)

                # Detect horizontal lines - adjust kernel size based on image size
                horizontal_kernel_size = max(20, int(img.shape[1] / 20))
                horizontal_kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (horizontal_kernel_size, 1))
                horizontal_lines = cv2.morphologyEx(thresh, cv2.MORPH_OPEN, horizontal_kernel)

                # Detect vertical lines - adjust kernel size based on image size
                vertical_kernel_size = max(20, int(img.shape[0] / 20))
                vertical_kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (1, vertical_kernel_size))
                vertical_lines = cv2.morphologyEx(thresh, cv2.MORPH_OPEN, vertical_kernel)

                # Combine lines
                grid = cv2.add(horizontal_lines, vertical_lines)

                # Dilate to connect nearby lines
                kernel = np.ones((3, 3), np.uint8)
                grid = cv2.dilate(grid, kernel, iterations=1)

                # Find contours
                contours, _ = cv2.findContours(grid, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

                # Filter contours by size
                min_area = 5000  # Minimum area for a table
                table_contours = [cnt for cnt in contours if cv2.contourArea(cnt) > min_area]

                # Process each table contour
                for i, contour in enumerate(table_contours):
                    # Get bounding box
                    x, y, w, h = cv2.boundingRect(contour)

                    # Extract table region
                    table_img = gray[y:y+h, x:x+w]

                    # Save table image to temporary file
                    with tempfile.NamedTemporaryFile(suffix='.png', delete=False) as tmp_table_file:
                        cv2.imwrite(tmp_table_file.name, table_img)
                        table_img_path = tmp_table_file.name

                    # Analyze table structure
                    table_structure = self._analyze_table_structure(table_img)

                    # Extract text from cells using OCR
                    cell_texts = self._extract_cell_texts(table_img, table_structure)

                    # Convert to DataFrame if possible
                    df = self._create_dataframe_from_cells(cell_texts)

                    # Add table to results
                    table_data = {
                        "id": f"visual_{page_num+1}_{i+1}",
                        "page": page_num + 1,
                        "method": "visual_grid",
                        "accuracy": 0.8,  # Improved accuracy with OCR
                        "bbox": {"x": x, "y": y, "width": w, "height": h},
                        "image_path": table_img_path,
                        "structure": table_structure,
                        "cell_texts": cell_texts
                    }

                    # Add DataFrame if available
                    if df is not None:
                        table_data["dataframe"] = df
                        table_data["data"] = df.to_dict(orient="records")
                        table_data["headers"] = df.columns.tolist()
                        table_data["rows"] = df.values.tolist()

                    tables.append(table_data)

                    # Clean up temporary file
                    os.unlink(table_img_path)
            except Exception as e:
                if self.debug:
                    logger.error(f"Error processing page {page_num+1} for visual grid detection: {str(e)}")

            # Clean up temporary file
            os.unlink(img_path)

        # Close the PDF
        doc.close()

        return tables

    def _analyze_table_structure(self, table_image: np.ndarray) -> Dict[str, Any]:
        """
        Analyze the structure of a table image.

        Args:
            table_image: Image of the table

        Returns:
            Dictionary containing table structure information
        """
        # Apply adaptive thresholding for better line detection
        thresh = cv2.adaptiveThreshold(table_image, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY_INV, 11, 2)

        # Noise removal
        kernel = np.ones((2, 2), np.uint8)
        thresh = cv2.morphologyEx(thresh, cv2.MORPH_CLOSE, kernel)

        # Find horizontal lines - adjust kernel size based on image size
        horizontal_kernel_size = max(20, int(table_image.shape[1] / 20))
        horizontal_kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (horizontal_kernel_size, 1))
        horizontal_lines = cv2.morphologyEx(thresh, cv2.MORPH_OPEN, horizontal_kernel)

        # Find vertical lines - adjust kernel size based on image size
        vertical_kernel_size = max(20, int(table_image.shape[0] / 20))
        vertical_kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (1, vertical_kernel_size))
        vertical_lines = cv2.morphologyEx(thresh, cv2.MORPH_OPEN, vertical_kernel)

        # Get row and column positions
        row_positions = self._get_row_positions(horizontal_lines)
        col_positions = self._get_column_positions(vertical_lines)

        # If no rows or columns detected, try alternative method
        if not row_positions or not col_positions:
            row_positions, col_positions = self._detect_table_structure_alternative(table_image)

        # Create cells
        cells = []
        for i in range(len(row_positions) - 1):
            for j in range(len(col_positions) - 1):
                cell = {
                    "row": i,
                    "column": j,
                    "x": col_positions[j],
                    "y": row_positions[i],
                    "width": col_positions[j+1] - col_positions[j],
                    "height": row_positions[i+1] - row_positions[i]
                }
                cells.append(cell)

        return {
            "rows": row_positions,
            "columns": col_positions,
            "cells": cells
        }

    def _get_row_positions(self, horizontal_lines: np.ndarray) -> List[int]:
        """
        Get row positions from horizontal lines.

        Args:
            horizontal_lines: Binary image with horizontal lines

        Returns:
            List of row positions
        """
        # Get image height
        height = horizontal_lines.shape[0]

        # Project horizontal lines onto y-axis
        y_projection = np.sum(horizontal_lines, axis=1)

        # Find row positions
        row_positions = [0]  # Start with top edge

        for i in range(height):
            if y_projection[i] > 0:
                row_positions.append(i)

        row_positions.append(height)  # End with bottom edge

        # Filter out closely spaced positions (likely duplicates)
        row_positions = self._filter_positions(row_positions, min_distance=10)

        return row_positions

    def _get_column_positions(self, vertical_lines: np.ndarray) -> List[int]:
        """
        Get column positions from vertical lines.

        Args:
            vertical_lines: Binary image with vertical lines

        Returns:
            List of column positions
        """
        # Get image width
        width = vertical_lines.shape[1]

        # Project vertical lines onto x-axis
        x_projection = np.sum(vertical_lines, axis=0)

        # Find column positions
        col_positions = [0]  # Start with left edge

        for i in range(width):
            if x_projection[i] > 0:
                col_positions.append(i)

        col_positions.append(width)  # End with right edge

        # Filter out closely spaced positions (likely duplicates)
        col_positions = self._filter_positions(col_positions, min_distance=20)

        return col_positions

    def _detect_table_structure_alternative(self, gray_image: np.ndarray) -> Tuple[List[int], List[int]]:
        """
        Alternative method to detect table structure using pixel intensity analysis.

        Args:
            gray_image: Grayscale image of the table

        Returns:
            Tuple of (row_positions, column_positions)
        """
        # Get image dimensions
        height, width = gray_image.shape

        # Calculate horizontal and vertical projections
        h_projection = np.sum(gray_image, axis=1)
        v_projection = np.sum(gray_image, axis=0)

        # Normalize projections
        h_projection = h_projection / width
        v_projection = v_projection / height

        # Find row positions using horizontal projection
        row_positions = [0]  # Start with top edge
        for i in range(1, height - 1):
            # Check for significant changes in horizontal projection
            if (h_projection[i] < h_projection[i-1] * 0.7 and h_projection[i] < h_projection[i+1] * 0.7) or \
               (h_projection[i] > h_projection[i-1] * 1.3 and h_projection[i] > h_projection[i+1] * 1.3):
                row_positions.append(i)
        row_positions.append(height)  # End with bottom edge

        # Find column positions using vertical projection
        col_positions = [0]  # Start with left edge
        for i in range(1, width - 1):
            # Check for significant changes in vertical projection
            if (v_projection[i] < v_projection[i-1] * 0.7 and v_projection[i] < v_projection[i+1] * 0.7) or \
               (v_projection[i] > v_projection[i-1] * 1.3 and v_projection[i] > v_projection[i+1] * 1.3):
                col_positions.append(i)
        col_positions.append(width)  # End with right edge

        # Filter out closely spaced positions (likely duplicates)
        row_positions = self._filter_positions(row_positions, min_distance=10)
        col_positions = self._filter_positions(col_positions, min_distance=20)

        return row_positions, col_positions

    def _filter_positions(self, positions: List[int], min_distance: int) -> List[int]:
        """
        Filter out closely spaced positions.

        Args:
            positions: List of positions
            min_distance: Minimum distance between positions

        Returns:
            Filtered list of positions
        """
        if not positions:
            return positions

        filtered = [positions[0]]  # Start with first position

        for pos in positions[1:]:
            if pos - filtered[-1] >= min_distance:
                filtered.append(pos)

        return filtered

    def _extract_cell_texts(self, table_image: np.ndarray, table_structure: Dict[str, Any]) -> Dict[Tuple[int, int], str]:
        """
        Extract text from table cells using OCR.

        Args:
            table_image: Image of the table
            table_structure: Dictionary containing table structure information

        Returns:
            Dictionary mapping (row, column) to cell text
        """
        cell_texts = {}

        # Get cells from table structure
        cells = table_structure.get("cells", [])

        # Process each cell
        for cell in cells:
            row = cell.get("row", 0)
            col = cell.get("column", 0)
            x = cell.get("x", 0)
            y = cell.get("y", 0)
            width = cell.get("width", 0)
            height = cell.get("height", 0)

            # Skip cells that are too small
            if width < 10 or height < 10:
                continue

            # Extract cell image
            cell_img = table_image[y:y+height, x:x+width]

            # Extract text using OCR
            if self.use_ocr:
                try:
                    # Save cell image to temporary file
                    with tempfile.NamedTemporaryFile(suffix='.png', delete=False) as tmp_cell_file:
                        cv2.imwrite(tmp_cell_file.name, cell_img)
                        cell_img_path = tmp_cell_file.name

                    # Run OCR
                    result = self.ocr.ocr(cell_img_path, cls=True)

                    # Extract text
                    text = ""
                    if result and len(result) > 0 and result[0]:
                        for line in result[0]:
                            if len(line) >= 2 and line[1] and len(line[1]) >= 2:
                                text += line[1][0] + " "

                    # Clean up text
                    text = text.strip()

                    # Add to cell texts
                    cell_texts[(row, col)] = text

                    # Clean up temporary file
                    os.unlink(cell_img_path)
                except Exception as e:
                    if self.debug:
                        logger.error(f"Error extracting text from cell ({row}, {col}): {str(e)}")
            else:
                # Use simple thresholding for text extraction
                try:
                    # Apply threshold
                    _, thresh = cv2.threshold(cell_img, 150, 255, cv2.THRESH_BINARY_INV)

                    # Count white pixels (text)
                    white_pixels = cv2.countNonZero(thresh)

                    # If there are white pixels, mark as containing text
                    if white_pixels > 0:
                        cell_texts[(row, col)] = "[TEXT]"  # Placeholder for text
                except Exception as e:
                    if self.debug:
                        logger.error(f"Error processing cell ({row}, {col}): {str(e)}")

        return cell_texts

    def _create_dataframe_from_cells(self, cell_texts: Dict[Tuple[int, int], str]) -> Optional[pd.DataFrame]:
        """
        Create a DataFrame from cell texts.

        Args:
            cell_texts: Dictionary mapping (row, column) to cell text

        Returns:
            DataFrame or None if not enough data
        """
        if not cell_texts:
            return None

        # Get max row and column indices
        max_row = max([row for row, _ in cell_texts.keys()]) if cell_texts else 0
        max_col = max([col for _, col in cell_texts.keys()]) if cell_texts else 0

        # Create empty DataFrame
        df = pd.DataFrame(index=range(max_row + 1), columns=range(max_col + 1))

        # Fill DataFrame with cell texts
        for (row, col), text in cell_texts.items():
            df.iloc[row, col] = text

        # Check if first row contains headers
        if 0 in df.index:
            # Check if first row has non-empty values
            first_row = df.iloc[0]
            if not first_row.isna().all():
                # Use first row as column names
                df.columns = [str(col) if pd.isna(col) else str(col) for col in df.iloc[0]]
                df = df.iloc[1:].reset_index(drop=True)

        # Clean up DataFrame
        df = df.replace('', np.nan).dropna(how='all').dropna(axis=1, how='all')

        # If DataFrame is empty, return None
        if df.empty:
            return None

        return df

    def _analyze_table_structures(self, tables: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Analyze table structures.

        Args:
            tables: List of extracted tables

        Returns:
            Dictionary containing table structure analysis
        """
        structures = {}

        for table in tables:
            table_id = table["id"]

            # Skip tables without dataframes
            if "dataframe" not in table:
                continue

            df = table["dataframe"]

            # Analyze column types using enhanced detector
            column_types = detect_column_types(df)

            # Analyze row patterns
            row_patterns = self._detect_row_patterns(df)

            # Identify header rows
            header_rows = self._identify_header_rows(df)

            # Identify footer rows
            footer_rows = self._identify_footer_rows(df)

            # Store structure analysis
            structures[table_id] = {
                "column_types": column_types,
                "row_patterns": row_patterns,
                "header_rows": header_rows,
                "footer_rows": footer_rows
            }

        return structures

    def _detect_column_type(self, column: pd.Series) -> str:
        """
        Detect the type of a column.

        Args:
            column: Column to analyze

        Returns:
            Column type as a string
        """
        # Remove NaN values
        values = column.dropna()

        if len(values) == 0:
            return "empty"

        # Check if all values are numeric
        try:
            pd.to_numeric(values)
            return "numeric"
        except:
            pass

        # Check if all values are dates
        try:
            pd.to_datetime(values)
            return "date"
        except:
            pass

        # Check if values match ISIN pattern
        isin_pattern = r'^[A-Z]{2}[A-Z0-9]{9}[0-9]$'
        if all(re.match(isin_pattern, str(val)) for val in values):
            return "isin"

        # Check if values match currency pattern
        currency_pattern = r'^[$€£¥]?\s*\d+[,\'.]\d+\s*[$€£¥]?$'
        if all(re.match(currency_pattern, str(val)) for val in values):
            return "currency"

        # Default to text
        return "text"

    def _detect_row_patterns(self, df: pd.DataFrame) -> Dict[str, Any]:
        """
        Detect patterns in rows.

        Args:
            df: DataFrame to analyze

        Returns:
            Dictionary containing row pattern analysis
        """
        patterns = {
            "empty_rows": [],
            "header_candidates": [],
            "footer_candidates": [],
            "data_rows": []
        }

        # Analyze each row
        for i, row in df.iterrows():
            # Check if row is empty
            if row.isna().all() or (row.astype(str) == '').all():
                patterns["empty_rows"].append(i)
                continue

            # Check if row might be a header
            if self._is_header_row(row, i, df):
                patterns["header_candidates"].append(i)
                continue

            # Check if row might be a footer
            if self._is_footer_row(row, i, df):
                patterns["footer_candidates"].append(i)
                continue

            # Default to data row
            patterns["data_rows"].append(i)

        return patterns

    def _is_header_row(self, row: pd.Series, row_idx: int, df: pd.DataFrame) -> bool:
        """
        Check if a row might be a header.

        Args:
            row: Row to check
            row_idx: Row index
            df: DataFrame containing the row

        Returns:
            True if the row might be a header, False otherwise
        """
        # Header rows are typically at the beginning
        if row_idx > 5:
            return False

        # Header rows often have different formatting
        # For now, just check if the row is different from the rows below
        if row_idx < len(df) - 1:
            next_row = df.iloc[row_idx + 1]

            # Check if the row has different types than the next row
            row_types = [type(val) for val in row]
            next_row_types = [type(val) for val in next_row]

            if row_types != next_row_types:
                return True

        # Header rows often contain common header terms
        header_terms = ['isin', 'description', 'nominal', 'price', 'value', 'currency', 'maturity', 'coupon']
        row_text = ' '.join(row.astype(str)).lower()

        if any(term in row_text for term in header_terms):
            return True

        return False

    def _is_footer_row(self, row: pd.Series, row_idx: int, df: pd.DataFrame) -> bool:
        """
        Check if a row might be a footer.

        Args:
            row: Row to check
            row_idx: Row index
            df: DataFrame containing the row

        Returns:
            True if the row might be a footer, False otherwise
        """
        # Footer rows are typically at the end
        if row_idx < len(df) - 5:
            return False

        # Footer rows often contain summary terms
        footer_terms = ['total', 'sum', 'average', 'mean', 'subtotal']
        row_text = ' '.join(row.astype(str)).lower()

        if any(term in row_text for term in footer_terms):
            return True

        return False

    def _identify_header_rows(self, df: pd.DataFrame) -> List[int]:
        """
        Identify header rows in a DataFrame.

        Args:
            df: DataFrame to analyze

        Returns:
            List of header row indices
        """
        header_rows = []

        # Check first few rows
        for i in range(min(5, len(df))):
            if self._is_header_row(df.iloc[i], i, df):
                header_rows.append(i)

        return header_rows

    def _identify_footer_rows(self, df: pd.DataFrame) -> List[int]:
        """
        Identify footer rows in a DataFrame.

        Args:
            df: DataFrame to analyze

        Returns:
            List of footer row indices
        """
        footer_rows = []

        # Check last few rows
        for i in range(max(0, len(df) - 5), len(df)):
            if self._is_footer_row(df.iloc[i], i, df):
                footer_rows.append(i)

        return footer_rows

    def _identify_table_relationships(self, tables: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Identify relationships between tables.

        Args:
            tables: List of extracted tables

        Returns:
            Dictionary containing table relationship analysis
        """
        relationships = {}

        # Group tables by page
        tables_by_page = {}
        for table in tables:
            page = table.get("page", 0)
            if page not in tables_by_page:
                tables_by_page[page] = []
            tables_by_page[page].append(table)

        # Analyze relationships between tables on the same page
        for page, page_tables in tables_by_page.items():
            if len(page_tables) <= 1:
                continue

            # Sort tables by vertical position (if available)
            sorted_tables = sorted(page_tables, key=lambda t: t.get("bbox", {}).get("y", 0) if "bbox" in t else 0)

            # Identify vertical relationships
            for i in range(len(sorted_tables) - 1):
                table1 = sorted_tables[i]
                table2 = sorted_tables[i + 1]

                relationships[f"{table1['id']}_above_{table2['id']}"] = {
                    "type": "vertical",
                    "table1": table1["id"],
                    "table2": table2["id"],
                    "relationship": "above"
                }

            # Identify content relationships
            for i, table1 in enumerate(page_tables):
                for j, table2 in enumerate(page_tables):
                    if i == j:
                        continue

                    # Skip tables without dataframes
                    if "dataframe" not in table1 or "dataframe" not in table2:
                        continue

                    df1 = table1["dataframe"]
                    df2 = table2["dataframe"]

                    # Check for common columns
                    common_columns = set(df1.columns).intersection(set(df2.columns))

                    if common_columns:
                        relationships[f"{table1['id']}_shares_columns_with_{table2['id']}"] = {
                            "type": "content",
                            "table1": table1["id"],
                            "table2": table2["id"],
                            "relationship": "shares_columns",
                            "common_columns": list(common_columns)
                        }

                    # Check for summary relationship
                    if self._is_summary_relationship(df1, df2):
                        relationships[f"{table1['id']}_summarizes_{table2['id']}"] = {
                            "type": "content",
                            "table1": table1["id"],
                            "table2": table2["id"],
                            "relationship": "summarizes"
                        }

        return relationships

    def _is_summary_relationship(self, df1: pd.DataFrame, df2: pd.DataFrame) -> bool:
        """
        Check if one DataFrame summarizes another.

        Args:
            df1: First DataFrame
            df2: Second DataFrame

        Returns:
            True if df1 summarizes df2, False otherwise
        """
        # Summary tables are typically smaller
        if len(df1) >= len(df2):
            return False

        # Check for common numeric columns
        numeric_columns1 = df1.select_dtypes(include=['number']).columns
        numeric_columns2 = df2.select_dtypes(include=['number']).columns

        common_numeric_columns = set(numeric_columns1).intersection(set(numeric_columns2))

        if not common_numeric_columns:
            return False

        # Check if sums match
        for col in common_numeric_columns:
            sum1 = df1[col].sum()
            sum2 = df2[col].sum()

            # Allow for some rounding error
            if abs(sum1 - sum2) / max(abs(sum1), abs(sum2)) < 0.01:
                return True

        return False

    def extract_securities(self, pdf_path: str) -> List[Dict[str, Any]]:
        """
        Extract securities from a PDF using grid analysis.

        Args:
            pdf_path: Path to the PDF file

        Returns:
            List of extracted securities
        """
        if self.debug:
            logger.info(f"Extracting securities from {pdf_path} using grid analysis")

        # Analyze grid structures
        grid_analysis = self.analyze_pdf(pdf_path)

        # Extract securities from tables
        securities = []

        # Extract portfolio summary from page 3 (usually contains asset allocation)
        portfolio_summary = self._extract_portfolio_summary(grid_analysis)

        for table in grid_analysis["tables"]:
            # Skip tables without dataframes
            if "dataframe" not in table:
                continue

            df = table["dataframe"]

            # Skip empty dataframes
            if df.empty:
                continue

            # Get table structure
            table_structure = grid_analysis["table_structures"].get(table["id"], {})

            # Identify columns
            isin_column = None
            description_column = None
            nominal_column = None
            price_column = None
            value_column = None
            currency_column = None
            maturity_column = None
            coupon_column = None
            acquisition_price_column = None
            weight_column = None

            # Check column types
            column_types = table_structure.get("column_types", {})

            for col, col_type in column_types.items():
                if col_type == "isin":
                    isin_column = col
                elif col_type == "text" and not description_column:
                    description_column = col
                elif col_type == "numeric" and not nominal_column:
                    nominal_column = col
                elif col_type == "numeric" and nominal_column and not price_column:
                    price_column = col
                elif col_type == "numeric" and nominal_column and price_column and not value_column:
                    value_column = col
                elif col_type == "text" and isinstance(col, str) and len(col) <= 3 and not currency_column:
                    currency_column = col
                elif col_type == "date" and not maturity_column:
                    maturity_column = col
                elif col_type == "text" and isinstance(col, str) and "%" in col and not weight_column:
                    weight_column = col
                elif col_type == "text" and isinstance(col, str) and "%" in col and weight_column and not coupon_column:
                    coupon_column = col

            # If no ISIN column found, try to identify it by name
            if not isin_column:
                for col in df.columns:
                    col_lower = str(col).lower()
                    if 'isin' in col_lower:
                        isin_column = col
                        break

            # If no description column found, try to identify it by name
            if not description_column:
                for col in df.columns:
                    col_lower = str(col).lower()
                    if any(term in col_lower for term in ['description', 'name', 'security', 'instrument', 'bond', 'stock', 'fund', 'etf', 'designation']):
                        description_column = col
                        break

            # If no nominal column found, try to identify it by name
            if not nominal_column:
                for col in df.columns:
                    col_lower = str(col).lower()
                    if any(term in col_lower for term in ['nominal', 'quantity', 'amount', 'units', 'shares', 'position', 'volume']):
                        nominal_column = col
                        break

            # If no price column found, try to identify it by name
            if not price_column:
                for col in df.columns:
                    col_lower = str(col).lower()
                    if any(term in col_lower for term in ['price', 'rate', 'quote', 'nav', 'cost', 'current price']):
                        price_column = col
                        break

            # If no acquisition price column found, try to identify it by name
            if not acquisition_price_column:
                for col in df.columns:
                    col_lower = str(col).lower()
                    if any(term in col_lower for term in ['acquisition', 'purchase', 'buy', 'entry', 'cost price', 'average price']):
                        acquisition_price_column = col
                        break

            # If no value column found, try to identify it by name
            if not value_column:
                for col in df.columns:
                    col_lower = str(col).lower()
                    if any(term in col_lower for term in ['value', 'valuation', 'market', 'total', 'worth', 'amount', 'countervalue']):
                        value_column = col
                        break

            # If no currency column found, try to identify it by name
            if not currency_column:
                for col in df.columns:
                    col_lower = str(col).lower()
                    if any(term in col_lower for term in ['currency', 'ccy', 'curr', 'fx']):
                        currency_column = col
                        break

            # If no maturity column found, try to identify it by name
            if not maturity_column:
                for col in df.columns:
                    col_lower = str(col).lower()
                    if any(term in col_lower for term in ['maturity', 'maturity date', 'due', 'expiry', 'term']):
                        maturity_column = col
                        break

            # If no weight column found, try to identify it by name
            if not weight_column:
                for col in df.columns:
                    col_lower = str(col).lower()
                    if any(term in col_lower for term in ['weight', 'allocation', 'percentage', '%']):
                        weight_column = col
                        break

            # If no coupon column found, try to identify it by name
            if not coupon_column:
                for col in df.columns:
                    col_lower = str(col).lower()
                    if any(term in col_lower for term in ['coupon', 'interest', 'yield', 'rate', '%']) and col != weight_column:
                        coupon_column = col
                        break

            # Extract securities from the table
            for _, row in df.iterrows():
                # Skip header and footer rows
                if _ in table_structure.get("header_rows", []) or _ in table_structure.get("footer_rows", []):
                    continue

                # Extract ISIN
                isin = None
                if isin_column and isin_column in row:
                    isin_value = row[isin_column]
                    if isinstance(isin_value, str) and re.match(r'^[A-Z]{2}[A-Z0-9]{9}[0-9]$', isin_value):
                        isin = isin_value

                # If no ISIN found, try to extract it from other columns
                if not isin:
                    for col in df.columns:
                        if col in row:
                            cell_value = row[col]
                            if isinstance(cell_value, str):
                                isin_match = re.search(r'[A-Z]{2}[A-Z0-9]{9}[0-9]', cell_value)
                                if isin_match:
                                    isin = isin_match.group(0)
                                    break

                # Skip rows without ISIN
                if not isin:
                    continue

                # Validate ISIN
                is_valid = is_valid_isin(isin)
                if not is_valid:
                    logger.warning(f"Invalid ISIN: {isin}")
                    # We'll still include it but mark it as invalid
                    # This allows us to see what's being extracted

                # Extract other fields
                description = row[description_column] if description_column and description_column in row else None
                nominal_value = row[nominal_column] if nominal_column and nominal_column in row else None
                price = row[price_column] if price_column and price_column in row else None
                acquisition_price = row[acquisition_price_column] if acquisition_price_column and acquisition_price_column in row else None
                actual_value = row[value_column] if value_column and value_column in row else None
                currency = row[currency_column] if currency_column and currency_column in row else None
                maturity = row[maturity_column] if maturity_column and maturity_column in row else None
                coupon = row[coupon_column] if coupon_column and coupon_column in row else None
                weight = row[weight_column] if weight_column and weight_column in row else None

                # Clean up values
                if isinstance(nominal_value, str):
                    nominal_value = nominal_value.replace("'", "").replace(",", "")
                    try:
                        nominal_value = float(nominal_value)
                    except:
                        pass

                if isinstance(price, str):
                    price = price.replace("'", "").replace(",", "")
                    try:
                        price = float(price)
                    except:
                        pass

                if isinstance(acquisition_price, str):
                    acquisition_price = acquisition_price.replace("'", "").replace(",", "")
                    try:
                        acquisition_price = float(acquisition_price)
                    except:
                        pass

                if isinstance(actual_value, str):
                    actual_value = actual_value.replace("'", "").replace(",", "")
                    try:
                        actual_value = float(actual_value)
                    except:
                        pass

                if isinstance(weight, str):
                    weight = weight.replace("%", "").strip()
                    try:
                        weight = float(weight)
                    except:
                        pass

                # Try to extract currency from description if not found
                if not currency and description:
                    currency_match = re.search(r'\b(USD|EUR|CHF|GBP|JPY)\b', str(description))
                    if currency_match:
                        currency = currency_match.group(0)

                # Try to extract coupon from description if not found
                if not coupon and description:
                    coupon_match = re.search(r'\b(\d+(\.\d+)?\s*%)\b', str(description))
                    if coupon_match:
                        coupon = coupon_match.group(0)

                # Try to extract maturity from description if not found
                if not maturity and description:
                    maturity_match = re.search(r'\b(\d{1,2}[./-]\d{1,2}[./-]\d{2,4})\b', str(description))
                    if maturity_match:
                        maturity = maturity_match.group(0)

                # If we have portfolio summary data, try to find asset class weight
                asset_class_weight = None
                if portfolio_summary:
                    # Determine asset class based on table ID or page number
                    asset_class = None
                    if "bond" in table["id"].lower() or (table["page"] >= 6 and table["page"] <= 9):
                        asset_class = "Bonds"
                    elif "equit" in table["id"].lower() or (table["page"] >= 10 and table["page"] <= 11):
                        asset_class = "Equities"
                    elif "struct" in table["id"].lower() or (table["page"] >= 11 and table["page"] <= 14):
                        asset_class = "Structured products"

                    if asset_class and asset_class in portfolio_summary:
                        asset_class_weight = portfolio_summary[asset_class].get("weight")

                # Create security
                security = {
                    "isin": isin,
                    "description": description,
                    "nominal_value": nominal_value,
                    "price": price,
                    "acquisition_price": acquisition_price,
                    "actual_value": actual_value,
                    "currency": currency,
                    "maturity": maturity,
                    "coupon": coupon,
                    "weight": weight,
                    "asset_class_weight": asset_class_weight,
                    "source_table": table["id"],
                    "source_page": table["page"],
                    "is_valid_isin": is_valid
                }

                # Add security to list
                securities.append(security)

        # Remove duplicates
        unique_securities = []
        seen_isins = set()

        for security in securities:
            isin = security["isin"]

            if isin not in seen_isins:
                seen_isins.add(isin)
                unique_securities.append(security)

        return unique_securities

    def _extract_portfolio_summary(self, grid_analysis: Dict[str, Any]) -> Dict[str, Dict[str, Any]]:
        """
        Extract portfolio summary information from grid analysis.

        Args:
            grid_analysis: Grid analysis dictionary

        Returns:
            Dictionary containing portfolio summary information
        """
        summary = {}

        # Look for summary tables (usually on page 2 or 3)
        for table in grid_analysis["tables"]:
            # Skip tables without dataframes
            if "dataframe" not in table:
                continue

            df = table["dataframe"]

            # Skip empty dataframes
            if df.empty:
                continue

            # Check if this is a summary table
            is_summary = False

            # Check if table is on page 2 or 3
            if table["page"] in [2, 3]:
                is_summary = True

            # Check if table contains summary keywords
            if not is_summary:
                for col in df.columns:
                    col_str = str(col).lower()
                    if any(term in col_str for term in ["summary", "asset", "allocation", "weight"]):
                        is_summary = True
                        break

            if not is_summary:
                continue

            # Extract asset classes and their weights
            asset_column = None
            value_column = None
            weight_column = None

            # Find relevant columns
            for col in df.columns:
                col_str = str(col).lower()
                if any(term in col_str for term in ["asset", "class", "type"]):
                    asset_column = col
                elif any(term in col_str for term in ["value", "amount", "countervalue"]):
                    value_column = col
                elif any(term in col_str for term in ["weight", "allocation", "%"]):
                    weight_column = col

            # If we found the necessary columns, extract the data
            if asset_column and (value_column or weight_column):
                for _, row in df.iterrows():
                    asset_class = row.get(asset_column)
                    if not asset_class or not isinstance(asset_class, str):
                        continue

                    # Clean up asset class name
                    asset_class = asset_class.strip()

                    # Skip empty asset classes
                    if not asset_class:
                        continue

                    # Extract value and weight
                    value = None
                    weight = None

                    if value_column:
                        value_str = row.get(value_column)
                        if value_str:
                            if isinstance(value_str, str):
                                value_str = value_str.replace("'", "").replace(",", "")
                                try:
                                    value = float(value_str)
                                except:
                                    pass
                            elif isinstance(value_str, (int, float)):
                                value = float(value_str)

                    if weight_column:
                        weight_str = row.get(weight_column)
                        if weight_str:
                            if isinstance(weight_str, str):
                                weight_str = weight_str.replace("%", "").strip()
                                try:
                                    weight = float(weight_str)
                                except:
                                    pass
                            elif isinstance(weight_str, (int, float)):
                                weight = float(weight_str)

                    # Add to summary
                    if asset_class not in summary:
                        summary[asset_class] = {}

                    if value is not None:
                        summary[asset_class]["value"] = value

                    if weight is not None:
                        summary[asset_class]["weight"] = weight

        return summary

def main():
    """
    Main function for testing the grid analyzer.
    """
    import argparse

    # Parse command line arguments
    parser = argparse.ArgumentParser(description='Analyze grid structures in a PDF.')
    parser.add_argument('pdf_path', help='Path to the PDF file')
    parser.add_argument('--debug', action='store_true', help='Print debug information')
    parser.add_argument('--output', help='Path to save the output JSON')

    args = parser.parse_args()

    # Create grid analyzer
    analyzer = GridAnalyzer(debug=args.debug)

    # Analyze PDF
    grid_analysis = analyzer.analyze_pdf(args.pdf_path)

    # Extract securities
    securities = analyzer.extract_securities(args.pdf_path)

    # Print summary
    print(f"Found {len(grid_analysis['tables'])} tables")
    print(f"Extracted {len(securities)} securities")

    # Print securities
    for i, security in enumerate(securities):
        print(f"\nSecurity {i+1}:")
        print(f"  ISIN: {security.get('isin', 'Unknown')}")
        print(f"  Description: {security.get('description', 'Unknown')}")
        print(f"  Nominal Value: {security.get('nominal_value', 'Unknown')}")
        print(f"  Price: {security.get('price', 'Unknown')}")
        print(f"  Actual Value: {security.get('actual_value', 'Unknown')}")
        print(f"  Currency: {security.get('currency', 'Unknown')}")
        print(f"  Maturity: {security.get('maturity', 'Unknown')}")
        print(f"  Coupon: {security.get('coupon', 'Unknown')}")
        print(f"  Source: Table {security.get('source_table', 'Unknown')} on page {security.get('source_page', 'Unknown')}")

    # Save output
    if args.output:
        output = {
            "grid_analysis": {
                "tables_count": len(grid_analysis["tables"]),
                "table_structures": grid_analysis["table_structures"],
                "table_relationships": grid_analysis["table_relationships"]
            },
            "securities": securities
        }

        with open(args.output, 'w', encoding='utf-8') as f:
            json.dump(output, f, indent=2, ensure_ascii=False)

        print(f"\nSaved output to {args.output}")

if __name__ == "__main__":
    main()
