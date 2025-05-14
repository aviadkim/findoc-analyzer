-- FinDoc Analyzer Database Schema

-- Enable Row Level Security
ALTER DATABASE postgres SET row_security = on;

-- Create extension for UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login TIMESTAMP WITH TIME ZONE,
    tenant_id UUID NOT NULL,
    is_admin BOOLEAN DEFAULT FALSE
);

-- Create Tenants table
CREATE TABLE tenants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    settings JSONB DEFAULT '{}'::JSONB
);

-- Create API Keys table
CREATE TABLE api_keys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    key_name TEXT NOT NULL,
    key_value TEXT NOT NULL,
    service TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT TRUE
);

-- Create Documents table
CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    file_type TEXT NOT NULL,
    file_size BIGINT NOT NULL,
    upload_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    document_type TEXT NOT NULL,
    processed BOOLEAN DEFAULT FALSE,
    storage_path TEXT,
    thumbnail_path TEXT
);

-- Create Document Content table
CREATE TABLE document_content (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
    extracted_text TEXT,
    metadata JSONB DEFAULT '{}'::JSONB,
    page_count INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Processing Status table
CREATE TABLE processing_status (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
    status TEXT NOT NULL,
    progress INTEGER DEFAULT 0,
    start_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    end_time TIMESTAMP WITH TIME ZONE,
    processing_time TEXT,
    agent_status JSONB DEFAULT '{}'::JSONB,
    error_message TEXT
);

-- Create Securities table
CREATE TABLE securities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
    isin TEXT,
    name TEXT NOT NULL,
    quantity NUMERIC,
    price NUMERIC,
    value NUMERIC,
    currency TEXT,
    percent_of_assets NUMERIC,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Tables table
CREATE TABLE document_tables (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
    table_name TEXT,
    headers JSONB,
    rows JSONB,
    page_number INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Chat History table
CREATE TABLE chat_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    response TEXT NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Reports table
CREATE TABLE reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
    report_type TEXT NOT NULL,
    report_content JSONB,
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    report_path TEXT
);

-- Create Export History table
CREATE TABLE export_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
    export_type TEXT NOT NULL,
    export_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    file_size BIGINT,
    file_path TEXT
);

-- Create Agent Logs table
CREATE TABLE agent_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
    agent_name TEXT NOT NULL,
    start_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    end_time TIMESTAMP WITH TIME ZONE,
    status TEXT NOT NULL,
    message TEXT,
    details JSONB
);

-- Create Row Level Security Policies

-- Users table RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY users_tenant_isolation ON users
    USING (tenant_id = current_setting('app.current_tenant_id')::UUID);

-- Documents table RLS
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY documents_tenant_isolation ON documents
    USING (tenant_id = current_setting('app.current_tenant_id')::UUID);

-- Document Content table RLS
ALTER TABLE document_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY document_content_tenant_isolation ON document_content
    USING (document_id IN (
        SELECT id FROM documents WHERE tenant_id = current_setting('app.current_tenant_id')::UUID
    ));

-- Processing Status table RLS
ALTER TABLE processing_status ENABLE ROW LEVEL SECURITY;

CREATE POLICY processing_status_tenant_isolation ON processing_status
    USING (document_id IN (
        SELECT id FROM documents WHERE tenant_id = current_setting('app.current_tenant_id')::UUID
    ));

-- Securities table RLS
ALTER TABLE securities ENABLE ROW LEVEL SECURITY;

CREATE POLICY securities_tenant_isolation ON securities
    USING (document_id IN (
        SELECT id FROM documents WHERE tenant_id = current_setting('app.current_tenant_id')::UUID
    ));

-- Tables table RLS
ALTER TABLE document_tables ENABLE ROW LEVEL SECURITY;

CREATE POLICY document_tables_tenant_isolation ON document_tables
    USING (document_id IN (
        SELECT id FROM documents WHERE tenant_id = current_setting('app.current_tenant_id')::UUID
    ));

-- Chat History table RLS
ALTER TABLE chat_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY chat_history_tenant_isolation ON chat_history
    USING (user_id IN (
        SELECT id FROM users WHERE tenant_id = current_setting('app.current_tenant_id')::UUID
    ));

