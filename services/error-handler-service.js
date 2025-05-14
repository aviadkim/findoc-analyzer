/**
 * Error Handler Service
 * Provides standardized error handling across the application
 */

const logger = require('./logger-service');

/**
 * Create a standard error response
 * @param {string} message - Error message
 * @param {number} statusCode - HTTP status code
 * @param {Object} details - Additional error details
 * @returns {Object} Standardized error response
 */
function createErrorResponse(message, statusCode = 500, details = null) {
  const errorId = Date.now().toString();
  
  return {
    success: false,
    error: {
      message,
      statusCode,
      id: errorId,
      ...(details && { details })
    }
  };
}

/**
 * Handle API errors in route handlers
 * @param {Error} error - The error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
function handleApiError(error, req, res) {
  // Log the error with appropriate level
  logger.logApiError(error, req);
  
  // Check for known error types and respond accordingly
  if (error instanceof logger.ValidationError) {
    return res.status(400).json(createErrorResponse(
      error.message || 'Validation error',
      400,
      error.details
    ));
  }
  
  if (error instanceof logger.AuthenticationError) {
    return res.status(401).json(createErrorResponse(
      error.message || 'Authentication error',
      401
    ));
  }
  
  if (error instanceof logger.AuthorizationError) {
    return res.status(403).json(createErrorResponse(
      error.message || 'Authorization error',
      403
    ));
  }
  
  if (error instanceof logger.NotFoundError) {
    return res.status(404).json(createErrorResponse(
      error.message || 'Resource not found',
      404
    ));
  }
  
  // For unknown errors, return a generic 500 response
  return res.status(500).json(createErrorResponse(
    'An unexpected error occurred',
    500
  ));
}

/**
 * Validate request data
 * @param {Object} data - Data to validate
 * @param {Object} schema - Validation schema
 * @throws {ValidationError} If validation fails
 */
function validateRequest(data, schema) {
  if (!schema) return;
  
  const validationErrors = {};
  let hasErrors = false;
  
  // Simple validation for required fields
  for (const [field, rules] of Object.entries(schema)) {
    // Check required rule
    if (rules.required && (data[field] === undefined || data[field] === null || data[field] === '')) {
      validationErrors[field] = `${field} is required`;
      hasErrors = true;
      continue;
    }
    
    // If field is not provided but not required, skip other validations
    if (data[field] === undefined || data[field] === null) {
      continue;
    }
    
    // Check type rule
    if (rules.type && typeof data[field] !== rules.type) {
      validationErrors[field] = `${field} must be of type ${rules.type}`;
      hasErrors = true;
      continue;
    }
    
    // Check min length rule
    if (rules.minLength !== undefined && data[field].length < rules.minLength) {
      validationErrors[field] = `${field} must be at least ${rules.minLength} characters`;
      hasErrors = true;
      continue;
    }
    
    // Check max length rule
    if (rules.maxLength !== undefined && data[field].length > rules.maxLength) {
      validationErrors[field] = `${field} must be at most ${rules.maxLength} characters`;
      hasErrors = true;
      continue;
    }
    
    // Check pattern rule
    if (rules.pattern && !rules.pattern.test(data[field])) {
      validationErrors[field] = rules.patternMessage || `${field} is invalid`;
      hasErrors = true;
      continue;
    }
    
    // Check custom validator
    if (rules.validator && typeof rules.validator === 'function') {
      const isValid = rules.validator(data[field], data);
      if (!isValid) {
        validationErrors[field] = rules.validatorMessage || `${field} is invalid`;
        hasErrors = true;
      }
    }
  }
  
  if (hasErrors) {
    throw new logger.ValidationError('Validation failed', validationErrors);
  }
}

/**
 * Create an async route handler with built-in error handling
 * @param {Function} fn - Async route handler function
 * @returns {Function} Express middleware function with error handling
 */
function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(error => {
      handleApiError(error, req, res);
    });
  };
}

/**
 * Handle unhandled promise rejections
 */
function setupGlobalErrorHandlers() {
  // Handle unhandled promise rejections
  process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Promise Rejection', { reason, promise });
  });
  
  // Handle uncaught exceptions
  process.on('uncaughtException', (error) => {
    logger.error('Uncaught Exception', { error: error.stack });
    
    // In production, we might want to try to gracefully shutdown
    if (process.env.NODE_ENV === 'production') {
      logger.error('Uncaught exception, shutting down');
      // Allow some time for logging before exiting
      setTimeout(() => {
        process.exit(1);
      }, 1000);
    }
  });
}

module.exports = {
  createErrorResponse,
  handleApiError,
  validateRequest,
  asyncHandler,
  setupGlobalErrorHandlers
};