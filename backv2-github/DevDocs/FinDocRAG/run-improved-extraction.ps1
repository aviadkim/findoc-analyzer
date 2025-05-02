# Run the improved financial document extraction
# This script runs the improved extraction on a financial document

# Get the document path from command line arguments
param (
    [Parameter(Mandatory=$true)]
    [string]$DocumentPath,
    
    [Parameter(Mandatory=$false)]
    [string]$OutputDir = "output",
    
    [Parameter(Mandatory=$false)]
    [switch]$Debug,
    
    [Parameter(Mandatory=$false)]
    [string]$Languages = "eng"
)

# Set the current directory to the script directory
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptDir

# Create the output directory if it doesn't exist
if (-not (Test-Path $OutputDir)) {
    New-Item -ItemType Directory -Path $OutputDir | Out-Null
    Write-Host "Created output directory: $OutputDir"
}

# Build the command
$command = "python test_improved_extraction.py `"$DocumentPath`" --output-dir `"$OutputDir`" --languages $Languages"

if ($Debug) {
    $command += " --debug"
}

# Run the command
Write-Host "Running command: $command"
Invoke-Expression $command
