"""
Simple RAG Agent for financial document processing.
"""
import os
import re
import json
import requests
import logging
from typing import List, Dict, Any, Optional, Tuple
import base64
from PIL import Image

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class SimpleRAGAgent:
    """
    Simple RAG Agent for financial document processing.
    """

    def __init__(self, openai_api_key=None, google_api_key=None, rag_config=None):
        """
        Initialize RAG Agent.

        Args:
            openai_api_key: OpenAI API key
            google_api_key: Google API key
            rag_config: RAG configuration
        """
        self.openai_api_key = openai_api_key
        self.google_api_key = google_api_key

        # Default RAG configuration
        self.rag_config = rag_config or {
            "model": "gpt-4-vision-preview",
            "max_tokens": 4096,
            "temperature": 0.2
        }

        # Determine which API to use
        self.api_type = None
        if self.openai_api_key:
            self.api_type = "openai"
        elif self.google_api_key:
            self.api_type = "google"

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
        os.makedirs(rag_dir, exist_ok=True)

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

        # Extract basic information using RAG
        prompt = f"""
        You are a financial document analysis expert. I need you to extract key information from this document.

        Please analyze the document and extract the following information in JSON format:

        1. document_type: The type of document (e.g., 'portfolio_statement', 'bank_statement', 'annual_report', etc.)
        2. total_value: The total value as a number (without currency symbol)
        3. currency: The currency (e.g., USD, EUR, GBP)
        4. securities: An array of securities with name, identifier (ISIN), quantity, and value
        5. asset_allocation: An object with asset classes as keys and percentage values
        6. isins: An array of all ISIN codes found in the document (ISINs are 12-character alphanumeric codes that uniquely identify securities, e.g., US0378331005)

        Return the results in JSON format.
        """

        # Call API
        try:
            response = self._call_vision_api(prompt, image_paths)

            # Parse response
            result = self._parse_json_from_response(response)

            if result:
                # Create validated data
                validated_data = {
                    "document_type": result.get("document_type", "unknown"),
                    "total_value": result.get("total_value", financial_results["financial_data"].get("total_value", 0)),
                    "currency": result.get("currency", financial_results["financial_data"].get("currency", "USD")),
                    "securities": result.get("securities", financial_results["financial_data"].get("securities", [])),
                    "asset_allocation": result.get("asset_allocation", financial_results["financial_data"].get("asset_allocation", {})),
                    "metrics": financial_results["financial_data"].get("metrics", {}),
                    "isins": result.get("isins", [])
                }
            else:
                # Use existing data if parsing fails
                validated_data = financial_results["financial_data"]
        except Exception as e:
            logger.error(f"Error processing with RAG: {e}")
            validated_data = financial_results["financial_data"]

        # Save results
        with open(os.path.join(rag_dir, "validated_data.json"), "w", encoding="utf-8") as f:
            json.dump(validated_data, f, indent=2, ensure_ascii=False)

        logger.info("RAG validation complete")

        return {
            "validated_data": validated_data,
            "rag_dir": rag_dir
        }

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
        # Check if using OpenRouter
        is_openrouter = self.openai_api_key.startswith("sk-or-")

        # Prepare API request
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {self.openai_api_key}"
        }

        # Add OpenRouter specific headers
        if is_openrouter:
            headers["HTTP-Referer"] = "https://augment.co"
            headers["X-Title"] = "Augment RAG Agent"

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
            "model": "anthropic/claude-3-opus-20240229" if is_openrouter else self.rag_config["model"],
            "messages": messages,
            "max_tokens": self.rag_config["max_tokens"],
            "temperature": self.rag_config["temperature"]
        }

        # Call API
        api_url = "https://openrouter.ai/api/v1/chat/completions" if is_openrouter else "https://api.openai.com/v1/chat/completions"

        response = requests.post(
            api_url,
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
