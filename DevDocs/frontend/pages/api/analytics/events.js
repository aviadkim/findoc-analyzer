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
 * This endpoint receives analytics events and stores them in the Supabase database.
 * 
 * @param {Object} req - Next.js request object
 * @param {Object} res - Next.js response object
 */
export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const {
      event_type,
      event_data,
      page,
      user_agent
    } = req.body;

    // Basic validation
    if (!event_type) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Get user information if authenticated
    let user = null;
    let tenant = null;
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      
      // Verify the token and get user info
      const { data: userData, error: userError } = await supabase.auth.getUser(token);
      
      if (!userError && userData) {
        user = userData;
        
        // Get tenant information
        const { data: tenantData, error: tenantError } = await supabase
          .from('tenants')
          .select('*')
          .eq('id', user.id)
          .single();
        
        if (!tenantError && tenantData) {
          tenant = tenantData;
        }
      }
    }

    // Get client IP address
    const ip_address = req.headers['x-forwarded-for'] || 
                       req.connection.remoteAddress || 
                       req.socket.remoteAddress || 
                       req.connection.socket.remoteAddress;

    // Prepare event data for storage
    const analyticsEvent = {
      tenant_id: tenant?.id || event_data?.tenant_id || null,
      user_id: user?.id || event_data?.user_id || null,
      event_type,
      event_data,
      page,
      user_agent,
      ip_address,
      created_at: new Date().toISOString()
    };

    // Store event in Supabase
    const { data, error } = await supabase
      .from('analytics_events')
      .insert([analyticsEvent]);

    if (error) {
      console.error('Error storing analytics event:', error);
      return res.status(500).json({ message: 'Failed to store analytics event', error: error.message });
    }

    // Return success response
    return res.status(200).json({
      message: 'Analytics event recorded successfully'
    });
  } catch (error) {
    console.error('Error processing analytics event:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
}
