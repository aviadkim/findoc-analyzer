/**
 * Enhanced Chat Controller
 *
 * This controller provides improved chat functionality with better integration
 * with the document processing system.
 */

const { v4: uuidv4 } = require('uuid');
// Use mock storage service for demo purposes
const { supabase } = require('../services/mockStorageService');
const { generateContentInternal } = require('./geminiController');

/**
 * Send a message to the chat
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @returns {Promise<void>}
 */
const sendMessage = async (req, res) => {
  try {
    const { documentId, message } = req.body;

    if (!documentId || !message) {
      return res.status(400).json({
        success: false,
        error: 'Document ID and message are required'
      });
    }

    // Get tenant ID from request
    const tenantId = req.tenantId || 'test-tenant';
    const userId = req.user?.id || 'test-user';

    // Check if document exists and belongs to tenant
    const { data: document, error: documentError } = await supabase
      .from('documents')
      .select('*')
      .eq('id', documentId)
      .single();

    if (documentError || !document) {
      console.error('Error getting document:', documentError);
      return res.status(404).json({
        success: false,
        error: 'Document not found'
      });
    }

    // Get chat history for document
    const { data: chatHistory, error: chatHistoryError } = await supabase
      .from('chat_history')
      .select('*')
      .eq('document_id', documentId)
      .eq('user_id', userId)
      .single();

    // Initialize messages array
    let messages = [];
    let chatHistoryId = null;

    if (chatHistory) {
      messages = chatHistory.messages || [];
      chatHistoryId = chatHistory.id;
    } else {
      // Create new chat history
      const { data: newChatHistory, error: createError } = await supabase
        .from('chat_history')
        .insert({
          id: uuidv4(),
          document_id: documentId,
          user_id: userId,
          tenant_id: tenantId,
          messages: [],
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (createError) {
        console.error('Error creating chat history:', createError);
        return res.status(500).json({
          success: false,
          error: 'Error creating chat history'
        });
      }

      chatHistoryId = newChatHistory.id;
    }

    // Add user message to chat history
    const userMessage = {
      id: uuidv4(),
      role: 'user',
      content: message,
      timestamp: new Date().toISOString()
    };

    messages.push(userMessage);

    // Get document metadata
    const documentMetadata = document.metadata || {};
    
    // Generate AI response
    const response = await generateDocumentResponse(documentId, message, documentMetadata, {
      previousMessages: messages,
      tenantId
    });

    // Add assistant message to chat history
    const assistantMessage = {
      id: uuidv4(),
      role: 'assistant',
      content: response,
      timestamp: new Date().toISOString()
    };

    messages.push(assistantMessage);

    // Update chat history
    const { error: updateError } = await supabase
      .from('chat_history')
      .update({
        messages,
        updated_at: new Date().toISOString()
      })
      .eq('id', chatHistoryId);

    if (updateError) {
      console.error('Error updating chat history:', updateError);
      return res.status(500).json({
        success: false,
        error: 'Error updating chat history'
      });
    }

    // Return response
    return res.json({
      success: true,
      data: {
        message: assistantMessage
      }
    });
  } catch (error) {
    console.error('Error sending message:', error);

    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Get chat history for a document
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @returns {Promise<void>}
 */
const getChatHistory = async (req, res) => {
  try {
    const { documentId } = req.params;
    const tenantId = req.tenantId || 'test-tenant';
    const userId = req.user?.id || 'test-user';

    // Check if document exists and belongs to tenant
    const { data: document, error: documentError } = await supabase
      .from('documents')
      .select('*')
      .eq('id', documentId)
      .single();

    if (documentError || !document) {
      console.error('Error getting document:', documentError);
      return res.status(404).json({
        success: false,
        error: 'Document not found'
      });
    }

    // Get chat history for document
    const { data: chatHistory, error: chatHistoryError } = await supabase
      .from('chat_history')
      .select('*')
      .eq('document_id', documentId)
      .eq('user_id', userId)
      .single();

    if (chatHistoryError && chatHistoryError.code !== 'PGRST116') {
      console.error('Error getting chat history:', chatHistoryError);
      return res.status(500).json({
        success: false,
        error: 'Error getting chat history'
      });
    }

    // Return chat history
    return res.json({
      success: true,
      data: {
        history: chatHistory?.messages || []
      }
    });
  } catch (error) {
    console.error('Error getting chat history:', error);

    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Clear chat history for a document
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @returns {Promise<void>}
 */
const clearChatHistory = async (req, res) => {
  try {
    const { documentId } = req.params;
    const tenantId = req.tenantId || 'test-tenant';
    const userId = req.user?.id || 'test-user';

    // Check if document exists and belongs to tenant
    const { data: document, error: documentError } = await supabase
      .from('documents')
      .select('*')
      .eq('id', documentId)
      .single();

    if (documentError || !document) {
      console.error('Error getting document:', documentError);
      return res.status(404).json({
        success: false,
        error: 'Document not found'
      });
    }

    // Update chat history
    const { error: updateError } = await supabase
      .from('chat_history')
      .update({
        messages: [],
        updated_at: new Date().toISOString()
      })
      .eq('document_id', documentId)
      .eq('user_id', userId);

    if (updateError) {
      console.error('Error clearing chat history:', updateError);
      return res.status(500).json({
        success: false,
        error: 'Error clearing chat history'
      });
    }

    // Return success
    return res.json({
      success: true,
      message: 'Chat history cleared successfully'
    });
  } catch (error) {
    console.error('Error clearing chat history:', error);

    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Ask a question about a document
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @returns {Promise<void>}
 */
const askQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const { question } = req.body;
    const tenantId = req.tenantId || 'test-tenant';

    if (!question) {
      return res.status(400).json({
        success: false,
        error: 'Question is required'
      });
    }

    // Check if document exists
    const { data: document, error: documentError } = await supabase
      .from('documents')
      .select('*')
      .eq('id', id)
      .single();

    if (documentError || !document) {
      console.error('Error getting document:', documentError);
      return res.status(404).json({
        success: false,
        error: 'Document not found'
      });
    }

    console.log(`Asking question about document ${id}: ${question}`);
    
    // Generate AI response
    const documentMetadata = document.metadata || {};
    const response = await generateDocumentResponse(id, question, documentMetadata, { tenantId });

    // Return response
    return res.json({
      success: true,
      data: {
        answer: response
      }
    });
  } catch (error) {
    console.error('Error asking question:', error);

    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Generate a response to a question about a document
 * @param {string} documentId - Document ID
 * @param {string} question - Question to answer
 * @param {object} metadata - Document metadata
 * @param {object} options - Additional options
 * @returns {Promise<string>} AI-generated response
 */
const generateDocumentResponse = async (documentId, question, metadata, options = {}) => {
  try {
    const { previousMessages = [], tenantId } = options;

    // Extract securities information
    const securities = metadata.securities || [];
    const securitiesSummary = securities.map(s => 
      `Name: ${s.name}, ISIN: ${s.isin}, Quantity: ${s.quantity}, Price: ${s.price}, Value: ${s.value}, Currency: ${s.currency}`
    ).join('\n');

    // Extract portfolio summary
    const portfolioSummary = metadata.portfolio_summary || {};

    // Extract asset allocation
    const assetAllocation = metadata.asset_allocation || {};
    const assetAllocationSummary = Object.entries(assetAllocation)
      .map(([key, value]) => `${key}: ${value.percentage}%`)
      .join('\n');

    // Create context for the AI
    const context = {
      documentId,
      documentType: metadata.document_type || 'unknown',
      portfolioValue: portfolioSummary.total_value,
      currency: portfolioSummary.currency,
      valuationDate: portfolioSummary.valuation_date,
      securitiesCount: securities.length,
      hasSecuritiesData: securities.length > 0,
      hasAssetAllocation: Object.keys(assetAllocation).length > 0
    };

    // Create conversation history
    let conversationHistory = '';
    
    if (previousMessages && previousMessages.length > 0) {
      const lastMessages = previousMessages.slice(-4); // Get last 4 messages
      
      conversationHistory = lastMessages.map(msg => 
        `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`
      ).join('\n\n');
    }

    // Create the prompt
    const prompt = `
You are a financial advisor and document assistant. You need to answer questions about a financial document with the following information:

Document Type: ${context.documentType}
Portfolio Value: ${context.portfolioValue || 'Not available'} ${context.currency || ''}
Valuation Date: ${context.valuationDate || 'Not available'}

${context.hasSecuritiesData ? `Securities (${context.securitiesCount}):
${securitiesSummary}` : 'No securities data available.'}

${context.hasAssetAllocation ? `Asset Allocation:
${assetAllocationSummary}` : 'No asset allocation data available.'}

${conversationHistory ? `Previous conversation:
${conversationHistory}` : ''}

User's question: ${question}

Please provide a helpful, accurate, and concise answer based only on the information provided above. If the answer cannot be determined from the available information, please say so clearly. Format your answer using Markdown for better readability when appropriate.
`;

    // Generate response using Gemini API
    const response = await generateContentInternal(prompt, tenantId);

    return response;
  } catch (error) {
    console.error('Error generating document response:', error);
    return `I'm sorry, I couldn't generate a response due to an error: ${error.message}. Please try again or ask a different question.`;
  }
};

/**
 * Generate table data based on document content
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @returns {Promise<void>}
 */
const generateTable = async (req, res) => {
  try {
    const { id } = req.params;
    const { tableType, options = {} } = req.body;
    const tenantId = req.tenantId || 'test-tenant';

    if (!tableType) {
      return res.status(400).json({
        success: false,
        error: 'Table type is required'
      });
    }

    // Check if document exists
    const { data: document, error: documentError } = await supabase
      .from('documents')
      .select('*')
      .eq('id', id)
      .single();

    if (documentError || !document) {
      console.error('Error getting document:', documentError);
      return res.status(404).json({
        success: false,
        error: 'Document not found'
      });
    }

    console.log(`Generating ${tableType} table for document ${id}`);

    // Get document metadata
    const metadata = document.metadata || {};
    
    // Generate table data based on table type
    let tableData;
    
    if (tableType === 'securities') {
      // Extract securities from metadata
      tableData = metadata.securities || [];
    } else if (tableType === 'assetAllocation') {
      // Convert asset allocation to tabular format
      const assetAllocation = metadata.asset_allocation || {};
      tableData = Object.entries(assetAllocation).map(([assetClass, data]) => ({
        assetClass,
        percentage: data.percentage || 0
      }));
    } else if (tableType === 'portfolioSummary') {
      // Create a table with portfolio summary
      const portfolioSummary = metadata.portfolio_summary || {};
      tableData = [{
        totalValue: portfolioSummary.total_value || 0,
        currency: portfolioSummary.currency || 'USD',
        valuationDate: portfolioSummary.valuation_date || new Date().toISOString().split('T')[0]
      }];
    } else if (tableType === 'custom') {
      // Generate custom table using AI
      const customTable = await generateCustomTable(id, metadata, options, tenantId);
      tableData = customTable;
    } else {
      return res.status(400).json({
        success: false,
        error: 'Invalid table type',
        validTypes: ['securities', 'assetAllocation', 'portfolioSummary', 'custom']
      });
    }

    // Return table data
    return res.json({
      success: true,
      data: {
        tableType,
        tableData
      }
    });
  } catch (error) {
    console.error('Error generating table:', error);

    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Generate custom table data with AI
 * @param {string} documentId - Document ID
 * @param {object} metadata - Document metadata
 * @param {object} options - Custom table options
 * @param {string} tenantId - Tenant ID
 * @returns {Promise<Array>} Custom table data
 */
const generateCustomTable = async (documentId, metadata, options, tenantId) => {
  try {
    const { title, description, columns } = options;
    
    // Extract securities information
    const securities = metadata.securities || [];
    
    // Extract portfolio summary
    const portfolioSummary = metadata.portfolio_summary || {};
    
    // Extract asset allocation
    const assetAllocation = metadata.asset_allocation || {};
    
    // Create the prompt
    const prompt = `
You are a financial data analyst. You need to create a custom table with the following specifications:

Table Title: ${title || 'Custom Financial Data'}
Table Description: ${description || 'Custom table based on document data'}
Requested Columns: ${columns ? columns.join(', ') : 'Not specified'}

Based on the following document data:

${JSON.stringify(metadata, null, 2)}

Generate a table in JSON format with the requested columns. If no specific columns are requested, include relevant financial metrics that would be helpful for analysis. The result should be a valid JSON array of objects, where each object represents a row in the table. Each row should have consistent properties.

IMPORTANT: Return ONLY the JSON array without any explanation or markdown formatting. The response must be a valid JSON array that can be parsed directly.
`;

    // Generate response using Gemini API
    const response = await generateContentInternal(prompt, tenantId);
    
    // Parse the JSON response
    try {
      // Extract JSON from the response (it might be wrapped in markdown code blocks)
      const jsonMatch = response.match(/```json\n([\s\S]*?)\n```/) ||
                       response.match(/```\n([\s\S]*?)\n```/) ||
                       response.match(/\[([\s\S]*?)\]/);
      
      const jsonStr = jsonMatch ? jsonMatch[1] || jsonMatch[0] : response;
      const tableData = JSON.parse(jsonStr);
      
      if (!Array.isArray(tableData)) {
        throw new Error('Response is not a valid JSON array');
      }
      
      return tableData;
    } catch (parseError) {
      console.error('Error parsing custom table response:', parseError);
      
      // Return a simple table with basic information
      return [
        {
          title: title || 'Custom Financial Data',
          description: description || 'Custom table based on document data',
          error: 'Could not generate custom table',
          securities_count: securities.length,
          portfolio_value: portfolioSummary.total_value || 'N/A',
          currency: portfolioSummary.currency || 'N/A'
        }
      ];
    }
  } catch (error) {
    console.error('Error generating custom table:', error);
    throw error;
  }
};

module.exports = {
  sendMessage,
  getChatHistory,
  clearChatHistory,
  askQuestion,
  generateTable
};
