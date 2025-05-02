/**
 * Configuration Manager for API routes
 */
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

let supabaseAdmin = null;

if (supabaseUrl && supabaseServiceKey) {
  supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      persistSession: false,
    }
  });
}

// In-memory store for development purposes
// In production, this should be replaced with a secure storage solution
let secureConfig = {
  apiKey: process.env.API_KEY || '',
  apiProvider: process.env.API_PROVIDER || 'openai',
  updatedAt: null
};

/**
 * Get a configuration value
 * @param {string} key - The configuration key
 * @returns {Promise<string>} The configuration value
 */
async function getConfig(key) {
  // Special handling for OpenRouter API key
  if (key === 'OPENROUTER_API_KEY') {
    return getOpenRouterApiKey();
  }

  // Return environment variables directly
  return process.env[key] || '';
}

/**
 * Get the OpenRouter API key from Supabase
 * @returns {Promise<string>} The API key
 */
async function getOpenRouterApiKey() {
  // First check if it's in environment variables (for local development)
  if (process.env.OPENROUTER_API_KEY) {
    return process.env.OPENROUTER_API_KEY;
  }

  // If not, try to get it from Supabase
  if (supabaseAdmin) {
    try {
      const { data, error } = await supabaseAdmin
        .from('api_keys')
        .select('value')
        .eq('name', 'OPENROUTER_API_KEY')
        .single();

      if (error) throw error;
      return data?.value || '';
    } catch (error) {
      console.error('Error fetching OpenRouter API key:', error);
      return '';
    }
  }

  return '';
}

/**
 * Update a configuration value
 * @param {string} key - The configuration key
 * @param {string} value - The configuration value
 * @returns {Promise<boolean>} Whether the operation was successful
 */
async function updateConfig(key, value) {
  // Special handling for OpenRouter API key
  if (key === 'OPENROUTER_API_KEY') {
    return updateOpenRouterApiKey(value);
  }

  // In a real application, this would update other configurations
  console.log(`Updating config ${key} to ${value}`);
  return true;
}

/**
 * Update the OpenRouter API key in Supabase
 * @param {string} value - The API key value
 * @returns {Promise<boolean>} Whether the operation was successful
 */
async function updateOpenRouterApiKey(value) {
  if (!supabaseAdmin) {
    console.error('Supabase admin client not available');
    return false;
  }

  try {
    // Check if the key already exists
    const { data: existingKey, error: fetchError } = await supabaseAdmin
      .from('api_keys')
      .select('id')
      .eq('name', 'OPENROUTER_API_KEY')
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 is the error code for no rows returned
      throw fetchError;
    }

    if (existingKey) {
      // Update existing key
      const { error } = await supabaseAdmin
        .from('api_keys')
        .update({ value, updated_at: new Date().toISOString() })
        .eq('id', existingKey.id);

      if (error) throw error;
    } else {
      // Insert new key
      const { error } = await supabaseAdmin
        .from('api_keys')
        .insert({
          name: 'OPENROUTER_API_KEY',
          value,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
    }

    return true;
  } catch (error) {
    console.error('Error updating OpenRouter API key:', error);
    return false;
  }
}

/**
 * Update multiple configuration values
 * @param {Object} updates - The configuration updates
 * @returns {Promise<boolean>} Whether the operation was successful
 */
async function updateMultipleConfig(updates) {
  // In a real application, this would update the configurations
  // For this demo, we'll just log the updates
  console.log('Updating multiple configs:', updates);
  return true;
}

/**
 * Read the configuration
 * @returns {Promise<Object>} The configuration object
 */
async function readConfig() {
  // Get the OpenRouter API key
  const openRouterApiKey = await getOpenRouterApiKey();

  // Return the configuration object
  return {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:24125',
    NEXT_PUBLIC_GOOGLE_CLOUD_API_KEY: process.env.NEXT_PUBLIC_GOOGLE_CLOUD_API_KEY || '',
    NEXT_PUBLIC_VISION_API_ENABLED: process.env.NEXT_PUBLIC_VISION_API_ENABLED || 'false',
    NEXT_PUBLIC_CHATBOT_ENABLED: process.env.NEXT_PUBLIC_CHATBOT_ENABLED || 'false',
    OPENROUTER_API_KEY: openRouterApiKey || ''
  };
}

/**
 * Get the secure configuration for API keys
 * @returns {Promise<Object>} The secure configuration object
 */
export async function getSecureConfig() {
  // In a production environment, you would retrieve this from a secure storage
  // such as environment variables, a secure database, or a secrets manager
  return {
    ...secureConfig,
    isConfigured: !!secureConfig.apiKey
  };
}

/**
 * Update the secure configuration
 * @param {Object} newConfig - The new configuration values
 * @returns {Promise<boolean>} True if the update was successful
 */
export async function updateSecureConfig(newConfig) {
  try {
    // In a production environment, you would store this in a secure storage
    secureConfig = {
      ...secureConfig,
      ...newConfig,
      updatedAt: new Date().toISOString()
    };

    // If saveToEnv is true and we're in a Node.js environment, update environment variables
    // Note: This only affects the current process and won't persist across restarts
    if (newConfig.saveToEnv && typeof process !== 'undefined' && process.env) {
      if (newConfig.apiKey) {
        process.env.API_KEY = newConfig.apiKey;
      }
      if (newConfig.apiProvider) {
        process.env.API_PROVIDER = newConfig.apiProvider;
      }
    }

    return true;
  } catch (error) {
    console.error('Error updating secure config:', error);
    return false;
  }
}

// Export the functions
const configManager = {
  getConfig,
  updateConfig,
  updateMultipleConfig,
  readConfig,
  getSecureConfig,
  updateSecureConfig
};

export default configManager;
