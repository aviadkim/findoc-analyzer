/**
 * Generate Test Dashboard
 * 
 * This script generates an HTML dashboard from Playwright test results.
 */

const fs = require('fs');
const path = require('path');

// Configuration
const config = {
  playwrightReportDir: path.join(__dirname, '..', 'playwright-report'),
  outputDir: path.join(__dirname, 'dashboard'),
  title: 'FinDoc Analyzer Test Dashboard'
};

// Create output directory if it doesn't exist
if (!fs.existsSync(config.outputDir)) {
  fs.mkdirSync(config.outputDir, { recursive: true });
}

// Read test results
function readTestResults() {
  try {
    const resultsPath = path.join(config.playwrightReportDir, 'report.json');
    if (fs.existsSync(resultsPath)) {
      const data = fs.readFileSync(resultsPath, 'utf8');
      return JSON.parse(data);
    } else {
      console.error(`Test results file not found: ${resultsPath}`);
      return null;
    }
  } catch (error) {
    console.error('Error reading test results:', error);
    return null;
  }
}

// Generate dashboard HTML
function generateDashboard(results) {
  if (!results) {
    return `
      <html>
        <head>
          <title>${config.title}</title>
          <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/css/bootstrap.min.css" rel="stylesheet">
          <style>
            body { padding: 20px; }
            .error-message { color: red; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>${config.title}</h1>
            <div class="alert alert-danger">
              <p class="error-message">No test results found. Please run the tests first.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  // Calculate test statistics
  const totalTests = results.suites.reduce((count, suite) => count + suite.specs.length, 0);
  const passedTests = results.suites.reduce((count, suite) => {
    return count + suite.specs.filter(spec => spec.tests.every(test => test.results.every(result => result.status === 'passed'))).length;
  }, 0);
  const failedTests = totalTests - passedTests;
  const passRate = totalTests > 0 ? Math.round((passedTests / totalTests) * 100) : 0;

  // Generate test results table
  let testResultsHtml = '';
  results.suites.forEach(suite => {
    suite.specs.forEach(spec => {
      const specStatus = spec.tests.every(test => test.results.every(result => result.status === 'passed')) ? 'passed' : 'failed';
      const statusBadge = specStatus === 'passed' 
        ? '<span class="badge bg-success">Passed</span>' 
        : '<span class="badge bg-danger">Failed</span>';
      
      testResultsHtml += `
        <tr>
          <td>${suite.title}</td>
          <td>${spec.title}</td>
          <td>${statusBadge}</td>
          <td>${spec.tests[0]?.results[0]?.duration || 'N/A'} ms</td>
        </tr>
      `;
    });
  });

  // Generate HTML
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <title>${config.title}</title>
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/css/bootstrap.min.css" rel="stylesheet">
        <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
        <style>
          body { padding: 20px; }
          .dashboard-header { margin-bottom: 30px; }
          .stats-card { margin-bottom: 20px; }
          .test-results { margin-top: 30px; }
          .chart-container { height: 300px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="dashboard-header">
            <h1>${config.title}</h1>
            <p class="text-muted">Generated on ${new Date().toLocaleString()}</p>
          </div>
          
          <div class="row">
            <div class="col-md-4">
              <div class="card stats-card">
                <div class="card-body">
                  <h5 class="card-title">Total Tests</h5>
                  <h2 class="card-text">${totalTests}</h2>
                </div>
              </div>
            </div>
            <div class="col-md-4">
              <div class="card stats-card">
                <div class="card-body">
                  <h5 class="card-title">Passed Tests</h5>
                  <h2 class="card-text text-success">${passedTests}</h2>
                </div>
              </div>
            </div>
            <div class="col-md-4">
              <div class="card stats-card">
                <div class="card-body">
                  <h5 class="card-title">Failed Tests</h5>
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
            <h3>Test Details</h3>
            <table class="table table-striped">
              <thead>
                <tr>
                  <th>Suite</th>
                  <th>Test</th>
                  <th>Status</th>
                  <th>Duration</th>
                </tr>
              </thead>
              <tbody>
                ${testResultsHtml}
              </tbody>
            </table>
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
}

// Main function
function main() {
  console.log('Generating test dashboard...');
  
  // Read test results
  const results = readTestResults();
  
  // Generate dashboard
  const dashboardHtml = generateDashboard(results);
  
  // Write dashboard to file
  const outputPath = path.join(config.outputDir, 'index.html');
  fs.writeFileSync(outputPath, dashboardHtml);
  
  console.log(`Dashboard generated: ${outputPath}`);
}

// Run the script
main();
