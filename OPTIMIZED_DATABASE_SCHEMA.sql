-- FinDoc Analyzer Optimized Database Schema

-- Enable Row Level Security
ALTER DATABASE postgres SET row_security = on;

-- Create extension for UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create extension for full-text search
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Create extension for handling unaccented text in search
CREATE EXTENSION IF NOT EXISTS "unaccent";

-- Create Tenants table
CREATE TABLE tenants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    domain TEXT UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    settings JSONB DEFAULT '{}'::JSONB,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    plan_type TEXT NOT NULL DEFAULT 'free' CHECK (plan_type IN ('free', 'basic', 'premium', 'enterprise')),
    contact_email TEXT,
    contact_name TEXT,
    CONSTRAINT tenants_name_check CHECK (char_length(name) >= 2 AND char_length(name) <= 100)
);

-- Create Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT NOT NULL,
    name TEXT NOT NULL,
    password_hash TEXT,
    password_salt TEXT,
    password_reset_token TEXT,
    password_reset_expires TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    last_login TIMESTAMP WITH TIME ZONE,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin', 'tenant_admin')),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    login_attempts INTEGER DEFAULT 0,
    locked_until TIMESTAMP WITH TIME ZONE,
    preferences JSONB DEFAULT '{}'::JSONB,
    mfa_enabled BOOLEAN DEFAULT FALSE,
    mfa_secret TEXT,
    profile_image_url TEXT,
    CONSTRAINT users_email_tenant_unique UNIQUE (email, tenant_id),
    CONSTRAINT users_email_check CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    CONSTRAINT users_name_check CHECK (char_length(name) >= 2 AND char_length(name) <= 100)
);

-- Create API Keys table
CREATE TABLE api_keys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    key_name TEXT NOT NULL,
    key_value TEXT NOT NULL UNIQUE,
    service TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    permissions JSONB DEFAULT '[]'::JSONB,
    last_used_at TIMESTAMP WITH TIME ZONE,
    usage_count INTEGER DEFAULT 0,
    rate_limit INTEGER DEFAULT 0,
    CONSTRAINT api_keys_key_name_check CHECK (char_length(key_name) >= 3 AND char_length(key_name) <= 50)
);

-- Create User Sessions table
CREATE TABLE user_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_token TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    ip_address TEXT,
    user_agent TEXT,
    last_activity TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    is_active BOOLEAN NOT NULL DEFAULT TRUE
);

-- Create Documents table
CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    external_id TEXT,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    file_type TEXT NOT NULL,
    file_size BIGINT NOT NULL,
    upload_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    document_type TEXT NOT NULL,
    processed BOOLEAN NOT NULL DEFAULT FALSE,
    storage_path TEXT,
    thumbnail_path TEXT,
    last_accessed TIMESTAMP WITH TIME ZONE,
    access_count INTEGER DEFAULT 0,
    is_template BOOLEAN DEFAULT FALSE,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'archived')),
    md5_hash TEXT,
    original_file_name TEXT,
    source TEXT DEFAULT 'upload' CHECK (source IN ('upload', 'api', 'email', 'import')),
    CONSTRAINT documents_file_name_check CHECK (char_length(file_name) > 0),
    CONSTRAINT documents_file_size_positive CHECK (file_size > 0)
);

-- Create Document Content table
CREATE TABLE document_content (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    extracted_text TEXT,
    metadata JSONB DEFAULT '{}'::JSONB,
    page_count INTEGER CHECK (page_count > 0),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    search_vector TSVECTOR,
    ocr_applied BOOLEAN DEFAULT FALSE,
    processing_time INTEGER, -- in milliseconds
    content_hash TEXT
);

-- Create Document Pages table (new)
CREATE TABLE document_pages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    page_number INTEGER NOT NULL CHECK (page_number >= 1),
    extracted_text TEXT,
    page_metadata JSONB DEFAULT '{}'::JSONB,
    page_image_path TEXT,
    search_vector TSVECTOR,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    CONSTRAINT document_pages_unique_page UNIQUE (document_id, page_number)
);

-- Create Document Versions table (new)
CREATE TABLE document_versions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    version_number INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    storage_path TEXT,
    file_size BIGINT NOT NULL,
    changes_description TEXT,
    CONSTRAINT document_versions_unique_version UNIQUE (document_id, version_number)
);

