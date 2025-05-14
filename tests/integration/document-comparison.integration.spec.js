const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const FormData = require('form-data');

/**
 * Integration tests for document comparison functionality
 * 
 * These tests verify the API interactions for comparing multiple documents,
 * focusing on portfolio comparison features.
 */
test.describe('Document Comparison Integration Tests', () => {
  const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000/api';
  let authToken;
  const testDocumentIds = [];

  // Setup: authenticate and upload test documents
  test.beforeAll(async () => {
    try {
      // Authenticate with test account
      const authResponse = await axios.post(`${API_BASE_URL}/auth/test-login`, {
        username: 'testuser',
        password: 'testpassword'
      });
      
      authToken = authResponse.data.token;
      
      // Upload test documents
      const testFileNames = ['sample_portfolio.pdf', 'messos.pdf'];
      
      for (const fileName of testFileNames) {
        const testFilePath = path.resolve(__dirname, `../../test-data/${fileName}`);
        const formData = new FormData();
        
        formData.append('file', fs.createReadStream(testFilePath));
        
        const response = await axios.post(
          `${API_BASE_URL}/documents/upload`,
          formData,
          {
            headers: {
              ...formData.getHeaders(),
              'Authorization': `Bearer ${authToken}`
            }
          }
        );
        
        if (response.status === 200 && response.data.success) {
          testDocumentIds.push(response.data.documentId);
          
          // Process the document
          await axios.post(
            `${API_BASE_URL}/documents/process`,
            { documentId: response.data.documentId },
            {
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
              }
            }
          );
          
          // Wait for processing to complete
          let processingComplete = false;
          for (let i = 0; i < 30; i++) {
            const statusResponse = await axios.get(
              `${API_BASE_URL}/documents/${response.data.documentId}`,
              {
                headers: {
                  'Authorization': `Bearer ${authToken}`
                }
              }
            );
            
            if (statusResponse.data.processingStatus === 'completed') {
              processingComplete = true;
              break;
            }
            
            await new Promise(resolve => setTimeout(resolve, 2000));
          }
          
          if (!processingComplete) {
            throw new Error(`Processing timeout for document: ${fileName}`);
          }
        }
      }
      
      console.log(`Successfully uploaded ${testDocumentIds.length} test documents`);
    } catch (error) {
      console.error('Test setup failed:', error.message);
      throw error;
    }
  });

  test('should compare two documents', async () => {
    // Skip if we don't have at least two documents
    if (testDocumentIds.length < 2) {
      test.skip();
      return;
    }
    
    const [firstDocId, secondDocId] = testDocumentIds;
    
    const response = await axios.post(
      `${API_BASE_URL}/comparison/compare`,
      { 
        documentIds: [firstDocId, secondDocId],
        options: { includeDetails: true }
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        }
      }
    );
    
    expect(response.status).toBe(200);
    expect(response.data).toHaveProperty('comparisonId');
    expect(response.data).toHaveProperty('results');
    
    const results = response.data.results;
    
    // Verify comparison results structure
    expect(results).toHaveProperty('summary');
    expect(results).toHaveProperty('differences');
    expect(results).toHaveProperty('assetAllocationComparison');
    
    // Verify each document is represented in the results
    expect(results.differences).toHaveProperty(firstDocId);
    expect(results.differences).toHaveProperty(secondDocId);
    
    console.log('Successfully compared two documents');
  });

  test('should detect securities differences between documents', async () => {
    // Skip if we don't have at least two documents
    if (testDocumentIds.length < 2) {
      test.skip();
      return;
    }
    
    const [firstDocId, secondDocId] = testDocumentIds;
    
    const response = await axios.post(
      `${API_BASE_URL}/comparison/securities-diff`,
      { 
        documentIds: [firstDocId, secondDocId]
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        }
      }
    );
    
    expect(response.status).toBe(200);
    expect(response.data).toHaveProperty('securitiesDiff');
    
    const diff = response.data.securitiesDiff;
    
    // Verify diff structure
    expect(diff).toHaveProperty('added');
    expect(diff).toHaveProperty('removed');
    expect(diff).toHaveProperty('changed');
    expect(diff).toHaveProperty('unchanged');
    
    // Verify these are arrays
    expect(Array.isArray(diff.added)).toBe(true);
    expect(Array.isArray(diff.removed)).toBe(true);
    expect(Array.isArray(diff.changed)).toBe(true);
    expect(Array.isArray(diff.unchanged)).toBe(true);
    
    console.log('Successfully detected securities differences between documents');
  });

  test('should generate portfolio comparison chart data', async () => {
    // Skip if we don't have at least two documents
    if (testDocumentIds.length < 2) {
      test.skip();
      return;
    }
    
    const [firstDocId, secondDocId] = testDocumentIds;
    
    const response = await axios.post(
      `${API_BASE_URL}/comparison/chart-data`,
      { 
        documentIds: [firstDocId, secondDocId],
        chartType: 'assetAllocation'
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        }
      }
    );
    
    expect(response.status).toBe(200);
    expect(response.data).toHaveProperty('chartData');
    
    const chartData = response.data.chartData;
    
    // Verify chart data structure for asset allocation
    expect(chartData).toHaveProperty('labels');
    expect(chartData).toHaveProperty('datasets');
    expect(Array.isArray(chartData.labels)).toBe(true);
    expect(Array.isArray(chartData.datasets)).toBe(true);
    expect(chartData.datasets.length).toBe(2); // One for each document
    
    // Each dataset should have a name and data array
    expect(chartData.datasets[0]).toHaveProperty('name');
    expect(chartData.datasets[0]).toHaveProperty('data');
    expect(Array.isArray(chartData.datasets[0].data)).toBe(true);
    
    console.log('Successfully generated portfolio comparison chart data');
  });

  test('should calculate performance metrics comparison', async () => {
    // Skip if we don't have at least two documents
    if (testDocumentIds.length < 2) {
      test.skip();
      return;
    }
    
    const [firstDocId, secondDocId] = testDocumentIds;
    
    const response = await axios.post(
      `${API_BASE_URL}/comparison/performance-metrics`,
      { 
        documentIds: [firstDocId, secondDocId]
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        }
      }
    );
    
    expect(response.status).toBe(200);
    expect(response.data).toHaveProperty('metrics');
    
    const metrics = response.data.metrics;
    
    // Verify metrics for each document
    for (const docId of [firstDocId, secondDocId]) {
      expect(metrics).toHaveProperty(docId);
      expect(metrics[docId]).toHaveProperty('totalValue');
      expect(metrics[docId]).toHaveProperty('riskScore');
      expect(metrics[docId]).toHaveProperty('diversificationScore');
    }
    
    // Verify comparison data
    expect(response.data).toHaveProperty('comparison');
    expect(response.data.comparison).toHaveProperty('valueDiff');
    expect(response.data.comparison).toHaveProperty('riskScoreDiff');
    expect(response.data.comparison).toHaveProperty('diversificationScoreDiff');
    
    console.log('Successfully calculated performance metrics comparison');
  });

  test('should export comparison report', async () => {
    // Skip if we don't have at least two documents
    if (testDocumentIds.length < 2) {
      test.skip();
      return;
    }
    
    const [firstDocId, secondDocId] = testDocumentIds;
    
    const response = await axios.post(
      `${API_BASE_URL}/comparison/export`,
      { 
        documentIds: [firstDocId, secondDocId],
        format: 'pdf'
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}` 
        },
        responseType: 'arraybuffer'
      }
    );
    
    expect(response.status).toBe(200);
    
    // Verify content type for PDF
    const contentType = response.headers['content-type'];
    expect(contentType).toContain('application/pdf');
    
    // Verify file size is reasonable (not empty)
    expect(response.data.byteLength).toBeGreaterThan(1000);
    
    console.log('Successfully exported comparison report as PDF');
  });

  // Cleanup: Delete test documents after tests
  test.afterAll(async () => {
    if (authToken && testDocumentIds.length > 0) {
      try {
        for (const docId of testDocumentIds) {
          await axios.delete(
            `${API_BASE_URL}/documents/${docId}`,
            {
              headers: {
                'Authorization': `Bearer ${authToken}`
              }
            }
          );
        }
        console.log(`Cleaned up ${testDocumentIds.length} test documents`);
      } catch (error) {
        console.error('Failed to delete test documents:', error.message);
      }
    }
  });
});