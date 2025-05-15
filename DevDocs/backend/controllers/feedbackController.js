/**
 * Feedback Controller
 * 
 * Handles user feedback and analytics data collection.
 */

const logger = require('../utils/logger');
const { asyncHandler } = require('../middleware/errorMiddleware');
const { BadRequestError, NotFoundError, ForbiddenError } = require('../middleware/errorMiddleware');
const { getSupabaseClient } = require('../db/supabase');
const emailService = require('../services/emailService');

/**
 * Submit user feedback
 * @route POST /api/feedback
 * @access Private
 */
const submitFeedback = asyncHandler(async (req, res) => {
  const { type, subject, content, rating, metadata = {} } = req.body;
  const { user } = req;
  
  // Validate required fields
  if (!type || !subject || !content) {
    throw new BadRequestError('Type, subject, and content are required');
  }
  
  // Validate rating if provided
  if (rating && (rating < 1 || rating > 5)) {
    throw new BadRequestError('Rating must be between 1 and 5');
  }
  
  const supabase = getSupabaseClient();
  
  // Insert feedback
  const { data, error } = await supabase
    .from('feedback')
    .insert({
      organization_id: user.organization_id,
      user_id: user.id,
      type,
      subject,
      content,
      rating,
      metadata,
      status: 'pending'
    })
    .select()
    .single();
  
  if (error) {
    logger.error(`Error submitting feedback: ${error.message}`);
    throw new Error('Failed to submit feedback');
  }
  
  // Log feedback submission
  logger.info(`Feedback submitted by user: ${user.id}, type: ${type}`);
  
  // Create analytics event for feedback submission
  await supabase
    .from('analytics_events')
    .insert({
      organization_id: user.organization_id,
      user_id: user.id,
      event_type: 'feedback_submitted',
      event_data: {
        feedback_id: data.id,
        feedback_type: type,
        rating
      }
    });
  
  // Send email notification to administrators
  try {
    // Get admin emails for the organization
    const { data: adminData, error: adminError } = await supabase
      .from('users')
      .select('email')
      .eq('organization_id', user.organization_id)
      .eq('role', 'admin');
    
    if (!adminError && adminData && adminData.length > 0) {
      const adminEmails = adminData.map(admin => admin.email);
      
      // Send notification
      await emailService.sendFeedbackNotification(data, adminEmails);
    }
  } catch (emailError) {
    // Log but don't fail the request if email sending fails
    logger.error(`Error sending feedback notification email: ${emailError.message}`);
  }
  
  res.status(201).json({
    status: 'success',
    data: {
      feedback: data
    }
  });
});

/**
 * Get user feedback history
 * @route GET /api/feedback
 * @access Private
 */
const getFeedbackHistory = asyncHandler(async (req, res) => {
  const { user } = req;
  const { status, type, limit = 20, offset = 0 } = req.query;
  
  const supabase = getSupabaseClient();
  
  // Build query
  let query = supabase
    .from('feedback')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);
  
  // Add filters if provided
  if (status) {
    query = query.eq('status', status);
  }
  
  if (type) {
    query = query.eq('type', type);
  }
  
  // Execute query
  const { data, error, count } = await query;
  
  if (error) {
    logger.error(`Error fetching feedback: ${error.message}`);
    throw new Error('Failed to fetch feedback history');
  }
  
  res.json({
    status: 'success',
    data: {
      feedback: data,
      pagination: {
        total: count,
        offset: parseInt(offset),
        limit: parseInt(limit)
      }
    }
  });
});

/**
 * Get feedback by ID
 * @route GET /api/feedback/:id
 * @access Private
 */
const getFeedbackById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { user } = req;
  
  const supabase = getSupabaseClient();
  
  // Fetch feedback
  const { data, error } = await supabase
    .from('feedback')
    .select('*, feedback_responses(*)')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();
  
  if (error || !data) {
    throw new NotFoundError('Feedback not found');
  }
  
  res.json({
    status: 'success',
    data: {
      feedback: data
    }
  });
});

/**
 * Update feedback
 * @route PUT /api/feedback/:id
 * @access Private
 */
