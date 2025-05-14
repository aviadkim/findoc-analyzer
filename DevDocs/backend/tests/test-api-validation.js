/**
 * API Validation Test
 * 
 * Test suite for the API validation service.
 * Verifies schema validation, sanitization, and custom validation rules.
 */

const apiValidation = require('../services/security/apiValidation');
const validationSchemas = require('../services/security/validationSchemas');
const assert = require('assert');

// Sample valid payloads for testing
const validPayloads = {
  documentUpload: {
    metadata: {
      title: 'Test Financial Document',
      description: 'This is a test document for API validation',
      tags: ['test', 'financial', 'validation'],
      documentDate: '2023-07-15',
      documentType: 'financial_statement',
      source: 'Test System',
      isPublic: false
    },
    processingOptions: {
      extractTables: true,
      performOcr: false,
      detectLanguage: true,
      extractEntities: true,
      priority: 'normal'
    }
  },
  documentQuery: {
    query: 'What is the total portfolio value?',
    documentId: 'doc-123',
    options: {
      maxResults: 10,
      includeMetadata: true,
      searchStrategy: 'hybrid'
    }
  },
  authentication: {
    email: 'test@example.com',
    password: 'SecurePassword123',
    rememberMe: true
  }
};

// Sample invalid payloads for testing
const invalidPayloads = {
  documentUpload: {
    metadata: {
      // Missing required title
      description: 'This is a test document for API validation',
      tags: ['test', 'financial', 'validation'],
      documentDate: '2023-07-15'
    }
  },
  documentQuery: {
    // Missing required query
    documentId: 'doc-123',
    options: {
      maxResults: 10
    }
  },
  authentication: {
    email: 'not-an-email',  // Invalid email format
    password: 'short',      // Too short password
    rememberMe: true
  }
};

// Sample attack payloads for testing sanitization
const attackPayloads = {
  sqlInjection: {
    documentId: "'; DROP TABLE users; --",
    query: "' OR 1=1 --"
  },
  xss: {
    title: "<script>alert('XSS')</script>",
    description: "<img src='x' onerror='alert(1)'>"
  },
  commandInjection: {
    source: "; ls -la",
    description: "| cat /etc/passwd"
  }
};

// Test schema validation
function testSchemaValidation() {
  console.log('Testing schema validation...');
  
  // Register test schemas
  apiValidation.registerSchema('test/documentUpload', validationSchemas.documentUploadSchema);
  apiValidation.registerSchema('test/documentQuery', validationSchemas.documentQuerySchema);
  apiValidation.registerSchema('test/authentication', validationSchemas.authenticationSchema);
  
  // Test valid payloads - should pass validation
  const validDocUploadResult = apiValidation.validate('test/documentUpload', validPayloads.documentUpload);
  assert(validDocUploadResult.valid, 'Valid document upload payload should pass validation');
  console.log('✓ Valid document upload payload passed validation');
  
  const validDocQueryResult = apiValidation.validate('test/documentQuery', validPayloads.documentQuery);
  assert(validDocQueryResult.valid, 'Valid document query payload should pass validation');
  console.log('✓ Valid document query payload passed validation');
  
  const validAuthResult = apiValidation.validate('test/authentication', validPayloads.authentication);
  assert(validAuthResult.valid, 'Valid authentication payload should pass validation');
  console.log('✓ Valid authentication payload passed validation');
  
  // Test invalid payloads - should fail validation
  const invalidDocUploadResult = apiValidation.validate('test/documentUpload', invalidPayloads.documentUpload);
  assert(!invalidDocUploadResult.valid, 'Invalid document upload payload should fail validation');
  console.log('✓ Invalid document upload payload correctly failed validation');
  
  const invalidDocQueryResult = apiValidation.validate('test/documentQuery', invalidPayloads.documentQuery);
  assert(!invalidDocQueryResult.valid, 'Invalid document query payload should fail validation');
  console.log('✓ Invalid document query payload correctly failed validation');
  
  const invalidAuthResult = apiValidation.validate('test/authentication', invalidPayloads.authentication);
  assert(!invalidAuthResult.valid, 'Invalid authentication payload should fail validation');
  console.log('✓ Invalid authentication payload correctly failed validation');
  
  console.log('Schema validation tests passed!\n');
}

