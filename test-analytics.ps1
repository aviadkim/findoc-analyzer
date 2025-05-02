# FinDoc Analyzer Analytics and Visualization Testing Script
# This script tests the analytics and visualization functionality

# Configuration
$baseUrl = "https://findoc-deploy.ey.r.appspot.com"
$apiBaseUrl = "$baseUrl/api"
$outputDir = Join-Path $PSScriptRoot "test_results"
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$logFile = Join-Path $outputDir "analytics_test_$timestamp.log"

# Create output directory if it doesn't exist
if (-not (Test-Path -Path $outputDir)) {
    New-Item -ItemType Directory -Path $outputDir | Out-Null
}

# Initialize test results
$testResults = @{
    startTime = Get-Date -Format "yyyy-MM-ddTHH:mm:ss"
    endTime = $null
    tests = @()
    summary = @{
        total = 0
        passed = 0
        failed = 0
        skipped = 0
    }
}

# Helper function to log test results
function Log-Test {
    param (
        [string]$name,
        [string]$status,
        [string]$details = $null
    )
    
    $test = @{
        name = $name
        status = $status
        timestamp = Get-Date -Format "yyyy-MM-ddTHH:mm:ss"
        details = $details
    }
    
    $testResults.tests += $test
    $testResults.summary.total++
    
    if ($status -eq "passed") {
        $testResults.summary.passed++
        Write-Host "✅ PASSED: $name" -ForegroundColor Green
    } elseif ($status -eq "failed") {
        $testResults.summary.failed++
        Write-Host "❌ FAILED: $name" -ForegroundColor Red
        if ($details) {
            Write-Host "   Details: $details" -ForegroundColor Red
        }
    } elseif ($status -eq "skipped") {
        $testResults.summary.skipped++
        Write-Host "⚠️ SKIPPED: $name" -ForegroundColor Yellow
        if ($details) {
            Write-Host "   Reason: $details" -ForegroundColor Yellow
        }
    }
    
    # Log to file
    $logEntry = "$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') - $status - $name"
    if ($details) {
        $logEntry += " - $details"
    }
    Add-Content -Path $logFile -Value $logEntry
}

# Helper function to save test results
function Save-TestResults {
    $testResults.endTime = Get-Date -Format "yyyy-MM-ddTHH:mm:ss"
    $resultsPath = Join-Path $outputDir "analytics_test_results_$timestamp.json"
    $testResults | ConvertTo-Json -Depth 10 | Set-Content -Path $resultsPath
    Write-Host "`nTest results saved to $resultsPath" -ForegroundColor Cyan
}

# Helper function to login and get token
function Get-AuthToken {
    try {
        $loginData = @{
            email = "test@example.com"
            password = "password123"
        } | ConvertTo-Json
        
        Write-Host "Logging in with test user: test@example.com" -ForegroundColor Cyan
        
        $response = Invoke-RestMethod -Uri "$apiBaseUrl/auth/login" -Method Post -Body $loginData -ContentType "application/json" -ErrorAction Stop
        if ($response.success) {
            Write-Host "Login successful" -ForegroundColor Green
            return $response.data.token
        } else {
            Write-Host "Login failed: $($response | ConvertTo-Json -Compress)" -ForegroundColor Red
            return $null
        }
    } catch {
        Write-Host "Login error: $_" -ForegroundColor Red
        return $null
    }
}

