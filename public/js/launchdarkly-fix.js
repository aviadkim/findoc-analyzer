/**
 * LaunchDarkly Fix Script
 * This script fixes the LaunchDarkly resource loading error
 */

document.addEventListener('DOMContentLoaded', function() {
  console.log('LaunchDarkly fix script loaded');
  
  // Check if LaunchDarkly is being used
  if (window.general && window.general.launchDarklyClient) {
    console.log('LaunchDarkly client detected, applying fix');
    
    // Create a mock LaunchDarkly client
    const mockLDClient = {
      identify: function(user) {
        console.log('Mock LaunchDarkly identify called with user:', user);
        return Promise.resolve();
      },
      
      variation: function(flagKey, defaultValue) {
        console.log('Mock LaunchDarkly variation called for flag:', flagKey);
        
        // Return default values for known flags
        const flagValues = {
          'enable-document-chat': true,
          'enable-analytics': true,
          'enable-document-comparison': true,
          'enable-bloomberg-agent': true,
          'enable-securities-extraction': true
        };
        
        return flagValues[flagKey] !== undefined ? flagValues[flagKey] : defaultValue;
      },
      
      on: function(event, callback) {
        console.log('Mock LaunchDarkly on event:', event);
        
        // Immediately trigger ready event
        if (event === 'ready') {
          setTimeout(callback, 0);
        }
        
        return this;
      },
      
      off: function(event, callback) {
        console.log('Mock LaunchDarkly off event:', event);
        return this;
      }
    };
    
    // Replace the LaunchDarkly client with our mock
    window.general.launchDarklyClient = mockLDClient;
    
    // Also set it globally for other scripts that might use it directly
    window.ldClient = mockLDClient;
    
    console.log('LaunchDarkly client replaced with mock implementation');
  } else {
    console.log('LaunchDarkly client not detected, no fix needed');
  }
});
