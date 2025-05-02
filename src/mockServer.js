/**
 * Mock Server
 * 
 * This server provides mock API endpoints for testing the PDF processing functionality
 * until the Google Authentication and other components are fully implemented.
 */

const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const mockApiController = require('./controllers/mockApiController');

// Create Express app
const app = express();
const port = process.env.PORT || 3001;

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ storage });

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(path.join(__dirname, '../public')));

// Health check route
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Mock API is running',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Mock API routes
app.get('/api/documents', mockApiController.getDocuments);
app.get('/api/documents/:id', mockApiController.getDocumentById);
app.post('/api/documents', upload.single('file'), mockApiController.createDocument);
app.post('/api/documents/:id/process', mockApiController.processDocument);
app.post('/api/documents/:id/scan1', mockApiController.processDocument);
app.post('/api/documents/:id/ask', mockApiController.answerQuestion);

// Start server
app.listen(port, () => {
  console.log(`Mock server running on port ${port}`);
});
