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
 * API handler for feedback categories
 * 
 * This endpoint retrieves the list of feedback categories.
 * 
 * @param {Object} req - Next.js request object
 * @param {Object} res - Next.js response object
 */
export default async function handler(req, res) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ 
      status: 'error',
      message: 'Method not allowed' 
    });
  }

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

    // Get organization ID from user or use default
    const organizationId = user?.organization_id || process.env.DEFAULT_ORGANIZATION_ID;

    // Get feedback categories
    const { data, error } = await supabase
      .from('feedback_categories')
      .select('*')
      .order('display_order', { ascending: true });

    if (error) {
      console.error('Error fetching feedback categories:', error);
      
      // If the table doesn't exist yet, return default categories
      const defaultCategories = [
        { id: 'feature_request', name: 'Feature Request', description: 'Suggest a new feature', display_order: 1 },
        { id: 'bug_report', name: 'Bug Report', description: 'Report an issue or error', display_order: 2 },
        { id: 'usability', name: 'Usability', description: 'Feedback about the user experience', display_order: 3 },
        { id: 'performance', name: 'Performance', description: 'Report performance issues', display_order: 4 },
        { id: 'general', name: 'General Feedback', description: 'Any other feedback', display_order: 5 }
      ];
      
      return res.status(200).json({
        status: 'success',
        data: {
          categories: defaultCategories
        }
      });
    }

    return res.status(200).json({
      status: 'success',
      data: {
        categories: data
      }
    });
  } catch (error) {
    console.error('Error fetching feedback categories:', error);
    return res.status(500).json({ 
      status: 'error',
      message: 'Internal server error', 
      error: error.message 
    });
  }
}