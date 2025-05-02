/**
 * Batch Processing Service
 * 
 * This service handles batch processing of multiple documents.
 */

const { v4: uuidv4 } = require('uuid');
const { supabase } = require('../supabaseService');
const { processDocumentWithAgents } = require('../../../agent_system');

/**
 * Create a new batch job
 * @param {Array} documentIds - Document IDs to process
 * @param {Object} options - Processing options
 * @param {string} userId - User ID
 * @param {string} tenantId - Tenant ID
 * @returns {Promise<Object>} Created batch job
 */
const createBatchJob = async (documentIds, options, userId, tenantId) => {
  try {
    // Validate input
    if (!documentIds || !Array.isArray(documentIds) || documentIds.length === 0) {
      throw new Error('Document IDs are required');
    }
    
    // Create batch job
    const batchJob = {
      id: uuidv4(),
      document_ids: documentIds,
      options: options || {},
      user_id: userId,
      tenant_id: tenantId,
      status: 'pending',
      progress: 0,
      results: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      completed_at: null
    };
    
    // Insert batch job into database
    const { data, error } = await supabase
      .from('batch_jobs')
      .insert(batchJob)
      .select()
      .single();
    
    if (error) {
      console.error('Error creating batch job:', error);
      throw new Error('Error creating batch job');
    }
    
    // Start processing in the background
    processBatchJob(data.id, tenantId).catch(error => {
      console.error('Error processing batch job:', error);
    });
    
    return data;
  } catch (error) {
    console.error('Error in createBatchJob:', error);
    throw error;
  }
};

/**
 * Get batch jobs for a tenant
 * @param {string} tenantId - Tenant ID
 * @returns {Promise<Array>} Batch jobs
 */
const getBatchJobs = async (tenantId) => {
  try {
    // Get batch jobs from database
    const { data, error } = await supabase
      .from('batch_jobs')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error getting batch jobs:', error);
      throw new Error('Error getting batch jobs');
    }
    
    return data || [];
  } catch (error) {
    console.error('Error in getBatchJobs:', error);
    throw error;
  }
};

/**
 * Get batch job by ID
 * @param {string} batchJobId - Batch job ID
 * @param {string} tenantId - Tenant ID
 * @returns {Promise<Object>} Batch job
 */
const getBatchJobById = async (batchJobId, tenantId) => {
  try {
    // Get batch job from database
    const { data, error } = await supabase
      .from('batch_jobs')
      .select('*')
      .eq('id', batchJobId)
      .eq('tenant_id', tenantId)
      .single();
    
    if (error) {
      console.error('Error getting batch job:', error);
      throw new Error('Error getting batch job');
    }
    
    return data;
  } catch (error) {
    console.error('Error in getBatchJobById:', error);
    throw error;
  }
};

/**
 * Cancel batch job
 * @param {string} batchJobId - Batch job ID
 * @param {string} tenantId - Tenant ID
 * @returns {Promise<boolean>} Success
 */
const cancelBatchJob = async (batchJobId, tenantId) => {
  try {
    // Update batch job status
    const { error } = await supabase
      .from('batch_jobs')
      .update({
        status: 'cancelled',
        updated_at: new Date().toISOString()
      })
      .eq('id', batchJobId)
      .eq('tenant_id', tenantId)
      .in('status', ['pending', 'processing']);
    
    if (error) {
      console.error('Error cancelling batch job:', error);
      throw new Error('Error cancelling batch job');
    }
    
    return true;
  } catch (error) {
    console.error('Error in cancelBatchJob:', error);
    throw error;
  }
};

/**
 * Process batch job
 * @param {string} batchJobId - Batch job ID
 * @param {string} tenantId - Tenant ID
 * @returns {Promise<void>}
 */
const processBatchJob = async (batchJobId, tenantId) => {
  try {
    // Get batch job
    const { data: batchJob, error: batchJobError } = await supabase
      .from('batch_jobs')
      .select('*')
      .eq('id', batchJobId)
      .eq('tenant_id', tenantId)
      .single();
    
    if (batchJobError || !batchJob) {
      console.error('Error getting batch job for processing:', batchJobError);
      return;
    }
    
    // Check if job is already processed or cancelled
    if (['completed', 'failed', 'cancelled'].includes(batchJob.status)) {
      console.log(`Batch job ${batchJobId} is already ${batchJob.status}`);
      return;
    }
    
    // Update status to processing
    await supabase
      .from('batch_jobs')
      .update({
        status: 'processing',
        updated_at: new Date().toISOString()
      })
      .eq('id', batchJobId);
    
    // Get documents
    const { data: documents, error: documentsError } = await supabase
      .from('documents')
      .select('*')
      .in('id', batchJob.document_ids)
      .eq('tenant_id', tenantId);
    
    if (documentsError) {
      console.error('Error getting documents for batch job:', documentsError);
      await updateBatchJobStatus(batchJobId, 'failed', 'Error getting documents');
      return;
    }
    
    // Process documents
    const results = [];
    let progress = 0;
    
    for (const document of documents) {
      try {
        // Skip already processed documents if specified in options
        if (batchJob.options.skipProcessed && document.status === 'processed') {
          results.push({
            documentId: document.id,
            status: 'skipped',
            message: 'Document already processed'
          });
        } else {
          // Process document
          const result = await processDocumentWithAgents(document.path, {
            tenantId,
            ...batchJob.options
          });
          
          // Update document status
          await supabase
            .from('documents')
            .update({
              status: 'processed',
              metadata: result,
              processed_at: new Date().toISOString()
            })
            .eq('id', document.id);
          
          results.push({
            documentId: document.id,
            status: 'processed',
            result
          });
        }
      } catch (error) {
        console.error(`Error processing document ${document.id}:`, error);
        
        results.push({
          documentId: document.id,
          status: 'failed',
          error: error.message
        });
      }
      
      // Update progress
      progress = Math.round(((results.length / documents.length) * 100));
      
      await supabase
        .from('batch_jobs')
        .update({
          progress,
          updated_at: new Date().toISOString()
        })
        .eq('id', batchJobId);
    }
    
    // Update batch job status
    await supabase
      .from('batch_jobs')
      .update({
        status: 'completed',
        progress: 100,
        results,
        updated_at: new Date().toISOString(),
        completed_at: new Date().toISOString()
      })
      .eq('id', batchJobId);
    
    console.log(`Batch job ${batchJobId} completed`);
  } catch (error) {
    console.error('Error processing batch job:', error);
    await updateBatchJobStatus(batchJobId, 'failed', error.message);
  }
};

/**
 * Update batch job status
 * @param {string} batchJobId - Batch job ID
 * @param {string} status - Status
 * @param {string} [message] - Error message
 * @returns {Promise<void>}
 */
const updateBatchJobStatus = async (batchJobId, status, message) => {
  try {
    const updateData = {
      status,
      updated_at: new Date().toISOString()
    };
    
    if (status === 'completed') {
      updateData.progress = 100;
      updateData.completed_at = new Date().toISOString();
    } else if (status === 'failed') {
      updateData.error = message;
    }
    
    await supabase
      .from('batch_jobs')
      .update(updateData)
      .eq('id', batchJobId);
  } catch (error) {
    console.error('Error updating batch job status:', error);
  }
};

module.exports = {
  createBatchJob,
  getBatchJobs,
  getBatchJobById,
  cancelBatchJob,
  processBatchJob
};
