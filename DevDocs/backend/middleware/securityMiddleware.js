/**
 * Security Middleware
 * 
 * Provides security-related middleware for the application:
 * - CORS configuration
 * - Security headers (Helmet)
 * - Rate limiting
 * - Content Security Policy
 * - CSRF Protection
 * - Request Sanitization
 * - Additional Security Headers
 */

const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const expressSanitizer = require('express-sanitizer');
const csrf = require('csurf');
const logger = require('../utils/logger');
const { randomBytes } = require('crypto');

// CORS configuration with stricter settings
const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, etc.) only in development
    if (!origin) {
      return callback(null, process.env.NODE_ENV === 'development');
    }
    
    // Define allowed origins
    const allowedOrigins = [
      // Development origins
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:3002',
      
      // Production origins
      process.env.FRONTEND_URL,
      process.env.PRODUCTION_URL,
      'https://findoc-analyzer.web.app'
    ].filter(Boolean); // Remove undefined/null values
    
    // Check if the origin is allowed
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      logger.warn(`CORS blocked request from origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-CSRF-Token', 'X-API-Key'],
  credentials: true,
  maxAge: 86400, // 24 hours
  preflightContinue: false,
  optionsSuccessStatus: 204
};

// Rate limiting configurations
// General API rate limit
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many requests from this IP, please try again after 15 minutes',
  skip: (req) => process.env.NODE_ENV === 'development', // Skip rate limiting in development
  handler: (req, res) => {
    logger.warn(`Rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({
      status: 'error',
      message: 'Too many requests, please try again later'
    });
  }
});

// Stricter rate limit for authentication endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 login attempts per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many login attempts from this IP, please try again after 15 minutes',
  skipSuccessfulRequests: true, // Don't count successful logins
  handler: (req, res) => {
    logger.warn(`Auth rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({
      status: 'error',
      message: 'Too many login attempts, please try again after 15 minutes'
    });
  }
});

// Even stricter rate limit for password reset endpoints
const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 60 minutes
  max: 3, // Limit each IP to 3 password reset attempts per hour
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many password reset attempts from this IP, please try again after an hour',
  handler: (req, res) => {
    logger.warn(`Password reset rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({
      status: 'error',
      message: 'Too many password reset attempts, please try again after an hour'
    });
  }
});

// Generate a random nonce for CSP
function generateNonce(req, res, next) {
  res.locals.cspNonce = randomBytes(16).toString('base64');
  next();
}

// Enhanced Content Security Policy configuration
const getCSPOptions = (nonce) => ({
  directives: {
    defaultSrc: ["'self'"],
    // Replace unsafe-inline with nonce when possible
    scriptSrc: [
      "'self'", 
      `'nonce-${nonce}'`,
      // Only use unsafe-eval in development
      ...(process.env.NODE_ENV === 'development' ? ["'unsafe-eval'"] : [])
    ],
    // Try to limit unsafe-inline in styles when possible
    styleSrc: [
      "'self'", 
      "'unsafe-inline'", // Still needed for many UI frameworks
      'https://fonts.googleapis.com'
    ],
    fontSrc: ["'self'", 'https://fonts.gstatic.com'],
    imgSrc: ["'self'", 'data:', 'blob:'],
    // Be more specific with connect-src
    connectSrc: [
      "'self'", 
      process.env.SUPABASE_URL, 
      'https://api.openrouter.ai'
    ],
    frameSrc: ["'self'"],
    objectSrc: ["'none'"],
    baseUri: ["'self'"],
    formAction: ["'self'"],
    frameAncestors: ["'self'"],
    manifestSrc: ["'self'"],
    workerSrc: ["'self'", 'blob:'],
    // Upgrade insecure requests in production
    ...(process.env.NODE_ENV === 'production' ? { upgradeInsecureRequests: [] } : {}),
    // Implement report-uri if you have a reporting endpoint
    ...(process.env.CSP_REPORT_URI ? { 'report-uri': [process.env.CSP_REPORT_URI] } : {})
  }
});

// Configure CSRF protection
const csrfProtection = csrf({
  cookie: {
    key: '_csrf',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
    maxAge: 3600 // 1 hour
  }
});

// CSRF error handler
const handleCSRFError = (err, req, res, next) => {
  if (err.code !== 'EBADCSRFTOKEN') return next(err);
  
  logger.warn(`CSRF validation failed for IP: ${req.ip}`, {
    url: req.originalUrl,
    method: req.method,
    headers: req.headers,
    ip: req.ip
  });
  
  res.status(403).json({
    status: 'error',
    message: 'CSRF validation failed'
  });
};

