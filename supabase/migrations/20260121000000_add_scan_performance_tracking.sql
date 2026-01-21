-- =====================================================
-- SCAN PERFORMANCE TRACKING MIGRATION
-- Version: v0.9.2
-- Purpose: Track scan metrics for dashboard analytics
-- =====================================================

-- Create scan_logs table to track all scan operations
CREATE TABLE IF NOT EXISTS public.scan_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  -- Scan identification
  image_hash TEXT NOT NULL,
  device_name TEXT NOT NULL,
  manufacturer TEXT,
  model TEXT,
  
  -- Performance metrics
  stage1_time_ms INTEGER NOT NULL,  -- Device identification time
  stage2_time_ms INTEGER,           -- Component list time (null if cached)
  total_time_ms INTEGER NOT NULL,   -- End-to-end scan time
  
  -- Cache/AI tracking
  cache_hit BOOLEAN NOT NULL DEFAULT false,  -- Was this a cache hit?
  data_source TEXT NOT NULL CHECK (data_source IN ('cache', 'database', 'ai')),
  
  -- AI cost tracking
  ai_provider TEXT CHECK (ai_provider IN ('openai', 'gemini', 'claude')),
  ai_model TEXT,
  input_tokens INTEGER,
  output_tokens INTEGER,
  cost_usd DECIMAL(10,6),
  
  -- Results
  component_count INTEGER NOT NULL DEFAULT 0,
  success BOOLEAN NOT NULL DEFAULT true,
  error_message TEXT,
  
  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for dashboard queries
CREATE INDEX IF NOT EXISTS idx_scan_logs_created_at ON public.scan_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_scan_logs_user_id ON public.scan_logs(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_scan_logs_cache_hit ON public.scan_logs(cache_hit);
CREATE INDEX IF NOT EXISTS idx_scan_logs_data_source ON public.scan_logs(data_source);
CREATE INDEX IF NOT EXISTS idx_scan_logs_ai_provider ON public.scan_logs(ai_provider) WHERE ai_provider IS NOT NULL;

-- Enable Row Level Security
ALTER TABLE public.scan_logs ENABLE ROW LEVEL SECURITY;

-- Policies: Users can view their own logs, admins can view all
CREATE POLICY "Users can view their own scan logs"
  ON public.scan_logs
  FOR SELECT
  USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Service role can insert scan logs"
  ON public.scan_logs
  FOR INSERT
  WITH CHECK (true);

-- Create materialized view for dashboard aggregates (faster queries)
CREATE MATERIALIZED VIEW IF NOT EXISTS public.scan_performance_stats AS
SELECT
  -- Time period
  date_trunc('hour', created_at) AS hour,
  date_trunc('day', created_at) AS day,
  
  -- Performance metrics
  COUNT(*) AS total_scans,
  AVG(total_time_ms) AS avg_time_ms,
  PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY total_time_ms) AS p50_time_ms,
  PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY total_time_ms) AS p95_time_ms,
  MIN(total_time_ms) AS min_time_ms,
  MAX(total_time_ms) AS max_time_ms,
  
  -- Cache metrics
  COUNT(*) FILTER (WHERE cache_hit = true) AS cache_hits,
  COUNT(*) FILTER (WHERE cache_hit = false) AS cache_misses,
  ROUND(100.0 * COUNT(*) FILTER (WHERE cache_hit = true) / NULLIF(COUNT(*), 0), 2) AS cache_hit_rate,
  
  -- AI metrics
  COUNT(*) FILTER (WHERE data_source = 'ai') AS ai_calls,
  SUM(cost_usd) AS total_cost_usd,
  AVG(cost_usd) FILTER (WHERE cost_usd IS NOT NULL) AS avg_cost_per_scan,
  SUM(input_tokens) AS total_input_tokens,
  SUM(output_tokens) AS total_output_tokens,
  
  -- Provider breakdown
  COUNT(*) FILTER (WHERE ai_provider = 'gemini') AS gemini_calls,
  COUNT(*) FILTER (WHERE ai_provider = 'openai') AS openai_calls,
  COUNT(*) FILTER (WHERE ai_provider = 'claude') AS claude_calls,
  
  -- Success rate
  COUNT(*) FILTER (WHERE success = true) AS successful_scans,
  ROUND(100.0 * COUNT(*) FILTER (WHERE success = true) / NULLIF(COUNT(*), 0), 2) AS success_rate
FROM public.scan_logs
GROUP BY hour, day;

-- Index on materialized view
CREATE INDEX IF NOT EXISTS idx_scan_performance_stats_day ON public.scan_performance_stats(day DESC);
CREATE INDEX IF NOT EXISTS idx_scan_performance_stats_hour ON public.scan_performance_stats(hour DESC);

-- Function to refresh stats (call this periodically)
CREATE OR REPLACE FUNCTION refresh_scan_performance_stats()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.scan_performance_stats;
END;
$$;

-- Comments
COMMENT ON TABLE public.scan_logs IS 'Tracks every scan operation for performance analytics and cost tracking';
COMMENT ON TABLE public.scan_performance_stats IS 'Aggregated scan performance metrics for dashboard (refreshed periodically)';
COMMENT ON COLUMN public.scan_logs.cache_hit IS 'True if result came from scan_cache table (image hash match)';
COMMENT ON COLUMN public.scan_logs.data_source IS 'Where the data came from: cache (image hash), database (device lookup), or ai (new scan)';
COMMENT ON COLUMN public.scan_logs.total_time_ms IS 'End-to-end time from user click to results displayed';

-- Grant permissions
GRANT SELECT ON public.scan_logs TO authenticated;
GRANT SELECT ON public.scan_performance_stats TO authenticated;
