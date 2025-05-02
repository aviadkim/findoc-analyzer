# FinDoc Analyzer Master Testing Script
# This script runs all the test scripts and generates a comprehensive report

# Configuration
$outputDir = Join-Path $PSScriptRoot "test_results"
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$masterLogFile = Join-Path $outputDir "master_test_$timestamp.log"
$reportFile = Join-Path $outputDir "master_test_report_$timestamp.html"

# Create output directory if it doesn't exist
if (-not (Test-Path -Path $outputDir)) {
    New-Item -ItemType Directory -Path $outputDir | Out-Null
}

# Create test documents directory if it doesn't exist
$testDocumentsDir = Join-Path $PSScriptRoot "test_documents"
if (-not (Test-Path -Path $testDocumentsDir)) {
    New-Item -ItemType Directory -Path $testDocumentsDir | Out-Null
}

# Initialize test results
$masterResults = @{
    startTime = Get-Date -Format "yyyy-MM-ddTHH:mm:ss"
    endTime = $null
    tests = @()
    summary = @{
        total = 0
        passed = 0
        failed = 0
        skipped = 0
    }
    categories = @{
        auth = @{
            total = 0
            passed = 0
            failed = 0
            skipped = 0
        }
        documents = @{
            total = 0
            passed = 0
            failed = 0
            skipped = 0
        }
        analytics = @{
            total = 0
            passed = 0
            failed = 0
            skipped = 0
        }
        chat = @{
            total = 0
            passed = 0
            failed = 0
            skipped = 0
        }
    }
}

# Helper function to log messages
function Log-Message {
    param (
        [string]$message
    )
    
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logEntry = "$timestamp - $message"
    
    Write-Host $logEntry
    Add-Content -Path $masterLogFile -Value $logEntry
}

# Helper function to run a test script
function Run-TestScript {
    param (
        [string]$scriptPath,
        [string]$category
    )
    
    $scriptName = [System.IO.Path]::GetFileNameWithoutExtension($scriptPath)
    
    Log-Message "Running $scriptName..."
    
    # Run the test script
    & $scriptPath
    
    # Get the latest test results file for this category
    $latestResultsFile = Get-ChildItem -Path $outputDir -Filter "${category}_test_results_*.json" | Sort-Object LastWriteTime -Descending | Select-Object -First 1
    
    if ($latestResultsFile) {
        $resultsPath = $latestResultsFile.FullName
        Log-Message "Processing results from $resultsPath"
        
        # Read the test results
        $results = Get-Content -Path $resultsPath | ConvertFrom-Json
        
        # Update master results
        foreach ($test in $results.tests) {
            $masterResults.tests += $test
            $masterResults.summary.total++
            $masterResults.categories.$category.total++
            
            if ($test.status -eq "passed") {
                $masterResults.summary.passed++
                $masterResults.categories.$category.passed++
            } elseif ($test.status -eq "failed") {
                $masterResults.summary.failed++
                $masterResults.categories.$category.failed++
            } elseif ($test.status -eq "skipped") {
                $masterResults.summary.skipped++
                $masterResults.categories.$category.skipped++
            }
        }
        
        Log-Message "$scriptName completed with $($results.summary.passed) passed, $($results.summary.failed) failed, $($results.summary.skipped) skipped"
    } else {
        Log-Message "No results file found for $scriptName"
    }
}

