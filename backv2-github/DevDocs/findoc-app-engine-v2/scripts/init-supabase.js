/**
 * Initialize Supabase Database
 * 
 * This script initializes the Supabase database with test data.
 */

require('dotenv').config();
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const { supabase, initializeDatabase } = require('../src/api/services/supabaseService');

// Test data
const testUsers = [
  {
    id: uuidv4(),
    name: 'Admin User',
    email: 'admin@example.com',
    password: 'admin123',
    role: 'admin',
    organization: 'FinDoc Inc.',
    tenant_id: 'tenant1',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: uuidv4(),
    name: 'Test User',
    email: 'user@example.com',
    password: 'user123',
    role: 'user',
    organization: 'FinDoc Inc.',
    tenant_id: 'tenant1',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: uuidv4(),
    name: 'Tenant 2 Admin',
    email: 'admin2@example.com',
    password: 'admin123',
    role: 'admin',
    organization: 'Another Company',
    tenant_id: 'tenant2',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

const testApiKeys = [
  {
    id: uuidv4(),
    name: 'Gemini API Key',
    type: 'gemini',
    key: process.env.GEMINI_API_KEY || 'AIzaSyDxxxxxxxxxxxxxxxxxxxxxxxxxxx',
    user_id: '', // Will be set to admin user ID
    tenant_id: 'tenant1',
    created_at: new Date().toISOString(),
    last_used: null
  },
  {
    id: uuidv4(),
    name: 'OpenAI API Key',
    type: 'openai',
    key: process.env.OPENAI_API_KEY || 'sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
    user_id: '', // Will be set to admin user ID
    tenant_id: 'tenant1',
    created_at: new Date().toISOString(),
    last_used: null
  },
  {
    id: uuidv4(),
    name: 'Tenant 2 Gemini API Key',
    type: 'gemini',
    key: process.env.GEMINI_API_KEY || 'AIzaSyDyyyyyyyyyyyyyyyyyyyyyyyy',
    user_id: '', // Will be set to tenant 2 admin user ID
    tenant_id: 'tenant2',
    created_at: new Date().toISOString(),
    last_used: null
  }
];

/**
 * Initialize database
 */
const initializeData = async () => {
  try {
    console.log('Initializing Supabase database...');

    // Initialize database tables
    await initializeDatabase();

    // Hash passwords
    for (const user of testUsers) {
      user.password = await bcrypt.hash(user.password, 10);
    }

    // Insert users
    const { data: users, error: usersError } = await supabase
      .from('users')
      .insert(testUsers)
      .select();

    if (usersError) {
      console.error('Error inserting users:', usersError);
      return;
    }

    console.log(`Inserted ${users.length} users`);

    // Set user IDs for API keys
    testApiKeys[0].user_id = users[0].id; // Admin user
    testApiKeys[1].user_id = users[0].id; // Admin user
    testApiKeys[2].user_id = users[2].id; // Tenant 2 admin user

    // Insert API keys
    const { data: apiKeys, error: apiKeysError } = await supabase
      .from('api_keys')
      .insert(testApiKeys)
      .select();

    if (apiKeysError) {
      console.error('Error inserting API keys:', apiKeysError);
      return;
    }

    console.log(`Inserted ${apiKeys.length} API keys`);

    console.log('Database initialization complete');
  } catch (error) {
    console.error('Error initializing database:', error);
  } finally {
    process.exit(0);
  }
};

// Run initialization
initializeData();
