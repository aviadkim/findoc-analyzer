"""
Setup script for the Google Agent technologies integration.
"""
from setuptools import setup, find_packages

setup(
    name="findoc-rag-google-agents",
    version="0.1.0",
    packages=find_packages(),
    install_requires=[
        "flask>=2.0.0",
        "flask-cors>=3.0.0",
        "gunicorn>=20.0.0",
        "google-generativeai>=0.3.0",
        "python-dotenv>=0.19.0",
        "requests>=2.25.0",
        "pydantic>=1.8.0",
        "pymupdf>=1.18.0",
        "pandas>=1.3.0",
        "numpy>=1.20.0",
        "camelot-py>=0.10.0",
        "tabula-py>=2.2.0",
        "opencv-python-headless>=4.5.0",
        "openpyxl>=3.0.0",
    ],
    python_requires=">=3.8",
)
