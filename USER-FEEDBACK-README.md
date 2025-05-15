# User Feedback and Analytics Implementation

This document provides an overview of the user feedback and analytics implementation for the FinDoc Analyzer project.

## Overview

The implementation includes:

1. **User Feedback Form**: A comprehensive form for collecting user feedback, including ratings, categories, and detailed comments.
2. **Analytics Tracking**: Client-side and server-side tracking of user actions and events.
3. **Analytics Dashboard**: A visual dashboard for monitoring application usage and user feedback.
4. **Database Schema**: Supabase schema for storing feedback and analytics data.

## Components

### User Feedback Form

The user feedback form allows users to submit different types of feedback:

- **General Feedback**: Overall impressions and suggestions
- **Bug Reports**: Issues and problems encountered
- **Feature Requests**: Suggestions for new features

The form includes:

- Rating system (1-5 stars)
- Category selection based on feedback type
- Detailed comments field
- Optional contact information

**Files:**
- `DevDocs/frontend/components/UserFeedbackForm.js`: The feedback form component
- `DevDocs/frontend/pages/feedback.js`: The feedback page (updated to include the new form)
- `DevDocs/frontend/pages/api/feedback.js`: API endpoint for handling feedback submissions

### Analytics Tracking

The analytics module tracks various user actions and events:

- Page views
- Feature usage
- Document processing
- Errors
- Feedback submissions

It supports both client-side tracking with Google Analytics and server-side tracking with our own analytics database.

**Files:**
- `DevDocs/frontend/lib/analytics.js`: Analytics module for tracking user actions
- `DevDocs/frontend/pages/api/analytics/events.js`: API endpoint for recording analytics events

### Analytics Dashboard

The analytics dashboard provides visualizations of application usage and user feedback:

- Page views over time
- Feature usage statistics
- Document processing by document type
- Feedback ratings and comments

The dashboard supports different time ranges (24 hours, 7 days, 30 days, 90 days) for data analysis.

**Files:**
- `DevDocs/frontend/components/AnalyticsDashboard.js`: The analytics dashboard component
- `DevDocs/frontend/pages/analytics-dashboard.js`: The analytics dashboard page
- `DevDocs/frontend/pages/api/analytics/dashboard.js`: API endpoint for retrieving dashboard data

### Database Schema

The implementation uses Supabase for storing feedback and analytics data. The schema includes:

- `feedback` table: Stores user feedback submissions
- `feedback_responses` table: Stores responses to user feedback
- `analytics_events` table: Stores analytics events

**Files:**
- `feedback-schema.sql`: SQL schema for feedback and analytics tables

## Setup Instructions

### 1. Set up Supabase

1. Create a Supabase project at [https://supabase.com](https://supabase.com)
2. Run the SQL scripts in `feedback-schema.sql` to create the necessary tables
3. Set up Row Level Security (RLS) policies as defined in the schema

### 2. Configure Environment Variables

Add the following environment variables to your `.env.local` file:

```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
NEXT_PUBLIC_GA_MEASUREMENT_ID=your-ga-measurement-id (optional)
```

### 3. Install Dependencies

```bash
npm install @supabase/supabase-js date-fns chart.js react-chartjs-2
```

## Usage

### User Feedback Form

The feedback form can be accessed at `/feedback`. It can also be integrated into other pages as needed.

```jsx
import UserFeedbackForm from '../components/UserFeedbackForm';

// In your component
<UserFeedbackForm 
  onSubmitSuccess={(data) => console.log('Feedback submitted:', data)} 
  onCancel={() => console.log('Feedback cancelled')} 
/>
```

### Analytics Tracking

Initialize the analytics module in your application:

```jsx
import { initAnalytics, trackPageView } from '../lib/analytics';

// Initialize analytics
useEffect(() => {
  initAnalytics({
    userId: 'user-id', // If available
    tenantId: 'tenant-id' // If available
  });
}, []);

// Track page views
useEffect(() => {
  trackPageView('/page-path', 'Page Title');
}, []);

// Track feature usage
import { trackFeatureUsage } from '../lib/analytics';

// In your component
const handleFeatureUse = () => {
  trackFeatureUsage('feature-name', { 
    // Additional parameters
    param1: 'value1',
    param2: 'value2'
  });
};
```

### Analytics Dashboard

The analytics dashboard can be accessed at `/analytics-dashboard`. It requires a tenant ID to display data.

```jsx
import AnalyticsDashboard from '../components/AnalyticsDashboard';

// In your component
<AnalyticsDashboard tenantId="tenant-id" />
```

## Testing

To test the implementation:

1. Start the development server:

```bash
npm run dev
```

2. Access the feedback form at [http://localhost:3000/feedback](http://localhost:3000/feedback)
3. Submit various types of feedback
4. Access the analytics dashboard at [http://localhost:3000/analytics-dashboard](http://localhost:3000/analytics-dashboard)
5. Verify that the feedback and analytics data are being recorded in Supabase

## Next Steps

1. **Enhance Analytics**: Add more detailed analytics tracking for specific user actions
2. **Improve Visualizations**: Add more chart types and filtering options to the dashboard
3. **Implement Notifications**: Send notifications to administrators for urgent feedback
4. **Add Export Options**: Allow exporting analytics data in various formats
5. **Implement User Segmentation**: Analyze feedback and usage patterns by user segments

## Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Chart.js Documentation](https://www.chartjs.org/docs/latest/)
- [React Hook Form Documentation](https://react-hook-form.com/get-started)
- [Google Analytics 4 Documentation](https://developers.google.com/analytics/devguides/collection/ga4)
