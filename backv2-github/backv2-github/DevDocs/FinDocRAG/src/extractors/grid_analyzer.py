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

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class GridAnalyzer:
    """
    Analyzer for grid structures in financial documents.
    """
    
    def __init__(self, debug: bool = False):
        """
        Initialize the grid analyzer.
        
        Args:
            debug: Whether to print debug information
        """
        self.debug = debug
    
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
                
                # Apply threshold
                _, thresh = cv2.threshold(gray, 150, 255, cv2.THRESH_BINARY_INV)
                
                # Detect horizontal lines
                horizontal_kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (50, 1))
                horizontal_lines = cv2.morphologyEx(thresh, cv2.MORPH_OPEN, horizontal_kernel)
                
                # Detect vertical lines
                vertical_kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (1, 50))
                vertical_lines = cv2.morphologyEx(thresh, cv2.MORPH_OPEN, vertical_kernel)
                
                # Combine lines
                grid = cv2.add(horizontal_lines, vertical_lines)
                
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
                    
                    # Try to extract table data using OCR or other methods
                    # For now, just add the table with its bounding box
                    tables.append({
                        "id": f"visual_{page_num+1}_{i+1}",
                        "page": page_num + 1,
                        "method": "visual_grid",
                        "accuracy": 0.6,  # Arbitrary accuracy for visual detection
                        "bbox": {"x": x, "y": y, "width": w, "height": h},
                        "image_path": table_img_path
                    })
                    
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
            
            # Analyze column types
            column_types = {}
            for col in df.columns:
                column_types[col] = self._detect_column_type(df[col])
            
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
        
        for table in grid_analysis["tables"]:
            # Skip tables without dataframes
            if "dataframe" not in table:
                continue
            
            df = table["dataframe"]
            
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
                elif col_type == "text" and len(col) <= 3 and not currency_column:
                    currency_column = col
                elif col_type == "date" and not maturity_column:
                    maturity_column = col
                elif col_type == "text" and "%" in col and not coupon_column:
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
                    if any(term in col_lower for term in ['description', 'name', 'security']):
                        description_column = col
                        break
            
            # If no nominal column found, try to identify it by name
            if not nominal_column:
                for col in df.columns:
                    col_lower = str(col).lower()
                    if any(term in col_lower for term in ['nominal', 'quantity', 'amount']):
                        nominal_column = col
                        break
            
            # If no price column found, try to identify it by name
            if not price_column:
                for col in df.columns:
                    col_lower = str(col).lower()
                    if any(term in col_lower for term in ['price', 'rate', 'quote']):
                        price_column = col
                        break
            
            # If no value column found, try to identify it by name
            if not value_column:
                for col in df.columns:
                    col_lower = str(col).lower()
                    if any(term in col_lower for term in ['value', 'valuation', 'market']):
                        value_column = col
                        break
            
            # Extract securities from the table
            for _, row in df.iterrows():
                # Skip header and footer rows
                if _ in table_structure.get("header_rows", []) or _ in table_structure.get("footer_rows", []):
                    continue
                
                # Extract ISIN
                isin = None
                if isin_column:
                    isin_value = row[isin_column]
                    if isinstance(isin_value, str) and re.match(r'^[A-Z]{2}[A-Z0-9]{9}[0-9]$', isin_value):
                        isin = isin_value
                
                # If no ISIN found, try to extract it from other columns
                if not isin:
                    for col in df.columns:
                        cell_value = row[col]
                        if isinstance(cell_value, str):
                            isin_match = re.search(r'[A-Z]{2}[A-Z0-9]{9}[0-9]', cell_value)
                            if isin_match:
                                isin = isin_match.group(0)
                                break
                
                # Skip rows without ISIN
                if not isin:
                    continue
                
                # Extract other fields
                description = row[description_column] if description_column else None
                nominal_value = row[nominal_column] if nominal_column else None
                price = row[price_column] if price_column else None
                actual_value = row[value_column] if value_column else None
                currency = row[currency_column] if currency_column else None
                maturity = row[maturity_column] if maturity_column else None
                coupon = row[coupon_column] if coupon_column else None
                
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
                
                if isinstance(actual_value, str):
                    actual_value = actual_value.replace("'", "").replace(",", "")
                    try:
                        actual_value = float(actual_value)
                    except:
                        pass
                
                # Create security
                security = {
                    "isin": isin,
                    "description": description,
                    "nominal_value": nominal_value,
                    "price": price,
                    "actual_value": actual_value,
                    "currency": currency,
                    "maturity": maturity,
                    "coupon": coupon,
                    "source_table": table["id"],
                    "source_page": table["page"]
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