-- Reports table RLS
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY reports_tenant_isolation ON reports
    USING (user_id IN (
        SELECT id FROM users WHERE tenant_id = current_setting('app.current_tenant_id')::UUID
    ));

-- Export History table RLS
ALTER TABLE export_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY export_history_tenant_isolation ON export_history
    USING (user_id IN (
        SELECT id FROM users WHERE tenant_id = current_setting('app.current_tenant_id')::UUID
    ));

-- Agent Logs table RLS
ALTER TABLE agent_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY agent_logs_tenant_isolation ON agent_logs
    USING (document_id IN (
        SELECT id FROM documents WHERE tenant_id = current_setting('app.current_tenant_id')::UUID
    ));

-- Create indexes for performance

-- Users table indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_tenant_id ON users(tenant_id);

-- Documents table indexes
CREATE INDEX idx_documents_user_id ON documents(user_id);
CREATE INDEX idx_documents_tenant_id ON documents(tenant_id);
CREATE INDEX idx_documents_document_type ON documents(document_type);
CREATE INDEX idx_documents_upload_date ON documents(upload_date);

-- Document Content table indexes
CREATE INDEX idx_document_content_document_id ON document_content(document_id);

-- Processing Status table indexes
CREATE INDEX idx_processing_status_document_id ON processing_status(document_id);
CREATE INDEX idx_processing_status_status ON processing_status(status);

-- Securities table indexes
CREATE INDEX idx_securities_document_id ON securities(document_id);
CREATE INDEX idx_securities_isin ON securities(isin);

-- Tables table indexes
CREATE INDEX idx_document_tables_document_id ON document_tables(document_id);

-- Chat History table indexes
CREATE INDEX idx_chat_history_user_id ON chat_history(user_id);
CREATE INDEX idx_chat_history_document_id ON chat_history(document_id);
CREATE INDEX idx_chat_history_timestamp ON chat_history(timestamp);

-- Reports table indexes
CREATE INDEX idx_reports_user_id ON reports(user_id);
CREATE INDEX idx_reports_document_id ON reports(document_id);
CREATE INDEX idx_reports_report_type ON reports(report_type);

-- Export History table indexes
CREATE INDEX idx_export_history_user_id ON export_history(user_id);
CREATE INDEX idx_export_history_document_id ON export_history(document_id);
CREATE INDEX idx_export_history_export_type ON export_history(export_type);

-- Agent Logs table indexes
CREATE INDEX idx_agent_logs_document_id ON agent_logs(document_id);
CREATE INDEX idx_agent_logs_agent_name ON agent_logs(agent_name);
CREATE INDEX idx_agent_logs_status ON agent_logs(status);

-- Create functions for tenant isolation

-- Function to set current tenant ID
CREATE OR REPLACE FUNCTION set_current_tenant(tenant_id UUID)
RETURNS VOID AS $$
BEGIN
    PERFORM set_config('app.current_tenant_id', tenant_id::TEXT, FALSE);
END;
$$ LANGUAGE plpgsql;

-- Function to get current tenant ID
CREATE OR REPLACE FUNCTION get_current_tenant()
RETURNS UUID AS $$
BEGIN
    RETURN current_setting('app.current_tenant_id')::UUID;
END;
$$ LANGUAGE plpgsql;

-- Function to get documents for current tenant
CREATE OR REPLACE FUNCTION get_tenant_documents()
RETURNS SETOF documents AS $$
BEGIN
    RETURN QUERY SELECT * FROM documents WHERE tenant_id = get_current_tenant();
END;
$$ LANGUAGE plpgsql;

-- Function to get users for current tenant
CREATE OR REPLACE FUNCTION get_tenant_users()
RETURNS SETOF users AS $$
BEGIN
    RETURN QUERY SELECT * FROM users WHERE tenant_id = get_current_tenant();
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic updates

-- Trigger to update document status when processing is complete
CREATE OR REPLACE FUNCTION update_document_processed_status()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'completed' THEN
        UPDATE documents SET processed = TRUE WHERE id = NEW.document_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER processing_status_update_trigger
