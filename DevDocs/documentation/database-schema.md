# FinDoc Analyzer - Database Schema

## Version 1.0 (July 3, 2025)

## Overview

FinDoc Analyzer uses a relational database to store user data, documents, processing results, and financial information. The database schema is designed to support efficient querying and maintain data integrity through properly defined relationships.

This document describes the database tables, their columns, relationships, and indexes.

## Database Engine

- **Development**: SQLite
- **Production**: PostgreSQL (via Supabase)

## Entity Relationship Diagram

```
+------------------+       +---------------------+       +-------------------+
|      users       |       |      documents      |       |  processing_jobs  |
+------------------+       +---------------------+       +-------------------+
| id (PK)          |       | id (PK)             |       | id (PK)           |
| email            |<---+  | user_id (FK)        |<---+  | document_id (FK)  |
| name             |    |  | name                |    |  | status            |
| password_hash    |    |  | type                |    |  | pipeline          |
| created_at       |    |  | size                |    |  | progress          |
| updated_at       |    |  | status              |    |  | result            |
+------------------+    |  | storage_path        |    |  | started_at        |
                        |  | created_at          |    |  | completed_at      |
                        |  | updated_at          |    |  | created_at        |
                        |  +---------------------+    |  | updated_at        |
                        |                             |  +-------------------+
                        |                             |
+-----------------+     |  +---------------------+    |  +-------------------+
|    settings     |     |  |     securities      |    |  |     portfolios    |
+-----------------+     |  +---------------------+    |  +-------------------+
| id (PK)         |     |  | id (PK)             |    |  | id (PK)           |
| user_id (FK)    |<----+  | document_id (FK)    |<---+  | document_id (FK)  |
| theme           |        | name                |    |  | total_value       |
| notifications   |        | isin                |<---+  | currency          |
| preferences     |        | quantity            |    |  | date              |
| created_at      |        | price               |    |  | created_at        |
| updated_at      |        | value               |    |  | updated_at        |
+-----------------+        | weight              |    |  +-------------------+
                           | currency            |    |
                           | sector              |    |  +-------------------+
                           | asset_class         |    |  |   comparisons     |
                           | created_at          |    |  +-------------------+
                           | updated_at          |    |  | id (PK)           |
                           +---------------------+    |  | user_id (FK)      |
                                                      |  | name              |
+------------------+       +---------------------+    |  | description       |
|  agent_pipelines |       |   agent_executions  |    |  | documents         |
+------------------+       +---------------------+    |  | result            |
| id (PK)          |       | id (PK)             |    |  | created_at        |
| user_id (FK)     |<--+   | job_id (FK)         |<---+  | updated_at        |
| name             |   |   | agent_id            |    |  +-------------------+
| description      |   |   | status              |    |
| agents           |   |   | parameters          |    |  +-------------------+
| created_at       |   |   | result              |    |  |    analytics      |
| updated_at       |   |   | started_at          |    |  +-------------------+
+------------------+   |   | completed_at        |    |  | id (PK)           |
                       |   | created_at          |    |  | portfolio_id (FK) |
                       |   | updated_at          |    |  | type              |
                       |   +---------------------+    |  | data              |
                       |                              |  | created_at        |
                       |   +---------------------+    |  | updated_at        |
                       |   |  pipeline_executions|    |  +-------------------+
                       |   +---------------------+    |
                       |   | id (PK)             |    |  +-------------------+
                       +-->| pipeline_id (FK)    |<---+  |  recommendations  |
                           | document_id (FK)    |       +-------------------+
                           | status              |       | id (PK)           |
                           | result              |       | portfolio_id (FK) |
                           | started_at          |       | risk_profile      |
                           | completed_at        |       | recommendations   |
                           | created_at          |       | actions           |
                           | updated_at          |       | created_at        |
                           +---------------------+       | updated_at        |
                                                         +-------------------+
```

## Table Definitions

### users

Stores user account information.

| Column        | Type         | Constraints        | Description                      |
|---------------|--------------|-------------------|----------------------------------|
| id            | UUID         | PK, NOT NULL      | Unique identifier                |
| email         | VARCHAR(255) | UNIQUE, NOT NULL  | User's email address             |
| name          | VARCHAR(255) | NOT NULL          | User's full name                 |
| password_hash | VARCHAR(255) | NOT NULL          | Hashed password                  |
| created_at    | TIMESTAMP    | NOT NULL          | Record creation timestamp        |
| updated_at    | TIMESTAMP    | NOT NULL          | Record last update timestamp     |

