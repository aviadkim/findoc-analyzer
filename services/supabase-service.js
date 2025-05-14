/**
 * Supabase Service
 *
 * This service provides integration with Supabase for multi-tenant data storage.
 * It includes functions for user authentication, document storage, and tenant management.
 */

const { createClient } = require('@supabase/supabase-js');
// Try to import Secret Manager, but don't fail if it's not available
let SecretManagerServiceClient;
try {
  SecretManagerServiceClient = require('@google-cloud/secret-manager').v1.SecretManagerServiceClient;
} catch (error) {
  console.warn('Google Cloud Secret Manager not available, will use environment variables or mock data');
}

// Configuration
let supabaseUrl = process.env.SUPABASE_URL || 'https://dnjnsotemnfrjlotgved.supabase.co';
let supabaseKey = process.env.SUPABASE_KEY;
let supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

// Supabase client instances
let supabaseClient = null;
let supabaseAdminClient = null;

/**
 * Initialize the Supabase client
 * @returns {Promise<object>} - Supabase client
 */
async function initSupabaseClient() {
  try {
    // If client already exists, return it
    if (supabaseClient) {
      return supabaseClient;
    }

    // If no key is provided, try to get it from Secret Manager
    if (!supabaseKey && process.env.NODE_ENV === 'production' && process.env.GAE_ENV === 'standard' && SecretManagerServiceClient) {
      try {
        const client = new SecretManagerServiceClient();
        const name = 'projects/findoc-deploy/secrets/supabase-key/versions/latest';
        const [version] = await client.accessSecretVersion({ name });
        supabaseKey = version.payload.data.toString();
      } catch (error) {
        console.warn('Error getting Supabase key from Secret Manager:', error);
        // Continue to fallback methods
      }
    }

    // If still no key, use the one from the app.yaml file
    if (!supabaseKey) {
      supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRuam5zb3RlbW5mcmpsb3RndmVkIiwicm9sZSI6ImFub24iLCJpYXQiOjE2ODI0MzQ4NjcsImV4cCI6MTk5ODAxMDg2N30.t2oGhMPXxeY9jrQq5E7VDfGt2Vf_AgeStBjQfqfcBjY';
    }

    // Create the client
    supabaseClient = createClient(supabaseUrl, supabaseKey);
    return supabaseClient;
  } catch (error) {
    console.error('Error initializing Supabase client:', error);
    throw error;
  }
}

/**
 * Initialize the Supabase admin client
 * @returns {Promise<object>} - Supabase admin client
 */
async function initSupabaseAdminClient() {
  try {
    // If admin client already exists, return it
    if (supabaseAdminClient) {
      return supabaseAdminClient;
    }

    // If no service key is provided, try to get it from Secret Manager
    if (!supabaseServiceKey && process.env.NODE_ENV === 'production' && process.env.GAE_ENV === 'standard' && SecretManagerServiceClient) {
      try {
        const client = new SecretManagerServiceClient();
        const name = 'projects/findoc-deploy/secrets/supabase-service-key/versions/latest';
        const [version] = await client.accessSecretVersion({ name });
        supabaseServiceKey = version.payload.data.toString();
      } catch (error) {
        console.warn('Error getting Supabase service key from Secret Manager:', error);
        // Continue to fallback methods
      }
    }

    // If still no service key, use the one from the app.yaml file
    if (!supabaseServiceKey) {
      supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRuam5zb3RlbW5mcmpsb3RndmVkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczOTY0OTY4NiwiZXhwIjoyMDU1MjI1Njg2fQ.CSCEGIYPEVwKKlPRerEyEHkXP6Xz3rx3qviMGxdiZYs';
    }

    // Create the admin client
    supabaseAdminClient = createClient(supabaseUrl, supabaseServiceKey);
    return supabaseAdminClient;
  } catch (error) {
    console.error('Error initializing Supabase admin client:', error);
    throw error;
  }
}

/**
 * Sign up a new user
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<object>} - Sign up result
 */
async function signUp(email, password) {
  try {
    const supabase = await initSupabaseClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password
    });

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error signing up:', error);
    throw error;
  }
}

/**
 * Sign in a user
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<object>} - Sign in result
 */
async function signIn(email, password) {
  try {
    const supabase = await initSupabaseClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error signing in:', error);
    throw error;
  }
}

/**
 * Sign out a user
 * @returns {Promise<void>}
 */
