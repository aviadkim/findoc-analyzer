/**
 * Simple HTTP-based test for application running on port 8080
 * This tests basic functionality without requiring browser dependencies
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');

// Configuration
const config = {
  baseUrl: 'http://localhost:8080',
  timeout: 30000, // 30 seconds
  resultsDir: path.join(__dirname, 'app-test-results'),
  testPdfPath: path.join(__dirname, 'test-files', 'test.pdf')
};

// Create results directory
if (!fs.existsSync(config.resultsDir)) {
  fs.mkdirSync(config.resultsDir, { recursive: true });
}

// Create test PDF if it doesn't exist
function ensureTestPdfExists() {
  const testDir = path.dirname(config.testPdfPath);
  
  if (!fs.existsSync(testDir)) {
    fs.mkdirSync(testDir, { recursive: true });
  }
  
  if (!fs.existsSync(config.testPdfPath)) {
    // Create a simple test PDF content
    const pdfContent = `%PDF-1.5
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
(This is a test PDF document for integration testing.) Tj
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
%%EOF`;
    
    fs.writeFileSync(config.testPdfPath, pdfContent);
    console.log(`Created test PDF: ${config.testPdfPath}`);
  }
}

// Fetch HTML content of a page
async function fetchHtml(url) {
  try {
    const response = await axios.get(url, { timeout: config.timeout });
    return response.data;
  } catch (error) {
    console.error(`Error fetching ${url}: ${error.message}`);
    return null;
  }
}

// Save HTML content to file
function saveHtml(html, filename) {
  const filePath = path.join(config.resultsDir, filename);
  fs.writeFileSync(filePath, html);
  console.log(`Saved HTML to: ${filePath}`);
}

// Check if content contains specific elements
function checkForElement(html, elementPattern) {
  return html.includes(elementPattern);
}

// Run the test
async function runTest() {
  const results = {
    timestamp: new Date().toISOString(),
    pages: {},
    issues: []
  };
  
  console.log('Starting simple app test...');
  
  // Ensure test PDF exists
  ensureTestPdfExists();

  try {
    // Test homepage
    console.log('\nTesting homepage...');
    const homepageHtml = await fetchHtml(config.baseUrl);
    
    if (!homepageHtml) {
      results.issues.push({
        page: 'homepage',
        issue: 'Failed to fetch homepage',
        severity: 'critical'
      });
    } else {
      saveHtml(homepageHtml, 'homepage.html');
      
      // Check for navigation elements
      if (!checkForElement(homepageHtml, 'nav') && 
          !checkForElement(homepageHtml, 'sidebar') && 
          !checkForElement(homepageHtml, 'menu')) {
        results.issues.push({
          page: 'homepage',
          issue: 'No navigation/sidebar found',
          severity: 'high'
        });
      }
      
      // Check for upload link
      if (!checkForElement(homepageHtml, 'href="upload"') && 
          !checkForElement(homepageHtml, 'href="/upload"')) {
        results.issues.push({
          page: 'homepage',
          issue: 'No upload link found',
          severity: 'high'
        });
      }
    }
    
    // Test upload page
    console.log('\nTesting upload page...');
    const uploadHtml = await fetchHtml(`${config.baseUrl}/upload`);
    
    if (!uploadHtml) {
      results.issues.push({
        page: 'upload',
        issue: 'Failed to fetch upload page',
        severity: 'critical'
      });
    } else {
      saveHtml(uploadHtml, 'upload.html');
      
      // Check for file input
      if (!checkForElement(uploadHtml, '<input type="file"')) {
        results.issues.push({
          page: 'upload',
          issue: 'No file input found on upload page',
          severity: 'critical'
        });
      }
      
      // Check for process button
      if (!checkForElement(uploadHtml, 'Process</button>') && 
          !checkForElement(uploadHtml, 'Process"') && 
          !checkForElement(uploadHtml, 'process"')) {
        results.issues.push({
          page: 'upload',
          issue: 'No process button found on upload page',
          severity: 'critical'
        });
      }
    }
    
    // Test file upload API if available
    console.log('\nTesting file upload API...');
    try {
      const form = new FormData();
      form.append('file', fs.createReadStream(config.testPdfPath));
      
      const uploadResponse = await axios.post(`${config.baseUrl}/api/upload`, form, {
        headers: form.getHeaders(),
        timeout: config.timeout
      });
      
      console.log('Upload API response:', uploadResponse.status);
      
      if (uploadResponse.status !== 200) {
        results.issues.push({
          page: 'api',
          issue: 'File upload API returned non-200 status',
          severity: 'high'
        });
      }
    } catch (error) {
      console.log('Upload API error:', error.message);
      
      results.issues.push({
        page: 'api',
        issue: 'File upload API failed or does not exist',
        severity: 'high'
      });
    }
    
    // Test documents page
    console.log('\nTesting documents page...');
    const documentsHtml = await fetchHtml(`${config.baseUrl}/documents-new`);
    
    if (!documentsHtml) {
      results.issues.push({
        page: 'documents',
        issue: 'Failed to fetch documents page',
        severity: 'high'
      });
    } else {
      saveHtml(documentsHtml, 'documents.html');
      
      // Check for document cards/list
      if (!checkForElement(documentsHtml, 'document-card') && 
          !checkForElement(documentsHtml, 'document-list') && 
          !checkForElement(documentsHtml, 'document-item')) {
        results.issues.push({
          page: 'documents',
          issue: 'No document cards/list found on documents page',
          severity: 'high'
        });
      }
    }
    
    // Test document chat page
    console.log('\nTesting document chat page...');
    const chatHtml = await fetchHtml(`${config.baseUrl}/document-chat`);
    
    if (!chatHtml) {
      results.issues.push({
        page: 'document-chat',
        issue: 'Failed to fetch document chat page',
        severity: 'high'
      });
    } else {
      saveHtml(chatHtml, 'document-chat.html');
      
      // Check for chat input
      if (!checkForElement(chatHtml, '<input') && !checkForElement(chatHtml, '<textarea')) {
        results.issues.push({
          page: 'document-chat',
          issue: 'No chat input found on document chat page',
          severity: 'high'
        });
      }
      
      // Check for send button
      if (!checkForElement(chatHtml, 'Send</button>') && 
          !checkForElement(chatHtml, 'send"') && 
          !checkForElement(chatHtml, 'submit"')) {
        results.issues.push({
          page: 'document-chat',
          issue: 'No send button found on document chat page',
          severity: 'high'
        });
      }
    }
    
    // Test analytics page
    console.log('\nTesting analytics page...');
    const analyticsHtml = await fetchHtml(`${config.baseUrl}/analytics-new`);
    
    if (!analyticsHtml) {
      results.issues.push({
        page: 'analytics',
        issue: 'Failed to fetch analytics page',
        severity: 'medium'
      });
    } else {
      saveHtml(analyticsHtml, 'analytics.html');
      
      // Check for charts/graphs
      if (!checkForElement(analyticsHtml, '<canvas') && 
          !checkForElement(analyticsHtml, 'chart') && 
          !checkForElement(analyticsHtml, 'graph')) {
        results.issues.push({
          page: 'analytics',
          issue: 'No charts/graphs found on analytics page',
          severity: 'medium'
        });
      }
    }
    
    // Test document comparison page
    console.log('\nTesting document comparison page...');
    const comparisonHtml = await fetchHtml(`${config.baseUrl}/document-comparison`);
    
    if (!comparisonHtml) {
      results.issues.push({
        page: 'comparison',
        issue: 'Failed to fetch document comparison page',
        severity: 'medium'
      });
    } else {
      saveHtml(comparisonHtml, 'comparison.html');
      
      // Check for comparison form
      if (!checkForElement(comparisonHtml, '<form') && !checkForElement(comparisonHtml, 'select')) {
        results.issues.push({
          page: 'comparison',
          issue: 'No comparison form/select elements found',
          severity: 'medium'
        });
      }
    }
    
    // Test for global chat button on homepage
    if (homepageHtml && 
        !checkForElement(homepageHtml, 'chat-button') && 
        !checkForElement(homepageHtml, 'chatbot') && 
        !checkForElement(homepageHtml, 'chat-widget')) {
      results.issues.push({
        page: 'global',
        issue: 'No chat button/widget found',
        severity: 'high'
      });
    }
    
    // Generate summary
    results.summary = {
      issuesFound: results.issues.length,
      criticalIssues: results.issues.filter(issue => issue.severity === 'critical').length,
      highIssues: results.issues.filter(issue => issue.severity === 'high').length,
      mediumIssues: results.issues.filter(issue => issue.severity === 'medium').length
    };
    
    // Save results
    const resultsPath = path.join(config.resultsDir, 'test-results.json');
    fs.writeFileSync(resultsPath, JSON.stringify(results, null, 2));
    console.log(`\nResults saved to: ${resultsPath}`);
    
    // Generate HTML report
    const htmlReport = generateHtmlReport(results);
    const reportPath = path.join(config.resultsDir, 'test-report.html');
    fs.writeFileSync(reportPath, htmlReport);
    console.log(`HTML report saved to: ${reportPath}`);
    
    // Display issues summary
    console.log('\n--- Issues Summary ---');
    console.log(`Total issues found: ${results.issues.length}`);
    console.log(`Critical issues: ${results.summary.criticalIssues}`);
    console.log(`High-priority issues: ${results.summary.highIssues}`);
    console.log(`Medium-priority issues: ${results.summary.mediumIssues}`);
    
    if (results.issues.length > 0) {
      console.log('\nTop issues:');
      results.issues
        .filter(issue => issue.severity === 'critical' || issue.severity === 'high')
        .forEach((issue, index) => {
          console.log(`${index + 1}. [${issue.severity.toUpperCase()}] ${issue.page}: ${issue.issue}`);
        });
    }
    
    return results;
  } catch (error) {
    console.error('Test failed with error:', error);
    return { error: error.message };
  }
}

// Generate HTML report
function generateHtmlReport(results) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Application Test Results</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
    }
    h1, h2 {
      color: #0066cc;
    }
    .summary {
      display: flex;
      flex-wrap: wrap;
      gap: 15px;
      margin-bottom: 30px;
    }
    .card {
      background-color: #f5f5f5;
      border-radius: 8px;
      padding: 15px;
      min-width: 150px;
      text-align: center;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .card.critical {
      background-color: #ffebee;
      border-left: 5px solid #f44336;
    }
    .card.high {
      background-color: #fff8e1;
      border-left: 5px solid #ffc107;
    }
    .card.medium {
      background-color: #e8f5e9;
      border-left: 5px solid #4caf50;
    }
    .number {
      font-size: 2em;
      font-weight: bold;
      margin: 10px 0;
    }
    .issues {
      margin-top: 30px;
    }
    .issue {
      background-color: #f9f9f9;
      border-radius: 8px;
      padding: 15px;
      margin-bottom: 15px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .issue.critical {
      background-color: #ffebee;
      border-left: 5px solid #f44336;
    }
    .issue.high {
      background-color: #fff8e1;
      border-left: 5px solid #ffc107;
    }
    .issue.medium {
      background-color: #e8f5e9;
      border-left: 5px solid #4caf50;
    }
  </style>
</head>
<body>
  <h1>Application Test Results</h1>
  <p>Test run on: ${new Date(results.timestamp).toLocaleString()}</p>
  
  <div class="summary">
    <div class="card">
      <div>Total Issues</div>
      <div class="number">${results.summary.issuesFound}</div>
    </div>
    <div class="card critical">
      <div>Critical Issues</div>
      <div class="number">${results.summary.criticalIssues}</div>
    </div>
    <div class="card high">
      <div>High-Priority Issues</div>
      <div class="number">${results.summary.highIssues}</div>
    </div>
    <div class="card medium">
      <div>Medium-Priority Issues</div>
      <div class="number">${results.summary.mediumIssues}</div>
    </div>
  </div>
  
  <div class="issues">
    <h2>Issues Found</h2>
    ${results.issues.map(issue => `
      <div class="issue ${issue.severity}">
        <h3>Issue on ${issue.page} page</h3>
        <p><strong>Description:</strong> ${issue.issue}</p>
        <p><strong>Severity:</strong> ${issue.severity}</p>
      </div>
    `).join('')}
  </div>
  
  <h2>HTML Content</h2>
  <p>HTML content of tested pages has been saved to the <code>${config.resultsDir}</code> directory.</p>
</body>
</html>
  `;
}

// Run the test
runTest().catch(console.error);