**Indexes:**
- Primary key on `id`
- Unique index on `email`

### settings

Stores user settings and preferences.

| Column        | Type         | Constraints        | Description                      |
|---------------|--------------|-------------------|----------------------------------|
| id            | UUID         | PK, NOT NULL      | Unique identifier                |
| user_id       | UUID         | FK, NOT NULL      | Reference to users.id            |
| theme         | VARCHAR(50)  | NOT NULL          | UI theme (light, dark, etc.)     |
| notifications | JSONB        |                   | Notification preferences         |
| preferences   | JSONB        |                   | General user preferences         |
| created_at    | TIMESTAMP    | NOT NULL          | Record creation timestamp        |
| updated_at    | TIMESTAMP    | NOT NULL          | Record last update timestamp     |

**Indexes:**
- Primary key on `id`
- Foreign key index on `user_id`

**Foreign Keys:**
- `user_id` references `users(id)` ON DELETE CASCADE

### documents

Stores metadata for uploaded documents.

| Column        | Type         | Constraints        | Description                      |
|---------------|--------------|-------------------|----------------------------------|
| id            | UUID         | PK, NOT NULL      | Unique identifier                |
| user_id       | UUID         | FK, NOT NULL      | Reference to users.id            |
| name          | VARCHAR(255) | NOT NULL          | Original filename                |
| type          | VARCHAR(100) | NOT NULL          | MIME type of document            |
| size          | INTEGER      | NOT NULL          | File size in bytes               |
| status        | VARCHAR(50)  | NOT NULL          | Document status                  |
| storage_path  | VARCHAR(255) | NOT NULL          | Path to stored file              |
| metadata      | JSONB        |                   | Additional document metadata     |
| created_at    | TIMESTAMP    | NOT NULL          | Record creation timestamp        |
| updated_at    | TIMESTAMP    | NOT NULL          | Record last update timestamp     |

**Indexes:**
- Primary key on `id`
- Foreign key index on `user_id`
- Index on `status`
- Index on `created_at`

**Foreign Keys:**
- `user_id` references `users(id)` ON DELETE CASCADE

### processing_jobs

Stores information about document processing jobs.

| Column        | Type         | Constraints        | Description                      |
|---------------|--------------|-------------------|----------------------------------|
| id            | UUID         | PK, NOT NULL      | Unique identifier                |
| document_id   | UUID         | FK, NOT NULL      | Reference to documents.id        |
| status        | VARCHAR(50)  | NOT NULL          | Job status                       |
| pipeline      | JSONB        | NOT NULL          | Agent pipeline configuration     |
| progress      | INTEGER      | NOT NULL          | Processing progress (0-100)      |
| result        | JSONB        |                   | Processing result                |
| started_at    | TIMESTAMP    |                   | Job start timestamp              |
| completed_at  | TIMESTAMP    |                   | Job completion timestamp         |
| created_at    | TIMESTAMP    | NOT NULL          | Record creation timestamp        |
| updated_at    | TIMESTAMP    | NOT NULL          | Record last update timestamp     |

**Indexes:**
- Primary key on `id`
- Foreign key index on `document_id`
- Index on `status`
- Index on `created_at`

**Foreign Keys:**
- `document_id` references `documents(id)` ON DELETE CASCADE

### securities

Stores information about financial securities extracted from documents.

| Column        | Type         | Constraints        | Description                      |
|---------------|--------------|-------------------|----------------------------------|
| id            | UUID         | PK, NOT NULL      | Unique identifier                |
| document_id   | UUID         | FK, NOT NULL      | Reference to documents.id        |
| name          | VARCHAR(255) | NOT NULL          | Security name                    |
| isin          | VARCHAR(12)  |                   | ISIN code                        |
| quantity      | NUMERIC      |                   | Number of units                  |
| price         | NUMERIC      |                   | Price per unit                   |
| value         | NUMERIC      |                   | Total value                      |
| weight        | NUMERIC      |                   | Portfolio weight percentage      |
| currency      | VARCHAR(10)  |                   | Currency code                    |
| sector        | VARCHAR(100) |                   | Industry sector                  |
| asset_class   | VARCHAR(100) |                   | Asset class                      |
| created_at    | TIMESTAMP    | NOT NULL          | Record creation timestamp        |
| updated_at    | TIMESTAMP    | NOT NULL          | Record last update timestamp     |

