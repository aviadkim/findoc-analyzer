"""
Script to query specific security details from a PDF file using RAG.
"""
import os
import sys
import json
import base64
import requests
import re
from PIL import Image

def query_security_details(pdf_path, isin, output_dir=None, api_key=None):
    """Query specific security details from a PDF file using RAG."""
    print(f"\n=== Querying details for security {isin} from {pdf_path} ===")

    # Check if PDF file exists
    if not os.path.exists(pdf_path):
        print(f"Error: PDF file '{pdf_path}' not found.")
        return False

    # Create output directory
    if not output_dir:
        output_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'security_output')

    os.makedirs(output_dir, exist_ok=True)

    # Convert PDF to images
    try:
        from pdf2image import convert_from_path
        images = convert_from_path(pdf_path, dpi=150)
    except Exception as e:
        print(f"Error converting PDF to images: {e}")
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
            print(f"Error converting PDF to images with PyMuPDF: {e2}")
            return False

    # Save images
    image_paths = []
    for i, image in enumerate(images):
        image_path = os.path.join(output_dir, f"page_{i+1}.jpg")
        image.save(image_path, "JPEG")
        image_paths.append(image_path)

    # Extract text from PDF
    try:
        import fitz
        doc = fitz.open(pdf_path)
        text = ""
        for page_num in range(len(doc)):
            page = doc.load_page(page_num)
            text += page.get_text()
    except Exception as e:
        print(f"Error extracting text from PDF: {e}")
        text = ""

    # Check if ISIN exists in text
    if isin not in text:
        print(f"Warning: ISIN {isin} not found in text. It might be in an image or table.")

    # Query security details using RAG
    if api_key:
        print("\nQuerying security details using RAG...")

        # Check if using OpenRouter
        is_openrouter = api_key.startswith("sk-or-")

        # Prepare API request
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {api_key}"
        }

        # Add OpenRouter specific headers
        if is_openrouter:
            headers["HTTP-Referer"] = "https://augment.co"
            headers["X-Title"] = "Augment RAG Agent"

        # Prepare prompt
        prompt = f"""
        You are a financial document analysis expert. I need you to find and analyze detailed information about a specific security in this document.

        The security has ISIN: {isin}

        Please find this security in the document and extract the following information:
        1. The full name/description of the security
        2. The valuation (total value) of the position
        3. The actual price per unit
        4. The price date
        5. The quantity/number of units held
        6. Any other relevant details about this security

        Also, please explain:
        - How this security's value contributes to the total portfolio value
        - If there are any calculations involved in determining its value
        - The relationship between the price, quantity, and total value

        Return your analysis in a detailed, structured format.
        """

        # Prepare messages
        messages = [
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": prompt}
                ]
            }
        ]

        # Add images
        for image_path in image_paths:
            with open(image_path, "rb") as image_file:
                base64_image = base64.b64encode(image_file.read()).decode('utf-8')

                messages[0]["content"].append({
                    "type": "image_url",
                    "image_url": {
                        "url": f"data:image/jpeg;base64,{base64_image}"
                    }
                })

        # Prepare data
        if is_openrouter:
            data = {
                "model": "anthropic/claude-3-opus-20240229",
                "messages": messages,
                "max_tokens": 4096,
                "temperature": 0.2
            }
        else:
            data = {
                "model": "gpt-4-vision-preview",
                "messages": messages,
                "max_tokens": 4096,
                "temperature": 0.2
            }

        # Call API
        api_url = "https://openrouter.ai/api/v1/chat/completions" if is_openrouter else "https://api.openai.com/v1/chat/completions"

        try:
            print(f"Calling API: {api_url}")
            print(f"Headers: {headers}")
            print(f"Data: {json.dumps(data, indent=2)}")

            response = requests.post(
                api_url,
                headers=headers,
                json=data
            )

            if response.status_code == 200:
                result = response.json()
                response_text = result["choices"][0]["message"]["content"]

                print("\nSecurity Analysis:")
                print(response_text)

                # Save results to file
                results = {
                    "isin": isin,
                    "analysis": response_text
                }

                results_file = os.path.join(output_dir, f"security_{isin}_analysis.json")
                with open(results_file, "w", encoding="utf-8") as f:
                    json.dump(results, f, indent=2, ensure_ascii=False)

                print(f"\nResults saved to: {results_file}")

                return True
            else:
                print(f"API error: {response.status_code} {response.text}")
        except Exception as e:
            print(f"Error calling API: {e}")

    return False

