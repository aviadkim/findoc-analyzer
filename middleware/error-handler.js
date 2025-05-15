/**
 * API Error Handler Middleware
 * Provides consistent error handling for all API routes
 */

// Import any required modules
const path = require('path');
const fs = require('fs');

// Create log directory if it doesn't exist
const logDir = path.join(__dirname, '..', 'logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// Log file path
const apiErrorLogPath = path.join(logDir, 'api-errors.log');

// Import utilities
const logger = require('../utils/logger');
const { 
  createUserErrorResponseFromError, 
  createUserErrorResponse, 
  getErrorCodeFromError 
} = require('../utils/user-messages');

/**
 * Log API error to file
 * @param {Object} errorData - The error data to log
 */
function logErrorToFile(errorData) {
  // Use our logger instead of direct file operations
  logger.logError(new Error(errorData.message), {
    path: errorData.path,
    method: errorData.method,
    status: errorData.status,
    body: errorData.body,
    params: errorData.params,
    query: errorData.query,
    ip: errorData.ip,
    userId: errorData.userId
  });
}

/**
 * Format error response based on environment
 * @param {Error} err - The error object
 * @param {boolean} includeStack - Whether to include stack trace
 * @returns {Object} Formatted error response
 */
function formatErrorResponse(err, includeStack = false) {
  const errorResponse = {
    success: false,
    error: {
      message: err.message || 'An unexpected error occurred',
      code: err.code || 'INTERNAL_ERROR',
      status: err.status || 500
    }
  };
  
  // Include stack trace in development environment
  if (includeStack && process.env.NODE_ENV !== 'production' && err.stack) {
    errorResponse.error.stack = err.stack;
  }
  
  return errorResponse;
}

/**
 * API Error handler middleware
 * @param {Error} err - The error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
function apiErrorHandler(err, req, res, next) {
  // Default status code and message
  const statusCode = err.status || err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  
  // Create error data for logging
  const errorData = {
    timestamp: new Date().toISOString(),
    path: req.path,
    method: req.method,
    status: statusCode,
    message: message,
    error: err.name || 'Error',
    body: req.body,
    params: req.params,
    query: req.query,
    ip: req.ip,
    userId: req.user?.id || 'anonymous',
    stack: err.stack
  };
  
  // Log error using our logger utility
  logger.error(`API Error: ${statusCode} ${message}`, errorData);
  
  // Determine if we should include stack trace
  const includeStack = process.env.NODE_ENV !== 'production';
  
  // Format error response
  const errorResponse = formatErrorResponse(err, includeStack);
  
  // Create a user-friendly error response
  const userErrorResponse = createUserErrorResponseFromError(err, {
    resource: err.resource,  // For NotFoundError
    maxSize: err.maxSize,    // For FILE_TOO_LARGE errors
    errorId: errorData.timestamp // For reference ID
  });
  
  // Add status code and reference ID for all error responses
  userErrorResponse.error.status = statusCode;
  userErrorResponse.error.id = errorData.timestamp;
  
  // Send the error response
  res.status(statusCode).json(userErrorResponse);
}

/**
 * Create a Not Found error handler middleware
 * @returns {Function} Not found middleware
 */
function notFoundHandler() {
  return (req, res, next) => {
    const err = new Error(`Resource not found: ${req.method} ${req.originalUrl}`);
    err.status = 404;
    err.code = 'NOT_FOUND';
    next(err);
  };
}

/**
 * Create an API error
 * @param {string} message - Error message
 * @param {number} status - HTTP status code
 * @param {string} code - Error code
 * @returns {Error} Custom error object
 */
function createApiError(message, status = 500, code = 'API_ERROR') {
  const error = new Error(message);
  error.status = status;
  error.code = code;
  return error;
}

// Export middleware functions
module.exports = {
  apiErrorHandler,
  notFoundHandler,
  createApiError
};