-- Create Processing Status table
CREATE TABLE processing_status (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    status TEXT NOT NULL CHECK (status IN ('queued', 'processing', 'completed', 'failed', 'cancelled')),
    progress INTEGER NOT NULL DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    start_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    end_time TIMESTAMP WITH TIME ZONE,
    processing_time INTEGER, -- in milliseconds
    agent_status JSONB DEFAULT '{}'::JSONB,
    error_message TEXT,
    retry_count INTEGER DEFAULT 0,
    priority INTEGER DEFAULT 5 CHECK (priority >= 1 AND priority <= 10),
    processor_id TEXT
);

-- Create Securities table
CREATE TABLE securities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    isin TEXT,
    name TEXT NOT NULL,
    symbol TEXT,
    quantity NUMERIC,
    price NUMERIC,
    value NUMERIC,
    currency TEXT,
    percent_of_assets NUMERIC,
    security_type TEXT,
    exchange TEXT,
    sector TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    verified BOOLEAN DEFAULT FALSE,
    confidence_score NUMERIC CHECK (confidence_score >= 0 AND confidence_score <= 1),
    extracted_from_page INTEGER,
    source_table_id UUID,
    additional_data JSONB DEFAULT '{}'::JSONB,
    CONSTRAINT securities_isin_valid CHECK (isin IS NULL OR (char_length(isin) = 12 AND isin ~ '^[A-Za-z0-9]+$'))
);

-- Create Securities Feedback table (new)
CREATE TABLE securities_feedback (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    security_id UUID NOT NULL REFERENCES securities(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    feedback_type TEXT NOT NULL CHECK (feedback_type IN ('correct', 'incorrect_name', 'incorrect_isin', 'incorrect_value', 'incorrect_quantity', 'other')),
    feedback_text TEXT,
    corrected_value TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    resolved BOOLEAN DEFAULT FALSE,
    resolved_by UUID REFERENCES users(id) ON DELETE SET NULL,
    resolved_at TIMESTAMP WITH TIME ZONE
);

-- Create Document Tables table
CREATE TABLE document_tables (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    table_name TEXT,
    headers JSONB,
    rows JSONB,
    page_number INTEGER CHECK (page_number >= 1),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    table_type TEXT,
    confidence_score NUMERIC CHECK (confidence_score >= 0 AND confidence_score <= 1),
    extraction_method TEXT,
    coordinates JSONB, -- {x1, y1, x2, y2} for location on page
    verified BOOLEAN DEFAULT FALSE
);

-- Create Chat History table
CREATE TABLE chat_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    response TEXT NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    sources JSONB DEFAULT '[]'::JSONB,
    conversation_id UUID,
    message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'query', 'system')),
    metadata JSONB DEFAULT '{}'::JSONB,
    is_favorited BOOLEAN DEFAULT FALSE,
    rating INTEGER CHECK (rating IS NULL OR (rating >= 1 AND rating <= 5))
);

-- Create Chat Conversations table (new)
CREATE TABLE chat_conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    title TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    document_ids JSONB DEFAULT '[]'::JSONB,
    is_archived BOOLEAN DEFAULT FALSE,
    last_message_at TIMESTAMP WITH TIME ZONE
);

-- Create Reports table
CREATE TABLE reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
    report_type TEXT NOT NULL,
    report_title TEXT,
    report_content JSONB,
    template_id UUID,
    generated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    report_path TEXT,
    is_scheduled BOOLEAN DEFAULT FALSE,
    schedule_id UUID,
    is_public BOOLEAN DEFAULT FALSE,
    public_access_token TEXT,
    expires_at TIMESTAMP WITH TIME ZONE
);

-- Create Report Templates table (new)
CREATE TABLE report_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    template_name TEXT NOT NULL,
    template_content JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    is_system_template BOOLEAN DEFAULT FALSE,
    is_public BOOLEAN DEFAULT FALSE,
    description TEXT
);

-- Create Scheduled Reports table (new)
CREATE TABLE scheduled_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    report_type TEXT NOT NULL,
    template_id UUID REFERENCES report_templates(id) ON DELETE SET NULL,
    schedule_type TEXT NOT NULL CHECK (schedule_type IN ('daily', 'weekly', 'monthly', 'custom')),
    schedule_config JSONB NOT NULL, -- For custom schedules (cron patterns, etc.)
    document_filter JSONB, -- Criteria for which documents to include
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    last_run TIMESTAMP WITH TIME ZONE,
    next_run TIMESTAMP WITH TIME ZONE,
    recipients JSONB, -- Array of email addresses or user IDs
    is_active BOOLEAN DEFAULT TRUE
);

-- Create Export History table
CREATE TABLE export_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
    export_type TEXT NOT NULL,
    export_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    file_size BIGINT,
    file_path TEXT,
    content_type TEXT NOT NULL, -- What was exported (securities, tables, etc.)
    filter_criteria JSONB, -- What filters were applied
    status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('processing', 'completed', 'failed')),
    error_message TEXT,
    download_count INTEGER DEFAULT 0,
    last_downloaded TIMESTAMP WITH TIME ZONE
);

