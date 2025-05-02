/**
 * Mock API Controller
 * 
 * This controller provides mock API endpoints for testing the PDF processing functionality
 * until the Google Authentication and other components are fully implemented.
 */

const mockDataService = require('../services/mockDataService');
const { v4: uuidv4 } = require('uuid');

/**
 * Get all documents
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
const getDocuments = (req, res) => {
  try {
    const documents = mockDataService.getAllDocuments();
    
    return res.json({
      success: true,
      data: documents
    });
  } catch (error) {
    console.error('Error in getDocuments:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Get document by ID
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
const getDocumentById = (req, res) => {
  try {
    const { id } = req.params;
    const document = mockDataService.getDocumentById(id);
    
    if (!document) {
      return res.status(404).json({
        success: false,
        error: 'Document not found'
      });
    }
    
    return res.json({
      success: true,
      data: document
    });
  } catch (error) {
    console.error('Error in getDocumentById:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Create document
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
const createDocument = (req, res) => {
  try {
    // Check if file is in request
    if (!req.file && !req.files) {
      // If no file is uploaded, try to use mock data
      const { name, type } = req.body;
      
      // Validate input
      if (!name || !type) {
        return res.status(400).json({
          success: false,
          error: 'Name and type are required'
        });
      }
      
      // Create document
      const document = {
        id: uuidv4(),
        name,
        type
      };
      
      const createdDocument = mockDataService.createDocument(document);
      
      return res.status(201).json({
        success: true,
        data: createdDocument
      });
    }
    
    // Handle file upload
    const file = req.file || req.files[0];
    
    // Get file details
    const fileName = file.originalname || file.name;
    const fileType = file.mimetype;
    
    // Create document
    const document = {
      id: uuidv4(),
      name: req.body.name || fileName,
      type: req.body.type || 'financial_statement'
    };
    
    const createdDocument = mockDataService.createDocument(document);
    
    return res.status(201).json({
      success: true,
      data: createdDocument
    });
  } catch (error) {
    console.error('Error in createDocument:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Process document
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
const processDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const options = req.body;
    
    // Process document
    const processedDocument = await mockDataService.processDocument(id, options);
    
    return res.json({
      success: true,
      data: processedDocument
    });
  } catch (error) {
    console.error('Error in processDocument:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Answer question
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
const answerQuestion = (req, res) => {
  try {
    const { id } = req.params;
    const { question } = req.body;
    
    if (!question) {
      return res.status(400).json({
        success: false,
        error: 'Question is required'
      });
    }
    
    // Answer question
    const answer = mockDataService.answerQuestion(id, question);
    
    return res.json({
      success: true,
      data: answer
    });
  } catch (error) {
    console.error('Error in answerQuestion:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

module.exports = {
  getDocuments,
  getDocumentById,
  createDocument,
  processDocument,
  answerQuestion
};
