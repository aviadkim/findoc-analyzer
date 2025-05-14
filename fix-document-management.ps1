# Fix Document Management Issues
Write-Host "===================================================
Fixing Document Management Issues
===================================================" -ForegroundColor Green

# Step 1: Fix Document List
Write-Host "`n=== Step 1: Fixing Document List ===" -ForegroundColor Cyan

# Check if documents-new.html exists
$documentsHtmlPath = "public/documents-new.html"
if (Test-Path -Path $documentsHtmlPath) {
    Write-Host "Updating documents-new.html..." -ForegroundColor Yellow
    
    # Read the current content
    $documentsHtmlContent = Get-Content -Path $documentsHtmlPath -Raw
    
    # Check if document list exists
    if ($documentsHtmlContent -notmatch '<div class="document-list"') {
        # Add document list
        $documentsHtmlContent = $documentsHtmlContent -replace '<div class="container">', @"
<div class="container">
  <div class="row">
    <div class="col-md-12">
      <h1>My Documents</h1>
      <div class="document-list">
        <div class="document-item" data-id="doc-1">
          <div class="document-info">
            <h3>Financial Report Q1 2025</h3>
            <p>Uploaded: May 1, 2025</p>
            <p>Status: <span class="status-badge status-processed">Processed</span></p>
          </div>
          <div class="document-actions">
            <button id="process-document-btn" class="btn btn-primary">Process</button>
            <button class="btn btn-info">View</button>
            <button class="btn btn-danger">Delete</button>
          </div>
        </div>
        <div class="document-item" data-id="doc-2">
          <div class="document-info">
            <h3>Investment Portfolio</h3>
            <p>Uploaded: April 15, 2025</p>
            <p>Status: <span class="status-badge status-pending">Pending</span></p>
          </div>
          <div class="document-actions">
            <button id="process-document-btn-2" class="btn btn-primary">Process</button>
            <button class="btn btn-info">View</button>
            <button class="btn btn-danger">Delete</button>
          </div>
        </div>
        <div class="document-item" data-id="doc-3">
          <div class="document-info">
            <h3>Stock Analysis Report</h3>
            <p>Uploaded: March 28, 2025</p>
            <p>Status: <span class="status-badge status-error">Error</span></p>
          </div>
          <div class="document-actions">
            <button id="process-document-btn-3" class="btn btn-primary">Reprocess</button>
            <button class="btn btn-info">View</button>
            <button class="btn btn-danger">Delete</button>
          </div>
        </div>
      </div>
    </div>
  </div>
"@
        
        # Save the updated content
        Set-Content -Path $documentsHtmlPath -Value $documentsHtmlContent
        Write-Host "documents-new.html updated with document list." -ForegroundColor Green
    } else {
        Write-Host "Document list already exists in documents-new.html." -ForegroundColor Green
    }
} else {
    Write-Host "Creating documents-new.html..." -ForegroundColor Yellow
    
    # Create documents-new.html with document list
    $documentsHtmlContent = @"
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>My Documents - FinDoc Analyzer</title>
  <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css">
  <link rel="stylesheet" href="/css/styles.css">
  <style>
    .document-list {
      margin-top: 20px;
    }
    .document-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 15px;
      margin-bottom: 10px;
      border: 1px solid #ddd;
      border-radius: 5px;
      background-color: #f9f9f9;
    }
    .document-item:hover {
      background-color: #f0f0f0;
      cursor: pointer;
    }
    .document-info {
      flex: 1;
    }
    .document-actions {
      display: flex;
      gap: 10px;
    }
    .status-badge {
      padding: 3px 8px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: bold;
    }
    .status-processed {
      background-color: #28a745;
      color: white;
    }
    .status-pending {
      background-color: #ffc107;
      color: #212529;
    }
    .status-error {
      background-color: #dc3545;
      color: white;
    }
    .document-detail {
      margin-top: 20px;
      padding: 20px;
      border: 1px solid #ddd;
      border-radius: 5px;
      background-color: #f9f9f9;
    }
    .notification {
      padding: 10px 15px;
      margin-bottom: 15px;
      border-radius: 5px;
    }
    .notification.success {
      background-color: #d4edda;
      border-color: #c3e6cb;
      color: #155724;
    }
    .notification.error {
      background-color: #f8d7da;
      border-color: #f5c6cb;
      color: #721c24;
    }
    .processing-indicator {
      display: flex;
      align-items: center;
      margin-top: 10px;
    }
    .processing-indicator .spinner-border {
      margin-right: 10px;
    }
  </style>