-- Create Agent Logs table
CREATE TABLE agent_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    agent_name TEXT NOT NULL,
    agent_version TEXT,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    end_time TIMESTAMP WITH TIME ZONE,
    status TEXT NOT NULL CHECK (status IN ('queued', 'running', 'completed', 'failed', 'cancelled')),
    message TEXT,
    details JSONB,
    execution_time INTEGER, -- in milliseconds
    memory_used INTEGER, -- in KB
    tokens_used INTEGER,
    error_type TEXT,
    error_stack TEXT,
    is_retry BOOLEAN DEFAULT FALSE,
    retry_count INTEGER DEFAULT 0
);

-- Create Document Comparisons table (new)
CREATE TABLE document_comparisons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    document_id_1 UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    document_id_2 UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    comparison_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    comparison_type TEXT NOT NULL,
    results JSONB,
    summary TEXT,
    status TEXT NOT NULL DEFAULT 'processing' CHECK (status IN ('processing', 'completed', 'failed')),
    processing_time INTEGER, -- in milliseconds
    CONSTRAINT document_comparisons_different_docs CHECK (document_id_1 <> document_id_2)
);

-- Create Document Tags table (new)
CREATE TABLE document_tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    tag_name TEXT NOT NULL,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    CONSTRAINT document_tags_unique_tag UNIQUE (document_id, tag_name)
);

-- Create Audit Logs table (new)
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action_type TEXT NOT NULL,
    action_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    resource_type TEXT NOT NULL,
    resource_id UUID,
    previous_state JSONB,
    new_state JSONB,
    ip_address TEXT,
    user_agent TEXT,
    endpoint TEXT,
    status_code INTEGER
);

-- Create System Logs table (new)
CREATE TABLE system_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    log_level TEXT NOT NULL CHECK (log_level IN ('error', 'warn', 'info', 'debug', 'trace')),
    message TEXT NOT NULL,
    log_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    service TEXT NOT NULL,
    tenant_id UUID REFERENCES tenants(id) ON DELETE SET NULL,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    request_id TEXT,
    stack_trace TEXT,
    metadata JSONB
);

-- Create User Notifications table (new)
CREATE TABLE user_notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    notification_type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP WITH TIME ZONE,
    resource_type TEXT,
    resource_id UUID,
    action_url TEXT,
    priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent'))
);

-- Create Tenant Settings table (new)
CREATE TABLE tenant_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    setting_key TEXT NOT NULL,
    setting_value JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    is_sensitive BOOLEAN DEFAULT FALSE,
    description TEXT,
    CONSTRAINT tenant_settings_unique_key UNIQUE (tenant_id, setting_key)
);

-- Create Batch Jobs table (new)
CREATE TABLE batch_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    job_type TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    total_items INTEGER DEFAULT 0,
    processed_items INTEGER DEFAULT 0,
    failed_items INTEGER DEFAULT 0,
    result_summary JSONB,
    error_message TEXT,
    priority INTEGER DEFAULT 5 CHECK (priority >= 1 AND priority <= 10),
    input_params JSONB
);

-- Create Batch Job Items table (new)
CREATE TABLE batch_job_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_id UUID NOT NULL REFERENCES batch_jobs(id) ON DELETE CASCADE,
    item_index INTEGER NOT NULL,
    resource_type TEXT NOT NULL,
    resource_id UUID,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'skipped')),
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT,
    result JSONB,
    retry_count INTEGER DEFAULT 0,
    CONSTRAINT batch_job_items_unique_index UNIQUE (job_id, item_index)
);

-- Create Row Level Security Policies

-- Tenants table RLS
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenants_tenant_isolation ON tenants
    USING (id = current_setting('app.current_tenant_id')::UUID);

-- Users table RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY users_tenant_isolation ON users
    USING (tenant_id = current_setting('app.current_tenant_id')::UUID);

-- Documents table RLS
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY documents_tenant_isolation ON documents
    USING (tenant_id = current_setting('app.current_tenant_id')::UUID);

-- Continue with RLS policies for all other tables...

-- Create advanced indexes for performance optimization

-- Users indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_tenant_id ON users(tenant_id);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_last_login ON users(last_login);
CREATE INDEX idx_users_email_pattern ON users(lower(email) text_pattern_ops);
CREATE INDEX idx_users_name_pattern ON users(lower(name) text_pattern_ops);

