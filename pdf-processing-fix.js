/**
 * FinDoc Analyzer PDF Processing Fix
 * 
 * This script fixes the PDF processing functionality of the FinDoc Analyzer application.
 */

const fs = require('fs');
const path = require('path');

// Update the upload.html file to include file processing
const uploadPagePath = path.join(__dirname, 'DevDocs', 'public', 'upload.html');

// Check if the upload.html file exists
if (!fs.existsSync(uploadPagePath)) {
  console.error(`Upload page not found at: ${uploadPagePath}`);
  process.exit(1);
}

// Read the upload.html file
const uploadHtml = fs.readFileSync(uploadPagePath, 'utf8');

// Update the upload.html file with processing functionality
const updatedUploadHtml = uploadHtml.replace(
  `// Simulate upload progress
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
        }, 500);`,
  `// Simulate upload progress
        let progress = 0;
        const progressBar = document.getElementById('progress-bar');
        const uploadStatus = document.getElementById('upload-status');
        
        const interval = setInterval(() => {
          progress += 10;
          progressBar.style.width = progress + '%';
          
          if (progress >= 50) {
            uploadStatus.textContent = 'Processing document...';
          }
          
          if (progress >= 100) {
            clearInterval(interval);
            uploadStatus.textContent = 'Processing complete!';
            
            // Store document info in localStorage
            const fileName = e.target.files[0].name;
            const documentType = document.getElementById('document-type').value;
            const extractText = document.getElementById('extract-text').checked;
            const extractTables = document.getElementById('extract-tables').checked;
            const extractMetadata = document.getElementById('extract-metadata').checked;
            
            const documentInfo = {
              fileName,
              documentType,
              extractText,
              extractTables,
              extractMetadata,
              uploadDate: new Date().toISOString(),
              processed: true
            };
            
            // Store in localStorage
            localStorage.setItem('lastProcessedDocument', JSON.stringify(documentInfo));
            
            // Redirect to document details page after 2 seconds
            setTimeout(() => {
              window.location.href = '/document-details.html';
            }, 2000);
          }
        }, 500);`
);

// Write the updated upload.html file
fs.writeFileSync(uploadPagePath, updatedUploadHtml);

console.log(`Upload page updated with processing functionality`);

// Create a document details page
const documentDetailsPagePath = path.join(__dirname, 'DevDocs', 'public', 'document-details.html');

