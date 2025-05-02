/**
 * Feedback Controller
 * 
 * This controller handles user feedback.
 */

const { v4: uuidv4 } = require('uuid');
const { supabase } = require('../services/supabaseService');

/**
 * Submit feedback
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @returns {Promise<void>}
 */
const submitFeedback = async (req, res) => {
  try {
    const { type, message, page } = req.body;
    
    // Validate input
    if (!type || !message) {
      return res.status(400).json({
        success: false,
        error: 'Type and message are required'
      });
    }
    
    // Create feedback
    const feedback = {
      id: uuidv4(),
      type,
      message,
      page: page || null,
      user_id: req.user?.id || null,
      tenant_id: req.tenantId || null,
      status: 'new',
      created_at: new Date().toISOString()
    };
    
    // Save feedback
    const { data, error } = await supabase
      .from('feedback')
      .insert(feedback)
      .select()
      .single();
    
    if (error) {
      console.error('Error saving feedback:', error);
      return res.status(500).json({
        success: false,
        error: 'Error saving feedback'
      });
    }
    
    return res.status(201).json({
      success: true,
      data
    });
  } catch (error) {
    console.error('Error submitting feedback:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Get feedback
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @returns {Promise<void>}
 */
const getFeedback = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized'
      });
    }
    
    // Get feedback
    const { data, error } = await supabase
      .from('feedback')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error getting feedback:', error);
      return res.status(500).json({
        success: false,
        error: 'Error getting feedback'
      });
    }
    
    return res.json({
      success: true,
      data
    });
  } catch (error) {
    console.error('Error getting feedback:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Update feedback status
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @returns {Promise<void>}
 */
const updateFeedbackStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized'
      });
    }
    
    // Validate input
    if (!status) {
      return res.status(400).json({
        success: false,
        error: 'Status is required'
      });
    }
    
    // Update feedback
    const { data, error } = await supabase
      .from('feedback')
      .update({ status })
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating feedback:', error);
      return res.status(500).json({
        success: false,
        error: 'Error updating feedback'
      });
    }
    
    return res.json({
      success: true,
      data
    });
  } catch (error) {
    console.error('Error updating feedback:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

module.exports = {
  submitFeedback,
  getFeedback,
  updateFeedbackStatus
};
