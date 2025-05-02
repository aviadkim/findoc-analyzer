/**
 * Supabase Service
 *
 * This service handles interactions with the Supabase database.
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Get Supabase credentials from environment variables
const supabaseUrl = process.env.SUPABASE_URL || 'https://dnjnsotemnfrjlotgved.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRuam5zb3RlbW5mcmpsb3RndmVkIiwicm9sZSI6ImFub24iLCJpYXQiOjE2ODI0MzQ4NjcsImV4cCI6MTk5ODAxMDg2N30.t2oGhMPXxeY9jrQq5E7VDfGt2Vf_AgeStBjQfqfcBjY';

if (!supabaseUrl) {
  console.error('SUPABASE_URL is required');
}

if (!supabaseKey) {
  console.error('SUPABASE_KEY is required');
}

// Initialize Supabase client
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  }
});

/**
 * Initialize database
 * @returns {Promise<void>}
 */
const initializeDatabase = async () => {
  try {
    console.log('Initializing database...');

    // Check if tables exist
    const { data: tables, error: tablesError } = await supabase
      .from('pg_tables')
      .select('tablename')
      .eq('schemaname', 'public');

    if (tablesError) {
      console.error('Error checking tables:', tablesError);
      return;
    }

    const tableNames = tables.map(table => table.tablename);
    console.log('Existing tables:', tableNames);

    // Create tables if they don't exist
    if (!tableNames.includes('users')) {
      console.log('Creating users table...');
      await supabase.query(`
        CREATE TABLE IF NOT EXISTS users (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          name TEXT NOT NULL,
          email TEXT UNIQUE NOT NULL,
          password TEXT NOT NULL,
          role TEXT DEFAULT 'user',
          organization TEXT,
          tenant_id UUID NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `);
    }

    if (!tableNames.includes('documents')) {
      console.log('Creating documents table...');
      await supabase.query(`
        CREATE TABLE IF NOT EXISTS documents (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          name TEXT NOT NULL,
          type TEXT NOT NULL,
          size INTEGER NOT NULL,
          path TEXT NOT NULL,
          url TEXT,
          status TEXT DEFAULT 'pending',
          metadata JSONB DEFAULT '{}',
          user_id UUID REFERENCES users(id),
          tenant_id UUID NOT NULL,
          uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          processed_at TIMESTAMP WITH TIME ZONE
        );
      `);
    }

    if (!tableNames.includes('api_keys')) {
      console.log('Creating api_keys table...');
      await supabase.query(`
        CREATE TABLE IF NOT EXISTS api_keys (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          service TEXT NOT NULL,
          key TEXT NOT NULL,
          tenant_id UUID NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `);
    }

    if (!tableNames.includes('scan1_results')) {
      console.log('Creating scan1_results table...');
      await supabase.query(`
        CREATE TABLE IF NOT EXISTS scan1_results (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          document_id UUID REFERENCES documents(id),
          status TEXT DEFAULT 'pending',
          results JSONB DEFAULT '{}',
          securities JSONB DEFAULT '[]',
          tables JSONB DEFAULT '[]',
          metadata JSONB DEFAULT '{}',
          tenant_id UUID NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `);
    }

    console.log('Database initialization complete');
  } catch (error) {
    console.error('Error initializing database:', error);
  }
};

/**
 * Create users table if it doesn't exist
 * @returns {Promise<void>}
 */
const createUsersTable = async () => {
  try {
    // Check if table exists
    const { data: tables } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_name', 'users');

    if (!tables || tables.length === 0) {
      // Create table
      await supabase.rpc('create_users_table');
    }
  } catch (error) {
    console.error('Error creating users table:', error);
    throw error;
  }
};

/**
 * Create documents table if it doesn't exist
 * @returns {Promise<void>}
 */
const createDocumentsTable = async () => {
  try {
    // Check if table exists
    const { data: tables } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_name', 'documents');

    if (!tables || tables.length === 0) {
      // Create table
      await supabase.rpc('create_documents_table');
    }
  } catch (error) {
    console.error('Error creating documents table:', error);
    throw error;
  }
};

/**
 * Create API keys table if it doesn't exist
 * @returns {Promise<void>}
 */
const createApiKeysTable = async () => {
  try {
    // Check if table exists
    const { data: tables } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_name', 'api_keys');

    if (!tables || tables.length === 0) {
      // Create table
      await supabase.rpc('create_api_keys_table');
    }
  } catch (error) {
    console.error('Error creating API keys table:', error);
    throw error;
  }
};

/**
 * Create portfolios table if it doesn't exist
 * @returns {Promise<void>}
 */
