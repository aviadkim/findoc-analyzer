"""
Test script for FinDocRAG backend.
"""
import os
import sys

def test_imports():
    """Test importing required packages."""
    print("Testing imports...")
    
    try:
        import flask
        print("✓ Flask imported successfully")
    except ImportError:
        print("✗ Failed to import Flask")
    
    try:
        import flask_cors
        print("✓ Flask-CORS imported successfully")
    except ImportError:
        print("✗ Failed to import Flask-CORS")
    
    try:
        import fitz  # PyMuPDF
        print("✓ PyMuPDF imported successfully")
    except ImportError:
        print("✗ Failed to import PyMuPDF")
    
    try:
        import pandas
        print("✓ Pandas imported successfully")
    except ImportError:
        print("✗ Failed to import Pandas")
    
    try:
        import numpy
        print("✓ NumPy imported successfully")
    except ImportError:
        print("✗ Failed to import NumPy")
    
    try:
        import matplotlib
        print("✓ Matplotlib imported successfully")
    except ImportError:
        print("✗ Failed to import Matplotlib")
    
    try:
        import google.generativeai
        print("✓ Google Generative AI imported successfully")
    except ImportError:
        print("✗ Failed to import Google Generative AI")

if __name__ == "__main__":
    print("FinDocRAG Backend Test")
    print("-" * 30)
    print(f"Python version: {sys.version}")
    print("-" * 30)
    
    test_imports()
    
    print("-" * 30)
    print("Test complete!")
