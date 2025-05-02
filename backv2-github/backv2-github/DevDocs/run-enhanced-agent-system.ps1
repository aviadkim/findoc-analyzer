# Run the enhanced multi-agent system for financial document processing
# This script runs the enhanced multi-agent system on a financial document

param (
    [Parameter(Mandatory=$false)]
    [string]$DocumentPath = "sample",
    
    [Parameter(Mandatory=$false)]
    [string]$OutputDir = "enhanced_agent_output",
    
    [Parameter(Mandatory=$false)]
    [switch]$Debug,
    
    [Parameter(Mandatory=$false)]
    [string]$ApiKey = ""
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
$command = "python FinDocRAG/run_enhanced_agent_system.py `"$DocumentPath`" --output-dir `"$OutputDir`""

if ($Debug) {
    $command += " --debug"
}

if ($ApiKey) {
    $command += " --api-key `"$ApiKey`""
}

# Run the command
Write-Host "Running command: $command"
Invoke-Expression $command
