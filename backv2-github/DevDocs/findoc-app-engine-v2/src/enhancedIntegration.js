/**
 * Enhanced Integration
 * 
 * This module integrates enhanced document processing and chat functionality
 * into the existing application.
 */

const enhancedRoutes = require('./api/routes/enhancedRoutes');

/**
 * Apply enhanced functionality to the existing Express application
 * @param {object} app - Express application
 */
const enhanceApplication = (app) => {
  console.log('Applying enhanced functionality to the application');
  
  // Register enhanced routes
  app.use('/api/enhanced', enhancedRoutes);
  
  console.log('Enhanced functionality applied successfully');
  console.log('Enhanced routes are now available at /api/enhanced/*');
  
  return app;
};

module.exports = {
  enhanceApplication
};