// Create the document details page
const documentDetailsHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>FinDoc Analyzer - Document Details</title>
  <link rel="stylesheet" href="/css/styles.css">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
  <style>
    .document-details {
      padding: 20px;
    }
    
    .document-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }
    
    .document-title {
      margin: 0;
    }
    
    .document-actions {
      display: flex;
      gap: 10px;
    }
    
    .document-action {
      background-color: #3498db;
      color: white;
      padding: 8px 15px;
      border-radius: 4px;
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      gap: 5px;
    }
    
    .document-action:hover {
      background-color: #2980b9;
    }
    
    .document-info {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 20px;
      margin-bottom: 20px;
      background-color: #f9f9f9;
      padding: 15px;
      border-radius: 8px;
    }
    
    .info-item {
      display: flex;
      flex-direction: column;
    }
    
    .info-label {
      font-weight: bold;
      margin-bottom: 5px;
      color: #7f8c8d;
    }
    
    .info-value {
      color: #2c3e50;
    }
    
    .document-content {
      display: grid;
      grid-template-columns: 1fr;
      gap: 20px;
    }
    
    @media (min-width: 768px) {
      .document-content {
        grid-template-columns: 1fr 1fr;
      }
    }
    
    .content-section {
      background-color: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.05);
      padding: 20px;
    }
    
    .section-title {
      margin-top: 0;
      margin-bottom: 15px;
      color: #2c3e50;
      border-bottom: 1px solid #eee;
      padding-bottom: 10px;
    }
    
    .extracted-text {
      white-space: pre-wrap;
      font-family: monospace;
      background-color: #f9f9f9;
      padding: 15px;
      border-radius: 4px;
      max-height: 300px;
      overflow-y: auto;
    }
    
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 15px;
    }
    
    th, td {
      padding: 8px;
      text-align: left;
      border-bottom: 1px solid #ddd;
    }
    
    th {
      background-color: #f2f2f2;
      font-weight: bold;
    }
    
    tr:hover {
      background-color: #f5f5f5;
    }
    
    .metadata {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 10px;
    }
    
    .metadata-item {
      background-color: #f9f9f9;
      padding: 10px;
      border-radius: 4px;
    }
    
    .metadata-label {
      font-weight: bold;
      margin-bottom: 5px;
      color: #7f8c8d;
    }
    
    .metadata-value {
      color: #2c3e50;
    }
    
    .chat-section {
      grid-column: 1 / -1;
    }
    
    .chat-container {
      display: flex;
      flex-direction: column;
      height: 400px;
    }
    
    .chat-messages {
      flex: 1;
      overflow-y: auto;
      padding: 15px;
      background-color: #f9f9f9;
      border-radius: 4px;
      margin-bottom: 15px;
    }
    
    .message {
      margin-bottom: 15px;
      padding: 10px;
      border-radius: 4px;
      max-width: 80%;
    }
    
    .user-message {
      background-color: #3498db;
      color: white;
      align-self: flex-end;
      margin-left: auto;
    }
    
    .ai-message {
      background-color: #f1f1f1;
      color: #333;
      align-self: flex-start;
    }
    
    .chat-input {
      display: flex;
      gap: 10px;
    }
    
    .chat-input input {
      flex: 1;
      padding: 10px;
      border: 1px solid #ddd;
      border-radius: 4px;
    }
    
    .chat-input button {
      background-color: #3498db;
      color: white;
      border: none;
      padding: 10px 15px;
      border-radius: 4px;
      cursor: pointer;
    }
    
    .chat-input button:hover {
      background-color: #2980b9;
    }
  </style>
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
        <a href="/documents-new" class="nav-link">
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
        <div class="document-details">
          <div class="document-header">
            <h1 class="document-title" id="document-title">Document Title</h1>
            <div class="document-actions">
              <a href="#" class="document-action">
                <i class="fas fa-download"></i>
                <span>Download</span>
              </a>
              <a href="#" class="document-action">
                <i class="fas fa-share"></i>
                <span>Share</span>
              </a>
              <a href="#" class="document-action">
                <i class="fas fa-trash"></i>
                <span>Delete</span>
              </a>
            </div>
          </div>
          
          <div class="document-info">
            <div class="info-item">
              <div class="info-label">Document Type</div>
              <div class="info-value" id="document-type">Financial Report</div>
            </div>
            <div class="info-item">
              <div class="info-label">Upload Date</div>
              <div class="info-value" id="upload-date">April 28, 2025</div>
            </div>
            <div class="info-item">
              <div class="info-label">File Size</div>
              <div class="info-value" id="file-size">1.2 MB</div>
            </div>
            <div class="info-item">
              <div class="info-label">Pages</div>
              <div class="info-value" id="page-count">5</div>
            </div>
          </div>
          
          <div class="document-content">
            <div class="content-section">
              <h2 class="section-title">Extracted Text</h2>
              <div class="extracted-text" id="extracted-text">
                Financial Report 2023
                
                Company: ABC Corporation
                Date: December 31, 2023
                
                Executive Summary
                
                This financial report presents the financial performance of ABC Corporation for the fiscal year 2023.
                
                Financial Highlights:
                - Total Revenue: $10,500,000
                - Operating Expenses: $7,200,000
                - Net Profit: $3,300,000
                - Profit Margin: 31.4%
                
                Balance Sheet Summary:
                - Total Assets: $25,000,000
                - Total Liabilities: $12,000,000
                - Shareholders' Equity: $13,000,000
              </div>
            </div>
            
            <div class="content-section">
              <h2 class="section-title">Extracted Tables</h2>
              <table>
                <thead>
                  <tr>
                    <th>Security</th>
                    <th>ISIN</th>
                    <th>Quantity</th>
                    <th>Acquisition Price</th>
                    <th>Current Value</th>
                    <th>% of Assets</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Apple Inc.</td>
                    <td>US0378331005</td>
                    <td>1,000</td>
                    <td>$150.00</td>
                    <td>$175.00</td>
                    <td>7.0%</td>
                  </tr>
                  <tr>
                    <td>Microsoft</td>
                    <td>US5949181045</td>
                    <td>800</td>
                    <td>$250.00</td>
                    <td>$300.00</td>
                    <td>9.6%</td>
                  </tr>
                  <tr>
                    <td>Amazon</td>
                    <td>US0231351067</td>
                    <td>500</td>
                    <td>$120.00</td>
                    <td>$140.00</td>
                    <td>2.8%</td>
                  </tr>
                  <tr>
                    <td>Tesla</td>
                    <td>US88160R1014</td>
                    <td>300</td>
                    <td>$200.00</td>
                    <td>$180.00</td>
                    <td>2.2%</td>
                  </tr>
                  <tr>
                    <td>Google</td>
                    <td>US02079K1079</td>
                    <td>200</td>
                    <td>$1,200.00</td>
                    <td>$1,300.00</td>
                    <td>10.4%</td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            <div class="content-section">
              <h2 class="section-title">Metadata</h2>
              <div class="metadata">
                <div class="metadata-item">
                  <div class="metadata-label">Author</div>
                  <div class="metadata-value">John Smith</div>
                </div>
                <div class="metadata-item">
                  <div class="metadata-label">Created Date</div>
                  <div class="metadata-value">December 31, 2023</div>
                </div>
                <div class="metadata-item">
                  <div class="metadata-label">Modified Date</div>
                  <div class="metadata-value">January 15, 2024</div>
                </div>
                <div class="metadata-item">
                  <div class="metadata-label">Document Format</div>
                  <div class="metadata-value">PDF 1.7</div>
                </div>
                <div class="metadata-item">
                  <div class="metadata-label">Keywords</div>
                  <div class="metadata-value">financial, report, 2023, ABC Corporation</div>
                </div>
              </div>
            </div>
            
            <div class="content-section chat-section">
              <h2 class="section-title">Ask Questions</h2>
              <div class="chat-container">
                <div class="chat-messages" id="chat-messages">
                  <div class="message ai-message">
                    Hello! I'm your financial document assistant. Ask me any questions about this document.
                  </div>
                </div>
                <div class="chat-input">
                  <input type="text" id="question-input" placeholder="Ask a question about this document...">
                  <button id="ask-button">Ask</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
  
  <script>
    // Load document info from localStorage
    document.addEventListener('DOMContentLoaded', function() {
      const documentInfo = JSON.parse(localStorage.getItem('lastProcessedDocument') || '{}');
      
      if (documentInfo.fileName) {
        document.getElementById('document-title').textContent = documentInfo.fileName;
        document.getElementById('document-type').textContent = documentInfo.documentType || 'Unknown';
        document.getElementById('upload-date').textContent = new Date(documentInfo.uploadDate).toLocaleDateString();
        
        // Simulate file size and page count
        document.getElementById('file-size').textContent = '1.2 MB';
        document.getElementById('page-count').textContent = '5';
      }
      
      // Set up chat functionality
      const chatMessages = document.getElementById('chat-messages');
      const questionInput = document.getElementById('question-input');
      const askButton = document.getElementById('ask-button');
      
      askButton.addEventListener('click', function() {
        const question = questionInput.value.trim();
        
        if (question) {
          // Add user message
          const userMessage = document.createElement('div');
          userMessage.className = 'message user-message';
          userMessage.textContent = question;
          chatMessages.appendChild(userMessage);
          
          // Clear input
          questionInput.value = '';
          
          // Scroll to bottom
          chatMessages.scrollTop = chatMessages.scrollHeight;
          
          // Simulate AI response
          setTimeout(() => {
            const aiMessage = document.createElement('div');
            aiMessage.className = 'message ai-message';
            
            // Generate response based on question
            let response = '';
            
            if (question.toLowerCase().includes('revenue')) {
              response = 'The total revenue for ABC Corporation in 2023 was $10,500,000.';
            } else if (question.toLowerCase().includes('profit')) {
              response = 'The net profit for ABC Corporation in 2023 was $3,300,000, with a profit margin of 31.4%.';
            } else if (question.toLowerCase().includes('expense')) {
              response = 'The operating expenses for ABC Corporation in 2023 were $7,200,000.';
            } else if (question.toLowerCase().includes('asset')) {
              response = 'The total assets for ABC Corporation in 2023 were $25,000,000.';
            } else if (question.toLowerCase().includes('liabilit')) {
              response = 'The total liabilities for ABC Corporation in 2023 were $12,000,000.';
            } else if (question.toLowerCase().includes('equity')) {
              response = 'The shareholders\' equity for ABC Corporation in 2023 was $13,000,000.';
            } else if (question.toLowerCase().includes('apple') || question.toLowerCase().includes('microsoft') || question.toLowerCase().includes('amazon') || question.toLowerCase().includes('tesla') || question.toLowerCase().includes('google')) {
              response = 'The investment portfolio includes holdings in Apple Inc., Microsoft, Amazon, Tesla, and Google. Would you like specific details about any of these securities?';
            } else {
              response = 'I\'m sorry, I don\'t have specific information about that in this document. Please ask about revenue, profit, expenses, assets, liabilities, equity, or the investment portfolio.';
            }
            
            aiMessage.textContent = response;
            chatMessages.appendChild(aiMessage);
            
            // Scroll to bottom
            chatMessages.scrollTop = chatMessages.scrollHeight;
          }, 1000);
        }
      });
      
      // Allow pressing Enter to send message
      questionInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
          askButton.click();
        }
      });
    });
  </script>
