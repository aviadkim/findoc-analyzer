/**
 * Chat Controller
 *
 * This file contains the controller functions for chat-related operations.
 */

const { v4: uuidv4 } = require('uuid');
const { queryDocumentWithAgents } = require('../../agent_system');
const { supabase } = require('../services/supabaseService');

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
    const tenantId = req.tenantId;
    const userId = req.user?.id;

    if (!tenantId) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized'
      });
    }

    // Check if document exists and belongs to tenant
    const { data: document, error: documentError } = await supabase
      .from('documents')
      .select('*')
      .eq('id', documentId)
      .eq('tenant_id', tenantId)
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

    // Query document with agents
    const response = await queryDocumentWithAgents(documentId, message, { tenantId });

    // Add assistant message to chat history
    const assistantMessage = {
      id: uuidv4(),
      role: 'assistant',
      content: response.answer,
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
    const tenantId = req.tenantId;
    const userId = req.user?.id;

    if (!tenantId) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized'
      });
    }

    // Check if document exists and belongs to tenant
    const { data: document, error: documentError } = await supabase
      .from('documents')
      .select('*')
      .eq('id', documentId)
      .eq('tenant_id', tenantId)
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
    const tenantId = req.tenantId;
    const userId = req.user?.id;

    if (!tenantId) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized'
      });
    }

    // Check if document exists and belongs to tenant
    const { data: document, error: documentError } = await supabase
      .from('documents')
      .select('*')
      .eq('id', documentId)
      .eq('tenant_id', tenantId)
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
      data: {}
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
    const tenantId = req.tenantId;

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

    // Query document with agents
    const response = await queryDocumentWithAgents(id, question, { tenantId });

    // Return response
    return res.json({
      success: true,
      data: {
        answer: response.answer
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

module.exports = {
  sendMessage,
  getChatHistory,
  clearChatHistory,
  askQuestion
};
