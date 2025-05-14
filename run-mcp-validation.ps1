# Run MCP validation tools for FinDoc Analyzer

Write-Host "Running MCP validation tools for FinDoc Analyzer..." -ForegroundColor Green

# Create directory for validation results
$resultsDir = "validation-results"
if (-not (Test-Path $resultsDir)) {
    New-Item -ItemType Directory -Path $resultsDir | Out-Null
    Write-Host "Created results directory: $resultsDir" -ForegroundColor Yellow
}

# Run UI validation with Puppeteer
Write-Host "Running UI validation with Puppeteer..." -ForegroundColor Cyan
node test-ui-issues.js

# Run agent testing
Write-Host "Running agent testing..." -ForegroundColor Cyan
node test-agents.js

# Run deployed UI validation
Write-Host "Running deployed UI validation..." -ForegroundColor Cyan
node test-deployed-ui.js

# Generate validation report
Write-Host "Generating validation report..." -ForegroundColor Cyan
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$reportFile = "$resultsDir\validation-report-$timestamp.html"

$reportContent = @"
<!DOCTYPE html>
<html>
<head>
    <title>FinDoc Analyzer Validation Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; }
        h1, h2, h3, h4 { color: #333; }
        .section { margin-bottom: 30px; border: 1px solid #ddd; padding: 20px; border-radius: 5px; }
        .success { color: #4CAF50; }
        .error { color: #F44336; }
        .warning { color: #FFC107; }
        .info { color: #2196F3; }
        .test-result { margin-bottom: 10px; padding: 10px; border-radius: 5px; }
        .test-result.success { background-color: #E8F5E9; }
        .test-result.error { background-color: #FFEBEE; }
        .test-result.warning { background-color: #FFF8E1; }
        .test-result.info { background-color: #E3F2FD; }
        .summary { background-color: #e8f5e9; padding: 15px; border-radius: 5px; margin-bottom: 20px; }
    </style>
</head>
<body>
    <h1>FinDoc Analyzer Validation Report</h1>
    <div class="summary">
        <h2>Validation Summary</h2>
        <p><strong>Timestamp:</strong> $(Get-Date)</p>
        <p><strong>Deployed URL:</strong> <a href="https://backv2-app-326324779592.me-west1.run.app">https://backv2-app-326324779592.me-west1.run.app</a></p>
    </div>
    
    <div class="section">
        <h2>UI Validation Results</h2>
        <p>Check the <code>test-screenshots</code> directory for UI validation screenshots.</p>
    </div>
    
    <div class="section">
        <h2>Agent Testing Results</h2>
        <p>Check the <code>test-agents-results</code> directory for agent testing results.</p>
    </div>
    
    <div class="section">
        <h2>Deployed UI Validation Results</h2>
        <p>Check the <code>validation-results</code> directory for deployed UI validation results.</p>
    </div>
    
    <div class="section">
        <h2>Identified Issues</h2>
        <div class="test-result error">
            <h3>Google Login Button</h3>
            <p>The Google login button is present but clicking it results in an error.</p>
        </div>
        <div class="test-result error">
            <h3>Process Button on Upload Page</h3>
            <p>The process button on the upload page is missing.</p>
        </div>
        <div class="test-result error">
            <h3>Document Chat Send Button</h3>
            <p>The document chat send button is present but clicking it sometimes results in an error.</p>
        </div>
        <div class="test-result error">
            <h3>API Key Management</h3>
            <p>The API keys are not properly configured in the deployed application.</p>
        </div>
        <div class="test-result error">
            <h3>Agent Status</h3>
            <p>Some agents are not active in the deployed application.</p>
        </div>
        <div class="test-result error">
            <h3>Document Processing</h3>
            <p>Document processing is not working correctly in the deployed application.</p>
        </div>
        <div class="test-result error">
            <h3>Document Chat</h3>
            <p>Document chat is not working correctly in the deployed application.</p>
        </div>
    </div>
    
    <div class="section">
        <h2>Next Steps</h2>
        <ol>
            <li>Fix Google Login: Implement proper Google OAuth integration.</li>
            <li>Fix Process Button: Add the process button to the upload page.</li>
            <li>Fix Document Chat: Fix the document chat send button to properly handle clicks.</li>
            <li>Configure API Keys: Properly configure API keys in the deployed application.</li>
            <li>Activate Agents: Ensure all agents are active in the deployed application.</li>
            <li>Fix Document Processing: Fix document processing in the deployed application.</li>
            <li>Fix Document Chat: Fix document chat in the deployed application.</li>
            <li>Comprehensive Testing: Conduct comprehensive testing of all functionality.</li>
        </ol>
    </div>
</body>
</html>
"@

$reportContent | Out-File -FilePath $reportFile -Encoding utf8
Write-Host "Validation report generated: $reportFile" -ForegroundColor Green

# Open the report in the default browser
Start-Process $reportFile

Write-Host "MCP validation tools completed!" -ForegroundColor Green
