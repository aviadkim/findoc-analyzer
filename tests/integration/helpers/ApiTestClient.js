const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

/**
 * Helper class for API integration testing
 */
class ApiTestClient {
  /**
   * Create a new API test client
   * @param {Object} options - Configuration options
   * @param {string} options.baseUrl - Base API URL
   * @param {string} options.authToken - Authentication token
   * @param {number} options.timeout - Request timeout in ms
   */
  constructor(options = {}) {
    this.baseUrl = options.baseUrl || process.env.API_BASE_URL || 'http://localhost:3000/api';
    this.authToken = options.authToken || null;
    this.timeout = options.timeout || 30000;
  }

  /**
   * Set auth token for API requests
   * @param {string} token - Auth token
   */
  setAuthToken(token) {
    this.authToken = token;
  }

  /**
   * Get default headers with authorization if token is available
   * @returns {Object} Headers object
   */
  getHeaders() {
    const headers = {
      'Content-Type': 'application/json'
    };

    if (this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`;
    }

    return headers;
  }

  /**
   * Login to the API and store the auth token
   * @param {string} username - Username
   * @param {string} password - Password
   * @returns {Promise<Object>} Login response
   */
  async login(username, password) {
    const response = await axios.post(
      `${this.baseUrl}/auth/login`,
      { username, password },
      { 
        headers: this.getHeaders(),
        timeout: this.timeout
      }
    );

    if (response.status === 200 && response.data.token) {
      this.setAuthToken(response.data.token);
    }

    return response.data;
  }

  /**
   * Upload a document
   * @param {string} filePath - Path to file to upload
   * @returns {Promise<Object>} Upload response
   */
  async uploadDocument(filePath) {
    const formData = new FormData();
    formData.append('file', fs.createReadStream(filePath));

    const response = await axios.post(
      `${this.baseUrl}/documents/upload`,
      formData,
      {
        headers: {
          ...formData.getHeaders(),
          ...(this.authToken ? { 'Authorization': `Bearer ${this.authToken}` } : {})
        },
        timeout: this.timeout
      }
    );

    return response.data;
  }

  /**
   * Process a document
   * @param {string} documentId - Document ID
   * @returns {Promise<Object>} Process response
   */
  async processDocument(documentId) {
    const response = await axios.post(
      `${this.baseUrl}/documents/process`,
      { documentId },
      {
        headers: this.getHeaders(),
        timeout: this.timeout
      }
    );

    return response.data;
  }

  /**
   * Wait for document processing to complete
   * @param {string} processingId - Processing ID
   * @param {Object} options - Options
   * @param {number} options.maxRetries - Max polling retries
   * @param {number} options.retryInterval - Interval between retries in ms
   * @returns {Promise<Object>} Processing result
   */
  async waitForProcessing(processingId, options = {}) {
    const maxRetries = options.maxRetries || 30;
    const retryInterval = options.retryInterval || 2000;

    for (let i = 0; i < maxRetries; i++) {
      const response = await axios.get(
        `${this.baseUrl}/documents/process/status?id=${processingId}`,
        {
          headers: this.getHeaders(),
          timeout: this.timeout
        }
      );

      if (response.data.status === 'completed') {
        return response.data;
      } else if (response.data.status === 'failed') {
        throw new Error(`Processing failed: ${response.data.error}`);
      }

      await new Promise(resolve => setTimeout(resolve, retryInterval));
    }

    throw new Error('Processing timeout exceeded');
  }

  /**
   * Get document securities
   * @param {string} documentId - Document ID
   * @returns {Promise<Object>} Securities data
   */
  async getSecurities(documentId) {
    const response = await axios.get(
      `${this.baseUrl}/documents/${documentId}/securities`,
      {
        headers: this.getHeaders(),
        timeout: this.timeout
      }
    );

    return response.data;
  }

  /**
   * Export document data
   * @param {string} documentId - Document ID
   * @param {string} format - Export format (json, csv, xlsx)
   * @returns {Promise<Buffer>} Exported data
   */
  async exportDocument(documentId, format = 'json') {
    const response = await axios.get(
      `${this.baseUrl}/documents/${documentId}/export?format=${format}`,
      {
        headers: this.getHeaders(),
        responseType: 'arraybuffer',
        timeout: this.timeout
      }
    );

    return response.data;
  }

  /**
   * Query document with a question
   * @param {string} documentId - Document ID
   * @param {string} question - Question to ask
   * @returns {Promise<Object>} Query response
   */
  async queryDocument(documentId, question) {
    const response = await axios.post(
      `${this.baseUrl}/documents/${documentId}/query`,
      { question },
      {
        headers: this.getHeaders(),
        timeout: this.timeout
      }
    );

    return response.data;
  }

  /**
   * Analyze document portfolio
   * @param {string} documentId - Document ID
   * @returns {Promise<Object>} Analysis results
   */
  async analyzeDocument(documentId) {
    const response = await axios.post(
      `${this.baseUrl}/documents/${documentId}/analyze`,
      {},
      {
        headers: this.getHeaders(),
        timeout: this.timeout
      }
    );

    return response.data;
  }

  /**
   * Compare documents
   * @param {string[]} documentIds - Array of document IDs to compare
   * @param {Object} options - Comparison options
   * @returns {Promise<Object>} Comparison results
   */
  async compareDocuments(documentIds, options = {}) {
    const response = await axios.post(
      `${this.baseUrl}/comparison/compare`,
      { 
        documentIds,
        options
      },
      {
        headers: this.getHeaders(),
        timeout: this.timeout
      }
    );

    return response.data;
  }

  /**
   * Delete a document
   * @param {string} documentId - Document ID
   * @returns {Promise<Object>} Delete response
   */
  async deleteDocument(documentId) {
    const response = await axios.delete(
      `${this.baseUrl}/documents/${documentId}`,
      {
        headers: this.getHeaders(),
        timeout: this.timeout
      }
    );

    return response.data;
  }

  /**
   * Extract specific data from a document
   * @param {string} filePath - Path to file to process
   * @param {Object} options - Extraction options
   * @param {string} options.extractionType - Type of extraction (text, tables, securities)
   * @param {boolean} options.useOcr - Whether to use OCR
   * @returns {Promise<Object>} Extraction results
   */
  async extractFromDocument(filePath, options = {}) {
    const formData = new FormData();
    formData.append('file', fs.createReadStream(filePath));
    
    if (options.extractionType) {
      formData.append('extractionType', options.extractionType);
    }
    
    if (options.useOcr) {
      formData.append('useOcr', String(options.useOcr));
    }

    const response = await axios.post(
      `${this.baseUrl}/processor/extract`,
      formData,
      {
        headers: {
          ...formData.getHeaders(),
          ...(this.authToken ? { 'Authorization': `Bearer ${this.authToken}` } : {})
        },
        timeout: this.timeout
      }
    );

    return response.data;
  }
}

module.exports = ApiTestClient;