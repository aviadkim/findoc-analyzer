/**
 * Analytics Service
 * 
 * A service for tracking analytics events in the application.
 * Integrates with both our internal analytics system and Google Analytics 4.
 */

import ga4 from './googleAnalyticsService';

// GA4 Measurement ID - Replace with your actual ID in production
const GA4_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID || 'G-XXXXXXXXXX';

// Initialize GA4 if in browser environment
if (typeof window !== 'undefined') {
  ga4.initializeGA4(GA4_MEASUREMENT_ID);
}

/**
 * Track a user event
 * @param {string} eventType - The type of event to track
 * @param {Object} eventData - Additional data about the event
 * @returns {Promise<Object>} - The response from the API
 */
export async function trackEvent(eventType, eventData = {}) {
  try {
    // Track in our internal system
    const response = await fetch('/api/feedback/analytics', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        event_type: eventType,
        event_data: eventData
      })
    });

    // Also track in GA4
    ga4.trackEvent(eventType, eventData);

    if (!response.ok) {
      // Log error but don't throw to prevent disrupting user experience
      console.error('Failed to track analytics event:', await response.json());
      return null;
    }

    return await response.json();
  } catch (error) {
    // Log error but don't throw to prevent disrupting user experience
    console.error('Error tracking analytics event:', error);
    return null;
  }
}

/**
 * Page view tracking
 * @param {string} pageName - The name of the page viewed
 * @param {Object} additionalData - Any additional data to track
 */
export function trackPageView(pageName, additionalData = {}) {
  // Track in GA4
  ga4.trackPageView(`/${pageName}`, pageName, additionalData);
  
  // Track in our internal system
  return trackEvent('page_view', {
    page_name: pageName,
    timestamp: new Date().toISOString(),
    ...additionalData
  });
}

/**
 * Feature usage tracking
 * @param {string} featureName - The name of the feature used
 * @param {Object} additionalData - Any additional data about the feature usage
 */
export function trackFeatureUsage(featureName, additionalData = {}) {
  // Track in GA4
  ga4.trackFeatureUsage(featureName, additionalData);
  
  // Track in our internal system
  return trackEvent('feature_usage', {
    feature_name: featureName,
    timestamp: new Date().toISOString(),
    ...additionalData
  });
}

/**
 * Track errors and exceptions
 * @param {string} errorType - The type of error
 * @param {string} errorMessage - The error message
 * @param {Object} additionalData - Any additional data about the error
 */
export function trackError(errorType, errorMessage, additionalData = {}) {
  // Track in GA4
  ga4.trackError(errorType, errorMessage, additionalData);
  
  // Track in our internal system
  return trackEvent('error', {
    error_type: errorType,
    error_message: errorMessage,
    timestamp: new Date().toISOString(),
    ...additionalData
  });
}

/**
 * Track user interactions
 * @param {string} interactionType - The type of interaction
 * @param {string} elementId - The ID of the element interacted with
 * @param {Object} additionalData - Any additional data about the interaction
 */
export function trackInteraction(interactionType, elementId, additionalData = {}) {
  // Track in GA4
  ga4.trackEvent('interaction', {
    interaction_type: interactionType,
    element_id: elementId,
    ...additionalData
  });
  
  // Track in our internal system
  return trackEvent('interaction', {
    interaction_type: interactionType,
    element_id: elementId,
    timestamp: new Date().toISOString(),
    ...additionalData
  });
}

/**
 * Track performance metrics
 * @param {string} metricName - The name of the metric
 * @param {number} metricValue - The value of the metric
 * @param {Object} additionalData - Any additional data about the metric
 */
export function trackPerformance(metricName, metricValue, additionalData = {}) {
  // Track in GA4
  ga4.trackEvent('performance', {
    metric_name: metricName,
    metric_value: metricValue,
    ...additionalData
  });
  
  // Track in our internal system
  return trackEvent('performance', {
    metric_name: metricName,
    metric_value: metricValue,
    timestamp: new Date().toISOString(),
    ...additionalData
  });
}

/**
 * Track form submission
 * @param {string} formName - The name of the form
 * @param {Object} formData - Non-sensitive data about the form submission
 */
export function trackFormSubmission(formName, formData = {}) {
  // Track in GA4
  ga4.trackFormSubmission(formName, formData);
  
  // Track in our internal system
  return trackEvent('form_submission', {
    form_name: formName,
    timestamp: new Date().toISOString(),
    ...formData
  });
}

/**
 * Set user properties
 * @param {Object} properties - User properties (exclude PII)
 */
export function setUserProperties(properties) {
  // Set in GA4
  ga4.setUserProperties(properties);
  
  // No need to track this in our internal system
  return Promise.resolve();
}

/**
 * Get analytics summary (admin only)
 * @param {string} period - The time period to fetch analytics for (7d, 30d, 90d, 365d)
 * @returns {Promise<Object>} - The analytics data
 */
export async function getAnalyticsSummary(period = '30d') {
  try {
    const response = await fetch(`/api/feedback/analytics?period=${period}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch analytics summary');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching analytics summary:', error);
    throw error;
  }
}

// Export default object with all methods
export default {
  trackEvent,
  trackPageView,
  trackFeatureUsage,
  trackError,
  trackInteraction,
  trackPerformance,
  trackFormSubmission,
  setUserProperties,
  getAnalyticsSummary
};