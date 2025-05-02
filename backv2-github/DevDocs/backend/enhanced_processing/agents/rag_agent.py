"""
RAG Agent for the RAG Multimodal Financial Document Processor.
"""

import os
import json
import logging
import requests
import re
from typing import List, Dict, Any, Optional, Tuple
import base64
from PIL import Image
import io

from ..utils import ensure_dir

logger = logging.getLogger(__name__)

class RAGAgent:
    """
    RAG Agent for validating and enhancing financial data using AI.
    """

    def __init__(self, config):
        """
        Initialize the RAG Agent.

        Args:
            config: Configuration dictionary
        """
        self.config = config
        self.rag_config = config["rag"]
        self.output_config = config["output"]

        # Get API keys
        self.openai_api_key = os.environ.get("OPENAI_API_KEY")
        self.google_api_key = os.environ.get("GOOGLE_API_KEY")

        # Determine which API to use
        self.api_type = "openai" if self.openai_api_key else "google" if self.google_api_key else None

        if not self.api_type:
            logger.warning("No API key found for OpenAI or Google. RAG validation will be skipped.")

        logger.info(f"Initialized RAG Agent using {self.api_type} API")

    def process(self, ocr_results: Dict[str, Any], financial_results: Dict[str, Any],
               pdf_path: str, output_dir: str) -> Dict[str, Any]:
        """
        Process financial data with RAG for validation and enhancement.

        Args:
            ocr_results: OCR results
            financial_results: Financial analysis results
            pdf_path: Path to the PDF file
            output_dir: Output directory

        Returns:
            Dictionary with RAG validation results
        """
        logger.info("Validating financial data with RAG")

        # Create output directory
        rag_dir = os.path.join(output_dir, "rag")
        ensure_dir(rag_dir)

        # Skip if no API key
        if not self.api_type:
            logger.warning("Skipping RAG validation due to missing API keys")
            return {
                "validated_data": financial_results["financial_data"],
                "rag_dir": rag_dir
            }

        # Convert PDF to images
        try:
            from pdf2image import convert_from_path
            images = convert_from_path(pdf_path, dpi=150)
        except Exception as e:
            logger.warning(f"Error converting PDF to images: {e}")
            try:
                import fitz
                doc = fitz.open(pdf_path)
                images = []
                for page_num in range(len(doc)):
                    page = doc.load_page(page_num)
                    pix = page.get_pixmap(matrix=fitz.Matrix(2, 2))
                    img = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)
                    images.append(img)
            except Exception as e2:
                logger.error(f"Error converting PDF to images with PyMuPDF: {e2}")
                images = []

        # Save images
        image_paths = []
        for i, image in enumerate(images):
            image_path = os.path.join(rag_dir, f"page_{i+1}.jpg")
            image.save(image_path, "JPEG")
            image_paths.append(image_path)

        # First, identify the document type
        document_type = self._identify_document_type(ocr_results["text"], image_paths)
        logger.info(f"Identified document type: {document_type}")

        # Extract financial data based on document type
        extracted_data = self._extract_financial_data(document_type, ocr_results["text"], image_paths)

        # Merge extracted data with existing financial results
        merged_data = self._merge_financial_data(extracted_data, financial_results["financial_data"])

        # Validate total value
        total_value, currency = self._validate_total_value(
            merged_data,
            ocr_results["text"],
            image_paths
        )

        # Validate securities
        securities = self._validate_securities(
            merged_data["securities"],
            ocr_results["text"],
            image_paths
        )

        # Validate asset allocation
        asset_allocation = self._validate_asset_allocation(
            merged_data["asset_allocation"],
            ocr_results["text"],
            image_paths
        )

        # Extract financial statements
        financial_statements = self._extract_financial_statements(
            document_type,
            ocr_results["text"],
            image_paths
        )

        # Create validated data
        validated_data = {
            "document_type": document_type,
            "securities": securities,
            "total_value": total_value,
            "currency": currency,
            "asset_allocation": asset_allocation,
            "metrics": merged_data.get("metrics", {}),
            "financial_statements": financial_statements
        }

        # Save results
        with open(os.path.join(rag_dir, "validated_data.json"), "w", encoding="utf-8") as f:
            json.dump(validated_data, f, indent=2, ensure_ascii=False)

        logger.info("RAG validation complete")

        return {
            "validated_data": validated_data,
            "rag_dir": rag_dir
        }

    def _validate_total_value(self, financial_data: Dict[str, Any],
                             text: str, image_paths: List[str]) -> Tuple[float, str]:
        """
        Validate total portfolio value using RAG.

        Args:
            financial_data: Financial data
            text: OCR text
            image_paths: List of image paths

        Returns:
            Tuple of (total value, currency)
        """
        logger.info("Validating total portfolio value with RAG")

        # Get current values
        current_total = financial_data.get("total_value")
        current_currency = financial_data.get("currency")

        # Skip if no API
        if not self.api_type:
            return current_total, current_currency

        # Prepare prompt
        prompt = f"""
        You are a financial document analysis expert. I need you to find the total portfolio value in this document.

        The document appears to be a financial statement or portfolio report. Look for terms like:
        - "Total Value"
        - "Total Portfolio Value"
        - "Total Assets"
        - "Grand Total"

        The current extracted value is: {current_total} {current_currency}

        Please analyze the document and:
        1. Find the total portfolio value
        2. Identify the currency
        3. Return the results in JSON format with keys "total_value" and "currency"

        If you can't find a clear total value, return the current extracted value.
        """

        # Call API
        try:
            response = self._call_vision_api(prompt, image_paths[:3])  # Use first 3 pages

            # Parse response
            result = self._parse_json_from_response(response)

            if result and "total_value" in result:
                total_value = result["total_value"]
                currency = result.get("currency", current_currency)

                # Validate total value
                if isinstance(total_value, (int, float)) and total_value > 0:
                    logger.info(f"RAG validated total value: {total_value} {currency}")
                    return total_value, currency
        except Exception as e:
            logger.error(f"Error validating total value with RAG: {e}")

        return current_total, current_currency

    def _validate_securities(self, securities: List[Dict[str, Any]],
                            text: str, image_paths: List[str]) -> List[Dict[str, Any]]:
        """
        Validate securities using RAG.

        Args:
            securities: List of securities
            text: OCR text
            image_paths: List of image paths

        Returns:
            Validated list of securities
        """
        logger.info("Validating securities with RAG")

        # Skip if no API
        if not self.api_type:
            return securities

        # Prepare prompt
        prompt = f"""
        You are a financial document analysis expert. I need you to validate the extracted securities from this document.

        I have extracted {len(securities)} securities from the document. Here are the first 5 for reference:
        {json.dumps(securities[:5], indent=2)}

        Please analyze the document and:
        1. Verify if the number of securities is correct
        2. Check if any ISINs are missing
        3. Validate the names, quantities, and values

        Return your findings in JSON format with the key "validation_result" containing your assessment.
        Do not return the full list of securities, just your validation findings.
        """

        # Call API
        try:
            response = self._call_vision_api(prompt, image_paths)

            # Parse response
            result = self._parse_json_from_response(response)

            if result and "validation_result" in result:
                validation = result["validation_result"]
                logger.info(f"RAG validation result: {validation}")

                # TODO: Use validation to improve securities
                # This would require more complex logic to update securities based on validation
        except Exception as e:
            logger.error(f"Error validating securities with RAG: {e}")

        return securities

    def _validate_asset_allocation(self, asset_allocation: Dict[str, Dict[str, Any]],
                                  text: str, image_paths: List[str]) -> Dict[str, Dict[str, Any]]:
        """
        Validate asset allocation using RAG.

        Args:
            asset_allocation: Asset allocation dictionary
            text: OCR text
            image_paths: List of image paths

        Returns:
            Validated asset allocation
        """
        logger.info("Validating asset allocation with RAG")

        # Skip if no API
        if not self.api_type:
            return asset_allocation

        # Prepare prompt
        prompt = f"""
        You are a financial document analysis expert. I need you to validate the extracted asset allocation from this document.

        I have extracted the following asset allocation:
        {json.dumps(asset_allocation, indent=2)}

        Please analyze the document and:
        1. Verify if the asset classes are correct
        2. Check if any asset classes are missing
        3. Validate the values and weights

        Return your findings in JSON format with the key "asset_allocation" containing the corrected asset allocation.
        Each asset class should have "value" and "weight" properties.
        """

        # Call API
        try:
            response = self._call_vision_api(prompt, image_paths[:5])  # Use first 5 pages

            # Parse response
            result = self._parse_json_from_response(response)

            if result and "asset_allocation" in result:
                validated_allocation = result["asset_allocation"]

                # Validate structure
                if isinstance(validated_allocation, dict):
                    valid_allocation = True

                    for asset_class, allocation in validated_allocation.items():
                        if not isinstance(allocation, dict) or "value" not in allocation or "weight" not in allocation:
                            valid_allocation = False
                            break

                    if valid_allocation:
                        logger.info(f"RAG validated asset allocation: {validated_allocation}")
                        return validated_allocation
        except Exception as e:
            logger.error(f"Error validating asset allocation with RAG: {e}")

        return asset_allocation

    def _call_vision_api(self, prompt: str, image_paths: List[str]) -> str:
        """
        Call vision API (OpenAI or Google).

        Args:
            prompt: Prompt text
            image_paths: List of image paths

        Returns:
            API response text
        """
        if self.api_type == "openai":
            return self._call_openai_vision(prompt, image_paths)
        elif self.api_type == "google":
            return self._call_google_vision(prompt, image_paths)
        else:
            return "No API available"

    def _call_openai_vision(self, prompt: str, image_paths: List[str]) -> str:
        """
        Call OpenAI Vision API.

        Args:
            prompt: Prompt text
            image_paths: List of image paths

        Returns:
            API response text
        """
        # Prepare API request
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {self.openai_api_key}"
        }

        # Prepare messages
        messages = [
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": prompt}
                ]
            }
        ]

        # Add images (up to 5)
        for image_path in image_paths[:5]:
            with open(image_path, "rb") as image_file:
                base64_image = base64.b64encode(image_file.read()).decode('utf-8')

                messages[0]["content"].append({
                    "type": "image_url",
                    "image_url": {
                        "url": f"data:image/jpeg;base64,{base64_image}"
                    }
                })

        # Prepare data
        data = {
            "model": self.rag_config["model"],
            "messages": messages,
            "max_tokens": self.rag_config["max_tokens"],
            "temperature": self.rag_config["temperature"]
        }

        # Call API
        response = requests.post(
            "https://api.openai.com/v1/chat/completions",
            headers=headers,
            json=data
        )

        # Parse response
        if response.status_code == 200:
            result = response.json()
            return result["choices"][0]["message"]["content"]
        else:
            logger.error(f"OpenAI API error: {response.status_code} {response.text}")
            return ""

    def _call_google_vision(self, prompt: str, image_paths: List[str]) -> str:
        """
        Call Google Vision API.

        Args:
            prompt: Prompt text
            image_paths: List of image paths

        Returns:
            API response text
        """
        # Prepare API request
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {self.google_api_key}"
        }

        # Prepare content parts
        content_parts = [
            {
                "text": prompt
            }
        ]

        # Add images (up to 5)
        for image_path in image_paths[:5]:
            with open(image_path, "rb") as image_file:
                base64_image = base64.b64encode(image_file.read()).decode('utf-8')

                content_parts.append({
                    "inline_data": {
                        "mime_type": "image/jpeg",
                        "data": base64_image
                    }
                })

        # Prepare data
        data = {
            "contents": [
                {
                    "parts": content_parts
                }
            ],
            "generationConfig": {
                "temperature": self.rag_config["temperature"],
                "maxOutputTokens": self.rag_config["max_tokens"]
            }
        }

        # Call API
        response = requests.post(
            "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro-vision:generateContent",
            headers=headers,
            json=data
        )

        # Parse response
        if response.status_code == 200:
            result = response.json()
            return result["candidates"][0]["content"]["parts"][0]["text"]
        else:
            logger.error(f"Google API error: {response.status_code} {response.text}")
            return ""

    def _parse_json_from_response(self, response: str) -> Optional[Dict[str, Any]]:
        """
        Parse JSON from API response.

        Args:
            response: API response text

        Returns:
            Parsed JSON or None
        """
        try:
            # Extract JSON from response
            json_match = re.search(r'```json\n(.*?)\n```', response, re.DOTALL)

            if json_match:
                json_str = json_match.group(1)
            else:
                # Try to find JSON without markdown
                json_match = re.search(r'(\{.*\})', response, re.DOTALL)

                if json_match:
                    json_str = json_match.group(1)
                else:
                    json_str = response

            # Parse JSON
            return json.loads(json_str)
        except Exception as e:
            logger.error(f"Error parsing JSON from response: {e}")
            return None

    def _identify_document_type(self, text: str, image_paths: List[str]) -> str:
        """
        Identify the type of financial document.

        Args:
            text: OCR text
            image_paths: List of image paths

        Returns:
            Document type (e.g., 'portfolio_statement', 'bank_statement', 'annual_report', etc.)
        """
        logger.info("Identifying document type with RAG")

        # Skip if no API
        if not self.api_type:
            return "unknown"

        # Prepare prompt
        prompt = f"""
        You are a financial document analysis expert. I need you to identify the type of financial document provided.

        Analyze the document and determine which of the following categories it belongs to:
        1. portfolio_statement - A statement showing investment holdings and their values
        2. bank_statement - A statement from a bank showing account transactions
        3. annual_report - An annual financial report from a company
        4. quarterly_report - A quarterly financial report from a company
        5. tax_document - A tax-related document
        6. invoice - An invoice or bill
        7. interactive_brokers_statement - A statement from Interactive Brokers
        8. other - If it doesn't fit any of the above categories

        Return ONLY the document type as a single word (e.g., "portfolio_statement") with no additional text.
        """

        # Call API
        try:
            response = self._call_vision_api(prompt, image_paths[:2])  # Use first 2 pages

            # Clean response
            response = response.strip().lower()

            # Extract document type
            valid_types = [
                "portfolio_statement",
                "bank_statement",
                "annual_report",
                "quarterly_report",
                "tax_document",
                "invoice",
                "interactive_brokers_statement",
                "other"
            ]

            for doc_type in valid_types:
                if doc_type in response:
                    return doc_type

            # If no valid type found, return the response if it's a single word
            if len(response.split()) == 1 and len(response) > 3:
                return response

            # Default to unknown
            return "unknown"
        except Exception as e:
            logger.error(f"Error identifying document type with RAG: {e}")
            return "unknown"

    def _extract_financial_data(self, document_type: str, text: str, image_paths: List[str]) -> Dict[str, Any]:
        """
        Extract financial data based on document type.

        Args:
            document_type: Document type
            text: OCR text
            image_paths: List of image paths

        Returns:
            Dictionary with extracted financial data
        """
        logger.info(f"Extracting financial data for {document_type} with RAG")

        # Skip if no API
        if not self.api_type:
            return {}

        # Prepare prompt based on document type
        if document_type == "portfolio_statement":
            prompt = self._get_portfolio_statement_prompt(text)
        elif document_type == "bank_statement":
            prompt = self._get_bank_statement_prompt(text)
        elif document_type in ["annual_report", "quarterly_report"]:
            prompt = self._get_company_report_prompt(text, document_type)
        elif document_type == "interactive_brokers_statement":
            prompt = self._get_interactive_brokers_prompt(text)
        else:
            prompt = self._get_generic_financial_prompt(text)

        # Call API
        try:
            response = self._call_vision_api(prompt, image_paths)

            # Parse response
            result = self._parse_json_from_response(response)

            if result:
                logger.info(f"Successfully extracted financial data for {document_type}")
                return result
        except Exception as e:
            logger.error(f"Error extracting financial data with RAG: {e}")

        return {}

    def _get_portfolio_statement_prompt(self, text: str) -> str:
        """
        Get prompt for portfolio statement analysis.

        Args:
            text: OCR text

        Returns:
            Prompt text
        """
        return f"""
        You are a financial document analysis expert. I need you to extract key information from this portfolio statement.

        Please analyze the document and extract the following information in JSON format:

        1. total_value: The total portfolio value as a number (without currency symbol)
        2. currency: The currency of the portfolio (e.g., USD, EUR, GBP)
        3. securities: An array of securities with the following properties for each:
           - name: The name of the security
           - identifier: The ISIN, CUSIP, or other identifier if available
           - quantity: The quantity held
           - value: The value of the holding as a number
           - weight: The percentage weight in the portfolio if available
        4. asset_allocation: An object with asset classes as keys and objects with 'value' and 'weight' as values
        5. metrics: Any other relevant metrics found in the document

        Return the results in JSON format.
        """

    def _get_bank_statement_prompt(self, text: str) -> str:
        """
        Get prompt for bank statement analysis.

        Args:
            text: OCR text

        Returns:
            Prompt text
        """
        return f"""
        You are a financial document analysis expert. I need you to extract key information from this bank statement.

        Please analyze the document and extract the following information in JSON format:

        1. account_number: The account number (mask all but last 4 digits)
        2. account_holder: The name of the account holder
        3. statement_period: The period covered by the statement
        4. opening_balance: The opening balance as a number
        5. closing_balance: The closing balance as a number
        6. currency: The currency of the account
        7. transactions: An array of transactions with the following properties for each:
           - date: The transaction date
           - description: The transaction description
           - amount: The transaction amount as a number
           - type: 'credit' or 'debit'

        Return the results in JSON format.
        """

    def _get_company_report_prompt(self, text: str, report_type: str) -> str:
        """
        Get prompt for company report analysis.

        Args:
            text: OCR text
            report_type: Report type (annual_report or quarterly_report)

        Returns:
            Prompt text
        """
        period = "year" if report_type == "annual_report" else "quarter"

        return f"""
        You are a financial document analysis expert. I need you to extract key information from this {report_type}.

        Please analyze the document and extract the following information in JSON format:

        1. company_name: The name of the company
        2. report_period: The {period} covered by the report
        3. currency: The currency used in the report
        4. financial_highlights: An object with key financial metrics
        5. income_statement: An object with key income statement items
        6. balance_sheet: An object with key balance sheet items
        7. cash_flow: An object with key cash flow items

        For each financial statement, include the current period and the previous period for comparison if available.

        Return the results in JSON format.
        """

    def _get_interactive_brokers_prompt(self, text: str) -> str:
        """
        Get prompt for Interactive Brokers statement analysis.

        Args:
            text: OCR text

        Returns:
            Prompt text
        """
        return f"""
        You are a financial document analysis expert. I need you to extract key information from this Interactive Brokers statement.

        Please analyze the document and extract the following information in JSON format:

        1. account_number: The account number (mask all but last 4 digits)
        2. account_holder: The name of the account holder
        3. statement_period: The period covered by the statement
        4. net_asset_value: The net asset value as a number
        5. currency: The base currency of the account
        6. securities: An array of securities with the following properties for each:
           - symbol: The ticker symbol
           - name: The name of the security
           - quantity: The quantity held
           - price: The price per unit
           - value: The total value
           - currency: The currency of the security
        7. cash_balance: The cash balance
        8. trades: An array of trades executed during the period
        9. dividends: An array of dividends received during the period
        10. fees: An array of fees charged during the period

        Return the results in JSON format.
        """

    def _get_generic_financial_prompt(self, text: str) -> str:
        """
        Get prompt for generic financial document analysis.

        Args:
            text: OCR text

        Returns:
            Prompt text
        """
        return f"""
        You are a financial document analysis expert. I need you to extract key financial information from this document.

        Please analyze the document and extract any relevant financial information in JSON format. This may include:

        1. total_value: Any total value mentioned in the document
        2. currency: The currency used in the document
        3. securities: Any securities or investments mentioned
        4. financial_metrics: Any financial metrics or KPIs mentioned
        5. dates: Any relevant dates mentioned
        6. entities: Any companies, organizations, or individuals mentioned
        7. amounts: Any significant financial amounts mentioned

        Return the results in JSON format, organizing the data in a logical structure based on what you find.
        """

    def _merge_financial_data(self, extracted_data: Dict[str, Any], existing_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Merge extracted financial data with existing data.

        Args:
            extracted_data: Newly extracted data
            existing_data: Existing financial data

        Returns:
            Merged financial data
        """
        # Start with existing data
        merged_data = existing_data.copy()

        # Update with extracted data, prioritizing extracted data for overlapping keys
        for key, value in extracted_data.items():
            if key not in merged_data or not merged_data[key]:
                merged_data[key] = value
            elif isinstance(value, dict) and isinstance(merged_data[key], dict):
                # Recursively merge dictionaries
                merged_data[key] = {**merged_data[key], **value}
            elif isinstance(value, list) and isinstance(merged_data[key], list):
                # For lists, we need to be careful about duplicates
                if key == "securities":
                    # For securities, merge by identifier
                    merged_securities = merged_data[key].copy()
                    extracted_identifiers = [s.get("identifier") or s.get("isin") or s.get("symbol") for s in value]

                    # Remove existing securities that are in the extracted data
                    merged_securities = [s for s in merged_securities if (s.get("identifier") or s.get("isin") or s.get("symbol")) not in extracted_identifiers]

                    # Add extracted securities
                    merged_securities.extend(value)
                    merged_data[key] = merged_securities
                else:
                    # For other lists, just combine and remove duplicates if they have 'id' or 'name'
                    merged_list = merged_data[key].copy()
                    for item in value:
                        if isinstance(item, dict) and ("id" in item or "name" in item):
                            # Check if item already exists
                            exists = False
                            for existing_item in merged_list:
                                if isinstance(existing_item, dict):
                                    if ("id" in item and "id" in existing_item and item["id"] == existing_item["id"]) or \
                                       ("name" in item and "name" in existing_item and item["name"] == existing_item["name"]):
                                        exists = True
                                        break
                            if not exists:
                                merged_list.append(item)
                        else:
                            merged_list.append(item)
                    merged_data[key] = merged_list
            else:
                # For other types, prefer extracted data if it's not empty
                if value:
                    merged_data[key] = value

        return merged_data

    def _extract_financial_statements(self, document_type: str, text: str, image_paths: List[str]) -> List[Dict[str, Any]]:
        """
        Extract financial statements from the document.

        Args:
            document_type: Document type
            text: OCR text
            image_paths: List of image paths

        Returns:
            List of financial statements
        """
        logger.info(f"Extracting financial statements for {document_type} with RAG")

        # Skip if no API
        if not self.api_type:
            return []

        # Only extract financial statements for certain document types
        if document_type not in ["annual_report", "quarterly_report"]:
            return []

        # Prepare prompt
        prompt = f"""
        You are a financial document analysis expert. I need you to extract financial statements from this {document_type}.

        Please analyze the document and extract the following financial statements in JSON format:

        1. income_statement: The income statement with line items and values
        2. balance_sheet: The balance sheet with line items and values
        3. cash_flow_statement: The cash flow statement with line items and values

        For each statement, include:
        - type: The statement type (e.g., 'income_statement')
        - period: The period covered
        - data: An array of line items, each with:
          - name: The name of the line item
          - values: An array of values for different periods, each with:
            - period: The period (e.g., '2023', '2022')
            - value: The value as a number

        Return the results in JSON format.
        """

        # Call API
        try:
            response = self._call_vision_api(prompt, image_paths)

            # Parse response
            result = self._parse_json_from_response(response)

            if result:
                statements = []

                # Extract statements
                for statement_type in ["income_statement", "balance_sheet", "cash_flow_statement"]:
                    if statement_type in result:
                        statement_data = result[statement_type]

                        # Ensure proper structure
                        if isinstance(statement_data, dict):
                            statement = {
                                "type": statement_type,
                                "period": statement_data.get("period", ""),
                                "data": statement_data.get("data", [])
                            }
                            statements.append(statement)
                        elif isinstance(statement_data, list):
                            statement = {
                                "type": statement_type,
                                "period": "",
                                "data": statement_data
                            }
                            statements.append(statement)

                logger.info(f"Successfully extracted {len(statements)} financial statements")
                return statements
        except Exception as e:
            logger.error(f"Error extracting financial statements with RAG: {e}")

        return []
