/**
 * Test Coverage Report Generator for FinDoc Analyzer
 * 
 * This script generates a comprehensive test coverage report by aggregating
 * results from various testing frameworks (Jest, Pytest, Playwright).
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const REPORT_DIR = path.join(__dirname, '../../test-results/coverage-report');
const FRONTEND_COVERAGE_DIR = path.join(__dirname, '../../coverage');
const BACKEND_COVERAGE_DIR = path.join(__dirname, '../../backend/agents/pytest-cov');
const E2E_COVERAGE_DIR = path.join(__dirname, '../../test-results/e2e-coverage');
const OUTPUT_HTML = path.join(REPORT_DIR, 'index.html');
const OUTPUT_JSON = path.join(REPORT_DIR, 'coverage-summary.json');

// Create report directory if it doesn't exist
if (!fs.existsSync(REPORT_DIR)) {
  fs.mkdirSync(REPORT_DIR, { recursive: true });
}

// Helper function to calculate coverage percentage
function calculateCoverage(covered, total) {
  if (total === 0) return 0;
  return Math.round((covered / total) * 100);
}

// Helper function to merge coverage data
function mergeCoverage(target, source) {
  if (!source) return target;
  
  // Merge metrics
  const metrics = ['lines', 'statements', 'functions', 'branches'];
  metrics.forEach(metric => {
    if (source[metric]) {
      target[metric] = target[metric] || { total: 0, covered: 0, pct: 0 };
      target[metric].total += source[metric].total || 0;
      target[metric].covered += source[metric].covered || 0;
      target[metric].pct = calculateCoverage(target[metric].covered, target[metric].total);
    }
  });
  
  return target;
}

// Collect Jest coverage (frontend)
function collectFrontendCoverage() {
  console.log('Collecting frontend test coverage...');
  
  try {
    // Run Jest with coverage if needed
    if (!fs.existsSync(path.join(FRONTEND_COVERAGE_DIR, 'coverage-summary.json'))) {
      console.log('Running frontend tests to generate coverage...');
      execSync('npm run test:coverage', { stdio: 'inherit' });
    }
    
    // Read coverage summary
    const summaryPath = path.join(FRONTEND_COVERAGE_DIR, 'coverage-summary.json');
    if (fs.existsSync(summaryPath)) {
      const summary = JSON.parse(fs.readFileSync(summaryPath, 'utf8'));
      return { 
        frontend: summary.total,
        details: { frontend: summary }
      };
    } else {
      console.error('Frontend coverage summary not found');
      return { frontend: null, details: { frontend: null } };
    }
  } catch (error) {
    console.error('Error collecting frontend coverage:', error);
    return { frontend: null, details: { frontend: null } };
  }
}

// Collect Pytest coverage (backend)
function collectBackendCoverage() {
  console.log('Collecting backend test coverage...');
  
  try {
    // Run pytest with coverage if needed
    if (!fs.existsSync(path.join(BACKEND_COVERAGE_DIR, 'coverage.json'))) {
      console.log('Running backend tests to generate coverage...');
      execSync('cd backend/agents && python -m pytest --cov=. --cov-report=json', { stdio: 'inherit' });
    }
    
    // Read coverage data
    const coveragePath = path.join(BACKEND_COVERAGE_DIR, 'coverage.json');
    if (fs.existsSync(coveragePath)) {
      const coverage = JSON.parse(fs.readFileSync(coveragePath, 'utf8'));
      
      // Convert pytest coverage format to our format
      const totalLines = coverage.totals.covered_lines + coverage.totals.missing_lines;
      const coveredLines = coverage.totals.covered_lines;
      
      return {
        backend: {
          lines: {
            total: totalLines,
            covered: coveredLines,
            pct: calculateCoverage(coveredLines, totalLines)
          },
          statements: {
            total: totalLines,
            covered: coveredLines,
            pct: calculateCoverage(coveredLines, totalLines)
          },
          functions: {
            total: 0, // Not tracked by pytest
            covered: 0,
            pct: 0
          },
          branches: {
            total: 0, // Not tracked by default
            covered: 0,
            pct: 0
          }
        },
        details: { backend: coverage }
      };
    } else {
      console.error('Backend coverage data not found');
      return { backend: null, details: { backend: null } };
    }
  } catch (error) {
    console.error('Error collecting backend coverage:', error);
    return { backend: null, details: { backend: null } };
  }
}

// Collect E2E test coverage
function collectE2ECoverage() {
  console.log('Collecting E2E test coverage...');
  
  try {
    if (!fs.existsSync(path.join(E2E_COVERAGE_DIR, 'coverage-summary.json'))) {
      // E2E coverage is optional
      console.log('E2E coverage data not found, skipping...');
      return { e2e: null, details: { e2e: null } };
    }
    
    const summaryPath = path.join(E2E_COVERAGE_DIR, 'coverage-summary.json');
    const summary = JSON.parse(fs.readFileSync(summaryPath, 'utf8'));
    
    return { 
      e2e: summary.total,
      details: { e2e: summary }
    };
  } catch (error) {
    console.error('Error collecting E2E coverage:', error);
    return { e2e: null, details: { e2e: null } };
  }
}

// Generate aggregated coverage report
function generateCoverageReport() {
  console.log('Generating aggregated coverage report...');
  
  // Collect coverage data
  const frontendCoverage = collectFrontendCoverage();
  const backendCoverage = collectBackendCoverage();
  const e2eCoverage = collectE2ECoverage();
  
  // Merge coverage data
  const totalCoverage = {};
  mergeCoverage(totalCoverage, frontendCoverage.frontend);
  mergeCoverage(totalCoverage, backendCoverage.backend);
  mergeCoverage(totalCoverage, e2eCoverage.e2e);
  
  // Calculate overall coverage percentages
  const lines = totalCoverage.lines ? totalCoverage.lines.pct : 0;
  const statements = totalCoverage.statements ? totalCoverage.statements.pct : 0;
  const functions = totalCoverage.functions ? totalCoverage.functions.pct : 0;
  const branches = totalCoverage.branches ? totalCoverage.branches.pct : 0;
  
  // Create summary object
  const summary = {
    timestamp: new Date().toISOString(),
    total: totalCoverage,
    frontend: frontendCoverage.frontend,
    backend: backendCoverage.backend,
    e2e: e2eCoverage.e2e,
    overall: (lines + statements + functions + branches) / 4
  };
  
  // Save JSON summary
  fs.writeFileSync(OUTPUT_JSON, JSON.stringify(summary, null, 2));
  
  // Generate HTML report
  const html = generateHtmlReport(summary);
  fs.writeFileSync(OUTPUT_HTML, html);
  
  console.log(`Coverage report generated at ${OUTPUT_HTML}`);
  console.log(`Overall coverage: ${summary.overall.toFixed(2)}%`);
  
  return summary;
}

// Generate HTML report
function generateHtmlReport(summary) {
  const formatPercent = (pct) => {
    if (pct === undefined || pct === null) return 'N/A';
    return `${pct.toFixed(2)}%`;
  };
  
  const getColorClass = (pct) => {
    if (pct === undefined || pct === null) return 'na';
    if (pct >= 80) return 'high';
    if (pct >= 60) return 'medium';
    return 'low';
  };
  
  const createRow = (label, data) => {
    if (!data) {
      return `
        <tr>
          <td>${label}</td>
          <td class="na">N/A</td>
          <td class="na">N/A</td>
          <td class="na">N/A</td>
          <td class="na">N/A</td>
        </tr>
      `;
    }
    
    return `
      <tr>
        <td>${label}</td>
        <td class="${getColorClass(data.lines?.pct)}">${formatPercent(data.lines?.pct)}</td>
        <td class="${getColorClass(data.statements?.pct)}">${formatPercent(data.statements?.pct)}</td>
        <td class="${getColorClass(data.functions?.pct)}">${formatPercent(data.functions?.pct)}</td>
        <td class="${getColorClass(data.branches?.pct)}">${formatPercent(data.branches?.pct)}</td>
      </tr>
    `;
  };
  
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>FinDoc Analyzer - Test Coverage Report</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 0;
          padding: 20px;
          color: #333;
        }
        h1, h2 {
          color: #2c3e50;
        }
        .summary {
          margin: 20px 0;
          padding: 15px;
          background-color: #f5f5f5;
          border-radius: 5px;
        }
        .timestamp {
          color: #7f8c8d;
          font-size: 0.9em;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin: 20px 0;
        }
        th, td {
          padding: 12px 15px;
          text-align: left;
          border-bottom: 1px solid #ddd;
        }
        th {
          background-color: #2c3e50;
          color: white;
        }
        tr:hover {
          background-color: #f5f5f5;
        }
        .high {
          background-color: #2ecc71;
          color: white;
        }
        .medium {
          background-color: #f39c12;
          color: white;
        }
        .low {
          background-color: #e74c3c;
          color: white;
        }
        .na {
          background-color: #95a5a6;
          color: white;
        }
        .overall {
          font-size: 1.2em;
          font-weight: bold;
        }
      </style>
    </head>
    <body>
      <h1>FinDoc Analyzer - Test Coverage Report</h1>
      <div class="timestamp">Generated on: ${new Date(summary.timestamp).toLocaleString()}</div>
      
      <div class="summary">
        <p class="overall">Overall Coverage: <span class="${getColorClass(summary.overall)}">${formatPercent(summary.overall)}</span></p>
      </div>
      
      <h2>Coverage Summary</h2>
      <table>
        <thead>
          <tr>
            <th>Component</th>
            <th>Lines</th>
            <th>Statements</th>
            <th>Functions</th>
            <th>Branches</th>
          </tr>
        </thead>
        <tbody>
          ${createRow('Total', summary.total)}
          ${createRow('Frontend', summary.frontend)}
          ${createRow('Backend', summary.backend)}
          ${createRow('E2E', summary.e2e)}
        </tbody>
      </table>
      
      <h2>Coverage Details</h2>
      <p>For detailed coverage information, please refer to the individual coverage reports:</p>
      <ul>
        <li><a href="../../../coverage/lcov-report/index.html">Frontend Coverage Report</a></li>
        <li><a href="../../../backend/agents/pytest-cov/index.html">Backend Coverage Report</a></li>
        <li><a href="../../../test-results/e2e-coverage/index.html">E2E Coverage Report</a></li>
      </ul>
    </body>
    </html>
  `;
}

// Run the report generation
if (require.main === module) {
  generateCoverageReport();
}

module.exports = {
  generateCoverageReport,
  collectFrontendCoverage,
  collectBackendCoverage,
  collectE2ECoverage
};
