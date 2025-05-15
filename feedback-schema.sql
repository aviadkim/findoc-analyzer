-- FinDoc Analyzer - Feedback and Analytics Schema
-- This schema defines the database structure for the feedback and analytics system

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Feedback Table
CREATE TABLE feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE SET NULL,
  type TEXT NOT NULL,
  subject TEXT NOT NULL,
  content TEXT NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  status TEXT NOT NULL DEFAULT 'pending',
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Feedback Response Table
CREATE TABLE feedback_responses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  feedback_id UUID NOT NULL REFERENCES feedback(id) ON DELETE CASCADE,
  responder_id UUID NOT NULL REFERENCES users(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  is_internal BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Analytics Events Table
CREATE TABLE analytics_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL,
  event_name TEXT NOT NULL,
  event_data JSONB DEFAULT '{}'::jsonb,
  session_id TEXT,
  client_info JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Analytics Summary Table (Aggregated data for performance)
CREATE TABLE analytics_summary (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  event_name TEXT NOT NULL,
  count INTEGER NOT NULL DEFAULT 0,
  period TEXT NOT NULL, -- 'daily', 'weekly', 'monthly'
  period_start DATE NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (organization_id, event_type, event_name, period, period_start)
);

-- User Metrics Table
CREATE TABLE user_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  login_count INTEGER NOT NULL DEFAULT 0,
  document_uploads INTEGER NOT NULL DEFAULT 0,
  document_processes INTEGER NOT NULL DEFAULT 0,
  analytics_views INTEGER NOT NULL DEFAULT 0,
  feedback_submissions INTEGER NOT NULL DEFAULT 0,
  last_login TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (organization_id, user_id)
);

-- Feature Usage Table
CREATE TABLE feature_usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  feature_id TEXT NOT NULL,
  usage_count INTEGER NOT NULL DEFAULT 0,
  last_used TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (organization_id, feature_id)
);

-- Document Analytics Table
CREATE TABLE document_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  view_count INTEGER NOT NULL DEFAULT 0,
  download_count INTEGER NOT NULL DEFAULT 0,
  processing_count INTEGER NOT NULL DEFAULT 0,
  average_processing_time FLOAT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (organization_id, document_id)
);

-- Feedback Categories Table
CREATE TABLE feedback_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (name)
);

-- Insert default feedback categories
INSERT INTO feedback_categories (name, description) VALUES
  ('Bug Report', 'Report a bug or issue with the application'),
  ('Feature Request', 'Request a new feature or enhancement'),
  ('Usability', 'Feedback about the user experience and usability'),
  ('Performance', 'Feedback about application performance'),
  ('Documentation', 'Feedback about documentation and help resources'),
  ('Other', 'Other types of feedback');

-- Add feedback category relation to feedback table
ALTER TABLE feedback 
ADD COLUMN category_id UUID REFERENCES feedback_categories(id);

-- Row Level Security Policies

-- Enable RLS on all tables
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_summary ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_analytics ENABLE ROW LEVEL SECURITY;

-- Feedback table policies
CREATE POLICY feedback_organization_policy ON feedback
  USING (organization_id IN (
    SELECT organization_id FROM organization_members
    WHERE user_id = auth.uid()
  ));

CREATE POLICY feedback_user_policy ON feedback
  USING (user_id = auth.uid());

-- Feedback responses policies
CREATE POLICY feedback_responses_organization_policy ON feedback_responses
  USING (feedback_id IN (
    SELECT id FROM feedback
    WHERE organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid()
    )
  ));

-- Analytics events policies
CREATE POLICY analytics_events_organization_policy ON analytics_events
  USING (organization_id IN (
    SELECT organization_id FROM organization_members
    WHERE user_id = auth.uid() AND 
    (
      SELECT role FROM organization_members 
      WHERE user_id = auth.uid() AND organization_id = analytics_events.organization_id
    ) IN ('admin', 'owner')
  ));

