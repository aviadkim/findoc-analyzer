/**
 * Run Tests Against Deployed Application Using Sequential Thinking
 * 
 * This script runs tests against the deployed FinDoc Analyzer application
 * using the Sequential Thinking approach to break down the testing process
 * into smaller, more manageable subtasks.
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Configuration
const config = {
  baseUrl: 'https://findoc-deploy.ey.r.appspot.com',
  testFilesDir: path.join(__dirname, 'tests', 'test-files'),
  resultsDir: path.join(__dirname, 'test-results'),
  reportsDir: path.join(__dirname, 'playwright-report'),
  testCategories: [
    'pdf-processing',
    'document-chat',
    'data-visualization',
    'export',
    'end-to-end'
  ]
};

// Create directories if they don't exist
for (const dir of [config.testFilesDir, config.resultsDir, config.reportsDir]) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// Sequential Thinking: Break down the testing process into smaller subtasks
const sequentialTests = {
  'pdf-processing': [
    { id: 'pdf-upload', name: 'PDF Upload Tests', file: 'tests/pdf-processing/pdf-upload.spec.js' },
    { id: 'text-extraction', name: 'Text Extraction Tests', file: 'tests/pdf-processing/text-extraction.spec.js' },
    { id: 'table-extraction', name: 'Table Extraction Tests', file: 'tests/pdf-processing/table-extraction.spec.js' },
    { id: 'metadata-extraction', name: 'Metadata Extraction Tests', file: 'tests/pdf-processing/metadata-extraction.spec.js' },
    { id: 'securities-extraction', name: 'Securities Extraction Tests', file: 'tests/pdf-processing/securities-extraction.spec.js' }
  ],
  'document-chat': [
    { id: 'question-answering', name: 'Question Answering Tests', file: 'tests/document-chat/question-answering.spec.js' },
    { id: 'document-summarization', name: 'Document Summarization Tests', file: 'tests/document-chat/document-summarization.spec.js' },
    { id: 'information-extraction', name: 'Information Extraction Tests', file: 'tests/document-chat/information-extraction.spec.js' }
  ],
  'data-visualization': [
    { id: 'chart-generation', name: 'Chart Generation Tests', file: 'tests/data-visualization/chart-generation.spec.js' },
    { id: 'dashboard-creation', name: 'Dashboard Creation Tests', file: 'tests/data-visualization/dashboard-creation.spec.js' },
    { id: 'report-generation', name: 'Report Generation Tests', file: 'tests/data-visualization/report-generation.spec.js' }
  ],
  'export': [
    { id: 'csv-export', name: 'CSV Export Tests', file: 'tests/export/csv-export.spec.js' },
    { id: 'excel-export', name: 'Excel Export Tests', file: 'tests/export/excel-export.spec.js' },
    { id: 'pdf-export', name: 'PDF Export Tests', file: 'tests/export/pdf-export.spec.js' },
    { id: 'json-export', name: 'JSON Export Tests', file: 'tests/export/json-export.spec.js' }
  ],
  'end-to-end': [
    { id: 'auth', name: 'User Authentication Tests', file: 'tests/end-to-end/auth.spec.js' },
    { id: 'document-processing-workflow', name: 'Document Processing Workflow Tests', file: 'tests/end-to-end/document-processing-workflow.spec.js' },
    { id: 'document-chat-workflow', name: 'Document Chat Workflow Tests', file: 'tests/end-to-end/document-chat-workflow.spec.js' },
    { id: 'data-visualization-workflow', name: 'Data Visualization Workflow Tests', file: 'tests/end-to-end/data-visualization-workflow.spec.js' },
    { id: 'export-workflow', name: 'Export Workflow Tests', file: 'tests/end-to-end/export-workflow.spec.js' }
  ]
};

// TaskMaster: Track testing progress
const taskMaster = {
  project: 'findoc-analyzer',
  task: 'testing',
  subtasks: {
    'unit-testing': { status: 'completed', priority: 'high' },
    'integration-testing': { status: 'completed', priority: 'high' },
    'end-to-end-testing': { status: 'in-progress', priority: 'high' },
    'performance-testing': { status: 'not-started', priority: 'medium' },
    'security-testing': { status: 'not-started', priority: 'high' }
  }
};

// Generate test files
function generateTestFiles() {
  console.log('Generating test files...');
  
  // Create test PDF if it doesn't exist
  const testPdfPath = path.join(config.testFilesDir, 'messos-portfolio.pdf');
  if (!fs.existsSync(testPdfPath)) {
    console.log('Creating test PDF...');
    try {
      execSync(`node tests/test-files/create-messos-pdf.js`, { stdio: 'inherit' });
    } catch (error) {
      console.warn('Error creating test PDF:', error.message);
    }
  }
}

// Run tests for a specific category
function runTestCategory(category) {
  console.log(`Running ${category} tests...`);
  
  const tests = sequentialTests[category];
  if (!tests) {
    console.warn(`No tests found for category: ${category}`);
    return;
  }
  
  for (const test of tests) {
    console.log(`Running ${test.name}...`);
    
    // Check if the test file exists
    if (fs.existsSync(test.file)) {
      try {
        execSync(`npx playwright test ${test.file}`, { stdio: 'inherit' });
        console.log(`${test.name} completed successfully`);
      } catch (error) {
        console.error(`Error running ${test.name}:`, error.message);
      }
    } else {
      console.warn(`Test file not found: ${test.file}`);
      
      // Run the deployed app tests as a fallback
      try {
        execSync(`npx playwright test tests/deployed-app-tests.spec.js`, { stdio: 'inherit' });
        console.log(`Deployed app tests completed successfully`);
      } catch (error) {
        console.error(`Error running deployed app tests:`, error.message);
      }
    }
  }
}

// Run all tests
function runAllTests() {
  console.log(`Running all tests against ${config.baseUrl}...`);
  
  for (const category of config.testCategories) {
    runTestCategory(category);
  }
}

// Generate test report
function generateTestReport() {
  console.log('Generating test report...');
  
  try {
    execSync('npx playwright show-report', { stdio: 'inherit' });
    console.log('Test report generated successfully');
  } catch (error) {
    console.error('Error generating test report:', error.message);
  }
}

// Main function
async function main() {
  console.log(`Running tests against deployed application: ${config.baseUrl}`);
  
  // Generate test files
  generateTestFiles();
  
  // Run all tests
  runAllTests();
  
  // Generate test report
  generateTestReport();
  
  console.log('All tests completed');
}

// Run the script
main().catch(error => {
  console.error('Error:', error);
  process.exit(1);
});
