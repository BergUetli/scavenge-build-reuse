-- HUNT FEATURE DATABASE SCHEMA
-- Creates tables and functions for component hunting

-- 1. Cache Table for Component Sources
CREATE TABLE IF NOT EXISTS public.component_sources_cache (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  component_name text NOT NULL,
  normalized_query text UNIQUE NOT NULL,
  devices jsonb NOT NULL,
  ai_generated boolean DEFAULT false,
  cache_duration_days int DEFAULT 30,
  last_updated timestamptz DEFAULT now(),
  expires_at timestamptz GENERATED ALWAYS AS (last_updated + (cache_duration_days || ' days')::interval) STORED,
  hit_count int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_component_sources_query ON public.component_sources_cache(normalized_query);
CREATE INDEX IF NOT EXISTS idx_component_sources_expires ON public.component_sources_cache(expires_at);
CREATE INDEX IF NOT EXISTS idx_component_sources_created ON public.component_sources_cache(created_at DESC);

-- 2. Admin Settings Table
CREATE TABLE IF NOT EXISTS public.hunt_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key text UNIQUE NOT NULL,
  setting_value jsonb NOT NULL,
  description text,
  updated_at timestamptz DEFAULT now(),
  updated_by uuid REFERENCES auth.users(id)
);

-- Insert default settings
INSERT INTO public.hunt_settings (setting_key, setting_value, description) VALUES
  ('cache_duration_days', '30', 'How long to cache component source results (days)')
ON CONFLICT (setting_key) DO UPDATE SET setting_value = EXCLUDED.setting_value;

INSERT INTO public.hunt_settings (setting_key, setting_value, description) VALUES
  ('enable_ai_fallback', 'true', 'Whether to use AI when database search returns no results')
ON CONFLICT (setting_key) DO UPDATE SET setting_value = EXCLUDED.setting_value;

INSERT INTO public.hunt_settings (setting_key, setting_value, description) VALUES
  ('min_match_score', '0.3', 'Minimum similarity score for component matches (0-1)')
ON CONFLICT (setting_key) DO UPDATE SET setting_value = EXCLUDED.setting_value;

-- 3. Search Function for Component Sources
CREATE OR REPLACE FUNCTION public.search_component_sources(
  search_query text,
  limit_results int DEFAULT 20
) RETURNS TABLE (
  gadget_id uuid,
  device_name text,
  brand text,
  model text,
  release_year int,
  component_name text,
  component_category text,
  component_specs jsonb,
  reusability_score int,
  market_value_new numeric,
  tutorial_url text,
  video_url text,
  salvage_difficulty text,
  match_score float
) LANGUAGE sql STABLE AS $$
  SELECT 
    g.id as gadget_id,
    g.device_name,
    g.brand,
    g.model,
    g.release_year,
    c.component_name,
    c.category as component_category,
    c.specifications as component_specs,
    c.reusability_score,
    c.market_value_new,
    g.tutorial_url,
    g.video_url,
    g.salvage_difficulty,
    greatest(
      similarity(c.component_name, search_query),
      similarity(c.category, search_query),
      CASE 
        WHEN c.component_name ILIKE ('%' || search_query || '%') THEN 0.9
        WHEN c.category ILIKE ('%' || search_query || '%') THEN 0.7
        WHEN c.specifications::text ILIKE ('%' || search_query || '%') THEN 0.6
        ELSE 0.1
      END
    ) as match_score
  FROM public.scrap_gadgets g
  JOIN public.scrap_gadget_components c ON c.gadget_id = g.id
  WHERE 
    c.component_name ILIKE ('%' || search_query || '%')
    OR c.category ILIKE ('%' || search_query || '%')
    OR c.specifications::text ILIKE ('%' || search_query || '%')
    OR similarity(c.component_name, search_query) > 0.3
  ORDER BY match_score DESC, g.release_year DESC NULLS LAST
  LIMIT limit_results;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.search_component_sources(text, int) TO authenticated;
GRANT EXECUTE ON FUNCTION public.search_component_sources(text, int) TO anon;

-- 4. Enable RLS on new tables
ALTER TABLE public.component_sources_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hunt_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for cache (public read)
CREATE POLICY "Cache is viewable by everyone" 
ON public.component_sources_cache FOR SELECT 
USING (true);

-- Service role can insert/update cache
CREATE POLICY "Service role can manage cache" 
ON public.component_sources_cache FOR ALL 
USING (auth.jwt() ->> 'role' = 'service_role');

-- Hunt settings (admins only can modify)
CREATE POLICY "Hunt settings viewable by authenticated users" 
ON public.hunt_settings FOR SELECT 
TO authenticated
USING (true);

CREATE POLICY "Only admins can modify hunt settings" 
ON public.hunt_settings FOR ALL 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE auth.users.id = auth.uid() 
    AND auth.users.is_super_admin = true
  )
);

-- 5. Trigger to auto-update hunt_settings timestamp
CREATE OR REPLACE FUNCTION public.update_hunt_settings_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER hunt_settings_update_timestamp
BEFORE UPDATE ON public.hunt_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_hunt_settings_timestamp();

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Hunt feature database setup complete!';
  RAISE NOTICE '✅ component_sources_cache table created';
  RAISE NOTICE '✅ hunt_settings table created with defaults';
  RAISE NOTICE '✅ search_component_sources() function created';
  RAISE NOTICE '✅ RLS policies enabled';
END $$;
