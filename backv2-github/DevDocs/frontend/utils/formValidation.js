/**
 * Form validation utilities for the FinDoc Analyzer application
 */

/**
 * Validate an email address
 * @param {string} email - The email address to validate
 * @returns {boolean} Whether the email is valid
 */
export const isValidEmail = (email) => {
  if (!email) return false;
  
  // Basic email validation regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate a password
 * @param {string} password - The password to validate
 * @param {Object} options - Validation options
 * @param {number} options.minLength - Minimum password length (default: 8)
 * @param {boolean} options.requireUppercase - Whether to require uppercase letters (default: true)
 * @param {boolean} options.requireLowercase - Whether to require lowercase letters (default: true)
 * @param {boolean} options.requireNumbers - Whether to require numbers (default: true)
 * @param {boolean} options.requireSpecialChars - Whether to require special characters (default: true)
 * @returns {Object} Validation result with isValid and errors properties
 */
export const validatePassword = (password, options = {}) => {
  const {
    minLength = 8,
    requireUppercase = true,
    requireLowercase = true,
    requireNumbers = true,
    requireSpecialChars = true,
  } = options;
  
  const errors = [];
  
  if (!password) {
    errors.push('Password is required');
    return { isValid: false, errors };
  }
  
  if (password.length < minLength) {
    errors.push(`Password must be at least ${minLength} characters long`);
  }
  
  if (requireUppercase && !/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (requireLowercase && !/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (requireNumbers && !/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  if (requireSpecialChars && !/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Validate a required field
 * @param {string} value - The field value
 * @param {string} fieldName - The field name for error messages
 * @returns {Object} Validation result with isValid and error properties
 */
export const validateRequired = (value, fieldName) => {
  const isValid = !!value && value.trim() !== '';
  return {
    isValid,
    error: isValid ? null : `${fieldName} is required`,
  };
};

/**
 * Validate a number field
 * @param {string|number} value - The field value
 * @param {Object} options - Validation options
 * @param {number} options.min - Minimum value (optional)
 * @param {number} options.max - Maximum value (optional)
 * @param {boolean} options.integer - Whether the value must be an integer (default: false)
 * @param {string} fieldName - The field name for error messages
 * @returns {Object} Validation result with isValid and error properties
 */
export const validateNumber = (value, options = {}, fieldName) => {
  const { min, max, integer = false } = options;
  
  // Check if the value is a valid number
  if (value === '' || value === null || value === undefined) {
    return {
      isValid: false,
      error: `${fieldName} is required`,
    };
  }
  
  const numberValue = Number(value);
  
  if (isNaN(numberValue)) {
    return {
      isValid: false,
      error: `${fieldName} must be a valid number`,
    };
  }
  
  // Check if the value is an integer if required
  if (integer && !Number.isInteger(numberValue)) {
    return {
      isValid: false,
      error: `${fieldName} must be an integer`,
    };
  }
  
  // Check if the value is within the specified range
  if (min !== undefined && numberValue < min) {
    return {
      isValid: false,
      error: `${fieldName} must be at least ${min}`,
    };
  }
  
  if (max !== undefined && numberValue > max) {
    return {
      isValid: false,
      error: `${fieldName} must be at most ${max}`,
    };
  }
  
  return {
    isValid: true,
    error: null,
  };
};

/**
 * Validate a date field
 * @param {string|Date} value - The field value
 * @param {Object} options - Validation options
 * @param {Date} options.minDate - Minimum date (optional)
 * @param {Date} options.maxDate - Maximum date (optional)
 * @param {string} fieldName - The field name for error messages
 * @returns {Object} Validation result with isValid and error properties
 */
export const validateDate = (value, options = {}, fieldName) => {
  const { minDate, maxDate } = options;
  
  // Check if the value is a valid date
  if (!value) {
    return {
      isValid: false,
      error: `${fieldName} is required`,
    };
  }
  
  const dateValue = value instanceof Date ? value : new Date(value);
  
  if (isNaN(dateValue.getTime())) {
    return {
      isValid: false,
      error: `${fieldName} must be a valid date`,
    };
  }
  
  // Check if the date is within the specified range
  if (minDate && dateValue < minDate) {
    return {
      isValid: false,
      error: `${fieldName} must be on or after ${minDate.toLocaleDateString()}`,
    };
  }
  
  if (maxDate && dateValue > maxDate) {
    return {
      isValid: false,
      error: `${fieldName} must be on or before ${maxDate.toLocaleDateString()}`,
    };
  }
  
  return {
    isValid: true,
    error: null,
  };
};

/**
 * Validate a URL field
 * @param {string} value - The field value
 * @param {string} fieldName - The field name for error messages
 * @returns {Object} Validation result with isValid and error properties
 */
export const validateUrl = (value, fieldName) => {
  if (!value) {
    return {
      isValid: false,
      error: `${fieldName} is required`,
    };
  }
  
  try {
    new URL(value);
    return {
      isValid: true,
      error: null,
    };
  } catch (error) {
    return {
      isValid: false,
      error: `${fieldName} must be a valid URL`,
    };
  }
};

/**
 * Validate a file field
 * @param {File} file - The file to validate
 * @param {Object} options - Validation options
 * @param {number} options.maxSize - Maximum file size in bytes (optional)
 * @param {Array<string>} options.allowedTypes - Allowed file types (optional)
 * @param {string} fieldName - The field name for error messages
 * @returns {Object} Validation result with isValid and error properties
 */
export const validateFile = (file, options = {}, fieldName) => {
  const { maxSize, allowedTypes } = options;
  
  if (!file) {
    return {
      isValid: false,
      error: `${fieldName} is required`,
    };
  }
  
  // Check file size
  if (maxSize && file.size > maxSize) {
    const maxSizeMB = Math.round(maxSize / (1024 * 1024) * 10) / 10;
    return {
      isValid: false,
      error: `${fieldName} must be smaller than ${maxSizeMB} MB`,
    };
  }
  
  // Check file type
  if (allowedTypes && allowedTypes.length > 0) {
    const fileType = file.type;
    const fileExtension = file.name.split('.').pop().toLowerCase();
    
    const isTypeAllowed = allowedTypes.some(type => {
      // Check MIME type
      if (fileType === type) {
        return true;
      }
      
      // Check file extension
      if (type.startsWith('.') && fileExtension === type.substring(1)) {
        return true;
      }
      
      return false;
    });
    
    if (!isTypeAllowed) {
      return {
        isValid: false,
        error: `${fieldName} must be one of the following types: ${allowedTypes.join(', ')}`,
      };
    }
  }
  
  return {
    isValid: true,
    error: null,
  };
};

/**
 * Validate a form with multiple fields
 * @param {Object} values - The form values
 * @param {Object} validations - The validation rules for each field
 * @returns {Object} Validation result with isValid and errors properties
 */
export const validateForm = (values, validations) => {
  const errors = {};
  let isValid = true;
  
  Object.entries(validations).forEach(([field, validate]) => {
    const value = values[field];
    const result = validate(value);
    
    if (!result.isValid) {
      errors[field] = result.error || 'Invalid value';
      isValid = false;
    }
  });
  
  return {
    isValid,
    errors,
  };
};