-- API Keys indexes
CREATE INDEX idx_api_keys_tenant_id ON api_keys(tenant_id);
CREATE INDEX idx_api_keys_user_id ON api_keys(user_id);
CREATE INDEX idx_api_keys_service ON api_keys(service);
CREATE INDEX idx_api_keys_expires_at ON api_keys(expires_at);
CREATE INDEX idx_api_keys_is_active ON api_keys(is_active);

-- Sessions indexes
CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_expires_at ON user_sessions(expires_at);
CREATE INDEX idx_user_sessions_is_active ON user_sessions(is_active);
CREATE INDEX idx_user_sessions_last_activity ON user_sessions(last_activity);

-- Documents indexes
CREATE INDEX idx_documents_user_id ON documents(user_id);
CREATE INDEX idx_documents_tenant_id ON documents(tenant_id);
CREATE INDEX idx_documents_document_type ON documents(document_type);
CREATE INDEX idx_documents_upload_date ON documents(upload_date);
CREATE INDEX idx_documents_processed ON documents(processed);
CREATE INDEX idx_documents_status ON documents(status);
CREATE INDEX idx_documents_file_type ON documents(file_type);
CREATE INDEX idx_documents_file_name_pattern ON documents(lower(file_name) text_pattern_ops);
CREATE INDEX idx_documents_external_id ON documents(external_id);
CREATE INDEX idx_documents_md5_hash ON documents(md5_hash);
CREATE INDEX idx_documents_source ON documents(source);

-- Document Content indexes
CREATE INDEX idx_document_content_document_id ON document_content(document_id);
CREATE INDEX idx_document_content_search_vector ON document_content USING GIN(search_vector);
CREATE INDEX idx_document_content_ocr_applied ON document_content(ocr_applied);

-- Document Pages indexes
CREATE INDEX idx_document_pages_document_id ON document_pages(document_id);
CREATE INDEX idx_document_pages_page_number ON document_pages(document_id, page_number);
CREATE INDEX idx_document_pages_search_vector ON document_pages USING GIN(search_vector);

-- Securities indexes
CREATE INDEX idx_securities_document_id ON securities(document_id);
CREATE INDEX idx_securities_isin ON securities(isin);
CREATE INDEX idx_securities_name_pattern ON securities(lower(name) text_pattern_ops);
CREATE INDEX idx_securities_symbol ON securities(symbol);
CREATE INDEX idx_securities_security_type ON securities(security_type);
CREATE INDEX idx_securities_verified ON securities(verified);
CREATE INDEX idx_securities_extracted_from_page ON securities(document_id, extracted_from_page);

-- Optimized indexes for securities queries
CREATE INDEX idx_securities_by_value ON securities(document_id, value DESC);
CREATE INDEX idx_securities_by_percent ON securities(document_id, percent_of_assets DESC);

-- Tables indexes
CREATE INDEX idx_document_tables_document_id ON document_tables(document_id);
CREATE INDEX idx_document_tables_page_number ON document_tables(document_id, page_number);
CREATE INDEX idx_document_tables_table_type ON document_tables(table_type);
CREATE INDEX idx_document_tables_verified ON document_tables(verified);

-- Chat History indexes
CREATE INDEX idx_chat_history_user_id ON chat_history(user_id);
CREATE INDEX idx_chat_history_document_id ON chat_history(document_id);
CREATE INDEX idx_chat_history_timestamp ON chat_history(timestamp);
CREATE INDEX idx_chat_history_conversation_id ON chat_history(conversation_id);
CREATE INDEX idx_chat_history_message_type ON chat_history(message_type);
CREATE INDEX idx_chat_history_is_favorited ON chat_history(is_favorited);

-- Chat Conversations indexes
CREATE INDEX idx_chat_conversations_user_id ON chat_conversations(user_id);
CREATE INDEX idx_chat_conversations_tenant_id ON chat_conversations(tenant_id);
CREATE INDEX idx_chat_conversations_last_message_at ON chat_conversations(last_message_at);
CREATE INDEX idx_chat_conversations_is_archived ON chat_conversations(is_archived);

-- Reports indexes
CREATE INDEX idx_reports_user_id ON reports(user_id);
CREATE INDEX idx_reports_tenant_id ON reports(tenant_id);
CREATE INDEX idx_reports_document_id ON reports(document_id);
CREATE INDEX idx_reports_report_type ON reports(report_type);
CREATE INDEX idx_reports_generated_at ON reports(generated_at);
CREATE INDEX idx_reports_is_scheduled ON reports(is_scheduled);
CREATE INDEX idx_reports_is_public ON reports(is_public);
CREATE INDEX idx_reports_expires_at ON reports(expires_at);

