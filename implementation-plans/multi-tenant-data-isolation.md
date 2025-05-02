# Multi-Tenant Data Isolation Implementation Plan

## Overview

This plan outlines the steps to implement multi-tenant data isolation for the FinDoc Analyzer application. Multi-tenant data isolation ensures that each client's data is securely separated from other clients' data, creating "Chinese walls" between tenants.

## Architecture

The multi-tenant data isolation will be implemented using a combination of:

1. **Tenant-specific database schemas** in Supabase
2. **Row-level security (RLS) policies** for fine-grained access control
3. **Tenant context middleware** to identify and validate the current tenant
4. **API key management** for tenant-specific authentication

## Implementation Steps

### 1. Design Database Schema

1. Create a `tenants` table:
   ```sql
   CREATE TABLE tenants (
     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
     name TEXT NOT NULL,
     domain TEXT UNIQUE,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );
   ```

2. Create a `users` table with tenant association:
   ```sql
   CREATE TABLE users (
     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
     tenant_id UUID REFERENCES tenants(id),
     email TEXT UNIQUE NOT NULL,
     name TEXT,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );
   ```

3. Add tenant_id to all data tables:
   ```sql
   ALTER TABLE documents ADD COLUMN tenant_id UUID REFERENCES tenants(id);
   ALTER TABLE securities ADD COLUMN tenant_id UUID REFERENCES tenants(id);
   ALTER TABLE portfolios ADD COLUMN tenant_id UUID REFERENCES tenants(id);
   -- Add to all other data tables
   ```

### 2. Implement Row-Level Security Policies

1. Enable Row-Level Security on all tables:
   ```sql
   ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
   ALTER TABLE securities ENABLE ROW LEVEL SECURITY;
   ALTER TABLE portfolios ENABLE ROW LEVEL SECURITY;
   -- Enable on all other data tables
   ```

2. Create policies for tenant isolation:
   ```sql
   -- For documents table
   CREATE POLICY tenant_isolation_documents ON documents
     USING (tenant_id = current_setting('app.current_tenant_id')::UUID);
   
   -- For securities table
   CREATE POLICY tenant_isolation_securities ON securities
     USING (tenant_id = current_setting('app.current_tenant_id')::UUID);
   
   -- For portfolios table
   CREATE POLICY tenant_isolation_portfolios ON portfolios
     USING (tenant_id = current_setting('app.current_tenant_id')::UUID);
   
   -- Create similar policies for all other data tables
   ```

3. Create policies for system administrators:
   ```sql
   -- For documents table
   CREATE POLICY admin_access_documents ON documents
     USING (current_setting('app.is_admin')::BOOLEAN = TRUE);
   
   -- Create similar policies for all other data tables
   ```

### 3. Implement Tenant Context Middleware

1. Create a middleware to set the tenant context:
   ```javascript
   const setTenantContext = async (req, res, next) => {
     try {
       // Get tenant ID from user authentication
       const tenantId = req.user.tenant_id;
       
       // Set tenant context in database session
       await db.query(`SET LOCAL app.current_tenant_id = $1`, [tenantId]);
       
       // Set tenant context in request object
       req.tenantId = tenantId;
       
       // Check if user is admin
       const isAdmin = req.user.role === 'admin';
       await db.query(`SET LOCAL app.is_admin = $1`, [isAdmin]);
       
       next();
     } catch (error) {
       console.error('Error setting tenant context:', error);
       res.status(500).json({ success: false, error: 'Internal server error' });
     }
   };
   ```

2. Apply the middleware to all API routes:
   ```javascript
   app.use('/api/documents', authMiddleware, setTenantContext, documentRoutes);
   app.use('/api/securities', authMiddleware, setTenantContext, securitiesRoutes);
   app.use('/api/portfolios', authMiddleware, setTenantContext, portfolioRoutes);
   // Apply to all other API routes
   ```

### 4. Implement API Key Management

1. Create an `api_keys` table with tenant association:
   ```sql
   CREATE TABLE api_keys (
     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
     tenant_id UUID REFERENCES tenants(id),
     key TEXT UNIQUE NOT NULL,
     name TEXT NOT NULL,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     expires_at TIMESTAMP WITH TIME ZONE,
     last_used_at TIMESTAMP WITH TIME ZONE,
     is_active BOOLEAN DEFAULT TRUE
   );
   ```

