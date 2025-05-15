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
 * API handler for analytics events
 * 
 * This endpoint tracks analytics events and retrievals analytics summaries.
 * 
 * @param {Object} req - Next.js request object
 * @param {Object} res - Next.js response object
 */
export default async function handler(req, res) {
  // Handle different HTTP methods
  switch (req.method) {
    case 'POST':
      return handleTrackEvent(req, res);
    case 'GET':
      return handleGetAnalytics(req, res);
    default:
      return res.status(405).json({ 
        status: 'error',
        message: 'Method not allowed' 
      });
  }
}

/**
 * Handle tracking analytics events
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
async function handleTrackEvent(req, res) {
  try {
    const { event_type, event_data = {} } = req.body;

    // Basic validation
    if (!event_type) {
      return res.status(400).json({ 
        status: 'error',
        message: 'Event type is required' 
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

    // Insert analytics event
    const { error } = await supabase
      .from('analytics_events')
      .insert({
        organization_id: organizationId,
        user_id: user?.id || 'anonymous',
        event_type,
        event_data,
        created_at: new Date().toISOString()
      });

    if (error) {
      console.error('Error tracking analytics event:', error);
      return res.status(500).json({ 
        status: 'error',
        message: 'Failed to track analytics event', 
        error: error.message 
      });
    }

    return res.status(201).json({
      status: 'success',
      message: 'Analytics event tracked successfully'
    });
  } catch (error) {
    console.error('Error tracking analytics event:', error);
    return res.status(500).json({ 
      status: 'error',
      message: 'Internal server error', 
      error: error.message 
    });
  }
}

/**
 * Handle retrieving analytics summary (admin only)
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
async function handleGetAnalytics(req, res) {
  try {
    const { period = '30d' } = req.query;
    
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
      console.error('Error fetching analytics summary:', summaryError);
      return res.status(500).json({ 
        status: 'error',
        message: 'Failed to fetch analytics summary', 
        error: summaryError.message 
      });
    }
    
    // Get feedback by status
    const { data: feedbackStats, error: feedbackError } = await supabase
      .from('feedback')
      .select('status, count(*)')
      .eq('organization_id', user.organization_id)
      .gte('created_at', startDateStr)
      .group('status');
    
    if (feedbackError) {
      console.error('Error fetching feedback stats:', feedbackError);
      return res.status(500).json({ 
        status: 'error',
        message: 'Failed to fetch feedback statistics', 
        error: feedbackError.message 
      });
    }
    
    // Get feedback by type
    const { data: feedbackTypeStats, error: typeError } = await supabase
      .from('feedback')
      .select('type, count(*)')
      .eq('organization_id', user.organization_id)
      .gte('created_at', startDateStr)
      .group('type');
    
    if (typeError) {
      console.error('Error fetching feedback type stats:', typeError);
      return res.status(500).json({ 
        status: 'error',
        message: 'Failed to fetch feedback type statistics', 
        error: typeError.message 
      });
    }
    
    // Get user metrics
    const { data: userMetrics, error: userError } = await supabase
      .from('user_metrics')
      .select('metric_name, metric_value, updated_at')
      .eq('organization_id', user.organization_id)
      .order('updated_at', { ascending: false });
    
    if (userError) {
      console.error('Error fetching user metrics:', userError);
      return res.status(500).json({ 
        status: 'error',
        message: 'Failed to fetch user metrics', 
        error: userError.message 
      });
    }
    
    return res.status(200).json({
      status: 'success',
      data: {
        summary,
        feedback_stats: feedbackStats,
        feedback_type_stats: feedbackTypeStats,
        user_metrics: userMetrics,
        period
      }
    });
  } catch (error) {
    console.error('Error fetching analytics summary:', error);
    return res.status(500).json({ 
      status: 'error',
      message: 'Internal server error', 
      error: error.message 
    });
  }
}