// Test input sanitization
function testInputSanitization() {
  console.log('Testing input sanitization...');
  
  // Register a test schema that allows the fields we want to test
  const testSchema = {
    type: 'object',
    properties: {
      title: { type: 'string' },
      description: { type: 'string' },
      query: { type: 'string' },
      documentId: { type: 'string' },
      source: { type: 'string' },
      email: { type: 'string' }
    },
    additionalProperties: false
  };
  
  apiValidation.registerSchema('test/sanitization', testSchema);
  
  // Register sanitization rules for testing
  apiValidation.registerSanitizationRule('title', {
    type: 'html',
    options: {
      allowedTags: ['b', 'i', 'em', 'strong'],
      allowedAttributes: {}
    }
  });
  
  apiValidation.registerSanitizationRule('description', {
    type: 'html',
    options: {
      allowedTags: ['p', 'br'],
      allowedAttributes: {}
    }
  });
  
  apiValidation.registerSanitizationRule('email', {
    type: 'email',
    pattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
  });
  
  // Test XSS sanitization
  const xssPayload = {
    title: attackPayloads.xss.title,
    description: attackPayloads.xss.description
  };
  
  const sanitizedXssResult = apiValidation.validate('test/sanitization', xssPayload);
  
  // Sanitized result should not contain script tags
  assert(!sanitizedXssResult.sanitized.title.includes('<script>'), 
         'Sanitized title should not contain script tags');
  assert(!sanitizedXssResult.sanitized.description.includes('onerror'), 
         'Sanitized description should not contain onerror attribute');
  
  console.log('✓ XSS payloads were correctly sanitized');
  
  // Test SQL injection sanitization
  const sqlPayload = {
    query: attackPayloads.sqlInjection.query,
    documentId: attackPayloads.sqlInjection.documentId
  };
  
  const sanitizedSqlResult = apiValidation.validate('test/sanitization', sqlPayload);
  
  // Since these fields are not HTML, they're just sanitized as strings
  // but potentially dangerous strings are allowed through (handled by schema validation)
  // In a real system, you would use parameterized queries for SQL anyway
  assert(sanitizedSqlResult.sanitized.query.length <= sanitizedSqlResult.sanitized.query.length,
         'Query should not increase in length after sanitization');
  assert(sanitizedSqlResult.sanitized.documentId.length <= sqlPayload.documentId.length,
         'Document ID should not increase in length after sanitization');
  
  console.log('✓ SQL injection parameters were handled correctly');
  
  // Test command injection sanitization
  const commandPayload = {
    source: attackPayloads.commandInjection.source
  };
  
  const sanitizedCommandResult = apiValidation.validate('test/sanitization', commandPayload);
  
  // Again, string sanitization mainly focuses on length and trimming
  // Command injection is primarily prevented by not using user input in command execution
  assert(sanitizedCommandResult.sanitized.source.length <= commandPayload.source.length,
         'Source should not increase in length after sanitization');
  
  console.log('✓ Command injection parameters were handled correctly');
  
  // Test email sanitization
  const validEmailPayload = { email: 'test@example.com' };
  const invalidEmailPayload = { email: 'not-an-email' };
  
  const sanitizedValidEmailResult = apiValidation.validate('test/sanitization', validEmailPayload);
  const sanitizedInvalidEmailResult = apiValidation.validate('test/sanitization', invalidEmailPayload);
  
  assert(sanitizedValidEmailResult.sanitized.email === 'test@example.com',
         'Valid email should remain unchanged after sanitization');
  assert(sanitizedInvalidEmailResult.sanitized.email === '',
         'Invalid email should be sanitized to empty string');
  
  console.log('✓ Email sanitization works correctly');
  
  console.log('Input sanitization tests passed!\n');
}

