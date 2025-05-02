# Run the Messos PDF extraction test
# This script tests the enhanced processing on the Messos PDF

param (
    [Parameter(Mandatory=$false)]
    [string]$OutputDir = "messos_test_output",
    
    [Parameter(Mandatory=$false)]
    [switch]$Debug
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
$command = "python test_messos_extraction.py --output-dir `"$OutputDir`""

if ($Debug) {
    $command += " --debug"
}

# Run the command
Write-Host "Running command: $command"
Invoke-Expression $command