async function signOut() {
  try {
    const supabase = await initSupabaseClient();
    const { error } = await supabase.auth.signOut();

    if (error) {
      throw error;
    }
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
}

/**
 * Get the current user
 * @returns {Promise<object>} - Current user
 */
async function getCurrentUser() {
  try {
    const supabase = await initSupabaseClient();
    const { data, error } = await supabase.auth.getUser();

    if (error) {
      throw error;
    }

    return data.user;
  } catch (error) {
    console.error('Error getting current user:', error);
    throw error;
  }
}

/**
 * Create a new tenant
 * @param {string} name - Tenant name
 * @param {string} userId - User ID of the tenant owner
 * @returns {Promise<object>} - Created tenant
 */
async function createTenant(name, userId) {
  try {
    const supabase = await initSupabaseAdminClient();

    // Create the tenant
    const { data: tenant, error: tenantError } = await supabase
      .from('tenants')
      .insert([
        { name, owner_id: userId }
      ])
      .select()
      .single();

    if (tenantError) {
      throw tenantError;
    }

    // Create a tenant_users record to associate the user with the tenant
    const { error: userError } = await supabase
      .from('tenant_users')
      .insert([
        { tenant_id: tenant.id, user_id: userId, role: 'owner' }
      ]);

    if (userError) {
      throw userError;
    }

    return tenant;
  } catch (error) {
    console.error('Error creating tenant:', error);
    throw error;
  }
}

/**
 * Get tenants for a user
 * @param {string} userId - User ID
 * @returns {Promise<Array>} - Tenants
 */
async function getUserTenants(userId) {
  try {
    const supabase = await initSupabaseClient();

    const { data, error } = await supabase
      .from('tenant_users')
      .select(`
        tenant_id,
        role,
        tenants (
          id,
          name,
          created_at
        )
      `)
      .eq('user_id', userId);

    if (error) {
      throw error;
    }

    // Transform the data to a more usable format
    return data.map(item => ({
      id: item.tenant_id,
      name: item.tenants.name,
      role: item.role,
      createdAt: item.tenants.created_at
    }));
  } catch (error) {
    console.error('Error getting user tenants:', error);
    throw error;
  }
}

/**
 * Add a user to a tenant
 * @param {string} tenantId - Tenant ID
 * @param {string} email - User email
 * @param {string} role - User role (member, admin)
 * @returns {Promise<object>} - Created tenant_user record
 */
async function addUserToTenant(tenantId, email, role) {
  try {
    const supabase = await initSupabaseAdminClient();

    // Get the user by email
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (userError) {
      throw userError;
    }

    // Add the user to the tenant
    const { data, error } = await supabase
      .from('tenant_users')
      .insert([
        { tenant_id: tenantId, user_id: userData.id, role }
      ])
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error adding user to tenant:', error);
    throw error;
  }
}

/**
 * Store a document
 * @param {object} document - Document object
 * @param {string} tenantId - Tenant ID
 * @returns {Promise<object>} - Stored document
 */
async function storeDocument(document, tenantId) {
  try {
    const supabase = await initSupabaseClient();

    // Store the document
    const { data, error } = await supabase
      .from('documents')
      .insert([
        {
          ...document,
          tenant_id: tenantId
        }
      ])
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error storing document:', error);
    throw error;
  }
}

/**
 * Get documents for a tenant
 * @param {string} tenantId - Tenant ID
 * @returns {Promise<Array>} - Documents
 */
async function getTenantDocuments(tenantId) {
  try {
    const supabase = await initSupabaseClient();

    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error getting tenant documents:', error);
    throw error;
  }
}

/**
 * Get a document by ID
 * @param {string} documentId - Document ID
 * @returns {Promise<object>} - Document
 */
async function getDocument(documentId) {
  try {
    const supabase = await initSupabaseClient();

    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('id', documentId)
      .single();

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error getting document:', error);
    throw error;
  }
}

/**
 * Store document analysis results
 * @param {string} documentId - Document ID
 * @param {object} results - Analysis results
 * @returns {Promise<object>} - Stored analysis
 */
async function storeDocumentAnalysis(documentId, results) {
  try {
    const supabase = await initSupabaseClient();

    // Store the analysis
    const { data, error } = await supabase
      .from('document_analyses')
      .insert([
        {
          document_id: documentId,
          results
        }
      ])
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error storing document analysis:', error);
    throw error;
  }
}

/**
 * Get document analysis results
 * @param {string} documentId - Document ID
 * @returns {Promise<object>} - Analysis results
 */
async function getDocumentAnalysis(documentId) {
  try {
    const supabase = await initSupabaseClient();

    const { data, error } = await supabase
      .from('document_analyses')
      .select('*')
      .eq('document_id', documentId)
      .single();

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error getting document analysis:', error);
    throw error;
  }
}

/**
 * Store API keys for a tenant
 * @param {string} tenantId - Tenant ID
 * @param {object} apiKeys - API keys object
 * @returns {Promise<object>} - Stored API keys
 */
async function storeTenantApiKeys(tenantId, apiKeys) {
  try {
    const supabase = await initSupabaseAdminClient();

    // Store the API keys
    const { data, error } = await supabase
      .from('tenant_api_keys')
      .upsert([
        {
          tenant_id: tenantId,
          api_keys: apiKeys
        }
      ], { onConflict: 'tenant_id' })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error storing tenant API keys:', error);
    throw error;
  }
}

/**
 * Get API keys for a tenant
 * @param {string} tenantId - Tenant ID
 * @returns {Promise<object>} - API keys
 */
async function getTenantApiKeys(tenantId) {
  try {
    const supabase = await initSupabaseAdminClient();

    const { data, error } = await supabase
      .from('tenant_api_keys')
      .select('api_keys')
      .eq('tenant_id', tenantId)
      .single();

    if (error) {
      throw error;
    }

    return data.api_keys;
  } catch (error) {
    console.error('Error getting tenant API keys:', error);
    throw error;
  }
}

module.exports = {
  initSupabaseClient,
  initSupabaseAdminClient,
  signUp,
  signIn,
  signOut,
  getCurrentUser,
  createTenant,
  getUserTenants,
  addUserToTenant,
  storeDocument,
  getTenantDocuments,
  getDocument,
  storeDocumentAnalysis,
  getDocumentAnalysis,
  storeTenantApiKeys,
  getTenantApiKeys
};
