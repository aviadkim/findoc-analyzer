/**
 * API Key Routes
 * This module defines the routes for API key management
 */

// Import required modules
const express = require('express');
const router = express.Router();
const apiKeyService = require('../services/api-key-service');
const authService = require('../services/auth-service');

// Import error utilities
const { 
  asyncHandler, 
  NotFoundError, 
  ValidationError,
  AuthError,
  createSuccessResponse,
  createErrorResponse
} = require('../utils/error-utils');

/**
 * Get a secret from Google Cloud Secret Manager
 * @route GET /api/keys/gcp/secrets/get
 * @param {string} name - The name of the secret
 * @returns {Object} - The secret value
 */
router.get('/gcp/secrets/get', authService.authenticateRequest, asyncHandler(async (req, res) => {
  // Get the secret name from the query parameters
  const { name } = req.query;

  // Check if the secret name is provided
  if (!name) {
    throw new ValidationError('Secret name is required');
  }

  // Get the secret
  const secret = await apiKeyService.getSecret(name);

  // Check if the secret was found
  if (!secret) {
    throw new NotFoundError(`Secret '${name}' was not found`, 'Secret');
  }

  // Return success response with the secret
  return res.json(createSuccessResponse({
    name,
    value: secret
  }, 'Secret retrieved successfully'));
}));

/**
 * Ensure the route works with alternate form:
 * GET /api/keys/secrets/get
 */
router.get('/secrets/get', authService.authenticateRequest, asyncHandler(async (req, res) => {
  // Get the secret name from the query parameters
  const { name } = req.query;

  // Check if the secret name is provided
  if (!name) {
    throw new ValidationError('Secret name is required');
  }

  // Get the secret
  const secret = await apiKeyService.getSecret(name);

  // Check if the secret was found
  if (!secret) {
    throw new NotFoundError(`Secret '${name}' was not found`, 'Secret');
  }

  // Return success response with the secret
  return res.json(createSuccessResponse({
    name,
    value: secret
  }, 'Secret retrieved successfully'));
}));

/**
 * Get all API keys
 * @route GET /api/keys/all
 * @returns {Object} - All API keys
 */
router.get('/all', authService.authenticateRequest, async (req, res) => {
  try {
    // Get all API keys
    const apiKeys = await apiKeyService.getAllApiKeys();

    // Check if the API keys were found
    if (!apiKeys) {
      return res.status(404).json({
        error: 'API keys not found',
        message: 'The API keys were not found'
      });
    }

    // Return the API keys
    return res.json(apiKeys);
  } catch (error) {
    console.error('Error getting API keys:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

/**
 * Validate an API key
 * @route POST /api/keys/validate
 * @param {string} type - The type of API key
 * @param {string} key - The API key value
 * @returns {Object} - Whether the API key is valid
 */
router.post('/validate', authService.authenticateRequest, async (req, res) => {
  try {
    // Get the API key type and value from the request body
    const { type, key } = req.body;

    // Check if the API key type and value are provided
    if (!type || !key) {
      return res.status(400).json({
        error: 'Missing API key type or value',
        message: 'The API key type and value are required'
      });
    }

    // Validate the API key
    const valid = await apiKeyService.validateApiKey(type, key);

    // Return the validation result
    return res.json({
      type,
      valid
    });
  } catch (error) {
    console.error('Error validating API key:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

// Export the router
module.exports = router;
