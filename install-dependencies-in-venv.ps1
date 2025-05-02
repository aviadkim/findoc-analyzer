Write-Host "===================================================
Installing Dependencies in Virtual Environment
==================================================="

# Create a virtual environment if it doesn't exist
if (-not (Test-Path ".\venv")) {
    Write-Host "Creating virtual environment..."
    python -m venv venv
}

# Activate the virtual environment
Write-Host "Activating virtual environment..."
.\venv\Scripts\Activate.ps1

# Install required packages
Write-Host "Installing required packages..."
pip install flask flask-cors pymupdf pandas numpy matplotlib google-generativeai

Write-Host "
===================================================
Installation Complete!
===================================================

The following packages have been installed in the virtual environment:
- Flask (for the web server)
- Flask-CORS (for cross-origin requests)
- PyMuPDF (for PDF processing)
- Pandas (for data manipulation)
- NumPy (for numerical operations)
- Matplotlib (for visualization)
- Google Generative AI (for Gemini API)

You can now run the FinDocRAG backend using:
.\run-findoc-rag.ps1

Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
