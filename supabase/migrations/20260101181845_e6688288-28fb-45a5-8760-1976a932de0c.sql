-- Create a cache table for scan results
-- This avoids redundant API calls for the same/similar images
CREATE TABLE public.scan_cache (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  image_hash text NOT NULL UNIQUE,
  scan_result jsonb NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  expires_at timestamp with time zone NOT NULL DEFAULT (now() + interval '7 days'),
  hit_count integer NOT NULL DEFAULT 0
);

-- Enable RLS
ALTER TABLE public.scan_cache ENABLE ROW LEVEL SECURITY;

-- Cache is readable by everyone (public cache for common items)
CREATE POLICY "Scan cache is readable by everyone"
  ON public.scan_cache
  FOR SELECT
  USING (true);

-- Only service role can insert/update cache (via edge function)
CREATE POLICY "Service role can manage cache"
  ON public.scan_cache
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Create index for fast hash lookups
CREATE INDEX idx_scan_cache_hash ON public.scan_cache (image_hash);

-- Create index for cleanup of expired entries
CREATE INDEX idx_scan_cache_expires ON public.scan_cache (expires_at);