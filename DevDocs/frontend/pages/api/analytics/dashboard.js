import { createClient } from '@supabase/supabase-js';
import { format, subDays, eachDayOfInterval } from 'date-fns';

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
 * API handler for analytics dashboard data
 * 
 * This endpoint retrieves analytics data for the dashboard.
 * 
 * @param {Object} req - Next.js request object
 * @param {Object} res - Next.js response object
 */
export default async function handler(req, res) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const {
      tenant_id,
      start_date,
      end_date
    } = req.query;

    // Basic validation
    if (!tenant_id) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Parse dates
    const startDate = start_date ? new Date(start_date) : subDays(new Date(), 7);
    const endDate = end_date ? new Date(end_date) : new Date();

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

    // Check if user has access to the tenant
    if (user && tenant_id !== user.id) {
      const { data: memberData, error: memberError } = await supabase
        .from('organization_members')
        .select('*')
        .eq('user_id', user.id)
        .eq('organization_id', tenant_id)
        .single();
      
      if (memberError || !memberData) {
        return res.status(403).json({ message: 'Unauthorized access to tenant data' });
      }
    }

    // Fetch page views data
    const pageViewsData = await getPageViewsData(tenant_id, startDate, endDate);
    
    // Fetch feature usage data
    const featureUsageData = await getFeatureUsageData(tenant_id, startDate, endDate);
    
    // Fetch document processing data
    const documentProcessingData = await getDocumentProcessingData(tenant_id, startDate, endDate);
    
    // Fetch errors data
    const errorsData = await getErrorsData(tenant_id, startDate, endDate);
    
    // Fetch feedback data
    const feedbackData = await getFeedbackData(tenant_id, startDate, endDate);

    // Return analytics data
    return res.status(200).json({
      pageViews: pageViewsData,
      featureUsage: featureUsageData,
      documentProcessing: documentProcessingData,
      errors: errorsData,
      feedback: feedbackData
    });
  } catch (error) {
    console.error('Error retrieving analytics data:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
}

/**
 * Get page views data
 * @param {string} tenantId - Tenant ID
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @returns {Array} Page views data
 */
async function getPageViewsData(tenantId, startDate, endDate) {
  try {
    // Generate date intervals
    const dates = eachDayOfInterval({ start: startDate, end: endDate });
    
    // Fetch page view events from analytics_events table
    const { data, error } = await supabase
      .from('analytics_events')
      .select('*')
      .eq('tenant_id', tenantId)
      .eq('event_type', 'page_view')
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString());
    
    if (error) {
      console.error('Error fetching page views data:', error);
      return [];
    }
    
    // Group data by date
    const pageViewsByDate = dates.map(date => {
      const dateStr = format(date, 'yyyy-MM-dd');
      const count = data.filter(event => {
        const eventDate = new Date(event.created_at);
        return format(eventDate, 'yyyy-MM-dd') === dateStr;
      }).length;
      
      return {
        date: dateStr,
        count
      };
    });
    
    return pageViewsByDate;
  } catch (error) {
    console.error('Error in getPageViewsData:', error);
    return [];
  }
}

/**
 * Get feature usage data
 * @param {string} tenantId - Tenant ID
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @returns {Array} Feature usage data
 */
async function getFeatureUsageData(tenantId, startDate, endDate) {
  try {
    // Fetch feature usage events from analytics_events table
    const { data, error } = await supabase
      .from('analytics_events')
      .select('*')
      .eq('tenant_id', tenantId)
      .eq('event_type', 'feature_usage')
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString());
    
    if (error) {
      console.error('Error fetching feature usage data:', error);
      return [];
    }
    
    // Group data by feature name
    const featureUsage = {};
    
    data.forEach(event => {
      const featureName = event.event_data?.feature_name || 'Unknown';
      
      if (!featureUsage[featureName]) {
        featureUsage[featureName] = 0;
      }
      
      featureUsage[featureName]++;
    });
    
    // Convert to array format
    const featureUsageArray = Object.entries(featureUsage).map(([feature_name, count]) => ({
      feature_name,
      count
    }));
    
    // Sort by count in descending order
    return featureUsageArray.sort((a, b) => b.count - a.count);
  } catch (error) {
    console.error('Error in getFeatureUsageData:', error);
    return [];
  }
}

/**
 * Get document processing data
 * @param {string} tenantId - Tenant ID
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @returns {Array} Document processing data
 */
async function getDocumentProcessingData(tenantId, startDate, endDate) {
  try {
    // Fetch document processing events from analytics_events table
    const { data, error } = await supabase
      .from('analytics_events')
      .select('*')
      .eq('tenant_id', tenantId)
      .eq('event_type', 'document_processing')
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString());
    
    if (error) {
      console.error('Error fetching document processing data:', error);
      return [];
    }
    
    // Group data by document type
    const documentProcessing = {};
    
    data.forEach(event => {
      const documentType = event.event_data?.document_type || 'Unknown';
      
      if (!documentProcessing[documentType]) {
        documentProcessing[documentType] = 0;
      }
      
      documentProcessing[documentType]++;
    });
    
    // Convert to array format
    const documentProcessingArray = Object.entries(documentProcessing).map(([document_type, count]) => ({
      document_type,
      count
    }));
    
    // Sort by count in descending order
    return documentProcessingArray.sort((a, b) => b.count - a.count);
  } catch (error) {
    console.error('Error in getDocumentProcessingData:', error);
    return [];
  }
}

/**
 * Get errors data
 * @param {string} tenantId - Tenant ID
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @returns {Array} Errors data
 */
async function getErrorsData(tenantId, startDate, endDate) {
  try {
    // Fetch error events from analytics_events table
    const { data, error } = await supabase
      .from('analytics_events')
      .select('*')
      .eq('tenant_id', tenantId)
      .eq('event_type', 'error')
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString());
    
    if (error) {
      console.error('Error fetching errors data:', error);
      return [];
    }
    
    // Group data by error type
    const errors = {};
    
    data.forEach(event => {
      const errorType = event.event_data?.error_type || 'Unknown';
      
      if (!errors[errorType]) {
        errors[errorType] = 0;
      }
      
      errors[errorType]++;
    });
    
    // Convert to array format
    const errorsArray = Object.entries(errors).map(([error_type, count]) => ({
      error_type,
      count
    }));
    
    // Sort by count in descending order
    return errorsArray.sort((a, b) => b.count - a.count);
  } catch (error) {
    console.error('Error in getErrorsData:', error);
    return [];
  }
}

/**
 * Get feedback data
 * @param {string} tenantId - Tenant ID
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @returns {Array} Feedback data
 */
async function getFeedbackData(tenantId, startDate, endDate) {
  try {
    // Fetch feedback from feedback table
    const { data, error } = await supabase
      .from('feedback')
      .select('*')
      .eq('tenant_id', tenantId)
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching feedback data:', error);
      return [];
    }
    
    return data;
  } catch (error) {
    console.error('Error in getFeedbackData:', error);
    return [];
  }
}