-- Create additional indexes and constraints for all tables...

-- Create stored procedures and functions for common operations

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

-- Function to update document last accessed time
CREATE OR REPLACE FUNCTION update_document_last_accessed()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE documents 
    SET 
        last_accessed = NOW(),
        access_count = access_count + 1
    WHERE id = NEW.document_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to update fulltext search vectors
CREATE OR REPLACE FUNCTION update_document_search_vector()
RETURNS TRIGGER AS $$
BEGIN
    NEW.search_vector = 
        setweight(to_tsvector('english', COALESCE(NEW.extracted_text, '')), 'A');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to get document statistics
CREATE OR REPLACE FUNCTION get_document_statistics(doc_id UUID)
RETURNS TABLE (
    securities_count BIGINT,
    tables_count BIGINT,
    pages_count INTEGER,
    chat_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        (SELECT COUNT(*) FROM securities WHERE document_id = doc_id),
        (SELECT COUNT(*) FROM document_tables WHERE document_id = doc_id),
        (SELECT page_count FROM document_content WHERE document_id = doc_id),
        (SELECT COUNT(*) FROM chat_history WHERE document_id = doc_id);
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic updates

-- Trigger to update document status when processing is complete
CREATE OR REPLACE FUNCTION update_document_processed_status()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'completed' THEN
        UPDATE documents 
        SET 
            processed = TRUE,
            status = 'completed'
        WHERE id = NEW.document_id;
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
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply update timestamp trigger to all tables with updated_at column
CREATE TRIGGER document_content_update_timestamp
BEFORE UPDATE ON document_content
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER users_update_timestamp
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER tenants_update_timestamp
BEFORE UPDATE ON tenants
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

-- Add more update timestamp triggers for other tables...

-- Trigger to update search vectors
CREATE TRIGGER document_content_search_update
BEFORE INSERT OR UPDATE OF extracted_text ON document_content
FOR EACH ROW
EXECUTE FUNCTION update_document_search_vector();

CREATE TRIGGER document_pages_search_update
BEFORE INSERT OR UPDATE OF extracted_text ON document_pages
FOR EACH ROW
EXECUTE FUNCTION update_document_search_vector();

-- Trigger to record document access
CREATE TRIGGER document_content_access_trigger
AFTER SELECT ON document_content
FOR EACH STATEMENT
EXECUTE FUNCTION update_document_last_accessed();

-- Create advanced views for analytics and reporting

-- View for document summary with enhanced information
CREATE OR REPLACE VIEW document_summary_enhanced AS
SELECT 
    d.id,
    d.file_name,
    d.document_type,
    d.upload_date,
    d.processed,
    d.status,
    d.access_count,
    d.last_accessed,
    u.name AS uploaded_by,
    u.email AS uploader_email,
    dc.page_count,
    ps.status AS processing_status,
    ps.progress AS processing_progress,
    ps.processing_time,
    (SELECT COUNT(*) FROM securities s WHERE s.document_id = d.id) AS securities_count,
    (SELECT COUNT(*) FROM document_tables dt WHERE dt.document_id = d.id) AS tables_count,
    (SELECT COUNT(*) FROM chat_history ch WHERE ch.document_id = d.id) AS chat_count,
    (SELECT ARRAY_AGG(DISTINCT tag_name) FROM document_tags WHERE document_id = d.id) AS tags,
    (SELECT COUNT(*) FROM document_versions dv WHERE dv.document_id = d.id) AS version_count,
    d.tenant_id,
    t.name AS tenant_name
FROM 
    documents d
LEFT JOIN 
    users u ON d.user_id = u.id
LEFT JOIN
    tenants t ON d.tenant_id = t.id
LEFT JOIN 
    document_content dc ON d.id = dc.document_id
LEFT JOIN 
    processing_status ps ON d.id = ps.document_id AND ps.status = 'completed';

-- View for securities analysis
CREATE OR REPLACE VIEW securities_analysis AS
SELECT 
    d.id AS document_id,
    d.file_name,
    d.document_type,
    d.upload_date,
    t.name AS tenant_name,
    u.name AS uploaded_by,
    s.id AS security_id,
    s.name AS security_name,
    s.isin,
    s.symbol,
    s.quantity,
    s.price,
    s.value,
    s.currency,
    s.percent_of_assets,
    s.security_type,
    s.sector,
    s.exchange,
    s.verified,
    s.confidence_score,
    (SELECT COUNT(*) FROM securities_feedback sf WHERE sf.security_id = s.id) AS feedback_count
FROM 
    documents d
JOIN 
    tenants t ON d.tenant_id = t.id
JOIN 
    users u ON d.user_id = u.id
JOIN 
    securities s ON d.id = s.document_id;

-- View for enhanced user activity
CREATE OR REPLACE VIEW user_activity_enhanced AS
SELECT 
    u.id AS user_id,
    u.name,
    u.email,
    u.role,
    u.status,
    u.created_at,
    u.last_login,
    u.tenant_id,
    t.name AS tenant_name,
    COUNT(DISTINCT d.id) AS documents_uploaded,
    COUNT(DISTINCT ch.id) AS chat_messages,
    COUNT(DISTINCT r.id) AS reports_generated,
    COUNT(DISTINCT e.id) AS exports_created,
    COUNT(DISTINCT sf.id) AS feedback_submitted,
    MAX(d.upload_date) AS last_upload,
    MAX(ch.timestamp) AS last_chat,
    MAX(r.generated_at) AS last_report,
    MAX(e.export_date) AS last_export,
    COALESCE(SUM(d.file_size), 0) AS total_uploaded_size,
    (
        SELECT COUNT(*) 
        FROM user_sessions us 
        WHERE us.user_id = u.id AND us.is_active = TRUE
    ) AS active_sessions
FROM 
    users u
JOIN 
    tenants t ON u.tenant_id = t.id
LEFT JOIN 
    documents d ON u.id = d.user_id
LEFT JOIN 
    chat_history ch ON u.id = ch.user_id
LEFT JOIN 
    reports r ON u.id = r.user_id
LEFT JOIN 
    export_history e ON u.id = e.user_id
LEFT JOIN
    securities_feedback sf ON u.id = sf.user_id
GROUP BY 
    u.id, u.name, u.email, u.role, u.status, u.created_at, u.last_login, u.tenant_id, t.name;

-- View for tenant usage metrics
CREATE OR REPLACE VIEW tenant_usage_metrics AS
SELECT 
    t.id AS tenant_id,
    t.name AS tenant_name,
    t.plan_type,
    t.status,
    t.created_at,
    COUNT(DISTINCT u.id) AS user_count,
    COUNT(DISTINCT d.id) AS document_count,
    COALESCE(SUM(d.file_size), 0) AS total_storage_used,
    COUNT(DISTINCT ch.id) AS total_chat_messages,
    COUNT(DISTINCT r.id) AS total_reports,
    COUNT(DISTINCT e.id) AS total_exports,
    MAX(d.upload_date) AS last_document_upload,
    MAX(u.last_login) AS last_user_login,
    (
        SELECT COUNT(*) 
        FROM users 
        WHERE tenant_id = t.id AND last_login > (NOW() - INTERVAL '30 days')
    ) AS active_users_30d,
    (
        SELECT COUNT(*) 
        FROM documents 
        WHERE tenant_id = t.id AND upload_date > (NOW() - INTERVAL '30 days')
    ) AS documents_uploaded_30d,
    (
        SELECT COUNT(*) 
        FROM securities 
        WHERE document_id IN (SELECT id FROM documents WHERE tenant_id = t.id)
    ) AS total_securities,
    (
        SELECT COUNT(*) 
        FROM document_tables 
        WHERE document_id IN (SELECT id FROM documents WHERE tenant_id = t.id)
    ) AS total_tables
FROM 
    tenants t
LEFT JOIN 
    users u ON t.id = u.tenant_id
LEFT JOIN 
    documents d ON t.id = d.tenant_id
LEFT JOIN 
    chat_history ch ON ch.user_id IN (SELECT id FROM users WHERE tenant_id = t.id)
LEFT JOIN 
    reports r ON r.tenant_id = t.id
LEFT JOIN 
    export_history e ON e.tenant_id = t.id
GROUP BY 
    t.id, t.name, t.plan_type, t.status, t.created_at;

-- View for system health monitoring
CREATE OR REPLACE VIEW system_health AS
SELECT
    (SELECT COUNT(*) FROM users WHERE status = 'active') AS active_users,
    (SELECT COUNT(*) FROM documents WHERE status = 'processing') AS processing_documents,
    (SELECT COUNT(*) FROM processing_status WHERE status = 'queued') AS queued_documents,
    (SELECT COUNT(*) FROM processing_status WHERE status = 'failed') AS failed_documents,
    (SELECT COUNT(*) FROM batch_jobs WHERE status = 'processing') AS active_batch_jobs,
    (SELECT COUNT(*) FROM batch_jobs WHERE status = 'pending') AS pending_batch_jobs,
    (SELECT COUNT(*) FROM batch_jobs WHERE status = 'failed') AS failed_batch_jobs,
    (SELECT COUNT(*) FROM user_sessions WHERE is_active = TRUE) AS active_sessions,
    (SELECT COUNT(*) FROM system_logs WHERE log_level = 'error' AND log_date > (NOW() - INTERVAL '24 hours')) AS errors_24h,
    (SELECT COUNT(*) FROM audit_logs WHERE action_date > (NOW() - INTERVAL '24 hours')) AS audit_events_24h;

-- View for document processing metrics
CREATE OR REPLACE VIEW document_processing_metrics AS
SELECT
    DATE_TRUNC('day', ps.start_time) AS processing_date,
    COUNT(DISTINCT ps.id) AS total_documents,
    COUNT(DISTINCT CASE WHEN ps.status = 'completed' THEN ps.id END) AS successful_documents,
    COUNT(DISTINCT CASE WHEN ps.status = 'failed' THEN ps.id END) AS failed_documents,
    AVG(CASE WHEN ps.status = 'completed' THEN ps.processing_time END) AS avg_processing_time_ms,
    MIN(CASE WHEN ps.status = 'completed' THEN ps.processing_time END) AS min_processing_time_ms,
    MAX(CASE WHEN ps.status = 'completed' THEN ps.processing_time END) AS max_processing_time_ms,
    AVG(CASE WHEN dc.ocr_applied = TRUE THEN dc.processing_time END) AS avg_ocr_processing_time_ms,
    COUNT(DISTINCT CASE WHEN dc.ocr_applied = TRUE THEN ps.id END) AS ocr_documents,
    SUM(d.file_size) AS total_processed_size_bytes,
    COUNT(DISTINCT d.tenant_id) AS tenants_count
FROM
    processing_status ps
JOIN
    documents d ON ps.document_id = d.id
LEFT JOIN
    document_content dc ON d.id = dc.document_id
WHERE 
    ps.start_time > (NOW() - INTERVAL '30 days')
GROUP BY
    DATE_TRUNC('day', ps.start_time)
ORDER BY
    processing_date DESC;

-- Create materialized views for expensive queries that change infrequently

-- Materialized view for securities summary by tenant
CREATE MATERIALIZED VIEW securities_by_tenant AS
SELECT
    d.tenant_id,
    t.name AS tenant_name,
    COUNT(DISTINCT s.id) AS total_securities,
    COUNT(DISTINCT s.isin) AS unique_isins,
    COUNT(DISTINCT d.id) AS documents_with_securities,
    SUM(s.value) AS total_value,
    array_agg(DISTINCT s.currency) AS currencies,
    array_agg(DISTINCT s.security_type) FILTER (WHERE s.security_type IS NOT NULL) AS security_types,
    array_agg(DISTINCT s.sector) FILTER (WHERE s.sector IS NOT NULL) AS sectors
FROM
    securities s
JOIN
    documents d ON s.document_id = d.id
JOIN
    tenants t ON d.tenant_id = t.id
GROUP BY
    d.tenant_id, t.name
WITH DATA;

-- Create index on materialized view
CREATE UNIQUE INDEX idx_securities_by_tenant ON securities_by_tenant(tenant_id);

-- Refresh function for materialized view
CREATE OR REPLACE FUNCTION refresh_securities_by_tenant()
RETURNS TRIGGER AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY securities_by_tenant;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger to refresh materialized view
CREATE TRIGGER refresh_securities_by_tenant_trigger
AFTER INSERT OR UPDATE OR DELETE ON securities
FOR EACH STATEMENT
EXECUTE FUNCTION refresh_securities_by_tenant();

-- Add more materialized views as needed...

-- Create functions for advanced search

-- Function for full-text search across documents
CREATE OR REPLACE FUNCTION search_documents(
    search_query TEXT,
    tenant_id_param UUID,
    document_type_filter TEXT DEFAULT NULL,
    start_date TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    end_date TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    limit_param INTEGER DEFAULT 100
)
RETURNS TABLE (
    document_id UUID,
    document_name TEXT,
    document_type TEXT,
    upload_date TIMESTAMP WITH TIME ZONE,
    uploaded_by TEXT,
    relevance FLOAT,
    highlight TEXT
) AS $$
BEGIN
    RETURN QUERY
    WITH search_results AS (
        SELECT
            d.id AS doc_id,
            d.file_name,
            d.document_type,
            d.upload_date,
            u.name AS user_name,
            ts_rank_cd(dc.search_vector, to_tsquery('english', search_query)) AS rank,
            ts_headline('english', dc.extracted_text, to_tsquery('english', search_query), 'MaxFragments=3, MaxWords=20, MinWords=5') AS text_highlight
        FROM
            documents d
        JOIN
            users u ON d.user_id = u.id
        JOIN
            document_content dc ON d.id = dc.document_id
        WHERE
            d.tenant_id = tenant_id_param
            AND (document_type_filter IS NULL OR d.document_type = document_type_filter)
            AND (start_date IS NULL OR d.upload_date >= start_date)
            AND (end_date IS NULL OR d.upload_date <= end_date)
            AND dc.search_vector @@ to_tsquery('english', search_query)
        UNION
        SELECT
            d.id AS doc_id,
            d.file_name,
            d.document_type,
            d.upload_date,
            u.name AS user_name,
            ts_rank_cd(dp.search_vector, to_tsquery('english', search_query)) AS rank,
            ts_headline('english', dp.extracted_text, to_tsquery('english', search_query), 'MaxFragments=3, MaxWords=20, MinWords=5') AS text_highlight
        FROM
            documents d
        JOIN
            users u ON d.user_id = u.id
        JOIN
            document_pages dp ON d.id = dp.document_id
        WHERE
            d.tenant_id = tenant_id_param
            AND (document_type_filter IS NULL OR d.document_type = document_type_filter)
            AND (start_date IS NULL OR d.upload_date >= start_date)
            AND (end_date IS NULL OR d.upload_date <= end_date)
            AND dp.search_vector @@ to_tsquery('english', search_query)
    )
    SELECT 
        sr.doc_id,
        sr.file_name,
        sr.document_type,
        sr.upload_date,
        sr.user_name,
        sr.rank,
        sr.text_highlight
    FROM 
        search_results sr
    ORDER BY
        sr.rank DESC
    LIMIT limit_param;
END;
$$ LANGUAGE plpgsql;

-- Create partitioning for large tables (for high volume installations)

-- Example partitioning for system_logs by month
CREATE TABLE system_logs_partitioned (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    log_level TEXT NOT NULL CHECK (log_level IN ('error', 'warn', 'info', 'debug', 'trace')),
    message TEXT NOT NULL,
    log_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    service TEXT NOT NULL,
    tenant_id UUID REFERENCES tenants(id) ON DELETE SET NULL,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    request_id TEXT,
    stack_trace TEXT,
    metadata JSONB
) PARTITION BY RANGE (log_date);

-- Create partitions for system_logs (monthly for one year)
CREATE TABLE system_logs_y2025m01 PARTITION OF system_logs_partitioned
FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');

CREATE TABLE system_logs_y2025m02 PARTITION OF system_logs_partitioned
FOR VALUES FROM ('2025-02-01') TO ('2025-03-01');

CREATE TABLE system_logs_y2025m03 PARTITION OF system_logs_partitioned
FOR VALUES FROM ('2025-03-01') TO ('2025-04-01');

-- Add more partitions as needed...

-- Create necessary indexes for the partitioned table
CREATE INDEX idx_system_logs_log_date ON system_logs_partitioned(log_date);
CREATE INDEX idx_system_logs_log_level ON system_logs_partitioned(log_level);
CREATE INDEX idx_system_logs_tenant_id ON system_logs_partitioned(tenant_id);

-- Create default partition for data outside the defined ranges
CREATE TABLE system_logs_default PARTITION OF system_logs_partitioned DEFAULT;

-- Add comments to document schema
COMMENT ON TABLE users IS 'Stores user accounts with authentication and profile information';
COMMENT ON TABLE tenants IS 'Stores tenant organizations for multi-tenant architecture';
COMMENT ON TABLE documents IS 'Stores document metadata for uploaded financial documents';
COMMENT ON TABLE document_content IS 'Stores extracted text content and metadata from documents';
COMMENT ON TABLE securities IS 'Stores securities data extracted from financial documents';
-- Add comments for all other tables...

-- Add comments to document columns
COMMENT ON COLUMN users.password_hash IS 'Hashed password using strong algorithm (bcrypt/Argon2)';
COMMENT ON COLUMN users.password_reset_token IS 'Temporary token generated for password reset requests';
COMMENT ON COLUMN users.login_attempts IS 'Counter for failed login attempts for security monitoring';
-- Add comments for important columns...

-- Create extension for database statistics monitoring
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

-- Create user-defined types for better data modeling
CREATE TYPE document_status_enum AS ENUM ('pending', 'processing', 'completed', 'failed', 'archived');
CREATE TYPE job_status_enum AS ENUM ('pending', 'processing', 'completed', 'failed', 'cancelled');
-- Create more custom types as needed...