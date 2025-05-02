-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table
CREATE OR REPLACE FUNCTION create_users_table()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    organization TEXT,
    role TEXT NOT NULL DEFAULT 'user',
    tenant_id TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );

  -- Add RLS policies
  ALTER TABLE users ENABLE ROW LEVEL SECURITY;

  -- Policy for users to see only their tenant's data
  CREATE POLICY users_policy_select ON users
    FOR SELECT
    USING (
      tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid())
      OR auth.jwt() ->> 'role' = 'admin'
    );

  -- Policy for users to update only their own data
  CREATE POLICY users_policy_update ON users
    FOR UPDATE
    USING (
      id = auth.uid()
      OR auth.jwt() ->> 'role' = 'admin'
    );

  -- Policy for users to insert data
  CREATE POLICY users_policy_insert ON users
    FOR INSERT
    WITH CHECK (true);

  -- Policy for users to delete only their own data
  CREATE POLICY users_policy_delete ON users
    FOR DELETE
    USING (
      id = auth.uid()
      OR auth.jwt() ->> 'role' = 'admin'
    );
END;
$$;

-- Create documents table
CREATE OR REPLACE FUNCTION create_documents_table()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  CREATE TABLE IF NOT EXISTS documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    size INTEGER NOT NULL,
    path TEXT NOT NULL,
    status TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    user_id UUID NOT NULL REFERENCES users(id),
    tenant_id TEXT NOT NULL,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    processed_at TIMESTAMP WITH TIME ZONE
  );

  -- Add RLS policies
  ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

  -- Policy for users to see only their tenant's data
  CREATE POLICY documents_policy_select ON documents
    FOR SELECT
    USING (
      tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid())
    );

  -- Policy for users to update only their own data
  CREATE POLICY documents_policy_update ON documents
    FOR UPDATE
    USING (
      tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid())
      AND (
        user_id = auth.uid()
        OR auth.jwt() ->> 'role' = 'admin'
      )
    );

  -- Policy for users to insert data
  CREATE POLICY documents_policy_insert ON documents
    FOR INSERT
    WITH CHECK (
      tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid())
    );

  -- Policy for users to delete only their own data
  CREATE POLICY documents_policy_delete ON documents
    FOR DELETE
    USING (
      tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid())
      AND (
        user_id = auth.uid()
        OR auth.jwt() ->> 'role' = 'admin'
      )
    );
END;
$$;

-- Create API keys table
CREATE OR REPLACE FUNCTION create_api_keys_table()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  CREATE TABLE IF NOT EXISTS api_keys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    key TEXT NOT NULL,
    service TEXT NOT NULL,
    user_id UUID NOT NULL REFERENCES users(id),
    tenant_id TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );

  -- Add RLS policies
  ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;

  -- Policy for users to see only their tenant's data
  CREATE POLICY api_keys_policy_select ON api_keys
    FOR SELECT
    USING (
      tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid())
    );

  -- Policy for users to update only their own data
  CREATE POLICY api_keys_policy_update ON api_keys
    FOR UPDATE
    USING (
      tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid())
      AND (
        user_id = auth.uid()
        OR auth.jwt() ->> 'role' = 'admin'
      )
    );

  -- Policy for users to insert data
  CREATE POLICY api_keys_policy_insert ON api_keys
    FOR INSERT
    WITH CHECK (
      tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid())
    );

  -- Policy for users to delete only their own data
  CREATE POLICY api_keys_policy_delete ON api_keys
    FOR DELETE
    USING (
      tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid())
      AND (
        user_id = auth.uid()
        OR auth.jwt() ->> 'role' = 'admin'
      )
    );
END;
$$;

-- Create portfolios table
CREATE OR REPLACE FUNCTION create_portfolios_table()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  CREATE TABLE IF NOT EXISTS portfolios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    securities JSONB DEFAULT '[]'::jsonb,
    total_value NUMERIC DEFAULT 0,
    historical_data JSONB DEFAULT '[]'::jsonb,
    user_id UUID NOT NULL REFERENCES users(id),
    tenant_id TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );

  -- Add RLS policies
  ALTER TABLE portfolios ENABLE ROW LEVEL SECURITY;

  -- Policy for users to see only their tenant's data
  CREATE POLICY portfolios_policy_select ON portfolios
    FOR SELECT
    USING (
      tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid())
    );

  -- Policy for users to update only their own data
  CREATE POLICY portfolios_policy_update ON portfolios
    FOR UPDATE
    USING (
      tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid())
      AND (
        user_id = auth.uid()
        OR auth.jwt() ->> 'role' = 'admin'
      )
    );

  -- Policy for users to insert data
  CREATE POLICY portfolios_policy_insert ON portfolios
    FOR INSERT
    WITH CHECK (
      tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid())
    );

  -- Policy for users to delete only their own data
  CREATE POLICY portfolios_policy_delete ON portfolios
    FOR DELETE
    USING (
      tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid())
      AND (
        user_id = auth.uid()
        OR auth.jwt() ->> 'role' = 'admin'
      )
    );
