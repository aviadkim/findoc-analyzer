/**
 * Comparison Controller
 * 
 * This file contains the controller functions for document comparison operations.
 */

const { v4: uuidv4 } = require('uuid');
const { generateContentInternal } = require('./geminiController');

// In-memory storage for comparisons
const comparisons = [];

/**
 * Compare documents
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @returns {Promise<void>}
 */
const compareDocuments = async (req, res) => {
  try {
    const { documentIds, name, description } = req.body;
    
    // Validate input
    if (!documentIds || !Array.isArray(documentIds) || documentIds.length < 2) {
      return res.status(400).json({
        success: false,
        error: 'At least two document IDs are required'
      });
    }
    
    // Get documents from document controller
    const documents = [];
    
    for (const id of documentIds) {
      try {
        // This would normally be a database query or API call
        // For now, we'll simulate it
        const document = {
          id,
          // This would be populated with actual document data
          // For now, we'll use placeholder data
          name: `Document ${id}`,
          type: 'application/pdf',
          processingResult: {
            documentType: 'portfolio_statement',
            securities: [
              {
                name: 'Example Security',
                isin: 'US0378331005',
                value: 1000,
                currency: 'USD'
              }
            ]
          }
        };
        
        documents.push(document);
      } catch (error) {
        console.error(`Error getting document ${id}:`, error);
        
        return res.status(404).json({
          success: false,
          error: `Document with ID ${id} not found or could not be accessed`
        });
      }
    }
    
    // Create comparison
    const comparison = {
      id: uuidv4(),
      name: name || `Comparison ${new Date().toISOString()}`,
      description: description || '',
      documentIds,
      userId: req.user?.id || 'anonymous',
      tenantId: req.tenantId || 'default',
      createdAt: new Date().toISOString()
    };
    
    // Generate comparison result
    comparison.result = await generateComparisonResult(documents, req.tenantId);
    
    // Add comparison to storage
    comparisons.push(comparison);
    
    // Return comparison
    return res.status(201).json({
      success: true,
      data: comparison
    });
  } catch (error) {
    console.error('Error comparing documents:', error);
    
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Get all comparisons
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @returns {Promise<void>}
 */
const getComparisons = async (req, res) => {
  try {
    // Filter comparisons by tenant ID
    let userComparisons = comparisons.filter(comparison => comparison.tenantId === req.tenantId);
    
    // Filter by user ID if not admin
    if (req.user && req.user.role !== 'admin') {
      userComparisons = userComparisons.filter(comparison => comparison.userId === req.user.id);
    }
    
    // Return comparisons
    return res.json({
      success: true,
      data: userComparisons
    });
  } catch (error) {
    console.error('Error getting comparisons:', error);
    
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Get a comparison by ID
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @returns {Promise<void>}
 */
const getComparisonById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find comparison
    const comparison = comparisons.find(c => c.id === id);
    
    // Check if comparison exists
    if (!comparison) {
      return res.status(404).json({
        success: false,
        error: 'Comparison not found'
      });
    }
    
    // Check if user has access to comparison
    if (
      // Check tenant isolation
      (req.tenantId && comparison.tenantId !== req.tenantId) ||
      // Check user permission
      (req.user && comparison.userId !== req.user.id && req.user.role !== 'admin')
    ) {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized'
      });
    }
    
    // Return comparison
    return res.json({
      success: true,
      data: comparison
    });
  } catch (error) {
    console.error('Error getting comparison:', error);
    
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Delete a comparison
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @returns {Promise<void>}
 */
const deleteComparison = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find comparison index
    const comparisonIndex = comparisons.findIndex(c => c.id === id);
    
    // Check if comparison exists
    if (comparisonIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Comparison not found'
      });
    }
    
    // Check if user has access to comparison
    if (
      // Check tenant isolation
      (req.tenantId && comparisons[comparisonIndex].tenantId !== req.tenantId) ||
      // Check user permission
      (req.user && comparisons[comparisonIndex].userId !== req.user.id && req.user.role !== 'admin')
    ) {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized'
      });
    }
    
    // Remove comparison
    comparisons.splice(comparisonIndex, 1);
    
    // Return success
    return res.json({
      success: true,
      data: {}
    });
  } catch (error) {
    console.error('Error deleting comparison:', error);
    
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Generate comparison result
 * @param {Array} documents - Array of document objects
 * @param {string} tenantId - Tenant ID
 * @returns {Promise<object>} Comparison result
 */
const generateComparisonResult = async (documents, tenantId) => {
  try {
    // Prepare prompt
    const prompt = `
      Compare the following financial documents:
      
      ${documents.map((document, index) => `
        Document ${index + 1}: ${document.name}
        - Type: ${document.type}
        - Document Type: ${document.processingResult?.documentType || 'Unknown'}
        
        Securities:
        ${JSON.stringify(document.processingResult?.securities || [], null, 2)}
      `).join('\n\n')}
      
      Generate a comparison with the following sections:
      1. Summary
      2. Key Differences
      3. Securities Comparison
      4. Recommendations
      
      Return the comparison as a JSON object with the following structure:
      {
        "summary": "...",
        "keyDifferences": [
          "...",
          "..."
        ],
        "securitiesComparison": "...",
        "recommendations": [
          "...",
          "..."
        ]
      }
    `;
    
    // Generate comparison
    const responseText = await generateContentInternal(prompt, tenantId);
    
    // Extract JSON
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    
    if (jsonMatch) {
      try {
        const result = JSON.parse(jsonMatch[0]);
        return result;
      } catch (error) {
        console.error('Error parsing comparison result JSON:', error);
        return generateFallbackComparisonResult(documents);
      }
    } else {
      return generateFallbackComparisonResult(documents);
    }
  } catch (error) {
    console.error('Error generating comparison result:', error);
    return generateFallbackComparisonResult(documents);
  }
};

/**
 * Generate fallback comparison result
 * @param {Array} documents - Array of document objects
 * @returns {object} Fallback comparison result
 */
const generateFallbackComparisonResult = (documents) => {
  return {
    summary: `Comparing ${documents.length} documents with different characteristics.`,
    keyDifferences: [
      'Document types may vary.',
      'Securities information may differ between documents.'
    ],
    securitiesComparison: 'Detailed securities comparison is not available at this time.',
    recommendations: [
      'Review each document individually for more detailed information.',
      'Consider using the document viewer to examine specific details.'
    ]
  };
};

module.exports = {
  compareDocuments,
  getComparisons,
  getComparisonById,
  deleteComparison
};
