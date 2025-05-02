/**
 * Error Middleware
 */

/**
 * Error handler
 * @param {object} err - Error object
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {function} next - Express next function
 * @returns {void}
 */
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Check if response has already been sent
  if (res.headersSent) {
    return next(err);
  }

  // Set status code
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  
  // Send error response
  res.status(statusCode).json({
    success: false,
    error: err.message || 'Server error'
  });
};

module.exports = {
  errorHandler
};
