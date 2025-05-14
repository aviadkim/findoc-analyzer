# Implement Docling Integration
Write-Host "===================================================
Implementing Docling Integration
===================================================" -ForegroundColor Green

# Step 1: Create necessary directories
Write-Host "`n=== Step 1: Creating necessary directories ===" -ForegroundColor Cyan
if (-not (Test-Path -Path "controllers")) {
    New-Item -ItemType Directory -Path "controllers" -Force | Out-Null
}
if (-not (Test-Path -Path "routes")) {
    New-Item -ItemType Directory -Path "routes" -Force | Out-Null
}
if (-not (Test-Path -Path "test-files")) {
    New-Item -ItemType Directory -Path "test-files" -Force | Out-Null
}
if (-not (Test-Path -Path "results")) {
    New-Item -ItemType Directory -Path "results" -Force | Out-Null
}
if (-not (Test-Path -Path "uploads")) {
    New-Item -ItemType Directory -Path "uploads" -Force | Out-Null
}
Write-Host "Directories created." -ForegroundColor Green

# Step 2: Install required packages
Write-Host "`n=== Step 2: Installing required packages ===" -ForegroundColor Cyan
npm install axios form-data
Write-Host "Required packages installed." -ForegroundColor Green

# Step 3: Copy Docling integration files
Write-Host "`n=== Step 3: Copying Docling integration files ===" -ForegroundColor Cyan
Copy-Item -Path "docling-integration.js" -Destination "." -Force
Copy-Item -Path "controllers/doclingController.js" -Destination "controllers/" -Force
Copy-Item -Path "routes/doclingRoutes.js" -Destination "routes/" -Force
Write-Host "Docling integration files copied." -ForegroundColor Green

# Step 4: Update server.js to include Docling routes
Write-Host "`n=== Step 4: Updating server.js to include Docling routes ===" -ForegroundColor Cyan
$serverJsPath = "server.js"
$serverJsContent = Get-Content -Path $serverJsPath -Raw

if (-not ($serverJsContent -match "/api/docling")) {
    $updatedServerJsContent = $serverJsContent -replace "// Direct scan1 routes", "// Direct scan1 routes`n`n// Docling routes`ntry {`n  const doclingRoutes = require('./routes/doclingRoutes');`n  app.use('/api/docling', doclingRoutes);`n  console.log('Successfully imported Docling routes');`n} catch (error) {`n  console.warn('Error importing Docling routes:', error.message);`n  `n  // Create mock Docling routes`n  app.get('/api/docling/status', (req, res) => {`n    res.status(200).json({`n      success: true,`n      doclingConfigured: false,`n      message: 'Docling routes not available',`n      error: 'The Docling routes module could not be loaded'`n    });`n  });`n  `n  app.post('/api/docling/process/:id', (req, res) => {`n    res.status(500).json({`n      success: false,`n      error: 'Docling routes not available',`n      message: 'The Docling routes module could not be loaded'`n    });`n  });`n}`n`n// Direct scan1 routes"
    Set-Content -Path $serverJsPath -Value $updatedServerJsContent
    Write-Host "server.js updated to include Docling routes." -ForegroundColor Green
} else {
    Write-Host "server.js already includes Docling routes." -ForegroundColor Green
}

# Step 5: Create test PDF file
Write-Host "`n=== Step 5: Creating test PDF file ===" -ForegroundColor Cyan
$testPdfPath = "test-files/test.pdf"
if (-not (Test-Path -Path $testPdfPath)) {
    $testPdfContent = @"
%PDF-1.5
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>
endobj
4 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
5 0 obj
<< /Length 178 >>
stream
BT
/F1 12 Tf
72 720 Td
(This is a test PDF document for QA testing.) Tj
0 -20 Td
(It contains an ISIN code: US0378331005 (Apple Inc.)) Tj
0 -20 Td
(And another one: US5949181045 (Microsoft Corporation)) Tj
ET
endstream
endobj
xref
0 6
0000000000 65535 f
0000000010 00000 n
0000000059 00000 n
0000000118 00000 n
0000000217 00000 n
0000000284 00000 n
trailer
<< /Size 6 /Root 1 0 R >>
startxref
514
%%EOF
"@
    Set-Content -Path $testPdfPath -Value $testPdfContent -Encoding Byte
    Write-Host "Test PDF file created." -ForegroundColor Green
} else {
    Write-Host "Test PDF file already exists." -ForegroundColor Green
}

# Step 6: Create test document in uploads directory
Write-Host "`n=== Step 6: Creating test document in uploads directory ===" -ForegroundColor Cyan
$testDocumentPath = "uploads/test-document"
if (-not (Test-Path -Path $testDocumentPath)) {
    Copy-Item -Path $testPdfPath -Destination $testDocumentPath -Force
    Write-Host "Test document created in uploads directory." -ForegroundColor Green
} else {
    Write-Host "Test document already exists in uploads directory." -ForegroundColor Green
}

# Step 7: Run Docling integration tests
Write-Host "`n=== Step 7: Running Docling integration tests ===" -ForegroundColor Cyan
node test-docling-integration.js
Write-Host "Docling integration tests completed." -ForegroundColor Green

Write-Host "`nDocling integration implemented successfully." -ForegroundColor Green
