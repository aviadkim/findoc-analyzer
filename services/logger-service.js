/**
 * Logger Service
 * Centralized logging system with multiple transports and levels
 */

const fs = require('fs');
const path = require('path');

// Log levels
const LOG_LEVELS = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3,
  TRACE: 4
};

// Current log level - can be set via environment variable
const currentLogLevel = process.env.LOG_LEVEL ? 
  LOG_LEVELS[process.env.LOG_LEVEL.toUpperCase()] || LOG_LEVELS.INFO : 
  LOG_LEVELS.INFO;

// Log directory
const logDir = path.join(__dirname, '..', 'logs');

// Ensure log directory exists
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// Current date for log file naming
const now = new Date();
const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

// Log file paths
const logFilePaths = {
  error: path.join(logDir, `error-${dateStr}.log`),
  combined: path.join(logDir, `combined-${dateStr}.log`),
  access: path.join(logDir, `access-${dateStr}.log`)
};

/**
 * Format log message
 * @param {string} level - Log level
 * @param {string} message - Log message
 * @param {Object} meta - Additional metadata
 * @returns {string} Formatted log message
 */
function formatLogMessage(level, message, meta = {}) {
  const timestamp = new Date().toISOString();
  const metaStr = Object.keys(meta).length > 0 ? ` ${JSON.stringify(meta)}` : '';
  return `[${timestamp}] [${level.toUpperCase()}] ${message}${metaStr}`;
}

/**
 * Write to log file
 * @param {string} filePath - Path to log file
 * @param {string} message - Formatted log message
 */
function writeToLogFile(filePath, message) {
  fs.appendFile(filePath, message + '\n', (err) => {
    if (err) {
      console.error(`Failed to write to log file ${filePath}:`, err);
    }
  });
}

/**
 * Log error message
 * @param {string} message - Error message
 * @param {Object} meta - Additional metadata
 */
function error(message, meta = {}) {
  if (currentLogLevel >= LOG_LEVELS.ERROR) {
    const formattedMessage = formatLogMessage('error', message, meta);
    console.error('\x1b[31m%s\x1b[0m', formattedMessage); // Red color
    writeToLogFile(logFilePaths.error, formattedMessage);
    writeToLogFile(logFilePaths.combined, formattedMessage);
  }
}

/**
 * Log warning message
 * @param {string} message - Warning message
 * @param {Object} meta - Additional metadata
 */
function warn(message, meta = {}) {
  if (currentLogLevel >= LOG_LEVELS.WARN) {
    const formattedMessage = formatLogMessage('warn', message, meta);
    console.warn('\x1b[33m%s\x1b[0m', formattedMessage); // Yellow color
    writeToLogFile(logFilePaths.combined, formattedMessage);
  }
}

/**
 * Log info message
 * @param {string} message - Info message
 * @param {Object} meta - Additional metadata
 */
function info(message, meta = {}) {
  if (currentLogLevel >= LOG_LEVELS.INFO) {
    const formattedMessage = formatLogMessage('info', message, meta);
    console.info('\x1b[36m%s\x1b[0m', formattedMessage); // Cyan color
    writeToLogFile(logFilePaths.combined, formattedMessage);
  }
}

/**
 * Log debug message
 * @param {string} message - Debug message
 * @param {Object} meta - Additional metadata
 */
function debug(message, meta = {}) {
  if (currentLogLevel >= LOG_LEVELS.DEBUG) {
    const formattedMessage = formatLogMessage('debug', message, meta);
    console.debug('\x1b[90m%s\x1b[0m', formattedMessage); // Gray color
    writeToLogFile(logFilePaths.combined, formattedMessage);
  }
}

/**
 * Log trace message
 * @param {string} message - Trace message
 * @param {Object} meta - Additional metadata
 */
function trace(message, meta = {}) {
  if (currentLogLevel >= LOG_LEVELS.TRACE) {
    const formattedMessage = formatLogMessage('trace', message, meta);
    console.log('\x1b[90m%s\x1b[0m', formattedMessage); // Gray color
    writeToLogFile(logFilePaths.combined, formattedMessage);
  }
}

/**
 * Log HTTP request
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {number} responseTime - Response time in milliseconds
 */
