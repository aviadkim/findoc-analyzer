import fitz  # PyMuPDF

print("PyMuPDF Installation Test")
print("-" * 30)
print(f"PyMuPDF version: {fitz.version}")
print(f"PyMuPDF binary version: {fitz.TOOLS.mupdf_version()}")
print("-" * 30)
print("PyMuPDF is installed correctly!")
print("You can now run the FinDocRAG backend.")
