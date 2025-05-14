-- Supabase Schema for API Key Management

-- Tenants table
CREATE TABLE tenants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT NOT NULL DEFAULT 'active',
  subscription_tier TEXT NOT NULL DEFAULT 'free',
  max_documents INTEGER NOT NULL DEFAULT 100,
  max_api_calls INTEGER NOT NULL DEFAULT 1000
);

-- Enable Row Level Security
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;

-- Create policy for tenants
CREATE POLICY tenant_isolation_policy ON tenants
  USING (auth.uid() = id);

-- API Keys table
CREATE TABLE api_keys (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  secret_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT NOT NULL DEFAULT 'active',
  UNIQUE(tenant_id, provider)
);

-- Enable Row Level Security
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;

-- Create policy for API keys
CREATE POLICY api_key_isolation_policy ON api_keys
  USING (tenant_id = auth.uid());

-- API Key Usage table
CREATE TABLE api_key_usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  usage_date DATE NOT NULL DEFAULT CURRENT_DATE,
  call_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(tenant_id, provider, usage_date)
);

-- Enable Row Level Security
ALTER TABLE api_key_usage ENABLE ROW LEVEL SECURITY;

-- Create policy for API key usage
CREATE POLICY api_key_usage_isolation_policy ON api_key_usage
  USING (tenant_id = auth.uid());

-- Documents table (extended with tenant_id)
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  document_type TEXT,
  content JSONB,
  metadata JSONB,
  processed BOOLEAN NOT NULL DEFAULT FALSE,
  upload_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processing_time FLOAT
);

-- Enable Row Level Security
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- Create policy for documents
CREATE POLICY document_isolation_policy ON documents
  USING (tenant_id = auth.uid());

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_tenants_updated_at
BEFORE UPDATE ON tenants
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_api_keys_updated_at
BEFORE UPDATE ON api_keys
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_api_key_usage_updated_at
BEFORE UPDATE ON api_key_usage
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Function to increment API key usage
CREATE OR REPLACE FUNCTION increment_api_key_usage(
  p_tenant_id UUID,
  p_provider TEXT,
  p_count INTEGER DEFAULT 1
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO api_key_usage (tenant_id, provider, call_count)
  VALUES (p_tenant_id, p_provider, p_count)
  ON CONFLICT (tenant_id, provider, usage_date)
  DO UPDATE SET
    call_count = api_key_usage.call_count + p_count,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- Function to check if tenant has exceeded API call limit
CREATE OR REPLACE FUNCTION has_exceeded_api_call_limit(
  p_tenant_id UUID,
  p_provider TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
  v_usage INTEGER;
  v_limit INTEGER;
BEGIN
  -- Get current usage for today
  SELECT COALESCE(SUM(call_count), 0)
  INTO v_usage
  FROM api_key_usage
  WHERE tenant_id = p_tenant_id
    AND provider = p_provider
    AND usage_date = CURRENT_DATE;
  
  -- Get tenant's limit
  SELECT max_api_calls
  INTO v_limit
  FROM tenants
  WHERE id = p_tenant_id;
  
  -- Return whether limit is exceeded
  RETURN v_usage >= v_limit;
END;
$$ LANGUAGE plpgsql;
