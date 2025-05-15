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
 * API handler for feedback submissions
 * 
 * This endpoint receives user feedback and stores it in the Supabase database.
 * It also sends notifications to administrators for urgent feedback.
 * 
 * @param {Object} req - Next.js request object
 * @param {Object} res - Next.js response object
 */
export default async function handler(req, res) {
  // Handle different HTTP methods
  switch (req.method) {
    case 'POST':
      return handleSubmitFeedback(req, res);
    case 'GET':
      return handleGetFeedback(req, res);
    default:
      return res.status(405).json({ message: 'Method not allowed' });
  }
}

/**
 * Handle feedback submission
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
async function handleSubmitFeedback(req, res) {
  try {
    const {
      type,
      subject,
      content,
      rating,
      metadata,
      timestamp,
      userAgent,
      userId
    } = req.body;

    // Basic validation
    if (!type || !subject || !content) {
      return res.status(400).json({ 
        status: 'error',
        message: 'Missing required fields: type, subject, and content are required' 
      });
    }

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

    // Get organization ID from user or use default
    const organizationId = user?.organization_id || process.env.DEFAULT_ORGANIZATION_ID;

    if (!organizationId) {
      return res.status(400).json({ 
        status: 'error',
        message: 'Organization ID is required' 
      });
    }

    // Prepare feedback data for storage
    const feedbackData = {
      organization_id: organizationId,
      user_id: user?.id || userId || 'anonymous',
      type,
      subject,
      content,
      rating: rating ? parseInt(rating, 10) : null,
      metadata: metadata || {},
      status: 'pending',
      created_at: timestamp || new Date().toISOString(),
      updated_at: timestamp || new Date().toISOString()
    };

    // Store feedback in Supabase
    const { data, error } = await supabase
      .from('feedback')
      .insert([feedbackData])
      .select();

    if (error) {
      console.error('Error storing feedback:', error);
      return res.status(500).json({ 
        status: 'error',
        message: 'Failed to store feedback', 
        error: error.message 
      });
    }

    // Create analytics event for feedback submission
    await supabase
      .from('analytics_events')
      .insert({
        organization_id: organizationId,
        user_id: user?.id || userId || 'anonymous',
        event_type: 'feedback_submitted',
        event_data: {
          feedback_id: data[0].id,
          feedback_type: type,
          rating: rating
        }
      });

    // For bug reports, send notification to administrators (placeholder for future implementation)
    if (type === 'bug_report') {
      console.log('Bug report received:', feedbackData);
    }

    // Return success response with the stored feedback data
    return res.status(201).json({
      status: 'success',
      data: {
        feedback: data[0]
      }
    });
  } catch (error) {
    console.error('Error processing feedback:', error);
    return res.status(500).json({ 
      status: 'error',
      message: 'Internal server error', 
      error: error.message 
    });
  }
}

/**
 * Handle feedback retrieval
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
async function handleGetFeedback(req, res) {
  try {
    const { id, status, type, limit = 20, offset = 0 } = req.query;
    
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

    // If no user is authenticated, return unauthorized
    if (!user) {
      return res.status(401).json({ 
        status: 'error',
        message: 'Unauthorized access' 
      });
    }

    // If an ID is provided, return a specific feedback item
    if (id) {
      const { data, error } = await supabase
        .from('feedback')
        .select('*, feedback_responses(*)')
        .eq('id', id)
        .eq('user_id', user.id)
        .single();

      if (error || !data) {
        return res.status(404).json({ 
          status: 'error',
          message: 'Feedback not found' 
        });
      }

      return res.status(200).json({
        status: 'success',
        data: {
          feedback: data
        }
      });
    }

    // Otherwise, return a list of feedback items
    let query = supabase
      .from('feedback')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id)
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
      console.error('Error fetching feedback:', error);
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
    console.error('Error fetching feedback:', error);
    return res.status(500).json({ 
      status: 'error',
      message: 'Internal server error', 
      error: error.message 
    });
  }
}