END;
$$;

-- Create comparisons table
CREATE OR REPLACE FUNCTION create_comparisons_table()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  CREATE TABLE IF NOT EXISTS comparisons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    document_ids TEXT[] NOT NULL,
    result JSONB DEFAULT '{}'::jsonb,
    user_id UUID NOT NULL REFERENCES users(id),
    tenant_id TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );

  -- Add RLS policies
  ALTER TABLE comparisons ENABLE ROW LEVEL SECURITY;

  -- Policy for users to see only their tenant's data
  CREATE POLICY comparisons_policy_select ON comparisons
    FOR SELECT
    USING (
      tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid())
    );

  -- Policy for users to update only their own data
  CREATE POLICY comparisons_policy_update ON comparisons
    FOR UPDATE
    USING (
      tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid())
      AND (
        user_id = auth.uid()
        OR auth.jwt() ->> 'role' = 'admin'
      )
    );

  -- Policy for users to insert data
  CREATE POLICY comparisons_policy_insert ON comparisons
    FOR INSERT
    WITH CHECK (
      tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid())
    );

  -- Policy for users to delete only their own data
  CREATE POLICY comparisons_policy_delete ON comparisons
    FOR DELETE
    USING (
      tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid())
      AND (
        user_id = auth.uid()
        OR auth.jwt() ->> 'role' = 'admin'
      )
    );
END;
$$;

-- Create chat history table
CREATE OR REPLACE FUNCTION create_chat_history_table()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  CREATE TABLE IF NOT EXISTS chat_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID NOT NULL REFERENCES documents(id),
    user_id UUID NOT NULL REFERENCES users(id),
    tenant_id TEXT NOT NULL,
    messages JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );

  -- Add RLS policies
  ALTER TABLE chat_history ENABLE ROW LEVEL SECURITY;

  -- Policy for users to see only their tenant's data
  CREATE POLICY chat_history_policy_select ON chat_history
    FOR SELECT
    USING (
      tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid())
      AND (
        user_id = auth.uid()
        OR auth.jwt() ->> 'role' = 'admin'
      )
    );

  -- Policy for users to update only their own data
  CREATE POLICY chat_history_policy_update ON chat_history
    FOR UPDATE
    USING (
      tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid())
      AND (
        user_id = auth.uid()
        OR auth.jwt() ->> 'role' = 'admin'
      )
    );

  -- Policy for users to insert data
  CREATE POLICY chat_history_policy_insert ON chat_history
    FOR INSERT
    WITH CHECK (
      tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid())
    );

  -- Policy for users to delete only their own data
  CREATE POLICY chat_history_policy_delete ON chat_history
    FOR DELETE
    USING (
      tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid())
      AND (
        user_id = auth.uid()
        OR auth.jwt() ->> 'role' = 'admin'
      )
    );
END;
$$;

-- Create templates table
CREATE OR REPLACE FUNCTION create_templates_table()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  CREATE TABLE IF NOT EXISTS templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    document_type TEXT NOT NULL,
    extraction_rules JSONB NOT NULL,
    user_id UUID NOT NULL REFERENCES users(id),
    tenant_id TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );

  -- Add RLS policies
  ALTER TABLE templates ENABLE ROW LEVEL SECURITY;

  -- Policy for users to see only their tenant's data
  CREATE POLICY templates_policy_select ON templates
    FOR SELECT
    USING (
      tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid())
    );

  -- Policy for users to update only their own data
  CREATE POLICY templates_policy_update ON templates
    FOR UPDATE
    USING (
      tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid())
      AND (
        user_id = auth.uid()
        OR auth.jwt() ->> 'role' = 'admin'
      )
    );

  -- Policy for users to insert data
  CREATE POLICY templates_policy_insert ON templates
    FOR INSERT
    WITH CHECK (
      tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid())
    );

  -- Policy for users to delete only their own data
  CREATE POLICY templates_policy_delete ON templates
    FOR DELETE
    USING (
      tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid())
      AND (
        user_id = auth.uid()
        OR auth.jwt() ->> 'role' = 'admin'
      )
    );
