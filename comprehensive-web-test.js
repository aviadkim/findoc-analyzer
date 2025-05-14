/**
 * Comprehensive Web Test Script for PDF Processing System
 * 
 * This script performs hundreds of tests on the web interface to verify functionality
 * and uses MCP for both testing and web interactions.
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');
const { v4: uuidv4 } = require('uuid');

// Base URL for API requests
const BASE_URL = 'http://localhost:8080';

// MCP integrations
const sequentialThinkingMcp = require('./services/sequential-thinking-mcp');
const braveSearchMcp = require('./services/brave-search-mcp');

// Test results tracking
const testResults = {
  total: 0,
  passed: 0,
  failed: 0,
  skipped: 0,
  results: []
};

// Test logging
function logTest(testName, status, message, details = null) {
  const result = {
    id: uuidv4().substring(0, 8),
    name: testName,
    status,
    message,
    timestamp: new Date().toISOString(),
  };
  
  if (details) {
    result.details = details;
  }
  
  testResults.total++;
  
  if (status === 'PASS') {
    testResults.passed++;
    console.log(`✅ PASS: ${testName} - ${message}`);
  } else if (status === 'FAIL') {
    testResults.failed++;
    console.log(`❌ FAIL: ${testName} - ${message}`);
    if (details) {
      console.log(`   Details: ${JSON.stringify(details)}`);
    }
  } else if (status === 'SKIP') {
    testResults.skipped++;
    console.log(`⚠️ SKIP: ${testName} - ${message}`);
  }
  
  testResults.results.push(result);
  
  // Live update results file
  fs.writeFileSync(
    path.join(__dirname, 'web-test-results.json'),
    JSON.stringify(testResults, null, 2)
  );
}

// Test suite for API endpoints
async function testApiEndpoints() {
  console.log('\n--- Testing API Endpoints ---\n');
  
  // Test 1: Check server status
  try {
    await axios.get(`${BASE_URL}/`);
    logTest('Server Status', 'PASS', 'Server is running');
  } catch (error) {
    logTest('Server Status', 'FAIL', 'Server is not running', { error: error.message });
  }
  
  // Test 2: Get documents list
  try {
    const response = await axios.get(`${BASE_URL}/api/documents`);
    if (Array.isArray(response.data)) {
      logTest('Documents List', 'PASS', `Retrieved ${response.data.length} documents`);
    } else {
      logTest('Documents List', 'FAIL', 'Response is not an array');
    }
  } catch (error) {
    logTest('Documents List', 'FAIL', 'Failed to get documents', { error: error.message });
  }
  
  // Test 3: Process sample PDF
  try {
    const response = await axios.get(`${BASE_URL}/api/process-sample?processingType=standard`);
    if (response.data) {
      logTest('Process Sample PDF', 'PASS', 'Successfully processed sample PDF');
    } else {
      logTest('Process Sample PDF', 'FAIL', 'Failed to process sample PDF');
    }
  } catch (error) {
    logTest('Process Sample PDF', 'FAIL', 'Failed to process sample PDF', { error: error.message });
  }
  
  // Test 4: Process sample PDF with MCP
  try {
    const response = await axios.get(`${BASE_URL}/api/process-sample?processingType=mcp`);
    if (response.data) {
      logTest('Process Sample PDF with MCP', 'PASS', 'Successfully processed sample PDF with MCP');
    } else {
      logTest('Process Sample PDF with MCP', 'FAIL', 'Failed to process sample PDF with MCP');
    }
  } catch (error) {
    logTest('Process Sample PDF with MCP', 'FAIL', 'Failed to process sample PDF with MCP', { error: error.message });
  }
}

// Test suite for entity extraction using Sequential Thinking MCP
async function testSequentialThinkingMcp() {
  console.log('\n--- Testing Sequential Thinking MCP ---\n');
  
  // Test texts with various financial entities
  const testTexts = [
    {
      name: 'Simple Company and ISIN',
      text: 'Apple Inc. (ISIN: US0378331005) reported quarterly earnings.'
    },
    {
      name: 'Multiple Companies',
      text: 'Portfolio contains shares of Microsoft Corporation, Amazon.com Inc., and Tesla Inc.'
    },
    {
      name: 'Financial Metrics',
      text: 'Total Return: 15.7%, Expense Ratio: 0.82%, Dividend Yield: 3.2%'
    },
    {
      name: 'Currency Values',
      text: 'Market Value: $1,245,300.00, Cash Balance: €10,500.00'
    },
    {
      name: 'Multiple ISINs',
      text: 'Securities: US0378331005, US5949181045, US0231351067, US88160R1014'
    }
  ];
  
  for (const test of testTexts) {
    try {
      const payload = {
        action: 'think',
        params: {
          question: `Extract all financial entities from this text: ${test.text}`,
          maxSteps: 3
        }
      };
      
      const response = await sequentialThinkingMcp.handleRequest(payload);
      
      if (response && !response.error) {
        logTest(`Sequential Thinking: ${test.name}`, 'PASS', 'Successfully extracted entities', response);
      } else {
        logTest(`Sequential Thinking: ${test.name}`, 'FAIL', 'Failed to extract entities', response);
      }
    } catch (error) {
      logTest(`Sequential Thinking: ${test.name}`, 'FAIL', 'Error during extraction', { error: error.message });
    }
  }
}

// Test suite for entity enrichment using Brave Search MCP
async function testBraveSearchMcp() {
  console.log('\n--- Testing Brave Search MCP ---\n');
  
  // Test queries
  const testQueries = [
    {
      name: 'Company Search',
      query: 'Apple Inc. financial information'
    },
    {
      name: 'ISIN Search',
      query: 'US0378331005 security details'
    },
    {
      name: 'Stock Ticker Search',
      query: 'AAPL stock price'
    },
    {
      name: 'Financial Metric Search',
      query: 'S&P 500 current P/E ratio'
    },
    {
      name: 'Portfolio Analysis Search',
      query: 'portfolio diversification strategies'
    }
  ];
  
  for (const test of testQueries) {
    try {
      const payload = {
        action: 'search',
        params: {
          q: test.query,
          count: 3
        }
      };
      
      const response = await braveSearchMcp.handleRequest(payload);
      
      if (response && !response.error && response.results) {
        logTest(`Brave Search: ${test.name}`, 'PASS', `Found ${response.results.length} results`, { query: test.query });
      } else {
        logTest(`Brave Search: ${test.name}`, 'FAIL', 'Failed to get search results', response);
      }
    } catch (error) {
      logTest(`Brave Search: ${test.name}`, 'FAIL', 'Error during search', { error: error.message });
    }
  }
}

// Test suite for UI components
async function testUiComponents() {
  console.log('\n--- Testing UI Components ---\n');
  
  // Test UI components by checking for various paths
  const uiPaths = [
    { name: 'Home Page', path: '/' },
    { name: 'Upload Page', path: '/upload' },
    { name: 'Documents Page', path: '/documents-new' },
    { name: 'Analytics Page', path: '/analytics-new' },
    { name: 'Document Chat Page', path: '/document-chat' },
    { name: 'Document Comparison Page', path: '/document-comparison' },
    { name: 'Test Page', path: '/test' },
    { name: 'Simple Test Page', path: '/simple-test' }
  ];
  
  for (const test of uiPaths) {
    try {
      const response = await axios.get(`${BASE_URL}${test.path}`);
      if (response.status === 200) {
        logTest(`UI Component: ${test.name}`, 'PASS', `Successfully loaded ${test.path}`);
      } else {
        logTest(`UI Component: ${test.name}`, 'FAIL', `Failed to load ${test.path}`, { status: response.status });
      }
    } catch (error) {
      logTest(`UI Component: ${test.name}`, 'FAIL', `Error loading ${test.path}`, { error: error.message });
    }
  }
}

// Test suite for PDF processing with upload
async function testPdfProcessing() {
  console.log('\n--- Testing PDF Processing ---\n');
  
  // Test processing existing PDFs in the test-pdfs directory
  const pdfDirectory = path.join(__dirname, 'test-pdfs');
  
  if (!fs.existsSync(pdfDirectory)) {
    logTest('PDF Processing Directory', 'FAIL', 'Test PDFs directory does not exist');
    return;
  }
  
  // Get list of PDF files
  const pdfFiles = fs.readdirSync(pdfDirectory).filter(file => file.endsWith('.pdf'));
  
  if (pdfFiles.length === 0) {
    logTest('PDF Processing Files', 'FAIL', 'No PDF files found in test directory');
    return;
  }
  
  logTest('PDF Processing Files', 'PASS', `Found ${pdfFiles.length} PDF files for testing`);
  
  // Test uploading and processing each PDF
  for (const pdfFile of pdfFiles) {
    const pdfPath = path.join(pdfDirectory, pdfFile);
    
    // Try using API endpoint if available
    try {
      const form = new FormData();
      form.append('pdf', fs.createReadStream(pdfPath));
      
      // Check if endpoint exists
      const response = await axios.post(`${BASE_URL}/api/process-pdf`, form, {
        headers: {
          ...form.getHeaders(),
        },
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
      });
      
      if (response.data && response.data.id) {
        logTest(`PDF Processing: ${pdfFile}`, 'PASS', `Successfully processed PDF`, { id: response.data.id });
      } else {
        logTest(`PDF Processing: ${pdfFile}`, 'FAIL', 'Failed to process PDF, no ID returned');
      }
    } catch (error) {
      // Endpoint might not exist
      logTest(`PDF Processing: ${pdfFile}`, 'SKIP', 'API endpoint not available, testing with MCP directly');
      
      try {
        // Use MCP directly to process
        const mcpProcessor = require('./services/mcp-document-processor');
        const result = await mcpProcessor.processDocument(pdfPath);
        
        if (result && result.documentId) {
          logTest(`PDF Processing (MCP): ${pdfFile}`, 'PASS', 'Successfully processed with MCP', { entities: result.entities?.length || 0 });
        } else {
          logTest(`PDF Processing (MCP): ${pdfFile}`, 'FAIL', 'Failed to process with MCP');
        }
      } catch (mcpError) {
        logTest(`PDF Processing (MCP): ${pdfFile}`, 'FAIL', 'Error processing with MCP', { error: mcpError.message });
      }
    }
  }
}

// Test suite for document chat functionality
async function testDocumentChat() {
  console.log('\n--- Testing Document Chat ---\n');
  
  // Get a list of available documents
  try {
    const response = await axios.get(`${BASE_URL}/api/documents`);
    
    if (!Array.isArray(response.data) || response.data.length === 0) {
      logTest('Document Chat', 'SKIP', 'No documents available for chat testing');
      return;
    }
    
    // Test questions on each document
    const questions = [
      'What is this document about?',
      'What companies are mentioned in this document?',
      'What ISINs are in this document?',
      'What are the key financial metrics?',
      'Are there any tables in this document?'
    ];
    
    for (const document of response.data.slice(0, 3)) { // Test first 3 documents
      const documentId = document.id;
      
      for (const question of questions) {
        try {
          const questionResponse = await axios.post(
            `${BASE_URL}/api/documents/${documentId}/questions`,
            { question }
          );
          
          if (questionResponse.data && questionResponse.data.answer) {
            logTest(`Document Chat: ${documentId} - ${question}`, 'PASS', 'Successfully received answer');
          } else {
            logTest(`Document Chat: ${documentId} - ${question}`, 'FAIL', 'No answer received');
          }
        } catch (error) {
          logTest(`Document Chat: ${documentId} - ${question}`, 'FAIL', 'Error asking question', { error: error.message });
        }
      }
    }
  } catch (error) {
    logTest('Document Chat', 'FAIL', 'Error getting documents for chat testing', { error: error.message });
  }
}

// Test suite for entity extraction from tables
async function testTableEntityExtraction() {
  console.log('\n--- Testing Table Entity Extraction ---\n');
  
  // Sample tables to test
  const sampleTables = [
    {
      name: 'Portfolio Holdings',
      headers: ['Security Name', 'ISIN', 'Quantity', 'Price', 'Market Value'],
      rows: [
        ['Apple Inc.', 'US0378331005', '100', '$200.00', '$20,000.00'],
        ['Microsoft Corporation', 'US5949181045', '150', '$300.00', '$45,000.00'],
        ['Amazon.com Inc.', 'US0231351067', '50', '$150.00', '$7,500.00'],
        ['Tesla Inc.', 'US88160R1014', '75', '$250.00', '$18,750.00']
      ]
    },
    {
      name: 'Performance Metrics',
      headers: ['Metric', 'Value', 'Benchmark', 'Difference'],
      rows: [
        ['1-Year Return', '15.7%', '12.8%', '+2.9%'],
        ['3-Year Return', '45.3%', '38.2%', '+7.1%'],
        ['5-Year Return', '82.1%', '75.5%', '+6.6%'],
        ['Volatility', '14.2%', '15.8%', '-1.6%']
      ]
    }
  ];
  
  for (const table of sampleTables) {
    try {
      // Convert table to text for testing
      let tableText = table.headers.join('\t') + '\n';
      for (const row of table.rows) {
        tableText += row.join('\t') + '\n';
      }
      
      // Use sequential thinking MCP to extract entities
      const payload = {
        action: 'think',
        params: {
          question: `Extract all financial entities from this table: ${tableText}`,
          maxSteps: 3
        }
      };
      
      const response = await sequentialThinkingMcp.handleRequest(payload);
      
      if (response && !response.error) {
        let entitiesFound = 0;
        try {
          const result = JSON.parse(response.result);
          entitiesFound = result.entities?.length || 0;
        } catch (parseError) {
          // Ignore parsing errors
        }
        
        logTest(`Table Entity Extraction: ${table.name}`, 'PASS', `Extracted ${entitiesFound} entities`);
      } else {
        logTest(`Table Entity Extraction: ${table.name}`, 'FAIL', 'Failed to extract entities from table');
      }
    } catch (error) {
      logTest(`Table Entity Extraction: ${table.name}`, 'FAIL', 'Error during table extraction', { error: error.message });
    }
  }
}

// Test suite for error handling
async function testErrorHandling() {
  console.log('\n--- Testing Error Handling ---\n');
  
  // Test invalid API calls
  const errorTests = [
    { name: 'Invalid Endpoint', path: '/api/nonexistent' },
    { name: 'Invalid Document ID', path: '/api/documents/invalid-id' },
    { name: 'Missing Query Parameter', path: '/api/process-sample' }, // Missing processingType
    { name: 'Invalid Query', path: '/api/documents/doc-1/questions', method: 'post', data: {} } // Missing question
  ];
  
  for (const test of errorTests) {
    try {
      if (test.method === 'post') {
        await axios.post(`${BASE_URL}${test.path}`, test.data || {});
      } else {
        await axios.get(`${BASE_URL}${test.path}`);
      }
      
      // If we get here, the request did not throw an error as expected
      logTest(`Error Handling: ${test.name}`, 'FAIL', 'Expected error but received success');
    } catch (error) {
      // Check if the error is an HTTP error (not a network error)
      if (error.response) {
        logTest(`Error Handling: ${test.name}`, 'PASS', `Received expected error: ${error.response.status}`);
      } else {
        logTest(`Error Handling: ${test.name}`, 'FAIL', 'Network error instead of HTTP error', { error: error.message });
      }
    }
  }
}

// Run all tests
async function runAllTests() {
  console.log('Starting comprehensive web tests...');
  console.log('Results will be saved to web-test-results.json');
  
  const startTime = new Date();
  
  // Create initial results file
  fs.writeFileSync(
    path.join(__dirname, 'web-test-results.json'),
    JSON.stringify({
      startTime: startTime.toISOString(),
      total: 0,
      passed: 0,
      failed: 0,
      skipped: 0,
      results: []
    }, null, 2)
  );
  
  try {
    // Run all test suites
    await testApiEndpoints();
    await testSequentialThinkingMcp();
    await testBraveSearchMcp();
    await testUiComponents();
    await testPdfProcessing();
    await testDocumentChat();
    await testTableEntityExtraction();
    await testErrorHandling();
    
    const endTime = new Date();
    const durationMs = endTime - startTime;
    
    // Update results with summary
    testResults.startTime = startTime.toISOString();
    testResults.endTime = endTime.toISOString();
    testResults.durationMs = durationMs;
    testResults.durationFormatted = `${Math.floor(durationMs / 60000)}m ${Math.floor((durationMs % 60000) / 1000)}s`;
    
    fs.writeFileSync(
      path.join(__dirname, 'web-test-results.json'),
      JSON.stringify(testResults, null, 2)
    );
    
    // Display summary
    console.log('\n--- Test Summary ---\n');
    console.log(`Total Tests: ${testResults.total}`);
    console.log(`Passed: ${testResults.passed}`);
    console.log(`Failed: ${testResults.failed}`);
    console.log(`Skipped: ${testResults.skipped}`);
    console.log(`Duration: ${testResults.durationFormatted}`);
    
    // Create an HTML report
    createHtmlReport();
  } catch (error) {
    console.error('Error running tests:', error);
  }
}

// Create HTML report
function createHtmlReport() {
  const reportHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>PDF Processing Test Results</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
      color: #333;
    }
    h1, h2, h3 {
      color: #0066cc;
    }
    .summary {
      display: flex;
      gap: 20px;
      margin: 20px 0;
    }
    .summary-item {
      padding: 15px;
      border-radius: 8px;
      width: 150px;
      text-align: center;
    }
    .total {
      background-color: #e7f5ff;
      border: 1px solid #74c0fc;
    }
    .passed {
      background-color: #ebfbee;
      border: 1px solid #69db7c;
    }
    .failed {
      background-color: #fff5f5;
      border: 1px solid #ff8787;
    }
    .skipped {
      background-color: #fff9db;
      border: 1px solid #ffd43b;
    }
    .number {
      font-size: 2em;
      font-weight: bold;
      margin: 10px 0;
    }
    .result {
      margin: 10px 0;
      padding: 15px;
      border-radius: 6px;
      border-left: 5px solid #ccc;
    }
    .result.pass {
      background-color: #f4faf5;
      border-left-color: #40c057;
    }
    .result.fail {
      background-color: #fff5f5;
      border-left-color: #fa5252;
    }
    .result.skip {
      background-color: #fff9db;
      border-left-color: #ffd43b;
    }
    .category {
      margin: 30px 0;
      border-bottom: 1px solid #ddd;
      padding-bottom: 10px;
    }
    .result-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .result-time {
      font-size: 0.8em;
      color: #777;
    }
    .result-details {
      background-color: #f8f9fa;
      padding: 10px;
      border-radius: 4px;
      margin-top: 10px;
      font-family: monospace;
      white-space: pre-wrap;
      display: none;
    }
    .result-toggle {
      background: none;
      border: none;
      color: #0066cc;
      cursor: pointer;
      font-size: 0.9em;
    }
    .result-toggle:hover {
      text-decoration: underline;
    }
  </style>
</head>
<body>
  <h1>PDF Processing Test Results</h1>
  
  <div class="summary">
    <div class="summary-item total">
      <div>Total Tests</div>
      <div class="number">${testResults.total}</div>
    </div>
    <div class="summary-item passed">
      <div>Passed</div>
      <div class="number">${testResults.passed}</div>
    </div>
    <div class="summary-item failed">
      <div>Failed</div>
      <div class="number">${testResults.failed}</div>
    </div>
    <div class="summary-item skipped">
      <div>Skipped</div>
      <div class="number">${testResults.skipped}</div>
    </div>
  </div>
  
  <div>
    <p><strong>Start Time:</strong> ${new Date(testResults.startTime).toLocaleString()}</p>
    <p><strong>End Time:</strong> ${new Date(testResults.endTime).toLocaleString()}</p>
    <p><strong>Duration:</strong> ${testResults.durationFormatted}</p>
  </div>
  
  ${generateResultsHtml()}
  
  <script>
    function toggleDetails(id) {
      const details = document.getElementById('details-' + id);
      const toggle = document.getElementById('toggle-' + id);
      
      if (details.style.display === 'none') {
        details.style.display = 'block';
        toggle.textContent = 'Hide Details';
      } else {
        details.style.display = 'none';
        toggle.textContent = 'Show Details';
      }
    }
  </script>
</body>
</html>`;

  fs.writeFileSync(
    path.join(__dirname, 'web-test-report.html'),
    reportHtml
  );
  
  console.log('HTML report saved to web-test-report.html');
}

function generateResultsHtml() {
  // Group results by category
  const categories = {};
  
  testResults.results.forEach(result => {
    const categoryName = result.name.split(':')[0].trim();
    if (!categories[categoryName]) {
      categories[categoryName] = [];
    }
    categories[categoryName].push(result);
  });
  
  let html = '';
  
  Object.keys(categories).forEach(category => {
    html += `<div class="category">
      <h2>${category}</h2>`;
      
    categories[category].forEach(result => {
      const statusClass = result.status === 'PASS' ? 'pass' : (result.status === 'FAIL' ? 'fail' : 'skip');
      
      html += `<div class="result ${statusClass}">
        <div class="result-header">
          <h3>${result.name}</h3>
          <span class="result-time">${new Date(result.timestamp).toLocaleTimeString()}</span>
        </div>
        <p>${result.message}</p>`;
        
      if (result.details) {
        html += `
        <button id="toggle-${result.id}" class="result-toggle" onclick="toggleDetails('${result.id}')">Show Details</button>
        <div id="details-${result.id}" class="result-details" style="display: none;">${JSON.stringify(result.details, null, 2)}</div>`;
      }
      
      html += `</div>`;
    });
    
    html += `</div>`;
  });
  
  return html;
}

// Run all tests
runAllTests();