2. Implement API key generation and validation:
   ```javascript
   const generateApiKey = async (tenantId, name, expiresAt) => {
     // Generate a secure random key
     const key = crypto.randomBytes(32).toString('hex');
     
     // Insert the key into the database
     await db.query(
       `INSERT INTO api_keys (tenant_id, key, name, expires_at) VALUES ($1, $2, $3, $4)`,
       [tenantId, key, name, expiresAt]
     );
     
     return key;
   };
   
   const validateApiKey = async (key) => {
     // Find the API key in the database
     const result = await db.query(
       `SELECT * FROM api_keys WHERE key = $1 AND is_active = TRUE AND (expires_at IS NULL OR expires_at > NOW())`,
       [key]
     );
     
     if (result.rows.length === 0) {
       return null;
     }
     
     const apiKey = result.rows[0];
     
     // Update last used timestamp
     await db.query(
       `UPDATE api_keys SET last_used_at = NOW() WHERE id = $1`,
       [apiKey.id]
     );
     
     return apiKey;
   };
   ```

3. Create API key middleware:
   ```javascript
   const apiKeyMiddleware = async (req, res, next) => {
     try {
       // Get API key from header
       const apiKey = req.headers['x-api-key'];
       
       if (!apiKey) {
         return res.status(401).json({ success: false, error: 'API key is required' });
       }
       
       // Validate API key
       const keyData = await validateApiKey(apiKey);
       
       if (!keyData) {
         return res.status(401).json({ success: false, error: 'Invalid API key' });
       }
       
       // Set tenant context
       req.tenantId = keyData.tenant_id;
       await db.query(`SET LOCAL app.current_tenant_id = $1`, [keyData.tenant_id]);
       
       next();
     } catch (error) {
       console.error('Error validating API key:', error);
       res.status(500).json({ success: false, error: 'Internal server error' });
     }
   };
   ```

### 5. Implement Tenant Management

1. Create tenant management API endpoints:
   ```javascript
   // Create a new tenant
   app.post('/api/admin/tenants', adminAuthMiddleware, async (req, res) => {
     try {
       const { name, domain } = req.body;
       
       const result = await db.query(
         `INSERT INTO tenants (name, domain) VALUES ($1, $2) RETURNING *`,
         [name, domain]
       );
       
       res.json({ success: true, data: result.rows[0] });
     } catch (error) {
       console.error('Error creating tenant:', error);
       res.status(500).json({ success: false, error: 'Internal server error' });
     }
   });
   
   // Get all tenants (admin only)
   app.get('/api/admin/tenants', adminAuthMiddleware, async (req, res) => {
     try {
       const result = await db.query(`SELECT * FROM tenants ORDER BY name`);
       
       res.json({ success: true, data: result.rows });
     } catch (error) {
       console.error('Error getting tenants:', error);
       res.status(500).json({ success: false, error: 'Internal server error' });
     }
   });
   
   // Get tenant by ID (admin only)
   app.get('/api/admin/tenants/:id', adminAuthMiddleware, async (req, res) => {
     try {
       const { id } = req.params;
       
       const result = await db.query(`SELECT * FROM tenants WHERE id = $1`, [id]);
       
       if (result.rows.length === 0) {
         return res.status(404).json({ success: false, error: 'Tenant not found' });
       }
       
       res.json({ success: true, data: result.rows[0] });
     } catch (error) {
       console.error('Error getting tenant:', error);
       res.status(500).json({ success: false, error: 'Internal server error' });
     }
   });
   ```