# Main test function
function Run-Tests {
    Write-Host "Starting FinDoc Analyzer Analytics and Visualization Tests" -ForegroundColor Cyan
    Write-Host "Base URL: $baseUrl" -ForegroundColor Cyan
    Write-Host "-------------------------------------------" -ForegroundColor Cyan
    
    # Get authentication token
    $token = Get-AuthToken
    if (-not $token) {
        Log-Test -name "Authentication" -status "failed" -details "Could not obtain authentication token"
        Log-Test -name "Analytics Tests" -status "skipped" -details "No authentication token available"
        return
    }
    
    Log-Test -name "Authentication" -status "passed" -details "Obtained authentication token"
    
    # Test 1: Get portfolio analysis
    try {
        $headers = @{
            "Authorization" = "Bearer $token"
        }
        
        $response = Invoke-RestMethod -Uri "$apiBaseUrl/portfolios" -Method Get -Headers $headers -ErrorAction Stop
        if ($response.success) {
            $portfoliosCount = $response.data.Count
            Log-Test -name "Get Portfolio Analysis" -status "passed" -details "Retrieved $portfoliosCount portfolios"
        } else {
            Log-Test -name "Get Portfolio Analysis" -status "failed" -details "Unexpected response: $($response | ConvertTo-Json -Compress)"
        }
    } catch {
        Log-Test -name "Get Portfolio Analysis" -status "failed" -details $_.Exception.Message
    }
    
    # Test 2: Get asset allocation
    try {
        $headers = @{
            "Authorization" = "Bearer $token"
        }
        
        $response = Invoke-RestMethod -Uri "$apiBaseUrl/portfolios/asset-allocation" -Method Get -Headers $headers -ErrorAction Stop
        if ($response.success) {
            Log-Test -name "Get Asset Allocation" -status "passed" -details "Retrieved asset allocation data"
        } else {
            Log-Test -name "Get Asset Allocation" -status "failed" -details "Unexpected response: $($response | ConvertTo-Json -Compress)"
        }
    } catch {
        Log-Test -name "Get Asset Allocation" -status "failed" -details $_.Exception.Message
    }
    
    # Test 3: Get performance metrics
    try {
        $headers = @{
            "Authorization" = "Bearer $token"
        }
        
        $response = Invoke-RestMethod -Uri "$apiBaseUrl/portfolios/performance" -Method Get -Headers $headers -ErrorAction Stop
        if ($response.success) {
            Log-Test -name "Get Performance Metrics" -status "passed" -details "Retrieved performance metrics data"
        } else {
            Log-Test -name "Get Performance Metrics" -status "failed" -details "Unexpected response: $($response | ConvertTo-Json -Compress)"
        }
    } catch {
        Log-Test -name "Get Performance Metrics" -status "failed" -details $_.Exception.Message
    }
    
    # Test 4: Get risk analysis
    try {
        $headers = @{
            "Authorization" = "Bearer $token"
        }
        
        $response = Invoke-RestMethod -Uri "$apiBaseUrl/portfolios/risk" -Method Get -Headers $headers -ErrorAction Stop
        if ($response.success) {
            Log-Test -name "Get Risk Analysis" -status "passed" -details "Retrieved risk analysis data"
        } else {
            Log-Test -name "Get Risk Analysis" -status "failed" -details "Unexpected response: $($response | ConvertTo-Json -Compress)"
        }
    } catch {
        Log-Test -name "Get Risk Analysis" -status "failed" -details $_.Exception.Message
    }
    
    # Test 5: Get securities
    try {
        $headers = @{
            "Authorization" = "Bearer $token"
        }
        
        $response = Invoke-RestMethod -Uri "$apiBaseUrl/securities" -Method Get -Headers $headers -ErrorAction Stop
        if ($response.success) {
            $securitiesCount = $response.data.Count
            Log-Test -name "Get Securities" -status "passed" -details "Retrieved $securitiesCount securities"
        } else {
            Log-Test -name "Get Securities" -status "failed" -details "Unexpected response: $($response | ConvertTo-Json -Compress)"
        }
    } catch {
        Log-Test -name "Get Securities" -status "failed" -details $_.Exception.Message
    }
    
    # Test 6: Get security details
    try {
        $headers = @{
            "Authorization" = "Bearer $token"
        }
        
        # First, get a list of securities
        $securitiesResponse = Invoke-RestMethod -Uri "$apiBaseUrl/securities" -Method Get -Headers $headers -ErrorAction Stop
        if ($securitiesResponse.success -and $securitiesResponse.data.Count -gt 0) {
            $securityId = $securitiesResponse.data[0].id
            
            # Get details for the first security
            $response = Invoke-RestMethod -Uri "$apiBaseUrl/securities/$securityId" -Method Get -Headers $headers -ErrorAction Stop
            if ($response.success) {
                Log-Test -name "Get Security Details" -status "passed" -details "Retrieved details for security $securityId"
            } else {
                Log-Test -name "Get Security Details" -status "failed" -details "Unexpected response: $($response | ConvertTo-Json -Compress)"
            }
        } else {
            Log-Test -name "Get Security Details" -status "skipped" -details "No securities available"
        }
    } catch {
        Log-Test -name "Get Security Details" -status "failed" -details $_.Exception.Message
    }
    
    # Test 7: Get visualizations
    try {
        $headers = @{
            "Authorization" = "Bearer $token"
        }
        
        $response = Invoke-RestMethod -Uri "$apiBaseUrl/visualizations" -Method Get -Headers $headers -ErrorAction Stop
        if ($response.success) {
            $visualizationsCount = $response.data.Count
            Log-Test -name "Get Visualizations" -status "passed" -details "Retrieved $visualizationsCount visualizations"
        } else {
            Log-Test -name "Get Visualizations" -status "failed" -details "Unexpected response: $($response | ConvertTo-Json -Compress)"
        }
    } catch {
        Log-Test -name "Get Visualizations" -status "failed" -details $_.Exception.Message
    }
    
    # Test 8: Get chart data
    try {
        $headers = @{
            "Authorization" = "Bearer $token"
        }
        
        $response = Invoke-RestMethod -Uri "$apiBaseUrl/visualizations/chart-data" -Method Get -Headers $headers -ErrorAction Stop
        if ($response.success) {
            Log-Test -name "Get Chart Data" -status "passed" -details "Retrieved chart data"
        } else {
            Log-Test -name "Get Chart Data" -status "failed" -details "Unexpected response: $($response | ConvertTo-Json -Compress)"
        }
    } catch {
        Log-Test -name "Get Chart Data" -status "failed" -details $_.Exception.Message
    }
    
    # Test 9: Get reports
    try {
        $headers = @{
            "Authorization" = "Bearer $token"
        }
        
        $response = Invoke-RestMethod -Uri "$apiBaseUrl/reports" -Method Get -Headers $headers -ErrorAction Stop
        if ($response.success) {
            $reportsCount = $response.data.Count
            Log-Test -name "Get Reports" -status "passed" -details "Retrieved $reportsCount reports"
        } else {
            Log-Test -name "Get Reports" -status "failed" -details "Unexpected response: $($response | ConvertTo-Json -Compress)"
        }
    } catch {
        Log-Test -name "Get Reports" -status "failed" -details $_.Exception.Message
    }
    
    # Test 10: Generate report
    try {
        $headers = @{
            "Authorization" = "Bearer $token"
            "Content-Type" = "application/json"
        }
        
        $reportData = @{
            title = "Test Report $(Get-Random)"
            type = "portfolio"
            parameters = @{
                timeframe = "1m"
                includeCharts = $true
                includeSecurities = $true
            }
        } | ConvertTo-Json
        
        $response = Invoke-RestMethod -Uri "$apiBaseUrl/reports/generate" -Method Post -Headers $headers -Body $reportData -ErrorAction Stop
        if ($response.success) {
            Log-Test -name "Generate Report" -status "passed" -details "Generated report with ID $($response.data.id)"
        } else {
            Log-Test -name "Generate Report" -status "failed" -details "Unexpected response: $($response | ConvertTo-Json -Compress)"
        }
    } catch {
        Log-Test -name "Generate Report" -status "failed" -details $_.Exception.Message
    }
}

# Run the tests
try {
    Run-Tests
} catch {
    Write-Host "Test execution error: $_" -ForegroundColor Red
} finally {
    # Save test results
    Save-TestResults
    
    # Print summary
    Write-Host "`nTest Summary:" -ForegroundColor Cyan
    Write-Host "Total: $($testResults.summary.total)" -ForegroundColor White
    Write-Host "Passed: $($testResults.summary.passed)" -ForegroundColor Green
    Write-Host "Failed: $($testResults.summary.failed)" -ForegroundColor Red
    Write-Host "Skipped: $($testResults.summary.skipped)" -ForegroundColor Yellow
    
    $successRate = if ($testResults.summary.total -gt 0) {
        [math]::Round(($testResults.summary.passed / $testResults.summary.total) * 100)
    } else {
        0
    }
    
    Write-Host "Success Rate: $successRate%" -ForegroundColor Cyan
}
