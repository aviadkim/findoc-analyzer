/**
 * Document Processor for FinDoc Analyzer
 *
 * This script handles document processing functionality.
 */

/**
 * Process a document
 * @param {string} documentId - The document ID
 * @param {boolean} reprocess - Whether to reprocess the document
 * @returns {Promise} - Promise that resolves when processing is complete
 */
async function processDocument(documentId, reprocess = false) {
  console.log(`Processing document: ${documentId}, reprocess: ${reprocess}`);

  try {
    // Get authentication headers
    const headers = {
      'Content-Type': 'application/json',
      ...(window.auth ? window.auth.getAuthHeaders() : {})
    };

    // Start processing
    const response = await fetch(`/api/documents/${documentId}/process${reprocess ? '?reprocess=true' : ''}`, {
      method: 'POST',
      headers
    });

    if (!response.ok) {
      throw new Error(`Failed to start processing: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Processing started:', data);

    // Return the processing data
    return data;
  } catch (error) {
    console.error('Error processing document:', error);
    throw error;
  }
}

/**
 * Get document processing status
 * @param {string} documentId - The document ID
 * @returns {Promise} - Promise that resolves with the processing status
 */
async function getDocumentProcessingStatus(documentId) {
  console.log(`Getting processing status for document: ${documentId}`);

  try {
    // Get authentication headers
    const headers = {
      ...(window.auth ? window.auth.getAuthHeaders() : {})
    };

    // Get processing status
    const response = await fetch(`/api/documents/${documentId}/status`, {
      headers
    });

    if (!response.ok) {
      throw new Error(`Failed to get processing status: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Processing status:', data);

    // Return the processing status
    return data;
  } catch (error) {
    console.error('Error getting processing status:', error);
    throw error;
  }
}

/**
 * Poll for document processing status
 * @param {string} documentId - The document ID
 * @param {function} onProgress - Callback function for progress updates
 * @param {function} onComplete - Callback function for completion
 * @param {function} onError - Callback function for errors
 * @returns {number} - Interval ID for the polling
 */
function pollDocumentProcessingStatus(documentId, onProgress, onComplete, onError) {
  console.log(`Polling processing status for document: ${documentId}`);

  // Poll for status
  const pollInterval = setInterval(async () => {
    try {
      // Get processing status
      const status = await getDocumentProcessingStatus(documentId);

      // Call progress callback
      if (onProgress) {
        onProgress(status);
      }

      // Check if processing is complete
      if (status.processed || status.status === 'completed') {
        clearInterval(pollInterval);

        // Call complete callback
        if (onComplete) {
          onComplete(status);
        }
      }

      // Check if processing failed
      if (status.status === 'error') {
        clearInterval(pollInterval);

        // Call error callback
        if (onError) {
          onError(new Error(status.message || 'Processing failed'));
        }
      }
    } catch (error) {
      console.error('Error polling processing status:', error);

      // Continue polling even if there's an error
      if (onProgress) {
        onProgress({ message: 'Checking processing status...' });
      }
    }
  }, 2000); // Poll every 2 seconds

  return pollInterval;
}

/**
 * Get document details
 * @param {string} documentId - The document ID
 * @returns {Promise} - Promise that resolves with the document details
 */
async function getDocumentDetails(documentId) {
  console.log(`Getting details for document: ${documentId}`);

  try {
    // Get authentication headers
    const headers = {
      ...(window.auth ? window.auth.getAuthHeaders() : {})
    };

    // Get document details
    const response = await fetch(`/api/documents/${documentId}`, {
      headers
    });

    if (!response.ok) {
      throw new Error(`Failed to get document details: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Document details:', data);

    // Return the document details
    return data;
  } catch (error) {
    console.error('Error getting document details:', error);
    throw error;
  }
}

/**
 * Get document content
 * @param {string} documentId - The document ID
 * @returns {Promise} - Promise that resolves with the document content
 */
async function getDocumentContent(documentId) {
  console.log(`Getting content for document: ${documentId}`);

  try {
    // Get authentication headers
    const headers = {
      ...(window.auth ? window.auth.getAuthHeaders() : {})
    };

    // Get document content
    const response = await fetch(`/api/documents/${documentId}/content`, {
      headers
    });

    if (!response.ok) {
      throw new Error(`Failed to get document content: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Document content:', data);

    // Return the document content
    return data;
  } catch (error) {
    console.error('Error getting document content:', error);
    throw error;
  }
}

/**
 * Get document tables
 * @param {string} documentId - The document ID
 * @returns {Promise} - Promise that resolves with the document tables
 */
async function getDocumentTables(documentId) {
  console.log(`Getting tables for document: ${documentId}`);

  try {
    // Get authentication headers
    const headers = {
      ...(window.auth ? window.auth.getAuthHeaders() : {})
    };

    // Get document tables
    const response = await fetch(`/api/documents/${documentId}/tables`, {
      headers
    });

    if (!response.ok) {
      throw new Error(`Failed to get document tables: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Document tables:', data);

    // Return the document tables
    return data;
  } catch (error) {
    console.error('Error getting document tables:', error);
    throw error;
  }
}

/**
 * Get document securities
 * @param {string} documentId - The document ID
 * @returns {Promise} - Promise that resolves with the document securities
 */
async function getDocumentSecurities(documentId) {
  console.log(`Getting securities for document: ${documentId}`);

  try {
    // Get authentication headers
    const headers = {
      ...(window.auth ? window.auth.getAuthHeaders() : {})
    };

    // Get document securities
    const response = await fetch(`/api/documents/${documentId}/securities`, {
      headers
    });

    if (!response.ok) {
      throw new Error(`Failed to get document securities: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Document securities:', data);

    // Return the document securities
    return data;
  } catch (error) {
    console.error('Error getting document securities:', error);
    throw error;
  }
}

/**
 * Download document
 * @param {string} documentId - The document ID
 */
function downloadDocument(documentId) {
  console.log(`Downloading document: ${documentId}`);

  // Get authentication token
  const authToken = window.auth ? window.auth.getAuthToken() : null;

  // Create URL with token
  const url = `/api/documents/${documentId}/download${authToken ? `?token=${authToken}` : ''}`;

  // Open URL in new tab
  window.open(url, '_blank');
}

/**
 * Ask a question about a document
 * @param {string} documentId - The document ID
 * @param {string} question - The question to ask
 * @returns {Promise} - Promise that resolves with the answer
 */
async function askDocumentQuestion(documentId, question) {
  console.log(`Asking question about document ${documentId}: ${question}`);

  try {
    // Get authentication headers
    const headers = {
      'Content-Type': 'application/json',
      ...(window.auth ? window.auth.getAuthHeaders() : {})
    };

    // Send question to API
    const response = await fetch(`/api/documents/${documentId}/chat`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ question })
    });

    if (!response.ok) {
      throw new Error(`Failed to get answer: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Answer received:', data);

    // Return the answer
    return data;
  } catch (error) {
    console.error('Error asking document question:', error);
    throw error;
  }
}

// Export document processor functions
window.documentProcessor = {
  processDocument,
  getDocumentProcessingStatus,
  pollDocumentProcessingStatus,
  getDocumentDetails,
  getDocumentContent,
  getDocumentTables,
  getDocumentSecurities,
  downloadDocument,
  askDocumentQuestion
};
