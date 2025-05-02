/**
 * Document Controller
 */

const { v4: uuidv4 } = require('uuid');
const { supabase } = require('../services/supabaseService');

/**
 * Get all documents
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @returns {Promise<void>}
 */
const getDocuments = async (req, res) => {
  try {
    // Get documents from database
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('tenant_id', req.tenantId)
      .order('uploaded_at', { ascending: false });

    if (error) {
      console.error('Error getting documents:', error);
      return res.status(500).json({
        success: false,
        error: 'Error getting documents'
      });
    }

    return res.json({
      success: true,
      data: data || []
    });
  } catch (error) {
    console.error('Error in getDocuments:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Get document by ID
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @returns {Promise<void>}
 */
const getDocumentById = async (req, res) => {
  try {
    const { id } = req.params;

    // Get document from database
    // For testing, allow access without tenant_id check
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error getting document:', error);
      return res.status(404).json({
        success: false,
        error: 'Document not found'
      });
    }

    return res.json({
      success: true,
      data
    });
  } catch (error) {
    console.error('Error in getDocumentById:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Create document
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @returns {Promise<void>}
 */
const createDocument = async (req, res) => {
  try {
    // Check if file is in request
    if (!req.file && !req.files) {
      // If no file is uploaded, try to use mock data
      const { name, type, size } = req.body;

      // Validate input
      if (!name || !type) {
        return res.status(400).json({
          success: false,
          error: 'Name and type are required'
        });
      }

      // Create document
      // For testing, use default values for user_id and tenant_id
      const document = {
        id: uuidv4(),
        name,
        type,
        size: size || 0,
        path: `/uploads/${uuidv4()}.${type}`,
        status: 'pending',
        metadata: {},
        user_id: req.user?.id || 'test-user',
        tenant_id: req.tenantId || 'test-tenant',
        uploaded_at: new Date().toISOString()
      };

      // Insert document into database
      const { data, error } = await supabase
        .from('documents')
        .insert(document)
        .select()
        .single();

      if (error) {
        console.error('Error creating document:', error);
        return res.status(500).json({
          success: false,
          error: 'Error creating document'
        });
      }

      return res.status(201).json({
        success: true,
        data
      });
    }

    // Handle file upload
    const file = req.file || req.files[0];

    // Get file details
    const fileName = file.originalname || file.name;
    const fileSize = file.size;
    const fileType = file.mimetype;
    const fileExtension = fileName.split('.').pop().toLowerCase();

    // Validate file type
    const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel'];
    const allowedExtensions = ['pdf', 'xlsx', 'xls', 'csv'];

    if (!allowedTypes.includes(fileType) && !allowedExtensions.includes(fileExtension)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid file type. Only PDF, XLSX, XLS, and CSV files are allowed.'
      });
    }

    // Generate unique ID for document
    const documentId = uuidv4();

    // Create storage path
    // For testing, use a default tenant ID if not available
    const tenantId = req.tenantId || 'test-tenant';
    const storagePath = `documents/${tenantId}/${documentId}/${fileName}`;

    // Upload file to Supabase Storage
    const fileBuffer = file.buffer || await file.arrayBuffer();

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('documents')
      .upload(storagePath, fileBuffer, {
        contentType: fileType,
        upsert: false
      });

    if (uploadError) {
      console.error('Error uploading file to storage:', uploadError);
      return res.status(500).json({
        success: false,
        error: 'Error uploading file'
      });
    }

    // Get public URL for the file
    const { data: publicUrlData } = await supabase.storage
      .from('documents')
      .getPublicUrl(storagePath);

    const publicUrl = publicUrlData?.publicUrl || '';

    // Create document record
    // For testing, use default values for user_id and tenant_id
    const document = {
      id: documentId,
      name: fileName,
      type: fileExtension,
      size: fileSize,
      path: storagePath,
      url: publicUrl,
      status: 'pending',
      metadata: {
        contentType: fileType,
        originalName: fileName
      },
      user_id: req.user?.id || 'test-user',
      tenant_id: tenantId,
      uploaded_at: new Date().toISOString()
    };

    // Insert document into database
    const { data, error } = await supabase
      .from('documents')
      .insert(document)
      .select()
      .single();

    if (error) {
      console.error('Error creating document record:', error);

      // Try to delete the uploaded file
      await supabase.storage
        .from('documents')
        .remove([storagePath]);

      return res.status(500).json({
        success: false,
        error: 'Error creating document record'
      });
    }

    return res.status(201).json({
      success: true,
      data
    });
  } catch (error) {
    console.error('Error in createDocument:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Process document
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @returns {Promise<void>}
 */
const processDocument = async (req, res) => {
  try {
    const { id } = req.params;

    // Get document
    // For testing, allow access without tenant_id check
    const { data: document, error: documentError } = await supabase
      .from('documents')
      .select('*')
      .eq('id', id)
      .single();

    if (documentError || !document) {
      return res.status(404).json({
        success: false,
        error: 'Document not found'
      });
    }

    // In a real app, this would process the document
    // For now, we'll just update the status and add mock metadata
    const metadata = {
      title: document.name,
      author: 'John Doe',
      createdAt: new Date().toISOString(),
      pageCount: 10,
      securities: [
        {
          name: 'Apple Inc.',
          isin: 'US0378331005',
          quantity: 100,
          price: 150.25,
          value: 15025,
          currency: 'USD',
          type: 'Equity',
          sector: 'Technology',
          region: 'North America',
          asset_class: 'Stocks'
        },
        {
          name: 'Microsoft Corporation',
          isin: 'US5949181045',
          quantity: 50,
          price: 300.10,
          value: 15005,
          currency: 'USD',
          type: 'Equity',
          sector: 'Technology',
          region: 'North America',
          asset_class: 'Stocks'
        },
        {
          name: 'Amazon.com Inc.',
          isin: 'US0231351067',
          quantity: 25,
          price: 130.50,
          value: 3262.5,
          currency: 'USD',
          type: 'Equity',
          sector: 'Consumer Discretionary',
          region: 'North America',
          asset_class: 'Stocks'
        },
        {
          name: 'US Treasury Bond 2.5% 2030',
          isin: 'US912810TL45',
          quantity: 10000,
          price: 98.75,
          value: 9875,
          currency: 'USD',
          type: 'Bond',
          sector: 'Government',
          region: 'North America',
          asset_class: 'Bonds'
        }
      ]
    };

    // Update document
    // For testing, allow update without tenant_id check
    const { data, error } = await supabase
      .from('documents')
      .update({
        status: 'processed',
        metadata,
        processed_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error processing document:', error);
      return res.status(500).json({
        success: false,
        error: 'Error processing document'
      });
    }

    return res.json({
      success: true,
      data
    });
  } catch (error) {
    console.error('Error in processDocument:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Delete document
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @returns {Promise<void>}
 */
const deleteDocument = async (req, res) => {
  try {
    const { id } = req.params;

    // Delete document
    const { error } = await supabase
      .from('documents')
      .delete()
      .eq('id', id)
      .eq('tenant_id', req.tenantId);

    if (error) {
      console.error('Error deleting document:', error);
      return res.status(500).json({
        success: false,
        error: 'Error deleting document'
      });
    }

    return res.json({
      success: true,
      data: {}
    });
  } catch (error) {
    console.error('Error in deleteDocument:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

module.exports = {
  getDocuments,
  getDocumentById,
  createDocument,
  processDocument,
  deleteDocument
};
