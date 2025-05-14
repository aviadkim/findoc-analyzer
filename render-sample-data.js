/**
 * Render Sample Data
 * 
 * Script to process a sample spreadsheet and display the enhanced output
 */

const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');
const mcpDocumentProcessor = require('./services/mcp-document-processor');

// Path for sample file and output
const SAMPLE_FILE = path.join(__dirname, 'test-portfolio.xlsx');
const OUTPUT_HTML = path.join(__dirname, 'enhanced-output.html');

async function renderSampleData() {
  try {
    console.log('Starting sample data processing demonstration...');
    
    // Ensure sample file exists
    if (!fs.existsSync(SAMPLE_FILE)) {
      console.log('Creating sample file...');
      createSampleFile();
    } else {
      console.log('Using existing sample file:', SAMPLE_FILE);
    }
    
    // Process the sample file with MCP document processor
    console.log('Processing sample file with MCP document processor...');
    const result = await mcpDocumentProcessor.processDocument(SAMPLE_FILE);
    
    // Log summary of results
    console.log('\nProcessing Results Summary:');
    console.log('===========================');
    console.log(`Document ID: ${result.documentId}`);
    console.log(`File Name: ${result.fileName}`);
    console.log(`Tables extracted: ${result.tables.length}`);
    console.log(`Entities extracted: ${result.entities.length}`);
    
    // Generate an HTML page to view the results
    console.log('\nGenerating HTML output...');
    const html = generateResultHtml(result);
    fs.writeFileSync(OUTPUT_HTML, html);
    
    console.log(`\nResults saved to: ${OUTPUT_HTML}`);
    console.log('Open this file in a web browser to view the formatted results.');
    
  } catch (error) {
    console.error('Error processing sample data:', error);
  }
}

function createSampleFile() {
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
    ['Key', 'Value'],
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
  XLSX.writeFile(workbook, SAMPLE_FILE);
  
  console.log('Sample Excel file created successfully');
}