-- Analytics summary policies
CREATE POLICY analytics_summary_organization_policy ON analytics_summary
  USING (organization_id IN (
    SELECT organization_id FROM organization_members
    WHERE user_id = auth.uid() AND 
    (
      SELECT role FROM organization_members 
      WHERE user_id = auth.uid() AND organization_id = analytics_summary.organization_id
    ) IN ('admin', 'owner')
  ));

-- User metrics policies
CREATE POLICY user_metrics_organization_policy ON user_metrics
  USING (organization_id IN (
    SELECT organization_id FROM organization_members
    WHERE user_id = auth.uid() AND 
    (
      SELECT role FROM organization_members 
      WHERE user_id = auth.uid() AND organization_id = user_metrics.organization_id
    ) IN ('admin', 'owner')
  ));

CREATE POLICY user_metrics_user_policy ON user_metrics
  USING (user_id = auth.uid());

-- Feature usage policies
CREATE POLICY feature_usage_organization_policy ON feature_usage
  USING (organization_id IN (
    SELECT organization_id FROM organization_members
    WHERE user_id = auth.uid() AND 
    (
      SELECT role FROM organization_members 
      WHERE user_id = auth.uid() AND organization_id = feature_usage.organization_id
    ) IN ('admin', 'owner')
  ));

-- Document analytics policies
CREATE POLICY document_analytics_organization_policy ON document_analytics
  USING (organization_id IN (
    SELECT organization_id FROM organization_members
    WHERE user_id = auth.uid()
  ));

-- Functions for analytics

