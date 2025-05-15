/**
 * User-Facing Message Utility
 * Provides user-friendly error messages and notifications
 */

// Define error message categories
const ERROR_CATEGORIES = {
  VALIDATION: 'validation',
  AUTHENTICATION: 'authentication',
  AUTHORIZATION: 'authorization',
  NOT_FOUND: 'not_found',
  SERVER: 'server',
  NETWORK: 'network',
  INPUT: 'input',
  FILE: 'file',
  DATABASE: 'database'
};

// Define user-friendly error messages by error code
const ERROR_MESSAGES = {
  // Validation errors
  'VALIDATION_ERROR': {
    message: 'The information you provided is not valid.',
    category: ERROR_CATEGORIES.VALIDATION,
    action: 'Please check your input and try again.'
  },
  
  // Authentication errors
  'UNAUTHORIZED': {
    message: 'Authentication is required to access this resource.',
    category: ERROR_CATEGORIES.AUTHENTICATION,
    action: 'Please log in and try again.'
  },
  'INVALID_CREDENTIALS': {
    message: 'The username or password you entered is incorrect.',
    category: ERROR_CATEGORIES.AUTHENTICATION,
    action: 'Please check your credentials and try again.'
  },
  'TOKEN_EXPIRED': {
    message: 'Your session has expired.',
    category: ERROR_CATEGORIES.AUTHENTICATION,
    action: 'Please log in again to continue.'
  },
  'ACCOUNT_LOCKED': {
    message: 'Your account has been locked.',
    category: ERROR_CATEGORIES.AUTHENTICATION,
    action: 'Please contact support for assistance.'
  },
  
  // Authorization errors
  'FORBIDDEN': {
    message: 'You do not have permission to access this resource.',
    category: ERROR_CATEGORIES.AUTHORIZATION,
    action: 'Please contact your administrator if you need access.'
  },
  
  // Not found errors
  'NOT_FOUND': {
    message: 'The requested resource could not be found.',
    category: ERROR_CATEGORIES.NOT_FOUND,
    action: 'Please check the resource ID and try again.'
  },
  'DOCUMENT_NOT_FOUND': {
    message: 'The requested document could not be found.',
    category: ERROR_CATEGORIES.NOT_FOUND,
    action: 'Please check the document ID and try again.'
  },
  'SECRET_NOT_FOUND': {
    message: 'The requested API key or secret could not be found.',
    category: ERROR_CATEGORIES.NOT_FOUND,
    action: 'Please check the key name and try again.'
  },
  
  // Server errors
  'INTERNAL_ERROR': {
    message: 'An unexpected error occurred on our server.',
    category: ERROR_CATEGORIES.SERVER,
    action: 'Please try again later. If the problem persists, contact support.'
  },
  'SERVICE_UNAVAILABLE': {
    message: 'The service is temporarily unavailable.',
    category: ERROR_CATEGORIES.SERVER,
    action: 'Please try again later.'
  },
  'DATABASE_ERROR': {
    message: 'A database error occurred.',
    category: ERROR_CATEGORIES.DATABASE,
    action: 'Please try again later. If the problem persists, contact support.'
  },
  
  // Network errors
  'NETWORK_ERROR': {
    message: 'A network error occurred.',
    category: ERROR_CATEGORIES.NETWORK,
    action: 'Please check your connection and try again.'
  },
  'TIMEOUT_ERROR': {
    message: 'The request took too long to complete.',
    category: ERROR_CATEGORIES.NETWORK,
    action: 'Please try again later.'
  },
  
  // Input errors
  'MISSING_PARAMETER': {
    message: 'A required parameter is missing.',
    category: ERROR_CATEGORIES.INPUT,
    action: 'Please provide all required parameters.'
  },
  'INVALID_FORMAT': {
    message: 'The provided data is not in the expected format.',
    category: ERROR_CATEGORIES.INPUT,
    action: 'Please check the format and try again.'
  },
  
  // File errors
  'FILE_UPLOAD_ERROR': {
    message: 'An error occurred while uploading the file.',
    category: ERROR_CATEGORIES.FILE,
    action: 'Please try again or choose a different file.'
  },
  'INVALID_FILE_TYPE': {
    message: 'The file type is not supported.',
    category: ERROR_CATEGORIES.FILE,
    action: 'Please upload a supported file type.'
  },
  'FILE_TOO_LARGE': {
    message: 'The file is too large.',
    category: ERROR_CATEGORIES.FILE,
    action: 'Please upload a smaller file or compress the current one.'
  }
};

