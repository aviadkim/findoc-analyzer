/**
 * FinDoc Analyzer Server
 *
 * Main server file for the FinDoc Analyzer application.
 */

const path = require('path');
const fs = require('fs');
const app = require('./src/app');

// Set port
const PORT = process.env.PORT || 8080;

// Create necessary directories
const uploadFolder = process.env.UPLOAD_FOLDER || path.join(__dirname, 'uploads');
const tempFolder = process.env.TEMP_FOLDER || path.join(__dirname, 'temp');
const resultsFolder = process.env.RESULTS_FOLDER || path.join(__dirname, 'results');

// Create directories if they don't exist
[uploadFolder, tempFolder, resultsFolder].forEach(folder => {
  try {
    console.log(`Checking directory: ${folder}`);
    if (!fs.existsSync(folder)) {
      fs.mkdirSync(folder, { recursive: true });
      console.log(`Created directory: ${folder}`);
    } else {
      console.log(`Directory already exists: ${folder}`);
    }
  } catch (error) {
    console.error(`Error creating directory ${folder}: ${error.message}`);
    // Continue execution even if directory creation fails
  }
});

// Log environment for debugging
console.log('Environment:', {
  NODE_ENV: process.env.NODE_ENV,
  PORT: PORT,
  UPLOAD_FOLDER: uploadFolder,
  TEMP_FOLDER: tempFolder,
  RESULTS_FOLDER: resultsFolder,
  SUPABASE_URL: process.env.SUPABASE_URL ? 'Set' : 'Not set',
  GEMINI_API_KEY: process.env.GEMINI_API_KEY ? 'Set' : 'Not set',
  GEMINI_API_KEY_LENGTH: process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.length : 0,
  GEMINI_API_KEY_PREFIX: process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.substring(0, 10) + '...' : 'Not set',
  JWT_SECRET: process.env.JWT_SECRET ? 'Set' : 'Not set'
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Access the application at http://localhost:${PORT}`);
});
