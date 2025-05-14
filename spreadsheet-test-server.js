/**
 * Spreadsheet Test Server
 * 
 * Simple Express server to test the enhanced spreadsheet processing functionality
 */

const express = require('express');
const path = require('path');
const multer = require('multer');
const fs = require('fs');
const mcpDocumentProcessor = require('./services/mcp-document-processor');

// Create express app
const app = express();
const port = process.env.PORT || 3000;

// Set up file upload storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadsDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir);
    }
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ storage });

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Parse JSON body
app.use(express.json());

// Create HTML page for testing
app.get('/', (req, res) => {
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Spreadsheet Processor Test</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
        }
        h1 {
          color: #333;
          border-bottom: 1px solid #ccc;
          padding-bottom: 10px;
        }
        .upload-section {
          background-color: #f9f9f9;
          padding: 20px;
          border-radius: 5px;
          margin-bottom: 20px;
        }
        .result-section {
          display: none;
          background-color: #f0f8ff;
          padding: 20px;
          border-radius: 5px;
          margin-top: 20px;
        }
        .entity-section, .table-section {
          margin-top: 20px;
          padding: 15px;
          background-color: #fff;
          border: 1px solid #ddd;
          border-radius: 5px;
        }
        .form-group {
          margin-bottom: 15px;
        }
        .btn {
          background-color: #4CAF50;
          color: white;
          padding: 10px 15px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }
        .btn:hover {
          background-color: #45a049;
        }
        .spinner {
          border: 4px solid rgba(0, 0, 0, 0.1);
          width: 36px;
          height: 36px;
          border-radius: 50%;
          border-left-color: #09f;
          animation: spin 1s linear infinite;
          display: none;
          margin: 20px auto;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 10px;
        }
        th, td {
          border: 1px solid #ddd;
          padding: 8px;
          text-align: left;
        }
        th {
          background-color: #f2f2f2;
        }
        pre {
          background-color: #f5f5f5;
          padding: 10px;
          border-radius: 5px;
          overflow-x: auto;
          white-space: pre-wrap;
        }
        .nav-tabs {
          display: flex;
          list-style: none;
          padding: 0;
          margin: 0;
          border-bottom: 1px solid #ccc;
        }
        .nav-tabs li {
          margin-right: 5px;
        }
        .nav-tabs button {
          padding: 10px 15px;
          border: 1px solid transparent;
          background-color: transparent;
          cursor: pointer;
        }
        .nav-tabs button.active {
          border: 1px solid #ccc;
          border-bottom-color: #fff;
          border-radius: 5px 5px 0 0;
          background-color: #fff;
        }
        .tab-content {
          padding: 15px;
          border: 1px solid #ccc;
          border-top: none;
          min-height: 300px;
        }
        .tab-pane {
          display: none;
        }
        .tab-pane.active {
          display: block;
        }
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      </style>
    </head>
    <body>
      <h1>Enhanced Spreadsheet Processor Test</h1>
      <div class="upload-section">
        <div class="form-group">
          <h2>Test with Sample File</h2>
          <p>Click the button below to test with our sample portfolio spreadsheet:</p>
          <button id="testSampleBtn" class="btn">Test Sample File</button>
        </div>
        
        <div class="form-group">
          <h2>Or Upload Your Own Spreadsheet</h2>
          <form id="uploadForm" enctype="multipart/form-data">
            <input type="file" id="fileInput" name="file" accept=".xlsx,.xls,.csv">
            <button type="submit" class="btn">Upload & Process</button>
          </form>
        </div>
      </div>
      
      <div id="spinner" class="spinner"></div>
      
      <div id="resultSection" class="result-section">
        <h2>Processing Results</h2>
        
        <ul class="nav-tabs">
          <li><button class="tab-button active" data-tab="overview">Overview</button></li>
          <li><button class="tab-button" data-tab="tables">Tables</button></li>
          <li><button class="tab-button" data-tab="entities">Entities</button></li>
          <li><button class="tab-button" data-tab="raw">Raw JSON</button></li>
        </ul>
        
        <div class="tab-content">
          <div id="overview" class="tab-pane active">
            <h3>Document Overview</h3>
            <div id="metadataOutput"></div>
            <h3>Text Sample</h3>
            <pre id="textSample"></pre>
          </div>
          
          <div id="tables" class="tab-pane">
            <h3>Extracted Tables</h3>
            <div id="tablesOutput"></div>
          </div>
          
          <div id="entities" class="tab-pane">
            <h3>Extracted Entities</h3>
            <div id="entitiesOutput"></div>
          </div>
          
          <div id="raw" class="tab-pane">
            <h3>Raw Processing Result</h3>
            <pre id="rawOutput"></pre>
          </div>
        </div>
      </div>
      
      <script>
        document.addEventListener('DOMContentLoaded', () => {
          const uploadForm = document.getElementById('uploadForm');
          const testSampleBtn = document.getElementById('testSampleBtn');
          const spinner = document.getElementById('spinner');
          const resultSection = document.getElementById('resultSection');
          const tabButtons = document.querySelectorAll('.tab-button');
          const tabPanes = document.querySelectorAll('.tab-pane');
          
          // Tab switching
          tabButtons.forEach(button => {
            button.addEventListener('click', () => {
              // Deactivate all tabs
              tabButtons.forEach(btn => btn.classList.remove('active'));
              tabPanes.forEach(pane => pane.classList.remove('active'));
              
              // Activate selected tab
              button.classList.add('active');
              const tabId = button.dataset.tab;
              document.getElementById(tabId).classList.add('active');
            });
          });
          
          // Handle form submission
          uploadForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const fileInput = document.getElementById('fileInput');
            if (!fileInput.files.length) {
              alert('Please select a file to upload');
              return;
            }
            
            const formData = new FormData();
            formData.append('file', fileInput.files[0]);
            
            spinner.style.display = 'block';
            resultSection.style.display = 'none';
            
            try {
              const response = await fetch('/process', {
                method: 'POST',
                body: formData
              });
              
              if (!response.ok) {
                throw new Error('Error processing file');
              }
              
              const result = await response.json();
              displayResult(result);
            } catch (error) {
              console.error('Error:', error);
              alert('Error processing file: ' + error.message);
            } finally {
              spinner.style.display = 'none';
            }
          });
          
          // Handle sample file test
          testSampleBtn.addEventListener('click', async () => {
            spinner.style.display = 'block';
            resultSection.style.display = 'none';
            
            try {
              const response = await fetch('/process-sample');
              
              if (!response.ok) {
                throw new Error('Error processing sample file');
              }
              
              const result = await response.json();
              displayResult(result);
            } catch (error) {
              console.error('Error:', error);
              alert('Error processing sample file: ' + error.message);
            } finally {
              spinner.style.display = 'none';
            }
          });
          
          // Display processing result
          function displayResult(result) {
            // Display metadata
            const metadataOutput = document.getElementById('metadataOutput');
            let metadataHtml = '<table>';
            for (const [key, value] of Object.entries(result.metadata)) {
              metadataHtml += \`<tr><th>\${key}</th><td>\${value}</td></tr>\`;
            }
            metadataHtml += '</table>';
            metadataOutput.innerHTML = metadataHtml;
            
            // Display text sample
            const textSample = document.getElementById('textSample');
            textSample.textContent = result.text.substring(0, 500) + (result.text.length > 500 ? '...' : '');
            
            // Display tables
            const tablesOutput = document.getElementById('tablesOutput');
            let tablesHtml = '';
            if (result.tables && result.tables.length > 0) {
              result.tables.forEach((table, index) => {
                tablesHtml += \`
                  <div class="table-section">
                    <h4>Table \${index + 1}: \${table.name || 'Unnamed'}</h4>
                    <p><strong>Type:</strong> \${table.type || 'general'}</p>
                    <table>
                      <thead>
                        <tr>
                \`;
                
                if (table.headers && table.headers.length > 0) {
                  table.headers.forEach(header => {
                    tablesHtml += \`<th>\${header}</th>\`;
                  });
                }
                
                tablesHtml += \`
                        </tr>
                      </thead>
                      <tbody>
                \`;
                
                if (table.rows && table.rows.length > 0) {
                  // Display up to 10 rows
                  const rowsToDisplay = table.rows.slice(0, 10);
                  rowsToDisplay.forEach(row => {
                    tablesHtml += '<tr>';
                    row.forEach(cell => {
                      tablesHtml += \`<td>\${cell || ''}</td>\`;
                    });
                    tablesHtml += '</tr>';
                  });
                  
                  if (table.rows.length > 10) {
                    tablesHtml += \`
                      <tr>
                        <td colspan="\${table.headers ? table.headers.length : 1}">
                          ... and \${table.rows.length - 10} more rows
                        </td>
                      </tr>
                    \`;
                  }
                }
                
                tablesHtml += \`
                      </tbody>
                    </table>
                  </div>
                \`;
              });
            } else {
              tablesHtml = '<p>No tables found in document</p>';
            }
            tablesOutput.innerHTML = tablesHtml;
            
            // Display entities
            const entitiesOutput = document.getElementById('entitiesOutput');
            let entitiesHtml = '';
            
            if (result.entities && result.entities.length > 0) {
              // Group entities by type
              const entityTypes = {};
              result.entities.forEach(entity => {
                if (!entityTypes[entity.type]) {
                  entityTypes[entity.type] = [];
                }
                entityTypes[entity.type].push(entity);
              });
              
              // Display entities by type
              Object.entries(entityTypes).forEach(([type, entities]) => {
                entitiesHtml += \`
                  <div class="entity-section">
                    <h4>\${type} (\${entities.length})</h4>
                    <table>
                      <thead>
                        <tr>
                          <th>Name/Value</th>
                          <th>Properties</th>
                          <th>Confidence</th>
                        </tr>
                      </thead>
                      <tbody>
                \`;
                
                entities.forEach(entity => {
                  const name = entity.name || entity.isin || entity.value || 'Unnamed';
                  const propertiesObj = { ...entity };
                  delete propertiesObj.name;
                  delete propertiesObj.type;
                  delete propertiesObj.confidence;
                  
                  const properties = Object.entries(propertiesObj)
                    .map(([key, value]) => \`\${key}: \${value}\`)
                    .join('<br>');
                  
                  entitiesHtml += \`
                    <tr>
                      <td>\${name}</td>
                      <td>\${properties}</td>
                      <td>\${entity.confidence ? entity.confidence.toFixed(2) : 'N/A'}</td>
                    </tr>
                  \`;
                });
                
                entitiesHtml += \`
                      </tbody>
                    </table>
                  </div>
                \`;
              });
            } else {
              entitiesHtml = '<p>No entities found in document</p>';
            }
            entitiesOutput.innerHTML = entitiesHtml;
            
            // Display raw JSON
            const rawOutput = document.getElementById('rawOutput');
            rawOutput.textContent = JSON.stringify(result, null, 2);
            
            // Show result section
            resultSection.style.display = 'block';
          }
        });
      </script>
    </body>
    </html>
  `;
  
  res.send(html);
});

// API endpoint to process uploaded file
app.post('/process', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    const result = await mcpDocumentProcessor.processDocument(req.file.path);
    res.json(result);
  } catch (error) {
    console.error(`Error processing file: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
});

// API endpoint to process sample file
app.get('/process-sample', async (req, res) => {
  try {
    const samplePath = path.join(__dirname, 'test-portfolio.xlsx');
    
    // Create sample file if it doesn't exist
    if (!fs.existsSync(samplePath)) {
      const XLSX = require('xlsx');
      
      // Create a workbook
      const workbook = XLSX.utils.book_new();
      
      // Portfolio holdings data
      const portfolioData = [
        ['Security Name', 'ISIN', 'Ticker', 'Quantity', 'Price', 'Market Value', 'Asset Class', '% of Portfolio'],
        ['Apple Inc.', 'US0378331005', 'AAPL', 100, 187.51, 18751.00, 'Equity', 15.5],
        ['Microsoft Corporation', 'US5949181045', 'MSFT', 75, 319.76, 23982.00, 'Equity', 19.8],
        ['Amazon.com Inc.', 'US0231351067', 'AMZN', 50, 178.22, 8911.00, 'Equity', 7.4],
        ['Alphabet Inc.', 'US02079K1079', 'GOOGL', 80, 162.68, 13014.40, 'Equity', 10.7],
        ['Tesla Inc.', 'US88160R1014', 'TSLA', 60, 223.45, 13407.00, 'Equity', 11.1],
        ['NVIDIA Corporation', 'US67066G1040', 'NVDA', 40, 405.38, 16215.20, 'Equity', 13.4],
        ['JPMorgan Chase & Co.', 'US46625H1005', 'JPM', 65, 183.27, 11912.55, 'Equity', 9.8],
        ['Johnson & Johnson', 'US4781601046', 'JNJ', 70, 155.78, 10904.60, 'Equity', 9.0],
        ['Visa Inc.', 'US92826C8394', 'V', 30, 274.94, 8248.20, 'Equity', 6.8]
      ];
      
      // Asset allocation data
      const allocationData = [
        ['Asset Class', 'Market Value', '% of Portfolio'],
        ['Equity', 121000.00, 100.0],
        ['Fixed Income', 0.00, 0.0],
        ['Cash', 0.00, 0.0],
        ['Alternative', 0.00, 0.0],
        ['Total', 121000.00, 100.0]
      ];
      
      // Performance data
      const performanceData = [
        ['Period', 'Return', 'Benchmark Return', 'Relative Performance'],
        ['1 Month', 2.4, 1.8, 0.6],
        ['3 Months', 7.8, 6.2, 1.6],
        ['6 Months', 15.3, 12.1, 3.2],
        ['1 Year', 22.7, 18.4, 4.3],
        ['3 Years', 68.4, 52.1, 16.3],
        ['5 Years', 114.2, 89.7, 24.5]
      ];
      
      // Account information data
      const accountData = [
        ['Account Number', 'ACCT-12345-6789'],
        ['Account Name', 'Test Portfolio'],
        ['Account Type', 'Individual Investment Account'],
        ['Currency', 'USD'],
        ['Opening Date', '2020-01-01'],
        ['Advisor', 'Jane Smith'],
        ['Contact Email', 'advisor@example.com'],
        ['Risk Profile', 'Growth']
      ];
      
      // Create worksheets
      const worksheetPortfolio = XLSX.utils.aoa_to_sheet(portfolioData);
      const worksheetAllocation = XLSX.utils.aoa_to_sheet(allocationData);
      const worksheetPerformance = XLSX.utils.aoa_to_sheet(performanceData);
      const worksheetAccount = XLSX.utils.aoa_to_sheet(accountData);
      
      // Add worksheets to workbook
      XLSX.utils.book_append_sheet(workbook, worksheetPortfolio, 'Portfolio Holdings');
      XLSX.utils.book_append_sheet(workbook, worksheetAllocation, 'Asset Allocation');
      XLSX.utils.book_append_sheet(workbook, worksheetPerformance, 'Performance');
      XLSX.utils.book_append_sheet(workbook, worksheetAccount, 'Account Information');
      
      // Write to file
      XLSX.writeFile(workbook, samplePath);
    }
    
    const result = await mcpDocumentProcessor.processDocument(samplePath);
    res.json(result);
  } catch (error) {
    console.error(`Error processing sample file: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Spreadsheet test server running at http://localhost:${port}`);
});