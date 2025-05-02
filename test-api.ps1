# FinDoc Analyzer API Testing Script
# This script tests the API endpoints of the FinDoc Analyzer application

# Configuration
$baseUrl = "https://findoc-deploy.ey.r.appspot.com"
$apiBaseUrl = "$baseUrl/api"
$testDocumentPath = Join-Path $PSScriptRoot "test_documents\messos_portfolio.pdf"
$outputDir = Join-Path $PSScriptRoot "test_results"
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$logFile = Join-Path $outputDir "api_test_$timestamp.log"

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
    $resultsPath = Join-Path $outputDir "api_test_results_$timestamp.json"
    $testResults | ConvertTo-Json -Depth 10 | Set-Content -Path $resultsPath
    Write-Host "`nTest results saved to $resultsPath" -ForegroundColor Cyan
}

# Main test function
function Run-Tests {
    Write-Host "Starting FinDoc Analyzer API Tests" -ForegroundColor Cyan
    Write-Host "Base URL: $baseUrl" -ForegroundColor Cyan
    Write-Host "-------------------------------------------" -ForegroundColor Cyan
    
    # Test 1: Check if the API is accessible
    try {
        $response = Invoke-RestMethod -Uri "$apiBaseUrl/health" -Method Get -ErrorAction Stop
        if ($response.success) {
            Log-Test -name "API Health Check" -status "passed" -details ($response | ConvertTo-Json -Compress)
        } else {
            Log-Test -name "API Health Check" -status "failed" -details "Unexpected response: $($response | ConvertTo-Json -Compress)"
        }
    } catch {
        Log-Test -name "API Health Check" -status "failed" -details $_.Exception.Message
    }
    
    # Test 2: Check Scan1 status
    try {
        $response = Invoke-RestMethod -Uri "$apiBaseUrl/documents/scan1/status" -Method Get -ErrorAction Stop
        if ($response.success) {
            Log-Test -name "Scan1 Status Check" -status "passed" -details ($response | ConvertTo-Json -Compress)
        } else {
            Log-Test -name "Scan1 Status Check" -status "failed" -details "Unexpected response: $($response | ConvertTo-Json -Compress)"
        }
    } catch {
        Log-Test -name "Scan1 Status Check" -status "failed" -details $_.Exception.Message
    }
    
    # Test 3: Check Gemini API key verification
    try {
        $response = Invoke-RestMethod -Uri "$apiBaseUrl/documents/scan1/verify-gemini" -Method Get -ErrorAction Stop
        if ($response.success) {
            Log-Test -name "Gemini API Key Verification" -status "passed" -details ($response | ConvertTo-Json -Compress)
        } else {
            Log-Test -name "Gemini API Key Verification" -status "failed" -details "Unexpected response: $($response | ConvertTo-Json -Compress)"
        }
    } catch {
        Log-Test -name "Gemini API Key Verification" -status "failed" -details $_.Exception.Message
    }
    
    # Test 4: User Registration
    try {
        $userData = @{
            name = "Test User"
            email = "test@example.com"
            password = "password123"
            organization = "Test Organization"
        } | ConvertTo-Json
        
        $response = Invoke-RestMethod -Uri "$apiBaseUrl/auth/register" -Method Post -Body $userData -ContentType "application/json" -ErrorAction Stop
        if ($response.success) {
            Log-Test -name "User Registration" -status "passed" -details ($response | ConvertTo-Json -Compress)
            $token = $response.data.token
        } else {
            Log-Test -name "User Registration" -status "failed" -details "Unexpected response: $($response | ConvertTo-Json -Compress)"
            $token = $null
        }
    } catch {
        if ($_.Exception.Response.StatusCode -eq 409) {
            Log-Test -name "User Registration" -status "skipped" -details "User already exists. Trying to login instead."
            
            # Try to login
            try {
                $loginData = @{
                    email = "test@example.com"
                    password = "password123"
                } | ConvertTo-Json
                
                $response = Invoke-RestMethod -Uri "$apiBaseUrl/auth/login" -Method Post -Body $loginData -ContentType "application/json" -ErrorAction Stop
                if ($response.success) {
                    Log-Test -name "User Login" -status "passed" -details ($response | ConvertTo-Json -Compress)
                    $token = $response.data.token
                } else {
                    Log-Test -name "User Login" -status "failed" -details "Unexpected response: $($response | ConvertTo-Json -Compress)"
                    $token = $null
                }
            } catch {
                Log-Test -name "User Login" -status "failed" -details $_.Exception.Message
                $token = $null
            }
        } else {
            Log-Test -name "User Registration" -status "failed" -details $_.Exception.Message
            $token = $null
        }
    }
    
    # If we don't have a token, we can't continue with the authenticated tests
    if (-not $token) {
        Log-Test -name "Authenticated Tests" -status "skipped" -details "No authentication token available"
        return
    }
    
    # Test 5: Document Upload
    try {
        $headers = @{
            "Authorization" = "Bearer $token"
        }
        
        $form = @{
            file = Get-Item -Path $testDocumentPath
            name = "Test Document"
            type = "pdf"
        }
        
        $response = Invoke-RestMethod -Uri "$apiBaseUrl/documents" -Method Post -Headers $headers -Form $form -ErrorAction Stop
        if ($response.success) {
            Log-Test -name "Document Upload" -status "passed" -details ($response | ConvertTo-Json -Compress)
            $documentId = $response.data.id
        } else {
            Log-Test -name "Document Upload" -status "failed" -details "Unexpected response: $($response | ConvertTo-Json -Compress)"
            $documentId = $null
        }
    } catch {
        Log-Test -name "Document Upload" -status "failed" -details $_.Exception.Message
        $documentId = $null
    }
    
    # If we don't have a document ID, we can't continue with the document-related tests
    if (-not $documentId) {
        Log-Test -name "Document-Related Tests" -status "skipped" -details "No document ID available"
        return
    }
    
    # Test 6: Process Document with Scan1
    try {
        $headers = @{
            "Authorization" = "Bearer $token"
            "Content-Type" = "application/json"
        }
        
        $response = Invoke-RestMethod -Uri "$apiBaseUrl/documents/$documentId/scan1" -Method Post -Headers $headers -ErrorAction Stop
        if ($response.success) {
            Log-Test -name "Process Document with Scan1" -status "passed" -details ($response | ConvertTo-Json -Compress)
        } else {
            Log-Test -name "Process Document with Scan1" -status "failed" -details "Unexpected response: $($response | ConvertTo-Json -Compress)"
        }
    } catch {
        Log-Test -name "Process Document with Scan1" -status "failed" -details $_.Exception.Message
    }
    
    # Test 7: Get Document
    try {
        $headers = @{
            "Authorization" = "Bearer $token"
        }
        
        $response = Invoke-RestMethod -Uri "$apiBaseUrl/documents/$documentId" -Method Get -Headers $headers -ErrorAction Stop
        if ($response.success) {
            Log-Test -name "Get Document" -status "passed" -details ($response | ConvertTo-Json -Compress)
        } else {
            Log-Test -name "Get Document" -status "failed" -details "Unexpected response: $($response | ConvertTo-Json -Compress)"
        }
    } catch {
        Log-Test -name "Get Document" -status "failed" -details $_.Exception.Message
    }
    
    # Test 8: Get All Documents
    try {
        $headers = @{
            "Authorization" = "Bearer $token"
        }
        
        $response = Invoke-RestMethod -Uri "$apiBaseUrl/documents" -Method Get -Headers $headers -ErrorAction Stop
        if ($response.success) {
            Log-Test -name "Get All Documents" -status "passed" -details "Found $($response.data.Count) documents"
        } else {
            Log-Test -name "Get All Documents" -status "failed" -details "Unexpected response: $($response | ConvertTo-Json -Compress)"
        }
    } catch {
        Log-Test -name "Get All Documents" -status "failed" -details $_.Exception.Message
    }
    
    # Test 9: Chat with Document
    try {
        $headers = @{
            "Authorization" = "Bearer $token"
            "Content-Type" = "application/json"
        }
        
        $chatData = @{
            documentId = $documentId
            message = "What securities are in this document?"
        } | ConvertTo-Json
        
        $response = Invoke-RestMethod -Uri "$apiBaseUrl/chat" -Method Post -Headers $headers -Body $chatData -ErrorAction Stop
        if ($response.success) {
            Log-Test -name "Chat with Document" -status "passed" -details ($response | ConvertTo-Json -Compress)
        } else {
            Log-Test -name "Chat with Document" -status "failed" -details "Unexpected response: $($response | ConvertTo-Json -Compress)"
        }
    } catch {
        Log-Test -name "Chat with Document" -status "failed" -details $_.Exception.Message
    }
    
    # Test 10: Get Portfolio Analysis
    try {
        $headers = @{
            "Authorization" = "Bearer $token"
        }
        
        $response = Invoke-RestMethod -Uri "$apiBaseUrl/portfolios" -Method Get -Headers $headers -ErrorAction Stop
        if ($response.success) {
            Log-Test -name "Get Portfolio Analysis" -status "passed" -details "Found $($response.data.Count) portfolios"
        } else {
            Log-Test -name "Get Portfolio Analysis" -status "failed" -details "Unexpected response: $($response | ConvertTo-Json -Compress)"
        }
    } catch {
        Log-Test -name "Get Portfolio Analysis" -status "failed" -details $_.Exception.Message
    }
    
    # Test 11: Get Securities
    try {
        $headers = @{
            "Authorization" = "Bearer $token"
        }
        
        $response = Invoke-RestMethod -Uri "$apiBaseUrl/securities" -Method Get -Headers $headers -ErrorAction Stop
        if ($response.success) {
            Log-Test -name "Get Securities" -status "passed" -details "Found $($response.data.Count) securities"
        } else {
            Log-Test -name "Get Securities" -status "failed" -details "Unexpected response: $($response | ConvertTo-Json -Compress)"
        }
    } catch {
        Log-Test -name "Get Securities" -status "failed" -details $_.Exception.Message
    }
    
    # Test 12: Get Reports
    try {
        $headers = @{
            "Authorization" = "Bearer $token"
        }
        
        $response = Invoke-RestMethod -Uri "$apiBaseUrl/reports" -Method Get -Headers $headers -ErrorAction Stop
        if ($response.success) {
            Log-Test -name "Get Reports" -status "passed" -details "Found $($response.data.Count) reports"
        } else {
            Log-Test -name "Get Reports" -status "failed" -details "Unexpected response: $($response | ConvertTo-Json -Compress)"
        }
    } catch {
        Log-Test -name "Get Reports" -status "failed" -details $_.Exception.Message
    }
    
    # Test 13: Get API Keys
    try {
        $headers = @{
            "Authorization" = "Bearer $token"
        }
        
        $response = Invoke-RestMethod -Uri "$apiBaseUrl/api-keys" -Method Get -Headers $headers -ErrorAction Stop
        if ($response.success) {
            Log-Test -name "Get API Keys" -status "passed" -details "Found $($response.data.Count) API keys"
        } else {
            Log-Test -name "Get API Keys" -status "failed" -details "Unexpected response: $($response | ConvertTo-Json -Compress)"
        }
    } catch {
        Log-Test -name "Get API Keys" -status "failed" -details $_.Exception.Message
    }
    
    # Test 14: Get Visualizations
    try {
        $headers = @{
            "Authorization" = "Bearer $token"
        }
        
        $response = Invoke-RestMethod -Uri "$apiBaseUrl/visualizations" -Method Get -Headers $headers -ErrorAction Stop
        if ($response.success) {
            Log-Test -name "Get Visualizations" -status "passed" -details "Found $($response.data.Count) visualizations"
        } else {
            Log-Test -name "Get Visualizations" -status "failed" -details "Unexpected response: $($response | ConvertTo-Json -Compress)"
        }
    } catch {
        Log-Test -name "Get Visualizations" -status "failed" -details $_.Exception.Message
    }
    
    # Test 15: Get Financial Analysis
    try {
        $headers = @{
            "Authorization" = "Bearer $token"
        }
        
        $response = Invoke-RestMethod -Uri "$apiBaseUrl/financial" -Method Get -Headers $headers -ErrorAction Stop
        if ($response.success) {
            Log-Test -name "Get Financial Analysis" -status "passed" -details "Found $($response.data.Count) financial analyses"
        } else {
            Log-Test -name "Get Financial Analysis" -status "failed" -details "Unexpected response: $($response | ConvertTo-Json -Compress)"
        }
    } catch {
        Log-Test -name "Get Financial Analysis" -status "failed" -details $_.Exception.Message
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