const updateFeedback = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { type, subject, content, rating, metadata } = req.body;
  const { user } = req;
  
  const supabase = getSupabaseClient();
  
  // Check if feedback exists and belongs to user
  const { data: existingFeedback, error: fetchError } = await supabase
    .from('feedback')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();
  
  if (fetchError || !existingFeedback) {
    throw new NotFoundError('Feedback not found');
  }
  
  // Prevent updating resolved feedback
  if (existingFeedback.status === 'resolved') {
    throw new ForbiddenError('Cannot update resolved feedback');
  }
  
  // Update feedback
  const { data, error } = await supabase
    .from('feedback')
    .update({
      type: type || existingFeedback.type,
      subject: subject || existingFeedback.subject,
      content: content || existingFeedback.content,
      rating: rating || existingFeedback.rating,
      metadata: { ...existingFeedback.metadata, ...(metadata || {}) },
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single();
  
  if (error) {
    logger.error(`Error updating feedback: ${error.message}`);
    throw new Error('Failed to update feedback');
  }
  
  // Log feedback update
  logger.info(`Feedback updated by user: ${user.id}, id: ${id}`);
  
  res.json({
    status: 'success',
    data: {
      feedback: data
    }
  });
});

/**
 * Delete feedback
 * @route DELETE /api/feedback/:id
 * @access Private
 */
const deleteFeedback = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { user } = req;
  
  const supabase = getSupabaseClient();
  
  // Check if feedback exists and belongs to user
  const { data: existingFeedback, error: fetchError } = await supabase
    .from('feedback')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();
  
  if (fetchError || !existingFeedback) {
    throw new NotFoundError('Feedback not found');
  }
  
  // Prevent deleting feedback with responses
  const { count: responseCount, error: countError } = await supabase
    .from('feedback_responses')
    .select('id', { count: 'exact' })
    .eq('feedback_id', id);
  
  if (!countError && responseCount > 0) {
    throw new ForbiddenError('Cannot delete feedback with responses');
  }
  
  // Delete feedback
  const { error } = await supabase
    .from('feedback')
    .delete()
    .eq('id', id);
  
  if (error) {
    logger.error(`Error deleting feedback: ${error.message}`);
    throw new Error('Failed to delete feedback');
  }
  
  // Log feedback deletion
  logger.info(`Feedback deleted by user: ${user.id}, id: ${id}`);
  
  res.json({
    status: 'success',
    message: 'Feedback deleted successfully'
  });
});

/**
 * Track analytics event
 * @route POST /api/feedback/analytics
 * @access Private
 */
const trackAnalyticsEvent = asyncHandler(async (req, res) => {
  const { event_type, event_data = {} } = req.body;
  const { user } = req;
  
  if (!event_type) {
    throw new BadRequestError('Event type is required');
  }
  
  const supabase = getSupabaseClient();
  
  // Insert analytics event
  const { error } = await supabase
    .from('analytics_events')
    .insert({
      organization_id: user.organization_id,
      user_id: user.id,
      event_type,
      event_data
    });
  
  if (error) {
    logger.error(`Error tracking analytics event: ${error.message}`);
    throw new Error('Failed to track analytics event');
  }
  
  res.status(201).json({
    status: 'success',
    message: 'Analytics event tracked successfully'
  });
});

/**
 * Get feedback categories
 * @route GET /api/feedback/categories
 * @access Private
 */
const getFeedbackCategories = asyncHandler(async (req, res) => {
  const { user } = req;
  
  const supabase = getSupabaseClient();
  
  // Get feedback categories
  const { data, error } = await supabase
    .from('feedback_categories')
    .select('*')
    .order('display_order', { ascending: true });
  
  if (error) {
    logger.error(`Error fetching feedback categories: ${error.message}`);
    throw new Error('Failed to fetch feedback categories');
  }
  
  res.json({
    status: 'success',
    data: {
      categories: data
    }
  });
});

// Admin endpoints

/**
 * Get all feedback (admin only)
 * @route GET /api/feedback/admin
 * @access Admin
 */
