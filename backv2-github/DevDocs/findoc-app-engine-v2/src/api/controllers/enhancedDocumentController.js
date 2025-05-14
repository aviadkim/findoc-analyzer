/**
 * Enhanced Document Controller
 * 
 * This controller extends the basic document controller with improved
 * document processing capabilities.
 */

const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs');
// Use mock storage service for demo purposes
const { supabase } = require('../services/mockStorageService');
const { processDocument } = require('../services/unifiedDocumentProcessingService');

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
 * Create document with unified upload handling
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @returns {Promise<void>}
 */
const createDocument = async (req, res) => {
  try {
    console.log('Creating document with enhancedDocumentController');
    
    // Check if file is in request
    if (!req.file && !req.files) {
      console.log('No file uploaded');
      
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

      console.log('Creating document record:', document);

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

    console.log('File uploaded');
    
    // Handle file upload
    const file = req.file || req.files[0];
    console.log('File details:', {
      name: file.originalname || file.name,
      size: file.size,
      mimetype: file.mimetype
    });

    // Get file details
    const fileName = file.originalname || file.name;
    const fileSize = file.size;
    const fileType = file.mimetype;
    const fileExtension = fileName.split('.').pop().toLowerCase();

    // Validate file type
    const allowedTypes = [
      'application/pdf', 
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 
      'application/vnd.ms-excel',
      'text/csv',
      'application/vnd.ms-excel.sheet.macroEnabled.12',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];
    const allowedExtensions = ['pdf', 'xlsx', 'xls', 'csv', 'xlsm'];

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
    
    console.log('Storage path:', storagePath);

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

    console.log('File uploaded to storage:', uploadData);

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

    console.log('Creating document record:', document.id);

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
      data,
      message: 'Document uploaded successfully. You can now process it.'
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
 * Process document with unified processing service
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @returns {Promise<void>}
 */
const processDocumentUnified = async (req, res) => {
  try {
    console.log('Processing document with enhancedDocumentController');
    console.log('Request params:', req.params);
    console.log('Request body:', req.body);
    
    const { id } = req.params;
    const options = req.body?.options || {};
    const tenantId = req.tenantId || 'test-tenant';

    console.log(`Processing document ${id} with options:`, options);

    // Update document status to processing
    await supabase
      .from('documents')
      .update({
        status: 'processing',
        processed_at: new Date().toISOString()
      })
      .eq('id', id);

    // Process document with unified service
    const resultDocument = await processDocument(id, options, tenantId);

    return res.json({
      success: true,
      data: resultDocument,
      message: 'Document processing completed successfully'
    });
  } catch (error) {
    console.error('Error in processDocumentUnified:', error);
    
    // Update document status to error
    await supabase
      .from('documents')
      .update({
        status: 'error',
        metadata: {
          error: error.message
        },
        processed_at: new Date().toISOString()
      })
      .eq('id', req.params.id);
    
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
    const tenantId = req.tenantId || 'test-tenant';

    // Get document to delete the file
    const { data: document, error: getError } = await supabase
      .from('documents')
      .select('path')
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .single();

    if (getError) {
      console.error('Error getting document for deletion:', getError);
      return res.status(404).json({
        success: false,
        error: 'Document not found'
      });
    }

    // Delete file from storage
    if (document?.path) {
      const { error: storageError } = await supabase.storage
        .from('documents')
        .remove([document.path]);

      if (storageError) {
        console.warn('Error deleting file from storage:', storageError);
        // Continue with deleting the record even if file deletion fails
      }
    }

    // Delete document from database
    const { error } = await supabase
      .from('documents')
      .delete()
      .eq('id', id)
      .eq('tenant_id', tenantId);

    if (error) {
      console.error('Error deleting document:', error);
      return res.status(500).json({
        success: false,
        error: 'Error deleting document'
      });
    }

    return res.json({
      success: true,
      message: 'Document deleted successfully'
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
  processDocumentUnified,
  deleteDocument
};
