/**
 * Agent System
 * 
 * This file contains the agent system for querying documents.
 */

const { v4: uuidv4 } = require('uuid');
const { supabase } = require('./api/services/supabaseService');
const { generateContentInternal } = require('./api/controllers/geminiController');

/**
 * Query document with agents
 * @param {string} documentId - Document ID
 * @param {string} query - User query
 * @param {object} options - Options
 * @param {string} [options.tenantId] - Tenant ID
 * @returns {Promise<object>} Query result
 */
const queryDocumentWithAgents = async (documentId, query, options = {}) => {
  try {
    console.log(`Querying document ${documentId} with query: ${query}`);
    
    // Get document from database
    const { data: document, error: documentError } = await supabase
      .from('documents')
      .select('*')
      .eq('id', documentId)
      .single();
    
    if (documentError || !document) {
      console.error('Error getting document:', documentError);
      throw new Error('Document not found');
    }
    
    // Check if document belongs to tenant
    if (options.tenantId && document.tenant_id !== options.tenantId) {
      console.error(`Document ${documentId} does not belong to tenant ${options.tenantId}`);
      throw new Error('Document not found');
    }
    
    // Get document content
    const { data: documentContent, error: contentError } = await supabase
      .from('document_content')
      .select('*')
      .eq('document_id', documentId)
      .single();
    
    if (contentError || !documentContent) {
      console.error('Error getting document content:', contentError);
      throw new Error('Document content not found');
    }
    
    // Get document tables
    const { data: documentTables, error: tablesError } = await supabase
      .from('document_tables')
      .select('*')
      .eq('document_id', documentId);
    
    if (tablesError) {
      console.error('Error getting document tables:', tablesError);
      // Continue without tables
    }
    
    // Get document securities
    const { data: documentSecurities, error: securitiesError } = await supabase
      .from('document_securities')
      .select('*')
      .eq('document_id', documentId);
    
    if (securitiesError) {
      console.error('Error getting document securities:', securitiesError);
      // Continue without securities
    }
    
    // Get document analysis
    const { data: documentAnalysis, error: analysisError } = await supabase
      .from('document_analysis')
      .select('*')
      .eq('document_id', documentId)
      .single();
    
    if (analysisError) {
      console.error('Error getting document analysis:', analysisError);
      // Continue without analysis
    }
    
    // Prepare document data for agents
    const documentData = {
      id: document.id,
      name: document.name,
      type: document.type,
      metadata: document.metadata,
      content: documentContent.content,
      tables: documentTables || [],
      securities: documentSecurities || [],
      analysis: documentAnalysis || {}
    };
    
    // Generate prompt for Gemini
    const prompt = generateDocumentQueryPrompt(documentData, query);
    
    // Query Gemini
    const answer = await generateContentInternal(prompt, options.tenantId);
    
    // Return answer
    return {
      id: uuidv4(),
      documentId,
      query,
      answer,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error querying document with agents:', error);
    throw error;
  }
};

/**
 * Generate document query prompt
 * @param {object} documentData - Document data
 * @param {string} query - User query
 * @returns {string} Prompt
 */
const generateDocumentQueryPrompt = (documentData, query) => {
  // Create a prompt for Gemini
  let prompt = `
You are a financial document assistant. You help users understand financial documents and answer questions about them.

Document Information:
- Name: ${documentData.name}
- Type: ${documentData.type}
- ID: ${documentData.id}

Document Content:
${documentData.content ? documentData.content.substring(0, 5000) + (documentData.content.length > 5000 ? '...' : '') : 'No content available'}
`;

  // Add tables if available
  if (documentData.tables && documentData.tables.length > 0) {
    prompt += `\nDocument Tables:\n`;
    documentData.tables.forEach((table, index) => {
      prompt += `Table ${index + 1}:\n${JSON.stringify(table.data, null, 2)}\n`;
    });
  }

  // Add securities if available
  if (documentData.securities && documentData.securities.length > 0) {
    prompt += `\nDocument Securities:\n`;
    documentData.securities.forEach((security) => {
      prompt += `- ${security.name} (${security.isin}): ${security.quantity} units at ${security.price} = ${security.value}\n`;
    });
  }

  // Add analysis if available
  if (documentData.analysis && documentData.analysis.data) {
    prompt += `\nDocument Analysis:\n${JSON.stringify(documentData.analysis.data, null, 2)}\n`;
  }

  // Add user query
  prompt += `\nUser Query: ${query}\n`;

  // Add instructions
  prompt += `
Please answer the user's query based on the document information provided above. 
If the information is not available in the document, please say so.
Provide a clear, concise, and accurate answer.
If the query is about financial data, provide specific numbers and calculations when possible.
`;

  return prompt;
};

module.exports = {
  queryDocumentWithAgents
};
