
import fitz
import json
import sys

def extract_text_from_pdf(pdf_path, use_ocr=False):
    try:
        doc = fitz.open(pdf_path)
        text = ""
        pages = []

        for page_num, page in enumerate(doc):
            page_text = page.get_text()
            text += page_text
            pages.append({
                "page_number": page_num + 1,
                "text": page_text,
                "width": page.rect.width,
                "height": page.rect.height
            })

        doc.close()

        return {
            "success": True,
            "text": text,
            "pages": pages,
            "page_count": len(pages)
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"success": False, "error": "No PDF path provided"}))
        sys.exit(1)

    pdf_path = sys.argv[1]
    use_ocr = len(sys.argv) > 2 and sys.argv[2].lower() == "true"

    result = extract_text_from_pdf(pdf_path, use_ocr)
    print(json.dumps(result))