# Helper function to generate HTML report
function Generate-HtmlReport {
    $totalPassedPercentage = if ($masterResults.summary.total -gt 0) {
        [math]::Round(($masterResults.summary.passed / $masterResults.summary.total) * 100)
    } else {
        0
    }
    
    $authPassedPercentage = if ($masterResults.categories.auth.total -gt 0) {
        [math]::Round(($masterResults.categories.auth.passed / $masterResults.categories.auth.total) * 100)
    } else {
        0
    }
    
    $documentsPassedPercentage = if ($masterResults.categories.documents.total -gt 0) {
        [math]::Round(($masterResults.categories.documents.passed / $masterResults.categories.documents.total) * 100)
    } else {
        0
    }
    
    $analyticsPassedPercentage = if ($masterResults.categories.analytics.total -gt 0) {
        [math]::Round(($masterResults.categories.analytics.passed / $masterResults.categories.analytics.total) * 100)
    } else {
        0
    }
    
    $chatPassedPercentage = if ($masterResults.categories.chat.total -gt 0) {
        [math]::Round(($masterResults.categories.chat.passed / $masterResults.categories.chat.total) * 100)
    } else {
        0
    }
    
    $html = @"
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>FinDoc Analyzer Master Test Report</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
      color: #333;
    }
    h1, h2, h3 {
      color: #2c3e50;
    }
    .summary {
      display: flex;
      justify-content: space-between;
      background-color: #f8f9fa;
      padding: 20px;
      border-radius: 5px;
      margin-bottom: 20px;
    }
    .summary-item {
      text-align: center;
    }
    .summary-value {
      font-size: 24px;
      font-weight: bold;
    }
    .progress-bar {
      height: 20px;
      background-color: #e9ecef;
      border-radius: 10px;
      margin-bottom: 20px;
      overflow: hidden;
    }
    .progress {
      height: 100%;
      background-color: #4caf50;
      width: ${totalPassedPercentage}%;
    }
    .category {
      margin-bottom: 30px;
      border: 1px solid #ddd;
      border-radius: 5px;
      overflow: hidden;
    }
    .category-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 15px;
      background-color: #f8f9fa;
      border-bottom: 1px solid #ddd;
    }
    .category-title {
      margin: 0;
      font-size: 18px;
    }
    .category-stats {
      display: flex;
      gap: 15px;
    }
    .category-stat {
      text-align: center;
    }
    .category-progress {
      height: 10px;
      background-color: #e9ecef;
      border-radius: 5px;
      margin: 0 15px 15px;
      overflow: hidden;
    }
    .category-progress-bar {
      height: 100%;
      background-color: #4caf50;
    }
    .test-list {
      list-style: none;
      padding: 0;
      margin: 0;
    }
    .test-item {
      padding: 15px;
      border-bottom: 1px solid #ddd;
    }
    .test-item:last-child {
      border-bottom: none;
    }
    .test-passed {
      border-left: 5px solid #4caf50;
    }
    .test-failed {
      border-left: 5px solid #f44336;
    }
    .test-skipped {
      border-left: 5px solid #ffc107;
    }
    .test-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 5px;
    }
    .test-name {
      font-weight: bold;
      margin: 0;
    }
    .test-status {
      padding: 3px 8px;
      border-radius: 3px;
      font-size: 12px;
      font-weight: bold;
    }
    .status-passed {
      background-color: #e8f5e9;
      color: #2e7d32;
    }
    .status-failed {
      background-color: #ffebee;
      color: #c62828;
    }
    .status-skipped {
      background-color: #fff8e1;
      color: #f57f17;
    }
    .test-details {
      margin-top: 10px;
      font-family: monospace;
      white-space: pre-wrap;
      background-color: rgba(0,0,0,0.05);
      padding: 10px;
      border-radius: 3px;
      font-size: 12px;
    }
    .timestamp {
      color: #7f8c8d;
      font-size: 0.9em;
    }
    .collapsible {
      cursor: pointer;
    }
    .content {
      display: none;
      overflow: hidden;
    }
    .issues-summary {
      margin-top: 30px;
      padding: 20px;
      background-color: #f8f9fa;
      border-radius: 5px;
    }
    .issue {
      margin-bottom: 15px;
      padding-bottom: 15px;
      border-bottom: 1px solid #ddd;
    }
    .issue:last-child {
      margin-bottom: 0;
      padding-bottom: 0;
      border-bottom: none;
    }
    .issue-title {
      font-weight: bold;
      color: #c62828;
    }
  </style>