**Indexes:**
- Primary key on `id`
- Foreign key index on `document_id`
- Index on `isin`
- Index on `asset_class`
- Index on `sector`

**Foreign Keys:**
- `document_id` references `documents(id)` ON DELETE CASCADE

### portfolios

Stores portfolio summary information.

| Column        | Type         | Constraints        | Description                      |
|---------------|--------------|-------------------|----------------------------------|
| id            | UUID         | PK, NOT NULL      | Unique identifier                |
| document_id   | UUID         | FK, NOT NULL      | Reference to documents.id        |
| total_value   | NUMERIC      | NOT NULL          | Total portfolio value            |
| currency      | VARCHAR(10)  | NOT NULL          | Base currency                    |
| date          | DATE         | NOT NULL          | Date of portfolio statement      |
| created_at    | TIMESTAMP    | NOT NULL          | Record creation timestamp        |
| updated_at    | TIMESTAMP    | NOT NULL          | Record last update timestamp     |

**Indexes:**
- Primary key on `id`
- Foreign key index on `document_id`
- Index on `date`

**Foreign Keys:**
- `document_id` references `documents(id)` ON DELETE CASCADE

### comparisons

Stores document comparison results.

| Column        | Type         | Constraints        | Description                      |
|---------------|--------------|-------------------|----------------------------------|
| id            | UUID         | PK, NOT NULL      | Unique identifier                |
| user_id       | UUID         | FK, NOT NULL      | Reference to users.id            |
| name          | VARCHAR(255) | NOT NULL          | Comparison name                  |
| description   | TEXT         |                   | Comparison description           |
| documents     | JSONB        | NOT NULL          | Array of document IDs            |
| result        | JSONB        |                   | Comparison result                |
| created_at    | TIMESTAMP    | NOT NULL          | Record creation timestamp        |
| updated_at    | TIMESTAMP    | NOT NULL          | Record last update timestamp     |

**Indexes:**
- Primary key on `id`
- Foreign key index on `user_id`
- Index on `created_at`

**Foreign Keys:**
- `user_id` references `users(id)` ON DELETE CASCADE

### agent_pipelines

Stores saved agent pipelines.

| Column        | Type         | Constraints        | Description                      |
|---------------|--------------|-------------------|----------------------------------|
| id            | UUID         | PK, NOT NULL      | Unique identifier                |
| user_id       | UUID         | FK, NOT NULL      | Reference to users.id            |
| name          | VARCHAR(255) | NOT NULL          | Pipeline name                    |
| description   | TEXT         |                   | Pipeline description             |
| agents        | JSONB        | NOT NULL          | Agent configuration              |
| created_at    | TIMESTAMP    | NOT NULL          | Record creation timestamp        |
| updated_at    | TIMESTAMP    | NOT NULL          | Record last update timestamp     |

**Indexes:**
- Primary key on `id`
- Foreign key index on `user_id`
- Index on `name`

**Foreign Keys:**
- `user_id` references `users(id)` ON DELETE CASCADE

### agent_executions

Stores information about individual agent executions.

| Column        | Type         | Constraints        | Description                      |
|---------------|--------------|-------------------|----------------------------------|
| id            | UUID         | PK, NOT NULL      | Unique identifier                |
| job_id        | UUID         | FK, NOT NULL      | Reference to processing_jobs.id  |
| agent_id      | VARCHAR(100) | NOT NULL          | Agent identifier                 |
| status        | VARCHAR(50)  | NOT NULL          | Execution status                 |
| parameters    | JSONB        | NOT NULL          | Agent parameters                 |
| result        | JSONB        |                   | Execution result                 |
| started_at    | TIMESTAMP    |                   | Execution start timestamp        |
| completed_at  | TIMESTAMP    |                   | Execution completion timestamp   |
| created_at    | TIMESTAMP    | NOT NULL          | Record creation timestamp        |
| updated_at    | TIMESTAMP    | NOT NULL          | Record last update timestamp     |

**Indexes:**
- Primary key on `id`
- Foreign key index on `job_id`
- Index on `agent_id`
- Index on `status`
- Index on `created_at`

**Foreign Keys:**
- `job_id` references `processing_jobs(id)` ON DELETE CASCADE

### pipeline_executions

Stores information about pipeline executions.

