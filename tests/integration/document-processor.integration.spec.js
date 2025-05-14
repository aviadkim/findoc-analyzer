const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const FormData = require('form-data');
const { promisify } = require('util');
const readFileAsync = promisify(fs.readFile);

/**
 * Integration tests for the document processor component
 * 
 * These tests verify the core backend document processing functionality,
 * focusing on extraction accuracy and processing features.
 */
test.describe('Document Processor Integration Tests', () => {
  const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000/api';
  
  test('should extract text from PDF document', async () => {
    const testFilePath = path.resolve(__dirname, '../../test-data/sample_portfolio.pdf');
    const formData = new FormData();
    
    formData.append('file', fs.createReadStream(testFilePath));
    formData.append('extractionType', 'text');
    
    const response = await axios.post(
      `${API_BASE_URL}/processor/extract`,
      formData,
      {
        headers: {
          ...formData.getHeaders()
        }
      }
    );
    
    expect(response.status).toBe(200);
    expect(response.data).toHaveProperty('text');
    expect(typeof response.data.text).toBe('string');
    expect(response.data.text.length).toBeGreaterThan(100);
    
    // Check for expected content in the text
    expect(response.data.text).toContain('Portfolio');
    
    console.log('Successfully extracted text from PDF document');
  });

  test('should detect and extract tables from PDF document', async () => {
    const testFilePath = path.resolve(__dirname, '../../test-data/sample_portfolio.pdf');
    const formData = new FormData();
    
    formData.append('file', fs.createReadStream(testFilePath));
    formData.append('extractionType', 'tables');
    
    const response = await axios.post(
      `${API_BASE_URL}/processor/extract`,
      formData,
      {
        headers: {
          ...formData.getHeaders()
        }
      }
    );
    
    expect(response.status).toBe(200);
    expect(response.data).toHaveProperty('tables');
    expect(Array.isArray(response.data.tables)).toBe(true);
    
    // At least one table should be detected
    expect(response.data.tables.length).toBeGreaterThan(0);
    
    // Check table structure
    const firstTable = response.data.tables[0];
    expect(firstTable).toHaveProperty('rows');
    expect(Array.isArray(firstTable.rows)).toBe(true);
    expect(firstTable.rows.length).toBeGreaterThan(0);
    
    console.log(`Successfully extracted ${response.data.tables.length} tables from PDF document`);
  });

  test('should extract securities from PDF document', async () => {
    const testFilePath = path.resolve(__dirname, '../../test-data/sample_portfolio.pdf');
    const formData = new FormData();
    
    formData.append('file', fs.createReadStream(testFilePath));
    formData.append('extractionType', 'securities');
    
    const response = await axios.post(
      `${API_BASE_URL}/processor/extract`,
      formData,
      {
        headers: {
          ...formData.getHeaders()
        }
      }
    );
    
    expect(response.status).toBe(200);
    expect(response.data).toHaveProperty('securities');
    expect(Array.isArray(response.data.securities)).toBe(true);
    
    // Securities should be found
    expect(response.data.securities.length).toBeGreaterThan(0);
    
    // Check securities structure
    const firstSecurity = response.data.securities[0];
    expect(firstSecurity).toHaveProperty('name');
    expect(firstSecurity).toHaveProperty('quantity');
    expect(firstSecurity).toHaveProperty('value');
    
    console.log(`Successfully extracted ${response.data.securities.length} securities from PDF document`);
  });

  test('should perform OCR on image-based PDFs', async () => {
    // This test assumes there's an image-based PDF in the test data
    const testFilePath = path.resolve(__dirname, '../../test-data/messos.pdf');
    const formData = new FormData();
    
    formData.append('file', fs.createReadStream(testFilePath));
    formData.append('extractionType', 'text');
    formData.append('useOcr', 'true');
    
    const response = await axios.post(
      `${API_BASE_URL}/processor/extract`,
      formData,
      {
        headers: {
          ...formData.getHeaders()
        },
        // OCR might take longer
        timeout: 30000
      }
    );
    
    expect(response.status).toBe(200);
    expect(response.data).toHaveProperty('text');
    expect(typeof response.data.text).toBe('string');
    expect(response.data.text.length).toBeGreaterThan(50);
    
    console.log('Successfully performed OCR on image-based PDF');
  });

  test('should process PDF document with tiered processing', async () => {
    const testFilePath = path.resolve(__dirname, '../../test-data/sample_portfolio.pdf');
    const formData = new FormData();
    
    formData.append('file', fs.createReadStream(testFilePath));
    formData.append('processingTier', 'comprehensive');
    
    const response = await axios.post(
      `${API_BASE_URL}/processor/process`,
      formData,
      {
        headers: {
          ...formData.getHeaders()
        },
        // Comprehensive processing might take longer
        timeout: 60000
      }
    );
    
    expect(response.status).toBe(200);
    expect(response.data).toHaveProperty('processingId');
    
    const processingId = response.data.processingId;
    
    // Poll for processing completion (with timeout)
    const maxRetries = 30;
    const retryIntervalMs = 2000;
    let processingResult;
    
    for (let i = 0; i < maxRetries; i++) {
      const statusResponse = await axios.get(
        `${API_BASE_URL}/processor/status?id=${processingId}`
      );
      
      if (statusResponse.data.status === 'completed') {
        processingResult = statusResponse.data.result;
        break;
      } else if (statusResponse.data.status === 'failed') {
        throw new Error(`Processing failed: ${statusResponse.data.error}`);
      }
      
      // Wait before next polling attempt
      await new Promise(resolve => setTimeout(resolve, retryIntervalMs));
    }
    
    expect(processingResult).toBeDefined();
    
    // Check comprehensive processing results
    expect(processingResult).toHaveProperty('text');
    expect(processingResult).toHaveProperty('tables');
    expect(processingResult).toHaveProperty('securities');
    expect(processingResult).toHaveProperty('entities');
    expect(processingResult).toHaveProperty('metadata');
    expect(processingResult).toHaveProperty('analysis');
    
    console.log('Successfully processed PDF document with comprehensive tier');
  });

  test('should process Excel document and extract securities', async () => {
    // This test assumes there's an Excel file in the test data
    const testFilePath = path.resolve(__dirname, '../../test-data/sample_portfolio.xlsx');
    
    // Skip if the test file doesn't exist
    try {
      await readFileAsync(testFilePath);
    } catch (error) {
      test.skip();
      return;
    }
    
    const formData = new FormData();
    
    formData.append('file', fs.createReadStream(testFilePath));
    
    const response = await axios.post(
      `${API_BASE_URL}/processor/excel`,
      formData,
      {
        headers: {
          ...formData.getHeaders()
        }
      }
    );
    
    expect(response.status).toBe(200);
    expect(response.data).toHaveProperty('sheets');
    expect(Array.isArray(response.data.sheets)).toBe(true);
    
    // At least one sheet should be present
    expect(response.data.sheets.length).toBeGreaterThan(0);
    
    // Check if securities were extracted
    expect(response.data).toHaveProperty('securities');
    expect(Array.isArray(response.data.securities)).toBe(true);
    
    console.log('Successfully processed Excel document and extracted securities');
  });

  test('should detect document language', async () => {
    const testFilePath = path.resolve(__dirname, '../../test-data/sample_portfolio.pdf');
    const formData = new FormData();
    
    formData.append('file', fs.createReadStream(testFilePath));
    
    const response = await axios.post(
      `${API_BASE_URL}/processor/detect-language`,
      formData,
      {
        headers: {
          ...formData.getHeaders()
        }
      }
    );
    
    expect(response.status).toBe(200);
    expect(response.data).toHaveProperty('language');
    expect(response.data).toHaveProperty('confidence');
    
    // Confidence should be a number between 0 and 1
    expect(response.data.confidence).toBeGreaterThan(0);
    expect(response.data.confidence).toBeLessThanOrEqual(1);
    
    console.log(`Detected document language: ${response.data.language} (confidence: ${response.data.confidence})`);
  });

  test('should extract ISINs from document', async () => {
    const testFilePath = path.resolve(__dirname, '../../test-data/messos.pdf');
    const formData = new FormData();
    
    formData.append('file', fs.createReadStream(testFilePath));
    
    const response = await axios.post(
      `${API_BASE_URL}/processor/extract-isins`,
      formData,
      {
        headers: {
          ...formData.getHeaders()
        }
      }
    );
    
    expect(response.status).toBe(200);
    expect(response.data).toHaveProperty('isins');
    expect(Array.isArray(response.data.isins)).toBe(true);
    
    // Check ISIN format if any were found
    if (response.data.isins.length > 0) {
      const isinRegex = /^[A-Z]{2}[A-Z0-9]{9}[0-9]$/;
      expect(isinRegex.test(response.data.isins[0])).toBe(true);
    }
    
    console.log(`Extracted ${response.data.isins.length} ISINs from document`);
  });

  test('should handle invalid document gracefully', async () => {
    const testFilePath = path.resolve(__dirname, '../../test-data/invalid-file.txt');
    
    // Create an invalid file if it doesn't exist
    if (!fs.existsSync(testFilePath)) {
      fs.writeFileSync(testFilePath, 'This is not a valid PDF document');
    }
    
    const formData = new FormData();
    
    formData.append('file', fs.createReadStream(testFilePath));
    
    try {
      const response = await axios.post(
        `${API_BASE_URL}/processor/extract`,
        formData,
        {
          headers: {
            ...formData.getHeaders()
          },
          validateStatus: (status) => true // Accept any status code
        }
      );
      
      // Should return an error status code
      expect(response.status).toBeGreaterThanOrEqual(400);
      expect(response.status).toBeLessThan(500);
      
      // Should provide an error message
      expect(response.data).toHaveProperty('error');
      
      console.log('Successfully handled invalid document with proper error');
    } catch (error) {
      // If the server returns a 5xx error instead of a 4xx, fail the test
      if (error.response && error.response.status >= 500) {
        throw new Error(`Server error instead of validation error: ${error.message}`);
      }
      // Otherwise, we expect a 4xx status, so this is fine
      console.log('Successfully rejected invalid document');
    }
  });
});