/**
 * Logger Utility
 * Provides standardized logging across the application
 */

const fs = require('fs');
const path = require('path');
const { format } = require('util');

// Log levels
const LOG_LEVELS = {
  ERROR: 'ERROR',
  WARN: 'WARN',
  INFO: 'INFO',
  DEBUG: 'DEBUG',
  TRACE: 'TRACE'
};

// Default log level - can be overridden by environment variable
const DEFAULT_LOG_LEVEL = LOG_LEVELS.INFO;

// Log level priority
const LOG_LEVEL_PRIORITY = {
  [LOG_LEVELS.ERROR]: 0,
  [LOG_LEVELS.WARN]: 1,
  [LOG_LEVELS.INFO]: 2,
  [LOG_LEVELS.DEBUG]: 3,
  [LOG_LEVELS.TRACE]: 4
};

// Get log level from environment variable or use default
const LOG_LEVEL = process.env.LOG_LEVEL || DEFAULT_LOG_LEVEL;

// Log directory
const LOG_DIR = process.env.LOG_DIR || path.join(__dirname, '..', 'logs');

// Create log directory if it doesn't exist
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

// Log file paths
const LOG_FILES = {
  [LOG_LEVELS.ERROR]: path.join(LOG_DIR, 'error.log'),
  [LOG_LEVELS.WARN]: path.join(LOG_DIR, 'warn.log'),
  [LOG_LEVELS.INFO]: path.join(LOG_DIR, 'info.log'),
  [LOG_LEVELS.DEBUG]: path.join(LOG_DIR, 'debug.log'),
  [LOG_LEVELS.TRACE]: path.join(LOG_DIR, 'trace.log'),
  API: path.join(LOG_DIR, 'api.log'),
  ACCESS: path.join(LOG_DIR, 'access.log')
};

// Max log file size before rotation (10MB)
const MAX_LOG_SIZE = 10 * 1024 * 1024;

/**
 * Check if logging is enabled for a specific level
 * @param {string} level - Log level to check
 * @returns {boolean} Whether logging is enabled
 */
function isLoggingEnabled(level) {
  return LOG_LEVEL_PRIORITY[level] <= LOG_LEVEL_PRIORITY[LOG_LEVEL];
}

/**
 * Format a log message
 * @param {string} level - Log level
 * @param {string} message - Log message
 * @param {Object} meta - Additional metadata
 * @returns {string} Formatted log message
 */
function formatLogMessage(level, message, meta = {}) {
  const timestamp = new Date().toISOString();
  const metaString = Object.keys(meta).length > 0 ? JSON.stringify(meta) : '';
  return `[${timestamp}] [${level}] ${message} ${metaString}`.trim() + '\n';
}

/**
 * Write a log message to file
 * @param {string} filePath - Log file path
 * @param {string} message - Log message
 */
function writeToLogFile(filePath, message) {
  try {
    // Check if file exists and is too large
    if (fs.existsSync(filePath)) {
      const stats = fs.statSync(filePath);
      
      // Rotate log file if it's too large
      if (stats.size > MAX_LOG_SIZE) {
        const backupPath = `${filePath}.${Date.now()}.bak`;
        fs.renameSync(filePath, backupPath);
      }
    }
    
    // Append to log file
    fs.appendFileSync(filePath, message);
  } catch (error) {
    console.error(`Error writing to log file ${filePath}:`, error);
  }
}

/**
 * Log a message
 * @param {string} level - Log level
 * @param {string} message - Log message
 * @param {Object} meta - Additional metadata
 */
function log(level, message, meta = {}) {
  if (!isLoggingEnabled(level)) {
    return;
  }
  
  // Format log message
  const formattedMessage = formatLogMessage(level, message, meta);
  
  // Write to console
  switch (level) {
    case LOG_LEVELS.ERROR:
      console.error(formattedMessage);
      break;
    case LOG_LEVELS.WARN:
      console.warn(formattedMessage);
      break;
    case LOG_LEVELS.INFO:
      console.info(formattedMessage);
      break;
    case LOG_LEVELS.DEBUG:
    case LOG_LEVELS.TRACE:
      console.debug(formattedMessage);
      break;
    default:
      console.log(formattedMessage);
  }
  
  // Write to specific log file
  writeToLogFile(LOG_FILES[level], formattedMessage);
  
  // Write to combined log file (all.log)
  writeToLogFile(path.join(LOG_DIR, 'all.log'), formattedMessage);
}

/**
 * Log an error message
 * @param {string} message - Log message
 * @param {Object} meta - Additional metadata
 */
function error(message, meta = {}) {
  log(LOG_LEVELS.ERROR, message, meta);
}

/**
 * Log a warning message
 * @param {string} message - Log message
 * @param {Object} meta - Additional metadata
 */
function warn(message, meta = {}) {
  log(LOG_LEVELS.WARN, message, meta);
}

/**
 * Log an info message
 * @param {string} message - Log message
 * @param {Object} meta - Additional metadata
 */
function info(message, meta = {}) {
  log(LOG_LEVELS.INFO, message, meta);
}

/**
 * Log a debug message
 * @param {string} message - Log message
 * @param {Object} meta - Additional metadata
 */
function debug(message, meta = {}) {
  log(LOG_LEVELS.DEBUG, message, meta);
}

/**
 * Log a trace message
 * @param {string} message - Log message
 * @param {Object} meta - Additional metadata
 */
function trace(message, meta = {}) {
  log(LOG_LEVELS.TRACE, message, meta);
}

/**
 * Log an API request
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {number} responseTime - Response time in milliseconds
 */
function logApiRequest(req, res, responseTime) {
  const meta = {
    method: req.method,
    url: req.url,
    ip: req.ip,
    status: res.statusCode,
    responseTime: `${responseTime}ms`,
    userId: req.user?.id || 'anonymous',
    userAgent: req.headers['user-agent']
  };
  
  const message = `${req.method} ${req.url} ${res.statusCode} ${responseTime}ms`;
  
  // Write to API log file
  writeToLogFile(LOG_FILES.API, formatLogMessage('API', message, meta));
}

/**
 * Log API access
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
function accessLogger(req, res, next) {
  const startTime = Date.now();
  
  // When response is finished, log the request
  res.on('finish', () => {
    const responseTime = Date.now() - startTime;
    logApiRequest(req, res, responseTime);
  });
  
  next();
}

/**
 * Log an error
 * @param {Error} err - The error object
 * @param {Object} meta - Additional metadata
 */
function logError(err, meta = {}) {
  // Extract error details
  const errorDetails = {
    name: err.name,
    message: err.message,
    stack: err.stack,
    ...meta
  };
  
  // Log error
  error(err.message, errorDetails);
}

// Export logger functions
module.exports = {
  LOG_LEVELS,
  error,
  warn,
  info,
  debug,
  trace,
  logApiRequest,
  accessLogger,
  logError,
  LOG_DIR,
  LOG_FILES
};