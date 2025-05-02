# Install dependencies for the enhanced financial document processing system
# This script installs all the required Python packages

# Check if Python is installed
try {
    $pythonVersion = python --version
    Write-Host "Python is installed: $pythonVersion"
}
catch {
    Write-Host "Python is not installed. Please install Python 3.7+ and try again."
    exit 1
}

# Install required packages
Write-Host "Installing required packages..."

$packages = @(
    "pandas",
    "numpy",
    "tabulate",
    "pymupdf",
    "fpdf",
    "opencv-python",
    "pillow",
    "google-generativeai"
)

foreach ($package in $packages) {
    Write-Host "Installing $package..."
    python -m pip install $package
}

# Check if Tesseract OCR is installed
try {
    $tesseractVersion = tesseract --version
    Write-Host "Tesseract OCR is installed: $tesseractVersion"
}
catch {
    Write-Host "Tesseract OCR is not installed."
    Write-Host "Please install Tesseract OCR from https://github.com/UB-Mannheim/tesseract/wiki"
    Write-Host "After installation, make sure it's added to your PATH."
}

Write-Host "Installation complete!"
Write-Host "You can now run the enhanced financial document processing system using:"
Write-Host ".\run-enhanced-agent-system.ps1"
