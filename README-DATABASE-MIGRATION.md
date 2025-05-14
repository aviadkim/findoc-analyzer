# Database Migration Guide

This guide explains how to use the database migration tools to update your database schema to the optimized version.

## Overview

The migration system provides a way to safely upgrade your database schema while preserving existing data. It includes:

- A comprehensive schema definition (`OPTIMIZED_DATABASE_SCHEMA.sql`)
- A migration script that handles incremental updates (`scripts/db-migration.js`)
- A user-friendly CLI runner with safety features (`scripts/run-migration.js`)
- Tests to verify migration functionality (`tests/test-migration.js`)

## Features

- **Incremental upgrades**: Only applies changes that aren't already in your database
- **Data preservation**: Preserves all existing data during migration
- **Version tracking**: Tracks which schema version is currently applied
- **Rollback capability**: Records information needed for rollbacks
- **Backup option**: Creates database backups before migration
- **Preview mode**: Shows what will change without making actual changes
- **Automated testing**: Tests migration on a sample database

## Prerequisites

1. Node.js (v14+)
2. PostgreSQL (v12+)
3. Database connection information (host, port, username, password)

## Configuration

Set the following environment variables to configure database connections:

```
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=findoc
```

For testing, you can set separate test database credentials:

```
TEST_DB_HOST=localhost
TEST_DB_PORT=5432
TEST_DB_USER=postgres
TEST_DB_PASSWORD=your_password
TEST_DB_NAME=findoc_test
```

## Usage

### 1. Preview Migration

To see what changes would be applied without modifying the database:

```
node scripts/run-migration.js --preview
```

This will analyze your current database schema and show what tables, columns, indexes, and constraints would be added or modified.

### 2. Run Migration with Backup

To run the migration with a backup (recommended for production):

```
node scripts/run-migration.js --backup
```

This will:
1. Create a full database backup using `pg_dump`
2. Run the migration with confirmation prompt
3. Report success or failure

### 3. Run Migration (No Confirmation)

For automated environments, you can skip confirmations:

```
node scripts/run-migration.js --force
```

This will run the migration without prompting for confirmation.

### 4. Run Tests

To run tests that verify the migration works correctly:

```
node tests/test-migration.js
```

Note: This requires a test database as it will reset the schema.

## Schema Enhancements

The optimized schema includes numerous improvements:

1. **Table Partitioning** for large tables (document_pages, document_contents)
2. **Full-Text Search** capabilities with GIN indexes
3. **Materialized Views** for expensive queries 
4. **Advanced Indexes** for optimal query performance
5. **Row-Level Security** for multi-tenant data isolation
6. **New Tables** for enhanced features:
   - `document_versions`: Document version history
   - `securities_feedback`: User feedback on securities extraction
   - `chat_sessions`: Persistent chat conversations
   - `system_metrics`: Performance and usage metrics

## Troubleshooting

### Migration Fails

If the migration fails, check the following:

1. Database connection settings
2. PostgreSQL version (should be 12+)
3. Database permissions (user needs CREATE, ALTER, etc. privileges)
4. Available disk space

If you created a backup before migration, you can restore it using:

```
psql -h [host] -p [port] -U [username] -d [database] -f backup-file.sql
```

### Manually Fixing Issues

If you need to manually fix migration issues:

1. Check the `schema_migrations` table to see what failed
2. Apply manual fixes to the database
3. Update the migration record to mark it as successful

## Best Practices

1. Always run in preview mode first
2. Always create backups before production migrations
3. Test migrations in a staging environment first
4. Schedule migrations during low-traffic periods

## Schema Migration History

| Version | Date       | Description                                |
|---------|------------|--------------------------------------------|
| 1.0.0   | 2025-05-14 | Initial optimized schema                   |
| 1.0.1   | 2025-05-14 | Incremental updates for existing databases |