</head>
<body>
  <h1>FinDoc Analyzer Master Test Report</h1>
  <p>
    <strong>Start Time:</strong> $($masterResults.startTime)<br>
    <strong>End Time:</strong> $($masterResults.endTime)<br>
    <strong>Duration:</strong> $([math]::Round((New-TimeSpan -Start (Get-Date $masterResults.startTime) -End (Get-Date $masterResults.endTime)).TotalMinutes, 2)) minutes
  </p>
  
  <div class="summary">
    <div class="summary-item">
      <div class="summary-value">$($masterResults.summary.total)</div>
      <div>Total Tests</div>
    </div>
    <div class="summary-item">
      <div class="summary-value" style="color: #4caf50;">$($masterResults.summary.passed)</div>
      <div>Passed</div>
    </div>
    <div class="summary-item">
      <div class="summary-value" style="color: #f44336;">$($masterResults.summary.failed)</div>
      <div>Failed</div>
    </div>
    <div class="summary-item">
      <div class="summary-value" style="color: #ffc107;">$($masterResults.summary.skipped)</div>
      <div>Skipped</div>
    </div>
    <div class="summary-item">
      <div class="summary-value">$totalPassedPercentage%</div>
      <div>Success Rate</div>
    </div>
  </div>
  
  <div class="progress-bar">
    <div class="progress"></div>
  </div>
  
  <h2>Test Categories</h2>
  
  <!-- Authentication Category -->
  <div class="category">
    <div class="category-header collapsible" onclick="toggleCategory('auth')">
      <h3 class="category-title">Authentication and User Management</h3>
      <div class="category-stats">
        <div class="category-stat">
          <div>Total: $($masterResults.categories.auth.total)</div>
        </div>
        <div class="category-stat" style="color: #4caf50;">
          <div>Passed: $($masterResults.categories.auth.passed)</div>
        </div>
        <div class="category-stat" style="color: #f44336;">
          <div>Failed: $($masterResults.categories.auth.failed)</div>
        </div>
        <div class="category-stat" style="color: #ffc107;">
          <div>Skipped: $($masterResults.categories.auth.skipped)</div>
        </div>
        <div class="category-stat">
          <div>$authPassedPercentage%</div>
        </div>
      </div>
    </div>
    <div class="category-progress">
      <div class="category-progress-bar" style="width: ${authPassedPercentage}%;"></div>
    </div>
    <div class="content" id="auth-content">
      <ul class="test-list">
$(
  $authTests = $masterResults.tests | Where-Object { $_.name -match "User|Login|Register|Password|Profile|Authentication" }
  $authTestsHtml = foreach ($test in $authTests) {
    @"
        <li class="test-item test-$($test.status)">
          <div class="test-header">
            <h4 class="test-name">$($test.name)</h4>
            <span class="test-status status-$($test.status)">$($test.status.ToUpper())</span>
          </div>
          <div class="timestamp">Timestamp: $($test.timestamp)</div>
          $(if ($test.details) { "<div class='test-details'>$($test.details)</div>" })
        </li>
"@
  }
  $authTestsHtml -join "`n"
)
      </ul>
    </div>
  </div>
  
  <!-- Document Processing Category -->
  <div class="category">
    <div class="category-header collapsible" onclick="toggleCategory('documents')">
      <h3 class="category-title">Document Processing</h3>
      <div class="category-stats">
        <div class="category-stat">
          <div>Total: $($masterResults.categories.documents.total)</div>
        </div>
        <div class="category-stat" style="color: #4caf50;">
          <div>Passed: $($masterResults.categories.documents.passed)</div>
        </div>
        <div class="category-stat" style="color: #f44336;">
          <div>Failed: $($masterResults.categories.documents.failed)</div>
        </div>
        <div class="category-stat" style="color: #ffc107;">
          <div>Skipped: $($masterResults.categories.documents.skipped)</div>
        </div>
        <div class="category-stat">
          <div>$documentsPassedPercentage%</div>
        </div>
      </div>
    </div>
    <div class="category-progress">
      <div class="category-progress-bar" style="width: ${documentsPassedPercentage}%;"></div>
    </div>
    <div class="content" id="documents-content">
      <ul class="test-list">