def query_portfolio_understanding(pdf_path, output_dir=None, api_key=None):
    """Query overall portfolio understanding from a PDF file using RAG."""
    print(f"\n=== Querying portfolio understanding from {pdf_path} ===")

    # Check if PDF file exists
    if not os.path.exists(pdf_path):
        print(f"Error: PDF file '{pdf_path}' not found.")
        return False

    # Create output directory
    if not output_dir:
        output_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'portfolio_output')

    os.makedirs(output_dir, exist_ok=True)

    # Convert PDF to images
    try:
        from pdf2image import convert_from_path
        images = convert_from_path(pdf_path, dpi=150)
    except Exception as e:
        print(f"Error converting PDF to images: {e}")
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
            print(f"Error converting PDF to images with PyMuPDF: {e2}")
            return False

    # Save images
    image_paths = []
    for i, image in enumerate(images):
        image_path = os.path.join(output_dir, f"page_{i+1}.jpg")
        image.save(image_path, "JPEG")
        image_paths.append(image_path)

    # Query portfolio understanding using RAG
    if api_key:
        print("\nQuerying portfolio understanding using RAG...")

        # Check if using OpenRouter
        is_openrouter = api_key.startswith("sk-or-")

        # Prepare API request
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {api_key}"
        }

        # Add OpenRouter specific headers
        if is_openrouter:
            headers["HTTP-Referer"] = "https://augment.co"
            headers["X-Title"] = "Augment RAG Agent"

        # Prepare prompt
        prompt = """
        You are a financial document analysis expert. I need you to analyze this portfolio statement and explain how the total portfolio value is calculated.

        Please analyze the document and explain:

        1. What is the total portfolio value shown on page 2?
        2. How is this total value calculated from all the positions in the portfolio?
        3. Verify if the sum of all individual positions matches the total portfolio value.
        4. Explain any discrepancies or additional calculations involved.
        5. Identify if there are any separate calculations for different asset classes.

        Be specific about the numbers and calculations. Show your work to demonstrate that you understand the relationship between the individual positions and the total value.
        """

        # Prepare messages
        messages = [
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": prompt}
                ]
            }
        ]

        # Add images
        for image_path in image_paths:
            with open(image_path, "rb") as image_file:
                base64_image = base64.b64encode(image_file.read()).decode('utf-8')

                messages[0]["content"].append({
                    "type": "image_url",
                    "image_url": {
                        "url": f"data:image/jpeg;base64,{base64_image}"
                    }
                })

        # Prepare data
        if is_openrouter:
            data = {
                "model": "anthropic/claude-3-opus-20240229",
                "messages": messages,
                "max_tokens": 4096,
                "temperature": 0.2
            }
        else:
            data = {
                "model": "gpt-4-vision-preview",
                "messages": messages,
                "max_tokens": 4096,
                "temperature": 0.2
            }

        # Call API
        api_url = "https://openrouter.ai/api/v1/chat/completions" if is_openrouter else "https://api.openai.com/v1/chat/completions"

        try:
            print(f"Calling API: {api_url}")
            print(f"Headers: {headers}")
            print(f"Data: {json.dumps(data, indent=2)}")

            response = requests.post(
                api_url,
                headers=headers,
                json=data
            )

            if response.status_code == 200:
                result = response.json()
                response_text = result["choices"][0]["message"]["content"]

                print("\nPortfolio Analysis:")
                print(response_text)

                # Save results to file
                results = {
                    "portfolio_analysis": response_text
                }

                results_file = os.path.join(output_dir, "portfolio_analysis.json")
                with open(results_file, "w", encoding="utf-8") as f:
                    json.dump(results, f, indent=2, ensure_ascii=False)

                print(f"\nResults saved to: {results_file}")

                return True
            else:
                print(f"API error: {response.status_code} {response.text}")
        except Exception as e:
            print(f"Error calling API: {e}")

    return False

if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="Query security details from a PDF file")
    parser.add_argument("pdf_path", help="Path to the PDF file")
    parser.add_argument("--isin", help="ISIN of the security to query", default="XS2530201644")
    parser.add_argument("--portfolio", help="Query portfolio understanding instead of security details", action="store_true")
    parser.add_argument("--output", help="Output directory for results")
    parser.add_argument("--api-key", help="API key for OpenAI or OpenRouter")
    args = parser.parse_args()

    if args.portfolio:
        query_portfolio_understanding(args.pdf_path, args.output, args.api_key)
    else:
        query_security_details(args.pdf_path, args.isin, args.output, args.api_key)
