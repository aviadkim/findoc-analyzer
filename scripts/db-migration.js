/**
 * Database Migration Script
 * 
 * This script handles database schema migration from the existing schema to the optimized schema.
 * It performs safe migrations with rollback capabilities and preserves existing data.
 */

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
const logger = require('../services/logger-service');

// Configuration for database connection
// In production, this would be loaded from environment variables
const dbConfig = {
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'findoc',
  password: process.env.DB_PASSWORD || 'postgres',
  port: process.env.DB_PORT || 5432
};

const pool = new Pool(dbConfig);
const MIGRATION_TABLE = 'schema_migrations';

/**
 * Initialize the migration tracking table if it doesn't exist
 */
async function initMigrationTable() {
  try {
    const client = await pool.connect();
    try {
      // Check if migration table exists
      const tableCheck = await client.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = $1
        )`, [MIGRATION_TABLE]);
      
      if (!tableCheck.rows[0].exists) {
        logger.info('Creating migration tracking table');
        await client.query(`
          CREATE TABLE ${MIGRATION_TABLE} (
            id SERIAL PRIMARY KEY,
            version VARCHAR(50) NOT NULL UNIQUE,
            applied_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            description TEXT,
            success BOOLEAN NOT NULL,
            rollback_script TEXT
          )
        `);
        logger.info('Migration tracking table created successfully');
      } else {
        logger.info('Migration tracking table already exists');
      }
    } finally {
      client.release();
    }
  } catch (error) {
    logger.error('Failed to initialize migration table', { error: error.message, stack: error.stack });
    throw error;
  }
}

/**
 * Get the current database schema version
 */
async function getCurrentVersion() {
  try {
    const client = await pool.connect();
    try {
      // Check if table exists
      const tableCheck = await client.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = $1
        )`, [MIGRATION_TABLE]);
      
      if (!tableCheck.rows[0].exists) {
        return null;
      }
      
      // Get latest version
      const result = await client.query(`
        SELECT version 
        FROM ${MIGRATION_TABLE} 
        WHERE success = true 
        ORDER BY applied_at DESC 
        LIMIT 1
      `);
      
      return result.rows.length > 0 ? result.rows[0].version : null;
    } finally {
      client.release();
    }
  } catch (error) {
    logger.error('Failed to get current schema version', { error: error.message });
    throw error;
  }
}

/**
 * Check database structure to determine if it's using the old schema
 */
async function checkExistingSchema() {
  try {
    const client = await pool.connect();
    try {
      // Check for existence of our key tables to determine schema state
      const tablesCheck = await client.query(`
        SELECT table_name
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name IN (
          'users', 'documents', 'document_contents', 
          'securities', 'portfolios', 'tenants'
        )
      `);
      
      const tables = tablesCheck.rows.map(row => row.table_name);
      
      // If we have at least some of our tables, we have an existing schema
      return tables.length > 0 ? {
        hasExistingSchema: true,
        tables,
        version: await getCurrentVersion()
      } : {
        hasExistingSchema: false,
        tables: [],
        version: null
      };
    } finally {
      client.release();
    }
  } catch (error) {
    logger.error('Failed to check existing schema', { error: error.message });
    throw error;
  }
}

/**
 * Apply a single migration step
 */
