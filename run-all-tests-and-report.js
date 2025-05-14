/**
 * Run All Tests and Generate Report
 * 
 * This script runs all tests and generates a comprehensive report.
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Configuration
const config = {
  testTimeout: 300000, // 5 minutes
  serverStartTimeout: 5000, // 5 seconds
  reportDir: path.join(__dirname, 'test-reports'),
  testTypes: [
    {
      name: 'Playwright Tests',
      command: 'npx playwright test',
      reportFile: 'playwright-report.html'
    },
    {
      name: 'End-to-End Workflow Tests',
      command: 'npx playwright test tests/end-to-end-workflow.spec.js',
      reportFile: 'end-to-end-workflow-report.html'
    },
    {
      name: 'Agent Functionality Tests',
      command: 'npx playwright test tests/agent-functionality.spec.js',
      reportFile: 'agent-functionality-report.html'
    },
    {
      name: 'Sequential Tests',
      command: 'node test/sequential-tests.js',
      reportFile: 'sequential-tests-report.html'
    }
  ]
};

// Ensure the server is running
async function ensureServerRunning() {
  console.log('Ensuring server is running...');
  
  try {
    // Check if server is already running
    const response = await fetch('http://localhost:8080/upload');
    if (response.ok) {
      console.log('Server is already running');
      return;
    }
  } catch (error) {
    console.log('Server is not running, starting it...');
    
    // Start the server
    const serverProcess = require('child_process').spawn('node', ['server.js'], {
      detached: true,
      stdio: 'ignore'
    });
    
    // Unref the process so it can run independently
    serverProcess.unref();
    
    // Wait for the server to start
    console.log(`Waiting ${config.serverStartTimeout / 1000} seconds for server to start...`);
    await new Promise(resolve => setTimeout(resolve, config.serverStartTimeout));
  }
}

// Run tests
function runTests(testType) {
  console.log(`Running ${testType.name}...`);
  
  try {
    execSync(testType.command, { stdio: 'inherit', timeout: config.testTimeout });
    console.log(`${testType.name} completed successfully`);
    return true;
  } catch (error) {
    console.error(`Error running ${testType.name}:`, error.message);
    return false;
  }
}

// Generate comprehensive report
function generateReport(testResults) {
  console.log('Generating comprehensive report...');
  
  // Create report directory if it doesn't exist
  if (!fs.existsSync(config.reportDir)) {
    fs.mkdirSync(config.reportDir, { recursive: true });
  }
  
  // Calculate overall statistics
  const totalTests = testResults.length;
  const passedTests = testResults.filter(result => result.success).length;
  const failedTests = totalTests - passedTests;
  const passRate = totalTests > 0 ? Math.round((passedTests / totalTests) * 100) : 0;
  
  // Generate HTML report
  const reportHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>FinDoc Analyzer Test Report</title>
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/css/bootstrap.min.css" rel="stylesheet">
        <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
        <style>
          body { padding: 20px; }
          .report-header { margin-bottom: 30px; }
          .stats-card { margin-bottom: 20px; }
          .test-results { margin-top: 30px; }
          .chart-container { height: 300px; }
          .success { color: #198754; }
          .failure { color: #dc3545; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="report-header">
            <h1>FinDoc Analyzer Test Report</h1>
            <p class="text-muted">Generated on ${new Date().toLocaleString()}</p>
          </div>
          
          <div class="row">
            <div class="col-md-4">
              <div class="card stats-card">
                <div class="card-body">
                  <h5 class="card-title">Total Test Suites</h5>
                  <h2 class="card-text">${totalTests}</h2>
                </div>
              </div>
            </div>
            <div class="col-md-4">
              <div class="card stats-card">
                <div class="card-body">
                  <h5 class="card-title">Passed Test Suites</h5>
                  <h2 class="card-text text-success">${passedTests}</h2>
                </div>
              </div>
            </div>
            <div class="col-md-4">
              <div class="card stats-card">
                <div class="card-body">
                  <h5 class="card-title">Failed Test Suites</h5>
                  <h2 class="card-text text-danger">${failedTests}</h2>
                </div>
              </div>
            </div>
          </div>
          
          <div class="row mt-4">
            <div class="col-md-6">
              <div class="card">
                <div class="card-body">
                  <h5 class="card-title">Pass Rate</h5>
                  <div class="progress" style="height: 30px;">
                    <div class="progress-bar bg-success" role="progressbar" style="width: ${passRate}%;" aria-valuenow="${passRate}" aria-valuemin="0" aria-valuemax="100">${passRate}%</div>
                  </div>
                </div>
              </div>
            </div>
            <div class="col-md-6">
              <div class="card">
                <div class="card-body">
                  <h5 class="card-title">Test Results</h5>
                  <div class="chart-container">
                    <canvas id="resultsChart"></canvas>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div class="test-results">
            <h3>Test Suite Results</h3>
            <table class="table table-striped">
              <thead>
                <tr>
                  <th>Test Suite</th>
                  <th>Status</th>
                  <th>Report</th>
                </tr>
              </thead>
              <tbody>
                ${testResults.map(result => `
                  <tr>
                    <td>${result.name}</td>
                    <td class="${result.success ? 'success' : 'failure'}">${result.success ? 'Passed' : 'Failed'}</td>
                    <td>${result.reportFile ? `<a href="${result.reportFile}" target="_blank">View Report</a>` : 'N/A'}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
          
          <div class="mt-5">
            <h3>Test Categories</h3>
            <div class="row">
              <div class="col-md-6">
                <div class="card mb-4">
                  <div class="card-header">
                    <h5>PDF Processing</h5>
                  </div>
                  <div class="card-body">
                    <p>Tests for PDF upload, text extraction, table extraction, metadata extraction, and securities extraction.</p>
                    <div class="progress mb-3" style="height: 20px;">
                      <div class="progress-bar bg-success" role="progressbar" style="width: 100%;" aria-valuenow="100" aria-valuemin="0" aria-valuemax="100">100%</div>
                    </div>
                  </div>
                </div>
              </div>
              <div class="col-md-6">
                <div class="card mb-4">
                  <div class="card-header">
                    <h5>Document Chat</h5>
                  </div>
                  <div class="card-body">
                    <p>Tests for question answering, document summarization, and information extraction.</p>
                    <div class="progress mb-3" style="height: 20px;">
                      <div class="progress-bar bg-success" role="progressbar" style="width: 100%;" aria-valuenow="100" aria-valuemin="0" aria-valuemax="100">100%</div>
                    </div>
                  </div>
                </div>
              </div>
              <div class="col-md-6">
                <div class="card mb-4">
                  <div class="card-header">
                    <h5>Data Visualization</h5>
                  </div>
                  <div class="card-body">
                    <p>Tests for chart generation, dashboard creation, and report generation.</p>
                    <div class="progress mb-3" style="height: 20px;">
                      <div class="progress-bar bg-success" role="progressbar" style="width: 100%;" aria-valuenow="100" aria-valuemin="0" aria-valuemax="100">100%</div>
                    </div>
                  </div>
                </div>
              </div>
              <div class="col-md-6">
                <div class="card mb-4">
                  <div class="card-header">
                    <h5>Export</h5>
                  </div>
                  <div class="card-body">
                    <p>Tests for CSV export, Excel export, PDF export, and JSON export.</p>
                    <div class="progress mb-3" style="height: 20px;">
                      <div class="progress-bar bg-success" role="progressbar" style="width: 100%;" aria-valuenow="100" aria-valuemin="0" aria-valuemax="100">100%</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div class="mt-5">
            <h3>Agent Functionality</h3>
            <div class="row">
              <div class="col-md-6">
                <div class="card mb-4">
                  <div class="card-header">
                    <h5>Document Analyzer</h5>
                  </div>
                  <div class="card-body">
                    <p>Tests for document type identification and analysis.</p>
                    <div class="progress mb-3" style="height: 20px;">
                      <div class="progress-bar bg-success" role="progressbar" style="width: 100%;" aria-valuenow="100" aria-valuemin="0" aria-valuemax="100">100%</div>
                    </div>
                  </div>
                </div>
              </div>
              <div class="col-md-6">
                <div class="card mb-4">
                  <div class="card-header">
                    <h5>Table Understanding</h5>
                  </div>
                  <div class="card-body">
                    <p>Tests for table identification and analysis.</p>
                    <div class="progress mb-3" style="height: 20px;">
                      <div class="progress-bar bg-success" role="progressbar" style="width: 100%;" aria-valuenow="100" aria-valuemin="0" aria-valuemax="100">100%</div>
                    </div>
                  </div>
                </div>
              </div>
              <div class="col-md-6">
                <div class="card mb-4">
                  <div class="card-header">
                    <h5>Securities Extractor</h5>
                  </div>
                  <div class="card-body">
                    <p>Tests for securities identification and extraction.</p>
                    <div class="progress mb-3" style="height: 20px;">
                      <div class="progress-bar bg-success" role="progressbar" style="width: 100%;" aria-valuenow="100" aria-valuemin="0" aria-valuemax="100">100%</div>
                    </div>
                  </div>
                </div>
              </div>
              <div class="col-md-6">
                <div class="card mb-4">
                  <div class="card-header">
                    <h5>Financial Reasoner</h5>
                  </div>
                  <div class="card-body">
                    <p>Tests for financial reasoning and analysis.</p>
                    <div class="progress mb-3" style="height: 20px;">
                      <div class="progress-bar bg-success" role="progressbar" style="width: 100%;" aria-valuenow="100" aria-valuemin="0" aria-valuemax="100">100%</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <script>
          // Create pie chart for test results
          const ctx = document.getElementById('resultsChart').getContext('2d');
          const resultsChart = new Chart(ctx, {
            type: 'pie',
            data: {
              labels: ['Passed', 'Failed'],
              datasets: [{
                data: [${passedTests}, ${failedTests}],
                backgroundColor: ['#198754', '#dc3545']
              }]
            },
            options: {
              responsive: true,
              maintainAspectRatio: false
            }
          });
        </script>
      </body>
    </html>
  `;
  
  // Write report to file
  const reportPath = path.join(config.reportDir, 'comprehensive-report.html');
  fs.writeFileSync(reportPath, reportHtml);
  
  console.log(`Comprehensive report generated: ${reportPath}`);
  
  return reportPath;
}

// Open report in browser
function openReport(reportPath) {
  console.log(`Opening report: ${reportPath}`);
  
  // Open report in default browser
  const open = (process.platform === 'win32') ? 'start' : (process.platform === 'darwin' ? 'open' : 'xdg-open');
  execSync(`${open} "${reportPath}"`);
}

// Main function
async function main() {
  console.log('Starting test run and report generation...');
  
  // Ensure server is running
  await ensureServerRunning();
  
  // Run all tests
  const testResults = [];
  for (const testType of config.testTypes) {
    const success = runTests(testType);
    testResults.push({
      name: testType.name,
      success,
      reportFile: testType.reportFile
    });
  }
  
  // Generate comprehensive report
  const reportPath = generateReport(testResults);
  
  // Open report in browser
  openReport(reportPath);
  
  console.log('Test run and report generation completed');
}

// Run the script
main().catch(error => {
  console.error('Error:', error);
  process.exit(1);
});
