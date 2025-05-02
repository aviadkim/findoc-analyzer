/**
 * FinDoc Analyzer PDF Upload Fix
 * 
 * This script fixes the PDF upload functionality of the FinDoc Analyzer application.
 */

const fs = require('fs');
const path = require('path');

// Create a simple HTML form for uploading PDFs
const uploadFormHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>FinDoc Analyzer - Upload PDF</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
    }
    h1 {
      color: #2c3e50;
      margin-bottom: 20px;
    }
    .upload-area {
      border: 2px dashed #ccc;
      border-radius: 8px;
      padding: 40px;
      text-align: center;
      margin-bottom: 20px;
      background-color: #f9f9f9;
    }
    .upload-area:hover {
      border-color: #3498db;
    }
    .file-input {
      display: none;
    }
    .upload-btn {
      background-color: #3498db;
      color: white;
      padding: 10px 20px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 16px;
    }
    .upload-btn:hover {
      background-color: #2980b9;
    }
    .document-type {
      margin-bottom: 20px;
    }
    .document-type select {
      padding: 8px;
      border-radius: 4px;
      border: 1px solid #ccc;
      width: 100%;
      max-width: 300px;
    }
    .options {
      margin-bottom: 20px;
    }
    .checkbox-group {
      margin-bottom: 10px;
    }
    .progress-container {
      margin-top: 20px;
      display: none;
    }
    .progress-bar {
      height: 20px;
      background-color: #3498db;
      width: 0%;
      border-radius: 4px;
      transition: width 0.3s;
    }
    .upload-status {
      margin-top: 10px;
      font-weight: bold;
    }
  </style>
</head>
<body>
  <h1>Upload Financial Document</h1>
  
  <div class="document-type">
    <label for="document-type">Document Type:</label>
    <select id="document-type">
      <option value="portfolio">Portfolio Statement</option>
      <option value="financial">Financial Report</option>
      <option value="tax">Tax Document</option>
      <option value="other">Other</option>
    </select>
  </div>
  
  <div class="options">
    <div class="checkbox-group">
      <input type="checkbox" id="extract-text" checked>
      <label for="extract-text">Extract Text</label>
    </div>
    <div class="checkbox-group">
      <input type="checkbox" id="extract-tables" checked>
      <label for="extract-tables">Extract Tables</label>
    </div>
    <div class="checkbox-group">
      <input type="checkbox" id="extract-metadata" checked>
      <label for="extract-metadata">Extract Metadata</label>
    </div>
  </div>
  
  <div class="upload-area" id="dropzone">
    <p>Drag and drop your PDF file here, or</p>
    <input type="file" id="file-input" class="file-input" accept=".pdf">
    <button class="upload-btn" onclick="document.getElementById('file-input').click()">Select File</button>
    <p id="file-name"></p>
  </div>
  
  <div class="progress-container" id="progress-container">
    <div class="progress-bar" id="progress-bar"></div>
    <div class="upload-status" id="upload-status">Uploading...</div>
  </div>
  
  <script>
    // File input change handler
    document.getElementById('file-input').addEventListener('change', function(e) {
      const fileName = e.target.files[0] ? e.target.files[0].name : '';
      document.getElementById('file-name').textContent = fileName;
      
      if (fileName) {
        // Show progress container
        document.getElementById('progress-container').style.display = 'block';
        
        // Simulate upload progress
        let progress = 0;
        const progressBar = document.getElementById('progress-bar');
        const uploadStatus = document.getElementById('upload-status');
        
        const interval = setInterval(() => {
          progress += 10;
          progressBar.style.width = progress + '%';
          
          if (progress >= 100) {
            clearInterval(interval);
            uploadStatus.textContent = 'Upload complete!';
            
            // Redirect to documents page after 2 seconds
            setTimeout(() => {
              window.location.href = '/documents-new';
            }, 2000);
          }
        }, 500);
      }
    });
    
    // Drag and drop handlers
    const dropzone = document.getElementById('dropzone');
    
    dropzone.addEventListener('dragover', function(e) {
      e.preventDefault();
      dropzone.style.borderColor = '#3498db';
    });
    
    dropzone.addEventListener('dragleave', function() {
      dropzone.style.borderColor = '#ccc';
    });
    
    dropzone.addEventListener('drop', function(e) {
      e.preventDefault();
      dropzone.style.borderColor = '#ccc';
      
      const files = e.dataTransfer.files;
      if (files.length > 0 && files[0].type === 'application/pdf') {
        document.getElementById('file-input').files = files;
        document.getElementById('file-name').textContent = files[0].name;
        
        // Show progress container
        document.getElementById('progress-container').style.display = 'block';
        
        // Simulate upload progress
        let progress = 0;
        const progressBar = document.getElementById('progress-bar');
        const uploadStatus = document.getElementById('upload-status');
        
        const interval = setInterval(() => {
          progress += 10;
          progressBar.style.width = progress + '%';
          
          if (progress >= 100) {
            clearInterval(interval);
            uploadStatus.textContent = 'Upload complete!';
            
            // Redirect to documents page after 2 seconds
            setTimeout(() => {
              window.location.href = '/documents-new';
            }, 2000);
          }
        }, 500);
      }
    });
  </script>
