/**
 * Scan1 Routes
 * Handles document scanning and processing
 */

const express = require('express');
const router = express.Router();
const axios = require('axios');

// Import services
const apiKeyProvider = require('../services/api-key-provider-service');

/**
 * Verify Gemini API key
 * Method: POST
 * Route: /api/scan1/verify-gemini-key
 */
router.post('/verify-gemini-key', async (req, res) => {
  try {
    const { apiKey } = req.body;
    
    if (!apiKey) {
      return res.status(400).json({
        success: false,
        message: 'API key is required'
      });
    }
    
    // Validate API key format
    const isValidFormat = apiKey.length > 10;
    
    if (!isValidFormat) {
      return res.status(400).json({
        success: false,
        message: 'Invalid API key format'
      });
    }
    
    // Verify API key with Gemini
    try {
      // Mock verification for development
      if (process.env.NODE_ENV === 'development') {
        console.log('Development mode: Skipping actual API key verification');
        return res.json({
          success: true,
          message: 'API key verified successfully (development mode)',
          isValid: true
        });
      }
      
      // In production, verify with actual API call
      const response = await axios.post(
        'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent',
        {
          contents: [
            {
              parts: [
                {
                  text: 'Hello, this is a test message to verify the API key.'
                }
              ]
            }
          ]
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'x-goog-api-key': apiKey
          }
        }
      );
      
      // If we get here, the API key is valid
      res.json({
        success: true,
        message: 'API key verified successfully',
        isValid: true
      });
    } catch (error) {
      // Check if the error is due to invalid API key
      if (error.response && (error.response.status === 400 || error.response.status === 401 || error.response.status === 403)) {
        return res.status(401).json({
          success: false,
          message: 'Invalid API key',
          isValid: false,
          error: error.response.data
        });
      }
      
      // Other errors
      throw error;
    }
  } catch (error) {
    console.error(`Error verifying Gemini API key: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Error verifying API key',
      error: error.message
    });
  }
});

/**
 * Process document with Gemini
 * Method: POST
 * Route: /api/scan1/process-document
 */
router.post('/process-document', async (req, res) => {
  try {
    const { documentId, documentText, options } = req.body;
    
    if (!documentId || !documentText) {
      return res.status(400).json({
        success: false,
        message: 'Document ID and text are required'
      });
    }
    
    // Get Gemini API key
    let apiKey;
    try {
      apiKey = await apiKeyProvider.getApiKey('gemini');
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Gemini API key not found',
        error: error.message
      });
    }
    
    // Process document with Gemini
    try {
      // Mock processing for development
      if (process.env.NODE_ENV === 'development') {
        console.log('Development mode: Skipping actual document processing');
        return res.json({
          success: true,
          message: 'Document processed successfully (development mode)',
          results: {
            documentId,
            summary: 'This is a mock summary of the document.',
            entities: [
              { type: 'security', name: 'Apple Inc.', isin: 'US0378331005' },
              { type: 'security', name: 'Microsoft Corp.', isin: 'US5949181045' }
            ]
          }
        });
      }
      
      // In production, process with actual API call
      const response = await axios.post(
        'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent',
        {
          contents: [
            {
              parts: [
                {
                  text: `Please analyze this financial document and extract key information:\n\n${documentText}`
                }
              ]
            }
          ]
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'x-goog-api-key': apiKey
          }
        }
      );
      
      // Process the response
      const result = response.data;
      
      res.json({
        success: true,
        message: 'Document processed successfully',
        results: {
          documentId,
          rawResponse: result,
          // Add more structured data here based on the response
        }
      });
    } catch (error) {
      // Check if the error is due to invalid API key
      if (error.response && (error.response.status === 400 || error.response.status === 401 || error.response.status === 403)) {
        return res.status(401).json({
          success: false,
          message: 'Invalid Gemini API key',
          error: error.response.data
        });
      }
      
      // Other errors
      throw error;
    }
  } catch (error) {
    console.error(`Error processing document with Gemini: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Error processing document',
      error: error.message
    });
  }
});

module.exports = router;