async function applyMigration(migrationScript, version, description) {
  const client = await pool.connect();
  
  try {
    // Start transaction
    await client.query('BEGIN');
    
    // Generate rollback script before applying changes
    // This is a simplified approach - in a real implementation, each migration 
    // would have a manually created rollback script
    const tablesBeforeMigration = await client.query(`
      SELECT table_name
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    
    // Log migration start
    logger.info(`Applying migration ${version}: ${description}`);
    
    // Apply the migration
    await client.query(migrationScript);
    
    // Record the successful migration
    await client.query(`
      INSERT INTO ${MIGRATION_TABLE}
      (version, description, success, rollback_script)
      VALUES ($1, $2, $3, $4)
    `, [version, description, true, '-- Rollback script would be here']);
    
    // Commit transaction
    await client.query('COMMIT');
    
    logger.info(`Migration ${version} applied successfully`);
    return true;
  } catch (error) {
    // Rollback transaction on error
    await client.query('ROLLBACK');
    
    // Record the failed migration
    try {
      await client.query(`
        INSERT INTO ${MIGRATION_TABLE}
        (version, description, success, rollback_script)
        VALUES ($1, $2, $3, $4)
      `, [version, description, false, '']);
    } catch (recordError) {
      logger.error('Failed to record migration failure', { error: recordError.message });
    }
    
    logger.error(`Migration ${version} failed`, { error: error.message, stack: error.stack });
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Main migration function
 */
async function migrateDatabase() {
  try {
    logger.info('Starting database migration process');
    
    // Initialize migration tracking
    await initMigrationTable();
    
    // Check existing schema state
    const { hasExistingSchema, tables, version } = await checkExistingSchema();
    logger.info('Schema check complete', { hasExistingSchema, tables, currentVersion: version });
    
    // Load optimized schema
    const optimizedSchemaPath = path.join(__dirname, '..', 'OPTIMIZED_DATABASE_SCHEMA.sql');
    const optimizedSchema = fs.readFileSync(optimizedSchemaPath, 'utf8');
    
    if (!hasExistingSchema) {
      // Fresh installation - apply entire schema at once
      logger.info('No existing schema detected. Applying complete schema.');
      await applyMigration(optimizedSchema, '1.0.0', 'Initial schema creation');
      logger.info('Schema applied successfully');
      return { success: true, message: 'Initial schema created successfully' };
    }
    
    // Existing schema - need to perform incremental migration
    logger.info('Existing schema detected. Performing incremental migration.');
    
    // Here we would determine which migration files to apply
    // based on the current version
    
    // For demonstration purposes, we'll apply a simplified migration
    // that preserves existing data while adding new tables and columns
    
    // In a real-world scenario, you would:
    // 1. Have multiple migration files that can be applied in sequence
    // 2. Track which migrations have been applied in the migrations table
    // 3. Only apply migrations that haven't been applied yet
    // 4. Each migration would have specific up/down scripts
    
    // Build incremental migration script
    const client = await pool.connect();
    try {
      // Check existing table structures to build appropriate migration
      const incrementalMigrations = [];
      
      // Example: Add a column to an existing table if it doesn't exist
      if (tables.includes('documents')) {
        const columnsCheck = await client.query(`
          SELECT column_name 
          FROM information_schema.columns 
          WHERE table_schema = 'public' 
          AND table_name = 'documents' 
          AND column_name = 'version_id'
        `);
        
        if (columnsCheck.rows.length === 0) {
          incrementalMigrations.push(`
            -- Add version tracking to documents table
            ALTER TABLE documents ADD COLUMN IF NOT EXISTS version_id UUID;
            
            -- Create index on the new column
            CREATE INDEX IF NOT EXISTS idx_documents_version_id ON documents(version_id);
            
            -- Add updated_at and created_at columns if they don't exist
            ALTER TABLE documents 
              ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
              ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
              
            -- Add trigger to update the updated_at column
            CREATE OR REPLACE FUNCTION update_modified_column()
            RETURNS TRIGGER AS $$
            BEGIN
                NEW.updated_at = CURRENT_TIMESTAMP;
                RETURN NEW;
            END;
            $$ LANGUAGE plpgsql;
            
            DROP TRIGGER IF EXISTS set_documents_updated_at ON documents;
            CREATE TRIGGER set_documents_updated_at
            BEFORE UPDATE ON documents
            FOR EACH ROW
            EXECUTE FUNCTION update_modified_column();
          `);
        }
      }
      
      // Add new document_versions table if it doesn't exist
      const versionsTableCheck = await client.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'document_versions'
        )
      `);
      
      if (!versionsTableCheck.rows[0].exists) {
        incrementalMigrations.push(`
          -- Create document versions table
          CREATE TABLE document_versions (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            document_id UUID NOT NULL,
            version_number INTEGER NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            created_by UUID,
            contents JSONB,
            metadata JSONB,
            
            -- Add foreign key constraint to documents if it exists
            CONSTRAINT fk_document_versions_document_id 
              FOREIGN KEY (document_id) 
              REFERENCES documents(id) 
              ON DELETE CASCADE
          );
          
          -- Indexes
          CREATE INDEX idx_document_versions_document_id ON document_versions(document_id);
          CREATE INDEX idx_document_versions_created_at ON document_versions(created_at);
        `);
      }
      
      // Add securities_feedback table if it doesn't exist
      const feedbackTableCheck = await client.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'securities_feedback'
        )
      `);
      
      if (!feedbackTableCheck.rows[0].exists) {
        incrementalMigrations.push(`
          -- Create securities feedback table
          CREATE TABLE securities_feedback (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            document_id UUID NOT NULL,
            security_id UUID,
            original_data JSONB NOT NULL, 
            corrected_data JSONB,
            feedback_type VARCHAR(50) NOT NULL,
            status VARCHAR(20) DEFAULT 'pending',
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            created_by UUID,
            processed_at TIMESTAMP WITH TIME ZONE,
            
            -- Add foreign key constraints if parent tables exist
            CONSTRAINT fk_securities_feedback_document_id 
              FOREIGN KEY (document_id) 
              REFERENCES documents(id) 
              ON DELETE CASCADE
          );
          
          -- Indexes
          CREATE INDEX idx_securities_feedback_document_id ON securities_feedback(document_id);
          CREATE INDEX idx_securities_feedback_security_id ON securities_feedback(security_id);
          CREATE INDEX idx_securities_feedback_status ON securities_feedback(status);
        `);
      }
      
      // Apply incremental migrations if any
      if (incrementalMigrations.length > 0) {
        const combinedMigration = incrementalMigrations.join('\n\n');
        await applyMigration(
          combinedMigration, 
          version ? `${parseFloat(version) + 0.1}` : '1.0.1',
          'Incremental schema updates'
        );
        logger.info('Incremental schema updates applied successfully');
      } else {
        logger.info('No incremental updates needed');
      }
      
      return { 
        success: true, 
        message: 'Database migration completed successfully',
        appliedMigrations: incrementalMigrations.length
      };
    } finally {
      client.release();
    }
  } catch (error) {
    logger.error('Database migration failed', { error: error.message, stack: error.stack });
    return { success: false, message: `Migration failed: ${error.message}` };
  } finally {
    // Close the connection pool
    await pool.end();
  }
}

// CLI mode
if (require.main === module) {
  // Run the migration when script is executed directly
  migrateDatabase()
    .then(result => {
      console.log(JSON.stringify(result, null, 2));
      process.exit(result.success ? 0 : 1);
    })
    .catch(err => {
      console.error('Unhandled error during migration:', err);
      process.exit(1);
    });
} else {
  // Export for use as a module
  module.exports = {
    migrateDatabase,
    getCurrentVersion,
    checkExistingSchema
  };
}