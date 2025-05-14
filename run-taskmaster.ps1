# TaskMaster Runner Script
Write-Host "TaskMaster Runner for FinDoc Analyzer" -ForegroundColor Green

# Load configuration
$configPath = "taskmaster.config.json"
if (Test-Path $configPath) {
    $config = Get-Content $configPath | ConvertFrom-Json
    Write-Host "Loaded configuration for $($config.project.name) v$($config.project.version)" -ForegroundColor Cyan
} else {
    Write-Host "Error: Configuration file not found at $configPath" -ForegroundColor Red
    exit 1
}

# Parse command line arguments
param(
    [string]$task = "",
    [string]$env = "local",
    [switch]$list = $false
)

# List tasks
if ($list) {
    Write-Host "`nAvailable Tasks:" -ForegroundColor Green
    foreach ($taskItem in $config.tasks) {
        Write-Host "- $($taskItem.id): $($taskItem.name)" -ForegroundColor Cyan
        Write-Host "  $($taskItem.description)" -ForegroundColor Gray
        
        if ($taskItem.subtasks) {
            foreach ($subtask in $taskItem.subtasks) {
                Write-Host "  - $($subtask.id): $($subtask.name) [$($subtask.status)]" -ForegroundColor Cyan
            }
        }
        Write-Host ""
    }
    exit 0
}

# Set environment
$envConfig = $config.testing.environments | Where-Object { $_.name -eq $env }
if ($envConfig) {
    $env:TEST_URL = $envConfig.url
    Write-Host "Using environment: $env ($($envConfig.url))" -ForegroundColor Cyan
} else {
    Write-Host "Error: Environment '$env' not found in configuration" -ForegroundColor Red
    exit 1
}

# Run specific task
if ($task) {
    $taskConfig = $config.tasks | Where-Object { $_.id -eq $task }
    if ($taskConfig) {
        Write-Host "`nRunning task: $($taskConfig.name)" -ForegroundColor Green
        Write-Host "$($taskConfig.description)" -ForegroundColor Gray
        
        switch ($task) {
            "implement-ui-components" {
                Write-Host "`nImplementing UI Components..." -ForegroundColor Cyan
                & node scripts/implement-ui-components.js
            }
            "deploy-to-cloud" {
                Write-Host "`nDeploying to Google Cloud Run..." -ForegroundColor Cyan
                & powershell -ExecutionPolicy Bypass -File .\deploy-to-cloud-with-ui-fixes.ps1
            }
            "comprehensive-testing" {
                Write-Host "`nRunning Comprehensive Tests..." -ForegroundColor Cyan
                & node run-comprehensive-tests.js
            }
            "backend-integration" {
                Write-Host "`nVerifying Backend Integration..." -ForegroundColor Cyan
                & node tests/integration/frontend-backend.test.js
            }
            "agent-integration" {
                Write-Host "`nVerifying Agent Integration..." -ForegroundColor Cyan
                & node tests/integration/agent-integration.test.js
            }
            default {
                Write-Host "Error: No implementation for task '$task'" -ForegroundColor Red
            }
        }
    } else {
        Write-Host "Error: Task '$task' not found in configuration" -ForegroundColor Red
        exit 1
    }
} else {
    # Run all tests
    Write-Host "`nRunning all tests for environment: $env" -ForegroundColor Green
    
    # UI Tests
    Write-Host "`n=== UI Component Tests ===" -ForegroundColor Cyan
    foreach ($test in $config.testing.suites[0].tests) {
        $testPath = "tests/ui/$test.test.js"
        if (Test-Path $testPath) {
            Write-Host "Running $test test..." -ForegroundColor Gray
            & node $testPath
        } else {
            Write-Host "Test not found: $testPath" -ForegroundColor Yellow
        }
    }
    
    # Functionality Tests
    Write-Host "`n=== Functionality Tests ===" -ForegroundColor Cyan
    foreach ($test in $config.testing.suites[1].tests) {
        $testPath = "tests/functionality/$test.test.js"
        if (Test-Path $testPath) {
            Write-Host "Running $test test..." -ForegroundColor Gray
            & node $testPath
        } else {
            Write-Host "Test not found: $testPath" -ForegroundColor Yellow
        }
    }
    
    # Integration Tests
    Write-Host "`n=== Integration Tests ===" -ForegroundColor Cyan
    foreach ($test in $config.testing.suites[2].tests) {
        $testPath = "tests/integration/$test.test.js"
        if (Test-Path $testPath) {
            Write-Host "Running $test test..." -ForegroundColor Gray
            & node $testPath
        } else {
            Write-Host "Test not found: $testPath" -ForegroundColor Yellow
        }
    }
}

Write-Host "`nTaskMaster execution completed." -ForegroundColor Green
