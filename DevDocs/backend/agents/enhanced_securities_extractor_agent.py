"""
Enhanced Securities Extractor Agent for extracting securities information from financial documents.

This agent uses the SecurityExtractor class to extract detailed securities information
from various types of financial documents, with specialized support for messos format.
"""

import os
import json
import logging
from typing import Dict, List, Any, Optional, Union
import requests
from .base_agent import BaseAgent

# Import the SecurityExtractor
try:
    from enhanced_securities_extractor import SecurityExtractor
except ImportError:
    # Provide a better error message if the module is not found
    raise ImportError(
        "The enhanced_securities_extractor module is required for this agent. "
        "Please ensure it is installed and available in the Python path."
    )

# Set up logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class EnhancedSecuritiesExtractorAgent(BaseAgent):
    """Agent for extracting securities information from financial documents."""

    def __init__(
        self,
        api_key: Optional[str] = None,
        model: str = "anthropic/claude-3-opus:beta",
        reference_db_path: Optional[str] = None,
        debug: bool = False,
        log_level: str = "INFO",
        **kwargs
    ):
        """
        Initialize the enhanced securities extractor agent.

        Args:
            api_key: OpenRouter API key
            model: Model to use for entity extraction fallback
            reference_db_path: Optional path to securities reference database file
            debug: Whether to print debug information
            log_level: Logging level (DEBUG, INFO, WARNING, ERROR, CRITICAL)
            **kwargs: Additional parameters for the base agent
        """
        super().__init__(name="Enhanced Securities Extractor")
        self.api_key = api_key
        self.model = model
        self.debug = debug
        self.description = "I extract detailed securities information from financial documents."

        # Configure logging
        numeric_level = getattr(logging, log_level.upper(), None)
        if not isinstance(numeric_level, int):
            numeric_level = logging.INFO
        logger.setLevel(numeric_level)

        # Initialize the securities extractor
        self.extractor = SecurityExtractor(
            debug=debug,
            reference_db_path=reference_db_path,
            log_level=log_level
        )

    def process(self, task: Dict[str, Any]) -> Dict[str, Any]:
        """
        Process a task to extract securities information from a financial document.

        Args:
            task: Task dictionary with the following keys:
                - pdf_path: Path to the PDF file
                - or
                - document: Document object with a 'path' field pointing to the PDF
                - enhanced_extraction: Whether to use enhanced extraction (default: True)

        Returns:
            Dictionary with extracted securities information
        """
        # Get the PDF path from the task
        pdf_path = None
        if 'pdf_path' in task:
            pdf_path = task['pdf_path']
        elif 'document' in task and isinstance(task['document'], dict) and 'path' in task['document']:
            pdf_path = task['document']['path']
        else:
            return {
                'status': 'error',
                'message': 'No PDF path provided. Please provide a pdf_path or document with a path field.'
            }

        # Check if the file exists
        if not os.path.exists(pdf_path):
            return {
                'status': 'error',
                'message': f'PDF file not found: {pdf_path}'
            }

        # Determine extraction method
        enhanced_extraction = task.get('enhanced_extraction', True)

        # Extract securities
        try:
            if enhanced_extraction:
                logger.info(f"Extracting securities from {pdf_path} using enhanced extraction")
                result = self.extractor.extract_from_pdf(pdf_path)
            else:
                logger.info(f"Extracting securities from {pdf_path} using basic extraction")
                # Fallback to basic extraction if enhanced extraction is disabled
                result = self._extract_basic(pdf_path)

            return {
                'status': 'success',
                'data': result
            }
        except Exception as e:
            logger.error(f"Error extracting securities: {str(e)}")
            return {
                'status': 'error',
                'message': f'Error extracting securities: {str(e)}'
            }

    def _extract_basic(self, pdf_path: str) -> Dict[str, Any]:
        """
        Basic extraction of securities information using camelot and regex.
        Used as a fallback method if enhanced extraction fails or is disabled.

        Args:
            pdf_path: Path to the PDF file

        Returns:
            Dictionary with extracted securities information
        """
        # Initialize default result structure
        default_result = {
            "document_type": "unknown",
            "securities": [],
            "error": None
        }

        try:
            # Detect document type
            doc_type = self.extractor._detect_document_type(pdf_path)
            default_result["document_type"] = doc_type

            # Extract tables
            # Get tables directly from the extractor's internal methods
            if doc_type == "messos":
                securities = self.extractor._extract_messos_securities(pdf_path)
            else:
                # Use generic extraction for other document types
                generic_result = self.extractor._extract_generic(pdf_path)
                securities = generic_result.get("securities", [])

            # Add securities to result
            default_result["securities"] = securities

            # Look for a currency if available
            try:
                currency = self.extractor._get_document_currency(pdf_path, doc_type)
                default_result["currency"] = currency
            except Exception as e:
                logger.warning(f"Error detecting currency: {str(e)}")
                # Fall back to a default currency based on document type
                default_result["currency"] = self.extractor.doc_type_currency_map.get(doc_type, "USD")

            return default_result

        except Exception as e:
            # Log and return empty result on any error
            logger.error(f"Error in basic extraction: {str(e)}")
            default_result["error"] = str(e)
            return default_result

    def save_results(self, results: Dict[str, Any], output_path: str) -> str:
        """
        Save extracted securities information to a file.

        Args:
            results: Extracted securities information
            output_path: Output file path

        Returns:
            Path to the saved file
        """
        # Create output directory if it doesn't exist
        os.makedirs(os.path.dirname(output_path), exist_ok=True)

        # Save to file
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(results, f, indent=2, ensure_ascii=False)

        return output_path

    def get_agent_capabilities(self) -> Dict[str, Any]:
        """
        Get the capabilities of this agent.

        Returns:
            Dictionary with agent capabilities
        """
        return {
            'name': self.name,
            'description': self.description,
            'document_types': list(self.extractor.doc_type_currency_map.keys()),
            'extraction_capabilities': [
                'Securities (bonds, equities, etc.)',
                'ISIN identification',
                'Asset allocation',
                'Portfolio summary',
                'Currency detection',
                'Nominal/quantity values',
                'Price and value information',
                'Weight/percentage in portfolio'
            ],
            'supports_enhanced_extraction': True
        }

    def get_supported_document_types(self) -> List[str]:
        """
        Get the list of supported document types.

        Returns:
            List of supported document types
        """
        return list(self.extractor.doc_type_currency_map.keys())