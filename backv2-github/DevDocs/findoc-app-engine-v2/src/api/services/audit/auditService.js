/**
 * Audit Service
 * 
 * This service handles audit logging.
 */

/**
 * Create audit middleware
 * @returns {function} Middleware function
 */
const createAuditMiddleware = () => {
  return (req, res, next) => {
    // Log request
    console.log(`[AUDIT] ${req.method} ${req.path}`);
    next();
  };
};

module.exports = {
  createAuditMiddleware
};