AFTER UPDATE ON processing_status
FOR EACH ROW
WHEN (OLD.status <> 'completed' AND NEW.status = 'completed')
EXECUTE FUNCTION update_document_processed_status();

-- Trigger to update document_content updated_at timestamp
CREATE OR REPLACE FUNCTION update_document_content_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER document_content_update_trigger
BEFORE UPDATE ON document_content
FOR EACH ROW
EXECUTE FUNCTION update_document_content_timestamp();

-- Create views for common queries

-- View for document summary
CREATE VIEW document_summary AS
SELECT 
    d.id,
    d.file_name,
    d.document_type,
    d.upload_date,
    d.processed,
    u.name AS uploaded_by,
    dc.page_count,
    ps.status AS processing_status,
    ps.progress AS processing_progress,
    ps.processing_time,
    (SELECT COUNT(*) FROM securities s WHERE s.document_id = d.id) AS securities_count,
    (SELECT COUNT(*) FROM document_tables dt WHERE dt.document_id = d.id) AS tables_count,
    (SELECT COUNT(*) FROM chat_history ch WHERE ch.document_id = d.id) AS chat_count
FROM 
    documents d
LEFT JOIN 
    users u ON d.user_id = u.id
LEFT JOIN 
    document_content dc ON d.id = dc.document_id
LEFT JOIN 
    processing_status ps ON d.id = ps.document_id;

-- View for securities summary
CREATE VIEW securities_summary AS
SELECT 
    d.id AS document_id,
    d.file_name,
    d.document_type,
    SUM(s.value) AS total_value,
    COUNT(*) AS securities_count,
    array_agg(s.name) AS security_names,
    array_agg(s.isin) AS security_isins,
    array_agg(s.value) AS security_values,
    array_agg(s.currency) AS security_currencies
FROM 
    documents d
JOIN 
    securities s ON d.id = s.document_id
GROUP BY 
    d.id, d.file_name, d.document_type;

-- View for user activity
CREATE VIEW user_activity AS
SELECT 
    u.id AS user_id,
    u.name,
    u.email,
    COUNT(DISTINCT d.id) AS documents_uploaded,
    COUNT(DISTINCT ch.id) AS chat_messages,
    COUNT(DISTINCT r.id) AS reports_generated,
    COUNT(DISTINCT e.id) AS exports_created,
    MAX(d.upload_date) AS last_upload,
    MAX(ch.timestamp) AS last_chat,
    MAX(r.generated_at) AS last_report,
    MAX(e.export_date) AS last_export
FROM 
    users u
LEFT JOIN 
    documents d ON u.id = d.user_id
LEFT JOIN 
    chat_history ch ON u.id = ch.user_id
LEFT JOIN 
    reports r ON u.id = r.user_id
LEFT JOIN 
    export_history e ON u.id = e.user_id
GROUP BY 
    u.id, u.name, u.email;

-- View for tenant usage
CREATE VIEW tenant_usage AS
SELECT 
    t.id AS tenant_id,
    t.name AS tenant_name,
    COUNT(DISTINCT u.id) AS user_count,
    COUNT(DISTINCT d.id) AS document_count,
    SUM(d.file_size) AS total_storage_used,
    COUNT(DISTINCT ch.id) AS total_chat_messages,
    COUNT(DISTINCT r.id) AS total_reports,
    COUNT(DISTINCT e.id) AS total_exports,
    MAX(d.upload_date) AS last_activity
FROM 
    tenants t
LEFT JOIN 
    users u ON t.id = u.tenant_id
LEFT JOIN 
    documents d ON t.id = d.tenant_id
LEFT JOIN 
    chat_history ch ON ch.user_id IN (SELECT id FROM users WHERE tenant_id = t.id)
LEFT JOIN 
    reports r ON r.user_id IN (SELECT id FROM users WHERE tenant_id = t.id)
LEFT JOIN 
    export_history e ON e.user_id IN (SELECT id FROM users WHERE tenant_id = t.id)
GROUP BY 
    t.id, t.name;