// Default error message
const DEFAULT_ERROR_MESSAGE = {
  message: 'An unexpected error occurred.',
  category: ERROR_CATEGORIES.SERVER,
  action: 'Please try again later. If the problem persists, contact support.'
};

/**
 * Get a user-friendly error message by error code
 * @param {string} errorCode - Error code
 * @param {Object} data - Additional data for message interpolation
 * @returns {Object} User-friendly error message
 */
function getUserFriendlyErrorMessage(errorCode, data = {}) {
  // Get error message by code or use default
  const errorInfo = ERROR_MESSAGES[errorCode] || DEFAULT_ERROR_MESSAGE;
  
  // Clone the error info
  const userMessage = { ...errorInfo };
  
  // Interpolate any variables in the message
  if (data) {
    userMessage.message = interpolateMessage(userMessage.message, data);
    userMessage.action = interpolateMessage(userMessage.action, data);
  }
  
  return userMessage;
}

/**
 * Interpolate variables in a message string
 * @param {string} message - Message with variables in the format {variable}
 * @param {Object} data - Data object containing values for variables
 * @returns {string} Interpolated message
 */
function interpolateMessage(message, data) {
  return message.replace(/{([^{}]*)}/g, (match, key) => {
    return typeof data[key] !== 'undefined' ? data[key] : match;
  });
}

/**
 * Create a user-friendly error response
 * @param {string} errorCode - Error code
 * @param {Object} data - Additional data for message interpolation
 * @param {Object} details - Additional error details (not shown to user)
 * @returns {Object} User-friendly error response
 */
function createUserErrorResponse(errorCode, data = {}, details = null) {
  const userMessage = getUserFriendlyErrorMessage(errorCode, data);
  
  const response = {
    success: false,
    error: {
      code: errorCode,
      message: userMessage.message,
      action: userMessage.action,
      category: userMessage.category
    }
  };
  
  // Add details if in development environment
  if (details && process.env.NODE_ENV !== 'production') {
    response.error.details = details;
  }
  
  return response;
}

/**
 * Extract error code from error object
 * @param {Error} error - Error object
 * @returns {string} Error code
 */
function getErrorCodeFromError(error) {
  return error.code || 
    (error.name === 'ValidationError' ? 'VALIDATION_ERROR' : 
      (error.name === 'NotFoundError' ? 'NOT_FOUND' :
        (error.name === 'AuthError' ? 'UNAUTHORIZED' :
          (error.name === 'ForbiddenError' ? 'FORBIDDEN' : 'INTERNAL_ERROR'))));
}

/**
 * Create a user-friendly error response from an error object
 * @param {Error} error - Error object
 * @param {Object} data - Additional data for message interpolation
 * @returns {Object} User-friendly error response
 */
function createUserErrorResponseFromError(error, data = {}) {
  const errorCode = getErrorCodeFromError(error);
  
  // Include original error message in details if in development
  const details = process.env.NODE_ENV !== 'production' ? {
    originalMessage: error.message,
    stack: error.stack
  } : null;
  
  return createUserErrorResponse(errorCode, data, details);
}

/**
 * Create a success message
 * @param {string} message - Success message
 * @param {Object} data - Response data
 * @returns {Object} Success response
 */
function createSuccessMessage(message, data = null) {
  const response = {
    success: true,
    message
  };
  
  if (data) {
    response.data = data;
  }
  
  return response;
}

// Export functions
module.exports = {
  ERROR_CATEGORIES,
  getUserFriendlyErrorMessage,
  createUserErrorResponse,
  createUserErrorResponseFromError,
  createSuccessMessage,
  getErrorCodeFromError
};