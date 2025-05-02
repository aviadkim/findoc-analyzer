# FinDoc Analyzer Chat and AI Features Testing Script
# This script tests the chat and AI functionality

# Configuration
$baseUrl = "https://findoc-deploy.ey.r.appspot.com"
$apiBaseUrl = "$baseUrl/api"
$testDocumentPath = Join-Path $PSScriptRoot "test_documents\messos_portfolio.pdf"
$outputDir = Join-Path $PSScriptRoot "test_results"
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$logFile = Join-Path $outputDir "chat_test_$timestamp.log"

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
    $resultsPath = Join-Path $outputDir "chat_test_results_$timestamp.json"
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

# Helper function to upload a test document and get its ID
function Upload-TestDocument {
    param (
        [string]$token
    )
    
    try {
        $headers = @{
            "Authorization" = "Bearer $token"
        }
        
        $form = @{
            file = Get-Item -Path $testDocumentPath
            name = "Chat Test Document $(Get-Random)"
            type = "pdf"
        }
        
        $response = Invoke-RestMethod -Uri "$apiBaseUrl/documents" -Method Post -Headers $headers -Form $form -ErrorAction Stop
        if ($response.success) {
            Write-Host "Document uploaded successfully with ID $($response.data.id)" -ForegroundColor Green
            return $response.data.id
        } else {
            Write-Host "Document upload failed: $($response | ConvertTo-Json -Compress)" -ForegroundColor Red
            return $null
        }
    } catch {
        Write-Host "Document upload error: $_" -ForegroundColor Red
        return $null
    }
}

# Helper function to process a document with Scan1
function Process-Document {
    param (
        [string]$token,
        [string]$documentId
    )
    
    try {
        $headers = @{
            "Authorization" = "Bearer $token"
            "Content-Type" = "application/json"
        }
        
        $response = Invoke-RestMethod -Uri "$apiBaseUrl/documents/$documentId/scan1" -Method Post -Headers $headers -ErrorAction Stop
        if ($response.success) {
            Write-Host "Document processing initiated" -ForegroundColor Green
            return $true
        } else {
            Write-Host "Document processing failed: $($response | ConvertTo-Json -Compress)" -ForegroundColor Red
            return $false
        }
    } catch {
        Write-Host "Document processing error: $_" -ForegroundColor Red
        return $false
    }
}

# Helper function to wait for document processing to complete
function Wait-ForProcessing {
    param (
        [string]$token,
        [string]$documentId,
        [int]$maxAttempts = 10,
        [int]$waitSeconds = 5
    )
    
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
                    Write-Host "Document processed successfully" -ForegroundColor Green
                    $processingComplete = $true
                    return $true
                } elseif ($status -eq "error") {
                    Write-Host "Document processing failed with error: $($response.data.metadata.error)" -ForegroundColor Red
                    $processingComplete = $true
                    return $false
                } elseif ($status -eq "processing") {
                    Write-Host "Document is still processing, waiting $waitSeconds seconds..." -ForegroundColor Yellow
                    Start-Sleep -Seconds $waitSeconds
                } else {
                    Write-Host "Unexpected document status: $status" -ForegroundColor Red
                    $processingComplete = $true
                    return $false
                }
            } else {
                Write-Host "Unexpected response: $($response | ConvertTo-Json -Compress)" -ForegroundColor Red
                $processingComplete = $true
                return $false
            }
        } catch {
            Write-Host "Error checking document status: $_" -ForegroundColor Red
            $processingComplete = $true
            return $false
        }
    }
    
    if ($attempt -ge $maxAttempts -and -not $processingComplete) {
        Write-Host "Document processing did not complete within the maximum number of attempts" -ForegroundColor Red
        return $false
    }
    
    return $processingComplete
}

