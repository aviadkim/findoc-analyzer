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
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const {
      feedbackType,
      rating,
      feedbackCategories,
      comments,
      email,
      allowContact,
      timestamp,
      userAgent,
      userId
    } = req.body;

    // Basic validation
    if (!feedbackType || !comments) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // If user allows contact but doesn't provide email
    if (allowContact && !email) {
      return res.status(400).json({ message: 'Email is required when contact is allowed' });
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

    // Prepare feedback data for storage
    const feedbackData = {
      feedback_type: feedbackType,
      rating: rating ? parseInt(rating, 10) : null,
      categories: feedbackCategories || [],
      comments,
      email: allowContact ? email : null,
      allow_contact: allowContact,
      user_id: user?.id || userId || 'anonymous',
      user_agent: userAgent,
      created_at: timestamp || new Date().toISOString(),
      status: 'new',
      is_resolved: false
    };

    // Store feedback in Supabase
    const { data, error } = await supabase
      .from('feedback')
      .insert([feedbackData])
      .select();

    if (error) {
      console.error('Error storing feedback:', error);
      return res.status(500).json({ message: 'Failed to store feedback', error: error.message });
    }

    // For bug reports, send notification to administrators
    if (feedbackType === 'bug') {
      // In a real implementation, you would send an email or notification
      // to administrators about the bug report
      console.log('Bug report received:', feedbackData);
      
      // Example: Send email notification (pseudo-code)
      // await sendNotification({
      //   type: 'bug_report',
      //   data: feedbackData,
      //   recipients: ['admin@example.com']
      // });
    }

    // Return success response with the stored feedback data
    return res.status(200).json({
      message: 'Feedback submitted successfully',
      feedback: data[0]
    });
  } catch (error) {
    console.error('Error processing feedback:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
}
