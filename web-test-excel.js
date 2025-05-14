/**
 * Web Test Excel
 * 
 * Test script to demonstrate the enhanced spreadsheet processing functionality
 * with a web-friendly output format
 */

const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');
const mcpDocumentProcessor = require('./services/mcp-document-processor');

// Constants
const TEST_EXCEL_FILE = path.join(__dirname, 'test-portfolio.xlsx');
const OUTPUT_HTML_FILE = path.join(__dirname, 'test-result.html');

/**
 * Main test function
 */
async function runTest() {
  try {
    console.log('Testing Enhanced Spreadsheet Processing');
    console.log('======================================\n');

    // Ensure test file exists, create if not
    await ensureTestFileExists();

    // Process the Excel file with MCP document processor
    console.log('Processing test Excel file...');
    const result = await mcpDocumentProcessor.processDocument(TEST_EXCEL_FILE);

    // Generate HTML result
    console.log('Generating HTML result...');
    const html = generateHtmlResult(result);

    // Write HTML to file
    fs.writeFileSync(OUTPUT_HTML_FILE, html);
    console.log(`\nHTML result saved to: ${OUTPUT_HTML_FILE}`);
    console.log(`\nOpen this file in a web browser to view the nicely formatted results.`);
    
    // Show summary in console
    displayResultSummary(result);
  } catch (error) {
    console.error(`\nTest failed: ${error.message}`);
    console.error(error);
    process.exit(1);
  }
}

/**
 * Display a summary of the processing result
 * @param {Object} result - Processing result
 */
function displayResultSummary(result) {
  console.log('\nProcessing Results Summary:');
  console.log('==========================');
  console.log(`Document ID: ${result.documentId}`);
  console.log(`File Name: ${result.fileName}`);
  
  // Display metadata summary
  console.log('\nMetadata:');
  console.log(`- Sheet Count: ${result.metadata.sheetCount}`);
  console.log(`- Sheet Names: ${result.metadata.sheetNames.join(', ')}`);
  console.log(`- File Size: ${result.metadata.fileSize} bytes`);
  
  // Display text sample
  console.log('\nText Sample:');
  const textSample = result.text.substring(0, 150) + (result.text.length > 150 ? '...' : '');
  console.log(textSample);
  
  // Display tables summary
  console.log('\nTables:');
  console.log(`Total tables: ${result.tables.length}`);
  result.tables.forEach((table, index) => {
    console.log(`- Table ${index + 1}: ${table.name || 'Unnamed'} (${table.rows.length} rows, ${table.headers.length} columns)`);
  });
  
  // Display entities summary
  console.log('\nEntities:');
  console.log(`Total entities: ${result.entities.length}`);
  
  // Group entities by type
  const entityTypes = {};
  result.entities.forEach(entity => {
    if (!entityTypes[entity.type]) {
      entityTypes[entity.type] = [];
    }
    entityTypes[entity.type].push(entity);
  });
  
  Object.entries(entityTypes).forEach(([type, entities]) => {
    console.log(`- ${type}: ${entities.length} entities`);
  });
}

/**
 * Generate HTML result from processing result
 * @param {Object} result - Processing result
 * @returns {string} - HTML representation of result
 */
function generateHtmlResult(result) {
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
        // Display up to 10 rows
        const rowsToDisplay = table.rows.slice(0, 10);
        rowsToDisplay.forEach(row => {
          tablesHtml += '<tr>';
          row.forEach(cell => {
            tablesHtml += `<td>${cell || ''}</td>`;
          });
          tablesHtml += '</tr>';
        });
        
        if (table.rows.length > 10) {
          tablesHtml += `
            <tr>
              <td colspan="${table.headers ? table.headers.length : 1}" class="text-center">
                ... and ${table.rows.length - 10} more rows
              </td>
            </tr>
          `;
        }
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
            <td>${entity.confidence ? entity.confidence.toFixed(2) : 'N/A'}</td>
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
  
  // Create full HTML document
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Spreadsheet Processing Result</title>
      <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
      <style>
        body {
          padding-top: 2rem;
          padding-bottom: 2rem;
        }
        .nav-tabs {
          margin-bottom: 1rem;
        }
        pre {
          white-space: pre-wrap;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1 class="mb-4">Enhanced Spreadsheet Processing Result</h1>
        <p class="lead">File: ${result.fileName}</p>
        
        <ul class="nav nav-tabs" id="resultTabs" role="tablist">
          <li class="nav-item" role="presentation">
            <button class="nav-link active" id="overview-tab" data-bs-toggle="tab" data-bs-target="#overview" type="button" role="tab" aria-controls="overview" aria-selected="true">Overview</button>
          </li>
          <li class="nav-item" role="presentation">
            <button class="nav-link" id="tables-tab" data-bs-toggle="tab" data-bs-target="#tables" type="button" role="tab" aria-controls="tables" aria-selected="false">Tables</button>
          </li>
          <li class="nav-item" role="presentation">
            <button class="nav-link" id="entities-tab" data-bs-toggle="tab" data-bs-target="#entities" type="button" role="tab" aria-controls="entities" aria-selected="false">Entities</button>
          </li>
          <li class="nav-item" role="presentation">
            <button class="nav-link" id="text-tab" data-bs-toggle="tab" data-bs-target="#text" type="button" role="tab" aria-controls="text" aria-selected="false">Text Sample</button>
          </li>
        </ul>
        
        <div class="tab-content" id="resultTabsContent">
          <div class="tab-pane fade show active" id="overview" role="tabpanel" aria-labelledby="overview-tab">
            <h2>Document Metadata</h2>
            ${metadataHtml}
            
            <h2>Summary</h2>
            <div class="row">
              <div class="col-md-4">
                <div class="card">
                  <div class="card-body">
                    <h5 class="card-title">Tables</h5>
                    <p class="card-text display-4">${result.tables.length}</p>
                  </div>
                </div>
              </div>
              
              <div class="col-md-4">
                <div class="card">
                  <div class="card-body">
                    <h5 class="card-title">Entities</h5>
                    <p class="card-text display-4">${result.entities.length}</p>
                  </div>
                </div>
              </div>
              
              <div class="col-md-4">
                <div class="card">
                  <div class="card-body">
                    <h5 class="card-title">Sheets</h5>
                    <p class="card-text display-4">${result.metadata.sheetCount}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div class="tab-pane fade" id="tables" role="tabpanel" aria-labelledby="tables-tab">
            <h2>Extracted Tables</h2>
            ${tablesHtml}
          </div>
          
          <div class="tab-pane fade" id="entities" role="tabpanel" aria-labelledby="entities-tab">
            <h2>Extracted Entities</h2>
            ${entitiesHtml}
          </div>
          
          <div class="tab-pane fade" id="text" role="tabpanel" aria-labelledby="text-tab">
            <h2>Text Sample</h2>
            ${textSampleHtml}
          </div>
        </div>
      </div>
      
      <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    </body>
    </html>
  `;
}

/**
 * Ensure the test Excel file exists by creating it if necessary
 */
async function ensureTestFileExists() {
  try {
    // Check if file exists
    if (fs.existsSync(TEST_EXCEL_FILE)) {
      console.log(`Using existing test file: ${TEST_EXCEL_FILE}`);
      return;
    }
    
    console.log(`Creating test Excel file: ${TEST_EXCEL_FILE}`);
    
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
    XLSX.writeFile(workbook, TEST_EXCEL_FILE);
    
    console.log('Test Excel file created successfully');
  } catch (error) {
    console.error(`Error creating test Excel file: ${error.message}`);
    throw error;
  }
}

// Run the test
runTest().catch(console.error);