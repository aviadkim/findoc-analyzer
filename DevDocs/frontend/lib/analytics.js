/**
 * Analytics Module for FinDoc Analyzer
 * 
 * This module provides functions for tracking user actions and events
 * in the application. It supports both client-side tracking with Google
 * Analytics and server-side tracking with our own analytics database.
 */

import axios from 'axios';

// Initialize analytics state
let initialized = false;
let userId = null;
let tenantId = null;
let sessionId = null;

/**
 * Initialize the analytics module
 * @param {Object} options - Configuration options
 * @param {string} options.userId - User ID for tracking
 * @param {string} options.tenantId - Tenant ID for tracking
 */
export const initAnalytics = (options = {}) => {
  if (initialized) return;
  
  // Set user and tenant IDs if provided
  userId = options.userId || null;
  tenantId = options.tenantId || null;
  
  // Generate a session ID
  sessionId = generateSessionId();
  
  // Initialize Google Analytics if available
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID, {
      user_id: userId,
      custom_map: {
        dimension1: 'tenant_id',
        dimension2: 'session_id'
      }
    });
    
    // Set custom dimensions
    if (tenantId) {
      window.gtag('set', 'tenant_id', tenantId);
    }
    window.gtag('set', 'session_id', sessionId);
  }
  
  // Track initialization event
  trackEvent('analytics_initialized', {
    session_id: sessionId
  });
  
  initialized = true;
};

/**
 * Set user ID for analytics
 * @param {string} id - User ID
 */
export const setUserId = (id) => {
  userId = id;
  
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('set', { user_id: id });
  }
};

/**
 * Set tenant ID for analytics
 * @param {string} id - Tenant ID
 */
export const setTenantId = (id) => {
  tenantId = id;
  
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('set', 'tenant_id', id);
  }
};

/**
 * Track a page view
 * @param {string} path - Page path
 * @param {string} title - Page title
 */
export const trackPageView = (path, title) => {
  // Track with Google Analytics
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID, {
      page_path: path,
      page_title: title
    });
  }
  
  // Track with our own analytics
  trackEvent('page_view', {
    page_path: path,
    page_title: title
  });
};

/**
 * Track an event
 * @param {string} eventName - Name of the event
 * @param {Object} eventParams - Event parameters
 */
export const trackEvent = (eventName, eventParams = {}) => {
  if (!initialized && typeof window !== 'undefined') {
    // Auto-initialize if not done yet
    initAnalytics();
  }
  
  // Add user and tenant IDs to event params
  const params = {
    ...eventParams,
    user_id: userId,
    tenant_id: tenantId,
    session_id: sessionId,
    timestamp: new Date().toISOString()
  };
  
  // Track with Google Analytics
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, params);
  }
  
  // Track with our own analytics
  try {
    axios.post('/api/analytics/events', {
      event_type: eventName,
      event_data: params,
      page: typeof window !== 'undefined' ? window.location.pathname : null,
      user_agent: typeof window !== 'undefined' ? window.navigator.userAgent : null
    });
  } catch (error) {
    console.error('Error tracking event:', error);
  }
};

/**
 * Track feature usage
 * @param {string} featureName - Name of the feature
 * @param {Object} params - Additional parameters
 */
export const trackFeatureUsage = (featureName, params = {}) => {
  trackEvent('feature_usage', {
    feature_name: featureName,
    ...params
  });
};

/**
 * Track document processing
 * @param {string} documentId - ID of the document
 * @param {string} documentType - Type of the document
 * @param {Object} params - Additional parameters
 */
export const trackDocumentProcessing = (documentId, documentType, params = {}) => {
  trackEvent('document_processing', {
    document_id: documentId,
    document_type: documentType,
    ...params
  });
};

/**
 * Track error
 * @param {string} errorType - Type of error
 * @param {string} errorMessage - Error message
 * @param {Object} params - Additional parameters
 */
export const trackError = (errorType, errorMessage, params = {}) => {
  trackEvent('error', {
    error_type: errorType,
    error_message: errorMessage,
    ...params
  });
};

/**
 * Track user feedback
 * @param {string} feedbackType - Type of feedback
 * @param {number} rating - Rating (1-5)
 * @param {Object} params - Additional parameters
 */
export const trackFeedback = (feedbackType, rating, params = {}) => {
  trackEvent('feedback_submitted', {
    feedback_type: feedbackType,
    rating,
    ...params
  });
};

/**
 * Generate a unique session ID
 * @returns {string} Session ID
 */
const generateSessionId = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

export default {
  initAnalytics,
  setUserId,
  setTenantId,
  trackPageView,
  trackEvent,
  trackFeatureUsage,
  trackDocumentProcessing,
  trackError,
  trackFeedback
};
