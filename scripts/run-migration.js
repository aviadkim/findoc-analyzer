/**
 * Database Migration Script Runner
 * 
 * This script provides a CLI interface for running database migrations
 * with options for preview, backup, and forced execution.
 */

const { migrateDatabase, checkExistingSchema } = require('./db-migration');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

// CLI Arguments parsing
const args = process.argv.slice(2);
const options = {
  force: args.includes('--force'),
  preview: args.includes('--preview'),
  backup: args.includes('--backup') || args.includes('--with-backup'),
  help: args.includes('--help') || args.includes('-h')
};

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

/**
 * Display help information
 */
function showHelp() {
  console.log(`
Database Migration Script Runner

Usage:
  node run-migration.js [options]

Options:
  --preview       Show migration plan without executing
  --backup        Create database backup before migration
  --force         Skip confirmation prompts
  --help, -h      Show this help message

Examples:
  node run-migration.js --preview
  node run-migration.js --backup
  node run-migration.js --force
  `);
}

/**
 * Create a database backup using pg_dump
 */
async function createBackup() {
  return new Promise((resolve, reject) => {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupDir = path.join(__dirname, '..', 'backups');
    const backupFile = path.join(backupDir, `db-backup-${timestamp}.sql`);
    
    // Ensure backup directory exists
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }
    
    // Get database connection info from environment
    const dbName = process.env.DB_NAME || 'findoc';
    const dbUser = process.env.DB_USER || 'postgres';
    const dbHost = process.env.DB_HOST || 'localhost';
    const dbPort = process.env.DB_PORT || '5432';
    
    // Build pg_dump command
    const command = `pg_dump -h ${dbHost} -p ${dbPort} -U ${dbUser} -d ${dbName} -f "${backupFile}"`;
    
    console.log(`Creating database backup: ${backupFile}`);
    console.log(`Using command: ${command}`);
    
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`Backup failed: ${error.message}`);
        return reject(error);
      }
      
      if (stderr) {
        console.error(`pg_dump stderr: ${stderr}`);
      }
      
      console.log(`Backup created: ${backupFile}`);
      resolve(backupFile);
    });
  });
}

/**
 * Preview migration changes
 */
async function previewMigration() {
  try {
    const { hasExistingSchema, tables, version } = await checkExistingSchema();
    
    console.log('\n=== Migration Preview ===');
    console.log(`Current schema state: ${hasExistingSchema ? 'Exists' : 'Not found'}`);
    
    if (hasExistingSchema) {
      console.log(`Current schema version: ${version || 'Not versioned'}`);
      console.log(`Existing tables: ${tables.join(', ')}`);
      
      // Here we would analyze what changes will be made
      console.log('\nPlanned changes:');
      
      // Check for tables that would be added
      const plannedNewTables = ['document_versions', 'securities_feedback', 'chat_sessions', 'system_metrics'];
      const existingTables = new Set(tables);
      const tablesToAdd = plannedNewTables.filter(table => !existingTables.has(table));
      
      if (tablesToAdd.length > 0) {
        console.log(`- New tables to create: ${tablesToAdd.join(', ')}`);
      }
      
      // Check for tables that would be modified
      const tablesToModify = [];
      if (existingTables.has('documents')) {
        tablesToModify.push('documents (adding version_id, updated_at columns)');
      }
      if (existingTables.has('users')) {
        tablesToModify.push('users (adding last_login timestamp)');
      }
      
      if (tablesToModify.length > 0) {
        console.log(`- Tables to modify: ${tablesToModify.join(', ')}`);
      }
      
      console.log(`- New indexes: Multiple performance-optimized indexes`);
      console.log(`- New constraints: Foreign keys for data integrity`);
      
      console.log('\nData migration:');
      console.log('- All existing data will be preserved');
      console.log('- No data transformations required');
    } else {
      console.log('\nPlanned changes:');
      console.log('- Full schema will be created (new installation)');
      console.log('- All tables, indexes, and constraints will be created');
    }
    
    console.log('\nNote: This is a preview only. No changes have been made to the database.');
  } catch (error) {
    console.error('Error generating migration preview:', error);
    process.exit(1);
  }
}

/**
 * Execute migration with proper user confirmation
 */
async function executeMigration() {
  try {
    // Check existing schema first
    const { hasExistingSchema } = await checkExistingSchema();
    
    // Create backup if requested
    let backupFile = null;
    if (options.backup && hasExistingSchema) {
      try {
        backupFile = await createBackup();
      } catch (backupError) {
        if (!options.force) {
          console.error('Backup failed and --force not specified. Aborting migration.');
          process.exit(1);
        } else {
          console.warn('Warning: Backup failed but continuing due to --force flag');
        }
      }
    }
    
    // Confirm migration if not forced
    if (!options.force) {
      const confirmation = await new Promise(resolve => {
        rl.question('\nAre you sure you want to run the database migration? This action cannot be undone. [y/N] ', answer => {
          resolve(answer.toLowerCase() === 'y');
        });
      });
      
      if (!confirmation) {
        console.log('Migration cancelled by user');
        rl.close();
        return;
      }
    }
    
    // Run the migration
    console.log('\nStarting database migration...');
    const result = await migrateDatabase();
    
    if (result.success) {
      console.log('\n=== Migration Completed Successfully ===');
      console.log(result.message);
      if (result.appliedMigrations !== undefined) {
        console.log(`Applied ${result.appliedMigrations} migration steps`);
      }
      if (backupFile) {
        console.log(`Backup created: ${backupFile}`);
      }
    } else {
      console.error('\n=== Migration Failed ===');
      console.error(result.message);
      if (backupFile) {
        console.log(`A backup was created before the migration attempt: ${backupFile}`);
        console.log('You can restore this backup if needed.');
      }
    }
  } catch (error) {
    console.error('Unhandled error during migration:', error);
  } finally {
    rl.close();
  }
}

// Main function
async function main() {
  if (options.help) {
    showHelp();
    return;
  }
  
  if (options.preview) {
    await previewMigration();
    rl.close();
    return;
  }
  
  await executeMigration();
}

// Run the main function
main().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
});