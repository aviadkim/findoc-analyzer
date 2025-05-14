/**
 * Supabase Routes
 * Routes for Supabase integration
 */

const express = require('express');
const router = express.Router();

/**
 * Get Supabase status
 * Method: GET
 * Route: /api/supabase/status
 */
router.get('/status', (req, res) => {
  // Mock status
  const status = {
    connected: true,
    project: 'findoc-analyzer',
    tables: ['users', 'documents', 'processing', 'analytics']
  };

  res.json({
    success: true,
    status
  });
});

/**
 * Save document to Supabase
 * Method: POST
 * Route: /api/supabase/save
 */
router.post('/save', (req, res) => {
  const { collection, data } = req.body;

  if (!collection) {
    return res.status(400).json({
      success: false,
      message: 'Collection name is required'
    });
  }

  if (!data) {
    return res.status(400).json({
      success: false,
      message: 'Data is required'
    });
  }

  // Mock save result
  const result = {
    id: `${collection}-${Date.now()}`,
    createdAt: new Date().toISOString(),
    collection
  };

  res.json({
    success: true,
    result
  });
});

/**
 * Get document from Supabase
 * Method: GET
 * Route: /api/supabase/:collection/:id
 */
router.get('/:collection/:id', (req, res) => {
  const { collection, id } = req.params;

  // Mock get result
  const result = {
    id,
    collection,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
    data: {
      name: `Sample ${collection} item`,
      description: 'This is a sample item for testing',
      properties: {
        key1: 'value1',
        key2: 'value2'
      }
    }
  };

  res.json({
    success: true,
    result
  });
});

/**
 * Update document in Supabase
 * Method: PUT
 * Route: /api/supabase/:collection/:id
 */
router.put('/:collection/:id', (req, res) => {
  const { collection, id } = req.params;
  const { data } = req.body;

  if (!data) {
    return res.status(400).json({
      success: false,
      message: 'Data is required'
    });
  }

  // Mock update result
  const result = {
    id,
    collection,
    updatedAt: new Date().toISOString()
  };

  res.json({
    success: true,
    result
  });
});

/**
 * Delete document from Supabase
 * Method: DELETE
 * Route: /api/supabase/:collection/:id
 */
router.delete('/:collection/:id', (req, res) => {
  const { collection, id } = req.params;

  // Mock delete result
  res.json({
    success: true,
    message: `Item ${id} deleted from ${collection}`,
    deleted: {
      id,
      collection,
      deletedAt: new Date().toISOString()
    }
  });
});

module.exports = router;
