# FinDoc Analyzer Document Processing Testing Script
# This script tests the document upload and processing functionality

# Configuration
$baseUrl = "https://findoc-deploy.ey.r.appspot.com"
$apiBaseUrl = "$baseUrl/api"
$testDocumentPath = Join-Path $PSScriptRoot "test_documents\messos_portfolio.pdf"
$outputDir = Join-Path $PSScriptRoot "test_results"
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$logFile = Join-Path $outputDir "document_test_$timestamp.log"

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
    $resultsPath = Join-Path $outputDir "document_test_results_$timestamp.json"
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
    Write-Host "Starting FinDoc Analyzer Document Processing Tests" -ForegroundColor Cyan
    Write-Host "Base URL: $baseUrl" -ForegroundColor Cyan
    Write-Host "-------------------------------------------" -ForegroundColor Cyan
    
    # Get authentication token
    $token = Get-AuthToken
    if (-not $token) {
        Log-Test -name "Authentication" -status "failed" -details "Could not obtain authentication token"
        Log-Test -name "Document Tests" -status "skipped" -details "No authentication token available"
        return
    }
    
    Log-Test -name "Authentication" -status "passed" -details "Obtained authentication token"
    
    # Test 1: Check if test document exists
    if (-not (Test-Path -Path $testDocumentPath)) {
        Log-Test -name "Test Document Check" -status "failed" -details "Test document not found at $testDocumentPath"
        Log-Test -name "Document Upload Tests" -status "skipped" -details "Test document not available"
        return
    }
    
    Log-Test -name "Test Document Check" -status "passed" -details "Test document found at $testDocumentPath"
    
    # Test 2: Upload document
    try {
        $headers = @{
            "Authorization" = "Bearer $token"
        }
        
        $form = @{
            file = Get-Item -Path $testDocumentPath
            name = "Test Document $(Get-Random)"
            type = "pdf"
        }
        
        $response = Invoke-RestMethod -Uri "$apiBaseUrl/documents" -Method Post -Headers $headers -Form $form -ErrorAction Stop
        if ($response.success) {
            Log-Test -name "Document Upload" -status "passed" -details "Document uploaded successfully with ID $($response.data.id)"
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
        Log-Test -name "Document Processing Tests" -status "skipped" -details "No document ID available"
        return
    }
    
    # Test 3: Process document with Scan1
    try {
        $headers = @{
            "Authorization" = "Bearer $token"
            "Content-Type" = "application/json"
        }
        
        $response = Invoke-RestMethod -Uri "$apiBaseUrl/documents/$documentId/scan1" -Method Post -Headers $headers -ErrorAction Stop
        if ($response.success) {
            Log-Test -name "Process Document with Scan1" -status "passed" -details "Document processing initiated"
        } else {
            Log-Test -name "Process Document with Scan1" -status "failed" -details "Unexpected response: $($response | ConvertTo-Json -Compress)"
        }
    } catch {
        Log-Test -name "Process Document with Scan1" -status "failed" -details $_.Exception.Message
    }
    
    # Test 4: Check document status (wait for processing to complete)
    $maxAttempts = 10
    $attempt = 0
    $processingComplete = $false
    
    while ($attempt -lt $maxAttempts -and -not $processingComplete) {
        $attempt++
        Write-Host "Checking document status (attempt $attempt of $maxAttempts)..." -ForegroundColor Cyan
        
        try {
            $headers = @{
                "Authorization" = "Bearer $token"
            }
            
            $response = Invoke-RestMethod -Uri "$apiBaseUrl/documents/$documentId" -Method Get -Headers $headers -ErrorAction Stop
            if ($response.success) {
                $status = $response.data.status
                Write-Host "Document status: $status" -ForegroundColor Cyan
                
                if ($status -eq "processed") {
                    Log-Test -name "Document Processing Status" -status "passed" -details "Document processed successfully"
                    $processingComplete = $true
                } elseif ($status -eq "error") {
                    Log-Test -name "Document Processing Status" -status "failed" -details "Document processing failed with error: $($response.data.metadata.error)"
                    $processingComplete = $true
                } elseif ($status -eq "processing") {
                    Write-Host "Document is still processing, waiting 5 seconds..." -ForegroundColor Yellow
                    Start-Sleep -Seconds 5
                } else {
                    Log-Test -name "Document Processing Status" -status "failed" -details "Unexpected document status: $status"
                    $processingComplete = $true
                }
            } else {
                Log-Test -name "Document Processing Status" -status "failed" -details "Unexpected response: $($response | ConvertTo-Json -Compress)"
                $processingComplete = $true
            }
        } catch {
            Log-Test -name "Document Processing Status" -status "failed" -details $_.Exception.Message
            $processingComplete = $true
        }
    }
    
    if ($attempt -ge $maxAttempts -and -not $processingComplete) {
        Log-Test -name "Document Processing Status" -status "failed" -details "Document processing did not complete within the maximum number of attempts"
    }
    
    # Test 5: Get document metadata
    try {
        $headers = @{
            "Authorization" = "Bearer $token"
        }
        
        $response = Invoke-RestMethod -Uri "$apiBaseUrl/documents/$documentId/metadata" -Method Get -Headers $headers -ErrorAction Stop
        if ($response.success) {
            Log-Test -name "Get Document Metadata" -status "passed" -details "Retrieved metadata for document $documentId"
        } else {
            Log-Test -name "Get Document Metadata" -status "failed" -details "Unexpected response: $($response | ConvertTo-Json -Compress)"
        }
    } catch {
        Log-Test -name "Get Document Metadata" -status "failed" -details $_.Exception.Message
    }
    
    # Test 6: Get document content
    try {
        $headers = @{
            "Authorization" = "Bearer $token"
        }
        
        $response = Invoke-RestMethod -Uri "$apiBaseUrl/documents/$documentId/content" -Method Get -Headers $headers -ErrorAction Stop
        if ($response.success) {
            Log-Test -name "Get Document Content" -status "passed" -details "Retrieved content for document $documentId"
        } else {
            Log-Test -name "Get Document Content" -status "failed" -details "Unexpected response: $($response | ConvertTo-Json -Compress)"
        }
    } catch {
        Log-Test -name "Get Document Content" -status "failed" -details $_.Exception.Message
    }
    
    # Test 7: Get document securities
    try {
        $headers = @{
            "Authorization" = "Bearer $token"
        }
        
        $response = Invoke-RestMethod -Uri "$apiBaseUrl/documents/$documentId/securities" -Method Get -Headers $headers -ErrorAction Stop
        if ($response.success) {
            $securitiesCount = $response.data.Count
            Log-Test -name "Get Document Securities" -status "passed" -details "Retrieved $securitiesCount securities for document $documentId"
        } else {
            Log-Test -name "Get Document Securities" -status "failed" -details "Unexpected response: $($response | ConvertTo-Json -Compress)"
        }
    } catch {
        Log-Test -name "Get Document Securities" -status "failed" -details $_.Exception.Message
    }
    
    # Test 8: Delete document
    try {
        $headers = @{
            "Authorization" = "Bearer $token"
        }
        
        $response = Invoke-RestMethod -Uri "$apiBaseUrl/documents/$documentId" -Method Delete -Headers $headers -ErrorAction Stop
        if ($response.success) {
            Log-Test -name "Delete Document" -status "passed" -details "Deleted document $documentId"
        } else {
            Log-Test -name "Delete Document" -status "failed" -details "Unexpected response: $($response | ConvertTo-Json -Compress)"
        }
    } catch {
        Log-Test -name "Delete Document" -status "failed" -details $_.Exception.Message
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