$(
  $documentTests = $masterResults.tests | Where-Object { $_.name -match "Document|Upload|Process|Scan1|Content|Metadata" }
  $documentTestsHtml = foreach ($test in $documentTests) {
    @"
        <li class="test-item test-$($test.status)">
          <div class="test-header">
            <h4 class="test-name">$($test.name)</h4>
            <span class="test-status status-$($test.status)">$($test.status.ToUpper())</span>
          </div>
          <div class="timestamp">Timestamp: $($test.timestamp)</div>
          $(if ($test.details) { "<div class='test-details'>$($test.details)</div>" })
        </li>
"@
  }
  $documentTestsHtml -join "`n"
)
      </ul>
    </div>
  </div>
  
  <!-- Analytics and Visualization Category -->
  <div class="category">
    <div class="category-header collapsible" onclick="toggleCategory('analytics')">
      <h3 class="category-title">Analytics and Visualization</h3>
      <div class="category-stats">
        <div class="category-stat">
          <div>Total: $($masterResults.categories.analytics.total)</div>
        </div>
        <div class="category-stat" style="color: #4caf50;">
          <div>Passed: $($masterResults.categories.analytics.passed)</div>
        </div>
        <div class="category-stat" style="color: #f44336;">
          <div>Failed: $($masterResults.categories.analytics.failed)</div>
        </div>
        <div class="category-stat" style="color: #ffc107;">
          <div>Skipped: $($masterResults.categories.analytics.skipped)</div>
        </div>
        <div class="category-stat">
          <div>$analyticsPassedPercentage%</div>
        </div>
      </div>
    </div>
    <div class="category-progress">
      <div class="category-progress-bar" style="width: ${analyticsPassedPercentage}%;"></div>
    </div>
    <div class="content" id="analytics-content">
      <ul class="test-list">
$(
  $analyticsTests = $masterResults.tests | Where-Object { $_.name -match "Portfolio|Chart|Visualization|Report|Securities|Analysis|Performance|Risk" }
  $analyticsTestsHtml = foreach ($test in $analyticsTests) {
    @"
        <li class="test-item test-$($test.status)">
          <div class="test-header">
            <h4 class="test-name">$($test.name)</h4>
            <span class="test-status status-$($test.status)">$($test.status.ToUpper())</span>
          </div>
          <div class="timestamp">Timestamp: $($test.timestamp)</div>
          $(if ($test.details) { "<div class='test-details'>$($test.details)</div>" })
        </li>
"@
  }
  $analyticsTestsHtml -join "`n"
)
      </ul>
    </div>
  </div>
  
  <!-- Chat and AI Features Category -->
  <div class="category">
    <div class="category-header collapsible" onclick="toggleCategory('chat')">
      <h3 class="category-title">Chat and AI Features</h3>
      <div class="category-stats">
        <div class="category-stat">
          <div>Total: $($masterResults.categories.chat.total)</div>
        </div>
        <div class="category-stat" style="color: #4caf50;">
          <div>Passed: $($masterResults.categories.chat.passed)</div>
        </div>
        <div class="category-stat" style="color: #f44336;">
          <div>Failed: $($masterResults.categories.chat.failed)</div>
        </div>
        <div class="category-stat" style="color: #ffc107;">
          <div>Skipped: $($masterResults.categories.chat.skipped)</div>
        </div>
        <div class="category-stat">
          <div>$chatPassedPercentage%</div>
        </div>
      </div>
    </div>
    <div class="category-progress">
      <div class="category-progress-bar" style="width: ${chatPassedPercentage}%;"></div>
    </div>
    <div class="content" id="chat-content">
      <ul class="test-list">