END;
$$;

-- Create batch jobs table
CREATE OR REPLACE FUNCTION create_batch_jobs_table()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  CREATE TABLE IF NOT EXISTS batch_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_ids TEXT[] NOT NULL,
    options JSONB DEFAULT '{}'::jsonb,
    status TEXT NOT NULL,
    progress INTEGER DEFAULT 0,
    results JSONB,
    error TEXT,
    user_id UUID NOT NULL REFERENCES users(id),
    tenant_id TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
  );

  -- Add RLS policies
  ALTER TABLE batch_jobs ENABLE ROW LEVEL SECURITY;

  -- Policy for users to see only their tenant's data
  CREATE POLICY batch_jobs_policy_select ON batch_jobs
    FOR SELECT
    USING (
      tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid())
    );

  -- Policy for users to update only their own data
  CREATE POLICY batch_jobs_policy_update ON batch_jobs
    FOR UPDATE
    USING (
      tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid())
      AND (
        user_id = auth.uid()
        OR auth.jwt() ->> 'role' = 'admin'
      )
    );

  -- Policy for users to insert data
  CREATE POLICY batch_jobs_policy_insert ON batch_jobs
    FOR INSERT
    WITH CHECK (
      tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid())
    );

  -- Policy for users to delete only their own data
  CREATE POLICY batch_jobs_policy_delete ON batch_jobs
    FOR DELETE
    USING (
      tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid())
      AND (
        user_id = auth.uid()
        OR auth.jwt() ->> 'role' = 'admin'
      )
    );
END;
$$;

-- Create document versions table
CREATE OR REPLACE FUNCTION create_document_versions_table()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  CREATE TABLE IF NOT EXISTS document_versions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID NOT NULL REFERENCES documents(id),
    version_number INTEGER NOT NULL,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    size INTEGER NOT NULL,
    path TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    status TEXT NOT NULL,
    reason TEXT,
    user_id UUID NOT NULL REFERENCES users(id),
    tenant_id TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );

  -- Add RLS policies
  ALTER TABLE document_versions ENABLE ROW LEVEL SECURITY;

  -- Policy for users to see only their tenant's data
  CREATE POLICY document_versions_policy_select ON document_versions
    FOR SELECT
    USING (
      tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid())
    );

  -- Policy for users to update only their own data
  CREATE POLICY document_versions_policy_update ON document_versions
    FOR UPDATE
    USING (
      tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid())
      AND (
        user_id = auth.uid()
        OR auth.jwt() ->> 'role' = 'admin'
      )
    );

  -- Policy for users to insert data
  CREATE POLICY document_versions_policy_insert ON document_versions
    FOR INSERT
    WITH CHECK (
      tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid())
    );

  -- Policy for users to delete only their own data
  CREATE POLICY document_versions_policy_delete ON document_versions
    FOR DELETE
    USING (
      tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid())
      AND (
        user_id = auth.uid()
        OR auth.jwt() ->> 'role' = 'admin'
      )
    );
END;
$$;

-- Create reports table
CREATE OR REPLACE FUNCTION create_reports_table()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  CREATE TABLE IF NOT EXISTS reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    content TEXT NOT NULL,
    charts JSONB DEFAULT '{}'::jsonb,
    metadata JSONB DEFAULT '{}'::jsonb,
    user_id UUID NOT NULL REFERENCES users(id),
    tenant_id TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );

  -- Add RLS policies
  ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

  -- Policy for users to see only their tenant's data
  CREATE POLICY reports_policy_select ON reports
    FOR SELECT
    USING (
      tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid())
    );

  -- Policy for users to update only their own data
  CREATE POLICY reports_policy_update ON reports
    FOR UPDATE
    USING (
      tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid())
      AND (
        user_id = auth.uid()
        OR auth.jwt() ->> 'role' = 'admin'
      )
    );

  -- Policy for users to insert data
  CREATE POLICY reports_policy_insert ON reports
    FOR INSERT
    WITH CHECK (
      tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid())
    );

  -- Policy for users to delete only their own data
  CREATE POLICY reports_policy_delete ON reports
    FOR DELETE
    USING (
      tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid())
      AND (
        user_id = auth.uid()
        OR auth.jwt() ->> 'role' = 'admin'
      )
    );
END;
$$;