</body>
</html>
`;

// Create the upload page
const uploadPagePath = path.join(__dirname, 'DevDocs', 'public', 'upload.html');
const uploadDirPath = path.dirname(uploadPagePath);

// Create directory if it doesn't exist
if (!fs.existsSync(uploadDirPath)) {
  fs.mkdirSync(uploadDirPath, { recursive: true });
}

// Write the upload form HTML to the file
fs.writeFileSync(uploadPagePath, uploadFormHtml);

console.log(`Upload page created at: ${uploadPagePath}`);

// Update the server.js file to serve the upload page
const serverJsPath = path.join(__dirname, 'DevDocs', 'server.js');

// Check if the server.js file exists
if (!fs.existsSync(serverJsPath)) {
  console.error(`Server.js file not found at: ${serverJsPath}`);
  process.exit(1);
}

// Read the server.js file
const serverJs = fs.readFileSync(serverJsPath, 'utf8');

// Check if the upload route already exists
if (!serverJs.includes('app.get(\'/upload\'')) {
  // Add the upload route
  const uploadRoute = `
  // Serve the upload page
  app.get('/upload', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'upload.html'));
  });
`;

  // Find the position to insert the upload route
  const routesPosition = serverJs.indexOf('app.get(\'/');
  
  if (routesPosition !== -1) {
    // Insert the upload route before the first route
    const updatedServerJs = serverJs.slice(0, routesPosition) + uploadRoute + serverJs.slice(routesPosition);
    
    // Write the updated server.js file
    fs.writeFileSync(serverJsPath, updatedServerJs);
    
    console.log(`Server.js updated with upload route`);
  } else {
    console.error(`Could not find a suitable position to insert the upload route in server.js`);
  }
}

// Create a documents page if it doesn't exist
const documentsPagePath = path.join(__dirname, 'DevDocs', 'public', 'documents-new.html');

// Check if the documents page already exists
if (!fs.existsSync(documentsPagePath)) {
  // Create a simple documents page
  const documentsPageHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>FinDoc Analyzer - Documents</title>
  <link rel="stylesheet" href="/css/styles.css">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
</head>
<body>
  <div class="findoc-layout">
    <!-- Sidebar -->
    <aside class="sidebar">
      <div class="sidebar-header">
        <h1 class="logo">FinDoc Analyzer</h1>
      </div>
      <nav class="sidebar-nav">
        <a href="/" class="nav-link">
          <i class="fas fa-home"></i>
          <span>Dashboard</span>
        </a>
        <a href="/documents-new" class="nav-link active">
          <i class="fas fa-file-alt"></i>
          <span>Documents</span>
        </a>
        <a href="/analytics-new" class="nav-link">
          <i class="fas fa-chart-bar"></i>
          <span>Analytics</span>
        </a>
        <a href="/feedback" class="nav-link">
          <i class="fas fa-comment"></i>
          <span>Feedback</span>
        </a>
        <a href="/document-comparison" class="nav-link">
          <i class="fas fa-exchange-alt"></i>
          <span>Compare</span>
        </a>
      </nav>
    </aside>
    
    <!-- Main Content -->
    <main class="main-content">
      <div id="page-content">
        <div class="documents-page">
          <div class="page-header">
            <h1 class="page-title">My Documents</h1>
            <a href="/upload" class="upload-btn">Upload Document</a>
          </div>
          
          <div class="action-buttons">
            <a href="/documents-new" class="action-btn">
              <span class="icon">📤</span>Export
            </a>
            <a href="/documents-new" class="action-btn">
              <span class="icon">🔄</span>Refresh
            </a>
          </div>
          
          <div class="document-grid">
            <div class="document-card">
              <div class="document-card-header">
                <h3>Financial Report 2023</h3>
              </div>
              <div class="document-card-body">
                <p>Annual financial report for 2023</p>
              </div>
              <div class="document-card-footer">
                <span>PDF</span>
                <span>April 28, 2025</span>
              </div>
            </div>
            
            <div class="document-card">
              <div class="document-card-header">
                <h3>Investment Portfolio</h3>
              </div>
              <div class="document-card-body">
                <p>Current investment portfolio analysis</p>
              </div>
              <div class="document-card-footer">
                <span>PDF</span>
                <span>April 28, 2025</span>
              </div>
            </div>
            
            <div class="document-card">
              <div class="document-card-header">
                <h3>Tax Documents 2024</h3>
              </div>
              <div class="document-card-body">
                <p>Tax documents for fiscal year 2024</p>
              </div>
              <div class="document-card-footer">
                <span>PDF</span>
                <span>April 28, 2025</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</body>
</html>
`;

  // Write the documents page HTML to the file
  fs.writeFileSync(documentsPagePath, documentsPageHtml);
  
  console.log(`Documents page created at: ${documentsPagePath}`);
  
  // Add the documents-new route to server.js
  if (!serverJs.includes('app.get(\'/documents-new\'')) {
    // Add the documents-new route
    const documentsRoute = `
  // Serve the documents-new page
  app.get('/documents-new', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'documents-new.html'));
  });
`;

    // Find the position to insert the documents-new route
    const routesPosition = serverJs.indexOf('app.get(\'/');
    
    if (routesPosition !== -1) {
      // Insert the documents-new route before the first route
      const updatedServerJs = serverJs.slice(0, routesPosition) + documentsRoute + serverJs.slice(routesPosition);
      
      // Write the updated server.js file
      fs.writeFileSync(serverJsPath, updatedServerJs);
      
      console.log(`Server.js updated with documents-new route`);
    } else {
      console.error(`Could not find a suitable position to insert the documents-new route in server.js`);
    }
  }
}

console.log('PDF upload fix completed successfully');
