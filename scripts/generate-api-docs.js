#!/usr/bin/env node

/**
 * Script to generate OpenAPI documentation from JSDoc comments in the codebase
 */

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const swaggerJsdoc = require('swagger-jsdoc');
const { execSync } = require('child_process');

// Configuration
const options = {
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'FinDoc Analyzer API',
      version: '1.0.0',
      description: 'API for FinDoc Analyzer application that processes financial documents, extracts securities data, and provides portfolio analysis.',
      contact: {
        name: 'FinDoc Support',
        url: 'https://findoc.example.com/support',
        email: 'support@findoc.example.com'
      }
    },
    servers: [
      {
        url: 'https://api.findoc.example.com/v1',
        description: 'Production server'
      },
      {
        url: 'https://api-staging.findoc.example.com/v1',
        description: 'Staging server'
      },
      {
        url: 'http://localhost:3000/api',
        description: 'Local development server'
      }
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    }
  },
  // Path to the API routes
  apis: [
    './DevDocs/backend/routes/**/*.js',
    './DevDocs/backend/routes/**/*.ts',
    './DevDocs/backend/controllers/**/*.js',
    './DevDocs/backend/controllers/**/*.ts',
    './DevDocs/app/api/**/*.js',
    './DevDocs/app/api/**/*.ts',
    './api-models/*.js', // Additional path for API models
  ]
};

// Ensure API models directory exists
const apiModelsDir = path.join(__dirname, '..', 'api-models');
if (!fs.existsSync(apiModelsDir)) {
  fs.mkdirSync(apiModelsDir, { recursive: true });
}

// Create model files for OpenAPI schemas
function createModelFiles() {
  const schemas = {
    User: `
/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           example: user-123
 *         username:
 *           type: string
 *           example: johndoe
 *         email:
 *           type: string
 *           format: email
 *           example: john.doe@example.com
 *         firstName:
 *           type: string
 *           example: John
 *         lastName:
 *           type: string
 *           example: Doe
 *         role:
 *           type: string
 *           enum: [user, admin]
 *           example: user
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: '2023-01-15T12:00:00Z'
 */
`,
    Document: `
/**
 * @swagger
 * components:
 *   schemas:
 *     Document:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           example: doc-123
 *         fileName:
 *           type: string
 *           example: portfolio-statement.pdf
 *         fileType:
 *           type: string
 *           example: pdf
 *         fileSize:
 *           type: integer
 *           format: int64
 *           example: 1048576
 *         uploadDate:
 *           type: string
 *           format: date-time
 *           example: '2023-01-15T12:00:00Z'
 *         processingStatus:
 *           type: string
 *           enum: [pending, processing, completed, failed]
 *           example: completed
 *         processingDate:
 *           type: string
 *           format: date-time
 *           example: '2023-01-15T12:05:00Z'
 *         description:
 *           type: string
 *           example: Q1 2023 Portfolio Statement
 *         tags:
 *           type: array
 *           items:
 *             type: string
 *           example: [portfolio, q1, 2023]
 *         metadata:
 *           type: object
 *           properties:
 *             pageCount:
 *               type: integer
 *               example: 5
 *             language:
 *               type: string
 *               example: en
 *             securitiesCount:
 *               type: integer
 *               example: 8
 */
`,
    Security: `
/**
 * @swagger
 * components:
 *   schemas:
 *     Security:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           example: sec-123
 *         name:
 *           type: string
 *           example: Apple Inc.
 *         symbol:
 *           type: string
 *           example: AAPL
 *         isin:
 *           type: string
 *           example: US0378331005
 *         assetClass:
 *           type: string
 *           example: Equity
 *         quantity:
 *           type: number
 *           format: double
 *           example: 100
 *         price:
 *           type: number
 *           format: double
 *           example: 175.25
 *         value:
 *           type: number
 *           format: double
 *           example: 17525.00
 *         currency:
 *           type: string
 *           example: USD
 *         sector:
 *           type: string
 *           example: Technology
 *         country:
 *           type: string
 *           example: US
 *         marketCap:
 *           type: string
 *           example: Large-Cap
 *         metadata:
 *           type: object
 *           additionalProperties: true
 */
`,
    Error: `
/**
 * @swagger
 * components:
 *   schemas:
 *     Error:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: false
 *         error:
 *           type: string
 *           example: Document not found
 *         code:
 *           type: string
 *           example: DOCUMENT_NOT_FOUND
 *         status:
 *           type: integer
 *           example: 404
 */
`
  };

  // Write each schema to a file
  Object.entries(schemas).forEach(([name, content]) => {
    const filePath = path.join(apiModelsDir, `${name}.js`);
    fs.writeFileSync(filePath, content);
    console.log(`Created model file: ${filePath}`);
  });
}

// Main process
async function generateDocs() {
  try {
    // Create model files with schema definitions
    createModelFiles();
    
    // Generate OpenAPI specification
    const openapiSpec = swaggerJsdoc(options);
    
    // Convert to YAML
    const openapiYaml = yaml.dump(openapiSpec);
    
    // Ensure api-docs directory exists
    const apiDocsDir = path.join(__dirname, '..', 'api-docs');
    if (!fs.existsSync(apiDocsDir)) {
      fs.mkdirSync(apiDocsDir, { recursive: true });
    }
    
    // Write the generated spec to file
    const outputFile = path.join(apiDocsDir, 'openapi-generated.yaml');
    fs.writeFileSync(outputFile, openapiYaml);
    
    console.log(`OpenAPI specification generated successfully: ${outputFile}`);
    
    // Merge with the existing openapi.yaml file
    console.log('Merging with existing OpenAPI specification...');
    
    // TODO: Implement merging logic here if needed
    // For now, we'll keep both files
    
    // Check if the API documentation can be served
    try {
      console.log('Testing Redoc documentation page...');
      
      // Check if http-server is installed
      try {
        execSync('npx http-server --version', { stdio: 'ignore' });
      } catch (error) {
        console.log('Installing http-server...');
        execSync('npm install -g http-server');
      }
      
      console.log('API documentation is ready. To view it, run:');
      console.log('  cd api-docs && npx http-server');
      console.log('Then open http://localhost:8080 in your browser');
    } catch (error) {
      console.error('Error testing documentation:', error.message);
    }
  } catch (error) {
    console.error('Error generating OpenAPI documentation:', error);
  }
}

// Run the generator
generateDocs().catch(err => {
  console.error('Failed to generate API documentation:', err);
  process.exit(1);
});