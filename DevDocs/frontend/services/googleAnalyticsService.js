/**
 * Google Analytics 4 Service
 * 
 * This service integrates our custom analytics tracking with Google Analytics 4.
 * It provides methods to track various events and page views in GA4.
 */

// Check if window is defined (for SSR)
const isClient = typeof window !== 'undefined';

/**
 * Initialize Google Analytics 4
 * 
 * This function initializes Google Analytics 4 with the provided measurement ID.
 * It should be called once when the application first loads.
 * 
 * @param {string} measurementId - The GA4 measurement ID (e.g., G-XXXXXXXXXX)
 */
export function initializeGA4(measurementId) {
  if (!isClient) return;
  
  // Skip if GA4 is already initialized
  if (window.gtag) return;
  
  // Add Google Analytics script
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  document.head.appendChild(script);
  
  // Initialize gtag
  window.dataLayer = window.dataLayer || [];
  window.gtag = function() {
    window.dataLayer.push(arguments);
  };
  window.gtag('js', new Date());
  window.gtag('config', measurementId, {
    send_page_view: false, // Disable automatic page views, we'll track them manually
    anonymize_ip: true, // Privacy enhancement
    cookie_flags: 'secure;samesite=none' // Security enhancement
  });
  
  console.log('Google Analytics 4 initialized');
}

/**
 * Track page view in GA4
 * 
 * @param {string} pagePath - The path of the page (e.g., /dashboard)
 * @param {string} pageTitle - The title of the page
 * @param {Object} additionalParams - Additional parameters to send with the event
 */
export function trackPageView(pagePath, pageTitle, additionalParams = {}) {
  if (!isClient || !window.gtag) return;
  
  window.gtag('event', 'page_view', {
    page_path: pagePath,
    page_title: pageTitle,
    ...additionalParams
  });
}

/**
 * Track event in GA4
 * 
 * @param {string} eventName - The name of the event
 * @param {Object} eventParams - Parameters to send with the event
 */
export function trackEvent(eventName, eventParams = {}) {
  if (!isClient || !window.gtag) return;
  
  window.gtag('event', eventName, eventParams);
}

/**
 * Track user login in GA4
 * 
 * @param {string} method - The login method used (e.g., 'google', 'email_password')
 */
export function trackLogin(method) {
  if (!isClient || !window.gtag) return;
  
  window.gtag('event', 'login', {
    method
  });
}

/**
 * Track form submission in GA4
 * 
 * @param {string} formName - The name of the form
 * @param {Object} formData - Data about the form submission (exclude PII)
 */
export function trackFormSubmission(formName, formData = {}) {
  if (!isClient || !window.gtag) return;
  
  window.gtag('event', 'form_submit', {
    form_name: formName,
    ...formData
  });
}

/**
 * Track feature usage in GA4
 * 
 * @param {string} featureName - The name of the feature
 * @param {Object} featureData - Data about the feature usage
 */
export function trackFeatureUsage(featureName, featureData = {}) {
  if (!isClient || !window.gtag) return;
  
  window.gtag('event', 'feature_use', {
    feature_name: featureName,
    ...featureData
  });
}

/**
 * Track error in GA4
 * 
 * @param {string} errorType - The type of error
 * @param {string} errorMessage - The error message (sanitized to remove PII)
 * @param {Object} errorData - Additional data about the error
 */
export function trackError(errorType, errorMessage, errorData = {}) {
  if (!isClient || !window.gtag) return;
  
  window.gtag('event', 'error', {
    error_type: errorType,
    error_message: errorMessage,
    ...errorData
  });
}

/**
 * Set user properties in GA4
 * 
 * @param {Object} properties - User properties to set (exclude PII)
 */
export function setUserProperties(properties) {
  if (!isClient || !window.gtag) return;
  
  window.gtag('set', 'user_properties', properties);
}

/**
 * Export all functions as default object
 */
export default {
  initializeGA4,
  trackPageView,
  trackEvent,
  trackLogin,
  trackFormSubmission,
  trackFeatureUsage,
  trackError,
  setUserProperties
};