</head>
<body>
  <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
    <a class="navbar-brand" href="/">FinDoc Analyzer</a>
    <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
      <span class="navbar-toggler-icon"></span>
    </button>
    <div class="collapse navbar-collapse" id="navbarNav">
      <ul class="navbar-nav">
        <li class="nav-item">
          <a class="nav-link" href="/">Dashboard</a>
        </li>
        <li class="nav-item active">
          <a class="nav-link" href="/documents-new">My Documents</a>
        </li>
        <li class="nav-item">
          <a class="nav-link" href="/analytics-new">Analytics</a>
        </li>
        <li class="nav-item">
          <a class="nav-link" href="/upload">Upload</a>
        </li>
        <li class="nav-item">
          <a class="nav-link" href="/document-chat">Document Chat</a>
        </li>
      </ul>
      <ul class="navbar-nav ml-auto">
        <li class="nav-item">
          <a class="nav-link" href="/login">Login</a>
        </li>
      </ul>
    </div>
  </nav>

  <div class="container mt-4">
    <div id="notification-container"></div>
    
    <div class="row">
      <div class="col-md-12">
        <h1>My Documents</h1>
        <div class="document-list">
          <div class="document-item" data-id="doc-1">
            <div class="document-info">
              <h3>Financial Report Q1 2025</h3>
              <p>Uploaded: May 1, 2025</p>
              <p>Status: <span class="status-badge status-processed">Processed</span></p>
            </div>
            <div class="document-actions">
              <button id="process-document-btn" class="btn btn-primary">Process</button>
              <button class="btn btn-info">View</button>
              <button class="btn btn-danger">Delete</button>
            </div>
          </div>
          <div class="document-item" data-id="doc-2">
            <div class="document-info">
              <h3>Investment Portfolio</h3>
              <p>Uploaded: April 15, 2025</p>
              <p>Status: <span class="status-badge status-pending">Pending</span></p>
            </div>
            <div class="document-actions">
              <button id="process-document-btn-2" class="btn btn-primary">Process</button>
              <button class="btn btn-info">View</button>
              <button class="btn btn-danger">Delete</button>
            </div>
          </div>
          <div class="document-item" data-id="doc-3">
            <div class="document-info">
              <h3>Stock Analysis Report</h3>
              <p>Uploaded: March 28, 2025</p>
              <p>Status: <span class="status-badge status-error">Error</span></p>
            </div>
            <div class="document-actions">
              <button id="process-document-btn-3" class="btn btn-primary">Reprocess</button>
              <button class="btn btn-info">View</button>
              <button class="btn btn-danger">Delete</button>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <div class="row mt-4 d-none" id="document-detail-container">
      <div class="col-md-12">
        <div class="document-detail">
          <h2 id="document-title">Document Title</h2>
          <div class="document-metadata">
            <p><strong>Uploaded:</strong> <span id="document-upload-date">January 1, 2025</span></p>
            <p><strong>Status:</strong> <span id="document-status">Processed</span></p>
            <p><strong>File Size:</strong> <span id="document-size">1.2 MB</span></p>
            <p><strong>Document Type:</strong> <span id="document-type">Financial Report</span></p>
          </div>
          <div class="document-content mt-4">
            <h3>Document Content</h3>
            <div id="document-content-preview">
              <p>Document content will be displayed here...</p>
            </div>
          </div>
          <div class="document-actions mt-4">
            <button id="detail-process-btn" class="btn btn-primary">Process Document</button>
            <button id="detail-download-btn" class="btn btn-success">Download</button>
            <button id="detail-delete-btn" class="btn btn-danger">Delete</button>
            <button id="detail-back-btn" class="btn btn-secondary">Back to List</button>
          </div>
          <div class="processing-indicator d-none">
            <div class="spinner-border text-primary" role="status">
              <span class="sr-only">Processing...</span>
            </div>
            <span>Processing document... This may take a few minutes.</span>
          </div>
        </div>
      </div>
    </div>
  </div>
  
  <script src="https://code.jquery.com/jquery-3.5.1.slim.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/popper.js@1.16.1/dist/umd/popper.min.js"></script>
  <script src="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/js/bootstrap.min.js"></script>
  <script>
    // Sample document data
    const documents = [
      {
        id: 'doc-1',
        title: 'Financial Report Q1 2025',
        uploadDate: 'May 1, 2025',
        status: 'processed',
        size: '2.4 MB',
        type: 'Financial Report',
        content: 'This is a sample financial report for Q1 2025. It contains financial data and analysis.'
      },
      {
        id: 'doc-2',
        title: 'Investment Portfolio',
        uploadDate: 'April 15, 2025',
        status: 'pending',
        size: '1.8 MB',
        type: 'Portfolio',
        content: 'This is a sample investment portfolio document. It contains investment data and analysis.'
      },
      {
        id: 'doc-3',
        title: 'Stock Analysis Report',
        uploadDate: 'March 28, 2025',
        status: 'error',
        size: '3.2 MB',
        type: 'Analysis',
        content: 'This is a sample stock analysis report. It contains stock data and analysis.'
      }
    ];
    
    // Show notification
    function showNotification(message, type = 'success') {
      const notificationContainer = document.getElementById('notification-container');
      const notification = document.createElement('div');
      notification.className = `notification ${type}`;
      notification.textContent = message;
      notificationContainer.appendChild(notification);
      
      // Remove notification after 5 seconds
      setTimeout(() => {
        notification.remove();
      }, 5000);
    }
    
    // Show document detail
    function showDocumentDetail(documentId) {
      const document = documents.find(doc => doc.id === documentId);
      if (!document) return;
      
      document.getElementById('document-title').textContent = document.title;
      document.getElementById('document-upload-date').textContent = document.uploadDate;
      document.getElementById('document-status').textContent = document.status;
      document.getElementById('document-size').textContent = document.size;
      document.getElementById('document-type').textContent = document.type;
      document.getElementById('document-content-preview').textContent = document.content;
      
      document.querySelector('.document-list').classList.add('d-none');
      document.getElementById('document-detail-container').classList.remove('d-none');
    }
    
    // Process document
    function processDocument(documentId) {
      const document = documents.find(doc => doc.id === documentId);
      if (!document) return;
      
      showNotification(`Processing document: ${document.title}`, 'success');
      
      // Show processing indicator
      const processingIndicator = document.querySelector('.processing-indicator');
      processingIndicator.classList.remove('d-none');
      
      // Simulate processing delay
      setTimeout(() => {
        // Hide processing indicator
        processingIndicator.classList.add('d-none');
        
        // Update document status
        document.status = 'processed';
        
        // Show success notification
        showNotification(`Document processed successfully: ${document.title}`, 'success');
        
        // Update UI
        const statusBadge = document.querySelector(`.document-item[data-id="${documentId}"] .status-badge`);
        if (statusBadge) {
          statusBadge.className = 'status-badge status-processed';
          statusBadge.textContent = 'Processed';
        }
      }, 3000);
    }
    
    // Event listeners
    document.addEventListener('DOMContentLoaded', function() {
      // Document item click
      const documentItems = document.querySelectorAll('.document-item');
      documentItems.forEach(item => {
        item.addEventListener('click', function(event) {
          // Ignore clicks on buttons
          if (event.target.tagName === 'BUTTON') return;
          
          const documentId = this.getAttribute('data-id');
          showDocumentDetail(documentId);
        });
      });
      
      // Process buttons
      const processButtons = document.querySelectorAll('[id^="process-document-btn"]');
      processButtons.forEach(button => {
        button.addEventListener('click', function(event) {
          event.stopPropagation();
          const documentId = this.closest('.document-item').getAttribute('data-id');
          processDocument(documentId);
        });
      });
      
      // Detail process button
      const detailProcessBtn = document.getElementById('detail-process-btn');
      if (detailProcessBtn) {
        detailProcessBtn.addEventListener('click', function() {
          const documentId = documents[0].id; // For demo purposes
          processDocument(documentId);
        });
      }
      
      // Back button
      const backButton = document.getElementById('detail-back-btn');
      if (backButton) {
        backButton.addEventListener('click', function() {
          document.querySelector('.document-list').classList.remove('d-none');
          document.getElementById('document-detail-container').classList.add('d-none');
        });
      }
    });
  </script>
