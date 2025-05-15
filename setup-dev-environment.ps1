# FinDoc Analyzer Development Environment Setup Script
# This script sets up the development environment for the FinDoc Analyzer project

Write-Host "Setting up FinDoc Analyzer development environment..." -ForegroundColor Cyan

# Check if Node.js is installed
$nodeVersion = $null
try {
    $nodeVersion = node -v
    Write-Host "Node.js is installed: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "Node.js is not installed. Please install Node.js v16 or later." -ForegroundColor Red
    Write-Host "Download from: https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}

# Check if Python is installed
$pythonVersion = $null
try {
    $pythonVersion = python --version
    Write-Host "Python is installed: $pythonVersion" -ForegroundColor Green
} catch {
    try {
        $pythonVersion = python3 --version
        Write-Host "Python is installed: $pythonVersion" -ForegroundColor Green
    } catch {
        Write-Host "Python is not installed. Please install Python 3.8 or later." -ForegroundColor Red
        Write-Host "Download from: https://www.python.org/downloads/" -ForegroundColor Yellow
        exit 1
    }
}

# Check if Git is installed
$gitVersion = $null
try {
    $gitVersion = git --version
    Write-Host "Git is installed: $gitVersion" -ForegroundColor Green
} catch {
    Write-Host "Git is not installed. Please install Git." -ForegroundColor Red
    Write-Host "Download from: https://git-scm.com/downloads" -ForegroundColor Yellow
    exit 1
}

# Set the working directories
$rootDir = $PSScriptRoot
$backendDir = Join-Path $rootDir "DevDocs\backend"
$frontendDir = Join-Path $rootDir "DevDocs\frontend"
$finDocRagDir = Join-Path $rootDir "DevDocs\FinDocRAG"

# Create directories if they don't exist
if (-not (Test-Path $backendDir)) {
    Write-Host "Creating backend directory..." -ForegroundColor Yellow
    New-Item -ItemType Directory -Path $backendDir -Force | Out-Null
}

if (-not (Test-Path $frontendDir)) {
    Write-Host "Creating frontend directory..." -ForegroundColor Yellow
    New-Item -ItemType Directory -Path $frontendDir -Force | Out-Null
}

if (-not (Test-Path $finDocRagDir)) {
    Write-Host "Creating FinDocRAG directory..." -ForegroundColor Yellow
    New-Item -ItemType Directory -Path $finDocRagDir -Force | Out-Null
}

# Set up Python virtual environment
Write-Host "Setting up Python virtual environment..." -ForegroundColor Yellow
Set-Location $backendDir

if (-not (Test-Path "venv")) {
    python -m venv venv
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Failed to create Python virtual environment. Trying with python3..." -ForegroundColor Yellow
        python3 -m venv venv
        if ($LASTEXITCODE -ne 0) {
            Write-Host "Failed to create Python virtual environment." -ForegroundColor Red
            exit 1
        }
    }
}

# Activate virtual environment and install dependencies
Write-Host "Installing Python dependencies..." -ForegroundColor Yellow
if ($PSVersionTable.PSVersion.Major -ge 6) {
    # PowerShell Core (6.0+)
    & "$backendDir\venv\Scripts\Activate.ps1"
} else {
    # Windows PowerShell
    & "$backendDir\venv\Scripts\Activate.ps1"
}

# Create requirements.txt if it doesn't exist
if (-not (Test-Path "requirements.txt")) {
    @"
fastapi==0.95.1
uvicorn==0.22.0
python-multipart==0.0.6
pydantic==1.10.7
sqlalchemy==2.0.12
psycopg2-binary==2.9.6
python-jose==3.3.0
passlib==1.7.4
bcrypt==4.0.1
python-dotenv==1.0.0
httpx==0.24.0
pytest==7.3.1
pytest-asyncio==0.21.0
aiohttp==3.8.4
numpy==1.24.3
pandas==2.0.1
matplotlib==3.7.1
scikit-learn==1.2.2
pillow==9.5.0
pytesseract==0.3.10
pdf2image==1.16.3
camelot-py==0.10.1
opencv-python==4.7.0.72
transformers==4.29.2
torch==2.0.1
"@ | Out-File -FilePath "requirements.txt" -Encoding utf8
}