| Column        | Type         | Constraints        | Description                      |
|---------------|--------------|-------------------|----------------------------------|
| id            | UUID         | PK, NOT NULL      | Unique identifier                |
| pipeline_id   | UUID         | FK, NOT NULL      | Reference to agent_pipelines.id  |
| document_id   | UUID         | FK, NOT NULL      | Reference to documents.id        |
| status        | VARCHAR(50)  | NOT NULL          | Execution status                 |
| result        | JSONB        |                   | Execution result                 |
| started_at    | TIMESTAMP    |                   | Execution start timestamp        |
| completed_at  | TIMESTAMP    |                   | Execution completion timestamp   |
| created_at    | TIMESTAMP    | NOT NULL          | Record creation timestamp        |
| updated_at    | TIMESTAMP    | NOT NULL          | Record last update timestamp     |

**Indexes:**
- Primary key on `id`
- Foreign key index on `pipeline_id`
- Foreign key index on `document_id`
- Index on `status`
- Index on `created_at`

**Foreign Keys:**
- `pipeline_id` references `agent_pipelines(id)` ON DELETE CASCADE
- `document_id` references `documents(id)` ON DELETE CASCADE

### analytics

Stores analytical data derived from portfolios.

| Column        | Type         | Constraints        | Description                      |
|---------------|--------------|-------------------|----------------------------------|
| id            | UUID         | PK, NOT NULL      | Unique identifier                |
| portfolio_id  | UUID         | FK, NOT NULL      | Reference to portfolios.id       |
| type          | VARCHAR(100) | NOT NULL          | Analytics type                   |
| data          | JSONB        | NOT NULL          | Analytics data                   |
| created_at    | TIMESTAMP    | NOT NULL          | Record creation timestamp        |
| updated_at    | TIMESTAMP    | NOT NULL          | Record last update timestamp     |

**Indexes:**
- Primary key on `id`
- Foreign key index on `portfolio_id`
- Index on `type`
- Index on `created_at`

**Foreign Keys:**
- `portfolio_id` references `portfolios(id)` ON DELETE CASCADE

### recommendations

Stores investment recommendations.

| Column        | Type         | Constraints        | Description                      |
|---------------|--------------|-------------------|----------------------------------|
| id            | UUID         | PK, NOT NULL      | Unique identifier                |
| portfolio_id  | UUID         | FK, NOT NULL      | Reference to portfolios.id       |
| risk_profile  | VARCHAR(50)  | NOT NULL          | User risk profile                |
| recommendations | JSONB      | NOT NULL          | Recommendation data              |
| actions       | JSONB        |                   | Suggested actions                |
| created_at    | TIMESTAMP    | NOT NULL          | Record creation timestamp        |
| updated_at    | TIMESTAMP    | NOT NULL          | Record last update timestamp     |

**Indexes:**
- Primary key on `id`
- Foreign key index on `portfolio_id`
- Index on `risk_profile`
- Index on `created_at`

**Foreign Keys:**
- `portfolio_id` references `portfolios(id)` ON DELETE CASCADE

## Database Migrations

Database migrations are managed using Knex.js. Migration files are located in the `migrations` directory and follow the naming convention `YYYYMMDDHHmmss_migration_name.js`.

To run migrations:

```bash
# Development
npm run migrate:dev

# Production
npm run migrate:prod
```

To create a new migration:

```bash
npm run migrate:make migration_name
```

## Data Model Evolution

The database schema is designed to be extensible for future requirements. When adding new features, consider:

1. **Backwards Compatibility**: Ensure new schema changes don't break existing functionality
2. **Data Migration**: Provide migration scripts for existing data
3. **Performance Impact**: Consider the impact on query performance
4. **Data Integrity**: Maintain appropriate constraints and relationships

## Query Optimization

For optimal performance, follow these guidelines:

1. **Use Indexes**: Always use indexed columns in WHERE, JOIN, and ORDER BY clauses
2. **Limit Result Sets**: Use LIMIT and OFFSET for pagination
3. **Select Only Needed Columns**: Avoid SELECT * and request only required columns
4. **Use Appropriate Data Types**: Choose the most efficient data type for each column
5. **Consider Query Plans**: Use EXPLAIN to analyze and optimize complex queries

## Backup and Recovery

Database backups are performed automatically:

- **Development**: Daily backups of SQLite database to local storage
- **Production**: Continuous backup via Supabase, with point-in-time recovery

To restore from backup:

```bash
# Development
npm run db:restore -- backup_filename.sqlite

# Production
# Managed through Supabase dashboard
```