-- Create schedules table
CREATE OR REPLACE FUNCTION create_schedules_table()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  CREATE TABLE IF NOT EXISTS schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    frequency JSONB NOT NULL,
    config JSONB NOT NULL,
    recipients TEXT[] DEFAULT '{}'::text[],
    status TEXT NOT NULL,
    last_run TIMESTAMP WITH TIME ZONE,
    next_run TIMESTAMP WITH TIME ZONE,
    user_id UUID NOT NULL REFERENCES users(id),
    tenant_id TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );

  -- Add RLS policies
  ALTER TABLE schedules ENABLE ROW LEVEL SECURITY;

  -- Policy for users to see only their tenant's data
  CREATE POLICY schedules_policy_select ON schedules
    FOR SELECT
    USING (
      tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid())
    );

  -- Policy for users to update only their own data
  CREATE POLICY schedules_policy_update ON schedules
    FOR UPDATE
    USING (
      tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid())
      AND (
        user_id = auth.uid()
        OR auth.jwt() ->> 'role' = 'admin'
      )
    );

  -- Policy for users to insert data
  CREATE POLICY schedules_policy_insert ON schedules
    FOR INSERT
    WITH CHECK (
      tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid())
    );

  -- Policy for users to delete only their own data
  CREATE POLICY schedules_policy_delete ON schedules
    FOR DELETE
    USING (
      tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid())
      AND (
        user_id = auth.uid()
        OR auth.jwt() ->> 'role' = 'admin'
      )
    );
END;
$$;

-- Create alerts table
CREATE OR REPLACE FUNCTION create_alerts_table()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  CREATE TABLE IF NOT EXISTS alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    conditions JSONB NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    status TEXT NOT NULL,
    user_id UUID NOT NULL REFERENCES users(id),
    tenant_id TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );

  -- Add RLS policies
  ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;

  -- Policy for users to see only their tenant's data
  CREATE POLICY alerts_policy_select ON alerts
    FOR SELECT
    USING (
      tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid())
    );

  -- Policy for users to update only their own data
  CREATE POLICY alerts_policy_update ON alerts
    FOR UPDATE
    USING (
      tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid())
      AND (
        user_id = auth.uid()
        OR auth.jwt() ->> 'role' = 'admin'
      )
    );

  -- Policy for users to insert data
  CREATE POLICY alerts_policy_insert ON alerts
    FOR INSERT
    WITH CHECK (
      tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid())
    );

  -- Policy for users to delete only their own data
  CREATE POLICY alerts_policy_delete ON alerts
    FOR DELETE
    USING (
      tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid())
      AND (
        user_id = auth.uid()
        OR auth.jwt() ->> 'role' = 'admin'
      )
    );
END;
$$;

-- Create audit logs table
CREATE OR REPLACE FUNCTION create_audit_logs_table()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    action TEXT NOT NULL,
    resource_type TEXT NOT NULL,
    resource_id TEXT NOT NULL,
    details JSONB DEFAULT '{}'::jsonb,
    user_id UUID,
    tenant_id TEXT,
    ip_address TEXT,
    user_agent TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );

  -- Add RLS policies
  ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

  -- Policy for users to see only their tenant's data
  CREATE POLICY audit_logs_policy_select ON audit_logs
    FOR SELECT
    USING (
      tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid())
      AND (
        auth.jwt() ->> 'role' = 'admin'
      )
    );

  -- Policy for system to insert data
  CREATE POLICY audit_logs_policy_insert ON audit_logs
    FOR INSERT
    WITH CHECK (true);

  -- No update or delete policies (audit logs should be immutable)
END;
$$;

-- Create feedback table
CREATE OR REPLACE FUNCTION create_feedback_table()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  CREATE TABLE IF NOT EXISTS feedback (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type TEXT NOT NULL,
    message TEXT NOT NULL,
    page TEXT,
    user_id UUID,
    tenant_id TEXT,
    status TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );

  -- Add RLS policies
  ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

  -- Policy for admins to see all feedback
  CREATE POLICY feedback_policy_select ON feedback
    FOR SELECT
    USING (
      auth.jwt() ->> 'role' = 'admin'
    );

  -- Policy for users to insert feedback
  CREATE POLICY feedback_policy_insert ON feedback
    FOR INSERT
    WITH CHECK (true);

  -- Policy for admins to update feedback
  CREATE POLICY feedback_policy_update ON feedback
    FOR UPDATE
    USING (
      auth.jwt() ->> 'role' = 'admin'
    );
END;
$$;