// Sanitize request parameters
const sanitizeRequest = (req, res, next) => {
  // Skip binary requests
  if (req.is('multipart/form-data') || req.is('application/octet-stream')) {
    return next();
  }
  
  // Sanitize query parameters
  if (req.query) {
    Object.keys(req.query).forEach(key => {
      if (typeof req.query[key] === 'string') {
        req.query[key] = req.sanitize(req.query[key]);
      }
    });
  }
  
  // Sanitize body parameters
  if (req.body && typeof req.body === 'object') {
    const sanitizeObject = (obj) => {
      Object.keys(obj).forEach(key => {
        if (typeof obj[key] === 'string') {
          obj[key] = req.sanitize(obj[key]);
        } else if (typeof obj[key] === 'object' && obj[key] !== null) {
          sanitizeObject(obj[key]);
        }
      });
    };
    
    sanitizeObject(req.body);
  }
  
  next();
};

// Add security headers on all responses
const addSecurityHeaders = (req, res, next) => {
  // Prevent browsers from detecting the mimetype of a response based on its content
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  // Protect against clickjacking
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  
  // Protect against XSS attacks
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // Control referrer information
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Prevent storing sensitive information in the browser cache
  if (req.method === 'GET') {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
  }
  
  // Set permissions policy (formerly feature policy)
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  
  next();
};

// Enhanced security middleware for file uploads
const fileUploadSecurity = (req, res, next) => {
  // Only apply to file upload routes
  if (!req.is('multipart/form-data')) {
    return next();
  }
  
  // Check file size (should be implemented at multer level too)
  const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
  if (req.headers['content-length'] > MAX_FILE_SIZE) {
    return res.status(413).json({
      status: 'error',
      message: 'File size too large, maximum allowed is 50MB'
    });
  }
  
  // Add file type validation (should be implemented at multer level too)
  const handleFile = (req, res, next) => {
    if (!req.file && !req.files) {
      return next();
    }
    
    const files = req.file ? [req.file] : Object.values(req.files).flat();
    
    // Check allowed file types
    const allowedMimeTypes = [
      'application/pdf',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/csv',
      'application/json'
    ];
    
    for (const file of files) {
      if (!allowedMimeTypes.includes(file.mimetype)) {
        return res.status(415).json({
          status: 'error',
          message: 'Invalid file type. Please upload a PDF, Excel, CSV, or JSON file.'
        });
      }
      
      // Sanitize filename to prevent path traversal
      file.originalname = file.originalname.replace(/[^a-zA-Z0-9\._-]/g, '_');
    }
    
    next();
  };
  
  handleFile(req, res, next);
};

// Export middleware functions
module.exports = {
  // Apply CORS
  cors: () => cors(corsOptions),
  
  // Apply Helmet security headers
  helmet: (req, res) => helmet({
    contentSecurityPolicy: process.env.NODE_ENV === 'production' ? getCSPOptions(res.locals.cspNonce) : false
  }),
  
  // Apply general rate limiting
  rateLimit: () => apiLimiter,
  
  // Apply rate limiting for authentication
  authLimiter: () => authLimiter,
  
  // Apply rate limiting for password reset
  passwordResetLimiter: () => passwordResetLimiter,
  
  // Apply CSRF protection
  csrf: () => csrfProtection,
  
  // Handle CSRF errors
  handleCSRFError,
  
  // Generate nonce for CSP
  generateNonce,
  
  // Sanitize request parameters
  sanitizeRequest,
  
  // Add security headers
  addSecurityHeaders,
  
  // File upload security
  fileUploadSecurity,
  
  // Apply all security middleware
  applyAll: (app) => {
    // Apply CORS
    app.use(cors(corsOptions));
    
    // Apply CSP nonce generation
    app.use(generateNonce);
    
    // Apply Helmet with enhanced CSP
    app.use((req, res, next) => {
      helmet({
        contentSecurityPolicy: process.env.NODE_ENV === 'production' ? getCSPOptions(res.locals.cspNonce) : false
      })(req, res, next);
    });
    
    // Apply request sanitization
    app.use(expressSanitizer());
    app.use(sanitizeRequest);
    
    // Apply additional security headers
    app.use(addSecurityHeaders);
    
    // Apply rate limiting
    app.use('/api/', apiLimiter);
    app.use('/api/auth/', authLimiter);
    app.use('/api/auth/password-reset', passwordResetLimiter);
    
    // Apply file upload security to relevant routes
    app.use('/api/documents/upload', fileUploadSecurity);
    app.use('/api/documents/process', fileUploadSecurity);
    
    // Apply CSRF protection to all routes that change state
    app.use('/api/auth', csrfProtection);
    app.use('/api/documents', csrfProtection);
    app.use('/api/user', csrfProtection);
    // Handle CSRF errors
    app.use(handleCSRFError);
    
    logger.info('Enhanced security middleware applied');
  }
};
