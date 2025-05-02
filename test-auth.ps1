# FinDoc Analyzer Authentication Testing Script
# This script tests the authentication and user management functionality

# Configuration
$baseUrl = "https://findoc-deploy.ey.r.appspot.com"
$apiBaseUrl = "$baseUrl/api"
$outputDir = Join-Path $PSScriptRoot "test_results"
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$logFile = Join-Path $outputDir "auth_test_$timestamp.log"

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
    $resultsPath = Join-Path $outputDir "auth_test_results_$timestamp.json"
    $testResults | ConvertTo-Json -Depth 10 | Set-Content -Path $resultsPath
    Write-Host "`nTest results saved to $resultsPath" -ForegroundColor Cyan
}

# Main test function
function Run-Tests {
    Write-Host "Starting FinDoc Analyzer Authentication Tests" -ForegroundColor Cyan
    Write-Host "Base URL: $baseUrl" -ForegroundColor Cyan
    Write-Host "-------------------------------------------" -ForegroundColor Cyan
    
    # Test 1: Register a new user
    try {
        $userData = @{
            name = "Test User $(Get-Random)"
            email = "test$(Get-Random)@example.com"
            password = "password123"
            organization = "Test Organization"
        }
        
        $userDataJson = $userData | ConvertTo-Json
        
        Write-Host "Registering user: $($userData.email)" -ForegroundColor Cyan
        
        $response = Invoke-RestMethod -Uri "$apiBaseUrl/auth/register" -Method Post -Body $userDataJson -ContentType "application/json" -ErrorAction Stop
        if ($response.success) {
            Log-Test -name "User Registration" -status "passed" -details "User $($userData.email) registered successfully"
            $token = $response.data.token
            $userId = $response.data.user.id
        } else {
            Log-Test -name "User Registration" -status "failed" -details "Unexpected response: $($response | ConvertTo-Json -Compress)"
            $token = $null
            $userId = $null
        }
    } catch {
        Log-Test -name "User Registration" -status "failed" -details $_.Exception.Message
        $token = $null
        $userId = $null
    }
    
    # If we don't have a token, try to login with a test user
    if (-not $token) {
        try {
            $loginData = @{
                email = "test@example.com"
                password = "password123"
            } | ConvertTo-Json
            
            Write-Host "Logging in with test user: test@example.com" -ForegroundColor Cyan
            
            $response = Invoke-RestMethod -Uri "$apiBaseUrl/auth/login" -Method Post -Body $loginData -ContentType "application/json" -ErrorAction Stop
            if ($response.success) {
                Log-Test -name "User Login (Fallback)" -status "passed" -details "Logged in with test@example.com"
                $token = $response.data.token
                $userId = $response.data.user.id
            } else {
                Log-Test -name "User Login (Fallback)" -status "failed" -details "Unexpected response: $($response | ConvertTo-Json -Compress)"
                $token = $null
                $userId = $null
            }
        } catch {
            Log-Test -name "User Login (Fallback)" -status "failed" -details $_.Exception.Message
            $token = $null
            $userId = $null
        }
    }
    
    # If we still don't have a token, we can't continue with the authenticated tests
    if (-not $token) {
        Log-Test -name "Authenticated Tests" -status "skipped" -details "No authentication token available"
        return
    }
    
    # Test 2: Get user profile
    try {
        $headers = @{
            "Authorization" = "Bearer $token"
        }
        
        $response = Invoke-RestMethod -Uri "$apiBaseUrl/auth/profile" -Method Get -Headers $headers -ErrorAction Stop
        if ($response.success) {
            Log-Test -name "Get User Profile" -status "passed" -details "Retrieved profile for user $($response.data.email)"
        } else {
            Log-Test -name "Get User Profile" -status "failed" -details "Unexpected response: $($response | ConvertTo-Json -Compress)"
        }
    } catch {
        Log-Test -name "Get User Profile" -status "failed" -details $_.Exception.Message
    }
    
    # Test 3: Update user profile
    try {
        $headers = @{
            "Authorization" = "Bearer $token"
            "Content-Type" = "application/json"
        }
        
        $updateData = @{
            name = "Updated Test User"
            organization = "Updated Test Organization"
        } | ConvertTo-Json
        
        $response = Invoke-RestMethod -Uri "$apiBaseUrl/auth/profile" -Method Put -Headers $headers -Body $updateData -ErrorAction Stop
        if ($response.success) {
            Log-Test -name "Update User Profile" -status "passed" -details "Updated profile for user $($response.data.email)"
        } else {
            Log-Test -name "Update User Profile" -status "failed" -details "Unexpected response: $($response | ConvertTo-Json -Compress)"
        }
    } catch {
        Log-Test -name "Update User Profile" -status "failed" -details $_.Exception.Message
    }
    
    # Test 4: Change password
    try {
        $headers = @{
            "Authorization" = "Bearer $token"
            "Content-Type" = "application/json"
        }
        
        $passwordData = @{
            currentPassword = "password123"
            newPassword = "newpassword123"
        } | ConvertTo-Json
        
        $response = Invoke-RestMethod -Uri "$apiBaseUrl/auth/change-password" -Method Post -Headers $headers -Body $passwordData -ErrorAction Stop
        if ($response.success) {
            Log-Test -name "Change Password" -status "passed" -details "Changed password for user"
            
            # Test login with new password
            $loginData = @{
                email = $userData.email
                password = "newpassword123"
            } | ConvertTo-Json
            
            $loginResponse = Invoke-RestMethod -Uri "$apiBaseUrl/auth/login" -Method Post -Body $loginData -ContentType "application/json" -ErrorAction Stop
            if ($loginResponse.success) {
                Log-Test -name "Login with New Password" -status "passed" -details "Logged in with new password"
                $token = $loginResponse.data.token
            } else {
                Log-Test -name "Login with New Password" -status "failed" -details "Unexpected response: $($loginResponse | ConvertTo-Json -Compress)"
            }
        } else {
            Log-Test -name "Change Password" -status "failed" -details "Unexpected response: $($response | ConvertTo-Json -Compress)"
        }
    } catch {
        Log-Test -name "Change Password" -status "failed" -details $_.Exception.Message
    }
    
    # Test 5: Request password reset
    try {
        $resetData = @{
            email = $userData.email
        } | ConvertTo-Json
        
        $response = Invoke-RestMethod -Uri "$apiBaseUrl/auth/forgot-password" -Method Post -Body $resetData -ContentType "application/json" -ErrorAction Stop
        if ($response.success) {
            Log-Test -name "Request Password Reset" -status "passed" -details "Password reset email sent to $($userData.email)"
        } else {
            Log-Test -name "Request Password Reset" -status "failed" -details "Unexpected response: $($response | ConvertTo-Json -Compress)"
        }
    } catch {
        Log-Test -name "Request Password Reset" -status "failed" -details $_.Exception.Message
    }
    
    # Test 6: Logout
    try {
        $headers = @{
            "Authorization" = "Bearer $token"
        }
        
        $response = Invoke-RestMethod -Uri "$apiBaseUrl/auth/logout" -Method Post -Headers $headers -ErrorAction Stop
        if ($response.success) {
            Log-Test -name "Logout" -status "passed" -details "Logged out successfully"
        } else {
            Log-Test -name "Logout" -status "failed" -details "Unexpected response: $($response | ConvertTo-Json -Compress)"
        }
    } catch {
        Log-Test -name "Logout" -status "failed" -details $_.Exception.Message
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
