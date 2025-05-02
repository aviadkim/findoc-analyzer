# Install enhanced dependencies for improved PDF processing, table extraction, and report generation
# This script installs additional libraries to enhance the financial document processing capabilities

# Set error action preference
$ErrorActionPreference = "Stop"

# Create and activate a virtual environment if it doesn't exist
if (-not (Test-Path "venv")) {
    Write-Host "Creating virtual environment..."
    python -m venv venv
}

# Activate the virtual environment
if ($PSVersionTable.PSVersion.Major -ge 6) {
    # PowerShell Core (6.0+)
    & ./venv/bin/Activate.ps1
} else {
    # Windows PowerShell
    & ./venv/Scripts/Activate.ps1
}

# Install base dependencies
Write-Host "Installing base dependencies..."
pip install -U pip setuptools wheel
pip install pandas numpy tabulate pymupdf fpdf opencv-python pillow google-generativeai

# Install PDF processing and table extraction libraries
Write-Host "Installing PDF processing and table extraction libraries..."
pip install camelot-py[cv] pdfminer.six ghostscript
pip install pytesseract pdf2image

# Install report generation libraries
Write-Host "Installing report generation libraries..."
pip install reportlab

# Install visualization libraries
Write-Host "Installing visualization libraries..."
pip install plotly kaleido

# Install Microsoft's table-transformer (if available)
Write-Host "Installing table-transformer..."
pip install transformers torch torchvision

# Install additional utilities
Write-Host "Installing additional utilities..."
pip install tqdm requests beautifulsoup4

# Check if Tesseract OCR is installed
try {
    $tesseractVersion = tesseract --version
    Write-Host "Tesseract OCR is installed: $tesseractVersion"
} catch {
    Write-Host "Tesseract OCR is not installed."
    Write-Host "Please install Tesseract OCR from https://github.com/UB-Mannheim/tesseract/wiki"
    Write-Host "After installation, make sure it's added to your PATH."
}

# Check if Ghostscript is installed
try {
    $ghostscriptVersion = gswin64c --version
    Write-Host "Ghostscript is installed: $ghostscriptVersion"
} catch {
    Write-Host "Ghostscript is not installed."
    Write-Host "Please install Ghostscript from https://www.ghostscript.com/download/gsdnld.html"
    Write-Host "After installation, make sure it's added to your PATH."
}

Write-Host "Installation complete!"
Write-Host "You can now use the enhanced PDF processing, table extraction, and report generation capabilities."
