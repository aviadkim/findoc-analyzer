/**
 * Validation Middleware
 * 
 * Middleware for validating API requests.
 * Uses the API validation service to validate request bodies.
 */

const apiValidation = require('../services/security/apiValidation');
const { logger } = require('../utils/logger');

/**
 * Validate request body against a registered schema
 * @param {string} endpoint - API endpoint path
 * @returns {Function} - Express middleware function
 */
function validateRequestBody(endpoint) {
  return (req, res, next) => {
    try {
      // Validate request body
      const validation = apiValidation.validate(endpoint, req.body);
      
      if (!validation.valid) {
        logger.warn(`Request validation failed for ${endpoint}:`, validation.errors);
        
        return res.status(400).json({
          success: false,
          errors: validation.errors,
          message: 'Validation failed'
        });
      }
      
      // Replace request body with sanitized data
      req.body = validation.sanitized;
      next();
    } catch (error) {
      logger.error(`Request validation error for ${endpoint}:`, error);
      
      res.status(500).json({
        success: false,
        error: 'Validation system error',
        message: error.message
      });
    }
  };
}

/**
 * Validate query parameters against a schema
 * @param {Object} schema - Query parameter schema
 * @returns {Function} - Express middleware function
 */
function validateQueryParams(schema) {
  return (req, res, next) => {
    try {
      // Extract query parameters
      const queryParams = { ...req.query };
      
      // Create validator function
      const validate = (params, schema) => {
        // Check required parameters
        if (schema.required) {
          for (const param of schema.required) {
            if (params[param] === undefined) {
              return {
                valid: false,
                error: `Missing required query parameter: ${param}`
              };
            }
          }
        }
        
        // Validate parameters against schema
        if (schema.properties) {
          for (const [param, definition] of Object.entries(schema.properties)) {
            const value = params[param];
            
            // Skip undefined optional parameters
            if (value === undefined) {
              continue;
            }
            
            // Type validation
            switch (definition.type) {
              case 'integer':
              case 'number':
                const numValue = Number(value);
                
                if (isNaN(numValue)) {
                  return {
                    valid: false,
                    error: `Parameter ${param} must be a number`
                  };
                }
                
                if (definition.type === 'integer' && !Number.isInteger(numValue)) {
                  return {
                    valid: false,
                    error: `Parameter ${param} must be an integer`
                  };
                }
                
                if (definition.minimum !== undefined && numValue < definition.minimum) {
                  return {
                    valid: false,
                    error: `Parameter ${param} must be at least ${definition.minimum}`
                  };
                }
                
                if (definition.maximum !== undefined && numValue > definition.maximum) {
                  return {
                    valid: false,
                    error: `Parameter ${param} must be at most ${definition.maximum}`
                  };
                }
                
                // Convert to number
                params[param] = numValue;
                break;
                
              case 'boolean':
                if (value === 'true' || value === '1' || value === 'yes') {
                  params[param] = true;
                } else if (value === 'false' || value === '0' || value === 'no') {
                  params[param] = false;
                } else {
                  return {
                    valid: false,
                    error: `Parameter ${param} must be a boolean value`
                  };
                }
                break;
                
              case 'string':
                if (definition.enum && !definition.enum.includes(value)) {
                  return {
                    valid: false,
                    error: `Parameter ${param} must be one of: ${definition.enum.join(', ')}`
                  };
                }
                
                if (definition.minLength && value.length < definition.minLength) {
                  return {
                    valid: false,
                    error: `Parameter ${param} must be at least ${definition.minLength} characters`
                  };
                }
                
                if (definition.maxLength && value.length > definition.maxLength) {
                  return {
                    valid: false,
                    error: `Parameter ${param} must be at most ${definition.maxLength} characters`
                  };
                }
                
                if (definition.pattern) {
                  const regex = new RegExp(definition.pattern);
                  if (!regex.test(value)) {
                    return {
                      valid: false,
                      error: `Parameter ${param} has an invalid format`
                    };
                  }
                }
                break;
                
              case 'array':
                let arrayValue;
                try {
                  // Try to parse as JSON
                  arrayValue = JSON.parse(value);
                } catch (e) {
                  // If not JSON, split by comma
                  arrayValue = value.split(',');
                }
                
                if (!Array.isArray(arrayValue)) {
                  return {
                    valid: false,
                    error: `Parameter ${param} must be an array`
                  };
                }
                
                params[param] = arrayValue;
                break;
                
              case 'object':
                let objectValue;
                try {
                  objectValue = JSON.parse(value);
                } catch (e) {
                  return {
                    valid: false,
                    error: `Parameter ${param} must be a valid JSON object`
                  };
                }
                
                if (typeof objectValue !== 'object' || Array.isArray(objectValue)) {
                  return {
                    valid: false,
                    error: `Parameter ${param} must be an object`
                  };
                }
                
                params[param] = objectValue;
                break;
            }
          }
        }
        
        return { valid: true, params };
      };
      
      // Validate query parameters
      const result = validate(queryParams, schema);
      
      if (!result.valid) {
        return res.status(400).json({
          success: false,
          error: result.error
        });
      }
      
      // Replace query parameters with validated values
      req.query = result.params;
      next();
    } catch (error) {
      logger.error('Query parameter validation error:', error);
      
      res.status(500).json({
        success: false,
        error: 'Validation system error',
        message: error.message
      });
    }
  };
}

/**
 * Validate path parameters against a schema
 * @param {Object} schema - Path parameter schema
 * @returns {Function} - Express middleware function
 */
function validatePathParams(schema) {
  return (req, res, next) => {
    try {
      // Extract path parameters
      const pathParams = { ...req.params };
      
      // Validate each parameter against schema
      for (const [param, definition] of Object.entries(schema)) {
        const value = pathParams[param];
        
        // Check required parameters
        if (value === undefined) {
          return res.status(400).json({
            success: false,
            error: `Missing required path parameter: ${param}`
          });
        }
        
        // Validate based on type
        switch (definition.type) {
          case 'integer':
            const numValue = parseInt(value, 10);
            
            if (isNaN(numValue)) {
              return res.status(400).json({
                success: false,
                error: `Path parameter ${param} must be an integer`
              });
            }
            
            // Apply min/max constraints
            if (definition.minimum !== undefined && numValue < definition.minimum) {
              return res.status(400).json({
                success: false,
                error: `Path parameter ${param} must be at least ${definition.minimum}`
              });
            }
            
            if (definition.maximum !== undefined && numValue > definition.maximum) {
              return res.status(400).json({
                success: false,
                error: `Path parameter ${param} must be at most ${definition.maximum}`
              });
            }
            
            // Replace with parsed value
            req.params[param] = numValue;
            break;
            
          case 'string':
            // Validate against pattern if specified
            if (definition.pattern) {
              const regex = new RegExp(definition.pattern);
              if (!regex.test(value)) {
                return res.status(400).json({
                  success: false,
                  error: `Path parameter ${param} has an invalid format`
                });
              }
            }
            
            // Validate against enum if specified
            if (definition.enum && !definition.enum.includes(value)) {
              return res.status(400).json({
                success: false,
                error: `Path parameter ${param} must be one of: ${definition.enum.join(', ')}`
              });
            }
            break;
            
          default:
            logger.warn(`Unsupported type ${definition.type} for path parameter ${param}`);
        }
      }
      
      next();
    } catch (error) {
      logger.error('Path parameter validation error:', error);
      
      res.status(500).json({
        success: false,
        error: 'Validation system error',
        message: error.message
      });
    }
  };
}

module.exports = {
  validateRequestBody,
  validateQueryParams,
  validatePathParams
};