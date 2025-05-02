"""
Script to extract ISINs from a PDF file using RAG.
"""
import os
import sys
import json
import base64
import requests
import re
from PIL import Image

def extract_isins(pdf_path, output_dir=None, api_key=None):
    """Extract ISINs from a PDF file using RAG."""
    print(f"\n=== Extracting ISINs from {pdf_path} ===")
    
    # Check if PDF file exists
    if not os.path.exists(pdf_path):
        print(f"Error: PDF file '{pdf_path}' not found.")
        return False
    
    # Create output directory
    if not output_dir:
        output_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'isin_output')
    
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
    
    # Extract ISINs using regex
    isin_pattern = r'[A-Z]{2}[A-Z0-9]{10}'
    regex_isins = re.findall(isin_pattern, text)
    
    print(f"\nISINs found using regex: {len(regex_isins)}")
    if regex_isins:
        print("ISINs:")
        for i, isin in enumerate(regex_isins):
            print(f"  {i+1}. {isin}")
    
    # Extract ISINs using RAG
    if api_key:
        print("\nExtracting ISINs using RAG...")
        
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
        You are a financial document analysis expert. I need you to extract all ISIN codes from this document.
        
        ISINs are 12-character alphanumeric codes that uniquely identify securities. They consist of:
        - A two-letter country code (e.g., US, DE, FR)
        - A nine-character alphanumeric national security identifier
        - A single check digit
        
        Examples of ISINs: US0378331005, DE0007100000, FR0000131104
        
        Please analyze the document and extract ALL ISIN codes you can find. Return them as a JSON array of strings.
        Be thorough and look through all tables, footnotes, and text in the document.
        
        Return ONLY the JSON array of ISINs, nothing else.
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
        data = {
            "model": "anthropic/claude-3-opus-20240229" if is_openrouter else "gpt-4-vision-preview",
            "messages": messages,
            "max_tokens": 4096,
            "temperature": 0.2
        }
        
        # Call API
        api_url = "https://openrouter.ai/api/v1/chat/completions" if is_openrouter else "https://api.openai.com/v1/chat/completions"
        
        try:
            response = requests.post(
                api_url,
                headers=headers,
                json=data
            )
            
            if response.status_code == 200:
                result = response.json()
                response_text = result["choices"][0]["message"]["content"]
                
                # Parse JSON from response
                try:
                    # Extract JSON from response
                    json_match = re.search(r'```json\n(.*?)\n```', response_text, re.DOTALL)
                    
                    if json_match:
                        json_str = json_match.group(1)
                    else:
                        # Try to find JSON without markdown
                        json_match = re.search(r'(\[.*\])', response_text, re.DOTALL)
                        
                        if json_match:
                            json_str = json_match.group(1)
                        else:
                            json_str = response_text
                    
                    # Parse JSON
                    rag_isins = json.loads(json_str)
                    
                    print(f"\nISINs found using RAG: {len(rag_isins)}")
                    if rag_isins:
                        print("ISINs:")
                        for i, isin in enumerate(rag_isins):
                            print(f"  {i+1}. {isin}")
                    
                    # Save results to file
                    results = {
                        "regex_isins": regex_isins,
                        "rag_isins": rag_isins,
                        "total_isins": list(set(regex_isins + rag_isins))
                    }
                    
                    results_file = os.path.join(output_dir, "isin_results.json")
                    with open(results_file, "w", encoding="utf-8") as f:
                        json.dump(results, f, indent=2, ensure_ascii=False)
                    
                    print(f"\nResults saved to: {results_file}")
                    
                    return True
                except Exception as e:
                    print(f"Error parsing JSON from response: {e}")
                    print(f"Response text: {response_text}")
            else:
                print(f"API error: {response.status_code} {response.text}")
        except Exception as e:
            print(f"Error calling API: {e}")
    
    return False

if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description="Extract ISINs from a PDF file")
    parser.add_argument("pdf_path", help="Path to the PDF file")
    parser.add_argument("--output", help="Output directory for results")
    parser.add_argument("--api-key", help="API key for OpenAI or OpenRouter")
    args = parser.parse_args()
    
    extract_isins(args.pdf_path, args.output, args.api_key)
