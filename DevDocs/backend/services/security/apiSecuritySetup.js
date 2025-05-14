/**
 * API Security Setup
 * 
 * Sets up API validation and security for application routes.
 * This file registers validation schemas, sanitization rules,
 * and payload limits for API endpoints.
 */

const apiValidation = require('./apiValidation');
const validationSchemas = require('./validationSchemas');
const { logger } = require('../../utils/logger');

/**
 * Register all API endpoint validations
 */
function setupApiValidation() {
  logger.info('Setting up API validation service...');
  
  // Register schemas for document-related endpoints
  apiValidation.registerSchema('/api/documents/upload', validationSchemas.documentUploadSchema);
  apiValidation.registerSchema('/api/documents/query', validationSchemas.documentQuerySchema);
  apiValidation.registerSchema('/api/documents/compare', validationSchemas.documentComparisonSchema);
  
  // Register schemas for authentication endpoints
  apiValidation.registerSchema('/api/auth/login', validationSchemas.authenticationSchema);
  apiValidation.registerSchema('/api/auth/register', validationSchemas.registrationSchema);
  
  // Register schemas for data export endpoints
  apiValidation.registerSchema('/api/export/document', validationSchemas.dataExportSchema);
  
  // Register schemas for portfolio analysis endpoints
  apiValidation.registerSchema('/api/financial/analyze', validationSchemas.portfolioAnalysisSchema);
  
  // Set payload limits for file upload endpoints
  apiValidation.setPayloadLimit('/api/documents/upload', 10 * 1024 * 1024); // 10MB
  apiValidation.setPayloadLimit('/api/import/batch', 20 * 1024 * 1024); // 20MB
  
  // Standard endpoints
  apiValidation.setPayloadLimit('/api/documents/query', 100 * 1024); // 100KB
  apiValidation.setPayloadLimit('/api/financial/analyze', 500 * 1024); // 500KB
  apiValidation.setPayloadLimit('/api/export/document', 100 * 1024); // 100KB
  
  // Security-sensitive endpoints
  apiValidation.setPayloadLimit('/api/auth/login', 10 * 1024); // 10KB
  apiValidation.setPayloadLimit('/api/auth/register', 20 * 1024); // 20KB
  apiValidation.setPayloadLimit('/api/user/update', 50 * 1024); // 50KB
  
  // Register custom validation rules
  setupCustomValidationRules();
  
  // Register field-specific sanitization rules
  setupSanitizationRules();
  
  logger.info('API validation service setup complete');
}

/**
 * Setup custom validation rules for specific endpoints
 */
function setupCustomValidationRules() {
  // Custom validation for document uploads
  apiValidation.registerValidationRule('/api/documents/upload', (data) => {
    // Ensure metadata.title doesn't contain suspicious patterns
    if (data.metadata && data.metadata.title) {
      const title = data.metadata.title;
      const suspiciousPatterns = [
        /<script>/i,
        /javascript:/i,
        /eval\(/i,
        /document\.cookie/i
      ];
      
      for (const pattern of suspiciousPatterns) {
        if (pattern.test(title)) {
          return {
            field: 'metadata.title',
            message: 'Title contains potentially unsafe content'
          };
        }
      }
    }
    
    return true;
  });
  
  // Custom validation for financial analysis
  apiValidation.registerValidationRule('/api/financial/analyze', (data) => {
    // Validate document ID format
    if (!/^[a-zA-Z0-9-]+$/.test(data.documentId)) {
      return {
        field: 'documentId',
        message: 'Invalid document ID format'
      };
    }
    
    // If analysis options include predictions, ensure timeframe is valid
    if (data.options && data.options.includePredictions === true) {
      const validTimeframes = ['1m', '3m', '6m', '1y', '3y', '5y'];
      if (!validTimeframes.includes(data.options.timeframe)) {
        return {
          field: 'options.timeframe',
          message: 'Predictions require a specific timeframe (1m, 3m, 6m, 1y, 3y, 5y)'
        };
      }
    }
    
    return true;
  });
  
  // Custom validation for data export
  apiValidation.registerValidationRule('/api/export/document', (data) => {
    // Validate export format based on selected sections
    if (data.sections && data.sections.includes('charts')) {
      if (data.exportFormat === 'csv') {
        return {
          field: 'exportFormat',
          message: 'CSV format does not support chart exports. Use PDF or XLSX instead.'
        };
      }
    }
    
    return true;
  });
}

/**
 * Setup sanitization rules for specific fields
 */
function setupSanitizationRules() {
  // HTML content in document descriptions
  apiValidation.registerSanitizationRule('metadata.description', {
    type: 'html',
    options: {
      allowedTags: ['b', 'i', 'em', 'strong', 'p', 'br', 'ul', 'ol', 'li'],
      allowedAttributes: {}, // No attributes allowed
      textFilter: function(text) {
        return text.replace(/&nbsp;/g, ' ');
      }
    }
  });
  
  // Stricter sanitization for document titles
  apiValidation.registerSanitizationRule('metadata.title', {
    type: 'string',
    maxLength: 200,
    pattern: /^[a-zA-Z0-9\s\-_.,():;]+$/
  });
  
  // Sanitization for email addresses
  apiValidation.registerSanitizationRule('*.email', {
    type: 'email',
    pattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
  });
  
  // Sanitization for tags
  apiValidation.registerSanitizationRule('metadata.tags.*', {
    type: 'string',
    maxLength: 50,
    pattern: /^[a-zA-Z0-9\s\-_]+$/
  });
}

/**
 * Create validation middleware for Express routes
 * @param {Object} app - Express application
 */
function setupValidationMiddleware(app) {
  // Set up the API validation service
  setupApiValidation();
  
  // Document endpoints
  app.use('/api/documents/upload', apiValidation.createValidationMiddleware('/api/documents/upload'));
  app.use('/api/documents/query', apiValidation.createValidationMiddleware('/api/documents/query'));
  app.use('/api/documents/compare', apiValidation.createValidationMiddleware('/api/documents/compare'));
  
  // Authentication endpoints
  app.use('/api/auth/login', apiValidation.createValidationMiddleware('/api/auth/login'));
  app.use('/api/auth/register', apiValidation.createValidationMiddleware('/api/auth/register'));
  
  // Export endpoints
  app.use('/api/export/document', apiValidation.createValidationMiddleware('/api/export/document'));
  
  // Financial analysis endpoints
  app.use('/api/financial/analyze', apiValidation.createValidationMiddleware('/api/financial/analyze'));
  
  logger.info('API validation middleware setup complete');
}

module.exports = {
  setupApiValidation,
  setupValidationMiddleware
};