function logRequest(req, res, responseTime) {
  const { method, url, ip, headers } = req;
  const userAgent = headers['user-agent'];
  const contentLength = res.getHeader('content-length') || '-';
  const statusCode = res.statusCode;
  
  const logEntry = formatLogMessage('access', `${method} ${url}`, {
    ip,
    statusCode,
    responseTime: `${responseTime}ms`,
    contentLength,
    userAgent
  });
  
  writeToLogFile(logFilePaths.access, logEntry);
  
  // Also log as error if status code indicates error
  if (statusCode >= 400) {
    if (statusCode >= 500) {
      error(`Request failed with status ${statusCode}: ${method} ${url}`, { ip, responseTime });
    } else {
      warn(`Request failed with status ${statusCode}: ${method} ${url}`, { ip, responseTime });
    }
  }
}

/**
 * Log API error
 * @param {Error} err - Error object
 * @param {Object} req - Express request object
 */
function logApiError(err, req) {
  const { method, url, ip, body } = req;
  
  // Sanitize request body to avoid logging sensitive information
  const sanitizedBody = { ...body };
  if (sanitizedBody.password) sanitizedBody.password = '[REDACTED]';
  if (sanitizedBody.token) sanitizedBody.token = '[REDACTED]';
  if (sanitizedBody.sessionToken) sanitizedBody.sessionToken = '[REDACTED]';
  
  error(`API Error: ${err.message}`, {
    method,
    url,
    ip,
    stack: err.stack,
    body: sanitizedBody
  });
}

/**
 * Get log file contents
 * @param {string} type - Log type (error, combined, access)
 * @param {number} limit - Maximum number of lines to return
 * @returns {Promise<string>} Log file contents
 */
async function getLogContents(type = 'combined', limit = 100) {
  const filePath = logFilePaths[type] || logFilePaths.combined;
  
  try {
    // Check if file exists
    await fs.promises.access(filePath, fs.constants.F_OK);
    
    // Read file
    const data = await fs.promises.readFile(filePath, 'utf8');
    
    // Split into lines and get last 'limit' lines
    const lines = data.split('\n');
    const limitedLines = lines.slice(-limit).filter(line => line.trim() !== '');
    
    return limitedLines.join('\n');
  } catch (error) {
    console.error(`Failed to read log file ${filePath}:`, error);
    return '';
  }
}

/**
 * Create a request logger middleware
 * @returns {Function} Express middleware function
 */
function requestLoggerMiddleware() {
  return (req, res, next) => {
    const start = Date.now();
    
    // Add response listener to log after response is sent
    res.on('finish', () => {
      const responseTime = Date.now() - start;
      logRequest(req, res, responseTime);
    });
    
    next();
  };
}

/**
 * Create an error handler middleware
 * @returns {Function} Express error middleware function
 */
function errorHandlerMiddleware() {
  return (err, req, res, next) => {
    logApiError(err, req);
    
    // Determine response based on error type
    if (err.type === 'validation') {
      // Validation errors
      return res.status(400).json({
        success: false,
        error: {
          message: 'Validation error',
          details: err.details
        }
      });
    } else if (err.type === 'authentication') {
      // Authentication errors
      return res.status(401).json({
        success: false,
        error: {
          message: 'Authentication error',
          details: err.message
        }
      });
    } else if (err.type === 'authorization') {
      // Authorization errors
      return res.status(403).json({
        success: false,
        error: {
          message: 'Authorization error',
          details: err.message
        }
      });
    } else if (err.type === 'notFound') {
      // Not found errors
      return res.status(404).json({
        success: false,
        error: {
          message: 'Resource not found',
          details: err.message
        }
      });
    } else {
      // Internal server errors
      return res.status(500).json({
        success: false,
        error: {
          message: 'Internal server error',
          id: err.id || Date.now().toString()
        }
      });
    }
  };
}

/**
 * Create application error types
 */
class ApplicationError extends Error {
  constructor(message, type, details = null) {
    super(message);
    this.name = this.constructor.name;
    this.type = type;
    this.details = details;
    this.id = Date.now().toString();
    Error.captureStackTrace(this, this.constructor);
  }
}

class ValidationError extends ApplicationError {
  constructor(message, details = null) {
    super(message, 'validation', details);
  }
}

class AuthenticationError extends ApplicationError {
  constructor(message) {
    super(message, 'authentication');
  }
}

class AuthorizationError extends ApplicationError {
  constructor(message) {
    super(message, 'authorization');
  }
}

class NotFoundError extends ApplicationError {
  constructor(message) {
    super(message, 'notFound');
  }
}

module.exports = {
  error,
  warn,
  info,
  debug,
  trace,
  logRequest,
  logApiError,
  getLogContents,
  requestLoggerMiddleware,
  errorHandlerMiddleware,
  LOG_LEVELS,
  ApplicationError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError
};