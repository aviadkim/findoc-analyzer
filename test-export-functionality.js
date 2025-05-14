/**
 * Export Functionality Test Script
 * 
 * This script tests the comprehensive export functionality by making requests
 * to the export routes and verifying the responses.
 */

const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');

// Import export routes
const comprehensiveExportRoutes = require('./routes/comprehensive-export-routes');

// Create Express app
const app = express();

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files from 'exports' directory
app.use('/exports', express.static(path.join(__dirname, 'exports')));

// Mount export routes
app.use('/api/exports', comprehensiveExportRoutes);

// Start server
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  console.log(`Export test server running on port ${PORT}`);
  runTests();
});

/**
 * Run export tests
 */
async function runTests() {
  console.log('Starting export functionality tests...');
  
  try {
    // Test getting export formats
    await testGetFormats();
    
    // Test document export
    await testDocumentExport();
    
    // Test analytics export
    await testAnalyticsExport();
    
    // Test portfolio export
    await testPortfolioExport();
    
    // Test portfolio comparison export
    await testPortfolioComparisonExport();
    
    // Test export scheduling
    await testExportScheduling();
    
    // Test getting export history
    await testGetExportHistory();
    
    // Test clean up
    await testCleanup();
    
    console.log('\nAll tests completed successfully!');
  } catch (error) {
    console.error('Test failed:', error);
  }
  
  // Close server
  server.close(() => {
    console.log('Test server closed.');
    process.exit(0);
  });
}

/**
 * Make HTTP request
 * @param {string} method - HTTP method
 * @param {string} path - URL path
 * @param {Object} body - Request body
 * @returns {Promise<Object>} - Response
 */
async function makeRequest(method, path, body = null) {
  const url = `http://localhost:${PORT}${path}`;
  
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json'
    }
  };
  
  if (body) {
    options.body = JSON.stringify(body);
  }
  
  console.log(`\nMaking ${method} request to ${path}`);
  if (body) {
    console.log('Request body:', JSON.stringify(body, null, 2));
  }
  
  try {
    const response = await fetch(url, options);
    const data = await response.json();
    
    console.log('Response:', JSON.stringify(data, null, 2));
    
    return data;
  } catch (error) {
    console.error('Request failed:', error);
    throw error;
  }
}

/**
 * Test getting export formats
 */
async function testGetFormats() {
  console.log('\n=== Testing Get Export Formats ===');
  
  const response = await makeRequest('GET', '/api/exports/formats');
  
  if (!response.success) {
    throw new Error('Failed to get export formats');
  }
  
  if (!response.formats || !Array.isArray(response.formats) || response.formats.length === 0) {
    throw new Error('Invalid formats response');
  }
  
  console.log('Get export formats test passed!');
}

/**
 * Test document export
 */
async function testDocumentExport() {
  console.log('\n=== Testing Document Export ===');
  
  // Test JSON export
  const jsonResponse = await makeRequest('POST', '/api/exports/document/test-doc', {
    format: 'json',
    options: {
      includeMetadata: true,
      includeTables: true,
      includeSecurities: true
    }
  });
  
  if (!jsonResponse.success || !jsonResponse.export || !jsonResponse.export.downloadUrl) {
    throw new Error('Failed to export document as JSON');
  }
  
  // Test Excel export
  const excelResponse = await makeRequest('POST', '/api/exports/document/test-doc', {
    format: 'excel',
    options: {
      includeMetadata: true,
      includeTables: true,
      includeSecurities: true
    }
  });
  
  if (!excelResponse.success || !excelResponse.export || !excelResponse.export.downloadUrl) {
    throw new Error('Failed to export document as Excel');
  }
  
  console.log('Document export test passed!');
}

/**
 * Test analytics export
 */
async function testAnalyticsExport() {
  console.log('\n=== Testing Analytics Export ===');
  
  const response = await makeRequest('POST', '/api/exports/analytics', {
    metrics: ['portfolio-value', 'asset-allocation', 'performance', 'risk-metrics'],
    timeRange: {
      start: '2023-01-01',
      end: '2023-12-31'
    },
    format: 'json',
    options: {
      includeCharts: true,
      includeRawData: true
    }
  });
  
  if (!response.success || !response.export || !response.export.downloadUrl) {
    throw new Error('Failed to export analytics');
  }
  
  console.log('Analytics export test passed!');
}

/**
 * Test portfolio export
 */
async function testPortfolioExport() {
  console.log('\n=== Testing Portfolio Export ===');
  
  const response = await makeRequest('POST', '/api/exports/portfolio/test-portfolio', {
    sections: ['summary', 'holdings', 'performance', 'allocation'],
    format: 'excel',
    options: {
      includeCharts: true,
      includeBenchmarks: true
    }
  });
  
  if (!response.success || !response.export || !response.export.downloadUrl) {
    throw new Error('Failed to export portfolio');
  }
  
  console.log('Portfolio export test passed!');
}

/**
 * Test portfolio comparison export
 */
async function testPortfolioComparisonExport() {
  console.log('\n=== Testing Portfolio Comparison Export ===');
  
  const response = await makeRequest('POST', '/api/exports/portfolio-comparison', {
    portfolioIds: ['portfolio-1', 'portfolio-2', 'portfolio-3'],
    sections: ['summary', 'performance'],
    format: 'pdf',
    options: {
      includeCharts: true,
      includeBenchmarks: true
    }
  });
  
  if (!response.success || !response.export || !response.export.downloadUrl) {
    throw new Error('Failed to export portfolio comparison');
  }
  
  console.log('Portfolio comparison export test passed!');
}

/**
 * Test export scheduling
 */
async function testExportScheduling() {
  console.log('\n=== Testing Export Scheduling ===');
  
  // Schedule export
  const scheduleResponse = await makeRequest('POST', '/api/exports/schedule', {
    type: 'document',
    id: 'test-doc',
    format: 'pdf',
    schedule: 'weekly',
    options: {
      includeMetadata: true,
      includeTables: true,
      includeSecurities: true
    }
  });
  
  if (!scheduleResponse.success || !scheduleResponse.export || !scheduleResponse.export.scheduleId) {
    throw new Error('Failed to schedule export');
  }
  
  // Get scheduled exports
  const schedulesResponse = await makeRequest('GET', '/api/exports/schedules');
  
  if (!schedulesResponse.success || !schedulesResponse.schedules) {
    throw new Error('Failed to get scheduled exports');
  }
  
  // Execute scheduled exports
  const executeResponse = await makeRequest('POST', '/api/exports/execute-schedules');
  
  if (!executeResponse.success) {
    throw new Error('Failed to execute scheduled exports');
  }
  
  console.log('Export scheduling test passed!');
}

/**
 * Test getting export history
 */
async function testGetExportHistory() {
  console.log('\n=== Testing Get Export History ===');
  
  const response = await makeRequest('GET', '/api/exports/history');
  
  if (!response.success || !response.history) {
    throw new Error('Failed to get export history');
  }
  
  console.log('Get export history test passed!');
}

/**
 * Test cleanup of expired exports
 */
async function testCleanup() {
  console.log('\n=== Testing Export Cleanup ===');
  
  const response = await makeRequest('POST', '/api/exports/cleanup');
  
  if (!response.success) {
    throw new Error('Failed to clean up expired exports');
  }
  
  console.log('Export cleanup test passed!');
}