# PowerShell script to run the agent system

# Set the Gemini API key
$env:GEMINI_API_KEY = "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"

# Set the paths
$scriptPath = $PSScriptRoot
$agentSystemScript = Join-Path -Path $scriptPath -ChildPath "run_agent_system.py"

# Display welcome message
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "  Running Agent System for FinDocRAG" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "This script runs the agent system to test and document" -ForegroundColor Yellow
Write-Host "the enhanced securities extraction with sequential thinking." -ForegroundColor Yellow
Write-Host ""
Write-Host "The agent system includes:" -ForegroundColor Green
Write-Host "- Coordination Agent: Manages other agents and workflows" -ForegroundColor Green
Write-Host "- Code Testing Agent: Tests code functionality" -ForegroundColor Green
Write-Host "- Documentation Agent: Maintains project documentation" -ForegroundColor Green
Write-Host ""
Write-Host "The agents work together to test the enhanced securities extraction," -ForegroundColor Yellow
Write-Host "document the implementation, and generate an implementation summary." -ForegroundColor Yellow
Write-Host ""

# Check if the script exists
if (-not (Test-Path -Path $agentSystemScript)) {
    Write-Error "Agent system script not found at $agentSystemScript"
    exit 1
}

# Run the agent system
Write-Host "Running agent system..." -ForegroundColor Cyan
python $agentSystemScript

# Check if the agent system was successful
if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "Agent system completed successfully!" -ForegroundColor Green
    
    # Check if documentation was generated
    $docsPath = Join-Path -Path $scriptPath -ChildPath "docs\documentation.md"
    if (Test-Path -Path $docsPath) {
        Write-Host ""
        Write-Host "Documentation generated at:" -ForegroundColor Green
        Write-Host $docsPath -ForegroundColor Yellow
    }
} else {
    Write-Host ""
    Write-Host "Agent system failed with exit code $LASTEXITCODE" -ForegroundColor Red
}
