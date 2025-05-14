/**
 * Tenant Manager
 *
 * This service handles tenant management for the FinDoc Analyzer application.
 * It provides functions for creating, updating, and managing tenants.
 */

const { v4: uuidv4 } = require('uuid');
const supabase = require('./supabase-client');
const apiKeyProvider = require('./api-key-provider-service');

/**
 * Create a new tenant
 * @param {object} tenantData - Tenant data
 * @returns {Promise<object>} Created tenant
 */
async function createTenant(tenantData) {
  try {
    // Generate a UUID for the tenant
    const tenantId = uuidv4();

    // Create the tenant in Supabase
    const { data, error } = await supabase
      .from('tenants')
      .insert({
        id: tenantId,
        name: tenantData.name,
        subscription_tier: tenantData.subscriptionTier || 'free',
        max_documents: tenantData.maxDocuments || 100,
        max_api_calls: tenantData.maxApiCalls || 1000
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    // Provision API keys for the tenant
    const apiKeyResults = await apiKeyProvider.provisionApiKeys(tenantId, {
      providers: tenantData.providers || ['openrouter', 'huggingface', 'google']
    });

    // Return the created tenant with API key results
    return {
      tenant: data,
      apiKeys: apiKeyResults
    };
  } catch (error) {
    console.error('Error creating tenant:', error);
    throw error;
  }
}

/**
 * Get a tenant by ID
 * @param {string} tenantId - Tenant ID
 * @returns {Promise<object>} Tenant
 */
async function getTenant(tenantId) {
  try {
    const { data, error } = await supabase
      .from('tenants')
      .select('*')
      .eq('id', tenantId)
      .single();

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error(`Error getting tenant ${tenantId}:`, error);
    throw error;
  }
}

/**
 * Update a tenant
 * @param {string} tenantId - Tenant ID
 * @param {object} tenantData - Tenant data to update
 * @returns {Promise<object>} Updated tenant
 */
async function updateTenant(tenantId, tenantData) {
  try {
    const { data, error } = await supabase
      .from('tenants')
      .update({
        name: tenantData.name,
        subscription_tier: tenantData.subscriptionTier,
        max_documents: tenantData.maxDocuments,
        max_api_calls: tenantData.maxApiCalls,
        status: tenantData.status
      })
      .eq('id', tenantId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error(`Error updating tenant ${tenantId}:`, error);
    throw error;
  }
}

/**
 * Delete a tenant
 * @param {string} tenantId - Tenant ID
 * @returns {Promise<boolean>} Success
 */
async function deleteTenant(tenantId) {
  try {
    const { error } = await supabase
      .from('tenants')
      .delete()
      .eq('id', tenantId);

    if (error) {
      throw error;
    }

    return true;
  } catch (error) {
    console.error(`Error deleting tenant ${tenantId}:`, error);
    throw error;
  }
}

/**
 * Get API key usage for a tenant
 * @param {string} tenantId - Tenant ID
 * @param {string} provider - Provider name
 * @param {Date} date - Date to get usage for (defaults to today)
 * @returns {Promise<object>} API key usage
 */
async function getApiKeyUsage(tenantId, provider, date = new Date()) {
  try {
    const formattedDate = date.toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('api_key_usage')
      .select('*')
      .eq('tenant_id', tenantId)
      .eq('provider', provider)
      .eq('usage_date', formattedDate)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is "No rows returned"
      throw error;
    }

    return data || {
      tenant_id: tenantId,
      provider,
      usage_date: formattedDate,
      call_count: 0
    };
  } catch (error) {
    console.error(`Error getting API key usage for tenant ${tenantId} and provider ${provider}:`, error);
    throw error;
  }
}

/**
 * Increment API key usage for a tenant
 * @param {string} tenantId - Tenant ID
 * @param {string} provider - Provider name
 * @param {number} count - Number of calls to increment by
 * @returns {Promise<boolean>} Success
 */
async function incrementApiKeyUsage(tenantId, provider, count = 1) {
  try {
    const { error } = await supabase.rpc(
      'increment_api_key_usage',
      {
        p_tenant_id: tenantId,
        p_provider: provider,
        p_count: count
      }
    );

    if (error) {
      throw error;
    }

    return true;
  } catch (error) {
    console.error(`Error incrementing API key usage for tenant ${tenantId} and provider ${provider}:`, error);
    throw error;
  }
}

/**
 * Check if tenant has exceeded API call limit
 * @param {string} tenantId - Tenant ID
 * @param {string} provider - Provider name
 * @returns {Promise<boolean>} Whether limit is exceeded
 */
async function hasExceededApiCallLimit(tenantId, provider) {
  try {
    const { data, error } = await supabase.rpc(
      'has_exceeded_api_call_limit',
      {
        p_tenant_id: tenantId,
        p_provider: provider
      }
    );

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error(`Error checking API call limit for tenant ${tenantId} and provider ${provider}:`, error);
    throw error;
  }
}

/**
 * Get API key for a tenant
 * @param {string} tenantId - Tenant ID
 * @param {string} provider - Provider name
 * @returns {Promise<string>} API key
 */
async function getApiKey(tenantId, provider) {
  try {
    // Check if tenant has exceeded API call limit
    const hasExceeded = await hasExceededApiCallLimit(tenantId, provider);

    if (hasExceeded) {
      throw new Error(`Tenant ${tenantId} has exceeded API call limit for provider ${provider}`);
    }

    // Get API key
    const apiKey = await apiKeyProvider.getApiKey(tenantId, provider);

    // Increment API key usage
    await incrementApiKeyUsage(tenantId, provider);

    return apiKey;
  } catch (error) {
    console.error(`Error getting API key for tenant ${tenantId} and provider ${provider}:`, error);
    throw error;
  }
}

/**
 * Verify API keys for a tenant
 * @param {string} tenantId - Tenant ID
 * @returns {Promise<object>} Verification results
 */
async function verifyApiKeys(tenantId) {
  try {
    // Get API keys for tenant
    const { data, error } = await supabase
      .from('api_keys')
      .select('provider, secret_name')
      .eq('tenant_id', tenantId);

    if (error) {
      throw error;
    }

    const results = {};

    // If no data or data is not iterable, use default providers
    const providers = data && Array.isArray(data) && data.length > 0
      ? data
      : [
          { provider: 'openrouter', secret_name: createSecretName(tenantId, 'openrouter') },
          { provider: 'huggingface', secret_name: createSecretName(tenantId, 'huggingface') },
          { provider: 'google', secret_name: createSecretName(tenantId, 'google') }
        ];

    // Verify each API key
    for (const { provider, secret_name } of providers) {
      try {
        // Try to get API key
        let apiKey;
        try {
          apiKey = await apiKeyProvider.getApiKey(tenantId, provider);
        } catch (error) {
          console.error(`Error getting API key for tenant ${tenantId} and provider ${provider}:`, error);

          // Try to provision a new key
          apiKey = await apiKeyProvider.provisionApiKeys(tenantId, { providers: [provider] });

          // Get the newly provisioned key
          apiKey = await apiKeyProvider.getApiKey(tenantId, provider);
        }

        let isValid = false;

        switch (provider) {
          case 'openrouter':
            isValid = await apiKeyProvider.verifyOpenRouterApiKey(apiKey);
            break;
          case 'huggingface':
            isValid = await apiKeyProvider.verifyHuggingFaceApiKey(apiKey);
            break;
          case 'google':
            isValid = await apiKeyProvider.verifyGoogleAiApiKey(apiKey);
            break;
          default:
            console.warn(`Unknown provider: ${provider}`);
            continue;
        }

        results[provider] = {
          valid: isValid
        };
      } catch (error) {
        console.error(`Error verifying API key for tenant ${tenantId} and provider ${provider}:`, error);

        results[provider] = {
          valid: false,
          error: error.message
        };
      }
    }

    return results;
  } catch (error) {
    console.error(`Error verifying API keys for tenant ${tenantId}:`, error);
    throw error;
  }
}

/**
 * Create a secret name for a tenant and provider
 * @param {string} tenantId - Tenant ID
 * @param {string} provider - Provider name (openrouter, huggingface, google)
 * @returns {string} Secret name
 */
function createSecretName(tenantId, provider) {
  return `tenant-${tenantId}-${provider}-api-key`;
}

/**
 * Get API usage for a tenant
 * @param {string} tenantId - Tenant ID
 * @returns {Promise<object>} API usage
 */
async function getApiUsage(tenantId) {
  try {
    // Get API usage from Supabase
    const { data, error } = await supabase
      .from('api_key_usage')
      .select('provider, usage_date, call_count')
      .eq('tenant_id', tenantId);

    if (error) {
      throw error;
    }

    // Get tenant
    const tenant = await getTenant(tenantId);

    if (!tenant) {
      throw new Error(`Tenant ${tenantId} not found`);
    }

    // Group by provider
    const usage = {};

    for (const provider of ['openrouter', 'huggingface', 'google']) {
      // Get usage for provider
      const providerUsage = data ? data.filter(item => item.provider === provider) : [];

      // Calculate total usage
      const totalUsage = providerUsage.reduce((total, item) => total + item.call_count, 0);

      // Get today's usage
      const today = new Date().toISOString().split('T')[0];
      const todayUsage = providerUsage
        .filter(item => item.usage_date === today)
        .reduce((total, item) => total + item.call_count, 0);

      // Add to usage
      usage[provider] = {
        total: totalUsage,
        today: todayUsage,
        limit: tenant.max_api_calls || 1000,
        remaining: (tenant.max_api_calls || 1000) - todayUsage
      };
    }

    return {
      tenant: {
        id: tenant.id,
        name: tenant.name,
        subscriptionTier: tenant.subscription_tier,
        maxApiCalls: tenant.max_api_calls || 1000
      },
      usage
    };
  } catch (error) {
    console.error(`Error getting API usage for tenant ${tenantId}:`, error);
    throw error;
  }
}

module.exports = {
  createTenant,
  getTenant,
  updateTenant,
  deleteTenant,
  getApiKeyUsage,
  incrementApiKeyUsage,
  hasExceededApiCallLimit,
  getApiKey,
  verifyApiKeys,
  getApiUsage
};
