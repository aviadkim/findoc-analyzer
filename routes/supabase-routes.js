/**
 * Supabase Routes
 * This module provides routes for Supabase operations
 */

const express = require('express');
const router = express.Router();

// Get Supabase status
router.get('/status', (req, res) => {
  res.json({
    status: 'ok',
    connected: true,
    message: 'Supabase connection is active'
  });
});

// Get user documents
router.get('/documents', (req, res) => {
  // Mock user documents from Supabase
  res.json([
    {
      id: 'doc-1',
      fileName: 'Financial Report 2023.pdf',
      documentType: 'financial',
      uploadDate: '2023-12-31T12:00:00Z',
      processed: true,
      userId: 'user-1'
    },
    {
      id: 'doc-2',
      fileName: 'Investment Portfolio.pdf',
      documentType: 'portfolio',
      uploadDate: '2023-12-15T10:30:00Z',
      processed: true,
      userId: 'user-1'
    },
    {
      id: 'doc-3',
      fileName: 'Tax Documents 2023.pdf',
      documentType: 'tax',
      uploadDate: '2023-11-20T14:45:00Z',
      processed: true,
      userId: 'user-1'
    }
  ]);
});

// Get user profile
router.get('/profile', (req, res) => {
  // Mock user profile from Supabase
  res.json({
    id: 'user-1',
    email: 'user@example.com',
    name: 'John Doe',
    createdAt: '2023-01-01T00:00:00Z',
    lastLogin: '2023-12-31T12:00:00Z'
  });
});

// Update user profile
router.post('/profile', (req, res) => {
  // Mock user profile update
  res.json({
    id: 'user-1',
    email: req.body.email || 'user@example.com',
    name: req.body.name || 'John Doe',
    createdAt: '2023-01-01T00:00:00Z',
    lastLogin: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });
});

module.exports = router;
