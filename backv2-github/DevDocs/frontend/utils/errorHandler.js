/**
 * Error handling utilities
 */

/**
 * Map of error codes to user-friendly messages
 */
const ERROR_MESSAGES = {
  // Authentication errors
  'auth/invalid-email': 'The email address is not valid.',
  'auth/user-disabled': 'This user account has been disabled.',
  'auth/user-not-found': 'No user found with this email address.',
  'auth/wrong-password': 'Incorrect password. Please try again.',
  'auth/email-already-in-use': 'This email address is already in use.',
  'auth/weak-password': 'The password is too weak. Please use a stronger password.',
  'auth/requires-recent-login': 'This operation requires recent authentication. Please log in again.',

  // Validation errors
  'validation/required': 'This field is required.',
  'validation/min-length': 'This field must be at least {min} characters long.',
  'validation/max-length': 'This field cannot be longer than {max} characters.',
  'validation/email-format': 'Please enter a valid email address.',
  'validation/password-match': 'Passwords do not match.',
  'validation/number-format': 'Please enter a valid number.',
  'validation/date-format': 'Please enter a valid date.',
  'validation/file-size': 'The file is too large. Maximum size is {max}.',
  'validation/file-type': 'This file type is not supported.',

  // API errors
  'api/network-error': 'Network error. Please check your internet connection.',
  'api/timeout': 'The request timed out. Please try again.',
  'api/server-error': 'Server error. Please try again later.',
  'api/not-found': 'The requested resource was not found.',
  'api/unauthorized': 'You are not authorized to perform this action.',
  'api/forbidden': 'You do not have permission to access this resource.',

  // Document errors
  'document/upload-failed': 'Failed to upload document. Please try again.',
  'document/processing-failed': 'Failed to process document. Please try again.',
  'document/not-found': 'Document not found.',
  'document/invalid-format': 'Invalid document format.',

  // Default error
  'default': 'An error occurred. Please try again.'
};

/**
 * Get a user-friendly error message
 * @param {string|Error} error - The error object or error code
 * @param {Object} params - Parameters to replace in the error message
 * @returns {string} User-friendly error message
 */
export const getUserFriendlyError = (error, params = {}) => {
  // Handle null or undefined
  if (!error) {
    return ERROR_MESSAGES.default;
  }

  // Extract error code from error object
  const errorCode = typeof error === 'string'
    ? error
    : error.code || 'default';

  // Get error message from map or use default
  let message = ERROR_MESSAGES[errorCode] || error.message || ERROR_MESSAGES.default;

  // Replace parameters in message
  Object.entries(params).forEach(([key, value]) => {
    message = message.replace(`{${key}}`, value);
  });

  return message;
};

/**
 * Format validation errors into a user-friendly object
 * @param {Object} errors - Validation errors object
 * @returns {Object} Formatted errors object
 */
export const formatValidationErrors = (errors) => {
  if (!errors) return {};

  const formattedErrors = {};

  Object.entries(errors).forEach(([field, error]) => {
    // Handle array of errors
    if (Array.isArray(error)) {
      formattedErrors[field] = error.map(err => getUserFriendlyError(err)).join(' ');
    }
    // Handle string error code
    else if (typeof error === 'string') {
      formattedErrors[field] = getUserFriendlyError(error);
    }
    // Handle error object with code and params
    else if (error && typeof error === 'object') {
      formattedErrors[field] = getUserFriendlyError(error.code || 'default', error.params);
    }
  });

  return formattedErrors;
};

/**
 * Handle API errors
 * @param {Error} error - The error object
 * @param {Function} toast - Optional toast function for displaying errors
 * @returns {Object} Formatted error object with message and code
 */
export const handleApiError = (error, toast = null) => {
  // Default error response
  const errorResponse = {
    message: getUserFriendlyError('default'),
    code: 'api/unknown-error'
  };

  // Handle null or undefined
  if (!error) {
    return errorResponse;
  }

  // Handle network errors
  if (!navigator.onLine || error.message === 'Network Error') {
    const errorObj = {
      message: getUserFriendlyError('api/network-error'),
      code: 'api/network-error'
    };

    if (toast) {
      toast({
        title: 'Network Error',
        description: errorObj.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }

    return errorObj;
  }

  // Handle timeout errors
  if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
    const errorObj = {
      message: getUserFriendlyError('api/timeout'),
      code: 'api/timeout'
    };

    if (toast) {
      toast({
        title: 'Request Timeout',
        description: errorObj.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }

    return errorObj;
  }

  // Handle API response errors
  if (error.response) {
    const { status, data } = error.response;

    // Map HTTP status codes to error codes
    const statusToCode = {
      400: 'api/bad-request',
      401: 'api/unauthorized',
      403: 'api/forbidden',
      404: 'api/not-found',
      429: 'api/rate-limit',
      500: 'api/server-error',
      502: 'api/server-error',
      503: 'api/server-error',
      504: 'api/server-error'
    };

    const code = statusToCode[status] || 'api/unknown-error';
    const message = data?.message || getUserFriendlyError(code);
    const errorObj = { message, code };

    if (toast) {
      toast({
        title: getErrorTitle(status),
        description: message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }

    return errorObj;
  }

  // Handle other errors
  const errorObj = {
    message: error.message || errorResponse.message,
    code: error.code || errorResponse.code
  };

  if (toast) {
    toast({
      title: 'Error',
      description: errorObj.message,
      status: 'error',
      duration: 5000,
      isClosable: true,
    });
  }

  return errorObj;
};

/**
 * Get a user-friendly error title based on HTTP status code
 * @param {number} status - HTTP status code
 * @returns {string} User-friendly error title
 */
const getErrorTitle = (status) => {
  switch (status) {
    case 400:
      return 'Invalid Request';
    case 401:
      return 'Authentication Required';
    case 403:
      return 'Access Denied';
    case 404:
      return 'Not Found';
    case 429:
      return 'Too Many Requests';
    case 500:
    case 502:
    case 503:
    case 504:
      return 'Server Error';
    default:
      return 'Error';
  }
};

/**
 * Retry a function with exponential backoff
 * @param {Function} fn - The function to retry
 * @param {Object} options - Retry options
 * @param {number} options.maxRetries - Maximum number of retries (default: 3)
 * @param {number} options.initialDelay - Initial delay in ms (default: 1000)
 * @param {number} options.maxDelay - Maximum delay in ms (default: 10000)
 * @returns {Promise} Promise that resolves with the function result or rejects after max retries
 */
export const retryWithBackoff = async (
  fn,
  { maxRetries = 3, initialDelay = 1000, maxDelay = 10000 } = {}
) => {
  let retries = 0;
  let delay = initialDelay;

  while (true) {
    try {
      return await fn();
    } catch (error) {
      retries++;

      // If we've reached max retries, throw the error
      if (retries >= maxRetries) {
        throw error;
      }

      // Calculate delay with exponential backoff
      delay = Math.min(delay * 2, maxDelay);

      // Wait for the delay
      await new Promise(resolve => setTimeout(resolve, delay));

      console.log(`Retrying operation (${retries}/${maxRetries})...`);
    }
  }
};

/**
 * Display error notification
 * @param {string|Error} error - The error object or message
 * @param {Function} notifyFunction - Function to display notification
 */
export const showErrorNotification = (error, notifyFunction) => {
  if (!notifyFunction || typeof notifyFunction !== 'function') {
    console.error('Error notification function not provided');
    console.error(error);
    return;
  }

  const errorMessage = typeof error === 'string'
    ? error
    : getUserFriendlyError(error);

  notifyFunction({
    title: 'Error',
    message: errorMessage,
    type: 'error'
  });
};
