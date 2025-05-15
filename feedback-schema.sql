-- Feedback Schema for FinDoc Analyzer

-- Create feedback table
CREATE TABLE IF NOT EXISTS public.feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  feedback_type TEXT NOT NULL,
  rating INTEGER,
  categories TEXT[] DEFAULT '{}'::text[],
  comments TEXT NOT NULL,
  email TEXT,
  allow_contact BOOLEAN DEFAULT false,
  user_agent TEXT,
  status TEXT NOT NULL DEFAULT 'new',
  is_resolved BOOLEAN DEFAULT false,
  resolved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolution_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create feedback responses table
CREATE TABLE IF NOT EXISTS public.feedback_responses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  feedback_id UUID NOT NULL REFERENCES feedback(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create analytics events table
CREATE TABLE IF NOT EXISTS public.analytics_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL,
  event_data JSONB DEFAULT '{}'::jsonb,
  page TEXT,
  user_agent TEXT,
  ip_address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for feedback
CREATE POLICY "Users can view their own feedback"
  ON public.feedback
  FOR SELECT
  USING (
    user_id = auth.uid() OR
    tenant_id = auth.uid()
  );

CREATE POLICY "Anyone can create feedback"
  ON public.feedback
  FOR INSERT
  WITH CHECK (true);

-- Create RLS policies for feedback_responses
CREATE POLICY "Users can view responses to their feedback"
  ON public.feedback_responses
  FOR SELECT
  USING (
    feedback_id IN (
      SELECT id FROM public.feedback
      WHERE user_id = auth.uid() OR tenant_id = auth.uid()
    ) OR
    user_id = auth.uid()
  );

-- Create RLS policies for analytics_events
CREATE POLICY "Anyone can create analytics events"
  ON public.analytics_events
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can view their own analytics events"
  ON public.analytics_events
  FOR SELECT
  USING (
    user_id = auth.uid() OR
    tenant_id = auth.uid()
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_feedback_user_id ON public.feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_feedback_tenant_id ON public.feedback(tenant_id);
CREATE INDEX IF NOT EXISTS idx_feedback_responses_feedback_id ON public.feedback_responses(feedback_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_user_id ON public.analytics_events(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_tenant_id ON public.analytics_events(tenant_id);

-- Create trigger for updated_at timestamp
CREATE TRIGGER update_feedback_updated_at
BEFORE UPDATE ON public.feedback
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Function to get feedback statistics
CREATE OR REPLACE FUNCTION get_feedback_statistics(
  p_tenant_id UUID,
  p_start_date TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  p_end_date TIMESTAMP WITH TIME ZONE DEFAULT NULL
)
RETURNS TABLE (
  feedback_type TEXT,
  count BIGINT,
  avg_rating NUMERIC,
  resolved_count BIGINT,
  unresolved_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    f.feedback_type,
    COUNT(*) AS count,
    AVG(f.rating)::NUMERIC AS avg_rating,
    COUNT(*) FILTER (WHERE f.is_resolved) AS resolved_count,
    COUNT(*) FILTER (WHERE NOT f.is_resolved) AS unresolved_count
  FROM
    public.feedback f
  WHERE
    f.tenant_id = p_tenant_id AND
    (p_start_date IS NULL OR f.created_at >= p_start_date) AND
    (p_end_date IS NULL OR f.created_at <= p_end_date)
  GROUP BY
    f.feedback_type;
END;
$$ LANGUAGE plpgsql;
