
import camelot
import json
import sys
import os
import traceback

def extract_tables_from_pdf(pdf_path):
    try:
        # Check if the file exists
        if not os.path.exists(pdf_path):
            return {
                "success": False,
                "error": f"File not found: {pdf_path}"
            }

        # Extract tables using camelot
        try:
            # First try with lattice flavor
            tables = camelot.read_pdf(pdf_path, pages='all', flavor='lattice')

            # If no tables found, try with stream flavor
            if len(tables) == 0:
                print("No tables found with lattice flavor, trying stream flavor...")
                tables = camelot.read_pdf(pdf_path, pages='all', flavor='stream')
        except Exception as e:
            print(f"Error with camelot: {str(e)}")
            # Try with stream flavor if lattice fails
            try:
                tables = camelot.read_pdf(pdf_path, pages='all', flavor='stream')
            except Exception as e2:
                print(f"Error with stream flavor too: {str(e2)}")
                return {
                    "success": False,
                    "error": f"Failed to extract tables: {str(e)} and {str(e2)}"
                }

        result_tables = []

        for i, table in enumerate(tables):
            df = table.df
            headers = df.iloc[0].tolist()
            rows = []

            for _, row in df.iloc[1:].iterrows():
                rows.append(row.tolist())

            result_tables.append({
                "table_id": i + 1,
                "page": table.page,
                "headers": headers,
                "rows": rows,
                "shape": table.shape,
                "accuracy": table.accuracy
            })

        return {
            "success": True,
            "tables": result_tables,
            "table_count": len(result_tables)
        }
    except Exception as e:
        traceback.print_exc()
        return {
            "success": False,
            "error": str(e)
        }

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"success": False, "error": "No PDF path provided"}))
        sys.exit(1)

    pdf_path = sys.argv[1]

    result = extract_tables_from_pdf(pdf_path)
    print(json.dumps(result))