2. Create API key management endpoints:
   ```javascript
   // Create a new API key for the current tenant
   app.post('/api/api-keys', authMiddleware, setTenantContext, async (req, res) => {
     try {
       const { name, expiresAt } = req.body;
       
       const key = await generateApiKey(req.tenantId, name, expiresAt);
       
       res.json({ success: true, data: { key } });
     } catch (error) {
       console.error('Error creating API key:', error);
       res.status(500).json({ success: false, error: 'Internal server error' });
     }
   });
   
   // Get all API keys for the current tenant
   app.get('/api/api-keys', authMiddleware, setTenantContext, async (req, res) => {
     try {
       const result = await db.query(
         `SELECT id, name, created_at, expires_at, last_used_at, is_active FROM api_keys WHERE tenant_id = $1`,
         [req.tenantId]
       );
       
       res.json({ success: true, data: result.rows });
     } catch (error) {
       console.error('Error getting API keys:', error);
       res.status(500).json({ success: false, error: 'Internal server error' });
     }
   });
   
   // Revoke an API key
   app.delete('/api/api-keys/:id', authMiddleware, setTenantContext, async (req, res) => {
     try {
       const { id } = req.params;
       
       await db.query(
         `UPDATE api_keys SET is_active = FALSE WHERE id = $1 AND tenant_id = $2`,
         [id, req.tenantId]
       );
       
       res.json({ success: true });
     } catch (error) {
       console.error('Error revoking API key:', error);
       res.status(500).json({ success: false, error: 'Internal server error' });
     }
   });
   ```

### 6. Update Data Access Layer

1. Modify all database queries to include tenant_id:
   ```javascript
   // Before
   const getDocuments = async () => {
     const result = await db.query(`SELECT * FROM documents`);
     return result.rows;
   };
   
   // After
   const getDocuments = async (tenantId) => {
     const result = await db.query(`SELECT * FROM documents WHERE tenant_id = $1`, [tenantId]);
     return result.rows;
   };
   ```

2. Update all data creation functions to set tenant_id:
   ```javascript
   // Before
   const createDocument = async (data) => {
     const result = await db.query(
       `INSERT INTO documents (name, type, content) VALUES ($1, $2, $3) RETURNING *`,
       [data.name, data.type, data.content]
     );
     return result.rows[0];
   };
   
   // After
   const createDocument = async (tenantId, data) => {
     const result = await db.query(
       `INSERT INTO documents (tenant_id, name, type, content) VALUES ($1, $2, $3, $4) RETURNING *`,
       [tenantId, data.name, data.type, data.content]
     );
     return result.rows[0];
   };
   ```

3. Update all controller functions to use tenant_id from request:
   ```javascript
   // Before
   const getDocuments = async (req, res) => {
     try {
       const documents = await documentService.getDocuments();
       res.json({ success: true, data: documents });
     } catch (error) {
       console.error('Error getting documents:', error);
       res.status(500).json({ success: false, error: 'Internal server error' });
     }
   };
   
   // After
   const getDocuments = async (req, res) => {
     try {
       const documents = await documentService.getDocuments(req.tenantId);
       res.json({ success: true, data: documents });
     } catch (error) {
       console.error('Error getting documents:', error);
       res.status(500).json({ success: false, error: 'Internal server error' });
     }
   };
   ```

### 7. Implement Data Migration

1. Create a script to add tenant_id to existing data:
   ```javascript
   const migrateData = async () => {
     try {
       // Get all tenants
       const tenants = await db.query(`SELECT * FROM tenants`);
       
       for (const tenant of tenants.rows) {
         // Get all users for this tenant
         const users = await db.query(`SELECT * FROM users WHERE tenant_id = $1`, [tenant.id]);
         
         if (users.rows.length === 0) {
           console.log(`No users found for tenant ${tenant.name}`);
           continue;
         }
         
         // Get all documents without tenant_id
         const documents = await db.query(`SELECT * FROM documents WHERE tenant_id IS NULL`);
         
         // Assign tenant_id to documents
         for (const document of documents.rows) {
           await db.query(
             `UPDATE documents SET tenant_id = $1 WHERE id = $2`,
             [tenant.id, document.id]
           );
         }
         
         // Repeat for other data tables
       }
       
       console.log('Data migration completed successfully');
     } catch (error) {
       console.error('Error migrating data:', error);
     }
   };
   ```

