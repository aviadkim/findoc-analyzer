/**
 * Frontend integration for Google Agent Technologies with FinDoc Analyzer.
 * 
 * This module provides integration between the Google Agent Technologies
 * and the existing FinDoc Analyzer frontend.
 */

// API endpoints for Google Agent integration
const AGENT_API = {
  UPLOAD: '/api/document/upload',
  STATUS: '/api/document/status',
  QUERY: '/api/document/query',
  SUMMARY: '/api/document/summary',
  SECURITIES: '/api/document/securities',
  EXPORT: '/api/document/export',
  DOWNLOAD: '/api/document/download'
};

/**
 * FinDocRAG integration class
 */
class FinDocRAGIntegration {
  /**
   * Initialize the integration
   * @param {Object} config - Configuration options
   */
  constructor(config = {}) {
    this.apiBaseUrl = config.apiBaseUrl || '';
    this.onStatusChange = config.onStatusChange || (() => {});
    this.onError = config.onError || console.error;
    this.activeDocumentId = null;
    this.processingStatus = {};
  }

  /**
   * Upload a document for processing
   * @param {File} file - The document file to upload
   * @returns {Promise<Object>} - Upload response
   */
  async uploadDocument(file) {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${this.apiBaseUrl}${AGENT_API.UPLOAD}`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const result = await response.json();
      this.activeDocumentId = result.document_id;
      this.processingStatus[result.document_id] = 'processing';
      this.onStatusChange(result.document_id, 'processing');

      // Start polling for status
      this._pollDocumentStatus(result.document_id);

      return result;
    } catch (error) {
      this.onError('Upload error', error);
      throw error;
    }
  }

  /**
   * Query a document with natural language
   * @param {string} query - The natural language query
   * @param {string} documentId - Optional document ID (uses active document if not provided)
   * @returns {Promise<Object>} - Query response
   */
  async queryDocument(query, documentId = null) {
    try {
      const docId = documentId || this.activeDocumentId;
      
      if (!docId) {
        throw new Error('No document selected for querying');
      }

      const response = await fetch(`${this.apiBaseUrl}${AGENT_API.QUERY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          document_id: docId,
          query: query
        })
      });

      if (!response.ok) {
        throw new Error(`Query failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      this.onError('Query error', error);
      throw error;
    }
  }

  /**
   * Get document summary
   * @param {string} documentId - Optional document ID (uses active document if not provided)
   * @returns {Promise<Object>} - Document summary
   */
  async getDocumentSummary(documentId = null) {
    try {
      const docId = documentId || this.activeDocumentId;
      
      if (!docId) {
        throw new Error('No document selected for summary');
      }

      const response = await fetch(`${this.apiBaseUrl}${AGENT_API.SUMMARY}/${docId}`);

      if (!response.ok) {
        throw new Error(`Summary request failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      this.onError('Summary error', error);
      throw error;
    }
  }

  /**
   * Get document securities
   * @param {string} documentId - Optional document ID (uses active document if not provided)
   * @returns {Promise<Array>} - Document securities
   */
  async getDocumentSecurities(documentId = null) {
    try {
      const docId = documentId || this.activeDocumentId;
      
      if (!docId) {
        throw new Error('No document selected for securities');
      }

      const response = await fetch(`${this.apiBaseUrl}${AGENT_API.SECURITIES}/${docId}`);

      if (!response.ok) {
        throw new Error(`Securities request failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      this.onError('Securities error', error);
      throw error;
    }
  }

  /**
   * Export document data to CSV
   * @param {string} documentId - Optional document ID (uses active document if not provided)
   * @returns {Promise<Object>} - Export response with download URL
   */
  async exportDocument(documentId = null) {
    try {
      const docId = documentId || this.activeDocumentId;
      
      if (!docId) {
        throw new Error('No document selected for export');
      }

      const response = await fetch(`${this.apiBaseUrl}${AGENT_API.EXPORT}/${docId}`);

      if (!response.ok) {
        throw new Error(`Export request failed: ${response.statusText}`);
      }

      const result = await response.json();
      
      // Return the full download URL
      result.fullDownloadUrl = `${this.apiBaseUrl}${result.download_url}`;
      
      return result;
    } catch (error) {
      this.onError('Export error', error);
      throw error;
    }
  }

  /**
   * Poll for document processing status
   * @param {string} documentId - Document ID to poll
   * @private
   */
  async _pollDocumentStatus(documentId) {
    try {
      const response = await fetch(`${this.apiBaseUrl}${AGENT_API.STATUS}/${documentId}`);
      
      if (!response.ok) {
        throw new Error(`Status check failed: ${response.statusText}`);
      }
      
      const result = await response.json();
      const newStatus = result.status;
      
      // Update status if changed
      if (this.processingStatus[documentId] !== newStatus) {
        this.processingStatus[documentId] = newStatus;
        this.onStatusChange(documentId, newStatus);
      }
      
      // Continue polling if still processing
      if (newStatus === 'processing') {
        setTimeout(() => this._pollDocumentStatus(documentId), 2000);
      }
    } catch (error) {
      this.onError('Status polling error', error);
      // Continue polling even on error
      setTimeout(() => this._pollDocumentStatus(documentId), 5000);
    }
  }
}

// Export the integration class
window.FinDocRAGIntegration = FinDocRAGIntegration;