const createPortfoliosTable = async () => {
  try {
    // Check if table exists
    const { data: tables } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_name', 'portfolios');

    if (!tables || tables.length === 0) {
      // Create table
      await supabase.rpc('create_portfolios_table');
    }
  } catch (error) {
    console.error('Error creating portfolios table:', error);
    throw error;
  }
};

/**
 * Create comparisons table if it doesn't exist
 * @returns {Promise<void>}
 */
const createComparisonsTable = async () => {
  try {
    // Check if table exists
    const { data: tables } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_name', 'comparisons');

    if (!tables || tables.length === 0) {
      // Create table
      await supabase.rpc('create_comparisons_table');
    }
  } catch (error) {
    console.error('Error creating comparisons table:', error);
    throw error;
  }
};

/**
 * Create chat history table if it doesn't exist
 * @returns {Promise<void>}
 */
const createChatHistoryTable = async () => {
  try {
    // Check if table exists
    const { data: tables } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_name', 'chat_history');

    if (!tables || tables.length === 0) {
      // Create table
      await supabase.rpc('create_chat_history_table');
    }
  } catch (error) {
    console.error('Error creating chat history table:', error);
    throw error;
  }
};

/**
 * Create templates table if it doesn't exist
 * @returns {Promise<void>}
 */
const createTemplatesTable = async () => {
  try {
    // Check if table exists
    const { data: tables } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_name', 'templates');

    if (!tables || tables.length === 0) {
      // Create table
      await supabase.rpc('create_templates_table');
    }
  } catch (error) {
    console.error('Error creating templates table:', error);
    throw error;
  }
};

/**
 * Create batch jobs table if it doesn't exist
 * @returns {Promise<void>}
 */
const createBatchJobsTable = async () => {
  try {
    // Check if table exists
    const { data: tables } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_name', 'batch_jobs');

    if (!tables || tables.length === 0) {
      // Create table
      await supabase.rpc('create_batch_jobs_table');
    }
  } catch (error) {
    console.error('Error creating batch jobs table:', error);
    throw error;
  }
};

/**
 * Create document versions table if it doesn't exist
 * @returns {Promise<void>}
 */
const createDocumentVersionsTable = async () => {
  try {
    // Check if table exists
    const { data: tables } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_name', 'document_versions');

    if (!tables || tables.length === 0) {
      // Create table
      await supabase.rpc('create_document_versions_table');
    }
  } catch (error) {
    console.error('Error creating document versions table:', error);
    throw error;
  }
};

/**
 * Create reports table if it doesn't exist
 * @returns {Promise<void>}
 */
const createReportsTable = async () => {
  try {
    // Check if table exists
    const { data: tables } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_name', 'reports');

    if (!tables || tables.length === 0) {
      // Create table
      await supabase.rpc('create_reports_table');
    }
  } catch (error) {
    console.error('Error creating reports table:', error);
    throw error;
  }
};

/**
 * Create schedules table if it doesn't exist
 * @returns {Promise<void>}
 */
const createSchedulesTable = async () => {
  try {
    // Check if table exists
    const { data: tables } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_name', 'schedules');

    if (!tables || tables.length === 0) {
      // Create table
      await supabase.rpc('create_schedules_table');
    }
  } catch (error) {
    console.error('Error creating schedules table:', error);
    throw error;
  }
};

/**
 * Create alerts table if it doesn't exist
 * @returns {Promise<void>}
 */
const createAlertsTable = async () => {
  try {
    // Check if table exists
    const { data: tables } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_name', 'alerts');

    if (!tables || tables.length === 0) {
      // Create table
      await supabase.rpc('create_alerts_table');
    }
  } catch (error) {
    console.error('Error creating alerts table:', error);
    throw error;
  }
};

/**
 * Create audit logs table if it doesn't exist
 * @returns {Promise<void>}
 */
const createAuditLogsTable = async () => {
  try {
    // Check if table exists
    const { data: tables } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_name', 'audit_logs');

    if (!tables || tables.length === 0) {
      // Create table
      await supabase.rpc('create_audit_logs_table');
    }
  } catch (error) {
    console.error('Error creating audit logs table:', error);
    throw error;
  }
};

/**
 * Create feedback table if it doesn't exist
 * @returns {Promise<void>}
 */
const createFeedbackTable = async () => {
  try {
    // Check if table exists
    const { data: tables } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_name', 'feedback');

    if (!tables || tables.length === 0) {
      // Create table
      await supabase.rpc('create_feedback_table');
    }
  } catch (error) {
    console.error('Error creating feedback table:', error);
    throw error;
  }
};

module.exports = {
  supabase,
  initializeDatabase
};
