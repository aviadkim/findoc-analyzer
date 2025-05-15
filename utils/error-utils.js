/**
 * Error Utility Functions
 * Provides standardized error handling utilities
 */

/**
 * Custom API Error class
 */
class ApiError extends Error {
  /**
   * Create a new API error
   * @param {string} message - Error message
   * @param {number} status - HTTP status code
   * @param {string} code - Error code
   * @param {Object} details - Additional error details
   */
  constructor(message, status = 500, code = 'API_ERROR', details = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Validation Error class
 */
class ValidationError extends ApiError {
  /**
   * Create a new validation error
   * @param {string} message - Error message
   * @param {Object} details - Validation details
   */
  constructor(message, details = null) {
    super(message, 400, 'VALIDATION_ERROR', details);
    this.name = 'ValidationError';
  }
}

/**
 * Not Found Error class
 */
class NotFoundError extends ApiError {
  /**
   * Create a new not found error
   * @param {string} message - Error message
   * @param {string} resource - Resource type that was not found
   */
  constructor(message, resource = 'Resource') {
    super(message || `${resource} not found`, 404, 'NOT_FOUND');
    this.name = 'NotFoundError';
    this.resource = resource;
  }
}

/**
 * Authentication Error class
 */
class AuthError extends ApiError {
  /**
   * Create a new authentication error
   * @param {string} message - Error message
   */
  constructor(message = 'Authentication required') {
    super(message, 401, 'UNAUTHORIZED');
    this.name = 'AuthError';
  }
}

/**
 * Authorization Error class
 */
class ForbiddenError extends ApiError {
  /**
   * Create a new authorization error
   * @param {string} message - Error message
   */
  constructor(message = 'Access denied') {
    super(message, 403, 'FORBIDDEN');
    this.name = 'ForbiddenError';
  }
}

/**
 * Try-catch wrapper for async route handlers
 * @param {Function} fn - Async route handler
 * @returns {Function} Express middleware function
 */
function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

/**
 * Create a standardized API response
 * @param {boolean} success - Whether the request was successful
 * @param {Object} data - Response data
 * @param {string} message - Response message
 * @returns {Object} Standardized API response
 */
function createApiResponse(success = true, data = null, message = null) {
  const response = { success };
  
  if (data !== null) {
    if (success) {
      response.data = data;
    } else {
      response.error = data;
    }
  }
  
  if (message) {
    response.message = message;
  }
  
  return response;
}

/**
 * Create a success response
 * @param {Object} data - Response data
 * @param {string} message - Success message
 * @returns {Object} Success response
 */
function createSuccessResponse(data = null, message = null) {
  return createApiResponse(true, data, message);
}

/**
 * Create an error response
 * @param {string} message - Error message
 * @param {string} code - Error code
 * @param {number} status - HTTP status code
 * @param {Object} details - Additional error details
 * @returns {Object} Error response
 */
function createErrorResponse(message, code = 'API_ERROR', status = 500, details = null) {
  return createApiResponse(false, {
    message,
    code,
    status,
    ...(details ? { details } : {})
  });
}

/**
 * Get user-friendly error message
 * @param {Error} error - The error object
 * @returns {string} User-friendly error message
 */
function getUserFriendlyErrorMessage(error) {
  // Map of error codes to user-friendly messages
  const errorMessages = {
    'VALIDATION_ERROR': 'The provided information is invalid.',
    'NOT_FOUND': 'The requested resource could not be found.',
    'UNAUTHORIZED': 'Authentication is required to access this resource.',
    'FORBIDDEN': 'You do not have permission to access this resource.',
    'INTERNAL_ERROR': 'An unexpected error occurred. Please try again later.',
    'SERVICE_UNAVAILABLE': 'The service is temporarily unavailable. Please try again later.',
    'DATABASE_ERROR': 'There was a problem accessing the database. Please try again later.',
    'TIMEOUT_ERROR': 'The request took too long to complete. Please try again later.',
    'NETWORK_ERROR': 'A network error occurred. Please check your connection and try again.',
    'CONFLICT_ERROR': 'The request could not be completed due to a conflict with the current state of the resource.',
    'RATE_LIMIT_ERROR': 'Too many requests. Please try again later.',
    'FILE_UPLOAD_ERROR': 'There was a problem uploading the file. Please try again.',
    'INVALID_FILE_TYPE': 'The file type is not supported.',
    'FILE_TOO_LARGE': 'The file is too large. Maximum file size is {maxSize}.',
    'INVALID_CREDENTIALS': 'Invalid username or password.',
    'ACCOUNT_LOCKED': 'Your account has been locked. Please contact support.',
    'API_ERROR': 'An error occurred while processing your request.'
  };
  
  // Get the error code
  const errorCode = error.code || 'API_ERROR';
  
  // Return user-friendly message or default message
  return errorMessages[errorCode] || error.message || 'An unexpected error occurred.';
}

// Export error classes and utilities
module.exports = {
  ApiError,
  ValidationError,
  NotFoundError,
  AuthError,
  ForbiddenError,
  asyncHandler,
  createApiResponse,
  createSuccessResponse,
  createErrorResponse,
  getUserFriendlyErrorMessage
};