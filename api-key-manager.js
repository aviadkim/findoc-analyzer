/**
 * API Key Manager
 * 
 * This module manages API keys for external services used by the application.
 * It provides functions for retrieving, validating, and testing API keys.
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Default API key storage location
const API_KEYS_FILE = process.env.API_KEYS_FILE || path.join(__dirname, 'config', 'api-keys.json');

// Ensure config directory exists
try {
  fs.mkdirSync(path.dirname(API_KEYS_FILE), { recursive: true });
} catch (error) {
  console.error('Error creating config directory:', error);
}

// Initialize API keys
let apiKeys = {};

// Load API keys from file
try {
  if (fs.existsSync(API_KEYS_FILE)) {
    const data = fs.readFileSync(API_KEYS_FILE, 'utf8');
    apiKeys = JSON.parse(data);
    console.log('API keys loaded from file');
  } else {
    console.log('API keys file not found, using environment variables');
    
    // Initialize from environment variables
    apiKeys = {
      openrouter: process.env.OPENROUTER_API_KEY || '',
      gemini: process.env.GEMINI_API_KEY || '',
      deepseek: process.env.DEEPSEEK_API_KEY || '',
      supabase: process.env.SUPABASE_KEY || ''
    };
    
    // Save to file
    fs.writeFileSync(API_KEYS_FILE, JSON.stringify(apiKeys, null, 2));
    console.log('API keys saved to file');
  }
} catch (error) {
  console.error('Error loading API keys:', error);
  
  // Initialize with empty values
  apiKeys = {
    openrouter: process.env.OPENROUTER_API_KEY || '',
    gemini: process.env.GEMINI_API_KEY || '',
    deepseek: process.env.DEEPSEEK_API_KEY || '',
    supabase: process.env.SUPABASE_KEY || ''
  };
}

/**
 * Get an API key
 * @param {string} service - Service name (openrouter, gemini, deepseek, supabase)
 * @returns {string} API key
 */
function getApiKey(service) {
  return apiKeys[service] || '';
}

/**
 * Set an API key
 * @param {string} service - Service name (openrouter, gemini, deepseek, supabase)
 * @param {string} key - API key
 * @returns {boolean} Success
 */
function setApiKey(service, key) {
  apiKeys[service] = key;
  
  // Save to file
  try {
    fs.writeFileSync(API_KEYS_FILE, JSON.stringify(apiKeys, null, 2));
    console.log(`API key for ${service} saved`);
    return true;
  } catch (error) {
    console.error(`Error saving API key for ${service}:`, error);
    return false;
  }
}

/**
 * Check if an API key is valid
 * @param {string} service - Service name (openrouter, gemini, deepseek, supabase)
 * @returns {boolean} Is valid
 */
function hasValidApiKey(service) {
  const key = getApiKey(service);
  return key && key.length > 0;
}

/**
 * Test an OpenRouter API key
 * @param {string} key - API key to test
 * @returns {Promise<boolean>} Is valid
 */
async function testOpenRouterApiKey(key) {
  try {
    const response = await axios.get('https://openrouter.ai/api/v1/models', {
      headers: {
        'Authorization': `Bearer ${key}`
      }
    });
    
    return response.status === 200;
  } catch (error) {
    console.error('Error testing OpenRouter API key:', error);
    return false;
  }
}

/**
 * Test a Gemini API key
 * @param {string} key - API key to test
 * @returns {Promise<boolean>} Is valid
 */
async function testGeminiApiKey(key) {
  try {
    const response = await axios.post(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=' + key,
      {
        contents: [
          {
            parts: [
              {
                text: "Hello, I'm testing my API key."
              }
            ]
          }
        ]
      }
    );
    
    return response.status === 200;
  } catch (error) {
    console.error('Error testing Gemini API key:', error);
    return false;
  }
}

/**
 * Test a DeepSeek API key
 * @param {string} key - API key to test
 * @returns {Promise<boolean>} Is valid
 */
async function testDeepSeekApiKey(key) {
  try {
    const response = await axios.post(
      'https://api.deepseek.com/v1/chat/completions',
      {
        model: "deepseek-chat",
        messages: [
          {
            role: "user",
            content: "Hello, I'm testing my API key."
          }
        ]
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${key}`
        }
      }
    );
    
    return response.status === 200;
  } catch (error) {
    console.error('Error testing DeepSeek API key:', error);
    return false;
  }
}

/**
 * Test a Supabase API key
 * @param {string} key - API key to test
 * @param {string} url - Supabase URL
 * @returns {Promise<boolean>} Is valid
 */
async function testSupabaseApiKey(key, url) {
  try {
    const response = await axios.get(
      `${url}/rest/v1/`,
      {
        headers: {
          'apikey': key,
          'Authorization': `Bearer ${key}`
        }
      }
    );
    
    return response.status === 200;
  } catch (error) {
    console.error('Error testing Supabase API key:', error);
    return false;
  }
}

/**
 * Test all API keys
 * @returns {Promise<Object>} Test results
 */
async function testAllApiKeys() {
  const results = {
    openrouter: false,
    gemini: false,
    deepseek: false,
    supabase: false
  };
  
  // Test OpenRouter API key
  if (hasValidApiKey('openrouter')) {
    results.openrouter = await testOpenRouterApiKey(getApiKey('openrouter'));
  }
  
  // Test Gemini API key
  if (hasValidApiKey('gemini')) {
    results.gemini = await testGeminiApiKey(getApiKey('gemini'));
  }
  
  // Test DeepSeek API key
  if (hasValidApiKey('deepseek')) {
    results.deepseek = await testDeepSeekApiKey(getApiKey('deepseek'));
  }
  
  // Test Supabase API key
  if (hasValidApiKey('supabase')) {
    results.supabase = await testSupabaseApiKey(
      getApiKey('supabase'),
      process.env.SUPABASE_URL || 'https://dnjnsotemnfrjlotgved.supabase.co'
    );
  }
  
  return results;
}

module.exports = {
  getApiKey,
  setApiKey,
  hasValidApiKey,
  testOpenRouterApiKey,
  testGeminiApiKey,
  testDeepSeekApiKey,
  testSupabaseApiKey,
  testAllApiKeys
};
