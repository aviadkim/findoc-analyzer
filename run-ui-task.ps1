# Run UI Task PowerShell Script
param(
    [Parameter(Mandatory=$true)]
    [string]$task
)

Write-Host "Running UI Task: $task" -ForegroundColor Green

# Check if Node.js is installed
try {
    $nodeVersion = node -v
    Write-Host "Node.js version: $nodeVersion" -ForegroundColor Cyan
} catch {
    Write-Host "Error: Node.js is not installed or not in PATH." -ForegroundColor Red
    Write-Host "Please install Node.js from: https://nodejs.org/" -ForegroundColor Red
    exit 1
}

# Run the specified task
switch ($task) {
    "dashboard" {
        Write-Host "Implementing Dashboard UI Components..." -ForegroundColor Cyan
        node tasks/ui/dashboard-components.js
    }
    "documents" {
        Write-Host "Implementing Documents UI Components..." -ForegroundColor Cyan
        node tasks/ui/documents-components.js
    }
    "upload" {
        Write-Host "Implementing Upload UI Components..." -ForegroundColor Cyan
        node tasks/ui/upload-components.js
    }
    "document-chat" {
        Write-Host "Implementing Document Chat UI Components..." -ForegroundColor Cyan
        node tasks/ui/document-chat-components.js
    }
    "all" {
        Write-Host "Implementing All UI Components..." -ForegroundColor Cyan
        
        Write-Host "`nImplementing Dashboard UI Components..." -ForegroundColor Cyan
        node tasks/ui/dashboard-components.js
        
        Write-Host "`nImplementing Documents UI Components..." -ForegroundColor Cyan
        node tasks/ui/documents-components.js
        
        if (Test-Path "tasks/ui/upload-components.js") {
            Write-Host "`nImplementing Upload UI Components..." -ForegroundColor Cyan
            node tasks/ui/upload-components.js
        } else {
            Write-Host "`nSkipping Upload UI Components (script not found)" -ForegroundColor Yellow
        }
        
        if (Test-Path "tasks/ui/document-chat-components.js") {
            Write-Host "`nImplementing Document Chat UI Components..." -ForegroundColor Cyan
            node tasks/ui/document-chat-components.js
        } else {
            Write-Host "`nSkipping Document Chat UI Components (script not found)" -ForegroundColor Yellow
        }
    }
    default {
        Write-Host "Error: Unknown task '$task'" -ForegroundColor Red
        Write-Host "Available tasks: dashboard, documents, upload, document-chat, all" -ForegroundColor Yellow
        exit 1
    }
}

Write-Host "`nTask completed successfully." -ForegroundColor Green
