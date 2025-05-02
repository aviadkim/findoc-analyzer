/**
 * FinDoc Analyzer Server
 *
 * This is the main server file.
 */

const app = require('./app');
const { initializeDatabase } = require('./api/services/supabaseService');

// Set port
const PORT = process.env.PORT || 3000;

// Initialize database and start server
const startServer = async () => {
  try {
    // Initialize database
    await initializeDatabase();

    // Start server
    app.listen(PORT, () => {
      console.log(`FinDoc Analyzer server running on port ${PORT}`);
      console.log(`API available at http://localhost:${PORT}/api`);
      console.log(`Health check at http://localhost:${PORT}/api/health`);
    });
  } catch (error) {
    console.error('Error starting server:', error);
    process.exit(1);
  }
};

// Start server
startServer();
