/**
 * Update Server Exports
 * 
 * This script updates the server.js file to include the new comprehensive export routes.
 * It can be run with Node.js to modify the server.js file automatically.
 */

const fs = require('fs');
const path = require('path');

// Path to server.js
const serverPath = path.join(__dirname, 'server.js');

// Read the current server.js file
let serverContent = fs.readFileSync(serverPath, 'utf8');

// Check if the comprehensive export routes are already added
if (serverContent.includes('comprehensive-export-routes')) {
  console.log('Comprehensive export routes already added to server.js');
  process.exit(0);
}

// Find the position to insert our new routes
// We'll add them after the export routes
const exportRoutesPosition = serverContent.indexOf("// Export routes");
if (exportRoutesPosition === -1) {
  console.error('Could not find export routes section in server.js');
  process.exit(1);
}

// Find the end of the export routes section
const nextRoutePosition = serverContent.indexOf('// ', exportRoutesPosition + 1);
if (nextRoutePosition === -1) {
  console.error('Could not find end of export routes section in server.js');
  process.exit(1);
}

// Insert our new routes
const newRoutes = `
// Comprehensive Export routes (enhanced version)
const comprehensiveExportRoutes = require('./routes/comprehensive-export-routes');
app.use('/api/exports', comprehensiveExportRoutes);
console.log('Successfully imported Comprehensive Export routes');
`;

// Split the content and insert our new routes
const beforeRoutes = serverContent.substring(0, nextRoutePosition);
const afterRoutes = serverContent.substring(nextRoutePosition);
const updatedContent = beforeRoutes + newRoutes + afterRoutes;

// Write the updated content back to server.js
fs.writeFileSync(serverPath, updatedContent);
console.log('Successfully updated server.js with comprehensive export routes');

// Create the necessary directories for exports
const exportsDir = path.join(__dirname, 'exports');
const tempDir = path.join(__dirname, 'temp');
const historyDir = path.join(__dirname, 'export-history');

if (!fs.existsSync(exportsDir)) {
  fs.mkdirSync(exportsDir, { recursive: true });
  console.log('Created exports directory');
}

if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
  console.log('Created temp directory');
}

if (!fs.existsSync(historyDir)) {
  fs.mkdirSync(historyDir, { recursive: true });
  console.log('Created export-history directory');
}

console.log('Done! The comprehensive export service has been added to the server.');
console.log('You can now use the following API endpoints:');
console.log('- POST /api/exports/document/:documentId - Export document data');
console.log('- POST /api/exports/analytics - Export analytics data');
console.log('- POST /api/exports/portfolio/:portfolioId - Export portfolio data');
console.log('- POST /api/exports/securities - Export securities data');
console.log('- POST /api/exports/portfolio-comparison - Export portfolio comparison');
console.log('- POST /api/exports/schedule - Schedule a regular export');
console.log('- GET /api/exports/history - Get export history');
console.log('- GET /api/exports/download/:fileName - Download exported file');