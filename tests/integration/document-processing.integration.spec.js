const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const FormData = require('form-data');

/**
 * Integration tests for document processing workflow
 * 
 * These tests verify the end-to-end functionality of document processing,
 * focusing on the backend API interactions and data transformations.
 */
test.describe('Document Processing Integration Tests', () => {
  const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000/api';
  let authToken;
  let testDocumentId;

  // Setup: authenticate and get token before tests
  test.beforeAll(async () => {
    try {
      // For testing purposes, we use a test account or create a new one
      const response = await axios.post(`${API_BASE_URL}/auth/test-login`, {
        username: 'testuser',
        password: 'testpassword'
      });
      
      authToken = response.data.token;
      console.log('Successfully authenticated for integration tests');
    } catch (error) {
      console.error('Authentication failed:', error.message);
      throw error;
    }
  });

  test('should upload PDF document successfully', async () => {
    const testFilePath = path.resolve(__dirname, '../../test-data/sample_portfolio.pdf');
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
    
    expect(response.status).toBe(200);
    expect(response.data.success).toBe(true);
    expect(response.data.documentId).toBeDefined();
    
    // Save document ID for subsequent tests
    testDocumentId = response.data.documentId;
    console.log(`Uploaded document with ID: ${testDocumentId}`);
  });

  test('should process uploaded document', async () => {
    // Skip if no document was uploaded
    if (!testDocumentId) {
      test.skip();
      return;
    }
    
    const response = await axios.post(
      `${API_BASE_URL}/documents/process`,
      { documentId: testDocumentId },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        }
      }
    );
    
    expect(response.status).toBe(200);
    expect(response.data.success).toBe(true);
    expect(response.data.processingId).toBeDefined();
    
    const processingId = response.data.processingId;
    console.log(`Started processing with ID: ${processingId}`);
    
    // Poll for processing completion (with timeout)
    const maxRetries = 30;
    const retryIntervalMs = 2000;
    let processingComplete = false;
    
    for (let i = 0; i < maxRetries; i++) {
      const statusResponse = await axios.get(
        `${API_BASE_URL}/documents/process/status?id=${processingId}`,
        {
          headers: {
            'Authorization': `Bearer ${authToken}`
          }
        }
      );
      
      if (statusResponse.data.status === 'completed') {
        processingComplete = true;
        console.log('Document processing completed successfully');
        break;
      } else if (statusResponse.data.status === 'failed') {
        throw new Error(`Processing failed: ${statusResponse.data.error}`);
      }
      
      // Wait before next polling attempt
      await new Promise(resolve => setTimeout(resolve, retryIntervalMs));
    }
    
    expect(processingComplete).toBe(true);
  });

  test('should extract securities data correctly', async () => {
    // Skip if no document was uploaded
    if (!testDocumentId) {
      test.skip();
      return;
    }
    
    const response = await axios.get(
      `${API_BASE_URL}/documents/${testDocumentId}/securities`,
      {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      }
    );
    
    expect(response.status).toBe(200);
    expect(response.data.securities).toBeDefined();
    expect(Array.isArray(response.data.securities)).toBe(true);
    
    // Verify some core fields are extracted
    const securities = response.data.securities;
    expect(securities.length).toBeGreaterThan(0);
    
    // Check first security has expected fields
    const firstSecurity = securities[0];
    expect(firstSecurity).toHaveProperty('name');
    expect(firstSecurity).toHaveProperty('quantity');
    expect(firstSecurity).toHaveProperty('value');
    
    console.log(`Extracted ${securities.length} securities from the document`);
  });

  test('should export document data in different formats', async () => {
    // Skip if no document was uploaded
    if (!testDocumentId) {
      test.skip();
      return;
    }
    
    // Test different export formats
    const formats = ['json', 'csv', 'xlsx'];
    
    for (const format of formats) {
      const response = await axios.get(
        `${API_BASE_URL}/documents/${testDocumentId}/export?format=${format}`,
        {
          headers: {
            'Authorization': `Bearer ${authToken}`
          },
          responseType: 'arraybuffer'
        }
      );
      
      expect(response.status).toBe(200);
      
      // Verify content type
      const contentType = response.headers['content-type'];
      
      switch (format) {
        case 'json':
          expect(contentType).toContain('application/json');
          break;
        case 'csv':
          expect(contentType).toContain('text/csv');
          break;
        case 'xlsx':
          expect(contentType).toContain('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
          break;
      }
      
      // Verify file size is reasonable (not empty)
      expect(response.data.byteLength).toBeGreaterThan(100);
      
      console.log(`Successfully exported document in ${format} format`);
    }
  });

  test('should retrieve document metadata', async () => {
    // Skip if no document was uploaded
    if (!testDocumentId) {
      test.skip();
      return;
    }
    
    const response = await axios.get(
      `${API_BASE_URL}/documents/${testDocumentId}/metadata`,
      {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      }
    );
    
    expect(response.status).toBe(200);
    expect(response.data).toHaveProperty('documentId', testDocumentId);
    expect(response.data).toHaveProperty('fileName');
    expect(response.data).toHaveProperty('uploadDate');
    expect(response.data).toHaveProperty('processingStatus');
    expect(response.data).toHaveProperty('pageCount');
    
    // Verify processing status
    expect(response.data.processingStatus).toBe('completed');
  });

  test('should answer questions about the document', async () => {
    // Skip if no document was uploaded
    if (!testDocumentId) {
      test.skip();
      return;
    }
    
    const question = 'What securities are in this document?';
    
    const response = await axios.post(
      `${API_BASE_URL}/documents/${testDocumentId}/query`,
      { question },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        }
      }
    );
    
    expect(response.status).toBe(200);
    expect(response.data).toHaveProperty('answer');
    expect(typeof response.data.answer).toBe('string');
    expect(response.data.answer.length).toBeGreaterThan(10);
    
    console.log(`Successfully queried document with question: "${question}"`);
  });

  test('should analyze document portfolio', async () => {
    // Skip if no document was uploaded
    if (!testDocumentId) {
      test.skip();
      return;
    }
    
    const response = await axios.post(
      `${API_BASE_URL}/documents/${testDocumentId}/analyze`,
      {},
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        }
      }
    );
    
    expect(response.status).toBe(200);
    expect(response.data).toHaveProperty('analysis');
    expect(response.data.analysis).toHaveProperty('summary');
    expect(response.data.analysis).toHaveProperty('assetAllocation');
    expect(response.data.analysis).toHaveProperty('riskMetrics');
    
    // Verify asset allocation adds up to approximately 100%
    const assetAllocation = response.data.analysis.assetAllocation;
    const totalAllocation = Object.values(assetAllocation).reduce((sum, value) => sum + value, 0);
    expect(totalAllocation).toBeCloseTo(100, 1); // Within 0.1% of 100%
    
    console.log('Successfully analyzed document portfolio');
  });

  // Cleanup: Delete test document after tests
  test.afterAll(async () => {
    if (testDocumentId && authToken) {
      try {
        await axios.delete(
          `${API_BASE_URL}/documents/${testDocumentId}`,
          {
            headers: {
              'Authorization': `Bearer ${authToken}`
            }
          }
        );
        console.log(`Cleaned up test document: ${testDocumentId}`);
      } catch (error) {
        console.error('Failed to delete test document:', error.message);
      }
    }
  });
});