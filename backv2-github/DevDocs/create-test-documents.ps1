# Create test documents for testing the enhanced processing system
# This script creates test financial documents for testing

param (
    [Parameter(Mandatory=$false)]
    [string]$OutputDir = "test_documents",
    
    [Parameter(Mandatory=$false)]
    [ValidateSet("messos", "goldman", "all")]
    [string]$DocumentType = "all"
)

# Set the current directory to the script directory
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptDir

# Create the output directory if it doesn't exist
$outputPath = Join-Path $scriptDir $OutputDir
if (-not (Test-Path $outputPath)) {
    New-Item -ItemType Directory -Path $outputPath | Out-Null
    Write-Host "Created output directory: $outputPath"
}

# Check if Python is installed
try {
    $pythonVersion = python --version
    Write-Host "Python is installed: $pythonVersion"
}
catch {
    Write-Host "Python is not installed. Please install Python 3.7+ and try again."
    exit 1
}

# Check if fpdf is installed
try {
    python -c "import fpdf" 2>$null
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Installing fpdf..."
        python -m pip install fpdf
    }
}
catch {
    Write-Host "Installing fpdf..."
    python -m pip install fpdf
}

# Run the Python script to create test documents
$pythonScript = Join-Path $scriptDir "FinDocRAG\test_documents\create_test_document.py"
$command = "python `"$pythonScript`" --output-dir `"$outputPath`" --document-type $DocumentType"

Write-Host "Running command: $command"
Invoke-Expression $command

# Display the created documents
Write-Host ""
Write-Host "Created test documents:"
Get-ChildItem -Path $outputPath -Filter "*.pdf" | ForEach-Object {
    Write-Host "- $($_.FullName)"
}