$(
  $chatTests = $masterResults.tests | Where-Object { $_.name -match "Chat|Message|Gemini|AI|Insight|Recommendation|Summary" }
  $chatTestsHtml = foreach ($test in $chatTests) {
    @"
        <li class="test-item test-$($test.status)">
          <div class="test-header">
            <h4 class="test-name">$($test.name)</h4>
            <span class="test-status status-$($test.status)">$($test.status.ToUpper())</span>
          </div>
          <div class="timestamp">Timestamp: $($test.timestamp)</div>
          $(if ($test.details) { "<div class='test-details'>$($test.details)</div>" })
        </li>
"@
  }
  $chatTestsHtml -join "`n"
)
      </ul>
    </div>
  </div>
  
  <h2>Issues Summary</h2>
  <div class="issues-summary">
$(
  $failedTests = $masterResults.tests | Where-Object { $_.status -eq "failed" }
  if ($failedTests.Count -gt 0) {
    $issuesHtml = foreach ($test in $failedTests) {
      @"
    <div class="issue">
      <div class="issue-title">$($test.name)</div>
      <div class="issue-details">$($test.details)</div>
    </div>
"@
    }
    $issuesHtml -join "`n"
  } else {
    "<p>No issues found.</p>"
  }
)
  </div>
  
  <script>
    function toggleCategory(category) {
      var content = document.getElementById(category + "-content");
      if (content.style.display === "block") {
        content.style.display = "none";
      } else {
        content.style.display = "block";
      }
    }
  </script>
</body>
</html>
"@
    
    $html | Set-Content -Path $reportFile
    Log-Message "HTML report generated at $reportFile"
}

# Main function
function Run-AllTests {
    Log-Message "Starting FinDoc Analyzer Master Testing Script"
    
    # Check if test document exists, if not, create a sample one
    $testDocumentPath = Join-Path $testDocumentsDir "messos_portfolio.pdf"
    if (-not (Test-Path -Path $testDocumentPath)) {
        Log-Message "Test document not found. Please create a test document at $testDocumentPath"
    }
    
    # Run authentication tests
    $authTestScript = Join-Path $PSScriptRoot "test-auth.ps1"
    Run-TestScript -scriptPath $authTestScript -category "auth"
    
    # Run document processing tests
    $documentsTestScript = Join-Path $PSScriptRoot "test-documents.ps1"
    Run-TestScript -scriptPath $documentsTestScript -category "documents"
    
    # Run analytics tests
    $analyticsTestScript = Join-Path $PSScriptRoot "test-analytics.ps1"
    Run-TestScript -scriptPath $analyticsTestScript -category "analytics"
    
    # Run chat tests
    $chatTestScript = Join-Path $PSScriptRoot "test-chat.ps1"
    Run-TestScript -scriptPath $chatTestScript -category "chat"
    
    # Set end time
    $masterResults.endTime = Get-Date -Format "yyyy-MM-ddTHH:mm:ss"
    
    # Generate HTML report
    Generate-HtmlReport
    
    # Print summary
    Log-Message "`nTest Summary:"
    Log-Message "Total: $($masterResults.summary.total)"
    Log-Message "Passed: $($masterResults.summary.passed)"
    Log-Message "Failed: $($masterResults.summary.failed)"
    Log-Message "Skipped: $($masterResults.summary.skipped)"
    
    $successRate = if ($masterResults.summary.total -gt 0) {
        [math]::Round(($masterResults.summary.passed / $masterResults.summary.total) * 100)
    } else {
        0
    }
    
    Log-Message "Success Rate: $successRate%"
    
    # Open the HTML report
    Start-Process $reportFile
}

# Run all tests
Run-AllTests
