/**
 * Generate HTML Report
 * 
 * This script generates an HTML report from the test results.
 */

const fs = require('fs');
const path = require('path');

// Configuration
const config = {
  // Input directory
  inputDir: 'test_results',
  
  // Output file
  outputFile: 'test_results/report.html'
};

/**
 * Generate HTML report
 */
function generateHtmlReport() {
  console.log('Generating HTML report...');
  
  // Read summary file
  const summaryPath = path.join(config.inputDir, 'summary.json');
  
  if (!fs.existsSync(summaryPath)) {
    console.error(`Summary file not found: ${summaryPath}`);
    return;
  }
  
  const summary = JSON.parse(fs.readFileSync(summaryPath, 'utf8'));
  
  // Read test result files
  const testResults = [];
  
  for (const result of summary.results) {
    const resultPath = path.join(config.inputDir, `${result.environment.replace(/\s+/g, '_')}_${result.testPdf.replace(/\s+/g, '_')}.json`);
    
    if (fs.existsSync(resultPath)) {
      const testResult = JSON.parse(fs.readFileSync(resultPath, 'utf8'));
      testResults.push(testResult);
    }
  }
  
  // Generate HTML
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>PDF Processing Test Report</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
            line-height: 1.6;
        }
        h1, h2, h3 {
            color: #333;
        }
        .summary {
            margin-bottom: 20px;
            padding: 15px;
            background-color: #f8f9fa;
            border: 1px solid #ddd;
            border-radius: 4px;
        }
        .summary-stats {
            display: flex;
            gap: 20px;
            margin-top: 10px;
        }
        .summary-stat {
            flex: 1;
            padding: 10px;
            border-radius: 4px;
            text-align: center;
        }
        .total {
            background-color: #e9ecef;
        }
        .passed {
            background-color: #d4edda;
            color: #155724;
        }
        .failed {
            background-color: #f8d7da;
            color: #721c24;
        }
        .test-results {
            margin-top: 20px;
        }
        .test-result {
            margin-bottom: 20px;
            padding: 15px;
            background-color: #f8f9fa;
            border: 1px solid #ddd;
            border-radius: 4px;
        }
        .test-result-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 10px;
        }
        .test-result-title {
            margin: 0;
        }
        .test-result-status {
            padding: 5px 10px;
            border-radius: 4px;
            font-weight: bold;
        }
        .pass {
            background-color: #d4edda;
            color: #155724;
        }
        .fail {
            background-color: #f8d7da;
            color: #721c24;
        }
        .test-steps {
            margin-top: 10px;
        }
        .test-step {
            margin-bottom: 10px;
            padding: 10px;
            background-color: #fff;
            border: 1px solid #ddd;
            border-radius: 4px;
        }
        .test-step-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 5px;
        }
        .test-step-title {
            margin: 0;
            font-weight: bold;
        }
        .test-step-status {
            padding: 2px 5px;
            border-radius: 2px;
            font-size: 12px;
        }
        .test-step-details {
            margin-top: 5px;
            padding: 5px;
            background-color: #f8f9fa;
            border: 1px solid #ddd;
            border-radius: 2px;
            font-family: monospace;
            font-size: 12px;
            white-space: pre-wrap;
            max-height: 200px;
            overflow-y: auto;
        }
        .collapsible {
            cursor: pointer;
        }
        .content {
            display: none;
            overflow: hidden;
        }
    </style>
</head>
<body>
    <h1>PDF Processing Test Report</h1>
    
    <div class="summary">
        <h2>Summary</h2>
        <p>Generated on: ${new Date(summary.timestamp).toLocaleString()}</p>
        
        <div class="summary-stats">
            <div class="summary-stat total">
                <h3>Total Tests</h3>
                <p>${summary.totalTests}</p>
            </div>
            <div class="summary-stat passed">
                <h3>Passed Tests</h3>
                <p>${summary.passedTests}</p>
            </div>
            <div class="summary-stat failed">
                <h3>Failed Tests</h3>
                <p>${summary.failedTests}</p>
            </div>
            <div class="summary-stat total">
                <h3>Success Rate</h3>
                <p>${(summary.passedTests / summary.totalTests * 100).toFixed(2)}%</p>
            </div>
        </div>
    </div>
    
    <div class="test-results">
        <h2>Test Results</h2>
        
        ${testResults.map(result => `
        <div class="test-result">
            <div class="test-result-header">
                <h3 class="test-result-title">${result.environment} - ${result.testPdf}</h3>
                <span class="test-result-status ${result.status.toLowerCase()}">${result.status}</span>
            </div>
            
            <p>Timestamp: ${new Date(result.timestamp).toLocaleString()}</p>
            
            ${result.error ? `<p class="error">Error: ${result.error}</p>` : ''}
            
            <div class="test-steps">
                <h4 class="collapsible">Test Steps (${result.steps.length})</h4>
                <div class="content">
                    ${result.steps.map(step => `
                    <div class="test-step">
                        <div class="test-step-header">
                            <h5 class="test-step-title">${step.name}</h5>
                            <span class="test-step-status ${step.status.toLowerCase()}">${step.status}</span>
                        </div>
                        
                        <div class="test-step-details collapsible">Details</div>
                        <div class="content">
                            <pre>${JSON.stringify(step.details, null, 2)}</pre>
                        </div>
                    </div>
                    `).join('')}
                </div>
            </div>
        </div>
        `).join('')}
    </div>
    
    <script>
        // Add collapsible functionality
        const collapsibles = document.getElementsByClassName("collapsible");
        
        for (let i = 0; i < collapsibles.length; i++) {
            collapsibles[i].addEventListener("click", function() {
                this.classList.toggle("active");
                
                const content = this.nextElementSibling;
                
                if (content.style.display === "block") {
                    content.style.display = "none";
                } else {
                    content.style.display = "block";
                }
            });
        }
    </script>
</body>
</html>
  `;
  
  // Create output directory if it doesn't exist
  fs.mkdirSync(path.dirname(config.outputFile), { recursive: true });
  
  // Write HTML to file
  fs.writeFileSync(config.outputFile, html);
  
  console.log(`HTML report generated: ${config.outputFile}`);
}

// Generate HTML report
generateHtmlReport();
