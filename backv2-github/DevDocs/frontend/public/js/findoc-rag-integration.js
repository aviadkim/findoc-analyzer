/**
 * FinDocRAG Integration Script
 * 
 * This script integrates the FinDocRAG component with the FinDoc Analyzer frontend.
 */

// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
  // Check if the FinDocRAG container exists
  const container = document.getElementById('findoc-rag-component');
  if (!container) {
    console.error('FinDocRAG container not found');
    return;
  }

  // Get the API base URL
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:24125';
  const finDocRagApiUrl = `${apiBaseUrl}/api/findoc-rag`;

  // Create the FinDocRAG integration class
  class FinDocRAGIntegration {
    constructor(config = {}) {
      this.apiBaseUrl = config.apiBaseUrl || finDocRagApiUrl;
      this.onStatusChange = config.onStatusChange || (() => {});
      this.onError = config.onError || console.error;
      this.activeDocumentId = null;
      this.processingStatus = {};
    }

    async uploadDocument(file) {
      try {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch(`${this.apiBaseUrl}/document/upload`, {
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

    async queryDocument(query, documentId = null) {
      try {
        const docId = documentId || this.activeDocumentId;
        
        if (!docId) {
          throw new Error('No document selected for querying');
        }

        const response = await fetch(`${this.apiBaseUrl}/document/query`, {
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

    async getDocumentSummary(documentId = null) {
      try {
        const docId = documentId || this.activeDocumentId;
        
        if (!docId) {
          throw new Error('No document selected for summary');
        }

        const response = await fetch(`${this.apiBaseUrl}/document/summary/${docId}`);

        if (!response.ok) {
          throw new Error(`Summary request failed: ${response.statusText}`);
        }

        return await response.json();
      } catch (error) {
        this.onError('Summary error', error);
        throw error;
      }
    }

    async getDocumentSecurities(documentId = null) {
      try {
        const docId = documentId || this.activeDocumentId;
        
        if (!docId) {
          throw new Error('No document selected for securities');
        }

        const response = await fetch(`${this.apiBaseUrl}/document/securities/${docId}`);

        if (!response.ok) {
          throw new Error(`Securities request failed: ${response.statusText}`);
        }

        return await response.json();
      } catch (error) {
        this.onError('Securities error', error);
        throw error;
      }
    }

    async exportDocument(documentId = null) {
      try {
        const docId = documentId || this.activeDocumentId;
        
        if (!docId) {
          throw new Error('No document selected for export');
        }

        const response = await fetch(`${this.apiBaseUrl}/document/export/${docId}`);

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

    async _pollDocumentStatus(documentId) {
      try {
        const response = await fetch(`${this.apiBaseUrl}/document/status/${documentId}`);
        
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

  // Make the integration class available globally
  window.FinDocRAGIntegration = FinDocRAGIntegration;

  // Create the FinDocRAG component
  const createFinDocRAGComponent = () => {
    // Check if React and ReactDOM are available
    if (!window.React || !window.ReactDOM) {
      console.error('React or ReactDOM not found');
      return;
    }

    // Import the necessary components
    const { useState, useEffect, useRef } = React;
    
    // Create the FinDocRAG component
    const FinDocRAGComponent = () => {
      // State
      const [activeDocumentId, setActiveDocumentId] = useState(null);
      const [documentStatus, setDocumentStatus] = useState({});
      const [isUploading, setIsUploading] = useState(false);
      const [uploadError, setUploadError] = useState(null);
      const [documentSummary, setDocumentSummary] = useState(null);
      const [securities, setSecurities] = useState([]);
      const [query, setQuery] = useState('');
      const [queryResult, setQueryResult] = useState(null);
      const [isQuerying, setIsQuerying] = useState(false);
      const [queryError, setQueryError] = useState(null);
      
      // Refs
      const fileInputRef = useRef(null);
      const integrationRef = useRef(null);
      
      // Initialize integration
      useEffect(() => {
        // Create integration instance
        integrationRef.current = new window.FinDocRAGIntegration({
          apiBaseUrl: finDocRagApiUrl,
          onStatusChange: handleStatusChange,
          onError: handleError
        });
        
        return () => {
          // Cleanup if needed
        };
      }, []);
      
      // Handle document status change
      const handleStatusChange = (documentId, status) => {
        setDocumentStatus(prev => ({
          ...prev,
          [documentId]: status
        }));
        
        // If document is completed, fetch summary and securities
        if (status === 'completed') {
          fetchDocumentSummary(documentId);
          fetchSecurities(documentId);
        }
      };
      
      // Handle errors
      const handleError = (source, error) => {
        console.error(`[${source}]`, error);
        
        if (source === 'Upload error') {
          setUploadError(error.message);
          setIsUploading(false);
        } else if (source === 'Query error') {
          setQueryError(error.message);
          setIsQuerying(false);
        }
      };
      
      // Handle file upload
      const handleFileUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;
        
        setIsUploading(true);
        setUploadError(null);
        
        try {
          const result = await integrationRef.current.uploadDocument(file);
          setActiveDocumentId(result.document_id);
        } catch (error) {
          setUploadError(error.message);
        } finally {
          setIsUploading(false);
          // Reset file input
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
        }
      };
      
      // Handle query submission
      const handleQuerySubmit = async (event) => {
        event.preventDefault();
        
        if (!query.trim() || !activeDocumentId) return;
        
        setIsQuerying(true);
        setQueryError(null);
        
        try {
          const result = await integrationRef.current.queryDocument(query);
          setQueryResult(result);
        } catch (error) {
          setQueryError(error.message);
        } finally {
          setIsQuerying(false);
        }
      };
      
      // Fetch document summary
      const fetchDocumentSummary = async (documentId) => {
        try {
          const summary = await integrationRef.current.getDocumentSummary(documentId);
          setDocumentSummary(summary);
        } catch (error) {
          console.error('Error fetching document summary:', error);
        }
      };
      
      // Fetch securities
      const fetchSecurities = async (documentId) => {
        try {
          const securities = await integrationRef.current.getDocumentSecurities(documentId);
          setSecurities(securities);
        } catch (error) {
          console.error('Error fetching securities:', error);
        }
      };
      
      // Export to CSV
      const handleExport = async () => {
        try {
          const result = await integrationRef.current.exportDocument();
          // Open download in new tab
          window.open(result.fullDownloadUrl, '_blank');
        } catch (error) {
          console.error('Error exporting document:', error);
        }
      };

      return (
        <div className="findoc-rag-component">
          <div className="upload-section">
            <h2>Upload Financial Document</h2>
            <div className="upload-container">
              <input
                type="file"
                accept=".pdf,.xlsx,.xls,.csv"
                style={{ display: 'none' }}
                onChange={handleFileUpload}
                ref={fileInputRef}
              />
              <button
                className="upload-button"
                onClick={() => fileInputRef.current.click()}
                disabled={isUploading}
              >
                {isUploading ? 'Uploading...' : 'Upload Document'}
              </button>
              {uploadError && <p className="error-message">{uploadError}</p>}
            </div>
            
            {activeDocumentId && (
              <div className="document-status">
                <p>Document ID: {activeDocumentId}</p>
                <p>Status: {documentStatus[activeDocumentId] || 'unknown'}</p>
                {documentStatus[activeDocumentId] === 'completed' && (
                  <button className="export-button" onClick={handleExport}>
                    Export to CSV
                  </button>
                )}
              </div>
            )}
          </div>
          
          {documentSummary && (
            <div className="summary-section">
              <h2>Document Summary</h2>
              <div className="summary-container">
                <div className="summary-item">
                  <span className="summary-label">Total Value:</span>
                  <span className="summary-value">{documentSummary.total_value} {documentSummary.currency}</span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">Securities:</span>
                  <span className="summary-value">{documentSummary.security_count}</span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">Risk Profile:</span>
                  <span className="summary-value">{documentSummary.risk_profile}</span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">Diversification Score:</span>
                  <span className="summary-value">{documentSummary.diversification_score.toFixed(2)}/100</span>
                </div>
              </div>
              
              <h3>Asset Allocation</h3>
              <div className="asset-allocation">
                {Object.entries(documentSummary.asset_allocation).map(([asset, percentage]) => (
                  <div key={asset} className="asset-item">
                    <span className="asset-name">{asset}:</span>
                    <span className="asset-percentage">{percentage}%</span>
                  </div>
                ))}
              </div>
              
              {documentSummary.recommendations && documentSummary.recommendations.length > 0 && (
                <>
                  <h3>Recommendations</h3>
                  <ul className="recommendations-list">
                    {documentSummary.recommendations.map((recommendation, index) => (
                      <li key={index} className="recommendation-item">{recommendation}</li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          )}
          
          {securities && securities.length > 0 && (
            <div className="securities-section">
              <h2>Securities</h2>
              <div className="securities-table-container">
                <table className="securities-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>ISIN</th>
                      <th>Type</th>
                      <th>Asset Class</th>
                      <th>Quantity</th>
                      <th>Value</th>
                      <th>Risk</th>
                    </tr>
                  </thead>
                  <tbody>
                    {securities.map((security) => (
                      <tr key={security.identifier}>
                        <td>{security.name}</td>
                        <td>{security.identifier}</td>
                        <td>{security.security_type}</td>
                        <td>{security.asset_class}</td>
                        <td className="text-right">{security.quantity}</td>
                        <td className="text-right">{security.value}</td>
                        <td>
                          <span className={`risk-badge risk-${security.risk_level.toLowerCase()}`}>
                            {security.risk_level}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          
          {documentStatus[activeDocumentId] === 'completed' && (
            <div className="query-section">
              <h2>Ask Questions About Your Document</h2>
              <form onSubmit={handleQuerySubmit} className="query-form">
                <div className="query-input-container">
                  <input
                    type="text"
                    className="query-input"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="E.g., What is the total portfolio value? What securities have high risk?"
                    disabled={isQuerying}
                  />
                  <button
                    type="submit"
                    className="query-button"
                    disabled={isQuerying || !query.trim()}
                  >
                    {isQuerying ? 'Querying...' : 'Ask'}
                  </button>
                </div>
                {queryError && <p className="error-message">{queryError}</p>}
              </form>
              
              {queryResult && (
                <div className="query-result">
                  <h3>Query: {queryResult.query}</h3>
                  <p className="query-answer">{queryResult.answer}</p>
                </div>
              )}
            </div>
          )}
          
          <style jsx>{`
            .findoc-rag-component {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              color: #333;
            }
            
            h2 {
              font-size: 1.5rem;
              margin-bottom: 1rem;
              color: #2c3e50;
            }
            
            h3 {
              font-size: 1.2rem;
              margin-top: 1.5rem;
              margin-bottom: 0.5rem;
              color: #34495e;
            }
            
            .upload-section,
            .summary-section,
            .securities-section,
            .query-section {
              margin-bottom: 2rem;
              padding: 1.5rem;
              background-color: #f8f9fa;
              border-radius: 8px;
              box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
            }
            
            .upload-container {
              display: flex;
              align-items: center;
              gap: 1rem;
            }
            
            .upload-button,
            .export-button,
            .query-button {
              background-color: #3498db;
              color: white;
              border: none;
              padding: 0.5rem 1rem;
              border-radius: 4px;
              cursor: pointer;
              font-size: 0.9rem;
              transition: background-color 0.2s;
            }
            
            .upload-button:hover,
            .export-button:hover,
            .query-button:hover {
              background-color: #2980b9;
            }
            
            .upload-button:disabled,
            .export-button:disabled,
            .query-button:disabled {
              background-color: #95a5a6;
              cursor: not-allowed;
            }
            
            .error-message {
              color: #e74c3c;
              font-size: 0.9rem;
              margin-top: 0.5rem;
            }
            
            .document-status {
              margin-top: 1rem;
              padding: 1rem;
              background-color: #ecf0f1;
              border-radius: 4px;
            }
            
            .summary-container {
              display: grid;
              grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
              gap: 1rem;
            }
            
            .summary-item {
              display: flex;
              flex-direction: column;
              padding: 1rem;
              background-color: white;
              border-radius: 4px;
              box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            }
            
            .summary-label {
              font-size: 0.8rem;
              color: #7f8c8d;
              margin-bottom: 0.25rem;
            }
            
            .summary-value {
              font-size: 1.1rem;
              font-weight: 600;
            }
            
            .asset-allocation {
              display: grid;
              grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
              gap: 0.5rem;
              margin-top: 0.5rem;
            }
            
            .asset-item {
              display: flex;
              justify-content: space-between;
              padding: 0.5rem;
              background-color: white;
              border-radius: 4px;
              box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
            }
            
            .recommendations-list {
              margin-top: 0.5rem;
              padding-left: 1.5rem;
            }
            
            .recommendation-item {
              margin-bottom: 0.5rem;
            }
            
            .securities-table-container {
              overflow-x: auto;
              margin-top: 1rem;
            }
            
            .securities-table {
              width: 100%;
              border-collapse: collapse;
              font-size: 0.9rem;
            }
            
            .securities-table th,
            .securities-table td {
              padding: 0.75rem;
              text-align: left;
              border-bottom: 1px solid #e1e5eb;
            }
            
            .securities-table th {
              background-color: #f1f5f9;
              font-weight: 600;
            }
            
            .text-right {
              text-align: right;
            }
            
            .risk-badge {
              display: inline-block;
              padding: 0.25rem 0.5rem;
              border-radius: 4px;
              font-size: 0.8rem;
              font-weight: 600;
            }
            
            .risk-high {
              background-color: #ffebee;
              color: #e53935;
            }
            
            .risk-medium {
              background-color: #fff8e1;
              color: #ffa000;
            }
            
            .risk-low {
              background-color: #e8f5e9;
              color: #43a047;
            }
            
            .query-form {
              margin-top: 1rem;
            }
            
            .query-input-container {
              display: flex;
              gap: 0.5rem;
            }
            
            .query-input {
              flex: 1;
              padding: 0.75rem;
              border: 1px solid #dcdfe6;
              border-radius: 4px;
              font-size: 0.9rem;
            }
            
            .query-result {
              margin-top: 1.5rem;
              padding: 1rem;
              background-color: white;
              border-radius: 4px;
              box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            }
            
            .query-answer {
              margin-top: 0.5rem;
              line-height: 1.6;
            }
          `}</style>
        </div>
      );
    };

    // Render the component
    ReactDOM.render(
      React.createElement(FinDocRAGComponent),
      container
    );
  };

  // Check if we need to wait for React to load
  if (window.React && window.ReactDOM) {
    createFinDocRAGComponent();
  } else {
    // Wait for React to load
    const checkReact = setInterval(() => {
      if (window.React && window.ReactDOM) {
        clearInterval(checkReact);
        createFinDocRAGComponent();
      }
    }, 100);

    // Timeout after 10 seconds
    setTimeout(() => {
      clearInterval(checkReact);
      console.error('React or ReactDOM not loaded after 10 seconds');
    }, 10000);
  }
});