2. Create a script to verify data isolation:
   ```javascript
   const verifyDataIsolation = async () => {
     try {
       // Get all tenants
       const tenants = await db.query(`SELECT * FROM tenants`);
       
       for (const tenant of tenants.rows) {
         console.log(`Verifying data isolation for tenant ${tenant.name}`);
         
         // Set tenant context
         await db.query(`SET LOCAL app.current_tenant_id = $1`, [tenant.id]);
         
         // Get documents for this tenant
         const documents = await db.query(`SELECT * FROM documents`);
         
         // Verify that all documents belong to this tenant
         for (const document of documents.rows) {
           if (document.tenant_id !== tenant.id) {
             console.error(`Data isolation breach: Document ${document.id} belongs to tenant ${document.tenant_id} but was accessed by tenant ${tenant.id}`);
           }
         }
         
         // Repeat for other data tables
       }
       
       console.log('Data isolation verification completed successfully');
     } catch (error) {
       console.error('Error verifying data isolation:', error);
     }
   };
   ```

### 8. Implement Tenant Onboarding

1. Create a tenant onboarding workflow:
   ```javascript
   const onboardTenant = async (name, domain, adminEmail, adminName) => {
     try {
       // Start a transaction
       await db.query('BEGIN');
       
       // Create tenant
       const tenantResult = await db.query(
         `INSERT INTO tenants (name, domain) VALUES ($1, $2) RETURNING *`,
         [name, domain]
       );
       
       const tenant = tenantResult.rows[0];
       
       // Create admin user
       const userResult = await db.query(
         `INSERT INTO users (tenant_id, email, name, role) VALUES ($1, $2, $3, $4) RETURNING *`,
         [tenant.id, adminEmail, adminName, 'admin']
       );
       
       const user = userResult.rows[0];
       
       // Create initial API key
       const apiKey = await generateApiKey(tenant.id, 'Default API Key', null);
       
       // Commit transaction
       await db.query('COMMIT');
       
       return {
         tenant,
         user,
         apiKey
       };
     } catch (error) {
       // Rollback transaction
       await db.query('ROLLBACK');
       console.error('Error onboarding tenant:', error);
       throw error;
     }
   };
   ```

2. Create a tenant onboarding API endpoint:
   ```javascript
   app.post('/api/admin/tenants/onboard', adminAuthMiddleware, async (req, res) => {
     try {
       const { name, domain, adminEmail, adminName } = req.body;
       
       const result = await onboardTenant(name, domain, adminEmail, adminName);
       
       res.json({ success: true, data: result });
     } catch (error) {
       console.error('Error onboarding tenant:', error);
       res.status(500).json({ success: false, error: 'Internal server error' });
     }
   });
   ```

## Testing

1. Create test cases for multi-tenant data isolation:
   - Create multiple test tenants
   - Create test data for each tenant
   - Verify that tenants can only access their own data
   - Test API key authentication
   - Test tenant onboarding

2. Test data migration:
   - Create test data without tenant_id
   - Run data migration script
   - Verify that all data has been assigned to the correct tenant

3. Test performance:
   - Measure query performance with RLS policies
   - Test with large datasets
   - Optimize if necessary

## Deployment

1. Create database migration scripts:
   ```sql
   -- Create tenants table
   CREATE TABLE tenants (...);
   
   -- Add tenant_id to existing tables
   ALTER TABLE documents ADD COLUMN tenant_id UUID REFERENCES tenants(id);
   
   -- Enable RLS
   ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
   
   -- Create RLS policies
   CREATE POLICY tenant_isolation_documents ON documents USING (...);
   ```

2. Deploy database changes:
   - Run migration scripts on the database
   - Verify that all tables have tenant_id column
   - Verify that RLS is enabled on all tables

3. Deploy application changes:
   - Update backend code on Google App Engine
   - Update frontend code to support multi-tenancy
   - Configure environment variables and secrets

## Monitoring and Maintenance

1. Set up monitoring:
   - Track tenant-specific metrics
   - Monitor API key usage
   - Track RLS policy performance
   - Set up alerts for potential data isolation breaches

2. Implement logging:
   - Log tenant context for all operations
   - Track cross-tenant access attempts
   - Log API key usage
   - Enable audit logging for sensitive operations

3. Create maintenance procedures:
   - Regular security reviews
   - Performance optimization
   - Data isolation verification
   - Tenant data cleanup
