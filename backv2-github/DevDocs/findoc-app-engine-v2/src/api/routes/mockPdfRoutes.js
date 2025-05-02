/**
 * Mock PDF Routes
 * 
 * This file defines the routes for the mock PDF processing functionality.
 */

const express = require('express');
const multer = require('multer');
const path = require('path');
const mockPdfController = require('../controllers/mockPdfController');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../../uploads'));
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ storage });

// Routes
router.post('/documents', upload.single('file'), mockPdfController.uploadDocument);
router.post('/documents/:id/process', mockPdfController.processDocument);
router.post('/documents/:id/scan1', mockPdfController.processDocument);
router.get('/documents/:id', mockPdfController.getDocument);
router.post('/documents/:id/ask', mockPdfController.answerQuestion);

module.exports = router;
