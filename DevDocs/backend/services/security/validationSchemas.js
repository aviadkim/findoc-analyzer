/**
 * API Validation Schemas
 * 
 * Contains JSON schemas for validating API requests.
 * These schemas define the expected structure and data types for request payloads.
 */

// Common definitions that can be reused across schemas
const definitions = {
  // Pagination parameters
  pagination: {
    type: 'object',
    properties: {
      page: { type: 'integer', minimum: 1, default: 1 },
      limit: { type: 'integer', minimum: 1, maximum: 100, default: 20 }
    },
    additionalProperties: false
  },
  
  // User information
  userInfo: {
    type: 'object',
    required: ['email'],
    properties: {
      email: { type: 'string', format: 'email', maxLength: 255 },
      name: { type: 'string', maxLength: 100 },
      role: { type: 'string', enum: ['user', 'admin', 'analyst'] }
    },
    additionalProperties: false
  },
  
  // Document metadata
  documentMetadata: {
    type: 'object',
    properties: {
      title: { type: 'string', maxLength: 200 },
      description: { type: 'string', maxLength: 1000 },
      tags: { 
        type: 'array', 
        items: { type: 'string', maxLength: 50 },
        maxItems: 10
      },
      source: { type: 'string', maxLength: 100 },
      documentDate: { type: 'string', format: 'date' }
    },
    additionalProperties: false
  }
};

// Schema for document upload requests
const documentUploadSchema = {
  type: 'object',
  required: ['metadata'],
  properties: {
    metadata: {
      type: 'object',
      required: ['title'],
      properties: {
        title: { type: 'string', minLength: 1, maxLength: 200 },
        description: { type: 'string', maxLength: 1000 },
        tags: { 
          type: 'array', 
          items: { type: 'string', maxLength: 50 },
          maxItems: 10
        },
        documentDate: { type: 'string', format: 'date' },
        documentType: { 
          type: 'string', 
          enum: ['financial_statement', 'portfolio', 'investment_report', 'other'] 
        },
        source: { type: 'string', maxLength: 100 },
        isPublic: { type: 'boolean', default: false }
      },
      additionalProperties: false
    },
    processingOptions: {
      type: 'object',
      properties: {
        extractTables: { type: 'boolean', default: true },
        performOcr: { type: 'boolean', default: false },
        detectLanguage: { type: 'boolean', default: true },
        extractEntities: { type: 'boolean', default: true },
        priority: { type: 'string', enum: ['low', 'normal', 'high'], default: 'normal' }
      },
      additionalProperties: false
    }
  },
  additionalProperties: false
};

// Schema for document query requests
const documentQuerySchema = {
  type: 'object',
  required: ['query'],
  properties: {
    query: { type: 'string', minLength: 1, maxLength: 1000 },
    documentId: { type: 'string', pattern: '^[a-zA-Z0-9-]+$' },
    options: {
      type: 'object',
      properties: {
        maxResults: { type: 'integer', minimum: 1, maximum: 50, default: 10 },
        includeMetadata: { type: 'boolean', default: true },
        searchStrategy: { 
          type: 'string', 
          enum: ['semantic', 'keyword', 'hybrid'], 
          default: 'hybrid' 
        }
      },
      additionalProperties: false
    }
  },
  additionalProperties: false
};

// Schema for document comparison requests
const documentComparisonSchema = {
  type: 'object',
  required: ['documentIds'],
  properties: {
    documentIds: { 
      type: 'array', 
      items: { type: 'string', pattern: '^[a-zA-Z0-9-]+$' },
      minItems: 2,
      maxItems: 5,
      uniqueItems: true
    },
    comparisonType: { 
      type: 'string', 
      enum: ['holdings', 'performance', 'allocation', 'complete'],
      default: 'complete'
    },
    options: {
      type: 'object',
      properties: {
        includeCharts: { type: 'boolean', default: true },
        normalizeDates: { type: 'boolean', default: true },
        includeMetadata: { type: 'boolean', default: true }
      },
      additionalProperties: false
    }
  },
  additionalProperties: false
};

// Schema for user authentication
const authenticationSchema = {
  type: 'object',
  required: ['email', 'password'],
  properties: {
    email: { type: 'string', format: 'email', maxLength: 255 },
    password: { type: 'string', minLength: 8, maxLength: 100 },
    rememberMe: { type: 'boolean', default: false }
  },
  additionalProperties: false
};

// Schema for user registration
const registrationSchema = {
  type: 'object',
  required: ['email', 'password', 'name'],
  properties: {
    email: { type: 'string', format: 'email', maxLength: 255 },
    password: { 
      type: 'string', 
      minLength: 8, 
      maxLength: 100,
      pattern: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)[a-zA-Z\\d@$!%*?&]{8,}$' // Require at least 1 uppercase, 1 lowercase, 1 number
    },
    name: { type: 'string', minLength: 1, maxLength: 100 },
    organization: { type: 'string', maxLength: 100 },
    role: { type: 'string', enum: ['user', 'analyst'], default: 'user' }
  },
  additionalProperties: false
};

// Schema for data export requests
const dataExportSchema = {
  type: 'object',
  required: ['documentId', 'exportFormat'],
  properties: {
    documentId: { type: 'string', pattern: '^[a-zA-Z0-9-]+$' },
    exportFormat: { 
      type: 'string', 
      enum: ['json', 'csv', 'xlsx', 'pdf'] 
    },
    sections: { 
      type: 'array', 
      items: { 
        type: 'string', 
        enum: ['metadata', 'securities', 'summary', 'tables', 'text', 'all'] 
      },
      default: ['all']
    },
    options: {
      type: 'object',
      properties: {
        includeCharts: { type: 'boolean', default: false },
        includeTechnicalData: { type: 'boolean', default: false },
        normalizeData: { type: 'boolean', default: true }
      },
      additionalProperties: false
    }
  },
  additionalProperties: false
};

// Schema for portfolio analysis requests
const portfolioAnalysisSchema = {
  type: 'object',
  required: ['documentId'],
  properties: {
    documentId: { type: 'string', pattern: '^[a-zA-Z0-9-]+$' },
    analysisType: { 
      type: 'array', 
      items: { 
        type: 'string', 
        enum: [
          'asset_allocation', 
          'sector_breakdown', 
          'risk_metrics', 
          'performance', 
          'esg_analysis',
          'geographic_exposure',
          'currency_exposure',
          'complete'
        ] 
      },
      default: ['complete']
    },
    options: {
      type: 'object',
      properties: {
        benchmarkIndex: { type: 'string', maxLength: 50 },
        timeframe: { 
          type: 'string', 
          enum: ['1m', '3m', '6m', '1y', '3y', '5y', 'ytd', 'all'],
          default: 'all'
        },
        includeCharts: { type: 'boolean', default: true },
        includePredictions: { type: 'boolean', default: false }
      },
      additionalProperties: false
    }
  },
  additionalProperties: false
};

// Export all schemas
module.exports = {
  definitions,
  documentUploadSchema,
  documentQuerySchema,
  documentComparisonSchema,
  authenticationSchema,
  registrationSchema,
  dataExportSchema,
  portfolioAnalysisSchema
};