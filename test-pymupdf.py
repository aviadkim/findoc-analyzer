"""
Test script to verify PyMuPDF installation.
"""
import sys
import fitz  # PyMuPDF

def test_pymupdf():
    """Test PyMuPDF installation."""
    print("PyMuPDF Installation Test")
    print("-" * 30)
    print(f"Python version: {sys.version}")
    print(f"PyMuPDF version: {fitz.version}")
    print(f"PyMuPDF binary version: {fitz.TOOLS.mupdf_version()}")
    print("-" * 30)
    print("PyMuPDF is installed correctly!")
    print("You can now run the FinDocRAG backend.")

if __name__ == "__main__":
    test_pymupdf()
