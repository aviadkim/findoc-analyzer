/**
 * Notification Utility for FinDoc Analyzer
 * 
 * This script provides notification functionality for the application.
 */

// Notification types
const NOTIFICATION_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  INFO: 'info',
  WARNING: 'warning'
};

/**
 * Show a notification
 * @param {string} message - The notification message
 * @param {string} type - The notification type (success, error, info, warning)
 * @param {number} duration - The duration in milliseconds (0 for no auto-hide)
 */
function showNotification(message, type = NOTIFICATION_TYPES.INFO, duration = 3000) {
  // Get notification element
  const notification = document.getElementById('notification');
  
  if (!notification) {
    console.error('Notification element not found');
    return;
  }
  
  // Set notification content
  notification.textContent = message;
  notification.className = `notification ${type}`;
  notification.style.display = 'block';
  
  // Auto-hide notification after duration
  if (duration > 0) {
    setTimeout(() => {
      hideNotification();
    }, duration);
  }
}

/**
 * Hide the notification
 */
function hideNotification() {
  // Get notification element
  const notification = document.getElementById('notification');
  
  if (!notification) {
    console.error('Notification element not found');
    return;
  }
  
  // Hide notification
  notification.style.display = 'none';
}

/**
 * Show a success notification
 * @param {string} message - The notification message
 * @param {number} duration - The duration in milliseconds (0 for no auto-hide)
 */
function showSuccess(message, duration = 3000) {
  showNotification(message, NOTIFICATION_TYPES.SUCCESS, duration);
}

/**
 * Show an error notification
 * @param {string} message - The notification message
 * @param {number} duration - The duration in milliseconds (0 for no auto-hide)
 */
function showError(message, duration = 5000) {
  showNotification(message, NOTIFICATION_TYPES.ERROR, duration);
}

/**
 * Show an info notification
 * @param {string} message - The notification message
 * @param {number} duration - The duration in milliseconds (0 for no auto-hide)
 */
function showInfo(message, duration = 3000) {
  showNotification(message, NOTIFICATION_TYPES.INFO, duration);
}

/**
 * Show a warning notification
 * @param {string} message - The notification message
 * @param {number} duration - The duration in milliseconds (0 for no auto-hide)
 */
function showWarning(message, duration = 4000) {
  showNotification(message, NOTIFICATION_TYPES.WARNING, duration);
}

// Export notification functions
window.notification = {
  NOTIFICATION_TYPES,
  showNotification,
  hideNotification,
  showSuccess,
  showError,
  showInfo,
  showWarning
};
