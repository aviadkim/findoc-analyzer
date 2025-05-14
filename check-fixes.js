/**
 * Quick check for the critical fixed components
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

// Create output directory
const outputDir = path.join(__dirname, 'fix-verification');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Save the HTML content
function saveHtml(pageName, html) {
  const filePath = path.join(outputDir, `${pageName}.html`);
  fs.writeFileSync(filePath, html);
  console.log(`Saved ${pageName} HTML to: ${filePath}`);
}

// Test the process button fix
async function testProcessButtonFix() {
  return new Promise((resolve) => {
    console.log('\nTesting Process Button Fix...');
    
    const options = { 
      hostname: 'localhost', 
      port: 8080, 
      path: '/upload', 
      method: 'GET' 
    };
    
    const req = http.request(options, res => {
      let data = '';
      
      res.on('data', chunk => {
        data += chunk;
      });
      
      res.on('end', () => {
        // Save HTML for inspection
        saveHtml('upload-page', data);
        
        // Check for process button
        const hasProcessButton = data.includes('process-document-btn') || 
                               data.includes('floating-process-btn') || 
                               data.includes('Process Document');
        
        if (hasProcessButton) {
          console.log('✅ FIXED: Process Button is present on the upload page');
          // Extract the process button implementation for review
          let buttonCode = '';
          try {
            const processButtonRegex = /<button[^>]*id=["']process-document-btn["'][^>]*>[\s\S]*?<\/button>/i;
            const match = data.match(processButtonRegex);
            if (match) {
              buttonCode = match[0];
            }
          } catch (error) {
            buttonCode = 'Error extracting button code: ' + error.message;
          }
          
          resolve({
            fixed: true,
            details: 'The process button has been successfully added to the upload page',
            implementation: buttonCode || 'Button implementation found but code extraction failed'
          });
        } else {
          console.log('❌ NOT FIXED: Process Button is missing on the upload page');
          resolve({
            fixed: false,
            details: 'The process button is still missing from the upload page'
          });
        }
      });
    });
    
    req.on('error', error => {
      console.error('Error testing process button:', error.message);
      resolve({
        fixed: false,
        details: 'Error: ' + error.message
      });
    });
    
    req.end();
  });
}

// Test the chat functionality fix
async function testChatFunctionalityFix() {
  return new Promise((resolve) => {
    console.log('\nTesting Chat Functionality Fix...');
    
    const options = { 
      hostname: 'localhost', 
      port: 8080, 
      path: '/', 
      method: 'GET' 
    };
    
    const req = http.request(options, res => {
      let data = '';
      
      res.on('data', chunk => {
        data += chunk;
      });
      
      res.on('end', () => {
        // Save HTML for inspection
        saveHtml('homepage', data);
        
        // Check for chat button
        const hasChatButton = data.includes('show-chat-btn') || 
                            data.includes('chat-button') || 
                            data.includes('>Chat<');
        
        // Check for chat container
        const hasChatContainer = data.includes('document-chat-container') || 
                               data.includes('chat-container');
        
        if (hasChatButton && hasChatContainer) {
          console.log('✅ FIXED: Chat functionality is fully implemented');
          // Extract the chat implementation for review
          let chatCode = '';
          try {
            const chatContainerRegex = /<div[^>]*id=["']document-chat-container["'][^>]*>[\s\S]*?<\/div>/i;
            const match = data.match(chatContainerRegex);
            if (match) {
              chatCode = match[0].substring(0, 500) + '... (truncated)';
            }
          } catch (error) {
            chatCode = 'Error extracting chat code: ' + error.message;
          }
          
          resolve({
            fixed: true,
            details: 'Chat button and container are both present',
            implementation: chatCode || 'Chat implementation found but code extraction failed'
          });
        } else if (hasChatButton) {
          console.log('⚠️ PARTIAL FIX: Chat button exists but container is missing');
          resolve({
            fixed: 'partial',
            details: 'The chat button is present but the chat container is missing'
          });
        } else if (hasChatContainer) {
          console.log('⚠️ PARTIAL FIX: Chat container exists but button is missing');
          resolve({
            fixed: 'partial',
            details: 'The chat container is present but the chat button is missing'
          });
        } else {
          console.log('❌ NOT FIXED: Chat functionality is missing');
          resolve({
            fixed: false,
            details: 'Both chat button and container are missing'
          });
        }
      });
    });
    
    req.on('error', error => {
      console.error('Error testing chat functionality:', error.message);
      resolve({
        fixed: false,
        details: 'Error: ' + error.message
      });
    });
    
    req.end();
  });
}

// Run all tests and generate report
async function runTests() {
  console.log('Running Fix Verification Tests...');
  console.log('=================================');
  
  const processButtonResults = await testProcessButtonFix();
  const chatFunctionalityResults = await testChatFunctionalityFix();
  
  const report = {
    timestamp: new Date().toISOString(),
    processButton: processButtonResults,
    chatFunctionality: chatFunctionalityResults,
    summary: {
      processButtonFixed: processButtonResults.fixed === true,
      chatFunctionalityFixed: chatFunctionalityResults.fixed === true,
      allFixed: processButtonResults.fixed === true && chatFunctionalityResults.fixed === true
    }
  };
  
  // Save report
  const reportPath = path.join(outputDir, 'fix-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`\nSaved detailed report to: ${reportPath}`);
  
  // Generate HTML report
  const htmlReportPath = path.join(outputDir, 'fix-report.html');
  const htmlReport = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>FinDoc Analyzer Fix Verification Report</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
      color: #333;
    }
    h1, h2, h3 {
      color: #2c3e50;
    }
    .summary {
      background-color: ${report.summary.allFixed ? '#d4edda' : '#f8d7da'};
      border-left: 5px solid ${report.summary.allFixed ? '#28a745' : '#dc3545'};
      padding: 15px;
      margin-bottom: 20px;
      border-radius: 4px;
    }
    .fix {
      background-color: #f8f9fa;
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 20px;
    }
    .fix.fixed {
      border-left: 5px solid #28a745;
    }
    .fix.partial {
      border-left: 5px solid #ffc107;
    }
    .fix.not-fixed {
      border-left: 5px solid #dc3545;
    }
    .status {
      display: inline-block;
      padding: 5px 10px;
      border-radius: 4px;
      font-weight: bold;
      margin-bottom: 10px;
    }
    .status.fixed {
      background-color: #d4edda;
      color: #28a745;
    }
    .status.partial {
      background-color: #fff3cd;
      color: #856404;
    }
    .status.not-fixed {
      background-color: #f8d7da;
      color: #dc3545;
    }
    pre {
      background-color: #f8f9fa;
      padding: 15px;
      border-radius: 4px;
      overflow: auto;
      font-size: 14px;
      border: 1px solid #e9ecef;
    }
    .details {
      margin: 15px 0;
    }
  </style>
</head>
<body>
  <h1>FinDoc Analyzer Fix Verification Report</h1>
  <p>Report generated: ${new Date(report.timestamp).toLocaleString()}</p>
  
  <div class="summary">
    <h2>Summary</h2>
    <p><strong>Process Button Fix:</strong> ${report.summary.processButtonFixed ? '✅ FIXED' : '❌ NOT FIXED'}</p>
    <p><strong>Chat Functionality Fix:</strong> ${report.summary.chatFunctionalityFixed ? '✅ FIXED' : '❌ NOT FIXED'}</p>
    <p><strong>Overall Status:</strong> ${report.summary.allFixed ? '✅ ALL ISSUES FIXED' : '❌ SOME ISSUES REMAIN'}</p>
  </div>
  
  <h2>Fix Details</h2>
  
  <div class="fix ${processButtonResults.fixed === true ? 'fixed' : 'not-fixed'}">
    <h3>Process Button Fix</h3>
    <div class="status ${processButtonResults.fixed === true ? 'fixed' : 'not-fixed'}">
      ${processButtonResults.fixed === true ? 'FIXED' : 'NOT FIXED'}
    </div>
    <div class="details">
      <p>${processButtonResults.details}</p>
    </div>
    ${processButtonResults.implementation ? `
    <h4>Implementation</h4>
    <pre>${processButtonResults.implementation.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>
    ` : ''}
  </div>
  
  <div class="fix ${chatFunctionalityResults.fixed === true ? 'fixed' : chatFunctionalityResults.fixed === 'partial' ? 'partial' : 'not-fixed'}">
    <h3>Chat Functionality Fix</h3>
    <div class="status ${chatFunctionalityResults.fixed === true ? 'fixed' : chatFunctionalityResults.fixed === 'partial' ? 'partial' : 'not-fixed'}">
      ${chatFunctionalityResults.fixed === true ? 'FIXED' : chatFunctionalityResults.fixed === 'partial' ? 'PARTIAL FIX' : 'NOT FIXED'}
    </div>
    <div class="details">
      <p>${chatFunctionalityResults.details}</p>
    </div>
    ${chatFunctionalityResults.implementation ? `
    <h4>Implementation</h4>
    <pre>${chatFunctionalityResults.implementation.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>
    ` : ''}
  </div>
</body>
</html>
  `;
  
  fs.writeFileSync(htmlReportPath, htmlReport);
  console.log(`Generated HTML report: ${htmlReportPath}`);
  
  // Print summary to console
  console.log('\nSummary:');
  console.log('=================================');
  console.log(`Process Button Fix: ${report.summary.processButtonFixed ? '✅ FIXED' : '❌ NOT FIXED'}`);
  console.log(`Chat Functionality Fix: ${report.summary.chatFunctionalityFixed ? '✅ FIXED' : '❌ NOT FIXED'}`);
  console.log(`Overall Status: ${report.summary.allFixed ? '✅ ALL ISSUES FIXED' : '❌ SOME ISSUES REMAIN'}`);
  
  return report;
}

// Run the tests
runTests().catch(console.error);