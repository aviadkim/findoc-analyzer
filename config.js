/**
 * FinDoc Analyzer Configuration
 */

module.exports = {
  // Application settings
  app: {
    port: process.env.PORT || 8080,
    environment: process.env.NODE_ENV || 'development',
    baseUrl: process.env.BASE_URL || 'http://localhost:8080'
  },

  // Authentication settings
  jwt: {
    secret: process.env.JWT_SECRET || 'finDoc!Secret@Key#2025',
    expiresIn: '24h'
  },

  // Database settings
  database: {
    uri: process.env.DATABASE_URI || 'sqlite:./database.sqlite',
    options: {
      logging: process.env.DB_LOGGING === 'true'
    }
  },

  // Google OAuth settings
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    redirectUri: process.env.GOOGLE_REDIRECT_URI || 'http://localhost:8080/auth/google/callback'
  },

  // File upload settings
  uploads: {
    directory: process.env.UPLOAD_DIR || './uploads',
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '50') * 1024 * 1024, // 50MB default
    allowedTypes: ['application/pdf', 'application/vnd.ms-excel', 
                  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 
                  'text/csv']
  },

  // Document processing settings
  processing: {
    timeout: parseInt(process.env.PROCESSING_TIMEOUT || '300') * 1000, // 5 minutes default
    tempDir: process.env.TEMP_DIR || './temp',
    resultsDir: process.env.RESULTS_DIR || './results'
  },

  // Docling API settings
  docling: {
    apiKey: process.env.DOCLING_API_KEY || 'test_docling_api_key',
    baseUrl: process.env.DOCLING_API_URL || 'https://api.docling.ai',
    timeout: parseInt(process.env.DOCLING_TIMEOUT || '60') * 1000 // 60 seconds default
  },

  // Analytics settings
  analytics: {
    chartColors: [
      '#3498db', '#2ecc71', '#f39c12', '#e74c3c', '#9b59b6',
      '#1abc9c', '#d35400', '#34495e', '#c0392b', '#16a085'
    ],
    defaultChartType: 'pie',
    defaultTimeRange: '1y' // 1 year
  },

  // Chat settings
  chat: {
    maxHistory: parseInt(process.env.CHAT_MAX_HISTORY || '50'),
    modelName: process.env.CHAT_MODEL_NAME || 'gpt-4',
    apiKey: process.env.OPENAI_API_KEY
  },

  // External API settings
  externalApis: {
    financialData: {
      baseUrl: process.env.FINANCIAL_API_URL || 'https://api.example.com/financial',
      apiKey: process.env.FINANCIAL_API_KEY
    }
  }
};
