
import fitz
import json
import sys
import os

def extract_metadata_from_pdf(pdf_path):
    try:
        # Check if the file exists
        if not os.path.exists(pdf_path):
            return {
                "success": False,
                "error": f"File not found: {pdf_path}"
            }

        # Open the PDF
        doc = fitz.open(pdf_path)

        # Extract metadata
        metadata = doc.metadata

        # Extract additional information
        info = {
            "page_count": len(doc),
            "file_size": os.path.getsize(pdf_path),
            "is_encrypted": doc.is_encrypted,
            "permissions": doc.permissions
        }

        # Extract form fields if present
        form_fields = []
        for page in doc:
            fields = page.widgets()
            for field in fields:
                form_fields.append({
                    "name": field.field_name,
                    "type": field.field_type,
                    "value": field.field_value
                })

        # Extract links
        links = []
        for page_num, page in enumerate(doc):
            page_links = page.get_links()
            for link in page_links:
                link_info = {
                    "page": page_num + 1,
                    "type": link.get("kind", "")
                }

                if "uri" in link:
                    link_info["uri"] = link["uri"]
                elif "page" in link:
                    link_info["target_page"] = link["page"] + 1

                links.append(link_info)

        # Close the document
        doc.close()

        return {
            "success": True,
            "metadata": metadata,
            "info": info,
            "form_fields": form_fields,
            "links": links
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

    result = extract_metadata_from_pdf(pdf_path)
    print(json.dumps(result))