const getAllFeedback = asyncHandler(async (req, res) => {
  const { user } = req;
  const { status, type, limit = 50, offset = 0 } = req.query;
  
  // Check admin permission
  if (user.role !== 'admin') {
    throw new ForbiddenError('Unauthorized access');
  }
  
  const supabase = getSupabaseClient();
  
  // Build query
  let query = supabase
    .from('feedback')
    .select('*, users(id, email, first_name, last_name)')
    .eq('organization_id', user.organization_id)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);
  
  // Add filters if provided
  if (status) {
    query = query.eq('status', status);
  }
  
  if (type) {
    query = query.eq('type', type);
  }
  
  // Execute query
  const { data, error, count } = await query;
  
  if (error) {
    logger.error(`Error fetching all feedback: ${error.message}`);
    throw new Error('Failed to fetch feedback');
  }
  
  res.json({
    status: 'success',
    data: {
      feedback: data,
      pagination: {
        total: count,
        offset: parseInt(offset),
        limit: parseInt(limit)
      }
    }
  });
});

/**
 * Update feedback status (admin only)
 * @route PUT /api/feedback/admin/:id
 * @access Admin
 */
const updateFeedbackStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status, admin_notes } = req.body;
  const { user } = req;
  
  // Check admin permission
  if (user.role !== 'admin') {
    throw new ForbiddenError('Unauthorized access');
  }
  
  if (!status) {
    throw new BadRequestError('Status is required');
  }
  
  const validStatuses = ['pending', 'in_progress', 'resolved', 'rejected'];
  if (!validStatuses.includes(status)) {
    throw new BadRequestError(`Status must be one of: ${validStatuses.join(', ')}`);
  }
  
  const supabase = getSupabaseClient();
  
  // Get original feedback to check for status change
  const { data: originalFeedback, error: originalError } = await supabase
    .from('feedback')
    .select('status, user_id')
    .eq('id', id)
    .single();
  
  if (originalError) {
    logger.error(`Error fetching original feedback: ${originalError.message}`);
    throw new Error('Failed to fetch original feedback');
  }
  
  // Update feedback status
  const { data, error } = await supabase
    .from('feedback')
    .update({
      status,
      admin_notes: admin_notes || null,
      resolved_at: status === 'resolved' ? new Date().toISOString() : null,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .eq('organization_id', user.organization_id)
    .select()
    .single();
  
  if (error) {
    logger.error(`Error updating feedback status: ${error.message}`);
    throw new Error('Failed to update feedback status');
  }
  
  // Log status update
  logger.info(`Feedback status updated by admin: ${user.id}, feedback: ${id}, status: ${status}`);
  
  // Send email notification if status changed
  if (originalFeedback.status !== status && originalFeedback.user_id) {
    try {
      // Get user email
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('email')
        .eq('id', originalFeedback.user_id)
        .single();
      
      if (!userError && userData && userData.email) {
        // Send status update notification
        await emailService.sendFeedbackStatusUpdateNotification(data, userData.email);
        logger.info(`Status update notification email sent to: ${userData.email}`);
      }
    } catch (emailError) {
      // Log but don't fail the request if email sending fails
      logger.error(`Error sending status update notification email: ${emailError.message}`);
    }
  }
  
  res.json({
    status: 'success',
    data: {
      feedback: data
    }
  });
});

/**
 * Add response to feedback (admin only)
 * @route POST /api/feedback/admin/:id/responses
 * @access Admin
 */
