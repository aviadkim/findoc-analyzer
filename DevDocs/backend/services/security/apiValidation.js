/**
 * API Validation Service
 * 
 * Provides comprehensive API security validation:
 * - Schema validation for request payloads
 * - Input sanitization
 * - Parameter bounds checking
 * - Payload size limits
 * - Type validation
 * - Custom validation rules
 */

const Ajv = require('ajv');
const addFormats = require('ajv-formats');
const sanitizeHtml = require('sanitize-html');
const { logger } = require('../../utils/logger');

// Initialize JSON schema validator
const ajv = new Ajv({
  allErrors: true,
  removeAdditional: true,
  useDefaults: true,
  coerceTypes: true,
  strict: false
});
addFormats(ajv);

// Default payload size limit (can be overridden per endpoint)
const DEFAULT_PAYLOAD_SIZE_LIMIT = 1024 * 1024; // 1MB

/**
 * API Validation Service
 */
class ApiValidationService {
  constructor() {
    this.schemas = new Map();
    this.validationRules = new Map();
    this.payloadLimits = new Map();
    this.sanitizationRules = new Map();
    
    // Register default sanitization rules
    this.registerDefaultSanitizationRules();
  }

  /**
   * Register a JSON schema for an endpoint
   * @param {string} endpoint - API endpoint path
   * @param {Object} schema - JSON schema for validation
   */
  registerSchema(endpoint, schema) {
    try {
      const validate = ajv.compile(schema);
      this.schemas.set(endpoint, validate);
      logger.info(`Schema registered for endpoint: ${endpoint}`);
    } catch (error) {
      logger.error(`Failed to register schema for endpoint ${endpoint}:`, error);
      throw new Error(`Schema registration failed: ${error.message}`);
    }
  }

  /**
   * Register custom validation rules for an endpoint
   * @param {string} endpoint - API endpoint path
   * @param {Function} validationFn - Custom validation function
   */
  registerValidationRule(endpoint, validationFn) {
    if (typeof validationFn !== 'function') {
      throw new Error('Validation rule must be a function');
    }
    
    this.validationRules.set(endpoint, validationFn);
    logger.info(`Custom validation rule registered for endpoint: ${endpoint}`);
  }

  /**
   * Set payload size limit for an endpoint
   * @param {string} endpoint - API endpoint path
   * @param {number} sizeLimit - Maximum payload size in bytes
   */
  setPayloadLimit(endpoint, sizeLimit) {
    if (typeof sizeLimit !== 'number' || sizeLimit <= 0) {
      throw new Error('Payload size limit must be a positive number');
    }
    
    this.payloadLimits.set(endpoint, sizeLimit);
    logger.info(`Payload limit of ${sizeLimit} bytes set for endpoint: ${endpoint}`);
  }

  /**
   * Register sanitization rules for specific fields
   * @param {string} fieldPath - Path to the field (e.g., 'user.name')
   * @param {Object} options - Sanitization options
   */
  registerSanitizationRule(fieldPath, options) {
    this.sanitizationRules.set(fieldPath, options);
    logger.info(`Sanitization rule registered for field: ${fieldPath}`);
  }

  /**
   * Register default sanitization rules
   */
  registerDefaultSanitizationRules() {
    // HTML content sanitization
    this.registerSanitizationRule('*.html', {
      type: 'html',
      options: {
        allowedTags: ['b', 'i', 'em', 'strong', 'a', 'p', 'br'],
        allowedAttributes: {
          'a': ['href', 'target']
        }
      }
    });
    
    // Email sanitization
    this.registerSanitizationRule('*.email', {
      type: 'email',
      pattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    });
    
    // General string sanitization
    this.registerSanitizationRule('*.string', {
      type: 'string',
      maxLength: 1000
    });
  }