pip install -r requirements.txt
if ($LASTEXITCODE -ne 0) {
    Write-Host "Failed to install Python dependencies." -ForegroundColor Red
    exit 1
}

# Set up frontend
Write-Host "Setting up frontend..." -ForegroundColor Yellow
Set-Location $frontendDir

# Create package.json if it doesn't exist
if (-not (Test-Path "package.json")) {
    @"
{
  "name": "findoc-analyzer-frontend",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "test": "jest"
  },
  "dependencies": {
    "next": "13.4.3",
    "react": "18.2.0",
    "react-dom": "18.2.0",
    "axios": "1.4.0",
    "react-query": "3.39.3",
    "chart.js": "4.3.0",
    "react-chartjs-2": "5.2.0",
    "react-dropzone": "14.2.3",
    "react-hook-form": "7.44.2",
    "react-table": "7.8.0",
    "react-icons": "4.9.0",
    "date-fns": "2.30.0",
    "lodash": "4.17.21",
    "zustand": "4.3.8"
  },
  "devDependencies": {
    "@types/node": "20.2.5",
    "@types/react": "18.2.8",
    "@types/react-dom": "18.2.4",
    "typescript": "5.1.3",
    "eslint": "8.42.0",
    "eslint-config-next": "13.4.4",
    "jest": "29.5.0",
    "@testing-library/react": "14.0.0",
    "@testing-library/jest-dom": "5.16.5",
    "autoprefixer": "10.4.14",
    "postcss": "8.4.24",
    "tailwindcss": "3.3.2"
  }
}
"@ | Out-File -FilePath "package.json" -Encoding utf8
}

# Install frontend dependencies
Write-Host "Installing frontend dependencies..." -ForegroundColor Yellow
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "Failed to install frontend dependencies." -ForegroundColor Red
    exit 1
}

# Set up FinDocRAG
Write-Host "Setting up FinDocRAG..." -ForegroundColor Yellow
Set-Location $finDocRagDir

# Create run-findoc-rag.ps1 if it doesn't exist
if (-not (Test-Path "run-findoc-rag.ps1")) {
    @"
# FinDocRAG Backend Startup Script
# This script starts the FinDocRAG backend

Write-Host "Starting FinDocRAG backend..." -ForegroundColor Cyan

# Activate the Python virtual environment
$backendDir = Join-Path $PSScriptRoot "..\backend"
$venvActivate = Join-Path $backendDir "venv\Scripts\Activate.ps1"

if (-not (Test-Path $venvActivate)) {
    Write-Host "Error: Python virtual environment not found at $venvActivate" -ForegroundColor Red
    Write-Host "Please run the setup-dev-environment.ps1 script first." -ForegroundColor Red
    exit 1
}

# Activate the virtual environment
& $venvActivate

# Set environment variables
$env:FINDOC_RAG_PORT = "8000"
$env:FINDOC_RAG_HOST = "localhost"
$env:OPENAI_API_KEY = "your-openai-api-key"  # Replace with your actual API key or use a .env file

# Start the FinDocRAG backend
Write-Host "Starting FinDocRAG backend on http://$($env:FINDOC_RAG_HOST):$($env:FINDOC_RAG_PORT)..." -ForegroundColor Green
python -m uvicorn findoc_rag_app:app --host $env:FINDOC_RAG_HOST --port $env:FINDOC_RAG_PORT --reload

# Deactivate the virtual environment when done
deactivate
"@ | Out-File -FilePath "run-findoc-rag.ps1" -Encoding utf8
}

