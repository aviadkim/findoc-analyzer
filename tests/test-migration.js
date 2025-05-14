/**
 * Tests for database migration script
 */

const assert = require('assert');
const { Pool } = require('pg');
const { migrateDatabase, checkExistingSchema, getCurrentVersion } = require('../scripts/db-migration');
const logger = require('../services/logger-service');

// Test database config - should use a test database, not production
const testDbConfig = {
  user: process.env.TEST_DB_USER || 'postgres',
  host: process.env.TEST_DB_HOST || 'localhost',
  database: process.env.TEST_DB_NAME || 'findoc_test',
  password: process.env.TEST_DB_PASSWORD || 'postgres',
  port: process.env.TEST_DB_PORT || 5432
};

// Override pool in migration script
const pool = new Pool(testDbConfig);

async function setupTestDb() {
  try {
    logger.info('Setting up test database');
    const client = await pool.connect();
    
    try {
      // Drop existing tables for clean slate
      await client.query(`
        DROP SCHEMA public CASCADE;
        CREATE SCHEMA public;
        GRANT ALL ON SCHEMA public TO postgres;
        GRANT ALL ON SCHEMA public TO public;
      `);
      
      // Create minimal test schema
      await client.query(`
        -- Create basic users table
        CREATE TABLE users (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          email VARCHAR(255) UNIQUE NOT NULL,
          password VARCHAR(255) NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
        
        -- Create basic documents table
        CREATE TABLE documents (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          title VARCHAR(255) NOT NULL,
          user_id UUID REFERENCES users(id),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
        
        -- Create test data
        INSERT INTO users (id, email, password)
        VALUES 
          ('00000000-0000-0000-0000-000000000001', 'test@example.com', 'password_hash'),
          ('00000000-0000-0000-0000-000000000002', 'admin@example.com', 'admin_hash');
          
        INSERT INTO documents (id, title, user_id)
        VALUES
          ('00000000-0000-0000-0000-000000000001', 'Test Document 1', '00000000-0000-0000-0000-000000000001'),
          ('00000000-0000-0000-0000-000000000002', 'Test Document 2', '00000000-0000-0000-0000-000000000002');
      `);
      
      logger.info('Test database setup complete');
    } finally {
      client.release();
    }
  } catch (error) {
    logger.error('Test database setup failed', { error: error.message });
    throw error;
  }
}

async function runTests() {
  try {
    // Initialize test environment
    await setupTestDb();
    
    // Test 1: Check existing schema detection
    const schemaCheck = await checkExistingSchema();
    assert(schemaCheck.hasExistingSchema, 'Should detect existing schema');
    assert(schemaCheck.tables.includes('users'), 'Should detect users table');
    assert(schemaCheck.tables.includes('documents'), 'Should detect documents table');
    assert.strictEqual(schemaCheck.version, null, 'Initial version should be null');
    console.log('✓ Test 1: Existing schema detection');
    
    // Test 2: Run migration
    const migrationResult = await migrateDatabase();
    assert(migrationResult.success, 'Migration should succeed');
    console.log('✓ Test 2: Database migration');
    
    // Test 3: Check version after migration
    const versionAfterMigration = await getCurrentVersion();
    assert(versionAfterMigration, 'Should have a version after migration');
    console.log('✓ Test 3: Schema version tracking');
    
    // Test 4: Check if new tables were created
    const client = await pool.connect();
    try {
      // Check if document_versions table exists
      const versionsTableCheck = await client.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'document_versions'
        )
      `);
      assert(versionsTableCheck.rows[0].exists, 'document_versions table should exist');
      
      // Check if securities_feedback table exists
      const feedbackTableCheck = await client.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'securities_feedback'
        )
      `);
      assert(feedbackTableCheck.rows[0].exists, 'securities_feedback table should exist');
      
      console.log('✓ Test 4: New tables creation');
    } finally {
      client.release();
    }
    
    // Test 5: Check if existing data is preserved
    const client2 = await pool.connect();
    try {
      const userResult = await client2.query('SELECT COUNT(*) FROM users');
      assert.strictEqual(parseInt(userResult.rows[0].count), 2, 'User data should be preserved');
      
      const documentResult = await client2.query('SELECT COUNT(*) FROM documents');
      assert.strictEqual(parseInt(documentResult.rows[0].count), 2, 'Document data should be preserved');
      
      console.log('✓ Test 5: Data preservation');
    } finally {
      client2.release();
    }
    
    // Test 6: Idempotency - running migration twice should not cause errors
    const secondMigrationResult = await migrateDatabase();
    assert(secondMigrationResult.success, 'Second migration should succeed');
    assert.strictEqual(secondMigrationResult.appliedMigrations, 0, 'No migrations should be applied on second run');
    console.log('✓ Test 6: Migration idempotency');
    
    console.log('\nAll tests passed successfully!');
  } catch (error) {
    console.error('Test failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run tests when script is executed directly
if (require.main === module) {
  runTests()
    .then(() => process.exit(0))
    .catch(err => {
      console.error('Unhandled error during tests:', err);
      process.exit(1);
    });
}