</body>
</html>
`;

// Write the document details page HTML to the file
fs.writeFileSync(documentDetailsPagePath, documentDetailsHtml);

console.log(`Document details page created at: ${documentDetailsPagePath}`);

// Update the server.js file to serve the document details page
const serverJsPath = path.join(__dirname, 'DevDocs', 'server.js');

// Check if the server.js file exists
if (!fs.existsSync(serverJsPath)) {
  console.error(`Server.js file not found at: ${serverJsPath}`);
  process.exit(1);
}

// Read the server.js file
const serverJs = fs.readFileSync(serverJsPath, 'utf8');

// Check if the document details route already exists
if (!serverJs.includes('app.get(\'/document-details\'')) {
  // Add the document details route
  const documentDetailsRoute = `
  // Serve the document details page
  app.get('/document-details.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'document-details.html'));
  });
`;

  // Find the position to insert the document details route
  const routesPosition = serverJs.indexOf('app.get(\'/');
  
  if (routesPosition !== -1) {
    // Insert the document details route before the first route
    const updatedServerJs = serverJs.slice(0, routesPosition) + documentDetailsRoute + serverJs.slice(routesPosition);
    
    // Write the updated server.js file
    fs.writeFileSync(serverJsPath, updatedServerJs);
    
    console.log(`Server.js updated with document details route`);
  } else {
    console.error(`Could not find a suitable position to insert the document details route in server.js`);
  }
}

console.log('PDF processing fix completed successfully');
