/**
 * PDF Processing Demonstration
 * 
 * This script demonstrates the PDF processing capabilities of our system
 * using a sample PDF from the test directory.
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Import services
const pdfProcessor = require('./services/pdf-processor');
const mcpDocumentProcessor = require('./services/mcp-document-processor');
const sequentialThinkingMcp = require('./services/sequential-thinking-mcp');

// Configuration
const PORT = 8081; // Using a different port to avoid conflict
const UPLOADS_DIR = path.join(__dirname, 'uploads');
const TEST_PDF = path.join(__dirname, 'test-pdfs', 'messos.pdf');
const RESULTS_DIR = path.join(__dirname, 'results');

// Ensure directories exist
[UPLOADS_DIR, RESULTS_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Create a simple HTML page with progress updates
const createHtmlPage = (title, content, logs = []) => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
    }
    
    h1, h2, h3 {
      color: #0066cc;
    }
    
    .card {
      background-color: #fff;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      padding: 20px;
      margin-bottom: 20px;
    }
    
    .progress-bar {
      height: 20px;
      background-color: #e9ecef;
      border-radius: 10px;
      margin: 10px 0;
      overflow: hidden;
    }
    
    .progress-bar-fill {
      height: 100%;
      background-color: #0066cc;
      border-radius: 10px;
      width: 0%;
      transition: width 0.5s ease;
    }
    
    pre {
      background-color: #f8f9fa;
      padding: 15px;
      border-radius: 5px;
      overflow: auto;
    }
    
    .log-container {
      max-height: 200px;
      overflow-y: auto;
      background-color: #f8f9fa;
      padding: 10px;
      border-radius: 5px;
      margin-top: 20px;
    }
    
    .log-item {
      margin-bottom: 5px;
      border-bottom: 1px solid #eee;
      padding-bottom: 5px;
    }
    
    .log-timestamp {
      color: #666;
      font-size: 0.8em;
    }
    
    .entity-list {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      margin-top: 10px;
    }
    
    .entity-item {
      background-color: rgba(0, 102, 204, 0.1);
      border: 1px solid rgba(0, 102, 204, 0.3);
      border-radius: 20px;
      padding: 5px 10px;
      font-size: 0.9em;
    }
    
    .entity-type {
      color: #0066cc;
      font-weight: 600;
      margin-right: 5px;
    }
    
    .tabs {
      display: flex;
      margin-bottom: 20px;
      border-bottom: 1px solid #ddd;
    }
    
    .tab {
      padding: 10px 15px;
      cursor: pointer;
      border: 1px solid transparent;
      border-bottom: none;
      border-radius: 4px 4px 0 0;
      background-color: #f8f9fa;
      margin-right: 5px;
    }
    
    .tab.active {
      background-color: white;
      border-color: #ddd;
      border-bottom-color: white;
      margin-bottom: -1px;
    }
    
    .tab-content {
      display: none;
    }
    
    .tab-content.active {
      display: block;
    }
    
    .refresh-button {
      background-color: #0066cc;
      color: white;
      border: none;
      padding: 10px 15px;
      border-radius: 5px;
      cursor: pointer;
      margin-top: 20px;
    }
    
    .table-container {
      overflow-x: auto;
      margin-top: 20px;
    }
    
    table {
      width: 100%;
      border-collapse: collapse;
    }
    
    th, td {
      border: 1px solid #ddd;
      padding: 8px;
      text-align: left;
    }
    
    th {
      background-color: #f2f2f2;
    }
    
    tr:nth-child(even) {
      background-color: #f9f9f9;
    }
  </style>
</head>
<body>
  <h1>PDF Processing Demonstration</h1>
  
  ${content}
  
  <div class="card">
    <h2>Processing Logs</h2>
    <div class="log-container">
      ${logs.map(log => `
        <div class="log-item">
          <span class="log-timestamp">${new Date(log.timestamp).toLocaleTimeString()}</span>
          <span>${log.message}</span>
        </div>
      `).join('')}
    </div>
  </div>
  
  <button class="refresh-button" onclick="location.reload()">Refresh Status</button>
  
  <script>
    // Set progress bar value
    const progressBar = document.getElementById('progress-bar-fill');
    if (progressBar) {
      progressBar.style.width = '${Math.min(logs.length * 10, 100)}%';
    }
    
    // Tab switching
    const tabs = document.querySelectorAll('.tab');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        // Remove active class from all tabs and contents
        tabs.forEach(t => t.classList.remove('active'));
        tabContents.forEach(c => c.classList.remove('active'));
        
        // Add active class to clicked tab
        tab.classList.add('active');
        
        // Show corresponding content
        const tabName = tab.getAttribute('data-tab');
        document.getElementById('tab-' + tabName).classList.add('active');
      });
    });
  </script>
</body>
</html>
  `;
};

// Process the PDF
const processPdf = async (pdfPath) => {
  const logs = [];
  const logMessage = (message) => {
    const log = {
      timestamp: Date.now(),
      message
    };
    logs.push(log);
    console.log(`[${new Date(log.timestamp).toLocaleTimeString()}] ${message}`);
    return logs;
  };

  // Initial log
  logMessage(`Starting to process ${path.basename(pdfPath)}`);
  
  try {
    // Copy test PDF to uploads directory
    const destinationPath = path.join(UPLOADS_DIR, path.basename(pdfPath));
    fs.copyFileSync(pdfPath, destinationPath);
    logMessage(`Copied PDF to ${destinationPath}`);
    
    // Extract text with standard processor
    logMessage('Extracting text with standard processor...');
    const standardResult = await pdfProcessor.processPdf(destinationPath);
    logMessage(`Standard processing complete. Extracted ${standardResult.text.length} characters of text.`);
    
    // Extract with MCP processor
    logMessage('Extracting with MCP processor...');
    const mcpResult = await mcpDocumentProcessor.processDocument(destinationPath);
    logMessage(`MCP processing complete. Found ${mcpResult.entities?.length || 0} entities.`);
    
    // Save results
    const resultPath = path.join(RESULTS_DIR, `pdf-processing-result-${Date.now()}.json`);
    const result = {
      standard: summarizeResult(standardResult),
      mcp: summarizeResult(mcpResult),
      timestamp: new Date().toISOString()
    };
    
    fs.writeFileSync(resultPath, JSON.stringify(result, null, 2));
    logMessage(`Results saved to ${resultPath}`);
    
    return {
      logs,
      standardResult,
      mcpResult,
      resultPath
    };
  } catch (error) {
    logMessage(`Error processing PDF: ${error.message}`);
    return {
      logs,
      error: error.message
    };
  }
};

// Summarize results to avoid large objects
function summarizeResult(result) {
  // Create a copy with summarized text
  const summarized = { ...result };
  
  // Summarize text (only keep first 1000 chars)
  if (summarized.text && typeof summarized.text === 'string') {
    const textLength = summarized.text.length;
    if (textLength > 1000) {
      summarized.text = summarized.text.substring(0, 1000) + `... [${textLength - 1000} more characters]`;
    }
    summarized.textLength = textLength;
  }
  
  return summarized;
}

// Create server to show progress
const server = http.createServer(async (req, res) => {
  // Route to process the PDF
  if (req.url === '/process') {
    const result = await processPdf(TEST_PDF);
    
    let content = `
      <div class="card">
        <h2>Processing Status</h2>
        <div class="progress-bar">
          <div class="progress-bar-fill" id="progress-bar-fill"></div>
        </div>
        <p>Current Status: ${result.error ? 'Error' : 'Complete'}</p>
        ${result.error ? `<p>Error: ${result.error}</p>` : ''}
      </div>
    `;
    
    if (!result.error) {
      content += `
        <div class="card">
          <h2>Results</h2>
          
          <div class="tabs">
            <div class="tab active" data-tab="text">Extracted Text</div>
            <div class="tab" data-tab="entities">Entities (${result.mcpResult.entities?.length || 0})</div>
            <div class="tab" data-tab="tables">Tables (${result.standardResult.tables?.length || 0})</div>
          </div>
          
          <div id="tab-text" class="tab-content active">
            <h3>Extracted Text (First 1000 chars)</h3>
            <pre>${result.standardResult.text?.substring(0, 1000) || 'No text extracted'}${result.standardResult.text?.length > 1000 ? '...' : ''}</pre>
          </div>
          
          <div id="tab-entities" class="tab-content">
            <h3>Extracted Entities</h3>
            <div class="entity-list">
              ${(result.mcpResult.entities || []).map(entity => `
                <div class="entity-item">
                  <span class="entity-type">${entity.type}:</span>
                  <span>${entity.name || entity.value || 'Unknown'}</span>
                </div>
              `).join('')}
            </div>
          </div>
          
          <div id="tab-tables" class="tab-content">
            <h3>Extracted Tables</h3>
            ${(result.standardResult.tables || []).length > 0 ? 
              (result.standardResult.tables || []).map((table, index) => `
                <div class="table-container">
                  <h4>Table ${index + 1}</h4>
                  <table>
                    ${table.headers ? `
                      <thead>
                        <tr>
                          ${table.headers.map(header => `<th>${header}</th>`).join('')}
                        </tr>
                      </thead>
                    ` : ''}
                    <tbody>
                      ${(table.rows || []).map(row => `
                        <tr>
                          ${row.map(cell => `<td>${cell || ''}</td>`).join('')}
                        </tr>
                      `).join('')}
                    </tbody>
                  </table>
                </div>
              `).join('') : 
              '<p>No tables found in the document</p>'
            }
          </div>
        </div>
      `;
    }
    
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(createHtmlPage('PDF Processing Demo', content, result.logs));
    return;
  }
  
  // Default route - show start page
  const content = `
    <div class="card">
      <h2>Start Processing</h2>
      <p>Click the button below to start processing the sample PDF (${path.basename(TEST_PDF)}).</p>
      <a href="/process" class="refresh-button">Start Processing</a>
    </div>
  `;
  
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end(createHtmlPage('PDF Processing Demo', content));
});

// Start server
server.listen(PORT, () => {
  console.log(`PDF Processing demonstration server running at http://localhost:${PORT}`);
  console.log(`Open your browser to http://localhost:${PORT} to start the demo`);
});