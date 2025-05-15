"""
Enhanced Document Processor Module

This module provides an enhanced document processing pipeline
for financial documents, integrating advanced OCR, entity recognition,
and structured data extraction.
"""

import os
import logging
import json
import time
from typing import Dict, Any, List, Optional
from datetime import datetime

# Import enhanced components
from .enhanced_ocr_processor import EnhancedOCRProcessor
from .financial_entity_recognizer import FinancialEntityRecognizer
from .table_extractor import TableExtractor
from .output_generator import OutputGenerator

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class EnhancedDocumentProcessor:
    """
    Enhanced document processor for financial documents.
    
    This processor combines advanced OCR, entity recognition,
    table extraction, and structured data extraction.
    """
    
    def __init__(self, api_key: Optional[str] = None):
        """
        Initialize the EnhancedDocumentProcessor.
        
        Args:
            api_key: API key for AI services
        """
        self.api_key = api_key
        self.output_dir = None
        self.entity_recognizer = FinancialEntityRecognizer()
        
        logger.info("Initialized EnhancedDocumentProcessor")
    
    def process(self, 
                pdf_path: str, 
                output_dir: Optional[str] = None,
                languages: List[str] = ['eng'],
                process_tables: bool = True,
                extract_entities: bool = True,
                validate_with_ai: bool = False) -> Dict[str, Any]:
        """
        Process a financial document with enhanced capabilities.
        
        Args:
            pdf_path: Path to the PDF file
            output_dir: Directory to save output files
            languages: List of languages for OCR
            process_tables: Whether to process tables
            extract_entities: Whether to extract financial entities
            validate_with_ai: Whether to validate results with AI
            
        Returns:
            Dictionary with processed data
        """
        start_time = time.time()
        
        # Set output directory
        self.output_dir = output_dir or os.path.join(os.path.dirname(pdf_path), 'output')
        os.makedirs(self.output_dir, exist_ok=True)
        
        logger.info(f"Processing document: {pdf_path}")
        logger.info(f"Output directory: {self.output_dir}")
        
        # Initialize result structure
        result = {
            "document_id": os.path.basename(pdf_path).split('.')[0],
            "document_name": os.path.basename(pdf_path),
            "document_date": datetime.now().strftime('%Y-%m-%d'),
            "processing_date": datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
            "document_type": "unknown",
            "ocr_languages": languages,
            "processing_options": {
                "process_tables": process_tables,
                "extract_entities": extract_entities,
                "validate_with_ai": validate_with_ai
            },
            "text": "",
            "entities": {},
            "tables": [],
            "structured_data": {},
            "processing_time": {
                "total": 0,
                "ocr": 0,
                "tables": 0,
                "entities": 0,
                "validation": 0
            },
            "error": None
        }
        
        try:
            # Step 1: Enhanced OCR Processing
            ocr_start = time.time()
            ocr_result = self._perform_enhanced_ocr(pdf_path, languages)
            result["text"] = ocr_result["text"]
            result["document_type"] = ocr_result["document_type"]
            result["processing_time"]["ocr"] = time.time() - ocr_start
            
            # Step 2: Table Extraction (if requested)
            if process_tables:
                tables_start = time.time()
                table_result = self._extract_tables(pdf_path, ocr_result["document_type"])
                result["tables"] = table_result["tables"]
                result["processing_time"]["tables"] = time.time() - tables_start
            
            # Step 3: Entity Extraction (if requested)
            if extract_entities:
                entities_start = time.time()
                entities_result = self._extract_entities(result["text"])
                result["entities"] = entities_result["entities"]
                result["structured_data"] = entities_result["structured_data"]
                result["processing_time"]["entities"] = time.time() - entities_start
            
            # Step 4: AI Validation (if requested)
            if validate_with_ai and self.api_key:
                validation_start = time.time()
                validation_result = self._validate_with_ai(result)
                
                # Update result with validated data
                if "tables" in validation_result:
                    result["tables"] = validation_result["tables"]
                
                if "structured_data" in validation_result:
                    result["structured_data"] = validation_result["structured_data"]
                
                result["validation"] = validation_result.get("validation", {})
                result["processing_time"]["validation"] = time.time() - validation_start
            
            # Generate output
            output_generator = OutputGenerator()
            final_result = output_generator.generate_output(result)
            
            # Calculate total processing time
            result["processing_time"]["total"] = time.time() - start_time
            
            # Save final result
            output_path = os.path.join(self.output_dir, f"{os.path.basename(pdf_path).split('.')[0]}_processed.json")
            with open(output_path, 'w', encoding='utf-8') as f:
                json.dump(final_result, f, indent=2, ensure_ascii=False)
            
            logger.info(f"Processing complete in {time.time() - start_time:.2f} seconds")
            logger.info(f"Final result saved to {output_path}")
            
            return final_result
            
        except Exception as e:
            logger.error(f"Error processing document: {str(e)}", exc_info=True)
            result["error"] = str(e)
            result["processing_time"]["total"] = time.time() - start_time
            
            # Save error result
            error_path = os.path.join(self.output_dir, f"{os.path.basename(pdf_path).split('.')[0]}_error.json")
            with open(error_path, 'w', encoding='utf-8') as f:
                json.dump(result, f, indent=2, ensure_ascii=False)
            
            return result
    
    def _perform_enhanced_ocr(self, pdf_path: str, languages: List[str]) -> Dict[str, Any]:
        """
        Perform enhanced OCR on the document.
        
        Args:
            pdf_path: Path to the PDF file
            languages: List of languages for OCR
            
        Returns:
            Dictionary with OCR results
        """
        logger.info("Step 1: Enhanced OCR Processing")
        
        # Initialize the enhanced OCR processor
        ocr_processor = EnhancedOCRProcessor(pdf_path)
        
        # Process the document
        ocr_path = ocr_processor.process(languages=languages)
        
        # Extract text
        text = ocr_processor.extract_text()
        
        # Get document type
        document_type = ocr_processor.document_type
        
        # Save text to file
        text_path = os.path.join(self.output_dir, f"{os.path.basename(pdf_path).split('.')[0]}_ocr.txt")
        with open(text_path, 'w', encoding='utf-8') as f:
            f.write(text)
        
        logger.info(f"Enhanced OCR processing complete, text saved to {text_path}")
        
        return {
            'ocr_path': ocr_path,
            'text': text,
            'text_path': text_path,
            'document_type': document_type
        }
    
    def _extract_tables(self, pdf_path: str, document_type: str) -> Dict[str, Any]:
        """
        Extract tables from the document with enhanced table detection.
        
        Args:
            pdf_path: Path to the PDF file
            document_type: Type of document for optimized extraction
            
        Returns:
            Dictionary with table extraction results
        """
        logger.info("Step 2: Enhanced Table Extraction")
        
        # Initialize table extractor
        table_extractor = TableExtractor(pdf_path)
        
        # Set extraction parameters based on document type
        extraction_options = {}
        if document_type == "portfolio_statement":
            extraction_options = {
                "flavor": "lattice",  # Use lattice for structured tables in portfolio statements
                "line_scale": 40,     # Enhanced line detection
                "process_background": True  # Process background color
            }
        elif document_type == "financial_statement":
            extraction_options = {
                "flavor": "stream",   # Use stream for less structured tables
                "edge_tol": 500,      # Higher tolerance for less structured tables
                "row_tol": 10         # Lower row tolerance for financial statements
            }
        else:
            # Default options for other document types
            extraction_options = {
                "flavor": "stream",
                "edge_tol": 100,
                "row_tol": 5
            }
        
        # Extract tables with optimized parameters
        tables = table_extractor.extract_tables(extraction_options)
        
        # Convert tables to standardized format
        standardized_tables = []
        for i, table in enumerate(tables):
            try:
                # Convert to dictionary
                table_dict = {
                    "id": f"table_{i+1}",
                    "page": table.page if hasattr(table, 'page') else 0,
                    "rows": len(table.df),
                    "columns": len(table.df.columns),
                    "headers": table.df.columns.tolist(),
                    "data": table.df.to_dict(orient='records')
                }
                standardized_tables.append(table_dict)
            except Exception as e:
                logger.warning(f"Error standardizing table {i+1}: {str(e)}")
        
        # Save tables to file
        tables_path = os.path.join(self.output_dir, f"{os.path.basename(pdf_path).split('.')[0]}_tables.json")
        with open(tables_path, 'w', encoding='utf-8') as f:
            json.dump(standardized_tables, f, indent=2, ensure_ascii=False)
        
        logger.info(f"Enhanced table extraction complete, extracted {len(standardized_tables)} tables")
        
        return {
            'tables': standardized_tables,
            'tables_path': tables_path
        }
    
    def _extract_entities(self, text: str) -> Dict[str, Any]:
        """
        Extract financial entities from text.
        
        Args:
            text: Text to analyze
            
        Returns:
            Dictionary with entity extraction results
        """
        logger.info("Step 3: Financial Entity Extraction")
        
        # Recognize entities
        entities = self.entity_recognizer.recognize_entities(text)
        
        # Extract structured data
        structured_data = self.entity_recognizer.extract_structured_data(text)
        
        logger.info(f"Entity extraction complete, found {sum(len(entities_list) for entities_list in entities.values())} entities")
        
        return {
            'entities': entities,
            'structured_data': structured_data
        }
    
    def _validate_with_ai(self, result: Dict[str, Any]) -> Dict[str, Any]:
        """
        Validate results using AI services.
        
        Args:
            result: Processing results to validate
            
        Returns:
            Dictionary with validated results
        """
        logger.info("Step 4: AI Validation")
        
        # This method would use OpenAI, Azure, or other AI services
        # to validate and enhance the extracted data
        # For now, this is a placeholder that returns the input
        
        # In a real implementation, this would:
        # 1. Use AI to validate extracted entities
        # 2. Correct potential OCR errors in key fields
        # 3. Enhance structured data extraction
        # 4. Provide confidence scores for extracted data
        
        logger.info("AI validation skipped (not implemented)")
        
        return result


# Example usage
if __name__ == "__main__":
    # This will only run when the script is executed directly
    import sys
    import os
    
    if len(sys.argv) > 1:
        pdf_path = sys.argv[1]
        output_dir = sys.argv[2] if len(sys.argv) > 2 else None
        
        # Get API key from environment
        api_key = os.getenv('OPENAI_API_KEY')
        
        # Create processor
        processor = EnhancedDocumentProcessor(api_key=api_key)
        
        # Process document
        result = processor.process(
            pdf_path, 
            output_dir,
            languages=['eng'],
            process_tables=True,
            extract_entities=True,
            validate_with_ai=api_key is not None
        )
        
        # Print summary
        print(f"Document processed: {pdf_path}")
        print(f"Document type: {result['document_type']}")
        print(f"Processing time: {result['processing_time']['total']:.2f} seconds")
        
        if 'structured_data' in result and 'securities' in result['structured_data']:
            print(f"Extracted {len(result['structured_data']['securities'])} securities")
        
        if 'tables' in result:
            print(f"Extracted {len(result['tables'])} tables")
        
        if 'error' in result and result['error']:
            print(f"Error: {result['error']}")
    else:
        print("Please provide a PDF file path")