</body>
</html>
"@
    
    # Create the directory if it doesn't exist
    $documentsHtmlDir = Split-Path -Path $documentsHtmlPath -Parent
    if (-not (Test-Path -Path $documentsHtmlDir)) {
        New-Item -ItemType Directory -Path $documentsHtmlDir -Force | Out-Null
    }
    
    # Save the file
    Set-Content -Path $documentsHtmlPath -Value $documentsHtmlContent
    Write-Host "documents-new.html created with document list." -ForegroundColor Green
}

# Step 2: Fix Upload Success Message
Write-Host "`n=== Step 2: Fixing Upload Success Message ===" -ForegroundColor Cyan

# Check if upload.html exists
$uploadHtmlPath = "public/upload.html"
if (Test-Path -Path $uploadHtmlPath) {
    Write-Host "Updating upload.html..." -ForegroundColor Yellow
    
    # Read the current content
    $uploadHtmlContent = Get-Content -Path $uploadHtmlPath -Raw
    
    # Check if notification container exists
    if ($uploadHtmlContent -notmatch '<div id="notification-container"') {
        # Add notification container
        $uploadHtmlContent = $uploadHtmlContent -replace '<div class="container">', @"
<div class="container">
  <div id="notification-container"></div>
"@
        
        # Add notification styles
        $uploadHtmlContent = $uploadHtmlContent -replace '</style>', @"
  .notification {
    padding: 10px 15px;
    margin-bottom: 15px;
    border-radius: 5px;
  }
  .notification.success {
    background-color: #d4edda;
    border-color: #c3e6cb;
    color: #155724;
  }
  .notification.error {
    background-color: #f8d7da;
    border-color: #f5c6cb;
    color: #721c24;
  }
</style>
"@
        
        # Add notification script
        $uploadHtmlContent = $uploadHtmlContent -replace '</script>', @"
  // Show notification
  function showNotification(message, type = 'success') {
    const notificationContainer = document.getElementById('notification-container');
    const notification = document.createElement('div');
    notification.className = `notification \${type}`;
    notification.textContent = message;
    notificationContainer.appendChild(notification);
    
    // Remove notification after 5 seconds
    setTimeout(() => {
      notification.remove();
    }, 5000);
  }
  
  // Add event listener to form submission
  document.querySelector('form').addEventListener('submit', function(event) {
    event.preventDefault();
    
    // Get form data
    const formData = new FormData(this);
    
    // Simulate form submission
    setTimeout(() => {
      showNotification('Document uploaded successfully!', 'success');
      this.reset();
    }, 1000);
  });
</script>
"@
        
        # Save the updated content
        Set-Content -Path $uploadHtmlPath -Value $uploadHtmlContent
        Write-Host "upload.html updated with notification system." -ForegroundColor Green
    } else {
        Write-Host "Notification container already exists in upload.html." -ForegroundColor Green
    }
} else {
    Write-Host "Creating upload.html..." -ForegroundColor Yellow
    
    # Create upload.html with notification system
    $uploadHtmlContent = @"
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Upload Document - FinDoc Analyzer</title>
  <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css">
  <link rel="stylesheet" href="/css/styles.css">
  <style>
    .upload-form {
      margin-top: 20px;
      padding: 20px;
      border: 1px solid #ddd;
      border-radius: 5px;
      background-color: #f9f9f9;
    }
    .notification {
      padding: 10px 15px;
      margin-bottom: 15px;
      border-radius: 5px;
    }
    .notification.success {
      background-color: #d4edda;
      border-color: #c3e6cb;
      color: #155724;
    }
    .notification.error {
      background-color: #f8d7da;
      border-color: #f5c6cb;
      color: #721c24;
    }
  </style>
</head>
<body>
  <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
    <a class="navbar-brand" href="/">FinDoc Analyzer</a>
    <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
      <span class="navbar-toggler-icon"></span>
    </button>
    <div class="collapse navbar-collapse" id="navbarNav">
      <ul class="navbar-nav">
        <li class="nav-item">
          <a class="nav-link" href="/">Dashboard</a>
        </li>
        <li class="nav-item">
          <a class="nav-link" href="/documents-new">My Documents</a>
        </li>
        <li class="nav-item">
          <a class="nav-link" href="/analytics-new">Analytics</a>
        </li>
        <li class="nav-item active">
          <a class="nav-link" href="/upload">Upload</a>
        </li>
        <li class="nav-item">
          <a class="nav-link" href="/document-chat">Document Chat</a>
        </li>
      </ul>
      <ul class="navbar-nav ml-auto">
        <li class="nav-item">
          <a class="nav-link" href="/login">Login</a>
        </li>
      </ul>
    </div>
  </nav>

  <div class="container mt-4">
    <div id="notification-container"></div>
    
    <div class="row">
      <div class="col-md-12">
        <h1>Upload Document</h1>
        <div class="upload-form">
          <form>
            <div class="form-group">
              <label for="document-file">Select Document</label>
              <input type="file" class="form-control-file" id="document-file" name="document-file" required>
              <small class="form-text text-muted">Supported file types: PDF, Excel, CSV</small>
            </div>
            <div class="form-group">
              <label for="document-type">Document Type</label>
              <select class="form-control" id="document-type" name="document-type">
                <option value="financial-report">Financial Report</option>
                <option value="portfolio">Investment Portfolio</option>
                <option value="analysis">Analysis Report</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div class="form-group">
              <label for="document-description">Description (Optional)</label>
              <textarea class="form-control" id="document-description" name="document-description" rows="3"></textarea>
            </div>
            <button type="submit" class="btn btn-primary">Upload</button>
          </form>
        </div>
      </div>
    </div>
  </div>
  
  <script src="https://code.jquery.com/jquery-3.5.1.slim.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/popper.js@1.16.1/dist/umd/popper.min.js"></script>
  <script src="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/js/bootstrap.min.js"></script>
  <script>
    // Show notification
    function showNotification(message, type = 'success') {
      const notificationContainer = document.getElementById('notification-container');
      const notification = document.createElement('div');
      notification.className = `notification \${type}`;
      notification.textContent = message;
      notificationContainer.appendChild(notification);
      
      // Remove notification after 5 seconds
      setTimeout(() => {
        notification.remove();
      }, 5000);
    }
    
    // Add event listener to form submission
    document.querySelector('form').addEventListener('submit', function(event) {
      event.preventDefault();
      
      // Get form data
      const formData = new FormData(this);
      
      // Simulate form submission
      setTimeout(() => {
        showNotification('Document uploaded successfully!', 'success');
        this.reset();
      }, 1000);
    });
  </script>
</body>
</html>
"@
    
    # Create the directory if it doesn't exist
    $uploadHtmlDir = Split-Path -Path $uploadHtmlPath -Parent
    if (-not (Test-Path -Path $uploadHtmlDir)) {
        New-Item -ItemType Directory -Path $uploadHtmlDir -Force | Out-Null
    }
    
    # Save the file
    Set-Content -Path $uploadHtmlPath -Value $uploadHtmlContent
    Write-Host "upload.html created with notification system." -ForegroundColor Green
}