function generateResultHtml(result) {
  // Create metadata HTML
  let metadataHtml = '<table class="table table-striped">';
  metadataHtml += '<thead><tr><th>Property</th><th>Value</th></tr></thead><tbody>';
  for (const [key, value] of Object.entries(result.metadata)) {
    metadataHtml += `<tr><td>${key}</td><td>${value}</td></tr>`;
  }
  metadataHtml += '</tbody></table>';
  
  // Create tables HTML
  let tablesHtml = '';
  if (result.tables && result.tables.length > 0) {
    result.tables.forEach((table, index) => {
      tablesHtml += `
        <div class="card mb-4">
          <div class="card-header">
            <h4>Table ${index + 1}: ${table.name || 'Unnamed'}</h4>
            <p class="text-muted mb-0">Type: ${table.type || 'general'}</p>
          </div>
          <div class="card-body">
            <div class="table-responsive">
              <table class="table table-striped table-bordered">
                <thead>
                  <tr>
      `;
      
      if (table.headers && table.headers.length > 0) {
        table.headers.forEach(header => {
          tablesHtml += `<th>${header}</th>`;
        });
      }
      
      tablesHtml += `
                  </tr>
                </thead>
                <tbody>
      `;
      
      if (table.rows && table.rows.length > 0) {
        table.rows.forEach(row => {
          tablesHtml += '<tr>';
          row.forEach(cell => {
            tablesHtml += `<td>${cell || ''}</td>`;
          });
          tablesHtml += '</tr>';
        });
      }
      
      tablesHtml += `
                </tbody>
              </table>
            </div>
          </div>
        </div>
      `;
    });
  } else {
    tablesHtml = '<p>No tables found in document</p>';
  }
  
  // Create entities HTML
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
      entitiesHtml += `
        <div class="card mb-4">
          <div class="card-header">
            <h4>${type} (${entities.length})</h4>
          </div>
          <div class="card-body">
            <div class="table-responsive">
              <table class="table table-striped table-bordered">
                <thead>
                  <tr>
                    <th>Name/Value</th>
                    <th>Properties</th>
                    <th>Confidence</th>
                  </tr>
                </thead>
                <tbody>
      `;
      
      entities.forEach(entity => {
        const name = entity.name || entity.isin || entity.value || 'Unnamed';
        const propertiesObj = { ...entity };
        delete propertiesObj.name;
        delete propertiesObj.type;
        delete propertiesObj.confidence;
        
        const properties = Object.entries(propertiesObj)
          .map(([key, value]) => `<b>${key}:</b> ${value}`)
          .join('<br>');
        
        entitiesHtml += `
          <tr>
            <td>${name}</td>
            <td>${properties}</td>
            <td>${entity.confidence ? (entity.confidence * 100).toFixed(0) + '%' : 'N/A'}</td>
          </tr>
        `;
      });
      
      entitiesHtml += `
                </tbody>
              </table>
            </div>
          </div>
        </div>
      `;
    });
  } else {
    entitiesHtml = '<p>No entities found in document</p>';
  }
  
  // Create text sample HTML
  const textSample = result.text.substring(0, 1000) + (result.text.length > 1000 ? '...' : '');
  const textSampleHtml = `<pre class="bg-light p-3 border rounded">${textSample}</pre>`;
  
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Enhanced Spreadsheet Processing - Result</title>
      <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
      <style>
        body {
          padding-top: 2rem;
          padding-bottom: 2rem;
        }
        .hero {
          background: linear-gradient(135deg, #2c3e50, #3498db);
          color: white;
          padding: 2rem 0;
          margin-bottom: 2rem;
          border-radius: 0 0 0.5rem 0.5rem;
        }
        .card {
          margin-bottom: 1.5rem;
          border: none;
          box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
        }
        .card-header {
          background-color: #2c3e50;
          color: white;
          font-weight: 500;
        }
        pre {
          white-space: pre-wrap;
        }
        .nav-tabs {
          margin-bottom: 1rem;
        }
        .nav-tabs .nav-link {
          color: #495057;
        }
        .nav-tabs .nav-link.active {
          color: #3498db;
          font-weight: 500;
        }
        .badge-pill {
          border-radius: 9999px;
          padding: 0.35em 0.65em;
        }
        .entity-count {
          font-size: 0.75rem;
          background-color: rgba(52, 152, 219, 0.1);
          color: #3498db;
          border: 1px solid rgba(52, 152, 219, 0.2);
        }
        .confidence-high {
          background-color: rgba(46, 204, 113, 0.1);
          color: #2ecc71;
          border: 1px solid rgba(46, 204, 113, 0.2);
        }
        .confidence-medium {
          background-color: rgba(241, 196, 15, 0.1);
          color: #f1c40f;
          border: 1px solid rgba(241, 196, 15, 0.2);
        }
        .confidence-low {
          background-color: rgba(231, 76, 60, 0.1);
          color: #e74c3c;
          border: 1px solid rgba(231, 76, 60, 0.2);
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="hero text-center">
          <h1>FinDoc Spreadsheet Processor</h1>
          <p class="lead">Enhanced Excel Processing Results</p>
        </div>
        
        <div class="row mb-4">
          <div class="col-md-4 mb-3">
            <div class="card text-center h-100">
              <div class="card-body">
                <h5 class="card-title">Tables</h5>
                <h2>${result.tables ? result.tables.length : 0}</h2>
                <p class="text-muted">Extracted tables</p>
              </div>
            </div>
          </div>
          
          <div class="col-md-4 mb-3">
            <div class="card text-center h-100">
              <div class="card-body">
                <h5 class="card-title">Entities</h5>
                <h2>${result.entities ? result.entities.length : 0}</h2>
                <p class="text-muted">Extracted entities</p>
              </div>
            </div>
          </div>
          
          <div class="col-md-4 mb-3">
            <div class="card text-center h-100">
              <div class="card-body">
                <h5 class="card-title">Sheets</h5>
                <h2>${result.metadata && result.metadata.sheetCount ? result.metadata.sheetCount : 0}</h2>
                <p class="text-muted">Analyzed worksheets</p>
              </div>
            </div>
          </div>
        </div>
        
        <ul class="nav nav-tabs" id="resultTabs" role="tablist">
          <li class="nav-item" role="presentation">
            <button class="nav-link active" id="metadata-tab" data-bs-toggle="tab" data-bs-target="#metadata" type="button" role="tab">Metadata</button>
          </li>
          <li class="nav-item" role="presentation">
            <button class="nav-link" id="entities-tab" data-bs-toggle="tab" data-bs-target="#entities" type="button" role="tab">Entities</button>
          </li>
          <li class="nav-item" role="presentation">
            <button class="nav-link" id="tables-tab" data-bs-toggle="tab" data-bs-target="#tables" type="button" role="tab">Tables</button>
          </li>
          <li class="nav-item" role="presentation">
            <button class="nav-link" id="text-tab" data-bs-toggle="tab" data-bs-target="#text" type="button" role="tab">Text</button>
          </li>
        </ul>
        
        <div class="tab-content" id="resultTabsContent">
          <div class="tab-pane fade show active" id="metadata" role="tabpanel">
            <h2>Document Metadata</h2>
            ${metadataHtml}
          </div>
          
          <div class="tab-pane fade" id="entities" role="tabpanel">
            <h2>Extracted Entities</h2>
            ${entitiesHtml}
          </div>
          
          <div class="tab-pane fade" id="tables" role="tabpanel">
            <h2>Extracted Tables</h2>
            ${tablesHtml}
          </div>
          
          <div class="tab-pane fade" id="text" role="tabpanel">
            <h2>Extracted Text</h2>
            ${textSampleHtml}
          </div>
        </div>
      </div>
      
      <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    </body>
    </html>
  `;
}

// Run the function if called directly
if (require.main === module) {
  renderSampleData().catch(console.error);
}

module.exports = { renderSampleData };