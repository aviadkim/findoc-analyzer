import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Validate environment variables
if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
}

const supabase = createClient(
  supabaseUrl || '',
  supabaseServiceKey || ''
);

/**
 * API handler for admin feedback management
 * 
 * This endpoint is for administrators to manage feedback items.
 * 
 * @param {Object} req - Next.js request object
 * @param {Object} res - Next.js response object
 */
export default async function handler(req, res) {
  try {
    // Get user information if authenticated
    let user = null;
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      
      // Verify the token and get user info
      const { data: userData, error: userError } = await supabase.auth.getUser(token);
      
      if (!userError && userData) {
        user = userData;
      }
    }

    // If no user is authenticated or user is not an admin, return unauthorized
    if (!user || user.role !== 'admin') {
      return res.status(401).json({ 
        status: 'error',
        message: 'Unauthorized access' 
      });
    }

    // Handle different HTTP methods
    switch (req.method) {
      case 'GET':
        return handleGetAllFeedback(req, res, user);
      case 'PUT':
        return handleUpdateFeedbackStatus(req, res, user);
      case 'POST':
        return handleAddResponse(req, res, user);
      default:
        return res.status(405).json({ 
          status: 'error',
          message: 'Method not allowed' 
        });
    }
  } catch (error) {
    console.error('Error in admin feedback handler:', error);
    return res.status(500).json({ 
      status: 'error',
      message: 'Internal server error', 
      error: error.message 
    });
  }
}

/**
 * Handle getting all feedback (admin only)
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {Object} user - Authenticated user
 */
async function handleGetAllFeedback(req, res, user) {
  try {
    const { status, type, limit = 50, offset = 0 } = req.query;
    
    // Build query
    let query = supabase
      .from('feedback')
      .select('*, users(id, email, first_name, last_name)', { count: 'exact' })
      .eq('organization_id', user.organization_id)
      .order('created_at', { ascending: false })
      .range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1);
    
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
      console.error('Error fetching all feedback:', error);
      return res.status(500).json({ 
        status: 'error',
        message: 'Failed to fetch feedback', 
        error: error.message 
      });
    }
    
    return res.status(200).json({
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
  } catch (error) {
    console.error('Error fetching all feedback:', error);
    return res.status(500).json({ 
      status: 'error',
      message: 'Internal server error', 
      error: error.message 
    });
  }
}

/**
 * Handle updating feedback status (admin only)
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {Object} user - Authenticated user
 */
async function handleUpdateFeedbackStatus(req, res, user) {
  try {
    const { id } = req.query;
    const { status, admin_notes } = req.body;
    
    if (!id) {
      return res.status(400).json({ 
        status: 'error',
        message: 'Feedback ID is required' 
      });
    }
    
    if (!status) {
      return res.status(400).json({ 
        status: 'error',
        message: 'Status is required' 
      });
    }
    
    const validStatuses = ['pending', 'in_progress', 'resolved', 'rejected'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        status: 'error',
        message: `Status must be one of: ${validStatuses.join(', ')}` 
      });
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
      console.error('Error updating feedback status:', error);
      return res.status(500).json({ 
        status: 'error',
        message: 'Failed to update feedback status', 
        error: error.message 
      });
    }
    
    // Log status update
    console.log(`Feedback status updated by admin: ${user.id}, feedback: ${id}, status: ${status}`);
    
    return res.status(200).json({
      status: 'success',
      data: {
        feedback: data
      }
    });
  } catch (error) {
    console.error('Error updating feedback status:', error);
    return res.status(500).json({ 
      status: 'error',
      message: 'Internal server error', 
      error: error.message 
    });
  }
}

/**
 * Handle adding a response to feedback (admin only)
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {Object} user - Authenticated user
 */
async function handleAddResponse(req, res, user) {
  try {
    const { id } = req.query;
    const { content } = req.body;
    
    if (!id) {
      return res.status(400).json({ 
        status: 'error',
        message: 'Feedback ID is required' 
      });
    }
    
    if (!content) {
      return res.status(400).json({ 
        status: 'error',
        message: 'Response content is required' 
      });
    }
    
    // Verify feedback exists and belongs to the organization
    const { data: feedback, error: feedbackError } = await supabase
      .from('feedback')
      .select('id, organization_id, user_id')
      .eq('id', id)
      .eq('organization_id', user.organization_id)
      .single();
    
    if (feedbackError || !feedback) {
      return res.status(404).json({ 
        status: 'error',
        message: 'Feedback not found' 
      });
    }
    
    // Add response
    const { data, error } = await supabase
      .from('feedback_responses')
      .insert({
        feedback_id: id,
        user_id: user.id,
        content,
        is_admin_response: true,
        created_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error adding feedback response:', error);
      return res.status(500).json({ 
        status: 'error',
        message: 'Failed to add response', 
        error: error.message 
      });
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
    console.log(`Feedback response added by admin: ${user.id}, feedback: ${id}`);
    
    return res.status(201).json({
      status: 'success',
      data: {
        response: data
      }
    });
  } catch (error) {
    console.error('Error adding feedback response:', error);
    return res.status(500).json({ 
      status: 'error',
      message: 'Internal server error', 
      error: error.message 
    });
  }
}