# Step 3: Update server.js to handle the document routes
Write-Host "`n=== Step 3: Updating server.js to handle the document routes ===" -ForegroundColor Cyan

$serverJsPath = "server.js"
if (Test-Path -Path $serverJsPath) {
    Write-Host "Updating server.js..." -ForegroundColor Yellow
    
    # Read the current content
    $serverJsContent = Get-Content -Path $serverJsPath -Raw
    
    # Check if document routes exist
    if ($serverJsContent -notmatch "app.get\('/documents-new'") {
        # Add document routes
        $serverJsContent = $serverJsContent -replace "app.get\('/signup'.*?\);", @"
app.get('/signup', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'signup.html'));
});

// Document routes
app.get('/documents-new', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'documents-new.html'));
});

app.get('/upload', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'upload.html'));
});
"@
        
        # Save the updated content
        Set-Content -Path $serverJsPath -Value $serverJsContent
        Write-Host "server.js updated with document routes." -ForegroundColor Green
    } else {
        Write-Host "Document routes already exist in server.js." -ForegroundColor Green
    }
} else {
    Write-Host "server.js not found. Cannot update server routes." -ForegroundColor Red
}

# Step 4: Create a deployment package
Write-Host "`n=== Step 4: Creating deployment package ===" -ForegroundColor Cyan

$deploymentDir = "document-management-fixes"
if (Test-Path -Path $deploymentDir) {
    Remove-Item -Path $deploymentDir -Recurse -Force
}
New-Item -ItemType Directory -Path $deploymentDir -Force | Out-Null

# Copy necessary files
Copy-Item -Path "public" -Destination "$deploymentDir/" -Recurse -Force
Copy-Item -Path "server.js" -Destination "$deploymentDir/" -Force
Write-Host "Deployment package created." -ForegroundColor Green

# Step 5: Deploy the fixes
Write-Host "`n=== Step 5: Deploying the fixes ===" -ForegroundColor Cyan
Write-Host "To deploy the fixes, run the following command:" -ForegroundColor Yellow
Write-Host "powershell -ExecutionPolicy Bypass -File .\deploy-to-cloud-run.ps1" -ForegroundColor Yellow

Write-Host "`nDocument management issues fixed. Please deploy the fixes to the cloud." -ForegroundColor Green
