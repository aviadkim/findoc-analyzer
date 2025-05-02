Write-Host "===================================================
Testing PyMuPDF Installation
==================================================="

# Create a virtual environment if it doesn't exist
if (-not (Test-Path ".\venv")) {
    Write-Host "Creating virtual environment..."
    python -m venv venv
}

# Activate the virtual environment
Write-Host "Activating virtual environment..."
.\venv\Scripts\Activate.ps1

# Install PyMuPDF if not already installed
Write-Host "Installing PyMuPDF..."
pip install pymupdf

# Run the test script
Write-Host "Running PyMuPDF test..."
python test-pymupdf.py

Write-Host "
===================================================
Test Complete!
===================================================

If the test was successful, you can now run the FinDocRAG backend using:
.\run-findoc-rag.ps1

Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