# Main test function
function Run-Tests {
    Write-Host "Starting FinDoc Analyzer Chat and AI Features Tests" -ForegroundColor Cyan
    Write-Host "Base URL: $baseUrl" -ForegroundColor Cyan
    Write-Host "-------------------------------------------" -ForegroundColor Cyan
    
    # Get authentication token
    $token = Get-AuthToken
    if (-not $token) {
        Log-Test -name "Authentication" -status "failed" -details "Could not obtain authentication token"
        Log-Test -name "Chat Tests" -status "skipped" -details "No authentication token available"
        return
    }
    
    Log-Test -name "Authentication" -status "passed" -details "Obtained authentication token"
    
    # Check if test document exists
    if (-not (Test-Path -Path $testDocumentPath)) {
        Log-Test -name "Test Document Check" -status "failed" -details "Test document not found at $testDocumentPath"
        Log-Test -name "Chat Tests" -status "skipped" -details "Test document not available"
        return
    }
    
    Log-Test -name "Test Document Check" -status "passed" -details "Test document found at $testDocumentPath"
    
    # Upload test document
    $documentId = Upload-TestDocument -token $token
    if (-not $documentId) {
        Log-Test -name "Document Upload" -status "failed" -details "Could not upload test document"
        Log-Test -name "Chat Tests" -status "skipped" -details "No document ID available"
        return
    }
    
    Log-Test -name "Document Upload" -status "passed" -details "Document uploaded successfully with ID $documentId"
    
    # Process document with Scan1
    $processingInitiated = Process-Document -token $token -documentId $documentId
    if (-not $processingInitiated) {
        Log-Test -name "Process Document with Scan1" -status "failed" -details "Could not initiate document processing"
        Log-Test -name "Chat Tests" -status "skipped" -details "Document processing not initiated"
        return
    }
    
    Log-Test -name "Process Document with Scan1" -status "passed" -details "Document processing initiated"
    
    # Wait for document processing to complete
    $processingComplete = Wait-ForProcessing -token $token -documentId $documentId
    if (-not $processingComplete) {
        Log-Test -name "Document Processing Status" -status "failed" -details "Document processing did not complete successfully"
        Log-Test -name "Chat Tests" -status "skipped" -details "Document not processed"
        return
    }
    
    Log-Test -name "Document Processing Status" -status "passed" -details "Document processed successfully"
    
    # Test 1: Check Gemini API key verification
    try {
        $response = Invoke-RestMethod -Uri "$apiBaseUrl/documents/scan1/verify-gemini" -Method Get -ErrorAction Stop
        if ($response.success) {
            Log-Test -name "Gemini API Key Verification" -status "passed" -details "Gemini API key is valid"
        } else {
            Log-Test -name "Gemini API Key Verification" -status "failed" -details "Unexpected response: $($response | ConvertTo-Json -Compress)"
        }
    } catch {
        Log-Test -name "Gemini API Key Verification" -status "failed" -details $_.Exception.Message
    }
    
    # Test 2: Send a chat message
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
            Log-Test -name "Send Chat Message" -status "passed" -details "Chat message sent successfully"
            $chatId = $response.data.id
        } else {
            Log-Test -name "Send Chat Message" -status "failed" -details "Unexpected response: $($response | ConvertTo-Json -Compress)"
            $chatId = $null
        }
    } catch {
        Log-Test -name "Send Chat Message" -status "failed" -details $_.Exception.Message
        $chatId = $null
    }
    
    # If we don't have a chat ID, we can't continue with the chat-related tests
    if (-not $chatId) {
        Log-Test -name "Chat-Related Tests" -status "skipped" -details "No chat ID available"
    } else {
        # Test 3: Get chat history
        try {
            $headers = @{
                "Authorization" = "Bearer $token"
            }
            
            $response = Invoke-RestMethod -Uri "$apiBaseUrl/chat/history/$documentId" -Method Get -Headers $headers -ErrorAction Stop
            if ($response.success) {
                $messagesCount = $response.data.Count
                Log-Test -name "Get Chat History" -status "passed" -details "Retrieved $messagesCount chat messages"
            } else {
                Log-Test -name "Get Chat History" -status "failed" -details "Unexpected response: $($response | ConvertTo-Json -Compress)"
            }
        } catch {
            Log-Test -name "Get Chat History" -status "failed" -details $_.Exception.Message
        }
        
        # Test 4: Send a follow-up message
        try {
            $headers = @{
                "Authorization" = "Bearer $token"
                "Content-Type" = "application/json"
            }
            
            $chatData = @{
                documentId = $documentId
                message = "What is the total value of the portfolio?"
            } | ConvertTo-Json
            
            $response = Invoke-RestMethod -Uri "$apiBaseUrl/chat" -Method Post -Headers $headers -Body $chatData -ErrorAction Stop
            if ($response.success) {
                Log-Test -name "Send Follow-up Message" -status "passed" -details "Follow-up message sent successfully"
            } else {
                Log-Test -name "Send Follow-up Message" -status "failed" -details "Unexpected response: $($response | ConvertTo-Json -Compress)"
            }
        } catch {
            Log-Test -name "Send Follow-up Message" -status "failed" -details $_.Exception.Message
        }
    }
    
    # Test 5: Get AI-generated insights
    try {
        $headers = @{
            "Authorization" = "Bearer $token"
        }
        
        $response = Invoke-RestMethod -Uri "$apiBaseUrl/documents/$documentId/insights" -Method Get -Headers $headers -ErrorAction Stop
        if ($response.success) {
            Log-Test -name "Get AI-Generated Insights" -status "passed" -details "Retrieved AI-generated insights"
        } else {
            Log-Test -name "Get AI-Generated Insights" -status "failed" -details "Unexpected response: $($response | ConvertTo-Json -Compress)"
        }
    } catch {
        Log-Test -name "Get AI-Generated Insights" -status "failed" -details $_.Exception.Message
    }
    
    # Test 6: Get AI-generated recommendations
    try {
        $headers = @{
            "Authorization" = "Bearer $token"
        }
        
        $response = Invoke-RestMethod -Uri "$apiBaseUrl/documents/$documentId/recommendations" -Method Get -Headers $headers -ErrorAction Stop
        if ($response.success) {
            Log-Test -name "Get AI-Generated Recommendations" -status "passed" -details "Retrieved AI-generated recommendations"
        } else {
            Log-Test -name "Get AI-Generated Recommendations" -status "failed" -details "Unexpected response: $($response | ConvertTo-Json -Compress)"
        }
    } catch {
        Log-Test -name "Get AI-Generated Recommendations" -status "failed" -details $_.Exception.Message
    }
    
    # Test 7: Generate a summary
    try {
        $headers = @{
            "Authorization" = "Bearer $token"
        }
        
        $response = Invoke-RestMethod -Uri "$apiBaseUrl/documents/$documentId/summary" -Method Get -Headers $headers -ErrorAction Stop
        if ($response.success) {
            Log-Test -name "Generate Summary" -status "passed" -details "Generated summary"
        } else {
            Log-Test -name "Generate Summary" -status "failed" -details "Unexpected response: $($response | ConvertTo-Json -Compress)"
        }
    } catch {
        Log-Test -name "Generate Summary" -status "failed" -details $_.Exception.Message
    }
    
    # Test 8: Delete the test document
    try {
        $headers = @{
            "Authorization" = "Bearer $token"
        }
        
        $response = Invoke-RestMethod -Uri "$apiBaseUrl/documents/$documentId" -Method Delete -Headers $headers -ErrorAction Stop
        if ($response.success) {
            Log-Test -name "Delete Test Document" -status "passed" -details "Deleted test document"
        } else {
            Log-Test -name "Delete Test Document" -status "failed" -details "Unexpected response: $($response | ConvertTo-Json -Compress)"
        }
    } catch {
        Log-Test -name "Delete Test Document" -status "failed" -details $_.Exception.Message
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