-- Function to update user metrics
CREATE OR REPLACE FUNCTION update_user_metrics()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if a record exists for this user and organization
  IF EXISTS (
    SELECT 1 FROM user_metrics 
    WHERE user_id = NEW.user_id AND organization_id = NEW.organization_id
  ) THEN
    -- Update existing record
    UPDATE user_metrics 
    SET 
      login_count = CASE 
        WHEN NEW.event_type = 'auth' AND NEW.event_name = 'login' 
        THEN login_count + 1 
        ELSE login_count 
      END,
      document_uploads = CASE 
        WHEN NEW.event_type = 'document' AND NEW.event_name = 'upload' 
        THEN document_uploads + 1 
        ELSE document_uploads 
      END,
      document_processes = CASE 
        WHEN NEW.event_type = 'document' AND NEW.event_name = 'process' 
        THEN document_processes + 1 
        ELSE document_processes 
      END,
      analytics_views = CASE 
        WHEN NEW.event_type = 'analytics' AND NEW.event_name = 'view' 
        THEN analytics_views + 1 
        ELSE analytics_views 
      END,
      feedback_submissions = CASE 
        WHEN NEW.event_type = 'feedback' AND NEW.event_name = 'submit' 
        THEN feedback_submissions + 1 
        ELSE feedback_submissions 
      END,
      last_login = CASE 
        WHEN NEW.event_type = 'auth' AND NEW.event_name = 'login' 
        THEN NEW.created_at 
        ELSE last_login 
      END,
      updated_at = NOW()
    WHERE user_id = NEW.user_id AND organization_id = NEW.organization_id;
  ELSE
    -- Create new record
    INSERT INTO user_metrics (
      organization_id,
      user_id,
      login_count,
      document_uploads,
      document_processes,
      analytics_views,
      feedback_submissions,
      last_login,
      created_at,
      updated_at
    ) VALUES (
      NEW.organization_id,
      NEW.user_id,
      CASE WHEN NEW.event_type = 'auth' AND NEW.event_name = 'login' THEN 1 ELSE 0 END,
      CASE WHEN NEW.event_type = 'document' AND NEW.event_name = 'upload' THEN 1 ELSE 0 END,
      CASE WHEN NEW.event_type = 'document' AND NEW.event_name = 'process' THEN 1 ELSE 0 END,
      CASE WHEN NEW.event_type = 'analytics' AND NEW.event_name = 'view' THEN 1 ELSE 0 END,
      CASE WHEN NEW.event_type = 'feedback' AND NEW.event_name = 'submit' THEN 1 ELSE 0 END,
      CASE WHEN NEW.event_type = 'auth' AND NEW.event_name = 'login' THEN NEW.created_at ELSE NULL END,
      NOW(),
      NOW()
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for analytics events to update user metrics
CREATE TRIGGER analytics_events_user_metrics_trigger
  AFTER INSERT ON analytics_events
  FOR EACH ROW
  EXECUTE FUNCTION update_user_metrics();

-- Function to update feature usage
CREATE OR REPLACE FUNCTION update_feature_usage()
RETURNS TRIGGER AS $$
BEGIN
  -- Extract feature ID from event data if available
  IF NEW.event_type = 'feature' AND NEW.event_data ? 'feature_id' THEN
    -- Check if a record exists for this feature and organization
    IF EXISTS (
      SELECT 1 FROM feature_usage 
      WHERE feature_id = NEW.event_data->>'feature_id' AND organization_id = NEW.organization_id
    ) THEN
      -- Update existing record
      UPDATE feature_usage 
      SET 
        usage_count = usage_count + 1,
        last_used = NEW.created_at,
        updated_at = NOW()
      WHERE feature_id = NEW.event_data->>'feature_id' AND organization_id = NEW.organization_id;
    ELSE
      -- Create new record
      INSERT INTO feature_usage (
        organization_id,
        feature_id,
        usage_count,
        last_used,
        created_at,
        updated_at
      ) VALUES (
        NEW.organization_id,
        NEW.event_data->>'feature_id',
        1,
        NEW.created_at,
        NOW(),
        NOW()
      );
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for analytics events to update feature usage
CREATE TRIGGER analytics_events_feature_usage_trigger
  AFTER INSERT ON analytics_events
  FOR EACH ROW
  EXECUTE FUNCTION update_feature_usage();

-- Function to update document analytics
CREATE OR REPLACE FUNCTION update_document_analytics()
RETURNS TRIGGER AS $$
BEGIN
  -- Extract document ID from event data if available
  IF NEW.event_type = 'document' AND NEW.event_data ? 'document_id' THEN
    -- Check if a record exists for this document and organization
    IF EXISTS (
      SELECT 1 FROM document_analytics 
      WHERE document_id = (NEW.event_data->>'document_id')::uuid AND organization_id = NEW.organization_id
    ) THEN
      -- Update existing record
      UPDATE document_analytics 
      SET 
        view_count = CASE 
          WHEN NEW.event_name = 'view' 
          THEN view_count + 1 
          ELSE view_count 
        END,
        download_count = CASE 
          WHEN NEW.event_name = 'download' 
          THEN download_count + 1 
          ELSE download_count 
        END,
        processing_count = CASE 
          WHEN NEW.event_name = 'process' 
          THEN processing_count + 1 
          ELSE processing_count 
        END,
        average_processing_time = CASE 
          WHEN NEW.event_name = 'process' AND NEW.event_data ? 'processing_time' 
          THEN (average_processing_time * processing_count + (NEW.event_data->>'processing_time')::float) / (processing_count + 1)
          ELSE average_processing_time 
        END,
        updated_at = NOW()
      WHERE document_id = (NEW.event_data->>'document_id')::uuid AND organization_id = NEW.organization_id;
    ELSE
      -- Create new record
      INSERT INTO document_analytics (
        organization_id,
        document_id,
        view_count,
        download_count,
        processing_count,
        average_processing_time,
        created_at,
        updated_at
      ) VALUES (
        NEW.organization_id,
        (NEW.event_data->>'document_id')::uuid,
        CASE WHEN NEW.event_name = 'view' THEN 1 ELSE 0 END,
        CASE WHEN NEW.event_name = 'download' THEN 1 ELSE 0 END,
        CASE WHEN NEW.event_name = 'process' THEN 1 ELSE 0 END,
        CASE WHEN NEW.event_name = 'process' AND NEW.event_data ? 'processing_time' THEN (NEW.event_data->>'processing_time')::float ELSE NULL END,
        NOW(),
        NOW()
      );
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for analytics events to update document analytics
CREATE TRIGGER analytics_events_document_analytics_trigger
  AFTER INSERT ON analytics_events
  FOR EACH ROW
  EXECUTE FUNCTION update_document_analytics();

-- Function to update analytics summary
CREATE OR REPLACE FUNCTION update_analytics_summary()
RETURNS TRIGGER AS $$
BEGIN
  -- Daily summary
  IF EXISTS (
    SELECT 1 FROM analytics_summary 
    WHERE organization_id = NEW.organization_id 
      AND event_type = NEW.event_type 
      AND event_name = NEW.event_name 
      AND period = 'daily' 
      AND period_start = DATE(NEW.created_at)
  ) THEN
    -- Update existing daily record
    UPDATE analytics_summary 
    SET 
      count = count + 1,
      updated_at = NOW()
    WHERE organization_id = NEW.organization_id 
      AND event_type = NEW.event_type 
      AND event_name = NEW.event_name 
      AND period = 'daily' 
      AND period_start = DATE(NEW.created_at);
  ELSE
    -- Create new daily record
    INSERT INTO analytics_summary (
      organization_id,
      event_type,
      event_name,
      count,
      period,
      period_start,
      created_at,
      updated_at
    ) VALUES (
      NEW.organization_id,
      NEW.event_type,
      NEW.event_name,
      1,
      'daily',
      DATE(NEW.created_at),
      NOW(),
      NOW()
    );
  END IF;
  
  -- Weekly summary
  IF EXISTS (
    SELECT 1 FROM analytics_summary 
    WHERE organization_id = NEW.organization_id 
      AND event_type = NEW.event_type 
      AND event_name = NEW.event_name 
      AND period = 'weekly' 
      AND period_start = DATE(DATE_TRUNC('week', NEW.created_at))
  ) THEN
    -- Update existing weekly record
    UPDATE analytics_summary 
    SET 
      count = count + 1,
      updated_at = NOW()
    WHERE organization_id = NEW.organization_id 
      AND event_type = NEW.event_type 
      AND event_name = NEW.event_name 
      AND period = 'weekly' 
      AND period_start = DATE(DATE_TRUNC('week', NEW.created_at));
  ELSE
    -- Create new weekly record
    INSERT INTO analytics_summary (
      organization_id,
      event_type,
      event_name,
      count,
      period,
      period_start,
      created_at,
      updated_at
    ) VALUES (
      NEW.organization_id,
      NEW.event_type,
      NEW.event_name,
      1,
      'weekly',
      DATE(DATE_TRUNC('week', NEW.created_at)),
      NOW(),
      NOW()
    );
  END IF;
  
  -- Monthly summary
  IF EXISTS (
    SELECT 1 FROM analytics_summary 
    WHERE organization_id = NEW.organization_id 
      AND event_type = NEW.event_type 
      AND event_name = NEW.event_name 
      AND period = 'monthly' 
      AND period_start = DATE(DATE_TRUNC('month', NEW.created_at))
  ) THEN
    -- Update existing monthly record
    UPDATE analytics_summary 
    SET 
      count = count + 1,
      updated_at = NOW()
    WHERE organization_id = NEW.organization_id 
      AND event_type = NEW.event_type 
      AND event_name = NEW.event_name 
      AND period = 'monthly' 
      AND period_start = DATE(DATE_TRUNC('month', NEW.created_at));
  ELSE
    -- Create new monthly record
    INSERT INTO analytics_summary (
      organization_id,
      event_type,
      event_name,
      count,
      period,
      period_start,
      created_at,
      updated_at
    ) VALUES (
      NEW.organization_id,
      NEW.event_type,
      NEW.event_name,
      1,
      'monthly',
      DATE(DATE_TRUNC('month', NEW.created_at)),
      NOW(),
      NOW()
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for analytics events to update analytics summary
CREATE TRIGGER analytics_events_summary_trigger
  AFTER INSERT ON analytics_events
  FOR EACH ROW
  EXECUTE FUNCTION update_analytics_summary();