  /**
   * Sanitize input based on field type and rules
   * @param {string} field - Field name
   * @param {any} value - Field value
   * @param {string} type - Optional type override
   * @returns {any} - Sanitized value
   */
  sanitizeInput(field, value, type = null) {
    // Skip sanitization for null/undefined values
    if (value === null || value === undefined) {
      return value;
    }

    // Get specific field rule or fallback to wildcard rules
    const rule = this.sanitizationRules.get(field) || 
                 this.sanitizationRules.get(`*.${type || typeof value}`);
    
    if (!rule) {
      return value; // No applicable rule
    }

    try {
      switch (rule.type) {
        case 'html':
          return typeof value === 'string' 
            ? sanitizeHtml(value, rule.options) 
            : value;
            
        case 'email':
          if (typeof value === 'string') {
            return rule.pattern.test(value) ? value.trim().toLowerCase() : '';
          }
          return value;
          
        case 'string':
          if (typeof value === 'string') {
            // Trim and limit length
            let sanitized = value.trim();
            if (rule.maxLength && sanitized.length > rule.maxLength) {
              sanitized = sanitized.substring(0, rule.maxLength);
            }
            return sanitized;
          }
          return value;
          
        default:
          return value;
      }
    } catch (error) {
      logger.warn(`Sanitization failed for field ${field}:`, error);
      return ''; // Return empty value on sanitization failure
    }
  }

  /**
   * Check if request payload size is within limits
   * @param {string} endpoint - API endpoint path
   * @param {Object} body - Request body
   * @returns {boolean} - True if within limits, false otherwise
   */
  checkPayloadSize(endpoint, body) {
    const limit = this.payloadLimits.get(endpoint) || DEFAULT_PAYLOAD_SIZE_LIMIT;
    const payloadSize = JSON.stringify(body).length;
    
    if (payloadSize > limit) {
      logger.warn(`Payload size (${payloadSize} bytes) exceeds limit (${limit} bytes) for endpoint: ${endpoint}`);
      return false;
    }
    
    return true;
  }

  /**
   * Recursively sanitize object properties
   * @param {Object} obj - Object to sanitize
   * @param {string} prefix - Property path prefix for nested objects
   * @returns {Object} - Sanitized object
   */
  sanitizeObject(obj, prefix = '') {
    if (typeof obj !== 'object' || obj === null) {
      return obj;
    }
    
    const sanitized = Array.isArray(obj) ? [] : {};
    
    for (const [key, value] of Object.entries(obj)) {
      const fullPath = prefix ? `${prefix}.${key}` : key;
      
      if (typeof value === 'object' && value !== null) {
        sanitized[key] = this.sanitizeObject(value, fullPath);
      } else {
        sanitized[key] = this.sanitizeInput(fullPath, value);
      }
    }
    
    return sanitized;
  }

  /**
   * Validate request against registered schema and rules
   * @param {string} endpoint - API endpoint path
   * @param {Object} data - Request data to validate
   * @returns {Object} - Validation result
   */
  validate(endpoint, data) {
    const result = {
      valid: true,
      sanitized: this.sanitizeObject(data),
      errors: []
    };

    // Check payload size
    if (!this.checkPayloadSize(endpoint, data)) {
      result.valid = false;
      result.errors.push({
        type: 'payload_size',
        message: 'Request payload exceeds size limit'
      });
      return result;
    }

    // Validate against JSON schema if available
    const schemaValidator = this.schemas.get(endpoint);
    if (schemaValidator) {
      const isValid = schemaValidator(result.sanitized);
      
      if (!isValid) {
        result.valid = false;
        result.errors.push({
          type: 'schema_validation',
          details: schemaValidator.errors
        });
      }
    }

    // Apply custom validation rules if available
    const customValidator = this.validationRules.get(endpoint);
    if (customValidator) {
      try {
        const customValidation = customValidator(result.sanitized);
        
        if (customValidation !== true) {
          result.valid = false;
          result.errors.push({
            type: 'custom_validation',
            details: customValidation
          });
        }
      } catch (error) {
        logger.error(`Custom validation error for endpoint ${endpoint}:`, error);
        result.valid = false;
        result.errors.push({
          type: 'validation_error',
          message: error.message
        });
      }
    }

    return result;
  }

  /**
   * Create an Express middleware for validating requests
   * @param {string} endpoint - API endpoint path
   * @returns {Function} - Express middleware function
   */
  createValidationMiddleware(endpoint) {
    return (req, res, next) => {
      const validation = this.validate(endpoint, req.body);
      
      if (!validation.valid) {
        return res.status(400).json({
          error: 'Validation failed',
          details: validation.errors
        });
      }
      
      // Replace request body with sanitized data
      req.body = validation.sanitized;
      next();
    };
  }
}

module.exports = new ApiValidationService();