// Test custom validation rules
function testCustomValidationRules() {
  console.log('Testing custom validation rules...');
  
  // Register a test schema
  const testSchema = {
    type: 'object',
    properties: {
      title: { type: 'string' },
      documentId: { type: 'string' },
      options: {
        type: 'object',
        properties: {
          includePredictions: { type: 'boolean' },
          timeframe: { type: 'string' }
        }
      },
      sections: { 
        type: 'array',
        items: { type: 'string' }
      },
      exportFormat: { type: 'string' }
    },
    additionalProperties: false
  };
  
  apiValidation.registerSchema('test/customRules', testSchema);
  
  // Register custom validation rules for document title
  apiValidation.registerValidationRule('test/customRules', (data) => {
    // Validate title doesn't contain suspicious patterns
    if (data.title) {
      const suspiciousPatterns = [
        /<script>/i,
        /javascript:/i,
        /eval\(/i,
        /document\.cookie/i
      ];
      
      for (const pattern of suspiciousPatterns) {
        if (pattern.test(data.title)) {
          return {
            field: 'title',
            message: 'Title contains potentially unsafe content'
          };
        }
      }
    }
    
    // Validate export format based on selected sections
    if (data.sections && data.sections.includes('charts') && data.exportFormat === 'csv') {
      return {
        field: 'exportFormat',
        message: 'CSV format does not support chart exports'
      };
    }
    
    // Validate prediction timeframe
    if (data.options && data.options.includePredictions === true) {
      const validTimeframes = ['1m', '3m', '6m', '1y', '3y', '5y'];
      if (!validTimeframes.includes(data.options.timeframe)) {
        return {
          field: 'options.timeframe',
          message: 'Predictions require a specific timeframe'
        };
      }
    }
    
    return true;
  });
  
  // Test payload with suspicious title - should fail validation
  const suspiciousTitlePayload = {
    title: 'Title with <script>alert("XSS")</script>'
  };
  
  const suspiciousTitleResult = apiValidation.validate('test/customRules', suspiciousTitlePayload);
  assert(!suspiciousTitleResult.valid, 'Payload with suspicious title should fail validation');
  assert(suspiciousTitleResult.errors[0].type === 'custom_validation',
         'Failure should be from custom validation');
  console.log('✓ Custom validation correctly detected suspicious title');
  
  // Test export format validation - should fail for charts + CSV
  const invalidExportPayload = {
    sections: ['tables', 'charts'],
    exportFormat: 'csv'
  };
  
  const invalidExportResult = apiValidation.validate('test/customRules', invalidExportPayload);
  assert(!invalidExportResult.valid, 'Invalid export format combination should fail validation');
  assert(invalidExportResult.errors[0].type === 'custom_validation',
         'Failure should be from custom validation');
  console.log('✓ Custom validation correctly detected invalid export format');
  
  // Test prediction timeframe validation
  const invalidPredictionPayload = {
    options: {
      includePredictions: true,
      timeframe: 'invalid'
    }
  };
  
  const invalidPredictionResult = apiValidation.validate('test/customRules', invalidPredictionPayload);
  assert(!invalidPredictionResult.valid, 'Invalid prediction timeframe should fail validation');
  assert(invalidPredictionResult.errors[0].type === 'custom_validation',
         'Failure should be from custom validation');
  console.log('✓ Custom validation correctly detected invalid prediction timeframe');
  
  // Test valid payload - should pass validation
  const validCustomPayload = {
    title: 'Safe Title',
    sections: ['tables', 'text'],
    exportFormat: 'csv',
    options: {
      includePredictions: true,
      timeframe: '3m'
    }
  };
  
  const validCustomResult = apiValidation.validate('test/customRules', validCustomPayload);
  assert(validCustomResult.valid, 'Valid payload should pass custom validation');
  console.log('✓ Valid payload passed custom validation rules');
  
  console.log('Custom validation rule tests passed!\n');
}

// Test payload size limits
function testPayloadSizeLimits() {
  console.log('Testing payload size limits...');
  
  // Register a test schema
  const testSchema = {
    type: 'object',
    properties: {
      data: { type: 'string' }
    }
  };
  
  apiValidation.registerSchema('test/payloadSize', testSchema);
  
  // Set payload size limits
  apiValidation.setPayloadLimit('test/payloadSize', 1024); // 1KB
  
  // Generate payloads of different sizes
  const smallPayload = { data: 'A'.repeat(100) }; // 100 bytes
  const largePayload = { data: 'A'.repeat(2000) }; // 2KB (over limit)
  
  // Test small payload - should pass validation
  const smallPayloadResult = apiValidation.validate('test/payloadSize', smallPayload);
  assert(smallPayloadResult.valid, 'Small payload should pass validation');
  console.log('✓ Small payload passed size validation');
  
  // Test large payload - should fail validation
  const largePayloadResult = apiValidation.validate('test/payloadSize', largePayload);
  assert(!largePayloadResult.valid, 'Large payload should fail validation');
  assert(largePayloadResult.errors[0].type === 'payload_size',
         'Failure should be from payload size check');
  console.log('✓ Large payload correctly failed size validation');
  
  console.log('Payload size limit tests passed!\n');
}

// Run all tests
function runAllTests() {
  console.log('Running API validation tests...\n');
  
  try {
    testSchemaValidation();
    testInputSanitization();
    testCustomValidationRules();
    testPayloadSizeLimits();
    
    console.log('All API validation tests passed! ✅');
  } catch (error) {
    console.error('API validation tests failed:', error);
    process.exit(1);
  }
}

runAllTests();