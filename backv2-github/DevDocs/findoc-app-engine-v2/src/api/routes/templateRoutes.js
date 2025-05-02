/**
 * Template Routes
 */

const express = require('express');
const { authMiddleware } = require('../middleware/authMiddleware');

const router = express.Router();

// Get all templates
router.get('/', authMiddleware, (req, res) => {
  // This is a placeholder - in a real app, this would call a controller function
  res.json({
    success: true,
    data: []
  });
});

// Get template by ID
router.get('/:id', authMiddleware, (req, res) => {
  // This is a placeholder - in a real app, this would call a controller function
  res.json({
    success: true,
    data: {
      id: req.params.id,
      name: 'Sample Template',
      description: 'This is a sample template',
      documentType: 'bank_statement',
      extractionRules: []
    }
  });
});

// Create template
router.post('/', authMiddleware, (req, res) => {
  // This is a placeholder - in a real app, this would call a controller function
  res.status(201).json({
    success: true,
    data: {
      id: 'new-template-id',
      ...req.body
    }
  });
});

// Update template
router.put('/:id', authMiddleware, (req, res) => {
  // This is a placeholder - in a real app, this would call a controller function
  res.json({
    success: true,
    data: {
      id: req.params.id,
      ...req.body
    }
  });
});

// Delete template
router.delete('/:id', authMiddleware, (req, res) => {
  // This is a placeholder - in a real app, this would call a controller function
  res.json({
    success: true,
    data: {}
  });
});

// Apply template to document
router.post('/:id/apply/:documentId', authMiddleware, (req, res) => {
  // This is a placeholder - in a real app, this would call a controller function
  res.json({
    success: true,
    data: {
      templateId: req.params.id,
      documentId: req.params.documentId,
      result: {
        extractedData: {}
      }
    }
  });
});

module.exports = router;