const addFeedbackResponse = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { content } = req.body;
  const { user } = req;
  
  // Check admin permission
  if (user.role !== 'admin') {
    throw new ForbiddenError('Unauthorized access');
  }
  
  if (!content) {
    throw new BadRequestError('Response content is required');
  }
  
  const supabase = getSupabaseClient();
  
  // Verify feedback exists and belongs to the organization
  const { data: feedback, error: feedbackError } = await supabase
    .from('feedback')
    .select('id, organization_id, user_id, subject')
    .eq('id', id)
    .eq('organization_id', user.organization_id)
    .single();
  
  if (feedbackError || !feedback) {
    throw new NotFoundError('Feedback not found');
  }
  
  // Add response
  const { data, error } = await supabase
    .from('feedback_responses')
    .insert({
      feedback_id: id,
      user_id: user.id,
      content,
      is_admin_response: true
    })
    .select()
    .single();
  
  if (error) {
    logger.error(`Error adding feedback response: ${error.message}`);
    throw new Error('Failed to add response');
  }
  
  // Update feedback status to in_progress if it was pending
  await supabase
    .from('feedback')
    .update({
      status: 'in_progress',
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .eq('status', 'pending');
  
  // Log response added
  logger.info(`Feedback response added by admin: ${user.id}, feedback: ${id}`);
  
  // Send email notification to the user
  if (feedback.user_id) {
    try {
      // Get user email
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('email')
        .eq('id', feedback.user_id)
        .single();
      
      if (!userError && userData && userData.email) {
        // Send response notification
        await emailService.sendFeedbackResponseNotification(feedback, data, userData.email);
        logger.info(`Response notification email sent to: ${userData.email}`);
      }
    } catch (emailError) {
      // Log but don't fail the request if email sending fails
      logger.error(`Error sending response notification email: ${emailError.message}`);
    }
  }
  
  res.status(201).json({
    status: 'success',
    data: {
      response: data
    }
  });
});

/**
 * Get analytics summary (admin only)
 * @route GET /api/feedback/admin/analytics
 * @access Admin
 */
const getAnalyticsSummary = asyncHandler(async (req, res) => {
  const { user } = req;
  const { period = '30d' } = req.query;
  
  // Check admin permission
  if (user.role !== 'admin') {
    throw new ForbiddenError('Unauthorized access');
  }
  
  const supabase = getSupabaseClient();
  
  // Determine date range based on period
  let startDate;
  const now = new Date();
  
  switch (period) {
    case '7d':
      startDate = new Date(now.setDate(now.getDate() - 7));
      break;
    case '30d':
      startDate = new Date(now.setDate(now.getDate() - 30));
      break;
    case '90d':
      startDate = new Date(now.setDate(now.getDate() - 90));
      break;
    case '365d':
      startDate = new Date(now.setDate(now.getDate() - 365));
      break;
    default:
      startDate = new Date(now.setDate(now.getDate() - 30));
  }
  
  // Format date for database query
  const startDateStr = startDate.toISOString();
  
  // Get analytics summary
  const { data: summary, error: summaryError } = await supabase
    .from('analytics_summary')
    .select('*')
    .eq('organization_id', user.organization_id)
    .single();
  
  if (summaryError) {
    logger.error(`Error fetching analytics summary: ${summaryError.message}`);
    throw new Error('Failed to fetch analytics summary');
  }
  
  // Get feedback by status
  const { data: feedbackStats, error: feedbackError } = await supabase
    .from('feedback')
    .select('status, count(*)')
    .eq('organization_id', user.organization_id)
    .gte('created_at', startDateStr)
    .group('status');
  
  if (feedbackError) {
    logger.error(`Error fetching feedback stats: ${feedbackError.message}`);
    throw new Error('Failed to fetch feedback statistics');
  }
  
  // Get feedback by type
  const { data: feedbackTypeStats, error: typeError } = await supabase
    .from('feedback')
    .select('type, count(*)')
    .eq('organization_id', user.organization_id)
    .gte('created_at', startDateStr)
    .group('type');
  
  if (typeError) {
    logger.error(`Error fetching feedback type stats: ${typeError.message}`);
    throw new Error('Failed to fetch feedback type statistics');
  }
  
  // Get user metrics
  const { data: userMetrics, error: userError } = await supabase
    .from('user_metrics')
    .select('metric_name, metric_value, updated_at')
    .eq('organization_id', user.organization_id)
    .order('updated_at', { ascending: false });
  
  if (userError) {
    logger.error(`Error fetching user metrics: ${userError.message}`);
    throw new Error('Failed to fetch user metrics');
  }
  
  res.json({
    status: 'success',
    data: {
      summary,
      feedback_stats: feedbackStats,
      feedback_type_stats: feedbackTypeStats,
      user_metrics: userMetrics,
      period
    }
  });
});

module.exports = {
  submitFeedback,
  getFeedbackHistory,
  getFeedbackById,
  updateFeedback,
  deleteFeedback,
  trackAnalyticsEvent,
  getFeedbackCategories,
  getAllFeedback,
  updateFeedbackStatus,
  addFeedbackResponse,
  getAnalyticsSummary
};