# Create findoc_rag_app.py if it doesn't exist
if (-not (Test-Path "findoc_rag_app.py")) {
    @"
from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Depends, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from typing import List, Optional, Dict, Any
import os
import json
import logging
import time
from datetime import datetime
import uuid

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("findoc_rag")

# Create FastAPI app
app = FastAPI(
    title="FinDocRAG API",
    description="API for FinDoc Analyzer with RAG capabilities",
    version="0.1.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory storage for demo purposes
# In production, use a database
documents = {}
chat_history = {}

@app.get("/")
async def root():
    return {"message": "Welcome to FinDocRAG API"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

@app.post("/documents/upload")
async def upload_document(
    file: UploadFile = File(...),
    document_type: str = Form("unknown"),
    description: Optional[str] = Form(None)
):
    try:
        # Generate a unique ID for the document
        doc_id = str(uuid.uuid4())
        
        # Read the file content
        content = await file.read()
        
        # In a real implementation, save the file to storage
        # and process it with OCR, table extraction, etc.
        
        # For demo purposes, just store metadata
        documents[doc_id] = {
            "id": doc_id,
            "filename": file.filename,
            "content_type": file.content_type,
            "size": len(content),
            "document_type": document_type,
            "description": description,
            "upload_time": datetime.now().isoformat(),
            "processed": False,
            "processing_status": "pending"
        }
        
        logger.info(f"Document uploaded: {file.filename}, ID: {doc_id}")
        
        return {
            "message": "Document uploaded successfully",
            "document_id": doc_id,
            "document": documents[doc_id]
        }
    except Exception as e:
        logger.error(f"Error uploading document: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error uploading document: {str(e)}")

@app.get("/documents")
async def get_documents():
    return {"documents": list(documents.values())}

@app.get("/documents/{document_id}")
async def get_document(document_id: str):
    if document_id not in documents:
        raise HTTPException(status_code=404, detail="Document not found")
    return {"document": documents[document_id]}

@app.post("/documents/{document_id}/process")
async def process_document(document_id: str):
    if document_id not in documents:
        raise HTTPException(status_code=404, detail="Document not found")
    
    # Simulate document processing
    documents[document_id]["processing_status"] = "processing"
    
    # In a real implementation, this would be a background task
    # that performs OCR, table extraction, entity recognition, etc.
    time.sleep(2)  # Simulate processing time
    
    documents[document_id]["processed"] = True
    documents[document_id]["processing_status"] = "completed"
    documents[document_id]["processed_time"] = datetime.now().isoformat()
    
    # Add some dummy extracted data
    documents[document_id]["extracted_data"] = {
        "tables": [
            {"id": "table1", "rows": 5, "columns": 3, "title": "Financial Summary"}
        ],
        "entities": [
            {"type": "organization", "text": "Example Corp", "count": 3},
            {"type": "date", "text": "2023-05-15", "count": 2},
            {"type": "amount", "text": "$1,234,567", "count": 1}
        ]
    }
    
    logger.info(f"Document processed: {document_id}")
    
    return {"message": "Document processed successfully", "document": documents[document_id]}

@app.post("/chat/{document_id}")
async def chat_with_document(
    document_id: str,
    query: Dict[str, Any]
):
    if document_id not in documents:
        raise HTTPException(status_code=404, detail="Document not found")
    
    if not documents[document_id]["processed"]:
        raise HTTPException(status_code=400, detail="Document has not been processed yet")
    
    user_query = query.get("message", "")
    if not user_query:
        raise HTTPException(status_code=400, detail="Query message is required")
    
    # Initialize chat history for this document if it doesn't exist
    if document_id not in chat_history:
        chat_history[document_id] = []
    
    # Add user message to chat history
    chat_history[document_id].append({"role": "user", "content": user_query})
    
    # In a real implementation, this would use a RAG system to generate a response
    # based on the document content and the user's query
    
    # Simulate a response
    response = f"This is a simulated response to your query: '{user_query}'"
    
    # Add assistant response to chat history
    chat_history[document_id].append({"role": "assistant", "content": response})
    
    logger.info(f"Chat query for document {document_id}: {user_query}")
    
    return {
        "message": "Query processed successfully",
        "response": response,
        "chat_history": chat_history[document_id]
    }

@app.get("/chat/{document_id}/history")
async def get_chat_history(document_id: str):
    if document_id not in documents:
        raise HTTPException(status_code=404, detail="Document not found")
    
    if document_id not in chat_history:
        return {"chat_history": []}
    
    return {"chat_history": chat_history[document_id]}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
"@ | Out-File -FilePath "findoc_rag_app.py" -Encoding utf8
}

# Return to the root directory
Set-Location $rootDir

# Create run-findoc-with-rag.ps1 in the root directory
Write-Host "Creating startup scripts..." -ForegroundColor Yellow
@"
# FinDoc Analyzer with FinDocRAG Startup Script
# This script starts both the FinDoc Analyzer frontend and the FinDocRAG backend

Write-Host "Starting FinDoc Analyzer with FinDocRAG..." -ForegroundColor Cyan

# Stop any existing Node.js and Python processes
Write-Host "Stopping any existing Node.js and Python processes..." -ForegroundColor Yellow
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force
Get-Process python -ErrorAction SilentlyContinue | Stop-Process -Force

# Set the working directories
$frontendDir = Join-Path $PSScriptRoot "DevDocs\frontend"
$finDocRagDir = Join-Path $PSScriptRoot "DevDocs\FinDocRAG"

# Check if the directories exist
if (-not (Test-Path $frontendDir)) {
    Write-Host "Error: Frontend directory not found at $frontendDir" -ForegroundColor Red
    Write-Host "Please make sure you're running this script from the correct location." -ForegroundColor Red
    exit 1
}

if (-not (Test-Path $finDocRagDir)) {
    Write-Host "Error: FinDocRAG directory not found at $finDocRagDir" -ForegroundColor Red
    Write-Host "Please make sure you're running this script from the correct location." -ForegroundColor Red
    exit 1
}

# Start the FinDocRAG backend in a new PowerShell window
Write-Host "Starting FinDocRAG backend..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-ExecutionPolicy Bypass -File `"$finDocRagDir\run-findoc-rag.ps1`""

# Wait for the FinDocRAG backend to start
Write-Host "Waiting for FinDocRAG backend to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Change to the frontend directory
Set-Location $frontendDir

# Check if node_modules exists, if not, install dependencies
if (-not (Test-Path "node_modules")) {
    Write-Host "Installing frontend dependencies..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Error: Failed to install dependencies" -ForegroundColor Red
        exit 1
    }
}

# Start the development server
Write-Host "Starting Next.js frontend..." -ForegroundColor Green
Write-Host "The application will be available at http://localhost:3002" -ForegroundColor Cyan
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow

# Start the Next.js development server on port 3002
npm run dev -- -p 3002

# Return to the original directory
Set-Location $PSScriptRoot

# Stop the FinDocRAG backend when the frontend is stopped
Write-Host "Stopping FinDocRAG backend..." -ForegroundColor Yellow
Get-Process python -ErrorAction SilentlyContinue | Stop-Process -Force

Write-Host "FinDoc Analyzer with FinDocRAG has been stopped." -ForegroundColor Cyan
"@ | Out-File -FilePath "run-findoc-with-rag.ps1" -Encoding utf8

# Create run-findoc-simple.ps1 in the root directory
@"
# FinDoc Analyzer Startup Script
# This script starts the FinDoc Analyzer frontend application

Write-Host "Starting FinDoc Analyzer..." -ForegroundColor Cyan

# Stop any existing Node.js processes
Write-Host "Stopping any existing Node.js processes..." -ForegroundColor Yellow
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force

# Set the working directory to the frontend directory
$frontendDir = Join-Path $PSScriptRoot "DevDocs\frontend"

# Check if the directory exists
if (-not (Test-Path $frontendDir)) {
    Write-Host "Error: Frontend directory not found at $frontendDir" -ForegroundColor Red
    Write-Host "Please make sure you're running this script from the correct location." -ForegroundColor Red
    exit 1
}

# Change to the frontend directory
Set-Location $frontendDir

# Check if node_modules exists, if not, install dependencies
if (-not (Test-Path "node_modules")) {
    Write-Host "Installing dependencies..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Error: Failed to install dependencies" -ForegroundColor Red
        exit 1
    }
}

# Start the development server
Write-Host "Starting Next.js frontend..." -ForegroundColor Green
Write-Host "The application will be available at http://localhost:3002" -ForegroundColor Cyan
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow

# Start the Next.js development server on port 3002
npm run dev -- -p 3002

# Return to the original directory
Set-Location $PSScriptRoot
"@ | Out-File -FilePath "run-findoc-simple.ps1" -Encoding utf8

Write-Host "Development environment setup complete!" -ForegroundColor Green
Write-Host "To start the application with FinDocRAG, run: .\run-findoc-with-rag.ps1" -ForegroundColor Cyan
Write-Host "To start the frontend only, run: .\run-findoc-simple.ps1" -ForegroundColor Cyan
